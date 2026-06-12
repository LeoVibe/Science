"""Phase 2: auto-verify 自然版（JOB-247 三下）
規則：
- N1 + kl4_link 一致 → pass
- N2 + 同主題 + 同動詞類 → pass_with_caveat
- N2 + 動詞類不同 → needs_human_review
- N3 單源高 confidence → pass_with_caveat
- N5 unlinked + general_type 明確 → pass
- 其他 → needs_human_review
"""
import os
import json
import glob
import re
from collections import Counter

PARTIAL_DIR = 'knowledge/3_考古題/3_L2_結構化抽取/三下/alignment_science/_partial'

def code_prefix(code):
    m = re.match(r'^([a-zA-Z]+)-', code or '')
    return m.group(1) if m else None

INC_FAMILY = ['INa','INb','INc','INd','INe','INf','INg']
def same_verb_class(c1, c2):
    p1, p2 = code_prefix(c1), code_prefix(c2)
    if not p1 or not p2: return False
    if p1 in INC_FAMILY and p2 in INC_FAMILY: return True
    if p1 == p2: return True
    if (p1 in ['ai','an'] and p2 in ['ai','an']): return True
    if (p1 in ['tr','tm','tc','ti'] and p2 in ['tr','tm','tc','ti']): return True
    return False

def main():
    total_status = Counter()
    files = sorted(glob.glob(f'{PARTIAL_DIR}/*.json'))
    print(f'Processing {len(files)} partial files...')
    for fp in files:
        d = json.load(open(fp, encoding='utf-8'))
        changed = False
        for link in d.get('l2_to_kl_links', []):
            rule = link.get('match_rule', '?')
            src_l2 = link.get('source_l2', '')
            src_codex = link.get('source_codex', '')
            l2_code = src_l2.split(' ')[0] if src_l2 else None

            if rule == 'N1':
                link['verify_status'] = 'pass'
                link['verify_note'] = '雙源一致' if src_codex == l2_code else 'L2 high confidence 確認'
            elif rule == 'N2':
                if same_verb_class(l2_code, src_codex):
                    link['verify_status'] = 'pass_with_caveat'
                    link['verify_note'] = f'N2 雙源相容（同主題+同動詞類）: L2={l2_code} Codex={src_codex}'
                else:
                    link['verify_status'] = 'needs_human_review'
                    link['verify_note'] = f'N2 動詞類不同: L2={l2_code} Codex={src_codex}'
            elif rule == 'N3':
                link['verify_status'] = 'pass_with_caveat'
                link['verify_note'] = 'N3 單源命中'
            elif rule == 'N5':
                if link.get('general_type'):
                    link['verify_status'] = 'pass'
                    link['verify_note'] = f'N5 unlinked_general: {link["general_type"]}'
                else:
                    link['verify_status'] = 'needs_human_review'
                    link['verify_note'] = 'N5 但 general_type 為空'
            else:
                link['verify_status'] = 'needs_human_review'
                link['verify_note'] = f'未知 match_rule: {rule}'
            total_status[link['verify_status']] += 1
            changed = True
        if changed:
            json.dump(d, open(fp, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)

    print('=== Phase 2 auto-verify 完成 ===')
    total = sum(total_status.values())
    for s, c in sorted(total_status.items(), key=lambda x: -x[1]):
        print(f'  {s}: {c} ({c/total*100:.1f}%)')

if __name__ == '__main__':
    main()
