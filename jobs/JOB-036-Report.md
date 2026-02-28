 # JOB-036 完工報告：測驗 UI 體驗優化

*Completed by Cursor at 2026-02-28*

## 開發成果摘要

- **測驗按鈕字體放大**：`MainMenu.tsx` 中「基本挑戰」「進階挑戰」標題由 `text-sm` 改為 `text-base`，副標與題數 pill 改為 `text-xs`，按鈕 `py-2.5` 改為 `py-3`，並加上 `min-w-0`、`flex-wrap`、`shrink-0` 避免 RWD 溢出。
- **進階挑戰題數連動**：`storage.ts` 新增 `maxQuizQuestions` 於 `UserProfile`、`getMaxQuizQuestions()`；`Index.tsx` 從 profile 讀寫 `maxQuizQuestions` 並傳入 `MainMenu`；`MainMenu` 使用 `maxQuizQuestions`（夾在 10～50）作為進階挑戰題數並傳入 `onStartQuiz('進階挑戰', effectiveMax)`。
- **總題數動態顯示**：`MainMenu` 新增 props `totalQuestionCount`、`maxQuizQuestions`；在「綜合練習」標題旁顯示「（總計 X 題）」；`Index` 傳入 `loaded.questions.length` 與 `getMaxQuizQuestions()`。

## 變更檔案清單

| 檔案 | 變更類型 |
|------|----------|
| `apps/v3_eidos/src/utils/storage.ts` | 修改：UserProfile 新增 maxQuizQuestions、getMaxQuizQuestions() |
| `apps/v3_eidos/src/pages/Index.tsx` | 修改：handleProfileSave/ProfileSetup initial 含 maxQuizQuestions；MainMenu 傳入 totalQuestionCount、maxQuizQuestions |
| `apps/v3_eidos/src/components/MainMenu.tsx` | 修改：props、按鈕字級與佈局、總題數顯示、進階題數動態 |

## 驗證基準 (DoD) 對應

- [x] 測驗按鈕字體明顯變大，且佈局未跑版。
- [x] 修改「學習與使用設定」中的進階題數後，首頁按鈕的題數應同步更新。
- [x] 首頁應顯示「總計 X 題」的資訊。
- [x] 已產出 `JOB-036-Report.md`。

## 單元測試紀錄

- `npm run build`：通過。
- `npm run test`：24 個測試全數通過。

## PM 驗收建議

1. 開首頁確認「綜合練習」旁有「（總計 X 題）」、基本/進階按鈕字體較大、進階顯示為設定的題數（如 25）。
2. 打開「學習與使用設定」→ 操作習慣 → 調整進階挑戰題目數量（如改為 20），儲存後回主選單，確認進階按鈕顯示「20題」且點擊後出題數為 20。
3. 以手機或縮小視窗確認按鈕無文字溢出、觸控區域足夠。
