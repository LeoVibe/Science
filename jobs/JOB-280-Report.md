*Created by Claude at 2026-07-18*

`last_updated`: 2026-07-18
`updated_by`: Claude Code (claude-opus-4-8)

# JOB-280 結案報告

**`job_type`**：`engineering`
**`executor`**：Claude

## 📊 成果摘要

`evaluate_question_quality.js` 的 `evaluateFile()` 加上 `{ dryRun }` 選項：dryRun 時只計算分數、不把 `cqi_score`／`quality_level` 寫回來源檔。統計腳本（`generate_library_stats.js`）與 CLI 查詢/gate 改為只讀，根除「查分數卻誤改全站題庫」的陷阱（JOB-272/275/276/277/279 連續 5 次踩雷）。計分邏輯（`evaluateQuestion`）完全未動，dryRun 與寫回模式回傳分數逐檔相同。刻意需要寫回的呼叫端（`batch_reevaluate_all`／`strip_*`／`remove_*`／`verify_and_build`）維持預設寫回，功能不受影響。

過程中發現並修正一個**既有錯誤統計值**：committed 的 `libraryStats.json` 把 G3_S2 國語南一記為 QL4:330／QL1:1，但實際 committed 題庫檔為 331 題全 QL4／0 題 QL1。此 330/1 是 JOB-279 用舊寫回碼產統計時，把 L3 一題暫時算成 QL1 寫進檔又讀出、後續檔案還原成 QL4 但 libraryStats 未更新的殘留。修正後 libraryStats 忠實反映 stored 標籤（331/0）。

| 指標 | 數值 |
|:--|:--|
| 統計後題庫被誤改檔數 | 0（改前每次 200~300） |
| dryRun vs --write 分數一致性 | 逐檔 avgCqi/quality 完全相同 |
| 計分邏輯改動 | 0（evaluateQuestion 未觸碰） |
| 修正的錯誤統計 | G3_S2_國語_南一 qlCounts 330/1 → 331/0（與題庫檔實況一致） |

## 📂 異動清單

| 檔案路徑 | 異動類型 | 說明 |
|:--|:--|:--|
| `scripts/evaluate_question_quality.js` | 修改 | `evaluateFile(filePath, opts)` 加 dryRun 閘門（僅 `!opts.dryRun` 才 writeFileSync）；`scanDirectory` 傳遞 opts；CLI 預設只讀，加 `--write` 才寫回並印提示 |
| `scripts/generate_library_stats.js` | 修改 | `evaluateFile(filePath, { dryRun: true })`（統計純查詢） |
| `apps/v3_eidos/public/data/libraryStats.json`、`src/data/libraryStats.json` | 重產 | 修正 G3_S2_國語_南一 過期統計 330/1 → 331/0（與 committed 題庫檔一致） |

## ✅ Checklist 對照結果

### 驗收 Checklist (Acceptance)
- [x] 跑統計後 `question/platform/` 零異動 — 實測 `git status question/platform` = 0 檔（改前每次 200~300）
- [x] dryRun 與 --write 同檔回傳分數完全相同 — 逐檔 avgCqi/quality 一致（test 2）
- [x] --write 仍寫回（保留原功能） — 冒煙測試：無 opts 呼叫→檔案 mtime 變、有寫回 ✓
- [x] dryRun 呼叫檔案 byte-identical — 冒煙測試通過 ✓
- [x] 計分邏輯零改動 — evaluateQuestion 未觸碰；`node -c` 兩腳本語法 OK

### 成果 Checklist (Deliverables)
- [x] 成果說明填寫完畢
- [x] 進度總表：工程單不涉題庫進度，免動節二
- [x] 已執行 `/pj_sync`（發展紀錄新增 JOB-280）
- [x] 產出 JOB-280-Report.md，異動清單完整

## ⚠️ 遺留問題

1. **G3_S2_CHI_NANYI_L3 一題 stored=QL4 但 rubric 重算=QL1**：這是本次修正 libraryStats 時發現的次要內容註記。libraryStats/前台以 stored 標籤（QL4）為準，屬正確顯示；rubric 重算的降級是內部啟發式的不同意見，非題目缺陷。無需立即動作，未來若做 QL 全站稽核可一併檢視。此題非 BIAS、非文本錯位，僅計分啟發式與 review 標籤有 1 級落差。
2. **其他 5 個 evaluateFile 呼叫端未改**（`batch_reevaluate_all`/`strip_*`/`remove_*`/`verify_and_build`）：這些是刻意要寫回的用途，維持預設（寫回）行為正確。其中 `verify_and_build.js`（上版建置）的寫回若未來也想改只讀，可另評估——本單維持不動以免影響建置流程。

## 🔧 技術筆記

- **根因**：`evaluateFile` 第 326 行無條件 `fs.writeFileSync`，而 `evaluateQuestion`（247-248 行）會把重算的 `cqi_score`/`quality_level` mutate 進 q。因此「查詢」也會落地。
- **設計選擇**：採 opt-out（預設仍寫回、加 `dryRun` 才只讀），而非 opt-in（預設只讀），是為了讓 3 個刻意寫回的呼叫端零改動、確定不破壞其行為（B3 surgical）。只把 2 條「純查詢」路徑（統計＋CLI）改成只讀。
- **CLI 行為變更**：`node evaluate_question_quality.js <path>` 預設變只讀（會印「只讀模式」提示），加 `--write` 還原舊寫回行為。gate 模式（`--gate`）不需寫回，改只讀更安全。
- **libraryStats 修正的判定依據**：committed 題庫檔 = 331 題全 QL4（實掃）；committed libraryStats = 330/1（過期）。以題庫檔為真源，331/0 正確。舊 330/1 正是本 JOB 要消滅的寫回汙染的產物。

## 🔍 驗收確認
| 欄位 | 內容 |
|:--|:--|
| 驗收者 | Claude Code（PM）＋待使用者驗收 |
| 驗收時間 | 2026-07-18 |
| 驗收結果 | 通過（佐證：統計後題庫 0 異動實測；dryRun/write 分數逐檔一致；write/dryRun 冒煙測試各如預期；node -c 語法通過） |
| 退回原因 | 無 |

## 真實回報本次對話的模型與花費
＄作業匯總：Token數:- | 花費: -（Claude Code session 訂閱額度內） | 使用模型: claude-opus-4-8 | 執行者: Claude
