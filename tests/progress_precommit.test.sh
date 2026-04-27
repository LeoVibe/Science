#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

# 在 mktemp 下建一個 mini git repo，把 progress 工具鏈鏡射過去
prepare_repo() {
    local TMP
    TMP=$(mktemp -d)
    mkdir -p "${TMP}/scripts/lib" "${TMP}/jobs"
    cp "${ROOT_DIR}/scripts/lib/progress_common.sh" "${TMP}/scripts/lib/"
    cp "${ROOT_DIR}/scripts/lib/progress_precommit.sh" "${TMP}/scripts/lib/"
    cp "${ROOT_DIR}/scripts/progress_sync.sh" "${TMP}/scripts/"
    cp "${ROOT_DIR}/scripts/progress_append.sh" "${TMP}/scripts/"
    chmod +x "${TMP}/scripts/"*.sh "${TMP}/scripts/lib/"*.sh
    cp "${ROOT_DIR}/tests/fixtures/progress_test_job.md" "${TMP}/jobs/JOB-TEST-AG-fake.md"
    cp "${ROOT_DIR}/tests/fixtures/progress_test_progress.tsv" "${TMP}/jobs/JOB-TEST-progress.tsv"
    (
        cd "${TMP}"
        git init -q
        git -c user.email=t@t -c user.name=t add jobs scripts
        git -c user.email=t@t -c user.name=t commit -q -m "init"
    )
    echo "${TMP}"
}

echo "=== Test 1: stage 進度檔變更 → 派工單摘要被 sync 並 stage ==="
TMP=$(prepare_repo)
# 修改進度檔（加一筆 done row 模擬 Agent 寫入）
"${TMP}/scripts/progress_append.sh" JOB-TEST \
    --jobs-dir "${TMP}/jobs" \
    --unit-id Sci_HanLin_L3 \
    --agent prod \
    --status done \
    --desc "新加 30 題 CQI 6.0" 2>/dev/null
git -C "${TMP}" add jobs/JOB-TEST-progress.tsv
# 跑 lib（模擬 hook 第 4 節點）
bash -c "source '${TMP}/scripts/lib/progress_precommit.sh' && progress_precommit_run '${TMP}'" >/dev/null 2>&1
# 驗證 1：派工單 progress-summary 已 sync（done=3）
grep -E "done：3|done: 3" "${TMP}/jobs/JOB-TEST-AG-fake.md" >/dev/null || { echo "FAIL: summary 未同步 done=3"; rm -rf "${TMP}"; exit 1; }
# 驗證 2：派工單已 stage（git diff --cached 包含派工單）
git -C "${TMP}" diff --cached --name-only | grep -q "JOB-TEST-AG-fake.md" || { echo "FAIL: 派工單未 stage"; rm -rf "${TMP}"; exit 1; }
rm -rf "${TMP}"
echo "PASS"

echo "=== Test 2: 沒有進度檔變更 → 跳過 sync（lib return 0） ==="
TMP=$(prepare_repo)
# 改個無關檔
echo "test" > "${TMP}/scripts/unrelated.txt"
git -C "${TMP}" add scripts/unrelated.txt
OUTPUT=$(bash -c "source '${TMP}/scripts/lib/progress_precommit.sh' && progress_precommit_run '${TMP}'" 2>&1)
echo "${OUTPUT}" | grep -q "跳過 progress_sync" || { echo "FAIL: 應該印跳過訊息: ${OUTPUT}"; rm -rf "${TMP}"; exit 1; }
rm -rf "${TMP}"
echo "PASS"

echo "=== Test 3: 多個 JOB 同時變更 → 都被 sync ==="
TMP=$(prepare_repo)
# 加一個 JOB-FOO
cp "${ROOT_DIR}/tests/fixtures/progress_test_job.md" "${TMP}/jobs/JOB-FOO-AG-bar.md"
cp "${ROOT_DIR}/tests/fixtures/progress_test_progress.tsv" "${TMP}/jobs/JOB-FOO-progress.tsv"
git -C "${TMP}" -c user.email=t@t -c user.name=t add jobs
git -C "${TMP}" -c user.email=t@t -c user.name=t commit -q -m "add JOB-FOO"
"${TMP}/scripts/progress_append.sh" JOB-TEST --jobs-dir "${TMP}/jobs" --unit-id Sci_HanLin_L3 --agent prod --status done --desc "x" 2>/dev/null
"${TMP}/scripts/progress_append.sh" JOB-FOO --jobs-dir "${TMP}/jobs" --unit-id Sci_HanLin_L3 --agent prod --status done --desc "y" 2>/dev/null
git -C "${TMP}" add jobs/JOB-TEST-progress.tsv jobs/JOB-FOO-progress.tsv
bash -c "source '${TMP}/scripts/lib/progress_precommit.sh' && progress_precommit_run '${TMP}'" >/dev/null 2>&1
git -C "${TMP}" diff --cached --name-only | grep -q "JOB-TEST-AG-fake.md" || { echo "FAIL: JOB-TEST 派工單未 stage"; rm -rf "${TMP}"; exit 1; }
git -C "${TMP}" diff --cached --name-only | grep -q "JOB-FOO-AG-bar.md" || { echo "FAIL: JOB-FOO 派工單未 stage"; rm -rf "${TMP}"; exit 1; }
rm -rf "${TMP}"
echo "PASS"

echo "=== Test 4: progress_sync 失敗（派工單 marker 壞掉）→ lib return 1 ==="
TMP=$(prepare_repo)
# 把派工單的 progress-summary-end marker 移掉，模擬壞掉的派工單
sed -i.bak '/<!-- progress-summary-end -->/d' "${TMP}/jobs/JOB-TEST-AG-fake.md"
rm "${TMP}/jobs/JOB-TEST-AG-fake.md.bak"
git -C "${TMP}" -c user.email=t@t -c user.name=t commit -q -am "break marker"
"${TMP}/scripts/progress_append.sh" JOB-TEST --jobs-dir "${TMP}/jobs" --unit-id Sci_HanLin_L3 --agent prod --status done --desc "x" 2>/dev/null
git -C "${TMP}" add jobs/JOB-TEST-progress.tsv
if bash -c "source '${TMP}/scripts/lib/progress_precommit.sh' && progress_precommit_run '${TMP}'" >/dev/null 2>&1; then
    echo "FAIL: 期望 return 1（progress_sync 失敗）"
    rm -rf "${TMP}"
    exit 1
fi
rm -rf "${TMP}"
echo "PASS"

echo "=== Test 5: 進度檔在不同子目錄（理論上不該有，但測 grep 嚴格性） ==="
TMP=$(prepare_repo)
mkdir -p "${TMP}/jobs/sub"
echo -e "unit_id\tcommit\n" > "${TMP}/jobs/sub/JOB-FAKE-progress.tsv"
git -C "${TMP}" add jobs/sub/JOB-FAKE-progress.tsv
OUTPUT=$(bash -c "source '${TMP}/scripts/lib/progress_precommit.sh' && progress_precommit_run '${TMP}'" 2>&1)
# regex 是 ^jobs/JOB-.+-progress\.tsv$ 不應該 match jobs/sub/...
echo "${OUTPUT}" | grep -q "跳過 progress_sync" || { echo "FAIL: 子目錄 tsv 不該觸發: ${OUTPUT}"; rm -rf "${TMP}"; exit 1; }
rm -rf "${TMP}"
echo "PASS"

echo
echo "✅ All progress_precommit tests passed (5 cases)."
