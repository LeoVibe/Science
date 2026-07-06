#!/bin/bash
# JOB-226 速度實驗：在 _experiment_JOB226_speed/ 下逐 trial 跑 codex，記錄時間/token/exec
# 用法:
#   bash scripts/JOB226_speed_experiment.sh <trial_name> <reasoning> <use_whitelist:0|1> <model>
# 例:
#   bash scripts/JOB226_speed_experiment.sh trial_01_baseline_xhigh xhigh 0 gpt-5.4
#   bash scripts/JOB226_speed_experiment.sh trial_03_high_whitelist high 1 gpt-5.4

set -o pipefail
ROOT="/Users/s389080/Documents/doc/work/0_AI_Project/eidosProject"
TRIAL="${1:?usage: $0 <trial_name> <reasoning> <use_whitelist:0|1> <model>}"
REASONING="${2:?missing reasoning}"
USE_WHITELIST="${3:?missing whitelist flag}"
MODEL="${4:?missing model}"

# 固定基準試卷（康軒_108_中正國小_第一次段考，已知 baseline 8m52s/388K tokens）
EXAM_ID="康軒_108_中正國小_第一次段考"
COMBO="三下_社會_康軒"
SEM="三下"
STATE="dual"
CL="knowledge/3_考古題/2_MD淬鍊文字_Claude/$SEM/$COMBO/${EXAM_ID}.md"
CX="knowledge/3_考古題/2_MD淬鍊文字_Codex/$SEM/$COMBO/${EXAM_ID}.md"

EXP_DIR="$ROOT/knowledge/3_考古題/_experiment_JOB226_speed"
OUT_DIR="$EXP_DIR/$TRIAL"
LOG_DIR="$EXP_DIR/_logs"
mkdir -p "$OUT_DIR" "$LOG_DIR"
OUT_PATH="$OUT_DIR/${EXAM_ID}.md"
LOG_PATH="$LOG_DIR/${TRIAL}.log"
META_PATH="$LOG_DIR/${TRIAL}.meta.json"

if [[ "$USE_WHITELIST" == "1" ]]; then
  TEMPLATE="$EXP_DIR/_prompt_template_with_whitelist.md"
else
  TEMPLATE="$ROOT/knowledge/3_考古題/_bakeoff_JOB226/_prompt_template_B_pure_codex.md"
fi

PROMPT=$(sed -e "s|{{EXAM_ID}}|$EXAM_ID|g" \
             -e "s|{{COMBO}}|$COMBO|g" \
             -e "s|{{SEMESTER}}|$SEM|g" \
             -e "s|{{CLAUDE_MD}}|$CL|g" \
             -e "s|{{CODEX_MD}}|$CX|g" \
             -e "s|{{OUT_PATH}}|$OUT_PATH|g" \
             -e "s|{{STATE}}|$STATE|g" "$TEMPLATE")

# baseline template 沒 {{STATE}} 變數，需手動加（與 dispatcher 行為一致）
if [[ "$USE_WHITELIST" == "0" ]]; then
  PROMPT="$PROMPT

## 本任務 state（重要）
- state: \`$STATE\`
- 若 state=claude_only：只有 Claude 源，輸出 quality_flags 含 \`claude_only\`
- 若 state=codex_only：只有 Codex 源，輸出 quality_flags 含 \`codex_only\`
- 若 state=dual：兩源齊全，視內容判斷主源
- **輸出目標 absolute path**：\`$OUT_PATH\`"
fi

echo "=== Trial: $TRIAL ===" | tee "$LOG_PATH"
echo "  reasoning=$REASONING whitelist=$USE_WHITELIST model=$MODEL" | tee -a "$LOG_PATH"
echo "  prompt template: $TEMPLATE" | tee -a "$LOG_PATH"
echo "  output: $OUT_PATH" | tee -a "$LOG_PATH"
echo "=== START $(date) ===" | tee -a "$LOG_PATH"

START_EPOCH=$(date +%s)

cd "$ROOT" && \
  codex exec \
    -c model_reasoning_effort="\"$REASONING\"" \
    -m "$MODEL" \
    --skip-git-repo-check \
    --full-auto \
    "$PROMPT" </dev/null >> "$LOG_PATH" 2>&1
RC=$?

END_EPOCH=$(date +%s)
ELAPSED=$((END_EPOCH - START_EPOCH))

echo "=== END rc=$RC elapsed=${ELAPSED}s @ $(date) ===" | tee -a "$LOG_PATH"

# 抓 metrics: tokens used, exec count, output char count
TOKENS=$(grep -oE "tokens used\s*\n[0-9,]+" "$LOG_PATH" 2>/dev/null | tail -1 | tr -d ',')
TOKENS=$(awk '/^tokens used$/{getline; gsub(",","",$0); print; exit}' "$LOG_PATH")
EXEC_COUNT=$(grep -c "^exec$" "$LOG_PATH")
if [[ -f "$OUT_PATH" ]]; then
  CHAR_COUNT=$(python3 -c "
import sys
text = open('$OUT_PATH').read()
print(sum(1 for c in text if not c.isspace()))
" 2>/dev/null)
else
  CHAR_COUNT=0
fi

# 寫 meta
cat > "$META_PATH" <<META_EOF
{
  "trial": "$TRIAL",
  "exam_id": "$EXAM_ID",
  "reasoning": "$REASONING",
  "whitelist": $USE_WHITELIST,
  "model": "$MODEL",
  "rc": $RC,
  "elapsed_seconds": $ELAPSED,
  "tokens_used": ${TOKENS:-0},
  "exec_count": ${EXEC_COUNT:-0},
  "output_char_count": ${CHAR_COUNT:-0},
  "output_exists": $([[ -f "$OUT_PATH" ]] && echo "true" || echo "false"),
  "log_path": "$LOG_PATH"
}
META_EOF

echo ""
echo "=== Result ==="
echo "  rc:           $RC"
echo "  elapsed:      ${ELAPSED}s"
echo "  tokens:       ${TOKENS:-?}"
echo "  exec_calls:   ${EXEC_COUNT:-?}"
echo "  output_chars: ${CHAR_COUNT:-?}"
echo "  meta:         $META_PATH"
exit $RC
