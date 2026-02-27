*Created by AG at 2026-02-27 14:27*
*Last Updated at 2026-02-27 14:27 (Initial Creation)*

# JOB-032: API 環境變數重整與 URL 修復

## 任務背景
本機開發環境與線上正式環境的 API 指向混亂，導致開發者無法測試雲端資料，且線上版誤指向 localhost。

## 任務詳情
1. 修正 `.env.local` 與 `.env.development` 中的 `VITE_API_URL`。
2. 重構前端所有 API 請求，統一使用 `getApiBaseUrl()` 輔助函數取代硬編碼。
3. 驗證正式 Worker URL `https://eidos-api.eidosedu.workers.dev` 的可用性。

## 關鍵參考檔案
| 檔案 | 說明 |
| --- | --- |
| `apps/v3_eidos/src/data/api.ts` | API 基礎邏輯 |
| `docs/cloudflare-pages-exam15.md` | 部署手冊 |

## 驗證基準 (DoD)
- [x] 前端不再含有 `http://localhost:8787` 的硬編碼回退 (fallback)。
- [x] 線上版 API 請求指向 `eidosedu.workers.dev`。
- [x] `AdminFeedbackInsights` 能在生產環境正確獲取數據。
