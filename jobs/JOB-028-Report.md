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

## Phase 3 正式環境切換與驗收（待執行）

- [ ] 部署至 production Worker 並確認無錯誤。
- [ ] 冒煙測試：settings、profile、admin 相關端點。
- [ ] 檢查 Cloudflare 後台：Worker、D1、KV、Logs。

## 回滾步驟

- Cloudflare Dashboard → Workers & Pages → eidos-api → Deployments：選上一版 → 「Rollback to this deployment」。
- 若需還原程式：回退 Git 至前一版並重新推送，或手動在本地執行 `npx wrangler deploy` 部署舊版。
- 回滾後請記錄異常時間點與操作步驟，便於事後排查。
