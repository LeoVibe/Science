#!/bin/bash
# Orchestrator 進度檢查腳本

STATE_FILE="/Users/s389080/Documents/doc/work/0_AI_Project/eidosProject/scripts/orchestrator-logs/state.json"
RUN_LOG="/Users/s389080/Documents/doc/work/0_AI_Project/eidosProject/scripts/orchestrator-logs/run.log"

# 檢查進程
if pgrep -f "orchestrator.js" > /dev/null; then
  PROCESS_STATUS="✅ 運行中"
else
  PROCESS_STATUS="❌ 已停止"
fi

# 統計任務狀態
if [ -f "$STATE_FILE" ]; then
  DONE=$(grep -c '"status": "done"' "$STATE_FILE" 2>/dev/null) || DONE=0
  FAILED=$(grep -c '"status": "failed"' "$STATE_FILE" 2>/dev/null) || FAILED=0
  PENDING=$(grep -c '"status": "pending"' "$STATE_FILE" 2>/dev/null) || PENDING=0
  IN_PROGRESS=$(grep -c '"status": "in_progress"' "$STATE_FILE" 2>/dev/null) || IN_PROGRESS=0
  TOTAL=$((DONE + FAILED + PENDING + IN_PROGRESS))
else
  DONE=0
  FAILED=0
  PENDING=0
  IN_PROGRESS=0
  TOTAL=0
fi

# 獲取最後執行的任務
LAST_TASK=$(tail -5 "$RUN_LOG" 2>/dev/null | grep "執行\|❌\|✅" | tail -1)

# 輸出報告
echo "======================================"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Orchestrator 進度報告"
echo "======================================"
echo "進程狀態：$PROCESS_STATUS"
echo "任務統計："
echo "  ✅ 完成（done）：$DONE"
echo "  ❌ 失敗（failed）：$FAILED"
echo "  ⏳ 待執行（pending）：$PENDING"
echo "  🔄 執行中（in_progress）：$IN_PROGRESS"
echo "  📊 總計：$TOTAL / 213"
echo ""
COMPLETED=$((DONE + FAILED + IN_PROGRESS))
echo "進度：$COMPLETED / 213"
echo ""
echo "最後執行："
echo "  $LAST_TASK"
echo "======================================"
