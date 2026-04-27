#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

# 每個 case 獨立準備 fixture
prepare_case() {
    local TMP
    TMP=$(mktemp -d)
    mkdir -p "${TMP}/jobs"
    cp "${ROOT_DIR}/tests/fixtures/progress_test_job.md" "${TMP}/jobs/JOB-TEST-AG-fake.md"
    # fixture 的 progress.tsv 提供 L1/L2 已 done 的初始狀態
    cp "${ROOT_DIR}/tests/fixtures/progress_test_progress.tsv" "${TMP}/jobs/JOB-TEST-progress.tsv"
    # 先跑 prepare 製造 pending_pm
    "${ROOT_DIR}/scripts/progress_dm_prepare.sh" JOB-TEST \
        --jobs-dir "${TMP}/jobs" \
        --unit-id Sci_HanLin_L3 \
        --reason "卡點測試" >/dev/null 2>&1
    echo "${TMP}"
}

echo "=== Test 1: accept → 進度檔 done row + 派工單 Resumed ==="
TMP=$(prepare_case)
"${ROOT_DIR}/scripts/progress_dm_finalize.sh" JOB-TEST \
    --jobs-dir "${TMP}/jobs" \
    --action accept \
    --unit-id Sci_HanLin_L3 \
    --msg-id 12345 \
    --annotation "QL3 即可" >/dev/null 2>&1

# 進度檔最新 Sci_HanLin_L3 row 應為 done
LATEST_ROW=$(grep "Sci_HanLin_L3" "${TMP}/jobs/JOB-TEST-progress.tsv" | tail -1)
echo "${LATEST_ROW}" | grep -q "done" || { echo "FAIL: latest row not done: ${LATEST_ROW}"; exit 1; }
echo "${LATEST_ROW}" | grep -q "QL3 即可" || { echo "FAIL: annotation missing in desc"; exit 1; }
grep -q "Resumed by Agent" "${TMP}/jobs/JOB-TEST-AG-fake.md" || { echo "FAIL: Resumed missing in dm-log"; exit 1; }
grep -q "msg_id: 12345" "${TMP}/jobs/JOB-TEST-AG-fake.md" || { echo "FAIL: msg_id missing"; exit 1; }
rm -rf "${TMP}"
echo "PASS"

echo "=== Test 2: retry → 進度檔 retry row ==="
TMP=$(prepare_case)
"${ROOT_DIR}/scripts/progress_dm_finalize.sh" JOB-TEST \
    --jobs-dir "${TMP}/jobs" \
    --action retry \
    --unit-id Sci_HanLin_L3 \
    --msg-id 23456 >/dev/null 2>&1
LATEST_ROW=$(grep "Sci_HanLin_L3" "${TMP}/jobs/JOB-TEST-progress.tsv" | tail -1)
echo "${LATEST_ROW}" | grep -q "retry" || { echo "FAIL: latest row not retry"; exit 1; }
rm -rf "${TMP}"
echo "PASS"

echo "=== Test 3: skip → manual_review row ==="
TMP=$(prepare_case)
"${ROOT_DIR}/scripts/progress_dm_finalize.sh" JOB-TEST \
    --jobs-dir "${TMP}/jobs" \
    --action skip \
    --unit-id Sci_HanLin_L3 \
    --msg-id 34567 >/dev/null 2>&1
LATEST_ROW=$(grep "Sci_HanLin_L3" "${TMP}/jobs/JOB-TEST-progress.tsv" | tail -1)
echo "${LATEST_ROW}" | grep -q "manual_review" || { echo "FAIL: latest row not manual_review"; exit 1; }
rm -rf "${TMP}"
echo "PASS"

echo "=== Test 4: pause → paused row ==="
TMP=$(prepare_case)
"${ROOT_DIR}/scripts/progress_dm_finalize.sh" JOB-TEST \
    --jobs-dir "${TMP}/jobs" \
    --action pause \
    --unit-id Sci_HanLin_L3 \
    --msg-id 45678 >/dev/null 2>&1
LATEST_ROW=$(grep "Sci_HanLin_L3" "${TMP}/jobs/JOB-TEST-progress.tsv" | tail -1)
echo "${LATEST_ROW}" | grep -q "paused" || { echo "FAIL: latest row not paused"; exit 1; }
rm -rf "${TMP}"
echo "PASS"

echo "=== Test 5: abort → aborted row ==="
TMP=$(prepare_case)
"${ROOT_DIR}/scripts/progress_dm_finalize.sh" JOB-TEST \
    --jobs-dir "${TMP}/jobs" \
    --action abort \
    --unit-id Sci_HanLin_L3 \
    --msg-id 56789 >/dev/null 2>&1
LATEST_ROW=$(grep "Sci_HanLin_L3" "${TMP}/jobs/JOB-TEST-progress.tsv" | tail -1)
echo "${LATEST_ROW}" | grep -q "aborted" || { echo "FAIL: latest row not aborted"; exit 1; }
rm -rf "${TMP}"
echo "PASS"

echo "=== Test 6: custom → 進度檔不新增 row（仍是 pending_pm）但 dm-log 有 Resumed ==="
TMP=$(prepare_case)
ROW_COUNT_BEFORE=$(wc -l < "${TMP}/jobs/JOB-TEST-progress.tsv")
"${ROOT_DIR}/scripts/progress_dm_finalize.sh" JOB-TEST \
    --jobs-dir "${TMP}/jobs" \
    --action custom \
    --unit-id Sci_HanLin_L3 \
    --msg-id 67890 >/dev/null 2>&1
ROW_COUNT_AFTER=$(wc -l < "${TMP}/jobs/JOB-TEST-progress.tsv")
if [[ "${ROW_COUNT_BEFORE}" != "${ROW_COUNT_AFTER}" ]]; then
    echo "FAIL: custom should not append (before=${ROW_COUNT_BEFORE}, after=${ROW_COUNT_AFTER})"
    exit 1
fi
LATEST_ROW=$(grep "Sci_HanLin_L3" "${TMP}/jobs/JOB-TEST-progress.tsv" | tail -1)
echo "${LATEST_ROW}" | grep -q "pending_pm" || { echo "FAIL: latest row should remain pending_pm"; exit 1; }
grep -q "Resumed by Agent" "${TMP}/jobs/JOB-TEST-AG-fake.md" || { echo "FAIL: Resumed missing"; exit 1; }
grep -q "(custom: 由 Agent 開新對話處理)" "${TMP}/jobs/JOB-TEST-AG-fake.md" || { echo "FAIL: custom note missing"; exit 1; }
rm -rf "${TMP}"
echo "PASS"

echo "=== Test 7: 缺 --action → exit 1 ==="
TMP=$(prepare_case)
if "${ROOT_DIR}/scripts/progress_dm_finalize.sh" JOB-TEST \
    --jobs-dir "${TMP}/jobs" \
    --unit-id Sci_HanLin_L3 \
    --msg-id 99999 2>/dev/null; then
    echo "FAIL: expected exit 1"
    rm -rf "${TMP}"
    exit 1
fi
rm -rf "${TMP}"
echo "PASS"

echo "=== Test 8: 缺 --msg-id → exit 1 ==="
TMP=$(prepare_case)
if "${ROOT_DIR}/scripts/progress_dm_finalize.sh" JOB-TEST \
    --jobs-dir "${TMP}/jobs" \
    --action accept \
    --unit-id Sci_HanLin_L3 2>/dev/null; then
    echo "FAIL: expected exit 1"
    rm -rf "${TMP}"
    exit 1
fi
rm -rf "${TMP}"
echo "PASS"

echo "=== Test 9: 未知 action → exit 1 ==="
TMP=$(prepare_case)
if "${ROOT_DIR}/scripts/progress_dm_finalize.sh" JOB-TEST \
    --jobs-dir "${TMP}/jobs" \
    --action unknown_action \
    --unit-id Sci_HanLin_L3 \
    --msg-id 99999 2>/dev/null; then
    echo "FAIL: expected exit 1"
    rm -rf "${TMP}"
    exit 1
fi
rm -rf "${TMP}"
echo "PASS"

echo "=== Test 10: dm-log marker 不成對 → exit 1 ==="
TMP=$(prepare_case)
sed -i.bak '/<!-- progress-dm-log-end -->/d' "${TMP}/jobs/JOB-TEST-AG-fake.md"
rm "${TMP}/jobs/JOB-TEST-AG-fake.md.bak"
if "${ROOT_DIR}/scripts/progress_dm_finalize.sh" JOB-TEST \
    --jobs-dir "${TMP}/jobs" \
    --action accept \
    --unit-id Sci_HanLin_L3 \
    --msg-id 99999 2>/dev/null; then
    echo "FAIL: expected exit 1"
    rm -rf "${TMP}"
    exit 1
fi
rm -rf "${TMP}"
echo "PASS"

echo "=== Test 11: progress-summary 同步顯示 done 計數變化 ==="
TMP=$(prepare_case)
# fixture 提供 L1/L2 done，prepare 加 L3 pending_pm，finalize accept 後 L3 done → 共 3 done
"${ROOT_DIR}/scripts/progress_dm_finalize.sh" JOB-TEST \
    --jobs-dir "${TMP}/jobs" \
    --action accept \
    --unit-id Sci_HanLin_L3 \
    --msg-id 12345 >/dev/null 2>&1
grep -E "done：3|done: 3" "${TMP}/jobs/JOB-TEST-AG-fake.md" || { echo "FAIL: summary done count not synced (expected 3)"; cat "${TMP}/jobs/JOB-TEST-AG-fake.md" | grep -A 5 progress-summary-start; exit 1; }
rm -rf "${TMP}"
echo "PASS"

echo
echo "✅ All progress_dm_finalize tests passed (11 cases)."
