#!/usr/bin/env python3.11
"""JOB-223 Codex distill pipeline for exam source files -> Markdown."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
import tempfile
from collections import defaultdict
from datetime import datetime
from pathlib import Path

import fitz
import pdfplumber


ROOT = Path("/Users/s389080/Documents/doc/work/0_AI_Project/eidosProject")
SOURCE_ROOT = ROOT / "knowledge/3_考古題/1_原始檔"
OUTPUT_ROOT = ROOT / "knowledge/3_考古題/2_MD淬鍊文字_Codex"
PROGRESS_PATH = ROOT / "knowledge/3_考古題/_manifest/JOB223_progress.json"
VENV_PYTHON = Path("/Users/s389080/Documents/doc/work/0_AI_Project/githubFav/pdf2md/.venv/bin/python3.11")
SOFFICE = Path("/usr/local/bin/soffice")
DOCLING_PYTHON = VENV_PYTHON

SUPPORTED_EXTS = (".pdf", ".doc", ".docx")
KNOWN_PUBLISHERS = ("翰林", "南一", "康軒", "何嘉仁")


def compute_sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def strip_ext(name: str) -> str:
    lower = name.lower()
    for ext in (".pdf", ".docx", ".doc", ".jpg", ".jpeg"):
        if lower.endswith(ext):
            return name[: -len(ext)]
    return name


def detect_kind(stem: str) -> str:
    return "答案" if any(token in stem for token in ("答案", "解答", "作答")) else "試卷"


def normalize_exam_type(stem: str) -> str:
    if "第三次段考" in stem:
        return "第三次段考"
    if "第二次段考" in stem:
        return "第二次段考"
    if "第一次段考" in stem:
        return "第一次段考"
    if "第二次評量" in stem:
        return "期末考"
    if "第一次評量" in stem:
        return "期中考"
    if re.search(r"(期末|末卷|第二次)", stem):
        return "期末考"
    if re.search(r"(期中|中卷|第一次)", stem):
        return "期中考"
    if re.search(r"\b2\b", stem):
        return "期末考"
    if re.search(r"\b1\b", stem):
        return "期中考"
    return "未知"


def cleanup_school_name(raw: str) -> str:
    school = raw.strip().replace("_", " ")
    school = re.sub(r"^(?:\d{3}(?:[-下上]|\s)?(?:1|2)?)(?=[^0-9])", "", school)
    school = re.sub(r"^\d+-\d+-?", "", school)
    school = re.sub(r"^[12](?=.+國小$)", "", school)
    school = re.sub(r"^(?:縣立|市立|鄉立|私立)", "", school)
    school = school.strip("-_ ")
    school = school.replace("新北", "新北")
    return school or "未知國小"


def detect_year(stem: str) -> str:
    match = re.search(r"(10\d|11\d)", stem)
    return match.group(1) if match else "?"


def detect_school(stem: str) -> str:
    school_match = re.search(r"([^\s_/-]+(?:國小|附小))", stem)
    if school_match:
        return cleanup_school_name(school_match.group(1))

    dash_match = re.search(r"\d{3}(?:下|上)?-([^-_]+(?:國小|附小))", stem)
    if dash_match:
        return cleanup_school_name(dash_match.group(1))

    long_match = re.search(r"\d{3}-\d-(.+?國小)", stem)
    if long_match:
        return cleanup_school_name(long_match.group(1))

    return "未知國小"


def detect_publisher(stem: str, dir_publisher: str) -> str:
    for publisher in KNOWN_PUBLISHERS:
        if publisher in stem:
            return publisher
    return dir_publisher


def parse_source_filename(filename: str, dir_publisher: str) -> tuple[str, str, str, str, str]:
    stem = strip_ext(filename)
    publisher = detect_publisher(stem, dir_publisher)
    year = detect_year(stem)
    school = detect_school(stem)
    exam_type = normalize_exam_type(stem)
    kind = detect_kind(stem)

    normalized_parts = stem.split("_")
    if len(normalized_parts) >= 4 and normalized_parts[0] in KNOWN_PUBLISHERS:
        publisher = normalized_parts[0]
        part_year = normalized_parts[1]
        if re.fullmatch(r"10\d|11\d", part_year):
            year = part_year
        elif part_year == "?" and year == "?":
            year = part_year
        school = cleanup_school_name(normalized_parts[2])
        exam_type = normalize_exam_type(normalized_parts[3])
        if len(normalized_parts) >= 5:
            kind = detect_kind(normalized_parts[4])

    verbose = re.search(
        r"([一二三四五六]年級)\s+(10\d|11\d)\s+[上下]學期\s+.+?\s+(翰林|南一|康軒|何嘉仁)\s+(試卷|答案)$",
        stem,
    )
    if verbose:
        year = verbose.group(2)
        publisher = verbose.group(3)
        kind = verbose.group(4)
        exam_type = normalize_exam_type(stem)

    return publisher, year, school, exam_type, kind


def run_python_extract(python_bin: Path, code: str, path: Path, timeout: int = 600) -> str:
    result = subprocess.run(
        [str(python_bin), "-c", code, str(path)],
        capture_output=True,
        text=True,
        timeout=timeout,
    )
    if result.returncode != 0:
        err = result.stderr.strip() or result.stdout.strip() or "unknown error"
        raise RuntimeError(err)
    return result.stdout


def analyze_text(text: str) -> dict[str, float | int | bool]:
    non_ws = len(re.sub(r"\s+", "", text))
    cjk = len(re.findall(r"[\u4e00-\u9fff]", text))
    spaced_cjk = len(re.findall(r"[\u4e00-\u9fff]\s+[\u4e00-\u9fff]", text))
    return {
        "char_count": len(text),
        "non_ws_chars": non_ws,
        "spaced_cjk_ratio": round(spaced_cjk / max(cjk, 1), 4),
        "empty_text": non_ws == 0,
    }


def iso_now() -> str:
    return datetime.now().isoformat(timespec="seconds")


def load_progress() -> list[dict]:
    if not PROGRESS_PATH.exists():
        return []
    text = PROGRESS_PATH.read_text(encoding="utf-8")
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # Best-effort recovery for a previously interrupted concurrent write.
        if text.endswith("]]"):
            rows = json.loads(text[:-1])
            save_progress(rows)
            return rows
        raise


def save_progress(rows: list[dict]) -> None:
    with tempfile.NamedTemporaryFile(
        "w",
        encoding="utf-8",
        dir=PROGRESS_PATH.parent,
        prefix="JOB223_progress_",
        suffix=".tmp",
        delete=False,
    ) as fh:
        json.dump(rows, fh, ensure_ascii=False, indent=2)
        fh.write("\n")
        tmp_name = fh.name
    Path(tmp_name).replace(PROGRESS_PATH)


def update_progress_entry(combo: str, *, status: str, phase: str, notes: str, extra: dict | None = None) -> None:
    rows = load_progress()
    changed = False
    for row in rows:
        if row.get("combo") != combo:
            continue
        row["status"] = status
        row["phase"] = phase
        row["notes"] = notes
        row["last_updated"] = iso_now()
        if extra:
            row.update(extra)
        changed = True
        break

    if changed:
        save_progress(rows)


def cleanup_text(text: str) -> str:
    cleaned = re.sub(r"!\[\]\(data:image/[^)]+\)", "", text)
    cleaned = cleaned.replace("<!-- image -->", "")
    cleaned = re.sub(r"[ \t]+\n", "\n", cleaned)
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
    return cleaned.strip()


def build_quality_flags(path: Path, method: str, text: str, metrics: dict) -> list[str]:
    flags: list[str] = []
    if text.startswith("[EXTRACT_ERROR]"):
        flags.append("extract_error")
    if metrics["non_ws_chars"] == 0:
        flags.append("empty_extract")
    elif metrics["non_ws_chars"] < 80:
        flags.append("very_low_text")
    if metrics["spaced_cjk_ratio"] > 0.2:
        flags.append("vertical_spacing_noise")
    return sorted(set(flags))


def is_word_source(filename: str) -> bool:
    return filename.lower().endswith((".doc", ".docx"))


def doc_engine_for_method(method: str) -> str:
    return {
        "markitdown": "markitdown",
        "soffice_markitdown": "soffice+markitdown",
    }.get(method, method or "unknown")


def doc_status_for_flags(flags: list[str]) -> str:
    return "issue" if any(flag in flags for flag in ("extract_error", "empty_extract")) else "ok"


def build_doc_index_payload(combo: str, semester: str, index_entries: list[dict]) -> dict:
    base_source = f"knowledge/3_考古題/1_原始檔/{semester}/{combo}"
    base_output = f"knowledge/3_考古題/2_MD淬鍊文字_Codex/{semester}/{combo}"
    doc_entries: list[dict] = []

    for md_entry in index_entries:
        md_name = md_entry["filename"]
        for source in md_entry.get("source_files", []):
            source_flags = list(source.get("quality_flags", []))
            if is_word_source(source["filename"]):
                doc_entries.append(
                    {
                        "file": source["filename"],
                        "status": doc_status_for_flags(source_flags),
                        "engine": doc_engine_for_method(source.get("method", "")),
                        "out_md": f"{base_output}/{md_name}",
                        "char_count": source.get("non_ws_chars", 0),
                        "kind": source.get("kind", "未知"),
                        "source_relpath": source.get("source_relpath")
                        or f"{base_source}/{source['filename']}",
                        "sha256": source.get("sha256"),
                        "quality_flags": source_flags,
                    }
                )

            for alias in source.get("aliases", []):
                alias_filename = alias["filename"] if isinstance(alias, dict) else alias
                if not is_word_source(alias_filename):
                    continue
                doc_entries.append(
                    {
                        "file": alias_filename,
                        "status": doc_status_for_flags(source_flags),
                        "engine": doc_engine_for_method(source.get("method", "")),
                        "out_md": f"{base_output}/{md_name}",
                        "char_count": source.get("non_ws_chars", 0),
                        "kind": source.get("kind", "未知"),
                        "source_relpath": (
                            alias.get("source_relpath")
                            if isinstance(alias, dict)
                            else f"{base_source}/{alias_filename}"
                        ),
                        "sha256": source.get("sha256"),
                        "quality_flags": sorted(set(source_flags + ["duplicate_source_merged"])),
                        "duplicate_of": source["filename"],
                    }
                )

    return {
        "combo": combo,
        "created_at": datetime.now().isoformat(),
        "engine": "codex_job223_distill",
        "source": "scripts/JOB223_distill_to_md.py",
        "files": doc_entries,
    }


def write_doc_index(output_dir: Path, combo: str, semester: str, index_entries: list[dict]) -> int:
    doc_index_payload = build_doc_index_payload(combo, semester, index_entries)
    if not doc_index_payload["files"]:
        return 0
    (output_dir / "_doc_index.json").write_text(
        json.dumps(doc_index_payload, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    return len(doc_index_payload["files"])


def make_error_extraction(message: str) -> dict:
    return {
        "method": "failed",
        "text": f"[EXTRACT_ERROR] {message}",
        "metrics": {"char_count": 0, "non_ws_chars": 0, "spaced_cjk_ratio": 0.0, "empty_text": True},
        "quality_flags": ["extract_error", "empty_extract"],
    }


def extraction_rank(candidate: dict) -> tuple[int, int, int]:
    flags = set(candidate["quality_flags"])
    severe_penalty = 1 if flags.intersection({"extract_error", "empty_extract"}) else 0
    spacing_penalty = 1 if "vertical_spacing_noise" in flags else 0
    return (severe_penalty, spacing_penalty, -candidate["metrics"]["non_ws_chars"])


def is_better_extraction(candidate: dict, current: dict | None) -> bool:
    if current is None:
        return True
    return extraction_rank(candidate) < extraction_rank(current)


def extract_pdfplumber(path: Path) -> str:
    with pdfplumber.open(path) as pdf:
        return "\n".join((page.extract_text() or "") for page in pdf.pages)


def extract_markitdown(path: Path) -> str:
    code = (
        "import sys; "
        "from markitdown import MarkItDown; "
        "r = MarkItDown().convert(sys.argv[1]); "
        "print(r.text_content or '', end='')"
    )
    return run_python_extract(VENV_PYTHON, code, path, timeout=300)


def extract_docling(path: Path) -> str:
    code = (
        "import sys; "
        "from docling.document_converter import DocumentConverter, PdfFormatOption; "
        "from docling.datamodel.base_models import InputFormat; "
        "from docling.datamodel.pipeline_options import PdfPipelineOptions; "
        "opt = PdfPipelineOptions(); "
        "opt.do_ocr = False; "
        "opt.do_table_structure = True; "
        "converter = DocumentConverter(format_options={InputFormat.PDF: PdfFormatOption(pipeline_options=opt)}); "
        "result = converter.convert(sys.argv[1]); "
        "print(result.document.export_to_markdown(), end='')"
    )
    return run_python_extract(DOCLING_PYTHON, code, path, timeout=900)


def extract_pymupdf_text(path: Path) -> str:
    doc = fitz.open(path)
    try:
        return "\n".join(page.get_text() for page in doc)
    finally:
        doc.close()


def normalize_vertical_text(text: str) -> str:
    lines = text.splitlines()
    out: list[str] = []
    buf: list[str] = []

    def flush() -> None:
        nonlocal buf
        if buf:
            out.append("".join(buf))
            buf = []

    for line in lines:
        stripped = line.strip()
        if not stripped:
            flush()
            if not out or out[-1] != "":
                out.append("")
            continue
        if len(stripped) == 1 or set(stripped) == {"_"}:
            buf.append(stripped)
            continue
        flush()
        out.append(stripped)

    flush()
    return "\n".join(out).strip()


def extract_pymupdf_vertical(path: Path) -> str:
    return normalize_vertical_text(extract_pymupdf_text(path))


def extract_docx_markitdown(path: Path) -> str:
    return extract_markitdown(path)


def extract_doc_via_soffice(path: Path) -> str:
    with tempfile.TemporaryDirectory() as tmp:
        tmp_dir = Path(tmp)
        result = subprocess.run(
            [str(SOFFICE), "--headless", "--convert-to", "docx", "--outdir", str(tmp_dir), str(path)],
            capture_output=True,
            text=True,
            timeout=120,
        )
        if result.returncode != 0:
            raise RuntimeError(result.stderr.strip() or "soffice conversion failed")
        converted = tmp_dir / f"{path.stem}.docx"
        if not converted.exists():
            raise RuntimeError("converted docx missing after soffice run")
        return extract_markitdown(converted)


def choose_pdf_methods(subject: str) -> list[str]:
    if subject == "國語":
        return ["pymupdf_vertical", "pdfplumber", "markitdown"]
    return ["pdfplumber", "markitdown"]


def extract_text_for_file(path: Path, subject: str) -> dict:
    suffix = path.suffix.lower()
    if suffix == ".pdf":
        best: dict | None = None
        for method in choose_pdf_methods(subject):
            try:
                if method == "pdfplumber":
                    text = extract_pdfplumber(path)
                elif method == "markitdown":
                    text = extract_markitdown(path)
                elif method == "docling":
                    text = extract_docling(path)
                elif method == "pymupdf_vertical":
                    text = extract_pymupdf_vertical(path)
                else:
                    text = extract_pymupdf_text(path)
                cleaned = cleanup_text(text)
                metrics = analyze_text(cleaned)
                candidate = {
                    "method": method,
                    "text": cleaned,
                    "metrics": metrics,
                    "quality_flags": build_quality_flags(path, method, cleaned, metrics),
                }
                if is_better_extraction(candidate, best):
                    best = candidate
                if method == "pymupdf_vertical" and metrics["spaced_cjk_ratio"] < 0.08 and metrics["non_ws_chars"] > 80:
                    return candidate
                if (
                    metrics["non_ws_chars"] > 200
                    and method == "pdfplumber"
                    and "vertical_spacing_noise" not in candidate["quality_flags"]
                ):
                    return candidate
            except Exception as exc:
                best = best or {
                    "method": method,
                    "text": f"[EXTRACT_ERROR] {exc}",
                    "metrics": {"char_count": 0, "non_ws_chars": 0, "spaced_cjk_ratio": 0.0, "empty_text": True},
                    "quality_flags": ["extract_error", "empty_extract"],
                }
        return best or {
            "method": "none",
            "text": "[EXTRACT_ERROR] no extractor succeeded",
            "metrics": {"char_count": 0, "non_ws_chars": 0, "spaced_cjk_ratio": 0.0, "empty_text": True},
            "quality_flags": ["extract_error", "empty_extract"],
        }

    if suffix == ".docx":
        text = cleanup_text(extract_docx_markitdown(path))
        metrics = analyze_text(text)
        return {
            "method": "markitdown",
            "text": text,
            "metrics": metrics,
            "quality_flags": build_quality_flags(path, "markitdown", text, metrics),
        }

    if suffix == ".doc":
        text = cleanup_text(extract_doc_via_soffice(path))
        metrics = analyze_text(text)
        return {
            "method": "soffice_markitdown",
            "text": text,
            "metrics": metrics,
            "quality_flags": build_quality_flags(path, "soffice_markitdown", text, metrics),
        }

    raise ValueError(f"Unsupported suffix: {suffix}")


def generate_md(exam_info: dict, file_entries: list[dict]) -> str:
    total_chars = sum(entry["metrics"]["non_ws_chars"] for entry in file_entries)
    md_quality_flags = exam_info["quality_flags"]
    lines = [
        "---",
        f"publisher: {exam_info['publisher']}",
        f"academic_year: {exam_info['year']}",
        f"source_school: {exam_info['school']}",
        f"exam_type: {exam_info['exam_type']}",
        f"semester: {exam_info['semester']}",
        f"subject: {exam_info['subject']}",
        f"combo: {exam_info['combo']}",
        f"extracted_date: {datetime.now().strftime('%Y-%m-%d')}",
        'extracted_by: "Codex JOB-223 via scripts/JOB223_distill_to_md.py"',
        f"char_count: {total_chars}",
        "quality_flags:",
    ]
    for flag in md_quality_flags:
        lines.append(f"  - {flag}")
    lines += [
        "source_files:",
    ]
    for entry in file_entries:
        lines.append(f"  - filename: {entry['filename']}")
        lines.append(f"    kind: {entry['kind']}")
        lines.append(f"    method: {entry['method']}")
        lines.append(f"    sha256: {entry['sha256']}")
        lines.append(f"    non_ws_chars: {entry['metrics']['non_ws_chars']}")
        if entry["quality_flags"]:
            lines.append("    quality_flags:")
            for flag in entry["quality_flags"]:
                lines.append(f"      - {flag}")
        else:
            lines.append("    quality_flags: []")
        if entry["aliases"]:
            lines.append("    aliases:")
            for alias in entry["aliases"]:
                lines.append(f"      - {alias['filename']}")
    lines += ["---", "", f"# {exam_info['semester']} {exam_info['subject']} {exam_info['publisher']}｜{exam_info['school']} {exam_info['year']} 學年度 {exam_info['exam_type']}", ""]

    for entry in file_entries:
        lines.append(f"## {entry['kind']}原文（{entry['filename']}）")
        lines.append("")
        lines.append(f"> 抽取方法：`{entry['method']}`，非空白字數：`{entry['metrics']['non_ws_chars']}`")
        if entry["quality_flags"]:
            lines.append(f"> 品質旗標：`{', '.join(entry['quality_flags'])}`")
            lines.append("")
        lines.append("")
        lines.append("```text")
        lines.append(entry["text"] or "[EMPTY_EXTRACT]")
        lines.append("```")
        lines.append("")

    lines.append("## 原文追溯")
    lines.append("")
    for entry in file_entries:
        lines.append(f"- `{entry['source_relpath']}`")
        for alias in entry["aliases"]:
            lines.append(f"- `{alias['source_relpath']}`")
    return "\n".join(lines).strip() + "\n"


def process_combo(semester: str, subject: str, publisher: str, max_groups: int | None = None) -> dict:
    combo = f"{semester}_{subject}_{publisher}"
    source_dir = SOURCE_ROOT / semester / combo
    output_dir = OUTPUT_ROOT / semester / combo
    output_dir.mkdir(parents=True, exist_ok=True)

    files = sorted(
        path for path in source_dir.iterdir() if path.is_file() and path.suffix.lower() in SUPPORTED_EXTS
    )
    update_progress_entry(
        combo,
        status="running",
        phase="implementation",
        notes=f"掃描到 {len(files)} 份可轉檔來源，開始建立群組",
        extra={"batch_started_at": iso_now()},
    )
    groups: dict[tuple[str, str, str, str], list[dict]] = defaultdict(list)
    for path in files:
        pub, year, school, exam_type, kind = parse_source_filename(path.name, publisher)
        groups[(pub, year, school, exam_type)].append({"path": path, "kind": kind})

    index_entries = []
    processed = 0
    issue_groups = 0
    for key in sorted(groups.keys()):
        if max_groups is not None and processed >= max_groups:
            break
        pub, year, school, exam_type = key
        file_entries = []
        dedupe_index: dict[tuple[str, str], int] = {}
        for item in sorted(groups[key], key=lambda row: (row["kind"], row["path"].name)):
            sha256 = compute_sha256(item["path"])
            dedupe_key = (item["kind"], sha256)
            if dedupe_key in dedupe_index:
                file_entries[dedupe_index[dedupe_key]]["aliases"].append(
                    {
                        "filename": item["path"].name,
                        "source_relpath": str(item["path"].relative_to(ROOT)),
                    }
                )
                continue
            try:
                extraction = extract_text_for_file(item["path"], subject)
            except Exception as exc:
                extraction = make_error_extraction(str(exc))
            dedupe_index[dedupe_key] = len(file_entries)
            file_entries.append(
                {
                    "filename": item["path"].name,
                    "kind": item["kind"],
                    "method": extraction["method"],
                    "text": extraction["text"],
                    "metrics": extraction["metrics"],
                    "quality_flags": extraction["quality_flags"],
                    "sha256": sha256,
                    "source_relpath": str(item["path"].relative_to(ROOT)),
                    "aliases": [],
                }
            )

        group_quality_flags = sorted({flag for entry in file_entries for flag in entry["quality_flags"]})
        if any(entry["aliases"] for entry in file_entries):
            group_quality_flags.append("duplicate_source_merged")
        kinds_present = {entry["kind"] for entry in file_entries}
        if "試卷" not in kinds_present:
            group_quality_flags.append("missing_paper")
        if "答案" not in kinds_present:
            group_quality_flags.append("missing_answer")
        if any(entry["kind"] == "答案" and entry["metrics"]["non_ws_chars"] == 0 for entry in file_entries):
            group_quality_flags.append("answer_empty")
        if any(entry["kind"] == "試卷" and entry["metrics"]["non_ws_chars"] == 0 for entry in file_entries):
            group_quality_flags.append("paper_empty")
        if any(flag in group_quality_flags for flag in ("empty_extract", "extract_error")):
            issue_groups += 1
        group_quality_flags = sorted(set(group_quality_flags))

        exam_info = {
            "publisher": pub,
            "year": year,
            "school": school,
            "exam_type": exam_type,
            "semester": semester,
            "subject": subject,
            "combo": combo,
            "quality_flags": group_quality_flags,
        }
        md_name = f"{pub}_{year}_{school}_{exam_type}.md"
        md_path = output_dir / md_name
        md_path.write_text(generate_md(exam_info, file_entries), encoding="utf-8")

        index_entries.append(
            {
                "filename": md_name,
                "publisher": pub,
                "year": year,
                "school": school,
                "exam_type": exam_type,
                "quality_flags": group_quality_flags,
                "total_non_ws_chars": sum(entry["metrics"]["non_ws_chars"] for entry in file_entries),
                "source_files": [
                    {
                        "filename": entry["filename"],
                        "kind": entry["kind"],
                        "method": entry["method"],
                        "sha256": entry["sha256"],
                        "source_relpath": entry["source_relpath"],
                        "non_ws_chars": entry["metrics"]["non_ws_chars"],
                        "quality_flags": entry["quality_flags"],
                        "aliases": [alias["filename"] for alias in entry["aliases"]],
                    }
                    for entry in file_entries
                ],
            }
        )
        processed += 1
        print(f"[{processed}/{len(groups)}] wrote {md_name}")
        update_progress_entry(
            combo,
            status="running",
            phase="implementation",
            notes=f"已完成 {processed}/{len(groups)} 組，問題旗標 {issue_groups} 組",
            extra={
                "groups_total": len(groups),
                "groups_processed": processed,
                "issue_groups": issue_groups,
                "last_output_file": md_name,
            },
        )

    index_payload = {
        "path": f"knowledge/3_考古題/2_MD淬鍊文字_Codex/{semester}/{combo}/",
        "last_updated": datetime.now().isoformat() + "Z",
        "total_md": len(index_entries),
        "files": index_entries,
    }
    (output_dir / "_index.json").write_text(
        json.dumps(index_payload, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    doc_index_count = write_doc_index(output_dir, combo, semester, index_entries)

    final_status = "done" if processed == len(groups) else "running"
    final_note = (
        f"轉檔完成，共 {processed}/{len(groups)} 組，問題旗標 {issue_groups} 組"
        if final_status == "done"
        else f"局部執行完成，共 {processed}/{len(groups)} 組，問題旗標 {issue_groups} 組"
    )
    update_progress_entry(
        combo,
        status=final_status,
        phase="implementation",
        notes=final_note,
        extra={
            "groups_total": len(groups),
            "groups_processed": processed,
            "issue_groups": issue_groups,
            "output_md_count": len(index_entries),
            "doc_index_count": doc_index_count,
            "batch_finished_at": iso_now(),
        },
    )

    return {
        "combo": combo,
        "groups_total": len(groups),
        "groups_processed": processed,
        "output_dir": str(output_dir),
        "doc_index_count": doc_index_count,
    }


def rebuild_doc_index_for_combo(semester: str, subject: str, publisher: str) -> dict:
    combo = f"{semester}_{subject}_{publisher}"
    output_dir = OUTPUT_ROOT / semester / combo
    index_path = output_dir / "_index.json"
    if not index_path.exists():
        raise FileNotFoundError(f"missing _index.json: {index_path}")
    index_payload = json.loads(index_path.read_text(encoding="utf-8"))
    doc_index_count = write_doc_index(output_dir, combo, semester, index_payload.get("files", []))
    return {"combo": combo, "output_dir": str(output_dir), "doc_index_count": doc_index_count}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--semester", required=True)
    parser.add_argument("--subject", required=True)
    parser.add_argument("--publisher", required=True)
    parser.add_argument("--max-groups", type=int, default=None)
    parser.add_argument("--rebuild-doc-index-only", action="store_true")
    args = parser.parse_args()

    combo = f"{args.semester}_{args.subject}_{args.publisher}"
    try:
        if args.rebuild_doc_index_only:
            result = rebuild_doc_index_for_combo(args.semester, args.subject, args.publisher)
        else:
            result = process_combo(args.semester, args.subject, args.publisher, args.max_groups)
    except Exception as exc:
        update_progress_entry(
            combo,
            status="blocked",
            phase="implementation",
            notes=f"執行失敗：{exc}",
        )
        raise
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
