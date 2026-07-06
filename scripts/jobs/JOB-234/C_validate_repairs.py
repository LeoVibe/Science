#!/usr/bin/env python3
"""JOB-234 Phase 3：修復後驗證。
對每份修復後 MD 檢查：
  - char_count > 500（基本內容門檻）
  - frontmatter 完整（exam_id / quality_flags / char_count 欄位）
  - extract_failed 已從 quality_flags 移除
  - quality_flags 含 docx_extracted 或 ocr_used（修復標記）
輸出：scripts/jobs/JOB-234/_repair_report_JOB234.json
"""
import os, json, re, glob
from datetime import datetime, timezone, timedelta

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
os.chdir(ROOT)

MANIFEST_PATH = "scripts/jobs/JOB-234/_repair_manifest.json"
REPORT_PATH   = "scripts/jobs/JOB-234/_repair_report_JOB234.json"
CHAR_MIN      = 500


def parse_md(md_path):
    with open(md_path, encoding='utf-8') as f:
        content = f.read()
    m = re.match(r'^---\n(.*?)\n---\n?(.*)', content, re.S)
    if not m:
        return None, content
    fm_text = m.group(1)
    body = m.group(2)

    result = {}
    for key in ['exam_id', 'char_count']:
        mm = re.search(rf'^{key}:\s*(.+)$', fm_text, re.M)
        if mm:
            v = mm.group(1).strip().strip('"')
            result[key] = int(v) if key == 'char_count' else v

    flags = []
    if 'quality_flags:' in fm_text:
        after = fm_text.split('quality_flags:')[1]
        for line in after.split('\n'):
            s = line.strip()
            if s.startswith('- '):
                fl = s[2:].strip()
                if ':' in fl:
                    break
                flags.append(fl)
    result['quality_flags'] = flags
    result['body_len'] = len(body.strip())
    return result, body


def validate_one(item):
    exam_id    = item['exam_id']
    md_path    = item['md_path']
    source_type = item['source_type']
    repair_status = item.get('repair_status', 'pending')

    issues = []
    details = {
        'exam_id': exam_id,
        'source_type': source_type,
        'repair_status': repair_status,
    }

    if repair_status == 'pending':
        details['validate_status'] = 'skipped'
        details['reason'] = 'repair_not_attempted'
        return details

    if repair_status in ('failed', 'timeout'):
        details['validate_status'] = 'repair_failed'
        return details

    if not os.path.exists(md_path):
        details['validate_status'] = 'error'
        details['issues'] = ['md_file_missing']
        return details

    fm, _ = parse_md(md_path)
    if fm is None:
        details['validate_status'] = 'error'
        details['issues'] = ['frontmatter_parse_failed']
        return details

    # 1. exam_id 存在
    if not fm.get('exam_id'):
        issues.append('missing_exam_id')

    # 2. quality_flags 存在
    flags = fm.get('quality_flags', [])
    if not flags and 'quality_flags' not in open(md_path).read():
        issues.append('missing_quality_flags')

    # 3. extract_failed 已移除
    if 'extract_failed' in flags:
        issues.append('extract_failed_still_present')

    # 4. 修復標記存在
    repair_flags = {'docx_extracted', 'ocr_used'}
    if not repair_flags.intersection(set(flags)):
        issues.append('no_repair_flag')

    # 5. char_count > CHAR_MIN
    char_count = fm.get('char_count', 0)
    details['char_count'] = char_count
    if char_count < CHAR_MIN:
        issues.append(f'char_count_too_low_{char_count}')

    # 6. 實際 body 長度（防止 frontmatter 寫死但 body 空）
    body_len = fm.get('body_len', 0)
    details['body_len'] = body_len
    if body_len < CHAR_MIN:
        issues.append(f'body_too_short_{body_len}')

    if issues:
        details['validate_status'] = 'fail'
        details['issues'] = issues
    else:
        details['validate_status'] = 'pass'

    return details


def main():
    with open(MANIFEST_PATH, encoding='utf-8') as f:
        manifest = json.load(f)

    items = manifest['items']
    print(f'Phase 3：驗證 {len(items)} 份')

    results = []
    stats = {'pass': 0, 'fail': 0, 'repair_failed': 0, 'skipped': 0, 'error': 0}

    for item in items:
        r = validate_one(item)
        results.append(r)
        s = r.get('validate_status', 'error')
        stats[s] = stats.get(s, 0) + 1
        if s == 'pass':
            print(f"  ✅ {r['exam_id']}: char_count={r.get('char_count')}")
        elif s == 'fail':
            print(f"  ❌ {r['exam_id']}: {r.get('issues')}")
        elif s == 'repair_failed':
            print(f"  ⚠ {r['exam_id']}: repair_failed（跳過驗證）")

    print(f'\n=== Phase 3 驗證結果 ===')
    for k, v in stats.items():
        print(f'  {k}: {v}')

    now = datetime.now(timezone(timedelta(hours=8))).isoformat()
    report = {
        '_meta': {
            'job': 'JOB-234',
            'validated_at': now,
            'total': len(items),
            'stats': stats,
        },
        'items': results,
    }
    with open(REPORT_PATH, 'w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    print(f'\n報告寫入：{REPORT_PATH}')

    # 列出所有失敗項目
    fails = [r for r in results if r.get('validate_status') == 'fail']
    if fails:
        print(f'\n--- 失敗清單（{len(fails)} 份）---')
        for r in fails:
            print(f"  {r['exam_id']}: {r.get('issues')}")

    # 列出永久無法修復（repair_failed）
    perm_fails = [r for r in results
                  if r.get('repair_status') in ('failed', 'timeout', 'skipped')]
    if perm_fails:
        print(f'\n--- 未完成修復（{len(perm_fails)} 份）---')
        for r in perm_fails:
            print(f"  {r['exam_id']} [{r.get('source_type')}]: {r.get('reason', r.get('repair_status'))}")


if __name__ == '__main__':
    main()
