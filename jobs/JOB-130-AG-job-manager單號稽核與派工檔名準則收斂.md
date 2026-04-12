*Created by AG at 2026-03-29 22:40*

`last_updated`: 2026-03-29 22:40  
`updated_by`: Cursor Agent  

# JOB-130-AG-job-manager單號稽核與派工檔名準則收斂

**`job_type`**：`engineering`（含 `docs_ops` 文件收斂）

## 📌 任務背景
派工單曾出現手動檔名與 PLAN 撞號；需收斂不合規檔名、將正則與多重驗證寫入準則，並強化 `job_manager.js`。

## 🎯 任務目標
- JOB-128／129 改為合規檔名並更新引用  
- `docs/README_任務派工準則.md` 第三章 §3.4、`.agent/workflows/create_job.md` 與腳本同步  
- `job_manager.js` 提供 `next`／`audit` 與 `create` 前稽核

## 📖 執行步驟
1. 更名 `JOB-128-*`、`JOB-129-*` 並更新 `docs/研究紀錄` 連結  
2. 實作 `runSerialAudit`、正則常數、`create` 前強制驗證  
3. 補齊準則與 SOP 文字

## 📜 關鍵參考檔案
| 檔案路徑 | 用途 |
|:--|:--|
| `docs/README_任務派工準則.md` | 派工生命週期、`job_type`、開結案管線 |
| `knowledge/README_研究架構總綱.md` | 研究階段（KL／RM） |
| `question/README_出題與品管準則.md` | 出題原則 |
| `question/README_驗證與盲測準則.md` | 驗證原則 |

## ✅ 啟動 Checklist (Pre-Flight)
- [ ] 已讀取：{列出必讀文件路徑}
- [ ] 已確認前置素材 KL3/KL4 存在（若本任務適用）
- [ ] **已確認執行模型**：[模型：___________] (⚠️ 啟動前必須詢問使用者並填入，嚴禁自動執行)
- [ ] **已確認使用金鑰**：[金鑰：___________] (例: Yotta / Miaw)
- [ ] **已確認操作頻次**：[QPM：___________] (例: 1 QPM / 10 QPM)
- [ ] 目標品質：QL4（若本任務適用）

## ✅ 驗收 Checklist (Acceptance)
- [x] `node scripts/job_manager.js next` 可執行且 exit 0（無同號多份合規派工）
- [x] `node scripts/job_manager.js create` 於開單前跑相同稽核
- [x] 準則 §2.4 與腳本正則描述一致

## ✅ 成果 Checklist (Deliverables)
- [ ] 已執行 `/pj_sync` 或 `/dosync`（若 PM 要求全站文件同步）
- [x] 產出 `jobs/JOB-130-Report.md`

## 真實回報本次對話的模型與花費
＄作業匯總 ：Token數:{真實Meta中數字} | 花費: ${換算台幣} | 使用模型: {真實Meta中的模型代碼} | 執行者: {AG|Cursor|Claude}