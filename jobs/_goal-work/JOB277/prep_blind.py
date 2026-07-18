#!/usr/bin/env python3
"""JOB-277 盲測準備（唯讀來源檔）：從重鑄後的題庫檔抽出被重鑄的題目，
選項順序以固定 seed 洗牌，產出：
  blind/<name>.blind.json  — 給盲測 agent（無答案）
  blind/<name>.key.json    — 對答用（含洗牌對映與正解）"""
import json, os, random, glob

BASE = "jobs/_goal-work/JOB277"
random.seed(277)

for tf in sorted(glob.glob(f"{BASE}/targets/*.targets.json")):
    t = json.load(open(tf))
    name = os.path.basename(tf).replace(".targets.json", "")
    rc_path = f"{BASE}/recast/{name}.recast.json"
    if not os.path.exists(rc_path):
        print(f"SKIP {name}: 無 recast 紀錄")
        continue
    rc = json.load(open(rc_path))
    indices = [r["index"] for r in rc]
    d = json.load(open(t["source_file"]))
    blind_items, key_items = [], []
    for i in indices:
        q = d["questions"][i]
        order = list(range(len(q["options"])))
        random.shuffle(order)
        shuffled = [q["options"][j] for j in order]
        new_correct = order.index(q["answer_index"])
        blind_items.append({"qid": i, "scenario": q.get("scenario"),
                            "question": q["question"], "options": shuffled})
        key_items.append({"qid": i, "shuffle_order": order,
                          "correct_shuffled_index": new_correct,
                          "answer_index_original": q["answer_index"]})
    json.dump({"file": t["source_file"], "title": t["title"], "items": blind_items},
              open(f"{BASE}/blind/{name}.blind.json", "w"), ensure_ascii=False, indent=2)
    json.dump({"file": t["source_file"], "items": key_items},
              open(f"{BASE}/blind/{name}.key.json", "w"), ensure_ascii=False, indent=2)
    print(f"{name}: {len(blind_items)} 題盲測集")
