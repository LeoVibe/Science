#!/usr/bin/env python3
"""
JOB-237 Phase A — 全科目 extract_failed MD 修復（95份）

技術：
- .doc → textutil（macOS 內建，無 soffice timeout）
- 掃描 PDF → ocrmac（macOS Vision OCR）
- 修復後 quality_flags：移除 extract_failed/empty_extract/extract_error/paper_empty/answer_empty，加 repaired

輸出：
- 修復後的整合 MD 覆寫原檔
- scripts/jobs/JOB-237/repair_report.json（執行結果）
"""

import os, sys, glob, re, json, tempfile, subprocess, datetime, pathlib

ROOT = pathlib.Path(__file__).parent.parent.parent.parent  # eidosProject root
MD_ROOT = ROOT / "knowledge/3_考古題/2_MD淬鍊文字_整合版"
PDF_ROOT = ROOT / "knowledge/3_考古題/1_原始檔"

REPORT_PATH = pathlib.Path(__file__).parent / "repair_report.json"

REMOVE_FLAGS = {"extract_failed", "empty_extract", "extract_error", "paper_empty", "answer_empty"}
ADD_FLAG = "repaired"


def find_failed_mds():
    """找出 quality_flags 含 extract_failed 但不含 repaired 的 MD 檔。"""
    failed = []
    for md in sorted(glob.glob(str(MD_ROOT / "**/*.md"), recursive=True)):
        if "_integration_report" in md:
            continue
        text = open(md, encoding="utf-8").read()
        m = re.search(r"quality_flags:(.*?)(?:^[a-z_]+:|---)", text, re.DOTALL | re.MULTILINE)
        if m and "extract_failed" in m.group(1) and ADD_FLAG not in m.group(1):
            # 取 source_pdfs — 支援兩種格式：
            # 格式A: "- filename: xxx.pdf"（新版 YAML object）
            # 格式B: "- path/to/xxx.pdf"（舊版直接列路徑）
            pdfs_m = re.search(r"source_pdfs:(.*?)(?:^[a-zA-Z_]+:|^---)", text, re.DOTALL | re.MULTILINE)
            sources = []
            if pdfs_m:
                block = pdfs_m.group(1)
                # 格式A：filename: "xxx.pdf" 或 filename: xxx.pdf
                fnames_a = re.findall(r'filename:\s*["\']?([^"\':\n]+\.(?:pdf|PDF|doc|DOC|docx|DOCX))["\']?', block)
                # 格式B：- xxx.pdf 或 - some/path/xxx.pdf
                fnames_b = re.findall(r"-\s+([^\n]+\.(?:pdf|PDF|doc|DOC|docx|DOCX))", block)
                fnames_b = [f for f in fnames_b if not f.startswith("filename:")]
                # 清理引號
                fnames_a = [f.strip().strip('"\'') for f in fnames_a]
                fnames_b = [f.strip().strip('"\'') for f in fnames_b]
                sources = fnames_a or fnames_b
            failed.append({"md": md, "sources": sources})
    return failed


def find_source_file(fname_str):
    """在 1_原始PDF 目錄下遞迴找原始檔。fname_str 可能是純 filename 或含路徑的字串。"""
    fname = pathlib.Path(fname_str.strip()).name
    # 遞迴搜尋
    for match in glob.glob(str(PDF_ROOT / "**" / fname), recursive=True):
        return pathlib.Path(match)
    # fallback：直接路徑
    direct = ROOT / fname_str.strip()
    if direct.exists():
        return direct
    return None


def extract_doc(doc_path):
    """textutil 轉 .doc → txt"""
    with tempfile.TemporaryDirectory() as td:
        out_txt = os.path.join(td, "out.txt")
        r = subprocess.run(
            ["textutil", "-convert", "txt", "-output", out_txt, str(doc_path)],
            capture_output=True, timeout=30
        )
        txt_path = pathlib.Path(out_txt)
        if txt_path.exists() and txt_path.stat().st_size > 0:
            return txt_path.read_text(encoding="utf-8", errors="replace")
        return ""


def extract_pdf_ocr(pdf_path):
    """ocrmac OCR 掃描 PDF → text"""
    try:
        import fitz
        from ocrmac.ocrmac import text_from_image
    except ImportError as e:
        return f"[ocrmac import error: {e}]"

    doc = fitz.open(str(pdf_path))
    pages_text = []
    for page_num, page in enumerate(doc):
        with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
            tmp_path = tmp.name
        try:
            pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
            pix.save(tmp_path)
            result = text_from_image(tmp_path, language=["zh-Hant", "en-US"])
            if isinstance(result, list):
                page_text = "\n".join(
                    item[0] if isinstance(item, (list, tuple)) else str(item)
                    for item in result
                )
            else:
                page_text = str(result)
            pages_text.append(f"[頁 {page_num+1}]\n{page_text}")
        except Exception as e:
            pages_text.append(f"[頁 {page_num+1} OCR 失敗: {e}]")
        finally:
            try:
                os.unlink(tmp_path)
            except Exception:
                pass
    doc.close()
    return "\n\n".join(pages_text)


def repair_quality_flags(text):
    """更新 quality_flags block：移除壞旗標，加 repaired。"""
    def replace_flags(m):
        block = m.group(1)
        lines = block.split("\n")
        new_lines = []
        seen_repaired = False
        for line in lines:
            stripped = line.strip()
            # 移除壞旗標
            flag_m = re.match(r"^\s*-\s*(.+)$", stripped)
            if flag_m:
                flag = flag_m.group(1).strip().strip('"\'')
                if flag in REMOVE_FLAGS:
                    continue
                if flag == ADD_FLAG:
                    seen_repaired = True
            new_lines.append(line)
        if not seen_repaired:
            # 在第一個 '-' 旗標之前加 repaired，或在 block 末尾加
            inserted = False
            final = []
            for line in new_lines:
                if not inserted and re.match(r"^\s*-\s+", line):
                    final.append(f"  - {ADD_FLAG}")
                    inserted = True
                final.append(line)
            if not inserted:
                final.append(f"  - {ADD_FLAG}")
            new_lines = final
        return "quality_flags:" + "\n".join(new_lines)

    return re.sub(
        r"quality_flags:(.*?)(?=^[a-z_]+:|^---)",
        replace_flags,
        text,
        flags=re.DOTALL | re.MULTILINE
    )


def build_exam_text_section(extracted_text, method, sources):
    """組裝 exam_text 和 answer_text section。"""
    src_display = ", ".join(str(s) for s in sources) if sources else "unknown"
    return (
        f"\n## 試題內容（{method} 修復）\n\n"
        f"> 來源：{src_display}\n\n"
        f"{extracted_text}\n"
    )


def update_integration_metadata(text, method):
    """更新 integration 區塊的 method 和 integrated_date。"""
    today = datetime.date.today().isoformat()
    text = re.sub(
        r'(integration:\s*\n\s*method:\s*)".*?"',
        f'\\1"extract_failed 修復（{method}）"',
        text
    )
    text = re.sub(
        r'(integration:\s*\n(?:.*\n)*?\s*integrated_date:\s*).*',
        f'\\g<1>{today}',
        text
    )
    text = re.sub(
        r'(integration:\s*\n(?:.*\n)*?\s*llm_model:\s*).*',
        '\\g<1>"Claude Code (claude-sonnet-4-6) repair script"',
        text
    )
    return text


def update_char_count(text, content_text):
    """更新 char_count。"""
    count = len(content_text.replace(" ", "").replace("\n", ""))
    return re.sub(r"^char_count:\s*\d+", f"char_count: {count}", text, flags=re.MULTILINE)


def repair_md(entry, dry_run=False):
    """修復單一 MD 檔案。回傳 result dict。"""
    md_path = pathlib.Path(entry["md"])
    sources = entry["sources"]
    orig_text = md_path.read_text(encoding="utf-8")

    # 決定修復方法和目標檔案
    doc_sources = [s for s in sources if s.lower().endswith(".doc")]
    pdf_sources = [s for s in sources if s.lower().endswith(".pdf")]

    extracted_parts = []
    method_parts = []
    missing = []

    # 嘗試 .doc
    for src_rel in doc_sources:
        src_file = find_source_file(src_rel)
        if src_file is None:
            missing.append(src_rel)
            continue
        text = extract_doc(src_file)
        if len(text.strip()) > 50:
            extracted_parts.append(f"[來源：{src_file.name}]\n{text}")
            method_parts.append(f"textutil (.doc)")
        else:
            missing.append(str(src_rel) + " (empty after textutil)")

    # 嘗試 PDF
    for src_rel in pdf_sources:
        src_file = find_source_file(src_rel)
        if src_file is None:
            missing.append(src_rel)
            continue
        text = extract_pdf_ocr(src_file)
        if len(text.strip()) > 50:
            extracted_parts.append(f"[來源：{src_file.name}]\n{text}")
            method_parts.append("ocrmac OCR (macOS Vision)")
        else:
            missing.append(str(src_rel) + " (empty after ocrmac)")

    if not extracted_parts and not missing:
        # 無 source_pdfs → 無法修復
        return {"md": str(md_path), "status": "skipped", "reason": "no source_pdfs"}

    if not extracted_parts:
        return {"md": str(md_path), "status": "failed", "missing": missing}

    method_str = " + ".join(dict.fromkeys(method_parts))
    combined_text = "\n\n---\n\n".join(extracted_parts)

    # 重建 MD
    new_text = orig_text
    new_text = repair_quality_flags(new_text)
    new_text = update_integration_metadata(new_text, method_str)
    new_text = update_char_count(new_text, combined_text)

    # 替換或附加 exam 內容區塊
    exam_section = build_exam_text_section(combined_text, method_str, sources)

    # 移除舊的 ## 試題內容 / ## 答案 區塊（如有）
    new_text = re.sub(r"\n## 試題內容.*$", "", new_text, flags=re.DOTALL)
    new_text = re.sub(r"\n## 答案.*$", "", new_text, flags=re.DOTALL)
    new_text = new_text.rstrip() + "\n" + exam_section

    if not dry_run:
        md_path.write_text(new_text, encoding="utf-8")

    char_count = len(combined_text.replace(" ", "").replace("\n", ""))
    return {
        "md": str(md_path),
        "status": "ok",
        "method": method_str,
        "char_count": char_count,
        "missing": missing,
    }


def main():
    dry_run = "--dry-run" in sys.argv
    limit = None
    for arg in sys.argv[1:]:
        if arg.startswith("--limit="):
            limit = int(arg.split("=")[1])

    print("JOB-237 Phase A — 掃描 extract_failed MD...")
    entries = find_failed_mds()
    print(f"找到 {len(entries)} 份需修復")

    if limit:
        entries = entries[:limit]
        print(f"(--limit={limit}，只處理前 {limit} 份)")

    if dry_run:
        print("=== DRY RUN 模式，不寫入檔案 ===")

    results = []
    ok = fail = skip = 0
    for i, entry in enumerate(entries):
        md_rel = os.path.relpath(entry["md"], ROOT)
        print(f"[{i+1}/{len(entries)}] {md_rel} ... ", end="", flush=True)
        try:
            r = repair_md(entry, dry_run=dry_run)
            results.append(r)
            if r["status"] == "ok":
                ok += 1
                print(f"OK ({r['method']}, {r['char_count']} chars)")
            elif r["status"] == "failed":
                fail += 1
                print(f"FAIL missing={r.get('missing', [])}")
            else:
                skip += 1
                print(f"SKIP {r.get('reason','')}")
        except Exception as e:
            fail += 1
            results.append({"md": entry["md"], "status": "error", "error": str(e)})
            print(f"ERROR {e}")

    report = {
        "generated_at": datetime.datetime.now().isoformat(),
        "dry_run": dry_run,
        "total": len(entries),
        "ok": ok,
        "failed": fail,
        "skipped": skip,
        "results": results,
    }
    REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(f"\n=== 完成 OK={ok} FAIL={fail} SKIP={skip} ===")
    print(f"報告：{REPORT_PATH}")
    return 0 if fail == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
