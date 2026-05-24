"""Phase 3 報告 3：迷思診斷報告（自然特有）

每個 KL4 守衛點/迷思條目對應的題目；後續可作為「診斷型題庫」命題基準。
"""
import json
import glob
import os
from collections import defaultdict, Counter

PARTIAL_DIR = 'knowledge/3_考古題/3_L2_結構化抽取/四下/alignment_science/_partial'
OUT_PATH = 'knowledge/3_考古題/3_L2_結構化抽取/四下/alignment_science/misconception_diagnosis.md'


def main():
    by_mis = defaultdict(list)
    mis_pub = defaultdict(Counter)
    mis_code = defaultdict(Counter)
    for fp in sorted(glob.glob(f'{PARTIAL_DIR}/*.json')):
        d = json.load(open(fp, encoding='utf-8'))
        pub = d['_meta'].get('publisher', '?')
        for link in d['l2_to_kl_links']:
            for mis in link.get('misconception_match', []) or []:
                by_mis[mis].append({
                    'exam_id': link['exam_id'],
                    'qid': link['question_id'],
                    'primary_code': link.get('primary_code'),
                    'kl4_link': link.get('kl4_link'),
                })
                mis_pub[mis][pub] += 1
                if link.get('primary_code'):
                    mis_code[mis][link['primary_code']] += 1

    with open(OUT_PATH, 'w', encoding='utf-8') as f:
        f.write('# 四下自然 迷思診斷報告（JOB-246 Phase 3）\n\n')
        f.write('> 列出每個 KL4 守衛點/迷思條目對應的題目，作為後續 L4「診斷型題庫」命題基準。\n\n')
        f.write(f'`generated_at`: 2026-05-24\n\n')
        f.write(f'## 統計總覽\n\n')
        f.write(f'- 命中迷思條目總數: {len(by_mis)}\n')
        f.write(f'- 含 misconception 的題目總數: {sum(len(v) for v in by_mis.values())}\n\n')

        f.write('## 各迷思命中排序\n\n')
        f.write('| 迷思 | 題數 | 翰林 | 康軒 | 南一 | 主要 code |\n')
        f.write('|:--|:--|:--|:--|:--|:--|\n')
        sorted_mis = sorted(by_mis.items(), key=lambda x: -len(x[1]))
        for mis, exs in sorted_mis:
            pubs = mis_pub[mis]
            top_code = mis_code[mis].most_common(1)[0][0] if mis_code[mis] else '?'
            f.write(f'| {mis} | {len(exs)} | {pubs.get("翰林", 0)} | {pubs.get("康軒", 0)} | {pubs.get("南一", 0)} | {top_code} |\n')

        f.write('\n## 各迷思 top 5 教學示例\n\n')
        for mis, exs in sorted_mis[:20]:
            f.write(f'### {mis}（{len(exs)} 題）\n\n')
            for ex in exs[:5]:
                kl4 = ex.get('kl4_link') or {}
                lesson = kl4.get('lesson', '?')
                kn = kl4.get('knowledge_point', '?')
                f.write(f'- {ex["exam_id"]}/Q{ex["qid"]} (code: {ex["primary_code"]}) → {lesson} / {kn}\n')
            f.write('\n')

    print(f'✓ 產出 {OUT_PATH}')
    print(f'  迷思條目: {len(by_mis)}')
    print(f'  命中總題: {sum(len(v) for v in by_mis.values())}')


if __name__ == '__main__':
    main()
