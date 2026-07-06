"""JOB-247 全量 build targets：三下自然 117 份全量 dispatch。

排除已完成（_partial 中沒有 N1_pending / N2_or_N3_pending）。
按 publisher 分 3 worker file。
"""

import json
import os
from collections import Counter, defaultdict

BASE = "knowledge/3_考古題/3_L2_結構化抽取/三下"
PARTIAL_DIR = os.path.join(BASE, "alignment_science", "_partial")
OUT_BASE = "scripts/jobs/JOB-247"

WORKER_BY_PUBLISHER = {"翰林": "A_翰林", "康軒": "B_康軒", "南一": "C_南一"}


def load_json(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def l2_path_for(publisher, exam_id):
    return os.path.join(BASE, f"三下_自然_{publisher}", f"{exam_id}.json")


def iter_candidates():
    for filename in sorted(os.listdir(PARTIAL_DIR)):
        if not filename.startswith("alignment_partial_") or not filename.endswith(".json"):
            continue

        partial_path = os.path.join(PARTIAL_DIR, filename)
        data = load_json(partial_path)
        meta = data.get("_meta", {})
        exam_id = meta.get("partial_for") or filename[len("alignment_partial_"):-5]
        publisher = meta.get("publisher") or exam_id.split("_", 1)[0]

        if publisher not in WORKER_BY_PUBLISHER:
            continue

        links = data.get("l2_to_kl_links", [])
        rules = Counter(link.get("match_rule", "?") for link in links)
        n1_pending = rules["N1_pending"]
        n2_n3_pending = rules["N2_or_N3_pending"]
        total_pending = n1_pending + n2_n3_pending

        if total_pending <= 0:
            continue  # 已完成 codex 抽查

        l2_path = l2_path_for(publisher, exam_id)
        if not os.path.exists(l2_path):
            continue

        yield {
            "exam_id": exam_id,
            "l2_path": l2_path,
            "publisher": publisher,
            "n1_pending": n1_pending,
            "n2_or_n3_pending": n2_n3_pending,
            "n5": rules["N5"],
            "total": len(links),
        }


def select_targets():
    by_publisher = defaultdict(list)
    for target in iter_candidates():
        by_publisher[target["publisher"]].append(target)

    selected = {worker: [] for worker in WORKER_BY_PUBLISHER.values()}
    for publisher in WORKER_BY_PUBLISHER:
        ranked = sorted(
            by_publisher[publisher],
            key=lambda t: (-t["n2_or_n3_pending"] - t["n1_pending"], t["exam_id"]),
        )
        worker = WORKER_BY_PUBLISHER[publisher]
        selected[worker] = ranked

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
    print(f"  total: {total} 份 (需 codex 抽查)")


def main():
    selected = select_targets()
    write_targets(selected)


if __name__ == "__main__":
    main()
