#!/usr/bin/env python3
"""
JOB-226 Phase 4: 為 combo 產出 _index.json

聚合該 combo 內所有整合版 MD 的 frontmatter metadata，並統計 quality_flag 分布。

用法:
  python3 scripts/JOB226_build_combo_index.py --combo 三下_社會_南一
"""
import argparse
import json
import re
import sys
from collections import Counter
from datetime import datetime
from pathlib import Path

try:
    import yaml
except ImportError:
    print("❌ 缺少 PyYAML。請執行：pip3 install pyyaml", file=sys.stderr)
    sys.exit(1)


SEMESTER_PATTERN = re.compile(r"^(三|四|五|六)下_")
FRONTMATTER_PATTERN = re.compile(r"^---\n(.*?)\n---\n", re.DOTALL)


def detect_semester(combo: str) -> str:
    m = SEMESTER_PATTERN.match(combo)
    if not m:
        raise ValueError(f"無法從 combo 推斷學期：{combo}")
    return m.group(1) + "下"


def parse_fm(path):
    text = path.read_text(encoding="utf-8")
    m = FRONTMATTER_PATTERN.match(text)
    if not m:
        return None
    try:
        return yaml.safe_load(m.group(1))
    except yaml.YAMLError:
        return None


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--combo", required=True)
    parser.add_argument("--semester", default=None)
    parser.add_argument("--root", default="knowledge/3_考古題")
    args = parser.parse_args()

    sem = args.semester or detect_semester(args.combo)
    root = Path(args.root)
    integrated_dir = root / "2_MD淬鍊文字_整合版" / sem / args.combo

    if not integrated_dir.exists():
        print(f"❌ 整合版目錄不存在：{integrated_dir}", file=sys.stderr)
        sys.exit(1)

    files = sorted([p for p in integrated_dir.glob("*.md") if not p.name.startswith("_")])

    flag_counter = Counter()
    school_counter = Counter()
    year_counter = Counter()
    exam_type_counter = Counter()
    publisher_counter = Counter()
    file_entries = []
    total_chars = 0

    for fp in files:
        fm = parse_fm(fp)
        if fm is None:
            file_entries.append({"filename": fp.name, "error": "frontmatter parse failed"})
            continue
        flags = fm.get("quality_flags") or []
        for f in flags:
            flag_counter[f] += 1
        school = fm.get("source_school")
        if school:
            school_counter[str(school)] += 1
        year = fm.get("academic_year")
        if year is not None:
            year_counter[str(year)] += 1
        et = fm.get("exam_type")
        if et:
            exam_type_counter[str(et)] += 1
        pub = fm.get("publisher")
        if pub:
            publisher_counter[str(pub)] += 1
        total_chars += fm.get("char_count", 0) or 0
        topic_hits = fm.get("topic_hits") or {}
        file_entries.append({
            "filename": fp.name,
            "exam_id": fm.get("exam_id"),
            "school": str(school) if school else None,
            "year": str(year) if year is not None else None,
            "exam_type": str(et) if et else None,
            "publisher": str(pub) if pub else None,
            "char_count": fm.get("char_count"),
            "quality_flags": flags,
            "topic_hits_count": sum(topic_hits.values()) if isinstance(topic_hits, dict) else 0,
        })

    index = {
        "path": str(integrated_dir),
        "combo": args.combo,
        "semester": sem,
        "last_updated": datetime.now().isoformat(timespec="seconds"),
        "total_md": len(files),
        "total_char_count": total_chars,
        "schools": sorted(school_counter.keys()),
        "years": sorted(year_counter.keys()),
        "exam_types": sorted(exam_type_counter.keys()),
        "publishers": sorted(publisher_counter.keys()),
        "quality_flag_counts": dict(flag_counter),
        "files": file_entries,
    }

    out_path = integrated_dir / "_index.json"
    out_path.write_text(json.dumps(index, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"✅ _index.json 產出：{out_path}")
    print(f"   total_md: {index['total_md']}")
    print(f"   total_char_count: {index['total_char_count']:,}")
    print(f"   學校: {len(index['schools'])} | 年度: {len(index['years'])} | 出版社: {index['publishers']}")
    print(f"   quality_flag 分布:")
    for f, c in sorted(flag_counter.items(), key=lambda kv: -kv[1]):
        print(f"      {f}: {c}")


if __name__ == "__main__":
    main()
