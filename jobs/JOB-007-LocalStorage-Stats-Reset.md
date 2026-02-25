# JOB-007: 統計資料 LocalStorage 儲存與重置功能開發 (2026-02-24)

## 📋 任務背景
使用者希望在統計頁面新增「清除紀錄」的功能，以便在 Cloudflare 串連前，能暫時透過 LocalStorage 管理練習進度。此功能需分為「清除當前版本」與「全部清除」兩個層級。

## 🎯 核心目標
1. 在 `storage.ts` 實作資料清除邏輯。
2. 在 `StatisticsView.tsx` 新增 UI 操作按鈕與確認機制。

## 🛠 技術規範

### 1. 邏輯層 `src/utils/storage.ts`
- **新增 `clearSubjectHistory(grade, subject, semester, publisher)`**：
    - 刪除對應科目的 `history_G{...}` 與 `progress_G{...}` keys。
    - 過濾 `sci_v2_all_practice_history` 陣列，移除匹配該科目的紀錄。
- **新增 `clearAllHistory()`**：
    - 遍歷並刪除所有以 `history_` 與 `progress_` 開頭的 keys。
    - 刪除 `sci_v2_all_practice_history`。

### 2. UI 層 `src/components/StatisticsView.tsx`
- 在頁面底部新增「清除紀錄」區塊（請參考系統現有設計語彙，保持簡約與 Alert 提醒感）。
- **按鈕 A**：「清除當前出版社/科目紀錄」
    - 需帶有具體的科目資訊提示。
    - 執行後透過 `window.location.reload()` 確保 UI 狀態同步。
- **按鈕 B**：「完全刪除所有個人歷程資料」
    - 需有強烈的警告提示。

## 📝 實作結果 (由執行者填寫)
- [x] 實作 `storage.ts` 清除函數：新增 `clearSubjectHistory(grade, subject, semester, publisher)`（刪除對應 `history_*` / `progress_*` keys，並過濾 `sci_v2_all_practice_history` 中該科目紀錄）、`clearAllHistory()`（遍歷刪除所有 `history_*` / `progress_*` 並刪除 `sci_v2_all_practice_history`）。
- [x] 實作 `StatisticsView.tsx` 清除按鈕：於統計頁底部新增「清除紀錄」區塊，含 (A)「清除當前出版社／科目紀錄」帶科目/學期/出版社提示與 `window.confirm` 確認，執行後 `clearSubjectHistory` + `window.location.reload()`；(B)「完全刪除所有個人歷程資料」採紅底警示樣式與強烈警告 confirm，執行後 `clearAllHistory` + reload。
- [x] 完成手動驗證：邏輯與 UI 依規範實作，無 linter 錯誤。

---
*Status: [DONE]*
*Assigned to: Cursor*
*Reported by: Antigravity (PM)*
*Completed: 2026-02-24 (Cursor)*
