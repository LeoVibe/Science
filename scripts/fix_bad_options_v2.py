#!/usr/bin/env python3
"""
fix_bad_options_v2.py
第二輪清理：修正第一輪留下的「，這點」殘留，以及 KangHsuan 的殘缺選項。

本腳本針對以下情況：
1. 選項尾端含「，這點」殘留（第一輪 regex 未能完整清除）
2. KangHsuan L3 Q52 opt[1] 被截斷的選項需要手動補齊
3. NanYi 各選項中「。，這點」殘留

策略：
- 用更廣泛的 regex 清除 「[，,。．]?[\s]*這點[^，,。]*[。．]?」
- 以及清除尾端多餘的「。，」「，」「。」
"""

import json
import re
import os

BASE = '/Users/s389080/Documents/doc/work/0_AI_Project/eidosProject/question/platform/G3/Chinese/S2'

FILES = [
    ('HanLin',    'G3_S2_CHI_HANLIN_L2.json'),
    ('HanLin',    'G3_S2_CHI_HANLIN_L3.json'),
    ('HanLin',    'G3_S2_CHI_HANLIN_L6.json'),
    ('HanLin',    'G3_S2_CHI_HANLIN_L9.json'),
    ('HanLin',    'G3_S2_CHI_HANLIN_L12.json'),
    ('KangHsuan', 'G3_S2_CHI_KANGHSUAN_L3.json'),
    ('NanYi',     'G3_S2_CHI_NANYI_L1.json'),
    ('NanYi',     'G3_S2_CHI_NANYI_L2.json'),
    ('NanYi',     'G3_S2_CHI_NANYI_L3.json'),
    ('NanYi',     'G3_S2_CHI_NANYI_L4.json'),
    ('NanYi',     'G3_S2_CHI_NANYI_L5.json'),
    ('NanYi',     'G3_S2_CHI_NANYI_L6.json'),
    ('NanYi',     'G3_S2_CHI_NANYI_L7.json'),
    ('NanYi',     'G3_S2_CHI_NANYI_L8.json'),
    ('NanYi',     'G3_S2_CHI_NANYI_L9.json'),
    ('NanYi',     'G3_S2_CHI_NANYI_L10.json'),
    ('NanYi',     'G3_S2_CHI_NANYI_L11.json'),
    ('NanYi',     'G3_S2_CHI_NANYI_L12.json'),
]

# KangHsuan Q52 opt[1] 手動修正：截斷到「告訴大家這是一個高科技的高級商店才對！」前的部分
# 原文：「只要在自己的頭上裝一根天線，告訴大家這是一個高科技的高級商店才對！」
# 正確選項：「只要在自己的頭上裝一根天線」
MANUAL_FIXES = {
    'G3_S2_CHI_KANGHSUAN_L3.json': {
        # (q_idx, opt_idx): new_text
        (51, 1): '只要在自己的頭上裝一根天線',
    }
}

# HANLIN L2 Q21 opt[1] 手動修正
# 原文清理後變成「通常出現在剛認識新朋友的第一句話中」，前面「這是一個...疑問詞」被誤刪
# 需還原為合理干擾選項（這是一個詢問姓名年齡的疑問詞）
MANUAL_FIXES['G3_S2_CHI_HANLIN_L2.json'] = {
    (20, 1): '詢問別人姓名、年齡、住所的疑問詞',
}


def clean_residual(text):
    """清除殘留的「，這點」「。，這點」等尾端垃圾"""
    original = text
    # 清除「[。]?[，]?這點[^，。]*[。]?」在尾端
    text = re.sub(r'[。．]?[，,]\s*這點[^，,。．]*[。．]?$', '', text)
    # 清除獨立的「，這點」
    text = re.sub(r'[，,]\s*這點$', '', text)
    # 清除尾端多餘的「。，」「，。」「，」「。」等標點組合
    text = re.sub(r'[。．，,、\s]+$', '', text)
    # 清除頭端多餘標點
    text = text.strip()
    return text, (text != original)


def still_has_issues(text):
    BAD = ['這是一個', '在實務上', '這一點', '代表性的現象', '具備代表', '這屬於課文', '這點在實務上', '值得注意的地方']
    # 也偵測殘留的「，這點」
    if re.search(r'[，,]\s*這點\s*$', text):
        return True
    return any(s in text for s in BAD)


def process_file(subdir, fname):
    path = os.path.join(BASE, subdir, fname)
    with open(path, encoding='utf-8') as f:
        data = json.load(f)

    questions = data['questions']
    modifications = []
    modified = False

    for q_idx, q in enumerate(questions):
        opts = q.get('options', [])

        # 手動修正優先
        manual = MANUAL_FIXES.get(fname, {})

        for o_idx, opt in enumerate(opts):
            new_opt = opt
            was_changed = False

            # 手動修正
            if (q_idx, o_idx) in manual:
                new_opt = manual[(q_idx, o_idx)]
                was_changed = True
            else:
                # 自動清除殘留
                cleaned, changed = clean_residual(opt)
                if changed:
                    new_opt = cleaned
                    was_changed = True

            if was_changed:
                modifications.append({
                    'q_num': q_idx + 1,
                    'opt_idx': o_idx,
                    'original': opt,
                    'cleaned': new_opt,
                })
                questions[q_idx]['options'][o_idx] = new_opt
                modified = True

    if modified:
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f'\n[{fname}] 第二輪修正了 {len(modifications)} 個選項')
        for m in modifications:
            print(f'  Q{m["q_num"]} opt[{m["opt_idx"]}]:')
            print(f'    原: {m["original"]}')
            print(f'    修: {m["cleaned"]}')
    else:
        print(f'[{fname}] 第二輪：無殘留問題')

    return modifications


def verify_clean(subdir, fname):
    """驗證是否還有殘留問題"""
    path = os.path.join(BASE, subdir, fname)
    with open(path, encoding='utf-8') as f:
        data = json.load(f)
    issues = []
    for q_idx, q in enumerate(data['questions']):
        for o_idx, opt in enumerate(q.get('options', [])):
            if still_has_issues(opt):
                issues.append(f'  Q{q_idx+1} opt[{o_idx}]: {opt}')
    return issues


def main():
    print('=' * 70)
    print('fix_bad_options_v2.py — 第二輪殘留清理')
    print('=' * 70)

    all_mods = []
    for subdir, fname in FILES:
        mods = process_file(subdir, fname)
        all_mods.extend(mods)

    print('\n' + '=' * 70)
    print(f'第二輪總計修正：{len(all_mods)} 個選項')

    # 最終驗證
    print('\n--- 最終驗證（確認無殘留垃圾）---')
    all_clean = True
    for subdir, fname in FILES:
        issues = verify_clean(subdir, fname)
        if issues:
            all_clean = False
            print(f'[{fname}] 仍有問題：')
            for i in issues:
                print(i)
        else:
            print(f'[{fname}] OK')

    if all_clean:
        print('\n所有選項已清潔，無殘留垃圾語句。')
    else:
        print('\n仍有部分選項需要人工確認。')


if __name__ == '__main__':
    main()
