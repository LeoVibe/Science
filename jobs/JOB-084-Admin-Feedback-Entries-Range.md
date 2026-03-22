# JOB-084：後台題目回饋—時間範圍與明細列表

*Created by Cursor at 2026-03-22*  
*Last Updated at 2026-02-27 (補齊派工單欄位、驗收勾選與關鍵檔案路徑)*

## 目標

- **Worker**：`GET /api/admin/feedback/entries?range=7d|30d|all`；`GET /api/admin/feedback/stats` 支援同參數（排除 `SITE_FEEDBACK` 全站留言）。
- **前端**：`AdminFeedbackInsights` 顯示 7 日／30 日／全部、標籤對齊 `QuestionFeedback`、明細表（時間／使用者／題目／類型／留言）。

## 關鍵實作位置

| 區塊 | 路徑 |
|------|------|
| Worker 路由與篩選 | `scripts/workers/api/src/index.ts`（`feedbackQuestionFilter`、`/api/admin/feedback/stats`、`/api/admin/feedback/entries`） |
| 後台 UI | `apps/v3_eidos/src/components/admin/AdminFeedbackInsights.tsx` |
| 前台標籤對照 | `apps/v3_eidos/src/components/QuestionFeedback.tsx`（`FEEDBACK_OPTIONS`） |

## 驗收

- [x] 本機 Worker 可取得明細 JSON（`GET .../entries?range=7d|30d|all`）。
- [x] 切換範圍後統計與表格同步更新（同一 `range` 呼叫 `stats` 與 `entries`）。
