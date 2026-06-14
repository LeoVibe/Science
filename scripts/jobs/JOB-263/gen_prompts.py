"""JOB-263 四下國語 KL4 考古題淬煉 — 生成每課 codex prompt（附錄B模板，10題）。
輸出到 _new 暫存（KL4_..._考古題與討論_new.md），驗證通過才覆蓋空殼正式檔。
"""
import os, glob, re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
BASE = 'knowledge/1_課綱研究/國語/四下'
KL3 = f'{BASE}/KL3_四下_國語_研究總綱.md'
L2 = 'knowledge/3_考古題/3_L2_結構化抽取/四下/四下_國語_L2_整合.md'
PD = os.path.join(ROOT, 'scripts/jobs/JOB-263/_prompts')
os.makedirs(PD, exist_ok=True)

TPL = '''你是國語科題型研究專家。為四下{pub} {L}《{name}》設計 10 道「課文題型示例與誘答分析」，接受雙重驗證。

## 步驟1：讀取並回報（證明真讀）
讀以下3檔，各回報「檔名+引用行號+該行實際文字」：
1. {rec}
2. {kl3}
3. {l2}

## 步驟2：檢查 L2 有無本課真實考題
在 L2 整合 MD 搜尋《{name}》專屬詞（人物/地點/關鍵概念）：有→引用真題標「來源：L2+試卷名」；無→誠實寫「L2無本課真題」，全部標「依課文改編」。

## 步驟3：產 10 題，每題格式
- 題幹（**必須出現本課課文專屬詞**，從單課研究紀錄取）
- 4選項+正解
- 誘答機制解析（≥30字，說明學生為何選這個錯的）
- 來源標註：「L2真題：試卷名」或「依課文改編（非真實考卷）」
- 對應課綱碼

## 硬規則
- **絕對禁止虛構學校/段考/學年度來源**（無真題就誠實標「依課文改編」，違者 KP-01）
- 題幹必須扣本課課文，不可寫成通用國語題
- 移除原檔 bootstrap/待補空殼內容

## 輸出
寫到 {out}，依序含：步驟1讀取證明、步驟2檢查結果、步驟3的10題。完成後確認寫出，不輸出全文到對話。
'''

count = 0
for pub in ['翰林', '康軒', '南一']:
    for rec in sorted(glob.glob(f'{BASE}/{pub}/KL4_四下_{pub}_L*_單課研究紀錄.md')):
        m = re.search(rf'KL4_四下_{pub}_(L\d+)_(.+?)_單課研究紀錄', os.path.basename(rec))
        if not m: continue
        L, name = m.group(1), m.group(2)
        out = f'{BASE}/{pub}/KL4_四下_{pub}_{L}_{name}_考古題與討論_new.md'
        prompt = TPL.format(pub=pub, L=L, name=name, rec=rec, kl3=KL3, l2=L2, out=out)
        with open(os.path.join(PD, f'{pub}_{L}.txt'), 'w', encoding='utf-8') as f:
            f.write(prompt)
        count += 1
print(f'✓ 生成 {count} 課 prompt → {PD}')
