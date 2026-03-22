# JOB-089：後台「使用者分析」高活躍裝置表格 UX（標籤、錯誤比例、裝置註記）

**狀態**：🟢 DONE  
**優先級**：中  
**最後更新**：2026-02-27

## 目標

1. **錯題／成果**：顯示活動日誌彙整之**答題錯誤比例**（`answer_question` + `details.correct`），並保留錯題統計連結與圖示。
2. **欄位拆分**：**活躍日數**、**年級／科目** 分欄；整列以 **Badge／標籤** 提升可讀性。
3. **裝置 ID**：表格僅顯示 UUID **第一節 8 碼**；完整 ID 以 **hover** 或 **i** 圖示檢視。
4. **裝置註記**：與「使用者統計」共用本機 **localStorage** 註記名稱，於使用者分析列表顯示。

## 實作範圍

- `scripts/workers/api/src/userAnalysis.ts`：裝置聚合新增答題錯誤統計欄位。
- `apps/v3_eidos/src/utils/adminDeviceLabels.ts`：註記讀寫與 hook。
- `apps/v3_eidos/src/components/admin/AdminUserAnalysis.tsx`：表格／標籤／Tooltip／Popover／註記 Dialog。
- `apps/v3_eidos/src/components/admin/AdminUserStats.tsx`：裝置註記管理區塊。

## 驗收

- [x] 後台「使用者分析」列表欄位清晰、無硬編碼色碼。
- [x] API 回傳 `answerWrongRatio` 等欄位（需部署 Worker）；舊欄位缺漏時前端顯示「—」。
- [x] 本機註記在使用者統計與使用者分析一致顯示。
