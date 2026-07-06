# JOB-232 Phase C：版本級 _L2_summary.md 派工 Prompt（五下_社會）

> 此 prompt 在 Phase 5 全量 120 份抽取完成 + Phase B 驗證後，派 codex 對每出版社（翰林/康軒/南一）寫一份 `_L2_summary.md`。

## Placeholder（呼叫前 sed 替換）

- `{PUBLISHER}`: 出版社（翰林/康軒/南一）
- `{N_FILES}`: 該出版社的份數（翰林 / 康軒 / 南一，含黃金 + Pilot + 全量）
- `{OUTPUT_PATH}`: `knowledge/3_考古題/3_L2_結構化抽取/五下/五下_社會_{PUBLISHER}/_L2_summary.md`

---

## 任務內容

請對 `{PUBLISHER}` 出版社的所有五下_社會 L2 結構化抽取結果做版本級彙整，寫入 `{OUTPUT_PATH}`。

### Step 1：讀取資料

1. **驗證報告**：`knowledge/3_考古題/3_L2_結構化抽取/_validation_report_social_g5.json` 的 `per_file` 區段中 publisher = `{PUBLISHER}` 的所有 entry。
2. **逐份 JSON**：`knowledge/3_考古題/3_L2_結構化抽取/五下/五下_社會_{PUBLISHER}/*.json` + 黃金樣本（若 publisher=該黃金版本）+ Pilot（若該 publisher 有 Pilot）。
3. **合法編碼清單**：`knowledge/3_考古題/3_L2_結構化抽取/_meta/social_codes_legal_III.json`（46 條）。

### Step 2：核對

- per_file 加總題數 == JSON 加總題數
- per_file 加總 codes 數 == JSON 加總 codes 數
- 任何不一致須在 markdown 中標註 `（不一致：xxx）`

### Step 3：寫 markdown（5 H2 段落、≥ 200 行）

```markdown
---
`last_updated`: <ISO 時間>
`updated_by`: Codex (gpt-5.5) - JOB-232 Phase C
`version`: {PUBLISHER}
`n_files`: {N_FILES}
---

# {PUBLISHER}五下社會 L2 版本級摘要

本摘要彙整同版目錄下所有 `*.json`，並以 `_validation_report_social_g5.json` 的 `per_file` 題數與 codes 數作交叉核對。

## 概覽
- 驗證狀態（核對是否一致）
- 平均每份題數、平均每題 codes
- 文字段落 100-200 字描述特色

## 統計（表格）
| 類別 | 項目 | 數值 | 占比/來源 |
| --- | --- | --- | --- |
| 基本 | 出版社 | {PUBLISHER} | _meta.publisher |
| 基本 | 份數 | {N_FILES} | 派工單 |
| 基本 | 總題數 | <int> | per_file 加總 |
| 基本 | 總 codes 數 | <int> | per_file 加總 |
| 學年分布 | 108 | <int> | <pct%> |
| 學年分布 | 109 | <int> | <pct%> |
| ... | | | |
| 段考類型分布 | 第一次段考 | <int> | <pct%> |
| ... | | | |

## 編碼分布

- 編碼覆蓋（Aa/Ab/Ac/Ad/Ba/Bb/Bc/Ca/Cb/Cc/Da/Db/Dc + performance prefix 1a/1b/1c/2a/2b/2c/3b/3c 各幾種出現）
- top 10 編碼 + 出現次數
- by_cognitive_level 加總（記憶/理解/應用/分析/評鑑/創造）

## misconception 分布

- 概念混淆/事實錯誤/空心知識 各幾題
- 抽 3-5 個典型 misconception_evidence 範例引述

## 異常與行動

- 列 manual_review / flagged_for_rerun 的試卷
- 編碼合法率（清算 A 違規）
- 重複編碼（C 違規）

## 逐份 validation 對照表

| exam_id | 學年 | 段考類型 | 題數 | codes 數 | validation action |
| --- | --- | --- | --- | --- | --- |
（{N_FILES} 行）
```

### Step 4：自查

- markdown 至少 200 行（不含表格行）
- 表格欄位用 `| ... |` 格式
- 異常條目都列出，不省略
- frontmatter 4 欄齊全（last_updated/updated_by/version/n_files）

### Step 5：寫入 `{OUTPUT_PATH}`

完成後 echo 該檔案路徑與行數確認。
