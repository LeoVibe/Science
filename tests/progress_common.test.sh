#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
source "$ROOT_DIR/scripts/lib/progress_common.sh"

JOB_FIXTURE="$ROOT_DIR/tests/fixtures/progress_test_job.md"
TSV_FIXTURE="$ROOT_DIR/tests/fixtures/progress_test_progress.tsv"
TMP=$(mktemp -d)
trap "rm -rf $TMP" EXIT

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

# === reviewer 反饋補測 ===

echo "=== Test 6: parse_config_field 檔案不存在 → return 1 ==="
if parse_config_field "/no/such/file" schema 2>/dev/null; then
    echo "FAIL: expected return 1"; exit 1
fi
echo "PASS"

echo "=== Test 7: parse_config_range 中文 subject (自然) → 映射 Sci ==="
cat > "$TMP/job_zh.md" <<'EOF'
# Test
<!-- progress-config-start -->
schema: question_pipeline_v1
range:
  - subject: 自然
    publisher: HanLin
    lessons: L1..L2
<!-- progress-config-end -->
EOF
RANGE=$(parse_config_range "$TMP/job_zh.md")
EXPECTED=$'Sci_HanLin_L1\nSci_HanLin_L2'
[[ "$RANGE" == "$EXPECTED" ]] || { echo "FAIL: got '$RANGE'"; exit 1; }
echo "PASS"

echo "=== Test 8: parse_config_range 倒序 lessons L5..L3 → 印警告 + 跳過 ==="
cat > "$TMP/job_rev.md" <<'EOF'
# Test
<!-- progress-config-start -->
schema: question_pipeline_v1
range:
  - subject: Science
    publisher: HanLin
    lessons: L5..L3
<!-- progress-config-end -->
EOF
RANGE=$(parse_config_range "$TMP/job_rev.md" 2>/dev/null || true)
[[ -z "$RANGE" ]] || { echo "FAIL: expected empty got '$RANGE'"; exit 1; }
echo "PASS"

echo "=== Test 9: progress_done_units status 帶尾隨空白也要正確 trim 後比對 ==="
cat > "$TMP/tsv_trim.tsv" <<'EOF'
unit_id	commit	agent	subject	publisher	lesson	CQI-P	CQI-V	Match%	QL	status	desc	ts
Foo_Bar_L1	abc	prod	Foo	Bar	L1	-	-	-	-	done 	desc	ts
EOF
# 注意上面 "done " 帶尾隨空白
DONE=$(progress_done_units "$TMP/tsv_trim.tsv")
[[ "$DONE" == "Foo_Bar_L1" ]] || { echo "FAIL: got '$DONE'"; exit 1; }
echo "PASS"

echo "=== Test 10: parse_config_field CRLF 換行 → trim \r ==="
printf '# Test\r\n<!-- progress-config-start -->\r\nschema: hello\r\n<!-- progress-config-end -->\r\n' > "$TMP/job_crlf.md"
SCHEMA=$(parse_config_field "$TMP/job_crlf.md" schema)
[[ "$SCHEMA" == "hello" ]] || { echo "FAIL: got '${SCHEMA}'"; exit 1; }
echo "PASS"

echo
echo "✅ All progress_common tests passed (10 cases)."
