#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
TMP=$(mktemp -d)
trap "rm -rf ${TMP}" EXIT

mkdir -p "${TMP}/jobs"

# 建一個 13 欄 tsv 涵蓋多種 status
cat > "${TMP}/jobs/JOB-TEST-progress.tsv" <<'EOF'
unit_id	commit	agent	subject	publisher	lesson	CQI-P	CQI-V	Match%	QL	status	desc	ts
Sci_HanLin_L1	abc	prod	Science	HanLin	L1	6.2	-	-	-	done	30題	2026-04-27T10:00
Sci_HanLin_L2	def	prod	Science	HanLin	L2	5.9	-	-	-	done	30題	2026-04-27T10:30
Sci_HanLin_L3	ghi	verify	Science	HanLin	L3	-	3.0	78%	-	pending_pm	雙盲不一致	2026-04-27T11:00
Sci_HanLin_L4	jkl	verify	Science	HanLin	L4	-	2.5	60%	-	manual_review	題義不清	2026-04-27T11:30
Sci_HanLin_L5	mno	prod	Science	HanLin	L5	5.5	-	-	-	failed	格式錯	2026-04-27T12:00
EOF

echo "=== Test 1: 13 欄 schema 偵測正確 ==="
OUT=$("${ROOT_DIR}/scripts/progress_monitor.sh" JOB-TEST --jobs-dir "${TMP}/jobs")
echo "${OUT}" | grep -q "schema: 13 欄（status_col=11）" || { echo "FAIL: schema 偵測錯誤"; echo "${OUT}"; exit 1; }
echo "${OUT}" | grep -q "資料行數：5" || { echo "FAIL: 行數錯"; exit 1; }
echo "PASS"

echo "=== Test 2: status 分布正確 ==="
echo "${OUT}" | grep -q "2 done" || { echo "FAIL: done 應為 2"; echo "${OUT}"; exit 1; }
echo "${OUT}" | grep -q "1 pending_pm" || { echo "FAIL: pending_pm 應為 1"; exit 1; }
echo "${OUT}" | grep -q "1 manual_review" || { echo "FAIL: manual_review 應為 1"; exit 1; }
echo "${OUT}" | grep -q "1 failed" || { echo "FAIL: failed 應為 1"; exit 1; }
echo "PASS"

echo "=== Test 3: pending_pm 詳細列出 unit_id + desc ==="
echo "${OUT}" | grep -q "Sci_HanLin_L3: 雙盲不一致" || { echo "FAIL: pending_pm 詳細缺失"; echo "${OUT}"; exit 1; }
echo "PASS"

echo "=== Test 4: manual_review 詳細列出 ==="
echo "${OUT}" | grep -q "Sci_HanLin_L4: 題義不清" || { echo "FAIL: manual_review 詳細缺失"; exit 1; }
echo "PASS"

echo "=== Test 5: agent 進度（done 計入 prod）==="
echo "${OUT}" | grep -q "prod: 2 單過閘" || { echo "FAIL: prod done count 錯"; echo "${OUT}"; exit 1; }
echo "PASS"

echo "=== Test 6: 12 欄 g5s2 schema 也能讀（向下相容）==="
# 模擬 g5s2_results.tsv，無 unit_id，subject 在 col 2、status 在 col 10、desc 在 col 11
cat > "${TMP}/jobs/g5s2_results.tsv" <<'EOF'
ts	agent	subject	publisher	lesson	cqi_p	cqi_v	match	ql	status	desc	commit
2026-04-19T10:00	prod	Science	HanLin	L3	6.0	-	-	-	keep	30題	abc
2026-04-19T11:00	verify	Science	HanLin	L4	-	2.5	60%	-	manual_review	題義不清	def
EOF
OUT2=$("${ROOT_DIR}/scripts/progress_monitor.sh" JOB-210 --jobs-dir "${TMP}/jobs" 2>&1)
echo "${OUT2}" | grep -q "schema: 12 欄（status_col=10）" || { echo "FAIL: 12 欄 schema 偵測失敗"; echo "${OUT2}"; exit 1; }
echo "${OUT2}" | grep -q "1 keep" || { echo "FAIL: keep 應為 1"; exit 1; }
echo "${OUT2}" | grep -q "1 manual_review" || { echo "FAIL: manual_review 應為 1"; exit 1; }
echo "PASS"

echo "=== Test 7: 缺進度檔 → exit 1 ==="
if "${ROOT_DIR}/scripts/progress_monitor.sh" JOB-NONE --jobs-dir "${TMP}/jobs" 2>/dev/null; then
    echo "FAIL: 期望 exit 1"
    exit 1
fi
echo "PASS"

echo "=== Test 8: 不認識的 schema → exit 2 ==="
echo -e "a\tb\tc" > "${TMP}/jobs/JOB-WEIRD-progress.tsv"
set +e
"${ROOT_DIR}/scripts/progress_monitor.sh" JOB-WEIRD --jobs-dir "${TMP}/jobs" >/dev/null 2>&1
RC=$?
set -e
if [[ "${RC}" != "2" ]]; then
    echo "FAIL: 期望 exit 2，實得 ${RC}"
    exit 1
fi
echo "PASS"

echo "=== Test 9: 空 tsv（僅 header）→ 印「尚無資料」exit 0 ==="
HEADER='unit_id\tcommit\tagent\tsubject\tpublisher\tlesson\tCQI-P\tCQI-V\tMatch%\tQL\tstatus\tdesc\tts'
echo -e "${HEADER}" > "${TMP}/jobs/JOB-EMPTY-progress.tsv"
OUT3=$("${ROOT_DIR}/scripts/progress_monitor.sh" JOB-EMPTY --jobs-dir "${TMP}/jobs")
echo "${OUT3}" | grep -q "尚無資料" || { echo "FAIL: 空 tsv 應印「尚無資料」"; echo "${OUT3}"; exit 1; }
echo "PASS"

echo "=== Test 10: status 帶尾隨空白也要正確統計 ==="
cat > "${TMP}/jobs/JOB-TRIM-progress.tsv" <<'EOF'
unit_id	commit	agent	subject	publisher	lesson	CQI-P	CQI-V	Match%	QL	status	desc	ts
Sci_HanLin_L1	abc	prod	Science	HanLin	L1	6.2	-	-	-	done 	30題	2026-04-27T10:00
Sci_HanLin_L2	def	prod	Science	HanLin	L2	5.9	-	-	-	 done	30題	2026-04-27T10:30
EOF
OUT4=$("${ROOT_DIR}/scripts/progress_monitor.sh" JOB-TRIM --jobs-dir "${TMP}/jobs")
echo "${OUT4}" | grep -q "2 done" || { echo "FAIL: trim 後應該合併計為 2"; echo "${OUT4}"; exit 1; }
echo "PASS"

echo
echo "✅ All progress_monitor tests passed (10 cases)."
