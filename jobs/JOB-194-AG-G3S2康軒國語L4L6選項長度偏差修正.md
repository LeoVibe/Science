*Created by Claude Code at 2026-04-18*

`last_updated`: 2026-04-18
`updated_by`: Claude Code (claude-sonnet-4-6)

# JOB-194 — G3 S2 康軒國語 L4/L6 選項長度偏差修正

**`job_type`**: `question_prod`
**`executor`**: Cursor

## 📌 任務背景

L4《工匠之祖》與 L6《神奇密碼》均被 `evaluate_question_quality.js` 判定為 `QL1 (BIAS)`（選項長度偏差過大），導致整包康軒國語被降評。

**偏差來源**：錯誤選項普遍使用極短的否定句，正解則是完整說明句，造成學生可靠「選最長的」猜題。

| 檔案 | 課名 | 正解最長比 | 門檻 |
|:--|:--|:--|:--|
| L4 | 《工匠之祖》 | 38/49 = 77.6% | >75% |
| L6 | 《神奇密碼》 | 23/29 = 79.3% | >75% |

## 🎯 任務目標

修正 L4、L6 的選項長度偏差，使 `biasWarning: null`，不改動 `answer_index`、`question`、`explanation`。

## 🚧 任務邊界

只做：
- 修改 `question/platform/G3/Chinese/S2/KangHsuan/G3_S2_CHI_KANGHSUAN_L4.json`
- 修改 `question/platform/G3/Chinese/S2/KangHsuan/G3_S2_CHI_KANGHSUAN_L6.json`
- 僅修改各題的 **錯誤選項（非 `answer_index` 的選項）文字**，使長度與正解接近

不做：
- 修改 `answer_index`、`question`、`explanation`、`scenario`
- 修改其他課次

## 📖 執行策略

**目標**：使每題正解最長比例降至 ≤ 75%（即 L4 需降至 ≤ 36/49，L6 需降至 ≤ 21/29）。

**方法**：對「正解明顯最長」的題目（差距 > 1.5 倍），將錯誤選項改寫為長度相近的合理誘答。錯誤選項必須：
- 仍為合理但錯誤的答案（不可以是明顯胡說）
- 長度與正解相差在 1.3 倍以內
- 繁體中文，符合三年級語境

## 📖 執行步驟

1. 讀取 `question/README_出題與品管準則.md`
2. 逐題檢查 L4 與 L6 中「正解最長」的題目，依上述策略改寫錯誤選項
3. 完成後執行驗證：
   ```bash
   node scripts/evaluate_question_quality.js question/platform/G3/Chinese/S2/KangHsuan/G3_S2_CHI_KANGHSUAN_L4.json
   node scripts/evaluate_question_quality.js question/platform/G3/Chinese/S2/KangHsuan/G3_S2_CHI_KANGHSUAN_L6.json
   ```
   確認兩檔 `biasWarning: null`
4. 執行 `node scripts/generate_library_stats.js` 更新 libraryStats.json
5. 產出 `jobs/JOB-194-Report.md`

## 📜 關鍵參考檔案

| 檔案 | 用途 |
|:--|:--|
| `question/README_出題與品管準則.md` | 出題原則 |
| `question/platform/G3/Chinese/S2/KangHsuan/G3_S2_CHI_KANGHSUAN_L4.json` | 待修 L4 |
| `question/platform/G3/Chinese/S2/KangHsuan/G3_S2_CHI_KANGHSUAN_L6.json` | 待修 L6 |

## ✅ 啟動 Checklist

- [ ] 已讀取 `question/README_出題與品管準則.md`
- [ ] **已確認執行模型**：[模型：___________]
- [ ] **已確認使用金鑰**：[金鑰：___________]

## ✅ 驗收 Checklist

- [ ] L4 `biasWarning: null` — 佐證：evaluate 輸出
- [ ] L6 `biasWarning: null` — 佐證：evaluate 輸出
- [ ] L4/L6 `answer_index` 均未改動
- [ ] 兩檔 quality ≥ QL3

## ✅ 成果 Checklist

- [ ] `jobs/JOB-194-Report.md` 已產出
- [ ] `node scripts/generate_library_stats.js` 已重跑
- [ ] 已執行 `/pj_sync`

## 真實回報本次對話的模型與花費
＄作業匯總：Token數:{真實Meta中數字} | 花費: ${換算台幣} | 使用模型: {真實Meta中的模型代碼} | 執行者: Cursor
