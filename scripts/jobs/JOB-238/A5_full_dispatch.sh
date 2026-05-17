#!/bin/bash
# JOB-238 Phase 5 Codex Full Dispatcher (worker A/B/C) — 四下_國語
# 序列跑單一 worker 的 ~38 份；每份產出後寫 progress 並做 schema + 編碼合法率驗證。
#
# 用法：
#   bash scripts/jobs/JOB-238/A5_full_dispatch.sh A           # 跑 worker A 全部
#   bash scripts/jobs/JOB-238/A5_full_dispatch.sh A --rank 3  # 只跑 worker A 第 3 份
#   bash scripts/jobs/JOB-238/A5_full_dispatch.sh A --fresh   # 重置 progress

set -e
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$ROOT"

WORKER=""
ONLY_RANK=""
FRESH=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    A|B|C) WORKER="$1"; shift ;;
    --rank) ONLY_RANK="$2"; shift 2 ;;
    --fresh) FRESH=1; shift ;;
    *) echo "Unknown arg: $1" >&2; exit 1 ;;
  esac
done

if [ -z "$WORKER" ]; then
  echo "ERROR: 必須指定 worker A|B|C" >&2
  echo "用法: bash $0 [A|B|C] [--rank N] [--fresh]" >&2
  exit 1
fi

TARGETS_FILE="scripts/jobs/JOB-238/_full_targets_${WORKER}.json"
PROMPT_TEMPLATE="scripts/jobs/JOB-238/A1_pilot_prompt_template_chinese_g4.md"
PROGRESS_FILE="scripts/jobs/JOB-238/_full_progress_${WORKER}.json"
LOG_DIR="scripts/orchestrator-logs"
LEGAL_CODES="knowledge/3_考古題/3_L2_結構化抽取/_meta/chinese_codes_legal_II.json"

mkdir -p "$LOG_DIR" \
  "knowledge/3_考古題/3_L2_結構化抽取/六下/四下_國語_翰林" \
  "knowledge/3_考古題/3_L2_結構化抽取/六下/四下_國語_康軒" \
  "knowledge/3_考古題/3_L2_結構化抽取/六下/四下_國語_南一"

if [ ! -f "$TARGETS_FILE" ]; then echo "ERROR: $TARGETS_FILE 不存在" >&2; exit 1; fi
if ! command -v codex >/dev/null 2>&1; then echo "ERROR: codex CLI 未安裝" >&2; exit 1; fi

COUNT=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$TARGETS_FILE')).targets.length)")
echo "[$(date '+%H:%M:%S')] [Worker $WORKER] 找到 $COUNT 份目標"

if [ ! -f "$PROGRESS_FILE" ] || [ "$FRESH" = "1" ]; then
  echo '{"started_at":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","worker":"'$WORKER'","completed":[],"failed":[],"running":null}' > "$PROGRESS_FILE"
  echo "[$(date '+%H:%M:%S')] [Worker $WORKER] 初始化新 progress.json"
fi

DONE_RANKS=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$PROGRESS_FILE')).completed.join(' '))")
if [ -n "$DONE_RANKS" ]; then
  echo "[$(date '+%H:%M:%S')] [Worker $WORKER] 自動 resume：已完成 ranks=[$DONE_RANKS]"
fi

for ((i=1; i<=COUNT; i++)); do
  if [ -n "$ONLY_RANK" ] && [ "$ONLY_RANK" != "$i" ]; then continue; fi
  if [ -n "$DONE_RANKS" ] && echo " $DONE_RANKS " | grep -q " $i "; then
    echo "[$(date '+%H:%M:%S')] [Worker $WORKER] [Rank $i] 已完成，跳過"
    continue
  fi

  EXAM_ID=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$TARGETS_FILE')).targets[$i-1].exam_id)")
  MD_PATH=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$TARGETS_FILE')).targets[$i-1].md_path)")
  OUTPUT_PATH=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$TARGETS_FILE')).targets[$i-1].output_path)")
  PUBLISHER=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$TARGETS_FILE')).targets[$i-1].publisher)")
  FLAGS=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$TARGETS_FILE')).targets[$i-1].quality_flags.join(','))")

  echo ""
  echo "════════════════════════════════════════════════════════════"
  echo "[$(date '+%H:%M:%S')] [Worker $WORKER] [Rank $i/$COUNT] $EXAM_ID"
  echo "    Publisher: $PUBLISHER  Flags: $FLAGS"
  echo "    MD:       $MD_PATH"
  echo "    Output:   $OUTPUT_PATH"
  echo "════════════════════════════════════════════════════════════"

  node -e "
    const fs=require('fs'); const p=JSON.parse(fs.readFileSync('$PROGRESS_FILE'));
    p.running={rank:$i, exam_id:'$EXAM_ID', started_at:new Date().toISOString()};
    fs.writeFileSync('$PROGRESS_FILE', JSON.stringify(p, null, 2));
  "

  LOG_FILE="$LOG_DIR/JOB-238-full-${WORKER}-rank$i.log"

  PROMPT=$(sed -e "s|{EXAM_ID}|$EXAM_ID|g" \
                -e "s|{MD_PATH}|$MD_PATH|g" \
                -e "s|{OUTPUT_PATH}|$OUTPUT_PATH|g" \
                "$PROMPT_TEMPLATE")

  # codex exec 用 argument 模式（避開 stdin UTF-8 bug，已驗證 Task 4）
  codex exec --skip-git-repo-check --full-auto "$PROMPT" \
    > "$LOG_FILE" 2>&1 &
  CODEX_PID=$!
  ( sleep 1500; kill $CODEX_PID 2>/dev/null && echo "[$(date '+%H:%M:%S')] [Rank $i] ⏱️ TIMEOUT 25min, killed PID=$CODEX_PID" >> "$LOG_FILE" ) &
  WATCHDOG=$!
  echo "[$(date '+%H:%M:%S')] [Worker $WORKER] [Rank $i] codex PID=$CODEX_PID watchdog=$WATCHDOG, log=$LOG_FILE"
  wait $CODEX_PID
  EXIT_CODE=$?
  kill $WATCHDOG 2>/dev/null

  if [ $EXIT_CODE -ne 0 ]; then
    echo "[$(date '+%H:%M:%S')] [Worker $WORKER] [Rank $i] ❌ codex 失敗 (exit=$EXIT_CODE)"
    node -e "
      const fs=require('fs'); const p=JSON.parse(fs.readFileSync('$PROGRESS_FILE'));
      p.failed.push({rank:$i, exam_id:'$EXAM_ID', exit_code:$EXIT_CODE, log:'$LOG_FILE'});
      p.running=null;
      fs.writeFileSync('$PROGRESS_FILE', JSON.stringify(p, null, 2));
    "
    continue
  fi

  if [ ! -f "$OUTPUT_PATH" ]; then
    echo "[$(date '+%H:%M:%S')] [Worker $WORKER] [Rank $i] ❌ 輸出檔不存在: $OUTPUT_PATH"
    node -e "
      const fs=require('fs'); const p=JSON.parse(fs.readFileSync('$PROGRESS_FILE'));
      p.failed.push({rank:$i, exam_id:'$EXAM_ID', error:'output_not_found'});
      p.running=null;
      fs.writeFileSync('$PROGRESS_FILE', JSON.stringify(p, null, 2));
    "
    continue
  fi

  if ! node -e "JSON.parse(require('fs').readFileSync('$OUTPUT_PATH'))" 2>/dev/null; then
    echo "[$(date '+%H:%M:%S')] [Worker $WORKER] [Rank $i] ❌ JSON 格式錯誤"
    node -e "
      const fs=require('fs'); const p=JSON.parse(fs.readFileSync('$PROGRESS_FILE'));
      p.failed.push({rank:$i, exam_id:'$EXAM_ID', error:'invalid_json'});
      p.running=null;
      fs.writeFileSync('$PROGRESS_FILE', JSON.stringify(p, null, 2));
    "
    continue
  fi

  ILLEGAL=$(node -e "
    const fs=require('fs');
    const j=JSON.parse(fs.readFileSync('$OUTPUT_PATH'));
    const legal=JSON.parse(fs.readFileSync('$LEGAL_CODES'));
    const set=new Set([...legal.performance, ...legal.content].map(c=>c.code));
    let bad=0, total=0;
    for(const q of j.questions||[]) for(const c of q.codes_candidate||[]){total++; if(!set.has(c.code))bad++;}
    console.log(bad+'/'+total);
  ")

  VALIDATION=$(node -e "
    const fs=require('fs');
    const j=JSON.parse(fs.readFileSync('$OUTPUT_PATH'));
    const result={};
    result.questions_count = (j.questions||[]).length;
    result.summary_total_match = (j._summary && j._summary.total_questions === result.questions_count);
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

  echo "[$(date '+%H:%M:%S')] [Worker $WORKER] [Rank $i] ✅ 完成 | 非法編碼=$ILLEGAL | Layer1=$VALIDATION"
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
done

echo ""
echo "[$(date '+%H:%M:%S')] [Worker $WORKER] 全部完成"
COMPLETED=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$PROGRESS_FILE')).completed.length)")
FAILED=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$PROGRESS_FILE')).failed.length)")
echo "[Worker $WORKER] completed=$COMPLETED, failed=$FAILED"
