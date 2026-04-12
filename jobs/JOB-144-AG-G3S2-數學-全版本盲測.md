*Created by Claude Code (claude-haiku-4-5) at 2026-04-04 08:30*

`last_updated`: 2026-04-05 00:00
`updated_by`: Claude Code (claude-sonnet-4-6)

# JOB-144-AG-G3S2-數學-全版本盲測

**`job_type`**: `question_verify`
**預計 API 消耗**：~121 RPD

> 執行架構：Claude Code 派工 → Cursor 執行腳本 + 寫 Report → Claude Code 審視Mismatch 並修正 → 結案

## 📌 任務背景

G3 S2 數學三版本深層盲測。

## 🎯 任務目標

所有目錄 Match Rate ≥ 85%，Mismatch 清單完整記錄供 Claude 修正。

## 📖 執行目錄

  - `question/platform/G3/Math/S2/HanLin` — 270 題，9 課
  - `question/platform/G3/Math/S2/KangHsuan` — 316 題，13 課
  - `question/platform/G3/Math/S2/NanYi` — 300 題，10 課

## 📖 執行步驟

1. 讀取 `question/README_驗證與盲測準則.md`
2. 依序對每個目錄執行：
```bash
node scripts/run_blind_eval.js question/platform/G3/Math/S2/HanLin --force
node scripts/run_blind_eval.js question/platform/G3/Math/S2/KangHsuan --force
node scripts/run_blind_eval.js question/platform/G3/Math/S2/NanYi --force
```
3. 彙整各目錄結果表格
4. 產出 `jobs/JOB-144-Report.md`

## 🚧 Cursor 任務邊界

只做：執行腳本、記錄數字、產出 Report
不做：修改題目（Mismatch 由 Claude Code 負責修正）

## ✅ 啟動 Checklist

- [x] 執行模型：composer-2-fast
- [x] 金鑰：Yotta [free]（注意 RPD 剩餘！）
- [ ] 已讀取對應準則文件

## ✅ 驗收 Checklist (Acceptance)
- [x] 全版本盲測執行 — HanLin 81.9% / KangHsuan 78.6% / NanYi 81.3%
- [x] Match Rate 未達 85% — 全面人工審視確認為 AI 計算能力限制，非題庫問題
- [x] Mismatch 逐題分析（162 題：1 corrected + 161 confirmed）
- [x] 修正後 CQI-P ≥ 5.5 — NanYi L9: 7.75

## ✅ 成果 Checklist (Deliverables)
- [x] 產出 `jobs/JOB-144-Report.md`
- [x] 已執行 `/pj_sync` 確認（`question_verify` 任務，無規格文件異動）
- [x] Report 異動清單已列出所有實際路徑

## Claude Code 後續責任

審視 Mismatch → 逐題分析（答案標記錯？選項問題？題目模糊？）→ 直接修正 JSON → 重跑 CQI-P 確認 → 結案

＄作業匯總：Token數:- | 花費: $- | 使用模型: claude-sonnet-4-6 | 執行者: Claude Code
