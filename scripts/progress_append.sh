#!/usr/bin/env bash
# scripts/progress_append.sh — 寫一行到 jobs/<JOB>-progress.tsv
# spec: docs/superpowers/specs/2026-04-27-progress-resume-system-design.md
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/progress_common.sh"

JOB="${1:?JOB id required, e.g. JOB-211}"
shift

# 預設值
JOBS_DIR="$(cd "$SCRIPT_DIR/.." && pwd)/jobs"
UNIT_ID=""
AGENT=""
STATUS=""
DESC=""
SUBJECT="-"
PUBLISHER="-"
LESSON="-"
CQI_P="-"
CQI_V="-"
MATCH="-"
QL="-"

while [[ $# -gt 0 ]]; do
    case "$1" in
        --jobs-dir) JOBS_DIR="$2"; shift 2 ;;
        --unit-id) UNIT_ID="$2"; shift 2 ;;
        --agent) AGENT="$2"; shift 2 ;;
        --status) STATUS="$2"; shift 2 ;;
        --desc) DESC="$2"; shift 2 ;;
        --subject) SUBJECT="$2"; shift 2 ;;
        --publisher) PUBLISHER="$2"; shift 2 ;;
        --lesson) LESSON="$2"; shift 2 ;;
        --cqi-p) CQI_P="$2"; shift 2 ;;
        --cqi-v) CQI_V="$2"; shift 2 ;;
        --match) MATCH="$2"; shift 2 ;;
        --ql) QL="$2"; shift 2 ;;
        *) echo "Unknown arg: $1" >&2; exit 1 ;;
    esac
done

# trim：寫入端嚴格化（避免下游比對失敗）
trim() { local s="$1"; s="${s#"${s%%[![:space:]]*}"}"; s="${s%"${s##*[![:space:]]}"}"; echo "$s"; }
UNIT_ID=$(trim "$UNIT_ID")
AGENT=$(trim "$AGENT")
STATUS=$(trim "$STATUS")
DESC=$(trim "$DESC")
SUBJECT=$(trim "$SUBJECT")
PUBLISHER=$(trim "$PUBLISHER")
LESSON=$(trim "$LESSON")

[[ -n "$UNIT_ID" && -n "$AGENT" && -n "$STATUS" && -n "$DESC" ]] || {
    echo "Required: --unit-id --agent --status --desc" >&2
    exit 1
}

TSV="$JOBS_DIR/${JOB}-progress.tsv"
HEADER=$'unit_id\tcommit\tagent\tsubject\tpublisher\tlesson\tCQI-P\tCQI-V\tMatch%\tQL\tstatus\tdesc\tts'

# desc 內禁有 tab/換行/CR，全替換為空格
SAFE_DESC=$(printf '%s' "$DESC" | tr '\t\n\r' '   ')

# commit short hash（git 倉根）；非 git 環境填 nogit
COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "nogit")

# ts ISO 8601 短格式（到分鐘，UTC）
TS=$(date -u +"%Y-%m-%dT%H:%M")

# 用實際 tab 字元拼 ROW（避免 printf format string injection — desc 含 % 會被解譯）
TAB=$'\t'
ROW="${UNIT_ID}${TAB}${COMMIT}${TAB}${AGENT}${TAB}${SUBJECT}${TAB}${PUBLISHER}${TAB}${LESSON}${TAB}${CQI_P}${TAB}${CQI_V}${TAB}${MATCH}${TAB}${QL}${TAB}${STATUS}${TAB}${SAFE_DESC}${TAB}${TS}"

# 確保 jobs 目錄存在
mkdir -p "$JOBS_DIR"

# 用 mkdir 原子鎖避免並發 race（macOS/Linux 共通，不依賴 flock）
LOCKDIR="$TSV.lockdir"
LOCK_HELD=0

# trap 提前設置 + 用 LOCK_HELD 防止誤刪（避免 trap 與 mkdir 之間的 SIGINT race）
trap '[[ $LOCK_HELD -eq 1 ]] && rmdir "$LOCKDIR" 2>/dev/null || true' EXIT INT TERM

LOCK_RETRY=0
while ! mkdir "$LOCKDIR" 2>/dev/null; do
    LOCK_RETRY=$((LOCK_RETRY + 1))
    if [[ $LOCK_RETRY -gt 50 ]]; then
        echo "progress_append: lock timeout (5s) for $TSV" >&2
        exit 2
    fi
    sleep 0.1
done
LOCK_HELD=1

if [[ ! -f "$TSV" ]]; then
    printf '%s\n' "$HEADER" > "$TSV"
fi
printf '%s\n' "$ROW" >> "$TSV"

rmdir "$LOCKDIR" 2>/dev/null || true
LOCK_HELD=0
trap - EXIT INT TERM

echo "appended: $UNIT_ID / $STATUS / $TS" >&2
