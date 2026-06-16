#!/bin/bash
# JOB-271 L10/L11 補題 serial dispatch（Codex 訂閱制）
set -u
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$ROOT"
unset ANTHROPIC_API_KEY
unset GEMINI_API_KEY

PROMPT_DIR="scripts/jobs/JOB-271/_prompts"
LOG_DIR="scripts/jobs/JOB-271/_logs"
QBASE="question/platform/G3/Chinese/S2/HanLin"
mkdir -p "$LOG_DIR"

TASKS="L10 L11"

echo "=== JOB-271 L10/L11 補題 dispatch start $(date '+%H:%M:%S') ==="
for L in $TASKS; do
  OUT="$QBASE/G3_S2_CHI_HANLIN_${L}_add.json"
  LOG="$LOG_DIR/${L}.log"
  PROMPT="$(cat "$PROMPT_DIR/HANLIN_${L}.txt")"

  if [ -f "$OUT" ]; then
    CNT=$(python3 -c "import json;print(len(json.load(open('$OUT'))['questions']))" 2>/dev/null || echo 0)
    if [ "$CNT" -ge 8 ]; then echo "[$L] SKIP (已有 $CNT 題)"; continue; fi
  fi

  echo "[$L] 出題中 $(date '+%H:%M:%S') ..."
  T0=$(date +%s)
  timeout 900 codex exec --skip-git-repo-check --sandbox workspace-write "$PROMPT" < /dev/null > "$LOG" 2>&1
  EXIT=$?
  T1=$(date +%s)
  CNT=$(python3 -c "import json;print(len(json.load(open('$OUT'))['questions']))" 2>/dev/null || echo 0)
  echo "[$L] done exit=$EXIT 題數=$CNT 耗時=$((T1-T0))s"

  if grep -qiE "reached your usage limit|usage limit reached|rate_limit_exceeded" "$LOG"; then
    echo "[$L] ⚠️ 限額，停止"; exit 2
  fi
done
echo "=== JOB-271 dispatch end $(date '+%H:%M:%S') ==="
