*Created by AG at 2026-03-24 23:44*

`last_updated`: 2026-03-24 23:44
`updated_by`: Antigravity (Gemini-2.0-Pro-Exp)

# JOB-116-AG-量產-國文下學期全年級-L1-L6-品質補強

## 📌 任務背景
使用者要求擴大補強範圍，從原本的前 3 課擴展至 G3-G6 全年級下學期國文的前 6 課，確保核心單元皆具備高品質（QL4）且題量充足（30 題+）的題庫。並落實模型透明化與低頻執行原則。

## 🎯 任務目標
1. 補齊 G3-G6 (S2) L1-L6 各版本國文題庫至 30 題以上優質題。
2. 全數執行雙盲驗證 (Blind Eval)，達成 QL4 等級。
3. 消除所有 BIAS 標籤，落實規範化的品質標註。

## 📖 執行步驟
1. 確保教研素材 (R4) 完整（已完成 G3-G6 S2 發展綱要）。
2. 使用 `auto_generate_questions.js` (8 QPM) 分批生成題目。
3. 使用 `run_blind_eval.js` 補回驗證數據。
4. 執行 `generate_library_stats.js` 驗收。

## 📜 關鍵參考檔案
| 檔案路徑 | 用途 |
|:--|:--|
| `question/README_出題與品管準則.md` | 出題原則 |
| `question/README_驗證與盲測準則.md` | 驗證原則 |
| `scripts/evaluate_question_quality.js` | 品質評分體系 |

## ✅ 啟動 Checklist (Pre-Flight)
- [x] 已讀取：`evaluate_question_quality.js`, `implementation_plan_國文補強.md`
- [x] 已確認前置素材 KL3/KL4/KL5/KL6 存在
- [x] **已確認執行模型**：[模型：gemini-3.1-flash-lite-preview]
- [x] **已確認使用金鑰**：[金鑰：Yotta]
- [x] **已確認操作頻次**：[QPM：8 QPM]
- [x] 目標品質：QL4

## ✅ 驗收 Checklist (Acceptance)
- [ ] G3-G6 S2 L1-L6 每課題數 ≥ 25 題 (Shippable)
- [ ] 區域品質達標 QL4 (具備盲測數據與 R4 支撐)
- [ ] 無 BIAS 負面標籤
- [ ] 內容含 scenario + explanation

## ✅ 成果 Checklist (Deliverables)
- [ ] `libraryStats.json` 數據更新
- [ ] `walkthrough_國文補強.md` 包含全年級 L1-L6 報告
- [ ] 已執行 `/pj_sync`
- [ ] 產出 JOB-116-Report.md

## 真實回報本次對話的模型與花費
＄作業匯總 ：Token數:60000 | 花費: $18.0 | 使用模型: Gemini-2.0-Pro-Exp | 執行者: AG