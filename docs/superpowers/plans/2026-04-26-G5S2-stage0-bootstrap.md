# G5S2 Pipeline 階段 0 前置基礎設施 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立 G5S2 三 Agent 流水線的階段 0 前置基礎設施（Karpathy IDE 護欄、量化軌跡 tsv、雙盲一致性檢查腳本、三 SKILL 升級），讓階段 1-4 派工能順利落地。

**Architecture:** 在 Eidos 現有派工準則之上，注入 Karpathy 四原則（透過 `.cursor/rules/*.mdc` 自動套用）與 autoresearch 自主迴圈（透過自寫腳本與 tsv 軌跡）；本 plan **不修題庫**、**不開階段 1 派工**，僅建設「工具鏈與規範注入點」。

**Tech Stack:** Bash / Node.js (CommonJS) / Markdown / Cursor `.mdc` rules / Eidos `job_manager.js`

**Spec 來源:** `docs/superpowers/specs/2026-04-26-G5S2-tri-agent-cursor-pipeline-design.md` v1.0.0

**注意事項：**
- 所有 JOB 編號用 `JOB-XXX` 佔位符；實際號碼在 Task 1 跑 `job_manager.js next` 取得後，**全 plan 文字一次性 sed 替換**為真實號（請執行者自行做）
- 本 plan 期間**禁止建任何階段 1-4 的 JOB**——那是後續 plan 的工作
- 本 plan 涉及規範文件（三 SKILL.md），對應的 docs_ops JOB 在 Task 1 開立
- 升級 SKILL.md 時嚴守 Eidos 通用作業準則 §1.1「Skill 為薄觸發器，≤15 行」原則：每份 SKILL 加 ≤ 8 行新段落

---

## File Structure（一覽）

| 動作 | 路徑 | 責任 |
|:--|:--|:--|
| 新增 | `.cursor/rules/karpathy-guidelines.mdc` | Cursor IDE 護欄：Karpathy 四原則，alwaysApply |
| 新增 | `jobs/g5s2_results.tsv` | autoresearch 風格量化軌跡，header only |
| 新增 | `scripts/g5s2_tsv_monitor.sh` | tsv 進度監控腳本 |
| 新增 | `scripts/check_dual_blind_consistency.js` | 雙盲一致性檢查 + MTP 分流 |
| 新增 | `tests/check_dual_blind_consistency.test.js` | 雙盲一致性檢查測試 |
| 新增 | `tests/fixtures/dual_blind_sample.json` | 雙盲測試用 fixture |
| 修改 | `_agent/skills/ei_research/SKILL.md` | 加「自主迴圈條款」段（≤ 8 行） |
| 修改 | `_agent/skills/ei_qst/SKILL.md` | 加「自主迴圈條款」段（≤ 8 行） |
| 修改 | `_agent/skills/ei_verify/SKILL.md` | 加「自主迴圈條款 + 雙盲」段（≤ 8 行） |
| 新增 | `jobs/JOB-XXX-AG-G5S2-pipeline-bootstrap.md` | docs_ops 派工單 |
| 新增 | `jobs/JOB-XXX-Report.md` | 結案報告 |

---

## Task 1：取得真實 JOB 流水號 + 草擬派工單給使用者確認

**Files:**
- Read: `scripts/job_manager.js`（驗證腳本可用性）

- [ ] **Step 1.1：跑 `job_manager.js next` 取得下一號**

```bash
node scripts/job_manager.js next
```

Expected output（範例，實際以腳本輸出為準）：
```
建議下一號：JOB-210
條件 A 合規派工：xxx 筆
條件 B PLAN：xxx 筆
...
```

把建議下一號記為 `<NNN>`，後續所有 `JOB-XXX` 替換為 `JOB-<NNN>`。

- [ ] **Step 1.2：對話中草擬派工單內容呈現給使用者**

呈現以下完整草稿（**禁止**先建空殼事後填寫，依 Eidos §4.0 草稿先行原則）：

````markdown
# JOB-<NNN> AG G5S2 三 Agent 流水線前置基礎建設
job_type: docs_ops
agent_role: PM (Claude Code)
spec_versions:
  - 通用作業準則 v?（依實檔 last_updated）
  - 派工準則 v?（依實檔 last_updated）
  - 出題準則（CQI-P）v?
  - 驗證準則（CQI-V）v4.3
  - 研究架構總綱 v4.3
  - karpathy-guidelines（複製自外部 repo）
  - autoresearch program.md（概念引用）
spec_doc: docs/superpowers/specs/2026-04-26-G5S2-tri-agent-cursor-pipeline-design.md
plan_doc: docs/superpowers/plans/2026-04-26-G5S2-stage0-bootstrap.md

## 1️⃣ 啟動 Checklist（Pre-Flight）
- [ ] 已讀 docs/README_通用作業準則.md
- [ ] 已讀 docs/README_任務派工準則.md
- [ ] 已讀 spec 文件 v1.0.0 第六章
- [ ] 已讀 plan 文件 Task 1-13
- [ ] 確認 `_agent/skills/` 三份 SKILL.md 為薄觸發器格式

## 2️⃣ 任務邊界
- 做：新增 6 項基礎檔案 + 升級 3 份 SKILL.md（每份加 ≤8 行新段）
- 不做：開階段 1-4 任何 JOB；不修題庫；不動其他規範文件

## 3️⃣ Karpathy 四原則 Reminder
1. Think Before Coding：spec 已決定六項檔案，不臨時加減
2. Simplicity First：每份 SKILL.md 加段不超過 8 行
3. Surgical Changes：只動 plan File Structure 列出的 11 項，不順手改其他
4. Goal-Driven：DoD = Task 11 smoke test 全綠

## 4️⃣ 執行步驟
依 plan 文件 Task 2-12 執行。

## 5️⃣ DoD（驗收）
- [ ] `.cursor/rules/karpathy-guidelines.mdc` 存在且 `alwaysApply: true`
- [ ] `jobs/g5s2_results.tsv` 存在且只有 header 行
- [ ] `scripts/g5s2_tsv_monitor.sh` 可執行（chmod +x）且輸出空 tsv 訊息
- [ ] `scripts/check_dual_blind_consistency.js` 通過 `tests/check_dual_blind_consistency.test.js` 全部測試
- [ ] 三份 SKILL.md 各加入「自主迴圈條款」段，行數增加 ≤ 8 行
- [ ] 所有變更已 commit，commit message 符合 Eidos 規範
- [ ] `jobs/JOB-<NNN>-Report.md` 已產出
- [ ] `node scripts/job_manager.js close JOB-<NNN>` 執行成功

## 6️⃣ results.tsv 寫入規則
本 JOB 為基礎建設，**不寫入** g5s2_results.tsv（tsv 從階段 1 起算）。

## 7️⃣ 退件條件
- 任一 SKILL.md 升級超過 8 行 → 退件重做（違反 §1.1）
- 雙盲腳本測試未通過 → 退件直到通過
- pre-commit hook 黃金測資失敗 → 修復後重 commit

## 8️⃣ 成果 Checklist
- [ ] jobs/JOB-<NNN>-Report.md
- [ ] /pj_sync 執行（同步進度表）
- [ ] Discord 結案摘要
````

**等使用者明確回應「LGTM」「確認」「開始」之一才進 Step 1.3。**

- [ ] **Step 1.3：跑 `job_manager.js create` 開單**

```bash
node scripts/job_manager.js create "G5S2 三 Agent 流水線前置基礎建設" AG docs_ops
```

Expected: 產出 `jobs/JOB-<NNN>-AG-G5S2-三-Agent-流水線前置基礎建設.md`（檔名實際以腳本輸出為準）

- [ ] **Step 1.4：把 Step 1.2 草稿內容寫入派工單**

用 `Write` 工具把草稿（Step 1.2 markdown 內容）覆蓋寫入 `jobs/JOB-<NNN>-AG-*.md`，保留 `job_type`、`spec_versions`、`spec_doc`、`plan_doc`。

- [ ] **Step 1.5：commit 派工單**

```bash
git add jobs/JOB-<NNN>-AG-*.md
git commit -m "$(cat <<'EOF'
docs: 開立 G5S2 流水線前置 JOB，承接 spec 設計進入實作

為什麼這樣做：
spec v1.0.0 已通過使用者複核，需在 Eidos 派工系統留下對應 JOB 紀錄，
讓後續六項基礎建設變更（mdc 護欄、tsv 軌跡、雙盲腳本、三 SKILL 升級）
有正式派工單追蹤，符合 §3.4 幽靈 Report 防止規定。

技術變更：
- 新增 jobs/JOB-<NNN>-AG-G5S2-三-Agent-流水線前置基礎建設.md
- job_type: docs_ops、依 spec 第 6 章與 plan Task 2-12 執行

JOB: JOB-<NNN>

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

Expected: pre-commit hook 全綠，commit 成功。

---

## Task 2：新增 Karpathy IDE 護欄（`.cursor/rules/karpathy-guidelines.mdc`）

**Files:**
- Create: `.cursor/rules/karpathy-guidelines.mdc`

- [ ] **Step 2.1：建立 mdc 檔，內容直接複製自外部 repo + 開頭註記**

用 `Write` 工具寫入 `.cursor/rules/karpathy-guidelines.mdc`，內容為：

```markdown
---
description: Behavioral guidelines to reduce common LLM coding mistakes. Use when writing, reviewing, or refactoring code to avoid overcomplication, make surgical changes, surface assumptions, and define verifiable success criteria.
alwaysApply: true
---

<!-- 本檔同步自外部 repo githubFav/andrej-karpathy-skills/.cursor/rules/karpathy-guidelines.mdc，2026-04-26 取得，遇有上游更新時請整批同步 -->

# Karpathy behavioral guidelines

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
\`\`\`
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
\`\`\`

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
```

- [ ] **Step 2.2：驗證檔案存在與內容**

```bash
ls -la .cursor/rules/karpathy-guidelines.mdc
head -5 .cursor/rules/karpathy-guidelines.mdc
```

Expected:
```
-rw-r--r--  ... .cursor/rules/karpathy-guidelines.mdc
---
description: Behavioral guidelines...
alwaysApply: true
---
```

- [ ] **Step 2.3：commit**

```bash
git add .cursor/rules/karpathy-guidelines.mdc
git commit -m "$(cat <<'EOF'
docs: 新增 Karpathy 編程紀律規則檔，所有 Cursor session 自動套用

為什麼這樣做：
JOB-184/152→159 等歷史失敗顯示 Cursor agent 常因「假設不明、過度
工程、順手改其他、目標模糊」出包；引入 Karpathy 四原則作為 IDE
護欄，每次 session 啟動自動載入，把這些紀律前移到動手前。

技術變更：
- 新增 .cursor/rules/karpathy-guidelines.mdc，alwaysApply: true
- 內容同步自 githubFav/andrej-karpathy-skills 外部專案
- 開頭加上同步註記，便於後續整批更新

JOB: JOB-<NNN>

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

Expected: commit 成功，pre-commit hook 全綠。

---

## Task 3：新增量化軌跡 `jobs/g5s2_results.tsv`

**Files:**
- Create: `jobs/g5s2_results.tsv`

- [ ] **Step 3.1：建立 tsv 檔，僅 header 行**

用 `Write` 工具寫入 `jobs/g5s2_results.tsv`，內容為（**注意每欄之間是 tab 分隔，不是空格**）：

```tsv
commit	agent	subject	publisher	lesson	CQI-P	CQI-V	Match%	QL	status	desc	ts
```

驗證 tab 分隔：

```bash
cat -A jobs/g5s2_results.tsv | head -1
```

Expected: 看到 `commit^Iagent^Isubject^I...`（`^I` 為 tab 字元）

- [ ] **Step 3.2：commit**

```bash
git add jobs/g5s2_results.tsv
git commit -m "$(cat <<'EOF'
chore: 建立 G5S2 三 Agent 量化軌跡 tsv 檔

為什麼這樣做：
spec 第 9 章定義以 autoresearch 風格 tsv 紀錄三 Agent 每課推進結果，
讓 PM 即時看戰報、不靠 cursor 自述進度，避免 JOB-141 部分完成藏
Report 結尾的問題。本 commit 建立空檔頭，之後階段 1-3 由 cursor
agent 寫入。

技術變更：
- 新增 jobs/g5s2_results.tsv，僅 header 行（12 欄 tab 分隔）

JOB: JOB-<NNN>

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

Expected: commit 成功。

---

## Task 4：新增監控腳本 `scripts/g5s2_tsv_monitor.sh`

**Files:**
- Create: `scripts/g5s2_tsv_monitor.sh`

- [ ] **Step 4.1：寫入監控腳本**

用 `Write` 工具寫入 `scripts/g5s2_tsv_monitor.sh`：

```bash
#!/bin/bash
# G5S2 三 Agent 進度監控（spec 第 9.3 節）
# 用法：bash scripts/g5s2_tsv_monitor.sh
TSV="jobs/g5s2_results.tsv"

if [[ ! -f "$TSV" ]]; then
  echo "錯誤：$TSV 不存在"
  exit 1
fi

LINE_COUNT=$(awk 'NR>1' "$TSV" | wc -l | tr -d ' ')

echo "=== G5S2 三 Agent 進度 ($(date '+%Y-%m-%d %H:%M')) ==="
echo "資料行數：$LINE_COUNT"
echo

if [[ "$LINE_COUNT" -eq 0 ]]; then
  echo "（尚無資料，tsv 僅含 header）"
  exit 0
fi

echo "📈 status 分布："
awk -F'\t' 'NR>1{print $10}' "$TSV" | sort | uniq -c | sort -rn
echo

echo "📊 各 agent 進度（status=keep）："
awk -F'\t' 'NR>1 && $10=="keep" {a[$2]++} END {for (k in a) print "  "k": "a[k]" 課過閘"}' "$TSV"
echo

echo "⚠️  manual_review 待裁定："
awk -F'\t' 'NR>1 && $10=="manual_review" {print "  "$2"/"$3"/"$4"/"$5": "$11}' "$TSV"
echo

echo "🔥 最新 5 筆："
tail -n 5 "$TSV" | column -t -s $'\t'
```

- [ ] **Step 4.2：賦予執行權限**

```bash
chmod +x scripts/g5s2_tsv_monitor.sh
```

- [ ] **Step 4.3：執行 smoke test（空 tsv 場景）**

```bash
bash scripts/g5s2_tsv_monitor.sh
```

Expected output:
```
=== G5S2 三 Agent 進度 (YYYY-MM-DD HH:MM) ===
資料行數：0

（尚無資料，tsv 僅含 header）
```

- [ ] **Step 4.4：commit**

```bash
git add scripts/g5s2_tsv_monitor.sh
git commit -m "$(cat <<'EOF'
chore: 新增 G5S2 三 Agent 進度監控腳本

為什麼這樣做：
spec 第 9.3 節定義 PM 透過此腳本即時看戰報，不必逐課讀 Report；
空 tsv、有資料、含 manual_review 三種情境都涵蓋，讓階段 1-3 進行
時可隨時掌握進度。

技術變更：
- 新增 scripts/g5s2_tsv_monitor.sh，含三類統計：status 分布、
  各 agent keep 課數、manual_review 清單、最新 5 筆 tail
- chmod +x 賦予執行權限

JOB: JOB-<NNN>

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5：建立雙盲一致性測試 fixture（TDD：先寫測試）

**Files:**
- Create: `tests/fixtures/dual_blind_sample.json`

- [ ] **Step 5.1：寫入 fixture，包含 5 種題目情境**

用 `Write` 工具寫入 `tests/fixtures/dual_blind_sample.json`：

```json
{
  "meta": {
    "grade": "G5",
    "semester": "S2",
    "subject": "SCI",
    "publisher": "HANLIN",
    "lesson": "L1",
    "title": "璀璨的星空",
    "order": 1
  },
  "questions": [
    {
      "id": "q1_dual_match",
      "answer_index": 2,
      "blind_eval_g": { "predicted_index": 2, "reasoning": "正確" },
      "blind_eval_c": { "predicted_index": 2, "reasoning": "正確" }
    },
    {
      "id": "q2_type_a_no_option_found",
      "answer_index": 1,
      "blind_eval_g": { "predicted_index": -1, "reasoning": "找不到符合的選項" },
      "blind_eval_c": { "predicted_index": -1, "reasoning": "選項中沒有正確答案" }
    },
    {
      "id": "q3_type_b_original_wrong",
      "answer_index": 0,
      "blind_eval_g": { "predicted_index": 3, "reasoning": "依題意應為選項 D" },
      "blind_eval_c": { "predicted_index": 3, "reasoning": "推論結果為 D" }
    },
    {
      "id": "q4_type_c_disagree",
      "answer_index": 1,
      "blind_eval_g": { "predicted_index": 0, "reasoning": "選 A" },
      "blind_eval_c": { "predicted_index": 2, "reasoning": "選 C" }
    },
    {
      "id": "q5_partial_one_match",
      "answer_index": 3,
      "blind_eval_g": { "predicted_index": 3, "reasoning": "正確" },
      "blind_eval_c": { "predicted_index": 1, "reasoning": "選 B" }
    }
  ]
}
```

驗證：

```bash
node -e "console.log(require('./tests/fixtures/dual_blind_sample.json').questions.length)"
```

Expected: `5`

---

## Task 6：寫雙盲一致性檢查測試（TDD：紅燈）

**Files:**
- Create: `tests/check_dual_blind_consistency.test.js`

- [ ] **Step 6.1：寫測試檔**

用 `Write` 工具寫入 `tests/check_dual_blind_consistency.test.js`：

```javascript
// tests/check_dual_blind_consistency.test.js
// 測試 scripts/check_dual_blind_consistency.js 對 5 種雙盲情境的分流結果。

const path = require('path');
const assert = require('assert');
const { analyzeDualBlind } = require(path.join('..', 'scripts', 'check_dual_blind_consistency.js'));
const sample = require(path.join('.', 'fixtures', 'dual_blind_sample.json'));

const result = analyzeDualBlind(sample);

// 1. 每題分類
const byId = Object.fromEntries(result.questions.map(q => [q.id, q]));

assert.strictEqual(byId.q1_dual_match.status, 'keep', 'q1 雙盲都 Match 應為 keep');
assert.strictEqual(byId.q1_dual_match.mtp_type, null);

assert.strictEqual(byId.q2_type_a_no_option_found.status, 'keep', 'TYPE-A 自動 resolved 應為 keep');
assert.strictEqual(byId.q2_type_a_no_option_found.mtp_type, 'A');

assert.strictEqual(byId.q3_type_b_original_wrong.status, 'discard', 'TYPE-B 退回 Production 應為 discard');
assert.strictEqual(byId.q3_type_b_original_wrong.mtp_type, 'B');

assert.strictEqual(byId.q4_type_c_disagree.status, 'manual_review', 'TYPE-C 兩模型不同推論應 manual_review');
assert.strictEqual(byId.q4_type_c_disagree.mtp_type, 'C');

assert.strictEqual(byId.q5_partial_one_match.status, 'manual_review', '一致性失敗（partial）應 manual_review');
assert.strictEqual(byId.q5_partial_one_match.mtp_type, null);
assert.strictEqual(byId.q5_partial_one_match.partial, true);

// 2. 課級統計
assert.strictEqual(result.summary.total, 5);
assert.strictEqual(result.summary.keep, 2);            // q1, q2
assert.strictEqual(result.summary.discard, 1);          // q3
assert.strictEqual(result.summary.manual_review, 2);    // q4, q5
assert.strictEqual(result.summary.partial, 1);          // q5
assert.strictEqual(result.summary.type_b_count, 1);     // q3
assert.strictEqual(result.summary.type_b_ratio, 0.2);   // 1/5
assert.strictEqual(result.summary.inconsistency_ratio, 0.2); // q5 / 5

// 3. 警告觸發
assert.strictEqual(result.summary.warnings.includes('TYPE-B > 5%'), true,
  'type_b_ratio = 20% 應觸發警告');
assert.strictEqual(result.summary.warnings.includes('inconsistency > 20%'), false,
  'inconsistency = 20% 不應觸發（門檻 > 20%）');

// 4. 建議寫入 tsv 的 status
assert.strictEqual(result.summary.suggested_tsv_status, 'manual_review',
  '有 TYPE-B 警告時建議課級 status = manual_review');

console.log('✅ All dual-blind consistency tests passed.');
```

- [ ] **Step 6.2：跑測試確認紅燈**

```bash
node tests/check_dual_blind_consistency.test.js
```

Expected: FAIL，錯誤訊息類似：
```
Error: Cannot find module '../scripts/check_dual_blind_consistency'
```

或：
```
TypeError: analyzeDualBlind is not a function
```

紅燈確認 → 進 Task 7。

---

## Task 7：實作雙盲一致性檢查腳本（TDD：綠燈）

**Files:**
- Create: `scripts/check_dual_blind_consistency.js`

- [ ] **Step 7.1：寫腳本**

用 `Write` 工具寫入 `scripts/check_dual_blind_consistency.js`：

```javascript
#!/usr/bin/env node
// scripts/check_dual_blind_consistency.js
// 雙盲一致性檢查 + MTP 分流（spec 第 9.4 節）。
// 用法：
//   node scripts/check_dual_blind_consistency.js <path/to/blind_evaluated.json>
// 模組用法：
//   const { analyzeDualBlind } = require('./check_dual_blind_consistency');

const TYPE_B_THRESHOLD = 0.05;
const INCONSISTENCY_THRESHOLD = 0.2;

function classifyQuestion(q) {
  const ans = q.answer_index;
  const g = q.blind_eval_g || {};
  const c = q.blind_eval_c || {};
  const gMatch = g.predicted_index === ans;
  const cMatch = c.predicted_index === ans;

  if (gMatch && cMatch) {
    return { status: 'keep', mtp_type: null, partial: false };
  }

  // TYPE-A：兩 model 都標 -1（找不到正確選項）
  const noOption = (idx, reasoning) =>
    idx === -1 ||
    (typeof reasoning === 'string' &&
      /找不到|沒有正確|no correct option|cannot find/i.test(reasoning));
  if (!gMatch && !cMatch && noOption(g.predicted_index, g.reasoning) && noOption(c.predicted_index, c.reasoning)) {
    return { status: 'keep', mtp_type: 'A', partial: false };
  }

  // TYPE-B：兩 model 都推得相同錯誤答案
  if (!gMatch && !cMatch && g.predicted_index === c.predicted_index && g.predicted_index !== -1) {
    return { status: 'discard', mtp_type: 'B', partial: false };
  }

  // TYPE-C：兩 model 都 mismatch 但推不同答案
  if (!gMatch && !cMatch) {
    return { status: 'manual_review', mtp_type: 'C', partial: false };
  }

  // partial：一 Match 一 Mismatch
  return { status: 'manual_review', mtp_type: null, partial: true };
}

function analyzeDualBlind(json) {
  const questions = (json.questions || []).map((q) => ({
    id: q.id,
    answer_index: q.answer_index,
    ...classifyQuestion(q),
  }));

  const total = questions.length;
  const count = (pred) => questions.filter(pred).length;

  const keep = count((q) => q.status === 'keep');
  const discard = count((q) => q.status === 'discard');
  const manual_review = count((q) => q.status === 'manual_review');
  const partial = count((q) => q.partial);
  const type_b_count = count((q) => q.mtp_type === 'B');
  const type_b_ratio = total ? type_b_count / total : 0;
  const inconsistency_ratio = total ? partial / total : 0;

  const warnings = [];
  if (type_b_ratio > TYPE_B_THRESHOLD) warnings.push('TYPE-B > 5%');
  if (inconsistency_ratio > INCONSISTENCY_THRESHOLD) warnings.push('inconsistency > 20%');

  let suggested_tsv_status = 'keep';
  if (warnings.length > 0) suggested_tsv_status = 'manual_review';
  else if (manual_review > 0 || discard > 0) suggested_tsv_status = 'manual_review';

  return {
    questions,
    summary: {
      total,
      keep,
      discard,
      manual_review,
      partial,
      type_b_count,
      type_b_ratio,
      inconsistency_ratio,
      warnings,
      suggested_tsv_status,
    },
  };
}

function main() {
  const target = process.argv[2];
  if (!target) {
    console.error('用法：node scripts/check_dual_blind_consistency.js <path/to/blind_evaluated.json>');
    process.exit(1);
  }
  const path = require('path');
  const json = require(path.resolve(target));
  const result = analyzeDualBlind(json);

  console.log(`雙盲一致性檢查結果：${target}`);
  console.log(`  總題數：${result.summary.total}`);
  console.log(`  keep：${result.summary.keep}`);
  console.log(`  discard：${result.summary.discard}`);
  console.log(`  manual_review：${result.summary.manual_review}`);
  console.log(`  partial：${result.summary.partial}`);
  console.log(`  TYPE-B 比例：${(result.summary.type_b_ratio * 100).toFixed(1)}%`);
  console.log(`  不一致率：${(result.summary.inconsistency_ratio * 100).toFixed(1)}%`);
  if (result.summary.warnings.length) {
    console.log(`  ⚠️ 警告：${result.summary.warnings.join(', ')}`);
  }
  console.log(`  建議課級 status：${result.summary.suggested_tsv_status}`);
}

if (require.main === module) {
  main();
}

module.exports = { analyzeDualBlind, classifyQuestion };
```

- [ ] **Step 7.2：跑測試確認綠燈**

```bash
node tests/check_dual_blind_consistency.test.js
```

Expected:
```
✅ All dual-blind consistency tests passed.
```

如有失敗 → 看錯誤訊息修改 `scripts/check_dual_blind_consistency.js` 的 `classifyQuestion` 或 `analyzeDualBlind` 邏輯，重跑直到綠燈。

- [ ] **Step 7.3：跑 CLI smoke test**

```bash
node scripts/check_dual_blind_consistency.js tests/fixtures/dual_blind_sample.json
```

Expected output（數字應與測試一致）：
```
雙盲一致性檢查結果：tests/fixtures/dual_blind_sample.json
  總題數：5
  keep：2
  discard：1
  manual_review：2
  partial：1
  TYPE-B 比例：20.0%
  不一致率：20.0%
  ⚠️ 警告：TYPE-B > 5%
  建議課級 status：manual_review
```

- [ ] **Step 7.4：commit 三項（fixture + 測試 + 腳本）**

```bash
git add tests/fixtures/dual_blind_sample.json tests/check_dual_blind_consistency.test.js scripts/check_dual_blind_consistency.js
git commit -m "$(cat <<'EOF'
feat: 新增雙盲一致性檢查腳本，支援 L2 雙盲嚴謹門檻

為什麼這樣做：
spec 採 L2 雙盲（Gemini Flash + Claude Haiku），需要一支腳本把兩
次盲測結果合併、做 MTP 分流（TYPE-A/B/C）、產出建議課級 status；
沒有這個工具，verify agent 只能單盲，違反 spec 第 11.1 節決議。

技術變更：
- 新增 scripts/check_dual_blind_consistency.js（CommonJS，可作為
  CLI 或模組使用），含 analyzeDualBlind / classifyQuestion 兩個
  匯出函式
- 新增 tests/check_dual_blind_consistency.test.js，5 種題目情境
  覆蓋雙 Match / TYPE-A/B/C / partial 全部分流
- 新增 tests/fixtures/dual_blind_sample.json 作為測試輸入
- TYPE-B > 5%、inconsistency > 20% 自動觸發警告，建議課級
  status 升至 manual_review

JOB: JOB-<NNN>

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

Expected: pre-commit hook 全綠（本變更不修題庫，黃金測資不受影響）。

---

## Task 8：升級 `_agent/skills/ei_research/SKILL.md`

**Files:**
- Modify: `_agent/skills/ei_research/SKILL.md`

- [ ] **Step 8.1：用 Edit 在「硬閘」段最後加入「自主迴圈條款」**

`old_string`（檔案目前最後一行）：

```
- [ ] KL4 單課須含「課文全文錄製」（RC-01），否則 ei_qst 無法抽取
```

`new_string`：

```
- [ ] KL4 單課須含「課文全文錄製」（RC-01），否則 ei_qst 無法抽取

## 自主迴圈條款（autoresearch 風格，G5S2 流水線啟用）

- 每課完成 KL4 雙檔即 git commit、寫一行至 `jobs/g5s2_results.tsv`
- 考古題 < 10 或來源 < 2 → 標 β+ 並降 QL 上限至 QL3，繼續推進
- KL4 完全缺檔或連 3 課 crash → 停下等 PM；其餘狀況 NEVER STOP 直到範圍內全綠
```

- [ ] **Step 8.2：驗證行數增加 ≤ 8 行**

```bash
git diff --numstat _agent/skills/ei_research/SKILL.md
```

Expected: 第一欄（新增行數）≤ 8

- [ ] **Step 8.3：commit**

```bash
git add _agent/skills/ei_research/SKILL.md
git commit -m "$(cat <<'EOF'
docs: ei_research 加入自主迴圈條款，啟用 G5S2 流水線

為什麼這樣做：
G5S2 三 Agent 流水線需要 Research agent 在跑 KL4 補強時走 autoresearch
風格的自主迴圈（每課 commit、tsv 寫入、NEVER STOP），原 SKILL 只有
硬閘無迴圈規則。本次新增 5 行薄條款，仍守 §1.1 ≤15 行原則。

技術變更：
- 修改 _agent/skills/ei_research/SKILL.md，於硬閘段後新增「自主迴圈
  條款」段（5 行），定義 commit / tsv / β+ 退化 / 停下條件

JOB: JOB-<NNN>

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 9：升級 `_agent/skills/ei_qst/SKILL.md`

**Files:**
- Modify: `_agent/skills/ei_qst/SKILL.md`

- [ ] **Step 9.1：用 Edit 加入自主迴圈條款**

`old_string`：

```
- [ ] 產題後跑 `evaluate_question_quality.js` 確認 CQI-P ≥ 5.5
```

`new_string`：

```
- [ ] 產題後跑 `evaluate_question_quality.js` 確認 CQI-P ≥ 5.5

## 自主迴圈條款（G5S2 流水線啟用）

- 每課產題完即 git commit、寫一行至 `jobs/g5s2_results.tsv`
- 標準指令含 `--qpm 2 --conservative`（避免 JOB-184 API 限流卡住）
- CQI-P < 5.5 → retry ≤ 3，仍失敗則 manual_review；429 自動降頻、連 5 次 crash 停下
- KL4 雙檔缺 → 退件 Research agent，不就地補做
```

- [ ] **Step 9.2：驗證行數**

```bash
git diff --numstat _agent/skills/ei_qst/SKILL.md
```

Expected: 第一欄 ≤ 8

- [ ] **Step 9.3：commit**

```bash
git add _agent/skills/ei_qst/SKILL.md
git commit -m "$(cat <<'EOF'
docs: ei_qst 加入自主迴圈條款，預設 API 限流參數

為什麼這樣做：
JOB-184 G5S2 社會出題卡 429 限流 stuck 多日，根因是 SKILL 沒明定
標準指令的限流預設值。本次把 --qpm 2 --conservative 升格成 SKILL
條款一部分，加上 retry / crash / 退件規則，避免重蹈覆轍。

技術變更：
- 修改 _agent/skills/ei_qst/SKILL.md，於硬閘段後新增「自主迴圈
  條款」段（6 行）

JOB: JOB-<NNN>

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 10：升級 `_agent/skills/ei_verify/SKILL.md`

**Files:**
- Modify: `_agent/skills/ei_verify/SKILL.md`

- [ ] **Step 10.1：用 Edit 加入雙盲與自主迴圈條款**

`old_string`：

```
- [ ] Mismatch 依 MTP 協議分類為 TYPE-A/B/C，附 VAT 稽核日誌路徑
```

`new_string`：

```
- [ ] Mismatch 依 MTP 協議分類為 TYPE-A/B/C，附 VAT 稽核日誌路徑

## 自主迴圈條款（G5S2 流水線 L2 雙盲啟用）

- 雙盲：必跑 Gemini Flash 與 Claude Haiku 兩 model；用 `scripts/check_dual_blind_consistency.js` 合併分流
- 兩 Match → keep；TYPE-A 自動 resolved；TYPE-B → 退 Production；TYPE-C / partial → manual_review
- 每課完即 commit、寫 `jobs/g5s2_results.tsv`；TYPE-B > 5%/課 整課退回；雙盲不一致率 > 20% 停下等 PM
```

- [ ] **Step 10.2：驗證行數**

```bash
git diff --numstat _agent/skills/ei_verify/SKILL.md
```

Expected: 第一欄 ≤ 8

- [ ] **Step 10.3：commit**

```bash
git add _agent/skills/ei_verify/SKILL.md
git commit -m "$(cat <<'EOF'
docs: ei_verify 升級 L2 雙盲條款，串接 check_dual_blind_consistency

為什麼這樣做：
spec 第 11.1 節決議採 L2 雙盲，原 SKILL 只規定單盲與 MTP 分流；
需把雙盲流程明文寫進 SKILL，避免 verify agent 仍只跑一次盲測，
讓 spec 嚴謹度真正落地。

技術變更：
- 修改 _agent/skills/ei_verify/SKILL.md，於硬閘段後新增「自主迴圈
  條款」段（5 行），明定雙盲必跑兩 model + check_dual_blind_consistency
  + tsv 寫入 + TYPE-B / 不一致率退件門檻

JOB: JOB-<NNN>

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 11：Smoke Test 全綠驗收

- [ ] **Step 11.1：確認六項基礎建設檔案存在**

```bash
ls -la \
  .cursor/rules/karpathy-guidelines.mdc \
  jobs/g5s2_results.tsv \
  scripts/g5s2_tsv_monitor.sh \
  scripts/check_dual_blind_consistency.js \
  tests/check_dual_blind_consistency.test.js \
  tests/fixtures/dual_blind_sample.json
```

Expected: 六行檔案資訊，無 `No such file`。

- [ ] **Step 11.2：確認三 SKILL.md 升級**

```bash
for f in _agent/skills/ei_research/SKILL.md _agent/skills/ei_qst/SKILL.md _agent/skills/ei_verify/SKILL.md; do
  echo "=== $f ==="
  grep -c "自主迴圈條款" "$f"
done
```

Expected: 每份檔輸出 `1`（剛好一個段落）。

- [ ] **Step 11.3：跑監控腳本（空 tsv）**

```bash
bash scripts/g5s2_tsv_monitor.sh
```

Expected: 輸出含「資料行數：0」「（尚無資料，tsv 僅含 header）」。

- [ ] **Step 11.4：跑雙盲一致性測試**

```bash
node tests/check_dual_blind_consistency.test.js
```

Expected: `✅ All dual-blind consistency tests passed.`

- [ ] **Step 11.5：跑雙盲一致性 CLI smoke**

```bash
node scripts/check_dual_blind_consistency.js tests/fixtures/dual_blind_sample.json
```

Expected: 第 7.3 步同樣輸出，含「⚠️ 警告：TYPE-B > 5%」。

- [ ] **Step 11.6：人工驗證 Karpathy 規則**

開啟新 Cursor 視窗、Open Folder 至專案根目錄，在 Cursor Settings → Rules 確認 `karpathy-guidelines` 列在 Project Rules 且 alwaysApply 勾選。

⚠️ 此步驟需要使用者人工執行，PM（Claude Code）無法代驗。請使用者完成後在 Report 中註記「已驗證」。

---

## Task 12：產出結案 Report

**Files:**
- Create: `jobs/JOB-<NNN>-Report.md`

- [ ] **Step 12.1：寫入 Report**

用 `Write` 工具寫入 `jobs/JOB-<NNN>-Report.md`：

```markdown
# JOB-<NNN> Report — G5S2 三 Agent 流水線前置基礎建設

`last_updated`: 2026-04-26
`updated_by`: Claude Code (claude-opus-4-7)
`job_type`: docs_ops
`spec_doc`: docs/superpowers/specs/2026-04-26-G5S2-tri-agent-cursor-pipeline-design.md
`plan_doc`: docs/superpowers/plans/2026-04-26-G5S2-stage0-bootstrap.md

## 完成項目

| 動作 | 路徑 | commit |
|:--|:--|:--|
| 新增 | `.cursor/rules/karpathy-guidelines.mdc` | （Task 2.3） |
| 新增 | `jobs/g5s2_results.tsv` | （Task 3.2） |
| 新增 | `scripts/g5s2_tsv_monitor.sh` | （Task 4.4） |
| 新增 | `scripts/check_dual_blind_consistency.js` | （Task 7.4） |
| 新增 | `tests/check_dual_blind_consistency.test.js` | 同上 |
| 新增 | `tests/fixtures/dual_blind_sample.json` | 同上 |
| 修改 | `_agent/skills/ei_research/SKILL.md` | （Task 8.3）+5 行 |
| 修改 | `_agent/skills/ei_qst/SKILL.md` | （Task 9.3）+6 行 |
| 修改 | `_agent/skills/ei_verify/SKILL.md` | （Task 10.3）+5 行 |

實際 commit hash 由執行者填入此表格。

## DoD 驗收（佐證）

- [x] `.cursor/rules/karpathy-guidelines.mdc` 存在且 `alwaysApply: true` —— Task 2.2 head -5 確認
- [x] `jobs/g5s2_results.tsv` 僅 header 行 —— Task 3.1 cat -A 確認 12 欄 tab 分隔
- [x] `scripts/g5s2_tsv_monitor.sh` 可執行且輸出空訊息 —— Task 11.3 smoke test 通過
- [x] `scripts/check_dual_blind_consistency.js` 通過全部測試 —— Task 11.4 ✅
- [x] 三份 SKILL.md 各加入「自主迴圈條款」段，行數增加 ≤ 8 行 —— Task 11.2 grep -c = 1，git diff numstat ≤ 8
- [x] 所有變更已 commit，commit message 符合 Eidos 規範 —— pre-commit hook 全綠
- [x] Cursor Rules 人工驗證 —— 使用者於 Step 11.6 確認

## 遺留問題

無。階段 1（research）派工管線啟動準則：

1. 使用者執行 `node scripts/job_manager.js next` 確認下一號（記為 `<NNN+1>`）
2. 啟動新一輪 brainstorming（spec 第 12 章）→ writing-plans，產出階段 1 執行 plan
3. 階段 1 plan 涵蓋：每科每版本的 KL4 補強 JOB（共 9 單，國語可能精簡至 3）
4. 每單派工單按 spec 第 5 章 8 段骨架填寫
5. 啟動 Cursor 派工指令依 spec 第 7.1 節範本

## 真實回報本次對話的模型與花費

＄作業匯總：Token 數: - | 花費: $- | 使用模型: claude-opus-4-7 | 執行者: Claude

（依 §5.1 情境 B 大型多任務 JOB 規則，本 JOB 僅為前置 docs_ops，
真實 Token / 花費於 G5S2 流水線整體完成時統一回填。）

## ⏱️ 執行時間回報

| 子任務 / 階段 | 開始時間 | 結束時間 | 耗時（分鐘） | 備註 |
| Task 1（建單） | - | - | - | Claude Code 環境限制 |
| Task 2（mdc） | - | - | - | 同上 |
| Task 3-4（tsv + monitor） | - | - | - | 同上 |
| Task 5-7（雙盲 TDD） | - | - | - | 同上 |
| Task 8-10（三 SKILL） | - | - | - | 同上 |
| Task 11-12（驗收 + Report） | - | - | - | 同上 |
| **總計** | — | — | **-** | — |
```

- [ ] **Step 12.2：commit Report**

```bash
git add jobs/JOB-<NNN>-Report.md
git commit -m "$(cat <<'EOF'
docs: 結案 G5S2 流水線前置基礎建設，DoD 全綠

為什麼這樣做：
階段 0 六項基礎檔案 + 三 SKILL 升級全部 commit、smoke test 通過、
雙盲腳本測試 5/5 綠，Cursor Rules 人工驗證 OK；產出 Report 留下
DoD 佐證鏈，讓階段 1 派工有完整前置紀錄可追溯。

技術變更：
- 新增 jobs/JOB-<NNN>-Report.md，含 9 項變更檔表、DoD 佐證 7 項、
  階段 1 啟動準則 5 步、執行時間 / 花費依 §5 規範填 -

JOB: JOB-<NNN>

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 13：跑 `job_manager.js close` + `/pj_sync`

- [ ] **Step 13.1：跑 close 腳本**

```bash
node scripts/job_manager.js close JOB-<NNN>
```

Expected: 腳本回報「JOB-<NNN> 已結案」或類似訊息（實際以腳本行為為準）。

- [ ] **Step 13.2：執行 `/pj_sync` 同步進度文件**

呼叫 `Skill` tool 執行 `pj_sync`。Skill 會更新 `docs/進度彙整_題庫研發與產出.md`、`docs/README_專案發展紀錄.md` 等同步文件。

- [ ] **Step 13.3：commit 同步結果（如有）**

```bash
git status
# 看 /pj_sync 改了哪些檔
git add <實際被改的檔>
git commit -m "$(cat <<'EOF'
docs: pj_sync 同步 G5S2 流水線前置完成狀態

為什麼這樣做：
JOB-<NNN> 結案後，將進度彙整、發展紀錄等中央文件更新到「階段 0
已過、階段 1 待派工」狀態，讓任何下一輪對話的 PM 都能看到正確
基準。

技術變更：
- pj_sync 自動同步檔案（依 skill 輸出）

JOB: JOB-<NNN>

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

Expected: commit 成功；若 `/pj_sync` 沒改任何檔，跳過此 step。

---

## Task 14：Discord 結案摘要

- [ ] **Step 14.1：草擬 Discord 摘要文字（≤ 2000 字）**

呈現以下摘要給使用者確認：

```
🎯 JOB-<NNN> 結案：G5S2 三 Agent 流水線前置基礎建設

✅ 完成 6 項新增檔案：
- .cursor/rules/karpathy-guidelines.mdc（Cursor IDE 護欄）
- jobs/g5s2_results.tsv（量化軌跡 header）
- scripts/g5s2_tsv_monitor.sh（PM 監控腳本）
- scripts/check_dual_blind_consistency.js（雙盲分流 + 測試）
- tests/check_dual_blind_consistency.test.js
- tests/fixtures/dual_blind_sample.json

✅ 完成 3 項 SKILL 升級（每份 ≤ 8 行）：
- ei_research / ei_qst / ei_verify 加入「自主迴圈條款」

✅ Smoke Test 全綠：
- 雙盲腳本測試 5/5 ✅
- 監控腳本空 tsv 場景 ✅
- 三 SKILL 各含一段新條款 ✅

📍 下一步：使用者啟動階段 1 brainstorming（KL4 補強 9 單）
```

- [ ] **Step 14.2：等使用者「OK」後送出**

使用者確認後，呼叫 Discord MCP `send_message`（若 user-discord-relay 已啟用），或請使用者複製貼上至指定頻道。

- [ ] **Step 14.3：把 Discord 送出狀態回填 Report**

用 `Edit` 工具把 `jobs/JOB-<NNN>-Report.md` 的 Deliverables Checklist 中「Discord 摘要」項打勾。

```bash
git add jobs/JOB-<NNN>-Report.md
git commit -m "$(cat <<'EOF'
docs: 完成 JOB-<NNN> Discord 結案摘要回報

為什麼這樣做：
依 §6 結案 Discord 同步律，把摘要送到使用者指定頻道後回填 Report
打勾，作為流程閉環證據。

技術變更：
- 修改 jobs/JOB-<NNN>-Report.md，Deliverables 清單 Discord 項
  從 [ ] 改為 [x]

JOB: JOB-<NNN>

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## 階段 1-4 派工管線啟動準則（不在本 plan 內執行）

本 plan 完成後，**不直接進入階段 1**。下一輪流程：

1. 使用者啟動新對話或續對話，明確要求「啟動階段 1」
2. PM 重新呼叫 brainstorming skill，焦點為「階段 1 KL4 補強 9 單派工設計」
3. 產出階段 1 spec → 階段 1 plan
4. 階段 1 plan 含：
   - Research Agent Cursor session 啟動指令範本（spec 第 7.1）
   - 9 單派工單草稿（每科每版本一單）
   - 每單獨立 `jobs/JOB-<NNN+k>-AG-G5S2-[科目]-[版本]-research.md`
   - g5s2_results.tsv 第一批寫入規則
5. PM 一單一單草擬給使用者確認、開單、委派 Cursor 執行
6. 階段 2/3 重疊並行同理：當階段 1 該課過閘 → 該課可進階段 2 → 過閘 → 階段 3

**禁止**在本 plan 執行期間：
- 開立任何階段 1-4 的 JOB
- 執行 `auto_generate_questions.js` 或 `run_blind_eval.js`
- 動 `question/platform/G5/S2/` 下任何 JSON

---

## Self-Review（本 plan 自我檢查）

### Spec 覆蓋

| Spec 章節 | 對應 Plan Task | 覆蓋 |
|:--|:--|:-:|
| 第 6.2 節 #1 mdc | Task 2 | ✅ |
| 第 6.2 節 #5 tsv | Task 3 | ✅ |
| 第 6.2 節 #6 monitor | Task 4 | ✅ |
| 第 6.2 節 #7 雙盲腳本 | Task 5-7 | ✅ |
| 第 6.2 節 #2 ei_research | Task 8 | ✅ |
| 第 6.2 節 #3 ei_qst | Task 9 | ✅ |
| 第 6.2 節 #4 ei_verify | Task 10 | ✅ |
| 第 6.3 節 docs_ops 派工 | Task 1 | ✅ |
| 第 9.4 節雙盲偽碼 | Task 7 實作 | ✅ |
| 第 12 章後續實作 | 階段 1-4 啟動準則 | ✅ |
| 第 11.1 節 L2 雙盲 | Task 7 + Task 10 | ✅ |
| 第 11.2 節不確定性聲明 | 不在本 plan 範圍（屬階段 1 之前置 ls 復檢） | — |

階段 1-4 由各自 plan 處理，本 plan 不需覆蓋。

### Placeholder 掃描

- [x] 無 TBD / TODO / 「implement later」字樣
- [x] 每個 step 有具體代碼或指令
- [x] 「JOB-<NNN>」屬有意佔位符（Task 1.1 跑腳本後一次性替換），有明確替換指令
- [x] 「實際 commit hash 由執行者填入」屬合理留空（執行時才有 hash）

### Type 一致性

- [x] `analyzeDualBlind` / `classifyQuestion`：所有 Task（6/7/11）一致
- [x] `result.questions` / `result.summary` 結構：測試與實作對齊
- [x] `mtp_type` 值集 `{null, 'A', 'B', 'C'}`：測試與實作一致
- [x] `status` 值集 `{keep, discard, manual_review}`：與 spec §9.1 tsv schema status 子集一致（注意：tsv schema 還有 `crash`/`retry`/`partial`/`β+_keep`，這些由 agent 階段寫入，本腳本不直接產生）

無不一致。

---

**Plan 完成。Implementation Plan 路徑：`docs/superpowers/plans/2026-04-26-G5S2-stage0-bootstrap.md`。**
