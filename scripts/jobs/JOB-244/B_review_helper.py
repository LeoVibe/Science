#!/usr/bin/env python3
"""
JOB-244 Phase 2 普查複檢輔助 — B_review_helper.py

對單份 alignment_partial_*.json 產出「對照表 markdown」方便 Claude 逐題人工核對。

用法：
  python3 B_review_helper.py <exam_id>
  python3 B_review_helper.py --all       # 為所有 69 份產對照表（輸出到 _review/）
  python3 B_review_helper.py --stats     # 只看待 verify 的統計

輸出：
  scripts/jobs/JOB-244/_review/{exam_id}.review.md

對照表每條 link 含：
- question_id + 題型 + 題幹 (前 200 字)
- Codex 對齊結果（kl3_links / kl4_links / general_type / rc01_evidence / version_match）
- 從 KL4 抓的對照課文片段（讓 Claude 不用另開檔）
- 判定欄位（空白給 Claude 填）：verify_status, verify_note
"""
import json
import os
import sys
import glob
import re
from collections import defaultdict

ROOT = '/Users/s389080/Documents/doc/work/0_AI_Project/eidosProject'
PARTIAL_DIR = os.path.join(ROOT, 'knowledge/3_考古題/3_L2_結構化抽取/五下/alignment/_partial')
REVIEW_DIR = os.path.join(ROOT, 'scripts/jobs/JOB-244/_review')
L2_DIRS = [
    'knowledge/3_考古題/3_L2_結構化抽取/_golden_samples',
    'knowledge/3_考古題/3_L2_結構化抽取/五下/五下_國語_pilot',
    'knowledge/3_考古題/3_L2_結構化抽取/五下/五下_國語_翰林',
    'knowledge/3_考古題/3_L2_結構化抽取/五下/五下_國語_康軒',
    'knowledge/3_考古題/3_L2_結構化抽取/五下/五下_國語_南一',
]


def build_kl4_index():
    """讀 KL4 36 份，提取 課碼 / 課程名稱 / RC-01 課文摘要"""
    kl4 = {}  # {(publisher, lesson): {...}}
    for pub in ['翰林', '康軒', '南一']:
        d = os.path.join(ROOT, f'knowledge/1_課綱研究/國語/五下/{pub}/')
        for f in sorted(os.listdir(d)):
            if '_單課研究紀錄.md' in f:
                parts = f.replace('.md', '').split('_')
                lesson = parts[3]
                title = '_'.join(parts[4:-1])
                content = open(os.path.join(d, f), 'r', encoding='utf-8').read()
                kecode_m = re.search(r'\*\*課碼\*\*[：:]\s*`?([0-9]+)`?', content)
                anchor_m = re.search(r'(?:索引)?錨點[：:]\s*`?(kl3-[0-9a-f-]+)`?', content)
                rc01_m = re.search(r'RC-01\s*\n+(.*?)(?=\n##|\n###|\Z)', content, re.DOTALL)
                rc01_text = rc01_m.group(1).strip()[:500] if rc01_m else '(RC-01 未抓到)'
                kl4[(pub, lesson)] = {
                    'title': title,
                    'kecode': kecode_m.group(1) if kecode_m else '?',
                    'kl3_anchor': anchor_m.group(1) if anchor_m else '?',
                    'rc01_snippet': rc01_text,
                }
    return kl4


def load_l2(exam_id):
    """找對應 L2 JSON 並回傳 questions dict"""
    for sub in L2_DIRS:
        p = os.path.join(ROOT, sub, f'{exam_id}.json')
        if os.path.exists(p):
            d = json.load(open(p))
            return d['_meta'], {q['question_id']: q for q in d['questions']}
        # golden_samples 有 prefix
        p2 = os.path.join(ROOT, sub, f'五下_國語_{exam_id}.json')
        if os.path.exists(p2):
            d = json.load(open(p2))
            return d['_meta'], {q['question_id']: q for q in d['questions']}
    return None, {}


def build_review_md(partial_path, kl4_idx):
    align = json.load(open(partial_path))
    meta = align['_meta']
    exam_id = meta['partial_for']
    pub = meta['publisher']
    year = meta.get('academic_year', '?')
    vm_inferred = meta.get('version_match_inferred', '?')

    l2_meta, l2_qs = load_l2(exam_id)
    if not l2_qs:
        return f"# {exam_id}\n\n❌ 找不到 L2 原始 JSON\n"

    md = []
    md.append(f"# Phase 2 普查 — {exam_id}")
    md.append("")
    md.append(f"`publisher`: {pub} | `academic_year`: {year} | `version_match_inferred`: {vm_inferred}")
    md.append(f"`total_questions`: {meta.get('total_questions', '?')}")
    md.append(f"`partial_path`: {os.path.relpath(partial_path, ROOT)}")
    md.append("")
    md.append("---")
    md.append("")

    # 統計區
    links = align['l2_to_kl_links']
    r1, r2, r3, r4 = 0, 0, 0, 0
    rc01 = 0
    vm_counts = defaultdict(int)
    for link in links:
        vm_counts[link.get('version_match', 'missing')] += 1
        for kl3 in link.get('kl3_links', []):
            rule = kl3.get('match_rule', '')
            if 'R1' in rule: r1 += 1
            elif 'R2' in rule: r2 += 1
            elif 'R4' in rule: r4 += 1
        if link.get('general_type'):
            r3 += 1
        for kl4 in link.get('kl4_links', []):
            if kl4.get('rc01_evidence'):
                rc01 += 1
    md.append(f"## 統計")
    md.append("")
    md.append(f"- R1={r1} R2={r2} R3={r3} R4={r4} rc01={rc01}")
    md.append(f"- version_match: " + " ".join(f"{k}={v}" for k, v in vm_counts.items()))
    md.append("")
    md.append("---")
    md.append("")

    # 逐題對照
    md.append("## 逐題對照（Claude 在 verify_status 欄位填判定）")
    md.append("")
    md.append("**verify_status 選項**：")
    md.append("- `pass` 完全正確")
    md.append("- `pass_with_caveat` 對但有疑慮（verify_note 必填說明）")
    md.append("- `reject_high` high confidence 卻錯（R1 evidence 不在題幹中，或 lesson 錯）")
    md.append("- `reject_medium` medium confidence 錯（R2 false positive）")
    md.append("- `reject_overlinked` R4 過度連結（其中 ≥1 條無 evidence）")
    md.append("- `missed_should_link` R3 漏抓（應 link 某課卻標 unlinked_general）")
    md.append("")

    for i, link in enumerate(links, 1):
        qid = link['question_id']
        q = l2_qs.get(qid, {})
        stem = q.get('stem', '?')[:200]
        qtype = q.get('type', '?')
        vm = link.get('version_match', '?')
        gtype = link.get('general_type', None)

        md.append(f"### [{i}/{len(links)}] {qid}")
        md.append("")
        md.append(f"- **題型**：{qtype}")
        md.append(f"- **題幹**：{stem}")
        md.append(f"- **version_match**：{vm}")
        if gtype:
            md.append(f"- **general_type (R3)**：{gtype}")

        # kl3_links 詳情
        kl3_list = link.get('kl3_links', [])
        if kl3_list:
            md.append(f"- **對齊到 KL3 課次**：")
            for kl3 in kl3_list:
                p = kl3.get('publisher')
                L = kl3.get('lesson')
                title = kl3.get('lesson_title')
                kl4_actual = kl4_idx.get((p, L), {}).get('title', '?')
                match_kl4 = '✅' if kl4_actual == title else '❌'
                md.append(f"  - {match_kl4} {p} {L}「{title}」（KL4 實際:「{kl4_actual}」）"
                          f" - {kl3.get('match_rule')} / {kl3.get('confidence')}")
                md.append(f"    - evidence: 「{kl3.get('evidence', '')}」")

        # kl4_links 詳情
        kl4_list = link.get('kl4_links', [])
        if kl4_list:
            md.append(f"- **對齊到 KL4 課碼**：")
            for kl4 in kl4_list:
                rc01 = kl4.get('rc01_evidence', False)
                rc01_quote = kl4.get('rc01_quote', '')
                md.append(f"  - kecode={kl4.get('kecode')} rc01={rc01}")
                if rc01_quote:
                    quote_in_stem = rc01_quote in stem
                    icon = '✅' if quote_in_stem else '⚠️'
                    md.append(f"    - {icon} rc01_quote: 「{rc01_quote}」 (在題幹中: {'是' if quote_in_stem else '否'})")

        md.append("")
        md.append(f"**verify_status**: `pending`  ← Claude 在此填判定")
        md.append(f"**verify_note**: ")
        md.append("")
        md.append("---")
        md.append("")

    return '\n'.join(md)


def main():
    args = sys.argv[1:]
    if not args:
        print("用法：")
        print("  python3 B_review_helper.py <exam_id>          # 單份對照表")
        print("  python3 B_review_helper.py --all              # 全部 partial 產對照表")
        print("  python3 B_review_helper.py --stats            # 只看 pending 統計")
        return 1

    os.makedirs(REVIEW_DIR, exist_ok=True)
    kl4_idx = build_kl4_index()

    if args[0] == '--stats':
        partials = sorted(glob.glob(os.path.join(PARTIAL_DIR, 'alignment_partial_*.json')))
        total_q = 0
        pending = 0
        verified = defaultdict(int)
        for p in partials:
            d = json.load(open(p))
            for link in d['l2_to_kl_links']:
                total_q += 1
                vs = link.get('verify_status', 'pending')
                if vs == 'pending':
                    pending += 1
                else:
                    verified[vs] += 1
        print(f"=== Phase 2 普查進度 ===")
        print(f"總題數: {total_q}")
        print(f"pending: {pending} ({pending/max(total_q,1)*100:.1f}%)")
        print(f"verified: {dict(verified)}")
        print(f"已 verify: {total_q - pending} ({(total_q-pending)/max(total_q,1)*100:.1f}%)")
        return 0

    if args[0] == '--all':
        partials = sorted(glob.glob(os.path.join(PARTIAL_DIR, 'alignment_partial_*.json')))
        print(f"產出 {len(partials)} 份對照表 → {REVIEW_DIR}")
        for p in partials:
            exam_id = os.path.basename(p).replace('alignment_partial_', '').replace('.json', '')
            md = build_review_md(p, kl4_idx)
            out = os.path.join(REVIEW_DIR, f'{exam_id}.review.md')
            with open(out, 'w', encoding='utf-8') as f:
                f.write(md)
            print(f"  ✅ {exam_id}.review.md ({len(md):,} chars)")
        return 0

    # 單份
    exam_id = args[0]
    partial = os.path.join(PARTIAL_DIR, f'alignment_partial_{exam_id}.json')
    if not os.path.exists(partial):
        print(f"❌ 找不到 partial: {partial}")
        return 1
    md = build_review_md(partial, kl4_idx)
    out = os.path.join(REVIEW_DIR, f'{exam_id}.review.md')
    with open(out, 'w', encoding='utf-8') as f:
        f.write(md)
    print(f"✅ 已產出 {out} ({len(md):,} chars)")
    return 0


if __name__ == '__main__':
    sys.exit(main())
