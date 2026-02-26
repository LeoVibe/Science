*Created by Cursor at 2026-02-26 20:35*  
*Last Updated at 2026-02-26 21:16 (Cursor: 補齊 DoD 更新與最終檔案清單)*

# JOB-020 完工報告：後端 API 目錄重整（scripts/workers/api → backend/api）

## 開發成果摘要

- 完成 `backend/api` 後端專案入口建立，將 API 服務正式定位到 `backend/api` 目錄。
- 新增 `backend/api/src/index.ts` 遷移入口，先委派至既有 API 邏輯，確保目錄重整期間對外端點行為不變。
- 新增新路徑所需設定檔（`package.json`、`wrangler.toml`、`.dev.vars.example`、`README.md`），可直接於新目錄執行安裝與啟動。
- 舊路徑 `scripts/workers/api/README.md` 改為遷移提示，避免雙份維護文件內容造成混淆。
- 同步更新根目錄 `README.md` 目錄地圖、`jobs/任務看板與派工.md` 狀態與 `docs/task_history.md` 歷程紀錄。
- 對應派工單：`jobs/JOB-020-Backend-API-Directory-Refactor.md`

## 變更檔案清單

| 檔案 | 變更類型 | 說明 |
|---|---|---|
| `backend/api/package.json` | Add | 新增後端 API 專案 package 與 wrangler scripts |
| `backend/api/package-lock.json` | Add | 安裝依賴後鎖定版本，確保環境可重現 |
| `backend/api/wrangler.toml` | Add | 新增 Worker 綁定設定（D1/KV/vars） |
| `backend/api/.dev.vars.example` | Add | 新增本地開發環境變數範本 |
| `backend/api/README.md` | Add | 新路徑啟動與遷移說明 |
| `backend/api/src/index.ts` | Add | 新路徑 API 入口（遷移相容委派） |
| `scripts/workers/api/README.md` | Update | 舊路徑改為 Legacy Notice，指向 `backend/api` |
| `README.md` | Update | 專案目錄地圖新增 `backend/api` |
| `jobs/任務看板與派工.md` | Update | `JOB-019` / `JOB-020` 狀態更新為 DONE |
| `jobs/JOB-020-Backend-API-Directory-Refactor.md` | Update | DoD 核取狀態改為已完成 |
| `docs/task_history.md` | Update | 補記 `JOB-020` 完工歷程 |

## 單元測試紀錄

- `apps/v3_eidos`：
  - `npm run test` ✅ 通過
  - `npm run build` ✅ 通過
- `backend/api`：
  - `npm install` ✅ 完成依賴安裝
  - `npm run deploy -- --dry-run` ✅ 可執行（驗證 wrangler 專案配置可被正確讀取）

## PM 驗收建議

1. 在 `backend/api` 執行 `npm run dev`，確認 Worker 可啟動且路由包含 `/api/settings`、`/api/admin/*`。
2. 啟動前端後實測：
   - 首頁載入設定 (`/api/settings`) 正常；
   - 後台登入後可進入管理頁 (`/api/admin/verify` 正常)；
   - 後台設定儲存 (`/api/admin/config`) 正常。
3. 開啟 `scripts/workers/api/README.md`，確認有清楚遷移提示，避免開發者再以舊路徑作為主入口。
4. 若部署腳本外部仍引用舊路徑，先改為 `backend/api`；若遇緊急回滾，維持舊路徑入口可作短期過渡，待下一波再移除。

