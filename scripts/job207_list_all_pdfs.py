#!/usr/bin/env python3
"""JOB-207 spike: 對 _manifest/drive_manifest_G1_G6.json 裡 704 個 Drive 逐一 gdown skip_download
取得每份 PDF 的 id + filename，不下載 PDF 內容。

策略：
- 每 5 秒一個 Drive（限速）
- 每 30 個 Drive sleep 30 秒（額外保護）
- 增量寫入 pdf_manifest_G1_G6.json（失敗也不丟全部資料）
- 失敗 Drive 進 retry queue，最多重試 2 次
"""
import json
import time
import sys
import os
from pathlib import Path

MANIFEST_DIR = Path('/Users/s389080/Documents/doc/work/0_AI_Project/eidosProject/knowledge/3_考古題/_manifest')
DRIVE_MANIFEST = MANIFEST_DIR / 'drive_manifest_G1_G6.json'
PDF_MANIFEST = MANIFEST_DIR / 'pdf_manifest_G1_G6.json'
PROGRESS_LOG = MANIFEST_DIR / 'list_progress.log'

SLEEP_PER_DRIVE = 5  # 秒
BATCH_SIZE = 30
SLEEP_PER_BATCH = 30  # 秒
MAX_RETRY = 2

def log(msg):
    t = time.strftime('%H:%M:%S')
    line = f'[{t}] {msg}'
    print(line, flush=True)
    with open(PROGRESS_LOG, 'a', encoding='utf-8') as f:
        f.write(line + '\n')

def list_drive(folder_id, attempt=1):
    """呼叫 gdown.download_folder(skip_download=True) 取得 file list"""
    import gdown
    url = f'https://drive.google.com/drive/folders/{folder_id}'
    try:
        files = gdown.download_folder(url, skip_download=True, quiet=True)
        return [{'id': f.id, 'path': f.path} for f in files]
    except Exception as e:
        if attempt < MAX_RETRY:
            time.sleep(10)
            return list_drive(folder_id, attempt + 1)
        return {'error': str(e)[:200]}

def main():
    with open(DRIVE_MANIFEST, encoding='utf-8') as f:
        drive_data = json.load(f)
    drives = drive_data['records']
    total = len(drives)
    log(f'開始處理 {total} 個 Drive')

    # 載入已完成進度（支援 resume）
    completed = {}
    if PDF_MANIFEST.exists():
        with open(PDF_MANIFEST, encoding='utf-8') as f:
            existing = json.load(f)
            for rec in existing.get('records', []):
                completed[rec['folder_id']] = rec
        log(f'從既有進度 resume，已完成 {len(completed)} 個')

    records = list(completed.values())
    ok = sum(1 for r in records if 'pdfs' in r)
    fail = sum(1 for r in records if 'error' in r)
    total_pdfs = sum(len(r.get('pdfs', [])) for r in records)

    for i, d in enumerate(drives, 1):
        fid = d['folder_id']
        if fid in completed:
            continue  # 已處理

        label = f"{d['grade']} {d['subject']} {d['publisher']} {d['semester']} {d['exam_type']}"
        result = list_drive(fid)

        record = {
            'folder_id': fid,
            'grade': d['grade'],
            'subject': d['subject'],
            'publisher': d['publisher'],
            'semester': d['semester'],
            'exam_type': d['exam_type'],
            'drive_url': d['url'],
        }
        if isinstance(result, list):
            record['pdfs'] = result
            record['pdf_count'] = len(result)
            total_pdfs += len(result)
            ok += 1
            status = f'✅ {len(result)} PDFs'
        else:
            record['error'] = result['error']
            record['pdf_count'] = 0
            fail += 1
            status = f'❌ {result["error"][:60]}'

        records.append(record)

        # 每筆增量寫入（防意外失敗丟全部）
        with open(PDF_MANIFEST, 'w', encoding='utf-8') as f:
            json.dump({
                'source': 'melances.com via gdown skip_download',
                'collected_date': time.strftime('%Y-%m-%d'),
                'total_drives_processed': len(records),
                'total_drives_planned': total,
                'total_drives_ok': ok,
                'total_drives_fail': fail,
                'total_pdfs_counted': total_pdfs,
                'records': records,
            }, f, ensure_ascii=False, indent=2)

        # 每 10 筆印一次進度
        if i % 10 == 0 or i <= 3:
            pct = i * 100 // total
            log(f'[{i}/{total} {pct}%] {label}: {status} (累計 PDF: {total_pdfs})')

        # 限速
        time.sleep(SLEEP_PER_DRIVE)
        # 每批休更久
        if i % BATCH_SIZE == 0:
            log(f'--- 批次 {i}/{total} 完成，休 {SLEEP_PER_BATCH}s ---')
            time.sleep(SLEEP_PER_BATCH)

    log(f'🎉 全部完成！總 Drive: {total}, 成功: {ok}, 失敗: {fail}, 總 PDF: {total_pdfs}')

if __name__ == '__main__':
    main()
