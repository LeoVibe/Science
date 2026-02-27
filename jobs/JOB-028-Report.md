# JOB-028 報告：Cloudflare 分階段落地

## Phase 1 本機驗證（已完成）

- `backend/api` 以 `npm run dev` 啟動，D1/KV/vars 綁定正常。
- 已補齊 `backend/api/migrations/0000_initial_profiles_and_ux.sql` 並執行 `npm run db:migrate:local`。
- 路由驗證：`/api/settings` 200；`/api/profiles/:userId` 404→PUT→200；`/api/admin/verify`、`/api/admin/config` 無 token 時 401。

## Phase 2 GitHub / CI 對齊（已完成）

- **Workflow**：新增 `.github/workflows/deploy-api.yml`
  - 觸發：`main` 且變更 `backend/api/**` 或 `scripts/workers/api/**`，或手動執行。
  - 步驟：Checkout → Node 20 → `npm install`（backend/api）→ `wrangler deploy --dry-run` → `wrangler deploy`。
- **Secrets**（須在 Repo Settings → Secrets and variables → Actions 設定）：
  - `CLOUDFLARE_ACCOUNT_ID`：Cloudflare 儀表板 Account ID。
  - `CLOUDFLARE_API_TOKEN`：API Token，權限需包含 Edit Cloudflare Workers（及 D1/KV 若由同 token 管理）。
- **文件**：`backend/api/README.md` 已補「GitHub Actions 部署」與 Secrets 說明。

### 最小上線步驟（Phase 2 後首次部署）

1. 在 GitHub Repo → Settings → Secrets and variables → Actions 新增上述二個 Secrets。
2. 確認 Cloudflare 已建立 D1、KV，且 `wrangler.toml` 的 `database_id`、KV `id` 已填。
3. 遠端 D1 若尚未遷移：在本地或 Cloudflare 執行一次 `npm run db:migrate`（需有權限的 token）。
4. 觸發部署：推送變更到 `main` 或於 Actions 頁籤手動執行「Deploy API (Cloudflare Worker)」。

## Phase 3 正式環境切換與驗收

- [x] 部署至 production Worker 並確認無錯誤。（GitHub Actions 已綠）
- [x] 冒煙測試：settings、profile、admin 相關端點（見下方步驟）；三項皆通過。
- [ ] 檢查 Cloudflare 後台：Worker、D1、KV、Logs。

### 正式機前台已接 Production API

- GitHub Actions（`.github/workflows/deploy.yml`）建置時已設定 `VITE_API_URL=https://eidos-api.eidos.workers.dev`、`VITE_APP_BASE=/Science/`。
- 正式站 **https://exam15.pages.dev/** 已部署，載入的 JS 內含上述 API 網址，設定與個人資料等會打 Production API。

### Production API 網址

Worker 名稱：`eidos-api`。

- **Production**：**https://eidos-api.eidos.workers.dev**

### Cloudflare Pages 前台（exam15.pages.dev）

- 本站為**根路徑**部署（`https://exam15.pages.dev/`），與 GitHub Pages 的 `/Science/` 子路徑不同。
- 若出現白畫面或僅看到標題，多半是建置時用了 **base `/Science/`** 或未設 **VITE_API_URL**，導致資源 404 或 API 連到 localhost。
- **設定與修正**：請依 `docs/cloudflare-pages-exam15.md` 在 Cloudflare Pages 專案中設定 **Root directory**、**Build output**，以及環境變數 **VITE_APP_BASE=/**、**VITE_API_URL=https://eidos-api.eidos.workers.dev**，並重新部署。

### Phase 3 建議步驟

1. **確認遠端 D1 已跑過 migration**  
   若從未在 production 跑過：在專案根目錄 `backend/api` 執行  
   `npm run db:migrate`  
   （需已登入 `wrangler login` 或設好 `CLOUDFLARE_API_TOKEN`），否則 `/api/profiles` 等會 500。  
   **已執行**：遠端 D1 曾無 `profiles` 表，已以 `wrangler d1 execute eidos-db --remote --file=./migrations/0000_initial_profiles_and_ux.sql` 建表；之後 `npm run db:migrate` 會顯示已是最新。

2. **冒煙測試**
   - `GET BASE/api/settings` → 應 200，有 JSON。
   - `GET BASE/api/profiles/某個不存在的 userId` → 應 404。
   - `GET BASE/api/admin/verify`（不帶 token）→ 應 401。  
   **腳本**：在 `backend/api` 執行  
   `BASE=https://eidos-api.eidos.workers.dev npm run smoke`  
   會自動打上述三支並印 ✅/❌。

3. **前台／後台**  
   若前台已指向此 API：實際點一輪設定、個人資料、後台登入，確認無紅錯。

4. **Cloudflare 後台**  
   Workers & Pages → eidos-api → 看 Deployments（有最新部署）、Logs；D1、KV 若有使用可順便確認。

## 回滾步驟

- Cloudflare Dashboard → Workers & Pages → eidos-api → Deployments：選上一版 → 「Rollback to this deployment」。
- 若需還原程式：回退 Git 至前一版並重新推送，或手動在本地執行 `npx wrangler deploy` 部署舊版。
- 回滾後請記錄異常時間點與操作步驟，便於事後排查。
