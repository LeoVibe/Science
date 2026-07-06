#!/usr/bin/env python3
"""
JOB-226 Phase 1: 配對兩源 MD 檔案，產出 _pre_integration_pairing.json

用法：
  python3 scripts/JOB226_pair_combo.py --combo 三下_社會_南一
  python3 scripts/JOB226_pair_combo.py --combo 四下_自然_翰林 --semester 四下

輸出：
  knowledge/3_考古題/2_MD淬鍊文字_整合版/{學期}/{combo}/_pre_integration_pairing.json
"""
import argparse
import json
import re
import sys
from pathlib import Path
from datetime import datetime


SEMESTER_PATTERN = re.compile(r"^(三|四|五|六)下_")


def detect_semester(combo: str) -> str:
    m = SEMESTER_PATTERN.match(combo)
    if not m:
        raise ValueError(f"無法從 combo 推斷學期：{combo}")
    return m.group(1) + "下"


def read_md_chars(path: Path) -> int:
    if not path.exists():
        return 0
    try:
        text = path.read_text(encoding="utf-8")
        return len([c for c in text if not c.isspace()])
    except Exception:
        return 0


def has_frontmatter(path: Path) -> bool:
    """檢查 MD 是否帶 v2 spec frontmatter（YAML --- 開頭）。
    早期 raw 抽取 alias（無 frontmatter）應被過濾——這些檔案的內容已被
    後續 distill 過的短檔名版本涵蓋（同檔名差別只是有無 publisher/year/exam_type 欄位）。
    """
    if not path.exists():
        return False
    try:
        with path.open(encoding="utf-8") as f:
            first = f.read(4)
        return first.startswith("---\n") or first.startswith("---\r")
    except Exception:
        return False


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--combo", required=True)
    parser.add_argument("--semester", default=None)
    parser.add_argument("--root", default="knowledge/3_考古題")
    args = parser.parse_args()

    sem = args.semester or detect_semester(args.combo)
    root = Path(args.root)
    claude_dir = root / "2_MD淬鍊文字_Claude" / sem / args.combo
    codex_dir = root / "2_MD淬鍊文字_Codex" / sem / args.combo
    out_dir = root / "2_MD淬鍊文字_整合版" / sem / args.combo
    out_dir.mkdir(parents=True, exist_ok=True)

    if not claude_dir.exists() and not codex_dir.exists():
        print(f"❌ 兩源目錄皆不存在：{claude_dir}, {codex_dir}", file=sys.stderr)
        sys.exit(1)

    # 過濾無 frontmatter 的早期 raw alias（同學校/學年資料已被短檔名版涵蓋）
    skipped_raw = []
    def collect(d):
        if not d.exists(): return {}
        out = {}
        for p in d.glob("*.md"):
            if p.name.startswith("_"):
                continue
            if has_frontmatter(p):
                out[p.stem] = p
            else:
                skipped_raw.append(str(p))
        return out
    claude_files = collect(claude_dir)
    codex_files = collect(codex_dir)
    if skipped_raw:
        print(f"⚠️  過濾 {len(skipped_raw)} 份無 frontmatter 的 raw alias（早期抽取，已被短檔名版涵蓋）：")
        for p in skipped_raw[:5]:
            print(f"     - {p}")
        if len(skipped_raw) > 5:
            print(f"     ...（+{len(skipped_raw)-5} 份）")

    all_stems = sorted(set(claude_files) | set(codex_files))

    pairings = []
    for stem in all_stems:
        c_path = claude_files.get(stem)
        x_path = codex_files.get(stem)
        c_chars = read_md_chars(c_path) if c_path else 0
        x_chars = read_md_chars(x_path) if x_path else 0

        if c_chars > 0 and x_chars > 0:
            state = "dual"
        elif c_chars > 0:
            state = "claude_only"
        elif x_chars > 0:
            state = "codex_only"
        else:
            state = "both_empty"

        pairings.append({
            "exam_id": stem,
            "filename": stem + ".md",
            "state": state,
            "claude": {
                "exists": c_path is not None,
                "path": str(c_path) if c_path else None,
                "char_count": c_chars,
            },
            "codex": {
                "exists": x_path is not None,
                "path": str(x_path) if x_path else None,
                "char_count": x_chars,
            },
        })

    summary = {
        "combo": args.combo,
        "semester": sem,
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "total": len(pairings),
        "state_counts": {
            "dual": sum(1 for p in pairings if p["state"] == "dual"),
            "claude_only": sum(1 for p in pairings if p["state"] == "claude_only"),
            "codex_only": sum(1 for p in pairings if p["state"] == "codex_only"),
            "both_empty": sum(1 for p in pairings if p["state"] == "both_empty"),
        },
        "pairings": pairings,
        "skipped_raw_aliases": skipped_raw,
    }

    out_path = out_dir / "_pre_integration_pairing.json"
    out_path.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"✅ 配對完成：{args.combo}")
    print(f"   總計：{summary['total']} 份")
    for state, n in summary["state_counts"].items():
        print(f"   {state}: {n}")
    print(f"   寫入：{out_path}")


if __name__ == "__main__":
    main()
