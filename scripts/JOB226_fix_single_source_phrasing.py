#!/usr/bin/env python3
"""
JOB-226 Phase 5c：修補單源檔誤用「兩源」字眼。

對 quality_flags 含 codex_only / claude_only 的整合版 MD：
- 「兩源XX」→「Codex 源XX」（codex_only）/「Claude 源XX」（claude_only）
- 「（兩源皆未提供）」→「（本份僅 X 源，未提供此項資料）」
- 「兩源答案 PDF 為空，未提供作答」→「X 源答案 PDF 為空（本份無 Y 源），未提供作答」

dual_source_merged 檔不動。

用法：
  python3 scripts/JOB226_fix_single_source_phrasing.py --combo 四下_自然_翰林
  python3 scripts/JOB226_fix_single_source_phrasing.py --combo 四下_自然_翰林 --dry-run
"""
import argparse
import re
import sys
from pathlib import Path
from typing import Optional, Tuple, List

ROOT = Path(__file__).resolve().parent.parent
import yaml


def load_frontmatter(text: str) -> dict:
    if not text.startswith("---"):
        return {}
    parts = text.split("---", 2)
    if len(parts) < 3:
        return {}
    try:
        return yaml.safe_load(parts[1]) or {}
    except yaml.YAMLError:
        return {}


def detect_source(flags: List[str]) -> Optional[str]:
    if "codex_only" in flags:
        return "codex"
    if "claude_only" in flags:
        return "claude"
    return None  # dual or other — 不動


def fix_phrasing(text: str, source: str) -> Tuple[str, int, List[str]]:
    """source='codex' or 'claude'"""
    if source == "codex":
        primary = "Codex"
        missing = "Claude"
    else:
        primary = "Claude"
        missing = "Codex"

    n_changes = 0
    new_text = text

    # 規則 1：「（兩源皆未提供）」→「（本份僅 X 源，未提供此項資料）」
    pattern1 = re.compile(r"（兩源皆未提供）")
    new_text, c1 = pattern1.subn(f"（本份僅 {primary} 源，未提供此項資料）", new_text)
    n_changes += c1

    # 規則 2：「兩源答案 PDF 為空，未提供作答」→「X 源答案 PDF 為空（本份無 Y 源），未提供作答」
    pattern2 = re.compile(r"兩源答案\s*PDF\s*為空，未提供作答")
    new_text, c2 = pattern2.subn(f"{primary} 源答案 PDF 為空（本份無 {missing} 源），未提供作答", new_text)
    n_changes += c2

    # 規則 3：「兩源答案 PDF 為試題副本」→「X 源答案 PDF 為試題副本（本份無 Y 源）」
    pattern3 = re.compile(r"兩源答案\s*PDF\s*為試題副本")
    new_text, c3 = pattern3.subn(f"{primary} 源答案 PDF 為試題副本（本份無 {missing} 源）", new_text)
    n_changes += c3

    # 規則 4：「兩源試卷」→「X 源試卷」(很少見，但可能)
    pattern4 = re.compile(r"兩源試卷")
    new_text, c4 = pattern4.subn(f"{primary} 源試卷", new_text)
    n_changes += c4

    # 規則 5：通用 fallback「兩源XX」→「X 源XX」（保守起見只在 paragraph 內 replace 剩下的）
    # 規則 5 風險高，先 detect 留 manual review
    remaining = re.findall(r"[^\n。]*兩源[^\n。]*", new_text)
    return new_text, n_changes, remaining


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--combo", required=True)
    p.add_argument("--dry-run", action="store_true")
    args = p.parse_args()

    combo = args.combo
    sem = combo.split("_")[0]
    int_dir = ROOT / f"knowledge/3_考古題/2_MD淬鍊文字_整合版/{sem}/{combo}"
    if not int_dir.exists():
        print(f"❌ 目錄不存在：{int_dir}", file=sys.stderr)
        sys.exit(1)

    total_changes = 0
    files_modified = 0
    manual_review = []

    for f in sorted(int_dir.glob("*.md")):
        if f.name.startswith("_"):
            continue
        text = f.read_text(encoding="utf-8")
        fm = load_frontmatter(text)
        flags = fm.get("quality_flags", []) or []
        source = detect_source(flags)
        if source is None:
            continue  # dual 或無 flags，跳過

        new_text, n_changes, remaining = fix_phrasing(text, source)
        if n_changes > 0 and not args.dry_run:
            f.write_text(new_text, encoding="utf-8")
            files_modified += 1
            total_changes += n_changes
        elif n_changes > 0:
            files_modified += 1
            total_changes += n_changes
        if remaining:
            manual_review.append((f.name, source, remaining))

    print(f"=== JOB-226 Phase 5c：單源檔字眼修補 ===")
    print(f"combo: {combo}")
    print(f"模式: {'DRY RUN' if args.dry_run else '實際寫檔'}")
    print(f"已修改檔案: {files_modified}")
    print(f"總替換次數: {total_changes}")
    print()
    if manual_review:
        print(f"⚠️  以下 {len(manual_review)} 份仍有「兩源」字眼需人工檢查：")
        for fn, src, rem in manual_review:
            print(f"  {fn} (source={src})")
            for r in rem[:3]:
                print(f"    → {r.strip()[:120]}")
    else:
        print("✅ 所有單源檔「兩源」字眼已清理")


if __name__ == "__main__":
    main()
