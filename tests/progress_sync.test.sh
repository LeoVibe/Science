#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
TMP=$(mktemp -d)
trap "rm -rf $TMP" EXIT

mkdir -p "$TMP/jobs"
cp "$ROOT_DIR/tests/fixtures/progress_test_job.md" "$TMP/jobs/JOB-TEST-AG-fake.md"
cp "$ROOT_DIR/tests/fixtures/progress_test_progress.tsv" "$TMP/jobs/JOB-TEST-progress.tsv"

echo "=== Test 1: sync 後 progress-summary 區塊有資料 ==="
"$ROOT_DIR/scripts/progress_sync.sh" JOB-TEST --jobs-dir "$TMP/jobs" 2>/dev/null
if grep -q "已 done：2" "$TMP/jobs/JOB-TEST-AG-fake.md"; then
    echo "PASS"
else
    echo "FAIL: 沒有「已 done：2」"
    exit 1
fi

echo "=== Test 2: 範圍總計正確（L1..L3 = 3 個單位） ==="
if grep -q "範圍總計：3" "$TMP/jobs/JOB-TEST-AG-fake.md"; then
    echo "PASS"
else
    echo "FAIL: 範圍總計"
    grep "範圍總計" "$TMP/jobs/JOB-TEST-AG-fake.md" || true
    exit 1
fi

echo "=== Test 3: 多次 sync idempotent（marker 各保持 1 對） ==="
"$ROOT_DIR/scripts/progress_sync.sh" JOB-TEST --jobs-dir "$TMP/jobs" 2>/dev/null
"$ROOT_DIR/scripts/progress_sync.sh" JOB-TEST --jobs-dir "$TMP/jobs" 2>/dev/null
COUNT_START=$(grep -c "<!-- progress-summary-start -->" "$TMP/jobs/JOB-TEST-AG-fake.md")
COUNT_END=$(grep -c "<!-- progress-summary-end -->" "$TMP/jobs/JOB-TEST-AG-fake.md")
[[ "$COUNT_START" == "1" && "$COUNT_END" == "1" ]] || { echo "FAIL marker count: $COUNT_START/$COUNT_END"; exit 1; }
echo "PASS"

echo "=== Test 4: pending_pm 詳細列出 ==="
# 加一筆 pending_pm
echo -e "Sci_HanLin_L3\tabc\tverify\tScience\tHanLin\tL3\t-\t-\t-\t-\tpending_pm\t雙盲不一致\t2026-04-27T11:00" >> "$TMP/jobs/JOB-TEST-progress.tsv"
"$ROOT_DIR/scripts/progress_sync.sh" JOB-TEST --jobs-dir "$TMP/jobs" 2>/dev/null
grep -q "pending_pm：1" "$TMP/jobs/JOB-TEST-AG-fake.md" || { echo "FAIL pending_pm count"; exit 1; }
grep -q "Sci_HanLin_L3" "$TMP/jobs/JOB-TEST-AG-fake.md" || { echo "FAIL pending_pm detail"; exit 1; }
echo "PASS"

echo "=== Test 5: 派工單不存在 → exit 1 ==="
if "$ROOT_DIR/scripts/progress_sync.sh" JOB-MISSING --jobs-dir "$TMP/jobs" 2>/dev/null; then
    echo "FAIL: expected exit 1"
    exit 1
fi
echo "PASS"

echo "=== Test 6: marker 不成對（缺 end）→ exit 1（不吞尾端內容） ==="
cp "$ROOT_DIR/tests/fixtures/progress_test_job.md" "$TMP/jobs/JOB-BROKEN-AG-fake.md"
sed -i.bak '/<!-- progress-summary-end -->/d' "$TMP/jobs/JOB-BROKEN-AG-fake.md"
rm "$TMP/jobs/JOB-BROKEN-AG-fake.md.bak"
ORIG_LINES=$(wc -l < "$TMP/jobs/JOB-BROKEN-AG-fake.md")
if "$ROOT_DIR/scripts/progress_sync.sh" JOB-BROKEN --jobs-dir "$TMP/jobs" 2>/dev/null; then
    echo "FAIL: expected exit 1"
    exit 1
fi
NEW_LINES=$(wc -l < "$TMP/jobs/JOB-BROKEN-AG-fake.md")
[[ "$ORIG_LINES" == "$NEW_LINES" ]] || { echo "FAIL: 派工單被改動（原 $ORIG_LINES 行 → $NEW_LINES 行）"; exit 1; }
echo "PASS"

echo "=== Test 7: 重複 marker → exit 1 ==="
cp "$ROOT_DIR/tests/fixtures/progress_test_job.md" "$TMP/jobs/JOB-DUP-AG-fake.md"
# 在尾端加另一對 marker（模擬 merge 衝突殘骸）
cat >> "$TMP/jobs/JOB-DUP-AG-fake.md" <<'EOF'

## 第二對（不該存在）
<!-- progress-summary-start -->
<!-- progress-summary-end -->
EOF
if "$ROOT_DIR/scripts/progress_sync.sh" JOB-DUP --jobs-dir "$TMP/jobs" 2>/dev/null; then
    echo "FAIL: expected exit 1"
    exit 1
fi
echo "PASS"

echo
echo "✅ All progress_sync tests passed (7 cases)."
