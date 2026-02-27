# Cloudflare Pages：exam15.pages.dev 部署設定

本站為 v3 前台的 **根路徑** 部署（與 GitHub Pages 的 `/Science/` 子路徑不同），建置時必須使用 **base `/`** 與 **Production API**，否則會出現資源 404 或 API 連線錯誤。

## 錯誤原因簡述

- **base 錯誤**：若使用與 GitHub 相同的建置（`VITE_APP_BASE=/Science/`），產出的 HTML/JS 會請求 `/Science/assets/...`，在 `https://exam15.pages.dev/` 根站下會 404，導致白畫面或僅標題。
- **API 未設定**：未設定 `VITE_API_URL` 時，前端會使用預設 `http://localhost:8787`，正式環境無法連到 Production API。

## Cloudflare Pages 專案設定

在 **Cloudflare Dashboard → Pages → 你的專案 → Settings → Builds & deployments** 請設定：

| 項目 | 值 |
|------|-----|
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Root directory** | `apps/v3_eidos` |

若專案根目錄是 repo 根目錄，則 Root directory 必須設為 `apps/v3_eidos`，Build command 才會在正確目錄執行。

## 環境變數（必填）

在 **Settings → Environment variables** 為 **Production**（與 Preview 若需一致可一併設）新增：

| 變數名稱 | 值 | 說明 |
|----------|-----|------|
| `VITE_APP_BASE` | `/` | 根路徑部署，勿用 `/Science/` |
| `VITE_API_URL` | `https://eidos-api.eidos.workers.dev` | Production API |

- 修改環境變數後需 **重新執行一次 Build**（Re-deploy 或推送新 commit）才會生效。
- 敏感資訊請勿寫進版控，僅在 Cloudflare 後台設定。

## 部署後驗證

1. 開啟 https://exam15.pages.dev/
2. 確認頁面完整載入（非白畫面）、導航與登入正常。
3. 開啟開發者工具 → Network：確認 `assets/*.js` 等為 200，且 API 請求指向 `https://eidos-api.eidos.workers.dev`。

## 與 GitHub Pages 的差異

| 項目 | GitHub Pages | Cloudflare Pages (exam15.pages.dev) |
|------|--------------|----------------------------------------|
| Base | `VITE_APP_BASE=/Science/` | `VITE_APP_BASE=/` |
| API | `VITE_API_URL=https://eidos-api.eidos.workers.dev` | 同上 |
| 建置來源 | `.github/workflows/deploy.yml` | Cloudflare Pages 後台 Build 設定 |

兩邊都使用同一個 Production API：**https://eidos-api.eidos.workers.dev**。
