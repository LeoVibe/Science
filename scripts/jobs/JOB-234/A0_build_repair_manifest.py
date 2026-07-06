#!/usr/bin/env python3
"""JOB-234 Phase 0：掃描三下/四下全科目 extract_failed MD，配對原始檔，產修復清單。
輸出：scripts/jobs/JOB-234/_repair_manifest.json
"""
import os, glob, re, json
from datetime import datetime, timezone, timedelta

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
os.chdir(ROOT)

INTEGRATED_BASE = "knowledge/3_考古題/2_MD淬鍊文字_整合版"
ORIGINAL_BASE   = "knowledge/3_考古題/1_原始檔"
OUT_PATH        = "scripts/jobs/JOB-234/_repair_manifest.json"


def get_frontmatter(md_path):
    with open(md_path, encoding='utf-8') as f:
        content = f.read()
    m = re.match(r'^---\n(.*?)\n---', content, re.S)
    if not m:
        return {}
    fm_text = m.group(1)
    result = {}
    for key in ['publisher', 'academic_year', 'source_school', 'exam_type', 'semester',
                'subject', 'combo', 'exam_id']:
        mm = re.search(rf'^{key}:\s*(.+)$', fm_text, re.M)
        if mm:
            result[key] = mm.group(1).strip().strip('"')
    # quality_flags
    if 'quality_flags:' in fm_text:
        after = fm_text.split('quality_flags:')[1]
        flags = []
        for line in after.split('\n'):
            s = line.strip()
            if s.startswith('- '):
                fl = s[2:].strip()
                if ':' in fl:
                    break
                flags.append(fl)
        result['quality_flags'] = flags
    # source_pdfs filenames
    source_pdfs = []
    for m2 in re.finditer(r'filename:\s*(.+)', fm_text):
        source_pdfs.append(m2.group(1).strip())
    result['source_pdfs'] = source_pdfs
    return result


def find_original_files(grade, combo, source_pdf_filenames):
    """在 1_原始檔/{grade}/{combo}/ 目錄下找到對應原始檔。
    同時嘗試帶舊式「縣立」前綴的完整檔名與新式精簡檔名。
    """
    orig_dir = os.path.join(ORIGINAL_BASE, grade, combo)
    if not os.path.isdir(orig_dir):
        return [], False

    found = []
    for src_name in source_pdf_filenames:
        base = os.path.splitext(src_name)[0]
        ext  = os.path.splitext(src_name)[1]  # .pdf / .doc / .docx
        # 精確匹配
        exact = os.path.join(orig_dir, src_name)
        if os.path.exists(exact):
            found.append(exact)
            continue
        # 模糊：找目錄下副檔名一致的檔
        candidates = glob.glob(os.path.join(orig_dir, f'*{ext}'))
        if candidates:
            found.extend(candidates)

    # 去重並保留存在的
    found = list(dict.fromkeys(f for f in found if os.path.exists(f)))
    return found, len(found) > 0


def classify_source_type(source_pdf_filenames, orig_files):
    """根據副檔名分類 source_type。"""
    all_names = source_pdf_filenames + [os.path.basename(f) for f in orig_files]
    exts = set(os.path.splitext(n)[1].lower() for n in all_names)
    if '.doc' in exts or '.docx' in exts:
        return 'doc_format'
    if '.pdf' in exts:
        return 'scanned_pdf'
    return 'unknown'


def main():
    manifest = []
    stats = {'total': 0, 'scanned_pdf': 0, 'doc_format': 0,
             'unknown': 0, 'no_original_found': 0}

    for grade in ['三下', '四下']:
        grade_dir = os.path.join(INTEGRATED_BASE, grade)
        if not os.path.isdir(grade_dir):
            continue
        for combo in sorted(os.listdir(grade_dir)):
            combo_dir = os.path.join(grade_dir, combo)
            if not os.path.isdir(combo_dir):
                continue
            for md_path in sorted(glob.glob(os.path.join(combo_dir, '*.md'))):
                if os.path.basename(md_path).startswith('_'):
                    continue
                fm = get_frontmatter(md_path)
                if 'extract_failed' not in fm.get('quality_flags', []):
                    continue

                exam_id = fm.get('exam_id', os.path.basename(md_path).replace('.md', ''))
                source_pdfs = fm.get('source_pdfs', [])

                orig_files, found = find_original_files(grade, combo, source_pdfs)
                source_type = classify_source_type(source_pdfs, orig_files) if found else 'no_original_found'

                entry = {
                    'exam_id': exam_id,
                    'grade': grade,
                    'combo': combo,
                    'md_path': md_path,
                    'source_pdfs_declared': source_pdfs,
                    'source_type': source_type,
                    'original_files': orig_files,
                    'original_files_found': found,
                    'repair_status': 'pending',
                }
                manifest.append(entry)
                stats['total'] += 1
                stats[source_type] = stats.get(source_type, 0) + 1

    # 寫出
    now = datetime.now(timezone(timedelta(hours=8))).isoformat()
    output = {
        '_meta': {
            'job': 'JOB-234',
            'created_at': now,
            'total': stats['total'],
            'by_type': {k: v for k, v in stats.items() if k != 'total'},
        },
        'items': manifest,
    }
    with open(OUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f'✅ 修復清單產出：{OUT_PATH}')
    print(f'   總計：{stats["total"]} 份')
    for k, v in stats.items():
        if k != 'total':
            print(f'   {k}: {v} 份')


if __name__ == '__main__':
    main()
