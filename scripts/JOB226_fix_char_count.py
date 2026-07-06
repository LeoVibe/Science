#!/usr/bin/env python3
"""
JOB-226 char_count 補算腳本（純機械操作）
Phase 5b 預處理：codex 常把 char_count 寫成 0 或不準，本腳本一次性實算覆寫。

用法：
  python3 scripts/JOB226_fix_char_count.py --combo 三下_社會_翰林
  python3 scripts/JOB226_fix_char_count.py --combo 三下_社會_翰林 --dry-run
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

SEMESTER_PATTERN = re.compile(r"^(三|四|五|六)下_")
FRONTMATTER_RE = re.compile(r"^(---\n)(.*?)(\n---\n)(.*)$", re.DOTALL)
CHARCOUNT_RE = re.compile(r"^char_count:\s*\d+\s*$", re.MULTILINE)


def detect_semester(combo: str) -> str:
    m = SEMESTER_PATTERN.match(combo)
    if not m:
        raise ValueError(f"無法推學期：{combo}")
    return m.group(1) + "下"


def actual_char_count(body: str) -> int:
    return len([c for c in body if not c.isspace()])


def fix_one(path: Path, dry_run: bool) -> tuple[bool, str]:
    text = path.read_text(encoding="utf-8")
    m = FRONTMATTER_RE.match(text)
    if not m:
        return False, "no_frontmatter"
    fm_open, fm_yaml, fm_close, body = m.groups()
    actual = actual_char_count(body)
    declared_match = CHARCOUNT_RE.search(fm_yaml)
    if declared_match:
        declared = int(declared_match.group().split(":")[1].strip())
        if declared == actual:
            return False, f"already_correct ({actual})"
        new_yaml = CHARCOUNT_RE.sub(f"char_count: {actual}", fm_yaml)
    else:
        new_yaml = fm_yaml.rstrip() + f"\nchar_count: {actual}"
        declared = None
    if dry_run:
        return True, f"would_fix declared={declared} → {actual}"
    new_text = fm_open + new_yaml + fm_close + body
    path.write_text(new_text, encoding="utf-8")
    return True, f"fixed declared={declared} → {actual}"


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--combo", required=True)
    p.add_argument("--semester", default=None)
    p.add_argument("--root", default="knowledge/3_考古題")
    p.add_argument("--dry-run", action="store_true")
    args = p.parse_args()

    sem = args.semester or detect_semester(args.combo)
    target = Path(args.root) / "2_MD淬鍊文字_整合版" / sem / args.combo
    if not target.exists():
        print(f"❌ 缺目錄：{target}", file=sys.stderr); sys.exit(1)

    files = sorted(p for p in target.glob("*.md") if not p.name.startswith("_"))
    fixed = 0; skipped = 0; failed = 0
    for fp in files:
        ok, msg = fix_one(fp, args.dry_run)
        if ok:
            fixed += 1; print(f"  ✏️  {fp.name} — {msg}")
        elif msg.startswith("already"):
            skipped += 1
        else:
            failed += 1; print(f"  ❌ {fp.name} — {msg}")
    print(f"\n=== {args.combo} ===")
    print(f"修補：{fixed}，已正確：{skipped}，異常：{failed}，總：{len(files)}")
    print("（dry-run，未寫檔）" if args.dry_run else "（已寫檔）")


if __name__ == "__main__":
    main()
