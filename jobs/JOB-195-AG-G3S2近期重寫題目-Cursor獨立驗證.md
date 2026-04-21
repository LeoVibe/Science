*Created by Claude Code at 2026-04-18*

`last_updated`: 2026-04-18
`updated_by`: Claude Code (claude-sonnet-4-6)

# JOB-195 — G3 S2 近期重寫題目 Cursor 獨立驗證

**`job_type`**: `question_verify`
**`executor`**: Cursor

## 📌 任務背景

JOB-193（翰林 L8）與 JOB-194（康軒 L4/L6）完成後，題目由 Claude Code 撰寫（非 Cursor 本人）。使用者要求 Cursor 進行**獨立驗證**，確認：
1. 題目內容正確對應課文
2. `biasWarning: null` 可重現
3. `answer_index` 與 `explanation` 一致

## 🎯 任務目標

對以下 3 個檔案執行 CQI-P 驗證 + 內容抽查，確認品質無誤。

| 檔案 | 課名 | 出題 JOB | 題數 |
|:--|:--|:--|:--|
| `question/platform/G3/Chinese/S2/HanLin/G3_S2_CHI_HANLIN_L8.json` | 行人的守護者 | JOB-193 | 30 |
| `question/platform/G3/Chinese/S2/KangHsuan/G3_S2_CHI_KANGHSUAN_L4.json` | 工匠之祖 | JOB-194 | 30 |
| `question/platform/G3/Chinese/S2/KangHsuan/G3_S2_CHI_KANGHSUAN_L6.json` | 神奇密碼 | JOB-194 | 29 |

## 🚧 任務邊界

本次只做：
- 執行 `evaluate_question_quality.js` 確認三檔品質
- 讀取 KL4 研究文件，抽查 10 題以上確認課文對應正確
- 確認每題 `answer_index` 與 `explanation` 邏輯一致
- 若發現錯誤（answer_index 錯、題目出自錯誤課文），修正並重跑 CQI-P

不做：
- 重新大批出題（已有 89 題，有問題的題目可局部修正）
- 修改 KL4 研究文件
- 執行 run_blind_eval.js 盲測（另開 JOB）

## 📖 執行步驟

1. 讀取 `question/README_出題與品管準則.md`
2. 讀取三份 KL4 研究文件：
   - `knowledge/1_課綱研究/國語/三下/翰林/KL4_三下_翰林_L8_行人的守護者_單課研究紀錄.md`
   - `knowledge/1_課綱研究/國語/三下/康軒/KL4_三下_康軒_L4_工匠之祖_單課研究紀錄.md`
   - `knowledge/1_課綱研究/國語/三下/康軒/KL4_三下_康軒_L6_神奇密碼_單課研究紀錄.md`
3. 對三個 JSON 檔各執行：
   ```bash
   node scripts/evaluate_question_quality.js question/platform/G3/Chinese/S2/HanLin/G3_S2_CHI_HANLIN_L8.json
   node scripts/evaluate_question_quality.js question/platform/G3/Chinese/S2/KangHsuan/G3_S2_CHI_KANGHSUAN_L4.json
   node scripts/evaluate_question_quality.js question/platform/G3/Chinese/S2/KangHsuan/G3_S2_CHI_KANGHSUAN_L6.json
   ```
4. 每檔抽查 ≥10 題：
   - 題目問的是正確課文的內容
   - `answer_index` 指向的選項與 `explanation` 說明一致
   - 選項語意正確（錯誤選項是合理誘答，非亂填）
5. 若發現問題題目：修正 `answer_index` 或選項，重跑 CQI-P
6. 產出 `jobs/JOB-195-Report.md`

## 📜 關鍵參考檔案

| 檔案 | 用途 |
|:--|:--|
| `question/README_出題與品管準則.md` | 出題品質標準 |
| `knowledge/1_課綱研究/國語/三下/翰林/KL4_三下_翰林_L8_行人的守護者_單課研究紀錄.md` | L8 課文 |
| `knowledge/1_課綱研究/國語/三下/康軒/KL4_三下_康軒_L4_工匠之祖_單課研究紀錄.md` | L4 課文 |
| `knowledge/1_課綱研究/國語/三下/康軒/KL4_三下_康軒_L6_神奇密碼_單課研究紀錄.md` | L6 課文 |

## ✅ 啟動 Checklist (Pre-Flight)

- [ ] 已讀取 `question/README_出題與品管準則.md`
- [ ] 已讀取三份 KL4 研究文件
- [ ] **已確認執行模型**：[模型：___________]
- [ ] **已確認使用金鑰**：[金鑰：___________]

## ✅ 驗收 Checklist (Acceptance)

- [ ] 三檔 `biasWarning: null` — 佐證：evaluate 輸出
- [ ] 三檔 quality ≥ QL3 — 實際值：L8=___，L4=___，L6=___
- [ ] 每檔抽查 ≥10 題，內容對應正確
- [ ] `answer_index` 與 `explanation` 一致（逐檔確認）

## ✅ 成果 Checklist (Deliverables)

- [ ] `jobs/JOB-195-Report.md` 已產出，含抽查記錄
- [ ] 若有修正：已重跑 `evaluate_question_quality.js`
- [ ] 已執行 `/pj_sync`

## ⏱️ 執行時間回報

| 子任務 | 開始 | 結束 | 耗時（分鐘） |
|:--|:--|:--|:--|
| CQI-P 驗證 | HH:mm | HH:mm | - |
| 內容抽查 | HH:mm | HH:mm | - |
| 修正（如有） | HH:mm | HH:mm | - |
| **總計** | — | — | **-** |

## 真實回報本次對話的模型與花費
＄作業匯總：Token數:{真實Meta中數字} | 花費: ${換算台幣} | 使用模型: {真實Meta中的模型代碼} | 執行者: Cursor
