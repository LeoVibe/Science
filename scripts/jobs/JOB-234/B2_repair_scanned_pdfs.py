#!/usr/bin/env python3
"""JOB-234 Phase 2：掃描 PDF OCR 修復。
讀 _repair_manifest.json，對 source_type=scanned_pdf 的項目：
  1. PyMuPDF 轉 PNG（dpi=150），自動修正 rotation（270/90/180）
  2. ocrmac（macOS Vision）逐頁 OCR，語言偏好 zh-Hant/zh-Hans/en-US
  3. 更新整合版 MD（保留 frontmatter，替換內容，更新 quality_flags）
並行 PARALLEL=4 條。
"""
import os, json, re, shutil, tempfile, sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone, timedelta
import fitz  # PyMuPDF
from PIL import Image as PILImage
from ocrmac import ocrmac as ocrmac_lib

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
os.chdir(ROOT)

MANIFEST_PATH = "scripts/jobs/JOB-234/_repair_manifest.json"
REPORT_PATH   = "scripts/jobs/JOB-234/_ocr_repair_log.json"
PARALLEL      = 4
DPI           = 150  # Pilot 10 實測：150 DPI 速度與品質最佳平衡

# RESUME 支援：--resume 跳過已成功項目
RESUME = '--resume' in sys.argv


def pdf_to_pngs(pdf_path, tmpdir):
    """PyMuPDF 轉換 PDF 各頁為 PNG，自動修正掃描旋轉，回傳路徑清單。"""
    pngs = []
    doc = fitz.open(pdf_path)
    for i, page in enumerate(doc):
        mat = fitz.Matrix(DPI / 72, DPI / 72)
        pix = page.get_pixmap(matrix=mat)
        png_path = os.path.join(tmpdir, f'page_{i:03d}.png')
        pix.save(png_path)

        # 掃描 PDF 常見 rotation=270，不修正會導致 OCR 輸出亂碼
        rot = page.rotation
        if rot in (90, 180, 270):
            img = PILImage.open(png_path)
            if rot == 270:
                img = img.rotate(90, expand=True)
            elif rot == 90:
                img = img.rotate(-90, expand=True)
            elif rot == 180:
                img = img.rotate(180, expand=True)
            img.save(png_path)

        pngs.append(png_path)
    doc.close()
    return pngs


def update_md_file(md_path, new_content):
    """保留 frontmatter，替換內文，更新 quality_flags 和 char_count（OCR 版）。"""
    with open(md_path, encoding='utf-8') as f:
        original = f.read()

    m = re.match(r'^(---\n.*?\n---\n)(.*)', original, re.S)
    if not m:
        raise ValueError(f"無法解析 frontmatter: {md_path}")

    fm = m.group(1)

    # 更新 quality_flags：移除 extract_failed / paper_empty，加入 ocr_used
    def update_flags(fm_block):
        flags_to_remove = {'extract_failed', 'paper_empty'}
        flags_to_add    = {'ocr_used'}
        lines = fm_block.split('\n')
        new_lines = []
        in_flags = False
        added = False
        for line in lines:
            if 'quality_flags:' in line:
                in_flags = True
                new_lines.append(line)
                continue
            if in_flags:
                if line.strip().startswith('- '):
                    flag = line.strip()[2:].strip()
                    if flag in flags_to_remove:
                        continue
                    if not added:
                        for f in sorted(flags_to_add):
                            new_lines.append(f'  - {f}')
                        added = True
                    new_lines.append(line)
                else:
                    if not added:
                        for f in sorted(flags_to_add):
                            new_lines.append(f'  - {f}')
                        added = True
                    in_flags = False
                    new_lines.append(line)
            else:
                new_lines.append(line)
        return '\n'.join(new_lines)

    fm = update_flags(fm)

    char_count = len(new_content)
    fm = re.sub(r'^char_count:\s*\d+', f'char_count: {char_count}', fm, flags=re.M)
    fm = re.sub(r'(  method:\s*).*', r'\1"JOB-234 ocrmac Vision OCR"', fm)

    now = datetime.now(timezone(timedelta(hours=8))).strftime('%Y-%m-%d')
    fm = re.sub(r'(  integrated_date:\s*).*', rf'\g<1>{now}', fm)

    new_md = fm + '\n' + new_content
    tmp_path = md_path + '.tmp'
    with open(tmp_path, 'w', encoding='utf-8') as f:
        f.write(new_md)
    os.replace(tmp_path, md_path)
    return char_count


def process_one(item):
    exam_id    = item['exam_id']
    md_path    = item['md_path']
    orig_files = item.get('original_files', [])

    if not orig_files:
        return {'exam_id': exam_id, 'status': 'skipped', 'reason': 'no_original_files'}

    tmp_dir = tempfile.mkdtemp(prefix=f'ocr_{exam_id[:30]}_')
    try:
        # 1. PDF → PNG（PyMuPDF + 旋轉修正）
        all_pngs = []
        for pdf_path in orig_files:
            if not os.path.exists(pdf_path):
                print(f'  ⚠ {exam_id}: 原始檔不存在 {pdf_path}')
                continue
            try:
                pngs = pdf_to_pngs(pdf_path, tmp_dir)
                all_pngs.extend(pngs)
            except Exception as e:
                return {'exam_id': exam_id, 'status': 'failed',
                        'reason': f'pdf_to_png_failed: {e}'}

        if not all_pngs:
            return {'exam_id': exam_id, 'status': 'failed', 'reason': 'no_pngs_generated'}

        # 2. ocrmac OCR（macOS Vision，逐頁）
        print(f'  🔍 {exam_id}: ocrmac OCR（{len(all_pngs)} 頁）...')
        parts = []
        for png in all_pngs:
            ann = ocrmac_lib.OCR(
                png,
                language_preference=["zh-Hant", "zh-Hans", "en-US"],
                recognition_level="accurate",
            ).recognize()
            text = '\n'.join(a[0] for a in ann if a[0].strip())
            if text.strip():
                parts.append(text)

        ocr_content = '\n\n---\n\n'.join(parts).strip()

        if len(ocr_content) < 100:
            return {'exam_id': exam_id, 'status': 'failed',
                    'reason': f'ocr_too_short_{len(ocr_content)}_chars'}

        # 3. 更新整合版 MD
        char_count = update_md_file(md_path, ocr_content)
        return {'exam_id': exam_id, 'status': 'success',
                'char_count': char_count, 'png_count': len(all_pngs)}

    except Exception as e:
        return {'exam_id': exam_id, 'status': 'failed', 'reason': str(e)}
    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)


def main():
    with open(MANIFEST_PATH, encoding='utf-8') as f:
        manifest = json.load(f)

    items = [it for it in manifest['items'] if it['source_type'] == 'scanned_pdf']
    print(f'Phase 2：共 {len(items)} 份掃描 PDF（ocrmac Vision OCR）')

    # RESUME：載入已有 log，跳過已成功
    done_ids = set()
    existing_log = []
    if RESUME and os.path.exists(REPORT_PATH):
        with open(REPORT_PATH, encoding='utf-8') as f:
            prev = json.load(f)
        for entry in prev.get('items', []):
            if entry.get('status') == 'success':
                done_ids.add(entry['exam_id'])
                existing_log.append(entry)
        print(f'  RESUME：跳過已完成 {len(done_ids)} 份')

    pending = [it for it in items if it['exam_id'] not in done_ids]
    print(f'  待處理：{len(pending)} 份（PARALLEL={PARALLEL}）')

    log = list(existing_log)
    success = sum(1 for e in existing_log if e['status'] == 'success')
    failed  = 0

    with ThreadPoolExecutor(max_workers=PARALLEL) as executor:
        futures = {executor.submit(process_one, it): it for it in pending}
        for future in as_completed(futures):
            result = future.result()
            log.append(result)
            for it in manifest['items']:
                if it['exam_id'] == result['exam_id']:
                    it['repair_status'] = result['status']
                    break
            if result['status'] == 'success':
                success += 1
                print(f"  ✅ {result['exam_id']}: char_count={result.get('char_count')}")
            else:
                failed += 1
                print(f"  ❌ {result['exam_id']}: {result.get('reason')}")

            if len(log) % 10 == 0:
                _write_checkpoint(manifest, log, success, failed)

    _write_checkpoint(manifest, log, success, failed)
    print(f'\n=== Phase 2 完成：成功 {success} / 失敗 {failed} ===')


def _write_checkpoint(manifest, log, success, failed):
    with open(MANIFEST_PATH, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
    with open(REPORT_PATH, 'w', encoding='utf-8') as f:
        json.dump({'success': success, 'failed': failed, 'items': log},
                  f, ensure_ascii=False, indent=2)


if __name__ == '__main__':
    main()
