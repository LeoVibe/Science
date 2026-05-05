#!/usr/bin/env python3
"""
JOB-228 Phase A0: 從 108 課綱社會領綱結構化 MD 抽出第 Ⅱ 學習階段合法編碼清單。

來源:knowledge/1_課綱研究/108課綱研究成果/2_課綱淬鍊文字/社會/社會_學習重點_結構化.md
產出:knowledge/3_考古題/3_L2_結構化抽取/_meta/social_codes_legal_II.json

第 Ⅱ 階段對應三下;此清單用於 JOB-228 Phase A2 LLM 編碼反查的合法集合邊界。
"""

import json
import pathlib
import re
import sys
from datetime import datetime

ROOT = pathlib.Path(__file__).resolve().parents[3]
SRC = ROOT / "knowledge/1_課綱研究/108課綱研究成果/2_課綱淬鍊文字/社會/社會_學習重點_結構化.md"
OUT = ROOT / "knowledge/3_考古題/3_L2_結構化抽取/_meta/social_codes_legal_II.json"


def extract_block(text: str, h2_title: str, h3_title: str) -> str:
    """從 H2 段落內找指定 H3 段落,回傳該 H3 區塊文字。"""
    h2_pat = re.compile(rf"^## {re.escape(h2_title)}\s*$", re.MULTILINE)
    m = h2_pat.search(text)
    if not m:
        sys.exit(f"找不到 H2: {h2_title}")
    h2_start = m.end()
    next_h2 = re.search(r"^## ", text[h2_start:], re.MULTILINE)
    h2_block = text[h2_start: h2_start + next_h2.start()] if next_h2 else text[h2_start:]

    h3_pat = re.compile(rf"^### {re.escape(h3_title)}\s*$", re.MULTILINE)
    m3 = h3_pat.search(h2_block)
    if not m3:
        sys.exit(f"找不到 H3: {h3_title} (在 H2 {h2_title} 下)")
    h3_start = m3.end()
    next_h3 = re.search(r"^###? ", h2_block[h3_start:], re.MULTILINE)
    return h2_block[h3_start: h3_start + next_h3.start()] if next_h3 else h2_block[h3_start:]


CODE_RE = re.compile(r"`([^`]+)`")


PIPE_PLACEHOLDER = "\x00ESCPIPE\x00"


def split_md_cells(line: str) -> list[str]:
    """正確處理 escaped \\| 的 markdown 表格 cell 切割。"""
    safe = line.replace("\\|", PIPE_PLACEHOLDER)
    cells = [c.strip().replace(PIPE_PLACEHOLDER, "|") for c in safe.split("|")[1:-1]]
    return cells


def parse_table(block: str, expected_stage: str = "Ⅱ") -> list[dict]:
    """從表格區塊抽 code 與同行 hint 文字。"""
    rows = []
    for line in block.splitlines():
        if not line.startswith("|"):
            continue
        if "編碼" in line and "內容片段" in line:
            continue
        if line.startswith("|:--") or line.startswith("|---"):
            continue
        cells = split_md_cells(line)
        if len(cells) < 2:
            continue
        m = CODE_RE.search(cells[0])
        if not m:
            continue
        code = m.group(1).strip()
        if f"-{expected_stage}-" not in code:
            continue
        hint_raw = cells[1] if len(cells) > 1 else ""
        hint = clean_hint(hint_raw)
        rows.append({"code": code, "hint": hint, "hint_raw": hint_raw})
    return rows


def clean_hint(raw: str) -> str:
    """簡易清洗:壓縮多餘空白(已先在 split_md_cells 還原 escape pipe)。

    完整 hint 仍以 hint_raw 保留,供人工核對。
    """
    text = re.sub(r"\s+", " ", raw)
    return text.strip()


def main():
    if not SRC.exists():
        sys.exit(f"來源檔不存在: {SRC}")
    text = SRC.read_text(encoding="utf-8")

    perf_block = extract_block(text, "學習表現（Performance）", "第 Ⅱ 學習階段（15 條）")
    cont_block = extract_block(text, "學習內容（Content）", "第 Ⅱ 學習階段（20 條）")

    performance = parse_table(perf_block)
    content = parse_table(cont_block)

    if len(performance) != 15:
        print(f"⚠️  學習表現抽到 {len(performance)} 條,預期 15 條", file=sys.stderr)
    if len(content) != 20:
        print(f"⚠️  學習內容抽到 {len(content)} 條,預期 20 條", file=sys.stderr)

    result = {
        "stage": "Ⅱ",
        "subject": "社會",
        "grade_mapping": "三下對應第 Ⅱ 學習階段",
        "source": str(SRC.relative_to(ROOT)),
        "extracted_at": datetime.now().strftime("%Y-%m-%dT%H:%M:%S+08:00"),
        "extractor": "scripts/jobs/JOB-228/A0_extract_legal_codes.py",
        "performance_count": len(performance),
        "content_count": len(content),
        "total": len(performance) + len(content),
        "performance": performance,
        "content": content,
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"✅ 寫入 {OUT.relative_to(ROOT)}")
    print(f"   學習表現: {len(performance)} 條")
    print(f"   學習內容: {len(content)} 條")
    print(f"   合計    : {len(performance) + len(content)} 條")
    print()
    print("--- 學習表現 codes ---")
    print(", ".join(r["code"] for r in performance))
    print()
    print("--- 學習內容 codes ---")
    print(", ".join(r["code"] for r in content))


if __name__ == "__main__":
    main()
