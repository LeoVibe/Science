*Created by Cursor at 2026-02-27 00:26*  
*Last Updated at 2026-02-27 00:26 (Cursor: 完成 JOB-025 本機歷史路由修復報告)*

# JOB-025 完工報告：本機歷史版本路由 404 修復（v1_science / v2_currisite）

## 開發成果摘要

- 修正 About 歷史連結改為明確指向 `index.html`，避免本機 dev server 對目錄索引的解析差異。
- 在 `App.tsx` 新增歷史入口 fallback 路由，確保輸入 `/Science/history/v1_science/`、`/Science/history/v2_currisite/` 不會落入 App 404。
- 維持 `BASE_URL` 子路徑相容，不動題庫資料與 v1/v2 介面邏輯。

## 變更檔案清單

| 檔案 | 變更類型 | 說明 |
|---|---|---|
| `apps/v3_eidos/src/components/AboutView.tsx` | Update | 歷史連結改為 `.../index.html` |
| `apps/v3_eidos/src/components/AboutModal.tsx` | Update | 歷史連結改為 `.../index.html` |
| `apps/v3_eidos/src/App.tsx` | Update | 新增 `/history/v1_science/*`、`/history/v2_currisite/*` fallback 路由 |
| `apps/v3_eidos/tests/history-subpath.spec.ts` | Update | 調整 href 斷言為 `index.html` |
| `jobs/JOB-025-Local-History-Route-Fallback-and-Link-Fix.md` | Add | 新增派工單 |

## 測試紀錄

- `env CI= npx playwright test tests/history-subpath.spec.ts --project=chromium` ✅ 3 passed
- `npm run test`（`apps/v3_eidos`）✅ 通過（24 tests）
- `npm run build`（`apps/v3_eidos`）✅ 通過

## PM 驗收建議

1. 本機啟動 `apps/v3_eidos` 開發伺服器。
2. 手動開啟：
   - `http://localhost:8080/Science/history/v1_science/`
   - `http://localhost:8080/Science/history/v2_currisite/`
3. 確認不再進入「404 Oops! Page not found」。
4. 開啟 About 更版頁並點兩個歷史連結，確認新分頁可開啟對應歷史頁。

