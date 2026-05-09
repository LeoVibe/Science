#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import os
import sys
import unicodedata
from datetime import datetime, timedelta


SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROGRESS_PATH = os.path.join(SCRIPT_DIR, "_full_progress.json")
TARGETS_PATH = os.path.join(SCRIPT_DIR, "_full_targets.json")
PUBLISHERS = ("翰林", "康軒", "南一")
BOX_WIDTH = 62


def char_width(ch: str) -> int:
    if unicodedata.combining(ch):
        return 0
    if unicodedata.category(ch) in ("Mn", "Me", "Cf"):
        return 0
    return 2 if unicodedata.east_asian_width(ch) in ("F", "W") else 1


def display_width(text: str) -> int:
    return sum(char_width(ch) for ch in text)


def pad_display(text: str, width: int) -> str:
    pad = width - display_width(text)
    if pad <= 0:
        return text
    return text + (" " * pad)


def box_line(text: str) -> str:
    return "║" + pad_display(text, BOX_WIDTH) + "║"


def top_border() -> str:
    return "╔" + ("═" * BOX_WIDTH) + "╗"


def bottom_border() -> str:
    return "╚" + ("═" * BOX_WIDTH) + "╝"


def load_json(path: str) -> dict:
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"ERROR: 找不到檔案：{path}", file=sys.stderr)
        sys.exit(1)
    except json.JSONDecodeError as exc:
        print(f"ERROR: JSON 解析失敗：{path}: {exc}", file=sys.stderr)
        sys.exit(1)


def as_rank(value) -> int | None:
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def safe_int(value, default: int = 0) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def completed_ranks(progress: dict) -> set[int]:
    ranks = set()
    for value in progress.get("completed", []) or []:
        rank = as_rank(value)
        if rank is not None:
            ranks.add(rank)
    return ranks


def failed_ranks(progress: dict) -> set[int]:
    ranks = set()
    for value in progress.get("failed", []) or []:
        if isinstance(value, dict):
            rank = as_rank(value.get("rank"))
        else:
            rank = as_rank(value)
        if rank is not None:
            ranks.add(rank)
    return ranks


def parse_iso8601(value: str | None) -> datetime | None:
    if not isinstance(value, str) or not value:
        return None
    try:
        normalized = value.replace("Z", "+00:00") if value.endswith("Z") else value
        dt = datetime.fromisoformat(normalized)
    except (TypeError, ValueError):
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=datetime.now().astimezone().tzinfo)
    return dt.astimezone()


def parse_illegal_codes(value) -> tuple[int, int]:
    if not isinstance(value, str) or "/" not in value:
        return 0, 0
    bad_text, total_text = value.split("/", 1)
    try:
        bad = int(bad_text.strip())
        total = int(total_text.strip())
    except ValueError:
        return 0, 0
    return max(bad, 0), max(total, 0)


def rank_progress(progress: dict, rank: int) -> dict:
    value = progress.get(f"rank_{rank}", {})
    return value if isinstance(value, dict) else {}


def progress_bar(done: int, total: int) -> str:
    pct = (done / total * 100.0) if total else 0.0
    filled = int(pct // 12.5)
    if done >= total and total:
        filled = 8
    filled = max(0, min(8, filled))
    return ("█" * filled) + ("░" * (8 - filled))


def fmt_pct(value: float, digits: int = 1) -> str:
    return f"{value:.{digits}f}%"


def weekday_text(dt: datetime) -> str:
    return "一二三四五六日"[dt.weekday()]


def estimate(started_at: datetime | None, now: datetime, done: int, pending: int,
             recent_done: int, since_minutes: int, total: int) -> dict:
    if total and done >= total:
        return {"status": "completed"}
    if done <= 0:
        return {"status": "waiting"}

    if recent_done > 0:
        avg_min = since_minutes / recent_done
        basis = "recent"
    else:
        if started_at is None:
            return {"status": "waiting"}
        elapsed_min = max((now - started_at).total_seconds() / 60.0, 0.0)
        avg_min = elapsed_min / done if done else 0.0
        basis = "overall"

    if avg_min <= 0:
        return {"status": "waiting"}

    remaining_min = pending * avg_min
    finish_at = now + timedelta(minutes=remaining_min)
    return {
        "status": "estimated",
        "basis": basis,
        "avg_min_per_item": avg_min,
        "remaining_minutes": remaining_min,
        "finish_at": finish_at,
    }


def build_summary(progress: dict, targets_data: dict, since_minutes: int) -> dict:
    now = datetime.now().astimezone()
    cutoff = now - timedelta(minutes=since_minutes)
    targets = targets_data.get("targets", []) or []
    total = len(targets) or safe_int((targets_data.get("_meta") or {}).get("total"), 0)
    done_set = completed_ranks(progress)
    failed_set = failed_ranks(progress)
    failed_count = len(progress.get("failed", []) or [])
    done = len(done_set)
    pending = max(total - done - (len(failed_set) if failed_set else failed_count), 0)
    completion_pct = (done / total * 100.0) if total else 0.0

    recent_ranks = []
    completion_times = []
    for rank in sorted(done_set):
        item = rank_progress(progress, rank)
        finished_at = parse_iso8601(item.get("finished_at"))
        if finished_at is None:
            continue
        completion_times.append(finished_at)
        if finished_at >= cutoff:
            recent_ranks.append(rank)

    recent_bad = 0
    recent_total_codes = 0
    for rank in recent_ranks:
        bad, total_codes = parse_illegal_codes(rank_progress(progress, rank).get("illegal_codes"))
        recent_bad += bad
        recent_total_codes += total_codes
    legal_rate = (
        (recent_total_codes - recent_bad) / recent_total_codes * 100.0
        if recent_total_codes
        else 0.0
    )
    recent_avg = since_minutes / len(recent_ranks) if recent_ranks else 0.0

    publisher_rows = []
    for publisher in PUBLISHERS:
        publisher_targets = [
            target for target in targets
            if isinstance(target, dict) and target.get("publisher") == publisher
        ]
        publisher_total = len(publisher_targets)
        publisher_done = sum(
            1 for target in publisher_targets
            if as_rank(target.get("rank")) in done_set
        )
        publisher_pct = (publisher_done / publisher_total * 100.0) if publisher_total else 0.0
        publisher_rows.append({
            "publisher": publisher,
            "done": publisher_done,
            "total": publisher_total,
            "pct": publisher_pct,
            "bar": progress_bar(publisher_done, publisher_total),
        })

    started_at = parse_iso8601(progress.get("started_at"))
    if started_at is None and completion_times:
        started_at = min(completion_times)
    eta = estimate(started_at, now, done, pending, len(recent_ranks), since_minutes, total)

    return {
        "job": "JOB-228",
        "phase": "Phase 5",
        "report_time": now,
        "since_minutes": since_minutes,
        "total": total,
        "done": done,
        "failed": failed_count,
        "pending": pending,
        "completion_pct": completion_pct,
        "recent": {
            "completed": len(recent_ranks),
            "avg_min_per_item": recent_avg,
            "illegal_bad": recent_bad,
            "illegal_total": recent_total_codes,
            "legal_rate_pct": legal_rate,
            "ranks": recent_ranks,
        },
        "publishers": publisher_rows,
        "eta": eta,
    }


def json_ready(summary: dict) -> dict:
    eta = dict(summary["eta"])
    if isinstance(eta.get("finish_at"), datetime):
        eta["finish_at"] = eta["finish_at"].strftime("%Y-%m-%d %H:%M")
    return {
        "job": summary["job"],
        "phase": summary["phase"],
        "report_time": summary["report_time"].isoformat(),
        "since_minutes": summary["since_minutes"],
        "total": summary["total"],
        "done": summary["done"],
        "failed": summary["failed"],
        "pending": summary["pending"],
        "completion_pct": round(summary["completion_pct"], 1),
        "recent": {
            "completed": summary["recent"]["completed"],
            "avg_min_per_item": round(summary["recent"]["avg_min_per_item"], 1),
            "illegal_bad": summary["recent"]["illegal_bad"],
            "illegal_total": summary["recent"]["illegal_total"],
            "legal_rate_pct": round(summary["recent"]["legal_rate_pct"], 1),
            "ranks": summary["recent"]["ranks"],
        },
        "publishers": [
            {
                "publisher": row["publisher"],
                "done": row["done"],
                "total": row["total"],
                "pct": round(row["pct"], 1),
                "bar": row["bar"],
            }
            for row in summary["publishers"]
        ],
        "eta": eta,
    }


def print_text(summary: dict) -> None:
    now = summary["report_time"]
    recent = summary["recent"]

    print(top_border())
    print(box_line("  📊 JOB-228 Phase 5 進度儀表板"))
    print(box_line(f"  🕐 回報時間：{now.strftime('%Y-%m-%d')} (週{weekday_text(now)}) {now.strftime('%H:%M:%S')}"))
    print(bottom_border())
    print(f"  整體：done={summary['done']}  failed={summary['failed']}  pending={summary['pending']}")
    print(f"  完成度：{summary['done']}/{summary['total']} = {fmt_pct(summary['completion_pct'])}")
    print()
    print(f"  近 {summary['since_minutes']} 分鐘增量：")
    print(f"    {recent['completed']} 份完成 | 平均 {recent['avg_min_per_item']:.1f} min/份")
    print(
        f"    編碼合法率：{fmt_pct(recent['legal_rate_pct'])}"
        f"（{recent['illegal_bad']}/{recent['illegal_total']} 違規）"
    )
    print()
    print("  各分組進度：")
    for row in summary["publishers"]:
        pct_int = int(row["pct"])
        print(f"  {row['publisher']}  {row['bar']}  {row['done']}/{row['total']}  ({pct_int}%)")
    print()

    eta = summary["eta"]
    if eta["status"] == "completed":
        print("  ✅ 已完成")
    elif eta["status"] == "waiting":
        print("  預估剩餘：等待第一份")
    else:
        remaining = eta["remaining_minutes"]
        print(f"  預估剩餘：{remaining:.0f} min ({remaining / 60.0:.1f}h)")
        print(f"  預估完成：{eta['finish_at'].strftime('%Y-%m-%d %H:%M')}")
    print(bottom_border())


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="JOB-228 Phase 5 進度儀表板")
    parser.add_argument("--since-minutes", type=int, default=60)
    parser.add_argument("--json", action="store_true", help="輸出 JSON，供 pipeline 串接")
    args = parser.parse_args()
    if args.since_minutes <= 0:
        parser.error("--since-minutes 必須大於 0")
    return args


def main() -> None:
    args = parse_args()
    progress = load_json(PROGRESS_PATH)
    targets_data = load_json(TARGETS_PATH)
    summary = build_summary(progress, targets_data, args.since_minutes)

    if args.json:
        print(json.dumps(json_ready(summary), ensure_ascii=False, indent=2))
    else:
        print_text(summary)


if __name__ == "__main__":
    main()
