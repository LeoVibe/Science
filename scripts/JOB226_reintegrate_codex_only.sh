#!/bin/bash
# JOB-226 codex_only 重整合腳本（C-wide 用）
# 用途：用更新後的 canonical template（含「題幹一致鐵則」）重跑指定 combo 的 codex_only 檔案
# 用法: bash scripts/JOB226_reintegrate_codex_only.sh <combo>
# 環境變數同 v2 dispatcher（REASONING=high, MODEL=gpt-5.4, PARALLEL=3）

set -o pipefail
ROOT="/Users/s389080/Documents/doc/work/0_AI_Project/eidosProject"
COMBO="${1:?Usage: $0 <combo>}"

REASONING="${JOB226_REASONING:-high}"
MODEL="${JOB226_MODEL:-gpt-5.4}"
PARALLEL="${JOB226_PARALLEL:-3}"

case "$COMBO" in
  三下_*) SEM="三下" ;;
  四下_*) SEM="四下" ;;
  五下_*) SEM="五下" ;;
  六下_*) SEM="六下" ;;
  *) echo "❌ 無法推斷學期：$COMBO" >&2; exit 1 ;;
esac

PAIR_JSON="$ROOT/knowledge/3_考古題/2_MD淬鍊文字_整合版/$SEM/$COMBO/_pre_integration_pairing.json"
INDEX_JSON="$ROOT/knowledge/3_考古題/2_MD淬鍊文字_整合版/$SEM/$COMBO/_index.json"
OUT_DIR="$ROOT/knowledge/3_考古題/2_MD淬鍊文字_整合版/$SEM/$COMBO"
LOG_DIR="$ROOT/knowledge/3_考古題/_logs/JOB-226-reintegrate/$COMBO"
TEMPLATE="$ROOT/knowledge/3_考古題/_canonical_prompts/_integration_prompt.md"

[[ ! -f "$PAIR_JSON" ]] && { echo "❌ 缺 pairing：$PAIR_JSON" >&2; exit 1; }
[[ ! -f "$INDEX_JSON" ]] && { echo "❌ 缺 index：$INDEX_JSON" >&2; exit 1; }
[[ ! -f "$TEMPLATE" ]] && { echo "❌ 缺 template：$TEMPLATE" >&2; exit 1; }

mkdir -p "$LOG_DIR"

echo ">>> reintegrate codex_only：$COMBO"
echo ">>> reasoning=$REASONING model=$MODEL parallel=$PARALLEL"
echo ">>> template: $TEMPLATE"

# 從 _index.json 找出所有 codex_only 檔案
TASK_FILE=$(mktemp)
python3 - "$PAIR_JSON" "$INDEX_JSON" "$COMBO" "$SEM" >"$TASK_FILE" <<'PY'
import json, sys
pair_json, index_json, combo, sem = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]

# 從 index 找 codex_only filenames
idx = json.load(open(index_json))
codex_only_fns = set()
for f in idx.get("files", []):
    if "codex_only" in (f.get("quality_flags") or []):
        codex_only_fns.add(f.get("filename"))

# 從 pairing 取每份的 paths
pair = json.load(open(pair_json))
for p in pair.get("pairings", []):
    if p["filename"] not in codex_only_fns:
        continue
    exam_id = p["exam_id"]
    fn = p["filename"]
    cl = p["claude"]["path"] or ""
    cx = p["codex"]["path"] or ""
    state = p["state"]
    print(f"{exam_id}\t{fn}\t{state}\t{cl}\t{cx}")
PY

TOTAL=$(wc -l < "$TASK_FILE" | tr -d ' ')
echo ">>> 找到 codex_only 待重跑：$TOTAL 份"
[[ "$TOTAL" -eq 0 ]] && { echo "✅ 無 codex_only 檔，跳過"; rm "$TASK_FILE"; exit 0; }

run_one() {
  local EXAM_ID="$1" FN="$2" STATE="$3" CL="$4" CX="$5"
  local LOG="$LOG_DIR/${EXAM_ID//\//_}.log"
  local OUT_PATH="$OUT_DIR/$FN"

  local PROMPT
  PROMPT=$(sed -e "s|{{EXAM_ID}}|$EXAM_ID|g" \
               -e "s|{{COMBO}}|$COMBO|g" \
               -e "s|{{SEMESTER}}|$SEM|g" \
               -e "s|{{CLAUDE_MD}}|${CL:-（無 Claude 源）}|g" \
               -e "s|{{CODEX_MD}}|${CX:-（無 Codex 源）}|g" \
               -e "s|{{OUT_PATH}}|$OUT_PATH|g" \
               -e "s|{{STATE}}|$STATE|g" \
               "$TEMPLATE")

  echo "=== START $EXAM_ID @ $(date) ===" >> "$LOG"
  cd "$ROOT" && \
    codex exec \
      -c model_reasoning_effort="\"$REASONING\"" \
      -m "$MODEL" \
      --skip-git-repo-check \
      --full-auto \
      "$PROMPT" </dev/null >> "$LOG" 2>&1
  local RC=$?
  echo "=== END $EXAM_ID rc=$RC @ $(date) ===" >> "$LOG"
  if [[ -f "$OUT_PATH" ]]; then
    echo "✅ $EXAM_ID rewritten (rc=$RC)"
  else
    echo "❌ $EXAM_ID NOT written (rc=$RC, see $LOG)"
  fi
  return $RC
}

# 先把舊檔備份再刪（讓 codex 完全重寫，避免覆蓋失敗）
BAK_DIR="$LOG_DIR/_pre_reintegrate_backup"
mkdir -p "$BAK_DIR"
while IFS=$'\t' read -r EXAM_ID FN STATE CL CX; do
  if [[ -f "$OUT_DIR/$FN" ]]; then
    cp "$OUT_DIR/$FN" "$BAK_DIR/$FN"
    rm "$OUT_DIR/$FN"
  fi
done < "$TASK_FILE"
echo ">>> 已備份 $TOTAL 份舊版到 $BAK_DIR/"

# 並行跑
COUNT=0
INFLIGHT=0
while IFS=$'\t' read -r EXAM_ID FN STATE CL CX; do
  run_one "$EXAM_ID" "$FN" "$STATE" "$CL" "$CX" &
  INFLIGHT=$((INFLIGHT+1))
  COUNT=$((COUNT+1))
  if [[ $INFLIGHT -ge $PARALLEL ]]; then
    wait
    INFLIGHT=0
    echo "→ 已重跑 $COUNT / $TOTAL"
  fi
done < "$TASK_FILE"
wait
rm "$TASK_FILE"

echo ">>> reintegrate $COMBO done"
