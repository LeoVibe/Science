#!/bin/bash
# JOB-246 Phase 1b: Codex 抽查仲裁 dispatch (3 worker)
# 仿 JOB-242~245 pattern，但只跑「需要仲裁」的試卷子集。

set -u
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$ROOT"

OUT_DIR="knowledge/3_考古題/3_L2_結構化抽取/四下/alignment_science/_partial"
LOG_DIR="scripts/jobs/JOB-246/_phase1_logs"
PROMPT_TPL="scripts/jobs/JOB-246/A1b_codex_arbitration_prompt.md"

mkdir -p "$LOG_DIR"
> "$LOG_DIR/phase1b_timing.csv"

run_one() {
  local WORKER=$1
  local EXAM_ID=$2
  local L2_PATH=$3
  local INPUT_PATH="$OUT_DIR/alignment_partial_${EXAM_ID}.json"
  local LOG_PATH="$LOG_DIR/${EXAM_ID}.log"

  if [ ! -f "$INPUT_PATH" ]; then
    echo "[Worker $WORKER][$EXAM_ID] SKIP (no Phase 1a partial)"
    return
  fi

  local PROMPT
  PROMPT=$(sed -e "s|{EXAM_ID}|$EXAM_ID|g" \
               -e "s|{INPUT_PATH}|$INPUT_PATH|g" \
               -e "s|{L2_PATH}|$L2_PATH|g" \
               "$PROMPT_TPL")

  echo "[Worker $WORKER][$EXAM_ID] start"
  T0=$(date +%s)
  codex exec --skip-git-repo-check --sandbox workspace-write "$PROMPT" \
    < /dev/null > "$LOG_PATH" 2>&1
  EXIT=$?
  T1=$(date +%s)
  ELAPSED=$((T1-T0))
  echo "[Worker $WORKER][$EXAM_ID] done elapsed=${ELAPSED}s exit=$EXIT"
  echo "$EXAM_ID,$ELAPSED,$EXIT,$WORKER" >> "$LOG_DIR/phase1b_timing.csv"
}

run_worker() {
  local WORKER=$1
  local WORKER_TARGETS=$2
  local TOTAL
  TOTAL=$(python3 -c "import json; print(len(json.load(open('$WORKER_TARGETS', encoding='utf-8'))))")
  local IDX=0

  while IFS= read -r entry; do
    IDX=$((IDX+1))
    local EXAM_ID L2_PATH
    EXAM_ID=$(echo "$entry" | python3 -c "import sys,json; print(json.loads(sys.stdin.read())['exam_id'])")
    L2_PATH=$(echo "$entry" | python3 -c "import sys,json; print(json.loads(sys.stdin.read())['l2_path'])")
    echo "[Worker $WORKER] progress $IDX/$TOTAL: $EXAM_ID"
    run_one "$WORKER" "$EXAM_ID" "$L2_PATH"
  done < <(python3 -c "import json; [print(json.dumps(t, ensure_ascii=False)) for t in json.load(open('$WORKER_TARGETS', encoding='utf-8'))]")

  echo "[Worker $WORKER] all $TOTAL done"
}

START=$(date +%s)
echo "=== JOB-246 Phase 1b dispatch start at $(date) ==="

run_worker "A_翰林" "scripts/jobs/JOB-246/_full_targets_A_翰林.json" > "$LOG_DIR/worker_A_翰林.log" 2>&1 &
PID_A=$!
run_worker "B_康軒" "scripts/jobs/JOB-246/_full_targets_B_康軒.json" > "$LOG_DIR/worker_B_康軒.log" 2>&1 &
PID_B=$!
run_worker "C_南一" "scripts/jobs/JOB-246/_full_targets_C_南一.json" > "$LOG_DIR/worker_C_南一.log" 2>&1 &
PID_C=$!

wait $PID_A
wait $PID_B
wait $PID_C

END=$(date +%s)
echo "=== Phase 1b 完成 總耗時 $((END-START))s ==="
