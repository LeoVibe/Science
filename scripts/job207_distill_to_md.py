#!/usr/bin/env python3
"""JOB-207 Phase 3: PDF → 淬煉 MD + _index.json

遍歷 knowledge/3_考古題/原始/{grade}/{semester_subject}/*.pdf
對每份 PDF：
  1. pdfplumber 萃取文字
  2. 解析檔名（版本/學年度/學校/考試類型/試卷|答案）
  3. 合併試卷 + 答案（若成對）
  4. 生成 MD（YAML frontmatter + 主題命中分析 + 原文）
  5. 更新 _index.json

用法：
  python3.11 scripts/job207_distill_to_md.py --grade G3 --semester_subject 三下_社會
"""
import os, re, json, argparse
from pathlib import Path
from datetime import datetime
from collections import defaultdict, Counter

BASE = Path('/Users/s389080/Documents/doc/work/0_AI_Project/eidosProject/knowledge/3_考古題')

# 科目主題關鍵字（用於分類與矩陣）
SUBJECT_KEYWORDS = {
    '三下_社會': {
        '社區營造': '社區營造',
        '敦親睦鄰': '社區營造',
        '社區': '社區營造',
        '里民大會': '公民參與場合',
        '里民': '公民參與場合',
        '公聽會': '公民參與場合',
        '社區發展協會': '地方組織',
        '里長': '地方組織',
        '里辦': '地方組織',
        '里幹事': '地方組織',
        '住戶管理委員會': '地方組織對比',
        '志工': '公民服務',
        '巡守隊': '公民服務',
        '環保志工': '公民服務',
        '關懷志工': '公民服務',
        '改善': '問題改善',
        '凝聚共識': '探究流程',
        '探究': '探究流程',
        '發現問題': '探究流程',
        '家鄉': '地方認同',
        '隔代教養': '地方生活問題',
        '醫療資源': '地方生活問題',
        '連署': '公民參與工具',
    },
    '三下_自然': {
        # 植物種植與生長
        '種子': '植物生長',
        '發芽': '植物生長',
        '根': '植物生長',
        '莖': '植物生長',
        '葉': '植物生長',
        '花': '植物生長',
        '果實': '植物生長',
        '澆水': '植物生長',
        '陽光': '植物生長',
        # 水與物質變化
        '蒸發': '水的三態',
        '凝結': '水的三態',
        '融化': '水的三態',
        '水蒸氣': '水的三態',
        '固體': '水的三態',
        '液體': '水的三態',
        '氣體': '水的三態',
        '三態': '水的三態',
        # 動物構造與適應
        '動物': '動物構造',
        '構造': '動物構造',
        '翅膀': '動物構造',
        '蹼': '動物構造',
        '鱗片': '動物構造',
        '適應': '動物構造',
        '保護色': '動物構造',
        # 天氣觀測
        '天氣': '天氣觀測',
        '氣溫': '天氣觀測',
        '溫度計': '天氣觀測',
        '降雨': '天氣觀測',
        '雲量': '天氣觀測',
        '觀測': '天氣觀測',
    },
    '三下_數學': {
        # 除法
        '除法': '除法',
        '餘數': '除法',
        '被除數': '除法',
        '除數': '除法',
        # 分數
        '分數': '分數',
        '分母': '分數',
        '分子': '分數',
        '真分數': '分數',
        # 小數
        '小數': '小數',
        '十分位': '小數',
        '位值': '小數',
        # 圓
        '圓心': '圓',
        '半徑': '圓',
        '直徑': '圓',
        '圓規': '圓',
        # 面積
        '面積': '面積',
        '平方公分': '面積',
        '方格': '面積',
        # 容量/重量
        '公升': '度量衡',
        '毫升': '度量衡',
        '公斤': '度量衡',
        '公克': '度量衡',
        '容量': '度量衡',
        '重量': '度量衡',
        # 時間
        '時制': '時間',
        '經過時間': '時間',
        '分鐘': '時間',
        # 統計
        '統計': '統計表',
        '表格': '統計表',
    },
    '三下_國語': {
        # 字詞辨析
        '形近字': '字詞辨析',
        '生字': '字詞辨析',
        '注音': '字詞辨析',
        '同音字': '字詞辨析',
        '部首': '字詞辨析',
        # 語法句型
        '因果': '語法句型',
        '連接詞': '語法句型',
        '句型': '語法句型',
        '不但': '語法句型',
        '雖然': '語法句型',
        '因為': '語法句型',
        # 閱讀理解
        '主旨': '閱讀理解',
        '段落': '閱讀理解',
        '大意': '閱讀理解',
        '作者': '閱讀理解',
        '推論': '閱讀理解',
        # 修辭
        '比喻': '修辭',
        '擬人': '修辭',
        '排比': '修辭',
        '誇飾': '修辭',
    },
    # 其他 semester_subject 未來補（四下/五下/六下各科）
}

def parse_pdf_filename(fn):
    """從檔名解 (publisher, year, school, exam_type, kind)
    檔名規則：{版本}_{學年度}_{學校}_{考試類型}_{試卷|答案}.pdf
    """
    stem = fn[:-4] if fn.endswith('.pdf') else fn
    parts = stem.split('_')
    # 若不夠 5 欄，盡量抓
    if len(parts) >= 5:
        publisher, year, school, exam, kind = parts[0], parts[1], parts[2], parts[3], parts[4]
    elif len(parts) == 4:
        publisher, year, school, exam = parts
        kind = '試卷'
    else:
        publisher = parts[0] if parts else '未知'
        year = '?'
        school = '未知'
        exam = '未知'
        kind = '試卷'
    # 清理學校名（去 "111下-" 等前綴）
    school = re.sub(r'^\d{3}下-', '', school)
    return publisher, year, school, exam, kind

def extract_pdf_text(fp):
    """pdfplumber 萃取"""
    import pdfplumber
    try:
        with pdfplumber.open(fp) as pdf:
            return '\n'.join((p.extract_text() or '') for p in pdf.pages)
    except Exception as e:
        return f'[萃取失敗: {e}]'

def count_topics(text, keywords):
    """計算主題關鍵字命中"""
    topic_counts = defaultdict(int)
    kw_counts = {}
    for kw, topic in keywords.items():
        c = text.count(kw)
        if c > 0:
            topic_counts[topic] += c
            kw_counts[kw] = c
    return dict(topic_counts), kw_counts

def generate_md(exam_info, text_list):
    """生成 MD 內容
    exam_info: {publisher, year, school, exam_type, pdf_files}
    text_list: [{kind: 試卷|答案, text: ..., filename: ...}]
    """
    pub = exam_info['publisher']
    year = exam_info['year']
    school = exam_info['school']
    exam_type = exam_info['exam_type']
    grade = exam_info['grade']
    sem_subj = exam_info['semester_subject']

    # 主題分析（用試卷為主；若無試卷用答案）
    main_text = next((t['text'] for t in text_list if t['kind'] == '試卷'), '')
    if not main_text and text_list:
        main_text = text_list[0]['text']
    keywords = SUBJECT_KEYWORDS.get(sem_subj, {})
    topic_counts, kw_counts = count_topics(main_text, keywords)

    # YAML frontmatter
    lines = ['---']
    lines.append(f'publisher: {pub}')
    lines.append(f'academic_year: {year}')
    lines.append(f'source_school: {school}')
    lines.append(f'exam_type: {exam_type}')
    lines.append(f'grade: {grade}')
    lines.append(f'semester_subject: {sem_subj}')
    lines.append(f'pdf_files:')
    for t in text_list:
        lines.append(f'  - {t["filename"]}')
    lines.append(f'extracted_date: {datetime.now().strftime("%Y-%m-%d")}')
    lines.append(f'extracted_by: "Claude Code (claude-opus-4-7) via scripts/job207_distill_to_md.py"')
    if topic_counts:
        lines.append(f'topic_hits:')
        for t, c in sorted(topic_counts.items(), key=lambda x: -x[1]):
            lines.append(f'  {t}: {c}')
    lines.append(f'char_count: {sum(len(t["text"]) for t in text_list)}')
    lines.append('---')
    lines.append('')

    # 內文
    lines.append(f'# {grade} {sem_subj.replace("_", " ")} {pub}｜{school} {year} 學年度 {exam_type}')
    lines.append('')

    if topic_counts:
        lines.append('## 主題命中分析')
        lines.append('')
        lines.append('| 主題類別 | 命中次數 | 涉及關鍵字 |')
        lines.append('|:--|:--:|:--|')
        # 反向：每 topic 對應哪些 keyword
        topic_to_kws = defaultdict(list)
        for kw, c in kw_counts.items():
            t = keywords.get(kw, '')
            topic_to_kws[t].append(f'{kw}({c})')
        for t, c in sorted(topic_counts.items(), key=lambda x: -x[1]):
            lines.append(f'| {t} | {c} | {", ".join(topic_to_kws[t])} |')
        lines.append('')
    else:
        lines.append('## 主題命中分析')
        lines.append('')
        lines.append(f'_本科目尚未建立主題關鍵字規則（`{sem_subj}`），請於 `scripts/job207_distill_to_md.py` 中 `SUBJECT_KEYWORDS` 補充。_')
        lines.append('')

    # 原文（分試卷/答案）
    for t in text_list:
        lines.append(f'## {t["kind"]}原文（{t["filename"]}）')
        lines.append('')
        # 限長 8000 字；超出則截斷
        txt = t['text']
        if len(txt) > 8000:
            lines.append(f'> ⚠️ 原文 {len(txt)} 字，僅顯示前 8000。完整見 PDF。')
            lines.append('')
            txt = txt[:8000] + '\n\n...（截斷）'
        lines.append('```')
        lines.append(txt)
        lines.append('```')
        lines.append('')

    # 原文追溯
    lines.append('## 原文追溯')
    lines.append('')
    for t in text_list:
        lines.append(f'- `knowledge/3_考古題/原始/{grade}/{sem_subj}/{t["filename"]}`')

    return '\n'.join(lines), topic_counts

def process_folder(grade, sem_subj):
    """處理一個資料夾"""
    src = BASE / '原始' / grade / sem_subj
    dst = BASE / '淬煉' / grade / sem_subj
    dst.mkdir(parents=True, exist_ok=True)

    if not src.exists():
        print(f'❌ 來源目錄不存在: {src}')
        return

    pdfs = sorted([f for f in os.listdir(src) if f.endswith('.pdf')])
    print(f'🔍 掃描 {src}: {len(pdfs)} 份 PDF')

    # 按 (publisher, year, school, exam_type) 聚合試卷 + 答案
    groups = defaultdict(list)
    for fn in pdfs:
        pub, year, school, exam, kind = parse_pdf_filename(fn)
        key = (pub, year, school, exam)
        text = extract_pdf_text(str(src / fn))
        groups[key].append({'kind': kind, 'text': text, 'filename': fn})

    # 生成 MD
    md_count = 0
    index_entries = []
    global_topic_matrix = defaultdict(lambda: defaultdict(int))  # [topic][year]
    global_schools = defaultdict(set)  # [topic] = {school}

    for (pub, year, school, exam), texts in groups.items():
        exam_info = {
            'publisher': pub, 'year': year, 'school': school,
            'exam_type': exam, 'grade': grade, 'semester_subject': sem_subj
        }
        md_content, topic_counts = generate_md(exam_info, texts)
        md_name = f'{pub}_{year}_{school}_{exam}.md'
        md_path = dst / md_name
        md_path.write_text(md_content, encoding='utf-8')
        md_count += 1

        index_entries.append({
            'filename': md_name,
            'publisher': pub,
            'year': year,
            'school': school,
            'exam_type': exam,
            'has_answer_pdf': any(t['kind'] == '答案' for t in texts),
            'has_exam_pdf': any(t['kind'] == '試卷' for t in texts),
            'topic_hits': topic_counts,
            'pdf_files': [t['filename'] for t in texts],
        })

        # 聚合全域矩陣
        for topic, cnt in topic_counts.items():
            global_topic_matrix[topic][year] += cnt
            global_schools[topic].add(school)

    # 寫 _index.json
    index_data = {
        'path': f'knowledge/3_考古題/淬煉/{grade}/{sem_subj}/',
        'last_updated': datetime.now().isoformat() + 'Z',
        'total_md': md_count,
        'schools': sorted({e['school'] for e in index_entries}),
        'years': sorted({e['year'] for e in index_entries if e['year'] != '?'}),
        'publishers': sorted({e['publisher'] for e in index_entries}),
        'exam_types': sorted({e['exam_type'] for e in index_entries}),
        'topic_matrix': {t: dict(ys) for t, ys in global_topic_matrix.items()},
        'schools_per_topic': {t: sorted(s) for t, s in global_schools.items()},
        'files': sorted(index_entries, key=lambda e: (e['year'], e['school'], e['exam_type'])),
    }
    (dst / '_index.json').write_text(
        json.dumps(index_data, ensure_ascii=False, indent=2), encoding='utf-8'
    )

    print(f'✅ 產出 {md_count} 份 MD + _index.json → {dst}')
    print(f'\n主題命中概覽（全域聚合）:')
    for t, ys in sorted(global_topic_matrix.items(), key=lambda x: -sum(x[1].values())):
        total = sum(ys.values())
        n_schools = len(global_schools[t])
        print(f'  {t}: {total} 次 / {n_schools} 校')

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--grade', required=True, help='例: G3')
    ap.add_argument('--semester_subject', required=True, help='例: 三下_社會')
    args = ap.parse_args()
    process_folder(args.grade, args.semester_subject)

if __name__ == '__main__':
    main()
