*Created by AG at 2026-03-28 23:50*

`last_updated`: 2026-03-28 23:50  
`updated_by`: Cursor Agent  

# JOB-121 結案報告

**`job_type`**：`docs_ops`（與開案派工單一致）

---

## 📊 成果摘要

| 指標 | 數值／說明 |
|:--|:--|
| 任務性質 | 規範合併：`dojob` → `pj_job`；新建派工生命週期權威文件 |
| 新建文件 | 1（`docs/README_任務派工準則.md`） |
| 刪除 Skill | `dojob/SKILL.md` + 空目錄移除 |
| 實質修訂檔案數 | 見下方「變更清單」（含批量歷史 Report 聲明修正） |
| 題庫／CQI | **不適用**（本 JOB 未產出或修改題庫 JSON） |

---

## 📐 設計要點（為何如此收斂）

1. **單一權威（SSOT）**  
   派工「開案 → 執行 → 結案」、`job_type` 邊界、`job_manager.js`／`verify_jobs.js` 使用方式、**`dojob`／`/dojob` 廢止對照**，一律以 **`docs/README_任務派工準則.md`** 為準；避免 Skill 與 docs 兩份正文漂移。

2. **與 `README_通用作業準則.md` 分工**  
   - **作業準則**：三段式 Checklist 鐵則、Git、花費格式、語氣與 UI 相關通則等。  
   - **任務準則**：派工生命週期、`job_type`、腳本防呆、模型／API 資源意識、根目錄 `task.md` 等**禁止事項**。  
   兩者並列索引於根目錄 `README.md`，降低「只看其中一份就漏掉管線」的風險。

3. **`job_type` 必填**  
   於 `_JOB-TEMPLATE.md`、`_JOB-REPORT-TEMPLATE.md` 明列欄位，並在任務準則第二章給出**與各領域準則檔／Skill 的對照表**，使開案時即可鎖定「本 JOB 只做哪一類事」，減少研究／出題／驗證／工程邊界混淆。

4. **`pj_job` 薄層化**  
   `_agent/skills/pj_job/SKILL.md` 僅保留觸發語意、硬閘摘要、廢止聲明；**禁止**在 Skill 內維護長流程副本，日後增刪流程只改 `docs/README_任務派工準則.md`。

5. **根目錄進度檔**  
   明確與 `.cursor/rules/root-task-files.mdc` 對齊：**不得**在 repo 根目錄以 `task.md`、`implementation_plan.md` 作為主進度表；進度落在派工單、`jobs/JOB-XXX-Report.md` 或派工單指定路徑。

6. **`/dosync` 與 `/pj_sync`**  
   任務準則結案段說明：若與 `.cursorrules` 並列，**以當時生效之 Cursor rules／`.cursorrules` 為優先**，避免 Agent 只執行其一而漏進度表或規格書。

---

## 📋 變更清單（檔案級）

### 新建

| 路徑 | 說明 |
|:--|:--|
| `docs/README_任務派工準則.md` | 派工生命週期、`job_type`、腳本、稽核、廢止 `dojob`、根目錄規範、結案與同步指令說明 |

### 刪除

| 路徑 | 說明 |
|:--|:--|
| `_agent/skills/dojob/SKILL.md` | 已併入 `pj_job`＋專案任務準則；避免雙軌 |
| `_agent/skills/dojob/`（目錄） | 檔案刪除後移除空目錄 |

### 修改（核心）

| 路徑 | 說明 |
|:--|:--|
| `_agent/skills/pj_job/SKILL.md` | 改為觸發型；正文指 `docs/README_任務派工準則.md`；廢止 `dojob`；硬閘與根目錄禁止摘要 |
| `docs/README_通用作業準則.md` | `last_updated`；與專案任務準則分工；第零章 KQL→KL、QQL→QL |
| `jobs/_JOB-TEMPLATE.md` | 頂部 **`job_type`**；關鍵參考表增列任務準則／研究總綱；KL／QL 用語 |
| `jobs/_JOB-REPORT-TEMPLATE.md` | 標題下 **`job_type`**（須與開案一致） |
| `_agent/skills/ei_research/SKILL.md` | KL4 後改依專案任務準則以 `/pj_job` 開立 `question_prod`；`last_updated` |
| `README.md` | `last_updated`；`docs/` 樹增列 `README_任務派工準則.md`；規範索引表新列；`pj_job` 列補充說明 |
| `docs/進度彙整_題庫研發與產出.md` | 資訊同步管線第 2 點：`/dojob` → **`/pj_job`**；`last_updated` |

### 修改（派工／報告引用對齊）

| 路徑 | 說明 |
|:--|:--|
| `jobs/JOB-064-USER-G6S2社會科研發與題庫建置.md` | 關鍵參考：`dojob` → 專案任務準則＋`pj_job` |
| `jobs/JOB-041-Report.md` | 後續步驟：`/dojob` → **`/pj_job`** |
| `jobs/JOB-018-DEV-AG-UAT-Comprehensive-Fix.md` | 使用者提示：`dojob` → **`/pj_job`** |
| `jobs/JOB-023-USER-Science-Subpath-Consistency.md` | 補寫註記：對齊 `pj_job`／專案任務準則 |

### 修改（歷史 Report 後置聲明）

以下檔案將「合乎 `_agent/skills/dojob/SKILL.md`」改為「合乎現行派工規範（`docs/README_任務派工準則.md`／`pj_job`）」；並修正先前錯誤批次替換造成的**反引號嵌套**問題（若曾出現）。

- `jobs/JOB-001-Report.md`、`JOB-001a-Report.md`、`JOB-003-Report.md`、`JOB-004-Report.md`  
- `jobs/JOB-006-Report.md`、`JOB-007-Report.md`、`JOB-008-Report.md`  
- `jobs/JOB-011-Report.md`、`JOB-014-Report.md`、`JOB-015-Report.md`  
- `jobs/JOB-030-Report.md`、`JOB-035-Report.md`、`jobs/JOB-053-Report.md`  

---

## 📋 逐課／逐題庫成果

**不適用。** 本 JOB 未新增或修改 `question/platform` 下題庫 JSON，無 CQI-P／CQI-V／QL 實測數據可填。

---

## 🔄 同步確認

- [x] 規範與 Skill 變更已於上表列舉  
- [x] `docs/README_專案發展紀錄.md`：§二「2026-03-28」列已新增 JOB-121  
- [ ] `docs/進度彙整_題庫研發與產出.md`：已因管線敘述更新而觸及；**無需**因本單單獨調整題數矩陣  
- [ ] `apps/v3_eidos/src/data/libraryStats.json`：**未觸及**（非題庫建置 JOB）  
- [ ] `/pj_sync`：建議後續由負責全站文件掃描之 Agent 依排程執行；**非本 JOB 強制 DoD**

---

## ⚠️ 遺留問題與建議

1. **`scripts/verify_jobs.js`**：若倉庫內缺少 `jobs/任務看板與派工.md`，腳本可能報錯；與本 JOB「規範合併」無直接因果，屬**基礎設施／看板檔**議題。建議：補回看板檔，或調整腳本改為可選依賴。  
2. **`.cursorrules` 與其他規則檔**：若仍提及「必讀 `_agent/API_RULES.md`」而該檔在部分 clone 不存在，應另開 **`job_type: engineering` 或 `docs_ops`** 派工修復路徑或補齊檔案（**不屬本 JOB 範圍**）。  
3. **歷史文件中的「dojob」字樣**：允許在 **`docs/README_任務派工準則.md`** 等處以「廢止對照」形式保留；其餘應以 **`/pj_job`** 為準。

---

## 真實回報本次對話的模型與花費

＄作業匯總 ：Token數: 未提供 | 花費: 未提供 | 使用模型: 未提供 | 執行者: Cursor Agent
