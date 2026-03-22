# Cloudflare Pages／正式站：必要環境變數

## 現象對照

| 現象 | 常見原因 |
|------|----------|
| 題目「問題回報」送出失敗 | 前端曾把 API 打到靜態站網域（無 `/api`）。建置需帶 `VITE_API_URL` 指向 Worker；程式亦內建正式 Worker 後備網址。 |
| `/admin/login` 顯示未設定 `VITE_GOOGLE_CLIENT_ID` | 建置時未注入 Google OAuth Web Client ID。 |

## Cloudflare Pages（例如 exam15）

在 **Workers & Pages → 專案 → Settings → Environment variables** 為 Production 新增：

| 變數 | 說明 |
|------|------|
| `VITE_API_URL` | `https://eidos-api.eidos.workers.dev` |
| `VITE_GOOGLE_CLIENT_ID` | Google Cloud OAuth 2.0 網頁應用程式 Client ID |
| `VITE_APP_BASE` | 根路徑部署用 `/` |

儲存後需 **重新觸發建置** 才會寫入前端 bundle。

## GitHub Actions

在 Repository **Secrets** 新增 `VITE_GOOGLE_CLIENT_ID`（`deploy.yml` 建置已引用）。

## Google OAuth

於 Google Cloud Console 將 `https://<專案>.pages.dev` 等正式網域加入「已授權的 JavaScript 來源」。
