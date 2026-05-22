#!/bin/bash
# JOB-244 Phase 1 Pilot dispatch（五下_國語，新版 5 份試跑）
# 五下改版年份：翰林 111→112 / 康軒 110→111 / 南一 110→111
# Pilot 範圍：翰林 112+113 / 康軒 111+112 / 南一 111+112+113
# 並行 3 + 2

set -u

ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$ROOT"

OUT_DIR="knowledge/3_考古題/3_L2_結構化抽取/五下/alignment/_partial"
LOG_DIR="scripts/jobs/JOB-244/_phase1_logs"
PROMPT_TPL="scripts/jobs/JOB-244/A1_align_prompt_template.md"
L2_FULL_DIR="knowledge/3_考古題/3_L2_結構化抽取/五下/五下_國語_翰林"
L2_KH_DIR="knowledge/3_考古題/3_L2_結構化抽取/五下/五下_國語_康軒"
L2_NY_DIR="knowledge/3_考古題/3_L2_結構化抽取/五下/五下_國語_南一"

mkdir -p "$OUT_DIR" "$LOG_DIR"
> "$LOG_DIR/pilot_timing.csv"

# Pilot 5 份（covers 3 publishers × 多學年新版）
# 格式：EXAM_ID|L2_JSON_PATH|PUBLISHER|YEAR
# 從各 publisher 新版年份中各抽 1-2 份代表性試卷
PILOT_LIST_RAW=$(python3 << 'PY'
import os, json
base = 'knowledge/3_考古題/3_L2_結構化抽取/五下'
# 五下 Pilot 5 份固定清單（翰林無 113）
fixed = [
    ('翰林', '112', '五下_國語_翰林', '翰林_112_2_期末考'),
    ('翰林', '112', '五下_國語_翰林', '翰林_112_內安國小_第一次段考'),
    ('康軒', '112', '五下_國語_康軒', '康軒_112_勝利國小_期中考'),
    ('南一', '112', '五下_國語_南一', '南一_112_2_期末考'),
    ('南一', '113', '五下_國語_南一', '南一_113_02第一次評量五年級國語科評量試卷_未知'),
]
for pub, yr, sub, exam_id in fixed:
    path = os.path.join(base, sub, exam_id + '.json')
    if not os.path.exists(path):
        # fallback：沿用該年份首份非空試卷
        d = os.path.join(base, sub)
        for f in sorted(os.listdir(d)):
            if f.endswith('.json') and f'_{yr}_' in f and not f.startswith('_'):
                try:
                    if json.load(open(os.path.join(d, f), encoding='utf-8')).get('questions'):
                        exam_id = f[:-5]
                        path = os.path.join(d, f)
                        break
                except: pass
    print(f'{exam_id}|{path}|{pub}|{yr}')
PY
)

PILOT_LIST=()
while IFS= read -r line; do
  [ -z "$line" ] && continue
  PILOT_LIST+=("$line")
done <<< "$PILOT_LIST_RAW"

echo "=== Pilot 5 份選定 ==="
for e in "${PILOT_LIST[@]}"; do echo "  $e"; done
echo ""

build_prompt() {
  local EXAM_ID=$1
  local L2_JSON_PATH=$2
  local OUT_PATH=$3
  local ACADEMIC_YEAR=$4

  sed -e "s|{EXAM_ID}|$EXAM_ID|g" \
      -e "s|{L2_JSON_PATH}|$L2_JSON_PATH|g" \
      -e "s|{OUTPUT_PATH}|$OUT_PATH|g" \
      -e "s|{ACADEMIC_YEAR}|$ACADEMIC_YEAR|g" \
      "$PROMPT_TPL"
}

run_pilot() {
  local EXAM_ID=$1
  local L2_JSON_PATH=$2
  local PUBLISHER=$3
  local YEAR=$4
  local OUT_PATH="$OUT_DIR/alignment_partial_${EXAM_ID}.json"
  local LOG_PATH="$LOG_DIR/${EXAM_ID}.log"

  local PROMPT
  PROMPT=$(build_prompt "$EXAM_ID" "$L2_JSON_PATH" "$OUT_PATH" "$YEAR")

  echo "[$EXAM_ID] start ($PUBLISHER $YEAR 學年)"
  T0=$(date +%s)
  codex exec --skip-git-repo-check --full-auto "$PROMPT" \
    < /dev/null > "$LOG_PATH" 2>&1
  EXIT=$?
  T1=$(date +%s)
  ELAPSED=$((T1-T0))
  echo "[$EXAM_ID] done elapsed=${ELAPSED}s exit=$EXIT"
  echo "$EXAM_ID,$ELAPSED,$EXIT,$PUBLISHER,$YEAR" >> "$LOG_DIR/pilot_timing.csv"
}

START=$(date +%s)

echo "=== JOB-244 Phase 1 Pilot start ==="
echo "新版 5 份 (covers 翰林 112+113 / 康軒 111+112 / 南一 112)"
echo ""

# 第一批 3 條並行
echo "--- 第一批 3 條啟動 ---"
for entry in "${PILOT_LIST[@]:0:3}"; do
  IFS='|' read -r EXAM_ID L2_JSON_PATH PUBLISHER YEAR <<< "$entry"
  run_pilot "$EXAM_ID" "$L2_JSON_PATH" "$PUBLISHER" "$YEAR" &
done
wait
echo "=== 第一批 3 條完成 ==="

# 第二批 2 條並行
echo "--- 第二批 2 條啟動 ---"
for entry in "${PILOT_LIST[@]:3:2}"; do
  IFS='|' read -r EXAM_ID L2_JSON_PATH PUBLISHER YEAR <<< "$entry"
  run_pilot "$EXAM_ID" "$L2_JSON_PATH" "$PUBLISHER" "$YEAR" &
done
wait
echo "=== 第二批 2 條完成 ==="

END=$(date +%s)
TOTAL=$((END-START))

echo ""
echo "=== Pilot 5 份完成，總耗時 ${TOTAL}s ==="
echo ""
echo "=== Timing CSV ==="
cat "$LOG_DIR/pilot_timing.csv"
echo ""
echo "=== 產出檢查 ==="
ls -la "$OUT_DIR/"
echo ""
echo "=== JSON 合法性檢查 ==="
for f in "$OUT_DIR"/*.json; do
  if python3 -c "import json; json.load(open('$f'))" 2>/dev/null; then
    echo "  ✅ $(basename "$f") - JSON OK"
  else
    echo "  ❌ $(basename "$f") - JSON FAIL"
  fi
done

echo ""
echo "=== Schema v1.1 合規檢查 ==="
python3 << 'PY'
import json, glob, os

required_meta = ['schema_version', 'partial_for', 'publisher', 'academic_year', 'version_match_inferred', 'processed_at', 'extractor', 'total_questions']
required_link_keys = ['exam_id', 'question_id', 'version_match', 'kl3_links', 'kl4_links', 'general_type', 'verify_status', 'verify_note']

for path in sorted(glob.glob('knowledge/3_考古題/3_L2_結構化抽取/五下/alignment/_partial/alignment_partial_*.json')):
    try:
        d = json.load(open(path))
    except Exception as e:
        print(f'  ❌ {os.path.basename(path)}: JSON 解析失敗 {e}')
        continue

    meta = d.get('_meta', {})
    missing_meta = [k for k in required_meta if k not in meta]
    if missing_meta:
        print(f'  ⚠️ {os.path.basename(path)}: _meta 缺欄位 {missing_meta}')

    links = d.get('l2_to_kl_links', [])
    if not links:
        print(f'  ❌ {os.path.basename(path)}: l2_to_kl_links 為空')
        continue

    first = links[0]
    missing_keys = [k for k in required_link_keys if k not in first]
    if missing_keys:
        print(f'  ⚠️ {os.path.basename(path)}: l2_to_kl_links[0] 缺欄位 {missing_keys}')

    # 統計
    r1, r2, r3, r4, rc01 = 0, 0, 0, 0, 0
    vm_current, vm_legacy, vm_shared, vm_unknown = 0, 0, 0, 0
    for link in links:
        vm = link.get('version_match', 'missing')
        if vm == 'current': vm_current += 1
        elif vm == 'legacy': vm_legacy += 1
        elif vm == 'shared': vm_shared += 1
        elif vm == 'unknown': vm_unknown += 1
        for kl3 in link.get('kl3_links', []):
            rule = kl3.get('match_rule', '')
            if 'R1' in rule: r1 += 1
            elif 'R2' in rule: r2 += 1
            elif 'R4' in rule: r4 += 1
        if link.get('general_type'):
            r3 += 1
        for kl4 in link.get('kl4_links', []):
            if kl4.get('rc01_evidence'):
                rc01 += 1

    print(f'  ✅ {os.path.basename(path)}: total={len(links)} R1={r1} R2={r2} R3={r3} R4={r4} rc01={rc01}')
    print(f'     version_match: current={vm_current} shared={vm_shared} legacy={vm_legacy} unknown={vm_unknown}')
PY

echo ""
echo "=== JOB-244 Pilot 通過條件 ==="
echo "  - 5 份 partial JSON 全部產出"
echo "  - JSON 全部可解析"
echo "  - _meta 含 schema_version=1.1 + version_match_inferred"
echo "  - 每題都有 version_match 欄位"
echo "  - R1+R2+R3+R4 == total（不漏題）"
echo "  - 五下_國語 預期 R1 比例略低於四下（顯式引用較少），R3 比例會高"
echo ""
echo "Pilot LGTM 後可擴量到 ~47 份新版"
