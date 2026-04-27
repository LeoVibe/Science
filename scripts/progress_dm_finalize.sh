#!/usr/bin/env bash
# scripts/progress_dm_finalize.sh — PM 回應後收尾
# spec: docs/superpowers/specs/2026-04-27-progress-resume-system-design.md (§5.3, §6.5)
# 行為：
#   1. 寫派工單 dm-log 區塊「Resumed by Agent」段
#   2. 套用 PM 決定到進度檔（append 一筆對應 status 的 row；custom 不寫）
#   3. 觸發 progress_sync 同步摘要
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

JOB="${1:?JOB id required}"
shift

JOBS_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)/jobs"
ACTION=""
UNIT_ID=""
MSG_ID=""
ANNOTATION=""
while [[ $# -gt 0 ]]; do
    case "$1" in
        --jobs-dir) JOBS_DIR="$2"; shift 2 ;;
        --action) ACTION="$2"; shift 2 ;;
        --unit-id) UNIT_ID="$2"; shift 2 ;;
        --msg-id) MSG_ID="$2"; shift 2 ;;
        --annotation) ANNOTATION="$2"; shift 2 ;;
        *) shift ;;
    esac
done

if [[ -z "${ACTION}" || -z "${UNIT_ID}" || -z "${MSG_ID}" ]]; then
    echo "progress_dm_finalize: Required: --action --unit-id --msg-id" >&2
    exit 1
fi

JOB_MD=$(ls "${JOBS_DIR}"/${JOB}-*.md 2>/dev/null | grep -vE "(progress|Report)" | head -1 || true)
if [[ -z "${JOB_MD}" ]]; then
    echo "progress_dm_finalize: 派工單不存在 (${JOBS_DIR}/${JOB}-*.md)" >&2
    exit 1
fi

# 確認 dm-log marker 成對（防 awk 吞派工單尾端）
DM_START_COUNT=$(grep -c "<!-- progress-dm-log-start -->" "${JOB_MD}" || true)
DM_END_COUNT=$(grep -c "<!-- progress-dm-log-end -->" "${JOB_MD}" || true)
if [[ "${DM_START_COUNT}" != "1" || "${DM_END_COUNT}" != "1" ]]; then
    echo "progress_dm_finalize: dm-log marker 不成對或重複 (start=${DM_START_COUNT}, end=${DM_END_COUNT})" >&2
    exit 1
fi

# action → status 對照
case "${ACTION}" in
    accept) NEW_STATUS="done" ;;
    retry)  NEW_STATUS="retry" ;;
    skip)   NEW_STATUS="manual_review" ;;
    pause)  NEW_STATUS="paused" ;;
    abort)  NEW_STATUS="aborted" ;;
    custom) NEW_STATUS="" ;;
    *) echo "progress_dm_finalize: Unknown action: ${ACTION}" >&2; exit 1 ;;
esac

# Step 1: 寫派工單 dm-log 區塊「Resumed by Agent」段
TS=$(date -u +"%Y-%m-%dT%H:%M")
ENTRY_FILE=$(mktemp)
{
    echo ""
    echo "[${TS}] Resumed by Agent"
    echo "  pm_decision: ${ACTION} (msg_id: ${MSG_ID})"
    if [[ -n "${ANNOTATION}" ]]; then
        echo "  pm_annotation: ${ANNOTATION}"
    fi
    if [[ -n "${NEW_STATUS}" ]]; then
        echo "  resumed_unit: ${UNIT_ID} → status=${NEW_STATUS}"
    else
        echo "  resumed_unit: ${UNIT_ID} (custom: 由 Agent 開新對話處理)"
    fi
} > "${ENTRY_FILE}"

# 同目錄 mktemp 避免跨 fs mv 改 mode/group
TMP_OUT=$(mktemp "${JOB_MD}.XXXXXX")
awk -v entry_file="${ENTRY_FILE}" '
    BEGIN {
        while ((getline line < entry_file) > 0) {
            entry = (entry == "" ? line : entry "\n" line)
        }
        close(entry_file)
    }
    /<!-- progress-dm-log-end -->/ {
        if (!appended) {
            print entry
            appended = 1
        }
        print
        next
    }
    { print }
' "${JOB_MD}" > "${TMP_OUT}"

# 保留原 mode
ORIG_MODE=$(stat -f '%Lp' "${JOB_MD}" 2>/dev/null || stat -c '%a' "${JOB_MD}" 2>/dev/null || echo "644")
chmod "${ORIG_MODE}" "${TMP_OUT}" 2>/dev/null || true
mv "${TMP_OUT}" "${JOB_MD}"
rm -f "${ENTRY_FILE}"

# Step 2: 套用 status 到進度檔（custom 不寫，由 Agent 開新對話處理）
if [[ -n "${NEW_STATUS}" ]]; then
    DESC="PM ${ACTION} via DM ${MSG_ID}"
    if [[ -n "${ANNOTATION}" ]]; then
        DESC="${DESC} (${ANNOTATION})"
    fi
    "${SCRIPT_DIR}/progress_append.sh" "${JOB}" \
        --jobs-dir "${JOBS_DIR}" \
        --unit-id "${UNIT_ID}" \
        --agent "pm" \
        --status "${NEW_STATUS}" \
        --desc "${DESC}" >&2
fi

# Step 3: sync
"${SCRIPT_DIR}/progress_sync.sh" "${JOB}" --jobs-dir "${JOBS_DIR}" >&2

echo "finalized: ${JOB} / ${UNIT_ID} / ${ACTION} → ${NEW_STATUS:-(custom)}" >&2
