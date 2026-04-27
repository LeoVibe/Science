#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
TMP=$(mktemp -d)
trap "rm -rf $TMP" EXIT

mkdir -p "$TMP/jobs"
cp "$ROOT_DIR/tests/fixtures/progress_test_job.md" "$TMP/jobs/JOB-TEST-AG-fake.md"

echo "=== Test 1: 進度檔不存在 → 返回 L1 ==="
OUT=$("$ROOT_DIR/scripts/progress_next.sh" JOB-TEST --jobs-dir "$TMP/jobs")
echo "$OUT" | grep -q "unit_id=Sci_HanLin_L1" || { echo "FAIL: $OUT"; exit 1; }
echo "$OUT" | grep -q "subject=Science" || { echo "FAIL subject"; exit 1; }
echo "$OUT" | grep -q "publisher=HanLin" || { echo "FAIL publisher"; exit 1; }
echo "$OUT" | grep -q "lesson=L1" || { echo "FAIL lesson"; exit 1; }
echo "PASS"

echo "=== Test 2: 進度檔有 L1 L2 done → 返回 L3 ==="
cp "$ROOT_DIR/tests/fixtures/progress_test_progress.tsv" "$TMP/jobs/JOB-TEST-progress.tsv"
OUT=$("$ROOT_DIR/scripts/progress_next.sh" JOB-TEST --jobs-dir "$TMP/jobs")
echo "$OUT" | grep -q "unit_id=Sci_HanLin_L3" || { echo "FAIL: $OUT"; exit 1; }
echo "PASS"

echo "=== Test 3: 全綠 → 印 NONE ==="
echo -e "Sci_HanLin_L3\tghi\tprod\tScience\tHanLin\tL3\t6.0\t-\t-\t-\tdone\t30題\t2026-04-27T11:00" >> "$TMP/jobs/JOB-TEST-progress.tsv"
OUT=$("$ROOT_DIR/scripts/progress_next.sh" JOB-TEST --jobs-dir "$TMP/jobs")
[[ "$OUT" == "NONE" ]] || { echo "FAIL: expected NONE got '$OUT'"; exit 1; }
echo "PASS"

echo "=== Test 4: 派工單 progress-config 缺失 → exit 1 ==="
echo "# empty" > "$TMP/jobs/JOB-EMPTY-AG-fake.md"
if "$ROOT_DIR/scripts/progress_next.sh" JOB-EMPTY --jobs-dir "$TMP/jobs" 2>/dev/null; then
    echo "FAIL: expected exit 1"
    exit 1
fi
echo "PASS"

echo "=== Test 5: 中文 subject 自然 → 還原為 Science ==="
mkdir -p "$TMP/zh-jobs"
cat > "$TMP/zh-jobs/JOB-ZH-AG-fake.md" <<'EOF'
# JOB-ZH
<!-- progress-config-start -->
schema: question_pipeline_v1
range:
  - subject: 自然
    publisher: HanLin
    lessons: L1..L1
<!-- progress-config-end -->
EOF
OUT=$("$ROOT_DIR/scripts/progress_next.sh" JOB-ZH --jobs-dir "$TMP/zh-jobs")
echo "$OUT" | grep -q "unit_id=Sci_HanLin_L1" || { echo "FAIL: $OUT"; exit 1; }
echo "$OUT" | grep -q "subject=Science" || { echo "FAIL subject mapping"; exit 1; }
echo "PASS"

echo
echo "✅ All progress_next tests passed (5 cases)."
