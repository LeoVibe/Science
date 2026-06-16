"""JOB-267 KL4考古題淬煉 驗證腳本（三下社會翰林）。
用法: python verify_kl4_social.py <_new檔路徑> <課名>
"""
import sys, re, os

def verify(path, kename):
    if not os.path.exists(path):
        return False, ['檔案不存在']
    t = open(path, encoding='utf-8').read()
    fails = []

    # 1. 研究成熟度標記 RM3
    if 'RM3' not in t:
        fails.append('未標記 RM3')

    # 2. 禁止出現「未知國小」（真實考卷學校名引用OK，只攔截明顯捏造的「未知」）
    fake_unknown = re.findall(r'未知國[小中]', t)
    if fake_unknown:
        fails.append(f'出現未知國小/中({len(fake_unknown)}處)')

    # 3. 題型分析數量（§一，至少3個題型）
    qtype = len(re.findall(r'題型\s*[A-Z一二三四五六七八九十]', t))
    if qtype < 3:
        fails.append(f'題型分析不足({qtype}<3)')

    # 4. 迷思矩陣條目（至少5條）
    misi = len(re.findall(r'\|\s*[「《【"\w].{3,}.{0,40}\|', t))
    if misi < 5:
        fails.append(f'迷思矩陣條目不足({misi}<5)')

    # 5. 無空殼殘留
    if 'bootstrap' in t or '待補' in t or 'RM0' in t:
        fails.append('含bootstrap/待補/RM0空殼殘留')

    # 6. 扣課文（課名專屬詞需出現於全文任意位置）
    words = [w for w in re.split(r'[的之與和、，\s─—－\-．。《》【】「」]', kename) if len(w) >= 2]
    hit = sum(1 for w in words if w in t)
    if words and hit == 0:
        fails.append(f'內容未扣課名關鍵詞({words}皆未出現)')

    return (len(fails) == 0), fails

if __name__ == '__main__':
    path, kename = sys.argv[1], sys.argv[2]
    ok, fails = verify(path, kename)
    if ok:
        print(f'PASS: {os.path.basename(path)}')
    else:
        print(f'FAIL: {os.path.basename(path)} — {"; ".join(fails)}')
        sys.exit(1)
