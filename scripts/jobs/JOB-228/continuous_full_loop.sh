#!/bin/bash
# JOB-228 Phase 5 continuous full loop wrapper.
# Re-runs the full dispatcher until all 109 items are completed or progress stalls.

set -uo pipefail

ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$ROOT"

count_remaining() {
python3 << 'PY' 2>/dev/null
import json, sys
try:
    data = json.load(open('scripts/jobs/JOB-228/_full_progress.json'))
    remaining = 109 - len(data.get('completed', []))
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
    echo "[警告] count_remaining 失敗，60s 後重試"
    sleep 60
    continue
  fi

  if [ "$remaining" -lt 0 ]; then
    echo "[警告] count_remaining 失敗，60s 後重試"
    sleep 60
    continue
  fi

  if [ "$remaining" -eq 0 ]; then
    echo "[完成] 109/109 全部完成，觸發 Phase B"
    if [ -f scripts/jobs/JOB-228/run_phase_b.sh ]; then
      bash scripts/jobs/JOB-228/run_phase_b.sh
    else
      echo "[INFO] run_phase_b.sh 尚未建立，等 Claude 接手"
    fi
    break
  fi

  if [ "$prev_remaining" -eq "$remaining" ] && [ "$batch_n" -gt 0 ]; then
    echo "[ERROR] 連續兩輪無進展（remaining=$remaining），loop 終止"
    break
  fi

  prev_remaining=$remaining
  batch_n=$((batch_n + 1))
  echo "=== Batch #$batch_n 啟動，剩 $remaining ==="

  if ! bash scripts/jobs/JOB-228/A2_full_dispatch.sh; then
    echo "[警告] A2_full_dispatch.sh 執行失敗，將依下一輪 remaining 判斷是否續跑"
  fi

  sleep 30
done
