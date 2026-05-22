#!/usr/bin/env python3
"""
JOB-243 Phase 2 半自動 verify — C_auto_verify.py

對指定 partial JSON 跑「自動 verify」一遍，依規則填 verify_status。
規則設計保守：能 auto pass 的才填 pass，邊界 case 標 needs_human_review 由 Claude 親檢。

規則（依 spec v1.1）：

## R1 命中題 auto-judge
- ✅ kl3_links[0].lesson_title == KL4[publisher, lesson].title (review.md ✅)
- ✅ evidence 字串中能在題幹中找到關鍵字（去頭尾的「題幹中」「題幹引用」「《」「》」「一文」「一課」）
- ✅ kl4_links[0].kecode 格式正確（7 碼 + publisher 碼對）
→ 全 ✅ → pass
→ 任一 ❌ → needs_human_review

## R2 命中題 auto-judge
- ✅ lesson_title 與 KL4 對應
- ⚠️ 但 R2 易 false positive，預設標 needs_human_review

## R3 unlinked_general auto-judge
- ✅ general_type 填了
- 題幹掃 KL4 既有 36 課文名，**無命中** → pass
- 題幹**有命中** KL4 課文 → needs_human_review（可能 missed_should_link）

## R4 cross_lesson auto-judge
- 多 link 每條都有 evidence + KL4 對應正確 → pass
- 否則 → needs_human_review

## rc01_evidence
- rc01_evidence=true + rc01_quote 在題幹中 → 增強 R1/R2 的 pass 信心
- rc01_evidence=true + rc01_quote 不在題幹 → 降為 pass_with_caveat

## verify_status 結果分類
- pass: auto-judge 通過
- needs_human_review: 需 Claude 親檢的
- pass_with_caveat: 對但有疑慮 (rc01 quote 不在題幹)
- 其他 (reject_*) 由 Claude 手動填

用法：
  python3 C_auto_verify.py <exam_id>
  python3 C_auto_verify.py --all       # 對 _partial/ 所有 partial 跑
  python3 C_auto_verify.py --stats
"""
import json
import os
import sys
import glob
import re
from collections import defaultdict

ROOT = '/Users/s389080/Documents/doc/work/0_AI_Project/eidosProject'
PARTIAL_DIR = os.path.join(ROOT, 'knowledge/3_考古題/3_L2_結構化抽取/三下/alignment/_partial')


def build_kl4_index():
    kl4 = {}
    kl4_lessons_by_pub = defaultdict(list)  # {pub: [課名, ...]}
    for pub in ['翰林', '康軒', '南一']:
        d = os.path.join(ROOT, f'knowledge/1_課綱研究/國語/三下/{pub}/')
        for f in sorted(os.listdir(d)):
            if '_單課研究紀錄.md' in f:
                parts = f.replace('.md', '').split('_')
                lesson = parts[3]
                title = '_'.join(parts[4:-1])
                content = open(os.path.join(d, f), 'r', encoding='utf-8').read()
                kecode_m = re.search(r'\*\*課碼\*\*[：:]\s*`?([0-9]+)`?', content)
                kl4[(pub, lesson)] = {
                    'title': title,
                    'kecode': kecode_m.group(1) if kecode_m else '?',
                }
                kl4_lessons_by_pub[pub].append(title)
    return kl4, dict(kl4_lessons_by_pub)


def load_l2(exam_id):
    L2_DIRS = [
        'knowledge/3_考古題/3_L2_結構化抽取/_golden_samples',
        'knowledge/3_考古題/3_L2_結構化抽取/三下/三下_國語_pilot',
        'knowledge/3_考古題/3_L2_結構化抽取/三下/三下_國語_翰林',
        'knowledge/3_考古題/3_L2_結構化抽取/三下/三下_國語_康軒',
        'knowledge/3_考古題/3_L2_結構化抽取/三下/三下_國語_南一',
    ]
    for sub in L2_DIRS:
        p = os.path.join(ROOT, sub, f'{exam_id}.json')
        if os.path.exists(p):
            d = json.load(open(p))
            return {q['question_id']: q for q in d['questions']}
    return {}


def clean_evidence_keywords(evidence):
    """從 evidence 字串抽取核心關鍵字（去頭尾語助詞）"""
    s = evidence
    for prefix in ['題幹中', '題幹引用', '題幹']:
        if s.startswith(prefix):
            s = s[len(prefix):]
            break
    for c in ['「', '」', '《', '》', '"', '"', "'", "'"]:
        s = s.replace(c, '')
    # 去尾「一文」「一課」「中」等
    for suffix in ['一文', '一課', '一段', '課中', '文中', '中', '」']:
        if s.endswith(suffix):
            s = s[:-len(suffix)]
            break
    return s.strip()


def auto_verify_link(link, l2_qs, kl4_idx, kl4_lessons_by_pub):
    """對單條 l2_to_kl_links 做 auto-judge，回傳 (verify_status, verify_note)"""
    qid = link['question_id']
    q = l2_qs.get(qid, {})
    stem = q.get('stem', '')
    vm = link.get('version_match', 'unknown')

    # version_match 異常
    if vm == 'legacy':
        return ('reject_high', 'version_match=legacy 在 current 範圍出現，prompt 黑名單漏抓')
    if vm == 'unknown':
        return ('needs_human_review', 'version_match=unknown，需 Claude 親檢')

    gtype = link.get('general_type')
    kl3_links = link.get('kl3_links', [])
    kl4_links = link.get('kl4_links', [])

    # R3 unlinked_general
    if gtype and not kl3_links:
        # 掃題幹是否含 KL4 課文名（不分 publisher 都看）
        all_titles = set()
        for titles in kl4_lessons_by_pub.values():
            all_titles.update(titles)
        hits = [t for t in all_titles if t in stem]
        if hits:
            return ('needs_human_review', f'R3 但題幹含 KL4 課文 {hits}，可能 missed_should_link')
        return ('pass', '')

    # R4 cross_lesson
    if len(kl3_links) > 1:
        all_have_evidence = all(kl3.get('evidence') for kl3 in kl3_links)
        all_lesson_match = True
        for kl3 in kl3_links:
            pub = kl3.get('publisher')
            L = kl3.get('lesson')
            title = kl3.get('lesson_title')
            kl4_actual = kl4_idx.get((pub, L), {}).get('title', '?')
            if kl4_actual != title:
                all_lesson_match = False
                break
        if all_have_evidence and all_lesson_match:
            return ('pass', '')
        else:
            return ('needs_human_review', f'R4 多 link 有問題（evidence 或 lesson_title 不全對）')

    # R1 / R2 (單 link)
    if len(kl3_links) == 1:
        kl3 = kl3_links[0]
        rule = kl3.get('match_rule', '')
        pub = kl3.get('publisher')
        L = kl3.get('lesson')
        title = kl3.get('lesson_title')
        evidence = kl3.get('evidence', '')

        # Check 1: KL4 對應
        kl4_actual = kl4_idx.get((pub, L), {}).get('title', '?')
        if kl4_actual != title:
            return ('reject_high', f'kl4 對不上：lesson_title=「{title}」 KL4 實際=「{kl4_actual}」')

        # Check 2: evidence 在題幹中
        evidence_clean = clean_evidence_keywords(evidence)
        evidence_in_stem = evidence_clean and evidence_clean in stem
        # 也試題目原 evidence 直接 in stem
        evidence_raw_in_stem = evidence and evidence in stem

        # Check 3: rc01_evidence
        rc01_issue = False
        rc01_note = ''
        for kl4 in kl4_links:
            if kl4.get('rc01_evidence'):
                rc01_quote = kl4.get('rc01_quote', '')
                if rc01_quote and rc01_quote not in stem:
                    rc01_issue = True
                    rc01_note = f'rc01_quote「{rc01_quote}」不在題幹中'
                    break

        if 'R1' in rule:
            if evidence_in_stem or evidence_raw_in_stem:
                if rc01_issue:
                    return ('pass_with_caveat', rc01_note)
                return ('pass', '')
            else:
                return ('needs_human_review',
                        f'R1 evidence「{evidence}」(清洗後「{evidence_clean}」) 找不到對應題幹字串')
        elif 'R2' in rule:
            # R2 預設保守，標 needs_human_review (除非 lesson_title 在 stem 中明顯出現)
            if title and title in stem:
                if rc01_issue:
                    return ('pass_with_caveat', rc01_note)
                return ('pass', '')
            else:
                return ('needs_human_review',
                        f'R2 命中需親檢（lesson_title「{title}」是否真在題幹/reason 中）')
        else:
            return ('needs_human_review', f'未知 match_rule: {rule}')

    # 無 kl3 也無 general_type → 異常
    return ('needs_human_review', '無 kl3_links 也無 general_type，異常')


def process_partial(partial_path, kl4_idx, kl4_lessons_by_pub):
    align = json.load(open(partial_path))
    exam_id = align['_meta']['partial_for']
    l2_qs = load_l2(exam_id)

    if not l2_qs:
        print(f"  ❌ {exam_id}: 找不到 L2 原始 JSON")
        return None

    stats = defaultdict(int)
    for link in align['l2_to_kl_links']:
        # 跳過已 verify 的
        if link.get('verify_status') and link['verify_status'] != 'pending':
            stats[link['verify_status']] += 1
            continue
        status, note = auto_verify_link(link, l2_qs, kl4_idx, kl4_lessons_by_pub)
        link['verify_status'] = status
        if note:
            link['verify_note'] = note
        stats[status] += 1

    # 寫回 partial
    with open(partial_path, 'w', encoding='utf-8') as f:
        json.dump(align, f, ensure_ascii=False, indent=2)

    return dict(stats)


def main():
    args = sys.argv[1:]
    if not args:
        print("用法：")
        print("  python3 C_auto_verify.py <exam_id>          # 單份")
        print("  python3 C_auto_verify.py --all              # 全部 _partial/")
        print("  python3 C_auto_verify.py --stats            # 看當前統計")
        return 1

    kl4_idx, kl4_lessons_by_pub = build_kl4_index()

    if args[0] == '--stats':
        partials = sorted(glob.glob(os.path.join(PARTIAL_DIR, 'alignment_partial_*.json')))
        total = 0
        by_status = defaultdict(int)
        for p in partials:
            d = json.load(open(p))
            for link in d['l2_to_kl_links']:
                total += 1
                by_status[link.get('verify_status', 'pending')] += 1
        print(f"=== Phase 2 普查當前進度 ===")
        print(f"總題數: {total}")
        for s, n in sorted(by_status.items(), key=lambda x: -x[1]):
            print(f"  {s}: {n} ({n/max(total,1)*100:.1f}%)")
        return 0

    if args[0] == '--all':
        partials = sorted(glob.glob(os.path.join(PARTIAL_DIR, 'alignment_partial_*.json')))
        print(f"處理 {len(partials)} 份 partial...")
        global_stats = defaultdict(int)
        for p in partials:
            exam_id = os.path.basename(p).replace('alignment_partial_', '').replace('.json', '')
            stats = process_partial(p, kl4_idx, kl4_lessons_by_pub)
            if stats is None:
                continue
            for k, v in stats.items():
                global_stats[k] += v
            line = f"  ✅ {exam_id}: " + ' '.join(f"{k}={v}" for k, v in sorted(stats.items()))
            print(line)
        print(f"\n=== 全局統計 ===")
        for s, n in sorted(global_stats.items(), key=lambda x: -x[1]):
            print(f"  {s}: {n}")
        return 0

    # 單份
    exam_id = args[0]
    partial = os.path.join(PARTIAL_DIR, f'alignment_partial_{exam_id}.json')
    if not os.path.exists(partial):
        print(f"❌ 找不到 partial: {partial}")
        return 1
    stats = process_partial(partial, kl4_idx, kl4_lessons_by_pub)
    print(f"=== {exam_id} ===")
    for s, n in sorted(stats.items(), key=lambda x: -x[1]):
        print(f"  {s}: {n}")
    return 0


if __name__ == '__main__':
    sys.exit(main())
