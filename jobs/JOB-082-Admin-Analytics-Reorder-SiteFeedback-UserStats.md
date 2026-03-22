# JOB-082：後台分析中心分頁重排、留言回饋 API、使用者統計

## 目標

1. **留言回饋**：前台全站留言（`question_id=SITE_FEEDBACK`）可在後台「留言回饋」分頁檢視；補上 Worker `GET /api/admin/site-feedback`。
2. **分頁順序**：分析中心依序為 — 留言回饋 → 題目回饋 → 使用者統計 → 使用者分析 → 使用統計 → 操作日誌。
3. **使用者統計**：新增 `GET /api/admin/activity/user-stats`（管理員），回傳近 1/7/30 日不重複裝置數、近 30 日年級分佈、答題事件統計。
4. **使用者分析**：API 附帶 `summary`（近 30 日科目／年級科目熱點、活躍日數排名）；列表依活躍天數排序並顯示排名。
5. **答題紀錄**：`QuizView` 於確認選項時 `logActivity('answer_question', …)` 供後台統計。

## 驗收

- [ ] 本機 Worker 啟動後，後台「留言回饋」可載入 D1 留言。
- [ ] 「使用者統計」顯示 1/7/30 日數字與年級分佈。
- [ ] 「使用者分析」顯示摘要卡片與裝置排名；答題後 KV 有 `answer_question` 事件。
- [ ] `npm run build`（`apps/v3_eidos`）通過。

## 依賴

- `backend/api` / `scripts/workers/api` 同一份 Worker 程式。
