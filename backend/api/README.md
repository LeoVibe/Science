# Eidos API (Cloudflare Worker)

正式後端 API 專案路徑：`backend/api`。

## 設定

1. **安裝依賴**  
   `npm install`

2. **建立 D1 資料庫**  
   `npx wrangler d1 create eidos-db`  
   將輸出的 `database_id` 寫入 `wrangler.toml` 的 `[[d1_databases]]` → `database_id`。

3. **執行遷移**  
   - 遠端：`npm run db:migrate`  
   - 本地：`npm run db:migrate:local`

4. **建立 KV namespace**  
   `npx wrangler kv:namespace create SITE_SETTINGS`  
   將輸出的 `id` 寫入 `wrangler.toml` 的 `[[kv_namespaces]]` → `id`。

5. **本地開發**  
   `npm run dev`（預設 **http://127.0.0.1:8787**）

6. **與前端聯測（後台「使用統計／使用者分析」）**  
   - 前端 `apps/v3_eidos` 預設 `VITE_API_URL` 未設定時會連 **http://localhost:8787**（見 `src/data/api.ts`）。  
   - 請**另開終端**啟動本 Worker，再 `npm run dev` 跑 Vite；否則活動 API 無法寫入 KV，後台會載入失敗或列表為空。  
   - 「使用者分析」正式站預設活躍天數門檻為 5；**開發模式**前端會預設門檻 **1**，方便本機同一天測試。  
   - **後台「本機認證測試」按鈕**：僅在 **`npm run dev`（`import.meta.env.DEV`）** 顯示。必須在 **`backend/api/.dev.vars`** 加入 `ADMIN_LOCAL_DEV_BYPASS=true`（見 `.dev.vars.example`），Worker 才會接受本機繞過 Token；否則進入 `/admin` 會被 `/api/admin/verify` 擋下。  
   - **埠號（8080 / 8081）**：與按鈕有無無關；同一專案若開兩個 Vite，後啟者會自動換埠。**不同資料夾／worktree** 若程式版本不同，畫面就會不一樣。

7. **設定後台 owner 種子帳號（必要）**  
   在 `wrangler.toml` 的 `[vars]` 或本地 `.dev.vars` 設定：
   `ADMIN_OWNER_EMAILS=owner1@example.com,owner2@example.com`  
   > 僅在 `admin_users` 尚未建立時作為首次 bootstrap 使用。

## GitHub Actions 部署

- Workflow：`.github/workflows/deploy-api.yml`  
- 觸發：推送到 `main` 且變更 `backend/api/**` 或 `scripts/workers/api/**`，或手動 `workflow_dispatch`。  
- **必要 Secrets**（Repo → Settings → Secrets and variables → Actions）：
  - `CLOUDFLARE_ACCOUNT_ID`：Cloudflare 儀表板右側 Account ID。  
  - `CLOUDFLARE_API_TOKEN`：My Profile → API Tokens → Create Token，權限需包含 **Edit Cloudflare Workers**（以及 D1/KV 若由同一 token 管理）。  
- 流程：安裝依賴 → `wrangler deploy --dry-run` 驗證 → `wrangler deploy` 正式部署。  
- **Production API**：https://eidos-api.eidos.workers.dev  
- 詳細步驟與回滾說明見 `jobs/JOB-028-Report.md`。

## 後台「使用者分析」若出現 404（`{"error":"Not Found"}`）

- 程式已實作 `GET /api/admin/activity/user-analysis`（邏輯在 `scripts/workers/api/src/index.ts`，由 `backend/api` 轉匯入）。
- **本機**：在 `backend/api` 執行 `npm run dev`，前端應連 `http://localhost:8787`（或 `VITE_API_URL`）。
- **遠端**（例如 `VITE_API_URL_REMOTE=https://eidos-api.….workers.dev`）：若仍 404，代表**線上 Worker 尚未部署含此路由的版本**，請：
  1. 在 `backend/api` 執行 **`npx wrangler deploy`**（需已登入 wrangler 並有權限），或
  2. 將變更推上 **`main`** 並觸發 `.github/workflows/deploy-api.yml`，或
  3. 暫時**不要設** `VITE_API_URL_REMOTE`，改用後台「**本機認證測試**」只打本機 Worker 驗證功能。

## 遷移說明

- 既有舊路徑 `scripts/workers/api` 仍保留作為短期相容入口。
- 新增或維護請以 `backend/api` 為主。
