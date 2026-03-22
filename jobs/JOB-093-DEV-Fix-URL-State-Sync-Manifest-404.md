# JOB-093-DEV-Fix-URL-State-Sync-Manifest-404

## 📌 任務背景
使用者在帶完整題庫路徑的深連結（例如 `/g6/chi/s2/knsh/about/deepdive`）下，若從頁首切換科目，URL 仍停留在 `chi/knsh`，但 React state 已變為其他科／出版社，`loadQuestions` 依 state 載入 manifest 導致路徑與 URL 不一致，出現「Manifest 載入失敗 (404)」與畫面／網址不一致。無痕模式亦同，與 localStorage「設定失效」無關。

## 📖 任務詳情
1. 將「URL → state」之合法題庫參數同步改為 `useLayoutEffect`，使 Link 進入時 state 在 `State → URL` 的 `useEffect` 之前已與網址一致。
2. 移除 `State → URL` 中僅因 `VALID_APP_PATH` 就略過 `navigate` 的邏輯，避免使用者切換年級／科目／出版社後網址無法更新。

## 📜 關鍵參考檔案
| 檔案路徑 | 用途說明 |
| --- | --- |
| `apps/v3_eidos/src/pages/Index.tsx` | URL ↔ state 同步、`loadQuestions` 觸發 |

## ✅ 驗證基準 (DoD)
- [x] 開啟 `.../g6/chi/s2/knsh/about/deepdive`，切換至「社會」後網址應變為 `SocialStudies` 與 profile 對應出版社代碼。
- [x] `npm run build`（`apps/v3_eidos`）通過。
