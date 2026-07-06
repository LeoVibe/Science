#!/usr/bin/env python3
"""JOB-227 follow-up：擴展 audit + move 到四/五/六下"""
import re
import json
import shutil
from pathlib import Path
from collections import defaultdict

ROOT = Path("/Users/s389080/Documents/doc/work/0_AI_Project/eidosProject")
RAW_DIRS = [
    ROOT / "knowledge/3_考古題/2_MD淬鍊文字_Claude",
    ROOT / "knowledge/3_考古題/2_MD淬鍊文字_Codex",
]
DEST_BASE = ROOT / "knowledge/3_考古題/2_MD淬鍊文字_misclassified"

UP_PATS = [
    r"上\s*學\s*期", r"第\s*一\s*學\s*期", r"學年度[（(]\s*上\s*[）)]", r"學年度\s*上",
    r"10[89][-\s]*上", r"11[0123][-\s]*上",
]
DOWN_PATS = [
    r"下\s*學\s*期", r"第\s*二\s*學\s*期", r"學年度[（(]\s*下\s*[）)]", r"學年度\s*下",
    r"11[123][-\s]*下", r"10[89][-\s]*下",
]
UP = re.compile("|".join(UP_PATS))
DOWN = re.compile("|".join(DOWN_PATS))

# 三下已 JOB-227 處理，本次只做四/五/六下
TARGETS = ["四下", "五下", "六下"]

# false positive 排除（檔名標下學期但內容引「第一學期」當參照）
FP_FILE_PATTERNS = [
    re.compile(r"下學期.+?第一段考"),  # 檔名直接帶下學期
]


def is_false_positive(filename: str) -> bool:
    for p in FP_FILE_PATTERNS:
        if p.search(filename):
            return True
    # 檔名直接帶「下學期」字串應視為 fp
    if "下學期" in filename:
        return True
    return False


def main():
    moved = []
    skipped_fp = []
    by_combo = defaultdict(int)

    for raw_dir in RAW_DIRS:
        source = raw_dir.name.replace("2_MD淬鍊文字_", "")
        for sem in TARGETS:
            sem_dir = raw_dir / sem
            if not sem_dir.exists():
                continue
            for combo_dir in sorted(sem_dir.iterdir()):
                if not combo_dir.is_dir():
                    continue
                combo = combo_dir.name
                for md in sorted(combo_dir.glob("*.md")):
                    try:
                        text = md.read_text(encoding="utf-8")[:3000]
                    except Exception:
                        continue
                    up_h = bool(UP.search(text))
                    down_h = bool(DOWN.search(text))
                    if not (up_h and not down_h):
                        continue  # 只處理「上學期 markers but no 下學期」
                    if is_false_positive(md.name):
                        skipped_fp.append({"sem": sem, "combo": combo, "source": source, "filename": md.name})
                        continue

                    # 移檔
                    dest_dir = DEST_BASE / f"{sem}_誤分類_上學期" / source / combo
                    dest_dir.mkdir(parents=True, exist_ok=True)
                    dest = dest_dir / md.name
                    shutil.move(str(md), str(dest))
                    moved.append({
                        "sem": sem, "combo": combo, "source": source,
                        "filename": md.name,
                        "dest": str(dest.relative_to(ROOT))
                    })
                    by_combo[f"{source}/{sem}/{combo}"] += 1

    out = ROOT / "knowledge/3_考古題/_logs/JOB-227/move_log_四五六下.json"
    out.write_text(json.dumps({"moved": moved, "skipped_fp": skipped_fp}, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"=== 四/五/六下 misclassified 移檔完成 ===")
    print(f"moved: {len(moved)}")
    print(f"skipped_fp: {len(skipped_fp)}")
    print()
    print("by combo:")
    for k, v in sorted(by_combo.items(), key=lambda x: -x[1]):
        print(f"  {k}: {v}")
    print()
    print(f"備存區: {DEST_BASE.relative_to(ROOT)}/{{四下/五下/六下}}_誤分類_上學期/")
    print(f"log: {out.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
