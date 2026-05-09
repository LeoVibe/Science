#!/bin/bash
# JOB-228 Phase 5 Codex Full Dispatcher
# 序列跑 109 份 Full；每份產出後寫 progress.json 並做基本 schema 驗證。
#
# 用法：
#   bash scripts/jobs/JOB-228/A2_pilot_dispatch.sh           # 跑全部 109 份
#   bash scripts/jobs/JOB-228/A2_pilot_dispatch.sh --resume  # 從 checkpoint 接續
#   bash scripts/jobs/JOB-228/A2_pilot_dispatch.sh --rank 3  # 只跑第 3 份

set -e
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$ROOT"

TARGETS_FILE="scripts/jobs/JOB-228/_full_targets.json"
PROMPT_TEMPLATE="scripts/jobs/JOB-228/A2_pilot_prompt_template.md"
PROGRESS_FILE="scripts/jobs/JOB-228/_full_progress.json"
LOG_DIR="scripts/orchestrator-logs"
mkdir -p "$LOG_DIR" \
  "knowledge/3_考古題/3_L2_結構化抽取/三下/三下_社會_翰林" \
  "knowledge/3_考古題/3_L2_結構化抽取/三下/三下_社會_康軒" \
  "knowledge/3_考古題/3_L2_結構化抽取/三下/三下_社會_南一"

if [ ! -f "$TARGETS_FILE" ]; then echo "ERROR: $TARGETS_FILE 不存在" >&2; exit 1; fi
if ! command -v codex >/dev/null 2>&1; then echo "ERROR: codex CLI 未安裝" >&2; exit 1; fi

# 解析參數（預設自動 resume，避免每次重跑覆蓋既有進度）
ONLY_RANK=""
FRESH=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --rank) ONLY_RANK="$2"; shift 2 ;;
    --resume) shift ;;   # 向下相容（已是預設行為）
    --fresh) FRESH=1; shift ;;   # 明示要重置 progress.json
    *) echo "Unknown arg: $1" >&2; exit 1 ;;
  esac
done

# 讀 targets
COUNT=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$TARGETS_FILE')).targets.length)")
echo "[$(date '+%H:%M:%S')] 找到 $COUNT 份目標"

# 初始化 progress.json（只在不存在或明示 --fresh 時）
if [ ! -f "$PROGRESS_FILE" ] || [ "$FRESH" = "1" ]; then
  echo '{"started_at":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","completed":[],"failed":[],"running":null}' > "$PROGRESS_FILE"
  echo "[$(date '+%H:%M:%S')] 初始化新 progress.json"
fi

# 自動 resume：讀 progress.json 跳過已完成
DONE_RANKS=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$PROGRESS_FILE')).completed.join(' '))")
if [ -n "$DONE_RANKS" ]; then
  echo "[$(date '+%H:%M:%S')] 自動 resume：已完成 ranks=[$DONE_RANKS]"
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

  LOG_FILE="$LOG_DIR/JOB-228-full-rank$i.log"

  # 注入變數到 prompt 模板
  PROMPT=$(sed -e "s|{EXAM_ID}|$EXAM_ID|g" \
                -e "s|{MD_PATH}|$MD_PATH|g" \
                -e "s|{OUTPUT_PATH}|$OUTPUT_PATH|g" \
                "$PROMPT_TEMPLATE")

  # 派工 codex exec（含 25 min hard timeout watchdog）
  echo "$PROMPT" | codex exec --skip-git-repo-check --full-auto - \
    > "$LOG_FILE" 2>&1 &
  CODEX_PID=$!
  ( sleep 1500; kill $CODEX_PID 2>/dev/null && echo "[$(date '+%H:%M:%S')] [Rank $i] ⏱️ TIMEOUT 25min, killed PID=$CODEX_PID" >> "$LOG_FILE" ) &
  WATCHDOG=$!
  echo "[$(date '+%H:%M:%S')] [Rank $i] codex PID=$CODEX_PID watchdog=$WATCHDOG, log=$LOG_FILE"
  wait $CODEX_PID
  EXIT_CODE=$?
  kill $WATCHDOG 2>/dev/null   # 正常結束殺 watchdog

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

  # Layer 1 驗證擴充：questions count、_summary 一致性、confidence 列舉、reason 非空
  VALIDATION=$(node -e "
    const fs=require('fs');
    const j=JSON.parse(fs.readFileSync('$OUTPUT_PATH'));
    const result={};
    result.questions_count = (j.questions||[]).length;
    result.summary_total_match = (j._summary && j._summary.total_questions === result.questions_count);
    const confSet = new Set();
    let emptyReason = 0;
    for (const q of j.questions||[]) for (const c of q.codes_candidate||[]) {
      confSet.add(c.confidence);
      if (!c.reason || c.reason.trim().length < 5) emptyReason++;
    }
    result.confidence_legal = [...confSet].every(v=>['high','medium','low'].includes(v));
    result.reason_nonempty = (emptyReason === 0);
    result.empty_reason_count = emptyReason;
    console.log(JSON.stringify(result));
  ")

  echo "[$(date '+%H:%M:%S')] [Rank $i] ✅ 完成 | 非法編碼=$ILLEGAL | Layer1=$VALIDATION"
  node -e "
    const fs=require('fs'); const p=JSON.parse(fs.readFileSync('$PROGRESS_FILE'));
    p.completed.push($i);
    p.running=null;
    p['rank_$i']={
      exam_id:'$EXAM_ID',
      illegal_codes:'$ILLEGAL',
      log:'$LOG_FILE',
      output:'$OUTPUT_PATH',
      finished_at:new Date().toISOString(),
      validation_layer1: $VALIDATION
    };
    fs.writeFileSync('$PROGRESS_FILE', JSON.stringify(p, null, 2));
  "
done

echo ""
echo "════════════════════════════════════════════════════════════"
echo "[$(date '+%H:%M:%S')] Full 全部完成"
node -e "
  const fs=require('fs'); const p=JSON.parse(fs.readFileSync('$PROGRESS_FILE'));
  console.log('  完成 ranks:', p.completed.join(',') || '無');
  console.log('  失敗:', p.failed.length);
  for(const f of p.failed) console.log('    -', f.exam_id, '|', f.error || ('exit='+f.exit_code));
"
echo "════════════════════════════════════════════════════════════"
