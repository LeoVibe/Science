#!/bin/bash
# JOB-238 Phase 5 啟動三 worker（A/B/C 並行 ~120 份序列抽取 → 扣黃金+Pilot 後 ~114 份）
# 每 worker 在背景跑 continuous_loop（會自動續跑直到完成）

set -uo pipefail
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$ROOT"

LOG_DIR="scripts/orchestrator-logs"
mkdir -p "$LOG_DIR"

echo "[$(date '+%H:%M:%S')] === JOB-238 Phase 5 啟動 3 worker ==="

# 預先建立 progress.json（避免 loop wrapper count_remaining 失敗永遠 sleep）
for W in A B C; do
  P="scripts/jobs/JOB-238/_full_progress_${W}.json"
  if [ ! -f "$P" ]; then
    echo '{"started_at":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","worker":"'$W'","completed":[],"failed":[],"running":null}' > "$P"
    echo "  init progress: $P"
  else
    echo "  resume progress: $P"
  fi
done

for W in A B C; do
  LOG_FILE="$LOG_DIR/JOB-238-loop-${W}.log"
  echo "[$(date '+%H:%M:%S')] 啟動 Worker $W → $LOG_FILE"
  nohup bash scripts/jobs/JOB-238/A6_continuous_loop.sh "$W" \
    > "$LOG_FILE" 2>&1 &
  echo "  PID=$!"
  sleep 2  # 錯開啟動避免同時搶 codex socket
done

echo ""
echo "[$(date '+%H:%M:%S')] 三 worker 啟動完成。監控指令："
echo "  python3 scripts/jobs/JOB-238/dashboard.py --since-minutes 60"
echo "  tail -f $LOG_DIR/JOB-238-loop-A.log"
echo "  tail -f $LOG_DIR/JOB-238-loop-B.log"
echo "  tail -f $LOG_DIR/JOB-238-loop-C.log"
echo ""
echo "停止指令："
echo "  pkill -f 'A6_continuous_loop.sh'"
echo "  pkill -f 'A5_full_dispatch.sh'"
echo "  pkill -9 -f 'codex exec --skip-git-repo-check --full-auto'"
