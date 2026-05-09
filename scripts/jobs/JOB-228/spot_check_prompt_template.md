# JOB-228 Phase 5 Spot Check Prompt Template

> 由 Claude wakeup 階段呼叫。每次注入一個 rank 的資訊，由 codex 對該 rank 的 JSON 做嚴格 review，append 結果到 `scripts/jobs/JOB-228/_spot_check.log`。

## Placeholder

呼叫前 sed 替換：
- `{RANK_NUM}`: rank 序號（1-109）
- `{OUTPUT_PATH}`: 該 rank 的 JSON 輸出路徑（從 `_full_progress.json.rank_N.output`）
- `{PUBLISHER}`: 出版社（翰林/康軒/南一），從 `_full_targets.json.targets[N-1].publisher`
- `{EXAM_ID}`: 試卷 ID，從 `_full_targets.json.targets[N-1].exam_id`

---

## 任務內容（codex 看的）

請對 rank {RANK_NUM}（exam_id={EXAM_ID}、出版社={PUBLISHER}、輸出檔={OUTPUT_PATH}）的結構化抽取結果做嚴格 review。

### Step 1：選定對照黃金樣本

依出版社挑：
- 翰林 → `knowledge/3_考古題/3_L2_結構化抽取/_golden_samples/翰林_108_文德國小_第二次段考.json`
- 康軒 → `knowledge/3_考古題/3_L2_結構化抽取/_golden_samples/康軒_111_新北安和國小_期中考.json`
- 南一 → `knowledge/3_考古題/3_L2_結構化抽取/_pilot/南一_108_成功國小_第一次段考.json`

### Step 2：五項檢查

#### 檢查 1：Schema 結構對照

讀 `{OUTPUT_PATH}` 與對照黃金樣本，比對：
- 頂層 keys 是否一致（pilot 5 份統一是 `_meta`/`questions`/`_summary` 三 keys；黃金 A 多了頂層 exam_id 等是已知差異不算 fail）
- `_meta` 必含欄位：exam_id、publisher、academic_year、schema_version、extracted_at、source_pdfs
- `questions` 是 array，每筆含 question_id、type、stem、codes_candidate
- `_summary` 必含 total_questions、by_type、by_code_count

判定：
- 全部一致 → `schema: ok`
- 缺非關鍵欄位 → `schema: warn`
- 缺關鍵欄位（_meta/questions/_summary 任一缺）→ `schema: fail`

#### 檢查 2：Reason 樣本空泛性（抽 5 條）

從 `questions[]` 隨機抽 5 個 `codes_candidate[].reason`，判斷：
- **specific**：引用題幹原文（≥ 5 字題幹片段）或具體選項描述
- **nonspecific**：泛指（如「考察地理概念」「測試認知能力」）

判定：
- specific ≥ 4/5 → `reason: ok`
- specific 2-3/5 → `reason: warn`
- specific ≤ 1/5 → `reason: fail`

#### 檢查 3：編碼分布健康度

讀 `_summary.code_frequency`，計算最高頻 1 碼的占比：
- max_code_count / sum(all_code_counts) × 100%

判定：
- 占比 ≤ 30% → `distribution: ok`（健康分布）
- 30-60% → `distribution: warn`
- > 60% → `distribution: fail`（嚴重偏斜）

#### 檢查 4：認知層次分布

讀 `_summary.by_cognitive_level`，計算各層比例。
判定：
- 「記憶」 ≤ 50% AND 「應用/分析/評鑑」合計 ≥ 20% → `cognitive: ok`
- 「記憶」 > 50% OR 「應用/分析/評鑑」合計 < 20% → `cognitive: warn`
- 「記憶」 > 80% OR 「應用/分析/評鑑」合計 < 10% → `cognitive: fail`

#### 檢查 5：編碼合法率

從 `_full_progress.json.rank_{RANK_NUM}.illegal_codes` 取（格式 `bad/total`）。

判定：
- bad = 0 → `illegal: ok`
- bad/total ≤ 5% → `illegal: warn`
- bad/total > 5% → `illegal: fail`

### Step 3：彙整 verdict

- 5 項全 ok → verdict = `PASS`
- 任 1 項 warn 且無 fail → verdict = `WARN`
- 任 1 項 fail → verdict = `FAIL`

### Step 4：append 結果到 log

執行：
```bash
echo '{"rank":{RANK_NUM},"exam_id":"{EXAM_ID}","publisher":"{PUBLISHER}","verdict":"...","checks":{"schema":"...","reason":"...","distribution":"...","cognitive":"...","illegal":"..."},"note":"<一句話結論>","timestamp":"<ISO 時間>"}' >> scripts/jobs/JOB-228/_spot_check.log
```

把上面的 `...` 替換成實際結果。`note` 欄位寫一句話結論（如「結構與黃金樣本一致，reason 全引用題幹」或「編碼分布偏斜：Bc-Ⅱ-1 占 35%」）。

### Step 5：輸出最終結果

把 append 進 log 的那行 JSON 完整 echo 到 stdout 結尾，方便 Claude 直接讀。
