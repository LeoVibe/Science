# JOB-131 結案報告：社會/自然題庫占位/待人工重寫類字串殘留驗證

`last_updated`: 2026-03-29 23:45  
`updated_by`: Cursor Agent  

**`job_type`**：`engineering`

---

## 1. 本次掃描目的
確認 `question/platform/G3~G6` 的 **社會（SocialStudies）** 與 **自然（Science）** 題庫中，
是否存在與 JOB-128 同源機制的「占位/待人工重寫類」字串殘留（只做驗證，不執行清除）。

---

## 2. 檢測依據（與 JOB-128 對齊）

掃描 `options` 欄位中是否出現：

1. **精確占位字串**  
   `與課文敘述明顯不符（選項待人工重寫）`
2. **較寬比對（LIKE）**  
   任一選項包含子串 `待人工重寫`

---

## 3. 執行方法與產出

- 掃描腳本：`scripts/scan_placeholder_like_options_in_subjects.js`
- 掃描範圍：`question/platform/G3|G4|G5|G6/(SocialStudies|Science)/**.json`（排除 manifest）

本次掃描直接輸出統計到終端；本結案報告整理如下。

---

## 4. 統計結果（是否存在類似占位問題）

| 科目 | 命中檔案數 | 命中題數（含 exact） | 命中選項數（exact） | 命中題數（含 like） | 命中選項數（like） |
|:---|---:|---:|---:|---:|---:|
| 社會（SocialStudies） | 0 | 0 | 0 | 0 | 0 |
| 自然（Science） | 0 | 0 | 0 | 0 | 0 |

**結論**：社會與自然題庫目前不存在此型態「占位/待人工重寫類」選項殘留；可判定不需要套用 JOB-128 那組清除機制針對社會/自然。

---

## 5. Discord 回報狀態

- 已透過 Discord 轉發（頻道 ID 由使用者提供；訊息已送達 `#cursor`）。
- 下方為同內容摘要備份：

> JOB-131 掃描結果：SocialStudies/Science 中 options 不存在「與課文敘述明顯不符（選項待人工重寫）」與子串「待人工重寫」殘留（社會 0、自然 0）。結論：不需套用 JOB-128 類清除機制。

---

## 結案同步

- [x] 已執行 /dosync 全域知識沉澱

