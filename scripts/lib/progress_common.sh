#!/usr/bin/env bash
# Eidos 進度／斷點恢復子系統共用 lib
# spec: docs/superpowers/specs/2026-04-27-progress-resume-system-design.md
# 標準 awk（BSD/POSIX 相容）— 不依賴 gawk

# 從派工單 progress-config 區塊取出某欄位值
# Usage: parse_config_field <派工單路徑> <欄位>
# 失敗 return 1（檔案不存在或欄位不存在）
parse_config_field() {
    local job_md="$1"
    local field="$2"
    if [[ ! -f "$job_md" ]]; then
        echo "parse_config_field: file not found: $job_md" >&2
        return 1
    fi
    local result
    result=$(awk -v field="$field" '
        /<!-- progress-config-start -->/ { in_block=1; next }
        /<!-- progress-config-end -->/   { in_block=0 }
        in_block {
            line = $0
            gsub(/\r$/, "", line)
            gsub(/^[ \t]+|[ \t]+$/, "", line)
            if (line == "") next
            target = field":"
            tlen = length(target)
            if (substr(line, 1, tlen) == target) {
                value = substr(line, tlen + 1)
                gsub(/\r$/, "", value)
                gsub(/^[ \t]+|[ \t]+$/, "", value)
                sub(/[ \t]*#.*$/, "", value)
                gsub(/[ \t]+$/, "", value)
                print value
                exit
            }
        }
    ' "$job_md")
    if [[ -z "$result" ]]; then
        echo "parse_config_field: field '$field' not found in $job_md" >&2
        return 1
    fi
    echo "$result"
}

# 從派工單 progress-config 取 range，輸出 unit_id 清單（一行一個）
# 題庫類用 <subject_short>_<publisher>_<lesson> 合成
# Usage: parse_config_range <派工單路徑>
# 失敗 return 1（檔案不存在）；解析錯誤印 stderr 警告但續走
parse_config_range() {
    local job_md="$1"
    if [[ ! -f "$job_md" ]]; then
        echo "parse_config_range: file not found: $job_md" >&2
        return 1
    fi
    awk '
        /<!-- progress-config-start -->/ { in_block=1; next }
        /<!-- progress-config-end -->/   { in_block=0 }
        in_block { print }
    ' "$job_md" | awk '
        function subject_short(s) {
            # 已知英文（前 3 字符安全）
            if (s == "Science")        return "Sci"
            if (s == "Math")           return "Mat"
            if (s == "Chinese")        return "Chi"
            if (s == "English")        return "Eng"
            if (s == "SocialStudies")  return "Soc"
            # 已知中文映射（避免 substr 對 UTF-8 切壞）
            if (s == "自然") return "Sci"
            if (s == "數學") return "Mat"
            if (s == "國語") return "Chi"
            if (s == "英語") return "Eng"
            if (s == "英文") return "Eng"
            if (s == "社會") return "Soc"
            print "parse_config_range: unknown subject \""s"\" — please add mapping in scripts/lib/progress_common.sh" > "/dev/stderr"
            return "UNK"
        }
        function flush() {
            if (subj != "" && pub != "" && lstart != "" && lend != "") {
                short = subject_short(subj)
                ls = lstart + 0
                le = lend + 0
                if (le < ls) {
                    print "parse_config_range: invalid lessons range L"ls"..L"le > "/dev/stderr"
                    return
                }
                for (i = ls; i <= le; i++) print short"_"pub"_L"i
            }
        }
        /^range:/ { in_range=1; next }
        !in_range { next }
        /^[a-zA-Z_]+:/ && !/^[ \t]/ { in_range=0; next }
        {
            line = $0
            gsub(/\r$/, "", line)
            gsub(/^[ \t]+|[ \t]+$/, "", line)
            if (line == "") next

            if (substr(line, 1, 11) == "- subject: ") {
                flush()
                subj = substr(line, 12); pub = ""; lstart = ""; lend = ""
            } else if (substr(line, 1, 9) == "subject: ") {
                subj = substr(line, 10)
            } else if (substr(line, 1, 11) == "publisher: ") {
                pub = substr(line, 12)
            } else if (substr(line, 1, 9) == "lessons: ") {
                rest = substr(line, 10)
                if (substr(rest, 1, 1) != "L") {
                    print "parse_config_range: invalid lessons format \""rest"\"; expected L<n>..L<m>" > "/dev/stderr"
                    next
                }
                rest = substr(rest, 2)
                idx = index(rest, "..")
                if (idx == 0) {
                    print "parse_config_range: invalid lessons format \"L"rest"\"; expected L<n>..L<m>" > "/dev/stderr"
                    next
                }
                lstart = substr(rest, 1, idx - 1)
                tail = substr(rest, idx + 2)
                if (substr(tail, 1, 1) != "L") {
                    print "parse_config_range: invalid lessons format; expected L<n>..L<m>" > "/dev/stderr"
                    next
                }
                lend = substr(tail, 2)
            }
        }
        END { flush() }
    '
}

# 印出所有 status=done 的 unit_id
# Usage: progress_done_units <進度檔>
progress_done_units() {
    local tsv="$1"
    [[ -f "$tsv" ]] || return 0
    awk -F'\t' '
        NR>1 {
            s = $11
            gsub(/^[ \t]+|[ \t\r]+$/, "", s)
            if (s == "done") print $1
        }
    ' "$tsv"
}

# 印出所有 status=pending_pm 的 unit_id
# Usage: progress_pending_pm_units <進度檔>
progress_pending_pm_units() {
    local tsv="$1"
    [[ -f "$tsv" ]] || return 0
    awk -F'\t' '
        NR>1 {
            s = $11
            gsub(/^[ \t]+|[ \t\r]+$/, "", s)
            if (s == "pending_pm") print $1
        }
    ' "$tsv"
}
