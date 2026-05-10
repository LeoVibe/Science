#!/usr/bin/env python3
"""JOB-229 Phase 5 整合 Dashboard（吃 worker A/B/C 三份 progress + targets）"""
from __future__ import annotations

import argparse
import json
import os
import sys
import unicodedata
from datetime import datetime, timedelta


SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
WORKERS = ('A', 'B', 'C')
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


def load_json_safe(path: str) -> dict:
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return {}
    except json.JSONDecodeError as exc:
        print(f"WARN: JSON 解析失敗：{path}: {exc}", file=sys.stderr)
        return {}


def as_rank(value):
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def safe_int(value, default: int = 0) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def parse_iso8601(value):
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


def collect_worker_data():
    """讀取 A/B/C 三 worker 的 progress + targets，整合成單一 view。"""
    workers = {}
    for w in WORKERS:
        p_path = os.path.join(SCRIPT_DIR, f'_full_progress_{w}.json')
        t_path = os.path.join(SCRIPT_DIR, f'_full_targets_{w}.json')
        progress = load_json_safe(p_path)
        targets = load_json_safe(t_path)
        workers[w] = {'progress': progress, 'targets': targets, 'progress_path': p_path}
    return workers


def build_summary(workers: dict, since_minutes: int) -> dict:
    now = datetime.now().astimezone()
    cutoff = now - timedelta(minutes=since_minutes)

    total = 0
    done = 0
    failed_count = 0
    completion_times = []
    recent_ranks_global = []  # (worker, rank, finished_at)
    recent_bad = 0
    recent_total_codes = 0
    publisher_done = {p: 0 for p in PUBLISHERS}
    publisher_total = {p: 0 for p in PUBLISHERS}
    earliest_started = None
    per_worker = {}

    for w in WORKERS:
        p = workers[w]['progress']
        t = workers[w]['targets']
        targets_list = (t.get('targets') or [])
        wt = len(targets_list)
        total += wt
        done_set = set()
        for v in (p.get('completed', []) or []):
            r = as_rank(v)
            if r is not None:
                done_set.add(r)
        wd = len(done_set)
        done += wd
        wf = len(p.get('failed', []) or [])
        failed_count += wf
        per_worker[w] = {
            'total': wt,
            'done': wd,
            'failed': wf,
            'pending': max(wt - wd - wf, 0),
            'pct': (wd / wt * 100.0) if wt else 0.0,
            'bar': progress_bar(wd, wt),
            'running': p.get('running'),
        }

        for target in targets_list:
            pub = target.get('publisher')
            if pub in publisher_total:
                publisher_total[pub] += 1
                if as_rank(target.get('rank')) in done_set:
                    publisher_done[pub] += 1

        for r in sorted(done_set):
            item = p.get(f'rank_{r}', {})
            if not isinstance(item, dict):
                continue
            finished_at = parse_iso8601(item.get('finished_at'))
            if finished_at is None:
                continue
            completion_times.append(finished_at)
            if finished_at >= cutoff:
                recent_ranks_global.append((w, r, finished_at))
                bad, total_c = parse_illegal_codes(item.get('illegal_codes'))
                recent_bad += bad
                recent_total_codes += total_c

        sa = parse_iso8601(p.get('started_at'))
        if sa is not None:
            if earliest_started is None or sa < earliest_started:
                earliest_started = sa

    pending = max(total - done - failed_count, 0)
    completion_pct = (done / total * 100.0) if total else 0.0
    legal_rate = ((recent_total_codes - recent_bad) / recent_total_codes * 100.0
                  if recent_total_codes else 0.0)
    recent_avg = since_minutes / len(recent_ranks_global) if recent_ranks_global else 0.0

    publishers = []
    for pub in PUBLISHERS:
        wt = publisher_total[pub]
        wd = publisher_done[pub]
        publishers.append({
            'publisher': pub,
            'done': wd,
            'total': wt,
            'pct': (wd / wt * 100.0) if wt else 0.0,
            'bar': progress_bar(wd, wt),
        })

    # ETA
    eta = {'status': 'waiting'}
    if total and done >= total:
        eta = {'status': 'completed'}
    elif done > 0:
        if recent_ranks_global:
            avg_min = since_minutes / len(recent_ranks_global)
            basis = 'recent'
        elif earliest_started:
            elapsed_min = max((now - earliest_started).total_seconds() / 60.0, 0.0)
            avg_min = elapsed_min / done if done else 0.0
            basis = 'overall'
        else:
            avg_min = 0
            basis = 'unknown'

        if avg_min > 0:
            # 並行 3 worker，pending 估算用 pending / 3
            remaining_min = pending / max(len(WORKERS), 1) * avg_min
            finish_at = now + timedelta(minutes=remaining_min)
            eta = {
                'status': 'estimated',
                'basis': basis,
                'avg_min_per_item': avg_min,
                'remaining_minutes': remaining_min,
                'finish_at': finish_at,
            }

    return {
        'job': 'JOB-229',
        'phase': 'Phase 5',
        'report_time': now,
        'since_minutes': since_minutes,
        'total': total,
        'done': done,
        'failed': failed_count,
        'pending': pending,
        'completion_pct': completion_pct,
        'recent': {
            'completed': len(recent_ranks_global),
            'avg_min_per_item': recent_avg,
            'illegal_bad': recent_bad,
            'illegal_total': recent_total_codes,
            'legal_rate_pct': legal_rate,
        },
        'publishers': publishers,
        'workers': per_worker,
        'eta': eta,
    }


def json_ready(summary: dict) -> dict:
    eta = dict(summary['eta'])
    if isinstance(eta.get('finish_at'), datetime):
        eta['finish_at'] = eta['finish_at'].strftime('%Y-%m-%d %H:%M')
    return {
        'job': summary['job'],
        'phase': summary['phase'],
        'report_time': summary['report_time'].isoformat(),
        'since_minutes': summary['since_minutes'],
        'total': summary['total'],
        'done': summary['done'],
        'failed': summary['failed'],
        'pending': summary['pending'],
        'completion_pct': round(summary['completion_pct'], 1),
        'recent': {
            'completed': summary['recent']['completed'],
            'avg_min_per_item': round(summary['recent']['avg_min_per_item'], 1),
            'illegal_bad': summary['recent']['illegal_bad'],
            'illegal_total': summary['recent']['illegal_total'],
            'legal_rate_pct': round(summary['recent']['legal_rate_pct'], 1),
        },
        'publishers': [
            {'publisher': r['publisher'], 'done': r['done'], 'total': r['total'],
             'pct': round(r['pct'], 1), 'bar': r['bar']}
            for r in summary['publishers']
        ],
        'workers': {
            w: {
                'total': v['total'], 'done': v['done'], 'failed': v['failed'],
                'pending': v['pending'], 'pct': round(v['pct'], 1), 'bar': v['bar'],
                'running': v['running'],
            } for w, v in summary['workers'].items()
        },
        'eta': eta,
    }


def print_text(summary: dict) -> None:
    now = summary['report_time']
    recent = summary['recent']

    print(top_border())
    print(box_line('  📊 JOB-229 Phase 5 進度儀表板（並行 3 worker）'))
    print(box_line(f"  🕐 回報時間：{now.strftime('%Y-%m-%d')} (週{weekday_text(now)}) {now.strftime('%H:%M:%S')}"))
    print(bottom_border())
    print(f"  整體：done={summary['done']}  failed={summary['failed']}  pending={summary['pending']}")
    print(f"  完成度：{summary['done']}/{summary['total']} = {fmt_pct(summary['completion_pct'])}")
    print()
    print(f"  近 {summary['since_minutes']} 分鐘增量：")
    print(f"    {recent['completed']} 份完成 | 平均 {recent['avg_min_per_item']:.1f} min/份（單份）")
    print(f"    編碼合法率：{fmt_pct(recent['legal_rate_pct'])}（{recent['illegal_bad']}/{recent['illegal_total']} 違規）")
    print()
    print('  各 worker 進度：')
    for w in WORKERS:
        v = summary['workers'][w]
        print(f"  Worker {w}  {v['bar']}  {v['done']}/{v['total']}  ({int(v['pct'])}%)  failed={v['failed']}")
    print()
    print('  各出版社進度：')
    for row in summary['publishers']:
        print(f"  {row['publisher']}  {row['bar']}  {row['done']}/{row['total']}  ({int(row['pct'])}%)")
    print()
    eta = summary['eta']
    if eta['status'] == 'completed':
        print('  ✅ 已完成')
    elif eta['status'] == 'waiting':
        print('  預估剩餘：等待第一份')
    else:
        remaining = eta['remaining_minutes']
        print(f"  預估剩餘：{remaining:.0f} min ({remaining/60.0:.1f}h)（已考慮並行 {len(WORKERS)} worker）")
        print(f"  預估完成：{eta['finish_at'].strftime('%Y-%m-%d %H:%M')}")
    print(bottom_border())


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description='JOB-229 Phase 5 整合進度儀表板')
    parser.add_argument('--since-minutes', type=int, default=60)
    parser.add_argument('--json', action='store_true', help='輸出 JSON，供 pipeline 串接')
    args = parser.parse_args()
    if args.since_minutes <= 0:
        parser.error('--since-minutes 必須大於 0')
    return args


def main() -> None:
    args = parse_args()
    workers = collect_worker_data()
    summary = build_summary(workers, args.since_minutes)
    if args.json:
        print(json.dumps(json_ready(summary), ensure_ascii=False, indent=2))
    else:
        print_text(summary)


if __name__ == '__main__':
    main()
