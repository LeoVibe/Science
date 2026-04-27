# 進度／斷點恢復子系統 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立 Eidos 派工系統的通用進度／斷點恢復子系統。所有長時 JOB 共用，支援中斷接續、PM DM 卡點互動、底層連線退避。

**Architecture:** 三件式檔案結構（派工單 + `<JOB>-progress.tsv` + Report）。寫入走獨立進度檔（append-only、無寫衝突），讀取走派工單 marker 區塊（pre-commit hook 自動同步）。卡點時透過 Discord MCP 工具 DM PM、Agent 自身結束或在 timeout 內輪詢。

**Tech Stack:** bash（核心腳本）+ node（PM 回覆解析 + 底層 retry）+ Discord MCP（`mcp__plugin_discord_discord__reply` / `fetch_messages`）+ git pre-commit hook。

**Spec:** `docs/superpowers/specs/2026-04-27-progress-resume-system-design.md`

---

## File Structure

### 新增檔案

| 檔案 | 責任 |
|:--|:--|
| `scripts/lib/progress_common.sh` | 共用 lib：解析派工單 config、讀寫進度檔、status 對照表 |
| `scripts/progress_append.sh` | 寫進度檔一行 |
| `scripts/progress_sync.sh` | 同步派工單 progress-summary 區塊 |
| `scripts/progress_next.sh` | 算下一個未完成單位 |
| `scripts/progress_dm_prepare.sh` | 卡點時寫 pending_pm、輸出 DM 文字 |
| `scripts/progress_dm_finalize.sh` | PM 回應後寫對話區、套用 PM 決定 |
| `scripts/progress_parse_pm_reply.js` | node：解析 PM 回應（msgs + 進度檔 → action JSON） |
| `scripts/progress_monitor.sh` | 監控（升級自 `g5s2_tsv_monitor.sh`） |
| `tests/progress_common.test.sh` | 共用 lib 測試 |
| `tests/progress_append.test.sh` | progress_append 測試 |
| `tests/progress_sync.test.sh` | progress_sync 測試 |
| `tests/progress_next.test.sh` | progress_next 測試 |
| `tests/progress_parse_pm_reply.test.js` | parse_pm_reply 測試 |
| `tests/fixtures/progress_test_job.md` | 測試樣本派工單 |
| `tests/fixtures/progress_test_progress.tsv` | 測試樣本進度檔 |
| `jobs/JOB-211-AG-斷點恢復子系統試行.md` | JOB-211 派工單草稿（最後 task） |
| `jobs/JOB-211-progress.tsv` | 試行進度檔 header |

### 修改檔案

| 檔案 | 改動 |
|:--|:--|
| `scripts/auto_generate_questions.js` | callLLM 加 5xx + network error retry |
| `scripts/run_blind_eval.js` | 同樣 |
| `.git/hooks/pre-commit` | 加進度檔變更觸發 progress_sync 節點 |

### 不在本 plan 範圍

- 5 條跑通路徑（試行）→ JOB-211 派工單範圍
- spec 補強（如試行有發現）→ JOB-211 範圍
- Discord 結案回報 → JOB-211 範圍

---

## Task 1：建立 tests/fixtures 樣本檔

**Files:**
- Create: `tests/fixtures/progress_test_job.md`
- Create: `tests/fixtures/progress_test_progress.tsv`

- [ ] **Step 1：建立 fixture 派工單**

```bash
mkdir -p tests/fixtures
```

寫入 `tests/fixtures/progress_test_job.md`：

```markdown
# JOB-TEST 測試用派工單（給斷點恢復子系統腳本測試用）

## 進度子系統設定
<!-- progress-config-start -->
schema: question_pipeline_v1
pm_response_timeout: 30
range:
  - subject: Science
    publisher: HanLin
    lessons: L1..L3
<!-- progress-config-end -->

## 進度摘要（自動同步，勿手動編輯）
<!-- progress-summary-start -->
（待 progress_sync 寫入）
<!-- progress-summary-end -->

## PM 對話紀錄（progress_dm.sh 自動寫入）
<!-- progress-dm-log-start -->
（待 progress_dm 寫入）
<!-- progress-dm-log-end -->
```

- [ ] **Step 2：建立 fixture 進度檔**

寫入 `tests/fixtures/progress_test_progress.tsv`（第一行 header + 2 row 樣本）：

```
unit_id	commit	agent	subject	publisher	lesson	CQI-P	CQI-V	Match%	QL	status	desc	ts
Sci_HanLin_L1	abc1234	prod	Science	HanLin	L1	6.2	-	-	-	done	30題 CQI 6.2	2026-04-27T10:00
Sci_HanLin_L2	def5678	prod	Science	HanLin	L2	5.8	-	-	-	done	30題 CQI 5.8	2026-04-27T10:30
```

注意：欄位之間用 tab（`\t`），不是空格。

- [ ] **Step 3：驗證 tab 分隔正確**

Run:
```bash
awk -F'\t' '{print NF}' tests/fixtures/progress_test_progress.tsv
```
Expected: 三行都印 `13`。

- [ ] **Step 4：Commit**

```bash
git add tests/fixtures/progress_test_job.md tests/fixtures/progress_test_progress.tsv
git commit -m "chore: 加入進度／斷點恢復子系統測試 fixture

技術變更：
- tests/fixtures/progress_test_job.md（含三區塊 marker）
- tests/fixtures/progress_test_progress.tsv（13 欄 schema + 2 樣本 row）

JOB: -"
```

---

## Task 2：scripts/lib/progress_common.sh 共用 lib

**Files:**
- Create: `scripts/lib/progress_common.sh`
- Test: `tests/progress_common.test.sh`

需要的函式：
- `parse_config_field <派工單> <欄位>` — 從 progress-config 區塊取出某欄位值
- `parse_config_range <派工單>` — 從 progress-config 取 range，輸出 unit_id 清單
- `progress_done_units <進度檔>` — 印出所有 status=done 的 unit_id（一行一個）
- `progress_pending_pm_units <進度檔>` — 印出所有 status=pending_pm 的 unit_id

- [ ] **Step 1：建立 lib 目錄**

```bash
mkdir -p scripts/lib
```

- [ ] **Step 2：寫測試 `tests/progress_common.test.sh`**

```bash
#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
source "$ROOT_DIR/scripts/lib/progress_common.sh"

JOB_FIXTURE="$ROOT_DIR/tests/fixtures/progress_test_job.md"
TSV_FIXTURE="$ROOT_DIR/tests/fixtures/progress_test_progress.tsv"

echo "=== Test 1: parse_config_field schema ==="
SCHEMA=$(parse_config_field "$JOB_FIXTURE" schema)
[[ "$SCHEMA" == "question_pipeline_v1" ]] || { echo "FAIL: got '$SCHEMA'"; exit 1; }
echo "PASS"

echo "=== Test 2: parse_config_field pm_response_timeout ==="
TIMEOUT=$(parse_config_field "$JOB_FIXTURE" pm_response_timeout)
[[ "$TIMEOUT" == "30" ]] || { echo "FAIL: got '$TIMEOUT'"; exit 1; }
echo "PASS"

echo "=== Test 3: parse_config_range Sci_HanLin_L1..L3 ==="
RANGE=$(parse_config_range "$JOB_FIXTURE")
EXPECTED=$'Sci_HanLin_L1\nSci_HanLin_L2\nSci_HanLin_L3'
[[ "$RANGE" == "$EXPECTED" ]] || { echo "FAIL: got '$RANGE'"; exit 1; }
echo "PASS"

echo "=== Test 4: progress_done_units ==="
DONE=$(progress_done_units "$TSV_FIXTURE")
EXPECTED=$'Sci_HanLin_L1\nSci_HanLin_L2'
[[ "$DONE" == "$EXPECTED" ]] || { echo "FAIL: got '$DONE'"; exit 1; }
echo "PASS"

echo "=== Test 5: progress_pending_pm_units (none) ==="
PENDING=$(progress_pending_pm_units "$TSV_FIXTURE" || true)
[[ -z "$PENDING" ]] || { echo "FAIL: expected empty, got '$PENDING'"; exit 1; }
echo "PASS"

echo
echo "✅ All progress_common tests passed."
```

```bash
chmod +x tests/progress_common.test.sh
```

- [ ] **Step 3：跑測試確認 fail**

Run:
```bash
bash tests/progress_common.test.sh
```
Expected: FAIL（lib 還沒寫，source 失敗）。

- [ ] **Step 4：寫 lib `scripts/lib/progress_common.sh`**

```bash
#!/usr/bin/env bash
# Eidos 進度／斷點恢復子系統共用 lib
# spec: docs/superpowers/specs/2026-04-27-progress-resume-system-design.md

# 從派工單 progress-config 區塊取出某欄位值
# Usage: parse_config_field <派工單路徑> <欄位>
parse_config_field() {
    local job_md="$1"
    local field="$2"
    awk -v field="$field" '
        /<!-- progress-config-start -->/ { in_block=1; next }
        /<!-- progress-config-end -->/   { in_block=0 }
        in_block && $1 == field":" { sub(/^[^:]+:[ \t]*/, ""); sub(/[ \t]*#.*$/, ""); print; exit }
    ' "$job_md"
}

# 從派工單 progress-config 取 range，輸出 unit_id 清單（一行一個）
# 目前只支援 question_pipeline_v1 schema：subject_publisher_lesson 合成
# Usage: parse_config_range <派工單路徑>
parse_config_range() {
    local job_md="$1"
    awk '
        /<!-- progress-config-start -->/ { in_block=1; next }
        /<!-- progress-config-end -->/   { in_block=0 }
        in_block && /^range:/ { in_range=1; next }
        in_block && in_range && /^[a-zA-Z]+:/ && !/^[ \t]/ { in_range=0 }
        in_range {
            if (match($0, /subject:[ \t]*([A-Za-z]+)/, m)) subj = m[1]
            else if (match($0, /publisher:[ \t]*([A-Za-z]+)/, m)) pub = m[1]
            else if (match($0, /lessons:[ \t]*L([0-9]+)\.\.L([0-9]+)/, m)) {
                for (i = m[1]; i <= m[2]; i++) {
                    short = substr(subj, 1, 3)
                    print short"_"pub"_L"i
                }
            }
        }
    ' "$job_md"
}

# 印出所有 status=done 的 unit_id
# Usage: progress_done_units <進度檔>
progress_done_units() {
    local tsv="$1"
    awk -F'\t' 'NR>1 && $11=="done" {print $1}' "$tsv"
}

# 印出所有 status=pending_pm 的 unit_id
# Usage: progress_pending_pm_units <進度檔>
progress_pending_pm_units() {
    local tsv="$1"
    awk -F'\t' 'NR>1 && $11=="pending_pm" {print $1}' "$tsv"
}
```

說明：`subject` 取前 3 字（Science→Sci）、與 publisher、lesson 用 `_` 合成 `Sci_HanLin_L1`。awk 的 `match()` regex group 是 GNU awk 才支援；macOS 預設 awk 為 BSD awk 不支援，需用 gawk。Step 5 確認執行環境。

- [ ] **Step 5：確認 awk 版本（macOS 需 gawk）**

Run:
```bash
which gawk || brew install gawk
```

如果系統沒有 gawk，安裝後在 progress_common.sh 第一行的 shebang 改用 gawk，或腳本內呼叫時用 `gawk` 而非 `awk`。

如果不想依賴 gawk，改用 sed/grep/cut 組合。為簡化，本 plan **要求 gawk**。

把 `progress_common.sh` 中 `awk` 全換為 `gawk`：

```bash
sed -i.bak 's/^[ \t]*awk /        gawk /g' scripts/lib/progress_common.sh
```

並修正函式內外的 awk 呼叫一致。或更直接：用 vim/Edit 工具將 lib 內 5 處 `awk` 改為 `gawk`。

- [ ] **Step 6：跑測試確認 pass**

Run:
```bash
bash tests/progress_common.test.sh
```
Expected: 所有 5 個 PASS、最後印 `✅ All progress_common tests passed.`

- [ ] **Step 7：Commit**

```bash
git add scripts/lib/progress_common.sh tests/progress_common.test.sh
git commit -m "feat: 加入進度子系統共用 lib（解析派工單 config、讀進度檔）

為什麼這樣做：
四支進度子系統腳本都需要解析派工單 progress-config 區塊與讀進度檔；
共用 lib 避免重複實作、確保 schema 變更時單點修改。

技術變更：
- scripts/lib/progress_common.sh 提供 parse_config_field / parse_config_range
  / progress_done_units / progress_pending_pm_units 四個函式
- tests/progress_common.test.sh 5 情境測試全綠
- 依賴 gawk（macOS 需 brew install gawk）

JOB: -"
```

---

## Task 3：scripts/progress_append.sh 寫進度檔一行

**Files:**
- Create: `scripts/progress_append.sh`
- Test: `tests/progress_append.test.sh`

CLI:
```bash
progress_append.sh <JOB> --unit-id <id> --agent <name> --status <s> --desc <text> [--subject S] [--publisher P] [--lesson L] [--cqi-p N] [--cqi-v N] [--match N] [--ql QL]
```

行為：
- 若進度檔不存在 → 從派工單 schema 宣告產生 header
- append 一行（13 欄、tab 分隔），自動補 commit short hash 與 ts
- 用 `flock` 避免多 Agent 並發 append 的 race

- [ ] **Step 1：寫測試 `tests/progress_append.test.sh`**

```bash
#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
TMP=$(mktemp -d)
trap "rm -rf $TMP" EXIT

# 準備測試環境：複製 fixture 派工單
cp "$ROOT_DIR/tests/fixtures/progress_test_job.md" "$TMP/JOB-TEST-AG-fake.md"
cd "$TMP"
git init -q
git add .
git -c user.email=t@t -c user.name=t commit -q -m init

mkdir -p jobs
mv JOB-TEST-AG-fake.md jobs/

echo "=== Test 1: append 第一筆會自動建 header ==="
"$ROOT_DIR/scripts/progress_append.sh" JOB-TEST \
    --jobs-dir "$TMP/jobs" \
    --unit-id Sci_HanLin_L1 \
    --agent prod \
    --status done \
    --desc "30題" \
    --subject Science --publisher HanLin --lesson L1 --cqi-p 6.2

[[ -f "$TMP/jobs/JOB-TEST-progress.tsv" ]] || { echo "FAIL: tsv not created"; exit 1; }
HEADER=$(head -1 "$TMP/jobs/JOB-TEST-progress.tsv")
EXPECTED_HEADER=$'unit_id\tcommit\tagent\tsubject\tpublisher\tlesson\tCQI-P\tCQI-V\tMatch%\tQL\tstatus\tdesc\tts'
[[ "$HEADER" == "$EXPECTED_HEADER" ]] || { echo "FAIL header: got '$HEADER'"; exit 1; }
ROW_COUNT=$(awk 'NR>1' "$TMP/jobs/JOB-TEST-progress.tsv" | wc -l | tr -d ' ')
[[ "$ROW_COUNT" == "1" ]] || { echo "FAIL row count: got $ROW_COUNT"; exit 1; }
echo "PASS"

echo "=== Test 2: 第二筆 append 不重建 header ==="
"$ROOT_DIR/scripts/progress_append.sh" JOB-TEST \
    --jobs-dir "$TMP/jobs" \
    --unit-id Sci_HanLin_L2 \
    --agent prod \
    --status done \
    --desc "30題" \
    --subject Science --publisher HanLin --lesson L2 --cqi-p 5.8

ROW_COUNT=$(awk 'NR>1' "$TMP/jobs/JOB-TEST-progress.tsv" | wc -l | tr -d ' ')
[[ "$ROW_COUNT" == "2" ]] || { echo "FAIL row count: got $ROW_COUNT"; exit 1; }
echo "PASS"

echo "=== Test 3: 欄位數正確（13） ==="
awk -F'\t' '{ if (NF != 13) { print "FAIL line "NR": NF="NF; exit 1 }}' "$TMP/jobs/JOB-TEST-progress.tsv"
echo "PASS"

echo "=== Test 4: ts 是 ISO 8601 格式 ==="
TS=$(awk -F'\t' 'NR==2 {print $13}' "$TMP/jobs/JOB-TEST-progress.tsv")
[[ "$TS" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}$ ]] || { echo "FAIL ts: got '$TS'"; exit 1; }
echo "PASS"

echo
echo "✅ All progress_append tests passed."
```

```bash
chmod +x tests/progress_append.test.sh
```

- [ ] **Step 2：跑測試確認 fail**

Run: `bash tests/progress_append.test.sh`
Expected: FAIL（progress_append.sh 不存在）

- [ ] **Step 3：寫 `scripts/progress_append.sh`**

```bash
#!/usr/bin/env bash
# scripts/progress_append.sh — 寫一行到 jobs/<JOB>-progress.tsv
# spec: docs/superpowers/specs/2026-04-27-progress-resume-system-design.md
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/progress_common.sh"

JOB="${1:?JOB id required, e.g. JOB-211}"
shift

# 預設值
JOBS_DIR="$(cd "$SCRIPT_DIR/.." && pwd)/jobs"
UNIT_ID=""
AGENT=""
STATUS=""
DESC=""
SUBJECT="-"
PUBLISHER="-"
LESSON="-"
CQI_P="-"
CQI_V="-"
MATCH="-"
QL="-"

while [[ $# -gt 0 ]]; do
    case "$1" in
        --jobs-dir) JOBS_DIR="$2"; shift 2 ;;
        --unit-id) UNIT_ID="$2"; shift 2 ;;
        --agent) AGENT="$2"; shift 2 ;;
        --status) STATUS="$2"; shift 2 ;;
        --desc) DESC="$2"; shift 2 ;;
        --subject) SUBJECT="$2"; shift 2 ;;
        --publisher) PUBLISHER="$2"; shift 2 ;;
        --lesson) LESSON="$2"; shift 2 ;;
        --cqi-p) CQI_P="$2"; shift 2 ;;
        --cqi-v) CQI_V="$2"; shift 2 ;;
        --match) MATCH="$2"; shift 2 ;;
        --ql) QL="$2"; shift 2 ;;
        *) echo "Unknown arg: $1" >&2; exit 1 ;;
    esac
done

[[ -n "$UNIT_ID" && -n "$AGENT" && -n "$STATUS" && -n "$DESC" ]] || {
    echo "Required: --unit-id --agent --status --desc" >&2
    exit 1
}

TSV="$JOBS_DIR/${JOB}-progress.tsv"
HEADER=$'unit_id\tcommit\tagent\tsubject\tpublisher\tlesson\tCQI-P\tCQI-V\tMatch%\tQL\tstatus\tdesc\tts'

# desc 內禁有 tab/換行，替換為空格
SAFE_DESC=$(echo -n "$DESC" | tr '\t\n' '  ')

# commit short hash（git 倉根）
COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "nogit")

# ts ISO 8601 短格式（到分鐘）
TS=$(date -u +"%Y-%m-%dT%H:%M")

ROW="${UNIT_ID}\t${COMMIT}\t${AGENT}\t${SUBJECT}\t${PUBLISHER}\t${LESSON}\t${CQI_P}\t${CQI_V}\t${MATCH}\t${QL}\t${STATUS}\t${SAFE_DESC}\t${TS}"

# 用 flock 鎖檔避免並發 race
LOCK="$TSV.lock"
(
    flock -x 200
    if [[ ! -f "$TSV" ]]; then
        echo -e "$HEADER" > "$TSV"
    fi
    echo -e "$ROW" >> "$TSV"
) 200>"$LOCK"

echo "appended: $UNIT_ID / $STATUS / $TS" >&2
```

```bash
chmod +x scripts/progress_append.sh
```

- [ ] **Step 4：跑測試確認 pass**

Run: `bash tests/progress_append.test.sh`
Expected: 4 個 PASS、最後印 `✅ All progress_append tests passed.`

- [ ] **Step 5：Commit**

```bash
git add scripts/progress_append.sh tests/progress_append.test.sh
git commit -m "feat: 加入 progress_append 寫進度檔一行

為什麼這樣做：
進度／斷點恢復子系統需要一致的進度檔寫入路徑，避免多 Agent 並發
race condition；用 flock 鎖檔保證 append 原子性。

技術變更：
- scripts/progress_append.sh CLI 接受 --unit-id/--agent/--status/--desc 等參數
- 自動補 commit short hash 與 ISO 8601 ts
- 進度檔不存在則自動建立 13 欄 header
- tests/progress_append.test.sh 4 情境全綠

JOB: -"
```

---

## Task 4：scripts/progress_sync.sh 同步派工單摘要區

**Files:**
- Create: `scripts/progress_sync.sh`
- Test: `tests/progress_sync.test.sh`

CLI:
```bash
progress_sync.sh <JOB>
```

行為：
1. 讀進度檔，計算統計（done/pending_pm/failed/manual_review/paused/aborted/total）
2. 讀派工單 progress-config 取 range 算 total
3. 抓最近 5 筆
4. 替換派工單 `<!-- progress-summary-start -->...<!-- progress-summary-end -->` 區塊內容
5. 寫回派工單

- [ ] **Step 1：寫測試 `tests/progress_sync.test.sh`**

```bash
#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
TMP=$(mktemp -d)
trap "rm -rf $TMP" EXIT

mkdir -p "$TMP/jobs"
cp "$ROOT_DIR/tests/fixtures/progress_test_job.md" "$TMP/jobs/JOB-TEST-AG-fake.md"
cp "$ROOT_DIR/tests/fixtures/progress_test_progress.tsv" "$TMP/jobs/JOB-TEST-progress.tsv"
cd "$TMP"
git init -q && git add . && git -c user.email=t@t -c user.name=t commit -q -m init

echo "=== Test 1: sync 後 progress-summary 區塊有資料 ==="
"$ROOT_DIR/scripts/progress_sync.sh" JOB-TEST --jobs-dir "$TMP/jobs"

if grep -q "已 done：2" "$TMP/jobs/JOB-TEST-AG-fake.md"; then
    echo "PASS"
else
    echo "FAIL: progress-summary 沒有「已 done：2」"
    cat "$TMP/jobs/JOB-TEST-AG-fake.md"
    exit 1
fi

echo "=== Test 2: 範圍總計正確（L1..L3 = 3 個單位） ==="
if grep -q "範圍總計：3 個單位" "$TMP/jobs/JOB-TEST-AG-fake.md"; then
    echo "PASS"
else
    echo "FAIL: 範圍總計"
    grep "範圍總計" "$TMP/jobs/JOB-TEST-AG-fake.md" || true
    exit 1
fi

echo "=== Test 3: 多次 sync 結果穩定（idempotent） ==="
"$ROOT_DIR/scripts/progress_sync.sh" JOB-TEST --jobs-dir "$TMP/jobs"
COUNT_START=$(grep -c "<!-- progress-summary-start -->" "$TMP/jobs/JOB-TEST-AG-fake.md")
COUNT_END=$(grep -c "<!-- progress-summary-end -->" "$TMP/jobs/JOB-TEST-AG-fake.md")
[[ "$COUNT_START" == "1" && "$COUNT_END" == "1" ]] || { echo "FAIL marker count: $COUNT_START/$COUNT_END"; exit 1; }
echo "PASS"

echo
echo "✅ All progress_sync tests passed."
```

```bash
chmod +x tests/progress_sync.test.sh
```

- [ ] **Step 2：跑測試確認 fail**

Run: `bash tests/progress_sync.test.sh`
Expected: FAIL（progress_sync.sh 不存在）

- [ ] **Step 3：寫 `scripts/progress_sync.sh`**

```bash
#!/usr/bin/env bash
# scripts/progress_sync.sh — 同步派工單 progress-summary 區塊
# spec: docs/superpowers/specs/2026-04-27-progress-resume-system-design.md
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/progress_common.sh"

JOB="${1:?JOB id required}"
shift

JOBS_DIR="$(cd "$SCRIPT_DIR/.." && pwd)/jobs"
while [[ $# -gt 0 ]]; do
    case "$1" in
        --jobs-dir) JOBS_DIR="$2"; shift 2 ;;
        *) shift ;;
    esac
done

# 找派工單檔案（JOB-XXX-AG-* 或 JOB-XXX-USER-* 或 JOB-XXX-DEV-*）
JOB_MD=$(ls "$JOBS_DIR"/${JOB}-*.md 2>/dev/null | grep -vE "(progress|Report)" | head -1)
[[ -n "$JOB_MD" ]] || { echo "ERROR: 派工單不存在 ($JOBS_DIR/${JOB}-*.md)" >&2; exit 1; }
TSV="$JOBS_DIR/${JOB}-progress.tsv"

# 範圍總計
TOTAL=$(parse_config_range "$JOB_MD" | wc -l | tr -d ' ')

# status 統計
COUNT_DONE=0
COUNT_PENDING_PM=0
COUNT_FAILED=0
COUNT_PAUSED=0
COUNT_PAUSED_OFFLINE=0
COUNT_MANUAL_REVIEW=0
COUNT_PARTIAL=0
COUNT_ABORTED=0
COUNT_RETRY=0

if [[ -f "$TSV" ]]; then
    COUNT_DONE=$(gawk -F'\t' 'NR>1 && $11=="done"' "$TSV" | wc -l | tr -d ' ')
    COUNT_PENDING_PM=$(gawk -F'\t' 'NR>1 && $11=="pending_pm"' "$TSV" | wc -l | tr -d ' ')
    COUNT_FAILED=$(gawk -F'\t' 'NR>1 && $11=="failed"' "$TSV" | wc -l | tr -d ' ')
    COUNT_PAUSED=$(gawk -F'\t' 'NR>1 && $11=="paused"' "$TSV" | wc -l | tr -d ' ')
    COUNT_PAUSED_OFFLINE=$(gawk -F'\t' 'NR>1 && $11=="paused_offline"' "$TSV" | wc -l | tr -d ' ')
    COUNT_MANUAL_REVIEW=$(gawk -F'\t' 'NR>1 && $11=="manual_review"' "$TSV" | wc -l | tr -d ' ')
    COUNT_PARTIAL=$(gawk -F'\t' 'NR>1 && $11=="partial"' "$TSV" | wc -l | tr -d ' ')
    COUNT_ABORTED=$(gawk -F'\t' 'NR>1 && $11=="aborted"' "$TSV" | wc -l | tr -d ' ')
    COUNT_RETRY=$(gawk -F'\t' 'NR>1 && $11=="retry"' "$TSV" | wc -l | tr -d ' ')
fi

# 百分比
if [[ "$TOTAL" -gt 0 ]]; then
    PCT=$(gawk -v d="$COUNT_DONE" -v t="$TOTAL" 'BEGIN { printf "%.1f", d*100/t }')
else
    PCT="0.0"
fi

# pending_pm 詳細
PENDING_PM_DETAIL=""
if [[ "$COUNT_PENDING_PM" -gt 0 ]]; then
    PENDING_PM_DETAIL=$(gawk -F'\t' 'NR>1 && $11=="pending_pm" {print "  - "$1" ("$12")"}' "$TSV")
fi

# manual_review 詳細
MANUAL_REVIEW_DETAIL=""
if [[ "$COUNT_MANUAL_REVIEW" -gt 0 ]]; then
    MANUAL_REVIEW_DETAIL=$(gawk -F'\t' 'NR>1 && $11=="manual_review" {print "  - "$1" ("$12")"}' "$TSV")
fi

# 最近 5 筆
RECENT_5=""
if [[ -f "$TSV" ]]; then
    RECENT_5=$(gawk -F'\t' 'NR>1 {print "  - "$1" / "$3" / "$11" / "$12}' "$TSV" | tail -5)
fi

# ts
NOW=$(date -u +"%Y-%m-%dT%H:%M")

# 構建 summary 內容
SUMMARY=$(cat <<EOF
- 範圍總計：$TOTAL 個單位
- 已 done：$COUNT_DONE（${PCT}%）
- pending_pm：$COUNT_PENDING_PM
$PENDING_PM_DETAIL
- failed：$COUNT_FAILED　paused：$COUNT_PAUSED　paused_offline：$COUNT_PAUSED_OFFLINE
- manual_review：$COUNT_MANUAL_REVIEW
$MANUAL_REVIEW_DETAIL
- partial：$COUNT_PARTIAL　aborted：$COUNT_ABORTED　retry：$COUNT_RETRY
- 最近 5 筆：
$RECENT_5
- 最後更新：$NOW (sync from ${JOB}-progress.tsv)
EOF
)

# 寫回派工單：替換 <!-- progress-summary-start --> 與 <!-- progress-summary-end --> 之間
TMP_OUT=$(mktemp)
gawk -v summary="$SUMMARY" '
    /<!-- progress-summary-start -->/ { print; print summary; in_block=1; next }
    /<!-- progress-summary-end -->/   { in_block=0 }
    !in_block { print }
' "$JOB_MD" > "$TMP_OUT"

mv "$TMP_OUT" "$JOB_MD"

echo "synced: $JOB ($COUNT_DONE/$TOTAL done, $COUNT_PENDING_PM pending_pm)" >&2
```

```bash
chmod +x scripts/progress_sync.sh
```

- [ ] **Step 4：跑測試確認 pass**

Run: `bash tests/progress_sync.test.sh`
Expected: 3 個 PASS

- [ ] **Step 5：Commit**

```bash
git add scripts/progress_sync.sh tests/progress_sync.test.sh
git commit -m "feat: 加入 progress_sync 同步派工單摘要區

為什麼這樣做：
打開派工單就能看到進度全貌，不用另開進度檔；sync 是 idempotent，
可由 pre-commit hook 自動觸發避免人為遺漏。

技術變更：
- scripts/progress_sync.sh 計算 status 統計、最近 5 筆、百分比
- 用 awk 替換派工單 progress-summary marker 區塊內容
- tests/progress_sync.test.sh 含 idempotent 驗證

JOB: -"
```

---

## Task 5：scripts/progress_next.sh 算下一單

**Files:**
- Create: `scripts/progress_next.sh`
- Test: `tests/progress_next.test.sh`

CLI:
```bash
progress_next.sh <JOB> [--agent <name>]
```

stdout 輸出：
```
unit_id=Sci_HanLin_L3
subject=Science
publisher=HanLin
lesson=L3
```

或 `NONE` 與 exit 0（全綠）。
解析失敗 exit 1。schema 不對 exit 2。

- [ ] **Step 1：寫測試 `tests/progress_next.test.sh`**

```bash
#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
TMP=$(mktemp -d)
trap "rm -rf $TMP" EXIT

mkdir -p "$TMP/jobs"
cp "$ROOT_DIR/tests/fixtures/progress_test_job.md" "$TMP/jobs/JOB-TEST-AG-fake.md"

echo "=== Test 1: 進度檔不存在 → 返回 L1 ==="
OUT=$("$ROOT_DIR/scripts/progress_next.sh" JOB-TEST --jobs-dir "$TMP/jobs")
echo "$OUT" | grep -q "unit_id=Sci_HanLin_L1" || { echo "FAIL: $OUT"; exit 1; }
echo "PASS"

echo "=== Test 2: 進度檔有 L1 done → 返回 L2 ==="
cp "$ROOT_DIR/tests/fixtures/progress_test_progress.tsv" "$TMP/jobs/JOB-TEST-progress.tsv"
# fixture 已有 L1, L2 done
OUT=$("$ROOT_DIR/scripts/progress_next.sh" JOB-TEST --jobs-dir "$TMP/jobs")
echo "$OUT" | grep -q "unit_id=Sci_HanLin_L3" || { echo "FAIL: $OUT"; exit 1; }
echo "PASS"

echo "=== Test 3: 全綠 → NONE ==="
# 加一筆 L3 done
echo -e "Sci_HanLin_L3\tghi9012\tprod\tScience\tHanLin\tL3\t6.0\t-\t-\t-\tdone\t30題\t2026-04-27T11:00" >> "$TMP/jobs/JOB-TEST-progress.tsv"
OUT=$("$ROOT_DIR/scripts/progress_next.sh" JOB-TEST --jobs-dir "$TMP/jobs")
[[ "$OUT" == "NONE" ]] || { echo "FAIL: expected NONE got '$OUT'"; exit 1; }
echo "PASS"

echo "=== Test 4: 派工單 progress-config 缺失 → exit 1 ==="
echo "# empty" > "$TMP/jobs/JOB-EMPTY-AG-fake.md"
if "$ROOT_DIR/scripts/progress_next.sh" JOB-EMPTY --jobs-dir "$TMP/jobs" 2>/dev/null; then
    echo "FAIL: expected exit 1"
    exit 1
fi
echo "PASS"

echo
echo "✅ All progress_next tests passed."
```

```bash
chmod +x tests/progress_next.test.sh
```

- [ ] **Step 2：跑測試確認 fail**

Run: `bash tests/progress_next.test.sh`
Expected: FAIL（script 不存在）

- [ ] **Step 3：寫 `scripts/progress_next.sh`**

```bash
#!/usr/bin/env bash
# scripts/progress_next.sh — 找下一個未完成單位
# spec: docs/superpowers/specs/2026-04-27-progress-resume-system-design.md
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/progress_common.sh"

JOB="${1:?JOB id required}"
shift

JOBS_DIR="$(cd "$SCRIPT_DIR/.." && pwd)/jobs"
AGENT_FILTER=""
while [[ $# -gt 0 ]]; do
    case "$1" in
        --jobs-dir) JOBS_DIR="$2"; shift 2 ;;
        --agent) AGENT_FILTER="$2"; shift 2 ;;
        *) shift ;;
    esac
done

JOB_MD=$(ls "$JOBS_DIR"/${JOB}-*.md 2>/dev/null | grep -vE "(progress|Report)" | head -1)
[[ -n "$JOB_MD" ]] || { echo "ERROR: 派工單不存在" >&2; exit 1; }
TSV="$JOBS_DIR/${JOB}-progress.tsv"

# 解析範圍
RANGE=$(parse_config_range "$JOB_MD")
[[ -n "$RANGE" ]] || { echo "ERROR: progress-config range 解析失敗" >&2; exit 1; }

# done 清單
DONE_LIST=""
if [[ -f "$TSV" ]]; then
    DONE_LIST=$(progress_done_units "$TSV")
fi

# 找第一個不在 DONE_LIST 內的 unit_id
NEXT=""
while IFS= read -r unit; do
    if ! grep -qxF "$unit" <<<"$DONE_LIST"; then
        NEXT="$unit"
        break
    fi
done <<<"$RANGE"

if [[ -z "$NEXT" ]]; then
    echo "NONE"
    exit 0
fi

# 拆 unit_id：question_pipeline_v1 schema 為 <subject_short>_<publisher>_<lesson>
SUBJECT_SHORT=$(echo "$NEXT" | cut -d_ -f1)
PUBLISHER=$(echo "$NEXT" | cut -d_ -f2)
LESSON=$(echo "$NEXT" | cut -d_ -f3)

# subject short 還原（Sci → Science / Soc → SocialStudies / Chi → Chinese）
case "$SUBJECT_SHORT" in
    Sci) SUBJECT="Science" ;;
    Soc) SUBJECT="SocialStudies" ;;
    Chi) SUBJECT="Chinese" ;;
    *) SUBJECT="$SUBJECT_SHORT" ;;
esac

cat <<EOF
unit_id=$NEXT
subject=$SUBJECT
publisher=$PUBLISHER
lesson=$LESSON
EOF
```

```bash
chmod +x scripts/progress_next.sh
```

- [ ] **Step 4：跑測試確認 pass**

Run: `bash tests/progress_next.test.sh`
Expected: 4 個 PASS

- [ ] **Step 5：Commit**

```bash
git add scripts/progress_next.sh tests/progress_next.test.sh
git commit -m "feat: 加入 progress_next 算下一個未完成單位

為什麼這樣做：
Agent 啟動後第一件事是知道該做哪一單；對齊「進度檔即真相」原則，
讓任何 Agent（含中斷重啟）都能接續進度。

技術變更：
- scripts/progress_next.sh 從派工單 range 與進度檔 done 計算下一單
- subject short→full 對照（Sci→Science 等）
- 全綠返回 NONE、派工單缺 config 返回 exit 1
- tests/progress_next.test.sh 4 情境全綠

JOB: -"
```

---

## Task 6：scripts/progress_dm_prepare.sh 卡點預備

**Files:**
- Create: `scripts/progress_dm_prepare.sh`

CLI:
```bash
progress_dm_prepare.sh <JOB> --unit-id <id> --reason <text>
```

行為：
1. 寫一筆 status=pending_pm 到進度檔（progress_append）
2. 觸發 progress_sync 更新派工單摘要
3. 寫派工單 dm-log 區塊「DM sent」段（msg_id 暫填 PENDING）
4. stdout 輸出要送的 DM 訊息文字（讓 Agent 用 mcp__plugin_discord_discord__reply 發送）

注意：本腳本**不直接呼叫 Discord MCP**（MCP tool 只能由 Claude Code Agent 在其環境呼叫）。

- [ ] **Step 1：寫腳本 `scripts/progress_dm_prepare.sh`**

```bash
#!/usr/bin/env bash
# scripts/progress_dm_prepare.sh — 卡點時寫 pending_pm、輸出 DM 文字
# spec: docs/superpowers/specs/2026-04-27-progress-resume-system-design.md
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

JOB="${1:?JOB id required}"
shift

JOBS_DIR="$(cd "$SCRIPT_DIR/.." && pwd)/jobs"
UNIT_ID=""
REASON=""
while [[ $# -gt 0 ]]; do
    case "$1" in
        --jobs-dir) JOBS_DIR="$2"; shift 2 ;;
        --unit-id) UNIT_ID="$2"; shift 2 ;;
        --reason) REASON="$2"; shift 2 ;;
        *) shift ;;
    esac
done

[[ -n "$UNIT_ID" && -n "$REASON" ]] || { echo "Required: --unit-id --reason" >&2; exit 1; }

JOB_MD=$(ls "$JOBS_DIR"/${JOB}-*.md 2>/dev/null | grep -vE "(progress|Report)" | head -1)
[[ -n "$JOB_MD" ]] || { echo "ERROR: 派工單不存在" >&2; exit 1; }

# Step 1: 寫 pending_pm 到進度檔
"$SCRIPT_DIR/progress_append.sh" "$JOB" \
    --jobs-dir "$JOBS_DIR" \
    --unit-id "$UNIT_ID" \
    --agent "$(echo "$UNIT_ID" | cut -d_ -f1 | tr 'A-Z' 'a-z')" \
    --status pending_pm \
    --desc "$REASON"

# Step 2: sync 派工單摘要
"$SCRIPT_DIR/progress_sync.sh" "$JOB" --jobs-dir "$JOBS_DIR"

# Step 3: 寫派工單 dm-log 區塊「DM sent」段
TS=$(date -u +"%Y-%m-%dT%H:%M")
TIMEOUT_VAL=$(gawk '
    /<!-- progress-config-start -->/ { in_block=1; next }
    /<!-- progress-config-end -->/   { in_block=0 }
    in_block && /^pm_response_timeout:/ { sub(/^[^:]+:[ \t]*/, ""); sub(/[ \t]*#.*$/, ""); print; exit }
' "$JOB_MD")

DM_LOG_ENTRY=$(cat <<EOF

[$TS] DM sent (msg_id: PENDING)
  reason: $REASON
  unit: $UNIT_ID
  pause_status: pending_pm
  awaiting: PM 回覆（timeout: $TIMEOUT_VAL）
EOF
)

TMP_OUT=$(mktemp)
gawk -v entry="$DM_LOG_ENTRY" '
    /<!-- progress-dm-log-start -->/ { print; print entry; in_block=1; next }
    /<!-- progress-dm-log-end -->/ { in_block=0 }
    !in_block { print }
    in_block && !/^\(待 progress_dm 寫入\)$/ { print }
' "$JOB_MD" > "$TMP_OUT"
mv "$TMP_OUT" "$JOB_MD"

# Step 4: stdout 輸出 DM 文字（Agent 用 mcp__plugin_discord_discord__reply 發送）
cat <<EOF
🚨 [$JOB 卡點] $UNIT_ID
$REASON

回覆下列任一：
  1  accept    接受現況、推進
  2  retry     重試這單
  3  skip      跳過、標 manual_review
  4  pause     整個 JOB 暫停
  5  abort     整個 JOB 中止
  6  custom    自由講話（你開新對話下指令）

可加註：例如「1 QL3 即可」（=accept + 補充）

詳細：jobs/${JOB}-progress.tsv
EOF
```

```bash
chmod +x scripts/progress_dm_prepare.sh
```

- [ ] **Step 2：手測**

```bash
TMP=$(mktemp -d)
mkdir -p "$TMP/jobs"
cp tests/fixtures/progress_test_job.md "$TMP/jobs/JOB-TEST-AG-fake.md"
cd "$TMP"; git init -q; git add .; git -c user.email=t@t -c user.name=t commit -q -m init
cd -

bash scripts/progress_dm_prepare.sh JOB-TEST \
    --jobs-dir "$TMP/jobs" \
    --unit-id Sci_HanLin_L3 \
    --reason "雙盲不一致率 22% 超 20% 門檻"

# 確認進度檔有 pending_pm row
grep "pending_pm" "$TMP/jobs/JOB-TEST-progress.tsv" && echo "PASS"

# 確認派工單 dm-log 有 DM sent
grep "DM sent" "$TMP/jobs/JOB-TEST-AG-fake.md" && echo "PASS"

rm -rf "$TMP"
```

Expected: 兩個 PASS。

- [ ] **Step 3：Commit**

```bash
git add scripts/progress_dm_prepare.sh
git commit -m "feat: 加入 progress_dm_prepare 卡點預備腳本

為什麼這樣做：
卡點時 Agent 需要寫 pending_pm 狀態 + 同步派工單 + 產出 DM 文字；
腳本不直接呼叫 Discord（MCP 工具只能由 Claude Code Agent 環境呼叫）。

技術變更：
- scripts/progress_dm_prepare.sh 串聯 append + sync + dm-log 寫入
- stdout 輸出 DM 文字模板（Agent 接著呼叫 mcp__plugin_discord_discord__reply）
- timeout 值從派工單 progress-config 讀取

JOB: -"
```

---

## Task 7：scripts/progress_parse_pm_reply.js node 解析

**Files:**
- Create: `scripts/progress_parse_pm_reply.js`
- Test: `tests/progress_parse_pm_reply.test.js`

input：DM 訊息陣列（JSON）+ 進度檔路徑
output：JSON
```json
{
  "action": "accept|retry|skip|pause|abort|custom|wait",
  "unit_id": "...",
  "msg_id": "...",
  "annotation": "...",
  "reason": "解析失敗時"
}
```

解析規則（spec §6.3）：
- 第一行 token：1-6 數字或 keyword
- 自動配對 pending_pm（單一）；多筆需含 unit_id
- 過濾 bot 自己發的訊息（is_bot=true）

- [ ] **Step 1：寫測試 `tests/progress_parse_pm_reply.test.js`**

```javascript
const { parsePmReply } = require('../scripts/progress_parse_pm_reply.js');
const fs = require('fs');
const path = require('path');
const os = require('os');

// 建立測試進度檔
function makeTsv(rows) {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'progress-test-'));
    const tsv = path.join(tmpDir, 'JOB-TEST-progress.tsv');
    const header = ['unit_id','commit','agent','subject','publisher','lesson','CQI-P','CQI-V','Match%','QL','status','desc','ts'].join('\t');
    fs.writeFileSync(tsv, header + '\n' + rows.map(r => r.join('\t')).join('\n') + '\n');
    return tsv;
}

let pass = 0, fail = 0;
function test(name, fn) {
    try { fn(); console.log('✅ ' + name); pass++; }
    catch (e) { console.log('❌ ' + name + ': ' + e.message); fail++; }
}

// Test 1: 單一 pending_pm + PM 回 "1"
test('單一 pending_pm 回 1 → accept', () => {
    const tsv = makeTsv([
        ['Sci_HanLin_L1','abc','prod','Science','HanLin','L1','6.2','-','-','-','done','30題','2026-04-27T10:00'],
        ['Sci_HanLin_L3','def','verify','Science','HanLin','L3','6.0','3.0','78%','-','pending_pm','雙盲不一致 22%','2026-04-27T11:00'],
    ]);
    const msgs = [
        { id: '1', author: { bot: true }, content: '🚨 [JOB-211 卡點] Sci_HanLin_L3 ...' },
        { id: '2', author: { bot: false }, content: '1' }
    ];
    const result = parsePmReply({ messages: msgs, tsvPath: tsv, jobId: 'JOB-211' });
    if (result.action !== 'accept') throw new Error('expected accept got ' + result.action);
    if (result.unit_id !== 'Sci_HanLin_L3') throw new Error('unit_id wrong');
    if (result.msg_id !== '2') throw new Error('msg_id wrong');
});

// Test 2: 編號 + 註記
test('1 QL3 即可 → accept + annotation', () => {
    const tsv = makeTsv([
        ['Sci_HanLin_L3','def','verify','Science','HanLin','L3','6.0','3.0','78%','-','pending_pm','雙盲不一致','2026-04-27T11:00'],
    ]);
    const msgs = [
        { id: '2', author: { bot: false }, content: '1 QL3 即可' }
    ];
    const result = parsePmReply({ messages: msgs, tsvPath: tsv, jobId: 'JOB-211' });
    if (result.action !== 'accept') throw new Error('expected accept');
    if (!result.annotation.includes('QL3')) throw new Error('annotation missing QL3');
});

// Test 3: 英文 keyword
test('retry → retry action', () => {
    const tsv = makeTsv([
        ['Sci_HanLin_L3','def','verify','Science','HanLin','L3','6.0','3.0','78%','-','pending_pm','雙盲不一致','2026-04-27T11:00'],
    ]);
    const msgs = [{ id: '2', author: { bot: false }, content: 'retry' }];
    const result = parsePmReply({ messages: msgs, tsvPath: tsv, jobId: 'JOB-211' });
    if (result.action !== 'retry') throw new Error('expected retry');
});

// Test 4: 沒 keyword → wait
test('好啦 → wait（沒 keyword）', () => {
    const tsv = makeTsv([
        ['Sci_HanLin_L3','def','verify','Science','HanLin','L3','6.0','3.0','78%','-','pending_pm','雙盲不一致','2026-04-27T11:00'],
    ]);
    const msgs = [{ id: '2', author: { bot: false }, content: '好啦' }];
    const result = parsePmReply({ messages: msgs, tsvPath: tsv, jobId: 'JOB-211' });
    if (result.action !== 'wait') throw new Error('expected wait got ' + result.action);
});

// Test 5: 0 個 pending_pm → wait
test('沒卡點 → wait', () => {
    const tsv = makeTsv([
        ['Sci_HanLin_L1','abc','prod','Science','HanLin','L1','6.2','-','-','-','done','30題','2026-04-27T10:00'],
    ]);
    const msgs = [{ id: '2', author: { bot: false }, content: '1' }];
    const result = parsePmReply({ messages: msgs, tsvPath: tsv, jobId: 'JOB-211' });
    if (result.action !== 'wait') throw new Error('expected wait');
});

// Test 6: 多 pending_pm + 缺 unit_id → wait + reason
test('多 pending + 沒 unit_id → wait', () => {
    const tsv = makeTsv([
        ['Sci_HanLin_L2','def','verify','Science','HanLin','L2','-','-','-','-','pending_pm','...','2026-04-27T11:00'],
        ['Sci_HanLin_L3','ghi','verify','Science','HanLin','L3','-','-','-','-','pending_pm','...','2026-04-27T11:00'],
    ]);
    const msgs = [{ id: '2', author: { bot: false }, content: '1' }];
    const result = parsePmReply({ messages: msgs, tsvPath: tsv, jobId: 'JOB-211' });
    if (result.action !== 'wait') throw new Error('expected wait');
    if (!result.reason || !result.reason.includes('unit_id')) throw new Error('expected reason about unit_id');
});

// Test 7: 多 pending + 有 unit_id → 解析正確
test('多 pending + 有 unit_id → 解析', () => {
    const tsv = makeTsv([
        ['Sci_HanLin_L2','def','verify','Science','HanLin','L2','-','-','-','-','pending_pm','...','2026-04-27T11:00'],
        ['Sci_HanLin_L3','ghi','verify','Science','HanLin','L3','-','-','-','-','pending_pm','...','2026-04-27T11:00'],
    ]);
    const msgs = [{ id: '2', author: { bot: false }, content: 'JOB-211 Sci_HanLin_L3 1' }];
    const result = parsePmReply({ messages: msgs, tsvPath: tsv, jobId: 'JOB-211' });
    if (result.action !== 'accept') throw new Error('expected accept');
    if (result.unit_id !== 'Sci_HanLin_L3') throw new Error('unit_id wrong');
});

// Test 8: bot 自己的訊息忽略
test('只有 bot 訊息 → wait', () => {
    const tsv = makeTsv([
        ['Sci_HanLin_L3','def','verify','Science','HanLin','L3','-','-','-','-','pending_pm','...','2026-04-27T11:00'],
    ]);
    const msgs = [{ id: '1', author: { bot: true }, content: '1' }];
    const result = parsePmReply({ messages: msgs, tsvPath: tsv, jobId: 'JOB-211' });
    if (result.action !== 'wait') throw new Error('expected wait');
});

console.log(`\n${pass}/${pass+fail} tests passed.`);
process.exit(fail > 0 ? 1 : 0);
```

- [ ] **Step 2：跑測試確認 fail**

Run: `node tests/progress_parse_pm_reply.test.js`
Expected: FAIL（require 失敗）

- [ ] **Step 3：寫 `scripts/progress_parse_pm_reply.js`**

```javascript
// scripts/progress_parse_pm_reply.js
// 解析 PM 對 Discord DM 的回覆 → 決定 Agent 後續動作
// spec: docs/superpowers/specs/2026-04-27-progress-resume-system-design.md
'use strict';

const fs = require('fs');

const KEYWORD_MAP = {
    '1': 'accept', 'accept': 'accept',
    '2': 'retry',  'retry':  'retry',
    '3': 'skip',   'skip':   'skip',
    '4': 'pause',  'pause':  'pause',
    '5': 'abort',  'abort':  'abort',
    '6': 'custom', 'custom': 'custom',
};

function readPendingPmUnits(tsvPath) {
    if (!fs.existsSync(tsvPath)) return [];
    const lines = fs.readFileSync(tsvPath, 'utf8').trim().split('\n');
    if (lines.length < 2) return [];
    const result = [];
    for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split('\t');
        if (cols.length >= 11 && cols[10] === 'pending_pm') {
            result.push(cols[0]);
        }
    }
    // 同 unit_id 多筆只取最新（後寫的覆蓋前寫的）
    return Array.from(new Set(result));
}

function parsePmReply({ messages, tsvPath, jobId }) {
    const pendingUnits = readPendingPmUnits(tsvPath);

    // 沒卡點 → wait（無事可做）
    if (pendingUnits.length === 0) {
        return { action: 'wait', reason: 'no pending_pm units' };
    }

    // 過濾 bot 訊息、取最新非 bot 的
    const userMsgs = messages.filter(m => !(m.author && m.author.bot));
    if (userMsgs.length === 0) {
        return { action: 'wait', reason: 'no user message' };
    }
    // 取最新（陣列最後一筆）
    const latest = userMsgs[userMsgs.length - 1];
    const firstLine = (latest.content || '').split('\n')[0].trim();
    const tokens = firstLine.split(/\s+/);

    // 找 keyword（任意位置）
    let keyword = null;
    let keywordIdx = -1;
    for (let i = 0; i < tokens.length; i++) {
        const t = tokens[i].toLowerCase();
        if (KEYWORD_MAP[t]) {
            keyword = KEYWORD_MAP[t];
            keywordIdx = i;
            break;
        }
    }

    if (!keyword) {
        return { action: 'wait', reason: 'no keyword found' };
    }

    // 找 unit_id（任意位置，含底線且 match 範圍 pattern）
    let unitFromMsg = null;
    for (const t of tokens) {
        // 簡化：含 _ 且至少兩段
        if (/^[A-Z][a-z]+_[A-Za-z]+_L\d+$/i.test(t)) {
            unitFromMsg = t;
            break;
        }
    }

    let unit_id;
    if (pendingUnits.length === 1) {
        unit_id = pendingUnits[0];
    } else {
        // 多 pending_pm → 必須含 unit_id
        if (!unitFromMsg || !pendingUnits.includes(unitFromMsg)) {
            return { action: 'wait', reason: 'multiple pending_pm but unit_id missing or unmatched' };
        }
        unit_id = unitFromMsg;
    }

    // 註記：第一行除 keyword 與 unit_id 外的 token + 第二行起
    const annotationTokens = tokens.filter((t, i) => i !== keywordIdx && t !== unitFromMsg && !t.match(new RegExp(`^${jobId}$`, 'i')));
    const restLines = (latest.content || '').split('\n').slice(1).join('\n').trim();
    const annotation = [annotationTokens.join(' ').trim(), restLines].filter(Boolean).join('\n').trim();

    return {
        action: keyword,
        unit_id,
        msg_id: latest.id,
        annotation,
    };
}

module.exports = { parsePmReply };

// CLI: node progress_parse_pm_reply.js --tsv <path> --job <id> --msgs-json <path>
if (require.main === module) {
    const args = process.argv.slice(2);
    let tsvPath, jobId, msgsJsonPath;
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--tsv') tsvPath = args[i+1];
        if (args[i] === '--job') jobId = args[i+1];
        if (args[i] === '--msgs-json') msgsJsonPath = args[i+1];
    }
    if (!tsvPath || !jobId || !msgsJsonPath) {
        console.error('Usage: --tsv <path> --job <id> --msgs-json <path>');
        process.exit(1);
    }
    const messages = JSON.parse(fs.readFileSync(msgsJsonPath, 'utf8'));
    const result = parsePmReply({ messages, tsvPath, jobId });
    console.log(JSON.stringify(result));
}
```

- [ ] **Step 4：跑測試確認 pass**

Run: `node tests/progress_parse_pm_reply.test.js`
Expected: 8/8 tests passed

- [ ] **Step 5：Commit**

```bash
git add scripts/progress_parse_pm_reply.js tests/progress_parse_pm_reply.test.js
git commit -m "feat: 加入 PM 回覆解析腳本

為什麼這樣做：
PM 回覆需要解析成結構化指令，避免歧義；嚴格模式 + 自適應配對
（單一 pending 時免 unit_id）降低 PM 表達成本。

技術變更：
- scripts/progress_parse_pm_reply.js 解析數字 1-6 與英文 keyword
- 自動配對單一 pending_pm；多 pending 需明示 unit_id
- 過濾 bot 訊息只取 PM 真實回覆
- tests/progress_parse_pm_reply.test.js 8 情境全綠

JOB: -"
```

---

## Task 8：scripts/progress_dm_finalize.sh PM 回應後收尾

**Files:**
- Create: `scripts/progress_dm_finalize.sh`

CLI:
```bash
progress_dm_finalize.sh <JOB> --action <accept|retry|skip|pause|abort|custom> --unit-id <id> --msg-id <id> [--annotation <text>]
```

行為：
1. 寫派工單 dm-log 區塊「Resumed by new Agent」段
2. 套用 PM 決定到進度檔（append 一筆對應 status 的 row）
3. 觸發 progress_sync

| action | 進度檔 status |
|:--|:--|
| accept | done |
| retry | retry |
| skip | manual_review |
| pause | paused（不續做） |
| abort | aborted |
| custom | （不寫進度檔，Agent 結束） |

- [ ] **Step 1：寫 `scripts/progress_dm_finalize.sh`**

```bash
#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

JOB="${1:?JOB id required}"
shift

JOBS_DIR="$(cd "$SCRIPT_DIR/.." && pwd)/jobs"
ACTION=""
UNIT_ID=""
MSG_ID=""
ANNOTATION=""
while [[ $# -gt 0 ]]; do
    case "$1" in
        --jobs-dir) JOBS_DIR="$2"; shift 2 ;;
        --action) ACTION="$2"; shift 2 ;;
        --unit-id) UNIT_ID="$2"; shift 2 ;;
        --msg-id) MSG_ID="$2"; shift 2 ;;
        --annotation) ANNOTATION="$2"; shift 2 ;;
        *) shift ;;
    esac
done

[[ -n "$ACTION" && -n "$UNIT_ID" && -n "$MSG_ID" ]] || { echo "Required: --action --unit-id --msg-id" >&2; exit 1; }

JOB_MD=$(ls "$JOBS_DIR"/${JOB}-*.md 2>/dev/null | grep -vE "(progress|Report)" | head -1)
[[ -n "$JOB_MD" ]] || { echo "ERROR: 派工單不存在" >&2; exit 1; }

# action → status 對照
case "$ACTION" in
    accept) NEW_STATUS="done" ;;
    retry)  NEW_STATUS="retry" ;;
    skip)   NEW_STATUS="manual_review" ;;
    pause)  NEW_STATUS="paused" ;;
    abort)  NEW_STATUS="aborted" ;;
    custom) NEW_STATUS="" ;;
    *) echo "Unknown action: $ACTION" >&2; exit 1 ;;
esac

# 寫派工單 dm-log
TS=$(date -u +"%Y-%m-%dT%H:%M")
RESUME_ENTRY=$(cat <<EOF

[$TS] Resumed by Agent
  pm_decision: $ACTION (msg_id: $MSG_ID)
  pm_annotation: $ANNOTATION
  resumed_unit: $UNIT_ID → status=$NEW_STATUS
EOF
)

TMP_OUT=$(mktemp)
gawk -v entry="$RESUME_ENTRY" '
    /<!-- progress-dm-log-start -->/ { print; in_block=1; in_log=1; next }
    /<!-- progress-dm-log-end -->/ { if (!appended) print entry; print; in_block=0; appended=1; next }
    in_block { print; next }
    { print }
' "$JOB_MD" > "$TMP_OUT"
mv "$TMP_OUT" "$JOB_MD"

# 套用 status 到進度檔（custom 不寫）
if [[ -n "$NEW_STATUS" ]]; then
    DESC="PM ${ACTION} via DM ${MSG_ID}"
    [[ -n "$ANNOTATION" ]] && DESC="$DESC ($ANNOTATION)"
    "$SCRIPT_DIR/progress_append.sh" "$JOB" \
        --jobs-dir "$JOBS_DIR" \
        --unit-id "$UNIT_ID" \
        --agent "pm" \
        --status "$NEW_STATUS" \
        --desc "$DESC"
fi

# sync
"$SCRIPT_DIR/progress_sync.sh" "$JOB" --jobs-dir "$JOBS_DIR"

echo "finalized: $JOB / $UNIT_ID / $ACTION → $NEW_STATUS" >&2
```

```bash
chmod +x scripts/progress_dm_finalize.sh
```

- [ ] **Step 2：手測**

```bash
TMP=$(mktemp -d)
mkdir -p "$TMP/jobs"
cp tests/fixtures/progress_test_job.md "$TMP/jobs/JOB-TEST-AG-fake.md"
cd "$TMP"; git init -q; git add .; git -c user.email=t@t -c user.name=t commit -q -m init
cd -

# 先跑 prepare 製造 pending_pm
bash scripts/progress_dm_prepare.sh JOB-TEST \
    --jobs-dir "$TMP/jobs" \
    --unit-id Sci_HanLin_L3 --reason "卡點測試"

# finalize
bash scripts/progress_dm_finalize.sh JOB-TEST \
    --jobs-dir "$TMP/jobs" \
    --action accept \
    --unit-id Sci_HanLin_L3 \
    --msg-id 12345 \
    --annotation "QL3 即可"

# 驗證進度檔有 done row
grep "Sci_HanLin_L3" "$TMP/jobs/JOB-TEST-progress.tsv" | grep "done" && echo "PASS"

# 驗證派工單有 Resumed
grep "Resumed by Agent" "$TMP/jobs/JOB-TEST-AG-fake.md" && echo "PASS"

rm -rf "$TMP"
```

Expected: 兩個 PASS

- [ ] **Step 3：Commit**

```bash
git add scripts/progress_dm_finalize.sh
git commit -m "feat: 加入 progress_dm_finalize PM 回應後收尾

為什麼這樣做：
PM 回覆解析後需要把決定套用到進度檔與派工單對話區；
獨立腳本讓 Agent 自主迴圈呼叫一致、易測試。

技術變更：
- scripts/progress_dm_finalize.sh action→status 對照
  （accept→done / retry→retry / skip→manual_review / pause→paused / abort→aborted）
- 寫派工單 dm-log Resumed 段、append 進度檔、觸發 sync

JOB: -"
```

---

## Task 9：.git/hooks/pre-commit 加 progress_sync 自動觸發

**Files:**
- Modify: `.git/hooks/pre-commit`

行為：當有 `jobs/JOB-*-progress.tsv` 變更時，自動跑 `scripts/progress_sync.sh JOB-XXX` 並把派工單 stage 進入 commit。

- [ ] **Step 1：先看現有 hook**

Run: `cat .git/hooks/pre-commit | head -60`

預期看到 Eidos 的「黃金測資 / manifest / UI 一致性」三節點。新增第四節點。

- [ ] **Step 2：在 hook 末尾加入 progress sync 節點**

於 `.git/hooks/pre-commit` 既有檢查通過之前（或最後）加入：

```bash
# >> [節點 4/4] 進度檔變更 → progress_sync 自動觸發
PROGRESS_TSV_CHANGED=$(git diff --cached --name-only | grep -E '^jobs/JOB-.+-progress\.tsv$' || true)

if [[ -n "$PROGRESS_TSV_CHANGED" ]]; then
    echo ">> [節點 4/4] 進度檔變更 → progress_sync 自動觸發..."
    while IFS= read -r tsv; do
        JOB=$(basename "$tsv" -progress.tsv)
        echo "   syncing $JOB ..."
        bash scripts/progress_sync.sh "$JOB"
        # stage 派工單變更
        JOB_MD=$(ls jobs/${JOB}-*.md 2>/dev/null | grep -vE "(progress|Report)" | head -1)
        if [[ -n "$JOB_MD" ]]; then
            git add "$JOB_MD"
        fi
    done <<<"$PROGRESS_TSV_CHANGED"
    echo "✅ [節點 4/4 通過] 進度檔同步完成。"
else
    echo ">> [節點 4/4] 進度檔未變更，跳過 progress_sync。"
fi
```

注意 hook 既有節點編號是 1/3，這裡用 4/4 代表本 hook 升級為 4 節點；若改動既有節點編號，把它們都改為 1/4 / 2/4 / 3/4。

- [ ] **Step 3：手測 hook**

```bash
TMP=$(mktemp -d)
cp -r .git tests/fixtures scripts "$TMP/"
cd "$TMP"
git init -q
mkdir -p jobs
cp tests/fixtures/progress_test_job.md jobs/JOB-TEST-AG-fake.md
cp tests/fixtures/progress_test_progress.tsv jobs/JOB-TEST-progress.tsv

git add jobs/JOB-TEST-AG-fake.md jobs/JOB-TEST-progress.tsv
# trigger pre-commit
git -c user.email=t@t -c user.name=t commit -m "test"

# 驗證派工單 progress-summary 有資料
grep "範圍總計：3" jobs/JOB-TEST-AG-fake.md && echo "PASS"
cd -; rm -rf "$TMP"
```

Expected: PASS

- [ ] **Step 4：Commit**

```bash
git add .git/hooks/pre-commit
git commit -m "chore: pre-commit hook 加入進度檔變更自動 sync 節點

為什麼這樣做：
Agent 可能忘記呼叫 progress_sync；放 pre-commit hook 自動觸發
保證進度檔與派工單摘要區永遠一致。

技術變更：
- .git/hooks/pre-commit 加第 4 節點
- 偵測 jobs/JOB-*-progress.tsv 變更 → 自動 syncs + git add 派工單
- 既有 1-3 節點不變

JOB: -"
```

注意：`.git/hooks/` 不在 git 版控內。為了給其他 dev 同步使用，把 hook 內容也存一份到 `scripts/git-hooks/pre-commit`，README 說明 dev 自行 symlink。

```bash
mkdir -p scripts/git-hooks
cp .git/hooks/pre-commit scripts/git-hooks/pre-commit
git add scripts/git-hooks/pre-commit
git commit --amend --no-edit
```

實務簡化：本 plan 不要求 amend、留待後續 docs_ops 再處理 hook 同步機制。

---

## Task 10：scripts/progress_monitor.sh 升級

**Files:**
- Create: `scripts/progress_monitor.sh`

行為：給定 JOB-XXX，輸出進度檔 status 分布、最近 5 筆 tail、pending_pm 詳細、manual_review 詳細。相容 g5s2_results.tsv schema（向下相容）。

- [ ] **Step 1：寫腳本**

```bash
#!/usr/bin/env bash
# scripts/progress_monitor.sh — 監控進度檔
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

JOB="${1:?JOB id required, e.g. JOB-211}"

JOBS_DIR="$(cd "$SCRIPT_DIR/.." && pwd)/jobs"
TSV="$JOBS_DIR/${JOB}-progress.tsv"

if [[ ! -f "$TSV" ]]; then
    # 向下相容 g5s2_results.tsv（JOB-210）
    if [[ "$JOB" == "JOB-210" && -f "$JOBS_DIR/g5s2_results.tsv" ]]; then
        TSV="$JOBS_DIR/g5s2_results.tsv"
    else
        echo "ERROR: 進度檔不存在 ($TSV)" >&2
        exit 1
    fi
fi

echo "=== $JOB 進度監控 ($(date '+%H:%M')) ==="
echo "tsv: $TSV"
echo

# 偵測 schema：13 欄為新版、12 欄為 g5s2 舊版
NF=$(awk -F'\t' 'NR==1 {print NF; exit}' "$TSV")
if [[ "$NF" == "13" ]]; then
    STATUS_COL=11
elif [[ "$NF" == "12" ]]; then
    STATUS_COL=10
else
    echo "WARN: 不認識的 schema (NF=$NF)"
    STATUS_COL=10
fi

echo "📈 status 分布："
gawk -F'\t' -v col=$STATUS_COL 'NR>1{print $col}' "$TSV" | sort | uniq -c | sort -rn
echo

echo "📊 各 agent 進度（status=done 或 keep）："
gawk -F'\t' -v col=$STATUS_COL 'NR>1 && ($col=="done" || $col=="keep") {a[$3]++} END {for (k in a) print "  "k": "a[k]" 單過閘"}' "$TSV"
echo

echo "⚠️  pending_pm 待回覆："
gawk -F'\t' -v col=$STATUS_COL 'NR>1 && $col=="pending_pm" {print "  "$1": "$12}' "$TSV"
echo

echo "🟡 manual_review 待裁定："
gawk -F'\t' -v col=$STATUS_COL 'NR>1 && $col=="manual_review" {print "  "$1": "$12}' "$TSV"
echo

echo "🔥 最新 5 筆："
tail -n 5 "$TSV" | column -t -s $'\t'
```

```bash
chmod +x scripts/progress_monitor.sh
```

- [ ] **Step 2：手測（用 fixture）**

```bash
mkdir -p /tmp/test-monitor/jobs
cp tests/fixtures/progress_test_progress.tsv /tmp/test-monitor/jobs/JOB-TEST-progress.tsv
JOBS_DIR=/tmp/test-monitor/jobs bash scripts/progress_monitor.sh JOB-TEST 2>&1 | head -20
rm -rf /tmp/test-monitor
```

Expected: 看到 status 分布 `2 done` 等。

- [ ] **Step 3：Commit**

```bash
git add scripts/progress_monitor.sh
git commit -m "feat: 加入 progress_monitor 監控進度檔

為什麼這樣做：
PM 與 Agent 都需要快速看 JOB 進度概貌；相容 g5s2 舊版 schema
（NF=12）讓 JOB-210 監控也能用同腳本。

技術變更：
- scripts/progress_monitor.sh 自動偵測 schema 欄數
- status 分布 / agent 進度 / pending_pm / manual_review / 最近 5 筆

JOB: -"
```

---

## Task 11：auto_generate_questions.js 加 5xx + network retry

**Files:**
- Modify: `scripts/auto_generate_questions.js:487-490`（5xx 處理）+ 包外 try/catch（network error）

現況（grep 確認）：
- callLLM 函式 line 378
- 429 處理 line 470-485（已存在）
- 5xx：line 487-490 直接 throw（待補）
- network error（fetch reject）：沒 catch（待補）

- [ ] **Step 1：在 callLLM 5xx 區段加 retry**

替換 `scripts/auto_generate_questions.js` 第 487-490 行：

原文：
```javascript
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API 錯誤: ${response.status} - ${errorText}`);
        }
```

改為：
```javascript
        // 5xx retry：connection / DNS / TCP timeout 由外層 try/catch 處理
        if (response.status >= 500 && response.status < 600) {
            const max5xx = global.GEN_5XX_MAX_RETRIES ?? 3;
            if (retryCount >= max5xx) {
                console.error(`[API] 5xx 重試 ${max5xx} 次仍失敗（status=${response.status}）EXIT_5XX`);
                process.stdout.write('EXIT_5XX\n');
                return [];
            }
            const wait5xx = Math.pow(3, retryCount) * 1000; // 1s/3s/9s
            console.warn(`[API] 5xx (${response.status})，等 ${wait5xx/1000}s 後重試（第 ${retryCount+1}/${max5xx} 次）...`);
            await new Promise(r => setTimeout(r, wait5xx));
            return callLLM(prompt, currentQuestionsSize, totalNeeded, filePath, retryCount + 1);
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API 錯誤: ${response.status} - ${errorText}`);
        }
```

- [ ] **Step 2：在 callLLM 整體加 try/catch 處理 network error**

callLLM 函式定義從 line 378 開始（`async function callLLM(...)`），找到函式 body 起始的 `{`，把整個 body 包進 try/catch：

```javascript
async function callLLM(prompt, currentQuestionsSize, totalNeeded, filePath = "", retryCount = 0) {
    try {
        // ... 既有所有邏輯 ...
    } catch (err) {
        // 過濾出 connection / DNS / TCP timeout 錯誤
        const networkCodes = ['ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT', 'EAI_AGAIN', 'ENETUNREACH', 'ECONNRESET'];
        const isNetwork = networkCodes.some(c => (err.code === c) || (err.message || '').includes(c));
        if (!isNetwork) throw err;

        const maxNet = global.GEN_NET_MAX_RETRIES ?? 3;
        if (retryCount >= maxNet) {
            console.error(`[API] 網路錯誤重試 ${maxNet} 次仍失敗 (${err.message}) EXIT_NETWORK`);
            process.stdout.write('EXIT_NETWORK\n');
            return [];
        }
        const waitNet = Math.pow(3, retryCount) * 1000;
        console.warn(`[API] 網路錯誤 ${err.code || err.message}，等 ${waitNet/1000}s 後重試（第 ${retryCount+1}/${maxNet} 次）...`);
        await new Promise(r => setTimeout(r, waitNet));
        return callLLM(prompt, currentQuestionsSize, totalNeeded, filePath, retryCount + 1);
    }
}
```

注意：實作時要小心既有 catch 邏輯（如有），合併進來；以及內部 throw（如 line 489 `throw new Error(...)`）會被外層 catch 接住，但這些不是 network error，should re-throw（上面 `if (!isNetwork) throw err;` 處理）。

- [ ] **Step 3：手測（模擬 network error）**

```bash
# 把 GEMINI_API_HOST 改成假 host，模擬 connection refused
GEMINI_API_HOST=https://unreachable-host-12345.invalid \
    node scripts/auto_generate_questions.js \
    --grade G3 --semester S2 --subject CHI --publisher HANLIN --lesson L1 \
    --target 1 --threshold 5 --qpm 1 --conservative --key dummy --model dummy 2>&1 | head -30
```

Expected: 看到「網路錯誤」訊息出現 3 次（重試），最後印 `EXIT_NETWORK`。

如果 GEMINI_API_HOST 不是腳本支援的環境變數，跳過手測、留待 JOB-211 試行階段（路徑 5）真實驗證。

- [ ] **Step 4：Commit**

```bash
git add scripts/auto_generate_questions.js
git commit -m "improve: 出題腳本加 5xx 與網路斷線退避重試

為什麼這樣做：
原本只處理 API 429 限流，網路斷線或 5xx 直接 throw、Agent 無從接續；
加上指數退避重試（1s/3s/9s），失敗時印 EXIT_NETWORK / EXIT_5XX
讓呼叫方識別並走斷點恢復路徑。

技術變更：
- callLLM 加 5xx retry（既有 429 規則旁，max 3 次）
- callLLM 包 try/catch 處理 ECONNREFUSED/ENOTFOUND/ETIMEDOUT/EAI_AGAIN/ENETUNREACH/ECONNRESET
- 失敗時 stdout 印 EXIT_NETWORK / EXIT_5XX 標準退出標記
- 環境變數 GEN_5XX_MAX_RETRIES / GEN_NET_MAX_RETRIES 可覆寫上限

JOB: -"
```

---

## Task 12：run_blind_eval.js 加 5xx + network retry

**Files:**
- Modify: `scripts/run_blind_eval.js`

- [ ] **Step 1：grep run_blind_eval.js 的 LLM 呼叫位置**

Run:
```bash
grep -nE "fetch|axios|response\.status|429|5\d\d" scripts/run_blind_eval.js | head -30
```

依輸出找到主要的 fetch / response 處理段落。

- [ ] **Step 2：找到對應 callBlindEval 或同等函式 → 套用同樣 try/catch + 5xx retry**

依 Step 1 找到的位置，套用 Task 11 Step 1-2 同樣的 patch（變數名替換為 `BLIND_5XX_MAX_RETRIES` / `BLIND_NET_MAX_RETRIES`）。

代碼結構與 Task 11 一致，差異只在：
- 變數名：BLIND_* 取代 GEN_*
- 函式名：依 run_blind_eval.js 實際 LLM call 函式
- 失敗 stdout 標記：EXIT_NETWORK / EXIT_5XX 同樣

- [ ] **Step 3：Commit**

```bash
git add scripts/run_blind_eval.js
git commit -m "improve: 盲測腳本加 5xx 與網路斷線退避重試

為什麼這樣做：
盲測長時間跑容易遇到網路抖動，原本沒重試導致整批失敗；
加上指數退避讓單次抖動不影響整體進度。

技術變更：
- run_blind_eval.js LLM 呼叫加 5xx retry 與 network error retry
- 失敗時 stdout 印 EXIT_NETWORK / EXIT_5XX 標準標記
- 環境變數 BLIND_5XX_MAX_RETRIES / BLIND_NET_MAX_RETRIES 可覆寫

JOB: -"
```

---

## Task 13：草擬 JOB-211 派工單與試行進度檔

**Files:**
- Create: `jobs/JOB-211-AG-斷點恢復子系統試行.md`（草稿、不直接 build；先給使用者過目）
- Create: `jobs/JOB-211-progress.tsv`（試行進度檔 header + config 區塊填入）

注意：依 CLAUDE.md §3.1 第 2 條「先草稿後建單」，本 task 只**草擬**派工單內容到對話，**不**呼叫 `job_manager.js create`。建單由使用者確認草稿後另行執行（plan 之外）。

- [ ] **Step 1：草擬派工單內容**

把以下內容輸出給使用者：

```markdown
# JOB-211 — 斷點恢復子系統試行

`job_type`: docs_ops（含 engineering 子段）
`spec_doc`: docs/superpowers/specs/2026-04-27-progress-resume-system-design.md
`plan_doc`: docs/superpowers/plans/2026-04-27-progress-resume-system.md
`parent_jobs`: JOB-210
`執行者`: AG（Cursor agent）+ PM（Claude Code, 驗收）

## 目標
驗證「斷點恢復子系統」的 5 條跑通路徑（spec §8.2），確認可行後補進 JOB-210 結案紀錄。

## 進度子系統設定
<!-- progress-config-start -->
schema: question_pipeline_v1
pm_response_timeout: 30
range:
  - subject: Science
    publisher: HanLin
    lessons: L1..L1
<!-- progress-config-end -->

## 進度摘要（自動同步，勿手動編輯）
<!-- progress-summary-start -->
（待 progress_sync 寫入）
<!-- progress-summary-end -->

## PM 對話紀錄（progress_dm.sh 自動寫入）
<!-- progress-dm-log-start -->
（待 progress_dm 寫入）
<!-- progress-dm-log-end -->

## 啟動 Checklist
- [ ] 已讀 spec docs/superpowers/specs/2026-04-27-progress-resume-system-design.md
- [ ] 已讀 plan docs/superpowers/plans/2026-04-27-progress-resume-system.md
- [ ] 進度子系統腳本（progress_*.sh / *.js）全 commit、tests 全綠
- [ ] pre-commit hook 已加第 4 節點

## 驗收 Checklist（5 條跑通路徑）
- [ ] 路徑 1 happy path：Sci_HanLin_L1 出題 done、進度檔/派工單同步
- [ ] 路徑 2 中斷重啟：kill -9 後新 Agent 接續、不重做
- [ ] 路徑 3 DM 互動：人為製造卡點 → DM 送達 → PM 回 1 → done
- [ ] 路徑 4 timeout 退出：pm_response_timeout=5 不回應 → 5 分超時 → status 保 pending_pm
- [ ] 路徑 5 底層 retry：關 Wi-Fi 5 秒 → Agent 退避 retry → 成功

## 成果 Checklist
- [ ] jobs/JOB-211-Report.md 完成（5 條路徑佐證）
- [ ] spec 補強（如有發現）→ 直接修改 spec 並 commit
- [ ] JOB-210 Report 末加索引行「後續補強：JOB-211」
- [ ] /pj_sync 全域知識沉澱
- [ ] Discord 結案回報（CLAUDE.md §3.5）

## 真實回報本次對話的模型與花費
＄作業匯總：Token數: - | 花費: $- | 使用模型: claude-opus-4-7 + gemini-flash + claude-haiku | 執行者: AG+PM
（試行 JOB，每條路徑單獨記）

## 邊界與遺留
- 本 JOB 範圍只跑 Sci_HanLin_L1 一單（spec §8.5）
- 階段 1 剩 8 單試行成功後另開 JOB
- 試行任一路徑 fail → 暫停、PM 介入決定是否改 spec／改實作／退設計
```

- [ ] **Step 2：草擬試行進度檔**

對話呈現給使用者：

```
jobs/JOB-211-progress.tsv 內容（試行用 header + 範圍宣告）：
unit_id	commit	agent	subject	publisher	lesson	CQI-P	CQI-V	Match%	QL	status	desc	ts
```

只有 header、無資料 row（試行開始時 progress_next 會找到 Sci_HanLin_L1 為下一單）。

- [ ] **Step 3：呈現給使用者並等待確認**

訊息：

> 派工單草稿與進度檔模板如上。請審核後告知是否：
> (a) 直接以此草稿建單（我會跑 `job_manager.js next` → `create JOB-211 ...`）
> (b) 修改某段（請告知）
> (c) 暫不建單，先處理其他事

- [ ] **Step 4：（待使用者確認後）建單**

在使用者選 (a) 後執行：

```bash
# 確認流水號
node scripts/job_manager.js next  # 預期回 JOB-211（除非中間有人插單）

# 建單（名稱依 next 結果調整）
node scripts/job_manager.js create "斷點恢復子系統試行" AG docs_ops

# 把草稿內容寫入派工單檔案（建單腳本只建空殼，要把上面 Step 1 草稿貼進去）
# 用 Edit/Write 工具把 jobs/JOB-211-AG-斷點恢復子系統試行.md 內容替換為 Step 1 草稿

# 建立進度檔（只寫 header）
cat > jobs/JOB-211-progress.tsv <<'EOF'
unit_id	commit	agent	subject	publisher	lesson	CQI-P	CQI-V	Match%	QL	status	desc	ts
EOF

git add jobs/JOB-211-*.md jobs/JOB-211-progress.tsv
git commit -m "chore: 建立 JOB-211 派工單與試行進度檔

為什麼這樣做：
斷點恢復子系統工程實作完成，進入試行階段；以 JOB-211 獨立 JOB
驗證 5 條跑通路徑，避免汙染 JOB-210（已 close）。

技術變更：
- jobs/JOB-211-AG-斷點恢復子系統試行.md 含 progress-config 區塊
  與三段 Checklist（啟動／驗收／成果）
- jobs/JOB-211-progress.tsv 13 欄空 header

JOB: JOB-211"
```

注意：本 task 在 plan 執行階段**至 Step 3 為止**；Step 4 由使用者確認後另行操作（屬於 JOB-211 開單動作，不在 plan 範圍）。

---

## Self-Review

### Spec coverage 檢查

| spec 章節 | 對應 task | 狀態 |
|:--|:--|:--|
| §3.1 三件式檔案結構 | Task 1 fixture + Task 13 JOB-211 | ✅ |
| §3.2 四支核心腳本 | Task 3-8 | ✅ |
| §3.3 自主迴圈流程 | Task 5 (next) + Task 6-8 (dm) 串聯實現 | ✅ |
| §4.1 13 欄 schema | Task 1 fixture header + Task 3 append 寫入 | ✅ |
| §4.2 status 通用化 | Task 8 finalize action→status 對照 | ✅ |
| §4.3 6 核心欄 | Task 3 append 支援 `-` 占位 | ✅ |
| §5.1 progress-config | Task 2 parse_config_field/range | ✅ |
| §5.2 progress-summary | Task 4 sync | ✅ |
| §5.3 dm-log | Task 6 prepare + Task 8 finalize | ✅ |
| §6.1-6.4 PM 回覆協議 | Task 7 parse_pm_reply.js | ✅ |
| §7.1 底層 retry | Task 11+12 | ✅ |
| §7.2 progress_dm 失敗處理 | （依賴 Agent 邏輯，spec §7.2 改在 JOB-211 試行驗證） | 🟡 部分（exit 1 由腳本處理；外層 retry 邏輯由 Agent 實作） |
| §7.3 progress_next 邊界 | Task 5（exit 1 派工單缺 config，exit 2 schema 不對未實作） | 🟡 部分（schema 不對 exit 2 留 JOB-211 試行發現再補） |
| §8 試行範圍 | Task 13 JOB-211 派工單 | ✅ |
| §9 g5s2_results.tsv 過渡 | Task 10 progress_monitor 相容 | ✅ |
| §10 與 JOB-210 關係 | Task 13 派工單 parent_jobs 欄 | ✅ |

### Placeholder scan

grep 結果（plan 內）：
- 沒有「TBD」「TODO」「fill in」
- 「（待 progress_sync 寫入）」「（待 progress_dm 寫入）」是 fixture / 派工單裡的 marker 內容、由腳本填入，不是 placeholder
- Task 13 Step 4 「依 next 結果調整」是合理 conditional（流水號可能因中間插單而改變，不能寫死 211）

### Type/方法一致性

腳本介面對照表（確認跨 task 引用一致）：

| 函式/腳本 | 定義 task | 引用 task |
|:--|:--|:--|
| `parse_config_field` | Task 2 | Task 6 (dm_prepare 讀 timeout) |
| `parse_config_range` | Task 2 | Task 4 (sync), Task 5 (next) |
| `progress_done_units` | Task 2 | Task 5 (next) |
| `progress_pending_pm_units` | Task 2 | Task 7 (parse_pm_reply 內部讀 tsv) |
| `progress_append.sh` | Task 3 | Task 6 (dm_prepare), Task 8 (finalize) |
| `progress_sync.sh` | Task 4 | Task 6 (dm_prepare), Task 8 (finalize), Task 9 (hook) |
| `progress_next.sh` | Task 5 | （由 Agent 自主迴圈呼叫，plan 外） |
| `progress_dm_prepare.sh` | Task 6 | （由 Agent 卡點時呼叫） |
| `progress_dm_finalize.sh` | Task 8 | （由 Agent 收到 PM 回應後呼叫） |
| `parsePmReply` (JS) | Task 7 | （由 Agent 在 polling 時呼叫） |
| EXIT_NETWORK/EXIT_5XX | Task 11+12 | （由 Agent 解析底層腳本 stdout 識別） |

無不一致。

### 修正

兩處 🟡 部分覆蓋（spec §7.2 外層 retry、§7.3 schema 不對 exit 2）標記，留待 JOB-211 試行階段發現再補；不阻塞 plan 執行。

---

## Execution Handoff

Plan 已完成、self-review 通過。兩種執行方式可選：

**1. Subagent-Driven（推薦）**：每個 task 派 fresh subagent 執行（無歷史 context 干擾），review 介面、快速 iteration。
**2. Inline Execution**：在當前 session 直接執行所有 task，批次到 commit checkpoint 才 review。

哪個方式？
