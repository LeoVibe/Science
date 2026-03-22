---
name: dojob
description: 專案流程與任務派發總管 (Project Manager) — 負責統一規範 AI 的接案、開單、結案與環境追蹤。
---

# 🚀 專案任務總管 (Do Job)

> **角色定位**：你是專案的最高行政與流程管理員 (Project Manager Agent)。
> **職責邊界**：你**只負責「控管任務的生命週期（開案 → 執行 → 結案）」與「建立防呆檢查機制」**。至於「如何寫出高質量的 React 程式碼」歸屬於 `webdev` 技能，請勿越俎代庖。

當你被呼叫或被請求處理任務管理時，請嚴格遵守以下三大階段的「物理防呆管線」，**嚴禁任何 AI 或人類手動修改 Markdown 表格或手動新增任務檔**：

## 階段一：新任務開立 (Dispatch)
當使用者要求「開啟新任務」或「建立派工單」時：
1. **呼叫防呆管線**：請在終端機強制執行 `node scripts/job_manager.js create "任務名稱" USER` (或 AG/DEV)。
- **API 成本意識**：在執行任何涉及大規模 LLM 呼叫的任務前，**強制閱讀並遵守** `_agent/API_RULES.md` 的金鑰分級、調速與預算警示原則。結案時必須回報 Token 與預估花費。
- **變更追溯**：所有文件（MD、JSON）均須記錄 `last_updated` 與 `updated_by`。
2. **禁止手動建檔**：腳本會自動分配最安全的 `JOB-XXX` 編號並寫入看板的 Pending 區，絕對不允許手動建立檔名或修改看板。
3. **填寫 DoD**：開啟腳本幫你建好的 `jobs/JOB-XXX-...` 文件，將驗收標準填妥，等待施工。
4. **強制撰寫預期結果 Checklist**：每份派工單**必須**包含一個以 `- [ ]` 格式撰寫的「預期結果清單 (Expected Outcomes Checklist)」區塊。此清單應明確列出本任務完成後的所有可交付成果與驗收條件，確保施工者與審核者對「做完」的定義完全一致。**缺少此區塊的派工單視為不完整，不得進入施工階段。**

## 階段二：開工接單 (Start Execution)
當使用者呼叫 `/dojob [任務編號]` 或要求開始某項工作時：
1. 鎖定並讀取該對應的 `jobs/JOB-XXX.md` 派工單細節。
2. **判斷任務級別 (Feature vs Hotfix vs API-Heavy)**：
   - **API-Heavy (涉及大規模 AI 產出/驗證)**：若任務標題含 `Eval`/`Generation`/`Scan` 或預期呼叫超過 50 次 API。**-> 強制讀取並遵守 `_agent/API_RULES.md` 的成本控管邏輯。**
   - **Feature (重大架構變更/新功能)**：若任務涉及建立新頁面、新增 API 端點、修改共用核心元件、跨模組資料流變更，或標題含 `Feature`/`Refactor`/`Epic`。**-> 強制要求你預先讀取專案根目錄的 `README.md` 以校準全站架構。**
   - **Hotfix (小修小改)**：若任務僅涉及單一 UI 文案調整、CSS 樣式修正、單一函數 Bug 修復，且不影響系統架構。**-> 略過讀取 `README.md`。**
3. 建立或更新根目錄下的 `task.md` (Checklist) 作為施工進度表。
4. 建立或更新 `implementation_plan.md` 制定實作計畫，並使用 `notify_user` 請求使用者核准。**強硬守則：無核准不准動碼！**

## 階段三：正式結案 (Close Job)
當開發工作與單元測試皆完工時：

---

> ⚠️ 若你想查核當前系統內是否有幽靈任務，隨時可自主執行 \`node scripts/verify_jobs.js\`。
