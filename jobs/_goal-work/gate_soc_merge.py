#!/usr/bin/env python3
# 合併校正重判→重算四下社會真實過閘/缺額
import json, os

VERS = ["G4_SOC_HanLin", "G4_SOC_KangHsuan", "G4_SOC_NanYi"]
TARGET = 30

def load(p): return json.load(open(p)) if os.path.exists(p) else None

def norm_blind(b):
    arr = b.get("answers", b) if isinstance(b, dict) else b
    return {r["idx"]: (r.get("answer_index", r.get("answer")), bool(r.get("single_answer", r.get("single")))) for r in arr}

def norm_judge(j):
    arr = j.get("judgments", j) if isinstance(j, dict) else j
    out = {}
    for r in arr:
        out[r["idx"]] = (bool(r.get("belongs")), bool(r.get("match")))
    return out

# 載入重判覆寫表 {key: {idx:(belongs,match)}}
rj = json.load(open("jobs/_goal-work/soc_rejudge_result.json"))
override = {}
for L in rj:
    override[L["key"]] = {j["idx"]: (bool(j["belongs"]), bool(j["match"])) for j in (L.get("judgments") or [])}

grand = {}
for d in VERS:
    gaps = {}
    for n in range(1, 7):
        base = f"jobs/_goal-work/{d}"
        shuffled = load(f"{base}/L{n}_shuffled.json")
        B = norm_blind(load(f"{base}/L{n}_blind_result.json"))
        J = norm_judge(load(f"{base}/L{n}_judge_result.json"))
        ov = override.get(f"{d}_L{n}", {})
        passed = []
        for i, q in enumerate(shuffled):
            ans, single = B.get(i, (None, False))
            belongs, match = J.get(i, (False, False))
            if i in ov:  # 重判覆寫
                belongs, match = ov[i]
            if (ans == q["answer_index"]) and single and belongs and match:
                passed.append(i)
        json.dump(passed, open(f"{base}/L{n}_passIdx.json", "w"))
        gap = max(0, TARGET - len(passed))
        gaps[f"L{n}"] = {"pass": len(passed), "total": len(shuffled), "gap": gap}
        mark = " ✅滿30" if len(passed) >= TARGET else ""
        print(f"{d} L{n}: 過閘 {len(passed)}/{len(shuffled)} 缺{gap}{mark}")
    json.dump(gaps, open(f"{base}/_gaps.json", "w"), ensure_ascii=False, indent=2)
    tp = sum(g["pass"] for g in gaps.values()); tg = sum(g["gap"] for g in gaps.values())
    grand[d] = {"pass": tp, "gap": tg}
    print(f"  === {d}: 過閘 {tp} 缺 {tg} ===\n")
print("總計:", json.dumps(grand, ensure_ascii=False))
