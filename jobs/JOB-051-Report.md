# JOB-051-USER-Onboarding-UX-and-Social-Studies-Fix-Report

## 1. 開發成果摘要 🚀
本任務已全面解決 V3 版本的首登引導 UX 問題，並針對社會科題庫無法使用的多重病灶進行了深層修復，系統已達到 v1.2.2 穩定狀態。

## 2. 變更詳情與技術細節

### A. 社會科 (Social Studies) 的三段式極致修復 🏛️
經過深度診斷，社會科失效並非單一原因，我採取了以下嚴謹手段：
1.  **資料層 (Data)**：執行自動化腳本掃描數百個 JSON，將 `nan_yi` ➔ `NanYi`、`社會` ➔ `SocialStudies`、`grade_3` ➔ `G3`。
2.  **配置層 (Config)**：修正 `config.ts` 中的網址代碼，將 `soc` 統一改為 `SocialStudies`，確保 URL 路由與實體資源目錄完全 1:1 對齊。
3.  **邏輯層 (Logic)**：在 `questionLoader.ts` 加入「型別自動補全」。針對部分 JSON 檔案缺少的 `"type": "multiple_choice"` 欄位，系統現在會在讀取時自動補正，避免被 UI 過濾掉。

### B. 首登流程與視覺體驗優化 🛡️👆
- **智慧選單**：首發實現根據當前月份自動預設學期（如 3 月自動選「下學期」）。
- **同步機制**：年級按鈕不再硬編碼，而是與隨時更新的 `libraryConfig` 連動。
- **Feature Tour**：手指游標位置翻轉，現在從上方精確指向盾牌 Icon，並優化了提示氣泡的視覺連結感。
- **微型 UI**：設定按鈕更換為琥珀色 Sliders 圖標，具備更高的辨識度與專業感。

## 3. 變更檔案清單 📂
| 檔案路徑 | 變更類型 | 說明 |
| :--- | :--- | :--- |
| `apps/v3_eidos/src/data/config.ts` | 修改 | 路徑代碼 `soc` ➔ `SocialStudies` |
| `apps/v3_eidos/src/data/questionLoader.ts` | 修改 | 加入缺失 `type` 欄位的自動補全邏輯 |
| `question/platform/**/*.json` | 修改 | 全球規模 Metadata 正規化 (385+ 檔案) |
| `apps/v3_eidos/src/pages/Index.tsx` | 修改 | 整合首登狀態切換與引導邏輯 |
| `apps/v3_eidos/src/components/WelcomeSetup.tsx` | 修改 | 實現月份自動判定學期邏輯 |

## 4. 單元測試與驗證紀錄 ✅
- **自動化檢查**：執行 `python3 /tmp/verify_dist.py` 確認 `dist` 目錄資料完整性 ➔ **PASS**。
- **瀏覽器測試**：使用 Subagent 模擬「三年級社會科(南一版)」從首登到開始測驗的全流程 ➔ **SUCCESS**。
- **錄影證明**：`verify_social_studies_fix_s2.webp` 已產出。

## 5. 驗收建議
1.  **本機確認**：開啟 `localhost:8081`（或您當前的 dev port）。
2.  **社會科測試**：先進入社會科，確認能看到南一版單元。
3.  **點擊挑戰**：點擊「進階挑戰」或「分課練習」按鈕，確認能順利進入測驗畫面並看到題目。

---
**提交者**：Antigravity (PM)
**日期**：2026-03-01
**版本標籤**：`v1.2.2`模式：EXECUTION
