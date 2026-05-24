"""Phase 0: 四下自然 L2 codes_candidate 分布統計
輸出：
  - 總題數 / 三家分布
  - codes_candidate confidence 分布（high/medium/low）
  - N1/N2/N3/N4/N5 預估比例
  - 預判 codes 覆蓋度
"""
import os
import json
import re
from collections import Counter, defaultdict

BASE = 'knowledge/3_考古題/3_L2_結構化抽取/四下'
SUBJECT = '自然'
PUBLISHERS = ['翰林', '康軒', '南一']

def main():
    total_q = 0
    by_pub = Counter()
    conf_dist = Counter()
    code_count_per_q = Counter()
    code_prefix = Counter()
    no_code_q = 0

    for pub in PUBLISHERS:
        d = os.path.join(BASE, f'四下_{SUBJECT}_{pub}')
        if not os.path.exists(d):
            continue
        for f in sorted(os.listdir(d)):
            if not f.endswith('.json') or f.startswith('_'):
                continue
            try:
                data = json.load(open(os.path.join(d, f), encoding='utf-8'))
                for q in data.get('questions', []):
                    total_q += 1
                    by_pub[pub] += 1
                    cc = q.get('codes_candidate', [])
                    code_count_per_q[len(cc)] += 1
                    if not cc:
                        no_code_q += 1
                        continue
                    for c in cc:
                        conf_dist[c.get('confidence', '?')] += 1
                        code = c.get('code', '')
                        m = re.match(r'^([a-zA-Z]+)-', code)
                        if m:
                            code_prefix[m.group(1)] += 1
            except Exception as e:
                print(f'  ⚠️ {f}: {e}')

    print('=== Phase 0：四下自然 L2 codes_candidate 統計 ===')
    print(f'總題數: {total_q}')
    print(f'三家分布: {dict(by_pub)}')
    print()
    print(f'單題 codes 數量分布: {dict(code_count_per_q)}')
    print(f'無 code 題數: {no_code_q} ({no_code_q/total_q*100:.1f}%)')
    print()
    print(f'codes confidence 分布: {dict(conf_dist)}')
    print()
    print(f'code 前綴分布（top 10）:')
    for p, c in code_prefix.most_common(10):
        print(f'  {p}: {c}')

    # N1-N5 預估
    n1 = conf_dist.get('high', 0)
    n5 = no_code_q
    n2_n3 = total_q - n1 - n5
    print()
    print(f'N1-N5 預估比例（粗估）:')
    print(f'  N1 (high confidence 假設雙源一致): {n1} ({n1/total_q*100:.1f}%)')
    print(f'  N2+N3 (medium/low 需 codex 仲裁): {n2_n3} ({n2_n3/total_q*100:.1f}%)')
    print(f'  N5 (無 code): {n5} ({n5/total_q*100:.1f}%)')
    print()
    print('Pilot 通過門檻：')
    print(f'  N1 ≥ 60% 預期：{n1/total_q*100:.1f}% {"✓" if n1/total_q >= 0.6 else "⚠️ 不達標"}')

if __name__ == '__main__':
    main()
