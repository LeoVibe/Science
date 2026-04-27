#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
source "$ROOT_DIR/scripts/lib/progress_common.sh"

JOB_FIXTURE="$ROOT_DIR/tests/fixtures/progress_test_job.md"
TSV_FIXTURE="$ROOT_DIR/tests/fixtures/progress_test_progress.tsv"

echo "=== Test 1: parse_config_field schema ==="
SCHEMA=$(parse_config_field "$JOB_FIXTURE" schema)
[[ "$SCHEMA" == "question_pipeline_v1" ]] || { echo "FAIL: got '$SCHEMA'"; exit 1; }
echo "PASS"

echo "=== Test 2: parse_config_field pm_response_timeout ==="
TIMEOUT=$(parse_config_field "$JOB_FIXTURE" pm_response_timeout)
[[ "$TIMEOUT" == "30" ]] || { echo "FAIL: got '$TIMEOUT'"; exit 1; }
echo "PASS"

echo "=== Test 3: parse_config_range Sci_HanLin_L1..L3 ==="
RANGE=$(parse_config_range "$JOB_FIXTURE")
EXPECTED=$'Sci_HanLin_L1\nSci_HanLin_L2\nSci_HanLin_L3'
[[ "$RANGE" == "$EXPECTED" ]] || { echo "FAIL: got '$RANGE'"; exit 1; }
echo "PASS"

echo "=== Test 4: progress_done_units ==="
DONE=$(progress_done_units "$TSV_FIXTURE")
EXPECTED=$'Sci_HanLin_L1\nSci_HanLin_L2'
[[ "$DONE" == "$EXPECTED" ]] || { echo "FAIL: got '$DONE'"; exit 1; }
echo "PASS"

echo "=== Test 5: progress_pending_pm_units (none) ==="
PENDING=$(progress_pending_pm_units "$TSV_FIXTURE" || true)
[[ -z "$PENDING" ]] || { echo "FAIL: expected empty, got '$PENDING'"; exit 1; }
echo "PASS"

echo
echo "✅ All progress_common tests passed."
