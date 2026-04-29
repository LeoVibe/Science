*Created by Claude Code at 2026-04-29 14:00*

`last_updated`: 2026-04-29 14:00
`updated_by`: Claude Code (claude-sonnet-4-6)

# JOB-216-AG-四五六下考古題PDF全批轉MD-45組合2529份

**`job_type`**：`engineering`

## 📌 任務背景

三下 9 個組合（315 MD）已完成並結案（JOB-212）。本次擴展至四下、五下、六下，涵蓋 5 科目 × 3 出版社 = 45 個組合、2,529 份 PDF，一次性完成三個年級的考古題 MD 建置。

四下有 4 個組合已有部分舊 MD（格式與本次不一致），本次全部重跑。

## 🎯 任務目標

- 45 個組合均有完整 `_index.json`
- 總 MD 數 ≥ 800（試卷+答案每組合合併為 1 MD）
- 國語科 noise_ratio ≤ 0.65（docling 修正豎排）
- 掃描件 MD 的 `char_count > 100`（OCR 補跑後）
- git commit 包含 45 個 `_index.json`

## 🚧 任務邊界

本次任務只做：
- 四下/五下/六下各科目 PDF → MD 轉換（依下方 4 波次）
- 掃描件 OCR 補跑（fitz + ocrmac）
- 每波次後品質抽樣（p3_quality_check.py）
- git commit 僅含 `_index.json`（MD 本文依 .gitignore 不入庫）

本次任務不做：
- 修改 `scripts/job207_distill_to_md.py` 或任何腳本
- 三下組合的任何重跑
- 數學/社會以外科目的 docling 引擎（除非 v6 品質不過）
- 超出上列範圍的任何變更

## 📖 執行步驟

### 前置步驟

```bash
# 1. 刪除四下舊組合 _index.json（全部重跑）
rm -f "knowledge/3_考古題/2_MD淬鍊文字/四下/四下_國語_南一/_index.json"
rm -f "knowledge/3_考古題/2_MD淬鍊文字/四下/四下_社會_南一/_index.json"
rm -f "knowledge/3_考古題/2_MD淬鍊文字/四下/四下_社會_康軒/_index.json"
rm -f "knowledge/3_考古題/2_MD淬鍊文字/四下/四下_社會_翰林/_index.json"

# 2. 確認工作目錄
cd /Users/s389080/Documents/doc/work/0_AI_Project/eidosProject
```

---

### Wave 1 — 數學 + 社會（v6 引擎）

18 個組合，~1,024 份 PDF，6 個背景程序並行

```bash
# 四下 數學
python3.11 scripts/job207_distill_to_md.py --semester 四下 --subject 數學 --publisher 南一 --engine v6 > scripts/orchestrator-logs/JOB-216-W1-四下數學南一.log 2>&1 &
python3.11 scripts/job207_distill_to_md.py --semester 四下 --subject 數學 --publisher 康軒 --engine v6 > scripts/orchestrator-logs/JOB-216-W1-四下數學康軒.log 2>&1 &
python3.11 scripts/job207_distill_to_md.py --semester 四下 --subject 數學 --publisher 翰林 --engine v6 > scripts/orchestrator-logs/JOB-216-W1-四下數學翰林.log 2>&1 &

# 四下 社會（已刪 _index.json，重跑）
python3.11 scripts/job207_distill_to_md.py --semester 四下 --subject 社會 --publisher 南一 --engine v6 > scripts/orchestrator-logs/JOB-216-W1-四下社會南一.log 2>&1 &
python3.11 scripts/job207_distill_to_md.py --semester 四下 --subject 社會 --publisher 康軒 --engine v6 > scripts/orchestrator-logs/JOB-216-W1-四下社會康軒.log 2>&1 &
python3.11 scripts/job207_distill_to_md.py --semester 四下 --subject 社會 --publisher 翰林 --engine v6 > scripts/orchestrator-logs/JOB-216-W1-四下社會翰林.log 2>&1 &
wait

# 五下 數學 + 社會
python3.11 scripts/job207_distill_to_md.py --semester 五下 --subject 數學 --publisher 南一 --engine v6 > scripts/orchestrator-logs/JOB-216-W1-五下數學南一.log 2>&1 &
python3.11 scripts/job207_distill_to_md.py --semester 五下 --subject 數學 --publisher 康軒 --engine v6 > scripts/orchestrator-logs/JOB-216-W1-五下數學康軒.log 2>&1 &
python3.11 scripts/job207_distill_to_md.py --semester 五下 --subject 數學 --publisher 翰林 --engine v6 > scripts/orchestrator-logs/JOB-216-W1-五下數學翰林.log 2>&1 &
python3.11 scripts/job207_distill_to_md.py --semester 五下 --subject 社會 --publisher 南一 --engine v6 > scripts/orchestrator-logs/JOB-216-W1-五下社會南一.log 2>&1 &
python3.11 scripts/job207_distill_to_md.py --semester 五下 --subject 社會 --publisher 康軒 --engine v6 > scripts/orchestrator-logs/JOB-216-W1-五下社會康軒.log 2>&1 &
python3.11 scripts/job207_distill_to_md.py --semester 五下 --subject 社會 --publisher 翰林 --engine v6 > scripts/orchestrator-logs/JOB-216-W1-五下社會翰林.log 2>&1 &
wait

# 六下 數學 + 社會
python3.11 scripts/job207_distill_to_md.py --semester 六下 --subject 數學 --publisher 南一 --engine v6 > scripts/orchestrator-logs/JOB-216-W1-六下數學南一.log 2>&1 &
python3.11 scripts/job207_distill_to_md.py --semester 六下 --subject 數學 --publisher 康軒 --engine v6 > scripts/orchestrator-logs/JOB-216-W1-六下數學康軒.log 2>&1 &
python3.11 scripts/job207_distill_to_md.py --semester 六下 --subject 數學 --publisher 翰林 --engine v6 > scripts/orchestrator-logs/JOB-216-W1-六下數學翰林.log 2>&1 &
python3.11 scripts/job207_distill_to_md.py --semester 六下 --subject 社會 --publisher 南一 --engine v6 > scripts/orchestrator-logs/JOB-216-W1-六下社會南一.log 2>&1 &
python3.11 scripts/job207_distill_to_md.py --semester 六下 --subject 社會 --publisher 康軒 --engine v6 > scripts/orchestrator-logs/JOB-216-W1-六下社會康軒.log 2>&1 &
python3.11 scripts/job207_distill_to_md.py --semester 六下 --subject 社會 --publisher 翰林 --engine v6 > scripts/orchestrator-logs/JOB-216-W1-六下社會翰林.log 2>&1 &
wait
```

Wave 1 完成後跑品質抽樣：
```bash
python3.11 /tmp/p3_quality_check.py  # 確認 noise_ratio ≤ 0.65
```

---

### Wave 2 — 國語（docling 引擎，豎排修正）

9 個組合，~501 份 PDF，**每次最多 3 個並行**（docling 吃記憶體）

```bash
# 四下 國語（南一已刪 _index.json）
python3.11 scripts/job207_distill_to_md.py --semester 四下 --subject 國語 --publisher 南一 --engine docling > scripts/orchestrator-logs/JOB-216-W2-四下國語南一.log 2>&1 &
python3.11 scripts/job207_distill_to_md.py --semester 四下 --subject 國語 --publisher 康軒 --engine docling > scripts/orchestrator-logs/JOB-216-W2-四下國語康軒.log 2>&1 &
python3.11 scripts/job207_distill_to_md.py --semester 四下 --subject 國語 --publisher 翰林 --engine docling > scripts/orchestrator-logs/JOB-216-W2-四下國語翰林.log 2>&1 &
wait

python3.11 scripts/job207_distill_to_md.py --semester 五下 --subject 國語 --publisher 南一 --engine docling > scripts/orchestrator-logs/JOB-216-W2-五下國語南一.log 2>&1 &
python3.11 scripts/job207_distill_to_md.py --semester 五下 --subject 國語 --publisher 康軒 --engine docling > scripts/orchestrator-logs/JOB-216-W2-五下國語康軒.log 2>&1 &
python3.11 scripts/job207_distill_to_md.py --semester 五下 --subject 國語 --publisher 翰林 --engine docling > scripts/orchestrator-logs/JOB-216-W2-五下國語翰林.log 2>&1 &
wait

python3.11 scripts/job207_distill_to_md.py --semester 六下 --subject 國語 --publisher 南一 --engine docling > scripts/orchestrator-logs/JOB-216-W2-六下國語南一.log 2>&1 &
python3.11 scripts/job207_distill_to_md.py --semester 六下 --subject 國語 --publisher 康軒 --engine docling > scripts/orchestrator-logs/JOB-216-W2-六下國語康軒.log 2>&1 &
python3.11 scripts/job207_distill_to_md.py --semester 六下 --subject 國語 --publisher 翰林 --engine docling > scripts/orchestrator-logs/JOB-216-W2-六下國語翰林.log 2>&1 &
wait
```

---

### Wave 3 — 自然（v6 + OCR 補跑）

9 個組合，~523 份 PDF

```bash
python3.11 scripts/job207_distill_to_md.py --semester 四下 --subject 自然 --publisher 南一 --engine v6 > scripts/orchestrator-logs/JOB-216-W3-四下自然南一.log 2>&1 &
python3.11 scripts/job207_distill_to_md.py --semester 四下 --subject 自然 --publisher 康軒 --engine v6 > scripts/orchestrator-logs/JOB-216-W3-四下自然康軒.log 2>&1 &
python3.11 scripts/job207_distill_to_md.py --semester 四下 --subject 自然 --publisher 翰林 --engine v6 > scripts/orchestrator-logs/JOB-216-W3-四下自然翰林.log 2>&1 &
python3.11 scripts/job207_distill_to_md.py --semester 五下 --subject 自然 --publisher 南一 --engine v6 > scripts/orchestrator-logs/JOB-216-W3-五下自然南一.log 2>&1 &
python3.11 scripts/job207_distill_to_md.py --semester 五下 --subject 自然 --publisher 康軒 --engine v6 > scripts/orchestrator-logs/JOB-216-W3-五下自然康軒.log 2>&1 &
python3.11 scripts/job207_distill_to_md.py --semester 五下 --subject 自然 --publisher 翰林 --engine v6 > scripts/orchestrator-logs/JOB-216-W3-五下自然翰林.log 2>&1 &
python3.11 scripts/job207_distill_to_md.py --semester 六下 --subject 自然 --publisher 南一 --engine v6 > scripts/orchestrator-logs/JOB-216-W3-六下自然南一.log 2>&1 &
python3.11 scripts/job207_distill_to_md.py --semester 六下 --subject 自然 --publisher 康軒 --engine v6 > scripts/orchestrator-logs/JOB-216-W3-六下自然康軒.log 2>&1 &
python3.11 scripts/job207_distill_to_md.py --semester 六下 --subject 自然 --publisher 翰林 --engine v6 > scripts/orchestrator-logs/JOB-216-W3-六下自然翰林.log 2>&1 &
wait

# OCR 補跑（掃描件）
python3.11 /tmp/p_ocr_scanned.py
```

---

### Wave 4 — 英語（v6 + OCR 補跑，新科目）

9 個組合，~481 份 PDF

```bash
python3.11 scripts/job207_distill_to_md.py --semester 四下 --subject 英語 --publisher 康軒 --engine v6 > scripts/orchestrator-logs/JOB-216-W4-四下英語康軒.log 2>&1 &
python3.11 scripts/job207_distill_to_md.py --semester 四下 --subject 英語 --publisher 翰林 --engine v6 > scripts/orchestrator-logs/JOB-216-W4-四下英語翰林.log 2>&1 &
python3.11 scripts/job207_distill_to_md.py --semester 四下 --subject 英語 --publisher 何嘉仁 --engine v6 > scripts/orchestrator-logs/JOB-216-W4-四下英語何嘉仁.log 2>&1 &
python3.11 scripts/job207_distill_to_md.py --semester 五下 --subject 英語 --publisher 康軒 --engine v6 > scripts/orchestrator-logs/JOB-216-W4-五下英語康軒.log 2>&1 &
python3.11 scripts/job207_distill_to_md.py --semester 五下 --subject 英語 --publisher 翰林 --engine v6 > scripts/orchestrator-logs/JOB-216-W4-五下英語翰林.log 2>&1 &
python3.11 scripts/job207_distill_to_md.py --semester 五下 --subject 英語 --publisher 何嘉仁 --engine v6 > scripts/orchestrator-logs/JOB-216-W4-五下英語何嘉仁.log 2>&1 &
python3.11 scripts/job207_distill_to_md.py --semester 六下 --subject 英語 --publisher 康軒 --engine v6 > scripts/orchestrator-logs/JOB-216-W4-六下英語康軒.log 2>&1 &
python3.11 scripts/job207_distill_to_md.py --semester 六下 --subject 英語 --publisher 翰林 --engine v6 > scripts/orchestrator-logs/JOB-216-W4-六下英語翰林.log 2>&1 &
python3.11 scripts/job207_distill_to_md.py --semester 六下 --subject 英語 --publisher 何嘉仁 --engine v6 > scripts/orchestrator-logs/JOB-216-W4-六下英語何嘉仁.log 2>&1 &
wait

# OCR 補跑（掃描件）
python3.11 /tmp/p_ocr_scanned.py
```

---

### 結案步驟

```bash
# 品質最終抽樣
python3.11 /tmp/p3_quality_check.py

# git commit（僅含 _index.json）
git add knowledge/3_考古題/2_MD淬鍊文字/四下/ knowledge/3_考古題/2_MD淬鍊文字/五下/ knowledge/3_考古題/2_MD淬鍊文字/六下/
git commit -m "feat: 四下/五下/六下考古題 PDF→MD 全批完成（45 組合）"

# 結案
node scripts/job_manager.js close JOB-216
```

---

## 📌 Phase 2 補充擴展（2026-04-29）

> **範圍擴展**：使用者確認目標為「四個年級（三下/四下/五下/六下）全科目、全檔案類型都轉完」。
> 原 JOB-216 Phase 1 只覆蓋四下/五下/六下的 PDF。Phase 2 補充三下漏轉 + iCloud 遮蔽 PDF + Word 檔 + JPG 圖片。

### Wave 5 — 三下_數學 + 三下_英語 PDF（pdfplumber）

5 個組合，共 ~314 PDF，JOB-212/213 當時只做了國語/社會/自然，漏掉數學+英語。

```bash
LOG="scripts/orchestrator-logs"
# 數學（pdfplumber，無豎排）
python3.11 scripts/job207_distill_to_md.py --semester 三下 --subject 數學 --publisher 南一 --engine pdfplumber \
  > "$LOG/JOB-216-W5-三下數學南一.log" 2>&1 &
python3.11 scripts/job207_distill_to_md.py --semester 三下 --subject 數學 --publisher 翰林 --engine pdfplumber \
  > "$LOG/JOB-216-W5-三下數學翰林.log" 2>&1 &

# 英語（pdfplumber）
python3.11 scripts/job207_distill_to_md.py --semester 三下 --subject 英語 --publisher 何嘉仁 --engine pdfplumber \
  > "$LOG/JOB-216-W5-三下英語何嘉仁.log" 2>&1 &
python3.11 scripts/job207_distill_to_md.py --semester 三下 --subject 英語 --publisher 康軒 --engine pdfplumber \
  > "$LOG/JOB-216-W5-三下英語康軒.log" 2>&1 &
python3.11 scripts/job207_distill_to_md.py --semester 三下 --subject 英語 --publisher 翰林 --engine pdfplumber \
  > "$LOG/JOB-216-W5-三下英語翰林.log" 2>&1 &
wait
```

### Wave 6 — iCloud 強制下載 + 受影響組合補跑

**背景**：114 份 PDF 被 iCloud 佔位符遮蔽（.icloud 格式），實體未在本機。
下載後，已有 _index.json 的組合需刪除並重新轉換（含新 PDF）。

```bash
# Step 1: 強制下載全部 .icloud 檔案
cd knowledge/3_考古題/1_原始檔
find . -name "*.icloud" -exec brctl download {} \;
# 等待下載完成（估計 2-5 分鐘，視網路速度）
sleep 60

# Step 2: 刪除受影響 combo 的 _index.json（讓 job207 重跑）
# 受影響 combo 清單（含隱藏 PDF 的）：
AFFECTED_COMBOS=(
  "三下/三下_國語_南一" "三下/三下_國語_康軒" "三下/三下_國語_翰林"
  "三下/三下_數學_康軒" "三下/三下_社會_南一" "三下/三下_社會_康軒"
  "三下/三下_社會_翰林" "三下/三下_自然_翰林"
  "五下/五下_數學_康軒" "五下/五下_數學_翰林" "五下/五下_社會_南一"
  "五下/五下_自然_康軒" "五下/五下_英語_康軒" "五下/五下_英語_翰林"
  "六下/六下_國語_南一" "六下/六下_國語_翰林" "六下/六下_社會_南一"
  "六下/六下_社會_康軒" "六下/六下_自然_南一" "六下/六下_自然_康軒"
  "六下/六下_英語_康軒" "六下/六下_英語_何嘉仁"
  "四下/四下_國語_南一" "四下/四下_國語_康軒" "四下/四下_數學_南一"
  "四下/四下_社會_南一" "四下/四下_社會_康軒" "四下/四下_社會_翰林"
  "四下/四下_自然_南一" "四下/四下_自然_翰林" "四下/四下_英語_康軒"
  "四下/四下_英語_何嘉仁"
)
cd /Users/s389080/Documents/doc/work/0_AI_Project/eidosProject
for combo in "${AFFECTED_COMBOS[@]}"; do
  rm -f "knowledge/3_考古題/2_MD淬鍊文字/$combo/_index.json"
  echo "已清除：$combo"
done

# Step 3: 重新跑受影響組合（解析學期/科目/出版社後批量執行）
python3.11 scripts/JOB216_rerun_affected.py
```

### Wave 7 — 全四學期 Word 檔轉 MD（.doc / .docx）

**背景**：213 .doc + 40 .docx = 253 份 Word 考古題，命名格式與 PDF 相同。
工具鏈：.doc → LibreOffice soffice → .docx → markitdown → .md

```bash
python3.11 scripts/JOB216_batch_doc_to_md.py
```

輸出至各 combo 的 `2_MD淬鍊文字/{semester}/{combo}/` 目錄，同時建立 `_doc_index.json`。

### Wave 8 — JPG 圖片 OCR

```bash
# 6 份 jpg，使用 ocrmac（Apple Vision Framework）
python3.11 - <<'EOF'
import subprocess
from pathlib import Path

SRC = Path("knowledge/3_考古題/1_原始檔")
OUT = Path("knowledge/3_考古題/2_MD淬鍊文字")

for jpg in SRC.rglob("*.jpg"):
    parts = jpg.parts  # [..., semester, combo, filename]
    sem, combo = parts[-3], parts[-2]
    stem = jpg.stem
    out_dir = OUT / sem / combo
    out_dir.mkdir(parents=True, exist_ok=True)
    out_md = out_dir / f"{stem}.md"
    result = subprocess.run(
        ["python3.11", "-c",
         f"import ocrmac; txt=''.join(ocrmac.ocr('{jpg}')); open('{out_md}','w').write(txt)"],
        capture_output=True, text=True
    )
    print(f"{'✅' if result.returncode==0 else '❌'} {jpg.name} → {out_md.name}")
EOF
```

## 📜 關鍵參考檔案

| 檔案路徑 | 用途 |
|:--|:--|
| `scripts/job207_distill_to_md.py` | 主批次轉換腳本 |
| `/tmp/p_ocr_scanned.py` | 掃描件 OCR 補跑（需 python3.11） |
| `/tmp/p3_quality_check.py` | 品質抽樣（noise_ratio / char_count / garbled_ratio）|
| `scripts/orchestrator-logs/` | 各波次執行 log |

## ✅ 啟動 Checklist (Pre-Flight)

- [ ] 已讀本派工單全文
- [ ] 四下 4 個舊 _index.json 已刪除
- [ ] 確認 `scripts/job207_distill_to_md.py` 可執行（`python3.11 scripts/job207_distill_to_md.py --help`）
- [ ] 確認 docling 環境可用（`/Users/s389080/Documents/doc/work/0_AI_Project/githubFav/pdf2md/.venv/bin/python -c "import docling"` 無報錯）
- [ ] `scripts/orchestrator-logs/` 目錄存在

## ✅ 驗收 Checklist (Acceptance)

- [ ] 45 個組合均有 `_index.json`（佐證：`find knowledge/3_考古題/2_MD淬鍊文字/{四,五,六}下 -name "_index.json" | wc -l` = 45）
- [ ] 總 MD 數 ≥ 800（佐證：各組合 .md 數量加總）
- [ ] 國語科 noise_ratio ≤ 0.65（佐證：p3_quality_check.py 輸出）
- [ ] 掃描件 char_count > 100（佐證：p3_quality_check.py 輸出）
- [ ] git staged 含 45 個 _index.json（佐證：`git diff --cached --name-only | wc -l`）

## ✅ 成果 Checklist (Deliverables)

- [ ] `jobs/JOB-216-Report.md` 已產出，含各 Wave MD 數量統計
- [ ] `node scripts/job_manager.js close JOB-216` 已執行
- [ ] `/pj_sync` 已執行
- [ ] Discord `#eidos_派工與回報`（chat_id: `1487738477608177714`）結案通知已送出

## 真實回報本次對話的模型與花費

＄作業匯總：Token數:{真實Meta中數字} | 花費: ${換算台幣} | 使用模型: {真實Meta中的模型代碼} | 執行者: Cursor
