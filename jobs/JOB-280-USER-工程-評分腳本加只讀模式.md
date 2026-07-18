*Created by USER at 2026-07-18*

`last_updated`: 2026-07-18
`updated_by`: Claude Code (claude-opus-4-8)

# JOB-280-USER-工程-評分腳本加只讀模式

**`job_type`**：`engineering`
**`任務屬性`**：E 工程
**`撰寫角色`**：做出一個能用的東西的工程師——這張單要回答：使用者能做什麼？怎麼確認？
定義與邊界見 **`docs/README_任務派工準則.md`** 第二章。

## 📌 任務背景

`evaluate_question_quality.js` 的 `evaluateFile()` 每次呼叫都會把重算的 `cqi_score`／`quality_level` 用 `fs.writeFileSync` 寫回來源檔（第 326 行）。因此凡是「查分數／跑統計」的動作（`generate_library_stats.js`、CLI 直接跑）都會**非預期改寫全站題庫**。此陷阱已在 JOB-272/275/276/277/279 連續 5 次觸發，每次都要用 `git checkout` 還原 200~300 個被誤改的檔。

## 🎯 任務目標

跑任何統計、查分數的動作後，`git status` 對 `question/platform/` 零異動；明確要求寫回時（加參數）仍能正常寫回，計分邏輯與數值完全不變。

## 🚧 任務邊界

本次任務只做：
- `evaluateFile()` 加 `{ dryRun }` 選項；`generate_library_stats.js`（統計）與 CLI（查詢/gate）改為只讀
本次任務不做（遇到以下情況請停止並回報）：
- 修改任何計分邏輯（`evaluateQuestion`）
- 改動任何題庫 JSON 內容
- 動刻意需要寫回的呼叫端（`batch_reevaluate_all` / `strip_*` / `remove_*` / `verify_and_build`）

## ✅ 啟動 Checklist (Pre-Flight)
- [x] 已讀取：evaluate_question_quality.js（evaluateFile/scanDirectory/CLI）、generate_library_stats.js、JOB-272/275/276 技術筆記
- [x] 已確認前置素材：evaluateFile 所有呼叫端清單（8 處）
- [x] **已確認執行模型**：claude-opus-4-8（Claude Code session 內建，訂閱制）
- [x] **已確認使用金鑰**：不適用
- [x] **已確認操作頻次**：不適用
- [x] 目標品質：不適用（工程單）
- [x] 已閱讀「任務邊界」並確認本次範圍

## ✅ 驗收 Checklist (Acceptance)
- [x] 跑 `generate_library_stats.js` 後 `question/platform/` 零異動 — 實測：被改檔數 0（改前每次 200~300）
- [x] dryRun 與 --write 對同檔回傳分數完全相同 — 實測 test 2：逐檔 avgCqi/quality 一致
- [x] 明確 `--write` 仍會寫回（保留原功能） — 冒煙測試：無 opts 呼叫→檔案有寫回 ✓
- [x] dryRun 呼叫檔案零變化 — 冒煙測試：dryRun→檔案 byte-identical ✓
- [x] 計分邏輯零改動 — `evaluateQuestion` 未觸碰；node -c 兩腳本語法 OK

## ✅ 成果 Checklist (Deliverables)
- [x] 成果說明填寫完畢（見 JOB-280-Report.md）
- [x] 進度總表：不涉題庫進度（工程單，免動進度彙整節二）
- [x] 已執行 `/pj_sync`（發展紀錄新增 JOB-280）
- [x] 產出 JOB-280-Report.md，異動清單完整

## 真實回報本次對話的模型與花費
＄作業匯總：Token數:- | 花費: - | 使用模型: claude-opus-4-8 | 執行者: Claude
