# Cloudflare Pages／正式站：必要環境變數

`last_updated`: 2026-03-30 18:05  
`updated_by`: Cursor Agent  

---

## GitHub 綁定（本倉庫）

| 項目 | 內容 |
|:---|:---|
| **GitHub 使用者／組織** | [**LeoVibe**](https://github.com/LeoVibe) |
| **版控遠端 `origin`（canonical）** | `https://github.com/LeoVibe/Science.git` |
| **與上版的關係** | Cloudflare Dashboard 中連結至 Git 的專案、以及本 repo 的 **`.github/workflows/*`**，皆應指向 **同一儲存庫**；Secrets／Deploy hooks 亦以 **本 repo** 為準，勿綁到姊妹專案帳號。 |

---

## 現象對照

| 現象 | 常見原因 |
|------|----------|
| 題目「問題回報」送出失敗 | 前端曾把 API 打到靜態站網域（無 `/api`）。建置需帶 `VITE_API_URL` 指向 Worker；程式亦內建正式 Worker 後備網址。 |
| `/admin/login` 顯示未設定 `VITE_GOOGLE_CLIENT_ID` | 建置時未注入 Google OAuth Web Client ID。 |

## Cloudflare Pages（例如 exam15）

在 **Workers & Pages → 專案 → Settings → Environment variables** 為 Production 新增：

| 變數 | 說明 |
|------|------|
| `VITE_API_URL` | `https://eidos-api.eidosedu.workers.dev` |
| `VITE_GOOGLE_CLIENT_ID` | Google Cloud OAuth 2.0 網頁應用程式 Client ID |
| `VITE_APP_BASE` | 根路徑部署用 `/` |

儲存後需 **重新觸發建置** 才會寫入前端 bundle。

## GitHub Actions

於 **GitHub → `LeoVibe/Science` → Settings → Secrets and variables → Actions`** 設定建置所需 Secrets（與現行 workflow 對齊者含 `VITE_GOOGLE_CLIENT_ID`、`CLOUDFLARE_API_TOKEN`、`CLOUDFLARE_ACCOUNT_ID`；細節以 `.github/workflows/deploy.yml` 與 `deploy-api.yml` 為準）。**僅**在本 canonical repo 設定，勿與其他帳號之 repo 混淆。

## Google OAuth

於 Google Cloud Console 將 `https://<專案>.pages.dev` 等正式網域加入「已授權的 JavaScript 來源」。
