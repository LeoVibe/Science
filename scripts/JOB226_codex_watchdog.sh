#!/bin/bash
# JOB-226 codex watchdog：自動 kill 卡死超過 N 分鐘的 codex 進程
# 用法: bash scripts/JOB226_codex_watchdog.sh [timeout_seconds=1500]
TIMEOUT="${1:-1500}"
LOG="/tmp/JOB226_watchdog.log"
echo "=== watchdog 啟動 timeout=${TIMEOUT}s @ $(date) ===" >> "$LOG"
# macOS ps 不支援 etimes（秒數），只能 etime（HH:MM:SS 或 MM:SS）— 自己解析
parse_etime_to_sec() {
  local et="$1"
  # 格式可能：MM:SS / HH:MM:SS / DD-HH:MM:SS
  local d=0 h=0 m=0 s=0
  if [[ "$et" =~ ^([0-9]+)-([0-9]+):([0-9]+):([0-9]+)$ ]]; then
    d=${BASH_REMATCH[1]}; h=${BASH_REMATCH[2]}; m=${BASH_REMATCH[3]}; s=${BASH_REMATCH[4]}
  elif [[ "$et" =~ ^([0-9]+):([0-9]+):([0-9]+)$ ]]; then
    h=${BASH_REMATCH[1]}; m=${BASH_REMATCH[2]}; s=${BASH_REMATCH[3]}
  elif [[ "$et" =~ ^([0-9]+):([0-9]+)$ ]]; then
    m=${BASH_REMATCH[1]}; s=${BASH_REMATCH[2]}
  else
    echo 0; return
  fi
  echo $(( d*86400 + h*3600 + m*60 + s ))
}

while true; do
  # 同時抓「codex exec」(舊版) 與 v2 dispatcher 形式（含 -c model_reasoning_effort）
  for pid in $(pgrep -f "codex exec" 2>/dev/null); do
    et=$(ps -o etime= -p $pid 2>/dev/null | tr -d ' ')
    [[ -z "$et" ]] && continue
    sec=$(parse_etime_to_sec "$et")
    if [[ $sec -gt $TIMEOUT ]]; then
      kill -9 "$pid" 2>/dev/null && echo "[$(date '+%H:%M:%S')] killed pid=$pid etime=$et (${sec}s)" >> "$LOG"
    fi
  done
  sleep 60
done
