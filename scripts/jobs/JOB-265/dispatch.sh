#!/bin/bash
# JOB-265 六下國語 KL4考古題淬煉 serial dispatch（Codex訂閱制）
# 每課 codex 產 _new → 立即 verify → PASS 記錄 / FAIL 標記重跑清單
# 用法: bash dispatch.sh [單課如 翰林_L10 | 全量留空]
set -u
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$ROOT"
unset ANTHROPIC_API_KEY GEMINI_API_KEY
PD="scripts/jobs/JOB-265/_prompts"
LOG="scripts/jobs/JOB-265/_logs"
BASE="knowledge/1_課綱研究/國語/六下"
mkdir -p "$LOG"
ONLY="${1:-}"

echo "=== JOB-265 六下國語KL4淬煉 start $(date '+%H:%M:%S') ==="
PASS=0; FAIL=0
> "$LOG/fail_list.txt"
for p in "$PD"/翰林_L*.txt "$PD"/康軒_L*.txt "$PD"/南一_L*.txt; do
  [ -f "$p" ] || continue
  key=$(basename "$p" .txt)
  [ -n "$ONLY" ] && [ "$key" != "$ONLY" ] && continue
  pub="${key%%_*}"; L="${key#*_}"
  rec=$(ls "$BASE/$pub/KL4_六下_${pub}_${L}_"*_單課研究紀錄.md 2>/dev/null | head -1)
  [ -z "$rec" ] && { echo "[$key] 無單課研究紀錄,跳過"; continue; }
  name=$(basename "$rec" | sed "s/KL4_六下_${pub}_${L}_//;s/_單課研究紀錄.md//")
  newf="$BASE/$pub/KL4_六下_${pub}_${L}_${name}_考古題與討論_new.md"

  if [ -f "$newf" ] && [ "$(grep -c '誘答機制' "$newf" 2>/dev/null || echo 0)" -ge 10 ]; then
    echo "[$key] SKIP (已有合格_new)"; PASS=$((PASS+1)); continue
  fi
  echo "[$key] $name 淬煉中 $(date '+%H:%M:%S')..."
  timeout 900 codex exec --skip-git-repo-check --sandbox workspace-write "$(cat "$p")" < /dev/null > "$LOG/${key}.log" 2>&1
  if python3 scripts/jobs/JOB-265/verify_kl4.py "$newf" "$name" 2>&1; then
    PASS=$((PASS+1))
  else
    FAIL=$((FAIL+1)); echo "$key" >> "$LOG/fail_list.txt"
  fi
  grep -qiE "reached your usage limit|rate_limit_exceeded" "$LOG/${key}.log" && { echo "⚠️限額停止"; exit 2; }
done
echo "=== end $(date '+%H:%M:%S') | PASS=${PASS} FAIL=${FAIL} (fail list: ${LOG}/fail_list.txt) ==="
