#!/bin/bash
# JOB-249 翰林三下自然出題 serial dispatch（Codex 訂閱制）
# 重排 L3=天氣/L4=動物。codex exec 不指定 -m（用訂閱制預設 gpt-5.5）。
set -u
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$ROOT"

unset ANTHROPIC_API_KEY
unset GEMINI_API_KEY

PROMPT_DIR="scripts/jobs/JOB-249/_prompts"
LOG_DIR="scripts/jobs/JOB-249/_logs"
QDIR="question/platform/G3/Science/S2/HanLin"
mkdir -p "$LOG_DIR"

echo "=== JOB-249 翰林出題 dispatch start $(date '+%H:%M:%S') ==="

for L in L1 L2 L3 L4; do
  OUT="$QDIR/G3_S2_SCI_HANLIN_${L}_new.json"
  LOG="$LOG_DIR/${L}.log"
  PROMPT="$(cat "$PROMPT_DIR/${L}.txt")"

  if [ -f "$OUT" ]; then
    CNT=$(python3 -c "import json;print(len(json.load(open('$OUT'))['questions']))" 2>/dev/null || echo 0)
    if [ "$CNT" -ge 50 ]; then
      echo "[$L] SKIP (已有 $CNT 題)"
      continue
    fi
  fi

  echo "[$L] 出題中 $(date '+%H:%M:%S') ..."
  T0=$(date +%s)
  codex exec --skip-git-repo-check --sandbox workspace-write "$PROMPT" < /dev/null > "$LOG" 2>&1
  EXIT=$?
  T1=$(date +%s)

  CNT=$(python3 -c "import json;print(len(json.load(open('$OUT'))['questions']))" 2>/dev/null || echo 0)
  echo "[$L] done exit=$EXIT 題數=$CNT 耗時=$((T1-T0))s"

  if grep -qiE "usage limit|rate limit|quota" "$LOG"; then
    echo "[$L] ⚠️ 偵測到限額字樣，停止 dispatch"
    exit 2
  fi
done

echo "=== JOB-249 dispatch end $(date '+%H:%M:%S') ==="
