*Created by AG at 2026-02-27 21:20*

# JOB-036-USER-Quiz-UI-Experience-Refinement

## 任務背景
使用者回饋目前測驗畫面（基本挑戰/進階挑戰）的按鈕字體過小，不便於小學生閱讀。同時，「進階挑戰」的題數目前寫死為 25 題，未與 User Profile 中的設定（maxQuizQuestions）同步。

## 任務詳情
1. **[UI] 放大測驗按鈕字體**：
   - 修改 `MainMenu.tsx`，將「基本挑戰」與「進階挑戰」的標題字體放大（建議由 `text-sm` 升級為 `text-base` 或 `text-lg`）。
   - 確保按鈕在不同行動裝置上的點擊區域足夠大。
2. **[Logic] 進階挑戰題數連動**：
   - 修改 `Index.tsx` 與 `MainMenu.tsx`，從 User Profile 中讀取 `maxQuizQuestions` 並傳入 `MainMenu`。
   - 更新按鈕內顯示的題數標籤（如：從「25題」變為當前設定的題數）。
3. **[UI] 題庫總量動態顯示**：
   - 在 `MainMenu.tsx` 的「綜合練習」標題旁顯示當前科目/出版者的總題目數量。

## 關鍵參考檔案
| 檔案路徑 | 說明 |
| :--- | :--- |
| `apps/v3_eidos/src/components/MainMenu.tsx` | 主要 UI 修改位置 |
| `apps/v3_eidos/src/pages/Index.tsx` | Profile 資料傳遞邏輯 |
| `apps/v3_eidos/src/utils/storage.ts` | 讀取 UserProfile 的工具函式 |

## 驗證基準 (DoD)
- [ ] 測驗按鈕字體明顯變大，且佈局未跑版。
- [ ] 修改「學習與使用設定」中的進階題數後，首頁按鈕的題數應同步更新。
- [ ] 首頁應顯示「總計 X 題」的資訊。
- [ ] 執行並更新 `JOB-036-Report.md`。
