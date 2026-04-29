#!/usr/bin/env python3.11
"""JOB-216 Wave 7: 批次把 .doc/.docx 轉換為 Markdown。

流程：
  .doc  → soffice --headless → .docx → markitdown → .md
  .docx → markitdown → .md

輸出目錄：knowledge/3_考古題/2_MD淬鍊文字/{semester}/{combo}/
索引：    每個 combo 的 _doc_index.json
"""
import json
import subprocess
import tempfile
import shutil
from pathlib import Path
from datetime import datetime

SRC_BASE = Path("knowledge/3_考古題/1_原始檔")
MD_BASE  = Path("knowledge/3_考古題/2_MD淬鍊文字")
LOG_DIR  = Path("scripts/orchestrator-logs")
SOFFICE     = "/usr/local/bin/soffice"
VENV_PYTHON = "/Users/s389080/Documents/doc/work/0_AI_Project/githubFav/pdf2md/.venv/bin/python3.11"


def doc_to_docx(doc_path: Path, tmp_dir: Path) -> Path | None:
    """用 LibreOffice 把 .doc 轉成 .docx，回傳轉出的 .docx 路徑。"""
    result = subprocess.run(
        [SOFFICE, "--headless", "--convert-to", "docx", "--outdir", str(tmp_dir), str(doc_path)],
        capture_output=True, text=True, timeout=60
    )
    if result.returncode != 0:
        return None
    out = tmp_dir / (doc_path.stem + ".docx")
    return out if out.exists() else None


def docx_to_md(docx_path: Path) -> str | None:
    """用 .venv markitdown 把 .docx 轉成 markdown 字串（subprocess 避免 import path 問題）。"""
    try:
        result = subprocess.run(
            [VENV_PYTHON, "-c",
             "import sys; from markitdown import MarkItDown; "
             "r = MarkItDown().convert(sys.argv[1]); print(r.text_content)",
             str(docx_path)],
            capture_output=True, text=True, timeout=60
        )
        if result.returncode != 0 or not result.stdout.strip():
            return None
        return result.stdout
    except Exception:
        return None


def main():
    stats = {"ok_docx": 0, "ok_doc": 0, "fail_doc_convert": 0, "fail_md": 0, "skip": 0}
    all_results = []
    ts_start = datetime.now()

    semesters = sorted(p for p in SRC_BASE.iterdir() if p.is_dir())
    for sem_dir in semesters:
        for combo_dir in sorted(p for p in sem_dir.iterdir() if p.is_dir()):
            combo = combo_dir.name
            sem   = sem_dir.name

            word_files = sorted(
                list(combo_dir.glob("*.doc")) + list(combo_dir.glob("*.docx"))
            )
            if not word_files:
                continue

            out_dir = MD_BASE / sem / combo
            out_dir.mkdir(parents=True, exist_ok=True)

            combo_results = []
            with tempfile.TemporaryDirectory() as tmp:
                tmp_dir = Path(tmp)
                for wf in word_files:
                    stem = wf.stem
                    out_md = out_dir / f"{stem}.md"

                    # 跳過已轉的
                    if out_md.exists():
                        stats["skip"] += 1
                        continue

                    # 決定工作路徑
                    if wf.suffix.lower() == ".docx":
                        docx = wf
                        converted = False
                    else:  # .doc
                        docx = doc_to_docx(wf, tmp_dir)
                        converted = True
                        if docx is None:
                            stats["fail_doc_convert"] += 1
                            print(f"  ❌ .doc→.docx 失敗：{wf.name}")
                            combo_results.append({"file": wf.name, "status": "fail_doc_convert"})
                            continue

                    md_text = docx_to_md(docx)
                    if md_text is None:
                        stats["fail_md"] += 1
                        print(f"  ❌ .docx→MD 失敗：{wf.name}")
                        combo_results.append({"file": wf.name, "status": "fail_md"})
                        continue

                    out_md.write_text(md_text, encoding="utf-8")
                    if converted:
                        stats["ok_doc"] += 1
                    else:
                        stats["ok_docx"] += 1

                    combo_results.append({
                        "file": wf.name,
                        "status": "ok",
                        "engine": "soffice+markitdown" if converted else "markitdown",
                        "out_md": str(out_md),
                        "char_count": len(md_text),
                    })
                    print(f"  ✅ {sem}/{combo}/{wf.name}  ({len(md_text)} chars)")

            if combo_results:
                doc_index = {
                    "combo": combo,
                    "created_at": datetime.now().isoformat(),
                    "engine": "office_converter",
                    "files": combo_results,
                }
                idx_path = out_dir / "_doc_index.json"
                idx_path.write_text(json.dumps(doc_index, ensure_ascii=False, indent=2))
                all_results.append({"combo": f"{sem}/{combo}", "count": len(combo_results)})

    elapsed = (datetime.now() - ts_start).total_seconds()

    print("\n" + "="*60)
    print("JOB-216 Wave 7 Word→MD 完成")
    print(f"  .docx 成功: {stats['ok_docx']}")
    print(f"  .doc 成功:  {stats['ok_doc']}")
    print(f"  .doc 轉換失敗: {stats['fail_doc_convert']}")
    print(f"  MD 產出失敗:   {stats['fail_md']}")
    print(f"  已跳過:        {stats['skip']}")
    print(f"  耗時: {elapsed:.0f}s")
    print("="*60)

    log = LOG_DIR / "JOB-216-W7-doc-to-md.log"
    log.write_text(json.dumps({"stats": stats, "combos": all_results}, ensure_ascii=False, indent=2))
    print(f"Log: {log}")


if __name__ == "__main__":
    main()
