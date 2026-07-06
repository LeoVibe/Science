#!/usr/bin/env python3.11
"""Pilot merger for JOB-223 final integrated Markdown output.

The script can run one combo at a time. It compares Claude and Codex outputs,
uses Codex as the coverage backbone, adds Claude provenance/matching signals,
and writes a normalized final output.
"""

from __future__ import annotations

import argparse
import json
import re
from collections import Counter, defaultdict
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Any


REPO = Path(__file__).resolve().parents[1]
DEFAULT_SEMESTER = "五下"
DEFAULT_COMBO = "五下_數學_南一"

SEMESTER = DEFAULT_SEMESTER
COMBO = DEFAULT_COMBO
SUBJECT = "數學"
PUBLISHER = "南一"
GRADE = "五"

CLAUDE_DIR = REPO / "knowledge/3_考古題/2_MD淬鍊文字_Claude" / SEMESTER / COMBO
CODEX_DIR = REPO / "knowledge/3_考古題/2_MD淬鍊文字_Codex" / SEMESTER / COMBO
FINAL_DIR = REPO / "knowledge/3_考古題/2_MD淬鍊文字_最終整合" / SEMESTER / COMBO


def configure(semester: str, combo: str) -> None:
    global SEMESTER, COMBO, SUBJECT, PUBLISHER, GRADE, CLAUDE_DIR, CODEX_DIR, FINAL_DIR
    SEMESTER = semester
    COMBO = combo
    parts = combo.split("_")
    SUBJECT = parts[1] if len(parts) >= 2 else ""
    PUBLISHER = parts[2] if len(parts) >= 3 else ""
    GRADE = semester[0] if semester else ""
    CLAUDE_DIR = REPO / "knowledge/3_考古題/2_MD淬鍊文字_Claude" / SEMESTER / COMBO
    CODEX_DIR = REPO / "knowledge/3_考古題/2_MD淬鍊文字_Codex" / SEMESTER / COMBO
    FINAL_DIR = REPO / "knowledge/3_考古題/2_MD淬鍊文字_最終整合" / SEMESTER / COMBO


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="ignore")


def write_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def load_json(path: Path) -> dict[str, Any]:
    return json.loads(read_text(path))


def dump_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def strip_frontmatter(text: str) -> tuple[dict[str, str], str]:
    if not text.startswith("---\n"):
        return {}, text
    end = text.find("\n---\n", 4)
    if end == -1:
        return {}, text
    raw = text[4:end]
    body = text[end + 5 :].lstrip()
    meta: dict[str, str] = {}
    for line in raw.splitlines():
        if not line.strip() or line.startswith(" ") or line.startswith("-"):
            continue
        if ":" in line:
            key, value = line.split(":", 1)
            meta[key.strip()] = value.strip().strip('"')
    return meta, body


def normalize_exam_type(value: str) -> str:
    if "第一次段考" in value or "期中" in value:
        return "第一次段考"
    if "第二次段考" in value or "期末" in value:
        return "第二次段考"
    if "第三次段考" in value:
        return "第三次段考"
    return value or "未知"


def display_exam_type(value: str) -> str:
    if value == "第一次段考":
        return "第一次段考（期中考）"
    if value == "第二次段考":
        return "第二次段考（期末考）"
    return value


def normalize_school(value: str) -> str:
    value = value.strip()
    value = re.sub(r"^(市立|縣立|國立)", "", value)
    value = value.replace("國民小學", "國小")
    if value == "安和國小":
        return "新北安和國小"
    return value


def non_ws_len(text: str) -> int:
    return len(re.sub(r"\s+", "", text))


def data_image_count(text: str) -> int:
    return len(re.findall(r"!\[\]\(data:image/", text))


def parse_raw_claude_filename(path: Path) -> dict[str, str] | None:
    stem = path.stem
    pattern = re.compile(
        r"^(?P<prefix>市立|縣立|國立)?(?P<school>.+?國小)\s+"
        + re.escape(GRADE)
        + r"年級\s+"
        r"(?P<year>\d{3})\s+下學期\s+.*?\s+"
        r"(?P<exam>第一次段考|第二次段考|第三次段考|期中考|期末考)\s+"
        r".*?\s+(?P<publisher>"
        + re.escape(PUBLISHER)
        + r")\s+(?P<kind>答案|試卷)"
    )
    match = pattern.search(stem)
    if not match:
        return None
    data = match.groupdict()
    return {
        "publisher": data["publisher"],
        "year": data["year"],
        "school": normalize_school(data["school"]),
        "exam_type": normalize_exam_type(data["exam"]),
        "kind": data["kind"],
    }


def extract_codex_sections(text: str) -> list[dict[str, Any]]:
    """Extract source sections from Codex body.

    Returns entries like:
      {kind: "試卷", heading: "...", meta_line: "...", text: "..."}
    """
    _, body = strip_frontmatter(text)
    sections: list[dict[str, Any]] = []
    pattern = re.compile(
        r"^## (?P<kind>答案|試卷)原文（(?P<source>.*?)）\n\n"
        r"> (?P<meta>.*?)\n\n```text\n(?P<content>.*?)\n```",
        re.M | re.S,
    )
    for match in pattern.finditer(body):
        data = match.groupdict()
        sections.append(
            {
                "kind": data["kind"],
                "source": data["source"],
                "meta": data["meta"],
                "text": data["content"].rstrip(),
                "non_ws_chars": non_ws_len(data["content"]),
            }
        )
    return sections


def extract_claude_body_summary(path: Path) -> dict[str, Any]:
    text = read_text(path)
    meta, body = strip_frontmatter(text)
    return {
        "path": str(path.relative_to(REPO)),
        "filename": path.name,
        "has_frontmatter": bool(meta),
        "has_topic_analysis": "## 主題命中分析" in body,
        "non_ws_chars": non_ws_len(body),
        "data_image_markers": data_image_count(body),
    }


@dataclass
class ClaudeDoc:
    path: Path
    filename: str
    metadata: dict[str, Any]
    sha256s: set[str] = field(default_factory=set)
    indexed: bool = False
    matched_codex: set[str] = field(default_factory=set)

    @property
    def summary(self) -> dict[str, Any]:
        base = extract_claude_body_summary(self.path)
        base.update(
            {
                "indexed": self.indexed,
                "metadata": self.metadata,
                "sha256_count": len(self.sha256s),
                "matched_codex_count": len(self.matched_codex),
            }
        )
        return base


def load_claude_docs(codex_sha_to_filename: dict[str, str]) -> list[ClaudeDoc]:
    docs: dict[Path, ClaudeDoc] = {}
    index_path = CLAUDE_DIR / "_index.json"
    if index_path.exists():
        data = load_json(index_path)
        for entry in data.get("files", []):
            path = CLAUDE_DIR / entry["filename"]
            sha256s = {p.get("sha256") for p in entry.get("pdf_files", []) if p.get("sha256")}
            matched = {codex_sha_to_filename[s] for s in sha256s if s in codex_sha_to_filename}
            docs[path] = ClaudeDoc(
                path=path,
                filename=path.name,
                indexed=True,
                metadata={
                    "publisher": entry.get("publisher", PUBLISHER),
                    "year": str(entry.get("year", "")),
                    "school": normalize_school(str(entry.get("school", ""))),
                    "exam_type": normalize_exam_type(str(entry.get("exam_type", ""))),
                },
                sha256s=sha256s,
                matched_codex=matched,
            )

    for path in sorted(CLAUDE_DIR.glob("*.md")):
        if path.name.startswith("_"):
            continue
        if path in docs:
            continue
        raw_meta = parse_raw_claude_filename(path)
        meta, _ = strip_frontmatter(read_text(path))
        metadata: dict[str, Any]
        if raw_meta:
            metadata = raw_meta
        elif meta:
            metadata = {
                "publisher": meta.get("publisher", PUBLISHER),
                "year": meta.get("academic_year", ""),
                "school": normalize_school(meta.get("source_school", "")),
                "exam_type": normalize_exam_type(meta.get("exam_type", "")),
            }
        else:
            metadata = {"publisher": PUBLISHER, "year": "", "school": "", "exam_type": ""}
        docs[path] = ClaudeDoc(path=path, filename=path.name, metadata=metadata)
    return list(docs.values())


def metadata_match(codex_entry: dict[str, Any], claude_doc: ClaudeDoc) -> bool:
    meta = claude_doc.metadata
    if not meta:
        return False
    return (
        str(codex_entry.get("year")) == str(meta.get("year"))
        and normalize_school(str(codex_entry.get("school", ""))) == normalize_school(str(meta.get("school", "")))
        and normalize_exam_type(str(codex_entry.get("exam_type", ""))) == normalize_exam_type(str(meta.get("exam_type", "")))
    )


def render_frontmatter(entry: dict[str, Any], status: str, precise: list[ClaudeDoc], broad: list[ClaudeDoc]) -> str:
    flags = entry.get("quality_flags") or []
    lines = [
        "---",
        f"publisher: {PUBLISHER}",
        f"academic_year: {entry.get('year')}",
        f"source_school: {entry.get('school')}",
        f"exam_type: {entry.get('exam_type')}",
        f"semester: {SEMESTER}",
        f"subject: {SUBJECT}",
        f"combo: {COMBO}",
        f"integration_status: {status}",
        "primary_agent: Codex",
        "available_agents:",
        "  - Codex",
    ]
    if precise or broad:
        lines.append("  - Claude")
    lines.extend(
        [
            f"integrated_date: {datetime.now().strftime('%Y-%m-%d')}",
            'integrated_by: "Codex JOB-223 final integration pilot"',
            f"codex_source_file: {entry.get('filename')}",
            f"codex_total_non_ws_chars: {entry.get('total_non_ws_chars', 0)}",
            f"claude_precise_matches: {len(precise)}",
            f"claude_broad_references: {len(broad)}",
        ]
    )
    if flags:
        lines.append("quality_flags:")
        lines.extend([f"  - {flag}" for flag in flags])
    else:
        lines.append("quality_flags: []")
    lines.append("---")
    return "\n".join(lines) + "\n\n"


def render_source_table(source_files: list[dict[str, Any]]) -> str:
    rows = ["| 類型 | 原始檔 | 引擎 | 非空白字數 | flags |", "|:--|:--|:--|--:|:--|"]
    for source in source_files:
        flags = ", ".join(source.get("quality_flags") or []) or "-"
        rows.append(
            f"| {source.get('kind', '-')} | `{source.get('filename', '-')}` | "
            f"`{source.get('method', '-')}` | {source.get('non_ws_chars', 0)} | {flags} |"
        )
    return "\n".join(rows)


def render_claude_table(precise: list[ClaudeDoc], broad: list[ClaudeDoc]) -> str:
    docs = [(doc, "精準匹配") for doc in precise] + [(doc, "廣義合併參考") for doc in broad]
    if not docs:
        return "本題組未找到 Claude 對應檔；最終版以 Codex 全量輸出為主。"
    rows = ["| 關係 | Claude 檔案 | index | 非空白字數 | 圖片/公式 placeholder | 說明 |", "|:--|:--|:--:|--:|--:|:--|"]
    for doc, relation in docs:
        summary = doc.summary
        note = "可作為格式或圖像位置參考" if summary["data_image_markers"] else "內容對照參考"
        if relation == "廣義合併參考":
            note = "Claude 檔合併多個題組，不直接採為正文"
        rows.append(
            f"| {relation} | `{doc.filename}` | {'是' if doc.indexed else '否'} | "
            f"{summary['non_ws_chars']} | {summary['data_image_markers']} | {note} |"
        )
    return "\n".join(rows)


def render_integrated_doc(
    entry: dict[str, Any],
    codex_text: str,
    precise: list[ClaudeDoc],
    broad: list[ClaudeDoc],
) -> str:
    if precise and broad:
        status = "codex_with_precise_and_broad_claude"
    elif precise:
        status = "codex_with_precise_claude"
    elif broad:
        status = "codex_with_broad_claude_reference"
    else:
        status = "codex_only"

    sections = extract_codex_sections(codex_text)
    title = (
        f"# {SEMESTER} {SUBJECT} {PUBLISHER}｜{entry.get('school')} "
        f"{entry.get('year')} 學年度 {display_exam_type(str(entry.get('exam_type')))}"
    )
    flags = ", ".join(entry.get("quality_flags") or []) or "無"
    body: list[str] = [render_frontmatter(entry, status, precise, broad).rstrip(), title]
    body.extend(
        [
            "",
            "## 整合摘要",
            "",
            "| 項目 | 內容 |",
            "|:--|:--|",
            f"| 整合狀態 | `{status}` |",
            "| 正文主來源 | Codex。原因：本 pilot 中 Codex 覆蓋率與索引追溯性較完整。 |",
            f"| Claude 補充 | 精準匹配 `{len(precise)}` 份；廣義合併參考 `{len(broad)}` 份。 |",
            f"| 品質旗標 | {flags} |",
            f"| Codex 非空白字數 | {entry.get('total_non_ws_chars', 0)} |",
            "",
            "## 最佳化正文",
            "",
        ]
    )

    if not sections:
        body.extend(["未能從 Codex 正文解析出標準「試卷 / 答案」區段；請回查原始 Codex 檔。", ""])
    else:
        for section in sections:
            body.extend(
                [
                    f"### {section['kind']}｜{section['source']}",
                    "",
                    f"> {section['meta']}；整合後保留為主要正文。",
                    "",
                    "```text",
                    section["text"],
                    "```",
                    "",
                ]
            )

    body.extend(
        [
            "## 來源追溯",
            "",
            render_source_table(entry.get("source_files") or []),
            "",
            "## Claude 對照與取捨",
            "",
            render_claude_table(precise, broad),
            "",
            "## 整合判斷",
            "",
            "- Codex 提供完整題組切分、正確 final path、來源 sha、抽取方法與 quality flags，因此作為正文 backbone。",
            "- Claude 若為精準匹配，保留為對照與補充來源；若為廣義合併檔，只保留 trace，不直接把合併正文灌入單一題組。",
            "- 若 Claude 出現圖片或公式 placeholder，代表該處原始版面可能含圖形/公式；本 pilot 不做 OCR 或圖像還原，建議必要時回查原 PDF / DOCX。",
            "",
        ]
    )
    return "\n".join(body).rstrip() + "\n"


def main() -> None:
    FINAL_DIR.mkdir(parents=True, exist_ok=True)

    codex_index = load_json(CODEX_DIR / "_index.json")
    codex_entries = codex_index.get("files", [])
    codex_by_filename = {entry["filename"]: entry for entry in codex_entries}
    codex_sha_to_filename: dict[str, str] = {}
    for entry in codex_entries:
        for source in entry.get("source_files") or []:
            sha = source.get("sha256")
            if sha:
                codex_sha_to_filename[sha] = entry["filename"]

    claude_docs = load_claude_docs(codex_sha_to_filename)

    precise_by_codex: dict[str, list[ClaudeDoc]] = defaultdict(list)
    broad_by_codex: dict[str, list[ClaudeDoc]] = defaultdict(list)
    matched_claude: set[str] = set()

    for doc in claude_docs:
        if doc.matched_codex:
            if len(doc.matched_codex) == 1:
                filename = next(iter(doc.matched_codex))
                precise_by_codex[filename].append(doc)
            else:
                for filename in doc.matched_codex:
                    broad_by_codex[filename].append(doc)
            matched_claude.add(doc.filename)

    for doc in claude_docs:
        if doc.filename in matched_claude:
            continue
        matches = [entry["filename"] for entry in codex_entries if metadata_match(entry, doc)]
        if len(matches) == 1:
            precise_by_codex[matches[0]].append(doc)
            matched_claude.add(doc.filename)
        elif len(matches) > 1:
            for filename in matches:
                broad_by_codex[filename].append(doc)
            matched_claude.add(doc.filename)

    final_entries: list[dict[str, Any]] = []
    status_counter: Counter[str] = Counter()
    claude_relation_counter: Counter[str] = Counter()

    for entry in codex_entries:
        filename = entry["filename"]
        codex_text = read_text(CODEX_DIR / filename)
        precise = sorted(precise_by_codex.get(filename, []), key=lambda d: d.filename)
        broad = sorted(broad_by_codex.get(filename, []), key=lambda d: d.filename)
        output_text = render_integrated_doc(entry, codex_text, precise, broad)
        write_text(FINAL_DIR / filename, output_text)

        if precise and broad:
            status = "codex_with_precise_and_broad_claude"
        elif precise:
            status = "codex_with_precise_claude"
        elif broad:
            status = "codex_with_broad_claude_reference"
        else:
            status = "codex_only"
        status_counter[status] += 1
        claude_relation_counter["precise"] += len(precise)
        claude_relation_counter["broad"] += len(broad)

        final_entries.append(
            {
                "filename": filename,
                "publisher": entry.get("publisher"),
                "year": entry.get("year"),
                "school": entry.get("school"),
                "exam_type": entry.get("exam_type"),
                "integration_status": status,
                "primary_agent": "Codex",
                "available_agents": ["Codex"] + (["Claude"] if precise or broad else []),
                "quality_flags": entry.get("quality_flags") or [],
                "total_non_ws_chars": entry.get("total_non_ws_chars", 0),
                "source_files": entry.get("source_files") or [],
                "claude_precise_matches": [doc.summary for doc in precise],
                "claude_broad_references": [doc.summary for doc in broad],
            }
        )

    final_index = {
        "path": str(FINAL_DIR.relative_to(REPO)) + "/",
        "last_updated": datetime.now().isoformat(),
        "integration_source": {
            "claude_dir": str(CLAUDE_DIR.relative_to(REPO)),
            "codex_dir": str(CODEX_DIR.relative_to(REPO)),
            "strategy": "Codex coverage backbone + Claude precise/broad comparison metadata",
        },
        "total_md": len(final_entries),
        "files": final_entries,
    }
    dump_json(FINAL_DIR / "_index.json", final_index)

    codex_doc_index = CODEX_DIR / "_doc_index.json"
    if codex_doc_index.exists():
        doc_data = load_json(codex_doc_index)
        doc_data["path"] = str(FINAL_DIR.relative_to(REPO)) + "/"
        doc_data["integration_note"] = "Copied from Codex doc index for pilot traceability; final md filenames remain Codex-backed."
        dump_json(FINAL_DIR / "_doc_index.json", doc_data)

    unmatched_claude = [doc.summary for doc in claude_docs if doc.filename not in matched_claude]
    manifest = {
        "combo": COMBO,
        "semester": SEMESTER,
        "subject": SUBJECT,
        "publisher": PUBLISHER,
        "generated_at": datetime.now().isoformat(),
        "input_counts": {
            "claude_md": len([p for p in CLAUDE_DIR.glob("*.md") if not p.name.startswith("_")]),
            "claude_index_entries": len(load_json(CLAUDE_DIR / "_index.json").get("files", [])),
            "codex_md": len([p for p in CODEX_DIR.glob("*.md") if not p.name.startswith("_")]),
            "codex_index_entries": len(codex_entries),
        },
        "output_counts": {
            "final_md": len(final_entries),
            "final_index_entries": len(final_entries),
        },
        "integration_status_counts": dict(status_counter),
        "claude_relation_counts": dict(claude_relation_counter),
        "unmatched_claude": unmatched_claude,
    }
    dump_json(FINAL_DIR / "_integration_manifest.json", manifest)
    write_text(FINAL_DIR / "_integration_report.md", render_report(manifest, final_entries, claude_docs))


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Integrate one JOB-223 Claude/Codex combo into final MD output.")
    parser.add_argument("--semester", default=DEFAULT_SEMESTER, help="Semester directory, e.g. 五下")
    parser.add_argument("--combo", default=DEFAULT_COMBO, help="Combo directory, e.g. 五下_數學_南一")
    return parser.parse_args()


def render_report(manifest: dict[str, Any], final_entries: list[dict[str, Any]], claude_docs: list[ClaudeDoc]) -> str:
    status_counts = Counter(entry["integration_status"] for entry in final_entries)
    issue_counts = Counter()
    for entry in final_entries:
        for flag in entry.get("quality_flags") or []:
            issue_counts[flag] += 1
    precise_examples = [
        entry
        for entry in final_entries
        if entry.get("claude_precise_matches")
    ][:8]
    broad_examples = [
        entry
        for entry in final_entries
        if entry.get("claude_broad_references") and not entry.get("claude_precise_matches")
    ][:8]
    unmatched = manifest.get("unmatched_claude") or []

    lines = [
        f"# 最終整合 Pilot 分析報告：{COMBO}",
        "",
        "## 1. 測試目的",
        "",
        f"本 pilot 用單一學期、單一出版社、單一科目的 `{SUBJECT}` 題組，測試如何把 Claude 與 Codex 兩套 MD 成果整合成最終版。測試重點不是只複製檔案，而是逐題組判斷：只有單一 agent 轉出、兩者都有、或 Claude 把多題組合併成一檔時，最終版該如何取捨。",
        "",
        "## 2. 輸入與輸出",
        "",
        "| 類別 | 路徑 / 數量 |",
        "|:--|:--|",
        f"| Claude 來源 | `{CLAUDE_DIR.relative_to(REPO)}` |",
        f"| Codex 來源 | `{CODEX_DIR.relative_to(REPO)}` |",
        f"| 最終整合輸出 | `{FINAL_DIR.relative_to(REPO)}` |",
        f"| Claude md | {manifest['input_counts']['claude_md']} |",
        f"| Claude index entries | {manifest['input_counts']['claude_index_entries']} |",
        f"| Codex md | {manifest['input_counts']['codex_md']} |",
        f"| Codex index entries | {manifest['input_counts']['codex_index_entries']} |",
        f"| Final md | {manifest['output_counts']['final_md']} |",
        f"| Final index entries | {manifest['output_counts']['final_index_entries']} |",
        "",
        "## 3. 整合策略",
        "",
        "本 pilot 採用 `Codex coverage backbone + Claude 補充參考`。",
        "",
        f"- Codex 作為 backbone：此 combo 中 Codex 有 `{manifest['input_counts']['codex_md']}` 份 md、`{manifest['input_counts']['codex_index_entries']}` 個 index entries，且每筆都有 source file、sha256、抽取方法與 quality flags。",
        f"- Claude 作為補充：Claude 有 `{manifest['input_counts']['claude_md']}` 份 md、`{manifest['input_counts']['claude_index_entries']}` 個 index entries；它可提供人工結構、topic 區塊或圖片/公式 placeholder，但若出現廣義合併檔，不能直接作為題組切分基準。",
        "- 精準匹配：優先用 sha256 對齊；若沒有 sha，使用 year / school / exam_type metadata 對齊。",
        "- 廣義合併參考：若 Claude 單一 md 對到多個 Codex 題組，只保留 trace，不把整份 Claude 內容灌入每個 final md，避免污染單題組正文。",
        "- 正文選擇：final md 保留 Codex 的試卷/答案正文為主，Claude 的角色寫入 `Claude 對照與取捨`，用來提示是否存在圖片、公式或結構參考。",
        "",
        "## 4. 匹配結果",
        "",
        "| integration_status | 題組數 |",
        "|:--|--:|",
    ]
    for key, count in sorted(status_counts.items()):
        lines.append(f"| `{key}` | {count} |")

    lines.extend(
        [
            "",
            "### 4.1 精準匹配樣例",
            "",
        ]
    )
    if precise_examples:
        lines.extend(["| Final 檔案 | Claude 精準匹配 | 說明 |", "|:--|:--|:--|"])
        for entry in precise_examples:
            names = ", ".join(f"`{m['filename']}`" for m in entry["claude_precise_matches"][:3])
            lines.append(f"| `{entry['filename']}` | {names} | sha 或 metadata 可直接對齊 |")
    else:
        lines.append("本 pilot 沒有精準匹配。")

    lines.extend(["", "### 4.2 廣義合併參考樣例", ""])
    if broad_examples:
        lines.extend(["| Final 檔案 | Claude 廣義來源 | 處理方式 |", "|:--|:--|:--|"])
        for entry in broad_examples:
            names = ", ".join(f"`{m['filename']}`" for m in entry["claude_broad_references"][:2])
            lines.append(f"| `{entry['filename']}` | {names} | 僅作 trace，不採為主要正文 |")
    else:
        lines.append("本 pilot 沒有只屬於廣義合併參考的樣例。")

    lines.extend(
        [
            "",
            "## 5. 品質與風險觀察",
            "",
            "| quality flag | 題組數 |",
            "|:--|--:|",
        ]
    )
    if issue_counts:
        for key, count in issue_counts.most_common():
            lines.append(f"| `{key}` | {count} |")
    else:
        lines.append("| 無 | 0 |")

    lines.extend(
        [
            "",
            "關鍵觀察：",
            "",
            f"- 數量差異需要逐 combo 判斷；本 combo 的 Claude index entries 為 `{manifest['input_counts']['claude_index_entries']}`，Codex index entries 為 `{manifest['input_counts']['codex_index_entries']}`。若 Claude 單檔對到多個 Codex 題組，final 版只保留 trace，不直接把合併正文灌入單題組。",
            "- Claude 未進 index 或無法唯一對齊的 md 會列於第 6 節；這類檔案可能提供圖形/公式 placeholder 的位置訊號，但不適合直接當索引基準。",
            "- final 版應保留 Codex 的完整覆蓋與 traceability，同時把 Claude 的結構訊號變成補充欄位，避免兩份全文硬合併造成重複與混亂。",
            "- 題目若含圖形、分數、幾何圖或聽力附件，純文字抽取仍會有資訊流失；final md 應明確保留 source file trace，讓後續必要時能回查原 PDF / DOCX。",
            "",
            "## 6. 未匹配 Claude 檔案",
            "",
        ]
    )
    if unmatched:
        lines.extend(["| Claude 檔案 | 非空白字數 | 圖片 placeholder | 推測原因 |", "|:--|--:|--:|:--|"])
        for item in unmatched:
            lines.append(
                f"| `{item['filename']}` | {item['non_ws_chars']} | {item['data_image_markers']} | 無 sha 且 metadata 無法唯一對齊 |"
            )
    else:
        lines.append("所有 Claude md 均已被納入精準匹配或廣義合併參考。")

    lines.extend(
        [
            "",
            "## 7. 建議的全量整合流程",
            "",
            "1. 以 Codex `_index.json` 作為全量題組 backbone。",
            "2. 將 Claude index 的 `pdf_files.sha256` 反查到 Codex source sha；sha 對到單一題組者列為精準匹配。",
            "3. sha 對到多個題組者列為廣義合併參考，不直接採為正文。",
            "4. Claude 未索引 md 以檔名與 frontmatter 補做 metadata matching。",
            "5. final md 統一格式：frontmatter、整合摘要、最佳化正文、來源追溯、Claude 對照與取捨、整合判斷。",
            "6. final `_index.json` 記錄 integration_status、primary_agent、available_agents、quality_flags、Claude precise/broad references。",
            "7. 全量跑完後再做跨 combo 驗證：md/index 對齊、missing output、unindexed md、截斷標記、空 code block、高 issue combo 清單。",
            "",
            "## 8. Pilot 結論",
            "",
            "這個 pilot 支持採用 Codex 作為最終整合 backbone，再以 Claude 作為補充層。理由是 final 版需要穩定的一題組一檔、完整 source trace、quality flags 與可機器讀取的 index；Claude 的人工結構、topic 區塊與圖片/公式 placeholder 訊號則適合保留為對照與取捨資訊。全量整合可沿用此腳本邏輯擴展。",
        ]
    )
    return "\n".join(lines) + "\n"


if __name__ == "__main__":
    args = parse_args()
    configure(args.semester, args.combo)
    main()
