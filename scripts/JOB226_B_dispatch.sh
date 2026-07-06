#!/bin/bash
# JOB-226 Strategy B 純 Codex 一階段整合 dispatcher
# 用法: bash scripts/JOB226_B_dispatch.sh <combo>
# 例:   bash scripts/JOB226_B_dispatch.sh 三下_社會_翰林

set -o pipefail
# 注：刻意不用 set -e — codex 單份失敗不該讓整個 dispatcher abort（每份 run_one 內部已記 log）
ROOT="/Users/s389080/Documents/doc/work/0_AI_Project/eidosProject"
COMBO="${1:?Usage: $0 <combo>}"

# 推學期
case "$COMBO" in
  三下_*) SEM="三下" ;;
  四下_*) SEM="四下" ;;
  五下_*) SEM="五下" ;;
  六下_*) SEM="六下" ;;
  *) echo "❌ 無法推斷學期：$COMBO" >&2; exit 1 ;;
esac

PAIR_JSON="$ROOT/knowledge/3_考古題/2_MD淬鍊文字_整合版/$SEM/$COMBO/_pre_integration_pairing.json"
OUT_DIR="$ROOT/knowledge/3_考古題/2_MD淬鍊文字_整合版/$SEM/$COMBO"
LOG_DIR="$ROOT/knowledge/3_考古題/_logs/JOB-226-B/$COMBO"
TEMPLATE="$ROOT/knowledge/3_考古題/_bakeoff_JOB226/_prompt_template_B_pure_codex.md"
PARALLEL=3

mkdir -p "$LOG_DIR" "$OUT_DIR"

if [[ ! -f "$PAIR_JSON" ]]; then
  echo "❌ 缺 pairing：$PAIR_JSON" >&2; exit 1
fi
if [[ ! -f "$TEMPLATE" ]]; then
  echo "❌ 缺 prompt template：$TEMPLATE" >&2; exit 1
fi

# 讀任務清單（state != both_empty）並 skip 已存在整合版
TASK_FILE=$(mktemp)
python3 - "$PAIR_JSON" "$OUT_DIR" "$COMBO" "$SEM" >"$TASK_FILE" <<'PY'
import json, sys
from pathlib import Path
pair_json, out_dir, combo, sem = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
d = json.load(open(pair_json))
out = Path(out_dir)
for p in d.get("pairings", []):
    if p["state"] == "both_empty":
        continue
    fn = p["filename"]
    if (out / fn).exists():
        continue
    exam_id = p["exam_id"]
    cl = p["claude"]["path"] or ""
    cx = p["codex"]["path"] or ""
    state = p["state"]
    # tab-separated
    print(f"{exam_id}\t{fn}\t{state}\t{cl}\t{cx}")
PY

TOTAL=$(wc -l < "$TASK_FILE" | tr -d ' ')
echo ">>> Combo $COMBO（$SEM）：$TOTAL 份待跑（已 skip 完成檔）"
[[ "$TOTAL" -eq 0 ]] && { echo "✅ 全部已完成"; rm "$TASK_FILE"; exit 0; }

# 替換 prompt 變數並執行 codex（注意：prompt template 內 strategy_B_pure_codex/{{EXAM_ID}}.md
# 是 bake-off 路徑，這裡正式整合要覆寫輸出目標）
run_one() {
  local EXAM_ID="$1" FN="$2" STATE="$3" CL="$4" CX="$5"
  local LOG="$LOG_DIR/B_${EXAM_ID//\//_}.log"
  local OUT_PATH="$OUT_DIR/$FN"

  # 用 sed 替換變數
  local PROMPT
  PROMPT=$(sed -e "s|{{EXAM_ID}}|$EXAM_ID|g" \
               -e "s|{{COMBO}}|$COMBO|g" \
               -e "s|{{SEMESTER}}|$SEM|g" \
               -e "s|{{CLAUDE_MD}}|${CL:-（無 Claude 源）}|g" \
               -e "s|{{CODEX_MD}}|${CX:-（無 Codex 源）}|g" \
               -e "s|{{OUT_PATH}}|$OUT_PATH|g" \
               "$TEMPLATE")
  # 補一行強調 state 與 single-source 處理
  PROMPT="$PROMPT

## 本任務 state（重要）
- state: \`$STATE\`
- 若 state=claude_only：只有 Claude 源，輸出 quality_flags 含 \`claude_only\`
- 若 state=codex_only：只有 Codex 源，輸出 quality_flags 含 \`codex_only\`
- 若 state=dual：兩源齊全，視內容判斷主源（claude_primary / codex_primary / dual_source_merged）
- **輸出目標 absolute path**：\`$OUT_PATH\`"

  echo "=== START $EXAM_ID @ $(date) ===" >> "$LOG"
  cd "$ROOT" && \
    codex exec -m gpt-5.4 --skip-git-repo-check --full-auto "$PROMPT" </dev/null >> "$LOG" 2>&1
  local RC=$?
  echo "=== END $EXAM_ID rc=$RC @ $(date) ===" >> "$LOG"
  if [[ -f "$OUT_PATH" ]]; then
    echo "✅ $EXAM_ID written"
  else
    echo "❌ $EXAM_ID NOT written (rc=$RC, see $LOG)"
  fi
  return $RC
}

# 並行批次（每批 PARALLEL 份）— 用簡單計數而非陣列，避開 bash3.x 空陣列問題
COUNT=0
INFLIGHT=0
while IFS=$'\t' read -r EXAM_ID FN STATE CL CX; do
  run_one "$EXAM_ID" "$FN" "$STATE" "$CL" "$CX" &
  INFLIGHT=$((INFLIGHT+1))
  COUNT=$((COUNT+1))
  if [[ $INFLIGHT -ge $PARALLEL ]]; then
    wait
    INFLIGHT=0
    echo "→ 已 dispatch $COUNT / $TOTAL"
  fi
done < "$TASK_FILE"
wait
rm "$TASK_FILE"

echo "=== ALL DONE: $COMBO ==="
ls "$OUT_DIR" | grep -v "^_" | wc -l | xargs echo "整合版檔案數："
