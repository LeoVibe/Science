# JOB-042 完工報告：教育價值微型導覽 Modal & Tooltip

*Completed by Cursor at 2026-02-28*

## 開發成果摘要

- **OnboardingModal（導覽劇場）**：於 `Index` 在 view 為 menu 且未見過導覽時顯示。內容為「皮亞傑的具體運算期」「大腦友善設計」兩張科普卡片；依 LocalStorage `hasSeenValueOnboarding` 防擾民（僅首次顯示）。按鈕「👉 了解更多我們的腦科學研究」會關閉 Modal 並導向 JOB-038 的「研究深探」分頁（`about/deepdive`）；「稍後再說」僅關閉並寫入已讀。
- **InsightDrawer（專家悄悄話）**：於 `MainMenu`「分課練習」標題旁新增 💡 按鈕，點擊後自右側滑出抽屜，說明認知配比 4-4-2 的意義；含明顯關閉 (✕) 按鈕與 Esc 關閉，RWD 下為全寬 max-w-sm 側欄。
- **IntentionTooltip（設計意圖提示）**：在答題解析處（`QuizView`、`ResultView`、`ReviewView`、`WrongQuestionsView`、`LearningReportView`）於 `explanation` 旁新增一懸停氣泡（? 圖示），hover 顯示「本題解析說明設計意圖與誘答巧思…」。使用既有 `@/components/ui/tooltip`，未 hardcode 色碼，符合 Warm Amber 與規格書。

## 變更檔案清單

| 檔案 | 變更類型 |
|------|----------|
| `apps/v3_eidos/src/components/OnboardingModal.tsx` | 新增 |
| `apps/v3_eidos/src/components/InsightDrawer.tsx` | 新增 |
| `apps/v3_eidos/src/components/IntentionTooltip.tsx` | 新增 |
| `apps/v3_eidos/src/pages/Index.tsx` | 修改：showOnboardingModal state、渲染 OnboardingModal、onGoToDeepDive 導向 about/deepdive |
| `apps/v3_eidos/src/components/MainMenu.tsx` | 修改：InsightDrawer state、💡 按鈕 |
| `apps/v3_eidos/src/components/QuizView.tsx` | 修改：explanation 旁 IntentionTooltip |
| `apps/v3_eidos/src/components/ResultView.tsx` | 修改：explanation 旁 IntentionTooltip |
| `apps/v3_eidos/src/components/ReviewView.tsx` | 修改：explanation 旁 IntentionTooltip |
| `apps/v3_eidos/src/components/WrongQuestionsView.tsx` | 修改：explanation 旁 IntentionTooltip |
| `apps/v3_eidos/src/components/LearningReportView.tsx` | 修改：explanation 旁 IntentionTooltip |

## 驗證基準 (DoD) 對應

- [x] 首次登入：清除 LocalStorage 後重整首頁，僅彈出一次 Onboarding Modal；關閉或點「了解更多」後不再顯示。
- [x] RWD：Drawer 與 Modal 在手機版有明顯關閉 (✕) 按鈕；Drawer 為側邊滑出、不崩版。
- [x] 已產出 `JOB-042-Report.md`。

## 單元測試紀錄

- `npm run build`：通過。
- `npm run test`：24 個測試全數通過。

## PM 驗收建議

1. **Onboarding**：清除 `localStorage.hasSeenValueOnboarding` 或使用無痕模式，進入首頁，應出現歡迎 Modal；點「了解更多我們的腦科學研究」應跳轉至關於 → 研究深探。
2. **Drawer**：主選單「分課練習」旁點 💡，應自右滑出「專家悄悄話」；手機與桌面皆可點 ✕ 或按 Esc 關閉。
3. **Tooltip**：任一路徑進入有解析的題目（測驗中答題後、結果頁、分課複習、錯題本、學習報表），在解析文字旁應見 ? 圖示，懸停顯示設計意圖氣泡。
