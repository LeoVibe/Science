#!/bin/bash
# JOB-230 Phase 0.3 Pilot 5 份 dispatch（四下_社會）
# 並行 3 條 codex 跑（避免一次 5 條過載；剩餘 2 條等前批完成）
# 對齊黃金樣本 schema：knowledge/3_考古題/3_L2_結構化抽取/_golden_samples/四下_社會_<Phase 0.2 確定>.json

set -u

OUT_DIR="knowledge/3_考古題/3_L2_結構化抽取/四下/四下_社會_pilot"
LOG_DIR="scripts/jobs/JOB-230/_pilot_logs"
PROMPT_TPL="scripts/jobs/JOB-230/A1_pilot_prompt_template_social_g4.md"

mkdir -p "$OUT_DIR" "$LOG_DIR"
> "$LOG_DIR/timing.csv"

# Phase 0.3 確定後填入 5 份 Pilot 候選（多元覆蓋）：
# 1-3: dual_source+paper_full+answer_full 主流情境（每出版社各 1 份）
# 4: dual_source+answer_partial 邊界（測試答案部分缺漏）
# 5: claude_only+paper_full+answer_full 邊界（測試單源情境）
# 格式：EXAM_ID|MD_PATH|CATEGORY

PILOT_LIST=(
  "翰林_112_新北安和國小_期末考|knowledge/3_考古題/2_MD淬鍊文字_整合版/四下/四下_社會_翰林/翰林_112_新北安和國小_期末考.md|翰林-codex_only+paper_full+answer_full（主流情境）"
  "康軒_110_東芳國小_第一次段考|knowledge/3_考古題/2_MD淬鍊文字_整合版/四下/四下_社會_康軒/康軒_110_東芳國小_第一次段考.md|康軒-codex_only+paper_full+answer_full"
  "南一_112_勝利國小_期末考|knowledge/3_考古題/2_MD淬鍊文字_整合版/四下/四下_社會_南一/南一_112_勝利國小_期末考.md|南一-dual_source（稀有情境）"
  "翰林_112_安和國小_期末考|knowledge/3_考古題/2_MD淬鍊文字_整合版/四下/四下_社會_翰林/翰林_112_安和國小_期末考.md|翰林-claude_only+paper_full+answer_full"
  "翰林_110_海佃國小_第一次段考|knowledge/3_考古題/2_MD淬鍊文字_整合版/四下/四下_社會_翰林/翰林_110_海佃國小_第一次段考.md|翰林-codex_only+paper_full+answer_partial（邊界）"
)

if [ "${#PILOT_LIST[@]}" -eq 0 ]; then
  echo "ERROR: PILOT_LIST 尚未填入（Phase 0.3 候選由 PM 選定後填入）" >&2
  exit 1
fi

build_prompt() {
  local EXAM_ID=$1
  local MD_PATH=$2
  local OUT_PATH=$3

  sed -e "s|{EXAM_ID}|$EXAM_ID|g" \
      -e "s|{MD_PATH}|$MD_PATH|g" \
      -e "s|{OUTPUT_PATH}|$OUT_PATH|g" \
      "$PROMPT_TPL"
}

run_pilot() {
  local EXAM_ID=$1
  local MD_PATH=$2
  local CATEGORY=$3
  local OUT_PATH="$OUT_DIR/${EXAM_ID}.json"
  local LOG_PATH="$LOG_DIR/${EXAM_ID}.log"

  local PROMPT
  PROMPT=$(build_prompt "$EXAM_ID" "$MD_PATH" "$OUT_PATH")

  echo "[$EXAM_ID] start ($CATEGORY)"
  T0=$(date +%s)
  codex exec --skip-git-repo-check --full-auto "$PROMPT" \
    > "$LOG_PATH" 2>&1
  EXIT=$?
  T1=$(date +%s)
  ELAPSED=$((T1-T0))
  echo "[$EXAM_ID] done elapsed=${ELAPSED}s exit=$EXIT"
  echo "$EXAM_ID,$ELAPSED,$EXIT,$CATEGORY" >> "$LOG_DIR/timing.csv"
}

START=$(date +%s)

# 第一批 3 條並行
for entry in "${PILOT_LIST[@]:0:3}"; do
  IFS='|' read -r EXAM_ID MD_PATH CATEGORY <<< "$entry"
  run_pilot "$EXAM_ID" "$MD_PATH" "$CATEGORY" &
done
wait
echo "=== 第一批 3 條完成 ==="

# 第二批 2 條並行
for entry in "${PILOT_LIST[@]:3:2}"; do
  IFS='|' read -r EXAM_ID MD_PATH CATEGORY <<< "$entry"
  run_pilot "$EXAM_ID" "$MD_PATH" "$CATEGORY" &
done
wait
echo "=== 第二批 2 條完成 ==="

END=$(date +%s)
TOTAL=$((END-START))

echo ""
echo "=== Pilot 5 份完成，總耗時 ${TOTAL}s ==="
echo ""
echo "=== Timing CSV ==="
cat "$LOG_DIR/timing.csv"
echo ""
echo "=== 產出檢查 ==="
ls -la "$OUT_DIR/"
echo ""
echo "=== JSON 合法性檢查 ==="
for f in "$OUT_DIR"/*.json; do
  python3 -c "import json; json.load(open('$f'))" 2>&1 | head -3
  if [ $? -eq 0 ]; then
    echo "  ✅ $(basename $f) - JSON OK"
  else
    echo "  ❌ $(basename $f) - JSON FAIL"
  fi
done
echo ""
echo "=== 編碼合法性檢查 (Layer 1) ==="
python3 << 'PY'
import json, glob, os
with open('knowledge/3_考古題/3_L2_結構化抽取/_meta/social_codes_legal_II.json') as f:
    legal = json.load(f)
legal_set = set([c['code'] for c in legal['performance']] + [c['code'] for c in legal['content']])
total_violations = 0
for path in sorted(glob.glob('knowledge/3_考古題/3_L2_結構化抽取/四下/四下_社會_pilot/*.json')):
    try:
        d = json.load(open(path))
    except Exception as e:
        print(f'  ❌ {os.path.basename(path)}: JSON 解析失敗 {e}')
        continue
    illegal = []
    total = 0
    for q in d.get('questions', []):
        for c in q.get('codes_candidate', []):
            total += 1
            if c.get('code') not in legal_set:
                illegal.append((q.get('question_id'), c.get('code')))
    rate = (1 - len(illegal)/total)*100 if total else 0
    icon = '✅' if not illegal else '❌'
    print(f'  {icon} {os.path.basename(path)}: 編碼合法 {total-len(illegal)}/{total} ({rate:.1f}%)')
    if illegal:
        for q_id, c in illegal[:5]:
            print(f'      違規 {q_id} → {c}')
        total_violations += len(illegal)
print(f'\n總違規數: {total_violations}')
PY
