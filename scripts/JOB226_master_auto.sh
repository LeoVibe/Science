#!/bin/bash
# JOB-226 master orchestrator — 全自動跑指定學期所有 pending combos
# 用法: bash scripts/JOB226_master_auto.sh "四下" "五下" "六下"
# 配置: 每批 2 個 combo 並行（PARALLEL=4 × 2 = 8 codex threads）

set -o pipefail
ROOT="/Users/s389080/Documents/doc/work/0_AI_Project/eidosProject"
LOG_DIR="$ROOT/scripts/orchestrator-logs/JOB226_master_auto"
mkdir -p "$LOG_DIR"

SEMS=("$@")
[[ ${#SEMS[@]} -eq 0 ]] && SEMS=("四下" "五下" "六下")

echo "==========================================="
echo "  JOB-226 MASTER AUTO PIPELINE"
echo "  目標學期: ${SEMS[*]}"
echo "  啟動時間: $(date '+%Y-%m-%d %H:%M:%S')"
echo "==========================================="
echo ""

# 取得 pending combos（按學期 + 科目順序）
get_pending() {
  local sems_str=$(printf "'%s'," "${SEMS[@]}" | sed 's/,$//')
  python3 -c "
import json
d = json.load(open('$ROOT/jobs/JOB-226-progress.json'))
sems = [$sems_str]
# 科目排序：自然 → 社會 → 國語 → 數學 → 英語
subj_order = {'自然': 0, '社會': 1, '國語': 2, '數學': 3, '英語': 4}
sem_order = {'三下': 0, '四下': 1, '五下': 2, '六下': 3}
combos = [c for c in d['combos'] if c['semester'] in sems and c.get('status') != 'done']
combos.sort(key=lambda c: (sem_order.get(c['semester'], 9), subj_order.get(c['subject'], 9), c['publisher']))
for c in combos:
    print(c['combo'])
"
}

PENDING=()
while IFS= read -r line; do PENDING+=("$line"); done < <(get_pending)

TOTAL=${#PENDING[@]}
echo "待跑 combos: $TOTAL 個"
for c in "${PENDING[@]}"; do echo "  - $c"; done
echo ""

# 主循環：每次 2 個並行
i=0
BATCH=1
while [[ $i -lt $TOTAL ]]; do
  c1="${PENDING[$i]}"
  c2="${PENDING[$((i+1))]:-}"

  echo "=========================================="
  echo "  BATCH $BATCH: $c1 ${c2:+及 $c2}"
  echo "  $(date '+%H:%M:%S')"
  echo "=========================================="

  bash "$ROOT/scripts/JOB226_combo_full_pipeline.sh" "$c1" > "$LOG_DIR/batch${BATCH}-A-${c1}.log" 2>&1 &
  PID1=$!

  if [[ -n "$c2" ]]; then
    bash "$ROOT/scripts/JOB226_combo_full_pipeline.sh" "$c2" > "$LOG_DIR/batch${BATCH}-B-${c2}.log" 2>&1 &
    PID2=$!
    wait $PID1 $PID2
    i=$((i+2))
  else
    wait $PID1
    i=$((i+1))
  fi

  # 進度回報
  python3 -c "
import json
d = json.load(open('$ROOT/jobs/JOB-226-progress.json'))
done = sum(1 for c in d['combos'] if c.get('status') == 'done')
partial = sum(1 for c in d['combos'] if c.get('status') == 'partial')
total = len(d['combos'])
files = sum(c.get('integrated_count', 0) for c in d['combos'] if c.get('status') in ('done','partial'))
print(f'>>> 全 JOB 進度: {done}/{total} done, partial={partial}, 總檔案 {files}')
" 2>/dev/null

  BATCH=$((BATCH + 1))
done

echo ""
echo "==========================================="
echo "  MASTER AUTO PIPELINE 完成"
echo "  結束時間: $(date '+%Y-%m-%d %H:%M:%S')"
echo "==========================================="

# 最終進度
python3 -c "
import json
d = json.load(open('$ROOT/jobs/JOB-226-progress.json'))
from collections import Counter
status_counts = Counter(c.get('status', 'pending') for c in d['combos'])
print('=== 全 JOB 最終狀態 ===')
for s, n in status_counts.most_common():
    print(f'  {s}: {n}')
"
