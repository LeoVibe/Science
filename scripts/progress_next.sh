#!/usr/bin/env bash
# scripts/progress_next.sh — 找下一個未完成單位
# spec: docs/superpowers/specs/2026-04-27-progress-resume-system-design.md
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/progress_common.sh"

JOB="${1:?JOB id required}"
shift

JOBS_DIR="$(cd "$SCRIPT_DIR/.." && pwd)/jobs"
AGENT_FILTER=""
while [[ $# -gt 0 ]]; do
    case "$1" in
        --jobs-dir) JOBS_DIR="$2"; shift 2 ;;
        --agent) AGENT_FILTER="$2"; shift 2 ;;
        *) shift ;;
    esac
done

JOB_MD=$(ls "$JOBS_DIR"/${JOB}-*.md 2>/dev/null | grep -vE "(progress|Report)" | head -1 || true)
if [[ -z "$JOB_MD" ]]; then
    echo "progress_next: 派工單不存在 ($JOBS_DIR/${JOB}-*.md)" >&2
    exit 1
fi
TSV="$JOBS_DIR/${JOB}-progress.tsv"

# 解析範圍
RANGE=$(parse_config_range "$JOB_MD" 2>/dev/null || true)
if [[ -z "$RANGE" ]]; then
    echo "progress_next: progress-config range 解析失敗或為空" >&2
    exit 1
fi

# done 清單（從進度檔讀；不存在則空）
DONE_LIST=""
if [[ -f "$TSV" ]]; then
    # 簡單 schema 檢查：欄數正確
    NF_HEADER=$(awk -F'\t' 'NR==1 {print NF; exit}' "$TSV")
    if [[ -n "$NF_HEADER" && "$NF_HEADER" != "13" ]]; then
        echo "progress_next: 進度檔 schema 欄數錯誤 (NF=$NF_HEADER, 應 13)" >&2
        exit 2
    fi
    DONE_LIST=$(progress_done_units "$TSV")
fi

# 找第一個不在 DONE_LIST 內的 unit_id
NEXT=""
while IFS= read -r unit; do
    [[ -n "$unit" ]] || continue
    if [[ -z "$DONE_LIST" ]] || ! grep -qxF "$unit" <<<"$DONE_LIST"; then
        NEXT="$unit"
        break
    fi
done <<<"$RANGE"

if [[ -z "$NEXT" ]]; then
    echo "NONE"
    exit 0
fi

# 拆 unit_id：question_pipeline_v1 schema 為 <subject_short>_<publisher>_<lesson>
SUBJECT_SHORT=$(echo "$NEXT" | cut -d_ -f1)
PUBLISHER=$(echo "$NEXT" | cut -d_ -f2)
LESSON=$(echo "$NEXT" | cut -d_ -f3)

# subject short → full（對齊 question/platform/ 目錄命名）
case "$SUBJECT_SHORT" in
    Sci) SUBJECT="Science" ;;
    Soc) SUBJECT="SocialStudies" ;;
    Chi) SUBJECT="Chinese" ;;
    Mat) SUBJECT="Math" ;;
    Eng) SUBJECT="English" ;;
    *) SUBJECT="$SUBJECT_SHORT" ;;
esac

cat <<EOF
unit_id=$NEXT
subject=$SUBJECT
publisher=$PUBLISHER
lesson=$LESSON
EOF
