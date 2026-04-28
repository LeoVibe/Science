*Created by AG at 2026-04-29 00:15*

`last_updated`: 2026-04-29 00:15
`updated_by`: Claude Code (claude-opus-4-7[1m])

# JOB-214-AG-寫入-長時任務進度回報範本-跨任務通用

**`job_type`**：`docs_ops`

## 📌 任務背景

JOB-209（米蘭考古題下載）跨 6 天完成，過程中建立的「進度回報基礎設施」（dashboard + loop wrapper + ScheduleWakeup + Discord 同步 + per-task timeout）被使用者明確認可：「**呈現的方法、loop 的機制、與回報的細緻度都很棒**」。為避免下次大型批次任務（資料抓取／批量出題／批量驗證／長時 migration 等）重新發明，本任務將 JOB-209 實踐抽象成可重用範本，含文件 + template 檔骨架 + 套用步驟。

## 🎯 任務目標

完成後達成：

1. 任何 Agent 接到「>2 小時、批次處理、有 progress 概念」的長時 JOB，能在 30 分鐘內依範本接好五件事：
   - 進度儀表板腳本（時間戳 + 整體 + 近期增量 + 分組進度條 + 預估完成）
   - 連續 batch loop wrapper（自動 batch、連兩輪沒進展自停、shell 變數防 unbound）
   - ScheduleWakeup 自動回報節奏（建議 1 小時間隔）
   - Discord 同步（送到 `eidos_派工與回報` `1487738477608177714`）
   - per-task hard timeout 防 hang
2. 範本文件能直接被讀者（人或 Agent）一次看懂「為什麼要五件事都做」「每件事的細節是什麼」。
3. JOB-209 結果做為唯一案例引用，不重新另起案例。

## 🚧 任務邊界

本次任務只做：
- 撰寫範本主文件 `docs/長時任務執行範本.md`
- 建立 `scripts/templates/` 下 3 個 template 骨架檔
- 在 CLAUDE.md / README.md 加索引指標

本次任務不做（遇到以下情況請停止並回報，不可自行延伸）：
- 不重構 `scripts/exam_download_runner.py` 等 JOB-209 既有實作（保留現狀作活案例）
- 不替其他 JOB 套用範本（套用是另一張 JOB）
- 不寫成「通用框架函式庫」（範本是 README + 拷貝骨架，不是 import 套件）
- 不修改 JOB-209 結案狀態
- 不寫前端／不動題庫 JSON

## 📖 執行步驟

### Step 1：撰寫主文件 `docs/長時任務執行範本.md`

至少包含以下章節：
1. **適用情境**：什麼條件下啟用此範本（>2h / 有批次 / 有 progress）
2. **五元件架構**：dashboard / loop wrapper / ScheduleWakeup / Discord / timeout
3. **每元件設計理由**（why）+ **操作細節**（how）+ **JOB-209 對應實例**
4. **失敗模式與處置**：網路斷、磁碟滿、子程序卡死、休眠中斷、結構變更
5. **30 分鐘套用 checklist**：拷貝 template → 改 placeholder → 啟動 loop → 設 wakeup → 開 Discord 同步

### Step 2：建立 template 骨架（`scripts/templates/`）

- `progress_dashboard.py`（通用版）：傳入 progress.json 路徑、grouping key 設定、計算近期增量、輸出醒目時間戳的 dashboard
- `continuous_loop.sh`（通用 wrapper）：count 函式 placeholder、自動停止條件（remaining=0 或連兩輪沒減）、`unbound variable` 防護
- `wakeup_prompt.md`（ScheduleWakeup prompt 範本）：含時間戳/dashboard/Discord/PID 確認 5 步驟

### Step 3：更新索引

- `CLAUDE.md` 加一行指向 `docs/長時任務執行範本.md`
- `README.md` 文件地圖加一條

### Step 4：撰寫 Report

- 列實際異動檔案路徑
- 引用 JOB-209 為案例（連結 `jobs/JOB-209-Report.md`）
- 不重新做下載統計（直接 link JOB-209 Report）

### Step 5：結案五步走

依 CLAUDE.md §3.3 第 13 條：
1. Report 定稿
2. `node scripts/job_manager.js close JOB-214`
3. 更新 `docs/README_專案發展紀錄.md`
4. `/pj_sync`
5. Discord 結案摘要

## 📜 關鍵參考檔案

| 檔案路徑 | 用途 |
|:--|:--|
| `docs/README_任務派工準則.md` | 派工生命週期、`job_type`、開結案管線 |
| `jobs/JOB-209-Report.md` | 案例參考（範本要 reference 這份 214 行 + history-bak 599 行）|
| `scripts/exam_download_runner.py` | 五元件中 timeout 設計實例 |
| `scripts/progress_dashboard.py` | dashboard 實作參考（要抽象成 template）|
| `scripts/continuous_retry_missing_loop.sh` | loop wrapper 實作參考 |

## ✅ 啟動 Checklist (Pre-Flight)

- [x] 已讀取：`docs/README_任務派工準則.md`、`jobs/JOB-209-Report.md`
- [x] 已確認前置素材：JOB-209 已結案、五元件實作存在於 `scripts/`
- [x] **已確認執行模型**：claude-opus-4-7[1m]（依現有對話延續，無需另詢問）
- [x] 已確認使用金鑰：N/A（純文件任務，無 API 呼叫）
- [x] 已確認操作頻次：N/A（純文件任務）
- [x] 已閱讀「任務邊界」並確認本次範圍

## ✅ 驗收 Checklist (Acceptance)

> 本任務為 docs_ops，無 CQI 計分，改用以下實質驗收項。

- [ ] `docs/長時任務執行範本.md` 撰寫完成（含五章節：適用情境 / 五元件架構 / 設計理由與細節 / 失敗模式與處置 / 30 分鐘套用 checklist）
- [ ] `scripts/templates/progress_dashboard.py` 骨架可獨立執行（傳入測試 progress.json 能輸出 dashboard）
- [ ] `scripts/templates/continuous_loop.sh` shell 語法 OK（`bash -n` 通過）
- [ ] `scripts/templates/wakeup_prompt.md` 包含完整 5 步驟 prompt 模板
- [ ] CLAUDE.md / README.md 加入索引指標
- [ ] 文件中至少有一處明確 reference `jobs/JOB-209-Report.md`

## ✅ 成果 Checklist (Deliverables)

- [ ] 異動清單已列出所有實際路徑（`docs/長時任務執行範本.md` + 3 個 template + CLAUDE.md/README.md）
- [ ] 進度總表已同步（`docs/README_專案發展紀錄.md` 加 JOB-214 條目）
- [ ] 已執行 `/pj_sync`
- [ ] Discord 結案摘要已送到 `eidos_派工與回報`（chat_id `1487738477608177714`）
- [ ] 產出 `jobs/JOB-214-Report.md`

## 真實回報本次對話的模型與花費

＄作業匯總：Token數:- | 花費: $- | 使用模型: claude-opus-4-7[1m] | 執行者: Claude
