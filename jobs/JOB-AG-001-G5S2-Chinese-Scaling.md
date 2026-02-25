# JOB-AG-001: 五下國語高品質題庫擴充 (G5 S2 Chinese Scaling)

## 📌 任務背景
依據 `knowledge/G5_S2_Curriculum_Master.md`，目前五下國語科的進度標示為「執行中」。早期已生成高品質的 CSV 題庫版本，但尚未完整轉換為平台可拔插的 JSON 格式（含 `manifest.json`）並佈署至 `question/platform/`。

## 📖 實作規格
### 1. 資源盤點與擷取
*   **目標目錄**：`docs/research/output_Gemini/` 或 `knowledge/` 尋找南一、康軒、翰林版本的五下國語 CSV/JSON 原始資料。
*   **預期輸入**：需包含字音字形、詞義、文意理解等多元題型的題庫源檔案。

### 2. 資料清洗與轉換 (Data Engineering)
*   **L4 標準對齊**：確保所有題目包含精確的 `scenario` （情境描述）與 `commonMisconception`（迷思診斷）。
*   **題數與難度要求**：每單元至少 8-12 題，覆蓋 L1(記憶) 到 L4(分析評價) 的認知層次。
*   **去特徵化 (De-Characterization)**：檢查轉換後的 JSON，避免正確選項字數明顯長於錯誤選項。

### 3. 系統佈署 (Deployment)
*   建立對應版本的 `manifest.json`。
*   將轉換完成的 `{課次ID}_{標題}.json` 寫入 `question/platform/G5/Chinese/S2/{Publisher}/` 結構中。

## 📅 執行狀態與日誌
*   [ ] **階段一**：南一版五下國語 (NanYi) 轉換與擴充。
*   [ ] **階段二**：康軒版五下國語 (KangHsuan) 轉換與擴充。
*   [ ] **階段三**：翰林版五下國語 (HanLin) 轉換與擴充。
*   [ ] **階段四**：更新 `G5_S2_Curriculum_Master.md` 狀態為 ✅ 已完工。

---
*Assigned to: AG (Antigravity)*  
*Created at: 2026-02-23 21:05*
