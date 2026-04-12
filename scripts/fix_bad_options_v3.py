#!/usr/bin/env python3
"""
fix_bad_options_v3.py
第三輪清理：處理更多隱藏垃圾模式

新發現的垃圾尾綴模式：
- 「，並且需要經過深思熟慮的考量」
- 「，這也是作者想強調的重點之一」
- 「。，並且需要經過深思熟慮的考量」
- 「。，這也是作者想強調的重點之一」
- 殘留的「。，」組合

同時對全部 NanYi 檔案（非僅 18 個問題檔）的所有選項做完整掃描與清理。
"""

import json
import re
import os

BASE = '/Users/s389080/Documents/doc/work/0_AI_Project/eidosProject/question/platform/G3/Chinese/S2'

# 全面掃描所有 G3 S2 CHI 相關檔案
def get_all_files():
    result = []
    for subdir in ['HanLin', 'KangHsuan', 'NanYi']:
        dpath = os.path.join(BASE, subdir)
        for f in os.listdir(dpath):
            if f.endswith('.json') and 'manifest' not in f:
                result.append((subdir, f))
    return result

# 完整垃圾尾綴模式（從最長到最短排序，避免截斷）
BAD_SUFFIXES = [
    r'[。．]?[，,]\s*並且需要經過深思熟慮的考量[。．]?',
    r'[。．]?[，,]\s*這也是作者想強調的重點之一[。．]?',
    r'[。．]?[，,]\s*這點在實務上很重要[。．]?',
    r'[，,]\s*這點$',
    r'[，,]\s*這一點在實務上[^，,。．]*[。．]?',
    r'[，,]\s*這是一個[^，,。．]*[。．]?',
    r'[，,]\s*在實務上[^，,。．]*[。．]?',
    r'[，,]\s*這屬於課文[^，,。．]*[。．]?',
    r'[，,]\s*具備代表[^，,。．]*[。．]?',
    r'[，,]\s*代表性的現象[^，,。．]*[。．]?',
    r'[，,]\s*值得注意的地方[^，,。．]*[。．]?',
    # 清除「。，」殘留標點
    r'[。．][，,]+$',
    r'[，,][。．]+$',
]

DETECT_BAD = [
    '並且需要經過深思熟慮的考量',
    '這也是作者想強調的重點之一',
    '這是一個', '在實務上', '這一點', '代表性的現象',
    '具備代表', '這屬於課文', '這點在實務上', '值得注意的地方',
]

def has_bad_content(text):
    for s in DETECT_BAD:
        if s in text:
            return True
    if re.search(r'[，,]\s*這點\s*$', text):
        return True
    if re.search(r'[。．][，,]', text):
        return True
    return False


def clean_option(text):
    original = text
    for pat in BAD_SUFFIXES:
        text = re.sub(pat, '', text)
    # 清除尾端殘留標點和空白
    text = re.sub(r'[。．，,、\s]+$', '', text)
    text = text.strip()
    if not text:
        text = original
    return text, (text != original)


def process_file(subdir, fname):
    path = os.path.join(BASE, subdir, fname)
    with open(path, encoding='utf-8') as f:
        data = json.load(f)

    questions = data['questions']
    modifications = []
    modified = False

    for q_idx, q in enumerate(questions):
        for o_idx, opt in enumerate(q.get('options', [])):
            if not has_bad_content(opt):
                continue
            cleaned, was_changed = clean_option(opt)
            if was_changed:
                modifications.append({
                    'q_num': q_idx + 1,
                    'opt_idx': o_idx,
                    'original': opt,
                    'cleaned': cleaned,
                })
                questions[q_idx]['options'][o_idx] = cleaned
                if questions[q_idx].get('cqi_score') is not None:
                    questions[q_idx]['cqi_score'] = None
                modified = True

    if modified:
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f'[{fname}] 修正 {len(modifications)} 個選項')
        for m in modifications:
            print(f'  Q{m["q_num"]} opt[{m["opt_idx"]}]: {m["original"]!r} => {m["cleaned"]!r}')

    return modifications


def verify_clean():
    """最終全面驗證"""
    files = get_all_files()
    all_issues = []
    for subdir, fname in sorted(files):
        path = os.path.join(BASE, subdir, fname)
        with open(path, encoding='utf-8') as f:
            data = json.load(f)
        for q_idx, q in enumerate(data['questions']):
            for o_idx, opt in enumerate(q.get('options', [])):
                if has_bad_content(opt):
                    all_issues.append(f'{fname} Q{q_idx+1} opt[{o_idx}]: {opt}')
    return all_issues


def main():
    print('=' * 70)
    print('fix_bad_options_v3.py — 第三輪完整清理')
    print('=' * 70)

    files = get_all_files()
    all_mods = []
    for subdir, fname in sorted(files):
        mods = process_file(subdir, fname)
        if mods:
            all_mods.extend(mods)

    print(f'\n第三輪總計修正：{len(all_mods)} 個選項')

    print('\n--- 最終全面驗證 ---')
    issues = verify_clean()
    if not issues:
        print('所有選項已完全清潔，無殘留垃圾語句。')
    else:
        print(f'仍有 {len(issues)} 個問題需人工確認：')
        for i in issues:
            print(' ', i)


if __name__ == '__main__':
    main()
