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

## 遷移說明

- 既有舊路徑 `scripts/workers/api` 仍保留作為短期相容入口。
- 新增或維護請以 `backend/api` 為主。
