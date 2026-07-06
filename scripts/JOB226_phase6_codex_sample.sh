#!/bin/bash
# JOB-226 Phase 6：呼叫 Codex CLI 進行 combo 抽樣驗收
# 用法:
#   bash scripts/JOB226_phase6_codex_sample.sh <combo>
#   bash scripts/JOB226_phase6_codex_sample.sh <combo> --print-prompt

set -o pipefail
ROOT="/Users/s389080/Documents/doc/work/0_AI_Project/eidosProject"
COMBO="${1:?Usage: $0 <combo> [--print-prompt]}"
MODE="${2:-run}"

case "$COMBO" in
  三下_*) SEM="三下" ;;
  四下_*) SEM="四下" ;;
  五下_*) SEM="五下" ;;
  六下_*) SEM="六下" ;;
  *) echo "❌ 無法推學期：$COMBO" >&2; exit 1 ;;
esac

TEMPLATE="$ROOT/jobs/JOB-226-codex-sample-prompt.md"
PAIR_JSON="$ROOT/knowledge/3_考古題/2_MD淬鍊文字_整合版/$SEM/$COMBO/_pre_integration_pairing.json"
REPORT="$ROOT/knowledge/3_考古題/2_MD淬鍊文字_整合版/$SEM/$COMBO/_validation_report.json"
LOG_DIR="$ROOT/scripts/orchestrator-logs"
LOG_PATH="$LOG_DIR/JOB-226-$COMBO-codex-sample.log"

for REQUIRED in "$TEMPLATE" "$PAIR_JSON" "$REPORT"; do
  if [[ ! -f "$REQUIRED" ]]; then
    echo "❌ 缺必要檔案：$REQUIRED" >&2
    exit 1
  fi
done

mkdir -p "$LOG_DIR"

PROMPT=$(awk '
  /^## Prompt（傳給 codex agent CLI）$/ { in_prompt=1; next }
  /^## 主對話呼叫範例$/ { in_prompt=0 }
  in_prompt { print }
' "$TEMPLATE" | sed -e "s|{COMBO}|$COMBO|g" \
                    -e "s|{SEMESTER}|$SEM|g")

if [[ "$MODE" == "--print-prompt" ]]; then
  printf '%s\n' "$PROMPT"
  exit 0
fi

if [[ "$MODE" != "run" ]]; then
  echo "❌ 不支援的參數：$MODE" >&2
  exit 1
fi

echo "=== Phase 6 sample start $COMBO @ $(date) ===" > "$LOG_PATH"
cd "$ROOT" && \
  codex exec -m gpt-5.4 --skip-git-repo-check --full-auto "$PROMPT" </dev/null >> "$LOG_PATH" 2>&1
RC=$?
echo "=== Phase 6 sample end rc=$RC @ $(date) ===" >> "$LOG_PATH"

echo "=== JOB-226 Phase 6 submitted ==="
echo "combo: $COMBO"
echo "semester: $SEM"
echo "log: $LOG_PATH"
exit $RC
