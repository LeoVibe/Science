#!/usr/bin/env python3
"""JOB-227 移整合版上學期檔到 misclassified 備存區"""
import re
import shutil
from pathlib import Path

ROOT = Path("/Users/s389080/Documents/doc/work/0_AI_Project/eidosProject")
DEST_BASE = ROOT / "knowledge/3_考古題/2_MD淬鍊文字_misclassified/三下_誤分類_上學期/Integrated"

UP = re.compile(r"上\s*學\s*期|第\s*一\s*學\s*期|學年度[（(]\s*上\s*[）)]|10[89][-\s]*上|11[0123][-\s]*上")
DOWN = re.compile(r"下\s*學\s*期|第\s*二\s*學\s*期|學年度[（(]\s*下\s*[）)]|11[123][-\s]*下")

moved = []
for combo in ["三下_英語_何嘉仁", "三下_英語_康軒", "三下_國語_康軒"]:
    int_dir = ROOT / f"knowledge/3_考古題/2_MD淬鍊文字_整合版/三下/{combo}"
    if not int_dir.exists():
        continue
    dest = DEST_BASE / combo
    dest.mkdir(parents=True, exist_ok=True)
    for f in sorted(int_dir.glob("*.md")):
        if f.name.startswith("_"):
            continue
        try:
            text = f.read_text(encoding="utf-8")[:5000]
        except Exception:
            continue
        if UP.search(text) and not DOWN.search(text):
            new = dest / f.name
            shutil.move(str(f), str(new))
            moved.append({"combo": combo, "filename": f.name, "dest": str(new.relative_to(ROOT))})

print(f"=== 整合版移檔 ===")
print(f"moved: {len(moved)}")
for r in moved[:5]:
    print(f"  {r['combo']}/{r['filename']}")
if len(moved) > 5:
    print(f"  ...")

import json
out = ROOT / "knowledge/3_考古題/_logs/JOB-227/integrated_move_log.json"
out.write_text(json.dumps(moved, indent=2, ensure_ascii=False), encoding="utf-8")
print(f"log: {out.relative_to(ROOT)}")
