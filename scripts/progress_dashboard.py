#!/usr/bin/env python3
"""考古題下載即時進度儀表板。

用法：python3 scripts/progress_dashboard.py [--since-minutes N]
"""

from __future__ import annotations

import argparse
import json
from collections import Counter, defaultdict
from datetime import datetime, timedelta
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
PROGRESS = REPO_ROOT / "knowledge" / "3_考古題" / "_manifest" / "download_progress.json"
LOOP_LOGS = REPO_ROOT / "scripts" / "orchestrator-logs"


def fmt_pct(done: int, total: int) -> str:
    pct = done * 100 // total if total else 0
    width = 8
    filled = round(done / total * width) if total else 0
    bar = "█" * filled + "░" * (width - filled)
    return f"{bar} {pct:>3d}%"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--since-minutes", type=int, default=60,
                        help="近期 N 分鐘的增量（預設 60）")
    args = parser.parse_args()

    data = json.loads(PROGRESS.read_text())
    now = datetime.now()
    cutoff = now - timedelta(minutes=args.since_minutes)
    cutoff_str = cutoff.isoformat()

    # 整體狀態
    status_ct = Counter(r["status"] for r in data)
    total = len(data)
    done = status_ct.get("done", 0)
    partial = status_ct.get("partial", 0)
    failed = status_ct.get("failed", 0)
    pending = status_ct.get("pending", 0)
    completion = (done + partial) / total * 100

    weekday_zh = "一二三四五六日"[now.weekday()]
    print(f"╔══════════════════════════════════════════════════════════════╗")
    print(f"║  📊 考古題下載進度儀表板                                     ║")
    print(f"║  🕐 回報時間：{now.strftime('%Y-%m-%d (週'+weekday_zh+') %H:%M:%S'):<48}║")
    print(f"╚══════════════════════════════════════════════════════════════╝")
    print(f"  整體：done={done}  partial={partial}  failed={failed}  pending={pending}")
    print(f"  完成度（done+partial）：{done+partial}/{total} = {completion:.1f}%")

    # 近期增量
    recent = [r for r in data if (r.get("last_attempt") or "") >= cutoff_str]
    recent_real = [r for r in recent if "已知空 folder" not in (r.get("error_note") or "")
                   and "誤標修正" not in (r.get("error_note") or "")]
    r_done = sum(1 for r in recent_real if r["status"] == "done")
    r_partial = sum(1 for r in recent_real if r["status"] == "partial")
    r_failed = sum(1 for r in recent_real if r["status"] == "failed")
    r_pdf = sum(r.get("downloaded_pdf_count", 0) for r in recent_real)
    print(f"\n  近 {args.since_minutes} 分鐘增量：")
    print(f"    {len(recent_real)} drives 處理 | done={r_done} partial={r_partial} failed={r_failed}")
    print(f"    新增檔案：{r_pdf} 份 | 速率：{r_pdf/args.since_minutes:.1f} 檔/分")

    # Batch 統計（從 loop log）
    batch_log = LOOP_LOGS / "JOB-209-loop5.log"
    if batch_log.exists():
        log_text = batch_log.read_text()
        batches = []
        for line in log_text.splitlines():
            if "=== Batch #" in line:
                batches.append(line[:60])
        if batches:
            print(f"\n  Loop batch 進度（最近 3 筆）：")
            for b in batches[-3:]:
                print(f"    {b}")

    # 各學期進度（依新順序 G3,G4,G5,G6,G1,G2 × 下/上）
    SEMESTER_PRIORITY = {"下學期": 0, "上學期": 1}
    GRADE_PRIORITY = {"G3": 0, "G4": 1, "G5": 2, "G6": 3, "G1": 4, "G2": 5}

    by_sem = defaultdict(list)
    for r in data:
        by_sem[(r["semester"], r["grade"])].append(r)

    print(f"\n  各學期進度（依抓取順序）：")
    print(f"  {'學期':<10} | {'done':>4} {'partial':>7} {'failed':>6} {'pending':>7} | {'進度':<14}")
    keys = sorted(by_sem.keys(),
                  key=lambda k: (SEMESTER_PRIORITY.get(k[0], 99), GRADE_PRIORITY.get(k[1], 99)))
    for sem, grade in keys:
        rs = by_sem[(sem, grade)]
        d = sum(1 for r in rs if r["status"] == "done")
        p = sum(1 for r in rs if r["status"] == "partial")
        f = sum(1 for r in rs if r["status"] == "failed")
        pe = sum(1 for r in rs if r["status"] == "pending")
        bar = fmt_pct(d + p, len(rs))
        print(f"  {grade} {sem}  | {d:>4} {p:>7} {f:>6} {pe:>7} | {bar}")

    # 預估剩餘
    if recent_real:
        rate_drives_per_min = len(recent_real) / args.since_minutes
        if rate_drives_per_min > 0:
            remain_min = pending / rate_drives_per_min
            est = now + timedelta(minutes=remain_min)
            print(f"\n  預估剩餘：{remain_min:.0f} min ({remain_min/60:.1f}h)")
            print(f"  預估完成：{est.strftime('%Y-%m-%d %H:%M')}")

    print(f"╚{'═' * 60}╝")


if __name__ == "__main__":
    main()
