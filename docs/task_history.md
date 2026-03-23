# 📅 Project Eidos 開發歷程 (Task History)

本文件紀錄專案的開發軌跡、關鍵決策與技術進展。

### [2026-03-23] G6 南一路徑與題庫導覽 UX (JOB-096)

- **路徑**：`NanI`→`NanYi`、`Mathematics`→`Math`；補南一數學／社會 `manifest.json`。
- **UX**：`library_config` 未開放之科目，頁首 pill 反灰、`disabled`，`handleSubjectChange` 防呆。

### [2026-03-23] 全站品質審計與管線對齊 (JOB-098)

- **修復內容**：解除研究天花板鎖死與選項長度偏差（BIAS），提升跨學科題庫的一致性與可評分性。
- **統計一致性**：修正 `scripts/evaluate_question_quality.js` 的 Meta 擷取，確保品管評分與統計輸出一致。

### [2026-03-23] 六下題庫導覽與分課題數修正 (JOB-099)

- **可用性判斷**：新增 `libraryAvailability.ts`，以 `libraryStats.publisherStats` 的上架題數門檻控制導覽可用性。
- **題數推導**：`questionLoader.ts` 在 manifest 缺少有效 count 時，改由 loaded questions 的 title 類別加總推導題數。
- **前台行為**：`Index.tsx` 在不可用組合時自動切換科目並提示，且題庫載入改採正確分課題數策略。

### [2026-03-23] 六下社會/自然題數補齊與品質精修 (JOB-100)

- **題數與素材對齊**：補齊 manifest 與重產 `libraryStats.json`，使進度彙整數字回升。
- **品質管線**：完成 L4 精修管線，使成熟度與數據回填符合預期。

### [2026-03-23] 小三下社會題庫 (翰林/康軒) 品質審計與修復 (JOB-092)

- **核心修復**：解決翰林版 U1-U6 選項後綴污染（「這點在實務上很重要」等 AI 幻覺語句）與 `answer_index` 逻辑錯位問題。
- **康軒重構**：康軒版 U1 因原始內容高度重複，重構為 30 題包含地名由來、區域特色與公民意識的高品質 (L5) 題目。
- **品質驗證**：執行全量盲測 (Blind Evaluation)，手動導正 16 題逻辑爭議題（如安全 vs 習慣培養），最終達成 12 個 JSON 單元邏輯 100% 吻合。
- **文檔同步**：更新 `prj_status.md` 與 `進度彙整` 表格，標記社會科成熟度為 L5。

### [2026-03-23] G6 題庫納入 v3 public，修復正式站 manifest 404 (JOB-095)

- **根因**：`question/platform/G6` 未同步至 `apps/v3_eidos/public/`，Pages 建置產物無 `/question/platform/G6/.../manifest.json`。
- **處置**：納入 G6 靜態檔；`prebuild` 執行 `scripts/sync_v3_public_g6_question.mjs`；另修 G4 康軒 L7 是非題補 `options` 以通過 pre-commit 抽測。

### [2026-03-23] AI 專家說：出題規劃文案與家長向語氣 (JOB-094)

- **UI**：「學習規劃」改為「出題規劃」；引導說明改為三卡語意（選考點／本冊鎖定／家長可觀察能力）。
- **資料**：`subjectPrincipleContent` 國語三卡標題與正文重寫；國語各冊 `R3` 改為教師視角淺白說明；六下國語 `R2` 覆寫、`R1` 改為給家長的實務提問示例。

### [2026-03-23] 對齊 `.cursorrules`、README 索引與全域偏好

- **`.cursorrules`**：與 `README.md`、`.cursor/rules`、`docs/` 路徑一致；前端必讀改為 `docs/技術設定/前端開發與AI實作守則.md` + `docs/網站功能規格書.md`；任務收尾以 **`/dosync`** 為準並說明與舊稱 `/sync` 的關係；納入繁中、變更追溯、回覆末行指令回報、檔名與 commit 語言等個人偏好。
- **`README.md`**：修正誤植之 `docs/技術設定/網站功能規格書.md`（實際為 `docs/網站功能規格書.md`）；補上前端守則、`.cursorrules`、任務看板、`dosync` 技能索引。
- **`docs/技術設定/前端開發與AI實作守則.md`**：`/sync` 用語改為 `/dosync`；補 `last_updated`／`updated_by`。


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
