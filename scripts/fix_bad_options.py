#!/usr/bin/env python3
"""
fix_bad_options.py
JOB-122：修正 G3 S2 國語題庫中含垃圾選項的題目。

垃圾選項特徵字串：
  - 這是一個
  - 在實務上
  - 這一點
  - 代表性的現象
  - 具備代表
  - 這屬於課文
  - 這點在實務上
  - 值得注意的地方（用於擴展模式偵測）

修正邏輯：
  1. 若選項為「有意義前段，垃圾後段」（以中文逗號或句號分隔），保留前段
  2. 若整個選項都是垃圾，保留前段（以逗號為界）
  3. 修正後 cqi_score 設為 null
"""

import json
import re
import os
import copy
from datetime import datetime

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

# 垃圾填充語句的 regex 模式（含前導分隔符）
BAD_PATTERNS = [
    r'[，,。．]?\s*這是一個[^。，,]*',
    r'[，,。．]?\s*在實務上[^。，,]*',
    r'[，,。．]?\s*這一點[^。，,]*',
    r'[，,。．]?\s*代表性的現象[^。，,]*',
    r'[，,。．]?\s*具備代表[^。，,]*',
    r'[，,。．]?\s*這屬於課文[^。，,]*',
    r'[，,。．]?\s*這點在實務上[^。，,]*',
    r'[，,。．]?\s*值得注意的地方[^。，,]*',
]

# 簡單偵測字串（判斷選項是否含垃圾）
DETECT_STRINGS = [
    '這是一個', '在實務上', '這一點', '代表性的現象',
    '具備代表', '這屬於課文', '這點在實務上', '值得注意的地方',
]

def has_bad_content(text):
    return any(s in text for s in DETECT_STRINGS)

def clean_option(text):
    """
    清除選項中的垃圾語句，保留有意義部分。
    返回 (cleaned_text, was_modified)
    """
    original = text
    cleaned = text

    # 移除結尾的重複片段（如「這點在實務上很重要。，這點在實務上很重要。」）
    for pat in BAD_PATTERNS:
        cleaned = re.sub(pat + r'(\s*[。．])?', '', cleaned)

    # 清除多餘的標點和空白
    cleaned = cleaned.strip('，,。．、 　\n')
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()

    # 若清理後為空字串，保留原文（不做替換，留給人工處理）
    if not cleaned:
        cleaned = original

    return cleaned, (cleaned != original)


def process_file(subdir, fname):
    path = os.path.join(BASE, subdir, fname)
    with open(path, encoding='utf-8') as f:
        data = json.load(f)

    questions = data['questions']
    modifications = []
    modified_count = 0

    for q_idx, q in enumerate(questions):
        opts = q.get('options', [])
        answer_idx = q.get('answer_index')
        q_modified = False

        for o_idx, opt in enumerate(opts):
            if not has_bad_content(opt):
                continue

            is_answer = (o_idx == answer_idx)
            cleaned, was_modified = clean_option(opt)

            if was_modified:
                modifications.append({
                    'file': fname,
                    'q_num': q_idx + 1,
                    'opt_idx': o_idx,
                    'is_answer': is_answer,
                    'original': opt,
                    'cleaned': cleaned,
                })
                questions[q_idx]['options'][o_idx] = cleaned
                q_modified = True
                modified_count += 1

        if q_modified:
            # 修正後 cqi_score 設為 null（待重新評估）
            questions[q_idx]['cqi_score'] = None

    if modifications:
        # 寫回檔案
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f'\n[{fname}] 修正了 {modified_count} 個選項')
        for m in modifications:
            ans_mark = ' ★答案選項' if m['is_answer'] else ''
            print(f'  Q{m["q_num"]} opt[{m["opt_idx"]}]{ans_mark}:')
            print(f'    原: {m["original"]}')
            print(f'    修: {m["cleaned"]}')
    else:
        print(f'[{fname}] 無需修正')

    return modifications


def main():
    print('=' * 70)
    print(f'JOB-122 fix_bad_options.py 執行時間：{datetime.now().strftime("%Y-%m-%d %H:%M:%S")}')
    print('=' * 70)

    all_mods = []
    for subdir, fname in FILES:
        mods = process_file(subdir, fname)
        all_mods.extend(mods)

    print('\n' + '=' * 70)
    print(f'總計修正：{len(all_mods)} 個壞選項，涉及 {len(set(m["file"] for m in all_mods))} 個檔案')

    # 輸出 JSON 修正日誌
    log_path = '/Users/s389080/Documents/doc/work/0_AI_Project/eidosProject/jobs/fix_bad_options_log.json'
    os.makedirs(os.path.dirname(log_path), exist_ok=True)
    with open(log_path, 'w', encoding='utf-8') as f:
        json.dump({
            'run_at': datetime.now().isoformat(),
            'total_fixed': len(all_mods),
            'modifications': all_mods,
        }, f, ensure_ascii=False, indent=2)
    print(f'修正日誌已寫入：{log_path}')


if __name__ == '__main__':
    main()
