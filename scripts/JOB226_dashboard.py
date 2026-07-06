#!/usr/bin/env python3
"""
JOB-226 Dashboard: 讀 progress.json，顯示整體進度

用法:
  python3 scripts/JOB226_dashboard.py
  python3 scripts/JOB226_dashboard.py --since-minutes 60
"""
from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional


PROGRESS_PATH = Path("jobs/JOB-226-progress.json")


def status_icon(s: str) -> str:
    return {
        "pending": "⏳",
        "in_progress": "🔄",
        "done": "✅",
        "partial": "🟡",
        "failed": "❌",
    }.get(s, "❓")


def progress_bar(pct: float, width: int = 24) -> str:
    filled = int(width * pct / 100)
    return "█" * filled + "░" * (width - filled)


def fmt_dt(s):
    if not s:
        return "-"
    try:
        dt = datetime.fromisoformat(s)
        return dt.strftime("%m-%d %H:%M")
    except Exception:
        return s


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--since-minutes", type=int, default=60)
    args = parser.parse_args()

    if not PROGRESS_PATH.exists():
        print(f"❌ progress.json 不存在：{PROGRESS_PATH}", file=sys.stderr)
        sys.exit(1)

    data = json.loads(PROGRESS_PATH.read_text(encoding="utf-8"))
    combos = data["combos"]

    now = datetime.now()
    cutoff = now - timedelta(minutes=args.since_minutes)
    weekday = "一二三四五六日"[now.weekday()]
    print(f"╔══════════════════════════════════════════════════════════════╗")
    print(f"║  📊 JOB-226 雙源 MD 整合 — 進度儀表板                       ║")
    print(f"║  🕐 回報時間：{now.strftime('%Y-%m-%d')} (週{weekday}) {now.strftime('%H:%M:%S')}                  ║")
    print(f"╚══════════════════════════════════════════════════════════════╝")

    # 整體狀態
    status_count = {}
    for c in combos:
        status_count[c["status"]] = status_count.get(c["status"], 0) + 1
    print(f"\n  整體：" + "  ".join(f"{status_icon(s)} {s}={n}" for s, n in sorted(status_count.items())))
    done = status_count.get("done", 0) + status_count.get("partial", 0)
    print(f"  完成度：{done}/{len(combos)} = {done/len(combos)*100:.1f}%")

    # 檔案層級
    expected_total = sum(c["expected_count"] for c in combos)
    integrated_total = sum(c["integrated_count"] for c in combos)
    print(f"  檔案層級：{integrated_total} / {expected_total} = {integrated_total/expected_total*100 if expected_total else 0:.1f}%")

    # Token
    token_total = sum(c.get("token_used", 0) for c in combos)
    print(f"  Token 累積：{token_total:,}（subscription，無台幣計費）")

    # 近 N 分鐘增量
    recent = [c for c in combos if c.get("completed_at") and datetime.fromisoformat(c["completed_at"]) >= cutoff]
    print(f"\n  近 {args.since_minutes} 分鐘：{len(recent)} combo 完成")
    if recent:
        for c in recent:
            print(f"      {c['phase']} {c['combo']}: {c['integrated_count']}/{c['expected_count']} ({fmt_dt(c['completed_at'])})")

    # 各 phase 進度
    print(f"\n  各 phase 進度：")
    for phase, sem in data["phases"].items():
        ph_combos = [c for c in combos if c["phase"] == phase]
        ph_done = sum(1 for c in ph_combos if c["status"] in ("done", "partial"))
        pct = ph_done / len(ph_combos) * 100
        print(f"  Phase {phase} ({sem})  {progress_bar(pct)}  {pct:5.1f}%  ({ph_done}/{len(ph_combos)})")

    # 當前進行中或最後完成
    in_progress = [c for c in combos if c["status"] == "in_progress"]
    if in_progress:
        print(f"\n  正在進行：")
        for c in in_progress:
            print(f"      🔄 {c['phase']} {c['combo']}: {c['integrated_count']}/{c['expected_count']} (started {fmt_dt(c.get('started_at'))})")

    # 失敗列表
    failed = [c for c in combos if c["status"] == "failed"]
    if failed:
        print(f"\n  ❌ 失敗：")
        for c in failed:
            print(f"      {c['phase']} {c['combo']}: {c.get('error_note') or '-'}")

    # 下一個待跑
    pending = [c for c in combos if c["status"] == "pending"]
    if pending:
        nxt = pending[0]
        print(f"\n  下一 combo：{nxt['phase']} {nxt['combo']} (expected {nxt['expected_count']} 份)")

    print()


if __name__ == "__main__":
    main()
