#!/bin/bash
# JOB-250 Phase B：南一三下自然出題 serial dispatch（Codex 訂閱制）
# 113 結構 L1植物/L2水/L3天氣/L4溶解。需先完成 Phase A 溶解 KL4。
set -u
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$ROOT"
unset ANTHROPIC_API_KEY
unset GEMINI_API_KEY

PROMPT_DIR="scripts/jobs/JOB-250/_prompts"
LOG_DIR="scripts/jobs/JOB-250/_logs"
QDIR="question/platform/G3/Science/S2/NanYi"
mkdir -p "$LOG_DIR"

# 前置檢查：溶解 KL4 必須存在
if [ ! -f "knowledge/1_課綱研究/自然/三下/南一/KL4_三下_南一_廚房中的科學_單課研究紀錄.md" ]; then
  echo "⚠️ 溶解 KL4 未產出，Phase A 未完成，停止"
  exit 3
fi

echo "=== JOB-250 南一出題 dispatch start $(date '+%H:%M:%S') ==="
for L in L1 L2 L3 L4; do
  OUT="$QDIR/G3_S2_SCI_NANYI_${L}_new.json"
  LOG="$LOG_DIR/${L}.log"
  PROMPT="$(cat "$PROMPT_DIR/${L}.txt")"
  if [ -f "$OUT" ]; then
    CNT=$(python3 -c "import json;print(len(json.load(open('$OUT'))['questions']))" 2>/dev/null || echo 0)
    if [ "$CNT" -ge 50 ]; then echo "[$L] SKIP (已有 $CNT 題)"; continue; fi
  fi
  echo "[$L] 出題中 $(date '+%H:%M:%S') ..."
  T0=$(date +%s)
  codex exec --skip-git-repo-check --sandbox workspace-write "$PROMPT" < /dev/null > "$LOG" 2>&1
  EXIT=$?
  T1=$(date +%s)
  CNT=$(python3 -c "import json;print(len(json.load(open('$OUT'))['questions']))" 2>/dev/null || echo 0)
  echo "[$L] done exit=$EXIT 題數=$CNT 耗時=$((T1-T0))s"
  if grep -qiE "usage limit|rate limit|quota" "$LOG"; then echo "[$L] ⚠️ 限額，停止"; exit 2; fi
done
echo "=== JOB-250 dispatch end $(date '+%H:%M:%S') ==="
