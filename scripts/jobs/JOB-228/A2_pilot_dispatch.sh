#!/bin/bash
# JOB-228 Phase 4 Codex Pilot Dispatcher
# 序列跑 5 份 Pilot；每份產出後寫 progress.json 並做基本 schema 驗證。
#
# 用法：
#   bash scripts/jobs/JOB-228/A2_pilot_dispatch.sh           # 跑全部 5 份
#   bash scripts/jobs/JOB-228/A2_pilot_dispatch.sh --resume  # 從 checkpoint 接續
#   bash scripts/jobs/JOB-228/A2_pilot_dispatch.sh --rank 3  # 只跑第 3 份

set -e
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$ROOT"

TARGETS_FILE="scripts/jobs/JOB-228/_pilot_targets.json"
PROMPT_TEMPLATE="scripts/jobs/JOB-228/A2_pilot_prompt_template.md"
PROGRESS_FILE="scripts/jobs/JOB-228/_pilot_progress.json"
LOG_DIR="scripts/orchestrator-logs"
mkdir -p "$LOG_DIR" "knowledge/3_考古題/3_L2_結構化抽取/_pilot"

if [ ! -f "$TARGETS_FILE" ]; then echo "ERROR: $TARGETS_FILE 不存在" >&2; exit 1; fi
if ! command -v codex >/dev/null 2>&1; then echo "ERROR: codex CLI 未安裝" >&2; exit 1; fi

# 解析參數
ONLY_RANK=""
RESUME=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --rank) ONLY_RANK="$2"; shift 2 ;;
    --resume) RESUME=1; shift ;;
    *) echo "Unknown arg: $1" >&2; exit 1 ;;
  esac
done

# 讀 targets
COUNT=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$TARGETS_FILE')).targets.length)")
echo "[$(date '+%H:%M:%S')] 找到 $COUNT 份 Pilot 目標"

# Resume：讀 progress.json 跳過已完成
DONE_RANKS=""
if [ "$RESUME" = "1" ] && [ -f "$PROGRESS_FILE" ]; then
  DONE_RANKS=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$PROGRESS_FILE')).completed.join(' '))")
  echo "[$(date '+%H:%M:%S')] Resume 模式：已完成 ranks=[$DONE_RANKS]"
fi

# 初始化 progress.json
if [ ! -f "$PROGRESS_FILE" ] || [ "$RESUME" = "0" ]; then
  echo '{"started_at":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","completed":[],"failed":[],"running":null}' > "$PROGRESS_FILE"
fi

for ((i=1; i<=COUNT; i++)); do
  if [ -n "$ONLY_RANK" ] && [ "$ONLY_RANK" != "$i" ]; then continue; fi
  if [ -n "$DONE_RANKS" ] && echo " $DONE_RANKS " | grep -q " $i "; then
    echo "[$(date '+%H:%M:%S')] [Rank $i] 已完成，跳過"
    continue
  fi

  EXAM_ID=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$TARGETS_FILE')).targets[$i-1].exam_id)")
  MD_PATH=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$TARGETS_FILE')).targets[$i-1].md_path)")
  OUTPUT_PATH=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$TARGETS_FILE')).targets[$i-1].output_path)")
  SCENARIO=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$TARGETS_FILE')).targets[$i-1].scenario)")

  echo ""
  echo "════════════════════════════════════════════════════════════"
  echo "[$(date '+%H:%M:%S')] [Rank $i/$COUNT] $EXAM_ID"
  echo "    Scenario: $SCENARIO"
  echo "    MD:       $MD_PATH"
  echo "    Output:   $OUTPUT_PATH"
  echo "════════════════════════════════════════════════════════════"

  # 標記 running
  node -e "
    const fs=require('fs'); const p=JSON.parse(fs.readFileSync('$PROGRESS_FILE'));
    p.running={rank:$i, exam_id:'$EXAM_ID', started_at:new Date().toISOString()};
    fs.writeFileSync('$PROGRESS_FILE', JSON.stringify(p, null, 2));
  "

  LOG_FILE="$LOG_DIR/JOB-228-pilot-rank$i.log"

  # 注入變數到 prompt 模板
  PROMPT=$(sed -e "s|{EXAM_ID}|$EXAM_ID|g" \
                -e "s|{MD_PATH}|$MD_PATH|g" \
                -e "s|{OUTPUT_PATH}|$OUTPUT_PATH|g" \
                "$PROMPT_TEMPLATE")

  # 派工 codex exec
  echo "$PROMPT" | codex exec -m gpt-5-codex --skip-git-repo-check --full-auto - \
    > "$LOG_FILE" 2>&1 &
  CODEX_PID=$!
  echo "[$(date '+%H:%M:%S')] [Rank $i] codex PID=$CODEX_PID, log=$LOG_FILE"
  wait $CODEX_PID
  EXIT_CODE=$?

  if [ $EXIT_CODE -ne 0 ]; then
    echo "[$(date '+%H:%M:%S')] [Rank $i] ❌ codex 失敗 (exit=$EXIT_CODE)"
    node -e "
      const fs=require('fs'); const p=JSON.parse(fs.readFileSync('$PROGRESS_FILE'));
      p.failed.push({rank:$i, exam_id:'$EXAM_ID', exit_code:$EXIT_CODE, log:'$LOG_FILE'});
      p.running=null;
      fs.writeFileSync('$PROGRESS_FILE', JSON.stringify(p, null, 2));
    "
    continue
  fi

  # JSON 格式驗證
  if [ ! -f "$OUTPUT_PATH" ]; then
    echo "[$(date '+%H:%M:%S')] [Rank $i] ❌ 輸出檔不存在: $OUTPUT_PATH"
    node -e "
      const fs=require('fs'); const p=JSON.parse(fs.readFileSync('$PROGRESS_FILE'));
      p.failed.push({rank:$i, exam_id:'$EXAM_ID', error:'output_not_found'});
      p.running=null;
      fs.writeFileSync('$PROGRESS_FILE', JSON.stringify(p, null, 2));
    "
    continue
  fi

  if ! node -e "JSON.parse(require('fs').readFileSync('$OUTPUT_PATH'))" 2>/dev/null; then
    echo "[$(date '+%H:%M:%S')] [Rank $i] ❌ JSON 格式錯誤"
    node -e "
      const fs=require('fs'); const p=JSON.parse(fs.readFileSync('$PROGRESS_FILE'));
      p.failed.push({rank:$i, exam_id:'$EXAM_ID', error:'invalid_json'});
      p.running=null;
      fs.writeFileSync('$PROGRESS_FILE', JSON.stringify(p, null, 2));
    "
    continue
  fi

  # 編碼合法性快檢
  ILLEGAL=$(node -e "
    const fs=require('fs');
    const j=JSON.parse(fs.readFileSync('$OUTPUT_PATH'));
    const legal=JSON.parse(fs.readFileSync('knowledge/3_考古題/3_L2_結構化抽取/_meta/social_codes_legal_II.json'));
    const set=new Set([...legal.performance, ...legal.content].map(c=>c.code));
    let bad=0, total=0;
    for(const q of j.questions||[]) for(const c of q.codes_candidate||[]){total++; if(!set.has(c.code))bad++;}
    console.log(bad+'/'+total);
  ")

  echo "[$(date '+%H:%M:%S')] [Rank $i] ✅ 完成 | 非法編碼=$ILLEGAL"
  node -e "
    const fs=require('fs'); const p=JSON.parse(fs.readFileSync('$PROGRESS_FILE'));
    p.completed.push($i);
    p.running=null;
    p['rank_$i']={exam_id:'$EXAM_ID', illegal_codes:'$ILLEGAL', log:'$LOG_FILE', output:'$OUTPUT_PATH', finished_at:new Date().toISOString()};
    fs.writeFileSync('$PROGRESS_FILE', JSON.stringify(p, null, 2));
  "
done

echo ""
echo "════════════════════════════════════════════════════════════"
echo "[$(date '+%H:%M:%S')] Pilot 全部完成"
node -e "
  const fs=require('fs'); const p=JSON.parse(fs.readFileSync('$PROGRESS_FILE'));
  console.log('  完成 ranks:', p.completed.join(',') || '無');
  console.log('  失敗:', p.failed.length);
  for(const f of p.failed) console.log('    -', f.exam_id, '|', f.error || ('exit='+f.exit_code));
"
echo "════════════════════════════════════════════════════════════"
