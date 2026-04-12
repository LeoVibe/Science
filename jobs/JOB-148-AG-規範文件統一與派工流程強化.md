*Created by AG at 2026-04-04 11:45*

`last_updated`: 2026-04-04 11:45
`updated_by`: Claude Code (claude-sonnet-4-6)

# JOB-148-AG-規範文件統一與派工流程強化

**`job_type`**: `docs_ops`
**`executor`**: Claude Code

## 📌 任務背景

本次 session（含前一輪對話延伸）對專案規範體系進行了多項修正，觸發點如下：

1. `/dosync` Skill 已廢棄改用 `/pj_sync`，但 `job_manager.js`、`.agent/`、多份 `docs/` 文件仍沿用舊名稱，造成 Agent 混淆
2. `.agent/` 目錄存在非官方重複檔案（`create_job.md`），內容與 `_agent/skills/pj_job/SKILL.md` + `docs/README_任務派工準則.md` 完全重疊
3. `docs/task_history.md` 為非官方文件，與 `README_專案發展紀錄.md §二` 職責重疊，且未列入 README.md 官方文件表
4. 派工單建立流程「先建空殼後填寫」缺乏草稿確認機制，導致使用者未能在開單前確認範圍與 DoD
5. `_JOB-TEMPLATE.md` 通用模板對不同 `job_type` 的 DoD 欄位不夠精準
6. 缺乏執行時間回報規範

## 🎯 任務目標

完成後可驗證的狀態：
- 全站規範文件（非歷史 JOB 檔）無 `/dosync` 孤立引用、無 `.agent/` 路徑
- 派工流程加入「草稿先行」強制前置步驟（§4.0），任何 Agent 建單前須先草稿並獲使用者確認
- 三份分 `job_type` 模板存在，`job_manager.js create` 可透過第四參數自動選用
- `task_history.md` 已整合後刪除，`README_專案發展紀錄.md` 為唯一 changelog 來源
- 時間回報規範已寫入 `README_通用作業準則.md §6.3`

## 🚧 任務邊界

**本次只做：**
- `docs/`、`_agent/skills/`、`scripts/job_manager.js`、`jobs/` 模板類文件
- 規範流程設計與文件整合清理

**不做：**
- 修改題庫 JSON（`question/`）
- 修改應用程式碼（`apps/`、`backend/`）
- 重新出題或執行盲測

## 📖 執行步驟

1. 全站搜尋 `/dosync` 引用，更新規範性文件為 `/pj_sync`（歷史 JOB Report 保留原文作為史料）
2. `job_manager.js` regex 改為同時接受 `pj_sync`/`dosync`，錯誤訊息統一為 `/pj_sync`
3. 刪除 `.agent/` 整個目錄（`create_job.md` 已整合入 `_agent/skills/pj_job/SKILL.md`）
4. `docs/task_history.md` 缺漏條目（2026-03-20~29）整合入 `README_專案發展紀錄.md §二`，原檔刪除
5. `docs/README_任務派工準則.md` 新增 §4.0 草稿先行協議，原步驟重組為 §4.0~§4.5
6. `_agent/skills/pj_job/SKILL.md` 硬閘加入草稿確認兩項 Checklist
7. 建立三份分類模板：`_JOB-TEMPLATE-question_prod/verify/research.md`
8. `job_manager.js create` 新增可選第四參數 `job_type`，透過 `JOB_TYPE_TEMPLATES` 自動選模板
9. `docs/README_通用作業準則.md` 新增 §6.3 執行時間回報規範
10. `jobs/_JOB-REPORT-TEMPLATE.md` 新增 `⏱️ 執行時間回報` 表格

## 📜 關鍵參考檔案

| 檔案路徑 | 用途 |
|:--|:--|
| `docs/README_任務派工準則.md` | 派工生命週期主文件，本次主要修改對象 |
| `docs/README_通用作業準則.md` | 通用作業準則，新增時間回報章節 |
| `_agent/skills/pj_job/SKILL.md` | 派工 Skill，硬閘更新 |
| `scripts/job_manager.js` | 派工腳本，regex + 模板選擇邏輯更新 |
| `docs/README_專案發展紀錄.md` | 官方 Job Changelog，補入缺漏條目 |

## ✅ 啟動 Checklist (Pre-Flight)

- [x] 已讀取 `docs/README_任務派工準則.md` 當前版本
- [x] 草稿已在對話中完整產出（job_type / 目標 / 邊界 / DoD 齊備）
- [x] 使用者已明確確認草稿（回覆「確認」2026-04-04）
- [x] 執行模型：Claude Code (claude-sonnet-4-6)（無外部 API 呼叫）
- [x] 無 API Key / QPM 需求（純文件操作）

## ✅ 驗收 Checklist (Acceptance)

- [x] `docs/`、`_agent/` 規範性文件無 `/dosync` 指令性用法（歷史 JOB 除外）
- [x] `.agent/` 目錄已不存在
- [x] `docs/task_history.md` 已不存在
- [x] `docs/README_任務派工準則.md` 含 §4.0 草稿先行協議
- [x] `_agent/skills/pj_job/SKILL.md` 硬閘含「草稿已產出」與「使用者已確認」
- [x] `jobs/_JOB-TEMPLATE-question_prod.md` 存在
- [x] `jobs/_JOB-TEMPLATE-question_verify.md` 存在
- [x] `jobs/_JOB-TEMPLATE-research.md` 存在
- [x] `node --check scripts/job_manager.js` 語法通過
- [x] `docs/README_通用作業準則.md` 含 §6.3 時間回報規範
- [x] `jobs/_JOB-REPORT-TEMPLATE.md` 含時間回報表格

## ✅ 成果 Checklist (Deliverables)

- [x] 成果表格填寫完畢（見 Report）
- [x] 已執行 `/pj_sync` 確認（docs_ops 任務，無規格書或題庫異動）
- [x] 產出 JOB-148-Report.md，異動清單已列所有修改路徑
