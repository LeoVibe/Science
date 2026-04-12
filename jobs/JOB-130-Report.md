# JOB-130 結案報告：job-manager 單號稽核與派工檔名準則收斂

`last_updated`: 2026-03-29 23:15  
`updated_by`: Cursor Agent  

**`job_type`**：`engineering`

## 完成項目

1. **檔名收斂**  
   - `JOB-128-AG-國語題庫詞頻分析與套話清除.md` ＋ `JOB-128-Report.md`  
   - `JOB-129-AG-南一三下國語題庫全課重製.md` ＋ `JOB-129-Report.md`  
   - 已刪除舊檔 `*-派工單.md`／`*-結案報告.md` 型態。

2. **`scripts/job_manager.js`**  
   - 正則常數：`RE_STRICT_DISPATCH`、`RE_PLAN`、`isReportFilename`、`RE_ANY_SERIAL`  
   - `next`／`audit`：列印條件 A～E、建議下一號、合規派工同號重複則 exit 1  
   - `create`：開單前強制 `runSerialAudit({ exitOnDupStrict: true })`，產出檔名須通過合規正則

3. **準則與 SOP**  
   - `docs/README_通用作業準則.md` §2.1 補實體檔名強制、新增 §2.4  
   - `docs/README_任務派工準則.md` 開案步驟 0、第六章、快速指令表  
   - `.agent/workflows/create_job.md` 同步

4. **引用**  
   - `docs/研究紀錄/國語題庫_*.md` 內派工／Report 路徑已更新。

## 已知限制

- `node scripts/verify_jobs.js` 仍對 **JOB-104／JOB-105** 舊式派工檔名回報「Report 無對應派工」（既有技術債，非本單引入）。

## 結案同步

- [x] 已執行 /dosync 全域知識沉澱（已更新 `docs/task_history.md` 本條目；派工／準則變更見上文路徑）
