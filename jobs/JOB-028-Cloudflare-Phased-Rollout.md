*Created by Cursor at 2026-02-27 01:05*  
*Last Updated at 2026-02-27 02:28 (Cursor: 完成 Phase 1 本機驗證與修復)*

# JOB-028：Cloudflare 分階段落地（本機測試 + GitHub 佈署 + 正式切換）

## 任務背景

目前你已完成 Cloudflare 帳號與基礎設定，下一步需把 `backend/api` 的 Worker / D1 / KV 以低風險方式分階段落地，確保：

1. 本機可先完整測試（含資料遷移、API 行為）
2. GitHub 與正式站可逐步切換
3. 發生問題時可快速回退

## 任務詳情

### Phase 1：本機環境驗證（Local First）

1. 驗證 `backend/api` 基礎設定完整性
   - `wrangler.toml`（D1、KV、vars）
   - `.dev.vars`（本地敏感變數，不入版控）
2. 執行本地資料初始化
   - D1 local migrate
   - KV seed（必要設定）
3. 啟動本地 API 並驗證關鍵路由
   - `/api/settings`
   - `/api/profiles/:userId`
   - `/api/admin/verify`
   - `/api/admin/config`

#### Phase 1 執行紀錄（已完成）

- [x] `backend/api` 本地 `wrangler dev` 可啟動，綁定 D1/KV/vars 正常載入。  
- [x] 發現 `backend/api` 缺少 migrations，已補 `migrations/0000_initial_profiles_and_ux.sql`。  
- [x] 已執行 `npm run db:migrate:local`，成功建立 `profiles` table。  
- [x] 路由驗證結果：
  - `GET /api/settings` → 200
  - `GET /api/profiles/:userId`（不存在）→ 404；`PUT` 後再 `GET` → 200
  - `GET /api/admin/verify`（未帶 token）→ 401（符合預期）
  - `GET /api/admin/config`（未帶 token）→ 401（符合預期）

### Phase 2：GitHub / CI 對齊

1. 建立或更新 GitHub Secrets / Variables（Cloudflare token、account id、必要環境變數）
2. 對齊部署腳本（以 `backend/api` 為正式路徑）
3. 先做 dry-run 或非破壞式部署檢查

#### Phase 2 執行紀錄（已完成）

- [x] 新增 `.github/workflows/deploy-api.yml`：以 `backend/api` 為 working-directory，觸發為 push to main（路徑限定）或 workflow_dispatch；步驟含 `wrangler deploy --dry-run` 與 `wrangler deploy`。
- [x] 所需 Secrets 已寫入 `backend/api/README.md`（`CLOUDFLARE_ACCOUNT_ID`、`CLOUDFLARE_API_TOKEN`）及 `jobs/JOB-028-Report.md` 最小上線步驟。
- [x] 建立 `jobs/JOB-028-Report.md`，記錄 Phase 1 結果、Phase 2 清單與回滾步驟，Phase 3 待執行。

### Phase 3：正式環境切換與驗收

1. 部署至 production Worker
2. 前台與後台功能冒煙測試（settings/profile/admin）
3. 檢查 Cloudflare 後台資源狀態（Worker、D1、KV、Logs）
4. 完成後更新相關文件與報告

### 回滾方案（必備）

- 保留前一版 Worker 版本資訊
- 若新版本異常，快速回退到上一版部署
- 回滾後保留錯誤紀錄（Logs + 失敗操作步驟）

## 關鍵參考檔案

| 路徑 | 用途 |
|---|---|
| `backend/api/wrangler.toml` | Worker / D1 / KV / vars 主設定 |
| `backend/api/README.md` | API 啟動、遷移與設定流程 |
| `backend/api/src/index.ts` | API 路由與授權邏輯 |
| `.github/workflows/deploy.yml` | 前台 GitHub Pages 佈署流程（參照） |
| `jobs/JOB-020-Backend-API-Directory-Refactor.md` | API 目錄重整歷史脈絡 |
| `jobs/任務看板與派工.md` | 任務狀態管理 |

## 執行規範

- 協作流程依 `.agent/workflows/webdev.md`。
- 敏感資訊僅放在 Cloudflare/GitHub Secrets 或 `.dev.vars`，不得寫入版控。
- 不可中斷既有前台可用性；後台切換需可回滾。

## 驗證基準 (DoD)

- [ ] 本地 `backend/api` 可啟動，核心 API 路由可回應。  
- [ ] D1 migration 與 KV 設定可在本地與正式環境一致執行。  
- [ ] GitHub 部署流程可安全觸發，不暴露敏感資訊。  
- [ ] Production API 服務正常，前後台主要流程可用。  
- [ ] 完成 `jobs/JOB-028-Report.md`，附測試記錄與回滾步驟。  

