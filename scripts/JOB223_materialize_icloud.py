#!/usr/bin/env python3.11
"""Materialize JOB-223 .icloud placeholders where macOS can resolve them."""

from __future__ import annotations

import argparse
import json
import subprocess
from datetime import datetime
from pathlib import Path


ROOT = Path("/Users/s389080/Documents/doc/work/0_AI_Project/eidosProject")
SOURCE_ROOT = ROOT / "knowledge/3_考古題/1_原始檔"
MANIFEST_DIR = ROOT / "knowledge/3_考古題/_manifest"
LOG_PATH = MANIFEST_DIR / "JOB223_icloud_materialize_log.jsonl"


def iso_now() -> str:
    return datetime.now().isoformat(timespec="seconds")


def rel(path: Path) -> str:
    return str(path.relative_to(ROOT))


def original_path_for_placeholder(path: Path) -> Path:
    name = path.name
    if name.startswith("."):
        name = name[1:]
    if name.endswith(".icloud"):
        name = name[: -len(".icloud")]
    return path.with_name(name)


def append_log(event: dict) -> None:
    LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    with LOG_PATH.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps({"ts": iso_now(), **event}, ensure_ascii=False) + "\n")


def materialize(path: Path, timeout_sec: int) -> dict:
    original = original_path_for_placeholder(path)
    before_original_exists = original.exists()
    before_placeholder_exists = path.exists()
    result = subprocess.run(
        ["fileproviderctl", "materialize", str(path)],
        cwd=ROOT,
        text=True,
        capture_output=True,
        timeout=timeout_sec,
    )
    after_original_exists = original.exists()
    after_placeholder_exists = path.exists()
    status = "ok" if after_original_exists else "failed"
    event = {
        "event": "materialize_attempt",
        "status": status,
        "placeholder": rel(path),
        "expected_original": rel(original),
        "before_original_exists": before_original_exists,
        "before_placeholder_exists": before_placeholder_exists,
        "after_original_exists": after_original_exists,
        "after_placeholder_exists": after_placeholder_exists,
        "returncode": result.returncode,
        "stdout_tail": result.stdout[-1000:],
        "stderr_tail": result.stderr[-1000:],
    }
    append_log(event)
    return event


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--max-files", type=int)
    parser.add_argument("--timeout-sec", type=int, default=90)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    placeholders = sorted(SOURCE_ROOT.rglob("*.icloud"))
    if args.max_files is not None:
        placeholders = placeholders[: args.max_files]

    print(f"Selected {len(placeholders)} .icloud placeholders")
    if args.dry_run:
        for path in placeholders:
            print(f"- {rel(path)} -> {rel(original_path_for_placeholder(path))}")
        return

    ok = 0
    failed = 0
    for idx, path in enumerate(placeholders, 1):
        print(f"[{idx}/{len(placeholders)}] {rel(path)}", flush=True)
        try:
            event = materialize(path, args.timeout_sec)
        except subprocess.TimeoutExpired:
            append_log(
                {
                    "event": "materialize_timeout",
                    "placeholder": rel(path),
                    "expected_original": rel(original_path_for_placeholder(path)),
                    "timeout_sec": args.timeout_sec,
                }
            )
            failed += 1
            continue
        if event["status"] == "ok":
            ok += 1
        else:
            failed += 1
    print(f"Materialize finished: ok={ok} failed={failed}")


if __name__ == "__main__":
    main()
