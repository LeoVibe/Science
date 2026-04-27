#!/usr/bin/env bash
# scripts/progress_sync.sh — 同步派工單 progress-summary 區塊
# spec: docs/superpowers/specs/2026-04-27-progress-resume-system-design.md
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/progress_common.sh"

JOB="${1:?JOB id required}"
shift

JOBS_DIR="$(cd "$SCRIPT_DIR/.." && pwd)/jobs"
while [[ $# -gt 0 ]]; do
    case "$1" in
        --jobs-dir) JOBS_DIR="$2"; shift 2 ;;
        *) shift ;;
    esac
done

# 找派工單檔案（JOB-XXX-AG-* / -USER-* / -DEV-*；排除 progress 與 Report）
JOB_MD=$(ls "$JOBS_DIR"/${JOB}-*.md 2>/dev/null | grep -vE "(progress|Report)" | head -1 || true)
if [[ -z "$JOB_MD" ]]; then
    echo "progress_sync: 派工單不存在 ($JOBS_DIR/${JOB}-*.md)" >&2
    exit 1
fi
TSV="$JOBS_DIR/${JOB}-progress.tsv"

# 範圍總計
TOTAL=0
if RANGE_OUT=$(parse_config_range "$JOB_MD" 2>/dev/null); then
    TOTAL=$(printf '%s\n' "$RANGE_OUT" | grep -c . || true)
fi

# status 統計
COUNT_DONE=0
COUNT_PENDING_PM=0
COUNT_FAILED=0
COUNT_PAUSED=0
COUNT_PAUSED_OFFLINE=0
COUNT_MANUAL_REVIEW=0
COUNT_PARTIAL=0
COUNT_ABORTED=0
COUNT_RETRY=0

count_status() {
    local s="$1"
    [[ -f "$TSV" ]] || { echo 0; return; }
    awk -F'\t' -v target="$s" '
        NR>1 {
            v = $11
            gsub(/^[ \t]+|[ \t\r]+$/, "", v)
            if (v == target) c++
        }
        END { print c+0 }
    ' "$TSV"
}

COUNT_DONE=$(count_status done)
COUNT_PENDING_PM=$(count_status pending_pm)
COUNT_FAILED=$(count_status failed)
COUNT_PAUSED=$(count_status paused)
COUNT_PAUSED_OFFLINE=$(count_status paused_offline)
COUNT_MANUAL_REVIEW=$(count_status manual_review)
COUNT_PARTIAL=$(count_status partial)
COUNT_ABORTED=$(count_status aborted)
COUNT_RETRY=$(count_status retry)

# 百分比
if [[ "$TOTAL" -gt 0 ]]; then
    PCT=$(awk -v d="$COUNT_DONE" -v t="$TOTAL" 'BEGIN { printf "%.1f", d*100/t }')
else
    PCT="0.0"
fi

# pending_pm / manual_review 詳細
list_status_detail() {
    local s="$1"
    [[ -f "$TSV" ]] || return 0
    awk -F'\t' -v target="$s" '
        NR>1 {
            v = $11
            gsub(/^[ \t]+|[ \t\r]+$/, "", v)
            if (v == target) print "  - "$1" ("$12")"
        }
    ' "$TSV"
}
PENDING_PM_DETAIL=$(list_status_detail pending_pm)
MANUAL_REVIEW_DETAIL=$(list_status_detail manual_review)

# 最近 5 筆
RECENT_5=""
if [[ -f "$TSV" ]]; then
    RECENT_5=$(awk -F'\t' 'NR>1 {print "  - "$1" / "$3" / "$11" / "$12}' "$TSV" | tail -5)
fi

# ts
NOW=$(date -u +"%Y-%m-%dT%H:%M")

# 構建 summary 內容
SUMMARY_FILE=$(mktemp)
{
    echo "- 範圍總計：${TOTAL} 個單位"
    echo "- 已 done：${COUNT_DONE}（${PCT}%）"
    echo "- pending_pm：${COUNT_PENDING_PM}"
    [[ -n "$PENDING_PM_DETAIL" ]] && echo "$PENDING_PM_DETAIL"
    echo "- failed：${COUNT_FAILED}　paused：${COUNT_PAUSED}　paused_offline：${COUNT_PAUSED_OFFLINE}"
    echo "- manual_review：${COUNT_MANUAL_REVIEW}"
    [[ -n "$MANUAL_REVIEW_DETAIL" ]] && echo "$MANUAL_REVIEW_DETAIL"
    echo "- partial：${COUNT_PARTIAL}　aborted：${COUNT_ABORTED}　retry：${COUNT_RETRY}"
    echo "- 最近 5 筆："
    [[ -n "$RECENT_5" ]] && printf '%s\n' "$RECENT_5"
    echo "- 最後更新：${NOW} (sync from ${JOB}-progress.tsv)"
} > "$SUMMARY_FILE"

# 用 awk 替換 <!-- progress-summary-start --> 到 <!-- progress-summary-end --> 之間
TMP_OUT=$(mktemp)
awk -v summary_file="$SUMMARY_FILE" '
    BEGIN {
        while ((getline line < summary_file) > 0) {
            summary = (summary == "" ? line : summary "\n" line)
        }
        close(summary_file)
    }
    /<!-- progress-summary-start -->/ {
        print
        print summary
        in_block = 1
        next
    }
    /<!-- progress-summary-end -->/ {
        in_block = 0
    }
    !in_block { print }
' "$JOB_MD" > "$TMP_OUT"

mv "$TMP_OUT" "$JOB_MD"
rm -f "$SUMMARY_FILE"

echo "synced: $JOB ($COUNT_DONE/$TOTAL done, $COUNT_PENDING_PM pending_pm)" >&2
