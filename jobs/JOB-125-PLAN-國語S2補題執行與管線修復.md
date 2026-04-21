*Created by Cursor Agent at 2026-03-29*

`last_updated`: 2026-03-29 16:15  
`updated_by`: Cursor Agent  
`version`: 1.0  

# JOB-125：國語 S2 補題執行（對齊 JOB-102）與產題管線修復

**`job_type`**：`question_prod`（含 `scripts` 緊急修復）

## 背景

- **JOB-124** 已交付批次編排腳本；**JOB-102** 仍以 **G4 S2 三版本全面重建**為 Batch 1 最高優先。
- 執行 `auto_generate_questions.js` 時發現 **`KNOWLEDGE_CHINESE_ROOT` 誤用 `../../`**，在標準目錄（`0_AI_Project/eidosProject/` 為 repo 根）下會指到 **`eidosProject` 同層的 `knowledge/`**，導致國語課文永遠「資料不齊備」。

## 目標

1. **修復**：`scripts/auto_generate_questions.js` 中國語 KL4 根路徑改為 **`path.resolve(__dirname, '../knowledge/1_課綱研究/國語')`**（`ApiKeys.cfg` 仍維持 `../../`，與同層 `0_AI_Project` 慣例一致）。
2. **執行**：依 **JOB-102 Batch 1** 跑 **G4 S2** 補題（建議先單版本驗證再全跑）：
   ```bash
   node scripts/batch_chinese_s2_generate.js --grades G4 -- \\
     --key Yotta --model <負責人指定> --qpm 10 --batch 10 --threshold 5.0 --target 30
   ```
3. **品管**：各版本路徑執行 `node scripts/evaluate_question_quality.js …`，確認 **CQI-P ≥ 5.5**；南一依 JOB-102 需 **BIAS 清除／重產**者另依該單步驟。

## DoD

- [x] `auto_generate_questions.js` KL4 路徑可正確載入課文（以 G4 翰林 L1 驗證：日誌出現 `📖 [國語] 課文來源：KL4…`）。
- [ ] G4 S2 三版本補題／重產完成並填回 **JOB-102** checklist 與成果表。
- [ ] 已跑 **evaluate_question_quality.js** 並記錄模型代號於 Report。
- [x] 產出 **`jobs/JOB-125-Report.md`**（階段性；結案時補實跑紀錄）。

## 關聯

- **JOB-102**、**JOB-103**（下游盲測）、**JOB-124**（批次腳本）。
