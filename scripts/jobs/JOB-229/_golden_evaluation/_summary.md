`last_updated`: 2026-05-10
`updated_by`: Claude Code (claude-opus-4-7)

# JOB-229 黃金樣本候選評估彙整

## 執行紀錄
- 日期: 2026-05-10
- 方法: 6 條 codex 並行評估（v3 argument 模式，避開 stdin UTF-8 bug）
- 並行測試結果: 137-209s（最慢康軒2 209s），全 exit=0

## 評估結果彙整

| 候選 | 整合類型 | 題數 | 結構 | 題型 | 編碼 | 推薦 | 關鍵問題 |
|---|---|---|---|---|---|---|---|
| 翰林1（codex 自選 翰林_112_成功國小_第一次段考） | dual_source | 50 | 9 | 8 | 5 | Maybe | 主題集中植物生長 |
| 翰林2（青山國小_第三次段考） | dual_source | 0 | 3 | 1 | 1 | No | extract_failed，無題目 |
| 康軒1（伸東國小_第二次段考） | dual_source | 45 | 8 | 8 | 7 | Maybe | answer_partial |
| 康軒2（內安國小_第二次段考） | dual_source | 29 | 8 | 9 | 7 | No | answer_empty 無答案 |
| 南一1（codex 自選 中正國小_第一次段考） | dual_source | 39 | 9 | 7 | 6 | Maybe | 題型偏集中 |
| 南一2（成功國小_第一次段考） | claude_only | 36 | 8 | 8 | 5 | No | 實質單源 codex char=0 |

## 最終選擇

**`chosen_golden_sample`**: `翰林_112_成功國小_第一次段考`

### 選擇理由

1. **唯一同時滿足 dual_source + paper_full + answer_full**：
   - quality_flags: `paper_full`, `answer_full`, `dual_source_merged`, `claude_primary`, `ocr_corrected`, `columns_reordered`
   - claude 源 char=2726, codex 源 char=2379（兩源都有實質內容）
2. **題數最多**：50 題（其他候選 29-45 題）
3. **題型完整**：是非 12、選擇 13、回答問題 20、閱讀測驗 5
4. **codex 評分**：結構 9 / 題型 8 / 編碼 5（編碼覆蓋偏窄是因為主題集中植物，非 schema 缺陷）

### 已知限制

- `topic_hits` 僅命中「植物生長: 49 / 天氣觀測: 1」：黃金樣本對 INa-INg 七大主題覆蓋有限
- 對策：Pilot 5 份目標選擇時擴大主題覆蓋（含天氣、動物、水三態、浮力等）

## 與 JOB-228 社會黃金樣本對照

| 條件 | JOB-228 翰林_108_文德國小_第二次段考（社會） | JOB-229 翰林_112_成功國小_第一次段考（自然） |
|---|---|---|
| 整合類型 | dual_source_merged | dual_source_merged |
| paper_full | ✅ | ✅ |
| answer_full | ✅ | ✅ |
| 題數 | 50 | 50 |
| 主題覆蓋 | 集中地方政府/公共事務（4-5 主題） | 集中植物生長（1-2 主題） |
| 編碼覆蓋 | 19 種 codes（後續 schema 觀察） | 預估 5-10 種（待親做後確認） |

## 6 份候選評估明細

各份完整評估保留在本目錄：
- `三下_自然_翰林1.md`（codex 自選 翰林_112_成功1）
- `三下_自然_翰林2.md`（青山3，extract_failed）
- `三下_自然_康軒1.md`（伸東2，answer_partial）
- `三下_自然_康軒2.md`（內安2，answer_empty）
- `三下_自然_南一1.md`（codex 自選 中正1）
- `三下_自然_南一2.md`（成功1，claude_only）

## 並行 6 條 codex 性能驗證

- 總耗時 209s（最慢拖尾）
- 平均單條 157s
- 6 條 / 209s = 1.7x 加速比（vs 序列預估 940s）
- exit=0 全部成功
- 無 rate limit / 429 / quota 錯誤
- 結論: codex 並行 6 條穩定可行，但本 JOB Phase 5 仍採並行 3 條（保守設計）
