"""JOB-265 KL4考古題淬煉 驗證腳本（六下國語）。
用法: python verify_kl4.py <_new檔路徑> <課名>
"""
import sys, re, os

def verify(path, kename):
    if not os.path.exists(path):
        return False, ['檔案不存在']
    t = open(path, encoding='utf-8').read()
    fails = []

    body = t.split('步驟3')[-1] if '步驟3' in t else t

    # 1. 無虛構學校/段考來源
    fake = re.findall(r'[一-鿿]{2,8}國[小中].{0,6}(?:段考|月考|期[中末]|評量|學年)', body)
    fake = [x for x in fake if 'L2' not in x]
    if fake:
        fails.append(f'疑似虛構來源{len(fake)}處: {fake[:2]}')

    # 2. 誠實標註
    honest = len(re.findall(r'依課文改編|L2\s*真題|來源：\s*L2', body))
    qn = len(re.findall(r'###?\s*第?\d+\s*題|題幹', body))
    if honest < max(1, qn // 2):
        fails.append(f'誠實標註不足({honest}標註/{qn}題)')

    # 3. 題數≥10
    if qn < 10:
        fails.append(f'題數不足({qn}<10)')

    # 4. 誘答分析
    das = re.findall(r'誘答機制解析[*：:\s]*(.+?)(?=來源標註|對應課綱|###|$)', body, re.S)
    short = sum(1 for d in das if len(d.strip()) < 30)
    if das and short > 0:
        fails.append(f'{short}題誘答分析<30字')
    if not das:
        fails.append('無誘答機制解析')

    # 5. 無空殼殘留
    if 'bootstrap' in t or '待補' in t or 'RC-04' in t:
        fails.append('含bootstrap/待補空殼')

    # 6. 扣課文（修正：加入破折號、全形句點等特殊標點作為切分符）
    words = [w for w in re.split(r'[的之與和、，\s─—－\-．。《》【】「」]', kename) if len(w) >= 2]
    hit = sum(1 for w in words if w in body)
    if words and hit == 0:
        fails.append(f'題目未扣課文(課名詞{words}皆未出現)')

    return (len(fails) == 0), fails

if __name__ == '__main__':
    path, kename = sys.argv[1], sys.argv[2]
    ok, fails = verify(path, kename)
    if ok:
        print(f'PASS: {os.path.basename(path)}')
    else:
        print(f'FAIL: {os.path.basename(path)} — {"; ".join(fails)}')
        sys.exit(1)
