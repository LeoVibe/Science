#!/usr/bin/env python3
"""針對缺檔（partial + failed）drive 重新下載並更新 progress。

關鍵：
- 用新版 download_folder_via_playwright（含 virtual scroll）
- 不會把 partial 降級為 failed：比對 manifest 預期 vs local 實際決定 status
- 支援 batch 與限速
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from exam_download_runner import (  # type: ignore
    REPO_ROOT, PROGRESS_PATH, PDF_MANIFEST_PATH,
    download_folder_via_playwright, list_pdf_names, save_progress,
    WAIT_BETWEEN_DRIVES, WAIT_AFTER_EVERY, WAIT_AFTER_BATCH, now_text,
)


def extract_fid(url: str) -> str:
    m = re.search(r'folders/([A-Za-z0-9_-]+)', url or '')
    return m.group(1) if m else ''


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--batch", type=int, default=20, help="本次處理上限")
    parser.add_argument("--min-missing", type=int, default=1, help="只處理缺檔 >= 此值的 drive")
    parser.add_argument("--grade", type=str, default=None, help="僅處理某年級（如 G5）")
    parser.add_argument("--semester", type=str, default=None, help="僅處理某學期（如 下學期）")
    args = parser.parse_args()

    progress = json.loads(PROGRESS_PATH.read_text())
    pdf_manifest = json.loads(PDF_MANIFEST_PATH.read_text())
    rec_by_fid = {r['folder_id']: r for r in pdf_manifest['records']}

    # 找缺檔的 drive，按缺檔數 desc 排序
    candidates = []
    for r in progress:
        if r['status'] not in ('partial', 'failed'):
            continue
        # 跳過已標「需手動處理」的（避免無限 retry 救不回的 drive）
        if '需手動處理' in (r.get('error_note') or ''):
            continue
        if args.grade and r.get('grade') != args.grade:
            continue
        if args.semester and r.get('semester') != args.semester:
            continue
        fid = extract_fid(r.get('url', ''))
        rec = rec_by_fid.get(fid)
        if not rec:
            continue
        expected_pdfs = [p['path'] for p in rec['pdfs'] if p['path'].lower().endswith('.pdf')]
        if not expected_pdfs:
            continue
        local_path = REPO_ROOT / r['local_path']
        actual = set()
        if local_path.exists():
            actual = {f.name for f in local_path.rglob('*.pdf')}
        hit = sum(1 for p in expected_pdfs if p in actual)
        miss = len(expected_pdfs) - hit
        if miss >= args.min_missing:
            candidates.append({
                'record': r, 'expected': expected_pdfs, 'expected_count': len(expected_pdfs),
                'hit': hit, 'miss': miss, 'local_path': local_path,
            })

    candidates.sort(key=lambda x: -x['miss'])
    print(f'缺檔 drive 共 {len(candidates)} 個，本批處理前 {min(args.batch, len(candidates))} 個（按缺檔數降序）')

    targets = candidates[:args.batch]

    for index, c in enumerate(targets, start=1):
        r = c['record']
        target_path = c['local_path']
        print(f"\n[{index}/{len(targets)}] p={r['priority']:3d} {r['grade']} {r['semester']} "
              f"{r['subject']} {r['publisher']} {r['exam_type']}")
        print(f"  url: {r['url']}")
        print(f"  目前 local hit={c['hit']}/{c['expected_count']}，缺 {c['miss']}")

        before_count = len(list_pdf_names(target_path))
        r['last_attempt'] = now_text()

        # 25 分鐘硬 timeout
        import signal as _signal
        DRIVE_HARD_TIMEOUT = 1500

        def _timeout_handler(signum, frame):
            raise TimeoutError(f"超過 {DRIVE_HARD_TIMEOUT}s")
        old_handler = _signal.signal(_signal.SIGALRM, _timeout_handler)
        _signal.alarm(DRIVE_HARD_TIMEOUT)

        try:
            download_folder_via_playwright(r['url'], target_path)
        except TimeoutError as e:
            print(f"  ❌ 硬 timeout：{e}")
            r['error_note'] = f"retry-missing 硬 timeout: {str(e)[:80]}"
            # 不更新 status，保留 partial（不降級）
            save_progress(progress)
            _signal.alarm(0); _signal.signal(_signal.SIGALRM, old_handler)
            continue
        except Exception as e:
            print(f"  ❌ Playwright 失敗：{e}")
            r['error_note'] = f"retry-missing Playwright 失敗: {str(e)[:80]}"
            # 不更新 status，保留原 status
            save_progress(progress)
            _signal.alarm(0); _signal.signal(_signal.SIGALRM, old_handler)
            continue
        finally:
            _signal.alarm(0)
            _signal.signal(_signal.SIGALRM, old_handler)

        # 重新比對 manifest 預期 vs local 實際
        actual_after = set()
        if target_path.exists():
            actual_after = {f.name for f in target_path.rglob('*.pdf')}
        hit_after = sum(1 for p in c['expected'] if p in actual_after)
        new_files_count = len(list_pdf_names(target_path)) - before_count

        # 決定 status：用「manifest 預期 vs local 實際」而非「set-based new files」
        if hit_after == c['expected_count']:
            r['status'] = 'done'
            r['downloaded_pdf_count'] = hit_after
            r['error_note'] = f"retry-missing 完成（{hit_after}/{c['expected_count']}），新增 {new_files_count} 檔"
            print(f"  ✅ done {hit_after}/{c['expected_count']}（新增 {new_files_count}）")
        elif hit_after > c['hit']:
            # 有進步但還沒滿
            r['status'] = 'partial'
            r['downloaded_pdf_count'] = hit_after
            r['error_note'] = f"retry-missing partial {hit_after}/{c['expected_count']}（從 {c['hit']} 補到 {hit_after}）"
            print(f"  🟡 partial 進步 {c['hit']}→{hit_after}/{c['expected_count']}")
        else:
            # 沒進步
            r['error_note'] = f"retry-missing 無進步 {hit_after}/{c['expected_count']}"
            print(f"  ⚠️ 無進步 {hit_after}/{c['expected_count']}（status 保持 {r['status']}）")

        save_progress(progress)

        # 限速
        if index < len(targets):
            print(f"  等待 {WAIT_BETWEEN_DRIVES} 秒後繼續...")
            time.sleep(WAIT_BETWEEN_DRIVES)
            if index % WAIT_AFTER_EVERY == 0:
                print(f"  已完成 {index} 個，額外休息 {WAIT_AFTER_BATCH // 60} 分鐘")
                time.sleep(WAIT_AFTER_BATCH)

    print(f'\n本批處理完成')


if __name__ == "__main__":
    main()
