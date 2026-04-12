# JOB-118-USER-建立全域模型計價與物理防呆腳本

`last_updated`: 2026-03-26 19:20
`updated_by`: Antigravity (Gemini-3.1-Pro)

## 📋 任務描述
為了解決 Agent 在回報任務花費時頻繁產生的「模型名稱與 Token 數幻覺」，開發一套實體隔離的物理防呆機制。

## 🎯 執行目標
1. 建立外部定價資料庫 `0_AI_Project/Model_Price.json`，支援 2026 各大廠主流模型。
2. 開發轉譯腳本 `eidosProject/scripts/generate_meta_footer.js`，負責由 JSON 查表產出標準結算字串。
3. 將此流程寫入 `README_通用作業準則.md` 作為全域行政律令。

## ✅ 成果 Checklist (Deliverables)
- [x] 建立 `0_AI_Project/Model_Price.json`
- [x] 建立 `eidosProject/scripts/generate_meta_footer.js`
- [x] 更新 `docs/README_通用作業準則.md` 第六章
- [x] 通過 M37, M47, M48, M26 的 alias 映射測試
- [x] 已執行 `/pj_sync` 全域同步

## 💲作業彙總
💲作業匯總 ：[JOB-118] Token數:125000 | 花費(估): $8.13 | 使用模型: Gemini 3.1 Pro(gemini-3.1-pro-preview) | 執行者: Antigravity