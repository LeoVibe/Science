#!/usr/bin/env python3
"""JOB-207 Phase 2: 批次下載米蘭老師 Drive PDF 到 knowledge/3_考古題/原始/

從 `_manifest/drive_manifest_G1_G6.json` 讀取 Drive metadata，依條件篩選後
用 gdown --folder 下載 + rename 到新結構。

【Rate-limit 保守設計原則】
  - Google Drive 觸發「Too many users」後可封禁 24hr
  - 每個 Drive 間：隨機等 90~240s（約 2~4 分鐘）
  - 每 2 個 Drive 額外休 10 分鐘（BATCH_SIZE=2）
  - 若某 Drive 回傳 0 PDF（可能限速），指數退避後重試最多 2 次
  - cookies 認證可提升配額（設定 COOKIES_FILE 路徑）

用法：
  # 下載單一 (grade, semester_subject, publisher, exam_type)
  python3 scripts/job207_download_batch.py \\
    --grade G3 --subject 社會 --semester 下學期 --publisher 南一 \\
    --exam_types 第二次段考 第三次段考

  # 所有考試類型
  python3 scripts/job207_download_batch.py \\
    --grade G3 --subject 社會 --semester 下學期 --publisher 南一

  # dry-run：只列要抓的 Drive，不實際下載
  python3 scripts/job207_download_batch.py \\
    --grade G3 --subject 社會 --dry-run
"""
import os, re, sys, json, shutil, time, random, argparse, subprocess
from pathlib import Path

BASE = Path('/Users/s389080/Documents/doc/work/0_AI_Project/eidosProject/knowledge/3_考古題')
MANIFEST = BASE / '_manifest' / 'drive_manifest_G1_G6.json'
GDOWN = '/Users/s389080/Library/Python/3.11/bin/gdown'

# cookies 檔案（可選）：從瀏覽器匯出 Google cookies 可提升下載配額
# 匯出方式：Chrome 擴充套件 "Get cookies.txt LOCALLY" → 存為此路徑
COOKIES_FILE = Path.home() / '.cache' / 'gdown' / 'cookies.txt'

# ── Rate-limit 保守參數 ──────────────────────────────────────────────
SLEEP_MIN = 90        # Drive 間最短等待（秒）
SLEEP_MAX = 240       # Drive 間最長等待（秒）
BATCH_SIZE = 2        # 每 N 個 Drive 觸發長休息
SLEEP_AFTER_BATCH = 600   # 長休息時間（10 分鐘）
TIMEOUT_PER_DRIVE = 300   # 單個 Drive gdown 超時上限（秒，提高至 5 分鐘）

# 0-PDF 重試（可能是暫時限速）
MAX_RETRIES = 2
RETRY_WAIT_BASE = 300     # 重試基礎等待（5 分鐘），指數成長
# ────────────────────────────────────────────────────────────────────

GRADE_SEM_MAP = {
    ('G1', '上學期'): '一上', ('G1', '下學期'): '一下',
    ('G2', '上學期'): '二上', ('G2', '下學期'): '二下',
    ('G3', '上學期'): '三上', ('G3', '下學期'): '三下',
    ('G4', '上學期'): '四上', ('G4', '下學期'): '四下',
    ('G5', '上學期'): '五上', ('G5', '下學期'): '五下',
    ('G6', '上學期'): '六上', ('G6', '下學期'): '六下',
}

def parse_filename(orig, exam_default, publisher_default):
    """從原檔名萃取 (學年度, 學校, 考試類型, 試卷|答案)"""
    kind = '答案' if '答案' in orig or '解答' in orig else '試卷'
    year_m = re.search(r'(\d{3})\s*下', orig)
    year = year_m.group(1) if year_m else '?'
    cleaned = re.sub(r'(?:縣立|市立)', '', orig)
    cleaned = re.sub(r'\d{3}下-', '', cleaned)
    school_m = re.search(r'([^\s_\-]+國小)', cleaned)
    school = school_m.group(1) if school_m else '未知國小'
    exam = exam_default
    for kw, std in [('第三次段考','第三次段考'), ('第二次段考','第二次段考'),
                    ('第一次段考','第一次段考'), ('期末','期末考'), ('期中','期中考')]:
        if kw in orig:
            exam = std; break
    return year, school, exam, kind

def _run_gdown(fid, tmp):
    """執行 gdown --folder，回傳 (success, stderr_hint)"""
    cmd = [GDOWN, '--folder',
           f'https://drive.google.com/drive/folders/{fid}',
           '-O', str(tmp)]
    if COOKIES_FILE.exists():
        cmd += ['--cookies', str(COOKIES_FILE)]
    try:
        result = subprocess.run(
            cmd, capture_output=True, text=True,
            timeout=TIMEOUT_PER_DRIVE, check=False
        )
        stderr_lower = (result.stderr or '').lower()
        # 偵測已知限速錯誤訊息
        rate_signals = ['too many users', 'quota', 'rate limit',
                        '403', '429', 'exceeded']
        hit = any(s in stderr_lower for s in rate_signals)
        return (not hit), result.stderr[:200] if hit else ''
    except subprocess.TimeoutExpired:
        return False, f'timeout>{TIMEOUT_PER_DRIVE}s'

def download_drive(fid, drive_label, dst_dir, publisher, attempt=1):
    """下載單一 Drive，含 0-PDF 重試邏輯。回傳下載檔數。"""
    dst = Path(dst_dir)
    dst.mkdir(parents=True, exist_ok=True)
    tmp = dst / f'_tmp_{drive_label}_{fid[:8]}'
    tmp.mkdir(exist_ok=True)

    prefix = f'  [嘗試{attempt}]' if attempt > 1 else ' '
    print(f'{prefix}↓ 下載 {drive_label} ({fid})...', flush=True)

    ok, hint = _run_gdown(fid, tmp)
    if not ok:
        shutil.rmtree(tmp, ignore_errors=True)
        print(f'  ⚠️  gdown 回報限速/逾時：{hint}', flush=True)
        return -1  # -1 = 確定限速，呼叫方處理

    # rename & move
    cnt = 0
    for root, _, files in os.walk(tmp):
        for fn in files:
            if not fn.endswith('.pdf'):
                continue
            year, school, exam, kind = parse_filename(fn, drive_label, publisher)
            new_name = f'{publisher}_{year}_{school}_{exam}_{kind}.pdf'
            dst_path = dst / new_name
            n = 2
            while dst_path.exists():
                dst_path = dst / f'{new_name[:-4]}_{n}.pdf'
                n += 1
            shutil.move(f'{root}/{fn}', dst_path)
            cnt += 1
    shutil.rmtree(tmp, ignore_errors=True)
    print(f'  ✅ {drive_label}: {cnt} PDF', flush=True)
    return cnt

def download_with_retry(fid, drive_label, dst_dir, publisher):
    """帶指數退避重試的下載。0-PDF 視為疑似限速，最多重試 MAX_RETRIES 次。"""
    for attempt in range(1, MAX_RETRIES + 2):  # 1 次原始 + MAX_RETRIES 次重試
        cnt = download_drive(fid, drive_label, dst_dir, publisher, attempt)

        if cnt > 0:
            return cnt  # 成功

        if cnt == -1:
            # gdown 明確回報限速
            label = '限速確認'
        else:
            # cnt == 0：可能空 Drive 或暫時限速
            label = '0 PDF（可能空 Drive 或暫時限速）'

        if attempt > MAX_RETRIES:
            print(f'  ❌ {drive_label}: {label}，已達最大重試次數，跳過。', flush=True)
            return 0

        wait = RETRY_WAIT_BASE * (2 ** (attempt - 1))  # 5min, 10min...
        wait += random.uniform(0, 60)  # 加隨機抖動
        print(f'  ⏸ {label}，第 {attempt} 次重試前等待 {wait:.0f}s ({wait/60:.1f} 分鐘)...', flush=True)
        time.sleep(wait)

    return 0

def sleep_between(i, total):
    """Drive 間隨機等待；每 BATCH_SIZE 個觸發長休息。"""
    if i >= total:
        return
    wait = random.uniform(SLEEP_MIN, SLEEP_MAX)
    if i % BATCH_SIZE == 0:
        wait += SLEEP_AFTER_BATCH
        print(f'  ⏸ 批次 {i} 完成，長休 {wait:.0f}s'
              f'（{wait - SLEEP_AFTER_BATCH:.0f}s 隨機 + {SLEEP_AFTER_BATCH}s 批次）...', flush=True)
    else:
        print(f'  ⏳ 隨機等待 {wait:.0f}s...', flush=True)
    time.sleep(wait)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--grade', required=True, choices=['G1','G2','G3','G4','G5','G6'])
    ap.add_argument('--subject', required=True, help='國語/數學/英語/社會/自然/生活/健體')
    ap.add_argument('--semester', default='下學期', choices=['上學期','下學期'])
    ap.add_argument('--publisher', help='若省略則下載所有版本')
    ap.add_argument('--exam_types', nargs='*',
                    help='若省略則下載所有考試類型；例：期中考 期末考 第三次段考')
    ap.add_argument('--dry-run', action='store_true', help='只列不下載')
    args = ap.parse_args()

    with open(MANIFEST, encoding='utf-8') as f:
        data = json.load(f)
    records = data['records']

    filtered = [r for r in records if
                r['grade'] == args.grade
                and r.get('subject') == args.subject
                and r.get('semester') == args.semester
                and (not args.publisher or r.get('publisher') == args.publisher)
                and (not args.exam_types or r.get('exam_type') in args.exam_types)]

    sem = GRADE_SEM_MAP.get((args.grade, args.semester), args.semester)
    dst_dir = BASE / '原始' / args.grade / f'{sem}_{args.subject}'

    print(f'📋 符合條件的 Drive: {len(filtered)}')
    print(f'📁 目標目錄: {dst_dir}')
    if COOKIES_FILE.exists():
        print(f'🍪 使用 cookies：{COOKIES_FILE}')
    else:
        print(f'🍪 cookies 未設定（{COOKIES_FILE} 不存在），以匿名模式下載')
    for r in filtered:
        print(f'  - {r["publisher"]} {r["exam_type"]}: {r["folder_id"]}')

    if args.dry_run:
        print('\n🔍 dry-run 模式，不實際下載。')
        print(f'\n預估時間（保守）：{len(filtered)} drives')
        per_drive = (SLEEP_MIN + SLEEP_MAX) / 2 + 30  # 平均等待 + 下載時間
        batch_extra = (len(filtered) // BATCH_SIZE) * SLEEP_AFTER_BATCH
        est = len(filtered) * per_drive + batch_extra
        print(f'  每 drive 平均 ~{per_drive:.0f}s，批次休息 {batch_extra:.0f}s')
        print(f'  預估總時間：{est/60:.0f} 分鐘（含重試可能更長）')
        return

    total = 0
    skipped = 0
    for i, r in enumerate(filtered, 1):
        cnt = download_with_retry(r['folder_id'], r['exam_type'], str(dst_dir), r['publisher'])
        if cnt > 0:
            total += cnt
        else:
            skipped += 1
        sleep_between(i, len(filtered))

    print(f'\n🎉 完成：{total} PDF 下載 → {dst_dir}')
    if skipped:
        print(f'⚠️  {skipped} 個 Drive 回傳 0 PDF（空 Drive 或持續限速）')

if __name__ == '__main__':
    main()
