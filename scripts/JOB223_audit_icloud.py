#!/usr/bin/env python3.11
"""Audit .icloud placeholders for JOB-223."""

from __future__ import annotations

import json
import plistlib
from collections import Counter
from datetime import datetime
from pathlib import Path


ROOT = Path("/Users/s389080/Documents/doc/work/0_AI_Project/eidosProject")
SOURCE_ROOT = ROOT / "knowledge/3_考古題/1_原始檔"
MANIFEST_DIR = ROOT / "knowledge/3_考古題/_manifest"
JSON_OUT = MANIFEST_DIR / "JOB223_icloud_placeholders.json"
MD_OUT = MANIFEST_DIR / "JOB223_icloud_placeholders.md"


def rel(path: Path) -> str:
    return str(path.relative_to(ROOT))


def original_path_for_placeholder(path: Path) -> Path:
    name = path.name
    if name.startswith("."):
        name = name[1:]
    if name.endswith(".icloud"):
        name = name[: -len(".icloud")]
    return path.with_name(name)


def read_placeholder(path: Path) -> dict:
    try:
        with path.open("rb") as fh:
            data = plistlib.load(fh)
    except Exception as exc:
        return {"parse_error": str(exc)}
    return {
        "icloud_name": data.get("NSURLNameKey"),
        "icloud_size": data.get("NSURLFileSizeKey"),
        "icloud_resource_type": data.get("NSURLFileResourceTypeKey"),
    }


def main() -> None:
    placeholders = sorted(SOURCE_ROOT.rglob("*.icloud"))
    records = []
    by_combo = Counter()
    materialized = 0
    for path in placeholders:
        combo = path.parent.name
        original = original_path_for_placeholder(path)
        exists = original.exists()
        if exists:
            materialized += 1
        by_combo[combo] += 1
        records.append(
            {
                "combo": combo,
                "semester": path.parents[1].name,
                "placeholder": rel(path),
                "expected_original": rel(original),
                "expected_original_exists": exists,
                **read_placeholder(path),
            }
        )

    materialize_note = (
        "No .icloud placeholders remain; previously detected placeholders were materialized "
        "by scripts/JOB223_materialize_icloud.py."
        if not records
        else (
            "fileproviderctl materialize should be judged by expected_original_exists, "
            "because it may return a non-zero code even when the file materializes."
        )
    )

    payload = {
        "job": "JOB-223",
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "summary": {
            "placeholder_count": len(records),
            "expected_original_exists_count": materialized,
            "missing_original_count": len(records) - materialized,
            "combo_count": len(by_combo),
            "materialize_result": materialize_note,
        },
        "by_combo": dict(sorted(by_combo.items())),
        "files": records,
    }
    JSON_OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        "# JOB-223 iCloud Placeholder Audit",
        "",
        f"- generated_at: `{payload['generated_at']}`",
        f"- placeholder_count: `{len(records)}`",
        f"- expected_original_exists_count: `{materialized}`",
        f"- missing_original_count: `{len(records) - materialized}`",
        f"- materialize_result: `{materialize_note}`",
        "",
        "## By Combo",
        "",
    ]
    for combo, count in sorted(by_combo.items()):
        lines.append(f"- `{combo}`: `{count}`")
    lines += ["", "## Files", ""]
    for record in records:
        status = "exists" if record["expected_original_exists"] else "missing"
        lines.append(
            f"- `{record['combo']}` `{status}` `{record['expected_original']}` "
            f"placeholder=`{record['placeholder']}`"
        )
    MD_OUT.write_text("\n".join(lines) + "\n", encoding="utf-8")

    print(f"Wrote {rel(JSON_OUT)}")
    print(f"Wrote {rel(MD_OUT)}")
    print(json.dumps(payload["summary"], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
