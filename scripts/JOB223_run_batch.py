#!/usr/bin/env python3.11
"""Batch runner for JOB-223 combo conversion.

Runs pending combos one by one, retries transient failures, and records failures
without blocking the whole overnight batch.
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
import tempfile
from datetime import datetime
from pathlib import Path


ROOT = Path("/Users/s389080/Documents/doc/work/0_AI_Project/eidosProject")
MANIFEST_PATH = ROOT / "knowledge/3_考古題/_manifest/JOB223_source_manifest.json"
PROGRESS_PATH = ROOT / "knowledge/3_考古題/_manifest/JOB223_progress.json"
LOG_PATH = ROOT / "knowledge/3_考古題/_manifest/JOB223_batch_log.jsonl"
DISTILL_SCRIPT = ROOT / "scripts/JOB223_distill_to_md.py"


def iso_now() -> str:
    return datetime.now().isoformat(timespec="seconds")


def load_json(path: Path):
    text = path.read_text(encoding="utf-8")
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        if path.name == "JOB223_progress.json" and text.endswith("]]"):
            return json.loads(text[:-1])
        raise


def save_progress(rows: list[dict]) -> None:
    with tempfile.NamedTemporaryFile(
        "w",
        encoding="utf-8",
        dir=PROGRESS_PATH.parent,
        prefix="JOB223_progress_",
        suffix=".tmp",
        delete=False,
    ) as fh:
        json.dump(rows, fh, ensure_ascii=False, indent=2)
        fh.write("\n")
        tmp_name = fh.name
    Path(tmp_name).replace(PROGRESS_PATH)


def update_progress(combo: str, **updates) -> None:
    rows = load_json(PROGRESS_PATH)
    for row in rows:
        if row.get("combo") == combo:
            row.update(updates)
            row["last_updated"] = iso_now()
            break
    save_progress(rows)


def append_log(event: dict) -> None:
    LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    event = {"ts": iso_now(), **event}
    with LOG_PATH.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(event, ensure_ascii=False) + "\n")


def combo_matches_mode(combo: dict, mode: str) -> bool:
    counts = combo["file_counts"]
    has_icloud = counts.get(".icloud", 0) > 0
    has_word = counts.get(".doc", 0) > 0 or counts.get(".docx", 0) > 0

    if mode == "no-icloud":
        return not has_icloud
    if mode == "no-icloud-pdf-only":
        return not has_icloud and not has_word
    if mode == "no-icloud-word":
        return not has_icloud and has_word
    if mode == "with-icloud":
        return has_icloud
    if mode == "all-pending":
        return True
    raise ValueError(f"unknown mode: {mode}")


def select_combos(manifest: dict, progress: list[dict], mode: str, include_blocked: bool) -> list[dict]:
    progress_by_combo = {row["combo"]: row for row in progress}
    selected: list[dict] = []
    for combo in manifest["combos"]:
        row = progress_by_combo.get(combo["combo"], {})
        status = row.get("status", "pending")
        if status == "done":
            continue
        if status == "blocked" and not include_blocked:
            continue
        if status not in {"pending", "blocked"}:
            continue
        if combo_matches_mode(combo, mode):
            selected.append(combo)
    return selected


def sort_combos(combos: list[dict], sort: str) -> list[dict]:
    if sort == "size-desc":
        return sorted(combos, key=lambda c: (-c["convertable_file_count"], c["semester"], c["combo"]))
    if sort == "size-asc":
        return sorted(combos, key=lambda c: (c["convertable_file_count"], c["semester"], c["combo"]))
    if sort == "manifest":
        return combos
    raise ValueError(f"unknown sort: {sort}")


def run_combo(combo: dict, max_attempts: int, timeout_sec: int) -> bool:
    combo_name = combo["combo"]
    cmd = [
        sys.executable,
        str(DISTILL_SCRIPT),
        "--semester",
        combo["semester"],
        "--subject",
        combo["subject"],
        "--publisher",
        combo["publisher"],
    ]

    for attempt in range(1, max_attempts + 1):
        append_log(
            {
                "event": "attempt_start",
                "combo": combo_name,
                "attempt": attempt,
                "cmd": cmd,
            }
        )
        print(f"\n=== JOB-223 {combo_name} attempt {attempt}/{max_attempts} ===", flush=True)
        try:
            result = subprocess.run(
                cmd,
                cwd=ROOT,
                text=True,
                capture_output=True,
                timeout=timeout_sec,
            )
        except subprocess.TimeoutExpired as exc:
            stdout_tail = (exc.stdout or "")[-4000:] if isinstance(exc.stdout, str) else ""
            stderr_tail = (exc.stderr or "")[-4000:] if isinstance(exc.stderr, str) else ""
            append_log(
                {
                    "event": "attempt_timeout",
                    "combo": combo_name,
                    "attempt": attempt,
                    "timeout_sec": timeout_sec,
                    "stdout_tail": stdout_tail,
                    "stderr_tail": stderr_tail,
                }
            )
            print(
                f"Timed out after {timeout_sec}s; retrying or recording skip if attempts are exhausted.",
                file=sys.stderr,
                flush=True,
            )
            continue
        append_log(
            {
                "event": "attempt_finish",
                "combo": combo_name,
                "attempt": attempt,
                "returncode": result.returncode,
                "stdout_tail": result.stdout[-4000:],
                "stderr_tail": result.stderr[-4000:],
            }
        )
        print(result.stdout[-4000:], end="", flush=True)
        if result.stderr:
            print(result.stderr[-4000:], end="", file=sys.stderr, flush=True)
        if result.returncode == 0:
            return True

    update_progress(
        combo_name,
        status="blocked",
        phase="implementation",
        notes=f"batch runner failed after {max_attempts} attempts; see JOB223_batch_log.jsonl",
        runner_failed_at=iso_now(),
        runner_attempts=max_attempts,
    )
    append_log({"event": "combo_blocked_after_retries", "combo": combo_name, "attempts": max_attempts})
    return False


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", choices=["no-icloud", "no-icloud-pdf-only", "no-icloud-word", "with-icloud", "all-pending"], default="no-icloud")
    parser.add_argument("--sort", choices=["size-asc", "size-desc", "manifest"], default="size-asc")
    parser.add_argument("--max-attempts", type=int, default=3)
    parser.add_argument("--max-combos", type=int)
    parser.add_argument("--timeout-sec", type=int, default=3600)
    parser.add_argument("--include-blocked", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    manifest = load_json(MANIFEST_PATH)
    progress = load_json(PROGRESS_PATH)
    combos = sort_combos(select_combos(manifest, progress, args.mode, args.include_blocked), args.sort)
    if args.max_combos is not None:
        combos = combos[: args.max_combos]

    print(f"Selected {len(combos)} combos for mode={args.mode} sort={args.sort}", flush=True)
    for combo in combos:
        print(
            f"- {combo['combo']} convertable={combo['convertable_file_count']} counts={combo['file_counts']}",
            flush=True,
        )

    if args.dry_run:
        return

    append_log(
        {
            "event": "batch_start",
            "mode": args.mode,
            "sort": args.sort,
            "combo_count": len(combos),
            "max_attempts": args.max_attempts,
        }
    )
    ok_count = 0
    failed_count = 0
    for combo in combos:
        if run_combo(combo, args.max_attempts, args.timeout_sec):
            ok_count += 1
        else:
            failed_count += 1
    append_log(
        {
            "event": "batch_finish",
            "mode": args.mode,
            "ok_count": ok_count,
            "failed_count": failed_count,
        }
    )
    print(f"\nBatch finished: ok={ok_count} failed={failed_count}", flush=True)


if __name__ == "__main__":
    main()
