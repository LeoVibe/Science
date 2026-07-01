#!/usr/bin/env python3
# 四下社會過閘計算：四閘 = 盲測答對 + single_answer + belongs(judge) + match(judge)
# 讀 shuffled(正解) + blind_result + judge_result，輸出 passIdx + _gaps
import json, os, glob

VERS = ["G4_SOC_HanLin", "G4_SOC_KangHsuan", "G4_SOC_NanYi"]
TARGET = 30  # 各課目標題數

def load(p):
    return json.load(open(p)) if os.path.exists(p) else None

def norm_blind(b):
    # 相容欄位：answer_index / answer ; single_answer / single
    out = {}
    arr = b.get("answers", b) if isinstance(b, dict) else b
    for r in arr:
        ai = r.get("answer_index", r.get("answer"))
        sa = r.get("single_answer", r.get("single", r.get("single_correct")))
        out[r["idx"]] = (ai, bool(sa))
    return out

def norm_judge(j):
    out = {}
    arr = j.get("judgments", j.get("results", j)) if isinstance(j, dict) else j
    for r in arr:
        belongs = r.get("belongs", r.get("belong"))
        match = r.get("match", r.get("matched"))
        # 相容 verdict 結構
        if match is None and "verdict" in r:
            match = (r["verdict"] in ("對應", "match", True))
        out[r["idx"]] = (bool(belongs), bool(match), r.get("kaodian", ""))
    return out

grand = {}
for d in VERS:
    gaps = {}
    for n in range(1, 7):
        base = f"jobs/_goal-work/{d}"
        shuffled = load(f"{base}/L{n}_shuffled.json")
        bl = load(f"{base}/L{n}_blind_result.json")
        ju = load(f"{base}/L{n}_judge_result.json")
        if shuffled is None or bl is None or ju is None:
            print(f"⚠️ {d} L{n}: 缺檔 shuffled={shuffled is not None} blind={bl is not None} judge={ju is not None}")
            continue
        B = norm_blind(bl)
        J = norm_judge(ju)
        passed = []
        fail_reason = {"wrong": 0, "multi": 0, "notbelong": 0, "nomatch": 0}
        for i, q in enumerate(shuffled):
            correct = q["answer_index"]
            ans, single = B.get(i, (None, False))
            belongs, match, _ = J.get(i, (False, False, ""))
            ok_ans = (ans == correct)
            if ok_ans and single and belongs and match:
                passed.append(i)
            else:
                if not ok_ans: fail_reason["wrong"] += 1
                elif not single: fail_reason["multi"] += 1
                elif not belongs: fail_reason["notbelong"] += 1
                elif not match: fail_reason["nomatch"] += 1
        json.dump(passed, open(f"{base}/L{n}_passIdx.json", "w"))
        gap = max(0, TARGET - len(passed))
        gaps[f"L{n}"] = {"pass": len(passed), "total": len(shuffled), "gap": gap, "fail": fail_reason}
        print(f"{d} L{n}: 過閘 {len(passed)}/{len(shuffled)} 缺{gap} | 落閘 答錯{fail_reason['wrong']}/多解{fail_reason['multi']}/不屬{fail_reason['notbelong']}/跑題{fail_reason['nomatch']}")
    json.dump(gaps, open(f"jobs/_goal-work/{d}/_gaps.json", "w"), ensure_ascii=False, indent=2)
    tp = sum(g["pass"] for g in gaps.values())
    tg = sum(g["gap"] for g in gaps.values())
    grand[d] = {"pass": tp, "gap": tg}
    print(f"  === {d}: 過閘 {tp} 缺 {tg} ===\n")

print("總計:", json.dumps(grand, ensure_ascii=False))
