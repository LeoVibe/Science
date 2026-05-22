#!/bin/bash
# JOB-245 Phase 1 全量 dispatch（64 份新版，3 worker 並行）
# 已扣除 5 份 pilot 已跑 + 50 份舊版 + 3 份明確排除
# 預估時間：max(21,20,23) × ~5 min ≈ 115 min ≈ 2 hr
#
# Worker 分配：
#   A 翰林：21 份 (111-113)
#   B 康軒：20 份 (111-112 + unknown 2)
#   C 南一：23 份 (111-113 + unknown 2)

set -u

ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$ROOT"

OUT_DIR="knowledge/3_考古題/3_L2_結構化抽取/六下/alignment/_partial"
LOG_DIR="scripts/jobs/JOB-245/_phase1_logs"
PROMPT_TPL="scripts/jobs/JOB-245/A1_align_prompt_template.md"

mkdir -p "$OUT_DIR" "$LOG_DIR"
> "$LOG_DIR/full_timing.csv"

build_prompt() {
  local EXAM_ID=$1
  local L2_JSON_PATH=$2
  local OUT_PATH=$3
  local ACADEMIC_YEAR=$4

  sed -e "s|{EXAM_ID}|$EXAM_ID|g" \
      -e "s|{L2_JSON_PATH}|$L2_JSON_PATH|g" \
      -e "s|{OUTPUT_PATH}|$OUT_PATH|g" \
      -e "s|{ACADEMIC_YEAR}|$ACADEMIC_YEAR|g" \
      "$PROMPT_TPL"
}

run_one() {
  local WORKER=$1
  local EXAM_ID=$2
  local L2_JSON_PATH=$3
  local PUBLISHER=$4
  local YEAR=$5
  local OUT_PATH="$OUT_DIR/alignment_partial_${EXAM_ID}.json"
  local LOG_PATH="$LOG_DIR/${EXAM_ID}.log"

  # 已有 partial 跳過（續跑友好）
  if [ -f "$OUT_PATH" ]; then
    echo "[Worker $WORKER][$EXAM_ID] SKIP (already done)"
    echo "$EXAM_ID,0,skip,$PUBLISHER,$YEAR,$WORKER" >> "$LOG_DIR/full_timing.csv"
    return 0
  fi

  local PROMPT
  PROMPT=$(build_prompt "$EXAM_ID" "$L2_JSON_PATH" "$OUT_PATH" "$YEAR")

  echo "[Worker $WORKER][$EXAM_ID] start ($PUBLISHER $YEAR 學年)"
  T0=$(date +%s)
  # < /dev/null 防止 codex 讀走 while loop 的 stdin (bash pipe loop 經典坑)
  codex exec --skip-git-repo-check --full-auto "$PROMPT" \
    < /dev/null > "$LOG_PATH" 2>&1
  EXIT=$?
  T1=$(date +%s)
  ELAPSED=$((T1-T0))
  echo "[Worker $WORKER][$EXAM_ID] done elapsed=${ELAPSED}s exit=$EXIT"
  echo "$EXAM_ID,$ELAPSED,$EXIT,$PUBLISHER,$YEAR,$WORKER" >> "$LOG_DIR/full_timing.csv"
}

run_worker() {
  local WORKER=$1
  local TARGETS_JSON=$2

  local TOTAL
  TOTAL=$(python3 -c "import json; print(len(json.load(open('$TARGETS_JSON'))))")
  echo "[Worker $WORKER] start, $TOTAL targets"

  local IDX=0
  while IFS= read -r entry; do
    IDX=$((IDX+1))
    local EXAM_ID L2_PATH PUB YEAR
    EXAM_ID=$(echo "$entry" | python3 -c "import sys,json; print(json.loads(sys.stdin.read())['exam_id'])")
    L2_PATH=$(echo "$entry" | python3 -c "import sys,json; print(json.loads(sys.stdin.read())['l2_path'])")
    PUB=$(echo "$entry" | python3 -c "import sys,json; print(json.loads(sys.stdin.read())['publisher'])")
    YEAR=$(echo "$entry" | python3 -c "import sys,json; print(json.loads(sys.stdin.read())['year'])")
    echo "[Worker $WORKER] progress $IDX/$TOTAL: $EXAM_ID"
    run_one "$WORKER" "$EXAM_ID" "$L2_PATH" "$PUB" "$YEAR"
  done < <(python3 -c "import json; [print(json.dumps(t, ensure_ascii=False)) for t in json.load(open('$TARGETS_JSON'))]")

  echo "[Worker $WORKER] all $TOTAL done"
}

START=$(date +%s)
echo "=== JOB-245 Phase 1 全量 dispatch start at $(date) ==="
echo ""

# 3 worker 並行
run_worker "A_翰林" "scripts/jobs/JOB-245/_full_targets_A_翰林.json" > "$LOG_DIR/worker_A_翰林.log" 2>&1 &
PID_A=$!
run_worker "B_康軒" "scripts/jobs/JOB-245/_full_targets_B_康軒.json" > "$LOG_DIR/worker_B_康軒.log" 2>&1 &
PID_B=$!
run_worker "C_南一" "scripts/jobs/JOB-245/_full_targets_C_南一.json" > "$LOG_DIR/worker_C_南一.log" 2>&1 &
PID_C=$!

echo "Worker PIDs: A=$PID_A B=$PID_B C=$PID_C"
echo ""

wait $PID_A; A_EXIT=$?
wait $PID_B; B_EXIT=$?
wait $PID_C; C_EXIT=$?

END=$(date +%s)
TOTAL=$((END-START))

echo ""
echo "=== Phase 1 全量 dispatch 完成 ==="
echo "Worker A 翰林 exit=$A_EXIT"
echo "Worker B 康軒 exit=$B_EXIT"
echo "Worker C 南一 exit=$C_EXIT"
echo "總耗時 ${TOTAL}s ($(($TOTAL / 60)) min)"
echo ""

echo "=== Timing 統計 ==="
echo "  總 timing 行數: $(wc -l < $LOG_DIR/full_timing.csv)"
echo "  exit=0 數: $(awk -F',' '$3==0' $LOG_DIR/full_timing.csv | wc -l)"
echo "  exit!=0 數: $(awk -F',' '$3!=0 && $3!="skip"' $LOG_DIR/full_timing.csv | wc -l)"
echo "  skip 數: $(awk -F',' '$3=="skip"' $LOG_DIR/full_timing.csv | wc -l)"
echo ""

echo "=== 產出檢查（_partial/）==="
ls -la "$OUT_DIR/" | grep alignment_partial | wc -l | xargs echo "  partial JSON 檔數:"
echo ""

echo "=== JSON 合法性檢查 ==="
FAIL=0
for f in "$OUT_DIR"/*.json; do
  if ! python3 -c "import json; json.load(open('$f'))" 2>/dev/null; then
    echo "  ❌ $(basename "$f") - JSON FAIL"
    FAIL=$((FAIL+1))
  fi
done
if [ $FAIL -eq 0 ]; then
  echo "  ✅ 全部 JSON 合法"
fi
echo ""

echo "完成。下一步：執行 A4_merge.py 合併為 alignment_raw.json"
