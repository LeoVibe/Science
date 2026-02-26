*Created by Cursor at 2026-02-26 20:25*  
*Last Updated at 2026-02-26 21:15 (Cursor: 完成 JOB-020 實作與驗證，更新 DoD)*

# JOB-020：後端 API 目錄重整（`scripts/workers/api` → `backend/api`）

## 任務背景

目前 API 服務程式位於 `scripts/workers/api`。隨著系統演進，該服務已不只是一次性腳本，而是長期維運的後端能力。  
為了與 `apps/*` 的專案分層對齊，需將 API 專案重整至 `backend/api`，提升語意清晰度與後續擴展性。

## 任務詳情

1. 目錄遷移
   - 將 `scripts/workers/api` 專案搬移為 `backend/api`。
   - 保留原本 `wrangler`、`package`、`src` 結構，避免同時做功能改寫。

2. 參照與指令同步
   - 更新所有文件與指令中對舊路徑 `scripts/workers/api` 的引用。
   - 確保本機開發命令、部署命令、README 指引均指向新路徑。

3. 相容與風險控制
   - 若有必要，保留舊路徑短期遷移說明檔（非雙份程式碼）。
   - 不變更 API 對外行為（路由與回傳格式應維持一致）。

4. 驗證
   - 在新路徑下可正常啟動 worker（至少本機 dev）。
   - 前端仍可連到 `/api/settings`、`/api/admin/*` 等既有端點。

## 關鍵參考檔案

| 路徑 | 用途 |
|---|---|
| `scripts/workers/api/src/index.ts` | 現行 API 主程式 |
| `scripts/workers/api/wrangler.toml` | 現行 Cloudflare 綁定設定 |
| `scripts/workers/api/README.md` | 現行啟動/部署說明 |
| `apps/v3_eidos/src/data/api.ts` | 前端 API 呼叫路徑（驗證遷移後不受影響） |
| `jobs/任務看板與派工.md` | 派工流程與回報規範 |
| `README.md` | 專案目錄地圖需同步更新 |

## 執行規範

- 協作流程依 `.agent/workflows/webdev.md`。
- 本工單只做結構重整與路徑同步，不做功能需求擴張。
- 不得產生根目錄一次性腳本與臨時檔。
- 若變更專案目錄地圖，需同步更新 `README.md` 相關段落。

## 風險與回滾策略

- 主要風險
  - CI/CD 或部署腳本仍指向舊路徑，導致部署失敗。
  - 本機開發指令與文件未同步，造成協作混亂。

- 回滾策略
  - 遷移採單次提交，若部署驗證失敗可直接回退該提交。
  - 在驗證完成前，保留舊路徑遷移提示檔（非雙份程式碼），降低切換期間混淆。
  - 若需緊急恢復，先恢復舊路徑指向與部署腳本，待下一輪再遷移。

## 驗證基準 (DoD)

- [x] `backend/api` 專案結構完整且可啟動。  
- [x] API 既有端點行為不變（`/api/settings`、`/api/admin/*` 可用）。  
- [x] 文件與指令已無舊路徑殘留（至少 README/jobs/相關 setup doc）。  
- [x] `apps/v3_eidos` 測試與建置不受影響（`npm run test`、`npm run build`）。  
- [x] 產出 `jobs/JOB-020-Report.md`，含遷移清單、風險與回滾說明。  

