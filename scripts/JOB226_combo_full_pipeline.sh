#!/bin/bash
# JOB-226 單 combo 全自動 pipeline
# 用法: bash scripts/JOB226_combo_full_pipeline.sh <combo>
#
# 步驟：
#  1. Phase 1 配對（若 _pre_integration_pairing.json 不存在則跑）
#  2. Phase 2 dispatch（PARALLEL=4，canonical v3.1，watchdog 1500s）
#  3. Phase 3b 漏檔回掃 + 重 dispatch（最多 1 次）
#  4. Phase 5a/5/5b（finalize wrapper）
#  5. Phase 5c 單源檔字眼修補
#  6. Phase 5 重驗
#  7. Phase 6 codex 抽樣
#  8. 若 Phase 6 FAIL，重跑 Phase 5c + Phase 6 一次（重試上限 1）
#  9. 寫 _integration_report.md
# 10. update progress.json (done / partial / failed)

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

INT_DIR="$ROOT/knowledge/3_考古題/2_MD淬鍊文字_整合版/$SEM/$COMBO"
PAIR_JSON="$INT_DIR/_pre_integration_pairing.json"
LOG_DIR="$ROOT/scripts/orchestrator-logs"
mkdir -p "$LOG_DIR"

echo "==========================================="
echo "  JOB-226 full pipeline: $COMBO"
echo "  $(date '+%Y-%m-%d %H:%M:%S')"
echo "==========================================="

# Phase 1
if [[ ! -f "$PAIR_JSON" ]]; then
  echo "--- Phase 1: 配對 ---"
  python3 "$ROOT/scripts/JOB226_pair_combo.py" --combo "$COMBO" 2>&1 | tail -10
fi

EXPECTED=$(python3 -c "import json; d=json.load(open('$PAIR_JSON')); print(len(d['pairings']))" 2>/dev/null || echo 0)
echo "expected: $EXPECTED 份"

# Phase 2: dispatch
count_files() {
  find "$INT_DIR" -name "*.md" -type f 2>/dev/null | grep -v "_pre_integration\|_integration_report\|_index" | wc -l | tr -d ' '
}

echo "--- Phase 2: dispatch (PARALLEL=4) ---"
JOB226_REASONING=high JOB226_PARALLEL=4 bash "$ROOT/scripts/JOB226_B_dispatch_v2.sh" "$COMBO" > "$LOG_DIR/JOB-226-${COMBO}-dispatch.log" 2>&1
ACTUAL=$(count_files)
echo "dispatch 後：$ACTUAL / $EXPECTED"

# Phase 3b: 漏檔回掃 + 重 dispatch（最多 1 次）
if [[ "$ACTUAL" -lt "$EXPECTED" ]]; then
  echo "--- Phase 3b: 漏 $((EXPECTED - ACTUAL)) 份，重 dispatch ---"
  JOB226_REASONING=high JOB226_PARALLEL=4 bash "$ROOT/scripts/JOB226_B_dispatch_v2.sh" "$COMBO" > "$LOG_DIR/JOB-226-${COMBO}-dispatch-r2.log" 2>&1
  ACTUAL=$(count_files)
  echo "重跑後：$ACTUAL / $EXPECTED"
fi

# 若仍漏檔，標 partial
PARTIAL_NOTE=""
if [[ "$ACTUAL" -lt "$EXPECTED" ]]; then
  PARTIAL_NOTE="dispatch 漏 $((EXPECTED - ACTUAL)) 份（已重試 1 次）"
fi

# Phase 5a/5/5b: finalize wrapper
echo "--- Phase 5a/5/5b: finalize ---"
bash "$ROOT/scripts/JOB226_combo_finalize.sh" "$COMBO" > "$LOG_DIR/JOB-226-${COMBO}-finalize.log" 2>&1

# Phase 5c: 單源檔字眼修補
echo "--- Phase 5c: 單源字眼修補 ---"
python3 "$ROOT/scripts/JOB226_fix_single_source_phrasing.py" --combo "$COMBO" 2>&1 | tail -5

# 字眼修補可能改動 char_count，再補 + 重驗
python3 "$ROOT/scripts/JOB226_fix_char_count.py" --combo "$COMBO" 2>&1 | tail -3
python3 "$ROOT/scripts/JOB226_validate_combo.py" --combo "$COMBO" 2>&1 | tail -3

PHASE5_FAIL=$(python3 -c "
import json
d = json.load(open('$INT_DIR/_validation_report.json'))
print(d.get('any_fail', 0))
" 2>/dev/null || echo 1)

if [[ "$PHASE5_FAIL" -gt 0 ]]; then
  echo "⚠️  Phase 5 仍有 $PHASE5_FAIL 份 fail，標 partial 跳 Phase 6"
  P5_NOTE="Phase 5 fail $PHASE5_FAIL 份"
  if [[ -z "$PARTIAL_NOTE" ]]; then
    PARTIAL_NOTE="$P5_NOTE"
  else
    PARTIAL_NOTE="$PARTIAL_NOTE; $P5_NOTE"
  fi
fi

# Phase 6: codex 抽樣
phase6_run() {
  local round=$1
  local logfile="$LOG_DIR/JOB-226-${COMBO}-phase6-r${round}.log"
  bash "$ROOT/scripts/JOB226_phase6_codex_sample.sh" "$COMBO" > "$logfile" 2>&1
  # 結果在 codex-sample.log（被 phase6 wrapper 轉發）
  if grep -q "整體判定：PASS$" "$LOG_DIR/JOB-226-${COMBO}-codex-sample.log" 2>/dev/null; then
    echo "PASS"
  else
    echo "FAIL"
  fi
}

echo "--- Phase 6 round 1: codex 抽樣 ---"
P6_RESULT=$(phase6_run 1)
echo "Phase 6 round 1: $P6_RESULT"

# 若 FAIL 重試一次（先跑 5c 再 phase 6）
if [[ "$P6_RESULT" == "FAIL" ]]; then
  echo "--- Phase 6 FAIL — Phase 5c 再修 + Phase 6 round 2 ---"
  python3 "$ROOT/scripts/JOB226_fix_single_source_phrasing.py" --combo "$COMBO" 2>&1 | tail -3
  python3 "$ROOT/scripts/JOB226_fix_char_count.py" --combo "$COMBO" 2>&1 | tail -3
  python3 "$ROOT/scripts/JOB226_validate_combo.py" --combo "$COMBO" 2>&1 | tail -3
  P6_RESULT=$(phase6_run 2)
  echo "Phase 6 round 2: $P6_RESULT"
fi

# 若仍 FAIL，記入 error_note
if [[ "$P6_RESULT" == "FAIL" ]]; then
  P6_NOTE="Phase 6 連 2 次 FAIL（人工檢查需）"
  if [[ -z "$PARTIAL_NOTE" ]]; then
    PARTIAL_NOTE="$P6_NOTE"
  else
    PARTIAL_NOTE="$PARTIAL_NOTE; $P6_NOTE"
  fi
fi

# Phase 7: 產 _integration_report.md
echo "--- Phase 7: 產 _integration_report.md ---"
python3 "$ROOT/scripts/JOB226_generate_reports.py" --combo "$COMBO" 2>&1 | tail -2

# Phase 8: update progress
FINAL_COUNT=$(count_files)
if [[ -z "$PARTIAL_NOTE" && "$P6_RESULT" == "PASS" ]]; then
  STATUS="done"
elif [[ "$P6_RESULT" == "PASS" || "$P5_NOTE" == "" ]]; then
  STATUS="partial"
else
  STATUS="partial"
fi

if [[ -n "$PARTIAL_NOTE" ]]; then
  python3 "$ROOT/scripts/JOB226_update_progress.py" --combo "$COMBO" --status "$STATUS" --integrated-count "$FINAL_COUNT" --codex-sample-pass "$P6_RESULT" --error-note "$PARTIAL_NOTE" 2>&1 | tail -5
else
  python3 "$ROOT/scripts/JOB226_update_progress.py" --combo "$COMBO" --status "$STATUS" --integrated-count "$FINAL_COUNT" --codex-sample-pass "$P6_RESULT" 2>&1 | tail -5
fi

echo ""
echo "==========================================="
echo "  $COMBO 完成: status=$STATUS, count=$FINAL_COUNT/$EXPECTED, phase6=$P6_RESULT"
echo "  $(date '+%Y-%m-%d %H:%M:%S')"
echo "==========================================="
