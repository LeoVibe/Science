#!/usr/bin/env python3
"""JOB-222 Phase D：PDF → MD 轉檔（核心五科）

範圍（依使用者指示「只五科」+ PM 建議含總綱）：
  - 五科：領綱主檔 + 課程手冊主檔（10 筆）
  - 總綱：(111學年度實施)十二年國教課程綱要總綱（1 筆）

排除：
  - 發布令（行政公文，內容短，與主檔對照即可）
  - 公播版簡報 PDF / PPTX（與主檔內容重複）

執行：
  /path/to/pdf2md/.venv/bin/python phase_d_distill.py [--dry-run] [--only-list]

輸出：
  2_課綱淬鍊文字/{科目or總綱}/{原檔名 stem}.md
  _manifest/distill_log.json（轉檔結果與字元數）
"""
from __future__ import annotations

import json
import sys
import time
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent.parent
RAW_BASE = ROOT / "knowledge" / "1_課綱研究" / "108課綱研究成果" / "1_課綱原始檔案"
MD_BASE = ROOT / "knowledge" / "1_課綱研究" / "108課綱研究成果" / "2_課綱淬鍊文字"
MANIFEST_DIR = ROOT / "knowledge" / "1_課綱研究" / "108課綱研究成果" / "_manifest"
MANIFEST_FILE = MANIFEST_DIR / "課綱檔案清單.json"

# 必轉清單（按 filename 比對，排除掉 anchor "PDF" 那種重複稱呼）
TARGETS = [
    # 總綱（最新版）
    ("總綱", "(111學年度實施)十二年國教課程綱要總綱.pdf"),
    # 國語文
    ("國語文", "十二年國民基本教育課程綱要國民中小學暨普通型高級中等學校(語文領域─國語文).pdf"),
    ("國語文", "語文領域-國語文課程手冊(定稿版).pdf"),
    # 英語文
    ("英語文", "(發布版)國民中小學暨普通型高級中等學校-語文領域-英語文課程綱要.pdf"),
    ("英語文", "語文領域-英語文課程手冊（定稿版）.pdf"),
    # 數學
    ("數學", "十二年國民基本教育課程綱要國民中小學暨普通型高級中等學校-數學領域.pdf"),
    ("數學", "數學領域課程手冊（114年1月更新版）.pdf"),
    # 自然科學
    ("自然科學", "十二年國民基本教育課程綱要國民中小學暨普通型高級中等校-自然科學領域.pdf"),
    ("自然科學", "自然科學領域課程手冊(定稿版).pdf"),
    # 社會
    ("社會", "十二年國民基本教育課程綱要國民中小學暨普通型高級中等校-社會領域.pdf"),
    ("社會", "社會領域課程手冊（定稿版）.pdf"),
]


def resolve_targets():
    manifest = json.loads(MANIFEST_FILE.read_text(encoding="utf-8"))
    files = manifest["files"]
    by_filename = {}
    for f in files:
        by_filename.setdefault(f["filename"], []).append(f)

    plan = []
    missing = []
    for subdir, fname in TARGETS:
        cands = by_filename.get(fname, [])
        # 同檔名可能在補充文件下重複，取 target_subdir 對得上的
        match = None
        for c in cands:
            if c["target_subdir"] == subdir:
                match = c
                break
        if not match:
            missing.append((subdir, fname))
            continue
        local_pdf = ROOT / match["local_path"]
        out_md = MD_BASE / subdir / (Path(fname).stem + ".md")
        plan.append({
            "subdir": subdir,
            "filename": fname,
            "input_path": str(local_pdf),
            "output_path": str(out_md),
            "size_bytes": match["size_bytes"],
        })
    return plan, missing


def convert_with_docling(plan: list[dict]) -> list[dict]:
    from docling.document_converter import DocumentConverter
    converter = DocumentConverter()
    results = []
    started = datetime.now().isoformat(timespec="seconds")
    for i, item in enumerate(plan, 1):
        out = Path(item["output_path"])
        out.parent.mkdir(parents=True, exist_ok=True)
        if out.exists() and out.stat().st_size > 0:
            txt = out.read_text(encoding="utf-8")
            results.append({**item, "ok": True, "char_count": len(txt),
                            "skipped_existing": True, "elapsed_s": 0})
            print(f"  [{i:2d}/{len(plan)}] (skip) {item['subdir']}/{Path(item['filename']).name}  chars={len(txt)}")
            continue
        t0 = time.time()
        try:
            result = converter.convert(item["input_path"])
            md = result.document.export_to_markdown()
            out.write_text(md, encoding="utf-8")
            elapsed = time.time() - t0
            entry = {**item, "ok": True, "char_count": len(md),
                     "skipped_existing": False, "elapsed_s": round(elapsed, 1)}
            print(f"  [{i:2d}/{len(plan)}] ✓ {item['subdir']}/{Path(item['filename']).name}  chars={len(md)} t={elapsed:.0f}s")
        except Exception as e:
            entry = {**item, "ok": False, "char_count": 0,
                     "skipped_existing": False, "elapsed_s": round(time.time() - t0, 1),
                     "error": repr(e)}
            print(f"  [{i:2d}/{len(plan)}] ✗ {item['subdir']}/{Path(item['filename']).name}  ERR: {e}")
        results.append(entry)
    finished = datetime.now().isoformat(timespec="seconds")
    log_path = MANIFEST_DIR / "distill_log.json"
    log_path.write_text(json.dumps({
        "started": started, "finished": finished,
        "total": len(plan),
        "succeeded": sum(1 for r in results if r["ok"]),
        "failed": sum(1 for r in results if not r["ok"]),
        "char_count_min": min((r["char_count"] for r in results if r["ok"]), default=0),
        "char_count_max": max((r["char_count"] for r in results if r["ok"]), default=0),
        "results": results,
    }, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\n→ 寫入 {log_path}")
    return results


def main():
    args = set(sys.argv[1:])
    plan, missing = resolve_targets()
    print(f"預計轉檔 {len(plan)} 筆，找不到 {len(missing)} 筆")
    print()
    print("=== 預計轉檔清單 ===")
    total_mb = 0
    for p in plan:
        mb = p["size_bytes"] / 1024 / 1024
        total_mb += mb
        print(f"  [{p['subdir']:8s}] {mb:6.1f} MB  {Path(p['filename']).name}")
    print(f"  總大小：{total_mb:.1f} MB")
    if missing:
        print("\n=== 找不到（請檢查 filename 比對）===")
        for s, f in missing:
            print(f"  - [{s}] {f}")
    if "--only-list" in args or "--dry-run" in args:
        print("\n[dry-run] 結束。實際轉檔請去掉 --dry-run 參數。")
        return 0

    print("\n=== 開始轉檔（docling）===")
    results = convert_with_docling(plan)
    failed = [r for r in results if not r["ok"]]
    if failed:
        print(f"\n失敗 {len(failed)} 筆：")
        for r in failed:
            print(f"  - {r['filename']}  err={r.get('error', '')[:80]}")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
