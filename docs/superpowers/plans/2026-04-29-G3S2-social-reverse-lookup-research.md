# G3S2 社會 反推法 KL2-KL4 研究 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 落地 JOB-215 Phase 2 — 用反推法產出三下社會三版本 KL2/KL3/KL4 高品質研究素材（17 課 × 2 = 34 個 KL4 雙檔 + 1 KL3 v2 + 1 KL2 新章節）。

**Architecture:** 三階段嚴格阻塞流水線（多 Agent 反推 → PM 改 KL3 → 多 Agent 寫 KL4 → PM 補 KL2），套用 JOB-214 五元件外殼追蹤進度，使用 Cursor agent CLI 並行執行 (sonnet 4.6)，PM 介入點切 Opus 4.7。

**Tech Stack:** Cursor agent CLI / Bash / Python 3.11 / Node.js (job_manager.js) / Git / TSV / mcp discord

**Spec 來源:** `docs/superpowers/specs/2026-04-29-G3S2-social-reverse-lookup-research-design.md` v1.0.0

**注意事項：**
- 所有 JOB 編號用 `JOB-AAA` ~ `JOB-III` 共 9 個佔位符；實際號碼在 Task 1 跑 `job_manager.js next` 取得後，**逐個 task 替換**為真實號（不一次性 sed，因為 next 號每跑一次會變）
- 本 plan 涉及 9 個獨立 JOB，分階段開立（不一次全開，因為各階段有依賴）
- 三階段嚴格阻塞：Phase 0 → Phase 2a 三 agent 全 keep → Phase 2b → Phase 2c 三 agent 全 keep → Phase 2d
- 不在 main 分支直接 commit 高風險變更；改寫 KL3/KL2 時先 commit 一次「備份原版」標籤

---

## File Structure（一覽）

| 階段 | 動作 | 路徑 | 責任 |
|:--|:--|:--|:--|
| 0 | 新增 | `jobs/JOB-AAA-progress.tsv` | 9 階段量化軌跡 header only |
| 0 | 新增 | `scripts/JOB-AAA-progress-dashboard.sh` | TSV 進度監控腳本 |
| 0 | 新增 | `scripts/orchestrator-logs/` | log 收集目錄（已存在則跳過） |
| 0 | 新增 | `jobs/JOB-AAA-AG-G3S2-社會-反推研究-基礎建設.md` | docs_ops 派工單 |
| 0 | 新增 | `jobs/JOB-AAA-Report.md` | 階段 0 結案 |
| 2a | 新增 | `jobs/JOB-BBB-AG-G3S2-社會-翰林-考古題反推.md` | research 派工單 |
| 2a | 新增 | `jobs/JOB-CCC-AG-G3S2-社會-康軒-考古題反推.md` | research 派工單 |
| 2a | 新增 | `jobs/JOB-DDD-AG-G3S2-社會-南一-考古題反推.md` | research 派工單 |
| 2a | 新增 | `knowledge/1_課綱研究/社會/三下/_reports/翰林_考古題彙整報告.md` | 2a 翰林產出 |
| 2a | 新增 | `knowledge/1_課綱研究/社會/三下/_reports/康軒_考古題彙整報告.md` | 2a 康軒產出 |
| 2a | 新增 | `knowledge/1_課綱研究/社會/三下/_reports/南一_考古題彙整報告.md` | 2a 南一產出 |
| 2a | 新增 | 三份 `JOB-XXX-Report.md` | 2a 結案 |
| 2b | 新增 | `jobs/JOB-EEE-AG-G3S2-社會-KL3改寫.md` | research 派工單（PM 親跑）|
| 2b | 修改 | `knowledge/1_課綱研究/社會/KL3_三下_社會_研究總綱.md` | v1 → v2 |
| 2b | 新增 | `jobs/JOB-EEE-Report.md` | 2b 結案 |
| 2c | 新增 | `jobs/JOB-FFF-AG-G3S2-社會-翰林-KL4產出.md` | research 派工單 |
| 2c | 新增 | `jobs/JOB-GGG-AG-G3S2-社會-康軒-KL4產出.md` | research 派工單 |
| 2c | 新增 | `jobs/JOB-HHH-AG-G3S2-社會-南一-KL4產出.md` | research 派工單 |
| 2c | 修改 | `knowledge/1_課綱研究/社會/三下/翰林/KL4_*` 12 檔 | RM0 → RM3 |
| 2c | 新增 | `knowledge/1_課綱研究/社會/三下/康軒/KL4_*` 12 檔（新建目錄） | 從零 → RM3 |
| 2c | 修改 | `knowledge/1_課綱研究/社會/三下/南一/KL4_*` 10 檔 | L5 升級 + L1-4 從零 |
| 2c | 新增 | 三份 `JOB-XXX-Report.md` | 2c 結案 |
| 2d | 新增 | `jobs/JOB-III-AG-G3S2-社會-KL2補強.md` | research 派工單（PM 親跑）|
| 2d | 修改 | `knowledge/1_課綱研究/社會/KL2_社會科共同發展總綱.md` | 補新章節 |
| 2d | 新增 | `jobs/JOB-III-Report.md` | 2d 結案 |

---

## Phase 0：基礎建設（docs_ops，1 JOB，估 0.5 天）

### Task 1：取得 JOB-AAA + 草擬派工單給使用者確認

**Files:**
- Read: `scripts/job_manager.js`（驗證腳本可用性）

- [ ] **Step 1.1：跑 `job_manager.js next` 取得下一號**

```bash
node scripts/job_manager.js next
```

把建議下一號記為 `<AAA>`。

- [ ] **Step 1.2：對話中草擬派工單給使用者確認**

呈現以下完整草稿：

````markdown
*Created by Claude Code at 2026-04-29*

`last_updated`: 2026-04-29
`updated_by`: Claude Code (claude-sonnet-4-6)

# JOB-<AAA>-AG-G3S2-社會-反推研究-基礎建設

**`job_type`**：`docs_ops`
**`executor`**：Claude Code (claude-sonnet-4-6)
**`spec_doc`**: docs/superpowers/specs/2026-04-29-G3S2-social-reverse-lookup-research-design.md
**`plan_doc`**: docs/superpowers/plans/2026-04-29-G3S2-social-reverse-lookup-research.md
**`parent_jobs`**: JOB-215 Phase 2

## 📌 任務背景

JOB-215 Phase 2 反推法落地需要五元件外殼（依 JOB-214 範本）。本 JOB 建 progress TSV、dashboard 腳本、log 目錄，給後續 8 個 JOB 用。

## 🎯 任務目標

完成後達到：
1. `jobs/JOB-<AAA>-progress.tsv` 建好（header only，12 欄 tab 分隔）
2. `scripts/JOB-<AAA>-progress-dashboard.sh` 可執行
3. `scripts/orchestrator-logs/` 確認存在
4. dashboard smoke test 過（空 tsv 場景）

## 🚧 任務邊界

只做：建 4 項基礎檔。
不做：開階段 2a-2d 任何 JOB；不修題庫；不動 spec / plan。

## 📖 執行步驟

依 plan Task 2-5。

## ✅ 啟動 Checklist (Pre-Flight)

- [ ] 已讀 spec v1.0.0 第八章
- [ ] 已讀 plan File Structure
- [ ] 已讀 docs/長時任務執行範本.md §三

## ✅ 驗收 Checklist (Acceptance)

- [ ] `jobs/JOB-<AAA>-progress.tsv` 存在且只有 header 行（12 欄）
- [ ] `scripts/JOB-<AAA>-progress-dashboard.sh` 存在且 +x
- [ ] dashboard smoke test 通過（空 tsv 顯示「尚無資料」）
- [ ] `scripts/orchestrator-logs/` 存在

## ✅ 成果 Checklist (Deliverables)

- [ ] `jobs/JOB-<AAA>-Report.md` 產出
- [ ] `node scripts/job_manager.js close JOB-<AAA>`
- [ ] Discord chat_id `1487738477608177714` 結案回報

## 真實回報本次對話的模型與花費

＄作業匯總：Token數:- | 花費: $- | 使用模型: claude-sonnet-4-6 | 執行者: Claude
````

**等使用者明確回應「LGTM」「確認」「開始」之一才進 Step 1.3。**

- [ ] **Step 1.3：跑 `job_manager.js create` 開單**

```bash
node scripts/job_manager.js create "G3S2-社會-反推研究-基礎建設" AG docs_ops
```

Expected: 產出 `jobs/JOB-<AAA>-AG-G3S2-社會-反推研究-基礎建設.md`

- [ ] **Step 1.4：把 Step 1.2 草稿寫入派工單**

用 `Write` 工具覆蓋 `jobs/JOB-<AAA>-AG-*.md`。

- [ ] **Step 1.5：commit 派工單**

```bash
git add "jobs/JOB-<AAA>-AG-G3S2-社會-反推研究-基礎建設.md"
git commit -m "chore: 開立 JOB-<AAA> 反推研究基礎建設派工單

為什麼這樣做：
JOB-215 Phase 2 落地需要五元件外殼，本 JOB 建 progress TSV/dashboard/
log 目錄供後續 8 個 JOB 用，符合 §3.4 幽靈 Report 防止規定。

技術變更：
- 新增 jobs/JOB-<AAA>-AG-G3S2-社會-反推研究-基礎建設.md
- job_type: docs_ops、依 spec 第 8 章與 plan Task 2-5 執行

JOB: JOB-<AAA>"
```

---

### Task 2：建立 progress.tsv（header only）

**Files:**
- Create: `jobs/JOB-<AAA>-progress.tsv`

- [ ] **Step 2.1：寫入 tsv 檔（tab 分隔）**

用 `Write` 工具寫入 `jobs/JOB-<AAA>-progress.tsv`：

```tsv
commit	phase	subject	publisher	lesson	CQI-P	CQI-V	Match%	RM	status	desc	ts
```

**注意每欄之間是 tab 字元（`\t`），不是空格。**

- [ ] **Step 2.2：驗證 tab 分隔**

```bash
cat -A "jobs/JOB-<AAA>-progress.tsv" | head -1
```

Expected: 看到 `commit^Iphase^Isubject^I...`（`^I` 為 tab）

- [ ] **Step 2.3：commit**

```bash
git add "jobs/JOB-<AAA>-progress.tsv"
git commit -m "chore: 建立 JOB-<AAA> progress.tsv（5 階段量化軌跡）

為什麼這樣做：
spec 第 8.2 節定義以 autoresearch 風格 tsv 紀錄三階段每課推進結果，
讓 PM 即時看戰報、不靠 cursor 自述進度。本 commit 建立空檔頭，
之後 2a/2b/2c/2d agent 寫入。

技術變更：
- 新增 jobs/JOB-<AAA>-progress.tsv，僅 header 行（12 欄 tab 分隔）

JOB: JOB-<AAA>"
```

---

### Task 3：建立 dashboard 腳本

**Files:**
- Create: `scripts/JOB-<AAA>-progress-dashboard.sh`

- [ ] **Step 3.1：寫入 dashboard 腳本**

用 `Write` 工具寫入 `scripts/JOB-<AAA>-progress-dashboard.sh`：

```bash
#!/bin/bash
# JOB-<AAA> progress dashboard（spec 第 8.3 節）
# 用法：bash scripts/JOB-<AAA>-progress-dashboard.sh
TSV="jobs/JOB-<AAA>-progress.tsv"

if [[ ! -f "$TSV" ]]; then
  echo "錯誤：$TSV 不存在"
  exit 1
fi

LINE_COUNT=$(awk 'NR>1' "$TSV" | wc -l | tr -d ' ')

echo "=== JOB-<AAA> 三下社會反推研究進度 ($(date '+%Y-%m-%d %H:%M:%S')) ==="
echo "資料行數：$LINE_COUNT"
echo

if [[ "$LINE_COUNT" -eq 0 ]]; then
  echo "（尚無資料，tsv 僅含 header）"
  exit 0
fi

echo "📈 各 phase 進度："
awk -F'\t' 'NR>1{print $2}' "$TSV" | sort | uniq -c | sort -rn
echo

echo "📊 各 publisher × status 矩陣："
awk -F'\t' 'NR>1 {a[$4 "_" $10]++} END {for (k in a) print "  "k": "a[k]}' "$TSV" | sort
echo

echo "⚠️  manual_review / crash 待處理："
awk -F'\t' 'NR>1 && ($10=="manual_review" || $10=="crash") {print "  "$2"/"$4"/"$5": "$11}' "$TSV"
echo

echo "🔥 最新 5 筆："
tail -n 5 "$TSV" | column -t -s $'\t'
```

- [ ] **Step 3.2：賦予執行權限**

```bash
chmod +x "scripts/JOB-<AAA>-progress-dashboard.sh"
```

- [ ] **Step 3.3：smoke test（空 tsv 場景）**

```bash
bash "scripts/JOB-<AAA>-progress-dashboard.sh"
```

Expected:
```
=== JOB-<AAA> 三下社會反推研究進度 (...) ===
資料行數：0

（尚無資料，tsv 僅含 header）
```

- [ ] **Step 3.4：commit**

```bash
git add "scripts/JOB-<AAA>-progress-dashboard.sh"
git commit -m "chore: 建立 JOB-<AAA> dashboard 腳本

為什麼這樣做：
spec 第 8.3 節要求 dashboard 顯示「各 phase 進度 + publisher × status
矩陣 + 最新 5 筆」，PM 在五階段流水線中靠這個即時看戰報。

技術變更：
- 新增 scripts/JOB-<AAA>-progress-dashboard.sh，含三類統計
- chmod +x

JOB: JOB-<AAA>"
```

---

### Task 4：確認 orchestrator-logs 目錄存在

- [ ] **Step 4.1：確認目錄**

```bash
ls -la scripts/orchestrator-logs/ 2>/dev/null || mkdir -p scripts/orchestrator-logs/
```

Expected: 目錄存在（不存在則建立）

- [ ] **Step 4.2：建 .gitkeep（若不存在）**

```bash
[ -f scripts/orchestrator-logs/.gitkeep ] || touch scripts/orchestrator-logs/.gitkeep
git add scripts/orchestrator-logs/.gitkeep 2>/dev/null
git diff --cached --name-only | grep -q "orchestrator-logs/.gitkeep" && \
  git commit -m "chore: 確保 scripts/orchestrator-logs/ 進 git

為什麼這樣做：
五階段流水線各 Cursor agent 的 stdout 都送到此目錄，PM 用 grep/tail
監控；目錄需進 git 但 log 內容用 .gitignore 排除。

JOB: JOB-<AAA>" || echo "目錄已存在 .gitkeep，跳過"
```

---

### Task 5：階段 0 結案（Report + close + Discord）

**Files:**
- Create: `jobs/JOB-<AAA>-Report.md`

- [ ] **Step 5.1：寫入 Report**

用 `Write` 工具寫入 `jobs/JOB-<AAA>-Report.md`：

```markdown
`last_updated`: 2026-04-29
`updated_by`: Claude Code (claude-sonnet-4-6)

# JOB-<AAA> Report — G3S2 社會反推研究基礎建設

**執行者**：Claude Code (claude-sonnet-4-6)
**執行日期**：2026-04-29
**job_type**：docs_ops

---

## ✅ 驗收 Checklist

| 驗收項目 | 結果 | 佐證 |
|:--|:--:|:--|
| progress.tsv 存在且 header 12 欄 | ✅ | `cat -A` 確認 tab 分隔 |
| dashboard 腳本可執行 | ✅ | `bash dashboard` 輸出「尚無資料」 |
| orchestrator-logs/ 存在 | ✅ | `ls -la` 確認 |

## 📋 異動清單

- 新增 `jobs/JOB-<AAA>-AG-G3S2-社會-反推研究-基礎建設.md`
- 新增 `jobs/JOB-<AAA>-progress.tsv`（header only）
- 新增 `scripts/JOB-<AAA>-progress-dashboard.sh`
- 確保 `scripts/orchestrator-logs/.gitkeep` 存在

## 📌 遺留問題

無。後續 Phase 2a 派工管線啟動準則：

1. 取下一個 JOB 號（翰林 reverse-lookup）
2. 草擬派工單對話確認
3. 開單 + 寫內容
4. cursor agent 派遣 + 排 wakeup

## 💰 花費回報

＄作業匯總：Token數:- | 花費: $- | 使用模型: claude-sonnet-4-6 | 執行者: Claude
```

- [ ] **Step 5.2：commit Report**

```bash
git add "jobs/JOB-<AAA>-Report.md"
git commit -m "docs: 結案 JOB-<AAA> 反推研究基礎建設

技術變更：
- 新增 jobs/JOB-<AAA>-Report.md
- DoD 全綠：progress.tsv / dashboard / orchestrator-logs

JOB: JOB-<AAA>"
```

- [ ] **Step 5.3：跑 close + /pj_sync**

```bash
node scripts/job_manager.js close JOB-<AAA>
```

呼叫 Skill tool 執行 `pj_sync`。

- [ ] **Step 5.4：Discord 結案回報**

呼叫 `mcp__plugin_discord_discord__reply` 送到 chat_id `1487738477608177714`：

```
🎯 JOB-<AAA> 結案：G3S2 社會反推研究基礎建設

✅ 三項基礎建設完成：
- jobs/JOB-<AAA>-progress.tsv（5 階段量化軌跡 header）
- scripts/JOB-<AAA>-progress-dashboard.sh
- scripts/orchestrator-logs/

📍 下一步：開立 Phase 2a 三個 cursor agent JOB（翰林/康軒/南一）
```

---

## Phase 2a：多 Agent 反推考古題（research × 3，估 1-2 天）

### Task 6：草擬 Phase 2a 三份派工單（一次過給使用者確認）

- [ ] **Step 6.1：跑 next 三次取連號**

```bash
# 先跑一次拿到下一號
node scripts/job_manager.js next
```

記下三個連號 `<BBB>`（翰林）、`<CCC>`（康軒）、`<DDD>`（南一）。

- [ ] **Step 6.2：草擬翰林派工單給使用者確認**

呈現完整草稿（將下方 `<VERSION>` 替換為「翰林」、`<MD_COUNT>` 替換為 30）：

````markdown
*Created by Claude Code at 2026-04-29*

`last_updated`: 2026-04-29
`updated_by`: Claude Code (claude-sonnet-4-6)

# JOB-<BBB>-AG-G3S2-社會-翰林-考古題反推

**`job_type`**：`research`
**`executor`**：Cursor (model: claude-sonnet-4-6)
**`spec_doc`**: docs/superpowers/specs/2026-04-29-G3S2-social-reverse-lookup-research-design.md
**`plan_doc`**: docs/superpowers/plans/2026-04-29-G3S2-social-reverse-lookup-research.md
**`parent_jobs`**: JOB-<AAA>（基礎建設）/ JOB-215 Phase 2

## 📌 任務背景

JOB-213 已將翰林 30 份考古題轉成 MD（`knowledge/3_考古題/2_MD淬鍊文字/三下/三下_社會_翰林/`）。
本任務由 Cursor agent 讀全部 30 份 → 按課歸類 → 淬鍊每課出題方向，產出
《翰林 三下社會 考古題彙整報告》供 Phase 2b PM 改寫 KL3 用。

## 🎯 任務目標

完成《翰林 三下社會 考古題彙整報告》達 B 完整版 DoD：
- 字數 ≥ 5,000
- 逐題分類表完整（30 份 MD 所有題）
- 6 課（L1-L6）逐課深度分析
- 每課迷思矩陣 ≥ 5 條
- 達標檢核：每課題數 / 來源數明確

## 🚧 任務邊界

只做：讀 30 份翰林 MD → 寫一份彙整報告。
不做：改 KL3 / KL4（後續階段）；不動康軒/南一 MD。

## 📖 執行步驟

詳見 spec §4.1 prompt 骨架與 §4.2 報告結構規格。

## 📜 關鍵參考檔案

| 檔案路徑 | 用途 |
|:--|:--|
| `knowledge/3_考古題/2_MD淬鍊文字/三下/三下_社會_翰林/` | 30 份 MD 來源 |
| `knowledge/1_課綱研究/社會/KL3_三下_社會_研究總綱.md` | 翰林 6 課課名 |
| `knowledge/3_考古題/README.md` | 考古題鐵律 + 課次分類準則 |
| `knowledge/README_研究架構總綱.md` | v4.5（量化 DoD 含考古題與討論） |

## ✅ 啟動 Checklist (Pre-Flight)

- [ ] 已讀 spec §2.2 B 路徑、§4 階段 2a 詳細設計
- [ ] 已讀 KL3 翰林 6 課課名清單
- [ ] 已 ls 確認 30 份 MD 路徑

## ✅ 驗收 Checklist (Acceptance)

- [ ] 報告字數 ≥ 5,000（`wc -m`）
- [ ] 逐題分類表覆蓋 30 份 MD
- [ ] 6 課皆有獨立深度分析節
- [ ] 每課迷思矩陣 ≥ 5 條
- [ ] 達標檢核明確（每課題數 + 來源學校數）
- [ ] β+ 標記課次列出（若有）

## ✅ 成果 Checklist (Deliverables)

- [ ] `knowledge/1_課綱研究/社會/三下/_reports/翰林_考古題彙整報告.md` 產出
- [ ] `jobs/JOB-<AAA>-progress.tsv` 寫入 6 行（每課一行）
- [ ] `jobs/JOB-<BBB>-Report.md` 產出
- [ ] `node scripts/job_manager.js close JOB-<BBB>`
- [ ] Discord 結案回報

## 真實回報本次對話的模型與花費

＄作業匯總：Token數:- | 花費: $- | 使用模型: claude-sonnet-4-6 | 執行者: Cursor
````

- [ ] **Step 6.3：對使用者呈現「同模板，康軒 / 南一兩份照樣稿」**

說明：

```
康軒派工單與翰林相同，差異僅：
  - JOB 號改為 <CCC>
  - 版本改為「康軒」
  - MD 數改為 51
  - 課數改為 6（L1-L6）

南一派工單差異：
  - JOB 號改為 <DDD>
  - 版本改為「南一」
  - MD 數改為 24
  - 課數改為 5（L1-L4 + 探究 L5「打造幸福的家園」）
```

- [ ] **Step 6.4：等使用者「LGTM」三份一起核准**

只要使用者一句「OK」/「LGTM」，三份一起進 Task 7。

---

### Task 7：建翰林派工單 + 派 Cursor agent

- [ ] **Step 7.1：開單**

```bash
node scripts/job_manager.js create "G3S2-社會-翰林-考古題反推" AG research
```

- [ ] **Step 7.2：寫入派工單內容**

用 `Write` 工具把 Task 6.2 草稿（翰林版）寫入 `jobs/JOB-<BBB>-AG-*.md`。

- [ ] **Step 7.3：commit 派工單**

```bash
git add "jobs/JOB-<BBB>-AG-G3S2-社會-翰林-考古題反推.md"
git commit -m "chore: 開立 JOB-<BBB> 翰林考古題反推派工單

JOB: JOB-<BBB>"
```

- [ ] **Step 7.4：派 Cursor agent**

```bash
mkdir -p knowledge/1_課綱研究/社會/三下/_reports/

cursor agent --print --yolo --workspace . --model claude-sonnet-4-6 \
  "[Research Agent - 三下社會 翰林 考古題反推]

   📚 必讀：
     1. docs/superpowers/specs/2026-04-29-G3S2-social-reverse-lookup-research-design.md（§4 是你的詳細指示）
     2. jobs/JOB-<BBB>-AG-G3S2-社會-翰林-考古題反推.md（本任務）
     3. knowledge/README_研究架構總綱.md（v4.5）
     4. knowledge/3_考古題/README.md
     5. knowledge/1_課綱研究/社會/KL3_三下_社會_研究總綱.md

   🎯 任務：
     讀 knowledge/3_考古題/2_MD淬鍊文字/三下/三下_社會_翰林/ 下 30 份 MD
     → 每題標 lesson（L1~L6 / ambiguous）
     → 淬鍊每課出題方向 + 迷思矩陣（≥5 條）
     → 產出 knowledge/1_課綱研究/社會/三下/_reports/翰林_考古題彙整報告.md

   📋 報告章節（依 spec §4.2）：
     第一節 概覽
     第二節 逐題分類表
     第三節 逐課深度分析（每課 5 個子節：題目清單/出題方向統計/跨年度頻率/誘答機制統計/迷思矩陣）
     第四節 達標檢核
     第五節 給 PM 的建議

   🔁 自主迴圈：
     for 每課 L1~L6:
       1. 抽出該課題目（明確含該課專屬詞彙）
       2. 寫第三節對應子節
       3. 寫一行至 jobs/JOB-<AAA>-progress.tsv:
          \$commit\\t2a\\tSocial\\tHanLin\\t\$lesson\\t-\\t-\\t-\\tRM2\\t\$status\\t\$desc\\t\$ts
     直到 6 課全完，git commit + 寫整體報告

   ⛔ 退件條件：
     - 某課題數 < 5 → 標 β+_keep + 報告寫入「來源稀缺警告」
     - MD 讀失敗連 5 次 → crash 停下
     - 課次信心 <60% 占比 >30% → manual_review

   ✅ 完成條件：
     - 報告字數 ≥ 5,000
     - 6 課皆有迷思矩陣 ≥ 5 條
     - progress.tsv 寫入 6 行" \
  > scripts/orchestrator-logs/JOB-<BBB>-翰林-反推.log 2>&1 &

echo "翰林 cursor agent PID: $!"
```

- [ ] **Step 7.5：記下 PID + log 路徑（寫入派工單）**

用 `Edit` 工具在派工單中加上一行：

```markdown
> Dispatched at 2026-04-29 HH:MM, PID=<PID>, log=scripts/orchestrator-logs/JOB-<BBB>-翰林-反推.log
```

---

### Task 8：建康軒派工單 + 派 Cursor agent

依 Task 7 模式，差異：
- JOB 號 `<CCC>`
- create 時 name = `G3S2-社會-康軒-考古題反推`
- 派工單 MD 數 51、版本「康軒」
- cursor prompt 路徑改為 `三下_社會_康軒/`、報告檔名 `康軒_考古題彙整報告.md`、PUBLISHER `KangHsuan`

- [ ] **Step 8.1～8.5：同 Task 7 全部步驟，逐項執行（康軒）**

---

### Task 9：建南一派工單 + 派 Cursor agent

依 Task 7 模式，差異：
- JOB 號 `<DDD>`
- name = `G3S2-社會-南一-考古題反推`
- 派工單 MD 數 24、版本「南一」、課數 5
- cursor prompt 路徑改為 `三下_社會_南一/`、報告檔名 `南一_考古題彙整報告.md`、PUBLISHER `NanYi`、課次 L1-L4 + 探究 L5

- [ ] **Step 9.1～9.5：同 Task 7 全部步驟，逐項執行（南一）**

---

### Task 10：排第一次 wakeup + 第一次 Discord 啟動通知

- [ ] **Step 10.1：發 Discord 啟動通知**

呼叫 `mcp__plugin_discord_discord__reply` 送到 chat_id `1487738477608177714`：

```
🚀 Phase 2a 啟動：三下社會考古題反推

三 cursor agent 並行：
- JOB-<BBB> 翰林（30 MD，PID=<P1>）
- JOB-<CCC> 康軒（51 MD，PID=<P2>）
- JOB-<DDD> 南一（24 MD，PID=<P3>）

預估 1-2 天，每 60 min 自動回報進度。
```

- [ ] **Step 10.2：用 ScheduleWakeup 排 60 min wakeup**

呼叫 `ScheduleWakeup` tool：
- delaySeconds: 3600
- prompt: 沿用 `scripts/templates/wakeup_prompt.md` 模板，替換 5 個 placeholder：
  - `<DASHBOARD_SCRIPT>`: `bash scripts/JOB-<AAA>-progress-dashboard.sh`
  - `<PID>`: 三個 PID 列出
  - `<BATCH_KEYWORD>`: 「進度」（cursor agent log 中關鍵字）
  - `<LOG_PATH>`: 三個 log 路徑列出
- reason: "Phase 2a 三 cursor agent 啟動，60 min 後查進度"

---

### Task 11：Phase 2a 完成驗收（嚴格阻塞閘）

> **觸發條件**：當三個 agent 都產出報告並寫完 6 行 progress 後（dashboard 顯示 18 行 phase=2a 且全 status 為 keep / β+_keep），執行本 Task。

- [ ] **Step 11.1：跑 dashboard 確認三 agent 全完**

```bash
bash "scripts/JOB-<AAA>-progress-dashboard.sh"
```

Expected: 各 phase 顯示 `2a: 18`，狀態分布僅含 `keep / β+_keep`，無 `crash / manual_review`。

若有 `manual_review` 或 `crash` → 停下，PM 介入處理（不進 Phase 2b）。

- [ ] **Step 11.2：驗收三份報告字數**

```bash
for v in 翰林 康軒 南一; do
  count=$(wc -m < "knowledge/1_課綱研究/社會/三下/_reports/${v}_考古題彙整報告.md")
  echo "$v: $count 字元"
done
```

Expected: 三份均 ≥ 5,000 字元（`wc -m` 計中文字元）。

若有不達標 → 退件對應 cursor agent，使用者裁定（補強或降標）。

- [ ] **Step 11.3：驗收三份報告結構**

```bash
for v in 翰林 康軒 南一; do
  echo "=== $v ==="
  grep -c "^### " "knowledge/1_課綱研究/社會/三下/_reports/${v}_考古題彙整報告.md"
done
```

Expected: 翰林/康軒 ≥ 30 個 `### ` 標題（6 課 × 5 子節）；南一 ≥ 25 個。

- [ ] **Step 11.4：抽樣驗收（人工，使用者確認）**

呈現給使用者：

```
請從三份報告各挑 1 課抽查：
- 該課的迷思矩陣是否 ≥5 條？
- 是否每條附對應考古題？
- 誘答機制統計是否實質（非空話）？

抽查後告知 OK 或要補強。
```

等使用者「OK」後進 Task 12。

---

### Task 12：Phase 2a 三 JOB 結案

- [ ] **Step 12.1：寫三份 Report（翰林）**

用 `Write` 工具寫入 `jobs/JOB-<BBB>-Report.md`：

```markdown
`last_updated`: 2026-04-29
`updated_by`: Cursor (claude-sonnet-4-6)

# JOB-<BBB> Report — G3S2 社會 翰林 考古題反推

**執行者**：Cursor (claude-sonnet-4-6)
**job_type**：research

## ✅ 驗收

| 項目 | 結果 | 佐證 |
|:--|:--:|:--|
| 報告字數 ≥ 5,000 | （填實際數）| `wc -m` |
| 6 課深度分析 | （填筆數）| `grep "^### " 報告 \| wc -l` |
| 迷思矩陣 ≥ 5 條/課 | （填）| 人工抽查 OK |
| progress.tsv 6 行 | ✅ | grep 翰林 6 筆 |

## 異動清單
- 新增 `knowledge/1_課綱研究/社會/三下/_reports/翰林_考古題彙整報告.md`
- 寫入 `jobs/JOB-<AAA>-progress.tsv` 6 行（phase=2a, publisher=HanLin）

＄作業匯總：Token數:- | 花費: $- | 使用模型: claude-sonnet-4-6 | 執行者: Cursor
```

- [ ] **Step 12.2：寫康軒 / 南一 Report（同模式）**

依模板寫 `JOB-<CCC>-Report.md` 與 `JOB-<DDD>-Report.md`。

- [ ] **Step 12.3：commit 三份 Report**

```bash
git add "jobs/JOB-<BBB>-Report.md" "jobs/JOB-<CCC>-Report.md" "jobs/JOB-<DDD>-Report.md" \
        "knowledge/1_課綱研究/社會/三下/_reports/"
git commit -m "docs: 結案 Phase 2a 三 JOB（翰林/康軒/南一考古題反推）

技術變更：
- 新增三份《[版本] 考古題彙整報告》
- 三 JOB Report 完成

JOB: JOB-<BBB> JOB-<CCC> JOB-<DDD>"
```

- [ ] **Step 12.4：close 三 JOB**

```bash
node scripts/job_manager.js close JOB-<BBB>
node scripts/job_manager.js close JOB-<CCC>
node scripts/job_manager.js close JOB-<DDD>
```

- [ ] **Step 12.5：Discord 結案**

```
🎯 Phase 2a 結案：三下社會考古題反推

✅ 三份《[版本] 考古題彙整報告》產出：
- 翰林（30 MD → N 字）
- 康軒（51 MD → N 字）
- 南一（24 MD → N 字）

📍 嚴格阻塞通過 → 進 Phase 2b（PM 改寫 KL3，使用者請切 Opus 4.7）
```

---

## Phase 2b：PM 改寫 KL3（research，1 JOB，估 0.5 天）

### Task 13：使用者切 Opus 4.7 + 草擬派工單

- [ ] **Step 13.1：呈現切換指示**

```
⚠️ 階段 2b 是 logic-heavy 工作（三分類比對 + KL3 改寫）。
請使用者執行：/model opus
切換完成後告知，繼續 Step 13.2。
```

等使用者切換完成回應「已切換」/「OK」。

- [ ] **Step 13.2：跑 next 取 JOB-<EEE>**

```bash
node scripts/job_manager.js next
```

- [ ] **Step 13.3：草擬派工單給使用者確認**

呈現：

````markdown
*Created by Claude Code at 2026-04-29*

`last_updated`: 2026-04-29
`updated_by`: Claude Code (claude-opus-4-7)

# JOB-<EEE>-AG-G3S2-社會-KL3改寫

**`job_type`**：`research`（PM 親跑）
**`executor`**：Claude Code (claude-opus-4-7) PM 親跑（使用者授權例外，logic-heavy）
**`spec_doc`**: docs/superpowers/specs/2026-04-29-G3S2-social-reverse-lookup-research-design.md
**`parent_jobs`**: JOB-<BBB> / JOB-<CCC> / JOB-<DDD>（三份彙整報告）

## 📌 任務背景

Phase 2a 已產出三份《[版本] 考古題彙整報告》。原 KL3_三下_社會_研究總綱.md（v1，
JOB-212 從素材庫推測版本）需依考古題佐證重新驗證並改寫，產出 v2 考古題佐證版。

## 🎯 任務目標

完成 KL3_三下_社會_研究總綱.md v2：
- 字數 ≥ 4,000（原 v1 ~3,000）
- 每節三分類標籤（有佐證 / 無佐證 / 矛盾）
- 跨版本共通迷思新節（高頻迷思 ≥ 3 條）
- 三版本獨特出題方向新節（每版本 ≥ 2 條）
- frontmatter 標 version: 2.0

## 🚧 任務邊界

只做：改寫 KL3 v1 → v2。
不做：寫 KL4 / 補 KL2（後續階段）；不動三份彙整報告。

## 📖 執行步驟

依 spec §5.2 三分類動作四步：
1. 拆原 KL3 成節
2. 對每節做三分類比對
3. 改寫（保留/降級/改寫）
4. 補新節（跨版本共通迷思 + 三版本獨特出題方向）

## 📜 關鍵參考檔案

| 檔案路徑 | 用途 |
|:--|:--|
| `knowledge/1_課綱研究/社會/KL3_三下_社會_研究總綱.md` | 原 v1（待改寫） |
| `knowledge/1_課綱研究/社會/三下/_reports/翰林_考古題彙整報告.md` | 翰林佐證 |
| `knowledge/1_課綱研究/社會/三下/_reports/康軒_考古題彙整報告.md` | 康軒佐證 |
| `knowledge/1_課綱研究/社會/三下/_reports/南一_考古題彙整報告.md` | 南一佐證 |
| `jobs/_JOB-TEMPLATE-research-KL3.md` | KL3 模板（量化 DoD 參考） |

## ✅ 啟動 Checklist (Pre-Flight)

- [ ] 已切換到 Opus 4.7
- [ ] 已讀 spec §5
- [ ] 已讀三份彙整報告
- [ ] 已讀原 KL3 v1

## ✅ 驗收 Checklist (Acceptance)

- [ ] KL3 v2 字數 ≥ 4,000
- [ ] 每節（除新節）有三分類標籤
- [ ] 跨版本共通迷思新節 ≥ 3 條
- [ ] 三版本獨特出題方向新節（各版本 ≥ 2 條）
- [ ] frontmatter version: 2.0、updated_by: Claude Code (claude-opus-4-7)

## ✅ 成果 Checklist (Deliverables)

- [ ] `knowledge/1_課綱研究/社會/KL3_三下_社會_研究總綱.md` v2 完成
- [ ] `jobs/JOB-<AAA>-progress.tsv` 寫一行（phase=2b, lesson=summary, status=keep）
- [ ] `jobs/JOB-<EEE>-Report.md` 產出
- [ ] `node scripts/job_manager.js close JOB-<EEE>`
- [ ] Discord 結案回報

＄作業匯總：Token數:- | 花費: $- | 使用模型: claude-opus-4-7 | 執行者: PM 親跑
````

等使用者「LGTM」進 Step 13.4。

- [ ] **Step 13.4：開單 + 寫派工單 + commit**

```bash
node scripts/job_manager.js create "G3S2-社會-KL3改寫" AG research
```

用 Write 寫入派工單內容，commit。

---

### Task 14：先備份原 KL3 v1（防呆）

- [ ] **Step 14.1：複製原 KL3 為 backup**

```bash
cp "knowledge/1_課綱研究/社會/KL3_三下_社會_研究總綱.md" \
   "knowledge/1_課綱研究/社會/KL3_三下_社會_研究總綱.v1-backup.md"
```

- [ ] **Step 14.2：commit 備份**

```bash
git add "knowledge/1_課綱研究/社會/KL3_三下_社會_研究總綱.v1-backup.md"
git commit -m "chore: 備份 KL3 v1（PM 改寫前防呆）

為什麼這樣做：
Phase 2b PM 即將改寫 KL3 v1 → v2，先 commit 一份 v1 備份檔，
若改寫失敗或需回退可直接 mv 回原檔，避免破壞 JOB-212 既有產出。

JOB: JOB-<EEE>"
```

---

### Task 15：PM 讀三份彙整報告 + 原 KL3

- [ ] **Step 15.1：依序 Read 四個檔案**

用 `Read` 工具讀：
1. `knowledge/1_課綱研究/社會/KL3_三下_社會_研究總綱.md`（v1 全文）
2. `knowledge/1_課綱研究/社會/三下/_reports/翰林_考古題彙整報告.md`
3. `knowledge/1_課綱研究/社會/三下/_reports/康軒_考古題彙整報告.md`
4. `knowledge/1_課綱研究/社會/三下/_reports/南一_考古題彙整報告.md`

- [ ] **Step 15.2：在對話中產出「三分類比對草稿表」給使用者預審**

呈現格式（按原 KL3 章節順序）：

```
| 原 KL3 章節 | 內容摘要 | 三分類 | 佐證/原因 | 改寫方向 |
|:--|:--|:--|:--|:--|
| §一-1 居住環境概念 | XXX | 有佐證 | 翰林 L1 5 題 + 南一 L1 3 題支持 | 保留 + 加引用 |
| §一-2 鄰居互動 | XXX | 無佐證 | 三版本 0 題對應 | 降級「教學設計推測」 |
| §二-1 消費基礎 | XXX | 矛盾 | 原說「需要 vs 想要二分」，考古題實際考「機會成本+電子支付」| 改寫為新框架 |
...
```

等使用者抽查 3-5 列確認三分類合理後，進 Step 15.3。

---

### Task 16：PM 改寫 KL3 v1 → v2

- [ ] **Step 16.1：依三分類表逐節改寫**

用 `Edit` 工具或全文 `Write` 改寫 `KL3_三下_社會_研究總綱.md`：
- 有佐證節：保留 + 加 `（佐證：翰林 內湖 113 第 1 題、南一 廣興 112 第 5 題）` 引用
- 無佐證節：加 `[教學設計推測]` 標籤或刪除整節
- 矛盾節：改寫為考古題版本 + 加 `[依考古題佐證；原素材庫推測：{舊內容摘要}]` 標籤

- [ ] **Step 16.2：補新節**

加章節：
- `§ 跨版本共通迷思（依 Phase 2a 三份彙整報告整合）` ≥ 3 條
- `§ 三版本獨特出題方向` 三子節（翰林/康軒/南一各 ≥ 2 條）

- [ ] **Step 16.3：更新 frontmatter**

```markdown
`last_updated`: 2026-04-29
`updated_by`: Claude Code (claude-opus-4-7) — JOB-<EEE> 反推法改寫
`version`: 2.0
`prev_version_backup`: knowledge/1_課綱研究/社會/KL3_三下_社會_研究總綱.v1-backup.md
```

- [ ] **Step 16.4：驗證字數 ≥ 4,000**

```bash
wc -m < "knowledge/1_課綱研究/社會/KL3_三下_社會_研究總綱.md"
```

Expected: ≥ 4000

- [ ] **Step 16.5：寫一行至 progress.tsv**

```bash
COMMIT=$(git rev-parse --short HEAD)
TS=$(date +%Y-%m-%dT%H:%M)
echo -e "${COMMIT}\t2b\tSocial\tAll\tsummary\t-\t-\t-\t-\tkeep\tKL3 v1->v2 改寫完成\t${TS}" \
  >> "jobs/JOB-<AAA>-progress.tsv"
```

- [ ] **Step 16.6：commit**

```bash
git add "knowledge/1_課綱研究/社會/KL3_三下_社會_研究總綱.md" \
        "jobs/JOB-<AAA>-progress.tsv"
git commit -m "feat: KL3 三下社會 v1->v2 反推法改寫（JOB-<EEE>）

為什麼這樣做：
原 v1 是 JOB-212 從素材庫推測版本，未經考古題驗證。本次依 Phase 2a
三份彙整報告做三分類比對，產出考古題佐證版 v2，作為 Phase 2c KL4
產出的可靠定錨，符合 spec §2.3 反推法精神。

技術變更：
- 修改 knowledge/1_課綱研究/社會/KL3_三下_社會_研究總綱.md（v1 -> v2）
- 字數 ~3000 -> 4000+，每節三分類標籤，新增跨版本共通迷思與獨特出題方向章節
- 寫入 jobs/JOB-<AAA>-progress.tsv 一行（phase=2b）

JOB: JOB-<EEE>"
```

---

### Task 17：Phase 2b 結案

- [ ] **Step 17.1：寫 Report**

用 `Write` 寫入 `jobs/JOB-<EEE>-Report.md`：

```markdown
`last_updated`: 2026-04-29
`updated_by`: Claude Code (claude-opus-4-7)

# JOB-<EEE> Report — G3S2 社會 KL3 改寫（反推法 v1->v2）

## ✅ 驗收

| 項目 | 結果 | 佐證 |
|:--|:--:|:--|
| KL3 v2 字數 ≥ 4,000 | （填）| `wc -m` |
| 每節三分類標籤 | ✅ | grep `\[有佐證\]\|\[無佐證\]\|\[矛盾\]` |
| 跨版本共通迷思 ≥ 3 條 | （填）| 章節 grep |
| 三版本獨特出題方向 | （填）| 章節 grep |
| progress.tsv 1 行（phase=2b）| ✅ | grep 2b |
| backup 檔保留 | ✅ | `ls KL3_*.v1-backup.md` |

## 異動清單
- 修改 knowledge/1_課綱研究/社會/KL3_三下_社會_研究總綱.md（v1→v2）
- 新增 knowledge/1_課綱研究/社會/KL3_三下_社會_研究總綱.v1-backup.md
- 寫入 jobs/JOB-<AAA>-progress.tsv 一行

## 改寫統計
- 有佐證節：N 節
- 無佐證節：N 節（M 節降級、K 節刪除）
- 矛盾節：N 節
- 新增節：跨版本共通迷思（X 條）+ 三版本獨特出題方向（Y/Z/W 條）

＄作業匯總：Token數:- | 花費: $- | 使用模型: claude-opus-4-7 | 執行者: PM 親跑
```

- [ ] **Step 17.2：commit Report**

```bash
git add "jobs/JOB-<EEE>-Report.md"
git commit -m "docs: 結案 JOB-<EEE> KL3 反推改寫

JOB: JOB-<EEE>"
```

- [ ] **Step 17.3：close + Discord**

```bash
node scripts/job_manager.js close JOB-<EEE>
```

呼叫 Discord MCP 送：

```
🎯 Phase 2b 結案：KL3 v1->v2 反推法改寫

✅ KL3 改寫完成（N 節三分類 + 新增 X+Y 條迷思/出題方向）
- 有佐證：N 節
- 無佐證：M 節（K 降級、L 刪除）
- 矛盾：J 節（依考古題改寫）

📍 下一步：Phase 2c 三 cursor agent KL4 產出（請切回 sonnet 4.6 派 Cursor）
```

---

## Phase 2c：多 Agent 寫 KL4（research × 3，估 1-2 天）

### Task 18：使用者切 Sonnet 4.6 + 草擬 Phase 2c 三派工單

- [ ] **Step 18.1：呈現切換指示**

```
Phase 2c 派 Cursor agent 用 sonnet 4.6（PM 端用本對話 sonnet 即可）。
若你目前是 Opus，請執行：/model sonnet
切換完成後告知。
```

- [ ] **Step 18.2：跑 next 取連號 `<FFF>`/`<GGG>`/`<HHH>`**

```bash
node scripts/job_manager.js next
```

- [ ] **Step 18.3：草擬翰林派工單給使用者確認**

呈現（將 `<VERSION>` 替換為「翰林」、`<COURSES>` 替換為 6、`<EXISTING>` 替換為「12 檔 RM0 空殼」）：

````markdown
*Created by Claude Code at 2026-04-29*

`last_updated`: 2026-04-29
`updated_by`: Claude Code (claude-sonnet-4-6)

# JOB-<FFF>-AG-G3S2-社會-翰林-KL4產出

**`job_type`**：`research`
**`executor`**：Cursor (model: claude-sonnet-4-6)
**`spec_doc`**: docs/superpowers/specs/2026-04-29-G3S2-social-reverse-lookup-research-design.md
**`parent_jobs`**: JOB-<EEE>（KL3 v2）/ JOB-<BBB>（翰林彙整報告）

## 📌 任務背景

Phase 2b 已產出 KL3 v2（考古題佐證版）。本任務由 Cursor agent 用 KL3 v2 + 翰林彙整報告
→ 寫翰林 6 課 × 2 = 12 個 KL4 雙檔，達 RM3 標準。

## 🎯 任務目標

完成翰林 6 課 KL4 雙檔達量化 DoD（依 spec §6.1）：
- 單課研究紀錄字數 ≥1,500（β+ ≥1,200）
- 知識點地圖 ≥3 主題節、認知地雷 ≥4 條、108 課綱編碼 ≥2 個
- 考古題與討論字數 ≥3,000（β+ ≥2,500）
- 真實考古題 ≥10 題（β+ 警戒值 ≥10）、來源學校數 ≥2（β+ ≥3）
- 迷思深度討論 ≥2 條、每題誘答分析 ≥30 字（β+ ≥40）
- 達標狀態明確標記
- CK-01～CK-06 全綠

## 🚧 任務邊界

只做：填 6 課 × 2 = 12 個 KL4 雙檔（既有 RM0 空殼升級）。
不做：改 KL3 / 補 KL2；不動康軒/南一 KL4。

## 📜 關鍵參考檔案

| 檔案路徑 | 用途 |
|:--|:--|
| `knowledge/1_課綱研究/社會/KL3_三下_社會_研究總綱.md` | v2 考古題佐證版 |
| `knowledge/1_課綱研究/社會/三下/_reports/翰林_考古題彙整報告.md` | 翰林考古題分類完整 |
| `knowledge/1_課綱研究/社會/三下/翰林/KL4_*` 12 檔 | 既有 RM0 空殼 |
| `knowledge/1_課綱研究/社會/四下/翰林/KL4_四下_翰林_L1_家鄉老故事_*` | 深度標竿 RM3 |
| `jobs/_JOB-TEMPLATE-research-KL4.md` | KL4 模板 + 量化 DoD |

## ✅ 驗收 Checklist (Acceptance)

- [ ] 12 檔皆達字數 DoD（單課紀錄 ≥1,500 / 考古題討論 ≥3,000）
- [ ] 每課 CK-01~CK-06 全綠
- [ ] 達標狀態明確標記（✅/❌/β+）
- [ ] progress.tsv 寫入 6 行（每課一行，phase=2c）
- [ ] 無占位符（grep 待填/RM0 限制 = 0）

## ✅ 成果 Checklist (Deliverables)

- [ ] `knowledge/1_課綱研究/社會/三下/翰林/KL4_*` 12 檔升級
- [ ] `jobs/JOB-<FFF>-Report.md` 產出
- [ ] `node scripts/job_manager.js close JOB-<FFF>`
- [ ] Discord 結案回報

＄作業匯總：Token數:- | 花費: $- | 使用模型: claude-sonnet-4-6 | 執行者: Cursor
````

- [ ] **Step 18.4：呈現「同模板，康軒從零、南一 L5 升級+其餘從零」**

```
康軒派工單與翰林同，差異：
  - JOB <GGG>、版本「康軒」、6 課從零（無既有空殼，需 mkdir + 12 檔新建）
  - 路徑 knowledge/1_課綱研究/社會/三下/康軒/

南一派工單差異：
  - JOB <HHH>、版本「南一」、5 課
  - L5 既有 RM0 升級，L1-L4 從零（既有南一目錄但只有 L5）
```

等使用者「LGTM」三份一起。

---

### Task 19：建翰林 KL4 派工單 + 派 Cursor

- [ ] **Step 19.1：開單 + 寫派工單 + commit**（同 Task 7.1～7.3 模式）

- [ ] **Step 19.2：派 Cursor agent**

```bash
cursor agent --print --yolo --workspace . --model claude-sonnet-4-6 \
  "[Research Agent - 三下社會 翰林 KL4 產出]

   📚 必讀：
     1. docs/superpowers/specs/2026-04-29-G3S2-social-reverse-lookup-research-design.md（§6 是你的詳細指示）
     2. jobs/JOB-<FFF>-AG-G3S2-社會-翰林-KL4產出.md（本任務）
     3. knowledge/1_課綱研究/社會/KL3_三下_社會_研究總綱.md（v2）
     4. knowledge/1_課綱研究/社會/三下/_reports/翰林_考古題彙整報告.md
     5. jobs/_JOB-TEMPLATE-research-KL4.md（模板）
     6. knowledge/1_課綱研究/社會/四下/翰林/KL4_四下_翰林_L1_家鄉老故事_單課研究紀錄.md（標竿）
     6. knowledge/1_課綱研究/社會/四下/翰林/KL4_四下_翰林_L1_家鄉老故事_考古題與討論.md（標竿）

   🎯 任務：
     升級翰林 6 課 KL4 雙檔（既有 RM0 空殼 → RM3）
     - knowledge/1_課綱研究/社會/三下/翰林/KL4_三下_翰林_L{1-6}_*_單課研究紀錄.md
     - knowledge/1_課綱研究/社會/三下/翰林/KL4_三下_翰林_L{1-6}_*_考古題與討論.md

   📋 每課 DoD（依 spec §6.1）：
     單課研究紀錄：字數 ≥1,500、知識點 ≥3 節、認知地雷 ≥4、108 編碼 ≥2
     考古題與討論：字數 ≥3,000、真實題 ≥10、來源 ≥2、迷思 ≥2、誘答 ≥30/題

   🔁 自主迴圈：
     for L1~L6:
       1. 從 KL3 v2 + 翰林彙整報告抽該課素材
       2. 寫單課研究紀錄
       3. 寫考古題與討論
       4. 跑 CK-01~CK-06 自稽
       5. git commit
       6. 寫 progress.tsv:
          \$commit\\t2c\\tSocial\\tHanLin\\t\$lesson\\t-\\t-\\t-\\tRM3\\tkeep\\t...\\t\$ts
     NEVER STOP 直到 6 課全完

   ⛔ 退件條件：
     - 字數連 3 課不達 DoD → manual_review 停下
     - 考古題不足 → 標 β+ 降 QL 上限
     - CK 連 3 課不過 → crash" \
  > scripts/orchestrator-logs/JOB-<FFF>-翰林-KL4.log 2>&1 &

echo "翰林 KL4 cursor PID: $!"
```

- [ ] **Step 19.3：記下 PID + log（寫派工單）**

---

### Task 20：建康軒 + 南一 KL4 派工單 + 派 Cursor

- [ ] **Step 20.1：建康軒目錄（必須先建，因為從零）**

```bash
mkdir -p "knowledge/1_課綱研究/社會/三下/康軒/"
```

- [ ] **Step 20.2：康軒 cursor 派遣（同 Task 19，差異）**：
- 路徑改為 `knowledge/1_課綱研究/社會/三下/康軒/`
- 標明「從零建立 12 檔，依 KL3 v2 康軒 6 課課名」
- 額外讀取：康軒彙整報告
- 註明：康軒目錄為新建，agent 需自行建立 12 個 KL4 雙檔（沿用模板）

- [ ] **Step 20.3：南一 cursor 派遣（同 Task 19，差異）**：
- 課數 5（L1-L4 + 探究 L5「打造幸福的家園」）
- L5 既有 RM3，agent 跳過 L5 寫作但需驗證仍達 DoD（若達則 keep；若不達則升級）
- L1-L4 從零（既有目錄但只有 L5 檔）

---

### Task 21：排第二次 wakeup + Discord 啟動通知

- [ ] **Step 21.1：發 Discord 啟動通知（Phase 2c）**

- [ ] **Step 21.2：ScheduleWakeup 60 min**

同 Task 10，placeholder 改為 Phase 2c 的三 PID 和 log。

---

### Task 22：Phase 2c 完成驗收（嚴格阻塞）

> **觸發條件**：dashboard 顯示 phase=2c 共 17 行（翰林 6 + 康軒 6 + 南一 5）且全 keep / β+_keep。

- [ ] **Step 22.1：跑 dashboard 確認三 agent 全完**

```bash
bash "scripts/JOB-<AAA>-progress-dashboard.sh"
```

Expected: phase=2c 17 行；無 manual_review/crash。

- [ ] **Step 22.2：驗收字數**

```bash
for v in 翰林 康軒 南一; do
  echo "=== $v ==="
  for f in knowledge/1_課綱研究/社會/三下/$v/KL4_*_單課研究紀錄.md; do
    [ -f "$f" ] && echo "$(basename "$f"): $(wc -m < "$f") 字元"
  done
  for f in knowledge/1_課綱研究/社會/三下/$v/KL4_*_考古題與討論.md; do
    [ -f "$f" ] && echo "$(basename "$f"): $(wc -m < "$f") 字元"
  done
done
```

Expected: 單課研究紀錄 ≥1,500、考古題與討論 ≥3,000（β+ 對應 1,200/2,500）。

- [ ] **Step 22.3：驗收占位符清零**

```bash
for v in 翰林 康軒 南一; do
  count=$(grep -r "RM0 限制\|（待填）\|⚠️ 待填\|TBD" "knowledge/1_課綱研究/社會/三下/$v/" 2>/dev/null | wc -l)
  echo "$v 占位符殘留：$count（應為 0）"
done
```

- [ ] **Step 22.4：抽樣驗收（人工）**

呈現：

```
請從三版本各挑 1 課的 KL4 雙檔抽查：
- 單課研究紀錄是否含 108 課綱編碼？
- 考古題與討論的考古題是否每題有來源？
- 迷思深度討論是否實質（≥2 條每條 ≥30 字）？

抽查後告知 OK 或要補強。
```

---

### Task 23：Phase 2c 三 JOB 結案

- [ ] **Step 23.1：寫三份 Report**（同 Task 12.1 模式，依模板）
- [ ] **Step 23.2：commit + close 三 JOB**
- [ ] **Step 23.3：Discord 結案**

```
🎯 Phase 2c 結案：三下社會 KL4 雙檔產出

✅ 34 個 KL4 檔達 RM3：
- 翰林 12 檔（既有空殼升級）
- 康軒 12 檔（從零建立）
- 南一 10 檔（L5 維持 + L1-4 從零）

📍 嚴格阻塞通過 → Phase 2d（PM 補 KL2，使用者請切 Opus 4.7）
```

---

## Phase 2d：KL2 補強（research，1 JOB，估 0.5 天）

### Task 24：使用者切 Opus 4.7 + 草擬派工單

- [ ] **Step 24.1：呈現切換指示**

```
Phase 2d 是 logic-heavy（從 G3S2 全部產出推共通迷思 → KL2）。
請切到 Opus 4.7：/model opus
```

- [ ] **Step 24.2：跑 next 取 JOB-<III>**

- [ ] **Step 24.3：草擬派工單給使用者確認**

呈現（內容對應 spec §7）：

````markdown
*Created by Claude Code at 2026-04-29*

`last_updated`: 2026-04-29
`updated_by`: Claude Code (claude-opus-4-7)

# JOB-<III>-AG-G3S2-社會-KL2補強

**`job_type`**：`research`（PM 親跑）
**`executor`**：Claude Code (claude-opus-4-7)
**`spec_doc`**: docs/superpowers/specs/2026-04-29-G3S2-social-reverse-lookup-research-design.md §7
**`parent_jobs`**: JOB-<EEE>（KL3 v2）/ JOB-<FFF>/<GGG>/<HHH>（三版本 KL4）

## 📌 任務背景

Phase 2a-2c 完成 G3S2 三版本 KL4 + KL3 改寫。本任務做 bottom-up feedback：
從全部產出抽出「社會科 G1-G6 共通可能迷思」，補進 KL2_社會科共同發展總綱.md
（不重寫，僅補新章節）。

## 🎯 任務目標

KL2_社會科共同發展總綱.md 補新章節：
- 章節名「§ G3S2 實證迷思補充（依 JOB-215 反推法 2026-04-29）」
- ≥ 5 條跨年級可能共通的迷思
- 每條含「迷思描述 + 認知發展對應 + G3S2 實證來源」
- 字數 ≥ 1,500

## 🚧 任務邊界

只做：補新章節。
不做：重寫 KL2 既有章節；不擴張到其他學期；不刪除任何原內容。

## 📜 關鍵參考檔案

| 檔案路徑 | 用途 |
|:--|:--|
| `knowledge/1_課綱研究/社會/KL2_社會科共同發展總綱.md` | 原 KL2（待補章節） |
| `knowledge/1_課綱研究/社會/KL3_三下_社會_研究總綱.md` | KL3 v2（含跨版本共通迷思節） |
| `knowledge/1_課綱研究/社會/三下/_reports/{版本}_考古題彙整報告.md` × 3 | 各版本迷思矩陣 |
| `knowledge/1_課綱研究/社會/三下/{版本}/KL4_*_考古題與討論.md` × 17 | 認知地雷實證 |

## ✅ 驗收 Checklist (Acceptance)

- [ ] KL2 新章節 ≥ 5 條迷思
- [ ] 每條含「描述 + 認知發展對應 + 實證來源」
- [ ] 新章節字數 ≥ 1,500
- [ ] 原 KL2 章節未動（diff 確認）
- [ ] frontmatter 標 last_updated / updated_by

## ✅ 成果 Checklist (Deliverables)

- [ ] `knowledge/1_課綱研究/社會/KL2_社會科共同發展總綱.md` 補強完成
- [ ] `jobs/JOB-<AAA>-progress.tsv` 寫一行（phase=2d）
- [ ] `jobs/JOB-<III>-Report.md` 產出
- [ ] close + Discord 結案

＄作業匯總：Token數:- | 花費: $- | 使用模型: claude-opus-4-7 | 執行者: PM 親跑
````

等使用者「LGTM」進 Step 24.4。

- [ ] **Step 24.4：開單 + 寫派工單 + commit**

---

### Task 25：PM 補 KL2 新章節

- [ ] **Step 25.1：先備份原 KL2**

```bash
cp "knowledge/1_課綱研究/社會/KL2_社會科共同發展總綱.md" \
   "knowledge/1_課綱研究/社會/KL2_社會科共同發展總綱.pre-JOB-<III>.md"

git add "knowledge/1_課綱研究/社會/KL2_社會科共同發展總綱.pre-JOB-<III>.md"
git commit -m "chore: 備份 KL2 補章前版本（防呆）

JOB: JOB-<III>"
```

- [ ] **Step 25.2：Read 原 KL2 + 三份彙整 + KL3 v2**

用 `Read` 工具讀全部參考檔案。

- [ ] **Step 25.3：在對話中草擬「跨年級共通迷思候選清單」給使用者預審**

呈現格式：

```
| # | 迷思描述 | 認知發展對應 | G3S2 實證來源 | 跨年級信心 |
|:--|:--|:--|:--|:--|
| 1 | 公權力依賴（遇事直覺找警察/市長）| 具體運思期，未建立公民自治概念 | 翰林 L1 第 8 題、康軒 L2 第 12 題、南一探究 第 5 題 | 高（G1-G6 普見） |
| 2 | 老建築 = 古蹟 | 分類能力以單一特徵 | 翰林 L6 第 6/7 題、康軒 L6 多題 | 中（G3-G6） |
| 3 | 想要 vs 需要無法區分 | 同儕壓力 + 物質取向 | 翰林 L5 第 N 題、康軒 L3/L4 多題 | 高 |
| 4 | 地名隨機論（無因果推論）| 地理因果啟蒙未建立 | 康軒 L5 多題、南一 L4 多題 | 中-高 |
| 5 | 城鄉刻板印象 | 媒體影響 | 翰林 L2 N 題、康軒 L5 N 題 | 中 |
（候選 ≥ 7 條，使用者可裁定取 5-7 條進入 KL2）
```

等使用者勾選哪幾條納入 + 是否要補新發現。

- [ ] **Step 25.4：用 Edit 工具在 KL2 末尾加新章節**

把使用者裁定的 5-7 條寫成完整章節，每條 ≥ 200 字（描述 + 認知對應 + 實證來源 + 教學守衛建議）。

- [ ] **Step 25.5：更新 frontmatter**

```markdown
`last_updated`: 2026-04-29
`updated_by`: Claude Code (claude-opus-4-7) — JOB-<III> 補 G3S2 實證迷思章節
```

- [ ] **Step 25.6：驗證新章節字數 ≥ 1,500**

```bash
# 抽出新章節（從章節標題到檔案結尾）
sed -n '/§ G3S2 實證迷思補充/,$p' "knowledge/1_課綱研究/社會/KL2_社會科共同發展總綱.md" | wc -m
```

Expected: ≥ 1500

- [ ] **Step 25.7：驗證原 KL2 章節未動**

```bash
diff <(sed -n '/§ G3S2 實證迷思補充/q;p' "knowledge/1_課綱研究/社會/KL2_社會科共同發展總綱.md") \
     <(sed -n '/§ G3S2 實證迷思補充/q;p' "knowledge/1_課綱研究/社會/KL2_社會科共同發展總綱.pre-JOB-<III>.md") \
  | head -20
```

Expected: 兩檔在新章節之前內容完全相同（diff 無輸出，除了 frontmatter `last_updated/updated_by`）。
若有差異 → 立即修正回原樣。

- [ ] **Step 25.8：寫一行 progress.tsv**

```bash
COMMIT=$(git rev-parse --short HEAD)
TS=$(date +%Y-%m-%dT%H:%M)
echo -e "${COMMIT}\t2d\tSocial\tAll\tsummary\t-\t-\t-\t-\tkeep\tKL2 補 G3S2 實證章節\t${TS}" \
  >> "jobs/JOB-<AAA>-progress.tsv"
```

- [ ] **Step 25.9：commit**

```bash
git add "knowledge/1_課綱研究/社會/KL2_社會科共同發展總綱.md" "jobs/JOB-<AAA>-progress.tsv"
git commit -m "feat: KL2 社會科補 G3S2 實證迷思章節（JOB-<III>）

為什麼這樣做：
完成 Phase 2a-2c 後，G3S2 三版本提供 17 課實證材料；本次 bottom-up
feedback 把 5 條跨年級可能共通迷思補進 KL2（不重寫原章節），讓
KL2 從「素材庫推測」升級到「考古題實證輔助」狀態，下一個學期研究
可直接引用。

技術變更：
- 修改 knowledge/1_課綱研究/社會/KL2_社會科共同發展總綱.md（補新章節）
- 新章節含 5 條共通迷思 + 認知發展對應 + 實證來源
- 寫入 jobs/JOB-<AAA>-progress.tsv 一行（phase=2d）

JOB: JOB-<III>"
```

---

### Task 26：Phase 2d 結案 + JOB-215 Phase 2 整體結案

- [ ] **Step 26.1：寫 JOB-<III> Report**

```markdown
# JOB-<III> Report — G3S2 社會 KL2 補強

| 項目 | 結果 | 佐證 |
|:--|:--:|:--|
| 新章節字數 ≥ 1,500 | （填）| `wc -m` |
| 共通迷思 ≥ 5 條 | （填）| grep ## |
| 原 KL2 章節未動 | ✅ | diff 0 |
| progress.tsv 1 行（phase=2d）| ✅ | grep |

異動：補章節「§ G3S2 實證迷思補充」於 KL2 末尾，新增 backup 檔。

＄作業匯總：Token數:- | 花費: $- | 使用模型: claude-opus-4-7 | 執行者: PM 親跑
```

- [ ] **Step 26.2：commit + close**

```bash
git add "jobs/JOB-<III>-Report.md"
git commit -m "docs: 結案 JOB-<III> KL2 補強

JOB: JOB-<III>"

node scripts/job_manager.js close JOB-<III>
```

- [ ] **Step 26.3：JOB-215 Phase 2 整體 Report 補段**

用 `Edit` 工具在 `jobs/JOB-215-AG-研究方法論深化暨三下社會KL4內容深掘.md` 末尾或對應 Phase 2 段加入完成標記，引用 9 個子 JOB 號碼。

- [ ] **Step 26.4：/pj_sync**

呼叫 `Skill` tool 執行 `pj_sync`。

- [ ] **Step 26.5：Discord 整體結案**

```
🎉 JOB-215 Phase 2 完成：G3S2 社會反推法研究

✅ 三階段嚴格阻塞流水線：
- Phase 0：基礎建設（progress/dashboard/wakeup）
- Phase 2a：3 cursor agent 反推 105 份考古題（5,000+ 字 × 3 報告）
- Phase 2b：PM 改寫 KL3 v1->v2（4,000+ 字，三分類完整）
- Phase 2c：3 cursor agent 寫 34 個 KL4 雙檔達 RM3
- Phase 2d：PM 補 KL2 共通迷思章節（1,500+ 字）

📊 量化成果：
- 9 個 JOB（<AAA>~<III>）全結案
- 1 KL2 補強 + 1 KL3 改寫 + 34 KL4 雙檔
- 3 份考古題彙整報告
- progress.tsv 18+ 行（每課即時寫入）

📍 下一步：JOB-215 Phase 3（比較分析報告 + 整體結案）
```

---

## Self-Review

### Spec 覆蓋

| Spec 章節 | 對應 Plan Task | 覆蓋 |
|:--|:--|:-:|
| §3.1 整體流程 | Task 1-26（5 階段） | ✅ |
| §3.2 KL2 放最後 | Task 24-26 | ✅ |
| §4.1 Cursor prompt 骨架 | Task 7.4、8、9 | ✅ |
| §4.2 報告結構規格 | Task 7.4 prompt 內含 | ✅ |
| §4.3 課次分類準則 | Task 7.4 prompt 內含（從 spec 引用） | ✅ |
| §5.2 三分類動作流程 | Task 15-16 | ✅ |
| §6.1 KL4 cursor prompt | Task 19.2 + Task 20 | ✅ |
| §7.2 KL2 補強動作 | Task 25 | ✅ |
| §7.3 邊界原則 | Task 25.7 diff 驗證 | ✅ |
| §8 五元件外殼 | Task 2-4（建設）+ Task 10/21（wakeup） | ✅ |
| §9 退件矩陣 | Task 11.1/22.1（嚴格阻塞檢查） | ✅ |
| §10 規範相容性 | Task 各 commit message 註明 | ✅ |
| §12 後續實作步驟 | 本 plan 即是 | ✅ |

無遺漏。

### Placeholder 掃描

- [x] 無 TBD / TODO / 「implement later」字樣
- [x] `JOB-<AAA>` ~ `JOB-<III>` 為合理佔位符（每階段取號時逐個替換）
- [x] `<VERSION>` / `<MD_COUNT>` / `<COURSES>` 等模板變數有明確替換對照（Task 6.3、18.4）
- [x] 「（填實際數）」屬合理運行時填值（cursor agent 與 PM 結案時填）
- [x] 每個 step 有具體代碼或指令

### Type 一致性

- [x] progress.tsv schema：12 欄，與 spec §8.2 + 各 Task echo 寫入指令一致
- [x] status 值集 `{keep, β+_keep, retry, manual_review, crash}` — 在 Task 11.1/22.1 嚴格阻塞檢查時一致引用
- [x] phase 值集 `{2a, 2b, 2c, 2d}` — Task 16.5/25.8/cursor prompt 一致
- [x] 路徑引用一致：`knowledge/1_課綱研究/社會/三下/_reports/`（2a 產出）；`KL4_三下_{版本}_L{N}_*` 命名與 spec §6.1 / Phase 1 模板一致
- [x] 模型代碼一致：sonnet 4.6（cursor + PM 普通）vs opus 4.7（Phase 2b/2d）

無不一致。

---

**Plan 完成。Implementation Plan 路徑：`docs/superpowers/plans/2026-04-29-G3S2-social-reverse-lookup-research.md`。**
