"""Phase 3: KL4 教學示例報告（JOB-247 三下，僅 kl4_supported=true 題目）"""
import json
import glob
from collections import defaultdict

PARTIAL_DIR = 'knowledge/3_考古題/3_L2_結構化抽取/三下/alignment_science/_partial'
OUT_PATH = 'knowledge/3_考古題/3_L2_結構化抽取/三下/alignment_science/kl4_teaching_examples.md'

by_lesson = defaultdict(list)
for fp in glob.glob(f'{PARTIAL_DIR}/*.json'):
    d = json.load(open(fp, encoding='utf-8'))
    pub = d.get('_meta', {}).get('publisher', '?')
    for link in d.get('l2_to_kl_links', []):
        if not link.get('kl4_supported'):
            continue
        if not link.get('kl4_link'):
            continue
        key = (pub, link['kl4_link'].get('lesson', '?'))
        by_lesson[key].append({
            'exam_id': link.get('exam_id', '?'),
            'qid': link.get('question_id', '?'),
            'kn': link['kl4_link'].get('knowledge_point', ''),
            'mis': link.get('misconception_match', []),
        })

with open(OUT_PATH, 'w', encoding='utf-8') as f:
    f.write('# 三下自然 KL4 教學示例（JOB-247 Phase 3）\n\n')
    f.write(f'涵蓋 {len(by_lesson)} 個 publisher × lesson\n\n')
    for (pub, lesson), examples in sorted(by_lesson.items()):
        f.write(f'## {pub} {lesson}\n\n')
        f.write(f'共 {len(examples)} 題 kl4_supported\n\n')
        for ex in examples[:5]:
            f.write(f'- **{ex["exam_id"]}/{ex["qid"]}**: 知識點 = {ex["kn"]}\n')
            if ex['mis']:
                f.write(f'  - 對應迷思: {", ".join(ex["mis"])}\n')
        f.write('\n')

print(f'✓ 產出 {OUT_PATH}')
print(f'  publisher×lesson 組合: {len(by_lesson)}')
print(f'  kl4_supported 題數: {sum(len(v) for v in by_lesson.values())}')
