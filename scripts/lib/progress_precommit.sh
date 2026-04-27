#!/usr/bin/env bash
# scripts/lib/progress_precommit.sh
# pre-commit 第 4 節點：偵測 stage 中的進度檔變更 → 自動 sync 派工單摘要 → stage 派工單
# spec: docs/superpowers/specs/2026-04-27-progress-resume-system-design.md (§5.4)
# 設計目的：Agent 可能忘記呼叫 progress_sync；放 pre-commit 自動觸發保證一致性。
# 抽成 lib 是為了單元測試（hook 本身難獨立 invoke）。

# Usage: progress_precommit_run [<repo_root>]
# - 預設用 git rev-parse 取 repo root
# - 回傳 0 全部成功 / 1 任一 sync 失敗
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

    local script_dir="${repo_root}/scripts"
    local rc=0
    local tsv base job job_md
    while IFS= read -r tsv; do
        [[ -n "${tsv}" ]] || continue
        base="${tsv##*/}"
        job="${base%-progress.tsv}"
        echo "   syncing ${job} ..."
        if ! bash "${script_dir}/progress_sync.sh" "${job}" --jobs-dir "${repo_root}/jobs"; then
            echo "   ❌ progress_sync ${job} 失敗" >&2
            rc=1
            continue
        fi
        # stage 派工單變更
        job_md=$(ls "${repo_root}/jobs/${job}"-*.md 2>/dev/null | grep -vE "(progress|Report)" | head -1 || true)
        if [[ -n "${job_md}" ]]; then
            git -C "${repo_root}" add "${job_md}"
        fi
    done <<<"${changed}"

    return ${rc}
}

# 若被當腳本直接執行（非 source），跑 progress_precommit_run
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    progress_precommit_run "$@"
fi
