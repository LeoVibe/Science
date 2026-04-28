#!/usr/bin/env python3
"""用 Playwright 重新掃描所有 drive_manifest 內的 folder，抓實際檔案清單。

設計：
- 單 browser，多 context 並行（預設 3 context）
- 讀 data-tooltip 屬性取得檔名（格式：{filename} {類型} ...）
- 支援 resume：已掃過的 folder_id 跳過
- 中斷可重跑，output 每 10 個 folder flush 一次
"""

from __future__ import annotations

import argparse
import asyncio
import json
import re
import time
from pathlib import Path
from typing import Any


REPO_ROOT = Path(__file__).resolve().parents[1]
MANIFEST_DIR = REPO_ROOT / "knowledge" / "3_考古題" / "_manifest"
DRIVE_MANIFEST_PATH = MANIFEST_DIR / "drive_manifest_G1_G6.json"
OUTPUT_PATH = MANIFEST_DIR / "manifest_rescan_G1_G6.json"

FILE_EXTS = re.compile(
    r"\.(pdf|doc|docx|mp3|jpg|jpeg|png|m4a|mp4|zip|wav|textclipping|aac|xls|xlsx|ppt|pptx)(\s|$)",
    re.IGNORECASE,
)


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def dump_json(path: Path, data: Any) -> None:
    path.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


async def _extract_files_from_page(page) -> list[str]:
    """從當前頁面的 data-tooltip 解析檔名清單。"""
    tooltips = await page.locator("[data-tooltip]").all()
    files: list[str] = []
    seen: set[str] = set()
    for t in tooltips:
        tt = await t.get_attribute("data-tooltip")
        if not tt:
            continue
        m = FILE_EXTS.search(tt)
        if not m:
            continue
        fname = tt[: m.end() - len(m.group(2))].strip()
        if fname and fname not in seen:
            seen.add(fname)
            files.append(fname)
    return files


async def scan_folder(page, folder_url: str) -> list[str]:
    """掃單一 folder，回傳檔名清單。含 virtual scroll 處理，可讀完 >50 檔的 folder。"""
    await page.goto(folder_url, wait_until="commit", timeout=20000)
    # 初始等待 SPA render
    for wait_ms in (6000, 4000, 4000):
        await page.wait_for_timeout(wait_ms)
        files = await _extract_files_from_page(page)
        if files:
            break
    if not files:
        return files  # 真的空 folder

    # Virtual scroll：滾動 C-WIZ 容器（Drive 主內容區），反覆直到檔案數不再增加
    last_count = len(files)
    stable_rounds = 0
    max_scroll_rounds = 30  # 最多 30 次，理論上可達 ~1500 檔
    for _ in range(max_scroll_rounds):
        await page.evaluate(
            "() => { document.querySelectorAll('C-WIZ').forEach(e => {"
            "  if (e.scrollHeight > e.clientHeight + 20) e.scrollTop = e.scrollHeight;"
            "}); }"
        )
        await page.wait_for_timeout(800)
        new_files = await _extract_files_from_page(page)
        if len(new_files) > last_count:
            last_count = len(new_files)
            files = new_files
            stable_rounds = 0
        else:
            stable_rounds += 1
            if stable_rounds >= 2:  # 連續 2 輪沒新增就結束
                break
    return files


async def worker(
    worker_id: int,
    browser,
    queue: asyncio.Queue,
    results: dict,
    done_set: set,
    save_lock: asyncio.Lock,
    save_interval: int,
):
    context = await browser.new_context()
    page = await context.new_page()
    processed = 0
    try:
        while True:
            try:
                rec = await asyncio.wait_for(queue.get(), timeout=5)
            except asyncio.TimeoutError:
                break
            folder_id = rec["folder_id"]
            url = rec["url"]
            try:
                files = await scan_folder(page, url)
                results[folder_id] = {
                    "folder_id": folder_id,
                    "grade": rec["grade"],
                    "semester": rec["semester"],
                    "subject": rec["subject"],
                    "publisher": rec["publisher"],
                    "exam_type": rec["exam_type"],
                    "url": url,
                    "files": files,
                    "status": "ok",
                }
                print(
                    f"[worker{worker_id}] ✅ {rec['grade']} {rec['semester']} "
                    f"{rec['subject']} {rec['publisher']} {rec['exam_type']} -> {len(files)} 檔",
                    flush=True,
                )
            except Exception as e:
                results[folder_id] = {
                    "folder_id": folder_id,
                    "grade": rec["grade"],
                    "semester": rec["semester"],
                    "subject": rec["subject"],
                    "publisher": rec["publisher"],
                    "exam_type": rec["exam_type"],
                    "url": url,
                    "files": [],
                    "status": "error",
                    "error": str(e)[:200],
                }
                print(
                    f"[worker{worker_id}] ❌ {rec['grade']} {rec['subject']} "
                    f"{rec['exam_type']}: {str(e)[:80]}",
                    flush=True,
                )
            done_set.add(folder_id)
            processed += 1
            if processed % save_interval == 0:
                async with save_lock:
                    save_results(results)
            queue.task_done()
    finally:
        await context.close()


def save_results(results: dict):
    payload = {
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "source": "Playwright rescan (anonymous context, data-tooltip scrape)",
        "total": len(results),
        "records": list(results.values()),
    }
    OUTPUT_PATH.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


async def main_async(parallel: int, limit: int | None, only: list[str] | None):
    from playwright.async_api import async_playwright

    drive_manifest = load_json(DRIVE_MANIFEST_PATH)
    all_records = drive_manifest["records"]

    # resume：讀取既有 output
    results: dict = {}
    if OUTPUT_PATH.exists():
        old = load_json(OUTPUT_PATH)
        for r in old.get("records", []):
            results[r["folder_id"]] = r
        print(f"既有 {len(results)} 筆紀錄")

    if only:
        # 強制重掃指定 folder_id（不跳過）
        only_set = set(only)
        to_scan = [r for r in all_records if r["folder_id"] in only_set]
        print(f"指定重掃 {len(to_scan)} 個 folder（--only 模式）")
    else:
        # 一般模式：跳過已 ok 的
        ok_fids = {fid for fid, r in results.items() if r.get("status") == "ok"}
        to_scan = [r for r in all_records if r["folder_id"] not in ok_fids]
        if limit:
            to_scan = to_scan[:limit]
        print(f"本次需掃 {len(to_scan)} 個 folder，並行 {parallel}")

    queue: asyncio.Queue = asyncio.Queue()
    for rec in to_scan:
        queue.put_nowait(rec)

    done_set: set = set()
    save_lock = asyncio.Lock()

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        workers = [
            asyncio.create_task(
                worker(i, browser, queue, results, done_set, save_lock, save_interval=5)
            )
            for i in range(parallel)
        ]
        await asyncio.gather(*workers)
        await browser.close()

    save_results(results)
    print(f"\n完成：共 {len(results)} 筆，輸出 {OUTPUT_PATH}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--parallel", type=int, default=3)
    parser.add_argument("--limit", type=int, default=None, help="僅掃前 N 個（測試用）")
    parser.add_argument("--only-file", type=str, default=None,
                        help="JSON 檔路徑，內含 folder_id 清單，僅重掃這些")
    args = parser.parse_args()
    only = None
    if args.only_file:
        only = json.loads(Path(args.only_file).read_text())
    asyncio.run(main_async(parallel=args.parallel, limit=args.limit, only=only))


if __name__ == "__main__":
    main()
