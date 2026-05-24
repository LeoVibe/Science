"""Build JOB-246 Phase 1b Pilot targets.

Pilot rule:
- Pick 5 normal-sized exams from Phase 1a partials.
- Distribution: 翰林 2 + 康軒 2 + 南一 1.
- Within each publisher, prefer exams with more N2_or_N3_pending links.
"""

import json
import os
from collections import Counter, defaultdict

BASE = "knowledge/3_考古題/3_L2_結構化抽取/四下"
PARTIAL_DIR = os.path.join(BASE, "alignment_science", "_partial")
OUT_BASE = "scripts/jobs/JOB-246"

QUOTA = {"翰林": 2, "康軒": 2, "南一": 1}
WORKER_BY_PUBLISHER = {"翰林": "A_翰林", "康軒": "B_康軒", "南一": "C_南一"}

# Pilot is intended to be quick and representative. These filters avoid huge
# aggregate bundles and answer sheets that are not good arbitration pilots.
MAX_PILOT_QUESTIONS = 120
EXCLUDE_NAME_TOKENS = ("答案",)


def load_json(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def l2_path_for(publisher, exam_id):
    return os.path.join(BASE, f"四下_自然_{publisher}", f"{exam_id}.json")


def iter_candidates():
    for filename in sorted(os.listdir(PARTIAL_DIR)):
        if not filename.startswith("alignment_partial_") or not filename.endswith(".json"):
            continue

        partial_path = os.path.join(PARTIAL_DIR, filename)
        data = load_json(partial_path)
        meta = data.get("_meta", {})
        exam_id = meta.get("partial_for") or filename[len("alignment_partial_") : -5]
        publisher = meta.get("publisher") or exam_id.split("_", 1)[0]

        if publisher not in QUOTA:
            continue
        if any(token in exam_id for token in EXCLUDE_NAME_TOKENS):
            continue

        links = data.get("l2_to_kl_links", [])
        rules = Counter(link.get("match_rule", "?") for link in links)
        pending = rules["N2_or_N3_pending"]
        total = len(links)
        l2_path = l2_path_for(publisher, exam_id)

        if pending <= 0:
            continue
        if total > MAX_PILOT_QUESTIONS:
            continue
        if not os.path.exists(l2_path):
            continue

        yield {
            "exam_id": exam_id,
            "l2_path": l2_path,
            "publisher": publisher,
            "n2_or_n3_pending": pending,
            "n1_pending": rules["N1_pending"],
            "n5": rules["N5"],
            "total": total,
        }


def select_targets():
    by_publisher = defaultdict(list)
    for target in iter_candidates():
        by_publisher[target["publisher"]].append(target)

    selected = {worker: [] for worker in WORKER_BY_PUBLISHER.values()}
    for publisher, quota in QUOTA.items():
        ranked = sorted(
            by_publisher[publisher],
            key=lambda t: (-t["n2_or_n3_pending"], -t["total"], t["exam_id"]),
        )
        worker = WORKER_BY_PUBLISHER[publisher]
        selected[worker] = ranked[:quota]

    return selected


def write_targets(selected):
    os.makedirs(OUT_BASE, exist_ok=True)
    total = 0
    for worker, targets in selected.items():
        total += len(targets)
        path = os.path.join(OUT_BASE, f"_full_targets_{worker}.json")
        with open(path, "w", encoding="utf-8") as f:
            json.dump(targets, f, ensure_ascii=False, indent=2)
            f.write("\n")
        print(f"  ✓ {path}: {len(targets)} 份")
        for target in targets:
            print(
                "    - "
                f"{target['exam_id']} "
                f"N2_or_N3_pending={target['n2_or_n3_pending']} "
                f"total={target['total']}"
            )
    print(f"  total: {total} 份")


def main():
    selected = select_targets()
    write_targets(selected)


if __name__ == "__main__":
    main()
