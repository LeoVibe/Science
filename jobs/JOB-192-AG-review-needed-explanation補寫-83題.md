*Created by Claude Code at 2026-04-18 00:00*

`last_updated`: 2026-04-18 00:00
`updated_by`: Claude Code (claude-sonnet-4-6)

# JOB-192 — review_needed explanation 補寫（83 題）

**`job_type`**: `question_prod`  
**`executor`**: Cursor

## 📌 任務背景

JOB-191 執行 explanation 清掃後，83 題的 explanation 被判定為 `review_needed`（原始內容為純 AI 元評論、無學科價值），已清空為 `""`。這 83 題目前 explanation 空白，需人工品質的正確說明文字補寫。

## 🎯 任務目標

針對 `logs/clean_explanation_2026-04-17T18-04-59.json` 中 `status: "review_needed"` 的 83 題，逐一補寫符合出題準則的 `explanation` 欄位（非空、非 AI 元評論、說明為何此答案正確）。

## 🚧 任務邊界

本次任務只做：
- 補寫 `explanation` 欄位（83 題）
- 確保補寫後 explanation 非空、非 AI 元評論殘留
- 補寫完成後執行 `node scripts/evaluate_question_quality.js` 對每個修改的 JSON 確認 CQI-P

本次任務不做：
- 修改 `question`、`options`、`answer_index`、`scenario`、`commonMisconception` 等其他欄位（除非發現明確錯誤並另報）
- 盲測驗證（另開 `question_verify` JOB）
- 修改任何規範文件

## 📖 執行步驟

1. 讀取 `question/README_出題與品管準則.md`（必讀）
2. 讀取 `logs/clean_explanation_2026-04-17T18-04-59.json`，過濾出 `status: "review_needed"` 的 83 題
3. 依 JSON 中的 `file` 路徑與 `q`（題目 id 或索引），打開對應 JSON 檔案
4. 逐題補寫 `explanation`：
   - 說明為何 `answer_index` 所指選項是正確答案
   - 與題目、scenario、課程內容一致
   - 純繁體中文，去除所有 AI 元評論語句
   - 長度建議 30–120 字
5. 每批次（同一 JSON 檔案）修改完後，執行：
   ```bash
   node scripts/evaluate_question_quality.js question/platform/<路徑>/<檔案>.json
   ```
   確認無新增品質問題
6. 產出 `jobs/JOB-192-Report.md`

## 📜 關鍵參考檔案

| 檔案路徑 | 用途 |
|:--|:--|
| `question/README_出題與品管準則.md` | 出題原則、explanation 規範 |
| `logs/clean_explanation_2026-04-17T18-04-59.json` | 83 題 review_needed 清單（來源） |
| `scripts/evaluate_question_quality.js` | CQI-P 驗證工具 |

## 📊 目標清單（34 個檔案，83 題）

輸入來源：`logs/clean_explanation_2026-04-17T18-04-59.json`  
篩選條件：`status === "review_needed"`  
總數：83 題，分佈於 34 個 JSON 檔案

執行時直接讀取 JSON 取得精確清單，無需手動列出。

## ✅ 啟動 Checklist (Pre-Flight)

- [ ] 已讀取 `question/README_出題與品管準則.md`
- [ ] 已確認 `logs/clean_explanation_2026-04-17T18-04-59.json` 存在且可讀
- [ ] **已確認執行模型**：[模型：___________]（⚠️ 啟動前必須詢問使用者並填入）
- [ ] **已確認使用金鑰**：[金鑰：___________]
- [ ] 83 題清單已從 log 讀取確認

## ✅ 驗收 Checklist (Acceptance)

- [ ] 83 題 explanation 全部非空 — 佐證：grep 確認
- [ ] 無 AI 元評論殘留語句（如「這點非常關鍵」「課綱要求」「呼應重點」等） — 佐證：逐題確認
- [ ] 每題 explanation 與 answer_index 指向之選項一致 — 佐證：人工抽驗 ≥ 20 題
- [ ] 34 個修改檔案 CQI-P 均無新增問題 — 佐證：evaluate_question_quality.js 輸出

## ✅ 成果 Checklist (Deliverables)

- [ ] `jobs/JOB-192-Report.md` 已產出，含異動檔案清單（34 個路徑）
- [ ] 進度總表 `docs/進度彙整_題庫研發與產出.md` 已更新（視需要）
- [ ] 已執行 `/pj_sync`

## ⏱️ 執行時間回報

| 子任務 / 階段 | 開始時間 | 結束時間 | 耗時（分鐘） | 備註 |
|:--|:--|:--|:--|:--|
| 讀取清單 + 批次補寫 | HH:mm | HH:mm | - | |
| CQI-P 驗證 | HH:mm | HH:mm | - | |
| **總計** | — | — | **-** | — |

## 真實回報本次對話的模型與花費
＄作業匯總：Token數:{真實Meta中數字} | 花費: ${換算台幣} | 使用模型: {真實Meta中的模型代碼} | 執行者: Cursor
