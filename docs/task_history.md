# Eidos Project 開發演進紀錄

> **撰寫規範**：每筆紀錄格式為 `- YYYY-MM-DD：{摘要} -> {說明} *(by {撰寫者})*`。
> 撰寫者請填入 `AG` (Antigravity)、`Cursor` 或 `PM` (人類管理者)，以便追溯每筆異動的來源。

- 2026-02-26：建立全域文檔生態系與 AI 實作守則 -> 重構文件職責，確立 `網站功能規格書.md` 為 UI 唯一真理，建立 `.cursorrules` 與 `/sync`, `/audit` AI Skills。 *(by AG)*
- 2026-02-26：實作 Warm Amber 暖調琥珀 UI 與功能防護 -> 全站色彩降飽和升溫、修復並撰寫 E2E 防止「題庫中無此題」Bug 回歸、題庫總覽過濾當前年級學期。 *(by AG)*
- 2026-02-26：JOB-020 後端 API 目錄重整 -> 建立 `backend/api` 作為正式 Worker API 專案路徑，補齊新路徑設定檔並保留舊路徑遷移提示，完成文件與派工狀態同步。 *(by Cursor)*
- 2026-02-26：JOB-018 UAT 全面修復（單波）-> 完成 Admin server verify、題庫開關改為 API/KV 同步、QuizProgress 續答、深連結防呆、ErrorBoundary、questionLoader 錯誤分流、學習報告移除 MOCK 與清除資料擴充；並通過前端 test/build。 *(by Cursor)*
- 2026-02-25：V1/V2 歷史版本遷移與統整 -> 將 v0.1 與 v0.5 移入獨立的子網頁（如 `/history/v0.1/`），不與主系統衝突。 *(by Cursor)*
- 2026-02-25：專案日誌與雜訊清理 -> 刪除過期 `evaluate_all.log`，導入隱藏目錄 `.logs/` 並修改 `.gitignore`。 *(by Cursor)*
- 2026-02-25：三年級下學期英文題庫擴充 -> 加入康軒、翰林、南一 L4 等級題庫，實作多軌品質閘門。 *(by AG)*
- 2026-02-24：明確化品質指標 (QG vs CQI) -> 釐清 QG 為 L1-L5 等級，CQI 為細部評分權重機制，並更新協作指引。 *(by AG)*
- 2026-02-24：Git 工作流程與防呆機制導入 -> 配置 Git pre-commit hook (搭配 `evaluate_question_quality.js`) 強制攔截未達品質標準的題目提交。 *(by AG)*
- 2026-02-24：自動化測試 E2E 架構建立 -> 導入 Playwright 進行終端測試，確認 V3 系統主流程健康度。 *(by AG)*
- 2026-02-23：題库統計表與格式規範化 -> 建立全專案一致的學期題庫統計表結構 (如 `題庫統計表_legacy.md`)，並支援本機紀錄暫存與同步。 *(by AG)*
