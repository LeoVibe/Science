#!/usr/bin/env bash
# scripts/progress_monitor.sh — 進度檔監控
# spec: docs/superpowers/specs/2026-04-27-progress-resume-system-design.md (§3, §9)
# 升級自 scripts/g5s2_tsv_monitor.sh：
#   - 接 JOB id 參數，自動定位 jobs/${JOB}-progress.tsv
#   - 偵測 schema 欄數（13 欄新版 / 12 欄 g5s2 舊版）動態調整 status_col
#   - 印 status 分布、各 agent 進度、pending_pm/manual_review 詳細、最新 5 筆
# 相容性：保留 g5s2_results.tsv（JOB-210 過渡期）
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

JOB="${1:?JOB id required, e.g. JOB-211}"
shift || true

JOBS_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)/jobs"
while [[ $# -gt 0 ]]; do
    case "$1" in
        --jobs-dir) JOBS_DIR="$2"; shift 2 ;;
        *) shift ;;
    esac
done

TSV="${JOBS_DIR}/${JOB}-progress.tsv"

# 向下相容：JOB-210 用 g5s2_results.tsv
if [[ ! -f "${TSV}" ]]; then
    if [[ "${JOB}" == "JOB-210" && -f "${JOBS_DIR}/g5s2_results.tsv" ]]; then
        TSV="${JOBS_DIR}/g5s2_results.tsv"
    else
        echo "progress_monitor: 進度檔不存在 (${TSV})" >&2
        exit 1
    fi
fi

# 偵測 schema：13 欄新版 status 在 col 11；12 欄 g5s2 舊版 status 在 col 10
NF=$(awk -F'\t' 'NR==1 {print NF; exit}' "${TSV}")
case "${NF}" in
    13) STATUS_COL=11; DESC_COL=12; UNIT_COL=1; AGENT_COL=3 ;;
    12) STATUS_COL=10; DESC_COL=11; UNIT_COL=1; AGENT_COL=2 ;;  # g5s2 舊版
    *)  echo "progress_monitor: 不認識的 schema (NF=${NF}, 應為 13 或 12)" >&2; exit 2 ;;
esac

LINE_COUNT=$(awk 'NR>1' "${TSV}" | wc -l | tr -d ' ')

echo "=== ${JOB} 進度監控 ($(date '+%Y-%m-%d %H:%M')) ==="
echo "tsv: ${TSV}"
echo "schema: ${NF} 欄（status_col=${STATUS_COL}）"
echo "資料行數：${LINE_COUNT}"
echo

if [[ "${LINE_COUNT}" -eq 0 ]]; then
    echo "（尚無資料，tsv 僅含 header）"
    exit 0
fi

echo "📈 status 分布："
awk -F'\t' -v col="${STATUS_COL}" '
    NR>1 {
        s = $col
        gsub(/^[ \t]+|[ \t\r]+$/, "", s)
        if (s != "") print s
    }
' "${TSV}" | sort | uniq -c | sort -rn
echo

echo "📊 各 agent 進度（status=done 或 keep）："
awk -F'\t' -v col="${STATUS_COL}" -v acol="${AGENT_COL}" '
    NR>1 {
        s = $col
        gsub(/^[ \t]+|[ \t\r]+$/, "", s)
        if (s == "done" || s == "keep") a[$acol]++
    }
    END {
        for (k in a) print "  " k ": " a[k] " 單過閘"
    }
' "${TSV}"
echo

echo "⚠️  pending_pm 待回覆："
awk -F'\t' -v col="${STATUS_COL}" -v ucol="${UNIT_COL}" -v dcol="${DESC_COL}" '
    NR>1 {
        s = $col
        gsub(/^[ \t]+|[ \t\r]+$/, "", s)
        if (s == "pending_pm") print "  " $ucol ": " $dcol
    }
' "${TSV}"
echo

echo "🟡 manual_review 待裁定："
awk -F'\t' -v col="${STATUS_COL}" -v ucol="${UNIT_COL}" -v dcol="${DESC_COL}" '
    NR>1 {
        s = $col
        gsub(/^[ \t]+|[ \t\r]+$/, "", s)
        if (s == "manual_review") print "  " $ucol ": " $dcol
    }
' "${TSV}"
echo

echo "🔥 最新 5 筆："
tail -n 5 "${TSV}" | column -t -s $'\t'
