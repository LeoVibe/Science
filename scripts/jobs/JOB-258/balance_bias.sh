#!/bin/bash
# JOB-258 四下社會4課BIAS選項平衡（Codex訂閱制，讀prompt檔）
set -u
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$ROOT"
unset ANTHROPIC_API_KEY GEMINI_API_KEY
PD="scripts/jobs/JOB-258/_prompts"
LOG_DIR="scripts/jobs/JOB-258/_logs"
QB="question/platform/G4/SocialStudies/S2"
mkdir -p "$LOG_DIR"

echo "=== JOB-258 四下社會BIAS平衡 start $(date '+%H:%M:%S') ==="
for T in HANLIN_L1 HANLIN_L4 HANLIN_L6 KANGHSUAN_L5; do
  CODE="${T%_*}"; L="${T#*_}"
  PE=$([ "$CODE" = HANLIN ] && echo HanLin || echo KangHsuan)
  OUT="$QB/$PE/G4_S2_SOC_${CODE}_${L}_new.json"
  LOG="$LOG_DIR/${T}.log"
  PROMPT="$(cat "$PD/${T}.txt")"

  if [ -f "$OUT" ] && [ "$(python3 -c "import json;print(len(json.load(open('$OUT'))['questions']))" 2>/dev/null||echo 0)" -ge 25 ]; then
    echo "[$T] SKIP (已產出)"; continue
  fi
  echo "[$T] 平衡中 $(date '+%H:%M:%S') ..."
  T0=$(date +%s)
  timeout 900 codex exec --skip-git-repo-check --sandbox workspace-write "$PROMPT" < /dev/null > "$LOG" 2>&1
  T1=$(date +%s)
  n=$([ -f "$OUT" ] && python3 -c "import json;print(len(json.load(open('$OUT'))['questions']))" 2>/dev/null || echo 0)
  echo "[$T] done 題數=$n 耗時=$((T1-T0))s"
  if grep -qiE "reached your usage limit|rate_limit_exceeded" "$LOG"; then echo "限額停止"; exit 2; fi
done
echo "=== JOB-258 BIAS平衡 end $(date '+%H:%M:%S') ==="
