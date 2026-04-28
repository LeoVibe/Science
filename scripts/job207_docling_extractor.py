#!/usr/bin/env python3
"""docling 批量 PDF 提取器（必須用 pdf2md/.venv/bin/python 執行）

用法：
  /path/to/pdf2md/.venv/bin/python job207_docling_extractor.py <paths_json> <output_json>

paths_json：一個 JSON 檔，內容為 PDF 路徑陣列 ["a.pdf", "b.pdf", ...]
output_json：輸出 JSON，格式為 {"path": "萃取文字", ...}

設計原則：
  - docling DocumentConverter 只初始化一次，所有 PDF 共用
  - 逐檔處理，個別錯誤不中斷整批
"""
import json, sys, time
from pathlib import Path


def main():
    if len(sys.argv) != 3:
        print("Usage: python job207_docling_extractor.py <paths_json> <output_json>", file=sys.stderr)
        sys.exit(1)

    paths_file  = Path(sys.argv[1])
    output_file = Path(sys.argv[2])

    pdf_paths = json.loads(paths_file.read_text(encoding='utf-8'))
    if not pdf_paths:
        output_file.write_text('{}', encoding='utf-8')
        return

    # ── 一次性初始化 model ──
    from docling.document_converter import DocumentConverter, PdfFormatOption
    from docling.datamodel.base_models import InputFormat
    from docling.datamodel.pipeline_options import PdfPipelineOptions

    opt = PdfPipelineOptions()
    opt.do_ocr = False
    opt.do_table_structure = True

    converter = DocumentConverter(format_options={
        InputFormat.PDF: PdfFormatOption(pipeline_options=opt)
    })
    print(f"[docling] model 初始化完成，準備處理 {len(pdf_paths)} 份 PDF", file=sys.stderr, flush=True)

    results = {}
    for i, path in enumerate(pdf_paths, 1):
        t0 = time.time()
        try:
            result = converter.convert(path)
            text = result.document.export_to_markdown()
            elapsed = round(time.time() - t0, 1)
            n_pages = len(result.pages) if hasattr(result, 'pages') else '?'
            print(f"  [{i}/{len(pdf_paths)}] OK {elapsed}s {n_pages}p {len(text)}chars  {Path(path).name}", file=sys.stderr, flush=True)
        except Exception as e:
            text = f'[DOCLING 失敗: {e}]'
            print(f"  [{i}/{len(pdf_paths)}] ERR {Path(path).name}: {e}", file=sys.stderr, flush=True)
        results[path] = text

    output_file.write_text(json.dumps(results, ensure_ascii=False), encoding='utf-8')
    print(f"[docling] 完成，結果寫入 {output_file}", file=sys.stderr, flush=True)


if __name__ == '__main__':
    main()
