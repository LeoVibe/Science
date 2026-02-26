*Created by Cursor at 2026-02-27 00:28*  
*Last Updated at 2026-02-27 00:27 (Cursor: 完成本機 404 修復與測試驗證)*

# JOB-025：本機歷史版本路由 404 修復（v1_science / v2_currisite）

## 任務背景

使用者在本機開發環境（`localhost:8080/Science/...`）開啟歷史版本連結時仍出現 SPA 404。  
根因為開發伺服器對目錄索引行為與靜態主機不同，`/history/v1_science/` 可能不會自動映射到 `index.html`，導致路由落入 React `NotFound`。

## 任務詳情

1. 將前台歷史連結改為明確指向 `index.html`，避免目錄索引歧義。
2. 在 `App.tsx` 新增歷史入口 fallback 路由：
   - `/history/v1_science/*` → `/history/v1_science/index.html`
   - `/history/v2_currisite/*` → `/history/v2_currisite/index.html`
3. 保持 `/Science/` 子路徑相容與既有正式站行為不變。

## 關鍵參考檔案

| 路徑 | 用途 |
|---|---|
| `apps/v3_eidos/src/components/AboutView.tsx` | 更版資訊歷史連結 |
| `apps/v3_eidos/src/components/AboutModal.tsx` | About Modal 歷史連結 |
| `apps/v3_eidos/src/App.tsx` | Router fallback |
| `apps/v3_eidos/tests/history-subpath.spec.ts` | 回歸測試 |

## 執行規範

- 協作流程依 `.agent/workflows/webdev.md`。
- 只修路徑與路由 fallback，不調整題庫資料與 v1/v2 UI 邏輯。

## 驗證基準 (DoD)

- [x] 本機 `http://localhost:8080/Science/history/v1_science/` 不再進入 App 404。  
- [x] 本機 `http://localhost:8080/Science/history/v2_currisite/` 不再進入 App 404。  
- [x] About 連結可正確開啟歷史頁（含 `target="_blank"`）。  
- [x] `npm run test`、`npm run build` 通過。  
- [x] 產出 `jobs/JOB-025-Report.md` 完工報告。  

