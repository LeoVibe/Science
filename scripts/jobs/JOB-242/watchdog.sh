#!/bin/bash
# JOB-242 Phase 1 watchdog — 偵測卡住的 codex 並 kill
# 邏輯：每 60s 檢查 worker_C_南一.log 是否有 update，若 > 15 min 無變化且仍有 codex 跑 → kill
# 跑：bash scripts/jobs/JOB-242/watchdog.sh > scripts/jobs/JOB-242/_phase1_logs/watchdog.log 2>&1 &

LOG_FILE="scripts/jobs/JOB-242/_phase1_logs/worker_C_南一.log"
STALE_THRESHOLD=900   # 15 min

cd /Users/s389080/Documents/doc/work/0_AI_Project/eidosProject

echo "[watchdog] start at $(date) PID=$$"

last_size=0
stable_since=$(date +%s)

while true; do
  # 若 worker_C log 顯示 all done → 退出
  if grep -q "Worker C_南一] all" "$LOG_FILE" 2>/dev/null; then
    echo "[watchdog] $(date) Worker C 完成，退出"
    break
  fi

  # 看 log 檔案 size 變化
  current_size=$(stat -f %z "$LOG_FILE" 2>/dev/null || echo 0)
  now=$(date +%s)

  if [ "$current_size" != "$last_size" ]; then
    last_size=$current_size
    stable_since=$now
    echo "[watchdog] $(date) log 更新 size=$current_size"
  else
    elapsed=$((now - stable_since))
    if [ $elapsed -gt $STALE_THRESHOLD ]; then
      echo "[watchdog] $(date) log ${elapsed}s 未變化（> ${STALE_THRESHOLD}s），找 codex kill"

      # 找正在跑的 codex 程序（取 worker C 對應的）
      # 簡化：直接 kill 所有 JOB-242 相關 codex
      pids=$(ps aux | grep "codex exec" | grep "JOB-242" | grep -v grep | awk '{print $2}')
      for pid in $pids; do
        echo "[watchdog] kill PID=$pid"
        kill "$pid" 2>&1 || true
      done
      stable_since=$now  # reset
    fi
  fi

  sleep 60
done

echo "[watchdog] end at $(date)"
