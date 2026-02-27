# Eidos Project 開發演進紀錄

> **撰寫規範**：每筆紀錄格式為 `- YYYY-MM-DD：{摘要} -> {說明} *(by {撰寫者})*`。
> 撰寫者請填入 `AG` (Antigravity)、`Cursor` 或 `PM` (人類管理者)，以便追溯每筆異動的來源。

- 2026-02-26：Cloudflare Pages (exam15.pages.dev) 設定說明 -> 新增 `docs/cloudflare-pages-exam15.md`，說明根路徑部署需設 VITE_APP_BASE=/、VITE_API_URL 與 Build 設定。 *(by Cursor)*
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
