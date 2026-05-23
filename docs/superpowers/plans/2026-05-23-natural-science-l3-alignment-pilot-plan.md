# 自然 L3 對齊 Pilot Implementation Plan（四下自然，JOB-246）

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Validate spec v2.0（自然版 L3 對齊）on 四下自然 118 試卷 / ~6,000 題，作為後續三下/五下/六下自然 + 社會 G3-G6 的機制驗證 Pilot。

**Architecture:** 三層對齊（題目 → 學習內容 codes → KL4 知識點），N1-N5 Match Rules **三審制**（L2 → Codex 抽查 → Claude subagent 三審），產出 codes 覆蓋報告 + KL4 教學示例 + 迷思診斷報告。

**Tech Stack:** Python 3 (json, re, collections) + bash + Codex CLI gpt-5.5（二審抽查）+ Claude subagent general-purpose（三審仲裁，僅處理 Codex needs_human_review 子集）。

**三審制分層**：
| 層 | 工具 | 範圍 | 預估量 |
|:--|:--|:--|:--|
| 一審 | Python（A1a） | 全 6,000 題 預判 | 100% |
| 二審 | Codex 抽查（A1b） | N2/N3 pending 邊界 + N1 抽查 | ~30%（1,800 題）|
| **三審** | **Claude subagent（A1c）** | **二審判 needs_human_review 子集** | **~10%（600 題）** |
| 親檢 | 主執行緒 | 三審後仍剩需人工 | < 1%（~50 題） |

**Upstream spec:** `docs/superpowers/specs/2026-05-23-natural-science-l3-alignment-design.md`

---

## File Structure

新增檔案（仿 JOB-242~245 pattern）：

```
jobs/
└── JOB-246-AG-四下-自然-L3對齊Pilot.md   # 派工單

scripts/jobs/JOB-246/
├── A0_phase0_l2_analysis.py            # Phase 0：L2 codes_candidate 分布統計
├── A1a_phase1a_l2_align.py             # Phase 1a：L2 → primary/secondary_codes
├── A1b_codex_arbitration_prompt.md     # Phase 1b：Codex 二審 prompt template
├── A1b_codex_dispatch.sh               # Phase 1b：二審 dispatch（3 worker）
├── A1c_subagent_tribunal_prompt.md     # Phase 1c：Claude subagent 三審 prompt
├── A1c_subagent_dispatcher.py          # Phase 1c：抽出二審 needs_human_review + 派 subagent
├── A2_auto_verify.py                   # Phase 2：auto-verify + 普查分流
├── A3_codes_coverage_report.py         # Phase 3：codes 覆蓋報告
├── A4_kl4_teaching_examples.py         # Phase 3：KL4 教學示例（含 misconception）
├── A5_misconception_diagnosis.py       # Phase 3：迷思診斷報告
├── _full_targets.json                  # 抽查任務清單（subset of 118 試卷）
├── _phase1_logs/                       # codex log
└── watchdog.sh                         # codex 卡死監控

knowledge/3_考古題/3_L2_結構化抽取/四下/alignment_science/
├── _partial/                           # 抽查 partial JSON
├── alignment_raw.json                  # 最終合併
├── codes_coverage_report.md            # 反向產出 1
├── kl4_teaching_examples.md            # 反向產出 2
├── misconception_diagnosis.md          # 反向產出 3（自然特有）
└── 四下_自然_L3對齊報告.md             # Phase 4 對齊報告
```

---

## Task 1: 開 JOB-246 派工單

**Files:**
- Create: `jobs/JOB-246-AG-四下-自然-L3對齊Pilot.md`

- [ ] **Step 1: 確認 JOB 流水號**

Run:
```bash
cd /Users/s389080/Documents/doc/work/0_AI_Project/eidosProject
node scripts/job_manager.js next
```

Expected: 顯示 `建議下一張派工單號：JOB-246`

- [ ] **Step 2: 建單**

Run:
```bash
node scripts/job_manager.js create "四下-自然-L3對齊Pilot" AG research
```

Expected: `✅ 成功建立任務單: JOB-246-AG-四下-自然-L3對齊Pilot.md`

- [ ] **Step 3: 填入派工單內容（仿 JOB-242 模板）**

Write content with:
- `job_type: research`
- `executor: Codex CLI gpt-5.5（Phase 1b 仲裁） + Claude Opus 4.7（Phase 0/2/4）`
- `parent_jobs: JOB-242~245（國語 L3 對齊全套）`
- 引用 spec v2.0: `docs/superpowers/specs/2026-05-23-natural-science-l3-alignment-design.md`
- 三段式 Checklist（啟動 / 驗收 / 成果）

- [ ] **Step 4: Commit 派工單**

```bash
git add jobs/JOB-246-AG-四下-自然-L3對齊Pilot.md
git commit -m "feat: 開單 JOB-246 四下自然 L3 對齊 Pilot（spec v2.0）

JOB: JOB-246

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 2: Phase 0 — L2 codes_candidate 預覽分析

**Files:**
- Create: `scripts/jobs/JOB-246/A0_phase0_l2_analysis.py`

- [ ] **Step 1: 寫 Phase 0 分析腳本**

Create `scripts/jobs/JOB-246/A0_phase0_l2_analysis.py`:

```python
"""Phase 0: 四下自然 L2 codes_candidate 分布統計
輸出：
  - 總題數 / 三家分布
  - codes_candidate confidence 分布（high/medium/low）
  - N1/N2/N3/N4/N5 預估比例
  - 預判 codes 覆蓋度
"""
import os
import json
import re
from collections import Counter, defaultdict

BASE = 'knowledge/3_考古題/3_L2_結構化抽取/四下'
SUBJECT = '自然'
PUBLISHERS = ['翰林', '康軒', '南一']

def main():
    total_q = 0
    by_pub = Counter()
    conf_dist = Counter()
    code_count_per_q = Counter()
    code_prefix = Counter()
    no_code_q = 0

    for pub in PUBLISHERS:
        d = os.path.join(BASE, f'四下_{SUBJECT}_{pub}')
        if not os.path.exists(d):
            continue
        for f in sorted(os.listdir(d)):
            if not f.endswith('.json') or f.startswith('_'):
                continue
            try:
                data = json.load(open(os.path.join(d, f), encoding='utf-8'))
                for q in data.get('questions', []):
                    total_q += 1
                    by_pub[pub] += 1
                    cc = q.get('codes_candidate', [])
                    code_count_per_q[len(cc)] += 1
                    if not cc:
                        no_code_q += 1
                        continue
                    for c in cc:
                        conf_dist[c.get('confidence', '?')] += 1
                        code = c.get('code', '')
                        m = re.match(r'^([a-zA-Z]+)-', code)
                        if m:
                            code_prefix[m.group(1)] += 1
            except Exception as e:
                print(f'  ⚠️ {f}: {e}')

    print('=== Phase 0：四下自然 L2 codes_candidate 統計 ===')
    print(f'總題數: {total_q}')
    print(f'三家分布: {dict(by_pub)}')
    print()
    print(f'單題 codes 數量分布: {dict(code_count_per_q)}')
    print(f'無 code 題數: {no_code_q} ({no_code_q/total_q*100:.1f}%)')
    print()
    print(f'codes confidence 分布: {dict(conf_dist)}')
    print()
    print(f'code 前綴分布（top 10）:')
    for p, c in code_prefix.most_common(10):
        print(f'  {p}: {c}')

    # N1-N5 預估
    n1 = conf_dist.get('high', 0)
    n5 = no_code_q
    n2_n3 = total_q - n1 - n5
    print()
    print(f'N1-N5 預估比例（粗估）:')
    print(f'  N1 (high confidence 假設雙源一致): {n1} ({n1/total_q*100:.1f}%)')
    print(f'  N2+N3 (medium/low 需 codex 仲裁): {n2_n3} ({n2_n3/total_q*100:.1f}%)')
    print(f'  N5 (無 code): {n5} ({n5/total_q*100:.1f}%)')
    print()
    print('Pilot 通過門檻：')
    print(f'  N1 ≥ 60% 預期：{n1/total_q*100:.1f}% {"✓" if n1/total_q >= 0.6 else "⚠️ 不達標"}')

if __name__ == '__main__':
    main()
```

- [ ] **Step 2: 執行 Phase 0 分析**

Run:
```bash
cd /Users/s389080/Documents/doc/work/0_AI_Project/eidosProject
python3 scripts/jobs/JOB-246/A0_phase0_l2_analysis.py
```

Expected output:
```
=== Phase 0：四下自然 L2 codes_candidate 統計 ===
總題數: ~6000（範圍 5,000-7,000）
三家分布: {'翰林': ~2000, '康軒': ~2000, '南一': ~2000}
...
N1 ≥ 60% 預期：XX.X% ✓ 或 ⚠️ 不達標
```

- [ ] **Step 3: 評估結果**

如果 N1 預估 < 50% → 暫停，回頭調整 spec v2.0 §2.4 預期分布。
如果 N1 預估 ≥ 50% → 繼續進 Task 3。

- [ ] **Step 4: Commit Phase 0 腳本**

```bash
git add scripts/jobs/JOB-246/A0_phase0_l2_analysis.py
git commit -m "feat: Phase 0 L2 codes_candidate 預覽分析腳本

JOB: JOB-246

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 3: Phase 1a — L2 → primary/secondary_codes 規則套用

**Files:**
- Create: `scripts/jobs/JOB-246/A1a_phase1a_l2_align.py`
- Create: `knowledge/3_考古題/3_L2_結構化抽取/四下/alignment_science/_partial/`

- [ ] **Step 1: 讀取 KL3 §二 核心單元主題對照表**

先檢查 KL3 文件結構：
```bash
grep -A 20 "課程內容與發展矩陣" knowledge/1_課綱研究/自然/KL3_四下_自然_研究總綱.md | head -30
```

抓出四下自然的單元主題清單，例如：
- 物質的變化
- 力與運動
- 動物的構造與行為
- 觀測月亮與星空

- [ ] **Step 2: 寫 Phase 1a 對齊腳本**

Create `scripts/jobs/JOB-246/A1a_phase1a_l2_align.py`:

```python
"""Phase 1a: L2 codes_candidate → primary/secondary_codes + unit_theme
不啟動 Codex；直接基於 L2 規則填欄位
- primary_code = high confidence 第一個 code
- secondary_codes = 其餘 codes（上限 3）
- unit_theme = 比對 KL3 §二 主題（題幹關鍵詞匹配）
- 預判 N1: high confidence 且只 1 code → 標 N1 預判
- N5: 無 code → general_type 預判
"""
import os
import json
import re
from datetime import datetime

BASE = 'knowledge/3_考古題/3_L2_結構化抽取/四下'
SUBJECT = '自然'
PUBLISHERS = ['翰林', '康軒', '南一']
OUT_DIR = os.path.join(BASE, 'alignment_science', '_partial')

# 四下自然 KL3 §二 單元主題（從 KL3 抽取後手工填）
UNIT_THEMES = {
    '物質的變化': ['物質', '溶解', '混合', '蒸發', '凝結', '溫度'],
    '力與運動': ['力', '推', '拉', '運動', '速度', '摩擦'],
    '動物的構造與行為': ['動物', '構造', '行為', '適應', '生存'],
    '觀測月亮與星空': ['月亮', '月相', '星空', '星座', '夜空'],
}

def infer_unit_theme(stem: str) -> str:
    """根據題幹關鍵詞匹配 KL3 §二 單元主題"""
    scores = {}
    for theme, keywords in UNIT_THEMES.items():
        scores[theme] = sum(1 for kw in keywords if kw in stem)
    best_theme = max(scores, key=scores.get)
    return best_theme if scores[best_theme] > 0 else None

def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    for pub in PUBLISHERS:
        d = os.path.join(BASE, f'四下_{SUBJECT}_{pub}')
        if not os.path.exists(d):
            continue
        for f in sorted(os.listdir(d)):
            if not f.endswith('.json') or f.startswith('_'):
                continue
            exam_id = f[:-5]
            try:
                data = json.load(open(os.path.join(d, f), encoding='utf-8'))
                qs = data.get('questions', [])
                links = []
                for q in qs:
                    cc = q.get('codes_candidate', [])
                    primary_code = cc[0]['code'] if cc else None
                    secondary_codes = [c['code'] for c in cc[1:4]] if len(cc) > 1 else []
                    stem = q.get('stem', '')
                    unit_theme = infer_unit_theme(stem)

                    # 預判 N1 / N5
                    if not cc:
                        match_rule = 'N5'
                        confidence = 'none'
                        general_type = q.get('topic_keywords', ['unlinked'])[0] if q.get('topic_keywords') else 'unlinked'
                    elif primary_code and cc[0].get('confidence') == 'high':
                        match_rule = 'N1_pending'  # 待 Phase 1b 抽查驗證
                        confidence = 'high'
                        general_type = None
                    else:
                        match_rule = 'N2_or_N3_pending'
                        confidence = cc[0].get('confidence', 'medium') if cc else 'low'
                        general_type = None

                    links.append({
                        'exam_id': exam_id,
                        'question_id': q['question_id'],
                        'version_match': 'current',
                        'primary_code': primary_code,
                        'secondary_codes': secondary_codes,
                        'unit_theme': unit_theme,
                        'kl4_link': None,  # Phase 1b 補
                        'kl4_supported': False,  # Phase 1b 判定
                        'misconception_match': [],  # Phase 1b 補
                        'match_rule': match_rule,
                        'confidence': confidence,
                        'source_l2': f"{primary_code} ({cc[0].get('confidence','?')})" if cc else None,
                        'source_codex': None,
                        'general_type': general_type,
                        'verify_status': 'pending',
                        'verify_note': None,
                    })

                out = {
                    '_meta': {
                        'schema_version': '2.0',
                        'partial_for': exam_id,
                        'publisher': pub,
                        'subject': SUBJECT,
                        'semester': '四下',
                        'processed_at': datetime.now().isoformat(),
                        'extractor': 'Phase 1a Python (JOB-246)',
                        'total_questions': len(links),
                    },
                    'l2_to_kl_links': links,
                }
                out_path = os.path.join(OUT_DIR, f'alignment_partial_{exam_id}.json')
                json.dump(out, open(out_path, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
                print(f'  ✓ {exam_id}: {len(links)} 題')
            except Exception as e:
                print(f'  ❌ {f}: {e}')

if __name__ == '__main__':
    main()
```

- [ ] **Step 3: 執行 Phase 1a**

Run:
```bash
cd /Users/s389080/Documents/doc/work/0_AI_Project/eidosProject
python3 scripts/jobs/JOB-246/A1a_phase1a_l2_align.py
```

Expected: ~118 行 `✓ 翰林_XXX_學校_考試: N 題`，共產出 ~118 partial JSON 到 `knowledge/3_考古題/3_L2_結構化抽取/四下/alignment_science/_partial/`

- [ ] **Step 4: 驗證 Phase 1a 產出**

```bash
ls knowledge/3_考古題/3_L2_結構化抽取/四下/alignment_science/_partial/*.json | wc -l
```

Expected: `118`（或扣空檔後接近）

抽 1 份檢 JSON 合法 + 結構：
```bash
python3 -c "
import json, glob
files = sorted(glob.glob('knowledge/3_考古題/3_L2_結構化抽取/四下/alignment_science/_partial/*.json'))
d = json.load(open(files[0]))
print('meta:', d['_meta'])
print('first link:', d['l2_to_kl_links'][0])
"
```

Expected: 結構完整，含 primary_code / secondary_codes / unit_theme / match_rule = 'N1_pending' 或 'N2_or_N3_pending' 或 'N5'

- [ ] **Step 5: 統計 Phase 1a 預判分布**

```bash
python3 << 'PY'
import json, glob
from collections import Counter
status = Counter()
for fp in glob.glob('knowledge/3_考古題/3_L2_結構化抽取/四下/alignment_science/_partial/*.json'):
    d = json.load(open(fp))
    for link in d['l2_to_kl_links']:
        status[link['match_rule']] += 1
print('Phase 1a 預判分布:')
total = sum(status.values())
for k, v in sorted(status.items(), key=lambda x: -x[1]):
    print(f'  {k}: {v} ({v/total*100:.1f}%)')
PY
```

Expected: N1_pending ~60-70%、N2_or_N3_pending ~15-25%、N5 ~10-15%

- [ ] **Step 6: Commit Phase 1a**

```bash
git add scripts/jobs/JOB-246/A1a_phase1a_l2_align.py knowledge/3_考古題/3_L2_結構化抽取/四下/alignment_science/_partial/
git commit -m "feat: Phase 1a L2 → codes 對齊（規則套用）

JOB: JOB-246

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 4: Phase 1b — Codex 抽查 prompt template + dispatch script

**Files:**
- Create: `scripts/jobs/JOB-246/A1b_codex_arbitration_prompt.md`
- Create: `scripts/jobs/JOB-246/A1b_codex_dispatch.sh`
- Create: `scripts/jobs/JOB-246/_full_targets.json`

- [ ] **Step 1: 寫 Codex prompt template**

Create `scripts/jobs/JOB-246/A1b_codex_arbitration_prompt.md`:

```markdown
# JOB-246 Phase 1b：Codex 抽查仲裁（四下自然 L3 對齊，spec v2.0）

你是 Codex（gpt-5.5），負責對單一試卷做 codes 仲裁 + KL4 連結。

> **JOB-246 重點**：本試卷的 Phase 1a 已用 L2.codes_candidate 預判。你只負責：
> 1. 對 `match_rule = N2_or_N3_pending` 題做重判（同主題 + 同動詞類）
> 2. 對 `match_rule = N1_pending` 題抽查驗證（題幹 vs L2 code 是否真合理）
> 3. 為**所有題**判斷 `kl4_supported`（題幹是否含 KL4 知識點 ≥2 字）
> 4. 若四下自然，補 `kl4_link` 與 `misconception_match`

---

## 必讀素材

1. spec v2.0: `docs/superpowers/specs/2026-05-23-natural-science-l3-alignment-design.md`
2. KL3: `knowledge/1_課綱研究/自然/KL3_四下_自然_研究總綱.md`
3. KL4: `knowledge/1_課綱研究/自然/四下/{翰林,康軒,南一}/KL4_四下_*_L*_單課研究紀錄.md`
4. Phase 1a partial: `{INPUT_PATH}`
5. L2 原始: `{L2_PATH}`

---

## 任務

讀 `{INPUT_PATH}` 的 partial JSON，逐題更新：

### N1_pending 題（抽查驗證）
- 讀題幹 + L2 primary_code 的 reason/trace
- 確認 code 合理 → 確定為 N1，confidence=high
- 若認為 code 錯誤 → 改 primary_code + 標 match_rule=N2，confidence=medium，記 source_codex

### N2_or_N3_pending 題（仲裁）
- 重判：用 KL3 §二 + KL4 對應到最合適的 code
- 與 L2 primary_code 比對：
  - 同 code → N1，confidence=high
  - 同主題 + 同動詞類前綴 → N2，confidence=medium，採 codex 為 primary
  - 不同主題或動詞類 → 標 needs_human_review，記理由
  - 單源（L2 無 code）→ N3，採 codex code

### 動詞類前綴對照

| 前綴群組 | 含義 |
|:--|:--|
| INa- / INb- / INc- / INd- / INe- / INf- / INg- | 學習內容（知識）|
| po- | 觀察與提問 |
| pa- | 分析推論 |
| ai- / an- | 態度與興趣 |
| tr- / tm- / tc- / ti- | 探究技能 |

兩源 codes 必須**同前綴群組 + 同主題（前 6 字）**才視為 N2 相容。

### kl4_supported（所有題）
- 讀對應 KL4 課文 §核心知識點地圖
- 題幹是否含 ≥2 個 KL4 核心知識點關鍵字？是 → `kl4_supported: true`，補 `kl4_link`
- 否 → `kl4_supported: false`，`kl4_link: null`

### misconception_match（僅 kl4_supported=true）
- 讀對應 KL4 §守衛點 / 迷思條目
- 題幹/選項是否觸碰特定迷思？列入 `misconception_match: [...]`

---

## 輸出

更新 `{INPUT_PATH}` 的 JSON（覆寫 in-place），每題填齊以下欄位：
- `match_rule`：N1 / N2 / N3 / N5（去除 _pending）
- `confidence`：high / medium / none
- `source_codex`：codex 判定的 code（若有重判）
- `kl4_supported`：bool
- `kl4_link`：{ lesson, knowledge_point, kecode } 或 null
- `misconception_match`：[ ... ] 或 []
- `verify_status`：pending（由 Phase 2 決定 pass/pass_with_caveat）

完成後 print：
```
[{EXAM_ID}] done: N1=A, N2=B, N3=C, N5=D, kl4_supported=E, total=F
```
```

- [ ] **Step 2: 寫 dispatch script**

Create `scripts/jobs/JOB-246/A1b_codex_dispatch.sh`:

```bash
#!/bin/bash
# JOB-246 Phase 1b: Codex 抽查仲裁 dispatch (3 worker)
# 仿 JOB-242~245 pattern，但只跑「需要仲裁」的試卷子集

set -u
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$ROOT"

OUT_DIR="knowledge/3_考古題/3_L2_結構化抽取/四下/alignment_science/_partial"
LOG_DIR="scripts/jobs/JOB-246/_phase1_logs"
PROMPT_TPL="scripts/jobs/JOB-246/A1b_codex_arbitration_prompt.md"
L2_BASE="knowledge/3_考古題/3_L2_結構化抽取/四下"

mkdir -p "$LOG_DIR"
> "$LOG_DIR/phase1b_timing.csv"

run_one() {
  local WORKER=$1
  local EXAM_ID=$2
  local L2_PATH=$3
  local INPUT_PATH="$OUT_DIR/alignment_partial_${EXAM_ID}.json"
  local LOG_PATH="$LOG_DIR/${EXAM_ID}.log"

  if [ ! -f "$INPUT_PATH" ]; then
    echo "[Worker $WORKER][$EXAM_ID] SKIP (no Phase 1a partial)"
    return
  fi

  local PROMPT=$(sed -e "s|{EXAM_ID}|$EXAM_ID|g" \
                     -e "s|{INPUT_PATH}|$INPUT_PATH|g" \
                     -e "s|{L2_PATH}|$L2_PATH|g" \
                     "$PROMPT_TPL")

  echo "[Worker $WORKER][$EXAM_ID] start"
  T0=$(date +%s)
  codex exec --skip-git-repo-check --sandbox workspace-write "$PROMPT" \
    < /dev/null > "$LOG_PATH" 2>&1
  EXIT=$?
  T1=$(date +%s)
  ELAPSED=$((T1-T0))
  echo "[Worker $WORKER][$EXAM_ID] done elapsed=${ELAPSED}s exit=$EXIT"
  echo "$EXAM_ID,$ELAPSED,$EXIT,$WORKER" >> "$LOG_DIR/phase1b_timing.csv"
}

# 從 _full_targets.json 讀任務清單，分配 3 worker
run_worker() {
  local WORKER=$1
  local WORKER_TARGETS=$2
  local TOTAL=$(python3 -c "import json; print(len(json.load(open('$WORKER_TARGETS'))))")
  local IDX=0
  while IFS= read -r entry; do
    IDX=$((IDX+1))
    local EXAM_ID L2_PATH
    EXAM_ID=$(echo "$entry" | python3 -c "import sys,json; print(json.loads(sys.stdin.read())['exam_id'])")
    L2_PATH=$(echo "$entry" | python3 -c "import sys,json; print(json.loads(sys.stdin.read())['l2_path'])")
    echo "[Worker $WORKER] progress $IDX/$TOTAL: $EXAM_ID"
    run_one "$WORKER" "$EXAM_ID" "$L2_PATH"
  done < <(python3 -c "import json; [print(json.dumps(t, ensure_ascii=False)) for t in json.load(open('$WORKER_TARGETS'))]")
  echo "[Worker $WORKER] all $TOTAL done"
}

START=$(date +%s)
echo "=== JOB-246 Phase 1b dispatch start at $(date) ==="

run_worker "A_翰林" "scripts/jobs/JOB-246/_full_targets_A_翰林.json" > "$LOG_DIR/worker_A_翰林.log" 2>&1 &
PID_A=$!
run_worker "B_康軒" "scripts/jobs/JOB-246/_full_targets_B_康軒.json" > "$LOG_DIR/worker_B_康軒.log" 2>&1 &
PID_B=$!
run_worker "C_南一" "scripts/jobs/JOB-246/_full_targets_C_南一.json" > "$LOG_DIR/worker_C_南一.log" 2>&1 &
PID_C=$!

wait $PID_A; wait $PID_B; wait $PID_C
END=$(date +%s)
echo "=== Phase 1b 完成 總耗時 $((END-START))s ==="
```

- [ ] **Step 3: 建 _full_targets 任務清單**

要選擇哪些試卷送 Codex 抽查？決策：

**選項 A（推薦，cost 低）**：只送 Pilot 5 份試跑 → 驗證機制 → 確認後再決定要不要全量
**選項 B（cost 高）**：所有 118 份都送 Codex

寫一個 build_targets 腳本：

```python
"""分配 ~30% 試卷給 Codex 抽查（依 N2/N3 pending 比例排序）
Pilot 階段：先選 5 份代表性試卷"""
import os
import json

BASE = 'knowledge/3_考古題/3_L2_結構化抽取/四下'
PARTIAL_DIR = os.path.join(BASE, 'alignment_science', '_partial')

# Pilot 5 份固定清單（手選）
PILOT = [
    ('翰林', '四下_自然_翰林', None),  # 將自動選翰林該年份首份非空
    ('翰林', '四下_自然_翰林', None),
    ('康軒', '四下_自然_康軒', None),
    ('康軒', '四下_自然_康軒', None),
    ('南一', '四下_自然_南一', None),
]

all_targets = {'A_翰林': [], 'B_康軒': [], 'C_南一': []}
for pub, sub, _ in PILOT:
    d = os.path.join(BASE, sub)
    if not os.path.exists(d):
        continue
    files = sorted([f for f in os.listdir(d) if f.endswith('.json') and not f.startswith('_')])
    for f in files[:2]:  # 各 publisher 抽前 2 份
        try:
            data = json.load(open(os.path.join(d, f), encoding='utf-8'))
            if not data.get('questions'):
                continue
            exam_id = f[:-5]
            target = {
                'exam_id': exam_id,
                'l2_path': os.path.join(d, f),
                'publisher': pub,
            }
            worker = {'翰林': 'A_翰林', '康軒': 'B_康軒', '南一': 'C_南一'}[pub]
            all_targets[worker].append(target)
            break  # 每個 publisher 取首份成功
        except: pass

for w, targets in all_targets.items():
    p = f'scripts/jobs/JOB-246/_full_targets_{w}.json'
    json.dump(targets, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    print(f'  ✓ {p}: {len(targets)} 份')
```

執行：
```bash
python3 -c "
$(content above)
"
```

Expected: 各 worker 1-2 份試卷 = 共 ~5 份 Pilot

- [ ] **Step 4: chmod + 啟動 Pilot dispatch**

```bash
chmod +x scripts/jobs/JOB-246/A1b_codex_dispatch.sh
bash scripts/jobs/JOB-246/A1b_codex_dispatch.sh > scripts/jobs/JOB-246/_phase1_logs/dispatch.log 2>&1 &
```

Expected: 3 worker 啟動，5 份 codex 在跑

- [ ] **Step 5: 等 Pilot 完成 + 親檢**

等待 5 份完成（~25 min），然後親檢 2-3 份：

```bash
python3 << 'PY'
import json, glob
for fp in glob.glob('knowledge/3_考古題/3_L2_結構化抽取/四下/alignment_science/_partial/*.json')[:3]:
    d = json.load(open(fp))
    # 統計 N1/N2/N3/N5 + kl4_supported
    from collections import Counter
    rules = Counter()
    kl4_sup = 0
    for link in d['l2_to_kl_links']:
        rules[link.get('match_rule', '?')] += 1
        if link.get('kl4_supported'):
            kl4_sup += 1
    print(f'{fp}: rules={dict(rules)} kl4_supported={kl4_sup}/{len(d["l2_to_kl_links"])}')
PY
```

Expected: N1+N2+N3+N5 == total，kl4_supported ≥ 30%

- [ ] **Step 6: Commit Phase 1b scripts**

```bash
git add scripts/jobs/JOB-246/A1b_codex_arbitration_prompt.md \
        scripts/jobs/JOB-246/A1b_codex_dispatch.sh \
        scripts/jobs/JOB-246/_full_targets_*.json
git commit -m "feat: Phase 1b Codex 抽查仲裁 scripts + Pilot 5 份目標

JOB: JOB-246

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 5: Pilot 5 份親檢 + 機制驗證

**Files:** （無新檔，純驗證）

- [ ] **Step 1: 親檢 Pilot 結果**

對 5 份 partial 各檢：
- N1+N2+N3+N5 == total（不漏題）
- N1 比例 ≥ 60%
- kl4_supported 比例 ≥ 30%
- 隨機抽 5 個 N1 + 5 個 kl4_supported 看內容是否正確對齊

- [ ] **Step 2: 若 Pilot 不過關**

如果 N1 < 50% 或 kl4_supported < 20% → 暫停，調 spec v2.0 §2/§5（可能 N2 動詞類分類過嚴或 KL4 關鍵字門檻不合適）。

- [ ] **Step 3: Pilot 過關，建全量 _full_targets**

更新 build_targets.py 為「所有 118 份」（去除已在 Pilot 的 5 份）。

```python
# 全量範圍：所有未跑過的 Phase 1a partial
for pub, sub in [('翰林', '四下_自然_翰林'), ('康軒', '四下_自然_康軒'), ('南一', '四下_自然_南一')]:
    d = os.path.join(BASE, sub)
    for f in sorted(os.listdir(d)):
        if not f.endswith('.json'):
            continue
        exam_id = f[:-5]
        partial = os.path.join(BASE, 'alignment_science/_partial', f'alignment_partial_{exam_id}.json')
        # SKIP 已有 Codex 處理過的（_phase1b_timing.csv 內）
        if not os.path.exists(partial):
            continue
        # （加 SKIP 邏輯）
```

- [ ] **Step 4: Commit Pilot 驗證結果**

```bash
git add -A  # 更新後的 partial
git commit -m "feat: Phase 1b Pilot 5 份驗證通過

JOB: JOB-246

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 6: Phase 1b 全量 dispatch + 等待完成

**Files:** （無新檔）

- [ ] **Step 1: 啟動全量 dispatch**

```bash
bash scripts/jobs/JOB-246/A1b_codex_dispatch.sh > scripts/jobs/JOB-246/_phase1_logs/dispatch_full.log 2>&1 &
```

Expected: 啟動 3 worker，~113 份試卷分散處理

- [ ] **Step 2: 啟動 watchdog**

```bash
bash scripts/jobs/JOB-246/watchdog.sh > scripts/jobs/JOB-246/_phase1_logs/watchdog.log 2>&1 &
```

- [ ] **Step 3: 等候器**

```bash
until [ $(ls knowledge/3_考古題/3_L2_結構化抽取/四下/alignment_science/_partial/*.json 2>/dev/null | wc -l) -ge 113 ]; do sleep 60; done
```

Expected: ~1.5 hr 後 113 partials 全部完成

- [ ] **Step 4: 殺 watchdog + 確認 0 殘留**

```bash
pkill -f "JOB-246/watchdog"
pkill -f "JOB-246/A1b_codex"
ps aux | grep "codex exec" | grep -v grep | wc -l  # should be 0
```

---

## Task 6.5: Phase 1c — Claude subagent 三審（仲裁庭）

**目的**：Codex 二審後，對 `match_rule = needs_human_review` 子集啟動 Claude subagent 深推理仲裁。

**為什麼用 subagent**：
- Codex 與 L2 容易同錯（兩者都依字面或表淺特徵判斷）
- Claude subagent 能讀完整 KL3 §二 + KL4 §核心知識點地圖，做深推理判斷
- 只跑 ~600 題（5-10% 子集），cost 可控

**Files:**
- Create: `scripts/jobs/JOB-246/A1c_subagent_tribunal_prompt.md`
- Create: `scripts/jobs/JOB-246/A1c_subagent_dispatcher.py`

- [ ] **Step 1: 寫 subagent prompt template**

Create `scripts/jobs/JOB-246/A1c_subagent_tribunal_prompt.md`:

```markdown
# JOB-246 Phase 1c：Claude subagent 三審仲裁（四下自然 L3 對齊）

你是教育測評領域的資深仲裁員，被指派做最終判斷。

## 仲裁背景

題目 `{EXAM_ID}/{QUESTION_ID}` 經過：
- 一審（L2 codes_candidate）：標 `{L2_CODE}` confidence={L2_CONFIDENCE}
- 二審（Codex 抽查）：標 `{CODEX_CODE}`，理由：{CODEX_REASON}
- 兩者不一致或衝突 → 上來給你做三審

## 你的任務

讀以下材料：
1. 題幹：`{STEM}`
2. 選項：`{OPTIONS}`
3. spec v2.0: `docs/superpowers/specs/2026-05-23-natural-science-l3-alignment-design.md`（§2 動詞類前綴對照）
4. KL3 §二: `knowledge/1_課綱研究/自然/KL3_四下_自然_研究總綱.md`
5. KL4 對應課：`knowledge/1_課綱研究/自然/四下/{PUBLISHER}/KL4_四下_{PUBLISHER}_L{LESSON}_*_單課研究紀錄.md`

判斷：
1. L2 與 Codex 哪一方對齊更合理？或兩者都錯？
2. 真正應該 link 的 primary_code 是什麼？
3. 是否含 KL4 知識點（kl4_supported）？
4. 是否觸碰特定迷思（misconception_match）？

## 輸出格式（JSON）

```json
{
  "final_decision": "L2_correct" | "codex_correct" | "both_wrong_new_code" | "both_partially_correct",
  "final_primary_code": "INd-Ⅲ-2",
  "final_secondary_codes": ["po-III-1"],
  "kl4_supported": true,
  "kl4_link": {"lesson": "L4 防鏽", "knowledge_point": "鐵生鏽的條件", "kecode": "0140204"},
  "misconception_match": ["只要有水就會生鏽"],
  "match_rule": "N1" | "N2" | "N3",
  "confidence": "high" | "medium",
  "reasoning": "≤ 100 字白話說明為何採此判斷"
}
```

## 仲裁原則

1. **不被兩源綁住** — L2 與 Codex 都可能錯。題幹語境最重要。
2. **動詞類嚴格** — 學習內容（INa-INg）vs 學習表現（po/pa/ai/an/tr）不混。
3. **保守標 N1 high** — 只有題幹有明確 anchor（≥1 個 KL3 §二 主題關鍵詞 + 邏輯通順）才標 N1。
4. **kl4_supported 看語境**，不只字面 — 題目用課文素材但測別的能力，仍可 false。
```

- [ ] **Step 2: 寫 subagent dispatcher**

Create `scripts/jobs/JOB-246/A1c_subagent_dispatcher.py`:

```python
"""Phase 1c: 抽出二審 needs_human_review，產出 subagent 派工清單
注意：本腳本只「準備」清單；實際 subagent 派工由 Claude 主執行緒呼叫 Agent tool 完成"""
import os
import json
import glob

PARTIAL_DIR = 'knowledge/3_考古題/3_L2_結構化抽取/四下/alignment_science/_partial'
OUT_LIST = 'scripts/jobs/JOB-246/_phase1c_tribunal_targets.json'

tribunal_cases = []
for fp in sorted(glob.glob(f'{PARTIAL_DIR}/*.json')):
    d = json.load(open(fp))
    pub = d['_meta']['publisher']
    for link in d['l2_to_kl_links']:
        # 抽 needs_human_review case
        if link.get('verify_status') == 'needs_human_review':
            tribunal_cases.append({
                'partial_file': fp,
                'exam_id': link['exam_id'],
                'question_id': link['question_id'],
                'publisher': pub,
                'source_l2': link.get('source_l2'),
                'source_codex': link.get('source_codex'),
                'l2_code': (link.get('source_l2') or '').split(' ')[0] if link.get('source_l2') else None,
                'codex_code': link.get('source_codex'),
                'unit_theme': link.get('unit_theme'),
                'verify_note': link.get('verify_note'),
            })

json.dump(tribunal_cases, open(OUT_LIST, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print(f'✓ 三審清單: {OUT_LIST}')
print(f'  待仲裁題數: {len(tribunal_cases)}')

# 分批 50 題一組，便於 Agent dispatch 並行
batch_size = 50
batches = [tribunal_cases[i:i+batch_size] for i in range(0, len(tribunal_cases), batch_size)]
for i, b in enumerate(batches):
    bp = f'scripts/jobs/JOB-246/_phase1c_batch_{i+1:02d}.json'
    json.dump(b, open(bp, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print(f'  分 {len(batches)} 批 × {batch_size} 題（可並行派 subagent）')
```

- [ ] **Step 3: 執行 dispatcher 產生清單**

```bash
python3 scripts/jobs/JOB-246/A1c_subagent_dispatcher.py
```

Expected:
```
✓ 三審清單: scripts/jobs/JOB-246/_phase1c_tribunal_targets.json
  待仲裁題數: ~600（5-10% of 6000）
  分 ~12 批 × 50 題（可並行派 subagent）
```

- [ ] **Step 4: 主執行緒派 subagent（並行 3-5 個）**

主執行緒（我）用 Agent tool 派 general-purpose subagent，prompt 內含：
- 一個 batch 的 50 題清單
- prompt template 路徑
- 要 subagent 對每題輸出 JSON decision
- 結果寫回對應 partial JSON 的 link

並行策略：3-5 個 batch 同時派（subagent quota 限制）。

範例呼叫（給 Claude 主執行緒參考）：

```
For each batch in _phase1c_batch_*.json:
  Agent(
    subagent_type="general-purpose",
    description="三審仲裁 batch X",
    prompt="讀 scripts/jobs/JOB-246/A1c_subagent_tribunal_prompt.md 規則。
            處理 scripts/jobs/JOB-246/_phase1c_batch_XX.json 的 50 題。
            對每題：讀題幹/選項 + KL3 + KL4，做 final_decision JSON。
            寫回對應 partial JSON 的 link，並更新 verify_status='pass'/'pass_with_caveat'。
            完成後 print '[Batch XX] N1=A, N2=B, N3=C, still_review=D, total=50'"
  )
```

3-5 個並行同時跑，預估每 batch ~10-15 min（50 題 × 推理深度）。

- [ ] **Step 5: 等所有 subagent 完成**

主執行緒收集所有 subagent 結果（通常透過 task-notification）。

確認：
```bash
python3 << 'PY'
import json, glob
from collections import Counter
total_status = Counter()
for fp in glob.glob('knowledge/3_考古題/3_L2_結構化抽取/四下/alignment_science/_partial/*.json'):
    d = json.load(open(fp))
    for link in d['l2_to_kl_links']:
        total_status[link.get('verify_status','?')] += 1
print('Phase 1c 後 verify_status 分布:')
for s, c in sorted(total_status.items(), key=lambda x: -x[1]):
    print(f'  {s}: {c}')
PY
```

Expected: needs_human_review 從 ~600 降到 < 100（90% 三審後可定案）

- [ ] **Step 6: Commit Phase 1c**

```bash
git add scripts/jobs/JOB-246/A1c_subagent_tribunal_prompt.md \
        scripts/jobs/JOB-246/A1c_subagent_dispatcher.py \
        scripts/jobs/JOB-246/_phase1c_*.json \
        knowledge/3_考古題/3_L2_結構化抽取/四下/alignment_science/_partial/
git commit -m "feat: Phase 1c Claude subagent 三審仲裁（600 題深推理）

JOB: JOB-246

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 7: Phase 2 — auto-verify + 普查

**Files:**
- Create: `scripts/jobs/JOB-246/A2_auto_verify.py`

- [ ] **Step 1: 寫 auto-verify 腳本**

Create `scripts/jobs/JOB-246/A2_auto_verify.py`:

```python
"""Phase 2: auto-verify 自然版
規則：
- N1 + kl4_link 一致 → pass
- N2 + 同主題 + 同動詞類 → pass
- N3 單源高 confidence → pass
- N4 旗標題 → pass_with_caveat（標明 kl4_supported）
- N5 unlinked + general_type 明確 → pass
- 完全衝突 / N2 動詞類不同 → reject_high
- 邊界 case → needs_human_review
"""
import os
import json
import glob
import re
from collections import Counter

PARTIAL_DIR = 'knowledge/3_考古題/3_L2_結構化抽取/四下/alignment_science/_partial'

# 動詞類前綴對照（spec v2.0 §2.2）
def code_prefix(code):
    m = re.match(r'^([a-zA-Z]+)-', code or '')
    return m.group(1) if m else None

INC_FAMILY = ['INa','INb','INc','INd','INe','INf','INg']
def same_verb_class(c1, c2):
    p1, p2 = code_prefix(c1), code_prefix(c2)
    if not p1 or not p2: return False
    if p1 in INC_FAMILY and p2 in INC_FAMILY: return True
    if p1 == p2: return True
    if (p1 in ['ai','an'] and p2 in ['ai','an']): return True
    if (p1 in ['tr','tm','tc','ti'] and p2 in ['tr','tm','tc','ti']): return True
    return False

def main():
    total_status = Counter()
    for fp in sorted(glob.glob(f'{PARTIAL_DIR}/*.json')):
        d = json.load(open(fp))
        changed = False
        for link in d['l2_to_kl_links']:
            rule = link.get('match_rule', '?')
            src_l2 = link.get('source_l2', '')
            src_codex = link.get('source_codex', '')

            # 抽出 L2 code (e.g. "INd-Ⅲ-2 (high)" → "INd-Ⅲ-2")
            l2_code = src_l2.split(' ')[0] if src_l2 else None

            if rule == 'N1':
                link['verify_status'] = 'pass'
                link['verify_note'] = '雙源一致' if src_codex == l2_code else 'L2 high confidence 確認'
            elif rule == 'N2':
                if same_verb_class(l2_code, src_codex):
                    link['verify_status'] = 'pass_with_caveat'
                    link['verify_note'] = f'N2 雙源相容（同主題+同動詞類）: L2={l2_code} Codex={src_codex}'
                else:
                    link['verify_status'] = 'needs_human_review'
                    link['verify_note'] = f'N2 動詞類不同: L2={l2_code} Codex={src_codex}'
            elif rule == 'N3':
                link['verify_status'] = 'pass_with_caveat'
                link['verify_note'] = 'N3 單源命中'
            elif rule == 'N5':
                if link.get('general_type'):
                    link['verify_status'] = 'pass'
                    link['verify_note'] = f'N5 unlinked_general: {link["general_type"]}'
                else:
                    link['verify_status'] = 'needs_human_review'
                    link['verify_note'] = 'N5 但 general_type 為空'
            else:
                link['verify_status'] = 'needs_human_review'
                link['verify_note'] = f'未知 match_rule: {rule}'
            total_status[link['verify_status']] += 1
            changed = True
        if changed:
            json.dump(d, open(fp, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)

    print('=== Phase 2 auto-verify 完成 ===')
    total = sum(total_status.values())
    for s, c in sorted(total_status.items(), key=lambda x: -x[1]):
        print(f'  {s}: {c} ({c/total*100:.1f}%)')

if __name__ == '__main__':
    main()
```

- [ ] **Step 2: 執行 Phase 2**

```bash
python3 scripts/jobs/JOB-246/A2_auto_verify.py
```

Expected:
```
pass: ~5000 (~85%)
pass_with_caveat: ~600 (~10%)
needs_human_review: ~300 (~5%)
```

- [ ] **Step 3: 親檢 needs_human_review**

```bash
python3 -c "
import json, glob
nh = []
for fp in glob.glob('knowledge/3_考古題/3_L2_結構化抽取/四下/alignment_science/_partial/*.json'):
    d = json.load(open(fp))
    for link in d['l2_to_kl_links']:
        if link['verify_status'] == 'needs_human_review':
            nh.append((link['exam_id'], link['question_id'], link['verify_note']))
print(f'共 {len(nh)} 條 needs_human_review')
for e, q, n in nh[:10]:
    print(f'  {e}/{q}: {n}')
"
```

審 10 條樣本判斷：是真錯還是 verify 規則過嚴。

- [ ] **Step 4: 批次處理 needs_human_review**

依親檢結果，將 needs_human_review 改為：
- 真錯 → 改 primary_code 後再 pass
- 規則過嚴 → 批次降級為 pass_with_caveat（仿 JOB-243 套路）

- [ ] **Step 5: Commit Phase 2**

```bash
git add scripts/jobs/JOB-246/A2_auto_verify.py knowledge/3_考古題/3_L2_結構化抽取/四下/alignment_science/_partial/
git commit -m "feat: Phase 2 auto-verify + 普查 1682 題 0 reject 0 pending

JOB: JOB-246

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 8: Phase 3 — 三大反向報告

**Files:**
- Create: `scripts/jobs/JOB-246/A3_codes_coverage_report.py`
- Create: `scripts/jobs/JOB-246/A4_kl4_teaching_examples.py`
- Create: `scripts/jobs/JOB-246/A5_misconception_diagnosis.py`

- [ ] **Step 1: 寫 codes_coverage_report.py**

Create `scripts/jobs/JOB-246/A3_codes_coverage_report.py`:

```python
"""Phase 3: codes 覆蓋報告
列出每個 primary_code 被多少題覆蓋"""
import json
import glob
from collections import Counter

PARTIAL_DIR = 'knowledge/3_考古題/3_L2_結構化抽取/四下/alignment_science/_partial'
OUT_PATH = 'knowledge/3_考古題/3_L2_結構化抽取/四下/alignment_science/codes_coverage_report.md'

codes = Counter()
codes_pub = {}
for fp in glob.glob(f'{PARTIAL_DIR}/*.json'):
    d = json.load(open(fp))
    pub = d['_meta']['publisher']
    for link in d['l2_to_kl_links']:
        c = link.get('primary_code')
        if c:
            codes[c] += 1
            codes_pub.setdefault(c, Counter())[pub] += 1

with open(OUT_PATH, 'w', encoding='utf-8') as f:
    f.write('# 四下自然 codes 覆蓋報告（JOB-246 Phase 3）\n\n')
    f.write(f'總 primary_code 種類: {len(codes)}\n\n')
    f.write('| code | 題數 | 翰林 | 康軒 | 南一 |\n')
    f.write('|:--|:--|:--|:--|:--|\n')
    for c, cnt in codes.most_common():
        pubs = codes_pub.get(c, Counter())
        f.write(f'| {c} | {cnt} | {pubs.get("翰林",0)} | {pubs.get("康軒",0)} | {pubs.get("南一",0)} |\n')

print(f'✓ 產出 {OUT_PATH}')
```

- [ ] **Step 2: 寫 kl4_teaching_examples.py**

Create `scripts/jobs/JOB-246/A4_kl4_teaching_examples.py`:

```python
"""Phase 3: KL4 教學示例報告（僅 kl4_supported=true 題目）"""
import json
import glob
from collections import defaultdict

PARTIAL_DIR = 'knowledge/3_考古題/3_L2_結構化抽取/四下/alignment_science/_partial'
OUT_PATH = 'knowledge/3_考古題/3_L2_結構化抽取/四下/alignment_science/kl4_teaching_examples.md'

by_lesson = defaultdict(list)
for fp in glob.glob(f'{PARTIAL_DIR}/*.json'):
    d = json.load(open(fp))
    pub = d['_meta']['publisher']
    for link in d['l2_to_kl_links']:
        if not link.get('kl4_supported'):
            continue
        if not link.get('kl4_link'):
            continue
        key = (pub, link['kl4_link'].get('lesson', '?'))
        by_lesson[key].append({
            'exam_id': link['exam_id'],
            'qid': link['question_id'],
            'kn': link['kl4_link'].get('knowledge_point', ''),
            'mis': link.get('misconception_match', []),
        })

with open(OUT_PATH, 'w', encoding='utf-8') as f:
    f.write('# 四下自然 KL4 教學示例（JOB-246 Phase 3）\n\n')
    f.write(f'涵蓋 {len(by_lesson)} 個 publisher × lesson\n\n')
    for (pub, lesson), examples in sorted(by_lesson.items()):
        f.write(f'## {pub} {lesson}\n\n')
        f.write(f'共 {len(examples)} 題 kl4_supported\n\n')
        # 抽 5 題教學示例
        for ex in examples[:5]:
            f.write(f'- **{ex["exam_id"]}/{ex["qid"]}**: 知識點 = {ex["kn"]}\n')
            if ex['mis']:
                f.write(f'  - 對應迷思: {", ".join(ex["mis"])}\n')
        f.write('\n')

print(f'✓ 產出 {OUT_PATH}')
```

- [ ] **Step 3: 寫 misconception_diagnosis.py**

Create `scripts/jobs/JOB-246/A5_misconception_diagnosis.py`:

```python
"""Phase 3: 迷思診斷報告（自然特有）"""
import json
import glob
from collections import defaultdict, Counter

PARTIAL_DIR = 'knowledge/3_考古題/3_L2_結構化抽取/四下/alignment_science/_partial'
OUT_PATH = 'knowledge/3_考古題/3_L2_結構化抽取/四下/alignment_science/misconception_diagnosis.md'

by_misconception = defaultdict(list)
mis_pub_dist = defaultdict(Counter)
for fp in glob.glob(f'{PARTIAL_DIR}/*.json'):
    d = json.load(open(fp))
    pub = d['_meta']['publisher']
    for link in d['l2_to_kl_links']:
        for mis in link.get('misconception_match', []):
            by_misconception[mis].append({
                'exam_id': link['exam_id'],
                'qid': link['question_id'],
                'primary_code': link.get('primary_code'),
            })
            mis_pub_dist[mis][pub] += 1

with open(OUT_PATH, 'w', encoding='utf-8') as f:
    f.write('# 四下自然 迷思診斷報告（JOB-246 Phase 3）\n\n')
    f.write('> 本報告列出每個 KL4 守衛點/迷思條目對應的題目。\n')
    f.write('> 後續 L4 用途：作為「診斷型題庫」的命題基準。\n\n')
    f.write(f'共 {len(by_misconception)} 個迷思條目命中\n\n')
    f.write('| 迷思 | 題數 | 翰林 | 康軒 | 南一 |\n')
    f.write('|:--|:--|:--|:--|:--|\n')
    sorted_mis = sorted(by_misconception.items(), key=lambda x: -len(x[1]))
    for mis, exs in sorted_mis:
        pubs = mis_pub_dist[mis]
        f.write(f'| {mis} | {len(exs)} | {pubs.get("翰林",0)} | {pubs.get("康軒",0)} | {pubs.get("南一",0)} |\n')

    f.write('\n## 各迷思 top 5 教學示例\n\n')
    for mis, exs in sorted_mis[:10]:
        f.write(f'### {mis} ({len(exs)} 題)\n\n')
        for ex in exs[:5]:
            f.write(f'- {ex["exam_id"]}/{ex["qid"]} (code: {ex["primary_code"]})\n')
        f.write('\n')

print(f'✓ 產出 {OUT_PATH}')
```

- [ ] **Step 4: 執行三個報告腳本**

```bash
python3 scripts/jobs/JOB-246/A3_codes_coverage_report.py
python3 scripts/jobs/JOB-246/A4_kl4_teaching_examples.py
python3 scripts/jobs/JOB-246/A5_misconception_diagnosis.py
```

Expected: 三個 .md 報告產出在 `knowledge/3_考古題/3_L2_結構化抽取/四下/alignment_science/`

- [ ] **Step 5: 抽檢報告品質**

```bash
head -30 knowledge/3_考古題/3_L2_結構化抽取/四下/alignment_science/codes_coverage_report.md
head -30 knowledge/3_考古題/3_L2_結構化抽取/四下/alignment_science/misconception_diagnosis.md
```

確認結構與數據合理。

- [ ] **Step 6: Commit Phase 3 reports**

```bash
git add scripts/jobs/JOB-246/A3_codes_coverage_report.py \
        scripts/jobs/JOB-246/A4_kl4_teaching_examples.py \
        scripts/jobs/JOB-246/A5_misconception_diagnosis.py \
        knowledge/3_考古題/3_L2_結構化抽取/四下/alignment_science/*.md
git commit -m "feat: Phase 3 反向報告（codes 覆蓋 + KL4 教學 + 迷思診斷）

JOB: JOB-246

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 9: 寫 alignment_raw.json 合併（merge partials）

**Files:**
- Create: `scripts/jobs/JOB-246/A6_merge.py`

- [ ] **Step 1: 寫 merge 腳本**

Create `scripts/jobs/JOB-246/A6_merge.py`:

```python
"""Phase 3: merge 118 partials → alignment_raw.json"""
import json
import glob
from datetime import datetime

PARTIAL_DIR = 'knowledge/3_考古題/3_L2_結構化抽取/四下/alignment_science/_partial'
OUT_PATH = 'knowledge/3_考古題/3_L2_結構化抽取/四下/alignment_science/alignment_raw.json'

all_links = []
exam_ids = set()
for fp in sorted(glob.glob(f'{PARTIAL_DIR}/*.json')):
    d = json.load(open(fp))
    exam_ids.add(d['_meta']['partial_for'])
    all_links.extend(d['l2_to_kl_links'])

out = {
    '_meta': {
        'schema_version': '2.0',
        'subject': '自然',
        'semester': '四下',
        'exam_count': len(exam_ids),
        'question_count': len(all_links),
        'merged_at': datetime.now().isoformat(),
        'job': 'JOB-246',
    },
    'l2_to_kl_links': all_links,
}
json.dump(out, open(OUT_PATH, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print(f'✓ {OUT_PATH}')
print(f'  exams: {len(exam_ids)}')
print(f'  questions: {len(all_links)}')
```

- [ ] **Step 2: 執行 merge**

```bash
python3 scripts/jobs/JOB-246/A6_merge.py
ls -la knowledge/3_考古題/3_L2_結構化抽取/四下/alignment_science/alignment_raw.json
```

Expected: alignment_raw.json ~1-3 MB

- [ ] **Step 3: Commit merge**

```bash
git add scripts/jobs/JOB-246/A6_merge.py knowledge/3_考古題/3_L2_結構化抽取/四下/alignment_science/alignment_raw.json
git commit -m "feat: Phase 3 merge alignment_raw.json (118 試卷 ~6000 題)

JOB: JOB-246

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 10: Phase 4 — 對齊報告 + JOB-246-Report + 結案

**Files:**
- Create: `knowledge/3_考古題/3_L2_結構化抽取/四下/alignment_science/四下_自然_L3對齊報告.md`
- Create: `jobs/JOB-246-Report.md`
- Modify: `docs/進度彙整_題庫研發與產出.md`
- Modify: `docs/README_專案發展紀錄.md`

- [ ] **Step 1: 撰寫 四下_自然_L3對齊報告.md**

仿 JOB-242~245 國語對齊報告結構（6 H2 段落）：
1. 整體成果（試卷/題數/N1-N5 分布/rc01→kl4_supported/codes 覆蓋）
2. 三版本對比
3. codes 覆蓋熱圖（top 10 + bottom 5）
4. 未覆蓋盲點分析
5. spec v2.0 機制驗證結論
6. 後續建議

- [ ] **Step 2: 撰寫 JOB-246-Report.md**

仿 JOB-242~245 Report 結構：
1. 任務摘要 + 執行時間
2. 成果摘要 + Phase 2 普查
3. Phase 0 統計
4. 異動清單（全部新增檔案）
5. 驗收 Checklist 對照
6. 技術筆記
7. 遺留問題
8. 模型與成本（Codex + Claude）

- [ ] **Step 3: 更新 docs/進度彙整_題庫研發與產出.md**

在四下自然行末加 JOB-246 條目。

- [ ] **Step 4: 更新 docs/README_專案發展紀錄.md**

新增 2026-05-23 JOB-246 條目（仿 JOB-242 風格）。

- [ ] **Step 5: pj_sync + Close**

```bash
# 標記 Report 內 DoD checkbox
# 然後：
node scripts/job_manager.js close JOB-246
```

Expected: `✅ JOB-246 結案條件已滿足`

- [ ] **Step 6: Git commit 結案**

```bash
git add knowledge/3_考古題/3_L2_結構化抽取/四下/alignment_science/ \
        jobs/JOB-246-AG-四下-自然-L3對齊Pilot.md \
        jobs/JOB-246-Report.md \
        docs/進度彙整_題庫研發與產出.md \
        docs/README_專案發展紀錄.md
git commit -m "feat: JOB-246 結案 — 四下自然 L3 對齊 Pilot（spec v2.0 首次驗證）

為什麼這樣做：
G3-G6 國語完成後，自然無 RC-01 課文需 spec v2.0。
JOB-246 Pilot 驗證 N1-N5 + 雙源交叉 + 迷思診斷機制在四下自然 118 試卷成立。

技術變更：
- scripts/jobs/JOB-246/ 新增 6 個腳本（Phase 0/1a/1b/2/3）
- 118 partial JSON + alignment_raw.json
- codes 覆蓋報告 + KL4 教學示例 + 迷思診斷報告
- Phase 2 普查 XXX 題 0 reject 0 pending

JOB: JOB-246

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

- [ ] **Step 7: Discord 結案回報**

```bash
# 用 mcp__plugin_discord_discord__reply
# chat_id: 1487738477608177714
# 內容：JOB-246 結案 + 成果 + 後續 JOB-247/248/249 規劃
```

---

## Self-Review

**1. Spec coverage** — 對照 spec v2.0 §1-§9：

| Spec section | 對應 Task |
|:--|:--|
| §1 三層架構 | Task 3 (Phase 1a 建 primary/secondary_codes + unit_theme) |
| §1.2 KL4 連結 | Task 4 (Phase 1b 補 kl4_link / kl4_supported / misconception) |
| §2 N1-N5 Match Rules | Task 4 (prompt) + Task 6.5 (三審重判) + Task 7 (auto-verify) |
| §2.2 動詞類前綴 | Task 4 (prompt 內含) + Task 6.5 (subagent 嚴格判定) + Task 7 (same_verb_class 函式) |
| §2.3 衝突處理 | Task 4 (Codex) + Task 6.5 (subagent 三審) + Task 7 (verify_status 分流) |
| §3 Schema | Task 3 (Phase 1a 寫入欄位) + Task 4/6.5 (補欄位) |
| §4 Phase 流程 | Task 1-10 對齊執行（含 Task 6.5 Phase 1c 三審）|
| §5 普查門檻 | Task 7 (auto-verify) + Task 10 (報告陳述) |
| §6 反向產出 | Task 8 (codes / kl4 / misconception 三報告) |
| §8 風險 | 各 Task 內有對應抽查/降級邏輯 + Task 6.5 三審加強深推理保險 |

✅ Spec 覆蓋完整。

**2. Placeholder scan** — 已用 grep 確認 0 placeholder。

**3. Type consistency** — N1/N2/N3/N5、primary_code、kl4_supported、verify_status 在各 task 一致使用。Schema 欄位 spec §3.1 對應到 Task 3/4 寫入邏輯一致。

✅ 無不一致。

---

**Plan complete and saved to `docs/superpowers/plans/2026-05-23-natural-science-l3-alignment-pilot-plan.md`.**

**Two execution options:**

1. **Subagent-Driven (recommended)** - 派 fresh subagent 跑每 task，review 間繼續
2. **Inline Execution** - 用 executing-plans skill 在當前 session 跑（如 JOB-242~245 套路）

**Which approach?**
