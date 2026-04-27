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
        *) echo "progress_monitor: unknown arg '$1'" >&2; exit 2 ;;
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
# 13 欄：unit_id(1) commit(2) agent(3) subject(4) publisher(5) lesson(6) CQI-P CQI-V Match% QL status(11) desc(12) ts
# 12 欄 g5s2：commit(1) agent(2) subject(3) publisher(4) lesson(5) CQI-P CQI-V Match% QL status(10) desc(11) ts
# 12 欄沒有 unit_id 欄，由 subject+publisher+lesson 合成（見下方 awk 內建）
NF=$(awk -F'\t' 'NR==1 {print NF; exit}' "${TSV}")
case "${NF}" in
    13) STATUS_COL=11; DESC_COL=12; AGENT_COL=3; UNIT_EXPR='$1' ;;
    12) STATUS_COL=10; DESC_COL=11; AGENT_COL=2; UNIT_EXPR='$3"_"$4"_"$5' ;;  # g5s2 合成 unit_id
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

# 注意：12 欄 g5s2 仍有 keep 狀態（過渡期），13 欄 schema 不再使用，但 OR 一行同時相容兩版
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
awk -F'\t' -v col="${STATUS_COL}" -v dcol="${DESC_COL}" "
    NR>1 {
        s = \$col
        gsub(/^[ \\t]+|[ \\t\\r]+\$/, \"\", s)
        if (s == \"pending_pm\") print \"  \" ${UNIT_EXPR} \": \" \$dcol
    }
" "${TSV}"
echo

echo "🟡 manual_review 待裁定："
awk -F'\t' -v col="${STATUS_COL}" -v dcol="${DESC_COL}" "
    NR>1 {
        s = \$col
        gsub(/^[ \\t]+|[ \\t\\r]+\$/, \"\", s)
        if (s == \"manual_review\") print \"  \" ${UNIT_EXPR} \": \" \$dcol
    }
" "${TSV}"
echo

echo "❌ failed / aborted / retry 待處理："
awk -F'\t' -v col="${STATUS_COL}" -v dcol="${DESC_COL}" "
    NR>1 {
        s = \$col
        gsub(/^[ \\t]+|[ \\t\\r]+\$/, \"\", s)
        if (s == \"failed\" || s == \"aborted\" || s == \"retry\") print \"  [\" s \"] \" ${UNIT_EXPR} \": \" \$dcol
    }
" "${TSV}"
echo

echo "🔥 最新 5 筆："
tail -n 5 "${TSV}" | column -t -s $'\t'
