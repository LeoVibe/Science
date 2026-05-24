"""Phase 3 報告 1：codes 覆蓋報告

列出每個 primary_code 被多少題覆蓋，含三家分布 + 認知層級分布。
"""
import json
import glob
import os
from collections import Counter, defaultdict

PARTIAL_DIR = 'knowledge/3_考古題/3_L2_結構化抽取/四下/alignment_science/_partial'
OUT_PATH = 'knowledge/3_考古題/3_L2_結構化抽取/四下/alignment_science/codes_coverage_report.md'
L2_BASE = 'knowledge/3_考古題/3_L2_結構化抽取/四下'


def main():
    codes_total = Counter()
    codes_pub = defaultdict(Counter)
    codes_unit = defaultdict(Counter)
    awaiting = 0
    completed = 0

    # L2 question 內 cognitive_level 對照
    qid_meta = {}  # (exam_id, qid) → cognitive_level
    for pub in ['翰林', '康軒', '南一']:
        d_l2 = os.path.join(L2_BASE, f'四下_自然_{pub}')
        if not os.path.exists(d_l2):
            continue
        for f in os.listdir(d_l2):
            if not f.endswith('.json'):
                continue
            try:
                data = json.load(open(os.path.join(d_l2, f), encoding='utf-8'))
                exam_id = f[:-5]
                for q in data.get('questions', []):
                    qid_meta[(exam_id, q['question_id'])] = q.get('cognitive_level', '?')
            except Exception:
                continue

    codes_cog = defaultdict(Counter)
    for fp in sorted(glob.glob(f'{PARTIAL_DIR}/*.json')):
        d = json.load(open(fp, encoding='utf-8'))
        pub = d['_meta'].get('publisher', '?')
        for link in d['l2_to_kl_links']:
            if link.get('verify_status') == 'awaiting_codex':
                awaiting += 1
                continue
            completed += 1
            code = link.get('primary_code')
            if code:
                codes_total[code] += 1
                codes_pub[code][pub] += 1
                unit = link.get('unit_theme', '?')
                codes_unit[code][unit] += 1
                cog = qid_meta.get((link['exam_id'], link['question_id']), '?')
                codes_cog[code][cog] += 1

    with open(OUT_PATH, 'w', encoding='utf-8') as f:
        f.write('# 四下自然 codes 覆蓋報告（JOB-246 Phase 3）\n\n')
        f.write(f'`status`: {"PARTIAL — awaiting_codex=" + str(awaiting) + " 待 Task 6 全量補" if awaiting else "FULL"}\n')
        f.write(f'`generated_at`: 2026-05-24\n\n')
        f.write(f'## 覆蓋總覽\n\n')
        f.write(f'- 總對齊題數（已 verify）: {completed}\n')
        f.write(f'- awaiting_codex: {awaiting}\n')
        f.write(f'- 覆蓋的 primary_code 種類: {len(codes_total)}\n\n')

        f.write('## 各 code 覆蓋（題數降序）\n\n')
        f.write('| code | 題數 | 翰林 | 康軒 | 南一 | 認知層級 top |\n')
        f.write('|:--|:--|:--|:--|:--|:--|\n')
        for code, cnt in codes_total.most_common():
            pubs = codes_pub.get(code, Counter())
            cog_top = ', '.join(f'{k}×{v}' for k, v in codes_cog.get(code, Counter()).most_common(2))
            f.write(f'| {code} | {cnt} | {pubs.get("翰林", 0)} | {pubs.get("康軒", 0)} | {pubs.get("南一", 0)} | {cog_top} |\n')

        f.write('\n## 各 code × unit_theme 分布\n\n')
        for code, units in sorted(codes_unit.items(), key=lambda x: -sum(x[1].values()))[:20]:
            f.write(f'### {code}\n\n')
            for unit, n in units.most_common():
                f.write(f'- {unit}: {n}\n')
            f.write('\n')

    print(f'✓ 產出 {OUT_PATH}')
    print(f'  總對齊題數: {completed}, awaiting: {awaiting}, codes: {len(codes_total)}')


if __name__ == '__main__':
    main()
