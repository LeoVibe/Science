#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
TMP=$(mktemp -d)
trap "rm -rf $TMP" EXIT

# 準備測試環境
mkdir -p "$TMP/jobs"
cp "$ROOT_DIR/tests/fixtures/progress_test_job.md" "$TMP/jobs/JOB-TEST-AG-fake.md"
cd "$TMP"
git init -q
git -c user.email=t@t -c user.name=t commit --allow-empty -q -m init
cd - > /dev/null

echo "=== Test 1: append 第一筆會自動建 header ==="
"$ROOT_DIR/scripts/progress_append.sh" JOB-TEST \
    --jobs-dir "$TMP/jobs" \
    --unit-id Sci_HanLin_L1 \
    --agent prod \
    --status done \
    --desc "30題 CQI 6.2" \
    --subject Science --publisher HanLin --lesson L1 --cqi-p 6.2 2>/dev/null

[[ -f "$TMP/jobs/JOB-TEST-progress.tsv" ]] || { echo "FAIL: tsv not created"; exit 1; }
HEADER=$(head -1 "$TMP/jobs/JOB-TEST-progress.tsv")
EXPECTED_HEADER=$'unit_id\tcommit\tagent\tsubject\tpublisher\tlesson\tCQI-P\tCQI-V\tMatch%\tQL\tstatus\tdesc\tts'
[[ "$HEADER" == "$EXPECTED_HEADER" ]] || { echo "FAIL header"; exit 1; }
ROW_COUNT=$(awk 'NR>1' "$TMP/jobs/JOB-TEST-progress.tsv" | wc -l | tr -d ' ')
[[ "$ROW_COUNT" == "1" ]] || { echo "FAIL row count: got $ROW_COUNT"; exit 1; }
echo "PASS"

echo "=== Test 2: 第二筆 append 不重建 header ==="
"$ROOT_DIR/scripts/progress_append.sh" JOB-TEST \
    --jobs-dir "$TMP/jobs" \
    --unit-id Sci_HanLin_L2 \
    --agent prod \
    --status done \
    --desc "30題 CQI 5.8" \
    --subject Science --publisher HanLin --lesson L2 --cqi-p 5.8 2>/dev/null

ROW_COUNT=$(awk 'NR>1' "$TMP/jobs/JOB-TEST-progress.tsv" | wc -l | tr -d ' ')
[[ "$ROW_COUNT" == "2" ]] || { echo "FAIL row count: got $ROW_COUNT"; exit 1; }
echo "PASS"

echo "=== Test 3: 欄位數正確（每行 13） ==="
awk -F'\t' '{ if (NF != 13) { print "FAIL line "NR": NF="NF; exit 1 }}' "$TMP/jobs/JOB-TEST-progress.tsv"
echo "PASS"

echo "=== Test 4: ts 是 ISO 8601 短格式 (YYYY-MM-DDTHH:MM) ==="
TS=$(awk -F'\t' 'NR==2 {print $13}' "$TMP/jobs/JOB-TEST-progress.tsv")
[[ "$TS" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}$ ]] || { echo "FAIL ts: got '$TS'"; exit 1; }
echo "PASS"

echo "=== Test 5: desc 內含 tab/換行被替換為空格（避免欄位污染） ==="
"$ROOT_DIR/scripts/progress_append.sh" JOB-TEST \
    --jobs-dir "$TMP/jobs" \
    --unit-id Sci_HanLin_L3 \
    --agent prod \
    --status done \
    --desc $'tab\there\nnewline' 2>/dev/null

# 仍保持 13 欄
awk -F'\t' 'NR==4 { if (NF != 13) { print "FAIL: NF="NF; exit 1 }}' "$TMP/jobs/JOB-TEST-progress.tsv"
DESC=$(awk -F'\t' 'NR==4 {print $12}' "$TMP/jobs/JOB-TEST-progress.tsv")
[[ "$DESC" == "tab here newline" ]] || { echo "FAIL desc: got '$DESC'"; exit 1; }
echo "PASS"

echo "=== Test 6: status 帶尾隨空白被 trim ==="
"$ROOT_DIR/scripts/progress_append.sh" JOB-TEST \
    --jobs-dir "$TMP/jobs" \
    --unit-id Sci_HanLin_L4 \
    --agent prod \
    --status "done   " \
    --desc "test trim" 2>/dev/null

STATUS=$(awk -F'\t' 'NR==5 {print $11}' "$TMP/jobs/JOB-TEST-progress.tsv")
[[ "$STATUS" == "done" ]] || { echo "FAIL status: got '$STATUS' (應 trim)"; exit 1; }
echo "PASS"

echo "=== Test 7a: desc 含 % 不會被 printf format 解譯 ==="
"$ROOT_DIR/scripts/progress_append.sh" JOB-TEST \
    --jobs-dir "$TMP/jobs" \
    --unit-id Sci_HanLin_L6 \
    --agent prod \
    --status done \
    --desc "100% pass %s test %d" 2>/dev/null

DESC_PCT=$(awk -F'\t' '$1=="Sci_HanLin_L6" {print $12}' "$TMP/jobs/JOB-TEST-progress.tsv")
[[ "$DESC_PCT" == "100% pass %s test %d" ]] || { echo "FAIL desc with %: got '$DESC_PCT'"; exit 1; }
echo "PASS"

echo "=== Test 7: 缺必填欄 → exit 1 ==="
if "$ROOT_DIR/scripts/progress_append.sh" JOB-TEST \
    --jobs-dir "$TMP/jobs" \
    --unit-id Sci_HanLin_L5 2>/dev/null; then
    echo "FAIL: expected exit 1"
    exit 1
fi
echo "PASS"

echo
echo "✅ All progress_append tests passed (8 cases)."
