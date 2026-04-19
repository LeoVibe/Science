# JOB-198 Report — 全量重評 + 排除 backup + 限已開放科目統計

`completed`: 2026-04-18
`executor`: Claude Code（使用者授權例外）

---

## 執行摘要

落實 JOB-197 canonical 定義到**實際資料層**：對全部已開放科目（G3/G4/G5/G6 下學期）的 380 檔題庫執行 `evaluate_question_quality.js` 全量重評；更新 `generate_library_stats.js` 排除 backup 資料夾並限定已開放科目為統計母體；重新生成 `libraryStats.json`。

---

## 修改檔案

| 檔案 | 變更 |
|:--|:--|
| `scripts/generate_library_stats.js` | 新增 `OPEN_GRADE_SEMESTERS` Set（G3-G6 × S2）+ `isBackupDir()` 過濾；掃描時跳過非開放學期與 backup 目錄 |
| `scripts/batch_reevaluate_all.js` | **新增**批次腳本：對所有已開放+非 backup 的 380 檔 JSON 執行 `evaluateFile()`，含 dry-run 模式與進度統計 |
| 380 份題庫 JSON `quality_level` 欄位 | 由 `evaluateFile()` 依 canonical 邏輯重寫（檢查 KL4 雙檔存在性 + `blind_evaluation`）|
| `apps/v3_eidos/{src,public}/data/libraryStats.json` | 重新生成，19 個已開放科目 × 3 家出版社 = 57 個 publisherStats |

---

## 全量重評結果（380 檔級 QL 分布）

| 等級 | 檔數 |
|:--:|:--:|
| QL4 | 115 |
| QL3 | 60 |
| QL1 (BIAS) | 39 |
| QL1 | 166 |
| **合計** | **380** |

---

## 最終 publisherStats 品質分布

### QL4（16 個，完全達標）

G3 下：自然/社會/英語/數學 各 3 家、國語 翰林/南一
G4 下：自然/國語 各 3 家、社會 翰林/康軒
G6 下：國語 各 3 家

### QL3（8 個）

| 科目 | QL4% | QL3+% | 距 QL4 差距 |
|:--|:--:|:--:|:--:|
| G3 下 國語 康軒 | 87% | 100% | 3% |
| G4 下 社會 南一 | 84% | 100% | 6% |
| G5 下 國語 翰林 | 68% | 100% | 22% |
| G5 下 國語 康軒 | 43% | 100% | 47% |
| G5 下 國語 南一 | 34% | 100% | 56% |
| G5 下 數學 3 家 | 0% | 100% | 90% |
| G5 下 社會 3 家 | 0% | 99-100% | 90% |

### QL1（32 個，無 KL4 per-lesson 雙檔結構）

- G4 下 英語 / 數學 各 3 家
- G5 下 英語 / 自然 各 3 家
- G6 下 自然 / 社會 / 數學 各 3 家

> **這是 canonical 對「實際狀況」的誠實反映**：這些科目目前沒有 `KL4_..._單課研究紀錄.md` + `KL4_..._考古題與討論.md` 雙檔結構，依 canonical 定義判為 QL1。要升級需補建 KL4 研究或為該科目建立 canonical 變體。

---

## 過濾結果

- 全部 JSON 檔：654
- 已開放 + 非 backup：**380**
- 跳過：274（包含 G_S1 上學期、非開放年級、`*backup*`、`*_job*` 資料夾）

---

## 驗收 Checklist

- [x] `generate_library_stats.js` 已新增 `OPEN_GRADE_SEMESTERS` 過濾
- [x] `generate_library_stats.js` 已新增 `isBackupDir()` 排除
- [x] `batch_reevaluate_all.js` 完成 380 檔重評，0 失敗
- [x] 重新生成 `libraryStats.json`（src + public 兩份）
- [x] 確認 `G4_S2_自然_NanYi_backup_job169` 已從統計排除
- [x] 確認 G_S1（上學期）資料已從統計排除
- [x] 已執行 /pj_sync 全域知識沉澱

＄作業匯總：Token數:- | 花費:$- | 使用模型: claude-sonnet-4-6 | 執行者: Claude Code（使用者授權例外）
