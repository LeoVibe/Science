#!/usr/bin/env python3
"""JOB-227 移檔執行：把 misclassified raw MD 移到 _misclassified/"""
import json
import shutil
from pathlib import Path

ROOT = Path("/Users/s389080/Documents/doc/work/0_AI_Project/eidosProject")
MIS_JSON = ROOT / "knowledge/3_考古題/_logs/JOB-227/misclassified.json"
DEST_BASE = ROOT / "knowledge/3_考古題/2_MD淬鍊文字_misclassified/三下_誤分類_上學期"

# 排除 false positive：國語_康軒 那 1 份檔名寫「下學期」不該移
SKIP_FILES = {
    "縣立伸東國小 三年級 108 下學期 語文領域 國語 第一次段考 期中考 康軒 答案.md",
}

def main():
    misclassified = json.loads(MIS_JSON.read_text(encoding="utf-8"))
    moved = []
    skipped = []

    for r in misclassified:
        if r["filename"] in SKIP_FILES:
            skipped.append(r)
            continue
        src = ROOT / r["path"]
        if not src.exists():
            skipped.append({**r, "skip_reason": "source not found"})
            continue
        dest_dir = DEST_BASE / r["source"] / r["combo"]
        dest_dir.mkdir(parents=True, exist_ok=True)
        dest = dest_dir / r["filename"]
        shutil.move(str(src), str(dest))
        moved.append({**r, "dest": str(dest.relative_to(ROOT))})

    out = ROOT / "knowledge/3_考古題/_logs/JOB-227/move_log.json"
    out.write_text(json.dumps({"moved": moved, "skipped": skipped}, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"=== 移檔完成 ===")
    print(f"moved: {len(moved)}")
    print(f"skipped: {len(skipped)}")
    print(f"備存區: {DEST_BASE.relative_to(ROOT)}")
    print(f"log: {out.relative_to(ROOT)}")

if __name__ == "__main__":
    main()
