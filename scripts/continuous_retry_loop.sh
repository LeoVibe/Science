#!/bin/bash
# 連續跑 exam_download_runner.py --retry-failed，直到沒有 failed/partial 為止
# 用法：bash scripts/continuous_retry_loop.sh > scripts/orchestrator-logs/JOB-209-retry-loop.log 2>&1 &

set -uo pipefail
cd "$(dirname "$0")/.."

PROGRESS=knowledge/3_考古題/_manifest/download_progress.json

batch_n=0
prev_remaining=-1
while true; do
    remaining=$(python3 -c "import json; data=json.load(open('$PROGRESS')); print(sum(1 for r in data if r['status'] in ('failed','partial')))")
    if [ "$remaining" -eq 0 ]; then
        echo "[$(date '+%F %T')] ✅ failed/partial=0 全部完成，retry loop 結束"
        break
    fi
    # 如果連續兩輪 remaining 沒減少，就停（避免無窮 retry 失敗的）
    if [ "$prev_remaining" -eq "$remaining" ] && [ "$batch_n" -gt 0 ]; then
        echo "[$(date '+%F %T')] ⚠️ 連續兩輪沒減少（remaining=$remaining），retry loop 結束"
        break
    fi
    prev_remaining=$remaining
    batch_n=$((batch_n + 1))
    echo "[$(date '+%F %T')] === Retry Batch #$batch_n 啟動，剩 $remaining failed/partial ==="
    python3 scripts/exam_download_runner.py --run --batch 30 --retry-failed
    echo "[$(date '+%F %T')] === Retry Batch #$batch_n 結束 ==="
    sleep 120
done
