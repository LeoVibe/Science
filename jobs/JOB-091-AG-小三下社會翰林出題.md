---
last_updated: 2026-03-23 00:00
updated_by: Antigravity
---
# JOB-091-AG-小三下社會翰林出題

## 📌 任務背景
使用者反映「小三下 社會 翰林版」目前僅有 6 題 (這 6 題分散在 U1~U6，每課僅 1 題)。本任務旨在執行 `doqst` 流程，依照 R3/R4 研究素材自動產出短缺的題數，使各課均達到至少 30 題的標準，並完成對應的品質檢驗。

## 📖 任務詳情
1. 盤點 G3 S2 社會 (翰林版) 現有題數與缺口。
2. 針對 U1~U6 執行 `auto_generate_questions.js` 補充題庫。
3. 執行品質閘門 (`evaluate_question_quality.js`) 確保無 QL1，且 CQI 達標。
4. 執行盲測模組 (`run_blind_eval.js`) 驗證。
5. 產出任務完工報告 `JOB-091-Report.md`。

## 📜 關鍵參考檔案
| 檔案路徑 | 用途說明 |
| --- | --- |
| `task.md` | 本次出題作戰計畫 |
| `knowledge/1_課綱研究/社會/G3_S2_社會_原始研究素材庫.md` | R3 原始素材 |
| `knowledge/1_課綱研究/社會/G3_S2_社會發展綱要.md` | R4 發展綱要 |
| `question/platform/G3/SocialStudies/S2/HanLin/*` | 產出目標目錄 |

## 預期結果清單 (Expected Outcomes Checklist)
- [ ] G3 S2 SocialStudies HanLin U1~U6 皆擁有 30 題的題庫。
- [ ] 所有產出題目的 CQI 平均分數 ≥ 6.5，且 QL1 (BIAS) 為 0。
- [ ] 盲審驗證 (Blind Eval) 執行完畢並處理 mismatch。
- [ ] `docs/進度彙整_全站研發與題庫產出.md` 進度已更新。
- [ ] 執行 `/dosync` 並沉澱完工報告。

## ✅ 驗證基準 (DoD)
> ⚠️ **規劃要求**：本區塊必須在開發前與需求方 (User) 確認。需具體列出：
- [ ] 通過條件一：符合上述預期結果清單
- [ ] 已開啟並更新 `docs/進度彙整_全站研發與題庫產出.md` (若無關課程研發則免)
- [ ] 已執行 `/dosync` 全域知識沉澱
- [ ] 產出完工報告 `JOB-091-Report.md` (報告檔名仍只需保留編號)

