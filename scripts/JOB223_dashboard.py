#!/usr/bin/env python3.11
"""JOB-223 progress dashboard."""

from __future__ import annotations

import argparse
import json
from collections import Counter, defaultdict
from datetime import datetime, timedelta
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "knowledge/3_考古題/_manifest/JOB223_source_manifest.json"
PROGRESS = ROOT / "knowledge/3_考古題/_manifest/JOB223_progress.json"
PILOT = ROOT / "knowledge/3_考古題/_manifest/JOB223_pilot_results.json"
CODEX_ROOT = ROOT / "knowledge/3_考古題/2_MD淬鍊文字_Codex"

SEMESTERS = ("三下", "四下", "五下", "六下")


def fmt_pct(done: int, total: int) -> str:
    pct = round(done / total * 100) if total else 0
    width = 8
    filled = round(done / total * width) if total else 0
    return f"{'█' * filled}{'░' * (width - filled)} {pct:>3d}%"


def load_json(path: Path):
    text = path.read_text(encoding="utf-8")
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        if path.name == "JOB223_progress.json" and text.endswith("]]"):
            return json.loads(text[:-1])
        raise


def parse_time(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        return datetime.fromisoformat(value)
    except ValueError:
        return None


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--since-minutes", type=int, default=60)
    args = parser.parse_args()

    manifest = load_json(MANIFEST)
    progress = load_json(PROGRESS)
    pilot = load_json(PILOT) if PILOT.exists() else {"results": []}

    now = datetime.now()
    cutoff = now - timedelta(minutes=args.since_minutes)
    weekday_zh = "一二三四五六日"[now.weekday()]

    status_ct = Counter(item.get("status", "pending") for item in progress)
    phase_ct = Counter(item.get("phase", "unknown") for item in progress)
    pilot_combos = [item["combo"] for item in progress if item.get("pilot_sample")]
    recent_updates = [
        item for item in progress if (parse_time(item.get("last_updated")) or datetime.min) >= cutoff
    ]

    codex_md = sum(1 for path in CODEX_ROOT.rglob("*.md") if not path.name.startswith("_"))
    codex_index = sum(1 for _ in CODEX_ROOT.rglob("_index.json"))
    codex_doc_index = sum(1 for _ in CODEX_ROOT.rglob("_doc_index.json"))

    combo_output = {}
    for semester in SEMESTERS:
        sem_dir = CODEX_ROOT / semester
        if not sem_dir.exists():
            continue
        for combo_dir in sorted(p for p in sem_dir.iterdir() if p.is_dir()):
            combo_output[combo_dir.name] = {
                "md_count": sum(1 for p in combo_dir.glob("*.md") if not p.name.startswith("_")),
                "has_index": (combo_dir / "_index.json").exists(),
                "has_doc_index": (combo_dir / "_doc_index.json").exists(),
            }

    timestamp = now.strftime("%Y-%m-%d %H:%M:%S") + f" (週{weekday_zh})"
    print("╔══════════════════════════════════════════════════════════════╗")
    print("║  📊 JOB-223 進度儀表板                                     ║")
    print(f"║  回報時間：{timestamp:<45}║")
    print("╚══════════════════════════════════════════════════════════════╝")

    summary = manifest["summary"]
    print(
        f"  來源：combo={summary['combo_count']}  files={summary['file_count']}  "
        f"convertable={summary['convertable_total']}  iCloud={summary['icloud_placeholder_total']}"
    )
    print(
        f"  Claude 基線：md={summary['claude_baseline']['md_count']}  "
        f"_index={summary['claude_baseline']['index_count']}  "
        f"_doc_index={summary['claude_baseline']['doc_index_count']}"
    )
    print(
        f"  Codex 現況：md={codex_md}  _index={codex_index}  _doc_index={codex_doc_index}"
    )
    print(
        f"  狀態：done={status_ct.get('done', 0)}  running={status_ct.get('running', 0)}  "
        f"pending={status_ct.get('pending', 0)}  blocked={status_ct.get('blocked', 0)}"
    )
    print(
        f"  Phase：{', '.join(f'{k}={v}' for k, v in sorted(phase_ct.items()))}"
    )
    print()

    print(f"  近 {args.since_minutes} 分鐘：更新 {len(recent_updates)} 個 combo")
    if recent_updates:
        for item in recent_updates[:10]:
            progress_text = ""
            if item.get("groups_total"):
                progress_text = f" groups={item.get('groups_processed', 0)}/{item.get('groups_total', 0)}"
            issue_text = ""
            if item.get("issue_groups") is not None:
                issue_text = f" issues={item.get('issue_groups', 0)}"
            print(
                f"    - {item['combo']}: status={item.get('status')} phase={item.get('phase')} "
                f"updated={item.get('last_updated')}{progress_text}{issue_text}"
            )
            if item.get("notes"):
                print(f"      note: {item['notes']}")
        if len(recent_updates) > 10:
            print(f"    - ... 還有 {len(recent_updates) - 10} 個")
    else:
        print("    - 無進度更新")
    print()

    pilot_results = pilot.get("results", [])
    print(f"  Pilot：samples={len(pilot_results)}  combos={len(pilot_combos)}")
    for item in pilot_results:
        ok_methods = sum(
            1
            for m in item["methods"]
            if m["status"] == "ok" and not m.get("metrics", {}).get("empty_text", False)
        )
        total_methods = len(item["methods"])
        print(f"    - {item['sample_id']}: {ok_methods}/{total_methods} methods ok")
    print()

    by_semester = defaultdict(list)
    for item in progress:
        by_semester[item["semester"]].append(item)

    print("  各學期進度：")
    print("  學期   | combo 狀態                    | Codex 產出")
    for semester in SEMESTERS:
        items = by_semester.get(semester, [])
        done = sum(1 for item in items if item.get("status") == "done")
        bar = fmt_pct(done, len(items))
        sem_md = 0
        sem_index = 0
        sem_doc_index = 0
        for item in items:
            output = combo_output.get(item["combo"], {})
            sem_md += output.get("md_count", 0)
            sem_index += 1 if output.get("has_index") else 0
            sem_doc_index += 1 if output.get("has_doc_index") else 0
        print(
            f"  {semester:<4} | done={done:>2}/{len(items):<2} {bar:<12} | "
            f"md={sem_md:<4} _index={sem_index:<2} _doc_index={sem_doc_index:<2}"
        )


if __name__ == "__main__":
    main()
