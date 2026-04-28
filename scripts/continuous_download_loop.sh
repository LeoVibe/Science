#!/bin/bash
# 連續跑 exam_download_runner.py，直到 pending=0 或人為 kill
# 用法：bash scripts/continuous_download_loop.sh > scripts/orchestrator-logs/JOB-209-loop.log 2>&1 &

set -uo pipefail
cd "$(dirname "$0")/.."

PROGRESS=knowledge/3_考古題/_manifest/download_progress.json

batch_n=0
while true; do
    pending=$(python3 -c "import json; data=json.load(open('$PROGRESS')); print(sum(1 for r in data if r['status']=='pending'))")
    if [ "$pending" -eq 0 ]; then
        echo "[$(date '+%F %T')] ✅ pending=0 全部完成，loop 結束"
        break
    fi
    batch_n=$((batch_n + 1))
    echo "[$(date '+%F %T')] === Batch #$batch_n 啟動，剩 $pending pending ==="
    python3 scripts/exam_download_runner.py --run --batch 30
    echo "[$(date '+%F %T')] === Batch #$batch_n 結束 ==="
    # 批次間休息 2 分鐘，避免 rate limit
    sleep 120
done
