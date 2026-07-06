#!/usr/bin/env python3
"""JOB-234 Pilot 10 比較腳本
對同一批 10 份掃描 PDF，同時跑：
  方法 A：PyMuPDF → PNG → ocrmac（macOS Vision，本地免費）
  方法 B：PyMuPDF → PNG → Codex Vision（codex exec --full-auto）
輸出：
  scripts/jobs/JOB-234/_pilot10_results/A_{exam_id}.md
  scripts/jobs/JOB-234/_pilot10_results/B_{exam_id}.md
  scripts/jobs/JOB-234/_pilot10_compare_report.json
"""
import os, json, re, time, shutil, tempfile, subprocess
from concurrent.futures import ThreadPoolExecutor, as_completed
import fitz  # PyMuPDF
from ocrmac import ocrmac as ocrmac_lib

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
os.chdir(ROOT)

SAMPLES_PATH = "scripts/jobs/JOB-234/_pilot10_samples.json"
OUT_DIR      = "scripts/jobs/JOB-234/_pilot10_results"
PROMPT_TPL   = "scripts/jobs/JOB-234/ocr_prompt_template.md"
REPORT_PATH  = "scripts/jobs/JOB-234/_pilot10_compare_report.json"
DPI          = 150  # SKILL.md 實測：150 DPI 夠用且速度快

os.makedirs(OUT_DIR, exist_ok=True)


def pdf_to_pngs(pdf_paths, tmpdir, prefix="page"):
    """用 PyMuPDF 把一組 PDF 的每頁轉成 PNG，回傳 sorted PNG 路徑清單。"""
    pngs = []
    page_idx = 0
    for pdf_path in pdf_paths:
        if not os.path.exists(pdf_path):
            continue
        doc = fitz.open(pdf_path)
        for i, page in enumerate(doc):
            mat = fitz.Matrix(DPI / 72, DPI / 72)
            pix = page.get_pixmap(matrix=mat)
            png_path = os.path.join(tmpdir, f"{prefix}_{page_idx:03d}.png")
            pix.save(png_path)
            pngs.append(png_path)
            page_idx += 1
        doc.close()
    return pngs


def cjk_ratio(text):
    """計算 CJK 字元佔全文比例（衡量中文辨識率）。"""
    if not text:
        return 0.0
    cjk = sum(1 for c in text if '一' <= c <= '鿿' or '㐀' <= c <= '䶿')
    return round(cjk / len(text), 3)


# ── 方法 A：ocrmac ────────────────────────────────────────────
def run_method_a(exam_id, orig_files):
    t0 = time.time()
    tmpdir = tempfile.mkdtemp(prefix=f'ocrmac_{exam_id[:20]}_')
    try:
        pngs = pdf_to_pngs(orig_files, tmpdir)
        if not pngs:
            return None, 0, "no_pngs"

        parts = []
        for png in pngs:
            ann = ocrmac_lib.OCR(
                png,
                language_preference=["zh-Hant", "zh-Hans", "en-US"],
                recognition_level="accurate",
            ).recognize()
            text = '\n'.join(a[0] for a in ann if a[0].strip())
            if text.strip():
                parts.append(text)

        content = '\n\n---\n\n'.join(parts)
        elapsed = round(time.time() - t0, 1)
        return content, elapsed, None
    except Exception as e:
        return None, round(time.time() - t0, 1), str(e)
    finally:
        shutil.rmtree(tmpdir, ignore_errors=True)


# ── 方法 B：Codex Vision ──────────────────────────────────────
def run_method_b(exam_id, orig_files):
    t0 = time.time()
    tmpdir = tempfile.mkdtemp(prefix=f'codex_{exam_id[:20]}_')
    try:
        pngs = pdf_to_pngs(orig_files, tmpdir)
        if not pngs:
            return None, 0, "no_pngs"

        ocr_out = os.path.join(tmpdir, "ocr_output.md")
        with open(PROMPT_TPL, encoding='utf-8') as f:
            tpl = f.read()
        image_list = '\n'.join(f'- {p}' for p in pngs)
        prompt = (tpl
                  .replace('{EXAM_ID}', exam_id)
                  .replace('{OUTPUT_PATH}', ocr_out)
                  .replace('{IMAGE_LIST}', image_list))

        r = subprocess.run(
            ['codex', 'exec', '--skip-git-repo-check', '--full-auto', prompt],
            capture_output=True, text=True, timeout=600
        )
        elapsed = round(time.time() - t0, 1)
        if r.returncode != 0:
            return None, elapsed, f"codex_exit={r.returncode}"

        if not os.path.exists(ocr_out):
            return None, elapsed, "output_not_written"

        with open(ocr_out, encoding='utf-8') as f:
            content = f.read().strip()
        return content, elapsed, None
    except subprocess.TimeoutExpired:
        return None, round(time.time() - t0, 1), "timeout_600s"
    except Exception as e:
        return None, round(time.time() - t0, 1), str(e)
    finally:
        shutil.rmtree(tmpdir, ignore_errors=True)


# ── 主程式 ───────────────────────────────────────────────────
def process_one(item):
    exam_id    = item['exam_id']
    orig_files = item.get('original_files', [])
    print(f'\n[{exam_id}] 開始...')

    # 兩個方法並行
    with ThreadPoolExecutor(max_workers=2) as ex:
        fa = ex.submit(run_method_a, exam_id, orig_files)
        fb = ex.submit(run_method_b, exam_id, orig_files)
        content_a, elapsed_a, err_a = fa.result()
        content_b, elapsed_b, err_b = fb.result()

    # 存輸出
    def save(method, content):
        path = os.path.join(OUT_DIR, f"{method}_{exam_id}.md")
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content or '')
        return path

    path_a = save('A', content_a) if content_a else None
    path_b = save('B', content_b) if content_b else None

    # 指標計算
    def metrics(content):
        if not content:
            return {'chars': 0, 'cjk_ratio': 0, 'lines': 0}
        return {
            'chars': len(content),
            'cjk_ratio': cjk_ratio(content),
            'lines': content.count('\n'),
        }

    row = {
        'exam_id': exam_id,
        'combo': item.get('combo', ''),
        'A_ocrmac': {**metrics(content_a), 'elapsed_s': elapsed_a,
                     'error': err_a, 'preview': (content_a or '')[:150]},
        'B_codex':  {**metrics(content_b), 'elapsed_s': elapsed_b,
                     'error': err_b, 'preview': (content_b or '')[:150]},
    }
    print(f'  [{exam_id}] A={row["A_ocrmac"]["chars"]}c/{elapsed_a}s  '
          f'B={row["B_codex"]["chars"]}c/{elapsed_b}s')
    return row


def main():
    with open(SAMPLES_PATH, encoding='utf-8') as f:
        samples = json.load(f)
    print(f'Pilot 10 比較：{len(samples)} 份，A=ocrmac / B=Codex Vision')

    results = []
    for item in samples:
        row = process_one(item)
        results.append(row)
        # 即時存一份（防中斷）
        with open(REPORT_PATH, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)

    # 彙總
    print('\n\n=== Pilot 10 比較彙總 ===')
    print(f'{"exam_id":<35} {"A chars":>8} {"A CJK":>7} {"A s":>5}  {"B chars":>8} {"B CJK":>7} {"B s":>6}')
    print('-' * 90)
    for r in results:
        a, b = r['A_ocrmac'], r['B_codex']
        print(f'{r["exam_id"]:<35} {a["chars"]:>8} {a["cjk_ratio"]:>7.2%} {a["elapsed_s"]:>5}  '
              f'{b["chars"]:>8} {b["cjk_ratio"]:>7.2%} {b["elapsed_s"]:>6}')

    # 平均
    a_chars = [r['A_ocrmac']['chars'] for r in results if r['A_ocrmac']['chars'] > 0]
    b_chars = [r['B_codex']['chars']  for r in results if r['B_codex']['chars'] > 0]
    a_cjk   = [r['A_ocrmac']['cjk_ratio'] for r in results if r['A_ocrmac']['chars'] > 0]
    b_cjk   = [r['B_codex']['cjk_ratio']  for r in results if r['B_codex']['chars'] > 0]
    a_time  = [r['A_ocrmac']['elapsed_s'] for r in results]
    b_time  = [r['B_codex']['elapsed_s']  for r in results]

    def avg(lst): return round(sum(lst)/len(lst), 2) if lst else 0

    print('-' * 90)
    print(f'{"平均":<35} {avg(a_chars):>8} {avg(a_cjk):>7.2%} {avg(a_time):>5}  '
          f'{avg(b_chars):>8} {avg(b_cjk):>7.2%} {avg(b_time):>6}')
    print(f'\n報告：{REPORT_PATH}')
    print(f'輸出目錄：{OUT_DIR}/')


if __name__ == '__main__':
    main()
