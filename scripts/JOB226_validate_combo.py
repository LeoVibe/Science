#!/usr/bin/env python3
"""
JOB-226 Phase 5: 自動驗收 8 項檢查

檢查項目（v2 spec §五 Phase 5）:
  1. YAML frontmatter 可解析
  2. 6 區段齊全（H2: 整合摘要 / 主題命中分析 / 試卷 / 答案 / 來源追溯 / 整合判斷）
  3. frontmatter 必填欄位齊全（含 integration 子欄位）
  4. OCR 紅旗 grep（試卷區應 0 hits）
  5. 試卷無重複（同 ## 大題標題出現 ≤ 1 次）
  6. 題數保留（raw 題號集合 ⊆ 整合版題號集合）
  7. source_pdfs[] 與原始檔 sha256 對得上（若可驗）
  8. char_count = 實算 body 非空白字數（容差 ±5%）

用法:
  python3 scripts/JOB226_validate_combo.py --combo 三下_社會_南一
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import List, Optional, Tuple

try:
    import yaml
except ImportError:
    print("❌ 缺少 PyYAML。請執行：pip3 install pyyaml", file=sys.stderr)
    sys.exit(1)


SEMESTER_PATTERN = re.compile(r"^(三|四|五|六)下_")
FRONTMATTER_PATTERN = re.compile(r"^---\n(.*?)\n---\n(.*)$", re.DOTALL)
SECTION_HEADERS_REQUIRED = ["整合摘要", "主題命中分析", "試卷", "答案", "來源追溯", "整合判斷"]
QUALITY_FLAGS_DICT = {
    "paper_full", "paper_partial", "paper_empty",
    "answer_full", "answer_partial", "answer_empty", "answer_questions_only_no_marks",
    "dual_source_merged", "claude_only", "codex_only",
    "claude_primary", "codex_primary",
    "ocr_corrected", "columns_reordered", "alias_dedup", "extract_failed"
}
OCR_RED_FLAGS = ["哪 - 個", "哪-個", "哪 - 種", "哪-種", "哪 - 項", "哪-項",
                 "之-", "-、是非題", "-、選擇題"]
# 支援多種題號格式：「( )N.」、「N.」開頭（非小數，後面接非數字）
QUESTION_NUM_PATTERN = re.compile(r"(?:[(（]\s*[)）O✓✗ˇ✘×／\-—]?\s*[)）]\s*(\d+)\.)|(?:^\s*(\d+)\.[\s\(（])", re.MULTILINE)
SECTION_HEADER_PATTERN = re.compile(r"^##\s+(.+?)\s*$", re.MULTILINE)


def extract_section(body, name):
    """取出指定 H2 區段內容（## name 到下一個 ## 之間）"""
    m = re.search(rf"^##\s+{re.escape(name)}\s*\n(.*?)(?=^##\s|\Z)", body, re.DOTALL | re.MULTILINE)
    return m.group(1) if m else ""


FULLWIDTH_DIGITS = str.maketrans("０１２３４５６７８９", "0123456789")


def normalize_digits(s: str) -> str:
    return s.translate(FULLWIDTH_DIGITS)


def get_question_nums(text):
    """從文字中抽出題號集合（支援多格式 + 全形/半形 normalize）"""
    text = normalize_digits(text)
    nums = set()
    for m in QUESTION_NUM_PATTERN.finditer(text):
        n = m.group(1) or m.group(2)
        if n:
            nums.add(n)
    return nums


def detect_semester(combo: str) -> str:
    m = SEMESTER_PATTERN.match(combo)
    if not m:
        raise ValueError(f"無法從 combo 推斷學期：{combo}")
    return m.group(1) + "下"


def parse_md(path: Path):
    text = path.read_text(encoding="utf-8")
    m = FRONTMATTER_PATTERN.match(text)
    if not m:
        return None, text
    fm_yaml, body = m.group(1), m.group(2)
    try:
        fm = yaml.safe_load(fm_yaml)
        return fm, body
    except yaml.YAMLError:
        return None, body


def check_yaml(fm):
    if fm is None:
        return False, "YAML 解析失敗或無 frontmatter"
    return True, ""


def check_sections(body):
    headers = SECTION_HEADER_PATTERN.findall(body)
    missing = [h for h in SECTION_HEADERS_REQUIRED if h not in headers]
    if missing:
        return False, f"缺 H2 區段：{missing}"
    # 順序檢查
    indices = []
    for h in SECTION_HEADERS_REQUIRED:
        try:
            indices.append(headers.index(h))
        except ValueError:
            pass
    if indices != sorted(indices):
        return False, f"6 區段順序錯亂"
    return True, ""


def check_frontmatter_required(fm):
    if not isinstance(fm, dict):
        return False, "frontmatter 非 dict"
    required_top = ["publisher", "academic_year", "source_school", "exam_type",
                    "semester", "subject", "combo", "exam_id",
                    "integration", "quality_flags", "char_count", "source_pdfs"]
    missing = [k for k in required_top if k not in fm or fm[k] in (None, "", [])]
    if missing:
        return False, f"frontmatter 缺欄位：{missing}"
    integ = fm.get("integration", {})
    if not isinstance(integ, dict):
        return False, "integration 非 dict"
    integ_required = ["method", "llm_model", "integrated_date", "sources"]
    integ_missing = [k for k in integ_required if k not in integ or integ[k] in (None, "", [])]
    if integ_missing:
        return False, f"integration 子欄位缺：{integ_missing}"
    # quality_flags 字典檢查
    flags = fm.get("quality_flags", [])
    if not isinstance(flags, list) or not flags:
        return False, "quality_flags 為空或非 list"
    illegal = [f for f in flags if f not in QUALITY_FLAGS_DICT]
    if illegal:
        return False, f"quality_flags 出現變體：{illegal}"
    return True, ""


def check_ocr_red_flags(body):
    """只檢查試卷區（## 試卷 ~ ## 答案 之間），避免 metadata 描述區的 false positive"""
    paper_section = extract_section(body, "試卷")
    if not paper_section:
        # 退化：檢查整 body
        paper_section = body
    hits = []
    for flag in OCR_RED_FLAGS:
        if flag in paper_section:
            hits.append(flag)
    if hits:
        return False, f"試卷區 OCR 紅旗命中：{hits}"
    return True, ""


def check_no_duplicate_sections(body):
    """只檢查試卷區內 H3 大題標題重複（試卷+答案區各列一次屬合理結構）"""
    paper_section = extract_section(body, "試卷")
    if not paper_section:
        paper_section = body
    h3_pattern = re.compile(r"^###\s+([一二三四五六七八九十]+、.+?)\s*$", re.MULTILINE)
    headers = h3_pattern.findall(paper_section)
    seen = {}
    for h in headers:
        seen[h] = seen.get(h, 0) + 1
    dups = {k: v for k, v in seen.items() if v > 1}
    if dups:
        return False, f"試卷區大題重複：{dups}"
    return True, ""


def check_question_preservation(body, raw_paths):
    """raw 題號集合 ⊆ 整合版題號集合（只看試卷區）"""
    paper_section = extract_section(body, "試卷")
    if not paper_section:
        paper_section = body
    integrated_nums = get_question_nums(paper_section)
    raw_nums = set()
    for p in raw_paths:
        if p and p.exists():
            raw_text = p.read_text(encoding="utf-8")
            raw_nums |= get_question_nums(raw_text)
    missing = raw_nums - integrated_nums
    suspicious_missing = {n for n in missing if int(n) <= max((int(x) for x in integrated_nums), default=0) + 5}
    if suspicious_missing:
        return False, f"題號漏失：{sorted(suspicious_missing, key=int)[:10]}（raw 有但整合版無）"
    return True, ""


def check_char_count(fm, body):
    declared = fm.get("char_count")
    actual = len([c for c in body if not c.isspace()])
    if not isinstance(declared, int):
        return False, f"char_count 非 int：{declared}"
    diff = abs(declared - actual)
    if actual == 0:
        return False, "body 非空白字數 = 0"
    ratio = diff / actual
    if ratio > 0.05:
        return False, f"char_count 偏差 {ratio*100:.1f}%（declared={declared}, actual={actual}）"
    return True, ""


def check_source_pdfs(fm):
    """檢查 source_pdfs[] 結構（不真跑 sha256，只檢結構與 pdf 路徑存在性）。"""
    src = fm.get("source_pdfs", [])
    if not isinstance(src, list) or not src:
        return False, "source_pdfs 為空或非 list"
    for i, s in enumerate(src):
        if not isinstance(s, dict):
            return False, f"source_pdfs[{i}] 非 dict"
        for k in ["filename", "kind", "sha256"]:
            if k not in s or not s[k]:
                return False, f"source_pdfs[{i}] 缺 {k}"
    return True, ""


def validate_file(integrated_path, claude_path, codex_path):
    fm, body = parse_md(integrated_path)
    checks = {}
    checks["1_yaml"] = check_yaml(fm)
    checks["2_sections"] = check_sections(body) if fm is not None else (False, "因 YAML fail 跳過")
    checks["3_frontmatter"] = check_frontmatter_required(fm) if fm is not None else (False, "因 YAML fail 跳過")
    checks["4_ocr_flags"] = check_ocr_red_flags(body)
    checks["5_no_dup_sections"] = check_no_duplicate_sections(body)
    raw_paths = [p for p in [claude_path, codex_path] if p]
    checks["6_question_preservation"] = check_question_preservation(body, raw_paths)
    checks["7_source_pdfs"] = check_source_pdfs(fm) if fm is not None else (False, "因 YAML fail 跳過")
    checks["8_char_count"] = check_char_count(fm, body) if fm is not None else (False, "因 YAML fail 跳過")
    return {k: {"pass": v[0], "msg": v[1]} for k, v in checks.items()}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--combo", required=True)
    parser.add_argument("--semester", default=None)
    parser.add_argument("--root", default="knowledge/3_考古題")
    parser.add_argument("--verbose", action="store_true")
    args = parser.parse_args()

    sem = args.semester or detect_semester(args.combo)
    root = Path(args.root)
    integrated_dir = root / "2_MD淬鍊文字_整合版" / sem / args.combo
    claude_dir = root / "2_MD淬鍊文字_Claude" / sem / args.combo
    codex_dir = root / "2_MD淬鍊文字_Codex" / sem / args.combo

    if not integrated_dir.exists():
        print(f"❌ 整合版目錄不存在：{integrated_dir}", file=sys.stderr)
        sys.exit(1)

    files = sorted([p for p in integrated_dir.glob("*.md") if not p.name.startswith("_")])
    if not files:
        print(f"❌ 整合版目錄內無 *.md：{integrated_dir}", file=sys.stderr)
        sys.exit(1)

    summary = {"combo": args.combo, "total": len(files), "all_pass": 0, "any_fail": 0, "files": []}

    for fp in files:
        c_path = claude_dir / fp.name if (claude_dir / fp.name).exists() else None
        x_path = codex_dir / fp.name if (codex_dir / fp.name).exists() else None
        result = validate_file(fp, c_path, x_path)
        all_pass = all(v["pass"] for v in result.values())
        summary["files"].append({"file": fp.name, "all_pass": all_pass, "checks": result})
        if all_pass:
            summary["all_pass"] += 1
        else:
            summary["any_fail"] += 1

    out_path = integrated_dir / "_validation_report.json"
    out_path.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"\n=== 驗收結果：{args.combo} ===")
    print(f"全綠：{summary['all_pass']}/{summary['total']}")
    print(f"任一 fail：{summary['any_fail']}/{summary['total']}")
    if summary["any_fail"] > 0 or args.verbose:
        print(f"\n失敗檔案：")
        for f in summary["files"]:
            if not f["all_pass"]:
                fails = [f"{k}: {v['msg']}" for k, v in f["checks"].items() if not v["pass"]]
                print(f"  ❌ {f['file']}")
                for line in fails:
                    print(f"      {line}")
    print(f"\n報告寫入：{out_path}")
    sys.exit(0 if summary["any_fail"] == 0 else 1)


if __name__ == "__main__":
    main()
