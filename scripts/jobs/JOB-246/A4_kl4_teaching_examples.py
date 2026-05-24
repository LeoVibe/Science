"""Phase 3 報告 2：KL4 教學示例

僅 kl4_supported=true 的題目；列出每個 KL4 lesson × knowledge_point 對應的教學示例。
"""
import json
import glob
import os
from collections import defaultdict

PARTIAL_DIR = 'knowledge/3_考古題/3_L2_結構化抽取/四下/alignment_science/_partial'
OUT_PATH = 'knowledge/3_考古題/3_L2_結構化抽取/四下/alignment_science/kl4_teaching_examples.md'


def main():
    by_lesson_kn = defaultdict(list)
    total_kl4 = 0
    for fp in sorted(glob.glob(f'{PARTIAL_DIR}/*.json')):
        d = json.load(open(fp, encoding='utf-8'))
        pub = d['_meta'].get('publisher', '?')
        for link in d['l2_to_kl_links']:
            if not link.get('kl4_supported'):
                continue
            kl4 = link.get('kl4_link')
            if not kl4:
                continue
            total_kl4 += 1
            lesson = kl4.get('lesson', '?')
            kn = kl4.get('knowledge_point', '?')
            kecode = kl4.get('kecode', '?')
            key = (pub, lesson, kn, kecode)
            by_lesson_kn[key].append({
                'exam_id': link['exam_id'],
                'qid': link['question_id'],
                'primary_code': link.get('primary_code'),
                'misconception': link.get('misconception_match', []),
            })

    with open(OUT_PATH, 'w', encoding='utf-8') as f:
        f.write('# 四下自然 KL4 教學示例（JOB-246 Phase 3）\n\n')
        f.write(f'`generated_at`: 2026-05-24\n\n')
        f.write(f'## 涵蓋範圍\n\n')
        f.write(f'- kl4_supported 題總數: {total_kl4}\n')
        f.write(f'- 覆蓋 publisher × lesson × knowledge_point 組合: {len(by_lesson_kn)}\n\n')

        for (pub, lesson, kn, kecode), examples in sorted(by_lesson_kn.items()):
            f.write(f'## {pub} {lesson} — {kn} (kecode={kecode})\n\n')
            f.write(f'共 {len(examples)} 題教學示例\n\n')
            for ex in examples[:5]:
                f.write(f'- **{ex["exam_id"]}/Q{ex["qid"]}** (code: {ex["primary_code"]})\n')
                if ex['misconception']:
                    f.write(f'  - 對應迷思: {", ".join(ex["misconception"])}\n')
            f.write('\n')

    print(f'✓ 產出 {OUT_PATH}')
    print(f'  kl4_supported 題總數: {total_kl4}')
    print(f'  涵蓋 lesson × KP: {len(by_lesson_kn)}')


if __name__ == '__main__':
    main()
