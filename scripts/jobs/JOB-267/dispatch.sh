#!/bin/bash
# JOB-267 三下社會翰林 KL4 考古題淬煉 serial dispatch（Codex訂閱制）
set -u
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$ROOT"
unset ANTHROPIC_API_KEY GEMINI_API_KEY
PD="scripts/jobs/JOB-267/_prompts"
LOG="scripts/jobs/JOB-267/_logs"
BASE="knowledge/1_課綱研究/社會/三下/翰林"
mkdir -p "$LOG"
ONLY="${1:-}"

echo "=== JOB-267 三下社會翰林KL4淬煉 start $(date '+%H:%M:%S') ==="
PASS=0; FAIL=0
> "$LOG/fail_list.txt"
for p in "$PD"/翰林_L*.txt; do
  [ -f "$p" ] || continue
  key=$(basename "$p" .txt)
  [ -n "$ONLY" ] && [ "$key" != "$ONLY" ] && continue
  L="${key#翰林_}"
  rec=$(ls "$BASE/KL4_三下_翰林_${L}_"*_單課研究紀錄.md 2>/dev/null | head -1)
  [ -z "$rec" ] && { echo "[$key] 無單課研究紀錄,跳過"; continue; }
  name=$(basename "$rec" | sed "s/KL4_三下_翰林_${L}_//;s/_單課研究紀錄.md//")
  newf="$BASE/KL4_三下_翰林_${L}_${name}_考古題與討論_new.md"

  if [ -f "$newf" ] && grep -q "RM3" "$newf" 2>/dev/null; then
    echo "[$key] SKIP (已有合格_new)"; PASS=$((PASS+1)); continue
  fi
  echo "[$key] $name 淬煉中 $(date '+%H:%M:%S')..."
  timeout 900 codex exec --skip-git-repo-check --sandbox workspace-write "$(cat "$p")" < /dev/null > "$LOG/${key}.log" 2>&1
  if python3 scripts/jobs/JOB-267/verify_kl4_social.py "$newf" "$name" 2>&1; then
    PASS=$((PASS+1))
  else
    FAIL=$((FAIL+1)); echo "$key" >> "$LOG/fail_list.txt"
  fi
  grep -qiE "reached your usage limit|rate_limit_exceeded" "$LOG/${key}.log" && { echo "⚠️限額停止"; exit 2; }
done
echo "=== end $(date '+%H:%M:%S') | PASS=${PASS} FAIL=${FAIL} (fail list: ${LOG}/fail_list.txt) ==="
