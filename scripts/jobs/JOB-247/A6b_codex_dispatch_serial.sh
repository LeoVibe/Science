#!/bin/bash
# JOB-247 全量 Serial Dispatch（三下自然，117 份）
#
# 策略：一次只跑 1 份試卷，跑完檢查 quota，hit limit 就停，下次解封繼續。
# 三家試卷 round-robin 公平分布。
# 失敗即停，下次手動續跑。

set -u
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$ROOT"

OUT_DIR="knowledge/3_考古題/3_L2_結構化抽取/三下/alignment_science/_partial"
LOG_DIR="scripts/jobs/JOB-247/_phase1_logs"
PROMPT_TPL="scripts/jobs/JOB-247/A1b_codex_arbitration_prompt.md"
MAX_FILES="${MAX_FILES:-10}"  # 每輪最多跑幾份，預設 10

mkdir -p "$LOG_DIR"

# 合併 3 個 worker file 並交錯（A B C A B C ...）公平分布
python3 - <<'PY' > "$LOG_DIR/serial_queue.json"
import json
publishers = ['A_翰林', 'B_康軒', 'C_南一']
queues = {p: json.load(open(f'scripts/jobs/JOB-247/_full_targets_{p}.json', encoding='utf-8')) for p in publishers}
merged = []
max_len = max(len(q) for q in queues.values())
for i in range(max_len):
    for p in publishers:
        if i < len(queues[p]):
            merged.append(queues[p][i])
print(json.dumps(merged, ensure_ascii=False))
PY

TOTAL=$(python3 -c "import json; print(len(json.load(open('$LOG_DIR/serial_queue.json'))))")
echo "=== Serial dispatch start: $TOTAL targets, MAX_FILES=$MAX_FILES ==="

START=$(date +%s)
SUCCESS=0
FAILED=0
SKIPPED=0
IDX=0

while IFS= read -r entry; do
  IDX=$((IDX+1))
  if [ $((SUCCESS + FAILED + SKIPPED)) -ge "$MAX_FILES" ]; then
    echo "=== Reached MAX_FILES=$MAX_FILES, stopping ==="
    break
  fi

  EXAM_ID=$(echo "$entry" | python3 -c "import sys,json; print(json.loads(sys.stdin.read())['exam_id'])")
  L2_PATH=$(echo "$entry" | python3 -c "import sys,json; print(json.loads(sys.stdin.read())['l2_path'])")
  INPUT_PATH="$OUT_DIR/alignment_partial_${EXAM_ID}.json"
  LOG_PATH="$LOG_DIR/${EXAM_ID}.log"

  if [ ! -f "$INPUT_PATH" ]; then
    echo "[$IDX/$TOTAL][$EXAM_ID] SKIP (no Phase 1a partial)"
    SKIPPED=$((SKIPPED+1))
    continue
  fi

  # 檢查是否已完成（無 _pending）
  HAS_PENDING=$(python3 -c "
import json
d = json.load(open('$INPUT_PATH', encoding='utf-8'))
pending = sum(1 for l in d.get('l2_to_kl_links', []) if l.get('match_rule', '').endswith('_pending'))
print(pending)
")
  if [ "$HAS_PENDING" = "0" ]; then
    echo "[$IDX/$TOTAL][$EXAM_ID] SKIP (already complete, no _pending)"
    SKIPPED=$((SKIPPED+1))
    continue
  fi

  PROMPT=$(sed -e "s|{EXAM_ID}|$EXAM_ID|g" \
               -e "s|{INPUT_PATH}|$INPUT_PATH|g" \
               -e "s|{L2_PATH}|$L2_PATH|g" \
               "$PROMPT_TPL")

  echo "[$IDX/$TOTAL][$EXAM_ID] start (pending=$HAS_PENDING)"
  T0=$(date +%s)
  codex exec --skip-git-repo-check --sandbox workspace-write "$PROMPT" \
    < /dev/null > "$LOG_PATH" 2>&1
  EXIT=$?
  T1=$(date +%s)
  ELAPSED=$((T1-T0))

  # 檢查是否 hit rate limit
  if grep -q "usage limit" "$LOG_PATH" 2>/dev/null; then
    echo "[$IDX/$TOTAL][$EXAM_ID] HIT RATE LIMIT, stopping serial dispatch"
    FAILED=$((FAILED+1))
    echo "$EXAM_ID,$ELAPSED,RATE_LIMIT,SERIAL" >> "$LOG_DIR/phase1b_serial_timing.csv"
    break
  fi

  if [ "$EXIT" = "0" ]; then
    # 再次驗證實際寫入
    NEW_PENDING=$(python3 -c "
import json
d = json.load(open('$INPUT_PATH', encoding='utf-8'))
pending = sum(1 for l in d.get('l2_to_kl_links', []) if l.get('match_rule', '').endswith('_pending'))
print(pending)
")
    if [ "$NEW_PENDING" = "0" ]; then
      echo "[$IDX/$TOTAL][$EXAM_ID] ✓ done elapsed=${ELAPSED}s"
      SUCCESS=$((SUCCESS+1))
      echo "$EXAM_ID,$ELAPSED,0,SERIAL" >> "$LOG_DIR/phase1b_serial_timing.csv"
    else
      echo "[$IDX/$TOTAL][$EXAM_ID] ⚠ exit=0 but pending=$NEW_PENDING (partial write)"
      FAILED=$((FAILED+1))
      echo "$EXAM_ID,$ELAPSED,PARTIAL_WRITE,SERIAL" >> "$LOG_DIR/phase1b_serial_timing.csv"
    fi
  else
    echo "[$IDX/$TOTAL][$EXAM_ID] ✗ elapsed=${ELAPSED}s exit=$EXIT"
    FAILED=$((FAILED+1))
    echo "$EXAM_ID,$ELAPSED,$EXIT,SERIAL" >> "$LOG_DIR/phase1b_serial_timing.csv"
  fi

done < <(python3 -c "import json; [print(json.dumps(t, ensure_ascii=False)) for t in json.load(open('$LOG_DIR/serial_queue.json'))]")

END=$(date +%s)
echo ""
echo "=== Serial dispatch 結束 總耗時 $((END-START))s ==="
echo "✓ success: $SUCCESS"
echo "✗ failed: $FAILED"
echo "⊘ skipped: $SKIPPED"
