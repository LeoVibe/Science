# JOB-229 三下自然 L2 結構化抽取 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 完成三下_自然 123 份考古題 L2 結構化抽取，沿用 JOB-228 五元件骨架 + 兩優化（Phase 5 並行 3 條 codex、黃金樣本縮 1 份），預期總時長 ~9-11 hr。

**Architecture:** Phase 0 派 codex 寫 A0 自然編碼清單與 A1 自然 prompt template、Claude 親做 1 份黃金樣本；Phase 5 把 123 ranks 靜態分配給 3 條獨立 worker（A/B/C），各自獨立 progress / dispatch / loop，nohup 同時跑；Claude 用 /loop dynamic mode 60 min wakeup 統合三 worker dashboard 並做 spot check；完成後 codex 草擬 Phase B/C/D/E。

**Tech Stack:** bash + python3（dashboard / 驗證腳本）+ node（progress 解析）+ codex CLI（gpt-5.5 / ChatGPT 訂閱）+ Claude Code MCP（Discord、ScheduleWakeup）

**Spec:** `docs/superpowers/specs/2026-05-10-job229-natural-l2-extraction-design.md`

---

## File Structure

| 檔案/路徑 | 責任 |
|:--|:--|
| `jobs/JOB-229-AG-G3S2-自然-考古題L2結構化抽取.md` | 派工單（含 Pre-flight/Acceptance/Deliverables checklists） |
| `knowledge/3_考古題/3_L2_結構化抽取/_meta/science_codes_legal_II.json` | A0 自然科 108 課綱第 Ⅱ 階段合法編碼清單（codex 草擬 + Claude 驗收） |
| `scripts/jobs/JOB-229/A2_pilot_prompt_template_natural.md` | A1 自然版 prompt template（spot check ≥3 字標準、自然科指引） |
| `knowledge/3_考古題/3_L2_結構化抽取/_golden_samples_natural/<chosen>.json` | 1 份黃金樣本（Claude 親做） |
| `scripts/jobs/JOB-229/_pilot_targets.json` / `_pilot_progress.json` | Pilot 5 份目標與進度 |
| `scripts/jobs/JOB-229/A2_pilot_dispatch.sh` | Pilot 派工腳本（含 watchdog、Layer 1） |
| `scripts/jobs/JOB-229/_full_targets_a/b/c.json` | 全量 123 份分 3 個 worker 的目標清單 |
| `scripts/jobs/JOB-229/_full_progress_a/b/c.json` | 三 worker 各自 progress |
| `scripts/jobs/JOB-229/A2_full_dispatch_a/b/c.sh` | 三 worker 各自 dispatch |
| `scripts/jobs/JOB-229/continuous_full_loop_a/b/c.sh` | 三 worker 各自 loop wrapper |
| `scripts/jobs/JOB-229/dashboard.py` | 三 worker 整合 dashboard |
| `scripts/jobs/JOB-229/spot_check_prompt_template.md` | spot check 模板（≥3 字標準） |
| `scripts/jobs/JOB-229/B_validate_codes.py` | Phase B 全量驗證 |
| `knowledge/3_考古題/3_L2_結構化抽取/_validation_report_natural.json` | Phase B 輸出 |
| `knowledge/3_考古題/3_L2_結構化抽取/三下/三下_自然_{翰林,康軒,南一}/_L2_summary.md` | Phase C 三版本摘要 |
| `knowledge/3_考古題/3_L2_結構化抽取/三下/三下_自然_L2_整合.md` | Phase D 全科目整合 |
| `knowledge/3_考古題/3_L2_結構化抽取/_L2_quality_report_natural.json` | Phase E 品質總表 |
| `jobs/JOB-229-Report.md` | 結案 Report |

---

## Task 1: 建 JOB-229 派工單（建單 + 草稿入檔）

**Files:**
- Create: `jobs/JOB-229-AG-G3S2-自然-考古題L2結構化抽取.md`

- [ ] **Step 1: 跑 next 確認流水號**

Run:
```bash
node scripts/job_manager.js next | tail -5
```
Expected: `建議下一張派工單號：JOB-229`

- [ ] **Step 2: job_manager.js create 建空殼**

Run:
```bash
node scripts/job_manager.js create "AG-G3S2-自然-考古題L2結構化抽取" AG research
```
Expected: 產出 `jobs/JOB-229-AG-G3S2-自然-考古題L2結構化抽取.md`

- [ ] **Step 3: Edit 寫入派工單內容**

把以下內容寫入派工單（依本 plan 要點 + spec 對齊）：

```markdown
# JOB-229-AG-G3S2-自然-考古題L2結構化抽取

`job_type`: research
`executor`: Codex（主任務 + Phase 0/B/C/D/E 草擬）+ Claude（PM、A0 驗收、黃金樣本親做、最終驗收）
`parent_jobs`: JOB-228（沿用機制 + 兩優化）

## 任務目標
123 份三下_自然考古題 L2 結構化抽取，schema v1.0，編碼從自然科第 Ⅱ
階段合法清單選 1-3 條。Phase 5 並行 3 條 codex 縮短主跑時間。

## 任務邊界
**只做**：A0 編碼清單 / A1 prompt template / 1 份黃金樣本 / Pilot 5 /
Phase 5 全量 123（並行 3）/ Phase B-E。
**不做**：補 raw 缺口 12 份 / 跨年級或跨科目 / 修改 JOB-228 既有產出。

## 啟動 Checklist
- [ ] JOB-228 流程文件已讀
- [ ] 三版本整合 MD 123 份齊全（翰林 14 + 康軒 60 + 南一 49）
- [ ] codex 並行 3 條已驗證（本 session 兩次測試）
- [ ] 預算：ChatGPT 訂閱（無單次計費）

## 驗收 Checklist
- [ ] science_codes_legal_II.json 產出 + Claude 抽 5 條驗證 PASS
- [ ] A1 prompt template 完成
- [ ] 1 份黃金樣本（Claude 親做、結構完整）
- [ ] Pilot 5/5 PASS
- [ ] 123 份全量完成（3 worker 合併 completed=123、failed=0 或可控）
- [ ] Layer 1 編碼合法率 ≥ 95%（目標 100%）
- [ ] _validation_report_natural.json 違規率可控
- [ ] 三份 _L2_summary.md + 整合 MD + _L2_quality_report.json
- [ ] JOB-229-Report.md（Codex 草擬 + Claude 驗收）

## 成果 Checklist
- [ ] node scripts/job_manager.js close JOB-229
- [ ] /pj_sync
- [ ] Discord 結案回報
- [ ] git commit
```

- [ ] **Step 4: Commit 派工單**

Run:
```bash
git add jobs/JOB-229-AG-G3S2-自然-考古題L2結構化抽取.md
git commit -m "chore: 建 JOB-229 派工單（三下自然 L2 結構化抽取）

JOB: JOB-229"
```

---

## Task 2: A0 派 codex 抽自然科合法編碼清單

**Files:**
- Create: `knowledge/3_考古題/3_L2_結構化抽取/_meta/science_codes_legal_II.json`
- Create: `/tmp/codex_a0_natural_prompt.md`（暫存 prompt）

- [ ] **Step 1: 寫 codex 派工 prompt**

Write 到 `/tmp/codex_a0_natural_prompt.md`：

```markdown
# 任務：抽自然科 108 課綱第 Ⅱ 階段合法編碼清單

## 目標
產出 `knowledge/3_考古題/3_L2_結構化抽取/_meta/science_codes_legal_II.json`，
結構對齊既有的 social 版（同目錄 `social_codes_legal_II.json`）。

## 結構（對齊 social 版）
```json
{
  "_meta": {
    "subject": "自然",
    "stage": "Ⅱ",
    "source": "108 課綱（自然科學領域課程綱要）",
    "extracted_at": "<ISO 時間>",
    "extractor": "Codex (gpt-5.5) - JOB-229 A0"
  },
  "performance": [
    {"code": "tr-Ⅱ-1", "label": "<課綱原文>"},
    ...
  ],
  "content": [
    {"code": "INa-Ⅱ-1", "label": "<課綱原文>"},
    {"code": "INb-Ⅱ-1", "label": "..."},
    ...
  ]
}
```

## 自然科 Ⅱ 階段編碼維度（依課綱）
- **performance**（過程技能 / 探究能力）：tr / tc / pc / ai 等開頭
- **content**（核心概念）：INa / INb / INc / INd / INe / INf / INg 七大主題

每條編碼從 108 課綱自然科官方文件抽取（不要自行造）。

## 完成標準
- JSON 合法（node 可解析）
- 編碼總數 30-50 條範圍內（社會科 35 條對照）
- performance + content 兩維度齊全
- 完成後 print 編碼總數與分維度數量

## 完成後輸出
- 檔案路徑與行數
- 編碼分維度統計
```

- [ ] **Step 2: 派 codex 執行**

Run:
```bash
mkdir -p scripts/orchestrator-logs
cat /tmp/codex_a0_natural_prompt.md | codex exec --skip-git-repo-check --full-auto - 2>&1 | tee scripts/orchestrator-logs/JOB-229-codex-a0.log | tail -30
```
Expected: codex 完成回報 + 檔案產出 + 編碼統計

- [ ] **Step 3: Claude 驗收 — 抽 5 條對課綱原文驗證**

Run:
```bash
ls -la knowledge/3_考古題/3_L2_結構化抽取/_meta/science_codes_legal_II.json
node -e "
const j = JSON.parse(require('fs').readFileSync('knowledge/3_考古題/3_L2_結構化抽取/_meta/science_codes_legal_II.json'));
console.log('performance:', j.performance.length, '| content:', j.content.length);
console.log('=== 隨機抽 5 條 ===');
const all = [...j.performance, ...j.content];
for (let i = 0; i < 5; i++) {
  const idx = Math.floor(Math.random() * all.length);
  console.log(all[idx].code, '—', all[idx].label);
}
"
```
Expected: performance + content 各 ≥ 5 條、總數 30-50 條範圍。Claude 抽 5 條對 108 課綱原文心智核對（沒有原文檔案就 grep web）。

- [ ] **Step 4: Commit**

Run:
```bash
git add knowledge/3_考古題/3_L2_結構化抽取/_meta/science_codes_legal_II.json
git commit -m "feat: JOB-229 A0 自然科合法編碼清單（codex 草擬 + Claude 驗收）

依 108 課綱自然科第 Ⅱ 階段抽取 performance + content 兩維編碼。

JOB: JOB-229"
```

---

## Task 3: A1 寫自然版 prompt template

**Files:**
- Create: `scripts/jobs/JOB-229/A2_pilot_prompt_template_natural.md`

- [ ] **Step 1: 讀 JOB-228 social template 為基底**

Run: `Read scripts/jobs/JOB-228/A2_pilot_prompt_template.md`

- [ ] **Step 2: Edit 工具 copy + 改自然科專用內容**

Run:
```bash
mkdir -p scripts/jobs/JOB-229
cp scripts/jobs/JOB-228/A2_pilot_prompt_template.md scripts/jobs/JOB-229/A2_pilot_prompt_template_natural.md
```

然後用 Edit 工具改：
- 編碼清單路徑：`social_codes_legal_II.json` → `science_codes_legal_II.json`
- 學習領域：「社會」 → 「自然」
- 認知層次描述加：「自然科特別重視『探究/實作/分析』，預期 by_cognitive_level 中『分析』+『應用』比例會較社會高」
- spot check 標準（如有內嵌）：`≥5 字題幹片段` → `≥3 字題幹片段`（依 JOB-228 遺留問題）

- [ ] **Step 3: Commit**

Run:
```bash
git add scripts/jobs/JOB-229/A2_pilot_prompt_template_natural.md
git commit -m "feat: JOB-229 A1 自然版 prompt template

從 JOB-228 social 版改：編碼清單路徑、學習領域、認知層次描述、
spot check ≥3 字標準（依 JOB-228 遺留問題修正）。

JOB: JOB-229"
```

---

## Task 4: 黃金樣本候選評估（派 codex 並行評 6 份）

**Files:**
- Create: `/tmp/codex_golden_candidate_eval.sh`（並行派工腳本）
- Create: `/tmp/codex_golden_candidates/翰林_*.md`、`康軒_*.md`、`南一_*.md`（評估結果）

- [ ] **Step 1: 列出 6 份候選（每出版社 2 份 dual_source）**

Run:
```bash
for pub in 翰林 康軒 南一; do
  echo "=== $pub 候選 ==="
  ls knowledge/3_考古題/2_MD淬鍊文字_整合版/三下/三下_自然_$pub/ | grep -v "^_" | head -3
done
```
Expected: 各出版社至少 2 份候選（避開已測過的草港國小[paper_empty]/伸東國小/中正國小）

- [ ] **Step 2: 寫 6 條並行 codex 派工腳本**

Write `/tmp/codex_golden_candidate_eval.sh`（基於本 session 已驗證的 3 條並行 pattern，擴成 6 條）：

```bash
#!/bin/bash
mkdir -p /tmp/codex_golden_candidates

run_eval() {
  local LABEL=$1
  local MD=$2
  local OUT=$3

  PROMPT="讀 $MD，依 JOB-228 黃金樣本標準評估：
1. 結構完整度（1-10）：frontmatter / 試卷正文 / 答案 / 來源追溯齊全度
2. 題型多元度（1-10）：是非/選擇/填空/簡答/圖像等覆蓋
3. 編碼挑戰度（1-10）：能否覆蓋自然科 INa-INg 各核心概念
4. 推薦當黃金樣本：Yes / No / Maybe（一句話理由）

輸出寫到 $OUT，純 markdown 格式（不需 JSON）。"

  echo "[$LABEL] start"
  echo "$PROMPT" | codex exec --skip-git-repo-check --full-auto - > "/tmp/codex_golden_candidates/${LABEL}_log.txt" 2>&1
  echo "[$LABEL] done"
}

# 6 份候選（依 Step 1 結果填路徑，這裡用佔位範例）
run_eval "候選1" "<path1>" "/tmp/codex_golden_candidates/候選1.md" &
run_eval "候選2" "<path2>" "/tmp/codex_golden_candidates/候選2.md" &
run_eval "候選3" "<path3>" "/tmp/codex_golden_candidates/候選3.md" &
run_eval "候選4" "<path4>" "/tmp/codex_golden_candidates/候選4.md" &
run_eval "候選5" "<path5>" "/tmp/codex_golden_candidates/候選5.md" &
run_eval "候選6" "<path6>" "/tmp/codex_golden_candidates/候選6.md" &
wait
echo "=== 6 條並行完成 ==="
```

注意：**Step 1 拿到實際路徑後手填上去**（取代 `<path1>` 等佔位），不要保留佔位執行。

- [ ] **Step 3: 並行跑（驗證 6 條極限）**

Run:
```bash
chmod +x /tmp/codex_golden_candidate_eval.sh
time bash /tmp/codex_golden_candidate_eval.sh 2>&1 | tail -20
```
Expected: 6 條同時完成、無 rate limit error。順帶驗證 codex 並行極限（從 3 條擴到 6 條）

- [ ] **Step 4: Claude 讀 6 份評估，挑最高分**

Run:
```bash
cat /tmp/codex_golden_candidates/*.md
```
Claude 親自評讀，挑「結構 ≥ 9」+「題型 ≥ 7」+「dual_source + paper_full + answer_full」最高分那份。

- [ ] **Step 5: 記下最終選擇**

Edit 派工單，加一行 `chosen_golden_sample: <exam_id>`

- [ ] **Step 6: Commit（評估產出可保留作參考）**

Run:
```bash
mkdir -p scripts/jobs/JOB-229/_golden_evaluation
cp /tmp/codex_golden_candidates/*.md scripts/jobs/JOB-229/_golden_evaluation/
git add scripts/jobs/JOB-229/_golden_evaluation/ jobs/JOB-229-AG-G3S2-自然-考古題L2結構化抽取.md
git commit -m "feat: JOB-229 6 份黃金樣本候選評估（codex 6 條並行）

驗證 codex 並行極限可達 6 條；保留評估結果作後續參考。

JOB: JOB-229"
```

---

## Task 5: Claude 親做 1 份黃金樣本

**Files:**
- Create: `knowledge/3_考古題/3_L2_結構化抽取/_golden_samples_natural/<chosen>.json`

- [ ] **Step 1: 確認 chosen exam_id 與 MD 路徑**

從 Task 4 Step 5 派工單記錄取出 `chosen_golden_sample`。例：`康軒_109_竹塘國小_第二次段考`。

Run:
```bash
EXAM_ID="<chosen>"
MD_PATH="knowledge/3_考古題/2_MD淬鍊文字_整合版/三下/三下_自然_<publisher>/${EXAM_ID}.md"
ls -la "$MD_PATH"
wc -l "$MD_PATH"
```
Expected: 檔案存在、≥ 100 行（dual_source 整合版通常 150-300 行）

- [ ] **Step 2: 對照 JOB-228 黃金 A 結構**

Run: `Read knowledge/3_考古題/3_L2_結構化抽取/_golden_samples/翰林_108_文德國小_第二次段考.json`

記下 schema：頂層 keys（exam_id / publisher / academic_year / exam_type / subject / semester / _meta / questions / _summary / _schema_observations）、_meta 必含欄位、questions[] 結構。

- [ ] **Step 3: Claude 親手寫 JSON（schema v1.0）**

Read `<MD_PATH>` 全文 → 逐題抽：
1. **每題 question_id**：依 MD 大題.小題編號（Q1.1 / Q1.2 / Q2.1 等）
2. **stem**：題幹原文（保留標點、空格）
3. **type**：true_false / multiple_choice / fill_blank / matching / chart_question / reading_comp / short_answer
4. **codes_candidate**：1-3 條從 `science_codes_legal_II.json` 選，每條含 code/confidence/reason（reason 引用題幹原文 ≥ 3 字片段）
5. **answer**：MD 答案區的對應答案（缺則 null + _known_inconsistencies 標記）
6. **misconception**（選填）：概念混淆 / 事實錯誤 / 空心知識 / null
7. **cognitive_level**：記憶 / 理解 / 應用 / 分析 / 評鑑 / 創造

Write 到 `knowledge/3_考古題/3_L2_結構化抽取/_golden_samples_natural/<chosen>.json`，含 `_meta._golden_sample: true` + `_golden_sample_role: "dual_source primary"`。

- [ ] **Step 4: 驗證 schema 合法 + 編碼合法**

Run:
```bash
node -e "
const fs = require('fs');
const j = JSON.parse(fs.readFileSync('knowledge/3_考古題/3_L2_結構化抽取/_golden_samples_natural/<chosen>.json'));
const legal = JSON.parse(fs.readFileSync('knowledge/3_考古題/3_L2_結構化抽取/_meta/science_codes_legal_II.json'));
const set = new Set([...legal.performance, ...legal.content].map(c=>c.code));
let bad = 0, total = 0;
for (const q of j.questions||[]) for (const c of q.codes_candidate||[]) { total++; if (!set.has(c.code)) bad++; }
console.log('questions:', j.questions.length, '| codes:', total, '| illegal:', bad);
console.log('schema_version:', j._meta?.schema_version, '| _meta keys:', Object.keys(j._meta||{}));
"
```
Expected: illegal=0、schema_version="1.0"、_meta 必含欄位齊全

- [ ] **Step 5: Commit**

Run:
```bash
git add knowledge/3_考古題/3_L2_結構化抽取/_golden_samples_natural/
git commit -m "feat: JOB-229 自然科黃金樣本 1 份（Claude 親做）

dual_source + paper_full + answer_full 主流情境，作為 Pilot 5 份對齊
基準。schema v1.0、編碼合法 0 違規。

JOB: JOB-229"
```

---

## Task 6: Pilot 5 份候選與派工腳本

**Files:**
- Create: `scripts/jobs/JOB-229/_pilot_targets.json`
- Create: `scripts/jobs/JOB-229/A2_pilot_dispatch.sh`

- [ ] **Step 1: 挑 5 份 Pilot 候選**

從 123 份中挑：
- 翰林 dual_source × 2
- 康軒 dual_source × 1
- 南一 dual_source × 1
- 任一 codex_only / answer_partial 邊界 × 1

避開 Task 4 Step 1 已測過的 3 份（翰林草港 / 康軒伸東 / 南一中正）以保持新鮮樣本。

- [ ] **Step 2: 寫 _pilot_targets.json**

Write `scripts/jobs/JOB-229/_pilot_targets.json`：

```json
{
  "_meta": {
    "phase": "JOB-229 Phase 2 - Pilot 5 份試刀",
    "purpose": "驗證 codex 在 schema v1.0 + 自然科合法編碼約束下能產出與黃金樣本一致的 JSON",
    "verification_gates": [
      "schema 必填欄位齊全",
      "codes_candidate.code 全部在自然科合法清單內",
      "confidence ∈ {high, medium, low}",
      "reason 引用題幹原句 ≥ 3 字",
      "questions[] 數量與整合 MD 題目數一致"
    ]
  },
  "targets": [
    {"rank": 1, "exam_id": "<填>", "publisher": "翰林", "md_path": "<填>", "output_path": "knowledge/3_考古題/3_L2_結構化抽取/_pilot_natural/<填>.json", "scenario": "翰林 dual_source 主流"},
    {"rank": 2, "exam_id": "<填>", "publisher": "翰林", "md_path": "<填>", "output_path": "<填>", "scenario": "翰林 dual_source（不同學校）"},
    {"rank": 3, "exam_id": "<填>", "publisher": "康軒", "md_path": "<填>", "output_path": "<填>", "scenario": "康軒 dual_source"},
    {"rank": 4, "exam_id": "<填>", "publisher": "南一", "md_path": "<填>", "output_path": "<填>", "scenario": "南一 dual_source"},
    {"rank": 5, "exam_id": "<填>", "publisher": "<填>", "md_path": "<填>", "output_path": "<填>", "scenario": "邊界情境（codex_only 或 answer_partial）"}
  ]
}
```

把 `<填>` 替換成實際從 Step 1 挑出的 5 份的 exam_id / md_path / output_path。

- [ ] **Step 3: cp + 改 dispatch.sh（從 JOB-228 social 版）**

Run:
```bash
cp scripts/jobs/JOB-228/A2_full_dispatch.sh scripts/jobs/JOB-229/A2_pilot_dispatch.sh
```

用 sed 改路徑：
```bash
sed -i '' \
  -e 's|JOB-228|JOB-229|g' \
  -e 's|_full_targets|_pilot_targets|g' \
  -e 's|_full_progress|_pilot_progress|g' \
  -e 's|A2_pilot_prompt_template|A2_pilot_prompt_template_natural|g' \
  -e 's|JOB-229-full-rank|JOB-229-pilot-rank|g' \
  -e 's|social_codes_legal_II.json|science_codes_legal_II.json|g' \
  scripts/jobs/JOB-229/A2_pilot_dispatch.sh
```

- [ ] **Step 4: 驗證腳本可解析**

Run:
```bash
bash -n scripts/jobs/JOB-229/A2_pilot_dispatch.sh && echo "syntax OK"
```
Expected: `syntax OK`

- [ ] **Step 5: Commit**

Run:
```bash
git add scripts/jobs/JOB-229/_pilot_targets.json scripts/jobs/JOB-229/A2_pilot_dispatch.sh
git commit -m "feat: JOB-229 Pilot 5 份目標清單 + dispatch 腳本

從 JOB-228 dispatch 改路徑（targets/progress/template/編碼清單）。

JOB: JOB-229"
```

---

## Task 7: 跑 Pilot 5 份 + Claude 驗收

**Files:** 無新檔，執行 + 驗收

- [ ] **Step 1: 序列跑 5 份 Pilot**

Run:
```bash
bash scripts/jobs/JOB-229/A2_pilot_dispatch.sh 2>&1 | tee scripts/orchestrator-logs/JOB-229-pilot-run.log | tail -30
```
Expected: rank 1-5 全部 ✅ 完成（單份 ~5-15 min × 5 = 25-75 min）

- [ ] **Step 2: 驗證每份編碼合法 + Layer 1**

Run:
```bash
for i in 1 2 3 4 5; do
  echo "=== rank $i ==="
  node -e "
  const p = JSON.parse(require('fs').readFileSync('scripts/jobs/JOB-229/_pilot_progress.json'));
  const r = p['rank_$i'];
  if (!r) { console.log('  (rank $i not in progress)'); return; }
  console.log('  illegal:', r.illegal_codes, '| validation:', JSON.stringify(r.validation_layer1));
  "
done
```
Expected: 每份 illegal=0/N、Layer 1 全 PASS

- [ ] **Step 3: Claude meta-review — 對照黃金樣本**

對 Pilot rank 1（翰林 dual）親自讀 JSON，比對黃金樣本結構：
- 頂層 keys 一致（_meta / questions / _summary）
- _meta 必填欄位（exam_id / publisher / academic_year / schema_version / extracted_at / source_pdfs）
- 每題 codes_candidate.reason 引用題幹原文 ≥ 3 字
- 認知層次分布合理（不全壓記憶）

Pilot 1 PASS 才繼續看 2-5；任何 rank FAIL 則回 Task 3 調整 prompt template。

- [ ] **Step 4: 5/5 PASS → Commit + 進 Task 8**

Run（5/5 都 PASS 才執行）:
```bash
git add knowledge/3_考古題/3_L2_結構化抽取/_pilot_natural/ scripts/jobs/JOB-229/_pilot_progress.json
git commit -m "feat: JOB-229 Pilot 5 份完成（5/5 PASS）

對齊 1 份黃金樣本：schema 一致、編碼合法 100%、reason 引用題幹 ≥ 3 字。

JOB: JOB-229"
```

如果 < 5/5 PASS，停下並給使用者 brainstorming 報告，不要進 Phase 5。

---

## Task 8: 產 _full_targets_a/b/c.json（123 份分 3 worker）

**Files:**
- Create: `scripts/jobs/JOB-229/_full_targets_a.json`（41 份）
- Create: `scripts/jobs/JOB-229/_full_targets_b.json`（41 份）
- Create: `scripts/jobs/JOB-229/_full_targets_c.json`（41 份）

- [ ] **Step 1: 寫 generator 腳本**

Write `scripts/jobs/JOB-229/gen_full_targets.js`：

```javascript
#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const PUBLISHERS = ['翰林', '康軒', '南一'];
const ROOT = 'knowledge/3_考古題/2_MD淬鍊文字_整合版/三下';
const OUT_ROOT = 'knowledge/3_考古題/3_L2_結構化抽取/三下';

const allTargets = [];
let rank = 0;

for (const pub of PUBLISHERS) {
  const dir = path.join(ROOT, `三下_自然_${pub}`);
  const files = fs.readdirSync(dir)
    .filter(f => f.endsWith('.md') && !f.startsWith('_'))
    .sort();
  for (const f of files) {
    rank++;
    const examId = f.replace(/\.md$/, '');
    allTargets.push({
      rank,
      exam_id: examId,
      publisher: pub,
      md_path: path.join(dir, f),
      output_path: path.join(OUT_ROOT, `三下_自然_${pub}`, `${examId}.json`),
    });
  }
}

console.log(`total ranks: ${rank}`);

// 分 3 worker：rank % 3 == 1 → A, == 2 → B, == 0 → C
const workers = {a: [], b: [], c: []};
for (const t of allTargets) {
  const mod = t.rank % 3;
  if (mod === 1) workers.a.push(t);
  else if (mod === 2) workers.b.push(t);
  else workers.c.push(t);
}

for (const [k, ts] of Object.entries(workers)) {
  const out = {
    _meta: {
      phase: `JOB-229 Phase 5 - Worker ${k.toUpperCase()}（${ts.length} 份）`,
      worker: k,
      created_at: new Date().toISOString(),
      total: ts.length,
    },
    targets: ts,
  };
  fs.writeFileSync(`scripts/jobs/JOB-229/_full_targets_${k}.json`, JSON.stringify(out, null, 2));
  console.log(`worker ${k}: ${ts.length} 份`);
}
```

- [ ] **Step 2: 跑 generator**

Run:
```bash
node scripts/jobs/JOB-229/gen_full_targets.js
```
Expected: `total ranks: 123` + `worker a: 41 份` + `worker b: 41 份` + `worker c: 41 份`

- [ ] **Step 3: 驗證分配**

Run:
```bash
for k in a b c; do
  echo "=== worker $k ===";
  node -e "
  const j = JSON.parse(require('fs').readFileSync('scripts/jobs/JOB-229/_full_targets_${k}.json'));
  console.log('  total:', j.targets.length);
  console.log('  ranks:', j.targets.slice(0,5).map(t=>t.rank).join(',') + '...');
  console.log('  publishers:', [...new Set(j.targets.map(t=>t.publisher))].join(','));
  ";
done
```
Expected: 每 worker 41 份、ranks 等差數列（A: 1,4,7,..., B: 2,5,8,..., C: 3,6,9,...）

- [ ] **Step 4: Commit**

Run:
```bash
git add scripts/jobs/JOB-229/gen_full_targets.js scripts/jobs/JOB-229/_full_targets_a.json scripts/jobs/JOB-229/_full_targets_b.json scripts/jobs/JOB-229/_full_targets_c.json
git commit -m "feat: JOB-229 _full_targets 分 3 worker（123 → 41/41/41）

靜態 round-robin 分配，rank % 3 == 1/2/0 → worker a/b/c。

JOB: JOB-229"
```

---

## Task 9: 寫 3 份 dispatch.sh（A/B/C）+ 3 份 loop wrapper

**Files:**
- Create: `scripts/jobs/JOB-229/A2_full_dispatch_a.sh`（B/C 同理）
- Create: `scripts/jobs/JOB-229/continuous_full_loop_a.sh`（B/C 同理）

- [ ] **Step 1: cp + 批次改 A 版**

Run:
```bash
cp scripts/jobs/JOB-229/A2_pilot_dispatch.sh scripts/jobs/JOB-229/A2_full_dispatch_a.sh
sed -i '' \
  -e 's|_pilot_targets|_full_targets_a|g' \
  -e 's|_pilot_progress|_full_progress_a|g' \
  -e 's|JOB-229-pilot-rank|JOB-229-full-rank|g' \
  scripts/jobs/JOB-229/A2_full_dispatch_a.sh
```

- [ ] **Step 2: cp + 改 B 版（與 A 差別只在 _a → _b）**

Run:
```bash
cp scripts/jobs/JOB-229/A2_full_dispatch_a.sh scripts/jobs/JOB-229/A2_full_dispatch_b.sh
sed -i '' -e 's|_full_targets_a|_full_targets_b|g' -e 's|_full_progress_a|_full_progress_b|g' scripts/jobs/JOB-229/A2_full_dispatch_b.sh
```

- [ ] **Step 3: cp + 改 C 版**

Run:
```bash
cp scripts/jobs/JOB-229/A2_full_dispatch_a.sh scripts/jobs/JOB-229/A2_full_dispatch_c.sh
sed -i '' -e 's|_full_targets_a|_full_targets_c|g' -e 's|_full_progress_a|_full_progress_c|g' scripts/jobs/JOB-229/A2_full_dispatch_c.sh
```

- [ ] **Step 4: cp + 改 loop wrapper（A/B/C）**

Run:
```bash
cp scripts/jobs/JOB-228/continuous_full_loop.sh scripts/jobs/JOB-229/continuous_full_loop_a.sh
sed -i '' \
  -e 's|JOB-228|JOB-229|g' \
  -e 's|A2_full_dispatch.sh|A2_full_dispatch_a.sh|g' \
  -e 's|_full_progress.json|_full_progress_a.json|g' \
  scripts/jobs/JOB-229/continuous_full_loop_a.sh

cp scripts/jobs/JOB-229/continuous_full_loop_a.sh scripts/jobs/JOB-229/continuous_full_loop_b.sh
sed -i '' -e 's|_full_progress_a|_full_progress_b|g' -e 's|_dispatch_a|_dispatch_b|g' scripts/jobs/JOB-229/continuous_full_loop_b.sh

cp scripts/jobs/JOB-229/continuous_full_loop_a.sh scripts/jobs/JOB-229/continuous_full_loop_c.sh
sed -i '' -e 's|_full_progress_a|_full_progress_c|g' -e 's|_dispatch_a|_dispatch_c|g' scripts/jobs/JOB-229/continuous_full_loop_c.sh

chmod +x scripts/jobs/JOB-229/A2_full_dispatch_*.sh scripts/jobs/JOB-229/continuous_full_loop_*.sh
```

- [ ] **Step 5: 驗證 6 個腳本 syntax**

Run:
```bash
for f in scripts/jobs/JOB-229/{A2_full_dispatch,continuous_full_loop}_{a,b,c}.sh; do
  bash -n "$f" && echo "OK: $f" || echo "FAIL: $f"
done
```
Expected: 6 個都 OK

- [ ] **Step 6: 驗證關鍵元素（每份用對的 progress 路徑）**

Run:
```bash
for k in a b c; do
  echo "=== worker $k ===";
  grep -E "TARGETS_FILE|PROGRESS_FILE|count_remaining|sleep 1500" scripts/jobs/JOB-229/A2_full_dispatch_${k}.sh | head -3
  grep -E "_full_progress_|_dispatch_" scripts/jobs/JOB-229/continuous_full_loop_${k}.sh | head -3
done
```
Expected: 每 worker 的腳本都指向自己的 _a/_b/_c 路徑

- [ ] **Step 7: Commit**

Run:
```bash
git add scripts/jobs/JOB-229/A2_full_dispatch_*.sh scripts/jobs/JOB-229/continuous_full_loop_*.sh
git commit -m "feat: JOB-229 3 份 dispatch + 3 份 loop wrapper（A/B/C 各自獨立）

每 worker 用自己的 _full_targets_{a,b,c}.json + _full_progress_{a,b,c}.json，
靜態分配避免 lock 衝突。沿用 JOB-228 的 watchdog + Layer 1 機制。

JOB: JOB-229"
```

---

## Task 10: 派 codex 寫整合 dashboard.py（讀 3 個 progress）

**Files:**
- Create: `scripts/jobs/JOB-229/dashboard.py`

- [ ] **Step 1: 寫 codex 派工 prompt**

Write `/tmp/codex_dashboard_natural_prompt.md`：

```markdown
# 任務：寫 JOB-229 dashboard.py（整合 3 worker progress）

## 目標
建立 `scripts/jobs/JOB-229/dashboard.py`，讀 3 個 progress JSON 合併
顯示總進度 + 各 worker 子進度。

## 輸入
- `scripts/jobs/JOB-229/_full_progress_a.json`
- `scripts/jobs/JOB-229/_full_progress_b.json`
- `scripts/jobs/JOB-229/_full_progress_c.json`
- `scripts/jobs/JOB-229/_full_targets_{a,b,c}.json`（總目標 123）

## 輸出格式

```
╔══════════════════════════════════════════════════════════════╗
║  📊 JOB-229 Phase 5 進度儀表板（3 worker 並行）              ║
║  🕐 回報時間：YYYY-MM-DD (週X) HH:MM:SS                      ║
╚══════════════════════════════════════════════════════════════╝
  整體：done=N  failed=N  pending=N
  完成度：N/123 = NN.N%

  Worker A  ████░░░░  N/41  (NN%)  最近 60min: N 份完成
  Worker B  ███░░░░░  N/41  (NN%)  最近 60min: N 份完成
  Worker C  █████░░░  N/41  (NN%)  最近 60min: N 份完成

  近 60 分鐘合計：N 份 / 平均 N.N min/份
  編碼合法率：NN.N%（NN/NN 違規）

  各分組進度（依 publisher）：
  翰林  ████████  N/14
  康軒  ███░░░░░  N/60
  南一  ██░░░░░░  N/49

  預估剩餘：NNN min (N.Nh)
  預估完成：YYYY-MM-DD HH:MM
╚════════════════════════════════════════════════════════════╝
```

## 規範
1. 純 stdlib
2. 支援 `--since-minutes N` 與 `--json`
3. 預估速率以 3 worker 各自 since 內速率合計算（並行 throughput）
4. 任一 progress JSON 不存在則該 worker 顯示「尚未啟動」
5. 中文寬度處理（unicodedata.east_asian_width）

## 完成標準
- 三 worker 都跑時 dashboard 正確合併數字
- `--json` 輸出含 per_worker 與 overall 兩段

跑完輸出 git diff 摘要 + 試跑兩種模式。
```

- [ ] **Step 2: 派 codex 執行**

Run:
```bash
cat /tmp/codex_dashboard_natural_prompt.md | codex exec --skip-git-repo-check --full-auto - 2>&1 | tee scripts/orchestrator-logs/JOB-229-codex-dashboard.log | tail -50
```

- [ ] **Step 3: Claude 驗收 — dry-run（progress 還沒產出時）**

Run:
```bash
ls -la scripts/jobs/JOB-229/dashboard.py
python3 scripts/jobs/JOB-229/dashboard.py 2>&1 | head -30
```
Expected: 顯示「3 worker 都未啟動」+ 整體 0/123、不會 crash

- [ ] **Step 4: Commit**

Run:
```bash
git add scripts/jobs/JOB-229/dashboard.py
git commit -m "feat: JOB-229 整合 dashboard.py（codex 寫，讀 3 worker progress）

合併 3 個 progress JSON 顯示總進度 + per-worker 進度條，含 publisher
分組與並行速率估算。

JOB: JOB-229"
```

---

## Task 11: 寫 spot check template（≥3 字標準）

**Files:**
- Create: `scripts/jobs/JOB-229/spot_check_prompt_template.md`

- [ ] **Step 1: cp JOB-228 版**

Run:
```bash
cp scripts/jobs/JOB-228/spot_check_prompt_template.md scripts/jobs/JOB-229/spot_check_prompt_template.md
```

- [ ] **Step 2: Edit 改三處（自然版 + ≥3 字標準）**

用 Edit 工具改：
1. 黃金樣本對照路徑：`_golden_samples/翰林_108_文德國小_*` → `_golden_samples_natural/<chosen>`（依 Task 4 結果）。三版本都用同一份（因為只 1 份黃金）
2. spot check Step 2 檢查 2 標準：`≥ 5 字題幹片段` → `≥ 3 字題幹片段`
3. 標題加 `（自然科版本）` 標記

- [ ] **Step 3: Commit**

Run:
```bash
git add scripts/jobs/JOB-229/spot_check_prompt_template.md
git commit -m "feat: JOB-229 spot check template（自然科版本）

改：黃金樣本對照路徑、≥3 字標準（依 JOB-228 遺留問題）、自然科標記。

JOB: JOB-229"
```

---

## Task 12: 啟動 3 worker + 第一次 Discord + ScheduleWakeup

**Files:** 無新檔，啟動執行

- [ ] **Step 1: 同時啟動 3 worker（nohup 背景）**

Run:
```bash
nohup bash scripts/jobs/JOB-229/continuous_full_loop_a.sh > scripts/orchestrator-logs/JOB-229-loop-a.log 2>&1 &
LOOP_A=$!
nohup bash scripts/jobs/JOB-229/continuous_full_loop_b.sh > scripts/orchestrator-logs/JOB-229-loop-b.log 2>&1 &
LOOP_B=$!
nohup bash scripts/jobs/JOB-229/continuous_full_loop_c.sh > scripts/orchestrator-logs/JOB-229-loop-c.log 2>&1 &
LOOP_C=$!
echo "$LOOP_A $LOOP_B $LOOP_C" > /tmp/job229_loop_pids
sleep 5
echo "Loop PIDs: $LOOP_A $LOOP_B $LOOP_C"
for pid in $LOOP_A $LOOP_B $LOOP_C; do
  ps -p $pid > /dev/null && echo "  PID $pid running ✅" || echo "  PID $pid DIED ❌"
done
```
Expected: 3 個 PID 都 running

- [ ] **Step 2: 驗證 3 條 codex 都已開始**

Run:
```bash
sleep 10
ps aux | grep -E "codex exec.*skip-git" | grep -v grep | wc -l | awk '{print "codex 進程數: "$1}'
```
Expected: 3（每 worker 各自一條 codex）

- [ ] **Step 3: 跑 dashboard 確認**

Run:
```bash
python3 scripts/jobs/JOB-229/dashboard.py | head -30
```
Expected: 3 worker 都顯示「啟動中」或「running」、整體 0-3/123

- [ ] **Step 4: Discord 第一次通知**

呼叫 `mcp__plugin_discord_discord__reply`，chat_id=`1487738477608177714`，text 為：

```
🚀 **JOB-229 Phase 5 啟動（並行 3 條）**
🕐 啟動時間：<填當下>

**任務**：123 份三下自然 codex L2 結構化抽取（翰林 14 / 康軒 60 / 南一 49）
**模式**：3 worker 並行（vs JOB-228 序列 1 條，預期時間減半）
**預估**：~5-6 hr 主跑 + Phase B-E 結案 = 總 ~6-7 hr
**Loop PIDs**：A=<PID> / B=<PID> / C=<PID>
**Dashboard**：python3 scripts/jobs/JOB-229/dashboard.py

掛機愉快，每小時自動回報。
```

- [ ] **Step 5: 給使用者「打 /loop」prompt 草稿**

跟 JOB-228 一樣，使用者要打 `/loop <wakeup-prompt>` 進入 dynamic mode。Claude 印出草稿讓使用者複製：

```
/loop 請執行 JOB-229 Phase 5 wakeup pattern：
(1) 印當下時間（粗體 🕐）
(2) 跑 python3 scripts/jobs/JOB-229/dashboard.py --since-minutes 60
(3) 從 _full_progress_a/b/c.json 整體 completed pool 取最近完成 1 份 → sed 注入派 codex 用 spot_check_prompt_template.md → 讀 _spot_check.log 最後一行
(4) Claude meta-review verdict（PASS/WARN/FAIL）
(5) 算近 10 次 spot check 違規數，≥3 觸發 /brainstorming
(6) 推 Discord chat_id=1487738477608177714
(7) 確認 3 個 PID 都活著（ps -p $(cat /tmp/job229_loop_pids)）+ df -h .
(8) 若 3 worker completed 合計 < 123 → ScheduleWakeup 60min；若 = 123 → 進 Phase B
```

---

## Task 13: 全自動結案 — Phase B 驗證腳本

**Files:**
- Create: `scripts/jobs/JOB-229/B_validate_codes.py`
- Create: `knowledge/3_考古題/3_L2_結構化抽取/_validation_report_natural.json`

**觸發時機**：3 worker completed 合計 = 123 時

- [ ] **Step 1: 派 codex 寫 B_validate_codes.py（基於 JOB-228 版改）**

Write `/tmp/codex_phase_b_natural_prompt.md`：

```markdown
# 任務：寫 JOB-229 Phase B 全量驗證腳本

## 目標
建立 `scripts/jobs/JOB-229/B_validate_codes.py`（基於 JOB-228
B_validate_codes.py 改）。

## 輸入（讀全部 129 份 JSON）
- 黃金 1 份：`_golden_samples_natural/*.json`
- Pilot 5 份：`_pilot_natural/*.json`
- Phase 5 123 份：`三下/三下_自然_*/*.json`（翰林 14 + 康軒 60 + 南一 49）
- 編碼清單：`_meta/science_codes_legal_II.json`

## 驗證規則同 JOB-228
- A 類非法編碼必踢
- B 類錯階段必踢（非 Ⅱ 階段）
- C 類同碼重複去重保留 highest confidence
- 違規率 < 5% auto_corrected / 5-20% flagged_for_rerun / ≥ 20% manual_review

## 輸出
`_validation_report_natural.json`（結構同 JOB-228 _validation_report.json）

## 規範
- 純 stdlib
- 不修改原 JSON 檔
- 跑完 print summary 一行
```

派 codex：
```bash
cat /tmp/codex_phase_b_natural_prompt.md | codex exec --skip-git-repo-check --full-auto - 2>&1 | tee scripts/orchestrator-logs/JOB-229-codex-phase-b.log | tail -30
```

- [ ] **Step 2: bash 跑 B_validate_codes.py**

Run:
```bash
python3 scripts/jobs/JOB-229/B_validate_codes.py 2>&1 | tee scripts/orchestrator-logs/JOB-229-phase-b-run.log | tail -10
```

- [ ] **Step 3: Claude 看 _validation_report_natural.json**

Run:
```bash
node -e "
const r = JSON.parse(require('fs').readFileSync('knowledge/3_考古題/3_L2_結構化抽取/_validation_report_natural.json'));
console.log(JSON.stringify(r._meta, null, 2));
console.log('summary:', JSON.stringify(r.summary, null, 2));
"
```
Expected: total_files=129、violations 計數可控、manual_review ≤ 5

- [ ] **Step 4: Commit Phase B**

Run:
```bash
git add scripts/jobs/JOB-229/B_validate_codes.py knowledge/3_考古題/3_L2_結構化抽取/_validation_report_natural.json
git commit -m "feat: JOB-229 Phase B 全量驗證（codex 寫腳本）

讀 129 份 JSON 跑 A/B/C 類違規檢核。

JOB: JOB-229"
```

---

## Task 14: 全自動結案 — Phase C/D 三版本彙整 + 全科目整合

**Files:**
- Create: 三份 `_L2_summary.md`（翰林 / 康軒 / 南一）
- Create: `knowledge/3_考古題/3_L2_結構化抽取/三下/三下_自然_L2_整合.md`

- [ ] **Step 1: 派 codex 寫三版本 _L2_summary.md**

Write `/tmp/codex_phase_c_natural_prompt.md`（基於 JOB-228 Phase C prompt 改）：
- 出版社路徑：`三下_社會_*` → `三下_自然_*`
- 編碼清單：`social_codes_legal_II.json` → `science_codes_legal_II.json`
- 五個 H2 段落不變（概覽 / 題型分布 / 編碼分布 / 認知層次 / 迷思盤點）
- 自然科特色加入：探究/實作占比、INa-INg 七大主題覆蓋

派 codex：
```bash
cat /tmp/codex_phase_c_natural_prompt.md | codex exec --skip-git-repo-check --full-auto - 2>&1 | tee scripts/orchestrator-logs/JOB-229-codex-phase-c.log | tail -30
```

- [ ] **Step 2: Claude 驗收三份 summary**

Run:
```bash
for pub in 翰林 康軒 南一; do
  f="knowledge/3_考古題/3_L2_結構化抽取/三下/三下_自然_$pub/_L2_summary.md"
  echo "=== $pub ===";
  grep "^## " "$f"
  wc -l "$f"
done
```
Expected: 每份 5 個 H2 段落、≥ 200 行

- [ ] **Step 3: 派 codex 寫全科目整合 MD**

Write `/tmp/codex_phase_d_natural_prompt.md`（基於 JOB-228 Phase D prompt 改）：
- 三版本統計從新 _L2_summary.md 讀
- 6 個 H2 段落不變
- 加自然科 INa-INg 主題覆蓋對照

派 codex：
```bash
cat /tmp/codex_phase_d_natural_prompt.md | codex exec --skip-git-repo-check --full-auto - 2>&1 | tee scripts/orchestrator-logs/JOB-229-codex-phase-d.log | tail -30
```

- [ ] **Step 4: Claude 驗收 + Commit Phase C/D**

Run:
```bash
ls -la knowledge/3_考古題/3_L2_結構化抽取/三下/三下_自然_*/_L2_summary.md
ls -la knowledge/3_考古題/3_L2_結構化抽取/三下/三下_自然_L2_整合.md
git add knowledge/3_考古題/3_L2_結構化抽取/三下/三下_自然_*/ knowledge/3_考古題/3_L2_結構化抽取/三下/三下_自然_L2_整合.md
git commit -m "feat: JOB-229 Phase C/D 三版本彙整 + 全科目整合（codex 草擬，Claude 驗收）

JOB: JOB-229"
```

---

## Task 15: 全自動結案 — Phase E Report + 收尾

**Files:**
- Create: `knowledge/3_考古題/3_L2_結構化抽取/_L2_quality_report_natural.json`
- Create: `jobs/JOB-229-Report.md`

- [ ] **Step 1: 派 codex 寫 _L2_quality_report_natural.json + Report 草稿**

Write `/tmp/codex_phase_e_natural_prompt.md`（基於 JOB-228 Phase E prompt 改）。重點：
- 數據來源：_validation_report_natural / 三份 _L2_summary / 整合 MD / _full_progress_a/b/c
- spot check 累計從 _spot_check.log
- 三 worker 並行統計：每 worker 完成數、平均速率、總耗時
- 與 JOB-228 對照：實際時間 vs 預估 ~9-11 hr

派 codex：
```bash
cat /tmp/codex_phase_e_natural_prompt.md | codex exec --skip-git-repo-check --full-auto - 2>&1 | tee scripts/orchestrator-logs/JOB-229-codex-phase-e.log | tail -30
```

- [ ] **Step 2: Claude 驗收 Report + 補驗收欄**

Read `jobs/JOB-229-Report.md`，確認數字對齊 + 邊界 + 遺留問題。Edit 補驗收欄：
- 驗收者: Claude Code (claude-opus-4-7)
- 驗收時間: <當下>
- 驗收結果: 通過 / 退回（依實際）
- 退回原因: 無 / <填>

- [ ] **Step 3: /pj_sync — 更新進度彙整 + 專案發展紀錄**

```bash
# 更新進度彙整 frontmatter
# 更新 docs/README_專案發展紀錄.md「2026-05-XX」加 JOB-229 紀錄
```

把 Report 「成果 Checklist」中「已執行 /pj_sync」打勾。

- [ ] **Step 4: close JOB-229**

Run:
```bash
node scripts/job_manager.js close JOB-229 2>&1 | tail -5
```
Expected: `✅ [Job Manager] JOB-229 結案條件已滿足`

- [ ] **Step 5: Discord 結案回報**

呼叫 `mcp__plugin_discord_discord__reply`，chat_id=`1487738477608177714`，text 為：

```
🎉 **JOB-229 全自動結案完成**

**最終成果**：
- ✅ 129 份 L2 結構化抽取（Phase 5 123 + 黃金 1 + Pilot 5）
- ✅ N 題、N codes、違規率 N%
- ✅ 三版本 _L2_summary.md + 全科目整合 MD
- ✅ 認知層次三版本對照（自然科探究/實作占比 N%）

**執行軌跡**：
- Phase 0 準備：N hr（A0 + 黃金 + Pilot）
- Phase 5 並行 3 條：N hr（vs JOB-228 序列 14.7h）
- Phase B-E：N min

**驗證並行 3 條成效**：實際 vs 預估 ~5-6 hr（差異 N%）

詳見 `jobs/JOB-229-Report.md`
```

- [ ] **Step 6: 最終 commit**

Run:
```bash
git add jobs/JOB-229-Report.md knowledge/3_考古題/3_L2_結構化抽取/_L2_quality_report_natural.json docs/進度彙整_題庫研發與產出.md docs/README_專案發展紀錄.md
git commit -m "$(cat <<'EOF'
feat: JOB-229 結案 — 三下自然 L2 結構化抽取 129 份完成

為什麼這樣做：
JOB-229 完成三下自然考古題 L2 結構化抽取。沿用 JOB-228 五元件骨架
+ 兩優化（Phase 5 並行 3 條 codex、黃金樣本縮 1 份）。實測時間驗證
並行優化效果。

技術變更：
- 新增 jobs/JOB-229-Report.md
- 新增 _L2_quality_report_natural.json
- 修改 docs/進度彙整 frontmatter
- 修改 docs/README_專案發展紀錄.md

JOB: JOB-229
EOF
)"
```

---

## Self-Review

**1. Spec coverage：**

| Spec 章節 | 對應 Task |
|:--|:--|
| §1 跟 JOB-228 兩優化 | Task 8（並行分配）+ Task 5（1 份黃金） |
| §2.1 靜態分配 | Task 8 generator |
| §2.2 檔案分割 | Task 8/9 |
| §2.3 啟動方式 | Task 12 |
| §2.4 Dashboard 整合 | Task 10 |
| §2.5 Spot check 邏輯 | Task 11 + Task 12 wakeup prompt |
| §3.1 A0 編碼清單（派 codex） | Task 2 |
| §3.2 A1 prompt template | Task 3 |
| §3.3 黃金樣本 1 份 | Task 4 + Task 5 |
| §3.4 Pilot 5 份 | Task 6 + Task 7 |
| §4 Phase 5 全量 | Task 12 啟動 + Task 13 完成觸發 |
| §5 Phase B/C/D/E | Task 13 + Task 14 + Task 15 |
| §6 預估時間 | 對照在每 task 預估 |
| §7 風險與防護 | Task 12 wakeup prompt（連 5 失敗 fallback）+ Task 9 watchdog |
| §8 結束條件 | Task 12 step 5 wakeup prompt step 8 |

✅ 全覆蓋。

**2. Placeholder scan：**

- Task 4 Step 2「`<path1>` 等佔位」明確標記要實際填入（依 Step 1 結果），不是 placeholder
- Task 5 Step 1「`<chosen>`」是依 Task 4 結果填，明確 dependency
- Task 12 Step 4 Discord 文字「<填當下>」「<PID>」是執行時值
- Task 15 Step 5 Discord 「N」是實際數字
- 無 TBD/TODO

✅ 無 placeholder 污染。

**3. Type consistency：**

- progress 欄位：`completed`、`failed`、`rank_N`、`validation_layer1` — 全一致
- 路徑命名：`_full_progress_{a,b,c}.json` / `_full_targets_{a,b,c}.json` / `A2_full_dispatch_{a,b,c}.sh` / `continuous_full_loop_{a,b,c}.sh` — 一致
- Worker 編號：a/b/c 全篇一致
- 黃金樣本路徑 `_golden_samples_natural/`、Pilot 路徑 `_pilot_natural/` 全篇一致

✅ 一致。

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-10-job229-natural-l2-extraction.md`.
