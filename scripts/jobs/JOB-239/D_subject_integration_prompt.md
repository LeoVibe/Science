# JOB-239 Phase D：三下_國語全科目整合 _L2_整合.md 派工 Prompt

> 此 prompt 在 Phase C（三份 _L2_summary.md）完成後，派 codex 寫全科目整合報告。

## 輸入

- `knowledge/3_考古題/3_L2_結構化抽取/三下/三下_國語_翰林/_L2_summary.md`
- `knowledge/3_考古題/3_L2_結構化抽取/三下/三下_國語_康軒/_L2_summary.md`
- `knowledge/3_考古題/3_L2_結構化抽取/三下/三下_國語_南一/_L2_summary.md`
- `knowledge/3_考古題/3_L2_結構化抽取/_validation_report_chinese_g3.json`

## 輸出

`knowledge/3_考古題/3_L2_結構化抽取/三下/三下_國語_L2_整合.md`

## 任務內容

請以三份版本級摘要為主，撰寫全科目整合分析。範本對照 `三下/三下_自然_L2_整合.md`（JOB-229 結案產出）與 `四下/四下_自然_L2_整合.md`（JOB-230 結案產出）。

### 結構（6 H2 段落）

```markdown
---
`last_updated`: <ISO 時間>
`updated_by`: Codex (gpt-5.5) - JOB-239 Phase D
`scope`: 三下_國語（翰林+康軒+南一）
`total_files`: 114
`total_questions`: <int>
`total_codes`: <int>
---

# 三下_國語 L2 整合分析

本檔以三份版本級 `_L2_summary.md` 為主，並以 `_validation_report_chinese_g3.json` 中三下_國語三版本的 `per_file` 切片核對總題數與 codes 數。

## 整體成果

三版本合計 <N> 份、<總題數> 題、<總 codes 數> 個 codes_candidate occurrence。<150-200 字概述：哪家份數最多、平均題數最高、整體題量分布、主題集中度>。

| 指標 | 翰林 | 康軒 | 南一 |
| --- | --- | --- | --- |
| 份數 | <int> | <int> | <int> |
| 總題數 | <int> | <int> | <int> |
| 總 codes 數 | <int> | <int> | <int> |
| 平均每份題數 | <float> | <float> | <float> |
| 平均每題 codes | <float> | <float> | <float> |

| 學年 | 翰林 | 康軒 | 南一 | 合計 |
| --- | --- | --- | --- | --- |
| 108 | <int> | <int> | <int> | <int>（pct%） |
| ... | | | | |

## 主題覆蓋（content codes 分布）

請讀取 `knowledge/3_考古題/3_L2_結構化抽取/_meta/chinese_codes_legal_II.json` 的 `content` 陣列，依其中的 `category` 欄位分群，建立表格：

| category | 翰林 | 康軒 | 南一 | 合計 | 占比 |
| --- | --- | --- | --- | --- | --- |
（依 legal JSON 真實分類展開，每一 category 一行，不臆測）

附文字段（150 字）：哪些 content category 在三版本都重點出現、哪些版本獨有、平衡性評論。

## Performance prefix 分布

請讀取 `_meta/chinese_codes_legal_II.json` 的 `performance` 陣列，依 prefix（`{數字}-Ⅱ` 部分）分群，建立表格：

| Prefix | 翰林 | 康軒 | 南一 | 合計 | 對應能力（來自 legal JSON description）|
| --- | --- | --- | --- | --- | --- |
（依 legal JSON 真實 prefix 展開，如 1-Ⅱ / 2-Ⅱ / 3-Ⅱ / 4-Ⅱ / 5-Ⅱ 各幾條）

附文字段（150 字）：哪些 performance prefix 高頻、哪些三版本都不太用，反映本學期重點能力培養。

## 編碼合法率與品質

- A 違規（非合法）：<int> 條
- B 違規（學習階段不對）：<int> 條
- C 違規（重複編碼）：<int> 條
- 合法率：<pct%>
- manual_review 試卷數：<int>
- flagged_for_rerun 試卷數：<int>
- clean 試卷數：<int>

## 題型與 trace 分析

依三份 _L2_summary.md 的題型分布，建立表格：

| 題型 | 翰林 | 康軒 | 南一 | 合計 | 占比 |
| --- | --- | --- | --- | --- | --- |
| fill_blank | ... | | | | |
| multiple_choice | ... | | | | |
| short_answer | ... | | | | |
| reading_comp | ... | | | | |

附 3-5 個代表性 trace 範例（`reason` 欄位，標明 exam_id + question_id），說明三版本在編碼依據上的共同或差異模式。

## 異常與後續

- 列出所有 manual_review / flagged_for_rerun 試卷（exam_id + 違規原因）
- 黃金樣本與 Pilot 對照（schema 一致性）
- 後續建議（是否需要重抽某類試卷、是否擴展到 G5 其他科目 / G6）
```

### 自查

- 6 H2 齊全
- 表格資料引用正確（從三份 _L2_summary.md 加總，不臆測）
- 文字段引用具體 exam_id 案例（非泛論）
- 不省略違規條目
