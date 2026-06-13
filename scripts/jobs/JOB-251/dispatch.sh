#!/bin/bash
# JOB-251 社會科三下 KL4 反推 serial dispatch（Codex 訂閱制）
# 康軒L1-L6 + 南一L1-L4 = 10課。每課 timeout 900s 防 hang。
set -u
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$ROOT"
unset ANTHROPIC_API_KEY
unset GEMINI_API_KEY

PROMPT_DIR="scripts/jobs/JOB-251/_prompts"
LOG_DIR="scripts/jobs/JOB-251/_logs"
SOC="knowledge/1_課綱研究/社會/三下"
mkdir -p "$LOG_DIR"

# 課清單：pub:L:name（name 用於檢查輸出檔）
TASKS="康軒:L1:我們居住的地方 康軒:L2:居住地方的風貌 康軒:L3:消費與生活 康軒:L4:消費與選擇 康軒:L5:家鄉的地名 康軒:L6:家鄉的故事 南一:L1:居住的地方 南一:L2:地方生活 南一:L3:生活理財 南一:L4:居住地方的地名與故事"

echo "=== JOB-251 社會KL4反推 dispatch start $(date '+%H:%M:%S') ==="
for T in $TASKS; do
  PUB="${T%%:*}"; REST="${T#*:}"; L="${REST%%:*}"; NAME="${REST#*:}"
  OUT="$SOC/$PUB/KL4_三下_${PUB}_${L}_${NAME}_單課研究紀錄.md"
  LOG="$LOG_DIR/${PUB}_${L}.log"
  PROMPT="$(cat "$PROMPT_DIR/${PUB}_${L}.txt")"

  if [ -f "$OUT" ] && [ "$(wc -l < "$OUT")" -ge 50 ]; then
    echo "[$PUB $L] SKIP (已有 $(wc -l < "$OUT")行)"; continue
  fi

  echo "[$PUB $L] 反推中 $(date '+%H:%M:%S') ..."
  T0=$(date +%s)
  timeout 900 codex exec --skip-git-repo-check --sandbox workspace-write "$PROMPT" < /dev/null > "$LOG" 2>&1
  EXIT=$?
  T1=$(date +%s)
  LINES=$([ -f "$OUT" ] && wc -l < "$OUT" || echo 0)
  echo "[$PUB $L] done exit=$EXIT 行數=$LINES 耗時=$((T1-T0))s"

  if grep -qiE "reached your usage limit|usage limit reached|rate_limit_exceeded|429 Too Many|too many requests" "$LOG"; then echo "[$PUB $L] ⚠️ 限額，停止"; exit 2; fi
done
echo "=== JOB-251 dispatch end $(date '+%H:%M:%S') ==="
