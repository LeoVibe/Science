"""JOB-267 三下社會翰林 KL4 考古題淬煉 — 生成每課 codex prompt（反推法，RM3 格式）。"""
import os, glob, re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
BASE = 'knowledge/1_課綱研究/社會/三下/翰林'
KL3 = 'knowledge/1_課綱研究/社會/KL3_三下_社會_研究總綱.md'
REPORT = 'knowledge/1_課綱研究/社會/三下/_reports/翰林_考古題彙整報告.md'
KANGHSUAN_SAMPLE = 'knowledge/1_課綱研究/社會/三下/康軒/KL4_三下_康軒_L1_我們居住的地方_考古題與討論.md'
PD = os.path.join(ROOT, 'scripts/jobs/JOB-267/_prompts')
os.makedirs(PD, exist_ok=True)

TPL = '''你是社會科研究專家。請為三下翰林 {L}《{name}》，依「考古題反推法」產出 KL4 考古題與討論，達 RM3。

## 步驟1：讀取並回報（證明真讀）
讀以下4檔，各回報「檔名+引用行號+該行實際文字」：
1. {rec}（本課單課研究紀錄）
2. {report}（翰林考古題彙整報告，重點讀本課相關段落）
3. {kl3}（三下社會研究總綱）
4. {sample}（康軒L1格式範本，參考 §一 §二 §三 格式）

## 步驟2：從彙整報告摘出本課考古題重點
在翰林_考古題彙整報告.md 搜尋《{name}》或相關主題詞，摘出：
- 高頻題型（出現次數/學年）
- 常見誘答選項
- 學生迷思
若彙整報告無本課直接記錄，從同主題考古題歸納。

## 步驟3：產出 RM3 格式考古題與討論
仿照康軒L1範本格式，產出完整 §一 §二 §三，要求：
- §一 題型分析：至少 **4 個題型**，每題型含「常見題幹/正確知識/常見誘答/學生錯因/出題建議」表格
- §二 迷思矩陣：至少 **6 條**迷思，含概念/迷思描述/典型誘答/鑑別策略
- §三 出題建議：考古重點條列，含「翰林本課特有詞彙/概念」

## 硬規則
- **RM3 標記**：檔頭必須寫 `研究成熟度：RM3`
- **禁止虛構學校/段考**：來源只能引用彙整報告內已記載的考試，不可自編
- **保留原始 bootstrap 欄位**（一～四），但全部內容替換為 RM3 實質內容
- 移除「待填」「RM0」「尚無考古題」等空殼文字

## 輸出
寫到 {out}，包含：步驟1讀取證明、步驟2摘錄、步驟3完整 §一§二§三。完成後確認寫出，不輸出全文到對話。
'''

count = 0
for rec in sorted(glob.glob(f'{BASE}/KL4_三下_翰林_L*_單課研究紀錄.md')):
    m = re.search(r'KL4_三下_翰林_(L\d+)_(.+?)_單課研究紀錄', os.path.basename(rec))
    if not m: continue
    L, name = m.group(1), m.group(2)
    out = f'{BASE}/KL4_三下_翰林_{L}_{name}_考古題與討論_new.md'
    prompt = TPL.format(L=L, name=name, rec=rec, report=REPORT, kl3=KL3, sample=KANGHSUAN_SAMPLE, out=out)
    with open(os.path.join(PD, f'翰林_{L}.txt'), 'w', encoding='utf-8') as f:
        f.write(prompt)
    count += 1
    print(f'  {L} {name}')
print(f'✓ 生成 {count} 課 prompt → {PD}')
