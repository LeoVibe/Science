import json
import re
import subprocess
import time
import os
import sys

# 基礎配置
BASE_UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

# 預定義的清單 URL (由瀏覽器探索獲得)
PLAYLISTS = {
    "康軒": {
        "G3S1": "http://acerksy.pixnet.net/blog/post/218385552",
        "G3S2": "https://acerksy.pixnet.net/blog/post/218385564",
        "G4S1": "http://acerksy.pixnet.net/blog/post/218393205",
        "G4S2": "http://acerksy.pixnet.net/blog/post/218393232",
        "G5S1": "http://acerksy.pixnet.net/blog/post/218393262",
        "G5S2": "http://acerksy.pixnet.net/blog/post/218393292",
        "G6S1": "https://acerksy.pixnet.net/blog/posts/14218393313",
        "G6S2": "http://acerksy.pixnet.net/blog/post/218393331"
    },
    "南一": {
        "G3S1": "http://acerksy.pixnet.net/blog/post/218397486",
        "G3S2": "http://acerksy.pixnet.net/blog/post/218397498",
        "G4S1": "https://acerksy.pixnet.net/blog/posts/14218397966",
        "G4S2": "http://acerksy.pixnet.net/blog/post/218397981",
        "G5S1": "http://acerksy.pixnet.net/blog/post/218398044",
        "G5S2": "http://acerksy.pixnet.net/blog/post/218398071",
        "G6S1": "https://acerksy.pixnet.net/blog/posts/14218398083",
        "G6S2": "https://acerksy.pixnet.net/blog/posts/14218398092"
    },
    "翰林": {
        "G3S1": "http://acerksy.pixnet.net/blog/post/218364342",
        "G3S2": "http://acerksy.pixnet.net/blog/post/218373756",
        "G4S1": "http://acerksy.pixnet.net/blog/post/218384697",
        "G4S2": "http://acerksy.pixnet.net/blog/post/218384712",
        "G5S1": "http://acerksy.pixnet.net/blog/post/218383890",
        "G5S2": "http://acerksy.pixnet.net/blog/post/218383917",
        "G6S1": "https://acerksy.pixnet.net/blog/posts/14218384745",
        "G6S2": "https://acerksy.pixnet.net/blog/posts/14218384763"
    }
}

def fetch_html(url):
    """使用 CURL 抓取 HTML"""
    print(f"[Fetching] {url}...", flush=True)
    try:
        result = subprocess.run(['curl', '-s', '-L', '-A', BASE_UA, url], capture_output=True, text=True, timeout=20)
        return result.stdout
    except Exception as e:
        print(f"Error fetching {url}: {e}", flush=True)
        return ""

def extract_lesson_links(playlist_html):
    """從學期清單中提取各課連結"""
    # 修正正則，支援 post/ 與 posts/ 格式
    links = re.findall(r'href="(https?://acerksy\.pixnet\.net/blog/posts?/\d+[^"]*)"', playlist_html)
    valid_links = []
    seen = set()
    for link in links:
        # 移除 posts/142 跳過邏輯，因為這是有效連結
        if any(kw in link for kw in ["post/215910153", "post/129334385", "facebook", "pixnet.net/blog/category"]):
            continue
        if link not in seen:
            valid_links.append(link)
            seen.add(link)
    return valid_links

def extract_content(lesson_html):
    """提取課文內容並清洗"""
    title_match = re.search(r'<title>(.*?)</title>', lesson_html)
    title = title_match.group(1).split(' :: ')[0].split(' @ ')[0] if title_match else "Unknown"
    
    marker_start = 'id="article-content-inner">'
    if marker_start in lesson_html:
        content_part = lesson_html.split(marker_start, 1)[1]
        marker_end = '<!-- article-content-inner -->'
        raw_text = content_part.split(marker_end, 1)[0] if marker_end in content_part else content_part.split('</div>', 1)[0]
        
        clean = re.sub(r'<br\s*/?>', '\n', raw_text)
        clean = re.sub(r'</?p.*?>', '\n', clean)
        clean = re.sub(r'</?(span|strong|u|em|font).*?>', '', clean)
        clean = re.sub(r'<[^>]*>', '', clean)
        clean = re.sub(r'&nbsp;', ' ', clean)
        formatted = "\n".join([l.strip() for l in clean.split('\n') if l.strip()])
        return title, formatted
    return title, ""

def main():
    final_vault_path = "/Users/s389080/Documents/doc/work/0_AI_Project/eidosProject/knowledge/1_課綱研究/國語/KL3_國語科_課名_課文彙整.md"
    
    print(f"--- CURRICULUM VAULT BUILDER START ---", flush=True)
    print(f"Target: {final_vault_path}", flush=True)
    
    try:
        with open(final_vault_path, "w", encoding="utf-8") as vault:
            vault.write(f"# 📚 國語科 3-6 年級教材總匯 (Acerksy 授權版)\n")
            vault.write(f"last_updated: {time.strftime('%Y-%m-%d %H:%M')}\n\n")
            vault.flush()

            for publisher, semester_data in PLAYLISTS.items():
                print(f"\n[Processing Publisher: {publisher}]", flush=True)
                vault.write(f"## 🏛️ 出版社：{publisher}\n\n")
                
                for semester, p_url in semester_data.items():
                    print(f"  > Semester: {semester}", flush=True)
                    vault.write(f"### 📋 {semester} - {publisher} 國語\n\n")
                    
                    p_html = fetch_html(p_url)
                    lesson_links = extract_lesson_links(p_html)
                    print(f"    Found {len(lesson_links)} lessons.", flush=True)
                    
                    for l_url in lesson_links:
                        l_html = fetch_html(l_url)
                        l_title, l_content = extract_content(l_html)
                        
                        if l_content:
                            print(f"      OK: {l_title}", flush=True)
                            vault.write(f"#### 📖 {l_title}\n")
                            vault.write(f"**URL**: {l_url}\n\n")
                            vault.write(f"{l_content}\n\n---\n\n")
                        else:
                            print(f"      FAIL: {l_title} (No content or redirected)", flush=True)
                        
                        # 隨機延時增加抗爬性
                        time.sleep(1.2)
                    vault.flush()
    except Exception as e:
        print(f"Critical Error: {e}", flush=True)
    finally:
        print(f"\n[FINISH] Vault process ended at: {final_vault_path}", flush=True)

if __name__ == "__main__":
    main()
