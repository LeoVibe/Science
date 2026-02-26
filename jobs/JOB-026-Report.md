*Created by Cursor at 2026-02-27 00:50*  
*Last Updated at 2026-02-27 00:50 (Cursor: 完成 JOB-026 完工報告)*

# JOB-026 完工報告：環境參數驅動的 Base Path 策略

## 開發成果摘要

- 將 v3 `base` 改為環境參數 `VITE_APP_BASE` 控制，取代硬編碼 `/Science/`。
- 補齊 v3 環境檔：
  - development：`VITE_APP_BASE=/`
  - production：`VITE_APP_BASE=/Science/`
- 移除 App 內本機歷史路由 fallback（不再用程式內補丁解路徑差異）。
- `v0.1/v0.5` 相容頁移除 `path.startsWith('/Science')` runtime 判斷，改回純相對跳轉。
- v2 題庫載入改為環境參數 `VITE_QUESTION_BASE` 控制（development=`/`、production=`/Science/`），維持不改題庫檔案規範。

## 變更檔案清單

| 檔案 | 變更類型 | 說明 |
|---|---|---|
| `apps/v3_eidos/vite.config.ts` | Update | `base` 改為讀取 `VITE_APP_BASE` |
| `apps/v3_eidos/.env.development` | Add | 本機 base 設定 |
| `apps/v3_eidos/.env.production` | Add | GitHub Pages base 設定 |
| `apps/v3_eidos/src/App.tsx` | Update | 移除歷史路由 fallback 補丁 |
| `apps/v3_eidos/public/history/v0.1/index.html` | Update | 相容跳轉改為純相對，不做 runtime 環境判斷 |
| `apps/v3_eidos/public/history/v0.5/index.html` | Update | 相容跳轉改為純相對，不做 runtime 環境判斷 |
| `apps/v2_currisite/src/data/index.js` | Update | 題庫根路徑改讀 `VITE_QUESTION_BASE` |
| `apps/v2_currisite/.env.development` | Add | v2 本機題庫根路徑 |
| `apps/v2_currisite/.env.production` | Add | v2 雲端題庫根路徑 |
| `apps/v2_currisite/dist/assets/index-CJ0Pou8v.js` | Build artifact | v2 重建後新資產 |
| `apps/v3_eidos/public/history/v2_currisite/index.html` | Update | 指向 v2 新資產檔名 |
| `apps/v3_eidos/tests/history-subpath.spec.ts` | Update | 測試改為環境無關斷言 |
| `jobs/JOB-026-Env-Driven-Base-Path-Strategy.md` | Add/Update | 新增派工單並完成 DoD |

## 測試與驗證紀錄

- `apps/v2_currisite`
  - `npm run build` ✅

- `apps/v3_eidos`
  - `env CI= npx playwright test tests/history-subpath.spec.ts --project=chromium` ✅ 3 passed
  - `npm run test` ✅（24 tests）
  - `npm run build` ✅

## PM 驗收建議

1. 本機啟動 v3：`apps/v3_eidos`，確認網址不需 `/Science` 前綴。
2. 檢查更版頁歷史連結可開啟（`target="_blank"`）並能進入歷史頁。
3. 本機啟動 v2 build（或使用歷史入口），確認有題庫組合不再出現「此科目的題庫正在建置中」。
4. 部署後確認 `https://leovibe.github.io/Science/` 主站與歷史頁面仍正常。

