#!/bin/bash
# JOB-252 社會科三下出題 serial dispatch（Codex 訂閱制）
# 翰林6+康軒6+南一5=17課。輸出 staged _new.json（不覆蓋正式檔）。每課 timeout 900。
set -u
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$ROOT"
unset ANTHROPIC_API_KEY
unset GEMINI_API_KEY

PROMPT_DIR="scripts/jobs/JOB-252/_prompts"
LOG_DIR="scripts/jobs/JOB-252/_logs"
QBASE="question/platform/G3/SocialStudies/S2"
mkdir -p "$LOG_DIR"

# code:full:L
TASKS="HANLIN:HanLin:L1 HANLIN:HanLin:L2 HANLIN:HanLin:L3 HANLIN:HanLin:L4 HANLIN:HanLin:L5 HANLIN:HanLin:L6 KANGHSUAN:KangHsuan:L1 KANGHSUAN:KangHsuan:L2 KANGHSUAN:KangHsuan:L3 KANGHSUAN:KangHsuan:L4 KANGHSUAN:KangHsuan:L5 KANGHSUAN:KangHsuan:L6 NANYI:NanYi:L1 NANYI:NanYi:L2 NANYI:NanYi:L3 NANYI:NanYi:L4 NANYI:NanYi:L5"

echo "=== JOB-252 社會出題 dispatch start $(date '+%H:%M:%S') ==="
for T in $TASKS; do
  CODE="${T%%:*}"; REST="${T#*:}"; FULL="${REST%%:*}"; L="${REST#*:}"
  OUT="$QBASE/$FULL/G3_S2_SOC_${CODE}_${L}_new.json"
  LOG="$LOG_DIR/${CODE}_${L}.log"
  PROMPT="$(cat "$PROMPT_DIR/${CODE}_${L}.txt")"

  if [ -f "$OUT" ]; then
    CNT=$(python3 -c "import json;print(len(json.load(open('$OUT'))['questions']))" 2>/dev/null || echo 0)
    if [ "$CNT" -ge 50 ]; then echo "[$CODE $L] SKIP (已有 $CNT 題)"; continue; fi
  fi

  echo "[$CODE $L] 出題中 $(date '+%H:%M:%S') ..."
  T0=$(date +%s)
  timeout 900 codex exec --skip-git-repo-check --sandbox workspace-write "$PROMPT" < /dev/null > "$LOG" 2>&1
  EXIT=$?
  T1=$(date +%s)
  CNT=$(python3 -c "import json;print(len(json.load(open('$OUT'))['questions']))" 2>/dev/null || echo 0)
  echo "[$CODE $L] done exit=$EXIT 題數=$CNT 耗時=$((T1-T0))s"

  if grep -qiE "reached your usage limit|usage limit reached|rate_limit_exceeded|429 Too Many|too many requests" "$LOG"; then
    echo "[$CODE $L] ⚠️ 限額，停止"; exit 2
  fi
done
echo "=== JOB-252 dispatch end $(date '+%H:%M:%S') ==="
