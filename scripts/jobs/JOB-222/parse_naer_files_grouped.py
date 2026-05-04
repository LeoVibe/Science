#!/usr/bin/env python3
"""JOB-222 Phase B：把 4 份 raw HTML 解析成「按 group_title 分組」的檔案清單

策略：以 <p class='title'> 為錨點切片，相鄰兩 title 之間的 HTML 即為該分組的 cont 區塊。

輸出：
  scripts/jobs/JOB-222/files_index_grouped.json
"""
import json
import re
from pathlib import Path
from urllib.parse import urljoin

BASE = "https://www.naer.edu.tw"
RAW_DIR = Path(__file__).parent / "raw_html"
SIDS = [
    (176, "總綱"),
    (177, "領域科目課程綱要"),
    (178, "其他類型課綱暨實施規範"),
    (197, "課程手冊"),
]

TITLE_RE = re.compile(
    r"<p class=['\"]title['\"]>(.*?)</p>", re.DOTALL,
)
ANCHOR_RE = re.compile(
    r"<a\b[^>]*?href=['\"]([^'\"]+\.(?:pdf|PDF|ppt|PPT|pptx|PPTX|doc|DOC|docx|DOCX))['\"]"
    r"(?P<rest>[^>]*)>(?P<inner>.*?)</a>",
    re.DOTALL,
)
DLID_RE = re.compile(r"add_download_count\((\d+)\)")
TITLE_ATTR_RE = re.compile(
    r"title=['\"]([^'\"]+\.(?:pdf|PDF|ppt|PPT|pptx|PPTX|doc|DOC|docx|DOCX))[^'\"]*['\"]",
)


def clean_text(s: str) -> str:
    s = re.sub(r"<[^>]+>", "", s)
    s = re.sub(r"\s+", " ", s)
    return s.strip()


def parse_html(html: str, tab_label: str):
    out = []
    # 限定 syllabus-list-wrap 區塊
    m = re.search(
        r'<div class="syllabus-list-wrap">(.*?)<div class="page-btn',
        html, re.DOTALL,
    )
    inner = m.group(1) if m else html

    titles = list(TITLE_RE.finditer(inner))
    if not titles:
        return out

    for idx, t in enumerate(titles):
        group_title = clean_text(t.group(1))
        start = t.end()
        end = titles[idx + 1].start() if idx + 1 < len(titles) else len(inner)
        chunk = inner[start:end]
        for a in ANCHOR_RE.finditer(chunk):
            href = a.group(1)
            rest = a.group("rest")
            inner_txt = clean_text(a.group("inner"))
            dlid_m = DLID_RE.search(rest)
            title_attr_m = TITLE_ATTR_RE.search(rest)
            out.append({
                "tab": tab_label,
                "group_title": group_title,
                "url": urljoin(BASE, href),
                "href": href,
                "filename": href.rsplit("/", 1)[-1],
                "anchor_text": inner_txt,
                "title_attr": title_attr_m.group(1) if title_attr_m else None,
                "download_count_id": dlid_m.group(1) if dlid_m else None,
            })
    return out


def main():
    all_rows = []
    for sid, label in SIDS:
        path = RAW_DIR / f"sid_{sid}_{label}.html"
        html = path.read_text(encoding="utf-8")
        rows = parse_html(html, label)
        groups = sorted({r["group_title"] for r in rows})
        print(f"sid={sid:3d} ({label}): {len(rows):3d} 列 / {len(groups)} 組")
        for g in groups:
            n = sum(1 for r in rows if r["group_title"] == g)
            print(f"    - [{n:2d}] {g}")
        all_rows.extend(rows)

    seen = {}
    for r in all_rows:
        seen.setdefault(r["url"], r)
    rows = list(seen.values())

    out_path = Path(__file__).parent / "files_index_grouped.json"
    out_path.write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\n總計（去重後）：{len(rows)} 筆 → {out_path}")


if __name__ == "__main__":
    main()
