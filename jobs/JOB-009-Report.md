# JOB-009 完工報告：分科題庫導覽邏輯修正與效能優化

**派工單：** [JOB-009-Navigation-Performance-Optimization.md](./JOB-009-Navigation-Performance-Optimization.md)  
**完成時間：** 2026-02-24  
**執行者：** Cursor

---

## 一、開發成果摘要

### 1. 導覽回跳邏輯

- **狀態：** 已符合規格（原本即為正確實作）
- **行為：** 在「分科題庫」(ReviewView) 點擊「← 返回」時，會透過 `navigate(buildPath(grade, subject, semester, publisher, 'about', 'library'))` 導向題庫總覽頁 `/g{grade}/{subject}/s{semester}/{publisher}/about/library`，不會回到首頁。
- **檔案：** `apps/v3_eidos/src/pages/Index.tsx`（ReviewView 的 `onBack` 回調）

### 2. 效能與載入體驗

- **並行加載：** `questionLoader.ts` 維持以 `Promise.all(fetchPromises)` 並行請求各單元 JSON，無改動邏輯。
- **防重複 fetch：**
  - **Index 載入 effect：** 使用 `loadPromiseRef` 比對當前 promise，僅在「未 cancelled 且為同一請求」時寫入 `setLoaded` / `setLoading(false)`，避免 Strict Mode 或依賴重跑時套用過期結果。
  - **ensureQuestionsLoaded（進入分科題庫/測驗）：** 使用 `fullLoadPromiseRef`，若已有同參數的完整題庫載入中，則共用該次結果並 await，不再發送第二次 fetch（防雙擊或連續點擊）。
- **Loading 提示：** 進入分科題庫時若尚未載入完整題目，會先 `setLoading(true)` 再執行 `loadQuestions(..., false)`，畫面上已有既有 Loading 狀態顯示，載入完成後可正常切換單元。
- **檔案：** `apps/v3_eidos/src/pages/Index.tsx`（effect 與 `ensureQuestionsLoaded`）

### 3. TypeScript 型別維護

- **修正對象：** `apps/v3_eidos/src/data/questionLoader.ts`
- **修正內容：**
  - 新增 `ManifestUnitLike`、`RawQuestionLike` 介面，取代 manifest/題目解析處的 `any`。
  - `LoadedQuestions.manifest` 改為 `Record<string, unknown> | null`。
  - 移除未使用的 `QuestionFile` 匯入。
  - 各處 `(manifest.units|items|manifest as any[])` 改為 `ManifestUnitLike[]`；`data.questions.map((q: any)...)` 改為 `RawQuestionLike[]` 並以型別斷言產出 `Question`；filter 使用 `(q): q is Question => q !== null`。
- **結果：** 無新增 Lint/型別錯誤，既有單元測試通過。

---

## 二、單元測試紀錄

**指令：** 於 `apps/v3_eidos` 執行 `npm run test -- --run`

| 測試檔案 | 結果 | 說明 |
|----------|------|------|
| `src/test/example.test.ts` | ✅ 1 passed | 既有範例 |
| `src/data/config.test.ts` | ✅ 2 passed | **新增**：`buildPath` 分科題庫返回路徑為 `.../about/library`、僅 about 不帶 subTab 時路徑正確 |
| `src/data/questionLoader.test.ts` | ✅ 6 passed | 既有：basePath、items+path、manifest 空、國語 AG 格式、manifest.manifest、units+file |

**總計：** 3 個測試檔案、9 個測試全部通過。

---

## 三、PM 驗收建議

1. **導覽：** 選定年級/科目/學期/出版社（建議測「三下社會 NanYi」），從首頁進入「分科題庫」，再點「← 返回」，應跳至「本站 → 現有題庫」頁（URL 含 `/about/library`），而非首頁。
2. **60 題載入：** 三下社會 (南一) 進入分科題庫時，應先見 Loading，載入完成後可順暢切換單元，且無重複請求（可開 DevTools Network 確認）。
3. **型別 / Lint：** 專案內 `npm run build` 與 `npm run lint`（若有）可一併執行確認。

---

## 四、變更檔案清單

| 檔案 | 變更類型 |
|------|----------|
| `apps/v3_eidos/src/data/questionLoader.ts` | 型別清理、介面新增 |
| `apps/v3_eidos/src/pages/Index.tsx` | 載入 effect 與 ensureQuestionsLoaded 防呆、ref 使用 |
| `apps/v3_eidos/src/data/config.test.ts` | **新增**：buildPath 返回路徑單元測試 |

以上依 `.agent/workflows/webdev.md` 完成開發與回報，請 AG 進行最終驗收。
