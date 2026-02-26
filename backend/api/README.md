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
   `npm run dev`

6. **設定後台 owner 種子帳號（必要）**  
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

## 遷移說明

- 既有舊路徑 `scripts/workers/api` 仍保留作為短期相容入口。
- 新增或維護請以 `backend/api` 為主。
