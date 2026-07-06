#!/bin/bash
# JOB-226 combo 結案 wrapper：跑完 Phase 5/5a/5b/6 + 報告 + 進度更新
# 用法: bash scripts/JOB226_combo_finalize.sh <combo>
# 前置：B dispatcher 已寫完該 combo 所有 *.md 到 2_MD淬鍊文字_整合版/{學期}/{combo}/
# 不會自動更新 progress.json status=done（最後一步留給人工確認 Phase 6 結果）

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
TOTAL=$(ls "$OUT_DIR" 2>/dev/null | grep -v "^_" | wc -l | tr -d ' ')
echo "=== 結案 $COMBO（學期：$SEM）— 整合版檔案 $TOTAL 份 ==="

# Phase 5a：char_count 自動補（純機械，不吃 token）
echo "--- Phase 5a：char_count 自動補 ---"
python3 "$ROOT/scripts/JOB226_fix_char_count.py" --combo "$COMBO" 2>&1 | tail -5

# Phase 5：第 1 輪自動驗收
echo "--- Phase 5 round 1：自動驗收 ---"
python3 "$ROOT/scripts/JOB226_validate_combo.py" --combo "$COMBO" 2>&1 | tail -10

# 讀驗收結果
REPORT="$OUT_DIR/_validation_report.json"
ANY_FAIL=$(python3 -c "
import json
d = json.load(open('$REPORT'))
print(d.get('any_fail', 0))
" 2>/dev/null)

if [[ "$ANY_FAIL" -gt 0 ]]; then
  echo "--- Phase 5b：Codex 複檢修補 $ANY_FAIL 份 fail 檔 ---"
  bash "$ROOT/scripts/JOB226_phase5b_codex.sh" "$COMBO"

  echo "--- Phase 5a 重跑：char_count 補 ---"
  python3 "$ROOT/scripts/JOB226_fix_char_count.py" --combo "$COMBO" 2>&1 | tail -3

  echo "--- Phase 5 round 2：重驗 ---"
  python3 "$ROOT/scripts/JOB226_validate_combo.py" --combo "$COMBO" 2>&1 | tail -10

  ANY_FAIL_R2=$(python3 -c "
import json
d = json.load(open('$REPORT'))
print(d.get('any_fail', 0))
" 2>/dev/null)
  if [[ "$ANY_FAIL_R2" -gt 0 ]]; then
    echo "⚠️  Phase 5b round 1 後仍有 $ANY_FAIL_R2 份 fail。建議手動檢查或啟用 Sonnet 降級。"
    echo "    log: knowledge/3_考古題/_logs/JOB-226-phase5b/$COMBO/"
  else
    echo "✅ Phase 5b round 1 後全綠"
  fi
else
  echo "✅ Phase 5 round 1 全綠，無需 Phase 5b"
fi

# Phase 4：產 _index.json
echo "--- Phase 4：產 _index.json ---"
python3 "$ROOT/scripts/JOB226_build_combo_index.py" --combo "$COMBO" 2>&1 | tail -5

echo ""
echo "=== $COMBO 結案 wrapper 完成 ==="
echo "下一步（人工或單獨腳本）："
echo "  1. Phase 6 codex 抽樣：bash scripts/JOB226_phase6_codex_sample.sh $COMBO"
echo "  2. 寫 _integration_report.md（手動或腳本）"
echo "  3. 更新 progress：python3 scripts/JOB226_update_progress.py --combo $COMBO --status done --integrated-count $TOTAL --codex-sample-pass <PASS|FAIL>"
echo "  4. Discord 結案回報"
