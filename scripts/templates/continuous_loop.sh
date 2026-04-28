#!/bin/bash
# 長時任務 連續批次 loop wrapper — 通用骨架
#
# 範本來源：JOB-209（米蘭考古題下載）→ JOB-214 抽象化
# 套用步驟：拷貝為 scripts/continuous_<task>_loop.sh，改 3 個 placeholder 即可
# 詳見 docs/長時任務執行範本.md
#
# 用法：bash scripts/continuous_<task>_loop.sh > scripts/orchestrator-logs/<task>-loop.log 2>&1 &
#
# ================================================================
# TASK-SPECIFIC PLACEHOLDERS（拷貝後務必改這 3 處）
# ================================================================
# 1. count_remaining()：計算還有多少未完成 record
# 2. WORKER_CMD：實際 worker 執行指令（含 batch 大小）
# 3. INTER_BATCH_SLEEP：批次間休息秒數（避免 API rate-limit）
# ================================================================

set -uo pipefail
cd "$(dirname "$0")/.."

# === Placeholder 1: 計算未完成數量 ===
count_remaining() {
python3 << 'PY'
import json
data = json.load(open('knowledge/<task-folder>/_manifest/progress.json'))
# 修改條件：依任務「未完成」定義
remaining = sum(1 for r in data if r.get('status') in ('pending', 'failed', 'partial'))
print(remaining)
PY
}

# === Placeholder 2: worker 指令 ===
WORKER_CMD="python3 scripts/<task>_runner.py --batch 30"

# === Placeholder 3: 批次間休息（避免 API rate-limit）===
INTER_BATCH_SLEEP=120  # 秒

# === 共通邏輯（拷貝後通常不用改）===

batch_n=0
prev_remaining=-1
while true; do
    # 防 unbound variable：count 失敗時 echo -1 而不是空字串
    remaining=$(count_remaining 2>/dev/null || echo -1)
    if [ -z "$remaining" ] || ! [[ "$remaining" =~ ^-?[0-9]+$ ]]; then
        echo "[$(date '+%F %T')] ⚠️ count_remaining 失敗（網路斷或 python error），等 60s 重試"
        sleep 60
        continue
    fi
    if [ "$remaining" -eq 0 ]; then
        echo "[$(date '+%F %T')] ✅ remaining=0 全部完成，loop 結束"
        break
    fi
    if [ "$prev_remaining" -eq "$remaining" ] && [ "$batch_n" -gt 0 ]; then
        echo "[$(date '+%F %T')] ⚠️ 連續兩輪沒減少（$remaining），loop 結束（避免無限重試救不回的）"
        break
    fi
    prev_remaining=$remaining
    batch_n=$((batch_n + 1))
    echo "[$(date '+%F %T')] === Batch #$batch_n 啟動，剩 $remaining ==="
    eval "$WORKER_CMD"
    echo "[$(date '+%F %T')] === Batch #$batch_n 結束 ==="
    sleep "$INTER_BATCH_SLEEP"
done
