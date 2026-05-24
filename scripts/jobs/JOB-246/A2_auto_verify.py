"""Phase 2: auto-verify 自然版（spec v2.0）

處理 mixed 狀態：
- 已完成 Codex 抽查的 partial（match_rule = N1/N2/N3/N5）→ 普查分流
- 仍在 _pending 的 partial（match_rule = N1_pending / N2_or_N3_pending）→ 標 awaiting_codex

verify_status 分流規則：
- N1 + L2 high confidence → pass
- N2 + 同主題 + 同動詞類 → pass_with_caveat
- N3 單源高 confidence → pass_with_caveat
- N5 unlinked + general_type → pass
- 衝突 / N2 動詞類不同 → needs_human_review
- _pending → awaiting_codex（等 Task 6 全量完成後再 verify）

副作用：批次修正 codex 編的 kecode 格式（KL4-G4S2-XX → 0X40404）
"""
import os
import json
import glob
import re
from collections import Counter

PARTIAL_DIR = 'knowledge/3_考古題/3_L2_結構化抽取/四下/alignment_science/_partial'

# 動詞類前綴對照（spec v2.0 §2.2）
INC_FAMILY = ['INa', 'INb', 'INc', 'INd', 'INe', 'INf', 'INg']


def code_prefix(code):
    m = re.match(r'^([a-zA-Z]+)-', code or '')
    return m.group(1) if m else None


def same_verb_class(c1, c2):
    p1, p2 = code_prefix(c1), code_prefix(c2)
    if not p1 or not p2:
        return False
    if p1 in INC_FAMILY and p2 in INC_FAMILY:
        return True
    if p1 == p2:
        return True
    if p1 in ['ai', 'an'] and p2 in ['ai', 'an']:
        return True
    if p1 in ['tr', 'tm', 'tc', 'ti'] and p2 in ['tr', 'tm', 'tc', 'ti']:
        return True
    return False


def fix_kecode(kl4_link, publisher, semester='四下', subject='自然'):
    """codex 編的 kecode 可能是 'KL4-G4S2-KX-L3-KP05' 格式，修為 spec v2.0 §3.4 規定的 7 碼。

    格式：`0{版本碼1}{年級1}{學期碼2}{課次2}` = 7 碼
    版本碼：1=翰林, 2=康軒, 3=南一
    """
    if not isinstance(kl4_link, dict):
        return kl4_link
    kecode = kl4_link.get('kecode', '')
    if not kecode or re.match(r'^\d{7}$', kecode):
        return kl4_link  # 已是正確格式

    # 抽 lesson L 編號
    lesson = kl4_link.get('lesson', '')
    m_lesson = re.search(r'L(\d+)', lesson)
    if not m_lesson:
        return kl4_link  # 無法解析
    lesson_num = int(m_lesson.group(1))

    pub_code = {'翰林': 1, '康軒': 2, '南一': 3}.get(publisher, 0)
    if not pub_code:
        return kl4_link

    grade = 4  # 四下
    sem = 2  # 下學期

    new_kecode = f'0{pub_code}{grade}{sem:02d}{lesson_num:02d}'
    kl4_link['kecode'] = new_kecode
    kl4_link['_codex_kecode_original'] = kecode  # 留底
    return kl4_link


def main():
    total_status = Counter()
    kecode_fixed = 0
    pending_count = 0

    for fp in sorted(glob.glob(f'{PARTIAL_DIR}/*.json')):
        d = json.load(open(fp, encoding='utf-8'))
        publisher = d['_meta'].get('publisher', '?')
        changed = False
        for link in d['l2_to_kl_links']:
            rule = link.get('match_rule', '?')
            src_l2 = link.get('source_l2', '') or ''
            src_codex = link.get('source_codex', '') or ''
            l2_code = src_l2.split(' ')[0] if src_l2 else None

            # 修 kecode 格式
            kl4_link = link.get('kl4_link')
            if kl4_link:
                fixed = fix_kecode(dict(kl4_link), publisher)
                if fixed.get('kecode') != kl4_link.get('kecode'):
                    link['kl4_link'] = fixed
                    kecode_fixed += 1
                    changed = True

            # verify_status 分流
            if rule == 'N1':
                link['verify_status'] = 'pass'
                link['verify_note'] = '雙源一致' if src_codex == l2_code else 'L2 high confidence + Codex 確認'
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
                    link['verify_status'] = 'pass_with_caveat'
                    link['verify_note'] = 'N5 但 general_type 為空 — 待後續補'
            elif rule in ('N1_pending', 'N2_or_N3_pending'):
                # 待 codex 抽查
                link['verify_status'] = 'awaiting_codex'
                link['verify_note'] = f'{rule}：Task 6 全量 codex dispatch 後重 verify'
                pending_count += 1
            else:
                link['verify_status'] = 'needs_human_review'
                link['verify_note'] = f'未知 match_rule: {rule}'
            total_status[link['verify_status']] += 1
            changed = True

        if changed:
            json.dump(d, open(fp, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)

    print('=== Phase 2 auto-verify 完成 ===')
    print(f'kecode 修正: {kecode_fixed}')
    print(f'awaiting_codex (Phase 1a 階段 _pending): {pending_count}')
    print()
    total = sum(total_status.values())
    for s, c in sorted(total_status.items(), key=lambda x: -x[1]):
        print(f'  {s}: {c} ({c/total*100:.1f}%)')
    print(f'  總計: {total}')


if __name__ == '__main__':
    main()
