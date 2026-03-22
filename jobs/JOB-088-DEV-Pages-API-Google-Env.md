# JOB-088：Cloudflare Pages API 基底與 Google 登入環境變數

*Created by Cursor at 2026-02-27*

## 問題

- `*.pages.dev` 上「問題回報」POST 失敗：未注入 `VITE_API_URL` 時誤用靜態站 origin。
- 後台登入：缺少建置期 `VITE_GOOGLE_CLIENT_ID`。

## 修正

- `api.ts`：`*.pages.dev` / `*.github.io` 改為後備 `https://eidos-api.eidosedu.workers.dev`。
- `deploy.yml`：建置注入 `VITE_GOOGLE_CLIENT_ID: ${{ secrets.VITE_GOOGLE_CLIENT_ID }}`。
- `docs/Cloudflare-Pages-與正式站環境變數.md`、`env.production.example` 補充說明。

## PM／維運

1. GitHub Repo 新增 Secret `VITE_GOOGLE_CLIENT_ID`（Google OAuth Web Client ID）。
2. Cloudflare Pages 專案 Environment variables：`VITE_API_URL`、`VITE_GOOGLE_CLIENT_ID`、`VITE_APP_BASE=/`，並 Redeploy。
3. Google Console 授權 JavaScript 來源含正式網域。
