#!/usr/bin/env python3
"""JOB-277 欄位更新：對 12 檔中被重鑄/修正的題目更新 review 追溯欄位。
只動 reviewer/review_date/review_notes/verifying_model/verifying_date，不動其他欄位。"""
import json, glob, os

DATE = "2026-07-18"
MODEL = "claude-fable-5"
FIXED = {  # 補題修正的題目（覆蓋重鑄註記）
    "G4_S2_CHI_HANLIN_L11": {27},
    "G4_S2_CHI_HANLIN_L12": {10, 17, 23},
}
updated_total = 0
for tf in sorted(glob.glob("jobs/_goal-work/JOB277/recast/*.recast.json")):
    name = os.path.basename(tf).replace(".recast.json", "")
    rc = json.load(open(tf))
    qids = {r["index"] for r in rc}
    src = json.load(open(f"jobs/_goal-work/JOB277/targets/{name}.targets.json"))["source_file"]
    d = json.load(open(src))
    n = 0
    for i in qids:
        q = d["questions"][i]
        if i in FIXED.get(name, set()):
            note = "JOB-277 補題修正（依課文情節重寫），雙盲Match"
        else:
            note = "JOB-277 BIAS重鑄（誘答加長），雙盲Match"
        old = q.get("review_notes") or ""
        q["review_notes"] = (old + "；" + note) if old else note
        q["reviewer"] = "JOB-277"
        q["review_date"] = DATE
        q["verifying_model"] = MODEL
        q["verifying_date"] = DATE
        n += 1
    json.dump(d, open(src, "w"), ensure_ascii=False, indent=2)
    updated_total += n
    print(f"{name}: 更新 {n} 題 review 欄位")
print(f"總計更新 {updated_total} 題")
