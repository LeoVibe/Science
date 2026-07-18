#!/usr/bin/env python3
"""JOB-277 盲測計分：answers/<name>.answers.json（盲測 agent 產出）vs blind/<name>.key.json。
官方判準：Match = selected_index === correct_shuffled_index；每課 Match Rate ≥85% 通過。"""
import json, os, glob

BASE = "jobs/_goal-work/JOB277"
overall_ok, overall_n = 0, 0
for kf in sorted(glob.glob(f"{BASE}/blind/*.key.json")):
    name = os.path.basename(kf).replace(".key.json", "")
    af = f"{BASE}/answers/{name}.answers.json"
    if not os.path.exists(af):
        print(f"MISSING answers: {name}")
        continue
    key = {k["qid"]: k for k in json.load(open(kf))["items"]}
    answers = json.load(open(af))
    if isinstance(answers, dict):
        answers = answers.get("answers", [])
    ok, mismatches = 0, []
    for a in answers:
        qid = a["qid"]
        if a["selected_index"] == key[qid]["correct_shuffled_index"]:
            ok += 1
        else:
            mismatches.append(qid)
    n = len(key)
    rate = ok / n * 100 if n else 0
    flag = "PASS" if rate >= 85 else "FAIL"
    print(f"{flag} {name}: {ok}/{n} = {rate:.1f}%  mismatch qids={mismatches}")
    overall_ok += ok
    overall_n += n
print(f"總計: {overall_ok}/{overall_n} = {overall_ok/overall_n*100:.1f}%" if overall_n else "無資料")
