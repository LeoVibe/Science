# JOB-084 完工報告

*Last verified: 2026-02-27*

## 開發成果摘要

- **Worker**：`feedbackQuestionFilter(range)` 排除 `question_id = 'SITE_FEEDBACK'`，並依 `7d`／`30d`／`all`（或缺省）過濾 `created_at`；`GET /api/admin/feedback/stats` 與 `GET /api/admin/feedback/entries` 共用同一篩選；`entries` 依 `created_at` 倒序、`limit` 上限 500。
- **前端**：`AdminFeedbackInsights` 提供 7 日／30 日／全部切換；`TAG_LABELS` 涵蓋現行與舊版 tag；明細表欄位：時間、使用者、題目 ID、回饋類型、留言；樣式使用語意色（`card`／`primary`／`muted` 等）。

## 變更檔案清單（本任務對應之既有實作）

| 檔案 | 說明 |
|------|------|
| `scripts/workers/api/src/index.ts` | `feedbackQuestionFilter`、`/api/admin/feedback/stats`、`/api/admin/feedback/entries` |
| `apps/v3_eidos/src/components/admin/AdminFeedbackInsights.tsx` | 範圍切換、統計卡、熱點、明細表 |
| `apps/v3_eidos/src/pages/AdminDashboard.tsx` | 註冊「題目回饋」分頁 |

## 單元測試／建置紀錄

- `apps/v3_eidos`：`npm run build` — **通過**（2026-02-27）。

## PM 驗收建議

1. **本機**：`cd backend/api && npx wrangler dev`（或專案慣用之 Worker 啟動方式），以管理員 Bearer 呼叫：
   - `GET /api/admin/feedback/stats?range=7d`
   - `GET /api/admin/feedback/entries?range=30d&limit=50`
   - 確認 JSON 不含 `question_id === 'SITE_FEEDBACK'` 之列。
2. **後台**：登入後 → 分析中心 → **題目回饋**，切換「7 日內／30 日內／全部」，確認上方統計與下方明細表一併更新。

## 備註

- 使用者點選的「選項」以 **tag（回饋分類）** 呈現；若需記錄 **A/B/C/D 選項**，需另行擴充 `POST /api/feedback` 欄位。
