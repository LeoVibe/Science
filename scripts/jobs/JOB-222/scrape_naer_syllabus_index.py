#!/usr/bin/env python3
"""JOB-222 Phase B：抓 NAER PageSyllabus 4 個分頁的所有檔案連結

NAER 切分頁機制：
  GET  https://www.naer.edu.tw/PageSyllabus?fid=52  → 拿 csrf 與 PHPSESSID
  POST 同一 URL with form data (csrf, sid, tid='') → 取得對應分頁 HTML

四個 sid：
  176 → 總綱
  177 → 領域/科目課程綱要
  178 → 其他類型課綱暨實施規範
  197 → 課程手冊

輸出：
  scripts/jobs/JOB-222/raw_html/sid_{176,177,178,197}.html
  scripts/jobs/JOB-222/files_index_raw.json
"""
import json
import re
import sys
import time
from pathlib import Path
from urllib.parse import urljoin

import urllib.request
import urllib.parse
import http.cookiejar

BASE = "https://www.naer.edu.tw"
URL = f"{BASE}/PageSyllabus?fid=52"
SIDS = [
    (176, "總綱"),
    (177, "領域科目課程綱要"),
    (178, "其他類型課綱暨實施規範"),
    (197, "課程手冊"),
]

OUT_DIR = Path(__file__).parent
RAW_DIR = OUT_DIR / "raw_html"
RAW_DIR.mkdir(parents=True, exist_ok=True)


def make_opener():
    cj = http.cookiejar.CookieJar()
    opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
    opener.addheaders = [
        ("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                       "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"),
        ("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"),
        ("Accept-Language", "zh-TW,zh;q=0.9,en;q=0.8"),
    ]
    return opener, cj


def get_csrf(html: str) -> str:
    m = re.search(r'name="csrf"\s+value="([^"]+)"', html)
    if not m:
        raise RuntimeError("CSRF token not found in initial GET")
    return m.group(1)


def fetch_tab(opener, csrf: str, sid: int) -> str:
    data = urllib.parse.urlencode({
        "csrf": csrf,
        "sid": str(sid),
        "tid": "",
    }).encode("utf-8")
    req = urllib.request.Request(
        URL,
        data=data,
        method="POST",
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    with opener.open(req, timeout=30) as resp:
        return resp.read().decode("utf-8", errors="replace")


# 抓 anchor a：href + 內文（含 onclick 抓 download_count_id）
ANCHOR_RE = re.compile(
    r"<a\b[^>]*?href=['\"]([^'\"]+\.(?:pdf|PDF|ppt|PPT|pptx|PPTX|doc|DOC|docx|DOCX))['\"]"
    r"[^>]*?(?:onclick=['\"]add_download_count\((\d+)\)['\"])?[^>]*?>(.*?)</a>",
    re.DOTALL,
)


def extract_files(html: str, sid_label: str):
    files = []
    for m in ANCHOR_RE.finditer(html):
        href = m.group(1)
        dlid = m.group(2)
        # 內文清乾淨（去 HTML tags & 縮空白）
        inner = re.sub(r"<[^>]+>", "", m.group(3)).strip()
        inner = re.sub(r"\s+", " ", inner)
        files.append({
            "tab": sid_label,
            "href": href,
            "url": urljoin(BASE, href),
            "filename": href.rsplit("/", 1)[-1],
            "anchor_text": inner,
            "download_count_id": dlid,
        })
    return files


def main():
    opener, _cj = make_opener()
    print(f"[1/2] GET {URL}")
    with opener.open(URL, timeout=30) as resp:
        html0 = resp.read().decode("utf-8", errors="replace")
    csrf = get_csrf(html0)
    print(f"      csrf={csrf[:12]}...")

    all_files = []
    # sid=176（總綱）就是 GET 預設頁，html0 就有
    print("[2/2] 解析 4 個分頁")
    for sid, label in SIDS:
        if sid == 176:
            html = html0
        else:
            time.sleep(0.5)
            html = fetch_tab(opener, csrf, sid)
        out_path = RAW_DIR / f"sid_{sid}_{label}.html"
        out_path.write_text(html, encoding="utf-8")
        files = extract_files(html, label)
        print(f"  sid={sid} ({label})  → {len(files)} 個檔案連結  → {out_path.name}")
        all_files.extend(files)

    # 去重（href 為 key）
    seen = {}
    for f in all_files:
        seen.setdefault(f["href"], f)
    deduped = list(seen.values())

    out_json = OUT_DIR / "files_index_raw.json"
    out_json.write_text(json.dumps(deduped, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\n總計（去重後）：{len(deduped)} 個檔案")
    print(f"輸出：{out_json}")

    # 摘要
    by_tab = {}
    for f in deduped:
        by_tab.setdefault(f["tab"], 0)
        by_tab[f["tab"]] += 1
    print("\n各分頁筆數：")
    for tab, n in by_tab.items():
        print(f"  {tab}: {n}")


if __name__ == "__main__":
    sys.exit(main())
