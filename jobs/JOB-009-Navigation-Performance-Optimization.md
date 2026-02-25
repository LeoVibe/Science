# JOB-009: 分科題庫導覽邏輯修正與效能優化

**最後修訂時間：** 2026-02-24
**目標：** 修正「分科題庫」返回按鈕路徑、優化大題庫載入體驗，並清理先前實作留下的型別警告。

---

## 🔍 任務詳情 (Job Details)

### 1. 導覽回跳邏輯修正
*   **目前問題**：在「分科題庫」點擊「← 返回」會直接回到首頁。
*   **預期行為**：應回跳至題庫總覽頁面。
*   **實作參考**：
    - 檔案：`apps/v3_eidos/src/pages/Index.tsx`
    - 修改 `ReviewView` 的 `onBack` 回調。
    - 使用 `buildPath` 工具函式導向 `/g{grade}/{subject}/s{semester}/{publisher}/about/library`。

### 2. 效能與載入體驗優化
*   **重點科目**：三下社會 (NanYi)，共 60 題。
*   **優化目標**：
    - 確保 `questionLoader.ts` 的並行加載（Parallel Fetch）邏輯穩定。
    - 檢查是否有重複渲染或重複發送 Fetch 的情況。
*   **測項**：進入「分科題庫」時，UI 應有 Loading 提示，載入完成後應能順暢切換單元。

### 3. TypeScript 型別維護
*   **修正對象**：`apps/v3_eidos/src/data/questionLoader.ts`。
*   **修正內容**：清理之前優化時留下的 `any` 型別或 Lint 錯誤，確保符合專案嚴格型別要求。

---

## 📋 執行規範 (Execution Protocol)
*   請依據 `.agent/workflows/webdev.md` (/webdev) 進行開發。
*   完成後請務必執行：
    1. **單元測試**：確認返回路徑正確、大題庫載入無誤。
    2. **更新回報**：將測試結果與開發成果寫入 `jobs/JOB-009-Report.md`（與本派工單同目錄）。
    3. **更新看板**：將 `jobs/README.md` 中的狀態改為 `🟢 DONE`。

---

## 💬 提供給 Cursor 的指令 (Prompt)
> 請使用者將以下內容貼給 Cursor 執行：

Cursor 你好，

**今日任務：優化分科題庫導覽路徑與 60 題加載效能。**

請詳細閱讀並依據 `jobs/JOB-009-Navigation-Performance-Optimization.md` 的規格進行開發，協作規範請遵循 `.agent/workflows/webdev.md`。完工後請執行單元測試，並將成果與測試紀錄寫入 `jobs/JOB-009-Report.md`，交回給 AG 進行最終測試。

派工單已準備好，請開始動工！
