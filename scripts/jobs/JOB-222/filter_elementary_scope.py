#!/usr/bin/env python3
"""JOB-222 Phase B：過濾國小階段相關資源 → manifest_draft.json

排除規則（純高中/國中起、不適用國小）：
  - group_title in {'科技領域', '全民國防教育', '高中進修部課程實施規範'}
  - 「第二外國語文」獨立檔（檔名含「第二外國語文」且不含「英語文」）

保留規則：
  - 國小核心五科（國語文、英語文、數學、自然科學、社會）
  - 總綱（含修正令）
  - 國小相關（健體、生活、綜合、藝術、本土語文、新住民）
  - 課程手冊（同上規則）
  - 議題融入說明手冊
"""
import json
import re
from pathlib import Path

EXCLUDE_GROUPS = {"科技領域", "全民國防教育", "高中進修部課程實施規範"}

CORE_5_GROUPS = {
    "語文領域-國語文",
    "語文領域-英語文、第二外國語文",
    "數學領域",
    "自然科學領域",
    "社會領域",
}
ELEMENTARY_RELATED = {
    "健康與體育領域",
    "生活課程",
    "綜合活動領域",
    "藝術領域",
    "語文領域-本土語文(閩南語文)",
    "語文領域-本土語文(客語文)",
    "語文領域-本土語文(原住民族語文)",
    "語文領域-本土語文(閩東語文)",
    "語文領域-臺灣手語",
    "語文領域-新住民語文",
    "議題融入說明手冊",
}

# 五科對應子目錄（核心五科）
SUBJECT_DIR = {
    "語文領域-國語文": "國語文",
    "語文領域-英語文、第二外國語文": "英語文",
    "數學領域": "數學",
    "自然科學領域": "自然科學",
    "社會領域": "社會",
}


def classify(group_title: str, filename: str) -> str:
    """判斷分組類別：核心五科 / 總綱 / 國小相關補充 / 排除"""
    if group_title in EXCLUDE_GROUPS:
        return "exclude"
    # 第二外國語文獨立檔（國中起）
    if "第二外國語文" in filename and "英語文" not in filename:
        return "exclude_2nd_foreign"
    if group_title == "總綱":
        return "general"
    if group_title in CORE_5_GROUPS:
        return "core5"
    if group_title in ELEMENTARY_RELATED:
        return "elementary_related"
    return "unknown"


def target_subdir(category: str, group_title: str) -> str:
    if category == "general":
        return "總綱"
    if category == "core5":
        return SUBJECT_DIR[group_title]
    if category == "elementary_related":
        return "補充文件"
    return "其他"


def main():
    src = Path(__file__).parent / "files_index_grouped.json"
    rows = json.loads(src.read_text(encoding="utf-8"))

    keep, drop = [], []
    for r in rows:
        cat = classify(r["group_title"], r["filename"])
        r2 = dict(r)
        r2["category"] = cat
        if cat.startswith("exclude"):
            drop.append(r2)
        else:
            r2["target_subdir"] = target_subdir(cat, r["group_title"])
            keep.append(r2)

    out_keep = Path(__file__).parent / "manifest_draft.json"
    out_drop = Path(__file__).parent / "filter_excluded.json"
    out_keep.write_text(json.dumps(keep, ensure_ascii=False, indent=2), encoding="utf-8")
    out_drop.write_text(json.dumps(drop, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"原始：{len(rows)} 筆")
    print(f"保留：{len(keep)} 筆 → {out_keep.name}")
    print(f"排除：{len(drop)} 筆 → {out_drop.name}")
    print()
    print("=== 保留 — 按 category × target_subdir 統計 ===")
    by_cat = {}
    for r in keep:
        key = f"{r['category']} / {r['target_subdir']} / tab={r['tab']}"
        by_cat.setdefault(key, []).append(r)
    for key in sorted(by_cat.keys()):
        print(f"  [{len(by_cat[key]):2d}] {key}")
    print()
    print("=== 排除明細 ===")
    for r in drop:
        print(f"  - [{r['group_title']:25s}] {r['filename']}  (cat={r['category']})")


if __name__ == "__main__":
    main()
