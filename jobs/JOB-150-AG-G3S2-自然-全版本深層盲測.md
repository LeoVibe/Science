*Created by Claude Code (claude-sonnet-4-6) at 2026-04-05 00:00*

`last_updated`: 2026-04-05 00:00
`updated_by`: Claude Code (claude-sonnet-4-6)

# JOB-150-AG-G3S2-自然-全版本深層盲測

**`job_type`**: `question_verify`
**`executor`**: Claude Code（直接執行腳本）

## 📌 任務背景

G3 S2 自然三版本（翰林／康軒／南一）先前僅做靜態 CQI-P 評估（JOB-146），
從未執行深層 LLM 盲測（`run_blind_eval.js`）。本 JOB 補做正式深層盲測。

## 🎯 任務目標

- 所有版本 Match Rate ≥ 85%
- Mismatch 題目逐題審視，answer_index 錯誤者修正

## 📖 執行目錄

- `question/platform/G3/Science/S2/HanLin` — 120 題（5 課）
- `question/platform/G3/Science/S2/KangHsuan` — 120 題（5 課）
- `question/platform/G3/Science/S2/NanYi` — 150 題（5 課）

## 🚧 任務邊界

本次只做：執行腳本、審視 Mismatch、修正 answer_index 錯誤、撰寫 Report
不做：重新出題、修改 R3/R4 素材、修改規範文件

## ✅ 啟動 Checklist (Pre-Flight)
- [x] 草稿已在對話中產出
- [x] 使用者已明確核准
- [x] 執行模型：Claude Code (claude-sonnet-4-6)
- [x] 盲測金鑰：Yotta（Gemini-3.1-Flash-Lite）

## ✅ 驗收 Checklist (Acceptance)
- [x] 全版本 Match Rate ≥ 85% — HanLin 99.2% / KangHsuan 98.3% / NanYi 100.0%
- [x] §2.5 超門檻課次已人工審視（無超門檻課次，≤2 Mismatch/檔）
- [x] 修正後 CQI-P ≥ 5.5 — KangHsuan L2: 7.83 / HanLin L3: 8.40

## ✅ 成果 Checklist (Deliverables)
- [x] 產出 JOB-150-Report.md
- [x] 已執行 `/pj_sync` 確認（question_verify 任務，無規格文件異動）
- [x] Report 異動清單已列出所有實際路徑
