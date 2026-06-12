"""Phase 3: 迷思診斷報告（JOB-247 三下）"""
import json
import glob
from collections import defaultdict, Counter

PARTIAL_DIR = 'knowledge/3_考古題/3_L2_結構化抽取/三下/alignment_science/_partial'
OUT_PATH = 'knowledge/3_考古題/3_L2_結構化抽取/三下/alignment_science/misconception_diagnosis.md'

by_misconception = defaultdict(list)
mis_pub_dist = defaultdict(Counter)
for fp in glob.glob(f'{PARTIAL_DIR}/*.json'):
    d = json.load(open(fp, encoding='utf-8'))
    pub = d.get('_meta', {}).get('publisher', '?')
    for link in d.get('l2_to_kl_links', []):
        for mis in link.get('misconception_match', []):
            by_misconception[mis].append({
                'exam_id': link.get('exam_id', '?'),
                'qid': link.get('question_id', '?'),
                'primary_code': link.get('primary_code'),
            })
            mis_pub_dist[mis][pub] += 1

with open(OUT_PATH, 'w', encoding='utf-8') as f:
    f.write('# 三下自然 迷思診斷報告（JOB-247 Phase 3）\n\n')
    f.write('> 本報告列出每個 KL4 守衛點/迷思條目對應的題目。\n')
    f.write('> 後續 L4 用途：作為「診斷型題庫」的命題基準。\n\n')
    f.write(f'共 {len(by_misconception)} 個迷思條目命中\n\n')
    f.write('| 迷思 | 題數 | 翰林 | 康軒 | 南一 |\n')
    f.write('|:--|:--|:--|:--|:--|\n')
    sorted_mis = sorted(by_misconception.items(), key=lambda x: -len(x[1]))
    for mis, exs in sorted_mis:
        pubs = mis_pub_dist[mis]
        f.write(f'| {mis} | {len(exs)} | {pubs.get("翰林",0)} | {pubs.get("康軒",0)} | {pubs.get("南一",0)} |\n')

    f.write('\n## 各迷思 top 5 教學示例\n\n')
    for mis, exs in sorted_mis[:10]:
        f.write(f'### {mis} ({len(exs)} 題)\n\n')
        for ex in exs[:5]:
            f.write(f'- {ex["exam_id"]}/{ex["qid"]} (code: {ex["primary_code"]})\n')
        f.write('\n')

print(f'✓ 產出 {OUT_PATH}')
print(f'  迷思條目數: {len(by_misconception)}')
