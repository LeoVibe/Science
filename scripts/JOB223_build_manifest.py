#!/usr/bin/env python3.11
"""Build source manifest and progress baseline for JOB-223."""

from __future__ import annotations

import json
from collections import Counter
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path


ROOT = Path("/Users/s389080/Documents/doc/work/0_AI_Project/eidosProject")
SOURCE_ROOT = ROOT / "knowledge/3_考古題/1_原始檔"
CLAUDE_ROOT = ROOT / "knowledge/3_考古題/2_MD淬鍊文字_Claude"
CODEX_ROOT = ROOT / "knowledge/3_考古題/2_MD淬鍊文字_Codex"
MANIFEST_DIR = ROOT / "knowledge/3_考古題/_manifest"

SOURCE_MANIFEST_PATH = MANIFEST_DIR / "JOB223_source_manifest.json"
PROGRESS_PATH = MANIFEST_DIR / "JOB223_progress.json"

SEMESTERS = ("三下", "四下", "五下", "六下")
CONVERTABLE_EXTS = {".pdf", ".doc", ".docx"}
IMAGE_SKIP_EXTS = {".jpg", ".jpeg", ".png"}
MEDIA_SKIP_EXTS = {".mp3", ".m4a", ".wav", ".aac", ".mp4"}


@dataclass(frozen=True)
class ComboParts:
    semester: str
    subject: str
    publisher: str


def now_iso() -> str:
    return datetime.now().isoformat(timespec="seconds")


def rel_to_root(path: Path) -> str:
    return str(path.relative_to(ROOT))


def parse_combo_name(combo_name: str) -> ComboParts:
    parts = combo_name.split("_", 2)
    if len(parts) != 3:
        raise ValueError(f"Unexpected combo name: {combo_name}")
    semester, subject, publisher = parts
    return ComboParts(semester=semester, subject=subject, publisher=publisher)


def suffix_key(path: Path) -> str:
    return path.suffix.lower() if path.suffix else "(no_suffix)"


def build_source_manifest() -> dict:
    generated_at = now_iso()
    summary_counts = Counter()
    convertable_counts = Counter()
    skip_image_counts = Counter()
    skip_media_counts = Counter()
    combo_records: list[dict] = []
    file_records: list[dict] = []

    for semester in SEMESTERS:
        sem_dir = SOURCE_ROOT / semester
        for combo_dir in sorted(p for p in sem_dir.iterdir() if p.is_dir()):
            combo_parts = parse_combo_name(combo_dir.name)
            combo_counts = Counter()
            combo_convertable = 0
            combo_skip_media = 0
            combo_skip_image = 0
            combo_other = 0
            total_bytes = 0

            for file_path in sorted(p for p in combo_dir.iterdir() if p.is_file()):
                suffix = suffix_key(file_path)
                size_bytes = file_path.stat().st_size
                total_bytes += size_bytes
                combo_counts[suffix] += 1
                summary_counts[suffix] += 1

                is_convertable = suffix in CONVERTABLE_EXTS
                is_skip_image = suffix in IMAGE_SKIP_EXTS
                is_skip_media = suffix in MEDIA_SKIP_EXTS
                is_icloud = suffix == ".icloud"

                if is_convertable:
                    convertable_counts[suffix] += 1
                    combo_convertable += 1
                elif is_skip_image:
                    skip_image_counts[suffix] += 1
                    combo_skip_image += 1
                elif is_skip_media:
                    skip_media_counts[suffix] += 1
                    combo_skip_media += 1
                elif not is_icloud:
                    combo_other += 1

                file_records.append(
                    {
                        "semester": semester,
                        "combo": combo_dir.name,
                        "relative_path": rel_to_root(file_path),
                        "filename": file_path.name,
                        "suffix": suffix,
                        "size_bytes": size_bytes,
                        "convertable": is_convertable,
                        "skip_image": is_skip_image,
                        "skip_media": is_skip_media,
                        "icloud_placeholder": is_icloud,
                    }
                )

            combo_records.append(
                {
                    "semester": semester,
                    "combo": combo_dir.name,
                    "subject": combo_parts.subject,
                    "publisher": combo_parts.publisher,
                    "source_dir": rel_to_root(combo_dir),
                    "target_dir": rel_to_root(CODEX_ROOT / semester / combo_dir.name),
                    "file_counts": dict(sorted(combo_counts.items())),
                    "convertable_file_count": combo_convertable,
                    "skip_image_file_count": combo_skip_image,
                    "skip_media_file_count": combo_skip_media,
                    "other_file_count": combo_other,
                    "total_size_bytes": total_bytes,
                }
            )

    claude_md_count = sum(1 for path in CLAUDE_ROOT.rglob("*.md") if not path.name.startswith("_"))
    claude_index_count = sum(1 for _ in CLAUDE_ROOT.rglob("_index.json"))
    claude_doc_index_count = sum(1 for _ in CLAUDE_ROOT.rglob("_doc_index.json"))

    return {
        "job": "JOB-223",
        "generated_at": generated_at,
        "source_root": rel_to_root(SOURCE_ROOT),
        "claude_root": rel_to_root(CLAUDE_ROOT),
        "codex_root": rel_to_root(CODEX_ROOT),
        "summary": {
            "semester_count": len(SEMESTERS),
            "combo_count": len(combo_records),
            "file_count": len(file_records),
            "convertable_total": sum(convertable_counts.values()),
            "icloud_placeholder_total": summary_counts[".icloud"],
            "skip_image_total": sum(skip_image_counts.values()),
            "skip_media_total": sum(skip_media_counts.values()),
            "file_counts_by_suffix": dict(sorted(summary_counts.items())),
            "convertable_counts_by_suffix": dict(sorted(convertable_counts.items())),
            "skip_image_counts_by_suffix": dict(sorted(skip_image_counts.items())),
            "skip_media_counts_by_suffix": dict(sorted(skip_media_counts.items())),
            "claude_baseline": {
                "md_count": claude_md_count,
                "index_count": claude_index_count,
                "doc_index_count": claude_doc_index_count,
            },
        },
        "combos": combo_records,
        "files": file_records,
    }


def build_progress(manifest: dict) -> list[dict]:
    generated_at = manifest["generated_at"]
    progress_records = []
    existing_by_combo = {}
    if PROGRESS_PATH.exists():
        existing = json.loads(PROGRESS_PATH.read_text(encoding="utf-8"))
        existing_by_combo = {row["combo"]: row for row in existing}

    for combo in manifest["combos"]:
        record = {
            "combo": combo["combo"],
            "semester": combo["semester"],
            "subject": combo["subject"],
            "publisher": combo["publisher"],
            "source_dir": combo["source_dir"],
            "target_dir": combo["target_dir"],
            "counts": combo["file_counts"],
            "convertable_file_count": combo["convertable_file_count"],
            "status": "pending",
            "phase": "phase0",
            "pilot_sample": False,
            "last_updated": generated_at,
            "notes": "",
        }
        existing = existing_by_combo.get(combo["combo"])
        if existing:
            record.update(
                {
                    key: value
                    for key, value in existing.items()
                    if key
                    not in {
                        "semester",
                        "subject",
                        "publisher",
                        "source_dir",
                        "target_dir",
                        "counts",
                        "convertable_file_count",
                    }
                }
            )
        progress_records.append(record)

    return progress_records


def main() -> None:
    MANIFEST_DIR.mkdir(parents=True, exist_ok=True)
    CODEX_ROOT.mkdir(parents=True, exist_ok=True)

    manifest = build_source_manifest()
    progress = build_progress(manifest)

    SOURCE_MANIFEST_PATH.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    PROGRESS_PATH.write_text(
        json.dumps(progress, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    print(f"Wrote {rel_to_root(SOURCE_MANIFEST_PATH)}")
    print(f"Wrote {rel_to_root(PROGRESS_PATH)}")
    print(json.dumps(manifest["summary"], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
