*Created by Claude Code (PM) at 2026-04-22*
*Revised for multi-agent execution at 2026-04-22*

`last_updated`: 2026-04-22
`updated_by`: Claude Code (claude-sonnet-4-6)

# JOB-209-AG：米蘭考古題分批下載（每日執行單）

**`job_type`**: `engineering`
**`executor`**: 任意 Agent（Claude / Codex / Cursor / Gemini）或人工執行

> **設計原則**：本派工單為「自給自足」規格。執行者不需要記憶上次做了什麼，
> 所有狀態都在 `download_progress.json`。任何人或 Agent 拿到本單都能正確執行。

---

## 📌 一句話任務

執行下一批 30 個 Google Drive 考古題資料夾的下載，更新進度記錄，回報結果。

---

## 🔧 前置確認（每次執行前必跑，不可跳過）

依序執行以下指令，**確認每一條都成功才繼續**：

```bash
# 1. 確認腳本存在
ls scripts/exam_download_runner.py

# 2. 確認進度檔存在
ls knowledge/3_考古題/_manifest/download_progress.json

# 3. 確認 gdown 可用（任一成功即可）
python3 -c "import gdown; print('gdown module OK:', gdown.__version__)" 2>/dev/null || \
  /Users/s389080/Library/Python/3.11/bin/gdown --version 2>/dev/null || \
  echo "ERROR: gdown not found"

# 4. 確認有 pending 的 Drive（若輸出 0 代表全部完成，不需執行）
python3 -c "
import json
data = json.load(open('knowledge/3_考古題/_manifest/download_progress.json'))
pending = [r for r in data if r['status'] == 'pending']
print(f'待下載 Drive 數: {len(pending)}')
if pending:
    r = pending[0]
    print(f'下一個: priority={r[\"priority\"]} {r[\"grade\"]} {r[\"semester\"]} {r[\"subject\"]} {r[\"publisher\"]} {r[\"exam_type\"]}')
"
```

若步驟 3 出現 `ERROR: gdown not found`，執行：
```bash
pip install gdown
```
然後重新確認步驟 3。

---

## ▶️ 執行指令（唯一一條）

```bash
python3 scripts/exam_download_runner.py --run --batch 30
```

- 腳本會自動從上次斷點繼續（跳過 `status=done/failed`）
- 每完成一個 Drive 立即寫入 `download_progress.json`（**不等整批完成**）
- 自動限速：Drive 間隔 45 秒，每 3 個 Drive 額外休 8 分鐘
- 預計執行時間：約 70 分鐘（30 Drives）

> ⚠️ **網路需求**：此指令需要連線 `drive.google.com`。
> 若在 Codex 中執行，必須加 `--dangerously-bypass-approvals-and-sandbox`：
> ```bash
> codex exec --dangerously-bypass-approvals-and-sandbox \
>   "python3 scripts/exam_download_runner.py --run --batch 30"
> ```

---

## ✅ 驗收（執行完成後必做，結果寫入 Report）

### 步驟一：查進度大表

```bash
python3 scripts/exam_download_runner.py --status
```

**記錄輸出內容**（完整貼入 Report）。

### 步驟二：驗證本批次實際下載數

```bash
python3 -c "
import json, pathlib, datetime

data = json.load(open('knowledge/3_考古題/_manifest/download_progress.json'))
today = datetime.date.today().isoformat()

# 今日完成的 Drive
done_today = [r for r in data if r.get('last_attempt','')[:10] == today and r['status'] == 'done']
fail_today = [r for r in data if r.get('last_attempt','')[:10] == today and r['status'] == 'failed']

print(f'本次完成: {len(done_today)} 個 Drive')
print(f'本次失敗: {len(fail_today)} 個 Drive')
total_pdf = sum(r.get('downloaded_pdf_count', 0) for r in done_today)
print(f'本次新增 PDF: {total_pdf} 份')
print()
for r in done_today:
    print(f'  ✅ priority={r[\"priority\"]:3d} {r[\"grade\"]} {r[\"semester\"]} {r[\"subject\"]:4s} {r[\"publisher\"]} {r[\"exam_type\"]:6s} → {r[\"downloaded_pdf_count\"]} 份')
for r in fail_today:
    print(f'  ❌ priority={r[\"priority\"]:3d} {r[\"grade\"]} {r[\"semester\"]} {r[\"subject\"]:4s} {r[\"publisher\"]} {r[\"exam_type\"]:6s} → {r.get(\"error_note\",\"?\")[:50]}')
"
```

### 步驟三：抽驗第一個完成的 Drive

取本次第一個 `done` 的 Drive，確認本地檔案真實存在：

```bash
python3 -c "
import json, pathlib, datetime
data = json.load(open('knowledge/3_考古題/_manifest/download_progress.json'))
today = datetime.date.today().isoformat()
done = [r for r in data if r.get('last_attempt','')[:10] == today and r['status'] == 'done']
if done:
    r = done[0]
    p = pathlib.Path(r['local_path'])
    pdfs = list(p.rglob('*.pdf'))
    print(f'路徑: {r[\"local_path\"]}')
    print(f'實際 PDF 數: {len(pdfs)}')
    print(f'前三個檔名:')
    for f in pdfs[:3]: print(f'  {f.name}')
"
```

**驗收標準**：
- 實際 PDF 數 > 0 → ✅
- 實際 PDF 數 = 0 → ❌ 需調查（可能是 gdown 版本問題或 Drive 為空）

---

## 📋 Report 格式（每次執行完必產出）

在 `jobs/JOB-209-Report.md` **追加**（不是覆蓋）以下格式：

```markdown
### 執行紀錄：{YYYY-MM-DD}

| 項目 | 數值 |
|:--|:--|
| 執行者 | {Agent 名稱 / 模型} |
| 完成 Drive 數 | {N} |
| 失敗 Drive 數 | {N} |
| 新增 PDF 數 | {N} |
| 執行時間 | {開始}～{結束} |

**進度大表快照**：
（貼上 --status 輸出）

**失敗清單**（如有）：
（貼上失敗的 Drive 及 error_note）

**抽驗結果**：
（第一個完成 Drive 的路徑 + 實際 PDF 數）
```

---

## 🚧 邊界（任何 Agent 都不得越界）

本次任務只做：
- 執行 `--run --batch 30`
- 驗收並記錄結果至 Report

本次任務不做：
- 解析或分析 PDF 內容
- 修改腳本邏輯（發現 bug 請記入 Report「遺留問題」）
- 更改 `download_progress.json` 以外的任何 manifest 檔案
- 修改規範文件

---

## ⚙️ 常見問題處理

| 情況 | 處理方式 |
|:--|:--|
| gdown 下載 0 個檔案但無錯誤 | 記 `error_note: rate-limit 疑似觸發`，繼續下一個 |
| `403 Forbidden` | 記 `status: failed`，繼續下一個，不重試 |
| 網路中斷 | 腳本已自動寫入當前狀態，直接重跑 `--run --batch 30` 即可 |
| 所有 `pending` 為 0 | 全部完成，不需執行，回報即可 |
| 腳本 crash | 記錄錯誤訊息至 Report，等待 PM 指示 |

---

## 📁 關鍵檔案（執行者唯讀，不得修改）

| 檔案 | 用途 |
|:--|:--|
| `knowledge/3_考古題/_manifest/download_progress.json` | 唯一進度真相，腳本自動維護 |
| `knowledge/3_考古題/_manifest/drive_manifest_G1_G6.json` | 原始 Drive 清單（不修改） |
| `scripts/exam_download_runner.py` | 執行工具（不修改） |

---

## ✅ 成果 Checklist

- [ ] `--status` 輸出已記錄至 Report
- [ ] 本次完成 Drive 數 ≥ 1（至少有一個成功）
- [ ] 抽驗通過（實際 PDF 數 > 0）
- [ ] Report 已追加本次執行紀錄
- [ ] 失敗清單已記錄（0 筆亦須明確填寫「無」）

---

## 真實回報本次對話的模型與花費
＄作業匯總：Token數:- | 花費: $- | 使用模型: - | 執行者: -
