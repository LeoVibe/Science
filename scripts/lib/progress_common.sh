#!/usr/bin/env bash
# Eidos 進度／斷點恢復子系統共用 lib
# spec: docs/superpowers/specs/2026-04-27-progress-resume-system-design.md
# 標準 awk（BSD/POSIX 相容）— 不依賴 gawk

# 從派工單 progress-config 區塊取出某欄位值
# Usage: parse_config_field <派工單路徑> <欄位>
parse_config_field() {
    local job_md="$1"
    local field="$2"
    awk -v field="$field" '
        /<!-- progress-config-start -->/ { in_block=1; next }
        /<!-- progress-config-end -->/   { in_block=0 }
        in_block {
            line = $0
            gsub(/^[ \t]+|[ \t]+$/, "", line)
            if (line == "") next
            # match "field:" 開頭
            target = field":"
            tlen = length(target)
            if (substr(line, 1, tlen) == target) {
                value = substr(line, tlen + 1)
                gsub(/^[ \t]+|[ \t]+$/, "", value)
                # 去掉 inline 註解
                sub(/[ \t]*#.*$/, "", value)
                gsub(/[ \t]+$/, "", value)
                print value
                exit
            }
        }
    ' "$job_md"
}

# 從派工單 progress-config 取 range，輸出 unit_id 清單（一行一個）
# 目前只支援 question_pipeline_v1 schema：subject_short_publisher_lesson 合成
# Usage: parse_config_range <派工單路徑>
parse_config_range() {
    local job_md="$1"
    awk '
        /<!-- progress-config-start -->/ { in_block=1; next }
        /<!-- progress-config-end -->/   { in_block=0 }
        in_block { print }
    ' "$job_md" | awk '
        /^range:/ { in_range=1; next }
        !in_range { next }
        # 範圍區塊外的下個頂層欄位（左邊無空白且 :結尾）→ 結束
        /^[a-zA-Z_]+:/ && !/^[ \t]/ { in_range=0; next }
        {
            line = $0
            gsub(/^[ \t]+|[ \t]+$/, "", line)
            if (line == "") next

            # 「- subject: X」開新一組（先 flush 前一組）
            if (substr(line, 1, 11) == "- subject: ") {
                if (subj != "" && pub != "" && lstart != "" && lend != "") {
                    short = substr(subj, 1, 3)
                    for (i = lstart + 0; i <= lend + 0; i++) print short"_"pub"_L"i
                }
                subj = substr(line, 12); pub = ""; lstart = ""; lend = ""
            } else if (substr(line, 1, 9) == "subject: ") {
                subj = substr(line, 10)
            } else if (substr(line, 1, 11) == "publisher: ") {
                pub = substr(line, 12)
            } else if (substr(line, 1, 9) == "lessons: ") {
                rest = substr(line, 10)
                # rest 形如 "L1..L3"
                sub(/^L/, "", rest)
                # 現在 rest 形如 "1..L3"
                idx = index(rest, "..")
                if (idx > 0) {
                    lstart = substr(rest, 1, idx - 1)
                    tail = substr(rest, idx + 2)
                    sub(/^L/, "", tail)
                    lend = tail
                }
            }
        }
        END {
            if (subj != "" && pub != "" && lstart != "" && lend != "") {
                short = substr(subj, 1, 3)
                for (i = lstart + 0; i <= lend + 0; i++) print short"_"pub"_L"i
            }
        }
    '
}

# 印出所有 status=done 的 unit_id
# Usage: progress_done_units <進度檔>
progress_done_units() {
    local tsv="$1"
    [[ -f "$tsv" ]] || return 0
    awk -F'\t' 'NR>1 && $11=="done" {print $1}' "$tsv"
}

# 印出所有 status=pending_pm 的 unit_id
# Usage: progress_pending_pm_units <進度檔>
progress_pending_pm_units() {
    local tsv="$1"
    [[ -f "$tsv" ]] || return 0
    awk -F'\t' 'NR>1 && $11=="pending_pm" {print $1}' "$tsv"
}
