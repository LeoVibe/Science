# Eidos API (Cloudflare Worker)

JOB-001：個人資料 (D1) 與網站參數 (KV) 的 API 層。

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

## API

- **Profiles (D1)**  
  - `GET /api/profiles/:userId` — 取得個人資料  
  - `PUT /api/profiles/:userId` — 覆寫整筆（upsert）  
  - `PATCH /api/profiles/:userId` — 部分更新  

  欄位：`base_year`, `publisher_preferences` (JSON), `quiz_next_delay`, `shortcut_enabled`, `theme`。

- **Site Settings (KV)**  
  - `GET /api/settings` — 取得全部：`maintenance_mode`, `announcement`, `api_version`  
  - `PUT /api/settings` — 更新（body 為部分或全部鍵值）  
  - `GET /api/settings/:key` — 取得單一鍵（key: `maintenance_mode` | `announcement` | `api_version`）
