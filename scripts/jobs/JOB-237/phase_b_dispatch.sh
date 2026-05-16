#!/bin/bash
# JOB-237 Phase B — 社會/自然 L2 補抽 dispatcher
# 用法：
#   bash scripts/jobs/JOB-237/phase_b_dispatch.sh [五下_社會|五下_自然|六下_社會]
#   bash scripts/jobs/JOB-237/phase_b_dispatch.sh 五下_社會 --rank 3  # 只跑第 rank=3 份

ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$ROOT"

TARGETS_FILE="scripts/jobs/JOB-237/phase_b_targets.json"
LOG_DIR="scripts/orchestrator-logs"
mkdir -p "$LOG_DIR"

SUBJECT="${1:-}"
ONLY_RANK=""
if [[ "$2" == "--rank" ]]; then
  ONLY_RANK="$3"
fi

if [ -z "$SUBJECT" ]; then
  echo "用法: bash $0 [五下_社會|五下_自然|六下_社會] [--rank N]" >&2
  exit 1
fi

if [ ! -f "$TARGETS_FILE" ]; then
  echo "ERROR: $TARGETS_FILE 不存在" >&2; exit 1
fi
if ! command -v codex >/dev/null 2>&1; then
  echo "ERROR: codex CLI 未安裝" >&2; exit 1
fi

# 用分科 progress 檔（避免三科共用衝突）
SAFE_SUBJ=$(echo "$SUBJECT" | tr '_' '-')
PROGRESS_FILE="scripts/jobs/JOB-237/phase_b_progress_${SAFE_SUBJ}.json"

# 初始化 progress（若不存在）
if [ ! -f "$PROGRESS_FILE" ]; then
  printf '{"started_at":"%s","subject":"%s","completed":[],"failed":[],"running":null}\n' \
    "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$SUBJECT" > "$PROGRESS_FILE"
  echo "[$(date '+%H:%M:%S')] [$SUBJECT] 初始化 $(basename $PROGRESS_FILE)"
fi

TOTAL=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$TARGETS_FILE')).targets.length)")
echo "[$(date '+%H:%M:%S')] [$SUBJECT] 總目標 $TOTAL 份"

# 取已完成 ranks
DONE_RANKS=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$PROGRESS_FILE')).completed.join(' '))")
if [ -n "$DONE_RANKS" ]; then
  echo "[$(date '+%H:%M:%S')] [$SUBJECT] Resume：已完成 ranks=[$DONE_RANKS]"
fi

for ((i=1; i<=TOTAL; i++)); do
  ITEM_SUBJ=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$TARGETS_FILE')).targets[$i-1].subject_group)")
  if [ "$SUBJECT" != "$ITEM_SUBJ" ]; then continue; fi
  if [ -n "$ONLY_RANK" ] && [ "$ONLY_RANK" != "$i" ]; then continue; fi
  if [ -n "$DONE_RANKS" ] && echo " $DONE_RANKS " | grep -q " $i "; then
    echo "[$(date '+%H:%M:%S')] [$SUBJECT] [Rank $i] 已完成，跳過"
    continue
  fi

  EXAM_ID=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$TARGETS_FILE')).targets[$i-1].exam_id)")
  MD_PATH=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$TARGETS_FILE')).targets[$i-1].md_path)")
  OUTPUT_PATH=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$TARGETS_FILE')).targets[$i-1].output_path)")
  PUBLISHER=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$TARGETS_FILE')).targets[$i-1].publisher)")
  A1_TEMPLATE=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$TARGETS_FILE')).targets[$i-1].a1_template)")

  echo ""
  echo "════════════════════════════════════════════════════════════"
  echo "[$(date '+%H:%M:%S')] [Rank $i/$TOTAL] [$SUBJECT] $EXAM_ID"
  echo "    Publisher: $PUBLISHER"
  echo "    MD:        $MD_PATH"
  echo "    Output:    $OUTPUT_PATH"
  echo "════════════════════════════════════════════════════════════"

  # 更新 running
  node -e "
    try {
      const fs=require('fs');
      const p=JSON.parse(fs.readFileSync('$PROGRESS_FILE'));
      p.running={rank:$i, exam_id:'$EXAM_ID', started_at:new Date().toISOString()};
      fs.writeFileSync('$PROGRESS_FILE', JSON.stringify(p, null, 2));
    } catch(e) { process.stderr.write('progress write warn: '+e+'\n'); }
  "

  LOG_FILE="$LOG_DIR/JOB-237-phaseB-${SAFE_SUBJ}-rank${i}.log"

  # stdin pipe（sed 直接 pipe，無 temp file）
  sed -e "s|{EXAM_ID}|$EXAM_ID|g" \
      -e "s|{MD_PATH}|$MD_PATH|g" \
      -e "s|{OUTPUT_PATH}|$OUTPUT_PATH|g" \
      "$A1_TEMPLATE" | codex exec --skip-git-repo-check --full-auto \
    > "$LOG_FILE" 2>&1 &
  CODEX_PID=$!

  # 25min watchdog
  ( sleep 1500
    if kill -0 $CODEX_PID 2>/dev/null; then
      kill $CODEX_PID 2>/dev/null
      echo "[$(date '+%H:%M:%S')] [Rank $i] ⏱ TIMEOUT 25min, killed PID=$CODEX_PID" >> "$LOG_FILE"
    fi
  ) &
  WATCHDOG=$!

  echo "[$(date '+%H:%M:%S')] [$SUBJECT] [Rank $i] PID=$CODEX_PID log=$LOG_FILE"
  wait $CODEX_PID
  EXIT_CODE=$?
  kill $WATCHDOG 2>/dev/null

  STATUS="ok"
  FAIL_REASON=""

  if [ $EXIT_CODE -ne 0 ]; then
    STATUS="failed"
    FAIL_REASON="exit_code=$EXIT_CODE"
    echo "[$(date '+%H:%M:%S')] [$SUBJECT] [Rank $i] ❌ codex 失敗 exit=$EXIT_CODE"
  elif [ ! -f "$OUTPUT_PATH" ]; then
    STATUS="failed"
    FAIL_REASON="output_not_found"
    echo "[$(date '+%H:%M:%S')] [$SUBJECT] [Rank $i] ❌ 輸出檔不存在"
  elif ! node -e "JSON.parse(require('fs').readFileSync('$OUTPUT_PATH'))" 2>/dev/null; then
    STATUS="failed"
    FAIL_REASON="invalid_json"
    echo "[$(date '+%H:%M:%S')] [$SUBJECT] [Rank $i] ❌ JSON 格式錯誤"
  fi

  if [ "$STATUS" = "ok" ]; then
    Q_COUNT=$(node -e "console.log((JSON.parse(require('fs').readFileSync('$OUTPUT_PATH')).questions||[]).length)" 2>/dev/null || echo "?")
    echo "[$(date '+%H:%M:%S')] [$SUBJECT] [Rank $i] ✅ 完成 questions=$Q_COUNT"
    node -e "
      try {
        const fs=require('fs');
        const p=JSON.parse(fs.readFileSync('$PROGRESS_FILE'));
        p.completed.push($i);
        p.running=null;
        p['rank_$i']={exam_id:'$EXAM_ID',questions:'$Q_COUNT',log:'$LOG_FILE',output:'$OUTPUT_PATH',finished_at:new Date().toISOString()};
        fs.writeFileSync('$PROGRESS_FILE', JSON.stringify(p, null, 2));
      } catch(e) { process.stderr.write('progress write warn: '+e+'\n'); }
    "
  else
    node -e "
      try {
        const fs=require('fs');
        const p=JSON.parse(fs.readFileSync('$PROGRESS_FILE'));
        p.failed.push({rank:$i, exam_id:'$EXAM_ID', reason:'$FAIL_REASON', log:'$LOG_FILE'});
        p.running=null;
        fs.writeFileSync('$PROGRESS_FILE', JSON.stringify(p, null, 2));
      } catch(e) { process.stderr.write('progress write warn: '+e+'\n'); }
    "
  fi
done

echo ""
echo "[$(date '+%H:%M:%S')] [$SUBJECT] 全部完成"
COMPLETED=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$PROGRESS_FILE')).completed.length)")
FAILED_COUNT=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$PROGRESS_FILE')).failed.length)")
echo "[$SUBJECT] completed=$COMPLETED, failed=$FAILED_COUNT"
