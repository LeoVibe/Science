*Created by Claude Code (claude-haiku-4-5) at 2026-04-04 07:20*

`last_updated`: 2026-04-04 07:20
`updated_by`: Claude Code (claude-haiku-4-5)

# JOB-140-AG-G3S2-Chinese-HanLin-L1-補題試驗

**`job_type`**: `question_prod`

> ⚠️ 本單為新流程試驗單：Claude Code 派工 → Cursor 執行 → Cursor 撰寫 Report → Claude Code 審視結案

## 📌 任務背景

驗證新派工流程（Claude Code → Cursor → Report）可正確執行補題並寫入 JSON 檔案。  
G3S2 Chinese HanLin L1 目前有 **28 題**，目標 **30 題**（需補 2 題）。

## 🎯 任務目標

`question/platform/G3/Chinese/S2/HanLin/G3_S2_CHI_HANLIN_L1.json` 題數從 28 增加到 **≥ 30 題**，CQI-P ≥ 5.5。

## 🚧 任務邊界

本次任務只做：
- 對 `G3_S2_CHI_HANLIN_L1.json` 補充 2 題，使總數達 30 題
- 產出 `jobs/JOB-140-Report.md`

本次任務不做：
- 修改 L2～L12 或其他檔案
- 修改任何規範文件
- 執行盲測驗證（由 JOB-141 負責）

## 📖 執行步驟

1. 讀取 `question/README_出題與品管準則.md` 出題規則
2. 讀取現有 `question/platform/G3/Chinese/S2/HanLin/G3_S2_CHI_HANLIN_L1.json` 確認題目結構
3. 執行補題指令（擇一）：
   ```bash
   # 單課補題（推薦）
   node scripts/auto_generate_questions.js \
     question/platform/G3/Chinese/S2/HanLin/G3_S2_CHI_HANLIN_L1.json \
     --target 30 --threshold 5.5
   ```
   或使用批次腳本（單一出版社+年級）：
   ```bash
   node scripts/batch_chinese_s2_generate.js --grades G3 --publishers HanLin \
     -- --target 30 --threshold 5.5
   ```
4. 執行後確認 JSON 題數已增加（`python3 -c "import json; d=json.load(open('...')); print(len(d))"` 或 `d['questions']`）
5. 執行 CQI-P 評估：
   ```bash
   node scripts/evaluate_question_quality.js \
     question/platform/G3/Chinese/S2/HanLin/G3_S2_CHI_HANLIN_L1.json
   ```
6. 產出 `jobs/JOB-140-Report.md`（由 Cursor 撰寫，見成果 Checklist）

## 📜 關鍵參考檔案

| 檔案路徑 | 用途 |
|:--|:--|
| `question/README_出題與品管準則.md` | 出題原則、CQI-P 標準 |
| `question/platform/G3/Chinese/S2/HanLin/G3_S2_CHI_HANLIN_L1.json` | 目標題庫（補題對象） |
| `scripts/auto_generate_questions.js` | 單課補題腳本 |
| `scripts/evaluate_question_quality.js` | CQI-P 評估腳本 |

## ✅ 啟動 Checklist (Pre-Flight)

- [ ] 已讀取：`question/README_出題與品管準則.md`
- [ ] 已確認 `G3_S2_CHI_HANLIN_L1.json` 存在，題數為 28
- [x] **已確認執行模型**：composer-2-fast
- [x] **已確認使用金鑰**：Yotta [free]
- [x] **已確認操作頻次**：1 QPM（free tier）
- [ ] 已閱讀任務邊界，確認只改 L1

## ✅ 驗收 Checklist (Acceptance)

- [ ] `G3_S2_CHI_HANLIN_L1.json` 題數達 **30 題**（填入實際數值：___）
- [ ] CQI-P 平均 ≥ 5.5（填入實際數值：___）
- [ ] 新增題目含 `scenario` + `explanation` 欄位
- [ ] JSON 格式合法（無 parse error）

## ✅ 成果 Checklist (Deliverables)

- [ ] 產出 `jobs/JOB-140-Report.md`（**由 Cursor 執行後撰寫**，不得由 Claude Code 代寫）
- [ ] Report 中列出：補題前後題數、CQI-P 實際數值、修改的檔案路徑
- [ ] Report 中記錄使用模型與花費

## 真實回報本次對話的模型與花費
＄作業匯總：Token數:{真實Meta中數字} | 花費: ${換算台幣} | 使用模型: {真實Meta中的模型代碼} | 執行者: Cursor
