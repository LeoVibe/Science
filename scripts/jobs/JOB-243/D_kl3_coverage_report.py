#!/usr/bin/env python3
"""
JOB-243 Phase 3 — D_kl3_coverage_report.py

從 alignment_raw.json 產出 KL3 課次覆蓋報告。

每課輸出：
- 被引用題目數
- 引用 codes 分布
- 認知層次分布
- 常見命題方向 (misconception_topics)
- 未覆蓋的 KL3 命題重點

輸出：knowledge/3_考古題/3_L2_結構化抽取/三下/alignment/kl3_coverage_report.md
"""
import json
import os
from collections import defaultdict

ROOT = '/Users/s389080/Documents/doc/work/0_AI_Project/eidosProject'
ALIGN_PATH = os.path.join(ROOT, 'knowledge/3_考古題/3_L2_結構化抽取/三下/alignment/alignment_raw.json')
OUT_PATH = os.path.join(ROOT, 'knowledge/3_考古題/3_L2_結構化抽取/三下/alignment/kl3_coverage_report.md')


def main():
    if not os.path.exists(ALIGN_PATH):
        print(f"❌ {ALIGN_PATH} 不存在，先跑 A4_merge.py")
        return 1

    raw = json.load(open(ALIGN_PATH))
    coverage = raw['kl3_to_l2_coverage']
    meta = raw['_meta']

    md = []
    md.append("*Created by Claude Code (claude-opus-4-7) at 2026-05-22*")
    md.append("")
    md.append("# 三下_國語 KL3 課次覆蓋報告 (Phase 3)")
    md.append("")
    md.append(f"`source`: `alignment_raw.json` schema v{meta.get('schema_version')}")
    md.append(f"`pilot_scope`: {meta.get('pilot_scope')}")
    md.append(f"`total_exams_processed`: {meta.get('total_exams_processed')}")
    md.append(f"`total_questions_processed`: {meta.get('total_questions_processed')}")
    md.append("")
    md.append("## 摘要")
    md.append("")
    md.append(f"- 覆蓋 KL3 課次數：**{len(coverage)} 課**（理論 36 課 = 翰林 12 + 康軒 12 + 南一 12）")
    md.append("")

    by_publisher = defaultdict(list)
    for c in coverage:
        by_publisher[c['publisher']].append(c)

    md.append("## 各版本覆蓋熱圖")
    md.append("")
    md.append("| Publisher | 已覆蓋課數 | 高頻課 (前 3) | 未覆蓋課 |")
    md.append("|:--|:--|:--|:--|")
    for pub in ['翰林', '康軒', '南一']:
        covs = sorted(by_publisher.get(pub, []), key=lambda x: -x['linked_question_count'])
        covered_lessons = set(c['lesson'] for c in covs)
        all_lessons = set(f'L{i}' for i in range(1, 13))
        uncovered = sorted(all_lessons - covered_lessons, key=lambda x: int(x[1:]))
        top3 = ', '.join(f"{c['lesson']}「{c['lesson_title']}」({c['linked_question_count']})" for c in covs[:3])
        md.append(f"| {pub} | {len(covered_lessons)}/12 | {top3} | {', '.join(uncovered) if uncovered else '無'} |")
    md.append("")

    # 詳細課次列表
    md.append("## 詳細課次覆蓋")
    md.append("")
    for pub in ['翰林', '康軒', '南一']:
        covs = sorted(by_publisher.get(pub, []), key=lambda x: int(x['lesson'][1:]) if x['lesson'].startswith('L') else 99)
        if not covs:
            continue
        md.append(f"### {pub}（{len(covs)} 課）")
        md.append("")
        for c in covs:
            md.append(f"#### {c['lesson']}「{c['lesson_title']}」 (kecode={c['kecode']})")
            md.append("")
            md.append(f"- **被引用題目數**：{c['linked_question_count']} 題")
            codes_sorted = sorted(c['linked_codes'].items(), key=lambda x: -x[1])[:8]
            if codes_sorted:
                md.append(f"- **引用 codes 分布 (前 8)**：")
                for code, n in codes_sorted:
                    md.append(f"  - {code}: ×{n}")
            cog_sorted = sorted(c['cognitive_level_distribution'].items(), key=lambda x: -x[1])
            if cog_sorted:
                cog_line = ' > '.join(f"{k}({v})" for k, v in cog_sorted)
                md.append(f"- **認知層次**：{cog_line}")
            misc = [t for t in c['misconception_topics'] if t][:6]
            if misc:
                md.append(f"- **常見命題方向 (前 6)**：{', '.join(misc)}")
            md.append("")
        md.append("---")
        md.append("")

    md.append("## 觀察")
    md.append("")
    # 統計觀察
    all_count = sum(c['linked_question_count'] for c in coverage)
    avg = all_count / max(len(coverage), 1)
    md.append(f"- 平均每課被引用題數：**{avg:.1f}** 題")
    high_count = [c for c in coverage if c['linked_question_count'] >= 10]
    low_count = [c for c in coverage if c['linked_question_count'] <= 3]
    md.append(f"- 高頻課 (≥10 題)：{len(high_count)} 課")
    md.append(f"- 低頻課 (≤3 題)：{len(low_count)} 課")
    md.append("")

    # 寫檔
    with open(OUT_PATH, 'w', encoding='utf-8') as f:
        f.write('\n'.join(md))
    print(f"✅ 已產出 {OUT_PATH} ({len(''.join(md)):,} chars)")
    print(f"   覆蓋 {len(coverage)} 課")
    return 0


if __name__ == '__main__':
    import sys
    sys.exit(main())
