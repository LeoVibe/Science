"""Phase 4: merge partials → alignment_raw.json（JOB-247 三下）"""
import json
import glob
from datetime import datetime

PARTIAL_DIR = 'knowledge/3_考古題/3_L2_結構化抽取/三下/alignment_science/_partial'
OUT_PATH = 'knowledge/3_考古題/3_L2_結構化抽取/三下/alignment_science/alignment_raw.json'

all_links = []
exam_ids = set()
for fp in sorted(glob.glob(f'{PARTIAL_DIR}/*.json')):
    d = json.load(open(fp, encoding='utf-8'))
    exam_ids.add(d['_meta']['partial_for'])
    all_links.extend(d['l2_to_kl_links'])

# 確認無 pending
pending = sum(1 for l in all_links if l.get('match_rule', '').endswith('_pending'))
print(f'pending 數: {pending}')
if pending > 0:
    print('⚠ 仍有 pending 題，確認後再執行 merge')

out = {
    '_meta': {
        'schema_version': '2.0',
        'subject': '自然',
        'semester': '三下',
        'exam_count': len(exam_ids),
        'question_count': len(all_links),
        'merged_at': datetime.now().isoformat(),
        'job': 'JOB-247',
    },
    'l2_to_kl_links': all_links,
}
json.dump(out, open(OUT_PATH, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print(f'✓ {OUT_PATH}')
print(f'  exams: {len(exam_ids)}')
print(f'  questions: {len(all_links)}')
