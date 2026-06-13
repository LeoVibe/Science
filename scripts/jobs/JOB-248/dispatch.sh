#!/bin/bash
# JOB-248 康軒三下自然出題 serial dispatch（Codex 訂閱制）
# 一次一課，跑完檢查題數。codex exec 不指定 -m（用訂閱制預設）。
set -u
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$ROOT"

# 守住「不用 API」鐵律
unset ANTHROPIC_API_KEY
unset GEMINI_API_KEY

PROMPT_DIR="scripts/jobs/JOB-248/_prompts"
LOG_DIR="scripts/jobs/JOB-248/_logs"
QDIR="question/platform/G3/Science/S2/KangHsuan"
mkdir -p "$LOG_DIR"

echo "=== JOB-248 康軒出題 dispatch start $(date '+%H:%M:%S') ==="

for L in L1 L2 L3 L4; do
  OUT="$QDIR/G3_S2_SCI_KANGHSUAN_${L}_new.json"
  LOG="$LOG_DIR/${L}.log"
  PROMPT="$(cat "$PROMPT_DIR/${L}.txt")"

  # 已產出且題數達 50 則跳過（可續跑）
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

  # 限額偵測
  if grep -qiE "usage limit|rate limit|quota" "$LOG"; then
    echo "[$L] ⚠️ 偵測到限額字樣，停止 dispatch"
    exit 2
  fi
done

echo "=== JOB-248 dispatch end $(date '+%H:%M:%S') ==="
