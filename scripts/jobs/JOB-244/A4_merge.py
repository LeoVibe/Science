#!/usr/bin/env python3
"""
JOB-244 Phase 1 — A4: 合併 partial → alignment_raw.json

讀 _partial/alignment_partial_*.json (預期 69 份 = 5 pilot + 64 full)
合併為 alignment_raw.json (schema v1.1)，含：
- l2_to_kl_links（所有 partial 累積）
- kl3_to_l2_coverage（依 publisher × lesson 反向統計）
- kl4_to_l2_examples（依 kecode 反向統計 + 抽 3-5 題作為 teaching_examples）
- unlinked_general_stats
- _meta（全局統計）
"""
import json
import glob
import os
from datetime import datetime, timezone, timedelta
from collections import defaultdict

ROOT = '/Users/s389080/Documents/doc/work/0_AI_Project/eidosProject'
PARTIAL_DIR = os.path.join(ROOT, 'knowledge/3_考古題/3_L2_結構化抽取/五下/alignment/_partial')
OUT_PATH = os.path.join(ROOT, 'knowledge/3_考古題/3_L2_結構化抽取/五下/alignment/alignment_raw.json')

# KL4 翰林 12 課 (從檔名抓)
def build_kl4_index():
    kl4 = {}  # {(publisher, lesson): {'title': str, 'kecode': str, 'kl3_anchor': str}}
    for pub in ['翰林', '康軒', '南一']:
        d = os.path.join(ROOT, f'knowledge/1_課綱研究/國語/五下/{pub}/')
        for f in sorted(os.listdir(d)):
            if '_單課研究紀錄.md' in f:
                parts = f.replace('.md', '').split('_')
                lesson = parts[3]
                title = '_'.join(parts[4:-1])
                # 從檔案抓課碼與 KL3 錨點
                with open(os.path.join(d, f), 'r', encoding='utf-8') as fh:
                    content = fh.read()
                import re
                m = re.search(r'\*\*課碼\*\*[：:]\s*`?([0-9]+)`?', content)
                kecode = m.group(1) if m else None
                m = re.search(r'(?:索引)?錨點[：:]\s*`?(kl3-[0-9a-f-]+)`?', content)
                anchor = m.group(1) if m else None
                kl4[(pub, lesson)] = {'title': title, 'kecode': kecode, 'kl3_anchor': anchor}
    return kl4

def main():
    print("=== A4 merge.py: 合併 partial → alignment_raw.json ===\n")

    partial_files = sorted(glob.glob(os.path.join(PARTIAL_DIR, 'alignment_partial_*.json')))
    print(f"找到 {len(partial_files)} 份 partial JSON\n")

    if not partial_files:
        print("❌ 無 partial 檔，先跑 A3_full_dispatch.sh")
        return 1

    kl4_idx = build_kl4_index()
    print(f"KL4 index 建立完成：{len(kl4_idx)} 課\n")

    # 1. 累積 l2_to_kl_links
    all_links = []
    excluded_legacy = 0
    excluded_unknown = 0
    total_questions = 0
    exam_count = 0
    exam_publishers = defaultdict(int)
    exam_years = defaultdict(int)

    for path in partial_files:
        d = json.load(open(path))
        meta = d['_meta']
        exam_count += 1
        pub = meta.get('publisher', '?')
        year = meta.get('academic_year', '?')
        exam_publishers[pub] += 1
        exam_years[str(year)] += 1

        for link in d.get('l2_to_kl_links', []):
            vm = link.get('version_match', 'unknown')
            if vm == 'legacy':
                excluded_legacy += 1
                continue
            if vm == 'unknown':
                excluded_unknown += 1
                continue
            all_links.append(link)
            total_questions += 1

    print(f"l2_to_kl_links 累積：{total_questions} 題（已排除 legacy={excluded_legacy} unknown={excluded_unknown}）\n")

    # 2. kl3_to_l2_coverage 反向統計
    coverage = defaultdict(lambda: {
        'linked_question_count': 0,
        'linked_question_ids': [],
        'linked_codes': defaultdict(int),
        'cognitive_level_distribution': defaultdict(int),
        'misconception_topics': []
    })

    for link in all_links:
        for kl3 in link.get('kl3_links', []):
            pub = kl3.get('publisher', '?')
            lesson = kl3.get('lesson', '?')
            key = (pub, lesson)
            cov = coverage[key]
            cov['linked_question_count'] += 1
            cov['linked_question_ids'].append(f"{link['exam_id']}:{link['question_id']}")

    # 計算 linked_codes 與 cognitive_level — 需要從 L2 試卷原始 JSON 拿
    print("計算 linked_codes / cognitive_level（需讀 L2 原始 JSON）...")
    l2_q_cache = {}  # {exam_id: {qid: question dict}}

    def load_l2(exam_id):
        if exam_id in l2_q_cache:
            return l2_q_cache[exam_id]
        # 找 L2 JSON 檔
        for sub in ['五下_國語_pilot', '五下_國語_翰林', '五下_國語_康軒', '五下_國語_南一']:
            p = os.path.join(ROOT, f'knowledge/3_考古題/3_L2_結構化抽取/五下/{sub}/{exam_id}.json')
            if os.path.exists(p):
                d = json.load(open(p))
                l2_q_cache[exam_id] = {q['question_id']: q for q in d['questions']}
                return l2_q_cache[exam_id]
        # 嘗試 golden_samples
        p = os.path.join(ROOT, f'knowledge/3_考古題/3_L2_結構化抽取/_golden_samples/五下_國語_{exam_id}.json')
        if os.path.exists(p):
            d = json.load(open(p))
            l2_q_cache[exam_id] = {q['question_id']: q for q in d['questions']}
            return l2_q_cache[exam_id]
        l2_q_cache[exam_id] = {}
        return {}

    for link in all_links:
        l2_qs = load_l2(link['exam_id'])
        q = l2_qs.get(link['question_id'])
        if not q:
            continue
        cognitive = q.get('cognitive_level')
        codes = [c.get('code') for c in q.get('codes_candidate', []) if c.get('code')]
        topic_keywords = q.get('topic_keywords', [])

        for kl3 in link.get('kl3_links', []):
            pub = kl3.get('publisher', '?')
            lesson = kl3.get('lesson', '?')
            key = (pub, lesson)
            cov = coverage[key]
            for code in codes:
                cov['linked_codes'][code] += 1
            if cognitive:
                cov['cognitive_level_distribution'][cognitive] += 1
            for kw in topic_keywords:
                if kw not in cov['misconception_topics']:
                    cov['misconception_topics'].append(kw)

    kl3_to_l2_coverage = []
    for (pub, lesson), info in sorted(coverage.items(), key=lambda x: (x[0][0], int(x[0][1][1:]) if x[0][1].startswith('L') else 99)):
        kl4_info = kl4_idx.get((pub, lesson), {})
        kl3_to_l2_coverage.append({
            'publisher': pub,
            'lesson': lesson,
            'lesson_title': kl4_info.get('title', '?'),
            'kecode': kl4_info.get('kecode', '?'),
            'linked_question_count': info['linked_question_count'],
            'linked_question_ids': info['linked_question_ids'],
            'linked_codes': dict(info['linked_codes']),
            'cognitive_level_distribution': dict(info['cognitive_level_distribution']),
            'misconception_topics': info['misconception_topics'][:10]
        })

    # 3. kl4_to_l2_examples
    kl4_examples_acc = defaultdict(lambda: {
        'linked_questions': [],
        'rc01_evidence_count': 0,
    })
    for link in all_links:
        for kl4 in link.get('kl4_links', []):
            kecode = kl4.get('kecode')
            if not kecode:
                continue
            entry = kl4_examples_acc[kecode]

            l2_qs = load_l2(link['exam_id'])
            q = l2_qs.get(link['question_id'])
            stem = q.get('stem', '')[:50] if q else ''
            cognitive = q.get('cognitive_level') if q else None

            entry['linked_questions'].append({
                'exam_id': link['exam_id'],
                'question_id': link['question_id'],
                'stem_preview': stem,
                'rc01_evidence': bool(kl4.get('rc01_evidence')),
                'rc01_quote': kl4.get('rc01_quote'),
                'cognitive_level': cognitive,
            })
            if kl4.get('rc01_evidence'):
                entry['rc01_evidence_count'] += 1

    kl4_to_l2_examples = []
    for kecode, info in sorted(kl4_examples_acc.items()):
        # 找回 kl4 對應的 lesson_title
        title = '?'
        for (pub, lesson), kk in kl4_idx.items():
            if kk.get('kecode') == kecode:
                title = kk.get('title')
                break
        # 抽 teaching_examples（rc01 命中題優先 + 認知層次多元）
        linked = info['linked_questions']
        rc01_priority = [q for q in linked if q['rc01_evidence']][:3]
        non_rc01 = [q for q in linked if not q['rc01_evidence']][:2]
        teaching_examples = rc01_priority + non_rc01

        kl4_to_l2_examples.append({
            'kecode': kecode,
            'lesson_title': title,
            'linked_questions': linked,
            'rc01_evidence_count': info['rc01_evidence_count'],
            'teaching_examples': teaching_examples
        })

    # 4. unlinked_general_stats
    unlinked_by_type = defaultdict(int)
    unlinked_total = 0
    for link in all_links:
        gtype = link.get('general_type')
        if gtype:
            unlinked_by_type[gtype] += 1
            unlinked_total += 1

    # 5. 組裝最終 alignment_raw.json
    now_tpe = datetime.now(timezone(timedelta(hours=8))).isoformat()

    raw = {
        '_meta': {
            'schema_version': '1.1',
            'pilot_scope': '五下_國語',
            'extracted_at': now_tpe,
            'merger': 'A4_merge.py - JOB-244 Phase 1',
            'total_exams_processed': exam_count,
            'total_questions_processed': total_questions,
            'excluded_exams': {
                'legacy_count': excluded_legacy,
                'unknown_excluded_count': excluded_unknown,
            },
            'publisher_distribution': dict(exam_publishers),
            'year_distribution': dict(exam_years),
        },
        'l2_to_kl_links': all_links,
        'kl3_to_l2_coverage': kl3_to_l2_coverage,
        'kl4_to_l2_examples': kl4_to_l2_examples,
        'unlinked_general_stats': {
            'total_count': unlinked_total,
            'by_general_type': dict(unlinked_by_type),
        }
    }

    # 寫檔
    with open(OUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(raw, f, ensure_ascii=False, indent=2)

    print(f"\n=== alignment_raw.json 產出完成 ===")
    print(f"路徑: {OUT_PATH}")
    print(f"大小: {os.path.getsize(OUT_PATH):,} bytes")
    print()
    print(f"=== 統計摘要 ===")
    print(f"試卷數: {exam_count}")
    print(f"題目數: {total_questions} (legacy/unknown 排除 {excluded_legacy + excluded_unknown})")
    print(f"Publisher 分布: {dict(exam_publishers)}")
    print(f"學年分布: {dict(exam_years)}")
    print(f"kl3_to_l2_coverage: {len(kl3_to_l2_coverage)} 課")
    print(f"kl4_to_l2_examples: {len(kl4_to_l2_examples)} 課碼")
    print(f"unlinked_general 總數: {unlinked_total}")
    print(f"unlinked 類型 top 5:")
    for t, n in sorted(unlinked_by_type.items(), key=lambda x: -x[1])[:5]:
        print(f"    {t}: {n}")
    return 0

if __name__ == '__main__':
    import sys
    sys.exit(main())
