#!/usr/bin/env bash
# scripts/progress_dm_prepare.sh — 卡點時寫 pending_pm + sync + 輸出 DM 文字
# spec: docs/superpowers/specs/2026-04-27-progress-resume-system-design.md (§5.3, §6.4)
# 注意：本腳本不直接呼叫 Discord MCP。Agent 接著用 mcp__plugin_discord_discord__reply 送出。
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/progress_common.sh"

JOB="${1:?JOB id required}"
shift

JOBS_DIR="$(cd "$SCRIPT_DIR/.." && pwd)/jobs"
UNIT_ID=""
REASON=""
AGENT="prod"  # 卡點預設記為 prod；caller 可用 --agent 覆寫
while [[ $# -gt 0 ]]; do
    case "$1" in
        --jobs-dir) JOBS_DIR="$2"; shift 2 ;;
        --unit-id) UNIT_ID="$2"; shift 2 ;;
        --reason) REASON="$2"; shift 2 ;;
        --agent) AGENT="$2"; shift 2 ;;
        *) shift ;;
    esac
done

if [[ -z "$UNIT_ID" || -z "$REASON" ]]; then
    echo "Required: --unit-id --reason" >&2
    exit 1
fi

JOB_MD=$(ls "$JOBS_DIR"/${JOB}-*.md 2>/dev/null | grep -vE "(progress|Report)" | head -1 || true)
if [[ -z "$JOB_MD" ]]; then
    echo "progress_dm_prepare: 派工單不存在" >&2
    exit 1
fi

# 確認 dm-log marker 成對
DM_START_COUNT=$(grep -c "<!-- progress-dm-log-start -->" "$JOB_MD" || true)
DM_END_COUNT=$(grep -c "<!-- progress-dm-log-end -->" "$JOB_MD" || true)
if [[ "$DM_START_COUNT" != "1" || "$DM_END_COUNT" != "1" ]]; then
    echo "progress_dm_prepare: dm-log marker 不成對或重複 (start=$DM_START_COUNT, end=$DM_END_COUNT)" >&2
    exit 1
fi

# Step 1: 寫 pending_pm 到進度檔
"$SCRIPT_DIR/progress_append.sh" "$JOB" \
    --jobs-dir "$JOBS_DIR" \
    --unit-id "$UNIT_ID" \
    --agent "$AGENT" \
    --status pending_pm \
    --desc "$REASON" >&2

# Step 2: sync 派工單摘要
"$SCRIPT_DIR/progress_sync.sh" "$JOB" --jobs-dir "$JOBS_DIR" >&2

# Step 3: 取 timeout（給 DM 文字使用）
TIMEOUT_VAL=$(parse_config_field "$JOB_MD" pm_response_timeout 2>/dev/null || echo "infinite")
TS=$(date -u +"%Y-%m-%dT%H:%M")

# Step 4: 寫派工單 dm-log 區塊「DM sent」段（msg_id 暫填 PENDING）
DM_LOG_FILE=$(mktemp)
{
    echo ""
    echo "[${TS}] DM sent (msg_id: PENDING)"
    echo "  reason: ${REASON}"
    echo "  unit: ${UNIT_ID}"
    echo "  pause_status: pending_pm"
    echo "  awaiting: PM 回覆（timeout: ${TIMEOUT_VAL}）"
} > "$DM_LOG_FILE"

TMP_OUT=$(mktemp "${JOB_MD}.XXXXXX")
awk -v entry_file="$DM_LOG_FILE" '
    BEGIN {
        while ((getline line < entry_file) > 0) {
            entry = (entry == "" ? line : entry "\n" line)
        }
        close(entry_file)
    }
    /<!-- progress-dm-log-start -->/ {
        print
        print entry
        in_block = 1
        next
    }
    /<!-- progress-dm-log-end -->/ {
        in_block = 0
    }
    # 在 block 內保留現有資料（除了佔位「（待 progress_dm 寫入）」）
    in_block {
        if ($0 != "（待 progress_dm 寫入）") print
        next
    }
    !in_block { print }
' "$JOB_MD" > "$TMP_OUT"

# 保留原 mode
ORIG_MODE=$(stat -f '%Lp' "$JOB_MD" 2>/dev/null || stat -c '%a' "$JOB_MD" 2>/dev/null || echo "644")
chmod "$ORIG_MODE" "$TMP_OUT" 2>/dev/null || true
mv "$TMP_OUT" "$JOB_MD"
rm -f "$DM_LOG_FILE"

# Step 5: stdout 輸出 DM 文字（Agent 用 mcp__plugin_discord_discord__reply 發送）
cat <<EOF
🚨 [${JOB} 卡點] ${UNIT_ID}
${REASON}

回覆下列任一：
  1  accept    接受現況、推進
  2  retry     重試這單
  3  skip      跳過、標 manual_review
  4  pause     整個 JOB 暫停
  5  abort     整個 JOB 中止
  6  custom    自由講話（你開新對話下指令）

可加註：例如「1 QL3 即可」（=accept + 補充）

詳細：jobs/${JOB}-progress.tsv
EOF
