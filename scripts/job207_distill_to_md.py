#!/usr/bin/env python3.11
"""考古題 PDF/DOC → 淬鍊 MD + _index.json

目錄對應（2026-04-28 JOB-213 重構）：
  來源：knowledge/3_考古題/1_原始檔/{semester}/{semester_subject}_{publisher}/
  輸出：knowledge/3_考古題/2_MD淬鍊文字/{semester}/{semester_subject}_{publisher}/

支援三種來源檔名格式：
  A 米蘭老師格式：縣立XX國小 三年級 108 下學期 社會領域 社會 第N次段考 期中考 翰林 試卷.pdf
  B 自校壓縮格式：112下-勝利國小-社三末卷.pdf（多樣）
  C 已正規化格式：南一_108_永光國小_第三次段考_試卷.pdf

用法（必須用 python3.11，系統 python3 為 3.9 無 markitdown）：
  # 單一出版社
  python3.11 scripts/job207_distill_to_md.py --semester 三下 --subject 社會 --publisher 翰林
  # 所有出版社（掃描所有 {sem_subj}_* 子目錄）
  python3.11 scripts/job207_distill_to_md.py --semester 三下 --subject 社會
"""
import os, re, json, argparse, hashlib, subprocess, tempfile, glob as _glob
from pathlib import Path
from datetime import datetime
from collections import defaultdict, Counter

DOCLING_PYTHON = Path('/Users/s389080/Documents/doc/work/0_AI_Project/githubFav/pdf2md/.venv/bin/python')
DOCLING_RUNNER = Path('/Users/s389080/Documents/doc/work/0_AI_Project/githubFav/pdf2md/docling_runner.py')

# 全域引擎設定（由 --engine 參數決定，預設 pdfplumber）
PDF_ENGINE = 'pdfplumber'


def compute_sha256(filepath):
    h = hashlib.sha256()
    with open(filepath, 'rb') as f:
        for chunk in iter(lambda: f.read(65536), b''):
            h.update(chunk)
    return h.hexdigest()

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

def parse_pdf_filename(fn, dir_publisher='未知'):
    """從檔名解 (publisher, year, school, exam_type, kind)

    支援三種格式：
    A 米蘭老師：縣立XX國小 三年級 108 下學期 社會領域 社會 第N次段考 期中考 翰林 試卷.pdf
    B 自校壓縮：112下-勝利國小-社三末卷.pdf
    C 已正規化：南一_108_永光國小_第三次段考_試卷.pdf

    dir_publisher: 從來源目錄名稱推斷的出版社（A/B 格式 fallback）
    """
    # 去副檔名
    stem = fn
    for ext in ('.pdf', '.doc', '.docx'):
        if stem.lower().endswith(ext):
            stem = stem[:-len(ext)]
            break

    # --- 格式 A：米蘭老師格式（含漢字空格） ---
    m = re.search(
        r'(?:(?:縣立|市立|鄉立|私立)?)([一-鿿]+(?:國小|附小))\s+'
        r'三年級\s+(\d{3})\s+下學期\s+'
        r'.+?\s+(翰林|南一|康軒)\s+(試卷|答案)$',
        stem
    )
    if m:
        school, year, publisher, kind = m.group(1), m.group(2), m.group(3), m.group(4)
        em = re.search(r'(第[一二三]次段考|期中考|期末考)', stem)
        exam_type = em.group(1) if em else '未知'
        return publisher, year, school, exam_type, kind

    # --- 格式 C：已正規化（底線分隔，≥5 段） ---
    parts = stem.split('_')
    if len(parts) >= 5 and parts[0] in ('翰林', '南一', '康軒'):
        publisher, year, school, exam = parts[0], parts[1], parts[2], parts[3]
        kind = parts[4] if parts[4] in ('試卷', '答案') else '試卷'
        school = re.sub(r'^\d{3}下-', '', school)
        return publisher, year, school, exam, kind
    if len(parts) == 4 and parts[0] in ('翰林', '南一', '康軒'):
        publisher, year, school, exam = parts
        school = re.sub(r'^\d{3}下-', '', school)
        return publisher, year, school, exam, '試卷'

    # --- 格式 B：自校壓縮格式（多樣，fallback 解析） ---
    # 判斷試卷/答案
    if any(kw in stem for kw in ('解答', '答案', '答案卷')):
        kind = '答案'
    else:
        kind = '試卷'
    # 年度：找開頭 3 位數字
    year_m = re.match(r'(\d{3})', stem)
    year = year_m.group(1) if year_m else '?'
    # 學校：從 dash 分隔抓第二段
    parts_dash = stem.split('-')
    school = '未知'
    if len(parts_dash) >= 2:
        school_raw = parts_dash[1]
        school_raw = re.sub(r'\d{3}下?', '', school_raw)
        school_raw = re.sub(r'新北|臺北|台北|臺南|台南|臺中|台中|新竹|桃園', '', school_raw)
        school = school_raw.strip() or '未知'
    # 考試類型
    if re.search(r'(期中|中卷|\-1\b)', stem):
        exam_type = '期中考'
    elif re.search(r'(期末|末卷|\-2\b)', stem):
        exam_type = '期末考'
    else:
        em2 = re.search(r'(第[一二三]次段考)', stem)
        exam_type = em2.group(1) if em2 else '未知'
    # 出版社從目錄名推斷
    publisher = dir_publisher if dir_publisher != '未知' else '未知'
    return publisher, year, school, exam_type, kind

DOCLING_EXTRACTOR = Path(__file__).parent / 'job207_docling_extractor.py'


def _batch_extract_pdfs_docling(src_dir: Path, pdf_filenames: list) -> dict:
    """一次 subprocess 載入 docling model，批量轉換整個出版社目錄的 PDF。
    回傳 {filename: text}。"""
    paths = [str(src_dir / fn) for fn in pdf_filenames]
    with tempfile.TemporaryDirectory() as tmp:
        paths_file  = Path(tmp) / 'paths.json'
        output_file = Path(tmp) / 'results.json'
        paths_file.write_text(json.dumps(paths), encoding='utf-8')
        ret = subprocess.run(
            [str(DOCLING_PYTHON), str(DOCLING_EXTRACTOR),
             str(paths_file), str(output_file)],
            timeout=1800,   # 30 分鐘上限
            stderr=subprocess.PIPE)
        # 把 stderr（進度訊息）印出來
        if ret.stderr:
            for line in ret.stderr.decode('utf-8', errors='replace').splitlines():
                print(f'  {line}')
        if ret.returncode != 0 or not output_file.exists():
            print(f'⚠️  docling batch 失敗（returncode={ret.returncode}），fallback pdfplumber')
            return {}
        raw = json.loads(output_file.read_text(encoding='utf-8'))
        # key 是完整路徑 → 轉為 filename
        return {Path(k).name: v for k, v in raw.items()}


def _extract_doc_via_soffice(fp: str) -> str | None:
    """soffice .doc → .docx → python-docx，用於 markitdown 不支援的舊版 .doc"""
    from docx import Document
    with tempfile.TemporaryDirectory() as tmp:
        ret = subprocess.run(
            ['soffice', '--headless', '--convert-to', 'docx', '--outdir', tmp, fp],
            capture_output=True, timeout=120)   # 120s：較寬鬆
        if ret.returncode != 0:
            return None
        docx_files = _glob.glob(f'{tmp}/*.docx')
        if not docx_files:
            return None
        doc = Document(docx_files[0])
        return '\n'.join(p.text for p in doc.paragraphs if p.text.strip())


def extract_file_text(fp: str, docling_cache: dict | None = None) -> str:
    """萃取 PDF 或 DOC/DOCX 文字。
    docling_cache: {filename: text}，由上層批量提取後傳入（避免重複 subprocess）。
    """
    fp = str(fp)
    fn = Path(fp).name
    lower = fp.lower()

    if lower.endswith('.pdf'):
        # 優先用批量 docling cache
        if docling_cache is not None and fn in docling_cache:
            return docling_cache[fn]
        # fallback pdfplumber
        import pdfplumber
        try:
            with pdfplumber.open(fp) as pdf:
                return '\n'.join((p.extract_text() or '') for p in pdf.pages)
        except Exception as e:
            return f'[PDF 萃取失敗: {e}]'

    elif lower.endswith(('.doc', '.docx')):
        # 先嘗試 markitdown；舊版 .doc (OLE2) 失敗時 fallback soffice+python-docx
        try:
            from markitdown import MarkItDown
            md_conv = MarkItDown()
            result = md_conv.convert(fp)
            text = result.text_content or ''
            if text.strip():
                return text
        except Exception:
            pass
        text = _extract_doc_via_soffice(fp)
        if text is not None:
            return text
        return '[DOC 萃取失敗: markitdown 與 soffice 均無法讀取]'

    else:
        return f'[不支援的格式: {fp}]'

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
    semester = exam_info['semester']
    subject = exam_info['subject']
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
    lines.append(f'semester: {semester}')
    lines.append(f'subject: {subject}')
    lines.append(f'semester_subject: {sem_subj}')
    lines.append(f'pdf_files:')
    for t in text_list:
        lines.append(f'  - filename: {t["filename"]}')
        lines.append(f'    sha256: {t.get("sha256", "")}')
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
    lines.append(f'# {semester} {subject} {pub}｜{school} {year} 學年度 {exam_type}')
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

    # 原文追溯（路徑帶出版社子目錄）
    lines.append('## 原文追溯')
    lines.append('')
    pub = exam_info['publisher']
    semester = exam_info['semester']
    for t in text_list:
        lines.append(f'- `knowledge/3_考古題/1_原始檔/{semester}/{sem_subj}_{pub}/{t["filename"]}`')

    return '\n'.join(lines), topic_counts

SUPPORTED_EXTS = ('.pdf', '.doc', '.docx')


def _process_one_publisher(semester, sem_subj, subject, src, dir_pub):
    """處理單一出版社：src → 2_MD淬鍊文字/{semester}/{sem_subj}_{dir_pub}/

    兩階段提取設計：
      Phase 1：DOC/DOCX 逐檔 soffice 提取（完全獨立，無競爭）
      Phase 2：PDF 批量提取（docling 引擎只啟動一次；pdfplumber 逐檔快速）
    每個 group 完成後立即寫出 MD（不等全部完成）。
    """
    dst = BASE / '2_MD淬鍊文字' / semester / f'{sem_subj}_{dir_pub}'
    dst.mkdir(parents=True, exist_ok=True)

    all_files = sorted([f for f in os.listdir(src)
                        if any(f.lower().endswith(ext) for ext in SUPPORTED_EXTS)])
    pdf_files = [f for f in all_files if f.lower().endswith('.pdf')]
    doc_files = [f for f in all_files if f.lower().endswith(('.doc', '.docx'))]

    print(f'🔍 掃描 {src}: {len(all_files)} 份（PDF:{len(pdf_files)} DOC:{len(doc_files)}）')

    # ── Phase 1：DOC 提取（soffice，無競爭）──
    doc_texts: dict[str, str] = {}
    if doc_files:
        print(f'  [Phase 1] 提取 {len(doc_files)} 份 DOC...')
        for fn in doc_files:
            doc_texts[fn] = extract_file_text(str(src / fn))

    # ── Phase 2：PDF 提取 ──
    docling_cache: dict[str, str] = {}
    if pdf_files and PDF_ENGINE == 'docling':
        print(f'  [Phase 2] docling 批量提取 {len(pdf_files)} 份 PDF（model 載入一次）...')
        docling_cache = _batch_extract_pdfs_docling(src, pdf_files)
        # 若批量失敗，docling_cache 為空 → extract_file_text 會 fallback pdfplumber

    # ── 組群：按 (publisher, year, school, exam_type) 聚合試卷＋答案 ──
    groups: dict[tuple, list] = defaultdict(list)
    for fn in all_files:
        pub, year, school, exam, kind = parse_pdf_filename(fn, dir_publisher=dir_pub)
        key = (pub, year, school, exam)
        sha256 = compute_sha256(src / fn)
        if fn in doc_texts:
            text = doc_texts[fn]
        else:
            text = extract_file_text(str(src / fn), docling_cache=docling_cache)
        groups[key].append({'kind': kind, 'text': text, 'filename': fn, 'sha256': sha256})

    # ── 逐 group 生成 MD 並立即寫出 ──
    md_count = 0
    total_groups = len(groups)
    index_entries = []
    topic_matrix: dict[str, dict[str, int]] = defaultdict(lambda: defaultdict(int))
    schools_map: dict[str, set] = defaultdict(set)

    for (pub, year, school, exam), texts in groups.items():
        exam_info = {
            'publisher': pub, 'year': year, 'school': school,
            'exam_type': exam, 'semester': semester, 'subject': subject,
            'semester_subject': sem_subj,
        }
        md_content, topic_counts = generate_md(exam_info, texts)
        md_name = f'{pub}_{year}_{school}_{exam}.md'
        (dst / md_name).write_text(md_content, encoding='utf-8')
        md_count += 1
        print(f'  [{md_count}/{total_groups}] ✓ {md_name}')

        index_entries.append({
            'filename': md_name,
            'publisher': pub,
            'year': year,
            'school': school,
            'exam_type': exam,
            'has_answer_pdf': any(t['kind'] == '答案' for t in texts),
            'has_exam_pdf': any(t['kind'] == '試卷' for t in texts),
            'topic_hits': topic_counts,
            'pdf_files': [{'filename': t['filename'], 'sha256': t.get('sha256', '')} for t in texts],
        })
        for topic, cnt in topic_counts.items():
            topic_matrix[topic][year] += cnt
            schools_map[topic].add(school)

    # ── 寫 _index.json ──
    sorted_entries = sorted(index_entries,
                            key=lambda e: (e.get('year', '?'), e.get('school', ''), e.get('exam_type', '')))
    index_data = {
        'path': f'knowledge/3_考古題/2_MD淬鍊文字/{semester}/{sem_subj}_{dir_pub}/',
        'last_updated': datetime.now().isoformat() + 'Z',
        'total_md': len(sorted_entries),
        'schools': sorted({e.get('school', '') for e in sorted_entries}),
        'years': sorted({e.get('year', '') for e in sorted_entries if e.get('year', '?') != '?'}),
        'publishers': [dir_pub],
        'exam_types': sorted({e.get('exam_type', '') for e in sorted_entries}),
        'topic_matrix': {t: dict(ys) for t, ys in topic_matrix.items()},
        'schools_per_topic': {t: sorted(s) for t, s in schools_map.items()},
        'files': sorted_entries,
    }
    (dst / '_index.json').write_text(
        json.dumps(index_data, ensure_ascii=False, indent=2), encoding='utf-8')

    print(f'✅ 產出 {md_count} 份 MD + _index.json → {dst}')
    for t, ys in sorted(topic_matrix.items(), key=lambda x: -sum(x[1].values())):
        print(f'  {t}: {sum(ys.values())} 次 / {len(schools_map[t])} 校')


def process_folder(semester, subject, publisher=None):
    """掃描 1_原始檔/{semester}/{sem_subj}_{publisher}/ 目錄，輸出至 2_MD淬鍊文字/{semester}/{sem_subj}_{publisher}/

    publisher: None → 掃描所有匹配的 {sem_subj}_* 子目錄，每個出版社各自輸出
               指定字串（如 '翰林'）→ 只處理該出版社
    """
    sem_subj = f'{semester}_{subject}'
    src_base = BASE / '1_原始檔' / semester

    if publisher:
        src_dirs = [(src_base / f'{sem_subj}_{publisher}', publisher)]
    else:
        src_dirs = []
        if src_base.exists():
            for d in sorted(src_base.iterdir()):
                if d.is_dir() and d.name.startswith(f'{sem_subj}_'):
                    pub = d.name[len(sem_subj) + 1:]
                    src_dirs.append((d, pub))

    if not src_dirs:
        print(f'❌ 找不到來源目錄：{src_base}/{sem_subj}_*')
        return

    for src, dir_pub in src_dirs:
        if not src.exists():
            print(f'⚠️  目錄不存在，跳過: {src}')
            continue
        _process_one_publisher(semester, sem_subj, subject, src, dir_pub)

def main():
    global PDF_ENGINE
    ap = argparse.ArgumentParser()
    ap.add_argument('--semester', required=True, help='例: 三下')
    ap.add_argument('--subject', required=True, help='例: 社會')
    ap.add_argument('--publisher', default=None, help='例: 翰林（省略則處理所有出版社）')
    ap.add_argument('--engine', default='pdfplumber', choices=['pdfplumber', 'docling'],
                    help='PDF 萃取引擎（預設 pdfplumber）')
    args = ap.parse_args()
    PDF_ENGINE = args.engine
    if PDF_ENGINE == 'docling':
        print(f'⚙️  PDF 引擎: docling（每頁 ~5s，耐心等待）')
    process_folder(args.semester, args.subject, args.publisher)

if __name__ == '__main__':
    main()
