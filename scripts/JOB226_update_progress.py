#!/usr/bin/env python3
"""
JOB-226 progress.json 更新腳本

用法：
  # combo 開始時
  python3 scripts/JOB226_update_progress.py --combo 三下_社會_翰林 --status in_progress

  # combo 結案
  python3 scripts/JOB226_update_progress.py --combo 三下_社會_翰林 --status done \\
    --integrated-count 35 --codex-sample-pass PASS

  # 標記 partial
  python3 scripts/JOB226_update_progress.py --combo 三下_社會_翰林 --status partial \\
    --integrated-count 33 --error-note "2 份 Codex 連續失敗待重跑"
"""
from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime
from pathlib import Path


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--combo", required=True)
    p.add_argument("--status", required=True,
                   choices=["pending", "in_progress", "done", "partial", "failed"])
    p.add_argument("--integrated-count", type=int, default=None)
    p.add_argument("--codex-sample-pass", default=None,
                   help="PASS / FAIL / PM_substitute_pass / -")
    p.add_argument("--error-note", default=None)
    p.add_argument("--token-used", type=int, default=None)
    p.add_argument("--progress-json", default="jobs/JOB-226-progress.json")
    args = p.parse_args()

    pj = Path(args.progress_json)
    d = json.loads(pj.read_text(encoding="utf-8"))

    target = None
    for c in d["combos"]:
        if c["combo"] == args.combo:
            target = c
            break
    if target is None:
        print(f"❌ 找不到 combo：{args.combo}", file=sys.stderr); sys.exit(1)

    now = datetime.now().isoformat(timespec="seconds")
    target["status"] = args.status
    target["last_attempt"] = now

    if args.status == "in_progress" and not target.get("started_at"):
        target["started_at"] = now
    if args.status in ("done", "partial", "failed"):
        target["completed_at"] = now
    if args.integrated_count is not None:
        target["integrated_count"] = args.integrated_count
    if args.codex_sample_pass is not None:
        target["codex_sample_pass"] = args.codex_sample_pass
    if args.error_note is not None:
        target["error_note"] = args.error_note
    if args.token_used is not None:
        target["token_used"] = args.token_used

    d["updated_at"] = now
    pj.write_text(json.dumps(d, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"✅ 更新 {args.combo} → {args.status}")
    print(f"   integrated_count: {target.get('integrated_count')}")
    print(f"   codex_sample_pass: {target.get('codex_sample_pass')}")
    print(f"   error_note: {target.get('error_note')}")


if __name__ == "__main__":
    main()
