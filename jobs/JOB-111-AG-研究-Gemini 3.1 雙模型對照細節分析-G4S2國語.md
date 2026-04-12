*Created by AG at 2026-03-24 15:55*

`last_updated`: 2026-03-24 15:55
`updated_by`: Antigravity (Gemini-2.0-Flash)

# JOB-111-AG-研究-Gemini 3.1 雙模型對照細節分析-G4S2國語

## 📌 任務背景
雖然初步測試顯示 Gemini 3.1 系列具備高品質，但尚缺乏「產出耗時」、「API 成本」以及「文本細節（誘答邏輯、情境豐富度）」的深度量化與質性對比。本任務旨在透過全新課次（G4 S2 L2）的 10 題限制測試，產出最終的選型技術決策報告。

## 🎯 任務目標
1. **量化對比**：記錄各模型生成 10 題的總耗時與 Token 成本。
2. **質性對比**：分析 Model A (3.1 Lite) 與 Model B (3 Flash) 在 L4 等級題目上的文本細節差異。
3. **穩定性検証**：測試在大規模（10 題）批次下，Free Tier 的穩定性。

## 📖 執行步驟
1. **環境準備**：複製 L2 原始 JSON 作為對測基底。
2. **執行 Model A (3.1 Lite)**：產出 10 題，記錄 Start/End 時間與 Token 數。
3. **執行 Model B (3 Flash)**：產出 10 題，記錄 Start/End 時間與 Token 數。
4. **品質評核**：執行 `evaluate_question_quality.js` 獲取 CQI 分數。
5. **人工細節分析**：挑選 2 題進行 JSON 內容逐行對比（Scenario/Options/Explanation）。
6. **彙整報告**：產出 `JOB-111-Report.md` 並包含成本計算。

## 📜 關鍵參考檔案
| 檔案路徑 | 用途 |
|:--|:--|
| `docs/model_price.md` | 成本計算基準 |
| `scripts/auto_generate_questions.js` | 生成工具 |
| `scripts/evaluate_question_quality.js` | 評分工具 |

## ✅ 啟動 Checklist (Pre-Flight)
- [x] 已讀取：`docs/model_price.md`
- [x] 已確認前置素材 KQL3/KQL4 存在
- [x] **已確認執行模型**：Gemini 3.1 Flash-Lite-Preview & Gemini 3-Flash-Preview
- [x] **已確認使用金鑰**：Yotta (Free Tier)
- [x] **已確認操作頻次**：Batch 1 / 2 QPM (穩定模式)
- [x] 目標品質：QQL4

## ✅ 驗收 Checklist (Acceptance)
- [x] 完成 10 題深度對比表格
- [x] 包含「每題成本 (TWD)」與「生成秒數/每題」數據
- [x] 包含至少 2 題的文本細節質性分析 (Textual Analysis)
- [x] 最終選型建議明確

## ✅ 成果 Checklist (Deliverables)
- [ ] 成果表格填寫完畢
- [ ] 已產出 `JOB-111-Report.md`
- [ ] 已執行 `/pj_sync`

＄作業匯總 ：Token數:0 | 花費: $0 | 使用模型: gemini-2.0-flash | 執行者: AG
