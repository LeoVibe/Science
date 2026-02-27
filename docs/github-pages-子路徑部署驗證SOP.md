# GitHub Pages 子路徑部署驗證 SOP

部署至 GitHub Pages 後，請依下列項目驗證，確保本機與雲端行為一致（主站與歷史版本入口在子路徑下可用）。

## 驗證環境

- **生產網址**：`https://<org>.github.io/<repo>/`，子路徑為 `/<repo>/`（本專案為 `/Science/`）。
- 建置時請使用 `base: "/Science/"`（由 `VITE_APP_BASE` 或 build 設定決定）。

## 必驗 URL（每次部署後）

| 項目 | URL | 預期 |
|------|-----|------|
| 主站首頁 | `/Science/` | 正常進入主站，非 404 |
| 歷史 v1 入口 | `/Science/history/v1_science/` | 國小自然科題庫練習頁面可載入 |
| 歷史 v2 入口 | `/Science/history/v2_currisite/` | 國小多科目題庫練習頁面可載入 |
| 題庫 manifest（至少一筆） | `/Science/question/platform/...` 任一條實際路徑 | 可取得 `manifest.json` 或題目資源，非 404 |
| 後台登入 | `/Science/admin/login` | 顯示後台登入頁，非 404 |
| 後台（需登入） | `/Science/admin` | 未登入時導向 `/Science/admin/login`；已登入則進入後台 |

## 後台 Admin 網址（正式機）

- **登入頁**：**https://exam15.pages.dev/admin/login**
- **後台首頁**（需先登入）：**https://exam15.pages.dev/admin**

建置時會自動產生 `dist/admin/index.html` 與 `dist/admin/login/index.html`（與 SPA 入口相同），直連上述網址即可載入後台，不會再出現 404。

## 建議驗證步驟

1. 開啟 **主站**：`https://exam15.pages.dev/`，確認可進入且導覽正常。
2. 從主站進入 **關於 → 更版資訊**，點擊典藏館「v0.1 初版(自然科)」「v0.2 多科目版」，應在新分頁打開對應歷史頁且無 404。
3. 直接開啟 **歷史入口**：
   - `https://exam15.pages.dev/history/v1_science/`
   - `https://exam15.pages.dev/history/v2_currisite/`
   確認頁面與靜態資源（JS/CSS）皆可載入。
4. 任選一題庫路徑（依實際題庫結構），確認 **題庫 manifest** 可存取，例如：  
   `https://exam15.pages.dev/question/platform/G5/國語/S2/翰林/manifest.json`（路徑以實際為準）。

5. **後台**：直連 `https://<org>.github.io/Science/admin/login` 應出現登入頁；登入後可進入 `https://<org>.github.io/Science/admin` 各分頁。

## 回歸測試（本機）

- 歷史路徑與 About 連結的 E2E 測試：`apps/v3_eidos/tests/history-subpath.spec.ts`。
- 本機執行：在 `apps/v3_eidos` 下執行 `npx playwright test tests/history-subpath.spec.ts`（預設 base `/`）。
- 欲驗證子路徑行為：先以 `VITE_APP_BASE=/Science/ npm run dev` 啟動，再以 baseURL `http://localhost:8080/Science/` 執行上述測試（可另設 Playwright 專案或環境變數指向子路徑）。

## 相關檔案

- 路徑 helper：`apps/v3_eidos/src/utils/basePath.ts`（`withBase`）。
- 歷史入口 HTML：`apps/v3_eidos/public/history/v1_science/index.html`、`v2_currisite/index.html`（已使用相對資源路徑，base-safe）。
- 部署流程：`.github/workflows/deploy.yml`（建置 `apps/v3_eidos`，上傳 `dist`）。
