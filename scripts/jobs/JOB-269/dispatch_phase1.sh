#!/bin/bash
# JOB-269 Phase 1 — 三下國語翰林文本錯位 8 課補題（Codex 訂閱制）
# 串行 dispatch，每課 35 題，輸出 _new.json（不覆蓋正式檔）
set -u
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$ROOT"
unset ANTHROPIC_API_KEY
unset GEMINI_API_KEY

PROMPT_DIR="scripts/jobs/JOB-269/_prompts"
LOG_DIR="scripts/jobs/JOB-269/_logs"
QBASE="question/platform/G3/Chinese/S2/HanLin"
mkdir -p "$LOG_DIR"

# L:課名（8 課文本錯位補題）
TASKS="L1:拔不起來的筆 L2:還差一點 L3:用膝蓋跳舞的女孩 L4:靜靜的淡水河 L6:月世界之旅 L7:做泡菜 L9:就愛倆倆在一起 L12:掉進一個兔子洞"

echo "=== JOB-269 Phase1 三下國語補題 dispatch start $(date '+%H:%M:%S') ==="

for T in $TASKS; do
  L="${T%%:*}"
  OUT="$QBASE/G3_S2_CHI_HANLIN_${L}_new.json"
  LOG="$LOG_DIR/phase1_${L}.log"
  PROMPT_FILE="$PROMPT_DIR/HANLIN_${L}.txt"

  if [ ! -f "$PROMPT_FILE" ]; then
    echo "[$L] ❌ prompt 不存在：$PROMPT_FILE，跳過"
    continue
  fi

  if [ -f "$OUT" ]; then
    CNT=$(python3 -c "import json;print(len(json.load(open('$OUT'))['questions']))" 2>/dev/null || echo 0)
    if [ "$CNT" -ge 35 ]; then
      echo "[$L] SKIP（已有 $CNT 題 _new.json）"
      continue
    fi
  fi

  echo "[$L] 出題中 $(date '+%H:%M:%S') ..."
  T0=$(date +%s)
  PROMPT="$(cat "$PROMPT_FILE")"
  timeout 900 codex exec --skip-git-repo-check --sandbox workspace-write "$PROMPT" < /dev/null > "$LOG" 2>&1
  EXIT=$?
  T1=$(date +%s)

  CNT=$(python3 -c "import json;print(len(json.load(open('$OUT'))['questions']))" 2>/dev/null || echo 0)
  echo "[$L] done exit=$EXIT 題數=$CNT 耗時=$((T1-T0))s log=$LOG"

  if grep -qiE "reached your usage limit|usage limit reached|rate_limit_exceeded|429 Too Many|too many requests" "$LOG"; then
    echo "[$L] ⚠️ 限額偵測，停止 dispatch"
    exit 2
  fi

  if [ "$CNT" -lt 30 ]; then
    echo "[$L] ⚠️ 題數不足 30（$CNT），記錄但繼續"
    echo "$L" >> "$LOG_DIR/phase1_low_count.txt"
  fi
done

echo "=== JOB-269 Phase1 dispatch end $(date '+%H:%M:%S') ==="
echo ""
echo "=== 各課 _new.json 題數 ==="
for T in $TASKS; do
  L="${T%%:*}"
  OUT="$QBASE/G3_S2_CHI_HANLIN_${L}_new.json"
  if [ -f "$OUT" ]; then
    CNT=$(python3 -c "import json;print(len(json.load(open('$OUT'))['questions']))" 2>/dev/null || echo "❌")
    echo "  $L: $CNT 題"
  else
    echo "  $L: ❌ 未生成"
  fi
done
