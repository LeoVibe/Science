*Created by AG at 2026-03-28 23:45*

`last_updated`: 2026-03-29 01:10
`updated_by`: Cursor Agent

# JOB-123-AG-規範與腳本對齊-題庫知識管線稽核

**`job_type`**：`mixed`（`docs_ops`：文件與索引對齊；`engineering`：腳本與 Skill／任務準則單一真相對齊）  
定義與邊界見 **`docs/README_任務派工準則.md`** 第二章。

---

## 📌 任務背景

根目錄 **`README.md`** 已定義四層研究架構、`question/`／`knowledge/`／`docs/` 規範索引與 `_agent/skills/` 對照表，但實務盤點發現文件、Skill、腳本三者多處不一致。

### 使用者釐清（2026-03-28）

| 項目 | 說明 |
|:---|:---|
| **計價檔** | **`Model_Price.json`** 位於**倉庫同層之 `0_AI_Project` 目錄**（與 `eidosProject` 同層；由本 repo 根目錄往上一層可達 **`../Model_Price.json`**）。非倉庫內檔案，根目錄 `README.md` 原 `Model_Price.md`／`../` 連結需改寫以免誤導。 |
| **任務看板** | **`jobs/任務看板與派工.md` 已廢止**；進度以 **`docs/README_任務派工準則.md`**＋派工單＋**`jobs/JOB-XXX-Report.md`** 為準。`job_manager.js close`／`verify_jobs.js` 已改為**不依賴**該看板路徑（無檔時不應 `exit(1)`）。 |

### 其餘已知缺口（延續前版盤點）

- **`README.md` 目錄樹範例**與現行 `knowledge/課綱研究/` 實際檔名／層級不一致。
- **`KL3_國語_研究進度_課文與索引.md`**：頁首統計、表格列與磁碟檔案數不一致；索引註明之 **`scripts/clean_kl3_chinese_curriculum_vault.py`** 倉庫內不存在。
- **國語產題**：`_agent/skills/ei_qst/SKILL.md` 與 **`scripts/auto_generate_questions.js`** 須與 **KL4 雙檔**、**`KL3_國語_研究進度_課文與索引.md`** 之流程一致（已逐步收斂）。

---

## 🔍 `_agent/skills` 與實作對照：目前缺失

### `ei_qst`（題庫產出）

| 缺失編號 | 描述 |
|:---:|:---|
| **EQ-01** | **觸發指令**：Skill 寫 **`/doqst`**；根目錄 `README.md` 技能表為 **`/ei_qst`**。需統一並全庫搜尋替換或加註「同義」。 |
| **EQ-02** | **研究層用語**：Hard Gates 使用 **R1～R4、R3／R4**；`ei_research` 與 `knowledge/README_研究架構總綱.md` 使用 **KL3／KL4**。Agent 易誤判「缺 R4」其實已有 KL4。應改為 KL 語彙或附對照表。 |
| **EQ-03** | **課文來源**：Skill 與腳本須一致描述 **KL4 單課研究紀錄「課文全文錄製」** + **KL3 索引**，不足時 **【資料不齊備】** 略過；與 `question/README_出題與品管準則.md` 交叉引用。 |
| **EQ-04** | **產題指令**：Skill 寫 `node scripts/auto_generate_questions.js <path> <model>`；實際為 **`--model`、`--key`、`--pattern`** 等。屬錯誤文件。 |
| **EQ-05** | **防線 TCG／OED／ACV**：Skill 列為產後必做，需標註**人工檢核**或**對應腳本名**（若無腳本則明寫「尚未自動化」）。 |
| **EQ-06** | **花費回報**：Skill 稱「必須由腳本生成」—需指名**現行腳本**或改為「依 `docs/README_通用作業準則.md` 手動／半自動」。 |

### `ei_research`（課程研究）

| 缺失編號 | 描述 |
|:---:|:---|
| **ER-01** | **與 ei_qst 交接**：產題端已改為僅讀 KL4「課文全文錄製」；`ei_research` 應明確要求出題前 **RC-01 須含可抽取之全文**（與 **KL3 索引**一致），並與考古副檔成對。（若仍寫舊 `.txt` 敘述則刪除。） |
| **ER-02** | **路徑範本**：`ei_research` 寫 `knowledge/課綱研究/[科目]/[學期]/`；國語實務常見 **`課綱研究/國語/三下/康軒/`** 等。需在 Skill 或研究總綱加「國語實際目錄範例」避免誤建路徑。 |
| **ER-03** | **ei_qst 反向引用**：`ei_qst` 写「缺 R3/R4 → 執行 `/ei_research`」；應與 **`/ei_research`／`ei_research` Skill** 及 **`job_type: research`** 開單流程對齊（並改用 KL 用語）。 |

### 腳本與 `docs/README_任務派工準則.md`（歷史盤點；本 JOB 已結案）

| 缺失編號 | 描述（開案時）／結案狀態 |
|:---:|:---|
| **JM-01** | **`job_manager.js close`** 曾於無看板時 **exit(1)** → **已修**：無看板僅略過看板更新，不阻擋結案。 |
| **JM-02** | **`verify_jobs.js`** 曾強制讀看板 → **已改**：掃描 `jobs/` 派工與 Report 配對。 |
| **JM-03** | **`.cursorrules`／`README.md`** 曾以看板為準 → **已改**：以 **`docs/README_任務派工準則.md`**＋派工單＋Report；**`docs/README_通用作業準則.md`** §2.3 已對齊。 |

---

## 🎯 任務目標

1. 建立 **`README.md` ↔ `knowledge/` ↔ `question/` ↔ `scripts/` ↔ `_agent/skills`** 的可核對「單一流程敘述」。
2. **廢看板後**：腳本、Cursor rules、根 README 與 **`docs/README_任務派工準則.md`** 一致，**不再幽靈依賴**已刪除之看板檔。
3. **補齊 ei_qst／ei_research 銜接規格**（KL4 `.md` vs `.txt` TRG）。
4. 產出 **`JOB-123-Report.md`**。

---

## 📖 執行步驟（綱要）

- **Phase A**：盤點矩陣（文件宣稱 vs 腳本行為 vs 實際路徑）。
- **Phase B**：文件修正（README、`ei_qst`／`ei_research`、KL3 索引、任務準則交叉引用）。
- **Phase C**：`job_manager.js`／`verify_jobs.js`／`.cursorrules` 與看板脫鉤。
- **Phase D**：結案 Report、`/pj_sync` 等。

---

## ✅ 詳列 Checklist／待辦事項（執行時逐項勾選）

### A. 盤點與矩陣

- [x] **A-1** 完成「規範索引」逐連結存在性檢查（根 `README.md` 表列之 `question/`、`knowledge/`、`docs/`）。
- [x] **A-2** 完成 **EQ-01～EQ-06、ER-01～ER-03、JM-01～JM-03** 對照表，寫入 `JOB-123-Report.md` 附錄。
- [x] **A-3** 核對 **`auto_generate_questions.js`、`evaluate_question_quality.js`、`run_blind_eval.js`** 是否涵蓋 ei_qst 各步驟；未涵蓋者標為「僅文件／僅人工」。

### B. 文件與 Skill（`docs_ops`）

- [x] **B-1** 更新根 **`README.md`**：**`Model_Price.json`** 改為 **`../Model_Price.json`**（或等效說明「父層 `0_AI_Project`、未納入本 repo」），移除錯誤之 `.md`／路徑。
- [x] **B-2** 更新根 **`README.md`**「目錄結構」：對齊真實 `knowledge/課綱研究/`，移除易誤導之 `KL3_G6_S2_…` 範例或改為註解「僅示意」。
- [x] **B-3** 更新 **`_agent/skills/ei_qst/SKILL.md`**：修正 **EQ-01～EQ-06**（指令名、KL 用語、TRG 路徑、`auto_generate` 正確 CLI、TCG/OED/ACV 性質、花費回報）。
- [x] **B-4** 更新 **`_agent/skills/ei_research/SKILL.md`**：修正 **ER-01～ER-03**（與 ei_qst／`.txt` 銜接、國語目錄實例、交叉引用 `job_type`）。
- [x] **B-5** 修正 **`knowledge/課綱研究/國語/KL3_國語_研究進度_課文與索引.md`**：頁首統計、翰林三下 **L05** 列、底部 `updated_by` 腳本路徑或恢復腳本。
- [x] **B-6** 於 **`question/README_出題與品管準則.md`**（或 README 管線段）增加**一段**「國語：KL4 研究檔 vs TRG `.txt`」之單一真相敘述（與 B-3/B-4 同步）。

### C. 腳本與規則（`engineering`）

- [x] **C-1** 修改 **`scripts/job_manager.js`**：`close` 時若無看板檔，**不得**無條件 `exit(1)`；改為僅警告，或改寫結案流程與 **`docs/README_任務派工準則.md`** §五一致。
- [x] **C-2** 修改 **`scripts/verify_jobs.js`**：移除「無看板即 exit(1)」；改為掃描 `jobs/` 內派工與 Report 之規則（細則於 Report 記載）。
- [x] **C-3** 更新 **`.cursorrules`** 與 **`.cursor/rules/project-startup-and-job-discipline.mdc`**：凡提及 **`jobs/任務看板與派工.md`** 為唯一真相者，改指向 **`docs/README_任務派工準則.md`**。
- [x] **C-4**（選配）**`auto_generate_questions.js`** 與 KL4／KL3 索引流程已對齊時，回寫 B-3/B-6 並結案 EQ-03。

### D. 結案

- [x] **D-1** 產出 **`jobs/JOB-123-Report.md`**（含對齊矩陣、已改檔案清單、未解決風險）。
- [x] **D-2** 執行 **`node scripts/verify_jobs.js`**（於 C-2 完成後應可通過或具明確預期行為）。
- [x] **D-3** 依專案流程執行 **`/pj_sync`**（若本批次有動到規格／進度敘述）。

---

## 📜 關鍵參考檔案

| 檔案路徑 | 用途 |
|:--|:--|
| `README.md` | 規範索引、目錄樹、Agent 技能表、`Model_Price` 連結 |
| `docs/README_任務派工準則.md` | 派工生命週期（**取代舊看板敘事**之權威） |
| `knowledge/README_研究架構總綱.md` | KL／RM |
| `knowledge/課綱研究/國語/KL3_國語_研究進度_課文與索引.md` | 課次與 KL4 連結 |
| `question/README_出題與品管準則.md` | CQI-P、JSON、CI |
| `question/README_驗證與盲測準則.md` | CQI-V、QL |
| `_agent/skills/ei_qst/SKILL.md` | 出題流水線（待修 EQ-*） |
| `_agent/skills/ei_research/SKILL.md` | 研究流水線（待修 ER-*） |
| `scripts/auto_generate_questions.js` | TRG 實作 |
| `scripts/job_manager.js`、`scripts/verify_jobs.js` | 待與廢看板對齊（JM-*） |
| （倉庫外）`../Model_Price.json` | 模型計價（使用者指定位置） |

---

## ✅ 啟動 Checklist (Pre-Flight)

- [x] 已讀取：`README.md`、`docs/README_任務派工準則.md`
- [x] 已讀取：`question/README_出題與品管準則.md`、`knowledge/README_研究架構總綱.md`
- [x] 已讀取：`_agent/skills/ei_qst/SKILL.md`、`_agent/skills/ei_research/SKILL.md`
- [x] 本 JOB **預設不呼叫付費 LLM**；C-4 若試跑產題，須依根 `README.md` 最高原則取得使用者核准

---

## ✅ 驗收 Checklist (Acceptance)

- [x] **EQ-01～EQ-06、ER-01～ER-03、JM-01～JM-03** 均已「結案狀態」：已修文件／腳本或已在 Report 註明刻意不修之理由
- [x] 根 **`README.md`** 之 **`Model_Price.json`** 敘述與 **`../Model_Price.json`** 一致
- [x] **`job_manager.js close`** 與 **`verify_jobs.js`** 不再依賴已刪除之 **`jobs/任務看板與派工.md`**（或專案決議恢復看板則需更新本 JOB 背景段）
- [x] **`.cursorrules`** 等不再將已刪除看板列為唯一真相
- [x] `KL3_國語_研究進度_課文與索引.md` 與三下實檔一致（含翰林 L05、統計可解釋）
- [x] **ei_qst ↔ ei_research ↔ TRG** 有單一書面銜接結論（含是否強制 `.txt`）

---

## ✅ 成果 Checklist (Deliverables)

- [x] `jobs/JOB-123-Report.md`
- [x] 已執行 `/pj_sync`（若本批次有動到規格／進度敘述）

---

## 真實回報本次對話的模型與花費

＄作業匯總 ：Token數: 未填 | 花費: 未填 | 使用模型: 未填 | 執行者: AG／Cursor（結案時據實填）
