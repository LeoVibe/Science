#!/bin/bash
# JOB-226 Phase 5b Round 1：Codex 複檢修補 fail 檔
# 用法: bash scripts/JOB226_phase5b_codex.sh <combo>
# 流程：
#   1. 讀 _validation_report.json，找 all_pass=false 的檔案
#   2. 對每份 fail 檔生成 fail_report 字串
#   3. 替換 prompt template 變數，呼叫 codex exec -m gpt-5.4 重跑（覆蓋原檔）
#   4. 跑完後請執行 JOB226_validate_combo.py 重驗

set -o pipefail
ROOT="/Users/s389080/Documents/doc/work/0_AI_Project/eidosProject"
COMBO="${1:?Usage: $0 <combo>}"

case "$COMBO" in
  三下_*) SEM="三下" ;;
  四下_*) SEM="四下" ;;
  五下_*) SEM="五下" ;;
  六下_*) SEM="六下" ;;
  *) echo "❌ 無法推學期：$COMBO" >&2; exit 1 ;;
esac

OUT_DIR="$ROOT/knowledge/3_考古題/2_MD淬鍊文字_整合版/$SEM/$COMBO"
CLAUDE_DIR="$ROOT/knowledge/3_考古題/2_MD淬鍊文字_Claude/$SEM/$COMBO"
CODEX_DIR="$ROOT/knowledge/3_考古題/2_MD淬鍊文字_Codex/$SEM/$COMBO"
LOG_DIR="$ROOT/knowledge/3_考古題/_logs/JOB-226-phase5b/$COMBO"
TEMPLATE="$ROOT/knowledge/3_考古題/_bakeoff_JOB226/_prompt_template_phase5b_codex.md"
REPORT="$OUT_DIR/_validation_report.json"
PARALLEL=3

mkdir -p "$LOG_DIR"

if [[ ! -f "$REPORT" ]]; then
  echo "❌ 缺驗收報告：$REPORT。請先跑 JOB226_validate_combo.py。" >&2; exit 1
fi

# 從 report 取 fail 檔列表 + 對應 fail 項目
TASK_FILE=$(mktemp)
python3 - "$REPORT" "$CLAUDE_DIR" "$CODEX_DIR" "$OUT_DIR" >"$TASK_FILE" <<'PY'
import json, sys
from pathlib import Path
report, claude_dir, codex_dir, out_dir = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
d = json.load(open(report))
for f in d["files"]:
    if f["all_pass"]:
        continue
    fn = f["file"]
    fails = []
    for k, v in f["checks"].items():
        if not v["pass"]:
            fails.append(f"- {k}: {v['msg']}")
    fail_block = "\n".join(fails)
    cl = str(Path(claude_dir) / fn)
    cx = str(Path(codex_dir) / fn)
    intg = str(Path(out_dir) / fn)
    exam_id = fn[:-3] if fn.endswith(".md") else fn
    # tab-separated（fail_block 用 │ 取代換行傳遞）
    print(f"{exam_id}\t{intg}\t{cl}\t{cx}\t{fail_block.replace(chr(10), '│')}")
PY

TOTAL=$(wc -l < "$TASK_FILE" | tr -d ' ')
echo ">>> Phase 5b $COMBO：$TOTAL 份 fail 檔待修"
[[ "$TOTAL" -eq 0 ]] && { echo "✅ Phase 5 全綠，無 fail 檔可修"; rm "$TASK_FILE"; exit 0; }

run_one() {
  local EXAM_ID="$1" INTG="$2" CL="$3" CX="$4" FAIL_RAW="$5"
  local LOG="$LOG_DIR/5b_${EXAM_ID//\//_}.log"
  local FAIL_BLOCK="${FAIL_RAW//│/$'\n'}"
  local CL_USED="$CL"; [[ -f "$CL" ]] || CL_USED="（無 Claude 源）"
  local CX_USED="$CX"; [[ -f "$CX" ]] || CX_USED="（無 Codex 源）"

  local PROMPT
  PROMPT=$(sed -e "s|{{EXAM_ID}}|$EXAM_ID|g" \
               -e "s|{{COMBO}}|$COMBO|g" \
               -e "s|{{SEMESTER}}|$SEM|g" \
               -e "s|{{INTEGRATED_MD}}|$INTG|g" \
               -e "s|{{CLAUDE_MD}}|$CL_USED|g" \
               -e "s|{{CODEX_MD}}|$CX_USED|g" \
               "$TEMPLATE")
  PROMPT="${PROMPT//\{\{FAIL_REPORT\}\}/$FAIL_BLOCK}"

  echo "=== START 5b $EXAM_ID @ $(date) ===" >> "$LOG"
  cd "$ROOT" && \
    codex exec -m gpt-5.4 --skip-git-repo-check --full-auto "$PROMPT" </dev/null >> "$LOG" 2>&1
  local RC=$?
  echo "=== END 5b $EXAM_ID rc=$RC @ $(date) ===" >> "$LOG"
  echo "✅ 5b done $EXAM_ID (rc=$RC)"
  return $RC
}

COUNT=0; INFLIGHT=0
while IFS=$'\t' read -r EXAM_ID INTG CL CX FAIL_RAW; do
  run_one "$EXAM_ID" "$INTG" "$CL" "$CX" "$FAIL_RAW" &
  INFLIGHT=$((INFLIGHT+1))
  COUNT=$((COUNT+1))
  if [[ $INFLIGHT -ge $PARALLEL ]]; then
    wait
    INFLIGHT=0
    echo "→ Phase 5b 已修 $COUNT / $TOTAL"
  fi
done < "$TASK_FILE"
wait
rm "$TASK_FILE"

echo "=== Phase 5b ALL DONE: $COMBO ==="
echo "下一步：python3 scripts/JOB226_validate_combo.py --combo $COMBO 重驗"
