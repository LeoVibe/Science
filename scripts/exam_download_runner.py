#!/usr/bin/env python3
"""建立並執行米蘭考古題 Drive 下載進度佇列。"""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
import time
from collections import defaultdict
from datetime import datetime
from pathlib import Path
from typing import Any


REPO_ROOT = Path(__file__).resolve().parents[1]
MANIFEST_DIR = REPO_ROOT / "knowledge" / "3_考古題" / "_manifest"
DRIVE_MANIFEST_PATH = MANIFEST_DIR / "drive_manifest_G1_G6.json"
PDF_MANIFEST_PATH = MANIFEST_DIR / "pdf_manifest_G1_G6.json"
PROGRESS_PATH = MANIFEST_DIR / "download_progress.json"
RAW_BASE_DIR = REPO_ROOT / "knowledge" / "3_考古題" / "1_原始檔"
GDOWN_CLI_CANDIDATES = [
    Path.home() / "Library" / "Python" / "3.11" / "bin" / "gdown",
    Path.home() / "Library" / "Python" / "3.9" / "bin" / "gdown",
]

DEFAULT_BATCH_SIZE = 30
WAIT_BETWEEN_DRIVES = 45
WAIT_AFTER_EVERY = 3
WAIT_AFTER_BATCH = 8 * 60

SEMESTER_PRIORITY = {"下學期": 0, "上學期": 1}
# 2026-04-26 用戶指定新順序：G3 → G4 → G5 → G6 → G1 → G2
GRADE_PRIORITY = {"G3": 0, "G4": 1, "G5": 2, "G6": 3, "G1": 4, "G2": 5}
SUBJECT_PRIORITY = {
    "國語": 0,
    "數學": 1,
    "自然": 2,
    "社會": 3,
    "英語": 4,
    "健體": 5,
    "生活": 6,
}
PUBLISHER_PRIORITY = {"南一": 0, "康軒": 1, "翰林": 2}
GRADE_LABEL = {"G1": "一", "G2": "二", "G3": "三", "G4": "四", "G5": "五", "G6": "六"}
SEMESTER_SUFFIX = {"上學期": "上", "下學期": "下"}


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def dump_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def now_text() -> str:
    return datetime.now().isoformat(timespec="seconds")


def local_path_for(record: dict[str, Any]) -> str:
    grade = record["grade"]
    semester = record["semester"]
    subject = record["subject"]
    publisher = record["publisher"]
    semester_label = f"{GRADE_LABEL[grade]}{SEMESTER_SUFFIX[semester]}"
    # 健體獨立資料夾（用戶 2026-04-28 整理結構）
    if subject == "健體":
        return f"knowledge/3_考古題/健體/{semester_label}_{subject}_{publisher}/"
    # 一般科目：年級層改用「中文+學期」（如 三下/、五上/）
    return f"knowledge/3_考古題/1_原始檔/{semester_label}/{semester_label}_{subject}_{publisher}/"


def sort_key(item: tuple[int, dict[str, Any]]) -> tuple[int, int, int, int, int]:
    index, record = item
    return (
        SEMESTER_PRIORITY.get(record["semester"], 99),
        GRADE_PRIORITY.get(record["grade"], 99),
        SUBJECT_PRIORITY.get(record["subject"], 99),
        PUBLISHER_PRIORITY.get(record["publisher"], 99),
        index,
    )


def build_progress_records() -> list[dict[str, Any]]:
    drive_manifest = load_json(DRIVE_MANIFEST_PATH)
    pdf_manifest = load_json(PDF_MANIFEST_PATH)

    drive_records = drive_manifest["records"]
    pdf_records = pdf_manifest["records"]
    expected_pdf_count_by_folder = {
        record["folder_id"]: int(record.get("pdf_count", 0)) for record in pdf_records
    }

    ordered = sorted(enumerate(drive_records), key=sort_key)
    progress_records: list[dict[str, Any]] = []
    for priority, (_, record) in enumerate(ordered, start=1):
        folder_id = record["folder_id"]
        progress_records.append(
            {
                "priority": priority,
                "grade": record["grade"],
                "semester": record["semester"],
                "subject": record["subject"],
                "publisher": record["publisher"],
                "exam_type": record["exam_type"],
                "folder_id": folder_id,
                "url": record["url"],
                "expected_pdf_count": expected_pdf_count_by_folder.get(folder_id, 0),
                "downloaded_pdf_count": 0,
                "status": "pending",
                "last_attempt": None,
                "error_note": None,
                "local_path": local_path_for(record),
            }
        )
    return progress_records


def ensure_progress_file() -> list[dict[str, Any]]:
    if PROGRESS_PATH.exists():
        data = load_json(PROGRESS_PATH)
        if not isinstance(data, list):
            raise ValueError(f"{PROGRESS_PATH} 格式錯誤：預期 JSON array。")
        return data

    records = build_progress_records()
    dump_json(PROGRESS_PATH, records)
    return records


def save_progress(records: list[dict[str, Any]]) -> None:
    dump_json(PROGRESS_PATH, records)


# 考古題常見檔案格式（PDF + Office + 多媒體 + 圖片）
EXAM_FILE_SUFFIXES = {
    ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
    ".mp3", ".m4a", ".wav", ".aac", ".mp4",
    ".jpg", ".jpeg", ".png",
    ".zip", ".textclipping",
}


def count_pdfs(path: Path) -> int:
    """保留舊介面，但實際計所有考古題相關格式。"""
    return sum(1 for _ in _iter_exam_files(path))


def _iter_exam_files(path: Path):
    if not path.exists():
        return
    for p in path.rglob("*"):
        if p.is_file() and p.suffix.lower() in EXAM_FILE_SUFFIXES:
            yield p


def list_pdf_names(path: Path) -> set[str]:
    """回傳目錄下所有考古題檔案（含 .doc/.docx/.mp3 等）的相對路徑集合。

    函式名保留（避免 breaking change），但語意擴展為「所有考古題相關格式」。
    """
    return {str(p.relative_to(path)) for p in _iter_exam_files(path)}


def load_gdown_backend() -> tuple[str, Any]:
    try:
        import gdown  # type: ignore
    except ImportError as exc:
        for candidate in GDOWN_CLI_CANDIDATES:
            if candidate.exists():
                return ("cli", candidate)
        raise RuntimeError(
            "找不到可用的 gdown module / CLI。請先執行 `python3 -m pip install --user gdown`。"
        ) from exc
    return ("module", gdown)


CHROME_USER_DATA_DIR = str(Path.home() / "Library" / "Application Support" / "Google" / "Chrome")


def _extract_zip_flat(zip_path: Path, output: Path) -> None:
    """解壓 zip，把所有 PDF 展平到 output 根目錄（不保留子資料夾）。"""
    import zipfile
    output.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(zip_path, "r") as zf:
        for member in zf.infolist():
            # 只取檔名，忽略 zip 內的資料夾結構
            filename = Path(member.filename).name
            if not filename or member.is_dir():
                continue
            target = output / filename
            with zf.open(member) as src, open(target, "wb") as dst:
                dst.write(src.read())


def download_folder_via_playwright(folder_url: str, output: Path) -> None:
    """用 Playwright 匿名 context 下載公開分享的 Drive folder。

    這些 folder 是公開分享的（不需登入），所以用全新匿名 context 即可，
    不共用 Chrome profile，天然避免 ProcessSingleton 衝突。
    """
    import tempfile

    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        raise RuntimeError("Playwright 未安裝。執行：python3 -m pip install playwright")

    output.mkdir(parents=True, exist_ok=True)
    tmp_dir = Path(tempfile.mkdtemp(prefix="pw_dl_"))

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(accept_downloads=True)
        page = context.new_page()

        # data-tooltip 含考古題常見副檔名的 selector
        file_selector = (
            '[data-tooltip*=".pdf"], [data-tooltip*=".doc"], [data-tooltip*=".docx"], '
            '[data-tooltip*=".xls"], [data-tooltip*=".xlsx"], [data-tooltip*=".ppt"], '
            '[data-tooltip*=".pptx"], [data-tooltip*=".mp3"], [data-tooltip*=".m4a"], '
            '[data-tooltip*=".mp4"], [data-tooltip*=".wav"], [data-tooltip*=".jpg"], '
            '[data-tooltip*=".jpeg"], [data-tooltip*=".png"], [data-tooltip*=".zip"]'
        )

        try:
            # commit 比 networkidle/domcontentloaded 快，Drive SPA 仍需額外等待
            page.goto(folder_url, wait_until="commit", timeout=20000)
            page.wait_for_timeout(8000)

            # === 關鍵修正：virtual scroll 先把所有檔案 render 出來 ===
            # Drive 主滾動容器是 C-WIZ，預設只顯示前 50 個檔案
            last_count = len(page.locator(file_selector).all())
            stable_rounds = 0
            for scroll_round in range(40):  # 最多 40 輪，理論可達 ~2000 檔
                page.evaluate(
                    "() => { document.querySelectorAll('C-WIZ').forEach(e => {"
                    "  if (e.scrollHeight > e.clientHeight + 20) e.scrollTop = e.scrollHeight;"
                    "}); }"
                )
                page.wait_for_timeout(800)
                new_count = len(page.locator(file_selector).all())
                if new_count > last_count:
                    last_count = new_count
                    stable_rounds = 0
                else:
                    stable_rounds += 1
                    if stable_rounds >= 2:
                        break
            print(f"  virtual scroll 完成，偵測到 {last_count} 個檔案")

            # 取所有檔案項目（用 data-tooltip 去重）
            files_set = {}
            for el in page.locator(file_selector).all():
                tt = el.get_attribute("data-tooltip") or ""
                if tt and tt not in files_set:
                    files_set[tt] = el
            files = list(files_set.values())
            expected_file_count = len(files)
            if not files:
                screenshot_path = tmp_dir / "debug_no_files.png"
                page.screenshot(path=str(screenshot_path))
                raise RuntimeError(f"folder 內未偵測到檔案項目。截圖: {screenshot_path}")

            # 滾回頂部，讓 click() 可達第一個元素
            page.evaluate(
                "() => { document.querySelectorAll('C-WIZ').forEach(e => { e.scrollTop = 0; }); }"
            )
            page.wait_for_timeout(500)

            # 點第一個 → 用鍵盤 Cmd+A 全選（比 Shift+Click 對 virtual list 更可靠）
            files[0].click()
            page.wait_for_timeout(500)
            page.keyboard.press("Meta+a")
            page.wait_for_timeout(1500)

            # 驗證選取數量；若 Cmd+A 不奏效再試 Control+A 或 Shift+End 範圍選取
            selected_count = len(page.locator('[aria-selected="true"]').all())
            if selected_count < expected_file_count // 2:  # 選取數明顯不足
                print(f"  Cmd+A 選取數不足（{selected_count}/{expected_file_count}），改試 Control+A")
                page.keyboard.press("Control+a")
                page.wait_for_timeout(1500)
                selected_count = len(page.locator('[aria-selected="true"]').all())
                if selected_count < expected_file_count // 2:
                    print(f"  Control+A 仍不足，改試 Shift+End")
                    files[0].click()
                    page.wait_for_timeout(300)
                    page.keyboard.press("Shift+End")
                    page.wait_for_timeout(1500)
                    selected_count = len(page.locator('[aria-selected="true"]').all())

            print(f"  最終選取 {selected_count}/{expected_file_count} 個項目")

            # 在第一個檔案上右鍵（不論最後一個是否在視窗內）
            files[0].click(button="right")
            page.wait_for_timeout(2000)

            # 找 menuitem 中的「下載」
            download_item = None
            for mi in page.locator('[role="menuitem"]').all():
                if not mi.is_visible():
                    continue
                lbl = mi.get_attribute("aria-label") or mi.inner_text() or ""
                if "下載" in lbl or "Download" in lbl:
                    download_item = mi
                    break

            if download_item is None:
                screenshot_path = tmp_dir / "debug_no_menu.png"
                page.screenshot(path=str(screenshot_path))
                raise RuntimeError(f"右鍵選單中找不到下載選項。截圖: {screenshot_path}")

            # 點下載並等待檔案
            with page.expect_download(timeout=180000) as dl_info:
                download_item.click()

            dl = dl_info.value
            zip_path = tmp_dir / (dl.suggested_filename or "download.zip")
            dl.save_as(str(zip_path))

        finally:
            context.close()
            browser.close()

    # zip → 解壓展平；單檔 → 直接搬到 output
    if zip_path.suffix.lower() == ".zip":
        _extract_zip_flat(zip_path, output)
    else:
        shutil.copy2(str(zip_path), str(output / zip_path.name))
    shutil.rmtree(tmp_dir, ignore_errors=True)


GDOWN_TIMEOUT_SECONDS = 600  # 單一 drive 最多 10 分鐘，避免 gdown 卡死


def download_folder(backend: tuple[str, Any], url: str, output: Path) -> None:
    """下載 folder。一律走 CLI subprocess.run 帶 timeout，避免 module 模式 socket I/O hang。"""
    output.mkdir(parents=True, exist_ok=True)

    # 找 CLI 路徑（優先），module 模式僅作備援回報
    cli_path = None
    for cand in GDOWN_CLI_CANDIDATES:
        if cand.exists():
            cli_path = str(cand)
            break
    if cli_path is None:
        # 找系統 PATH
        from shutil import which
        which_gdown = which("gdown")
        if which_gdown:
            cli_path = which_gdown

    if cli_path is None:
        raise RuntimeError("找不到可執行的 gdown CLI（download_folder 需要 CLI 模式以支援 timeout）")

    command_candidates = [
        [cli_path, "--folder", url, "-O", str(output), "--remaining-ok"],
        [cli_path, "--folder", url, "-O", str(output)],
    ]
    last_message = ""
    for command in command_candidates:
        try:
            result = subprocess.run(
                command, capture_output=True, text=True, check=False,
                timeout=GDOWN_TIMEOUT_SECONDS,
            )
        except subprocess.TimeoutExpired:
            raise TimeoutError(f"gdown CLI 超過 {GDOWN_TIMEOUT_SECONDS}s 未完成")
        if result.returncode == 0:
            return
        last_message = (result.stderr or result.stdout or "gdown CLI 執行失敗").strip()
        if "unrecognized arguments: --remaining-ok" not in last_message:
            break
    raise RuntimeError(last_message)


def derive_status(downloaded_pdf_count: int, expected_pdf_count: int) -> str:
    if downloaded_pdf_count <= 0:
        return "failed"
    if expected_pdf_count > 0 and downloaded_pdf_count < expected_pdf_count:
        return "partial"
    return "done"


def format_progress_bar(done: int, total: int, width: int = 8) -> str:
    if total <= 0:
        return "░" * width
    filled = round((done / total) * width)
    filled = max(0, min(width, filled))
    return "█" * filled + "░" * (width - filled)


def grouped_status(records: list[dict[str, Any]]) -> list[tuple[str, dict[str, int]]]:
    grouped: dict[tuple[str, str], dict[str, int]] = defaultdict(
        lambda: {"drives": 0, "done": 0, "failed": 0, "partial": 0, "pending": 0}
    )
    for record in records:
        key = (record["grade"], record["semester"])
        grouped[key]["drives"] += 1
        grouped[key][record["status"]] += 1

    order = sorted(grouped.keys(), key=lambda key: (SEMESTER_PRIORITY.get(key[1], 99), GRADE_PRIORITY.get(key[0], 99)))
    result: list[tuple[str, dict[str, int]]] = []
    for grade, semester in order:
        result.append((f"{grade} {semester}", grouped[(grade, semester)]))
    return result


def print_status(records: list[dict[str, Any]]) -> None:
    print("=== 米蘭考古題下載進度大表 ===")
    print(f"更新時間：{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    print("批次         | Drives | 完成 | 失敗 | 部分 | 待下載 | 進度")
    for label, stats in grouped_status(records):
        completed = stats["done"] + stats["partial"]
        percent = (completed / stats["drives"] * 100) if stats["drives"] else 0
        bar = format_progress_bar(completed, stats["drives"])
        print(
            f"{label:<12} | {stats['drives']:>6} | {stats['done']:>4} | {stats['failed']:>4} |"
            f" {stats['partial']:>4} | {stats['pending']:>6} | {bar} {percent:>3.0f}%"
        )

    print()
    next_record = next((record for record in records if record["status"] == "pending"), None)
    if next_record is None:
        print("下次啟動將從：無，所有 Drive 都已處理完畢。")
    else:
        print(
            "下次啟動將從："
            f"{next_record['grade']} {next_record['semester']} / {next_record['subject']} / "
            f"{next_record['publisher']} / {next_record['exam_type']} / priority={next_record['priority']}"
        )


def run_batch(records: list[dict[str, Any]], batch_size: int, retry_failed: bool = False) -> int:
    gdown_backend = load_gdown_backend()

    eligible_statuses = {"pending"}
    if retry_failed:
        eligible_statuses |= {"failed", "partial"}

    pending = [r for r in records if r["status"] in eligible_statuses][:batch_size]
    if not pending:
        print(f"沒有待下載的 Drive（篩選條件：{eligible_statuses}）。")
        return 0

    print(f"本次將處理 {len(pending)} 個 Drive。")
    for index, record in enumerate(pending, start=1):
        target_path = REPO_ROOT / record["local_path"]
        before_names = list_pdf_names(target_path)  # 記錄下載前的檔名集合
        print(
            f"[{index}/{len(pending)}] priority={record['priority']} "
            f"{record['grade']} {record['semester']} {record['subject']} {record['publisher']} {record['exam_type']}"
        )
        print(f"下載目標：{record['url']}")
        print(f"本地路徑：{record['local_path']}")

        record["last_attempt"] = now_text()
        record["error_note"] = None

        def _update_counts(method_tag: str = "") -> None:
            after_names = list_pdf_names(target_path)
            new_files = after_names - before_names
            downloaded_count = len(new_files)
            record["downloaded_pdf_count"] = downloaded_count
            record["status"] = derive_status(downloaded_count, int(record["expected_pdf_count"]))
            if record["status"] == "failed":
                record["error_note"] = (
                    f"{method_tag}完成但未偵測到新檔案（PDF/.doc/.docx 等），"
                    f"可能為 rate-limit / 403 / 空資料夾。"
                )
            elif record["status"] == "partial":
                record["error_note"] = (
                    f"{method_tag}預期 {record['expected_pdf_count']} 份，實際新增 {downloaded_count} 份檔案。"
                )

        # Per-drive 硬 timeout：整個 drive（gdown + Playwright）總時不超過 25 分鐘
        # 用 signal.SIGALRM 在 main thread 強制中斷
        import signal as _signal
        DRIVE_HARD_TIMEOUT = 1500  # 25 分鐘

        def _drive_timeout_handler(signum, frame):
            raise TimeoutError(f"drive 處理超過 {DRIVE_HARD_TIMEOUT}s 強制中斷")

        _old_handler = _signal.signal(_signal.SIGALRM, _drive_timeout_handler)
        _signal.alarm(DRIVE_HARD_TIMEOUT)
        try:
            try:
                # 優先嘗試 gdown
                download_folder(gdown_backend, record["url"], target_path)
                _update_counts()
            except TimeoutError as t_exc:
                # gdown 內 600s timeout 觸發，切 Playwright
                try:
                    print(f"  gdown timeout（{t_exc}），切換 Playwright...")
                    download_folder_via_playwright(record["url"], target_path)
                    _update_counts("[Playwright] ")
                    if record["status"] in ("done", "partial"):
                        record["error_note"] = (record["error_note"] or "") + " (via Playwright)"
                except Exception as pw_exc:
                    record["downloaded_pdf_count"] = 0
                    record["status"] = "failed"
                    record["error_note"] = (
                        f"gdown timeout | Playwright: {str(pw_exc)[:80]}"
                    )
            except Exception as gdown_exc:
                # gdown 一般失敗，切 Playwright
                try:
                    print(f"  gdown 失敗，切換 Playwright...")
                    download_folder_via_playwright(record["url"], target_path)
                    _update_counts("[Playwright] ")
                    if record["status"] in ("done", "partial"):
                        record["error_note"] = (record["error_note"] or "") + " (via Playwright)"
                except Exception as pw_exc:
                    record["downloaded_pdf_count"] = 0
                    record["status"] = "failed"
                    record["error_note"] = (
                        f"gdown: {str(gdown_exc)[:80]} | Playwright: {str(pw_exc)[:80]}"
                    )
        except TimeoutError as drive_t_exc:
            # 整個 drive 超 25 分鐘，強制標 failed 跳過
            record["downloaded_pdf_count"] = 0
            record["status"] = "failed"
            record["error_note"] = f"per-drive 硬 timeout（{drive_t_exc}）"
            print(f"  ⚠️ {drive_t_exc} — 標 failed 跳過")
        finally:
            _signal.alarm(0)
            _signal.signal(_signal.SIGALRM, _old_handler)

        save_progress(records)
        print(
            f"結果：status={record['status']}, downloaded_pdf_count={record['downloaded_pdf_count']}, "
            f"error_note={record['error_note']}"
        )

        if index < len(pending):
            print(f"等待 {WAIT_BETWEEN_DRIVES} 秒後繼續下一個 Drive...")
            time.sleep(WAIT_BETWEEN_DRIVES)
            if index % WAIT_AFTER_EVERY == 0:
                print(f"已完成 {index} 個 Drive，額外休息 {WAIT_AFTER_BATCH // 60} 分鐘。")
                time.sleep(WAIT_AFTER_BATCH)

    return len(pending)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="米蘭考古題下載 runner")
    parser.add_argument("--run", action="store_true", help="下載 pending 的下一批 Drive")
    parser.add_argument("--status", action="store_true", help="顯示 download_progress 狀態")
    parser.add_argument("--batch", type=int, default=DEFAULT_BATCH_SIZE, help="每批處理數量，預設 30")
    parser.add_argument("--retry-failed", action="store_true", help="同時重試 failed 和 partial 的 Drive")
    args = parser.parse_args()
    if not args.run and not args.status:
        parser.error("請至少指定 --run 或 --status")
    if args.batch <= 0:
        parser.error("--batch 必須為正整數")
    return args


def main() -> int:
    args = parse_args()
    records = ensure_progress_file()

    if args.run:
        run_batch(records, args.batch, retry_failed=args.retry_failed)

    if args.status:
        records = ensure_progress_file()
        print_status(records)

    return 0


if __name__ == "__main__":
    sys.exit(main())
