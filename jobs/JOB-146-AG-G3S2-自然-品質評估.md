*Created by Claude Code (claude-haiku-4-5) at 2026-04-04 08:30*

`last_updated`: 2026-04-04 08:30
`updated_by`: Claude Code (claude-haiku-4-5)

# JOB-146-AG-G3S2-自然-品質評估

**`job_type`**: `question_prod`
**預計 API 消耗**：0 RPD（本地計算）

> 執行架構：Claude Code 派工 → Cursor 執行腳本 + 寫 Report → Claude Code 審視CQI-P 並決策 → 結案

## 📌 任務背景

G3 S2 自然三版本品質評估（無 R4 素材，先跑 CQI-P 確認品質）。

## 🎯 任務目標

所有目錄 CQI-P 平均 ≥ 5.5，確認題庫基礎品質達標。

## 📖 執行目錄

  - `question/platform/G3/Science/S2/HanLin` — 120 題，4 課
  - `question/platform/G3/Science/S2/KangHsuan` — 120 題，4 課
  - `question/platform/G3/Science/S2/NanYi` — 150 題，4 課

## 📖 執行步驟

1. 讀取 `question/README_出題與品管準則.md`
2. 依序對每個目錄執行：
```bash
node scripts/evaluate_question_quality.js question/platform/G3/Science/S2/HanLin 
node scripts/evaluate_question_quality.js question/platform/G3/Science/S2/KangHsuan 
node scripts/evaluate_question_quality.js question/platform/G3/Science/S2/NanYi 
```
3. 彙整各目錄結果表格
4. 產出 `jobs/JOB-146-Report.md`

## 🚧 Cursor 任務邊界

只做：執行腳本、記錄數字、產出 Report
不做：修改題目（CQI-P 低於門檻的處理由 Claude Code 決定）

## ✅ 啟動 Checklist

- [x] 執行模型：composer-2-fast
- [x] 金鑰：無需 API（本地計算）
- [ ] 已讀取對應準則文件

## ✅ 成果 Checklist

- [ ] 產出 `jobs/JOB-146-Report.md`（Cursor 撰寫）
- [ ] Report 含各目錄CQI-P 分數表（各課平均、最低分）
- [ ] [x] /dosync 確認：`question_prod` 任務，無規格文件異動

## Claude Code 後續責任

審視 CQI-P 結果 → 決定是否需補題或修正 → 確認後結案

＄作業匯總：Token數:{真實數字} | 花費:\${換算台幣} | 使用模型:{真實模型} | 執行者:Cursor
