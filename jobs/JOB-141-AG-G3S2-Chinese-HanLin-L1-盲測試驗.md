*Created by Claude Code (claude-haiku-4-5) at 2026-04-04 07:20*

`last_updated`: 2026-04-04 07:20
`updated_by`: Claude Code (claude-haiku-4-5)

# JOB-141-AG-G3S2-Chinese-HanLin-L1-盲測試驗

**`job_type`**: `question_verify`

> ⚠️ 本單為新流程試驗單：Claude Code 派工 → Cursor 執行 → Cursor 撰寫 Report → Claude Code 審視結案  
> ⚠️ 本單依賴 JOB-140 完成後（L1 題數 ≥ 30）才執行

## 📌 任務背景

JOB-140 補題完成後，對 G3S2 Chinese HanLin L1 進行盲測驗證，確認題目品質達標。  
目前 L1 有 28 題（JOB-140 補完後預計 ≥ 30 題）。

## 🎯 任務目標

`question/platform/G3/Chinese/S2/HanLin/G3_S2_CHI_HANLIN_L1.json` 盲測 Match Rate ≥ 85%，CQI-V 通過。

## 🚧 任務邊界

本次任務只做：
- 對 `G3_S2_CHI_HANLIN_L1.json` 執行盲測（`run_blind_eval.js`）
- 記錄 Match Rate、Mismatch 清單、CQI-V
- 產出 `jobs/JOB-141-Report.md`

本次任務不做：
- 修改題目內容（如有 Mismatch 只記錄，不改題）
- 修改 L2～L12 或其他檔案
- 修改任何規範文件

## 📖 執行步驟

1. 讀取 `question/README_驗證與盲測準則.md` 盲測規則
2. 確認 `G3_S2_CHI_HANLIN_L1.json` 已由 JOB-140 更新（題數 ≥ 30）
3. 執行盲測：
   ```bash
   node scripts/run_blind_eval.js \
     question/platform/G3/Chinese/S2/HanLin/G3_S2_CHI_HANLIN_L1.json \
     --force
   ```
4. 記錄輸出：總題數、Match 題數、Mismatch 題數、Match Rate
5. 計算 CQI-V（依 `README_驗證與盲測準則.md` §3）
6. 產出 `jobs/JOB-141-Report.md`

## 📜 關鍵參考檔案

| 檔案路徑 | 用途 |
|:--|:--|
| `question/README_驗證與盲測準則.md` | 盲測標準、Match Rate 計算、CQI-V |
| `question/platform/G3/Chinese/S2/HanLin/G3_S2_CHI_HANLIN_L1.json` | 盲測目標題庫 |
| `scripts/run_blind_eval.js` | 盲測執行腳本 |

## ✅ 啟動 Checklist (Pre-Flight)

- [ ] 已讀取：`question/README_驗證與盲測準則.md`
- [ ] 已確認 JOB-140 完成，`G3_S2_CHI_HANLIN_L1.json` 題數 ≥ 30
- [x] **已確認執行模型**：composer-2-fast
- [x] **已確認使用金鑰**：Yotta [free]
- [x] **已確認操作頻次**：1 QPM（free tier）
- [ ] 已閱讀任務邊界，確認只驗 L1

## ✅ 驗收 Checklist (Acceptance)

- [ ] 執行指令無錯誤退出（exit code 0）
- [ ] Match Rate ≥ 85%（填入實際數值：____%）
- [ ] Mismatch 清單已記錄（無 Mismatch 填「無」）
- [ ] CQI-V 計算完成（填入實際數值：___）

## ✅ 成果 Checklist (Deliverables)

- [ ] 產出 `jobs/JOB-141-Report.md`（**由 Cursor 執行後撰寫**，不得由 Claude Code 代寫）
- [ ] Report 中列出：總題數、Match/Mismatch 題數、Match Rate、CQI-V
- [ ] Report 中列出 Mismatch 題目的題號與錯誤答案（若有）
- [ ] Report 中記錄使用模型與花費

## 真實回報本次對話的模型與花費
＄作業匯總：Token數:{真實Meta中數字} | 花費: ${換算台幣} | 使用模型: {真實Meta中的模型代碼} | 執行者: Cursor
