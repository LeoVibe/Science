# Eidos Project 開發演進紀錄

> **撰寫規範**：每筆紀錄格式為 `- YYYY-MM-DD：{摘要} -> {說明} *(by {撰寫者})*`。
> 撰寫者請填入 `AG` (Antigravity)、`Cursor` 或 `PM` (人類管理者)，以便追溯每筆異動的來源。

- 2026-03-08：JOB-039 三年級下學期國語題庫擴充 -> 全面完成 G3S2 國語科（康軒、翰林、南一）題庫擴編。補齊康軒 L3 與南一 L8 品質缺口，所有課次皆達 30 題以上並符合大腦友善出題原則，更新 libraryStats。 *(by AG)*
- 2026-03-01：JOB-054-V3 介面文字校準與原則增訂 -> 還原 L3 為「考古題庫」描述，移除 v2_currisite 連結，並在 Manifesto 中增訂 UI 文案變動必須列出對照表且預先核准之規範。 *(by AG)*
- 2026-03-01：JOB-054-V2 介面文字「去我化」校準 -> 修正前次過於專業化的問題。在保留育兒實驗溫情的前提下，移除「自我優越感」並優化「問題回報」選項與「關於本站」AI 小助手描述。 *(by AG)*
- 2026-03-01：JOB-054 介面文字「去我化」優化 -> 大規模移除 UI 中過多的人稱代名詞「我」，將初衷敘述與命題原則轉化為更專業且客觀的系統語氣，提升品牌整體專業感。 *(by AG)*
- 2026-03-01：JOB-053 G3S2 自然與數學題庫擴編 -> 完成科學 (120 題) 與數學 (360 題) 之 L4 高品質擴量，解決單一版本題數不足問題。導入二維表格報讀與小數進位迷思診斷，全數通過 QG 品質門檻。 *(by AG)*
- 2026-03-01：JOB-051 首登 UX 修正與社會科存取修復 -> 修復 `config.ts` 與 `questionLoader.ts` 的社會科路徑與資料自動補正，實現月份自動判定學期、以及更精準的手指導引 (👆🛡️)，系統進入 v1.2.2 穩定版。 *(by AG)*
- 2026-03-01：JOB-050 首登引導優化與全站題庫表視角 -> 實作 `WelcomeSetup.tsx` 整合引導流程與教育理念，並將 `AboutView.tsx` 題庫統計改為跨年級全視角，對接 `libraryConfig` 自動過濾失效科目。 *(by AG)*
- 2026-03-01：JOB-043 / JOB-045 英語與生活科研究及原則整合 -> 完成英語、生活科之 Pedagogical Goals 研究，並將跨科目出題原則動態整合至前端顯示機制。 *(by AG)*
- 2026-02-28：JOB-036 / JOB-038 / JOB-042 首波批次完工 -> 測驗按鈕字體放大與進階題數連動（MainMenu + storage maxQuizQuestions）、綜合練習顯示總題數；關於頁新增「研究深探」分頁與兩篇固定文章、點讚/留言（localStorage）；OnboardingModal（hasSeenValueOnboarding）、InsightDrawer（4-4-2 說明）、IntentionTooltip（解析旁設計意圖氣泡），並在 Modal 中引導至研究深探。 *(by Cursor)*
- 2026-02-28：大腦友善 (Brain-Friendly) 出題三原則導入 -> 以國小兒童認知神經科學為基石，全面翻修 `README_出題設計準則.md`，將防呆法規優化為「同理心投射法」、「合理化迷思法」及「語氣延展法」，並提出情境提示的認知滿載解方。 *(by AG)*
- 2026-02-28：選項長度限制放寬與防猜機制優化 -> 修改 `README_出題設計準則.md` 與 `evaluate_question_quality.js`。取消單題強制等長（誤差 <15%）的扣分限制，改為「只要最長選項不是正確解答」即獲得 CQI 滿分，並保留全檔 40% 的最長解答上限作為 L1-BIAS 攔截。 *(by AG)*
- 2026-02-27：JOB-034 三年級國語題庫精煉與品質防呆擴充 -> 完成《出題設計準則》防呆編寫規範更新（情境推進法、細節錯置法、全形空白微調法），並成功以《拔不起來的筆》為例改寫 12 題干擾選項，通過 CI 驗證。 *(by AG)*
- 2026-02-27：正式遷移部署至 Cloudflare Pages (exam15.pages.dev) -> 執行 v3_eidos Direct Upload 部署，建立 `docs/cloudflare-pages-exam15.md` 並同步更新全站文檔連結及 .env 設定。 *(by Cursor)*
- 2026-02-27：Science 子路徑一致化方案實作 -> 以 withBase 統一站內路徑、Vite history 中介支援 base、歷史 E2E 改相對路徑並新增「About 連結可成功打開歷史頁」檢查、撰寫 `docs/github-pages-子路徑部署驗證SOP.md`。 *(by Cursor)*
- 2026-02-26：建立全域文檔生態系與 AI 實作守則 -> 重構文件職責，確立 `網站功能規格書.md` 為 UI 唯一真理，建立 `.cursorrules` 與 `/sync`, `/audit` AI Skills。 *(by AG)*
- 2026-02-26：實作 Warm Amber 暖調琥珀 UI 與功能防護 -> 全站色彩降飽和升溫、修復並撰寫 E2E 防止「題庫中無此題」Bug 回歸、題庫總覽過濾當前年級學期。 *(by AG)*
- 2026-02-26：JOB-023 Science 子路徑一致化 -> 新增 base-safe 路徑 helper、修正 `/Science` 子路徑下歷史入口與相容橋接跳轉，補齊歷史路徑回歸測試與部署驗收 SOP。 *(by Cursor)*
- 2026-02-27：JOB-024 v2 Currisite 題庫路徑相容修復 -> 將 v2 題庫載入改為優先讀取 `question/platform` 並保留 `questions/platform` fallback，重建並同步歷史資產，修復「有題庫卻顯示建置中」問題。 *(by Cursor)*
- 2026-02-27：JOB-025 本機歷史路由 404 修復 -> About 歷史連結改為明確 `index.html`，並在 App 路由新增歷史入口 fallback，修復本機 `/Science/history/*` 落入 SPA 404 的問題。 *(by Cursor)*
- 2026-02-27：JOB-026 環境參數化路徑策略 -> v3 改為 `VITE_APP_BASE` 控制 base，v2 改為 `VITE_QUESTION_BASE` 控制題庫根路徑，移除 runtime `/Science` 判斷，統一路徑差異由 `.env` 管理。 *(by Cursor)*
- 2026-02-26：JOB-021 後台版面與更版資訊重整 -> 後台題庫列移除 CQI 字樣並將審查按鈕獨立，前台重整 0.8/0.9/1.0 更版節點並確認 v1.0 正式版定位。 *(by Cursor)*
- 2026-02-26：JOB-022 歷史版相容修復 -> 保留 `/history/v0.1/` 與 `/history/v0.5/` 入口，改為相容橋接導向主站可用流程，確保最小改動下可完整操作。 *(by Cursor)*
- 2026-02-26：JOB-020 後端 API 目錄重整 -> 建立 `backend/api` 作為正式 Worker API 專案路徑，補齊新路徑設定檔並保留舊路徑遷移提示，完成文件與派工狀態同步。 *(by Cursor)*
- 2026-02-26：JOB-018 UAT 全面修復（單波）-> 完成 Admin server verify、題庫開關改為 API/KV 同步、QuizProgress 續答、深連結防呆、ErrorBoundary、questionLoader 錯誤分流、學習報告移除 MOCK 與清除資料擴充；並通過前端 test/build。 *(by Cursor)*
- 2026-02-25：V1/V2 歷史版本遷移與統整 -> 將 v0.1 與 v0.5 移入獨立的子網頁（如 `/history/v0.1/`），不與主系統衝突。 *(by Cursor)*
- 2026-02-25：專案日誌與雜訊清理 -> 刪除過期 `evaluate_all.log`，導入隱藏目錄 `.logs/` 並修改 `.gitignore`。 *(by Cursor)*
- 2026-02-25：三年級下學期英文題庫擴充 -> 加入康軒、翰林、南一 L4 等級題庫，實作多軌品質閘門。 *(by AG)*
- 2026-02-24：明確化品質指標 (QG vs CQI) -> 釐清 QG 為 L1-L5 等級，CQI 為細部評分權重機制，並更新協作指引。 *(by AG)*
- 2026-02-24：Git 工作流程與防呆機制導入 -> 配置 Git pre-commit hook (搭配 `evaluate_question_quality.js`) 強制攔截未達品質標準的題目提交。 *(by AG)*
- 2026-02-24：自動化測試 E2E 架構建立 -> 導入 Playwright 進行終端測試，確認 V3 系統主流程健康度。 *(by AG)*
- 2026-02-23：題库統計表與格式規範化 -> 建立全專案一致的學期題庫統計表結構 (如 `題庫統計表_legacy.md`)，並支援本機紀錄暫存與同步。 *(by AG)*
