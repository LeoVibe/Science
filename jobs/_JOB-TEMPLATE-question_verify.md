*Created by {AG|USER} at {YYYY-MM-DD HH:mm}*

`last_updated`: {YYYY-MM-DD HH:mm}
`updated_by`: {Agent名} ({模型名})

# JOB-XXX-{ORIGIN}-{對象}-全版本盲測

**`job_type`**: `question_verify`  
**`executor`**: {AG|Cursor}

## 📌 任務背景
[本次盲測的觸發原因，例如：題庫出題完成待驗證 / 上版前品質關卡]

## 🎯 任務目標
對 {科目} {年級下學期} 全版本執行盲測，確認 Match Rate 達標後結案。

## 🚧 任務邊界

本次任務只做：
- 執行 `scripts/run_blind_eval.js` 盲測
- Match Rate < 85% 之課次：分析 Mismatch 原因，依 §2.5 規則判斷是否修正
- 執行 `scripts/evaluate_question_quality.js` (CQI-P) 複核受影響課次

本次任務不做：
- 重新出題（除非 §2.5 判定需修正且修正量 ≤ 2 題）
- 修改 R3/R4 素材
- 修改任何規範文件

## 📖 執行步驟
1. 執行盲測：`node scripts/run_blind_eval.js {subject} {grade} {semester}`
2. 整理 Match Rate 表，標記 < 85% 課次
3. 對每個 Mismatch 逐題分析：AI 錯 vs. `answer_index` 錯（見 `question/README_驗證與盲測準則.md §2.5`）
4. 修正 `answer_index` 類錯誤（不需重出題），並重跑 CQI-P
5. 撰寫 JOB-XXX-Report.md，附盲測日誌截圖路徑或輸出

## 📜 關鍵參考檔案
| 檔案路徑 | 用途 |
|:--|:--|
| `question/README_驗證與盲測準則.md` | 盲測流程、§2.5 Mismatch 判斷規則 |
| `docs/README_任務派工準則.md` | 派工生命週期 |
| `_agent/API_RULES.md` | 盲測 API 成本控制 |

## ✅ 啟動 Checklist (Pre-Flight)
- [ ] 已讀取 `question/README_驗證與盲測準則.md`（特別是 §2.5）
- [ ] 已確認執行模型：[模型：___________]（盲審 Verifier）
- [ ] 已確認使用金鑰：[金鑰：___________]
- [ ] 已確認 QPM 限制：[QPM：___________]
- [ ] 目標科目 / 年級之 R4 素材已存在（`knowledge/`）

## ✅ 驗收 Checklist (Acceptance)
- [ ] 全版本 Match Rate ≥ 85% — 實際值：{填入各版本數值}
- [ ] CQI-P ≥ 5.5（受影響課次重新驗證）— 實際值：{填入}
- [ ] Mismatch 逐題分析完成，每筆附原因說明（AI 錯 / answer_index 錯）
- [ ] §2.5 超門檻課次已處理（封鎖 or 修正）

## ✅ 成果 Checklist (Deliverables)
- [ ] 盲測日誌 / 輸出已附於 Report
- [ ] 進度總表 `docs/進度彙整_題庫研發與產出.md` 已更新 Match Rate 欄
- [ ] 已執行 `/pj_sync`
- [ ] 產出 JOB-XXX-Report.md，Mismatch 逐題分析清單已列出

## ⏱️ 執行時間回報
| 子任務 / 階段 | 開始時間 | 結束時間 | 耗時（分鐘） | 備註 |
|:--|:--|:--|:--|:--|
| 盲測執行 | HH:mm | HH:mm | - | |
| Mismatch 分析 | HH:mm | HH:mm | - | |
| 修正 + CQI-P | HH:mm | HH:mm | - | |
| **總計** | — | — | **-** | — |

## 真實回報本次對話的模型與花費
＄作業匯總：Token數:{真實Meta中數字} | 花費: ${換算台幣} | 使用模型: {真實Meta中的模型代碼} | 執行者: {AG|Cursor|Claude}
