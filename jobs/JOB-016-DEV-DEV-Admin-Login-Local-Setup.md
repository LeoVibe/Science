# JOB-016-DEV-DEV-Admin-Login-Local-Setup8787`）：
   ```bash
   npm run dev
   ```
   保持此終端運行。

### 方式 B：寫在 wrangler.toml（可行但不利於多環境切換）

編輯 `workers/api/wrangler.toml`，找到：

```toml
[vars]
GOOGLE_CLIENT_ID = ""
```

將 `""` 改為你的用戶端 ID（與 Google Console 的「網頁應用程式」OAuth 用戶端 ID 一致）。
若開發/正式環境使用不同 ID，建議改用方式 A 以免混淆。

---

## 3. 前端

1. 在 `apps/v3_eidos` 建立或編輯 `.env.local`（或 `.env`）：
   ```
   VITE_GOOGLE_CLIENT_ID=你的用戶端ID.apps.googleusercontent.com
   VITE_API_URL=http://localhost:8787
   ```
   - `VITE_API_URL` 未設定時預設即為 `http://localhost:8787`；若 Worker 用其他 port，這裡要一併改。
2. 重啟前端 dev server（改 .env 後需重啟）：
   ```bash
   cd apps/v3_eidos && npm run dev
   ```

---

## 4. 正確流程檢查

1. **先**在 `workers/api` 執行 `npm run dev`，看到類似 `Listening on http://localhost:8787`。
2. **再**在 `apps/v3_eidos` 執行 `npm run dev`，用瀏覽器開前端（例如 http://localhost:8080）。
3. 點「使用 Google 帳號登入」→ 完成 Google 登入後，前端會把 Token 送到 `http://localhost:8787/api/admin/auth/request`；此時 Worker 必須已在運行，否則會「Failed to fetch」。

---

## 5. 若仍出現「Failed to fetch」

- 確認 Worker 終端沒有關閉，且顯示在 8787 監聽。
- 瀏覽器開 `http://localhost:8787/api/settings`，若有 JSON 回傳代表 API 有通。
- 若前端用其他 port 或網址，請設 `VITE_API_URL` 指向實際 Worker 網址（例如 `http://localhost:8787`）。
