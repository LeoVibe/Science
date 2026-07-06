#!/usr/bin/env python3.11
"""Pilot benchmark for JOB-223 conversion strategies."""

from __future__ import annotations

import json
import re
import subprocess
import sys
import tempfile
import time
import unicodedata
from datetime import datetime
from pathlib import Path

import fitz
from ocrmac.ocrmac import text_from_image
from PIL import Image


ROOT = Path("/Users/s389080/Documents/doc/work/0_AI_Project/eidosProject")
MANIFEST_DIR = ROOT / "knowledge/3_考古題/_manifest"
OUTPUT_DIR = MANIFEST_DIR / "JOB223_pilot_outputs"
SAMPLES_PATH = MANIFEST_DIR / "JOB223_pilot_samples.json"
RESULTS_PATH = MANIFEST_DIR / "JOB223_pilot_results.json"
REPORT_PATH = MANIFEST_DIR / "JOB223_pilot_report.md"
PROGRESS_PATH = MANIFEST_DIR / "JOB223_progress.json"

SYSTEM_PYTHON = Path(sys.executable)
VENV_PYTHON = Path("/Users/s389080/Documents/doc/work/0_AI_Project/githubFav/pdf2md/.venv/bin/python3.11")
SOFFICE = Path("/usr/local/bin/soffice")

PILOT_SAMPLES = [
    {
        "sample_id": "pdf_vertical_chinese",
        "category": "pdf_vertical",
        "description": "國語主題，觀察豎排/字距與結構保留。",
        "methods": ["pdfplumber", "markitdown", "docling"],
        "path": "knowledge/3_考古題/1_原始檔/四下/四下_國語_南一/市立四維國小 四年級 108 下學期 語文領域 國語 第一次段考 期中考 南一 試卷.pdf",
    },
    {
        "sample_id": "pdf_math_layout",
        "category": "pdf_math",
        "description": "數學版面題，觀察表格/數式/斷行。",
        "methods": ["pdfplumber", "markitdown", "docling"],
        "path": "knowledge/3_考古題/1_原始檔/四下/四下_數學_南一/112-2-2臺南市和順國小112學年度第二學期第二次評量四年級數學科評量試卷.pdf.pdf",
    },
    {
        "sample_id": "pdf_scanned_candidate",
        "category": "pdf_scanned",
        "description": "疑似掃描件，自然科樣本，加入 OCR fallback。",
        "methods": ["pdfplumber", "markitdown", "docling", "fitz_ocrmac"],
        "path": "knowledge/3_考古題/1_原始檔/三下/三下_自然_翰林/113-2三年級自然期中卷.pdf",
    },
    {
        "sample_id": "doc_legacy",
        "category": "doc",
        "description": "舊版 .doc，觀察 markitdown 與 soffice fallback。",
        "methods": ["markitdown", "soffice_markitdown"],
        "path": "knowledge/3_考古題/1_原始檔/三下/三下_國語_康軒/縣立成功國小 三年級 108 下學期 語文領域 國語 第一次段考 期中考 康軒 試卷.doc",
    },
    {
        "sample_id": "docx_modern",
        "category": "docx",
        "description": "現代 .docx，觀察結構化程度。",
        "methods": ["markitdown"],
        "path": "knowledge/3_考古題/1_原始檔/四下/四下_數學_南一/縣立三條國小 四年級 108 下學期 數學領域 數學 第一次段考 期中考 南一 試卷.docx",
    },
    {
        "sample_id": "jpg_ocr",
        "category": "jpg",
        "description": "JPG OCR，觀察 Apple Vision 輸出品質。",
        "methods": ["ocrmac_image"],
        "path": "knowledge/3_考古題/1_原始檔/六下/六下_國語_南一/縣立成功國小 六年級 108 下學期 語文領域 國語 第一次段考 期中考 南一 答案.jpg",
    },
]


def now_iso() -> str:
    return datetime.now().isoformat(timespec="seconds")


def rel_to_root(path: Path) -> str:
    return str(path.relative_to(ROOT))


def slug(value: str) -> str:
    return re.sub(r"[^a-zA-Z0-9._-]+", "_", value).strip("_")


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


def extract_pdfplumber(path: Path) -> str:
    code = (
        "import sys, pdfplumber; "
        "pdf = pdfplumber.open(sys.argv[1]); "
        "print('\\n'.join((p.extract_text() or '') for p in pdf.pages), end=''); "
        "pdf.close()"
    )
    return run_python_extract(SYSTEM_PYTHON, code, path, timeout=300)


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
    return run_python_extract(VENV_PYTHON, code, path, timeout=900)


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

    def flush_buffer() -> None:
        nonlocal buf
        if buf:
            out.append("".join(buf))
            buf = []

    for line in lines:
        stripped = line.strip()
        if not stripped:
            flush_buffer()
            if not out or out[-1] != "":
                out.append("")
            continue

        if len(stripped) == 1 or set(stripped) == {"_"}:
            buf.append(stripped)
            continue

        flush_buffer()
        out.append(stripped)

    flush_buffer()
    return "\n".join(out).strip()


def extract_pymupdf_vertical(path: Path) -> str:
    return normalize_vertical_text(extract_pymupdf_text(path))


def extract_soffice_markitdown(path: Path) -> str:
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


def extract_ocrmac_image(path: Path) -> str:
    lines = text_from_image(str(path), language_preference=["zh-Hant"], detail=False)
    return "\n".join(lines)


def extract_ocrmac_image_upscaled(path: Path) -> str:
    with tempfile.TemporaryDirectory() as tmp:
        tmp_path = Path(tmp) / "upscaled.png"
        image = Image.open(path).convert("L")
        enlarged = image.resize((image.width * 2, image.height * 2))
        enlarged.save(tmp_path)
        lines = text_from_image(str(tmp_path), language_preference=["zh-Hant"], detail=False)
        return "\n".join(lines)


def extract_fitz_ocrmac(path: Path) -> str:
    texts = []
    with tempfile.TemporaryDirectory() as tmp:
        tmp_dir = Path(tmp)
        doc = fitz.open(path)
        try:
            for page_index, page in enumerate(doc):
                pix = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
                png_path = tmp_dir / f"page-{page_index+1:03d}.png"
                pix.save(png_path)
                lines = text_from_image(str(png_path), language_preference=["zh-Hant"], detail=False)
                texts.append("\n".join(lines))
        finally:
            doc.close()
    return "\n\n".join(texts)


def extract_text(path: Path, method: str) -> str:
    if method == "pdfplumber":
        return extract_pdfplumber(path)
    if method == "markitdown":
        return extract_markitdown(path)
    if method == "docling":
        return extract_docling(path)
    if method == "pymupdf_text":
        return extract_pymupdf_text(path)
    if method == "pymupdf_vertical":
        return extract_pymupdf_vertical(path)
    if method == "soffice_markitdown":
        return extract_soffice_markitdown(path)
    if method == "ocrmac_image":
        return extract_ocrmac_image(path)
    if method == "ocrmac_image_upscaled":
        return extract_ocrmac_image_upscaled(path)
    if method == "fitz_ocrmac":
        return extract_fitz_ocrmac(path)
    raise ValueError(f"Unsupported method: {method}")


def analyze_text(text: str) -> dict:
    lines = text.splitlines()
    non_empty_lines = [line for line in lines if line.strip()]
    non_ws_chars = len(re.sub(r"\s+", "", text))
    cjk_chars = len(re.findall(r"[\u4e00-\u9fff]", text))
    spaced_cjk_pairs = len(re.findall(r"[\u4e00-\u9fff]\s+[\u4e00-\u9fff]", text))
    control_chars = sum(
        1
        for ch in text
        if unicodedata.category(ch).startswith("C") and ch not in "\n\r\t"
    )
    image_markers = text.count("<!-- image -->") + text.count("![](")

    preview_head = re.sub(r"\s+", " ", text[:300]).strip()
    preview_tail = re.sub(r"\s+", " ", text[-300:]).strip() if text else ""

    return {
        "char_count": len(text),
        "non_ws_chars": non_ws_chars,
        "line_count": len(lines),
        "non_empty_line_count": len(non_empty_lines),
        "blank_line_count": len(lines) - len(non_empty_lines),
        "cjk_char_count": cjk_chars,
        "spaced_cjk_pairs": spaced_cjk_pairs,
        "spaced_cjk_ratio": round(spaced_cjk_pairs / max(cjk_chars, 1), 4),
        "control_char_count": control_chars,
        "replacement_char_count": text.count("\ufffd"),
        "markdown_heading_count": len(re.findall(r"(?m)^#{1,6}\s", text)),
        "table_like_line_count": len(re.findall(r"(?m)^\|.*\|$", text)),
        "image_marker_count": image_markers,
        "empty_text": non_ws_chars == 0,
        "preview_head": preview_head,
        "preview_tail": preview_tail,
    }


def load_samples() -> list[dict]:
    samples = []
    for sample in PILOT_SAMPLES:
        path = ROOT / sample["path"]
        if not path.exists():
            raise FileNotFoundError(f"Sample missing: {path}")
        samples.append(
            {
                **sample,
                "absolute_path": str(path),
                "size_bytes": path.stat().st_size,
            }
        )
    return samples


def update_progress(samples: list[dict]) -> None:
    if not PROGRESS_PATH.exists():
        return

    progress = json.loads(PROGRESS_PATH.read_text(encoding="utf-8"))
    pilot_combos = {Path(sample["path"]).parts[-2] for sample in samples}
    updated = False
    for item in progress:
        if item["combo"] in pilot_combos:
            item["pilot_sample"] = True
            item["phase"] = "pilot"
            item["last_updated"] = now_iso()
            updated = True
    if updated:
        PROGRESS_PATH.write_text(json.dumps(progress, ensure_ascii=False, indent=2), encoding="utf-8")


def write_output_text(sample_id: str, method: str, text: str) -> str:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    out_path = OUTPUT_DIR / f"{slug(sample_id)}__{slug(method)}.txt"
    out_path.write_text(text, encoding="utf-8")
    return str(out_path.relative_to(ROOT))


def benchmark_sample(sample: dict) -> dict:
    result_entry = {
        "sample_id": sample["sample_id"],
        "category": sample["category"],
        "description": sample["description"],
        "relative_path": sample["path"],
        "size_bytes": sample["size_bytes"],
        "methods": [],
    }

    for method in sample["methods"]:
        started = time.time()
        method_entry = {
            "method": method,
            "status": "ok",
            "started_at": datetime.fromtimestamp(started).isoformat(timespec="seconds"),
        }
        try:
            text = extract_text(ROOT / sample["path"], method)
            method_entry["elapsed_sec"] = round(time.time() - started, 2)
            method_entry["metrics"] = analyze_text(text)
            method_entry["output_text_path"] = write_output_text(sample["sample_id"], method, text)
        except Exception as exc:
            method_entry["status"] = "error"
            method_entry["elapsed_sec"] = round(time.time() - started, 2)
            method_entry["error"] = str(exc)
        result_entry["methods"].append(method_entry)

    return result_entry


def make_report(results: dict) -> str:
    lines = [
        "# JOB-223 Pilot Benchmark Report",
        "",
        f"`generated_at`: {results['generated_at']}",
        "",
        "## Sample Set",
        "",
        "| sample_id | category | path | methods |",
        "|:--|:--|:--|:--|",
    ]

    for sample in results["samples"]:
        methods = ", ".join(sample["methods"])
        lines.append(
            f"| `{sample['sample_id']}` | {sample['category']} | `{sample['path']}` | {methods} |"
        )

    for sample_result in results["results"]:
        lines.extend(
            [
                "",
                f"## {sample_result['sample_id']}",
                "",
                f"- 類別：`{sample_result['category']}`",
                f"- 說明：{sample_result['description']}",
                f"- 來源：`{sample_result['relative_path']}`",
                f"- 檔案大小：{sample_result['size_bytes']} bytes",
                "",
                "| method | status | sec | chars | non_ws | lines | spaced_cjk_ratio | image_markers | headings | preview |",
                "|:--|:--|--:|--:|--:|--:|--:|--:|--:|:--|",
            ]
        )
        for method in sample_result["methods"]:
            if method["status"] != "ok":
                lines.append(
                    f"| `{method['method']}` | error | {method['elapsed_sec']} | - | - | - | - | - | - | {method['error']} |"
                )
                continue
            metrics = method["metrics"]
            preview = metrics["preview_head"][:80].replace("|", "\\|")
            lines.append(
                f"| `{method['method']}` | ok | {method['elapsed_sec']} | {metrics['char_count']} | "
                f"{metrics['non_ws_chars']} | {metrics['line_count']} | {metrics['spaced_cjk_ratio']} | "
                f"{metrics['image_marker_count']} | {metrics['markdown_heading_count']} | {preview} |"
            )

    return "\n".join(lines) + "\n"


def main() -> None:
    MANIFEST_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    samples = load_samples()
    SAMPLES_PATH.write_text(json.dumps(samples, ensure_ascii=False, indent=2), encoding="utf-8")
    update_progress(samples)

    results = {
        "job": "JOB-223",
        "generated_at": now_iso(),
        "samples": [
            {
                "sample_id": sample["sample_id"],
                "category": sample["category"],
                "description": sample["description"],
                "path": sample["path"],
                "methods": sample["methods"],
            }
            for sample in samples
        ],
        "results": [benchmark_sample(sample) for sample in samples],
    }

    RESULTS_PATH.write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")
    REPORT_PATH.write_text(make_report(results), encoding="utf-8")

    print(f"Wrote {rel_to_root(SAMPLES_PATH)}")
    print(f"Wrote {rel_to_root(RESULTS_PATH)}")
    print(f"Wrote {rel_to_root(REPORT_PATH)}")


if __name__ == "__main__":
    main()
