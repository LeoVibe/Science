#!/usr/bin/env python3
"""JOB-207 Phase 2: 批次下載米蘭老師 Drive PDF 到 knowledge/考古/原始/

從 `_manifest/drive_manifest_G1_G6.json` 讀取 Drive metadata，依條件篩選後
用 gdown --folder 下載 + rename 到新結構。

用法：
  # 下載單一 (grade, semester_subject, publisher, exam_type)
  python3.11 scripts/job207_download_batch.py \\
    --grade G3 --subject 社會 --semester 下學期 --publisher 南一 \\
    --exam_types 第二次段考 第三次段考

  # 所有考試類型
  python3.11 scripts/job207_download_batch.py \\
    --grade G3 --subject 社會 --semester 下學期 --publisher 南一

  # dry-run：只列要抓的 Drive，不實際下載
  python3.11 scripts/job207_download_batch.py \\
    --grade G3 --subject 社會 --dry-run
"""
import os, re, sys, json, shutil, time, argparse, subprocess
from pathlib import Path

BASE = Path('/Users/s389080/Documents/doc/work/0_AI_Project/eidosProject/knowledge/考古')
MANIFEST = BASE / '_manifest' / 'drive_manifest_G1_G6.json'
GDOWN = '/Users/s389080/Library/Python/3.11/bin/gdown'

SLEEP_BETWEEN_DRIVES = 30   # 秒
SLEEP_AFTER_BATCH = 300      # 每 3 個 Drive 休 5 分鐘
BATCH_SIZE = 3

# 年級-學期 → semester_subject 目錄名
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
    # 清「縣立/市立/114下-」等前綴
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

def download_drive(fid, drive_label, dst_dir, publisher):
    """下載單一 Drive 到 dst_dir，rename PDF"""
    dst = Path(dst_dir)
    dst.mkdir(parents=True, exist_ok=True)
    tmp = dst / f'_tmp_{drive_label}_{fid[:8]}'
    tmp.mkdir(exist_ok=True)
    print(f'  ↓ 下載 {drive_label} ({fid})...', flush=True)
    try:
        subprocess.run([
            GDOWN, '--folder',
            f'https://drive.google.com/drive/folders/{fid}',
            '-O', str(tmp)
        ], capture_output=True, text=True, timeout=180, check=False)
    except subprocess.TimeoutExpired:
        print(f'  ⏱ 超時（180s）')
        shutil.rmtree(tmp, ignore_errors=True)
        return 0

    # rename & move
    cnt = 0
    for root, _, files in os.walk(tmp):
        for fn in files:
            if not fn.endswith('.pdf'): continue
            year, school, exam, kind = parse_filename(fn, drive_label, publisher)
            new_name = f'{publisher}_{year}_{school}_{exam}_{kind}.pdf'
            dst_path = dst / new_name
            n = 2
            while dst_path.exists():
                stem = new_name[:-4]
                dst_path = dst / f'{stem}_{n}.pdf'
                n += 1
            shutil.move(f'{root}/{fn}', dst_path)
            cnt += 1
    shutil.rmtree(tmp, ignore_errors=True)
    print(f'  ✅ {drive_label}: {cnt} PDF')
    return cnt

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--grade', required=True, choices=['G1','G2','G3','G4','G5','G6'])
    ap.add_argument('--subject', required=True, help='國語/數學/英語/社會/自然/生活/健體')
    ap.add_argument('--semester', default='下學期', choices=['上學期','下學期'])
    ap.add_argument('--publisher', help='若省略則下載所有版本')
    ap.add_argument('--exam_types', nargs='*', help='若省略則下載所有考試類型；例：期中考 期末考 第三次段考')
    ap.add_argument('--dry-run', action='store_true', help='只列不下載')
    args = ap.parse_args()

    # 讀 manifest
    with open(MANIFEST, encoding='utf-8') as f:
        data = json.load(f)
    records = data['records']

    # 篩選
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
    for r in filtered:
        print(f'  - {r["publisher"]} {r["exam_type"]}: {r["folder_id"]}')

    if args.dry_run:
        print('\n🔍 dry-run 模式，不實際下載。')
        return

    # 下載
    total = 0
    for i, r in enumerate(filtered, 1):
        count = download_drive(r['folder_id'], r['exam_type'], str(dst_dir), r['publisher'])
        total += count
        # 限速
        if i < len(filtered):
            if i % BATCH_SIZE == 0:
                print(f'  ⏸ 批次 {i} 完成，休 {SLEEP_AFTER_BATCH}s...', flush=True)
                time.sleep(SLEEP_AFTER_BATCH)
            else:
                time.sleep(SLEEP_BETWEEN_DRIVES)

    print(f'\n🎉 總下載 {total} PDF → {dst_dir}')

if __name__ == '__main__':
    main()
