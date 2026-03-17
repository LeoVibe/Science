*Created by Cursor at 2026-02-27 00:34*  
*Last Updated at 2026-02-27 00:49 (Cursor: 完成 env 參數化與測試驗證)*

# JOB-026：環境參數驅動的 Base Path 策略（取代程式內路徑判斷）

## 任務背景

目前本機 `/` 與雲端 `/Science/` 的差異曾透過程式內 fallback 與 runtime 判斷暫時處理。  
為提升可維護性，需改為「由環境參數控制路徑」：本機與雲端差異由 `.env` 管理，不在程式邏輯中硬判斷。

## 任務詳情

1. v3 路徑策略調整
   - `apps/v3_eidos/vite.config.ts` 改為讀取 `VITE_APP_BASE` 決定 `base`。
   - 新增 `.env.development` / `.env.production`，分別對應 `/` 與 `/Science/`。
   - 移除 App 內僅為本機補救的歷史路由 fallback。

2. 歷史相容頁去除 runtime 判斷
   - `public/history/v0.1/index.html`、`public/history/v0.5/index.html` 不再以 JS 判斷 `/Science`。
   - 統一採相對跳轉（`../../?legacy=...`）保證環境獨立。

3. v2 題庫基底改為環境參數
   - `apps/v2_currisite/src/data/index.js` 改由 `VITE_QUESTION_BASE` 控制題庫根路徑（本機 `/`、雲端 `/Science/`）。
   - 新增 v2 `.env.development` / `.env.production`。

## 關鍵參考檔案

| 路徑 | 用途 |
|---|---|
| `apps/v3_eidos/vite.config.ts` | v3 base 設定來源 |
| `apps/v3_eidos/src/App.tsx` | 移除本機路由補丁 |
| `apps/v3_eidos/public/history/v0.1/index.html` | 相容頁跳轉策略 |
| `apps/v3_eidos/public/history/v0.5/index.html` | 相容頁跳轉策略 |
| `apps/v2_currisite/src/data/index.js` | v2 題庫載入基底 |
| `apps/v2_currisite/vite.config.js` | v2 build base 與資產行為 |

## 執行規範

- 協作流程依 `.agent/workflows/webdev.md`。
- 路徑差異優先用環境參數處理，不加 runtime 硬判斷分支。
- 不修改 `question/platform/**` 題庫內容。

## 驗證基準 (DoD)

- [x] 本機開發環境預設走 `/`，不需 ` /Science` 前綴。  
- [x] 生產建置仍輸出 `/Science/` 子路徑可用版本。  
- [x] v0.1 / v0.5 相容頁無 `path.startsWith('/Science')` 類 runtime 判斷。  
- [x] v2 對有題庫組合可正常填答，不再誤顯示建置中。  
- [x] `npm run test`、`npm run build`（v3）與 `npm run build`（v2）通過。  
- [x] 產出 `jobs/JOB-026-Report.md`。  

