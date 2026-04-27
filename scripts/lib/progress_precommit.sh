#!/usr/bin/env bash
# scripts/lib/progress_precommit.sh
# pre-commit 第 4 節點：偵測 stage 中的進度檔變更 → 自動 sync 派工單摘要 → stage 派工單
# spec: docs/superpowers/specs/2026-04-27-progress-resume-system-design.md (§2 D1, §3)
# 設計目的：Agent 可能忘記呼叫 progress_sync；放 pre-commit 自動觸發保證一致性。
# 抽成 lib 是為了單元測試（hook 本身難獨立 invoke）。

# 從 jobs/${job}-*.md 找對應派工單（嚴格 grep 避免 JOB-1 誤抓 JOB-100）
# Usage: _progress_find_job_md <repo_root> <job_id>
_progress_find_job_md() {
    local repo_root="$1"
    local job="$2"
    ls "${repo_root}/jobs/${job}"-*.md 2>/dev/null \
        | grep -E "/${job}-[A-Z]+-.+\.md$" \
        | grep -vE "(progress|Report)" \
        | head -1 || true
}

# Usage: progress_precommit_run [<repo_root>]
# - 預設用 git rev-parse 取 repo root
# - 回傳 0 全部成功 / 1 任一 sync 失敗
# 流程：兩階段。先全部驗證 marker 成對，全通過才開始 sync，避免 partial-applied state。
progress_precommit_run() {
    local repo_root="${1:-}"
    if [[ -z "${repo_root}" ]]; then
        repo_root=$(git rev-parse --show-toplevel 2>/dev/null) || {
            echo "progress_precommit: 不在 git repo 內" >&2
            return 1
        }
    fi

    local changed
    changed=$(git -C "${repo_root}" diff --cached --name-only | grep -E '^jobs/JOB-.+-progress\.tsv$' || true)

    if [[ -z "${changed}" ]]; then
        echo "   (本次沒有 jobs/JOB-*-progress.tsv 變更，跳過 progress_sync)"
        return 0
    fi

    # Phase 1: 收集 (job, job_md) 並驗證 progress-summary marker 成對
    local -a jobs_list=()
    local -a job_mds=()
    local tsv base job job_md
    local validation_failed=0
    while IFS= read -r tsv; do
        [[ -n "${tsv}" ]] || continue
        base="${tsv##*/}"
        job="${base%-progress.tsv}"
        job_md=$(_progress_find_job_md "${repo_root}" "${job}")
        if [[ -z "${job_md}" ]]; then
            echo "   ❌ ${job}: 找不到對應派工單 (jobs/${job}-*.md)" >&2
            validation_failed=1
            continue
        fi
        local start_count end_count
        start_count=$(grep -c "<!-- progress-summary-start -->" "${job_md}" || true)
        end_count=$(grep -c "<!-- progress-summary-end -->" "${job_md}" || true)
        if [[ "${start_count}" != "1" || "${end_count}" != "1" ]]; then
            echo "   ❌ ${job}: 派工單 progress-summary marker 不成對 (start=${start_count}, end=${end_count})" >&2
            validation_failed=1
            continue
        fi
        jobs_list+=("${job}")
        job_mds+=("${job_md}")
    done <<<"${changed}"

    if [[ ${validation_failed} -ne 0 ]]; then
        echo "   ❌ 預檢失敗，未開始任何 sync（避免 partial-applied state）" >&2
        return 1
    fi

    # Phase 2: 驗證全過後逐一 sync + stage
    local i rc=0
    for i in "${!jobs_list[@]}"; do
        job="${jobs_list[i]}"
        job_md="${job_mds[i]}"
        echo "   syncing ${job} ..."
        if ! bash "${repo_root}/scripts/progress_sync.sh" "${job}" --jobs-dir "${repo_root}/jobs"; then
            echo "   ❌ progress_sync ${job} 失敗" >&2
            rc=1
            continue
        fi
        echo "   📌 stage 派工單: ${job_md#${repo_root}/}"
        git -C "${repo_root}" add "${job_md}"
    done

    return ${rc}
}

# 若被當腳本直接執行（非 source），跑 progress_precommit_run
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    progress_precommit_run "$@"
fi
