import json
import re
import subprocess
import time
import sys

def fetch_url_content(url):
    """利用 CURL 抓取網頁原始碼"""
    print(f"[Fetching] {url}...", flush=True)
    try:
        ua = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        result = subprocess.run(['curl', '-i', '-s', '-L', '-A', ua, url], capture_output=True, text=True, timeout=15)
        return result.stdout
    except Exception as e:
        print(f"Error fetching {url}: {e}", flush=True)
        return ""

def extract_lesson_links(playlist_html):
    """從播放清單頁面提取單課的連結"""
    # 搜尋 <a> 標籤中的 href，注意 pixnet 可能使用相對路徑或加上轉義
    links = re.findall(r'href="(https?://acerksy\.pixnet\.net/blog/post/\d+[^"]*)"', playlist_html)
    valid_links = []
    seen = set()
    for link in links:
        if any(kw in link for kw in ["posts/142", "post/215910153", "post/129334385", "facebook.com", "google.com.tw"]):
            continue
        if link not in seen:
            valid_links.append(link)
            seen.add(link)
    return valid_links

def extract_content(lesson_html):
    """從單課頁面提取標題與課文內容 (精確版)"""
    # 提取標題
    title_match = re.search(r'<title>(.*?)</title>', lesson_html)
    title = title_match.group(1).split(' :: ')[0].split(' @ ')[0] if title_match else "Unknown"
    
    # 痞客邦的文章內容通常位於 article-content-inner
    # 我們尋找 id="article-content-inner" 的 div
    marker_start = 'id="article-content-inner">'
    if marker_start in lesson_html:
        content_part = lesson_html.split(marker_start, 1)[1]
        # 尋找結束標籤 (簡單處理：尋找下一組常見的文章結尾標記)
        marker_end = '<!-- article-content-inner -->'
        if marker_end in content_part:
            raw_text = content_part.split(marker_end, 1)[0]
        else:
            # 如果沒找到備註標籤，尋找下一個閉合 div (這比較不準，但作為備案)
            raw_text = content_part.split('</div>', 1)[0]
            
        # 清理內容
        clean_text = re.sub(r'<br\s*/?>', '\n', raw_text)
        clean_text = re.sub(r'</?p.*?>', '\n', clean_text)
        clean_text = re.sub(r'</?span.*?>', '', clean_text)
        clean_text = re.sub(r'</?strong.*?>', '', clean_text)
        clean_text = re.sub(r'</?u.*?>', '', clean_text)
        clean_text = re.sub(r'<[^>]*>', '', clean_text)
        clean_text = re.sub(r'&nbsp;', ' ', clean_text)
        # 移除多餘空行
        clean_text = "\n".join([line.strip() for line in clean_text.split('\n') if line.strip()])
        return title, clean_text
    
    return title, "Content Marker Not Found"

def run_poc():
    print("--- Starting POC Script ---", flush=True)
    playlist_url = "https://acerksy.pixnet.net/blog/post/218373756"
    html = fetch_url_content(playlist_url)
    
    if not html:
        print("[FAIL] Could not fetch playlist page.", flush=True)
        return

    links = extract_lesson_links(html)
    print(f"Found {len(links)} candidate lesson links.", flush=True)
    
    # 限制 POC 抓取數量
    links_to_fetch = links[:2]
    print(f"Sampling {len(links_to_fetch)} for content extraction...", flush=True)
    
    results = []
    for link in links_to_fetch:
        lesson_html = fetch_url_content(link)
        title, content = extract_content(lesson_html)
        print(f"Extracted Title: {title}", flush=True)
        print(f"Content length: {len(content)} chars", flush=True)
        results.append({
            "title": title,
            "url": link,
            "content_preview": content[:100] + "..."
        })
        time.sleep(1)
    
    output_path = "/Users/s389080/Documents/doc/work/0_AI_Project/eidosProject/_agent/scripts/poc_result.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    print(f"\n[SUCCESS] Result saved to: {output_path}", flush=True)

if __name__ == "__main__":
    run_poc()
