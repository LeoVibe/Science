# JOB-228 Phase 5 Batch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 啟動 109 份 codex 結構化抽取的長時批次運作機制（作業 + 檢核 + 回報三件事），預期掛機 18-72 小時，使用者只看 Discord 即可掌握進度，並在完成後自動走完 Phase B/C/D/E 結案。

**Architecture:** 依長時任務範本五元件骨架（① Progress State / ② Worker / ③ Dashboard / ④ Loop Wrapper / ⑤ Wakeup+Discord），dispatch.sh 與 progress.json 已存在；本 plan 補強 ② 加 timeout 與 Layer 1 驗證、新建 ③ ④ 由 codex 寫、Claude 用 ScheduleWakeup 排 ⑤。

**Tech Stack:** bash + python3（dashboard）+ node（progress 解析）+ codex CLI（gpt-5.5 / ChatGPT 訂閱）+ Claude Code MCP（Discord、ScheduleWakeup）

**Spec:** `docs/superpowers/specs/2026-05-09-job228-phase5-batch-design.md`

---

## Task 1: dispatch.sh 加 25 min hard timeout watchdog

**Files:**
- Modify: `scripts/jobs/JOB-228/A2_full_dispatch.sh:85-91`

- [ ] **Step 1: 讀現況**

Run: `Read scripts/jobs/JOB-228/A2_full_dispatch.sh:80-105`
確認 line 86-91 是 `echo "$PROMPT" | codex exec ... &; CODEX_PID=$!; ...; wait $CODEX_PID; EXIT_CODE=$?`

- [ ] **Step 2: 用 Edit 工具替換 watchdog pattern**

把：
```bash
  # 派工 codex exec
  echo "$PROMPT" | codex exec --skip-git-repo-check --full-auto - \
    > "$LOG_FILE" 2>&1 &
  CODEX_PID=$!
  echo "[$(date '+%H:%M:%S')] [Rank $i] codex PID=$CODEX_PID, log=$LOG_FILE"
  wait $CODEX_PID
  EXIT_CODE=$?
```

替換為：
```bash
  # 派工 codex exec（含 25 min hard timeout watchdog）
  echo "$PROMPT" | codex exec --skip-git-repo-check --full-auto - \
    > "$LOG_FILE" 2>&1 &
  CODEX_PID=$!
  ( sleep 1500; kill $CODEX_PID 2>/dev/null && echo "[$(date '+%H:%M:%S')] [Rank $i] ⏱️ TIMEOUT 25min, killed PID=$CODEX_PID" >> "$LOG_FILE" ) &
  WATCHDOG=$!
  echo "[$(date '+%H:%M:%S')] [Rank $i] codex PID=$CODEX_PID watchdog=$WATCHDOG, log=$LOG_FILE"
  wait $CODEX_PID
  EXIT_CODE=$?
  kill $WATCHDOG 2>/dev/null   # 正常結束殺 watchdog
```

- [ ] **Step 3: Dry-run 驗證 — rank 1 已完成不會被 watchdog 影響**

Run: `bash scripts/jobs/JOB-228/A2_full_dispatch.sh --rank 1 2>&1 | tail -10`
Expected: `[Rank 1] 已完成，跳過`（因為 _full_progress.json.completed 已含 1）

- [ ] **Step 4: Commit**

```bash
git add scripts/jobs/JOB-228/A2_full_dispatch.sh
git commit -m "$(cat <<'EOF'
feat: JOB-228 dispatch.sh 加 25min hard timeout watchdog

為什麼這樣做：
codex 偶爾會卡內部 retry 不返回。沒有 hard timeout 一份卡住可以拖住
整個 loop 數小時。watchdog process 在 1500 秒後 SIGTERM kill codex，
讓 dispatch.sh 接到 exit≠0 標 failed 後跑下一份。

技術變更：
- A2_full_dispatch.sh:85-91 codex exec 包入 watchdog ( sleep 1500; kill ) &
- 正常結束時主動 kill watchdog 避免殘留 process

JOB: JOB-228
EOF
)"
```

---

## Task 2: dispatch.sh 加 Layer 1 驗證擴充

**Files:**
- Modify: `scripts/jobs/JOB-228/A2_full_dispatch.sh:127-145`

- [ ] **Step 1: 讀現況**

Run: `Read scripts/jobs/JOB-228/A2_full_dispatch.sh:115-150`
確認 line 127-136 是「編碼合法性快檢」，line 138-145 是「寫入 progress.json」

- [ ] **Step 2: Edit 工具在 line 137（ILLEGAL 計算後、寫 progress.json 前）插入 Layer 1 擴充驗證**

在 `echo "[$(date '+%H:%M:%S')] [Rank $i] ✅ 完成 | 非法編碼=$ILLEGAL"` 那行**之前**，插入：

```bash
  # Layer 1 驗證擴充：questions count、_summary 一致性、confidence 列舉、reason 非空
  VALIDATION=$(node -e "
    const fs=require('fs');
    const j=JSON.parse(fs.readFileSync('$OUTPUT_PATH'));
    const result={};
    result.questions_count = (j.questions||[]).length;
    result.summary_total_match = (j._summary?.total_questions === result.questions_count);
    const confSet = new Set();
    let emptyReason = 0;
    for (const q of j.questions||[]) for (const c of q.codes_candidate||[]) {
      confSet.add(c.confidence);
      if (!c.reason || c.reason.trim().length < 5) emptyReason++;
    }
    result.confidence_legal = [...confSet].every(v=>['high','medium','low'].includes(v));
    result.reason_nonempty = (emptyReason === 0);
    result.empty_reason_count = emptyReason;
    console.log(JSON.stringify(result));
  ")
  echo "[$(date '+%H:%M:%S')] [Rank $i] Layer1: $VALIDATION"
```

並把後續 `p['rank_$i']={...}` 那段改成包含 validation_layer1：

```bash
  node -e "
    const fs=require('fs'); const p=JSON.parse(fs.readFileSync('$PROGRESS_FILE'));
    p.completed.push($i);
    p.running=null;
    p['rank_$i']={
      exam_id:'$EXAM_ID',
      illegal_codes:'$ILLEGAL',
      log:'$LOG_FILE',
      output:'$OUTPUT_PATH',
      finished_at:new Date().toISOString(),
      validation_layer1: $VALIDATION
    };
    fs.writeFileSync('$PROGRESS_FILE', JSON.stringify(p, null, 2));
  "
```

- [ ] **Step 3: 用 rank 1 既有輸出驗證 Layer 1 邏輯**

Run（單跑驗證計算邏輯，不重抽 rank 1）：
```bash
node -e "
const fs=require('fs');
const j=JSON.parse(fs.readFileSync('knowledge/3_考古題/3_L2_結構化抽取/三下/三下_社會_翰林/翰林_108_伸東國小_第一次段考.json'));
const result={};
result.questions_count = (j.questions||[]).length;
result.summary_total_match = (j._summary?.total_questions === result.questions_count);
const confSet = new Set();
let emptyReason = 0;
for (const q of j.questions||[]) for (const c of q.codes_candidate||[]) {
  confSet.add(c.confidence);
  if (!c.reason || c.reason.trim().length < 5) emptyReason++;
}
result.confidence_legal = [...confSet].every(v=>['high','medium','low'].includes(v));
result.reason_nonempty = (emptyReason === 0);
result.empty_reason_count = emptyReason;
console.log(JSON.stringify(result, null, 2));
"
```

Expected:
```json
{
  "questions_count": 71,
  "summary_total_match": true,
  "confidence_legal": true,
  "reason_nonempty": true,
  "empty_reason_count": 0
}
```

- [ ] **Step 4: Commit**

```bash
git add scripts/jobs/JOB-228/A2_full_dispatch.sh
git commit -m "feat: JOB-228 dispatch.sh 加 Layer 1 驗證擴充

questions count / _summary 一致性 / confidence 列舉 / reason 非空檢查，
寫入 progress.json validation_layer1 欄位供 dashboard 與 spot check 使用。

JOB: JOB-228"
```

---

## Task 3: 派 codex 寫 dashboard.py

**Files:**
- Create: `scripts/jobs/JOB-228/dashboard.py`

- [ ] **Step 1: 寫 codex 派工 prompt**

Write 到 `/tmp/codex_dashboard_prompt.md`：

```markdown
# 任務：寫 JOB-228 Phase 5 Dashboard 腳本

## 目標
建立 `scripts/jobs/JOB-228/dashboard.py`，讀 progress JSON 印出進度儀表板。

## 輸入
- `scripts/jobs/JOB-228/_full_progress.json`（dispatch 寫入的進度）
- `scripts/jobs/JOB-228/_full_targets.json`（109 份目標清單，含 publisher 欄位）
- 使用者執行：`python3 scripts/jobs/JOB-228/dashboard.py [--since-minutes N] [--json]`

## 輸出（六個必備元素）

```
╔══════════════════════════════════════════════════════════════╗
║  📊 JOB-228 Phase 5 進度儀表板                               ║
║  🕐 回報時間：2026-05-09 (週六) 00:30:00                       ║
╚══════════════════════════════════════════════════════════════╝
  整體：done=N  failed=N  pending=N
  完成度：N/109 = NN.N%

  近 60 分鐘增量：
    N 份完成 | 平均 N.N min/份
    編碼合法率：NN.N%（NN/NN 違規）

  各分組進度：
  翰林  ████░░░░  N/30  (NN%)
  康軒  ██░░░░░░  N/57  (NN%)
  南一  ░░░░░░░░  N/22  (NN%)

  預估剩餘：NNN min (N.Nh)
  預估完成：YYYY-MM-DD HH:MM
╚════════════════════════════════════════════════════════════╝
```

`--since-minutes 60` 縮 since 區間
`--json` 改輸出 JSON（給 wakeup pipeline 串）

## 規範
1. 純 stdlib（json/datetime/sys/argparse）
2. macOS zsh 環境
3. 進度條 8 格，每格代表 12.5%
4. 預估剩餘用近 since-minutes 平均速率推算（若 since 內 0 份，用整體平均）
5. 完成度若 = 100%，預估區段印「✅ 已完成」
6. 不對 progress.json schema 做嚴格檢查（dispatch.sh 已驗證），讀不到欄位用 0 fallback

## 完成標準
腳本可以以下兩種方式跑：
```
python3 scripts/jobs/JOB-228/dashboard.py
python3 scripts/jobs/JOB-228/dashboard.py --since-minutes 60 --json
```

跑完後輸出 git diff 摘要 + 確認檔案存在。
```

- [ ] **Step 2: 派 codex 執行**

```bash
mkdir -p scripts/orchestrator-logs
cat /tmp/codex_dashboard_prompt.md | codex exec --skip-git-repo-check --full-auto - 2>&1 | tee scripts/orchestrator-logs/JOB-228-codex-dashboard.log | tail -50
```

Expected: codex 完成回報 git diff 摘要 + 檔案存在確認

- [ ] **Step 3: Claude 驗收 — 試跑兩種模式**

```bash
ls -la scripts/jobs/JOB-228/dashboard.py
python3 scripts/jobs/JOB-228/dashboard.py 2>&1 | head -30
echo "---"
python3 scripts/jobs/JOB-228/dashboard.py --json 2>&1 | head -10
```

Expected:
- 檔案存在（≥ 50 行 Python）
- 預設模式輸出含「📊 JOB-228」「🕐 回報時間」「整體」「完成度」「翰林」「康軒」「南一」「預估完成」
- `--json` 模式輸出合法 JSON

- [ ] **Step 4: Commit**

```bash
git add scripts/jobs/JOB-228/dashboard.py scripts/orchestrator-logs/JOB-228-codex-dashboard.log
git commit -m "feat: JOB-228 Phase 5 dashboard.py（codex 寫）

讀 _full_progress.json 印進度儀表板，支援 --since-minutes 與 --json。
六大必備元素：時間戳、計數、完成度、近期增量、分組進度條、預估完成。

JOB: JOB-228"
```

---

## Task 4: 派 codex 寫 continuous_full_loop.sh

**Files:**
- Create: `scripts/jobs/JOB-228/continuous_full_loop.sh`

- [ ] **Step 1: 寫 codex 派工 prompt**

Write 到 `/tmp/codex_loop_prompt.md`：

```markdown
# 任務：寫 JOB-228 Phase 5 Loop Wrapper

## 目標
建立 `scripts/jobs/JOB-228/continuous_full_loop.sh`，連續呼叫 dispatch.sh 直到 109 份完成。

## 邏輯
1. `count_remaining()`：讀 `_full_progress.json`，回傳 109 - len(completed)
2. 主迴圈：
   - while remaining > 0:
     - 呼叫 `bash scripts/jobs/JOB-228/A2_full_dispatch.sh`（dispatch 內部已序列跑剩下所有 rank）
     - sleep 30 秒
     - 重新算 remaining
     - 連續兩輪沒減少 → break + Discord 警告（觸發機制：寫一行 ERROR 到 stderr 讓 Claude wakeup 偵測）
3. **完成觸發 Phase B**：remaining = 0 時呼叫 `bash scripts/jobs/JOB-228/run_phase_b.sh`（暫不存在，留空 echo 即可，後續 Task 7 補建）

## 必含保護（依長時任務範本 §三-④坑點）
- `set -uo pipefail`
- `count_remaining` 內部 try/except，失敗 echo -1 並 exit 0（讓 wrapper 看 -1 sleep 重試）
- 數字驗證 `[[ "$remaining" =~ ^-?[0-9]+$ ]]`
- 連續兩輪 prev_remaining == remaining 自停

## 用法
```
nohup bash scripts/jobs/JOB-228/continuous_full_loop.sh > scripts/orchestrator-logs/JOB-228-full-loop.log 2>&1 &
```

## 完成標準
- 腳本可以 dry-run 跑一次檢查邏輯（不會真的跑，因為 rank 1 已 done，dispatch 會跳過再算 remaining）
- 跑時會輸出 `=== Batch #N 啟動，剩 N ===` 之類的標記讓 grep 找
```

- [ ] **Step 2: 派 codex 執行**

```bash
cat /tmp/codex_loop_prompt.md | codex exec --skip-git-repo-check --full-auto - 2>&1 | tee scripts/orchestrator-logs/JOB-228-codex-loop.log | tail -50
```

- [ ] **Step 3: Claude 驗收 — 短測 dry run**

```bash
ls -la scripts/jobs/JOB-228/continuous_full_loop.sh
chmod +x scripts/jobs/JOB-228/continuous_full_loop.sh
# 看腳本是否含關鍵元素
grep -E "count_remaining|set -uo|prev_remaining|Batch #" scripts/jobs/JOB-228/continuous_full_loop.sh
```

Expected: 4 行匹配（count_remaining、set -uo pipefail、prev_remaining、Batch #）

- [ ] **Step 4: Commit**

```bash
git add scripts/jobs/JOB-228/continuous_full_loop.sh scripts/orchestrator-logs/JOB-228-codex-loop.log
git commit -m "feat: JOB-228 Phase 5 continuous loop wrapper（codex 寫）

連續呼叫 dispatch.sh 跑剩下 ranks，含 count_remaining 防護、連兩輪
無進展自停、完成自動觸發 Phase B。

JOB: JOB-228"
```

---

## Task 5: 寫 codex spot check prompt template

**Files:**
- Create: `scripts/jobs/JOB-228/spot_check_prompt_template.md`

- [ ] **Step 1: Write 檔案**

```markdown
# JOB-228 Phase 5 Spot Check Prompt Template

> 由 Claude wakeup 階段呼叫。每次注入一個 rank，由 codex 對該 rank 的 JSON 做嚴格 review，輸出 PASS/WARN/FAIL 結論。

## 任務

對 `{OUTPUT_PATH}` 做以下 5 項檢查並輸出 JSON 結論到 `scripts/jobs/JOB-228/_spot_check.log`（append）：

1. **Schema 結構對照黃金樣本**
   - 出版社 = 翰林 → 對照 `knowledge/3_考古題/3_L2_結構化抽取/_golden_samples/翰林_108_文德國小_第二次段考.json`
   - 出版社 = 康軒 → 對照 `knowledge/3_考古題/3_L2_結構化抽取/_golden_samples/康軒_111_新北安和國小_期中考.json`
   - 南一 → 對照 `knowledge/3_考古題/3_L2_結構化抽取/_pilot/南一_108_成功國小_第一次段考.json`
   - 比對：頂層 keys 一致性、_meta 欄位完整、questions[] 結構

2. **Reason 樣本空泛性（抽 5 條）**
   - 隨機抽 5 個 questions[].codes_candidate[].reason
   - 判斷是否引用題幹原文片段（≥ 5 字題幹引用）
   - 標 nonspecific 的數量

3. **編碼分布健康度**
   - 計算 _summary.code_frequency 最高頻 1 碼的占比
   - 占比 > 60% 標 distribution_skewed

4. **認知層次分布**
   - 計算 _summary.by_cognitive_level 各層比例
   - 「記憶」占比 > 50% 或「應用/分析/評鑑」合計 < 20% 標 cognitive_thin

5. **編碼合法率**（從 progress.json 拿）
   - 直接讀 `progress.json.rank_{N}.illegal_codes`

## 輸出格式

append 一行 JSON 到 `scripts/jobs/JOB-228/_spot_check.log`：

```json
{"rank":N,"exam_id":"...","verdict":"PASS","checks":{"schema":"ok","reason":"5/5 specific","distribution":"ok","cognitive":"healthy","illegal":"0/71"},"timestamp":"ISO 時間"}
```

verdict 規則：
- 5 項全 ok → PASS
- 任 1 項 warn → WARN
- 任 1 項 fail（如 schema 重大偏離、illegal > 5%） → FAIL

## Placeholder

- `{RANK_NUM}`: 由 wakeup 注入
- `{OUTPUT_PATH}`: 由 wakeup 從 progress.json.rank_{N}.output 取
- `{PUBLISHER}`: 由 wakeup 從 _full_targets.json 取
```

- [ ] **Step 2: Commit**

```bash
git add scripts/jobs/JOB-228/spot_check_prompt_template.md
git commit -m "feat: JOB-228 spot check prompt template（codex 用）

每次 wakeup 由 Claude 注入 rank → 派 codex 跑此 template → append 結
果到 _spot_check.log。Claude meta-review 讀此 log 決定 PASS/WARN/FAIL。

JOB: JOB-228"
```

---

## Task 6: 啟動 loop（背景跑）+ 第一次 Discord 通知 + 排第一個 ScheduleWakeup

**Files:** 無新檔，啟動執行

- [ ] **Step 1: 啟動 loop**

```bash
nohup bash scripts/jobs/JOB-228/continuous_full_loop.sh > scripts/orchestrator-logs/JOB-228-full-loop.log 2>&1 &
LOOP_PID=$!
echo "LOOP_PID=$LOOP_PID"
echo $LOOP_PID > /tmp/job228_loop_pid
sleep 3
ps -p $LOOP_PID > /dev/null && echo "✅ loop running" || echo "❌ loop died"
```

Expected: `✅ loop running`，PID 記在 `/tmp/job228_loop_pid`

- [ ] **Step 2: 確認 dashboard 顯示**

```bash
python3 scripts/jobs/JOB-228/dashboard.py | head -25
```

Expected: 完成度 1/109 = 0.9%（rank 1 已 done）

- [ ] **Step 3: tail loop log 確認 rank 2 已啟動**

```bash
sleep 30
tail -20 scripts/orchestrator-logs/JOB-228-full-loop.log
```

Expected: 看到 `[Rank 2/109]` 或 `Batch #1 啟動` 字樣

- [ ] **Step 4: 第一次 Discord 通知（Claude 親發）**

呼叫 `mcp__plugin_discord_discord__reply`，chat_id=`1487738477608177714`，text 為：

```
🚀 **JOB-228 Phase 5 啟動**
🕐 啟動時間：2026-05-09 (週六) 00:XX:XX

**任務**：109 份三下社會考古題 codex L2 結構化抽取
**預估**：18 小時連續跑（單份 ~10 min）
**模式**：全自動（loop + 60 min 自動回報 + 完成自動進 Phase B/C/D/E）
**Loop PID**：<填 LOOP_PID>
**Dashboard**：python3 scripts/jobs/JOB-228/dashboard.py

掛機愉快，每小時自動回報。
```

- [ ] **Step 5: 給使用者 /loop dynamic mode prompt 草稿**

`ScheduleWakeup` 限 /loop dynamic mode 用，/schedule 是 remote 不能存取本機。改為：
1. Claude 印出「請打 `/loop <wakeup-prompt>` 進入 dynamic mode」
2. 使用者打 `/loop` + 完整 wakeup prompt（Task 7 內容濃縮版）
3. /loop 啟動後 Claude 跑 wakeup → 跑完 ScheduleWakeup 自選 60 min 餵同樣 prompt → 重複

**草稿 prompt（使用者複製貼到 /loop 後）**：

```
請執行 JOB-228 Phase 5 wakeup pattern：

(1) 印當下時間（粗體）
(2) 跑 python3 scripts/jobs/JOB-228/dashboard.py --since-minutes 60
(3) 從 _full_progress.json 找最近完成 1 份 → 派 codex 用 spot_check_prompt_template.md 做 review → 讀 _spot_check.log 最後一行
(4) Claude meta-review verdict（PASS/WARN/FAIL）
(5) 算近 10 次 spot check 違規數，≥3 觸發 brainstorming
(6) 推 Discord 到 chat_id=1487738477608177714，格式依 plan §Task 7 step 6
(7) ps -p $(cat /tmp/job228_loop_pid) 確認 loop running，df -h . 看磁碟
(8) 若 progress.completed.length < 109 → ScheduleWakeup 60 min 後再跑同 prompt；若 109 完成 → 進 Phase B（依 plan Task 8-10）
```

---

## Task 7: Wakeup 處置（每 60 min 重複，Loop 期間）

**這個 task 不是一次性的步驟，是 wakeup prompt 的內容。每次 ScheduleWakeup 觸發時 Claude 走以下流程：**

- [ ] **Step 1: 印當下時間**

輸出粗體：`**🕐 回報時間：YYYY-MM-DD (週X) HH:MM:SS**`

- [ ] **Step 2: 跑 dashboard**

```bash
python3 scripts/jobs/JOB-228/dashboard.py --since-minutes 60
```

讀完整輸出。

- [ ] **Step 3: 派 codex 做 spot check（最近 1 份）**

```bash
LATEST_RANK=$(node -e "
const fs=require('fs');
const p=JSON.parse(fs.readFileSync('scripts/jobs/JOB-228/_full_progress.json'));
console.log(p.completed[p.completed.length-1] || 0);
")
if [ "$LATEST_RANK" != "0" ]; then
  OUTPUT_PATH=$(node -e "
  const fs=require('fs');
  const p=JSON.parse(fs.readFileSync('scripts/jobs/JOB-228/_full_progress.json'));
  console.log(p['rank_'+$LATEST_RANK]?.output || '');
  ")
  PUBLISHER=$(node -e "
  const fs=require('fs');
  const t=JSON.parse(fs.readFileSync('scripts/jobs/JOB-228/_full_targets.json'));
  console.log(t.targets[$LATEST_RANK-1]?.publisher || '');
  ")
  PROMPT=$(sed \
    -e "s|{RANK_NUM}|$LATEST_RANK|g" \
    -e "s|{OUTPUT_PATH}|$OUTPUT_PATH|g" \
    -e "s|{PUBLISHER}|$PUBLISHER|g" \
    scripts/jobs/JOB-228/spot_check_prompt_template.md)
  echo "$PROMPT" | codex exec --skip-git-repo-check --full-auto - 2>&1 | tail -20
fi
```

讀 `scripts/jobs/JOB-228/_spot_check.log` 最後一行，取出 verdict。

- [ ] **Step 4: Claude meta-review**

- 若 verdict=PASS → 採信，記「rank N PASS」
- 若 verdict=WARN/FAIL → Claude 親自 dive 讀該 JSON（Read tool），判斷實際嚴重性

- [ ] **Step 5: 計算累積違規**

```bash
node -e "
const fs=require('fs');
const lines = fs.readFileSync('scripts/jobs/JOB-228/_spot_check.log','utf8').trim().split('\n');
const recent = lines.slice(-10).map(l=>JSON.parse(l));
const violations = recent.filter(r=>r.verdict !== 'PASS').length;
console.log('近 10 次 spot check 違規數:', violations);
"
```

- 若 ≥ 3 → **觸發 brainstorming**：Claude invoke `superpowers:brainstorming` skill，主題為「JOB-228 codex 品質漂移診斷」

- [ ] **Step 6: 推送 Discord**

呼叫 `mcp__plugin_discord_discord__reply`，chat_id=`1487738477608177714`，text 為：

```
📊 **JOB-228 Phase 5 進度回報**
🕐 回報時間：**YYYY-MM-DD (週X) HH:MM:SS**

**整體**：done=N / failed=N / pending=N
**完成度**：N/109 = **N.N%** (+N.Npp / 60min)

**近 60 分鐘**：N 份 / 平均 N min/份 / 編碼合法率 N.N%

**各分組**：
翰林 ████░░░░  N/30
康軒 ░░░░░░░░  N/57
南一 ░░░░░░░░  N/22

**Loop**：PID <PID> running
**Spot check（rank N）**：PASS/WARN/FAIL — 一句話結論
**預估完成**：YYYY-MM-DD HH:MM (剩 ~Nh)
```

- [ ] **Step 7: 確認 loop 還活著 + 磁碟剩餘**

```bash
LOOP_PID=$(cat /tmp/job228_loop_pid 2>/dev/null)
ps -p $LOOP_PID > /dev/null && echo "loop running" || echo "❌ loop died"
df -h . | tail -1 | awk '{print "磁碟剩餘: "$4}'
```

若 loop died → Discord 緊急警告 + 停止排 wakeup + 等使用者指示。
若磁碟 < 5GB → Discord 警告。

- [ ] **Step 8: 排下次 wakeup OR 進 Phase B**

```bash
COMPLETED=$(node -e "console.log(JSON.parse(require('fs').readFileSync('scripts/jobs/JOB-228/_full_progress.json')).completed.length)")
echo "completed: $COMPLETED / 109"
```

- 若 $COMPLETED < 109 → 呼叫 `ScheduleWakeup` 60 min 後再跑同 prompt
- 若 $COMPLETED === 109 → 不排 wakeup，啟動 Phase B（見 Task 8）

---

## Task 8: 全自動結案 — Phase B 驗證腳本

**Files:**
- Create: `scripts/jobs/JOB-228/B_validate_codes.py`
- Create: `knowledge/3_考古題/3_L2_結構化抽取/_validation_report.json`

**觸發時機**：Task 7 Step 8 偵測 109/109 完成時

- [ ] **Step 1: 派 codex 寫 B_validate_codes.py**

寫 prompt 到 `/tmp/codex_phase_b_prompt.md`：

```markdown
# 任務：寫 JOB-228 Phase B 驗證腳本

## 目標
建立 `scripts/jobs/JOB-228/B_validate_codes.py`，依派工單 jobs/JOB-228-AG-G3S2-社會-考古題L2結構化抽取.md 第 257-282 行規格做全量驗證。

## 輸入
讀全部 116 份 JSON：
- 黃金 2 份：`knowledge/3_考古題/3_L2_結構化抽取/_golden_samples/*.json`
- Pilot 5 份：`knowledge/3_考古題/3_L2_結構化抽取/_pilot/*.json`
- Phase 5 109 份：`knowledge/3_考古題/3_L2_結構化抽取/三下/三下_社會_*/*.json`
- 35 條合法編碼：`knowledge/3_考古題/3_L2_結構化抽取/_meta/social_codes_legal_II.json`

## 驗證規則
- A 類非法編碼必踢
- B 類錯階段必踢（非「Ⅱ」階段的編碼）
- C 類同碼重複去重保留 highest confidence

## 輸出
`knowledge/3_考古題/3_L2_結構化抽取/_validation_report.json`，含：
- `total_files`: 116
- `total_questions`: N
- `total_codes`: N
- `violations`: { A: N, B: N, C: N }
- `auto_corrected`: N（違規率 < 5%）
- `flagged_for_rerun`: N（5-20%）
- `manual_review`: N（≥ 20%）
- `per_file`: [{file, questions_n, violations: {...}, action: 'corrected'/'rerun'/'manual'}]

純 stdlib，可重跑。
```

派 codex：`cat /tmp/codex_phase_b_prompt.md | codex exec --skip-git-repo-check --full-auto -`

- [ ] **Step 2: bash 跑 B_validate_codes.py**

```bash
python3 scripts/jobs/JOB-228/B_validate_codes.py 2>&1 | tee scripts/orchestrator-logs/JOB-228-phase-b.log
```

確認 `_validation_report.json` 已產出。

- [ ] **Step 3: Claude 看 _validation_report.json，決定是否進 Phase C**

- 若 manual_review > 20 → Discord 警告，停下等使用者指示
- 若 < 20 → 進 Task 9 Phase C

- [ ] **Step 4: Commit**

```bash
git add scripts/jobs/JOB-228/B_validate_codes.py knowledge/3_考古題/3_L2_結構化抽取/_validation_report.json
git commit -m "feat: JOB-228 Phase B 全量驗證（codex 寫腳本）

讀 116 份 JSON 跑 A/B/C 類違規檢核。

JOB: JOB-228"
```

---

## Task 9: 全自動結案 — Phase C 三版本彙整 + Phase D 全科目整合

**Files:**
- Create: `knowledge/3_考古題/3_L2_結構化抽取/三下/三下_社會_翰林/_L2_summary.md`
- Create: `knowledge/3_考古題/3_L2_結構化抽取/三下/三下_社會_康軒/_L2_summary.md`
- Create: `knowledge/3_考古題/3_L2_結構化抽取/三下/三下_社會_南一/_L2_summary.md`
- Create: `knowledge/3_考古題/3_L2_結構化抽取/三下/三下_社會_L2_整合.md`

- [ ] **Step 1: 派 codex 草擬三版本 _L2_summary.md**

prompt 到 `/tmp/codex_phase_c_prompt.md`，依派工單第 286-316 行規格。每出版社一個 summary，含題型分布、編碼分布、認知層次、迷思盤點、跨課對照。

- [ ] **Step 2: Claude 驗收三份 summary**

Read 三份檔案，至少確認：
- 含「題型分布」「編碼分布」「認知層次」「迷思盤點」四個 H2 段落
- 數字與 `_validation_report.json` 對得上
- 引用具體 exam_id（不空泛）

- [ ] **Step 3: 派 codex 草擬全科目整合 MD**

依派工單第 286-316 行規格，比對三版本。

- [ ] **Step 4: Claude 驗收 + Commit**

```bash
git add knowledge/3_考古題/3_L2_結構化抽取/
git commit -m "feat: JOB-228 Phase C/D 三版本彙整 + 全科目整合（codex 草擬，Claude 驗收）

JOB: JOB-228"
```

---

## Task 10: 全自動結案 — Phase E Report + 收尾

**Files:**
- Create: `knowledge/3_考古題/3_L2_結構化抽取/_L2_quality_report.json`
- Create: `jobs/JOB-228-Report.md`

- [ ] **Step 1: 派 codex 寫 _L2_quality_report.json + JOB-228-Report.md**

依 `jobs/_JOB-REPORT-TEMPLATE.md` 格式，含 CQI 指標（不適用則填 -）、異動清單、Checklist、遺留問題。

- [ ] **Step 2: Claude 驗收 Report**

Read `jobs/JOB-228-Report.md`，確認含：
- 116 份完成（黃金 2 + Pilot 5 + Phase 5 109）
- _validation_report 數據摘要
- 三版本 summary 連結
- 遺留問題（如某幾份 manual_review、後續四/五/六下擴展）

- [ ] **Step 3: 結案三步**

```bash
node scripts/job_manager.js close JOB-228
```

執行 `/pj_sync` skill。

- [ ] **Step 4: Discord 結案回報**

呼叫 `mcp__plugin_discord_discord__reply`，chat_id=`1487738477608177714`：

```
🎉 **JOB-228 Phase 5 結案**
🕐 結案時間：YYYY-MM-DD (週X) HH:MM:SS

**最終成果**：
- 116 份結構化抽取完成（黃金 2 + Pilot 5 + Phase 5 109）
- 編碼合法率：N.N%
- manual_review 標記：N 份
- 預估總耗時：N 小時

**主要產出**：
- 三版本 _L2_summary.md（翰林/康軒/南一）
- 全科目 三下_社會_L2_整合.md
- _validation_report.json
- jobs/JOB-228-Report.md

JOB-228 Phase 5 全自動執行成功。Token 量見 Report。
```

- [ ] **Step 5: 最終 commit（Phase B/C/D/E 全部）**

```bash
git add -A
git commit -m "$(cat <<'EOF'
feat: JOB-228 Phase 5 結案 — 116 份三下社會 L2 結構化抽取完成

為什麼這樣做：
完成 JOB-228 Phase 5 全自動結案路徑：109 份 codex 結構化抽取 +
Phase B 驗證 + Phase C/D 三版本彙整 + 全科目整合 + Phase E Report。

技術變更：
- 109 份 JSON 結構化抽取（含 schema 驗證、編碼合法率、認知分布）
- _validation_report.json 全量稽核
- 三版本 _L2_summary.md
- 三下_社會_L2_整合.md
- jobs/JOB-228-Report.md 結案報告

JOB: JOB-228

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Self-Review

**1. Spec coverage：**

| Spec 章節 | 對應 Task |
|:--|:--|
| §一 執行者分工 | Task 3 dashboard / Task 4 loop / Task 5 spot check / Task 8-10 Phase B/C/D/E 派 codex |
| §二-① Progress State | 已存在（dispatch.sh 寫入機制），Task 2 擴充 validation_layer1 |
| §二-② Worker | Task 1（timeout）+ Task 2（Layer 1 驗證） |
| §二-③ Dashboard | Task 3 |
| §二-④ Loop Wrapper | Task 4 |
| §二-⑤ Wakeup + Discord | Task 6（啟動）+ Task 7（每小時） |
| §三 品質檢核雙層 | Task 2（Layer 1）+ Task 5（Layer 2 prompt）+ Task 7（執行） |
| §四 回報機制 | Task 6 第一次 + Task 7 每 60 min |
| §五 全自動結案 | Task 8（Phase B）+ Task 9（C/D）+ Task 10（E） |
| §六 失敗模式處置 | Task 1（timeout）+ Task 4（連兩輪自停）+ Task 7 step 7（PID/磁碟）|
| §七 啟動順序 | Task 1-6 |
| §八 結束條件 | Task 7 step 8（109/109 → Phase B）+ Task 10 step 4（Discord 結案） |

✅ 全覆蓋。

**2. Placeholder scan：**

- Task 6 step 4 Discord 文字含「<填 LOOP_PID>」— 這是執行時填入的，不是 plan placeholder
- Task 10 step 1 「填 -」是 CQI 不適用的合法值
- 無 TBD/TODO/「Add appropriate ...」/「Similar to Task N」

✅ 無 placeholder。

**3. Type consistency：**

- progress.json 欄位：`completed` (array)、`rank_N` (object)、`validation_layer1` (object) — 在 Task 2/3/7/8 都一致
- 路徑 `_full_progress.json` / `_full_targets.json` / `_validation_report.json` / `_spot_check.log` — 全篇一致
- Loop PID 變數 `/tmp/job228_loop_pid` — Task 6/7 一致

✅ 一致。

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-09-job228-phase5-batch.md`.
