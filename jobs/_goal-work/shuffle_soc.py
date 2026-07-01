#!/usr/bin/env python3
# 四下社會打散 driver：主檔題副本打散選項，產生 shuffled(含正解,供寫回) + blind(去答案,供盲測)
import json, random, os

random.seed(20260620)  # 可重現

VERS = [
    ("HanLin", "HANLIN", "G4_SOC_HanLin"),
    ("KangHsuan", "KANGHSUAN", "G4_SOC_KangHsuan"),
    ("NanYi", "NANYI", "G4_SOC_NanYi"),
]
BASE = "question/platform/G4/SocialStudies/S2"

def shuffle_q(q):
    opts = q["options"]
    ans = q["answer_index"]
    correct = opts[ans]
    idx = list(range(len(opts)))
    random.shuffle(idx)
    new_opts = [opts[i] for i in idx]
    new_ans = new_opts.index(correct)
    nq = dict(q)
    nq["options"] = new_opts
    nq["answer_index"] = new_ans
    return nq

for d, u, outdir in VERS:
    os.makedirs(f"jobs/_goal-work/{outdir}", exist_ok=True)
    for n in range(1, 7):
        f = f"{BASE}/{d}/G4_S2_SOC_{u}_L{n}.json"
        data = json.load(open(f))
        qs = data["questions"]
        shuffled = [shuffle_q(q) for q in qs]
        # shuffled: 完整題(含正解+打散) → 寫回用
        json.dump(shuffled, open(f"jobs/_goal-work/{outdir}/L{n}_shuffled.json", "w"),
                  ensure_ascii=False, indent=2)
        # blind: 去 answer_index/explanation，給盲測員（保留 idx 對位）
        blind = []
        for i, q in enumerate(shuffled):
            blind.append({
                "idx": i,
                "question": q.get("question"),
                "scenario": q.get("scenario", ""),
                "options": q["options"],
            })
        json.dump(blind, open(f"jobs/_goal-work/{outdir}/L{n}_blind.json", "w"),
                  ensure_ascii=False, indent=2)
        print(f"{outdir} L{n}: {len(qs)} 題 → shuffled+blind")

print("DONE")
