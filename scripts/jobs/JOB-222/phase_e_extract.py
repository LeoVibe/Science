#!/usr/bin/env python3
"""JOB-222 Phase E：五科 MD 結構化抽取（學習表現 + 學習內容 按 Ⅰ/Ⅱ/Ⅲ 分節）

各科編碼格式：
  國語文 表現  N-Ⅱ-N            學習內容（依文本表述/文化內涵 …，待查）
  英語文 表現  N-Ⅱ-N（聽說讀寫）   學習內容  Aa-Ⅱ-N
  數學   表現  小寫a-II-N        學習內容（小寫a-II-N）
  自然   表現  雙小寫-Ⅱ-N(tr/po/ai) 學習內容  INa-Ⅱ-N（國小）/ A~N 跨科
  社會   表現  Na-Ⅱ-N(1a/2b/3c)   學習內容  Xa-Ⅱ-N（A~D × a~d）

策略：
  - 每科用對應正則找所有編碼
  - 對每個編碼，取其行 + 後續 1-2 行作為「內容片段」（docling MD 表格逐行）
  - 按學習階段（Ⅰ/Ⅱ/Ⅲ/I/II/III）分組
  - 輸出 {科目}_學習重點_結構化.md
"""
from __future__ import annotations

import re
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent.parent
MD_BASE = ROOT / "knowledge" / "1_課綱研究" / "108課綱研究成果" / "2_課綱淬鍊文字"


# ---------- 各科編碼正則 ----------
# 第二碼可能是全形 ⅠⅡⅢⅣⅤ 或 ASCII I/II/III/IV/V
ROMAN = r"(?:Ⅰ|Ⅱ|Ⅲ|Ⅳ|Ⅴ|II|III|IV|V|I)"  # 注意 II 要在 I 前面避免短路

PATTERNS: dict[str, dict[str, str]] = {
    "國語文": {
        "performance": rf"(?:^|[^\w])([1-9]-\s*{ROMAN}\s*-\s*\d+)",          # 1-Ⅱ-1, 2-Ⅱ-3
        "content": rf"(?:^|[^\w])([A-Z][a-z]?-\s*{ROMAN}\s*-\s*\d+)",        # Aa-Ⅱ-1（國語文也用此格式）
    },
    "英語文": {
        "performance": rf"(?:^|[^\w])([1-9]-\s*{ROMAN}\s*-\s*\d+)",
        "content": rf"(?:^|[^\w])([A-Z][a-z]?-\s*{ROMAN}\s*-\s*\d+)",
    },
    "數學": {
        # 數學用 ASCII：n-II-1, s-II-1, ...
        "performance": r"(?:^|[^\w])([a-z]-(?:I|II|III|IV|V)-\d+)",
        "content": r"(?:^|[^\w])([A-Z]-(?:I|II|III|IV|V)-\d+|[a-z]-(?:I|II|III|IV|V)-\d+)",  # 與表現重疊（同編碼系統）
    },
    "自然科學": {
        # 表現：tr/po/ai/an/sa/sc/im/tc/cm/dc 等雙小寫字母
        "performance": rf"(?:^|[^\w])((?:tr|po|ai|an|sa|sc|im|tc|cm|dc|tm|pa|tp|pe|ah|ti)-\s*{ROMAN}\s*-\s*\d+)",
        # 內容：INa-Ⅱ-N（國小）+ 大寫字母系列（國中起，如 Ba-Ⅳ-1）
        "content": rf"(?:^|[^\w])(IN[a-g]-\s*{ROMAN}\s*-\s*\d+|[A-Z][a-z]?-\s*{ROMAN}\s*-\s*\d+)",
    },
    "社會": {
        # 表現：1a-Ⅱ-1, 2b-Ⅲ-1, 3c-Ⅳ-1
        "performance": rf"(?:^|[^\w])([1-3][a-c]-\s*{ROMAN}\s*-\s*\d+)",
        # 內容：Aa, Ab, Ba, Bb, Ca, Cb, Cc, Da, Db, Dc, Dd...
        "content": rf"(?:^|[^\w])([A-D][a-d]-\s*{ROMAN}\s*-\s*\d+)",
    },
}

# 找到的羅馬→分組鍵（標準化）
ROMAN_NORMALIZE = {
    "I": "Ⅰ", "II": "Ⅱ", "III": "Ⅲ", "IV": "Ⅳ", "V": "Ⅴ",
    "Ⅰ": "Ⅰ", "Ⅱ": "Ⅱ", "Ⅲ": "Ⅲ", "Ⅳ": "Ⅳ", "Ⅴ": "Ⅴ",
}


def normalize_code(raw: str) -> str:
    """將編碼正規化（去空格，全形/ASCII 羅馬統一）。回傳 (normalized, stage)"""
    code = re.sub(r"\s+", "", raw)
    # 找出羅馬部分
    m = re.search(r"-(II?I?I?V?|Ⅰ|Ⅱ|Ⅲ|Ⅳ|Ⅴ|V)-", code)
    if not m:
        return code, "?"
    raw_roman = m.group(1)
    stage = ROMAN_NORMALIZE.get(raw_roman, raw_roman)
    code_norm = code[:m.start(1)] + stage + code[m.end(1):]
    return code_norm, stage


def find_md_for(subject: str) -> Path | None:
    d = MD_BASE / subject
    if not d.exists():
        return None
    for p in d.glob("*.md"):
        if "課程手冊" in p.name:
            continue
        if "領綱" in p.name or "課程綱要" in p.name or subject in p.name or "課程綱要" in p.name:
            return p
    # fallback
    for p in d.glob("*.md"):
        if "課程手冊" not in p.name:
            return p
    return None


def extract_one_subject(subject: str, md_path: Path) -> dict:
    text = md_path.read_text(encoding="utf-8")
    lines = text.split("\n")

    pat = PATTERNS[subject]
    perf_re = re.compile(pat["performance"])
    cont_re = re.compile(pat["content"])

    perf_codes: dict[str, dict] = {}     # code_norm → {stage, lines, sample}
    cont_codes: dict[str, dict] = {}

    def collect(line_idx: int, line: str, regex, store):
        for m in regex.finditer(line):
            raw = m.group(1)
            code_norm, stage = normalize_code(raw)
            if code_norm not in store:
                # 取本行 + 後 1 行做為內容片段
                snippet_lines = []
                for j in range(line_idx, min(line_idx + 2, len(lines))):
                    snippet_lines.append(lines[j].strip())
                snippet = " ".join(snippet_lines)
                # 清理 markdown 表格分隔
                snippet = re.sub(r"\s*\|\s*", " | ", snippet)
                snippet = re.sub(r"\s+", " ", snippet).strip()
                store[code_norm] = {
                    "stage": stage,
                    "first_line": line_idx + 1,
                    "snippet": snippet[:300],
                }

    for i, line in enumerate(lines):
        collect(i, line, perf_re, perf_codes)
        # 數學的 performance 與 content 用同樣的小寫字母規則，對數學特殊處理：不重覆收集
        if subject != "數學":
            collect(i, line, cont_re, cont_codes)

    if subject == "數學":
        # 數學「學習內容」也用同樣的編碼（n-II-1 既是表現也是內容索引），合併處理
        cont_codes = {}  # 暫時併入 performance
    return {
        "md_path": str(md_path.relative_to(ROOT)),
        "performance": perf_codes,
        "content": cont_codes,
    }


def render_markdown(subject: str, data: dict) -> str:
    md = []
    md.append(f"*Created by Claude Code at 2026-04-30*\n")
    md.append(f"`last_updated`: 2026-04-30\n")
    md.append(f"`updated_by`: Claude Code (claude-opus-4-7)\n\n")
    md.append(f"# {subject} 領域 108 課綱 — 學習重點結構化抽取\n\n")
    md.append(f"`source`: {data['md_path']}\n")
    md.append(f"`scope`: 學習表現 + 學習內容，按學習階段（Ⅰ/Ⅱ/Ⅲ/Ⅳ/Ⅴ）分節\n")
    md.append(f"`note`: 編碼旁的內容片段是 docling 還原 MD 表格時的同行文字，僅供索引；精確內容請對照原始 PDF\n\n")

    sections = [
        ("學習表現（Performance）", data["performance"]),
    ]
    if data["content"]:
        sections.append(("學習內容（Content）", data["content"]))

    for section_title, codes in sections:
        md.append(f"## {section_title}\n\n")
        md.append(f"共 {len(codes)} 個編碼\n\n")
        # 按 stage 分組
        by_stage = defaultdict(list)
        for code, info in codes.items():
            by_stage[info["stage"]].append((code, info))
        # 排序學習階段
        stage_order = ["Ⅰ", "Ⅱ", "Ⅲ", "Ⅳ", "Ⅴ", "?"]
        for st in stage_order:
            if st not in by_stage:
                continue
            md.append(f"### 第 {st} 學習階段（{len(by_stage[st])} 條）\n\n")
            md.append("| 編碼 | 內容片段（同行還原文字）| 行號 |\n")
            md.append("|:--|:--|--:|\n")
            # 對編碼排序：取 -最後 -後的數字做排序鍵
            def sort_key(item):
                code = item[0]
                m = re.search(r"-([0-9]+)$", code)
                num = int(m.group(1)) if m else 999
                # 同前綴一起
                prefix = code.split("-")[0]
                return (prefix, num)
            for code, info in sorted(by_stage[st], key=sort_key):
                snip = info["snippet"].replace("|", "\\|")
                md.append(f"| `{code}` | {snip} | {info['first_line']} |\n")
            md.append("\n")
    return "".join(md)


def main():
    subjects = ["國語文", "英語文", "數學", "自然科學", "社會"]
    summary = []
    for subj in subjects:
        md_path = find_md_for(subj)
        if not md_path:
            print(f"  [{subj}] ✗ 找不到領綱 MD")
            continue
        data = extract_one_subject(subj, md_path)
        out_md = render_markdown(subj, data)
        out_path = MD_BASE / subj / f"{subj}_學習重點_結構化.md"
        out_path.write_text(out_md, encoding="utf-8")
        n_perf = len(data["performance"])
        n_cont = len(data["content"])
        print(f"  [{subj}] ✓ 表現 {n_perf} 條 / 內容 {n_cont} 條 → {out_path.relative_to(ROOT)}")
        summary.append((subj, n_perf, n_cont))

    print("\n=== 摘要 ===")
    for subj, p, c in summary:
        print(f"  {subj:6s}  表現 {p:3d}  內容 {c:3d}")


if __name__ == "__main__":
    sys.exit(main())
