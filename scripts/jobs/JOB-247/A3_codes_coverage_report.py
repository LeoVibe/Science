"""Phase 3: codes 覆蓋報告（JOB-247 三下）"""
import json
import glob
from collections import Counter

PARTIAL_DIR = 'knowledge/3_考古題/3_L2_結構化抽取/三下/alignment_science/_partial'
OUT_PATH = 'knowledge/3_考古題/3_L2_結構化抽取/三下/alignment_science/codes_coverage_report.md'

codes = Counter()
codes_pub = {}
for fp in glob.glob(f'{PARTIAL_DIR}/*.json'):
    d = json.load(open(fp, encoding='utf-8'))
    pub = d.get('_meta', {}).get('publisher', '?')
    for link in d.get('l2_to_kl_links', []):
        c = link.get('primary_code')
        if c:
            codes[c] += 1
            codes_pub.setdefault(c, Counter())[pub] += 1

with open(OUT_PATH, 'w', encoding='utf-8') as f:
    f.write('# 三下自然 codes 覆蓋報告（JOB-247 Phase 3）\n\n')
    f.write(f'總 primary_code 種類: {len(codes)}\n\n')
    f.write('| code | 題數 | 翰林 | 康軒 | 南一 |\n')
    f.write('|:--|:--|:--|:--|:--|\n')
    for c, cnt in codes.most_common():
        pubs = codes_pub.get(c, Counter())
        f.write(f'| {c} | {cnt} | {pubs.get("翰林",0)} | {pubs.get("康軒",0)} | {pubs.get("南一",0)} |\n')

print(f'✓ 產出 {OUT_PATH}')
print(f'  codes 種類: {len(codes)}')
print(f'  總題數: {sum(codes.values())}')
