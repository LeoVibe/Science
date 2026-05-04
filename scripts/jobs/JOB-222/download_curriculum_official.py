#!/usr/bin/env python3
"""JOB-222 Phase C：依 manifest_draft.json 批次下載所有保留檔案

策略：
  - 按 url 去重（避免 NAER 同一發布令重複掛在多個分組）
  - 補充文件目錄下按 group_title 子分目錄
  - 每檔最多重試 3 次，超時 90 秒
  - 計算 SHA256，產出 _manifest/課綱檔案清單.json
  - 失敗清單寫 _manifest/download_failures.json

輸出目錄：
  knowledge/1_課綱研究/108課綱研究成果/1_課綱原始檔案/{總綱,國語文,英語文,數學,自然科學,社會,補充文件/{group}}/
"""
import hashlib
import json
import re
import sys
import time
from datetime import datetime
from pathlib import Path

import urllib.request
import urllib.error
import urllib.parse

ROOT = Path(__file__).resolve().parent.parent.parent.parent  # repo root
MANIFEST_DRAFT = Path(__file__).parent / "manifest_draft.json"
RAW_BASE = ROOT / "knowledge" / "1_課綱研究" / "108課綱研究成果" / "1_課綱原始檔案"
MANIFEST_DIR = ROOT / "knowledge" / "1_課綱研究" / "108課綱研究成果" / "_manifest"
MANIFEST_DIR.mkdir(parents=True, exist_ok=True)

USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120 Safari/537.36"
)
TIMEOUT = 90
RETRIES = 3


def sanitize_dirname(name: str) -> str:
    # 補充文件下用 group_title 為子目錄名，去掉檔名不友善字元
    n = name.replace("/", "_").replace("\\", "_")
    n = re.sub(r"\s+", "", n)
    return n


def target_path(row: dict) -> Path:
    sub = row["target_subdir"]
    if sub == "補充文件":
        group_dir = sanitize_dirname(row["group_title"])
        return RAW_BASE / sub / group_dir / row["filename"]
    return RAW_BASE / sub / row["filename"]


def download_one(url: str, dest: Path) -> dict:
    """回傳 {ok, size, sha256, attempts, error?}"""
    dest.parent.mkdir(parents=True, exist_ok=True)
    # 路徑部分需 percent-encode（NAER URL 帶中文）
    parsed = urllib.parse.urlsplit(url)
    safe_path = urllib.parse.quote(parsed.path, safe="/()")
    encoded_url = urllib.parse.urlunsplit(
        (parsed.scheme, parsed.netloc, safe_path, parsed.query, parsed.fragment)
    )
    last_err = None
    for attempt in range(1, RETRIES + 1):
        try:
            req = urllib.request.Request(encoded_url, headers={"User-Agent": USER_AGENT})
            with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
                data = resp.read()
            dest.write_bytes(data)
            sha = hashlib.sha256(data).hexdigest()
            return {
                "ok": True,
                "size": len(data),
                "sha256": sha,
                "attempts": attempt,
            }
        except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, OSError) as e:
            last_err = repr(e)
            if attempt < RETRIES:
                time.sleep(1.5 * attempt)
    return {"ok": False, "size": 0, "sha256": None, "attempts": RETRIES, "error": last_err}


def main():
    rows = json.loads(MANIFEST_DRAFT.read_text(encoding="utf-8"))
    # 去重（url）
    seen, deduped = set(), []
    for r in rows:
        if r["url"] in seen:
            continue
        seen.add(r["url"])
        deduped.append(r)
    print(f"manifest 共 {len(rows)} 筆，去重後 {len(deduped)} 筆")

    manifest, failures = [], []
    started = datetime.now().isoformat(timespec="seconds")
    t0 = time.time()
    for i, r in enumerate(deduped, 1):
        dest = target_path(r)
        rel = dest.relative_to(ROOT)
        # 已存在則略過下載但仍計算 SHA
        if dest.exists() and dest.stat().st_size > 0:
            data = dest.read_bytes()
            entry = {
                "ok": True,
                "size": len(data),
                "sha256": hashlib.sha256(data).hexdigest(),
                "attempts": 0,
                "skipped_existing": True,
            }
        else:
            entry = download_one(r["url"], dest)
        elapsed = time.time() - t0
        flag = "✓" if entry["ok"] else "✗"
        kb = entry["size"] / 1024
        print(f"  [{i:2d}/{len(deduped)}] {flag} {kb:7.1f} KB  {rel}  (try={entry['attempts']}, t={elapsed:.0f}s)")
        record = {
            **r,
            "local_path": str(rel),
            "fetched_at": datetime.now().isoformat(timespec="seconds"),
            "size_bytes": entry["size"],
            "sha256": entry["sha256"],
            "attempts": entry["attempts"],
            "skipped_existing": entry.get("skipped_existing", False),
        }
        if entry["ok"]:
            manifest.append(record)
        else:
            record["error"] = entry["error"]
            failures.append(record)

    finished = datetime.now().isoformat(timespec="seconds")

    out_manifest = MANIFEST_DIR / "課綱檔案清單.json"
    out_failures = MANIFEST_DIR / "download_failures.json"
    out_manifest.write_text(json.dumps({
        "started": started,
        "finished": finished,
        "total": len(deduped),
        "succeeded": len(manifest),
        "failed": len(failures),
        "files": manifest,
    }, ensure_ascii=False, indent=2), encoding="utf-8")
    if failures:
        out_failures.write_text(json.dumps(failures, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"\n下載完成。成功 {len(manifest)} / 失敗 {len(failures)} / 總計 {len(deduped)}")
    print(f"  → {out_manifest}")
    if failures:
        print(f"  → {out_failures}（失敗清單）")


if __name__ == "__main__":
    sys.exit(main())
