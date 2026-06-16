#!/usr/bin/env python3
"""JOB-269 Phase 3 — 驗收通過後將 _new.json approved 題覆蓋正式 L{N}.json"""
import json, os, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
QBASE = os.path.join(ROOT, "question/platform/G3/Chinese/S2/HanLin")

COURSES = ["L1", "L2", "L3", "L4", "L6", "L7", "L9", "L12"]
MIN_APPROVED = 30

results = []
for L in COURSES:
    new_path = os.path.join(QBASE, f"G3_S2_CHI_HANLIN_{L}_new.json")
    out_path = os.path.join(QBASE, f"G3_S2_CHI_HANLIN_{L}.json")

    if not os.path.exists(new_path):
        results.append((L, "SKIP", 0, f"_new.json 不存在"))
        continue

    with open(new_path, encoding="utf-8") as f:
        data = json.load(f)

    approved = [q for q in data["questions"] if q.get("is_publishable") and q.get("review_status") == "approved"]
    n = len(approved)

    if n < MIN_APPROVED:
        results.append((L, "SKIP", n, f"approved 只有 {n} 題，未達 {MIN_APPROVED}，不覆蓋"))
        continue

    # BIAS 檢查（正解唯一最長比例 ≤ 40%）
    bias_count = 0
    for q in approved:
        opts = q.get("options", [])
        if not opts:
            continue
        lengths = [len(o) for o in opts]
        max_len = max(lengths)
        ans_len = len(opts[q["answer_index"]]) if q["answer_index"] < len(opts) else 0
        if ans_len == max_len and lengths.count(max_len) == 1:
            bias_count += 1
    bias_rate = bias_count / n if n else 0
    if bias_rate > 0.4:
        results.append((L, "SKIP", n, f"BIAS {bias_rate:.0%} > 40%，不覆蓋"))
        continue

    # 覆蓋：保留 meta/publisher，questions 只取 approved 題
    out_data = {
        "meta": data["meta"],
        "publisher": data["publisher"],
        "questions": approved,
    }
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(out_data, f, ensure_ascii=False, indent=2)
    results.append((L, "OK", n, f"覆蓋完成 BIAS={bias_rate:.0%}"))

print("\n=== JOB-269 merge.py 結果 ===")
for L, status, n, msg in results:
    icon = "✅" if status == "OK" else "⚠️"
    print(f"  {icon} {L}: {status} ({n} approved) — {msg}")

ok = sum(1 for _, s, _, _ in results if s == "OK")
skip = len(results) - ok
print(f"\n覆蓋完成：{ok}/{len(COURSES)} 課　跳過：{skip} 課")
if skip > 0:
    print("跳過課次需另行處理（Phase 1 重跑 or 記入遺留問題）")
