# JOB-229 Phase D：三下自然全科目整合 _L2_整合.md 派工 Prompt

> 此 prompt 在 Phase C（三份 _L2_summary.md）完成後，派 codex 寫全科目整合報告。

## 輸入

- `knowledge/3_考古題/3_L2_結構化抽取/三下/三下_自然_翰林/_L2_summary.md`
- `knowledge/3_考古題/3_L2_結構化抽取/三下/三下_自然_康軒/_L2_summary.md`
- `knowledge/3_考古題/3_L2_結構化抽取/三下/三下_自然_南一/_L2_summary.md`
- `knowledge/3_考古題/3_L2_結構化抽取/_validation_report_natural.json`

## 輸出

`knowledge/3_考古題/3_L2_結構化抽取/三下/三下_自然_L2_整合.md`

## 任務內容

請以三份版本級摘要為主，撰寫全科目整合分析。範本對照 `三下/三下_社會_L2_整合.md`（JOB-228 結案產出）。

### 結構（6 H2 段落）

```markdown
---
`last_updated`: <ISO 時間>
`updated_by`: Codex (gpt-5.5) - JOB-229 Phase D
`scope`: 三下_自然（翰林+康軒+南一）
`total_files`: 123
`total_questions`: <int>
`total_codes`: <int>
---

# 三下自然 L2 整合分析

本檔以三份版本級 `_L2_summary.md` 為主，並以 `_validation_report_natural.json` 中三下自然三版本的 `per_file` 切片核對總題數與 codes 數；統計母體不含 `_archive_social/`。

## 整體成果

三版本合計 <N> 份、<總題數> 題、<總 codes 數> 個 codes_candidate occurrence。<150-200 字概述：哪家份數最多、平均題數最高、整體題量分布、主題集中度>。

| 指標 | 翰林 | 康軒 | 南一 |
| --- | --- | --- | --- |
| 份數 | 14 | 60 | 49 |
| 總題數 | <int> | <int> | <int> |
| 總 codes 數 | <int> | <int> | <int> |
| 平均每份題數 | <float> | <float> | <float> |
| 平均每題 codes | <float> | <float> | <float> |

| 學年 | 翰林 | 康軒 | 南一 | 合計 |
| --- | --- | --- | --- | --- |
| 108 | <int> | <int> | <int> | <int>（pct%） |
| ... | | | | |

## 主題覆蓋（INa-INg 七大內容類別）

| 主題 | 翰林 | 康軒 | 南一 | 合計 | 占比 |
| --- | --- | --- | --- | --- | --- |
| INa（自然界組成） | <int> | <int> | <int> | <int> | <pct%> |
| INb（現象規律） | ... | | | | |
| INc（構造功能/工具/水三態/毛細） | ... | | | | |
| INd（演變互動/天氣） | ... | | | | |
| INe（科技人文/環境） | ... | | | | |
| INf（資源永續） | ... | | | | |
| INg（尺度單位） | ... | | | | |

附文字段（150 字）：哪些主題在三版本都重點出現、哪些版本獨有、平衡性評論。

## Performance prefix 分布

| Prefix | 翰林 | 康軒 | 南一 | 合計 | 對應能力 |
| --- | --- | --- | --- | --- | --- |
| ti | ... | | | | 觀察規律 |
| tr | ... | | | | 依紀錄說明 |
| tc | ... | | | | 分辨分類 |
| pe | ... | | | | 變因預測/操作器材 |
| pa | ... | | | | 分類製圖/解釋資料 |
| ai | ... | | | | 動手實作 |
| ... | | | | | |

附文字段（150 字）：哪些 performance 高頻、哪些 prefix 三版本都不太用，反映本學期重點探究能力。

## 編碼合法率與品質

- A 違規（非合法）：<int> 條
- B 違規（學習階段不對）：<int> 條
- C 違規（重複編碼）：<int> 條
- 合法率：<pct%>
- manual_review 試卷數：<int>
- flagged_for_rerun 試卷數：<int>
- clean 試卷數：<int>

## misconception 與認知層次

| 認知層次 | 翰林 | 康軒 | 南一 | 合計 | 占比 |
| --- | --- | --- | --- | --- | --- |
| 記憶 | ... | | | | |
| 理解 | ... | | | | |
| 應用 | ... | | | | |
| 分析 | ... | | | | |
| 評鑑 | ... | | | | |
| 創造 | ... | | | | |

| misconception_type | 翰林 | 康軒 | 南一 | 合計 |
| --- | --- | --- | --- | --- |
| 概念混淆 | ... | | | |
| 事實錯誤 | ... | | | |
| 空心知識 | ... | | | |

附 3-5 個典型 misconception_evidence 範例引述（標明來源 exam_id + question_id）。

## 異常與後續

- 列出所有 manual_review / flagged_for_rerun 試卷（exam_id + 違規原因）
- 黃金樣本與 Pilot 對照（schema 一致性）
- 後續建議（是否需要重抽某類試卷、是否擴展到四/五/六下）
```

### 自查

- 6 H2 齊全
- 表格資料引用正確（從三份 _L2_summary.md 加總，不臆測）
- 文字段引用具體 exam_id 案例（非泛論）
- 不省略違規條目
