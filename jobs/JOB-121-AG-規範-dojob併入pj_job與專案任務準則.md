*Created by AG at 2026-03-28 23:45（後補開案：實作已於同日完成，本單用於追溯與驗收對齊）*

`last_updated`: 2026-03-28 23:45  
`updated_by`: Cursor Agent  

# JOB-121-AG-規範-dojob併入pj_job與專案任務準則

**`job_type`**：`docs_ops`  
（派工生命週期、`job_type` 邊界定義見 `docs/README_任務派工準則.md` 第二章；本 JOB 為**文件與 Skill 架構**變更，不涉題庫 JSON 產線。）

---

## 📌 任務背景

1. **`dojob` 與 `pj_job` 職責重疊**：兩份 Skill 內文皆涵蓋「開案 → 執行 → 結案」，差異僅在 API 成本敘述與模型授權語氣，易造成**雙軌指令**（`/dojob` vs `/pj_job`）與 Agent 引用混亂。  
2. **正文散落 Skill 不利維護**：流程細節若只寫在 `_agent/skills/*/SKILL.md`，版本對齊與 PM 人類審閱成本偏高；應有 **`docs/` 單一權威** 與 **薄層 Skill 觸發**。  
3. **與 `README_專案作業準則` 分工需白紙黑字**：作業準則應保留三段式 Checklist、Git、花費格式等**通則**；**派工腳本、`job_type`、廢止指令**應獨立成「專案任務準則」，避免兩份文件互相覆寫或漏寫。  
4. **根目錄進度檔與舊 Skill 衝突**：舊 `pj_job` 曾要求根目錄 `task.md`／`implementation_plan.md`，與 `.cursor/rules/root-task-files.mdc` 及專案慣例衝突，須在準則中**明確禁止**並改導向 `jobs/` 與派工單本體。

---

## 🎯 任務目標

| # | 目標 | 驗收要點 |
|:--|:--|:--|
| G1 | **單一 PM 派工 Skill** | 僅 `pj_job`／`/pj_job`；`dojob` 廢止且目錄移除 |
| G2 | **新建 `docs/README_任務派工準則.md`** | 涵蓋開案／執行／結案、`job_type` 表、腳本、`verify_jobs`、模型／API、根目錄禁止事項、`/dosync` 與 `/pj_sync` 關係 |
| G3 | **`pj_job` 改為觸發型** | SKILL 內不重複長流程，強制指向專案任務準則 |
| G4 | **作業準則與模板對齊** | `README_專案作業準則` 載明分工；`_JOB-TEMPLATE`／`_JOB-REPORT-TEMPLATE` 含 `job_type`；修正 KQL／QQL 等錯字為 KL／QL（模板與第零章） |
| G5 | **索引與引用更新** | `README.md`、`進度彙整`、活躍／歷史派工與 `ei_research` 等不再指向已刪除之 `dojob` 路徑 |
| G6 | **可追溯** | 本 JOB 派工單 + `JOB-121-Report.md` 完整記錄變更清單與設計取捨 |

---

## 📖 執行步驟

1. 撰寫 **`docs/README_任務派工準則.md`**：文件定位表、`job_type` 與領域 Skill 對照、三階段管線、稽核指令、廢止 `dojob` 對照表。  
2. 改寫 **`_agent/skills/pj_job/SKILL.md`**：`description`、硬閘、禁止複製長文、廢止聲明。  
3. **刪除** `_agent/skills/dojob/SKILL.md`，並移除空目錄 `dojob/`。  
4. 更新 **`docs/README_通用作業準則.md`**：開頭分工段落；第零章 KL／QL 用語。  
5. 更新 **`jobs/_JOB-TEMPLATE.md`**、**`jobs/_JOB-REPORT-TEMPLATE.md`**：`job_type` 欄位與準則連結；啟動 Checklist 與關鍵參考表。  
6. 更新 **`_agent/skills/ei_research/SKILL.md`**：KL4 完成後改為依專案任務準則以 `/pj_job` 開立 `question_prod`。  
7. 更新 **`README.md`**（目錄樹、規範索引表、`pj_job` 列說明）、**`docs/進度彙整_題庫研發與產出.md`**（`/dojob` → `/pj_job` 敘述）。  
8. 修正仍引用 `_agent/skills/dojob` 或 `/dojob` 之**活躍派工／報告**（如 JOB-064、JOB-041-Report、JOB-018、JOB-023）；歷史 Report 後置聲明改指現行準則／`pj_job`，並排除錯誤嵌套反引號。  
9. 產出 **`jobs/JOB-121-Report.md`**，並視需要更新 **`docs/README_專案發展紀錄.md`** Job Changelog。

---

## 📜 關鍵參考檔案

| 檔案路徑 | 用途 |
|:--|:--|
| `docs/README_任務派工準則.md` | 本任務**主要交付物**（派工生命週期權威） |
| `docs/README_通用作業準則.md` | 通則與本任務分工段落 |
| `.cursor/rules/root-task-files.mdc` | 根目錄任務檔禁止事項（準則須對齊） |
| `_agent/API_RULES.md` | API 成本（專案任務準則內引用） |
| 根目錄 `README.md` | 模型／金鑰最高原則（專案任務準則內引用） |
| `scripts/job_manager.js` | `create`／`close` 行為描述依據 |

---

## ✅ 啟動 Checklist (Pre-Flight)

- [x] 已讀取：`docs/README_通用作業準則.md`、`jobs/_JOB-TEMPLATE.md`、既有 `pj_job`／`dojob` SKILL（合併前快照或 diff 認知）
- [x] 本任務**不適用** KL3/KL4 前置素材查核（`job_type: docs_ops`）
- [x] **已確認執行模型**：文件編修為主，無強制雲端推論；執行者 Cursor Agent（使用者核准補單）
- [x] **已確認使用金鑰**：不適用／無額外雲端金鑰消耗
- [x] **已確認操作頻次**：不適用
- [x] 目標品質：不適用 QL（非題庫產線）

---

## ✅ 驗收 Checklist (Acceptance) — 本任務專用（非 CQI）

> 本 JOB 為 `docs_ops`，**不適用** CQI-P／CQI-V／題幹 scenario 等題庫驗收；以下為文件與架構驗收。

- [x] `docs/README_任務派工準則.md` 存在且含 `job_type` 表、三階段、`dojob` 廢止說明、根目錄禁止 `task.md`／`implementation_plan.md`
- [x] `_agent/skills/dojob` 已移除；`_agent/skills/pj_job/SKILL.md` 僅觸發＋指向該 docs
- [x] `README_專案作業準則` 已載明與專案任務準則分工，且 KQL／QQL 錯字已修正（第零章）
- [x] JOB 模板與 Report 模板含 **`job_type`**
- [x] 全倉 `grep` 無**有效**指向 `_agent/skills/dojob/SKILL.md`（允許專案任務準則內「廢止」說明字樣）

---

## ✅ 預期結果清單 (Expected Outcomes)

- [x] O1：Agent／人類可查**單一文件**完成派工開結案，無需比對兩份 Skill  
- [x] O2：指令與索引統一為 **`/pj_job`**，舊名 **`/dojob`** 僅作廢止對照  
- [x] O3：`job_type` 成為開案／結案**必填語意**，並與各領域準則檔對照  
- [x] O4：根目錄進度檔規範與 Cursor rules **一致**  
- [x] O5：`JOB-121-Report.md` 列舉**完整檔案級變更清單**與遺留事項（若有）

---

## ✅ 成果 Checklist (Deliverables)

- [x] `docs/README_任務派工準則.md` 已建立並為權威來源
- [x] `jobs/JOB-121-AG-規範-dojob併入pj_job與專案任務準則.md`（本檔）
- [x] `jobs/JOB-121-Report.md`
- [x] `docs/README_專案發展紀錄.md` 已新增本 JOB 至近期變動
- [ ] 題庫進度總表：本任務**未變更**題數／QL 欄位，無需因本單強制更新（若後續 `/pj_sync` 一併掃描可帶過）
- [ ] 已執行 `/pj_sync`：由負責 Agent 依專案節點決定（本單不強制與題庫進度連動）

---

## 真實回報本次對話的模型與花費

＄作業匯總 ：Token數: 未提供 | 花費: 未提供 | 使用模型: 未提供 | 執行者: Cursor Agent
