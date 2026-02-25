# JOB-010: 後台新增「題庫品質分析」管理功能

**派工日期：** 2026-02-24  
**目標：** 將已完成的 L1~L5 題庫品質評分引擎整合至後台管理介面，新增「📊 品質分析」分頁，讓管理員可一鍵執行全站重新掃描並檢視品質分佈。

---

## 🔍 任務詳情 (Job Details)

### 1. 新增後台分頁
*   **檔案**：`apps/v3_eidos/src/pages/AdminDashboard.tsx`
*   **修改內容**：
    - `AdminTab` type union 加入 `'quality'`。
    - `TABS` 陣列新增 `{ key: 'quality', label: '品質分析', icon: '📊' }`。
    - Tab content 區域新增 `{activeTab === 'quality' && <AdminQualityAnalyzer />}`。

### 2. 新增品質分析元件
*   **新增檔案**：`apps/v3_eidos/src/components/admin/AdminQualityAnalyzer.tsx`
*   **核心功能**：
    - 將 `scripts/evaluate_question_quality.js` 中的 `evaluateQuestion(q)` 純邏輯移植為前端版本（**不含 Node.js `fs` 模組**）。
    - 初始資料從 `libraryStats.json` 的 `publisherStats` 讀取，顯示品質分佈表。
    - 提供「🔄 重新分析」按鈕：fetch 各 `manifest.json` → fetch 各單元 JSON → 對每題呼叫 `evaluateQuestion` 計分 → 更新畫面。
*   **表格欄位**：科目、年級、出版社、題數、平均分、PIRLS 比例、品質等級 (L1~L5)。
*   **品質標籤色彩**（參考 `AboutView.tsx` 的 `getQualityColor`）：
    - L4+ / L5 → 紅色系
    - L3 → 橘色系
    - L2 → 藍色系
    - L1 → 灰色系

### 3. 關鍵參考檔案
| 檔案 | 用途 |
|------|------|
| `scripts/evaluate_question_quality.js` | 評分引擎核心（`evaluateQuestion` / `evaluateFile`） |
| `apps/v3_eidos/src/pages/AdminDashboard.tsx` | 後台主框架（目前 4 分頁） |
| `apps/v3_eidos/src/components/admin/AdminTestRunner.tsx` | 現有後台元件範例（UI 排版參考） |
| `apps/v3_eidos/src/data/libraryStats.json` | 品質數據來源 |
| `apps/v3_eidos/src/components/AboutView.tsx` | `getQualityColor` 標籤色彩邏輯 |

---

## 📋 執行規範 (Execution Protocol)
*   請依據 `.agent/workflows/webdev.md` (/webdev) 進行開發。
*   完成後請務必執行：
    1. **單元測試**：確認品質分析頁面正常顯示、重新分析功能正確、不影響既有 4 個分頁。
    2. **更新回報**：將測試結果與開發成果寫入 `jobs/JOB-010-Report.md`（與本派工單同目錄）。

---

## ✅ 驗證基準 (DoD)
- [ ] `/admin/quality` 能看到品質分佈表格
- [ ] 點擊「重新分析」後，品質等級被正確計算並更新畫面
- [ ] 品質標籤色彩與前台 `AboutView` 一致
- [ ] 不影響現有 4 個後台分頁功能
- [ ] TypeScript 無型別錯誤
