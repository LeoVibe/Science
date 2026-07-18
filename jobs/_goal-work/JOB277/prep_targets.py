#!/usr/bin/env python3
"""JOB-277 準備階段（唯讀）：找出 12 課中「正解嚴格唯一最長」的題目，輸出重鑄目標清單。
不寫回任何題庫檔案。輸出至 jobs/_goal-work/JOB277/targets/<檔名>.targets.json"""
import json, os

FILES = [
    "question/platform/G4/Science/S2/HanLin/G4_S2_SCI_HANLIN_L1.json",
    "question/platform/G4/Science/S2/HanLin/G4_S2_SCI_HANLIN_L3.json",
    "question/platform/G4/Science/S2/KangHsuan/G4_S2_SCI_KANGHSUAN_L1.json",
    "question/platform/G4/Science/S2/KangHsuan/G4_S2_SCI_KANGHSUAN_L2.json",
    "question/platform/G4/Science/S2/NanYi/G4_S2_SCI_NANYI_L1.json",
    "question/platform/G4/Science/S2/NanYi/G4_S2_SCI_NANYI_L2.json",
    "question/platform/G4/Science/S2/NanYi/G4_S2_SCI_NANYI_L3.json",
    "question/platform/G4/Science/S2/NanYi/G4_S2_SCI_NANYI_L4.json",
    "question/platform/G4/Chinese/S2/HanLin/G4_S2_CHI_HANLIN_L7.json",
    "question/platform/G4/Chinese/S2/HanLin/G4_S2_CHI_HANLIN_L11.json",
    "question/platform/G4/Chinese/S2/HanLin/G4_S2_CHI_HANLIN_L12.json",
    "question/platform/G4/Chinese/S2/NanYi/G4_S2_CHI_NANYI_L10.json",
]
OUT = "jobs/_goal-work/JOB277/targets"
os.makedirs(OUT, exist_ok=True)
total = 0
for path in FILES:
    d = json.load(open(path))
    targets = []
    for i, q in enumerate(d["questions"]):
        opts = q["options"]
        ai = q["answer_index"]
        clen = len(opts[ai])
        others = [len(o) for j, o in enumerate(opts) if j != ai]
        if all(clen > l for l in others):
            targets.append({
                "index": i,
                "question": q.get("question"),
                "scenario": q.get("scenario"),
                "options": opts,
                "answer_index": ai,
                "explanation": q.get("explanation"),
                "lens": [len(o) for o in opts],
            })
    name = os.path.basename(path).replace(".json", "")
    out = {"source_file": path, "title": d["meta"].get("title"), "n_questions": len(d["questions"]),
           "n_targets": len(targets), "bias_pct": round(len(targets) / len(d["questions"]) * 100, 1),
           "targets": targets}
    json.dump(out, open(f"{OUT}/{name}.targets.json", "w"), ensure_ascii=False, indent=2)
    total += len(targets)
    print(f"{name}: {len(targets)}/{len(d['questions'])} ({out['bias_pct']}%) 《{out['title']}》")
print(f"總重鑄目標: {total} 題")
