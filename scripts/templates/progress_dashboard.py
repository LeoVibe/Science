#!/usr/bin/env python3
"""長時任務進度儀表板 — 通用骨架

> 範本來源：JOB-209（米蘭考古題下載）→ JOB-214 抽象化
> 套用步驟：拷貝為 scripts/<task>_dashboard.py，改 4 個 placeholder 即可
> 詳見 docs/長時任務執行範本.md

================================================================
TASK-SPECIFIC PLACEHOLDERS（拷貝後務必改這 4 處）
================================================================
1. PROGRESS_PATH：progress JSON 檔路徑
2. STATUS_KEYS：本任務的 status 欄位值（如 'done'/'partial'/'failed'/'pending'）
3. group_key()：依任務需求把 record 分組（按學期、按科目、按版本…）
4. count_unit()：每筆 record 的「計數欄位」名稱（如 downloaded_pdf_count、generated_question_count）
================================================================
"""

from __future__ import annotations

import argparse
import json
from collections import Counter, defaultdict
from datetime import datetime, timedelta
from pathlib import Path

# === Placeholder 1: progress JSON 路徑 ===
PROGRESS_PATH = Path(__file__).resolve().parents[2] / "knowledge/<task-folder>/_manifest/progress.json"

# === Placeholder 2: status 值（依任務調整）===
STATUS_KEYS = ("done", "partial", "failed", "pending")
COMPLETE_STATUSES = ("done", "partial")  # 算入「完成度」的


def group_key(r: dict) -> str:
    """=== Placeholder 3: 把 record 分組 ===

    依任務調整，例如：
    - 考古題：return f'{r["grade"]} {r["semester"]}'
    - 出題：return f'{r["grade"]} {r["semester"]} {r["subject"]}'
    - 題庫盲測：return r["lesson_id"]
    """
    return f"{r.get('group', 'default')}"


def count_unit(r: dict) -> int:
    """=== Placeholder 4: 從 record 取得「該筆計數」===

    依任務調整，例如：
    - 考古題：r.get('downloaded_pdf_count', 0)
    - 出題：r.get('generated_question_count', 0)
    - 盲測：r.get('verified_question_count', 0)
    """
    return int(r.get("count", 0))


# === 共通邏輯（拷貝後通常不用改）===

def fmt_pct(done: int, total: int, width: int = 8) -> str:
    pct = done * 100 // total if total else 0
    filled = round(done / total * width) if total else 0
    bar = "█" * filled + "░" * (width - filled)
    return f"{bar} {pct:>3d}%"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--since-minutes", type=int, default=60)
    args = parser.parse_args()

    data = json.loads(PROGRESS_PATH.read_text())
    now = datetime.now()
    cutoff = (now - timedelta(minutes=args.since_minutes)).isoformat()

    # 整體
    status_ct = Counter(r.get("status") for r in data)
    total = len(data)
    done = status_ct.get("done", 0)
    partial = status_ct.get("partial", 0)
    failed = status_ct.get("failed", 0)
    pending = status_ct.get("pending", 0)
    completion = ((done + partial) / total * 100) if total else 0

    weekday_zh = "一二三四五六日"[now.weekday()]
    print("╔══════════════════════════════════════════════════════════════╗")
    print("║  📊 任務進度儀表板                                           ║")
    print(f"║  🕐 回報時間：{now.strftime('%Y-%m-%d (週'+weekday_zh+') %H:%M:%S'):<48}║")
    print("╚══════════════════════════════════════════════════════════════╝")
    print(f"  整體：done={done}  partial={partial}  failed={failed}  pending={pending}")
    print(f"  完成度（done+partial）：{done+partial}/{total} = {completion:.1f}%")

    # 近 N 分鐘增量
    recent = [r for r in data if (r.get("last_attempt") or "") >= cutoff]
    # 排除「需手動處理」這類不算實際下載的修正紀錄
    recent_real = [r for r in recent if "需手動處理" not in (r.get("error_note") or "")
                   and "誤標修正" not in (r.get("error_note") or "")]
    r_done = sum(1 for r in recent_real if r.get("status") == "done")
    r_partial = sum(1 for r in recent_real if r.get("status") == "partial")
    r_failed = sum(1 for r in recent_real if r.get("status") == "failed")
    r_units = sum(count_unit(r) for r in recent_real)
    print(f"\n  近 {args.since_minutes} 分鐘增量：")
    print(f"    {len(recent_real)} records 處理 | done={r_done} partial={r_partial} failed={r_failed}")
    print(f"    新增單位數：{r_units} | 速率：{r_units/args.since_minutes:.1f}/分")

    # 分組進度條
    by_group = defaultdict(list)
    for r in data:
        by_group[group_key(r)].append(r)

    print("\n  各分組進度（依執行順序）：")
    print(f"  {'分組':<20} | {'done':>4} {'partial':>7} {'failed':>6} {'pending':>7} | {'進度':<14}")
    for k in sorted(by_group.keys()):
        rs = by_group[k]
        d = sum(1 for r in rs if r.get("status") == "done")
        p = sum(1 for r in rs if r.get("status") == "partial")
        f = sum(1 for r in rs if r.get("status") == "failed")
        pe = sum(1 for r in rs if r.get("status") == "pending")
        bar = fmt_pct(d + p, len(rs))
        print(f"  {k:<20} | {d:>4} {p:>7} {f:>6} {pe:>7} | {bar}")

    # 預估剩餘
    if recent_real and pending > 0:
        rate_per_min = len(recent_real) / args.since_minutes
        if rate_per_min > 0:
            remain_min = pending / rate_per_min
            est = now + timedelta(minutes=remain_min)
            print(f"\n  預估剩餘：{remain_min:.0f} min ({remain_min/60:.1f}h)")
            print(f"  預估完成：{est.strftime('%Y-%m-%d %H:%M')}")
    elif pending == 0:
        print(f"\n  ✅ pending=0，loop 應已自然結束")

    print(f"╚{'═' * 60}╝")


if __name__ == "__main__":
    main()
