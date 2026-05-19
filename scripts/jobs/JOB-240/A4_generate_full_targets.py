#!/usr/bin/env python3
"""JOB-240 Phase 5 全量 targets 產生器
從 114 份五下_國語整合 MD 中扣除 1 黃金 + 5 Pilot = 108 份分到 A/B/C 三 worker。
產出: _full_targets_A.json / _full_targets_B.json / _full_targets_C.json

黃金 / Pilot 名單於 Phase 0.2/0.3 確定後填入。
"""
import os, json, re, glob
from datetime import datetime, timezone, timedelta

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
os.chdir(ROOT)

# Phase 0.2 確定後填入（單筆 exam_id，不含 .md）
GOLDEN = ['翰林_108_內安國小_第二次段考']
# Phase 0.3 確定後填入（5 筆 exam_id，不含 .md）
PILOT = [
    '翰林_110_內安國小_第一次段考',
    '翰林_108_田中國小_第一次段考',
    '康軒_108_伸東國小_第二次段考',
    '康軒_108_中正國小_第二次段考',
    '南一_108_成功國小_第二次段考',
]
EXCLUDE = set(x for x in GOLDEN + PILOT if x)

OUT_BASE = 'knowledge/3_考古題/3_L2_結構化抽取/五下'

def parse_frontmatter(md_path):
    with open(md_path) as f:
        content = f.read()
    m = re.match(r'^---\n(.*?)\n---', content, re.S)
    if not m:
        return None
    fm_text = m.group(1)
    out = {}
    for key in ['publisher','academic_year','source_school','exam_type','combo','exam_id']:
        mm = re.search(rf'^{key}:\s*(.+)$', fm_text, re.M)
        if mm:
            v = mm.group(1).strip().strip('"')
            out[key] = v
    flags = re.findall(r'^\s*-\s+(\w+)$', fm_text.split('quality_flags:')[1].split('\n', 1)[1] if 'quality_flags:' in fm_text else '', re.M)
    out['quality_flags'] = flags
    return out

def main():
    targets = []
    for pub in ['翰林','康軒','南一']:
        pub_dir = f'knowledge/3_考古題/2_MD淬鍊文字_整合版/五下/五下_國語_{pub}'
        for f in sorted(glob.glob(f'{pub_dir}/*.md')):
            base = os.path.basename(f)
            if base.startswith('_'):
                continue
            exam_id = base.replace('.md','')
            if exam_id in EXCLUDE:
                continue
            fm = parse_frontmatter(f)
            if not fm:
                print(f'WARN: 無法解析 frontmatter: {f}')
                continue
            output_path = f'{OUT_BASE}/五下_國語_{pub}/{exam_id}.json'
            targets.append({
                'exam_id': exam_id,
                'publisher': pub,
                'md_path': f,
                'output_path': output_path,
                'quality_flags': fm.get('quality_flags', [])
            })

    # 排序：先按 publisher，再按 exam_id（穩定）
    targets.sort(key=lambda t: (t['publisher'], t['exam_id']))

    # 分配到 A/B/C 三 worker（rank % 3 → A/B/C，輪流分配）
    workers = {'A':[], 'B':[], 'C':[]}
    for i, t in enumerate(targets):
        global_rank = i + 1
        worker = 'ABC'[i % 3]
        local_rank = len(workers[worker]) + 1
        t_with_rank = {'rank': local_rank, 'global_rank': global_rank, **t}
        workers[worker].append(t_with_rank)

    now = datetime.now(timezone(timedelta(hours=8))).isoformat()

    for w in ['A','B','C']:
        out = {
            '_meta': {
                'phase': f'JOB-240 Phase 5 - 全量 worker {w}',
                'worker': w,
                'created_at': now,
                'total': len(workers[w]),
                'purpose': f'JOB-240 Phase 5 派 codex worker {w} 跑（總 {len(targets)} 份分 A/B/C 三 worker）'
            },
            'targets': workers[w]
        }
        out_path = f'scripts/jobs/JOB-240/_full_targets_{w}.json'
        with open(out_path,'w') as f:
            json.dump(out, f, ensure_ascii=False, indent=2)
        print(f'產出 {out_path}: {len(workers[w])} 份')

    # 統計
    print(f'\n=== 統計 ===')
    print(f'黃金樣本: {len([x for x in GOLDEN if x])}')
    print(f'Pilot: {len([x for x in PILOT if x])}')
    print(f'Phase 5 全量: {len(targets)} 份')
    print(f'分配: A={len(workers["A"])} + B={len(workers["B"])} + C={len(workers["C"])}')
    pub_count = {'翰林':0, '康軒':0, '南一':0}
    for t in targets:
        pub_count[t['publisher']] += 1
    print(f'出版社分布: {pub_count}')

if __name__ == '__main__':
    main()
