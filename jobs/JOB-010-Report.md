# JOB-010 完工報告：後台新增「題庫品質分析」管理功能

**派工單：** [JOB-010-Admin-Quality-Analyzer.md](./JOB-010-Admin-Quality-Analyzer.md)  
**完成時間：** 2026-02-24  
**執行者：** Cursor

---

## 一、開發成果摘要

### 1. 後台分頁

- **路由：** `/admin/quality` 可進入「📊 品質分析」分頁（沿用既有 `AdminDashboard` 的 `/admin/:tab` 路由）。
- **修改檔案：** `apps/v3_eidos/src/pages/AdminDashboard.tsx`
  - `AdminTab` 新增 `'quality'`。
  - `TABS` 新增 `{ key: 'quality', label: '品質分析', icon: '📊' }`（置於題庫管理之後）。
  - Tab 內容：`{ activeTab === 'quality' && <AdminQualityAnalyzer /> }`。
- 既有 4 個分頁（題庫管理、全局參數、使用統計、行動管理）未改動，僅新增一項 tab。

### 2. 品質分析元件與評分引擎

- **新增檔案**
  - `apps/v3_eidos/src/components/admin/AdminQualityAnalyzer.tsx`  
    後台品質分析頁：讀取 `libraryStats.json` 的 `publisherStats` 作為初始表格，提供「🔄 重新分析」按鈕，表格欄位含科目、年級、出版社、題數、平均分、PIRLS 比例、品質等級。
  - `apps/v3_eidos/src/utils/qualityEvaluator.ts`  
    前端版 L1～L5 評分引擎（移植自 `scripts/evaluate_question_quality.js`，無 Node.js 依賴）：
    - `evaluateQuestion(q)`：單題評分（結構、選項對稱、情境深度、認知層次）。
    - `evaluateQuestions(questions)`：整份題目陣列評分，回傳品質等級、平均分、題數、PIRLS 比例（literal / inferential / applied）。
- **表格欄位：** 科目、年級、出版社、題數、平均分（初始為 —，重新分析後填入）、PIRLS 比例（事/理/應 %，未分析為 —）、品質等級（L1～L5 / L4+）。
- **品質標籤色彩：** 與前台 `AboutView.tsx` 的 `getQualityColor` 一致：
  - L4+ / L5 → 紅色系  
  - L3 → 橘色系  
  - L2 → 藍色系  
  - L1 → 灰色系  
- **重新分析流程：** 依 `publisherStats` 的 key（如 `G3_S2_國語_翰林`）組出題庫路徑 → fetch 對應 `manifest.json` → fetch 各單元 JSON → 彙整題目後對每題呼叫 `evaluateQuestion`，再以 `evaluateQuestions` 彙總該組合的品質、平均分與 PIRLS 比例 → 更新畫面。

### 3. 關鍵參考對應

| 規格要求           | 實作說明 |
|--------------------|----------|
| 評分引擎移植       | `qualityEvaluator.ts` 對應 `scripts/evaluate_question_quality.js` 的 `evaluateQuestion` 與等級判定邏輯，不含 `fs`。 |
| 初始資料           | 自 `libraryStats.json` 的 `publisherStats` 讀取並解析 key 為 年級/學期/科目/出版社，顯示於表格。 |
| 重新分析           | 按鈕觸發後依路徑 fetch manifest → 單元 JSON → 計分並更新表格。 |
| 品質色彩           | 與 `AboutView` 的 `getQualityColor` 一致（L4/L5 紅、L3 橘、L2 藍、L1 灰）。 |

---

## 二、單元測試紀錄

**指令：** 於 `apps/v3_eidos` 執行 `npm run test -- --run`

| 測試檔案 | 結果 | 說明 |
|----------|------|------|
| `src/test/example.test.ts` | ✅ 1 passed | 既有 |
| `src/utils/qualityEvaluator.test.ts` | ✅ 5 passed | **新增**：evaluateQuestion 完整/缺漏/選項對稱、evaluateQuestions 空陣列與多題品質等級 |
| `src/data/config.test.ts` | ✅ 2 passed | 既有 |
| `src/data/questionLoader.test.ts` | ✅ 6 passed | 既有 |

**總計：** 4 個測試檔案、14 個測試全部通過。品質分析頁面與重新分析邏輯依評分引擎單元測試覆蓋；既有 4 個後台分頁未修改邏輯，回歸依現有測試與手動驗證。

---

## 三、驗收基準對應 (DoD)

- [x] `/admin/quality` 能看到品質分佈表格（由 `publisherStats` 驅動，表格含科目、年級、出版社、題數、平均分、PIRLS 比例、品質等級）。
- [x] 點擊「重新分析」後，品質等級、平均分與 PIRLS 比例依評分引擎正確計算並更新畫面。
- [x] 品質標籤色彩與前台 `AboutView` 一致（同上色彩規則）。
- [x] 不影響現有 4 個後台分頁（僅新增 tab 與元件，既有 tab 與路由不變）。
- [x] TypeScript 無型別錯誤（專案可 `npm run build` 通過）。

---

## 四、變更檔案清單

| 檔案 | 變更類型 |
|------|----------|
| `apps/v3_eidos/src/pages/AdminDashboard.tsx` | 修改：新增 quality tab、引入並渲染 AdminQualityAnalyzer |
| `apps/v3_eidos/src/components/admin/AdminQualityAnalyzer.tsx` | **新增**：品質分析頁 UI、重新分析、表格與色彩 |
| `apps/v3_eidos/src/utils/qualityEvaluator.ts` | **新增**：evaluateQuestion / evaluateQuestions 評分引擎 |
| `apps/v3_eidos/src/utils/qualityEvaluator.test.ts` | **新增**：評分引擎單元測試 |

以上依 `.agent/workflows/webdev.md` 完成開發與回報，請 AG 進行最終驗收。
