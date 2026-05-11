# JOB-230 Phase 5 Spot Check Prompt Template（四下_社會）

> 由 Claude wakeup 階段呼叫。每次注入一個 worker + rank 的資訊，由 codex 對該 JSON 做嚴格 review，append 結果到 `scripts/jobs/JOB-230/_spot_check.log`。

## Placeholder

呼叫前 sed 替換：
- `{WORKER}`: 對應 worker（A/B/C）
- `{RANK_NUM}`: worker-local rank 序號（1-~46）
- `{OUTPUT_PATH}`: 該 rank 的 JSON 輸出路徑（從 `_full_progress_{WORKER}.json.rank_N.output`）
- `{PUBLISHER}`: 出版社（翰林/康軒/南一）
- `{EXAM_ID}`: 試卷 ID

---

## 任務內容（codex 看的）

請對 worker {WORKER} rank {RANK_NUM}（exam_id={EXAM_ID}、出版社={PUBLISHER}、輸出檔={OUTPUT_PATH}）的結構化抽取結果做嚴格 review。

### Step 1：對照黃金樣本

JOB-230 社會四下黃金樣本（不分出版社）：
`knowledge/3_考古題/3_L2_結構化抽取/_golden_samples/四下_社會_<chosen>.json`
（黃金樣本檔名由 Phase 0.2 確定後填入；可暫時 fallback 至 `_archive_social/翰林_108_文德國小_第一次段考.json` 三下社會樣本參照 schema）

### Step 2：五項檢查

#### 檢查 1：Schema 結構對照

讀 `{OUTPUT_PATH}` 與黃金樣本，比對：
- 頂層 keys：應有 `_meta`、`questions`、`_summary`
- `_meta` 必含欄位：exam_id、publisher、academic_year、schema_version、extracted_at、source_pdfs、_inheritance
- `questions` 是 array，每筆含 question_id、type、stem、codes_candidate
- `_summary` 必含 total_questions、by_type、by_code_count、code_frequency

判定：
- 全部一致 → `schema: ok`
- 缺非關鍵欄位 → `schema: warn`
- 缺關鍵欄位（_meta/questions/_summary 任一缺）→ `schema: fail`

#### 檢查 2：Reason 樣本空泛性（抽 5 條，標準 ≥3 字）

從 `questions[]` 隨機抽 5 個 `codes_candidate[].reason`，判斷：
- **specific**：引用題幹原文 **≥ 3 字** 題幹片段或具體選項描述
- **nonspecific**：泛指（如「考察社會概念」「測試認知能力」「與此題相關」）

> 標準調整說明：JOB-228 採 ≥5 字，發現對短題幹（≤10 字）易誤判 fail。JOB-229 改 ≥3 字並驗證通過；JOB-230 沿用 ≥3 字。

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

> 社會科四下特殊性：地形/地圖/早期歷史/公共事務四主題易在不同單元主導；單碼仍應分散到多碼。

#### 檢查 4：認知層次分布

讀 `_summary.by_cognitive_level`，計算各層比例。
判定：
- 「記憶」 ≤ 50% AND 「應用/分析/評鑑」合計 ≥ 20% → `cognitive: ok`
- 「記憶」 > 50% OR 「應用/分析/評鑑」合計 < 20% → `cognitive: warn`
- 「記憶」 > 80% OR 「應用/分析/評鑑」合計 < 10% → `cognitive: fail`

#### 檢查 5：編碼合法率

從 `_full_progress_{WORKER}.json.rank_{RANK_NUM}.illegal_codes` 取（格式 `bad/total`）。

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
echo '{"worker":"{WORKER}","rank":{RANK_NUM},"exam_id":"{EXAM_ID}","publisher":"{PUBLISHER}","verdict":"...","checks":{"schema":"...","reason":"...","distribution":"...","cognitive":"...","illegal":"..."},"note":"<一句話結論>","timestamp":"<ISO 時間>"}' >> scripts/jobs/JOB-230/_spot_check.log
```

把 `...` 替換成實際結果。`note` 寫一句話結論（如「結構與黃金樣本一致，reason 全引用題幹」或「編碼分布偏斜：Ca-Ⅱ-1 占 35%」）。

### Step 5：輸出最終結果

把 append 進 log 的那行 JSON 完整 echo 到 stdout 結尾，方便 Claude 直接讀。
