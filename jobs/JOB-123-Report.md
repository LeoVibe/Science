`last_updated`: 2026-03-29 01:10
`updated_by`: Cursor Agent

# JOB-123 結案報告

**`job_type`**：`mixed`（與派工單 `JOB-123-AG-規範與腳本對齊-題庫知識管線稽核.md` 一致）

## 成果摘要

- 根 **`README.md`**：目錄樹國語段改為 **`KL3_國語_研究進度_課文與索引`**＋**`{學期}/{版本}/` KL4 雙檔**；**`Model_Price`** 改敘 **`../Model_Price.json`**（同層 `0_AI_Project`、未納入版控）。
- **`docs/README_通用作業準則.md`**：§2.3 唯一真相改為 **`docs/README_任務派工準則.md`**＋派工＋Report；§6.2 計價改指 **`../Model_Price.json`**。
- **`knowledge/.../KL3_國語_研究進度_課文與索引.md`**：三下統計 **研(12)|考(12)** 三社一致；補 **翰林三下 L05 茶香鹿谷** 列與正文錨點；`updated_by` 註明 **`clean_kl3_chinese_curriculum_vault.py` 未收錄**。
- **`KL4_三下_翰林_L5_茶香鹿谷_單課研究紀錄.md`**：標題 **`課文全文錄製`**，與 **`auto_generate_questions.js`** 抽取規則一致。
- **`_agent/skills/ei_qst/SKILL.md`**：補 **§3.1 TCG／OED／ACV**（人工／無單一腳本）。
- **`_agent/skills/ei_research/SKILL.md`**：**RC-01** 與 **`### 1. 課文全文錄製`** 與出題銜接敘述對齊。
- **`docs/上版前整體驗證與檢查清單.md`**：關聯列改指任務準則，移除幽靈看板依賴敘述。
- **`jobs/JOB-123-...md`**：背景表「任務看板」列改為已脫鉤之現況說明；JM 缺失表改為「歷史盤點＋結案狀態」；A～D 與驗收勾選已標 **[x]**。
- **`docs/上版規劃-整體方案.md`**：`prj_status`／上版備註不再依賴已廢止之任務看板敘述。

**先前已併入本 JOB 驗收之前置實作（本 Report 一併認列）**：`scripts/job_manager.js`（無看板不阻擋 close）、`scripts/verify_jobs.js`（不依賴看板）、`auto_generate_questions.js`（KL4／KL3 國語管線）、`.cursorrules`／**`project-startup-and-job-discipline.mdc`**、`question/README_出題與品管準則.md` 國語段。

## 附錄：EQ／ER／JM 結案狀態

| 編號 | 結案方式 |
|:---:|:---|
| EQ-01 | 統一為 **`/ei_qst`**（Skill 與根 README 技能表一致；歷史派工內 `doqst` 字樣保留為歷史紀錄，不強改） |
| EQ-02～EQ-04、EQ-06 | Skill 已改 **KL 用語**、正確 CLI、花費依作業準則／README |
| EQ-05 | 本 Report 於 ei_qst 增 **§3.1** 說明 TCG/OED/ACV 為人工防線 |
| ER-01～ER-03 | ei_research 已對齊 **課文全文錄製**、路徑範例、**pj_job**／**job_type** |
| JM-01～JM-03 | 腳本與 **`.cursorrules`** 已改；本作業準則 §2.3 已對齊 |

## 未解決／剩餘風險

- 歷史 **`jobs/JOB-*-Report.md`** 與舊派工內仍可能出現 **`doqst`**、**R3/R4** 等舊稱，屬歸檔語境，非現行規範來源。
- **`clean_kl3_chinese_curriculum_vault.py`** 仍未入倉；索引維護以手動／既有 **`build_kl3_chinese_curriculum_index.mjs`** 等為準。

## DoD／同步確認

- [x] `node scripts/verify_jobs.js` 已執行並通過（見下方指令紀錄）
- [x] 已執行 /dosync：已依 **`pj_sync`** 更新 **`docs/README_專案發展紀錄.md`**（本批次未改 **`docs/網站功能規格書.md`**、**`docs/進度彙整_題庫研發與產出.md`** 之題庫進度表，因範圍為規範與管線對齊）

## 真實回報本次對話的模型與花費

＄作業匯總 ：Token數: 未提供 | 花費: 未提供 | 使用模型: GPT-5.2 | 執行者: Cursor Agent
