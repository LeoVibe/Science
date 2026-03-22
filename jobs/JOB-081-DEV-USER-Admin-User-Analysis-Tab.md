# JOB-081 — 後台分析中心「使用者分析」分頁與 Admin API

*Created by Cursor at 2026-03-22*  
*Last Updated at 2026-03-22 (初版派工)*

## 任務背景

在「使用統計／裝置統計」之外，需對 **活躍天數較高** 的裝置提供更細的營運視角：依日與小時彙整活動、顯示 Edge 來源 IP、從日誌推斷年級與常點科目，並提供前往前台 **錯題／學習統計** 的連結。

## 任務詳情

1. **Worker `POST /api/activity`**：於寫入 KV `recent` 時附帶 `clientIp`（`CF-Connecting-IP` 或 `X-Forwarded-For` 首段）。
2. **Worker `GET /api/admin/activity/user-analysis`**：需 `Bearer admin_token`；Query `minDays`（預設 5）；回傳聚合後的裝置列表。
3. **前端**：`AdminUserAnalysis.tsx` + `AdminDashboard` 新增子分頁 `user_analysis`，路由 `/admin/analytics/user_analysis`。
4. **文件**：更新 `docs/後台管理架構設計.md`；完工填 `JOB-081-Report.md` 並更新看板。

## 關鍵參考檔案

| 檔案 | 用途 |
|------|------|
| `scripts/workers/api/src/index.ts` | Activity POST / insights |
| `apps/v3_eidos/src/utils/activityLogger.ts` | 日誌欄位（grade, subject…） |
| `apps/v3_eidos/src/data/config.ts` | `buildPath` 與 URL 段對照 |
| `apps/v3_eidos/src/pages/AdminDashboard.tsx` | 後台分頁定義 |

## 驗收基準 (DoD)

- [ ] 部署 Worker 後，新寫入的活動紀錄含 `clientIp`（在可取得 IP 的環境下）。
- [ ] 管理員呼叫 `user-analysis` 可取得 `minDays` 門檻以上裝置之聚合 JSON。
- [ ] 後台可切換「使用者分析」、可調門檻、可展開每日 UTC 小時時段、可開新分頁至錯題統計（路徑正確）。
- [ ] 無在 `.tsx` 中硬編碼色碼（僅 semantic／主題 class）。

## 撰寫紀錄

見本檔頂部時間戳。
