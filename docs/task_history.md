# 📅 Project Eidos 開發歷程 (Task History)

本文件紀錄專案的開發軌跡、關鍵決策與技術進展。

### [2026-02-27] AI 專家說：R2／R3／R1 與學期差異 (JOB-086)
- **完成**：`getSubjectPrincipleContent` 納入學期參數；抽離 R2 科總綱、R3 本冊焦點、R1 年段配比；`InsightDrawer` 分區呈現；三年級國語依學期切換標題與第三段敘事。

### [2026-02-27] G6 下學期國語題庫路徑對齊 (JOB-085)
- **原因**：題庫放在 `G6/Chinese/出版社/`，缺少 `S2` 層，導致 `generate_library_stats.js` 未掃到、`libraryStats` 無六年級國語；與 `questionLoader` 預期路徑不一致。
- **完成**：改為 `G6/Chinese/S2/{KangHsuan,NanYi,HanLin}/`；更新相關 scripts；重產 `libraryStats.json`。

### [2026-03-22] 後台分析中心「使用者分析」與 Activity IP (JOB-081)
- **完成項目**：
  - Worker：`POST /api/activity` 寫入 `clientIp`（CF-Connecting-IP / X-Forwarded-For）；新增 `GET /api/admin/activity/user-analysis`（管理員 Bearer），聚合活躍天數門檻以上裝置之日／UTC 小時時段、IP、日誌推斷年級與常點科目、錯題統計路徑。
  - 前端：`AdminUserAnalysis` 子分頁（`/admin/analytics/user_analysis`）。
  - 更新 `docs/後台管理架構設計.md`。
- **關鍵決策**：
  - 錯題統計連結依日誌最近一次完整課程脈絡（年級／科目／學期／出版社）產生，統計內容仍為使用者瀏覽器本機資料，非伺服器端帳號級報表。

### [2026-03-22] Eidos 上版前總體驗證與未結任務清查 (JOB-080)
- **完成項目**：
  - 執行 P1-P4 自動化測試與建置檢查，皆符合預期（Lint 錯誤屬預期中技術債）。
  - 使用 browser_subagent 完成 E1-E5, V1-V4 瀏覽器端 E2E 網頁操作與 RWD 視覺驗證，功能正常（確認正式設定檔未對六年級開放屬預期之內）。
  - 驗證正式機 `eidos-api.eidosedu.workers.dev` 的 `/api/settings` 與 `/api/feedback` 的連通性與寫入功能。
  - **Mismatch 173 題交叉分析**：查明 JOB-079 所遇之翰林 L10 等嚴重錯題，為主引擎讀取的 R4 課綱與實際課文不匹配導致的 `question_issue`，並非 AI 答題能力問題。
  - **JOB-075 國語盲測擴編**：重修盲審腳本支援 G6 矩陣，對六下康軒、南一、翰林國語使用 v5 引擎驗證，取得 97.9% 吻合率 (141 Match, 3 Mismatch)。
  - 清理 `docs/reports/` 中多餘的報告，並執行全站狀態 `/dosync`。
- **關鍵決策**：
  - 核心功能一切完備，可啟動 Cloudflare 雙站聯合正式上版程序。

---

### [2026-03-21] CQI v2 評分體系重構與 G6S2 康軒國語盲測 (JOB-072, JOB-073)
- **完成項目**：
  - 更新 `evaluate_question_quality.js` 的 CQI 四維配分至七維度 (v2)。新增：易讀性檢定、情境標籤檢測、文化公平性(扣分制)。
  - 在 `GEMINI.md` 建立全站變更追溯規範 (`last_updated`, `updated_by`)。
  - 執行 G6S2 康軒國語題庫 (L1-L6, L8, L10, L11) 的盲測。
  - 批次更新 41 題的驗證欄位 (`cqi_score`, `authoring_model`, `verifying_model`)，且盲審 100% Match。
- **關鍵決策**：
  - 題庫驗證過程正名為「盲審驗證 (Blind Evaluation)」。
  - L2 出現選項分佈偏差 (Position Bias) 促成後續須落實 `auto_balance_json.js` 的結論。
  - 同一 LLM 邏輯框架驗證為「單盲」，建議抽查核定。

---

### [2026-03-21] G3S2 南一版自然 U4 題數補強與品質驗證
- **完成項目**：
  - 發現南一版三年級下學期自然第四單元（廚房中的科學）僅有 4 題漏建，依據 R3/R4 發展綱要增補 26 題。
  - 通過品質校驗，全單元 30 題達 L4 等級（CQI 8.25）。
  - 已更新 `manifest.json` 與全站狀態表 `libraryStats.json`。
- **關鍵決策**：
  - 加強廚房安全規範、酸鹼指示劑顏色預測與溶解質量守恆等生活實作情境陷阱。

### [2026-03-20] G6S2 自然科研發與發展規劃 (JOB-066)
- **完成項目**：
  - 建立 G6S2 自然科「R3 原始研究素材庫」，涵蓋三大版本課程對照，引用 TASA 迷思研究（實驗變因、能量金字塔、電磁鐵極性）。
  - 通過 CK-01 ~ CK-06 自我審計閘門。
  - 萃取「R4 發展綱要」，制定 2-4-4 認知配比命題矩陣，並針對「實驗除錯」設計 AI Prompt 模板。
- **關鍵決策**：
  - 自然科高年級強調「探究與實作」，至少 30% 題目指向控制變因除錯。
  - 嚴格區分「熱效應」與「磁效應」之生活場景應用。

---

### [2026-03-20] G6S2 社會科研發與架構規劃 (JOB-064)
- **完成項目**：
  - 建立 G6S2 社會科「R3 原始研究素材庫」，統整康/翰/南三大版本課綱與學術迷思（如時空錯置、倒果為因）。
  - 通過 CK-01 ~ CK-06 自我審計閘門。
  - 萃取「R4 發展綱要」，制定 2-4-4 認知配比命題矩陣與 AI Prompt 模板。
- **關鍵決策**：
  - 高年級社會科加強「史地因果」與「公民決測」比重，場景題占比提升至 40%。
  - 強制引入 `【在...情境下】` 標籤以提升認知代入感。

---

### [2026-03-20] G6S2 國語科高品質題庫完結 (JOB-062)
- **完成項目**：
  - 完成六下國語 R4 發展綱要與 L4 成熟度題庫產出。
- **備註**：作為高年級題庫品質標竿。

### [2026-03-22] 後台分析中心分頁重排與留言／使用者統計 API (JOB-082)
- **完成項目**：分析中心順序為 留言回饋 → 題目回饋 → 使用者統計 → 使用者分析 → 使用統計 → 操作日誌；Worker 新增 `GET /api/admin/site-feedback`、`GET /api/admin/activity/user-stats`；user-analysis 附 `summary`；QuizView 寫入 `answer_question`。
- **關鍵決策**：「使用者數」以 deviceId 估算；全站留言沿用 D1 `SITE_FEEDBACK` 寫入方式。


### [2026-03-22] 後台題目回饋明細與 7/30 日篩選 (JOB-084)
- **完成項目**：`GET /api/admin/feedback/entries`；`stats` 支援 `range`；`AdminFeedbackInsights` 明細表與標籤對齊前台。


### [2026-02-27] 後台使用者分析表格 UX 與裝置註記（JOB-089）
- **完成項目**：`user-analysis` 裝置聚合新增 `answerWrongRatio`（由 `answer_question`/`correct` 計算）；`AdminUserAnalysis` 改為標籤式欄位、短裝置 ID、錯題比例與統計連結圖示；本機 `eidos_admin_device_labels` 與 `AdminUserStats` 註記管理共用。
- **部署**：需重新部署 Worker 後比例欄位才會自 API 回傳。

### [2026-02-27] 分析中心分頁更名與使用者統計快篩（JOB-090）
- **完成項目**：📊→營運統計、👥→使用者統計；裝置明細 24 小時制、快篩 1/7/30/90/All 不重複數與列表篩選；insights API 回傳 `uniqueUsers`。
