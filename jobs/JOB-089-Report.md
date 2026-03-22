# JOB-089 完工報告

**日期**：2026-02-27

## 完成項目

1. **Worker**（`scripts/workers/api/src/userAnalysis.ts`）
   - `UserAnalysisDevice` 新增：`answerQuestionTotal`、`answerQuestionWrong`、`answerWrongRatio`。
   - 由 `answer_question` 且 `details.correct` 為布林之紀錄計算錯誤比例。

2. **前端**
   - 新增 `apps/v3_eidos/src/utils/adminDeviceLabels.ts`（`localStorage` key：`eidos_admin_device_labels`）。
   - `AdminUserAnalysis`：六欄標籤式排版、短 ID + Tooltip／Popover、錯誤比例 Badge、錯題統計連結（BarChart3 + ExternalLink）、鉛筆編輯註記 Dialog。
   - `AdminUserStats`：裝置顯示名稱（本機）新增／列表／刪除。

3. **建置**：`apps/v3_eidos` 執行 `npm run build` 通過。

## 部署提醒

- 需 **重新部署 Worker** 後，錯誤比例與答題筆數才會自 API 回傳；未部署前前端仍會顯示「—」。
