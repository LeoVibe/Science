#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
TMP=$(mktemp -d)
trap "rm -rf $TMP" EXIT

mkdir -p "$TMP/jobs"
cp "$ROOT_DIR/tests/fixtures/progress_test_job.md" "$TMP/jobs/JOB-TEST-AG-fake.md"

echo "=== Test 1: 跑後進度檔有 pending_pm row ==="
DM_OUT=$("$ROOT_DIR/scripts/progress_dm_prepare.sh" JOB-TEST \
    --jobs-dir "$TMP/jobs" \
    --unit-id Sci_HanLin_L3 \
    --reason "雙盲不一致率 22% 超 20% 門檻" \
    --agent verify 2>/dev/null)

grep -q "pending_pm" "$TMP/jobs/JOB-TEST-progress.tsv" || { echo "FAIL: pending_pm not in tsv"; exit 1; }
echo "PASS"

echo "=== Test 2: 派工單 dm-log 有 DM sent 段 ==="
grep -q "DM sent" "$TMP/jobs/JOB-TEST-AG-fake.md" || { echo "FAIL: DM sent missing"; exit 1; }
grep -q "雙盲不一致率 22% 超 20% 門檻" "$TMP/jobs/JOB-TEST-AG-fake.md" || { echo "FAIL: reason missing"; exit 1; }
grep -q "Sci_HanLin_L3" "$TMP/jobs/JOB-TEST-AG-fake.md" || { echo "FAIL: unit missing"; exit 1; }
echo "PASS"

echo "=== Test 3: 派工單 progress-summary 已 sync（pending_pm:1）==="
grep -q "pending_pm：1" "$TMP/jobs/JOB-TEST-AG-fake.md" || { echo "FAIL: summary not synced"; exit 1; }
echo "PASS"

echo "=== Test 4: stdout 含 DM 文字模板（六指示） ==="
echo "$DM_OUT" | grep -q "1  accept" || { echo "FAIL: accept missing"; exit 1; }
echo "$DM_OUT" | grep -q "6  custom" || { echo "FAIL: custom missing"; exit 1; }
echo "$DM_OUT" | grep -q "Sci_HanLin_L3" || { echo "FAIL: unit_id missing in DM"; exit 1; }
echo "PASS"

echo "=== Test 5: 缺必填欄 → exit 1 ==="
if "$ROOT_DIR/scripts/progress_dm_prepare.sh" JOB-TEST --jobs-dir "$TMP/jobs" --unit-id Sci_HanLin_L4 2>/dev/null; then
    echo "FAIL: expected exit 1"
    exit 1
fi
echo "PASS"

echo "=== Test 6: dm-log marker 不成對 → exit 1 ==="
cp "$ROOT_DIR/tests/fixtures/progress_test_job.md" "$TMP/jobs/JOB-BROKEN-AG-fake.md"
sed -i.bak '/<!-- progress-dm-log-end -->/d' "$TMP/jobs/JOB-BROKEN-AG-fake.md"
rm "$TMP/jobs/JOB-BROKEN-AG-fake.md.bak"
if "$ROOT_DIR/scripts/progress_dm_prepare.sh" JOB-BROKEN \
    --jobs-dir "$TMP/jobs" \
    --unit-id Sci_HanLin_L1 \
    --reason "test" 2>/dev/null; then
    echo "FAIL: expected exit 1"
    exit 1
fi
echo "PASS"

echo
echo "✅ All progress_dm_prepare tests passed (6 cases)."
