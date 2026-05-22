#!/usr/bin/env python3
"""
JOB-244 Phase 3 — E_kl4_teaching_examples.py

從 alignment_raw.json 產出 KL4 教學示例報告（給老師備課用）。

每課輸出：
- 教學現場示例題 (3-5 題)
- RC-01 課文引用題（國語特有）
- 對齊統計

輸出：knowledge/3_考古題/3_L2_結構化抽取/五下/alignment/kl4_teaching_examples.md
"""
import json
import os
from collections import defaultdict

ROOT = '/Users/s389080/Documents/doc/work/0_AI_Project/eidosProject'
ALIGN_PATH = os.path.join(ROOT, 'knowledge/3_考古題/3_L2_結構化抽取/五下/alignment/alignment_raw.json')
OUT_PATH = os.path.join(ROOT, 'knowledge/3_考古題/3_L2_結構化抽取/五下/alignment/kl4_teaching_examples.md')


def kecode_pub(kecode):
    """從 kecode 抽 publisher"""
    if not kecode or len(kecode) < 2:
        return '?'
    return {'1': '翰林', '2': '康軒', '3': '南一'}.get(kecode[1], '?')


def main():
    if not os.path.exists(ALIGN_PATH):
        print(f"❌ {ALIGN_PATH} 不存在")
        return 1

    raw = json.load(open(ALIGN_PATH))
    examples = raw['kl4_to_l2_examples']
    meta = raw['_meta']

    md = []
    md.append("*Created by Claude Code (claude-opus-4-7) at 2026-05-22*")
    md.append("")
    md.append("# 五下_國語 KL4 教學示例報告 (Phase 3)")
    md.append("")
    md.append("> 給老師備課用。每課提供 3-5 題教學示例（優先含 RC-01 課文 evidence 的題目）。")
    md.append("")
    md.append(f"`source`: `alignment_raw.json` schema v{meta.get('schema_version')}")
    md.append(f"`total_exams_processed`: {meta.get('total_exams_processed')}")
    md.append("")

    # 按 publisher 分組
    by_pub = defaultdict(list)
    for e in examples:
        pub = kecode_pub(e.get('kecode', ''))
        by_pub[pub].append(e)

    # 摘要表
    md.append("## 摘要")
    md.append("")
    md.append("| Publisher | 涵蓋課數 | 總 RC-01 引用題數 |")
    md.append("|:--|:--|:--|")
    for pub in ['翰林', '康軒', '南一']:
        lst = by_pub.get(pub, [])
        rc01_total = sum(e['rc01_evidence_count'] for e in lst)
        md.append(f"| {pub} | {len(lst)}/12 | {rc01_total} |")
    md.append("")

    md.append("## 各課教學示例")
    md.append("")

    for pub in ['翰林', '康軒', '南一']:
        lst = sorted(by_pub.get(pub, []), key=lambda e: e.get('kecode', ''))
        if not lst:
            continue
        md.append(f"### {pub}")
        md.append("")
        for e in lst:
            kecode = e['kecode']
            lesson_title = e['lesson_title']
            md.append(f"#### {lesson_title} (kecode={kecode})")
            md.append("")
            md.append(f"- **總引用題數**：{len(e['linked_questions'])} 題")
            md.append(f"- **RC-01 課文引用題**：{e['rc01_evidence_count']} 題")
            md.append("")

            teaching_examples = e.get('teaching_examples', [])
            if teaching_examples:
                md.append("- **教學現場示例**：")
                for i, q in enumerate(teaching_examples, 1):
                    rc01_tag = " 🔖RC-01" if q.get('rc01_evidence') else ""
                    cog_tag = f" [{q.get('cognitive_level')}]" if q.get('cognitive_level') else ""
                    md.append(f"  {i}. `{q['exam_id']}:{q['question_id']}`{cog_tag}{rc01_tag}")
                    md.append(f"     - 題幹: {q.get('stem_preview', '?')[:80]}")
                    if q.get('rc01_quote'):
                        md.append(f"     - RC-01 引用: 「{q['rc01_quote']}」")
            md.append("")
        md.append("---")
        md.append("")

    with open(OUT_PATH, 'w', encoding='utf-8') as f:
        f.write('\n'.join(md))
    print(f"✅ 已產出 {OUT_PATH} ({len(''.join(md)):,} chars)")
    print(f"   涵蓋 {len(examples)} 課碼")
    return 0


if __name__ == '__main__':
    import sys
    sys.exit(main())
