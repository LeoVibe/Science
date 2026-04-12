*Created by AG at 2026-03-30 16:00*

`last_updated`: 2026-03-30 16:00  
`updated_by`: Cursor Agent  

# JOB-133-AG-三層規範架構與文件大規模重構

**`job_type`**：`docs_ops`（**不適用** KL3/KL4、CQI-P/V、題庫 JSON 變更；以文件／索引／規則引用為主）  
定義與邊界見 **`docs/README_任務派工準則.md`** 第二章（執行後若本 JOB 完成檔名遷移，以新檔 **`README_任務派工準則.md`** 為準）。

---

## 一、使用者釐清之三層架構（目標資訊架構）

| 層次 | 職責 | 主要讀者 | 內容要點 |
|:---:|:---|:---|:---|
| **1｜README** | 專案**在做什麼** | Agent／新人／PM | 背景、目標、發展願景、**大流程與層次**（如 KL／題庫管線）；**不**塞入細節規則正文，只註明「延伸準則／方法到哪裡讀」。 |
| **2｜通用作業準則** | **跨專案可複製**的通則 | Agent（任何用你模板開的 repo） | 個人偏好、語言、變更追溯、Git／許可、花費格式、三段式 Checklist **型態**、禁止根目錄 task 檔等；**不含** Eidos 專屬派工編號、檔名範本、`job_manager.js` 細節。 |
| **3｜任務派工準則** | **本專案（Eidos）**派工與結案 | Agent 執行本 repo | `job_type`、`jobs/` 範本、流水號、`job_manager.js`／`verify_jobs.js`、**結案後如何回報**（含 **Discord／`user-discord-relay`／`send_message`／`DISCORD_CHANNEL_ID`** 之**方法與概念**）、與本專案驗證／品質敘述之銜接。 |

**設計判斷**：此三分法比「作業 vs 任務」僅依檔名區分**更清晰**；第 2 層可未來複製到他專案做小改即可移轉。

**範例（依使用者要求）**：「如何回報、回報方法與概念」→ **僅**寫入第 3 層 **`README_任務派工準則.md`**（現名 `README_任務派工準則.md`，遷移見 §三）。

---

## 二、與歷史派工之合併參考（避免重複發明）

以下為**同質或前置**之文件／規範重構與稽核，本 JOB **應讀摘要並繼承結論**，避免與既有決策衝突：

| JOB | 檔名 | 與本 JOB 關係 |
|:---|:---|:---|
| **JOB-114** | `jobs/JOB-114-USER-全站重構後文件結構二次稽核與嚴謹修整.md`＋`JOB-114-Report.md` | 全站重構後**二次稽核**、確立任務／作業兩準則之權威分工；本 JOB 在其上再做**三層化**與**可攜通則分離**。 |
| **JOB-121** | `jobs/JOB-121-AG-規範-dojob併入pj_job與專案任務準則.md` | `pj_job`／任務準則正文；本 JOB 遷移檔名時須**保留**該語意。 |
| **JOB-123** | `jobs/JOB-123-AG-規範與腳本對齊-題庫知識管線稽核.md` | Skill／腳本／README 索引對齊；本 JOB 完成後應**再跑**全庫引用檢查（grep／連結殘骸）。 |
| **JOB-130** | `jobs/JOB-130-AG-job-manager單號稽核與派工檔名準則收斂.md` | 派工檔名與 `job_manager.js`；第 3 層須與之**一致**。 |

---

## 三、建議檔名與內容遷移（執行時可微調，須寫入 Report）

| 現況 | 建議新檔名／角色 | 遷移策略 |
|:---|:---|:---|
| 根目錄 `README.md` | 維持名稱，**收斂為第 1 層** | 刪減可下沈之細節；規範索引表只保留「去哪讀」；四層研究敘事可保留簡版或指到 `docs/`。 |
| `docs/README_通用作業準則.md` | **`docs/README_通用作業準則.md`**（或等價名稱，須與 Report 一致） | 抽出／標註**可攜**段落；Eidos 專屬句（如 §2.3 與任務準則重複之派工敘述）**移入第 3 層**或改為交叉引用。 |
| `docs/README_任務派工準則.md` | **`docs/README_任務派工準則.md`** | **集中** Discord 回報、`job_type`、開結案、範本與腳本；通則句改連結至第 2 層。 |
| 舊路徑 | 二選一（Report 必須記錄採用哪一種） | **A)** 舊檔改為 10 行內 **stub**：「已遷移至 `…`，請改引用。」**B)** 僅 grep 全庫改連結、不保留 stub（風險較高，需 `verify_jobs`／CI）。 |

---

## 四、執行階段（建議順序）

1. **盤點**：`rg`／`grep` 全庫 `README_專案作業準則`、`README_專案任務準則`、`專案任務準則`、`專案作業準則`、`.cursorrules`、`project-startup-and-job-discipline.mdc`、`ei_qst`／`pj_job` 等引用清單。  
2. **決案**：與 PM／使用者確認**新檔名**與 stub 策略（§三）。  
3. **改寫**：先寫第 2、3 層定稿，再收斂 `README.md` 第 1 層。  
4. **同步引用**：更新 `.cursorrules`、`.cursor/rules/*.mdc`、`_agent/skills/*`、`scripts/job_manager.js` 註解、`README.md` 索引表、`docs/README_專案發展紀錄.md`（若適用）。  
5. **驗證**：`node scripts/verify_jobs.js`；必要時補 `docs/task_history.md` 或派工提及之進度檔。  
6. **結案**：`jobs/JOB-133-Report.md`＋依**新**任務派工準則 Discord 回報。

---

## 五、驗收（DoD）

- [ ] 三層職責與**檔案對照表**寫入 `jobs/JOB-133-Report.md`（含與 JOB-114／121／123／130 之承接說明）。  
- [ ] `README.md` 符合**第 1 層**定位（願景＋流程＋**精簡**延伸索引）。  
- [ ] 第 2 層檔可標註「他專複製時改動區塊」**或**另附 `docs/_TEMPLATE_通用作業準則.md`（擇一，Report 註明）。  
- [ ] 第 3 層含 **Discord 回報方法與概念**（`user-discord-relay`、`send_message`、`DISCORD_CHANNEL_ID`、無 MCP 時之替代）。  
- [ ] 全庫無**孤立**舊連結（或 stub 覆蓋完整）；`verify_jobs.js` 通過。  
- [ ] 已依結案流程 Discord 同步（本 JOB 自身）。

---

## 六、啟動／驗收 Checklist（本 `docs_ops` 任務）

**Pre-Flight**

- [ ] 已讀：`jobs/JOB-114-Report.md`、`jobs/JOB-121-AG-*.md`、`jobs/JOB-123-AG-*.md`、`jobs/JOB-130-AG-*.md`（摘要即可，細節回檔查閱）  
- [ ] 已讀：現行 `docs/README_通用作業準則.md`、`docs/README_任務派工準則.md`、根 `README.md`、`.cursorrules`  
- [ ] 本任務**無** LLM 產題／盲測；模型／金鑰／QPM 欄位：**不適用**（若執行過程另開子任務再填）

**Acceptance（題庫品質項目不適用）**

- [ ] N/A：CQI-P／CQI-V／QL（本 JOB 為文件架構）

**Deliverables**

- [ ] `jobs/JOB-133-Report.md`  
- [ ] 依 `docs/README_任務派工準則.md`（遷移後為任務派工準則）階段三 §6：**Discord** 結案摘要  
- [ ] 視範圍執行 `/pj_sync` 或等效文件沉澱（與 `.cursorrules` 對齊）

---

## 真實回報本次對話的模型與花費

（結案時依實填）
