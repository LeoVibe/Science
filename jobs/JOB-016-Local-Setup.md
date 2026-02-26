# JOB-016 本地開發設定（登入「Failed to fetch」排除）

登入流程改為由 **後端 API** 驗證 Google Token，因此本地必須同時啟動 **Workers API**，否則會出現「Failed to fetch」。

---

## 1. 檔案位置

| 用途 | 路徑 |
|------|------|
| Worker 設定 | `eidosProject/workers/api/wrangler.toml` |
| Worker 本地密鑰（勿提交） | `eidosProject/workers/api/.dev.vars` |
| 密鑰範例 | `eidosProject/workers/api/.dev.vars.example` |
| 前端環境變數 | `eidosProject/apps/v3_eidos/.env.local` 或 `.env`（可選） |

---

## 2. 後端：Workers API 與 GOOGLE_CLIENT_ID

### 方式 A：使用 .dev.vars（建議，便於多環境隔離）

> **備註**：`GOOGLE_CLIENT_ID` 本身**不是機密** — 它會被嵌入前端 JS 送到瀏覽器，Google 官方亦明確表示 Client ID 可安全用於客戶端程式碼。這裡建議使用 `.dev.vars` 是為了**環境隔離**（開發/測試/正式各用不同 ID），而非安全考量。真正不可外洩的是 **Client Secret**（僅存於後端）。

1. 進入目錄：
   ```bash
   cd eidosProject/workers/api
   ```
2. 複製範例並編輯：
   ```bash
   cp .dev.vars.example .dev.vars
   ```
3. 編輯 `.dev.vars`，填入與前端**相同**的 Google OAuth 用戶端 ID：
   ```
   GOOGLE_CLIENT_ID=你的用戶端ID.apps.googleusercontent.com
   ```
4. 啟動 Worker（預設會聽 `http://localhost:8787`）：
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
