*Created by AG at 2026-03-23 01:31*
*Last Updated at 2026-03-23 01:31 (Initial Specification)*

# JOB-092-AG-G3S2社會題庫審計與修復

## 📌 任務背景
使用者回饋「小三下社會翰林版」題庫存在嚴重錯誤，包括：
1. 答案索引與解析矛盾（邏輯損壞）。
2. 選項充斥重複的 AI 幻覺後綴（Artifacts）。
3. 題目高度重複（康軒版 U1）。
4. 包含 meta-commentary 導致沉浸感不足。

## 📖 任務詳計
1. **全面審計**：掃描 G3/SocialStudies/S2 下所有 JSON，找出包含「這點在實務上很重要」等關鍵字的題目。
2. **邏輯修復**：修正所有 `blind_eval_mismatch` 標記以及人工發現的解析矛盾。
3. **去除冗餘**：移除題目開頭的出版社標註，簡化選項文字，去除幻覺後綴。
4. **重建康軒 U1**：針對高度重複題目進行去重，並補齊多樣化題型。
5. **品質驗證**：重新跑 `evaluate_question_quality.js` 與 `run_blind_eval.js` 並人工核確。

## 📜 關鍵參考檔案
| 檔案路徑 | 用途說明 |
| --- | --- |
| `_agent/skills/doqst/SKILL.md` | 使用自動出題與驗證流水線 |
| `question/platform/G3/SocialStudies/S2/` | 目標題庫目錄 |

## 🧬 推薦指令/提示詞
> 呼叫 `run_blind_eval.js` 時應對照 `knowledge/1_課綱研究/Social/G3_S2_社會發展綱要.md`。

## ✅ 驗證基準 (DoD)
- [ ] 所有 JSON 檔案內不再包含「這點在實務上很重要」或類似幻覺字串。
- [ ] `blind_eval_mismatch` 數量為 0 或已標記為 `distractor_success`。
- [ ] 康軒版 U1 的重複題目率低於 10%。
- [ ] 已更新 `docs/進度彙整_全站研發與題庫產出.md`。
- [ ] 產出完工報告 `JOB-092-Report.md`。

## 🎯 預期結果清單 (Expected Outcomes)
- [ ] 修正後的 `HanLin/Soc_U1.json`～`Soc_U6.json`（答案正確且無冗餘）。
- [ ] 修正後的 `KangHsuan/Soc_U1.json`（已去重且邏輯正確）。
- [ ] 最終品質評分報告（CQI ≥ 6.5, QL1=0）。

