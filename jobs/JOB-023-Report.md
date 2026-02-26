*Created by Cursor at 2026-02-27 00:02*  
*Last Updated at 2026-02-27 00:02 (Cursor: 完成 JOB-023 報告補齊)*

# JOB-023 完工報告：Science 子路徑一致化與歷史版本路由修復

## 開發成果摘要

- 完成子路徑一致化策略，新增 `withBase` 路徑 helper，將前端歷史連結與題庫靜態資源路徑改為 base-safe。
- 修正歷史入口頁 `v1_science`、`v2_currisite` 的資源引用為相對路徑，避免 GitHub Pages `/Science/` 子路徑下 asset 404。
- 修正相容橋接頁 `v0.1`、`v0.5` 的自動跳轉與手動連結，確保在 `/` 與 `/Science/` 兩種環境都能導向正確主站。
- 補上子路徑回歸測試與部署 SOP，降低未來回歸風險。
- 已完成 commit 與上版部署，線上驗證可正常載入主站、歷史入口與 manifest。

## 變更檔案清單

| 檔案 | 變更類型 | 說明 |
|---|---|---|
| `apps/v3_eidos/src/utils/basePath.ts` | Add | 新增 `withBase` / `withBaseFrom` 路徑 helper |
| `apps/v3_eidos/src/utils/basePath.test.ts` | Add | 新增 helper 單元測試（`/` 與 `/Science/`） |
| `apps/v3_eidos/src/components/AboutView.tsx` | Update | 歷史版本連結改用 `withBase` |
| `apps/v3_eidos/src/components/AboutModal.tsx` | Update | 歷史版本連結改用 `withBase` |
| `apps/v3_eidos/src/data/questionLoader.ts` | Update | manifest 與題目檔載入路徑改為 base-safe |
| `apps/v3_eidos/src/components/admin/AdminQualityAnalyzer.tsx` | Update | 後台題庫讀取路徑改為 base-safe |
| `apps/v3_eidos/public/history/v1_science/index.html` | Update | v1 入口 JS/CSS 改相對路徑 |
| `apps/v3_eidos/public/history/v2_currisite/index.html` | Update | v2 入口 JS/CSS 改相對路徑 |
| `apps/v3_eidos/public/history/v0.1/index.html` | Update | 相容橋接頁改 base-safe 跳轉與手動連結 |
| `apps/v3_eidos/public/history/v0.5/index.html` | Update | 相容橋接頁改 base-safe 跳轉與手動連結 |
| `apps/v3_eidos/tests/history-subpath.spec.ts` | Add | 新增歷史路徑與 About `target="_blank"` 回歸測試 |
| `docs/網站功能規格書.md` | Update | 新增 GitHub Pages 子路徑部署驗證 SOP |
| `jobs/JOB-023-Science-Subpath-Consistency-and-Legacy-Route-Fix.md` | Add | 補建 JOB-023 派工單 |
| `jobs/任務看板與派工.md` | Update | 新增 `JOB-023` 看板項目並標記 DONE |
| `docs/task_history.md` | Update | 補記 `JOB-023` 完工歷程 |

## 單元測試與驗證紀錄

- `apps/v3_eidos`
  - `npm run test` ✅ 通過
  - `npm run build` ✅ 通過
  - `env CI= npx playwright test tests/history-subpath.spec.ts --project=chromium` ✅ 3 passed

- 線上部署驗證（GitHub Pages）
  - `https://leovibe.github.io/Science/` ✅
  - `https://leovibe.github.io/Science/history/v1_science/` ✅
  - `https://leovibe.github.io/Science/history/v2_currisite/` ✅
  - `https://leovibe.github.io/Science/question/platform/G5/Chinese/S2/HanLin/manifest.json` ✅
  - `https://leovibe.github.io/Science/history/v0.1/`、`/history/v0.5/` 手動連結已指向 `https://leovibe.github.io/Science/?legacy=...` ✅

## 發布紀錄

- Commit: `2c32c82`
- Branch: `main`
- Deploy workflow: `Deploy exactly to GitHub Pages`（Run `22449575975`）✅ success

## PM 驗收建議

1. 以無痕視窗開啟 `https://leovibe.github.io/Science/`，確認首頁可正常操作。
2. 在 About 更版資訊點擊 `v0.1 初版(自然科)`、`v0.2 多科目版`，確認可開新分頁並正確載入歷史頁。
3. 分別開啟 `/Science/history/v0.1/` 與 `/Science/history/v0.5/`，確認自動跳轉與手動連結都導向 `/Science/?legacy=...`。
4. 實測一條題庫路徑（manifest + 任一 `Chi_L*.json`），確認 HTTP 200 與 JSON 可解析。

