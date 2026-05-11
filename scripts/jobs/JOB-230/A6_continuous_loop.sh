#!/bin/bash
# JOB-230 Phase 5 continuous full loop wrapper（worker A/B/C 通用）
# 反覆呼叫 dispatch 直到該 worker ~46 份全部完成或進度停滯。
#
# 用法：
#   bash scripts/jobs/JOB-230/A6_continuous_loop.sh A   # 跑 worker A
#   bash scripts/jobs/JOB-230/A6_continuous_loop.sh B   # 跑 worker B
#   bash scripts/jobs/JOB-230/A6_continuous_loop.sh C   # 跑 worker C

set -uo pipefail
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$ROOT"

WORKER="${1:-}"
if [ -z "$WORKER" ] || [[ ! "$WORKER" =~ ^[ABC]$ ]]; then
  echo "ERROR: 必須指定 worker A|B|C" >&2
  echo "用法: bash $0 [A|B|C]" >&2
  exit 1
fi

PROGRESS_FILE="scripts/jobs/JOB-230/_full_progress_${WORKER}.json"
TARGETS_FILE="scripts/jobs/JOB-230/_full_targets_${WORKER}.json"
TOTAL=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$TARGETS_FILE')).targets.length)")

count_remaining() {
python3 - "$PROGRESS_FILE" "$TOTAL" << 'PY' 2>/dev/null
import json, sys
try:
    data = json.load(open(sys.argv[1]))
    total = int(sys.argv[2])
    remaining = total - len(data.get('completed', []))
    print(remaining)
except Exception:
    print(-1)
    sys.exit(0)
PY
}

batch_n=0
prev_remaining=-1

while true; do
  remaining=$(count_remaining 2>/dev/null || echo -1)

  if [ -z "$remaining" ] || ! [[ "$remaining" =~ ^-?[0-9]+$ ]]; then
    echo "[Worker $WORKER 警告] count_remaining 失敗，60s 後重試"
    sleep 60
    continue
  fi

  if [ "$remaining" -lt 0 ]; then
    echo "[Worker $WORKER 警告] count_remaining 失敗，60s 後重試"
    sleep 60
    continue
  fi

  if [ "$remaining" -eq 0 ]; then
    echo "[Worker $WORKER 完成] $TOTAL/$TOTAL 全部完成"
    break
  fi

  if [ "$prev_remaining" -eq "$remaining" ] && [ "$batch_n" -gt 0 ]; then
    echo "[Worker $WORKER ERROR] 連續兩輪無進展（remaining=$remaining），loop 終止"
    break
  fi

  prev_remaining=$remaining
  batch_n=$((batch_n + 1))
  echo "=== [Worker $WORKER] Batch #$batch_n 啟動，剩 $remaining ==="

  if ! bash scripts/jobs/JOB-230/A5_full_dispatch.sh "$WORKER"; then
    echo "[Worker $WORKER 警告] A5_full_dispatch.sh 執行失敗，將依下一輪 remaining 判斷是否續跑"
  fi

  sleep 30
done
