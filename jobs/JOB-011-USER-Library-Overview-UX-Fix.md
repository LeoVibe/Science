# JOB-011-DEV-USER-Library-Overview-UX-Fix09  
**目標：** 修正「題庫總覽」頁面的三個 UX 問題：點擊題庫數字後的導覽/返回異常、上下學期分界不清、未同步後台啟用狀態。

---

## 🔍 任務詳情 (Job Details)

### 1. 導覽與返回路徑修正
*   **目前問題**：從「題庫總覽」點擊某個出版社的「124 題 QL4」連結後，轉場不順暢且返回時無法正確回到題庫總覽分頁。
*   **預期行為**：點擊後快速切換到該科目的 ReviewView，返回時應回到「About → 題庫總覽」分頁。
*   **實作參考**：
    - 檔案：`apps/v3_eidos/src/components/AboutView.tsx` (第 138-149 行)
    - 檔案：`apps/v3_eidos/src/pages/Index.tsx` (ReviewView 的 `onBack` prop + `ensureQuestionsLoaded`)
    - 點擊連結時應先觸發 `ensureQuestionsLoaded`（避免空白畫面），再導向 review。
    - 返回路徑須包含 `subTab=library`，使用 `buildPath(grade, subject, semester, publisher, 'about', 'library')`。

### 2. 學期分界改為年級＋學期 Block
*   **目前問題**：上學期與下學期的科目混在同一張表格中，僅以科目名稱旁的「上/下」小字區分，視覺上分界不清。
*   **預期行為**：每個「年級＋學期」組合成為獨立的 Block，例如「G3 三年級上學期」一個區塊、「G3 三年級下學期」一個區塊。
*   **實作參考**：
    - 檔案：`apps/v3_eidos/src/components/AboutView.tsx` (第 64-160 行)
    - 目前外層迴圈是 `grades.map(grade => ...)`，內層是 `[S1, S2].forEach(sem => ...)`。
    - 改為：外層先跑 `grade`，內層再跑 `semester`，每個 `grade + semester` 產生一個獨立的 `<div>` block。
    - Block 標題格式：`G3 三年級 上學期` / `G3 三年級 下學期`。
    - 如果該年級+學期完全沒有資料，則不顯示該 block。

### 3. 同步後台啟用狀態
*   **目前問題**：後台 `AdminLibraryManager` 可設定各科目/出版社的啟用狀態（`EIDOS_LIBRARY_CONFIG`），但題庫總覽頁面顯示的數據並未完全反映這些設定（例如後台關閉的科目仍然出現在總覽中）。
*   **預期行為**：題庫總覽應嚴格遵守 `EIDOS_LIBRARY_CONFIG` 的開關設定。後台關閉的年級、學期、科目或出版社，在總覽中不應顯示。
*   **實作參考**：
    - 檔案：`apps/v3_eidos/src/components/AboutView.tsx`
    - 檔案：`apps/v3_eidos/src/components/admin/AdminLibraryManager.tsx` (理解設定結構)
    - 檔案：`apps/v3_eidos/src/data/config.ts` (EIDOS_LIBRARY_CONFIG 定義)
    - 目前程式碼在第 68 行已有 `gConfig?.enabled === false` 的檢查，但需確認 semester / subject / publisher 三層過濾是否都正確生效。

---

## 📋 執行規範 (Execution Protocol)
*   請依據 `.agent/workflows/webdev.md` (/webdev) 進行開發。
*   完成後請務必執行：
    1. **單元測試**：確認三項修正均正常運作，不影響其他分頁。
    2. **更新回報**：將測試結果與開發成果寫入 `jobs/JOB-011-Report.md`（與本派工單同目錄）。

---

## ✅ 驗證基準 (DoD)
- [ ] 點擊題庫總覽中的數字連結，能快速且正確地進入對應的 ReviewView
- [ ] 從 ReviewView 點擊「← 返回」，正確回到「About → 題庫總覽」分頁
- [ ] 每個年級+學期為獨立 Block，標題清楚顯示（如「G3 三年級 上學期」）
- [ ] 後台關閉的年級/學期/科目/出版社，在題庫總覽中不顯示
- [ ] 不影響其他分頁（About / Features / Changelog）的功能
- [ ] TypeScript 無型別錯誤
