#!/usr/bin/env python3
"""JOB-227 raw MD 學期分類稽核
找出 raw MD 標題 / 正文學期 markers 與所在 combo 學期不一致的檔。
聚焦三下（claude raw + codex raw 共 1054 份）。
"""
import os
import re
import json
from pathlib import Path
from collections import defaultdict

ROOT = Path("/Users/s389080/Documents/doc/work/0_AI_Project/eidosProject")
RAW_DIRS = [
    ROOT / "knowledge/3_考古題/2_MD淬鍊文字_Claude",
    ROOT / "knowledge/3_考古題/2_MD淬鍊文字_Codex",
]

# 學期 markers — 找到「上」就標 上學期，「下」就標 下學期
SEM_MARKERS = {
    "下": [
        r"下\s*學\s*期",
        r"第\s*二\s*學\s*期",
        r"學年度[（(]\s*下\s*[）)]",
        r"學年度\s*下",
        r"112[-\s]*下",
        r"113[-\s]*下",
        r"108[-\s]*下",
        r"109[-\s]*下",
        r"110[-\s]*下",
        r"111[-\s]*下",
    ],
    "上": [
        r"上\s*學\s*期",
        r"第\s*一\s*學\s*期",
        r"學年度[（(]\s*上\s*[）)]",
        r"學年度\s*上",
        r"112[-\s]*上",
        r"113[-\s]*上",
        r"108[-\s]*上",
        r"109[-\s]*上",
        r"110[-\s]*上",
        r"111[-\s]*上",
    ],
}

def detect_semester(text: str) -> tuple[str, list[str]]:
    """回傳（推斷學期 'down'/'up'/'unknown'，命中 markers 列表）"""
    head = text[:3000]
    up_hits, down_hits = [], []
    for pat in SEM_MARKERS["下"]:
        if re.search(pat, head):
            down_hits.append(pat)
    for pat in SEM_MARKERS["上"]:
        if re.search(pat, head):
            up_hits.append(pat)

    if down_hits and not up_hits:
        return "down", down_hits
    if up_hits and not down_hits:
        return "up", up_hits
    if down_hits and up_hits:
        return "ambiguous", down_hits + up_hits
    return "unknown", []


def expected_semester_from_combo(combo: str) -> str:
    """combo 名稱 推 expected 學期"""
    if combo.startswith("三下_") or combo.startswith("四下_") or combo.startswith("五下_") or combo.startswith("六下_"):
        return "down"
    return "unknown"


def main():
    misclassified = []
    ambiguous = []
    unknown = []
    ok = []

    for raw_dir in RAW_DIRS:
        source = raw_dir.name.replace("2_MD淬鍊文字_", "")
        # 三下 only
        sem_dir = raw_dir / "三下"
        if not sem_dir.exists():
            continue
        for combo_dir in sorted(sem_dir.iterdir()):
            if not combo_dir.is_dir():
                continue
            combo = combo_dir.name
            expected = expected_semester_from_combo(combo)
            for md in sorted(combo_dir.glob("*.md")):
                try:
                    text = md.read_text(encoding="utf-8")
                except Exception:
                    continue
                actual, hits = detect_semester(text)
                rec = {
                    "source": source,
                    "combo": combo,
                    "filename": md.name,
                    "path": str(md.relative_to(ROOT)),
                    "expected": expected,
                    "actual": actual,
                    "hits": hits[:5],
                }
                if actual == "unknown":
                    unknown.append(rec)
                elif actual == "ambiguous":
                    ambiguous.append(rec)
                elif actual != expected:
                    misclassified.append(rec)
                else:
                    ok.append(rec)

    # 分組統計
    by_combo_mis = defaultdict(list)
    for r in misclassified:
        by_combo_mis[f"{r['source']}/{r['combo']}"].append(r["filename"])

    summary = {
        "total": len(ok) + len(misclassified) + len(ambiguous) + len(unknown),
        "ok": len(ok),
        "misclassified": len(misclassified),
        "ambiguous": len(ambiguous),
        "unknown": len(unknown),
        "misclassified_by_combo": {k: len(v) for k, v in by_combo_mis.items()},
        "ambiguous_by_combo": {},
        "unknown_by_combo": {},
    }
    for r in ambiguous:
        key = f"{r['source']}/{r['combo']}"
        summary["ambiguous_by_combo"][key] = summary["ambiguous_by_combo"].get(key, 0) + 1
    for r in unknown:
        key = f"{r['source']}/{r['combo']}"
        summary["unknown_by_combo"][key] = summary["unknown_by_combo"].get(key, 0) + 1

    out_dir = ROOT / "knowledge/3_考古題/_logs/JOB-227"
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "audit_summary.json").write_text(
        json.dumps(summary, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    (out_dir / "misclassified.json").write_text(
        json.dumps(misclassified, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    (out_dir / "ambiguous.json").write_text(
        json.dumps(ambiguous, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    (out_dir / "unknown.json").write_text(
        json.dumps(unknown, indent=2, ensure_ascii=False), encoding="utf-8"
    )

    # 印 summary
    print(f"=== JOB-227 三下 raw 稽核結果 ===")
    print(f"總檔數: {summary['total']}")
    print(f"  ok（學期一致）: {summary['ok']}")
    print(f"  misclassified（學期不一致）: {summary['misclassified']}")
    print(f"  ambiguous（同檔同時有上下學期 markers）: {summary['ambiguous']}")
    print(f"  unknown（找不到學期 marker）: {summary['unknown']}")
    print()
    print("misclassified by combo:")
    for k, v in sorted(summary["misclassified_by_combo"].items(), key=lambda x: -x[1]):
        print(f"  {k}: {v}")
    print()
    print("輸出:")
    print(f"  {out_dir}/audit_summary.json")
    print(f"  {out_dir}/misclassified.json")
    print(f"  {out_dir}/ambiguous.json")
    print(f"  {out_dir}/unknown.json")


if __name__ == "__main__":
    main()
