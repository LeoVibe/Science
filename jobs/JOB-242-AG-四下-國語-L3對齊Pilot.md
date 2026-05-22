*Created by Claude Code (claude-opus-4-7) at 2026-05-20 08:50*

`last_updated`: 2026-05-20 08:50
`updated_by`: Claude Code (claude-opus-4-7)

# JOB-242-AG-四下_國語-L3對齊Pilot

**`job_type`**：`research`
**`executor`**：Codex CLI gpt-5.5（Phase 1/3 自動對齊執行）+ Claude Sonnet 4.6 / Opus 4.7（Phase 0 規格設計、Phase 2 普查複檢、Phase 4 Report 親寫）
**`parent_jobs`**：JOB-238（四下_國語 L2 抽取）+ KL3/KL4 既有國語研究

> ⚠️ **重要**：本派工單為 **L3 對齊機制 Pilot**（後續 11 cells 沿用此規格）。
> ⚠️ **複檢採普查（census），非抽樣**。Claude 必須對 121 份 L2 對齊結果逐份過目並標記 `verify_status`，不可只抽 10/20 份代表整體。
> ⚠️ **本派工單必須 self-contained**：即使 session 清空（pj_memory + compact 後），下一輪 Agent 讀本派工單應能完整接手。

---

## 📌 任務背景（self-contained，不靠對話脈絡）

### 為什麼有本 JOB

Eidos 專案至 2026-05-20 累積：
- **L2 結構化抽取**：G3-G6 × 國/自/社 共 **12 cells / 1,372 份 / 28,538+ 題**（JOB-228~241），每題已 link `codes_candidate`（108 課綱 codes）。
- **KL3 課綱研究**：分年級科目發展綱要，定義「課次 × 命題能力」。
- **KL4 單課研究**：每課一份「單課研究紀錄」+「考古題與討論」，**國語含完整課文 RC-01**。
- **題庫 platform**：`question/platform/` 下既有 QL1-QL5 題目。

**目前問題**：L2、KL3/KL4、platform 三者是孤島，沒有索引串接。

**本 JOB 解決**：建立 **L2 ↔ KL3/KL4 對齊機制**，先以 **四下_國語**（KL3+KL4 最完整、有課文 RC-01）試做 Pilot。Pilot 驗證後規格化推 11 cells（4 年級 × 3 科 - 1 pilot = 11）。

### 為什麼選四下_國語做 Pilot

| 條件 | 為什麼選四下_國語 |
|:--|:--|
| KL3 完備 | ✅ `KL3_四下_國語_研究總綱.md` 含三版本 36 課 |
| KL4 完備 | ✅ 翰林/康軒/南一 各 ~12 課，每課 2 份（單課研究 + 考古題與討論） |
| **有課文 RC-01** | ✅ KL4 單課研究含完整課文（國語特有優勢，社/自不保證有） |
| L2 完整 | ✅ JOB-238 完成 121 份 / 7562 題 / 100% 合法率 |
| 題庫已 QL5 | ✅ 360/360 題（含 scenario+explanation），可順便驗證 L4↔platform 對齊機制 |
| JOB 經驗最新 | JOB-238 5 天前剛完成（2026-05-18） |

### 戰略意義

本 Pilot 解鎖兩條路徑：
1. **正向**：KL3/KL4 → L2 → 知道「我們的課綱研究是否被考古題印證」、「哪些課次出題少（出題建議優先序）」
2. **反向**：L2 → KL3/KL4 → 知道「考古題實際在考什麼」、「現有教材是否覆蓋足夠」

---

## 🎯 任務目標

1. **Phase 0 規格設計**：定義 `L3_alignment_spec_v1.md`（後續 11 cells reuse）
2. **Phase 1 自動對齊**：Codex 寫對齊腳本 + 跑 121 份 L2 → 產出 `alignment_raw.json`
3. **Phase 2 普查複檢**：Claude 逐份過目 121 份對齊結果，標記 `verify_status: pass/correct/reject`，產出 `alignment_verified.json`
4. **Phase 3 反向產出**：Codex 產出 KL3 視角報告 + KL4 視角報告
5. **Phase 4 對齊報告 + Report**：整合 Phase 0-3 產出，Claude 親寫 JOB-242-Report.md

---

## 🚧 任務邊界

**只做**：
- 四下_國語 1 cell 對齊（121 份 L2 × 36 課 KL3/KL4）
- 對齊 schema v1 設計（為後續 11 cells 鋪路）
- Pilot 驗證

**不做**：
- 其他年級/科目（待 Pilot 驗證後規模化）
- 修改 L2/KL3/KL4 既有產出（**只「新建」對齊檔，不動原始**）
- 題目重寫/升 QL
- platform 既有題目對齊（L4↔platform 屬於 Phase 5+，本 JOB 不做）

---

## 📜 輸入素材清單（精確路徑）

### A. L2 結構化抽取（121 份）

```
knowledge/3_考古題/3_L2_結構化抽取/
├── _golden_samples/四下_國語_翰林_108_永光國小_第三次段考.json (43 題)
├── 四下/四下_國語_pilot/*.json (5 份)
├── 四下/四下_國語_翰林/*.json (38 份)
├── 四下/四下_國語_康軒/*.json (47 份)
└── 四下/四下_國語_南一/*.json (30 份)
```

每份 schema：
- `_meta.exam_id`, `_meta.publisher`, `_meta.academic_year`
- `questions[].question_id`, `.stem`, `.codes_candidate[].code/reason/trace`

### B. KL3 課綱研究（1 主檔 + 3 版本子檔可選）

```
knowledge/1_課綱研究/國語/四下/
└── KL3_四下_國語_研究總綱.md     # 主檔，含康軒 12 + 翰林 12 + 南一 12 = 36 課
```

每課關鍵欄位：**版本、課次（L1-L12）、課程名稱、單元主題、L4+ 研發關鍵點**

### C. KL4 單課研究（36 課 × 2 份 = 72 份）

```
knowledge/1_課綱研究/國語/四下/
├── 翰林/KL4_四下_翰林_L1_稻間鴨_單課研究紀錄.md   # 含課文 RC-01
├── 翰林/KL4_四下_翰林_L1_稻間鴨_考古題與討論.md
├── 康軒/KL4_四下_康軒_L1_*_單課研究紀錄.md
├── 康軒/KL4_四下_康軒_L1_*_考古題與討論.md
└── 南一/KL4_四下_南一_L1_*_單課研究紀錄.md
```

每份「單課研究紀錄」關鍵欄位：
- **課碼**（如 `0140201`，格式 `0{年級}{學期}{版本碼}{課次}`）
- **KL3 錨點**（如 `kl3-0140201-84aa3faf96`）
- **RC-01 課文全文**（國語特有）
- 文體分類、文本結構、認知核心

### D. 合法 codes（reference，不修改）

```
knowledge/3_考古題/3_L2_結構化抽取/_meta/chinese_codes_legal_II.json  # 61 條
```

---

## 🔧 Phase 0：對齊 Schema 設計（Claude 親做，必做）

### 0.1 對齊 schema v1 定義（寫入 `docs/L3_alignment_spec_v1.md`）

定義以下 4 種對齊關係：

#### A. L2.question → KL3.課次（粗粒度，主對齊）

```yaml
relation: l2_question_to_kl3_lesson
match_rules:
  R1_explicit_quote:
    pattern: "依據《(.+?)》一?文|根據(.+?)一文"
    confidence: high
    example: "依據五月．風箏．少年一文" → 對齊到康軒 L5「五月．風箏．少年」（假設）
  
  R2_课文标题_keyword:
    pattern: codes_candidate.reason 含課程名稱（≥3 字連續匹配）
    confidence: medium
  
  R3_general_question:
    pattern: 題型為「改錯字」「字音字形」「標點符號」等通用題型，無特定課文
    confidence: none
    action: mark as `unlinked_general`
  
  R4_cross_lesson:
    pattern: 題目涉及多課（如閱讀測驗類整合課程）
    confidence: medium
    action: 允許 link 多 KL3 課次（用陣列）
```

#### B. L2.question → KL4.課碼（細粒度，繼承自 A）

```yaml
relation: l2_question_to_kl4_kecode
match_rules:
  從 A 衍生：若 L2 已 link KL3.課次 → 自動 link 到該課 KL4 課碼
  補充：若題幹引用 KL4.RC-01 內字句（≥5 字連續），標 `rc01_evidence: true`
```

#### C. KL3.課次 → L2.questions（反向，覆蓋率）

```yaml
relation: kl3_lesson_to_l2_questions
每課輸出:
  - linked_question_count: int
  - linked_question_ids: list
  - linked_codes: dict {code: count}
  - cognitive_level_distribution: dict {層次: count}
  - misconception_topics: list
```

#### D. KL4.課碼 → L2.questions（反向，教學現場）

```yaml
relation: kl4_kecode_to_l2_questions
每課輸出:
  - linked_questions: list
  - rc01_evidence_count: int  # 國語特有
  - teaching_examples: list (從 linked_questions 挑 3-5 個代表)
```

### 0.2 輸出檔案結構規範

```yaml
alignment_raw.json (Codex 產出):
  _meta:
    schema_version: "1.0"
    pilot_scope: "四下_國語"
    extracted_at: ISO
    extractor: "Codex (gpt-5.5) - JOB-242 Phase 1"
    
  l2_to_kl_links:
    - exam_id: "翰林_108_..."
      question_id: "Q3.7"
      kl3_links:
        - publisher: "翰林"
          lesson: "L11"
          lesson_title: "最後一片葉子"
          confidence: "high"
          match_rule: "R1_explicit_quote"
          evidence: "題幹引用《最後一片葉子》"
      kl4_links:
        - kecode: "0140211"   # 衍生自 kl3_links
          kl3_anchor: "kl3-0140211-..."
          rc01_evidence: false
      verify_status: "pending"   # Phase 2 由 Claude 填
      verify_note: null

  kl3_to_l2_coverage:
    - publisher: "翰林"
      lesson: "L1"
      lesson_title: "稻間鴨"
      linked_question_count: 12
      linked_question_ids: ["翰林_108_...:Q3.1", ...]
      linked_codes: {"4-Ⅱ-7": 3, "Bc-Ⅱ-2": 2, ...}
      cognitive_level_distribution: {"理解": 5, "分析": 4, ...}
  
  kl4_to_l2_examples:
    - kecode: "0140211"
      lesson_title: "最後一片葉子"
      linked_questions:
        - exam_id: ..., question_id: ..., stem_preview: "...", rc01_evidence: true
      rc01_evidence_count: 4
```

### 0.3 schema v1 self-review checklist

寫完 spec 後 Claude 自我檢查：
- [ ] 4 種對齊關係 schema 都有明確定義
- [ ] match_rules 都有具體 example
- [ ] 對 unlinked_general 有處理規則
- [ ] 對 cross_lesson 有處理規則
- [ ] 輸出 JSON schema 含 verify_status 欄位（給 Phase 2 用）

---

## 🤖 Phase 1：Codex 自動對齊（普查 121 份）

### 1.1 Codex prompt template（寫入 `scripts/jobs/JOB-242/A1_align_prompt.md`）

```markdown
# JOB-242 Phase 1: L2 ↔ KL3/KL4 自動對齊

你是 Codex，負責對 四下_國語 121 份 L2 JSON 做自動對齊。

## 任務輸入
- 規格：`docs/L3_alignment_spec_v1.md`（必讀）
- L2 JSON 集：見任務描述路徑（121 份）
- KL3 主檔：`knowledge/1_課綱研究/國語/四下/KL3_四下_國語_研究總綱.md`
- KL4 36 份：`knowledge/1_課綱研究/國語/四下/{翰林,康軒,南一}/KL4_*.md`

## 任務輸出
寫入 `knowledge/3_考古題/3_L2_結構化抽取/四下/alignment/alignment_raw.json`
schema 嚴格遵守 `L3_alignment_spec_v1.md` §0.2

## 強制規則
1. **逐題對齊** 121 × 平均 60 題 ≈ 7,200 題，**不可抽樣**
2. **match_rule 必填**，標明來自 R1/R2/R3/R4
3. **confidence 必填**：high/medium/low/none
4. **unlinked_general** 也要列出（不可省略），以便 Phase 2 確認
5. **evidence 必填**：對 R1/R2 須引用具體題幹字串，對 R3 標 "general_type"
6. **verify_status: "pending"** 全部填 pending（Phase 2 由 Claude 改）

## 自查清單（產出前必跑）
- [ ] 每份 L2 JSON 都有處理（不漏份）
- [ ] 每題都在 l2_to_kl_links 出現（含 unlinked_general）
- [ ] kl3_to_l2_coverage 涵蓋全 36 課
- [ ] kl4_to_l2_examples 涵蓋全 36 課碼
- [ ] JSON 用 python3 -c "import json; json.load(open('...'))" 驗證可解析

## 執行步驟
1. 讀 spec
2. 讀 KL3 主檔，建立「版本 × 課次 → 課程名稱 / 課碼 / KL3 錨點」index
3. 逐 L2 JSON 處理：
   a. 對每題依 R1→R2→R3→R4 順序匹配
   b. R1 命中即停（high）
   c. R2 命中且 confidence ≥ medium 才採用
   d. 無命中標 R3 unlinked_general
4. 反向統計建 kl3_to_l2_coverage 與 kl4_to_l2_examples
5. 輸出 alignment_raw.json
```

### 1.2 dispatch 腳本（`scripts/jobs/JOB-242/A2_run_phase1.sh`）

```bash
#!/bin/bash
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$ROOT"

LOG="scripts/orchestrator-logs/JOB-242-phase1.log"
mkdir -p knowledge/3_考古題/3_L2_結構化抽取/四下/alignment scripts/orchestrator-logs

PROMPT=$(cat scripts/jobs/JOB-242/A1_align_prompt.md)
echo "[$(date '+%H:%M:%S')] 啟動 Phase 1 自動對齊"
codex exec --skip-git-repo-check --full-auto "$PROMPT" > "$LOG" 2>&1
EXIT=$?
echo "[$(date '+%H:%M:%S')] Phase 1 exit=$EXIT"

OUT="knowledge/3_考古題/3_L2_結構化抽取/四下/alignment/alignment_raw.json"
if [ -f "$OUT" ]; then
  echo "✅ 產出檔案: $OUT"
  python3 -c "
import json
d = json.load(open('$OUT'))
print(f'l2_to_kl_links 筆數: {len(d[\"l2_to_kl_links\"])}')
print(f'kl3_to_l2_coverage 課數: {len(d[\"kl3_to_l2_coverage\"])}')
print(f'kl4_to_l2_examples 課碼數: {len(d[\"kl4_to_l2_examples\"])}')
"
else
  echo "❌ 未產出"
fi
```

### 1.3 Phase 1 驗收條件

- [ ] `alignment_raw.json` 產出
- [ ] JSON 可被 python json.load 解析
- [ ] `l2_to_kl_links` 筆數 ≥ 7,000（121 × 平均 60 題）
- [ ] `kl3_to_l2_coverage` 含 36 課（康軒 12 + 翰林 12 + 南一 12）
- [ ] `kl4_to_l2_examples` 含 36 課碼
- [ ] 無 verify_status 為非 "pending" 值

---

## 👁️ Phase 2：Claude 普查複檢（121 份逐份過目）

> ⚠️ **普查（census）：必須對 121 份 L2 對齊結果逐份過目**。不可只抽樣，因為 Pilot 的 verify rate 將決定後續 11 cells 是否要用同樣機制。

### 2.1 普查方法

**Claude 對每份 L2 JSON 做以下檢查**：

對 `alignment_raw.json` 中該 exam_id 下所有 question 的對齊結果：

```yaml
per_question_check:
  - 對 confidence=high 的 link：
    - 確認 evidence 確實在題幹中存在
    - 確認 lesson_title 確實對應該課程
    - PASS → verify_status = "pass"
    - 不符 → verify_status = "reject_high"
  
  - 對 confidence=medium 的 link：
    - 確認 reason 合理（reason 不空泛）
    - PASS → verify_status = "pass"
    - 可疑但保留 → verify_status = "pass_with_caveat"
    - 明顯錯 → verify_status = "reject_medium"
  
  - 對 unlinked_general（R3）：
    - 確認該題確實是通用題型（無課文連結）
    - PASS → verify_status = "pass"
    - 應該有對齊但被漏 → verify_status = "missed_should_link"
  
  - 對 cross_lesson（R4）：
    - 確認多 link 合理（非過度連結）
    - verify_status = "pass" or "reject_overlinked"
```

### 2.2 普查執行步驟

```python
# Claude 執行（每份 L2 JSON 一份 review）
for each_exam_id in alignment_raw["l2_to_kl_links"]:
    1. 讀該 exam 的 L2 JSON（原始題目）
    2. 對該 exam 的每題對齊結果做 per_question_check
    3. 更新 verify_status + verify_note（如果有問題）
    4. 累計該 exam 的 verify 統計：
       - total_questions
       - pass_count
       - reject_count
       - missed_count
    5. 寫入 alignment_verified.json
```

### 2.3 普查產出

寫入 `knowledge/3_考古題/3_L2_結構化抽取/四下/alignment/alignment_verified.json`：

schema 與 `alignment_raw.json` 相同，但：
- 所有 `verify_status` 已從 "pending" 改為實際值
- 增加 `verify_note` 欄位（reject/caveat 必填）
- 增加 `_verify_meta`：
  ```yaml
  _verify_meta:
    verifier: "Claude Opus 4.7"
    verified_at: ISO
    total_files_reviewed: 121
    total_questions_reviewed: <int>
    pass_count: <int>
    pass_with_caveat_count: <int>
    reject_high_count: <int>
    reject_medium_count: <int>
    reject_overlinked_count: <int>
    missed_should_link_count: <int>
    accuracy_high_confidence: <pct%>
    accuracy_medium_confidence: <pct%>
    overall_accuracy: <pct%>
  ```

### 2.4 Phase 2 驗收條件

- [ ] `alignment_verified.json` 產出
- [ ] **121 份全數逐份 review**（_verify_meta.total_files_reviewed == 121）
- [ ] 無 `verify_status: "pending"` 殘留
- [ ] high confidence accuracy ≥ 90%（pilot 容忍度）
- [ ] 對 reject 條目均填 verify_note 說明原因

---

## 🔄 Phase 3：Codex 反向產出（KL3/KL4 視角）

依 Phase 2 已驗證的對齊結果，產出兩份報告：

### 3.1 KL3 視角報告

寫入 `knowledge/3_考古題/3_L2_結構化抽取/四下/alignment/kl3_coverage_report.md`

內容包含（每課一節）：

```markdown
## 翰林 L1 稻間鴨 (課碼 0140201)

- **被引用題目數**：12 題（來自 8 份試卷）
- **引用 codes 分布**：
  - 4-Ⅱ-7（生態與環境）×4
  - Bc-Ⅱ-2（語感與雙關）×3
- **認知層次**：理解(5) > 分析(4) > 應用(2) > 記憶(1)
- **常見命題方向**：
  - 「鴨子作用辨識」(3 題)
  - 「擬人手法理解」(4 題)
  - 「課文主旨歸納」(5 題)
- **未覆蓋的 KL3 命題重點**：
  - L4+ 研發關鍵點「生態鏈循環」尚無題目印證
```

### 3.2 KL4 視角報告

寫入 `knowledge/3_考古題/3_L2_結構化抽取/四下/alignment/kl4_teaching_examples.md`

內容包含（每課一節）：

```markdown
## 翰林 L1 稻間鴨 (課碼 0140201)

- **教學現場示例題（從 12 題挑 3-5 題）**：
  1. [exam:翰林_108_海佃國小:Q3.1] 題幹預覽... → 訓練「擬人手法」
- **RC-01 課文引用題（國語特有指標）**：4 題
- **建議教學運用**：可在「綠田金黃稻穗」段落後，引用題目 X 做形成性評量
```

### 3.3 Phase 3 驗收

- [ ] 兩份 MD 產出
- [ ] KL3 coverage report 含 36 課
- [ ] KL4 teaching examples report 含 36 課碼

---

## 📝 Phase 4：對齊報告 + JOB-242-Report

### 4.1 對齊總報告（Codex 產 draft → Claude 親寫定稿）

寫入 `knowledge/3_考古題/3_L2_結構化抽取/四下/四下_國語_L3對齊報告.md`

包含 6 H2 段落：
1. **整體成果**（121 份 / N 題 / 對齊覆蓋率 / accuracy）
2. **三版本對比**（康軒/翰林/南一 各自的對齊統計）
3. **KL3 課次覆蓋熱圖**（36 課中哪些高頻、哪些低頻）
4. **未覆蓋盲點分析**（KL3 L4+ 研發關鍵點 vs 實際題目分布）
5. **schema v1 機制驗證結論**（適用其他 11 cells 的可行性 + 待調整項）
6. **後續建議**（規模化 11 cells 的優先序）

### 4.2 JOB-242-Report.md（Claude 親寫）

依 JOB-241-Report.md 格式，含：
- 任務摘要
- 執行時間回報
- 成果數字（含 _verify_meta 全數據）
- 驗收 Checklist（普查標準）
- 異動清單
- 技術筆記（schema 設計經驗）
- 遺留問題
- 模型與成本

---

## ✅ 啟動 Checklist (Pre-Flight)

- [ ] `docs/L3_alignment_spec_v1.md` 已存在
- [ ] `scripts/jobs/JOB-242/` 目錄已建立
- [ ] `scripts/jobs/JOB-242/A1_align_prompt.md` 已寫入
- [ ] `scripts/jobs/JOB-242/A2_run_phase1.sh` 已寫入並 chmod +x
- [ ] 已確認執行模型：Codex CLI gpt-5.5（Phase 1/3）+ Claude Opus 4.7（Phase 0/2/4）
- [ ] 預算：ChatGPT 訂閱（無單次計費）

---

## ✅ 驗收 Checklist (Acceptance)

### Phase 0 規格
- [ ] `docs/L3_alignment_spec_v1.md` 完成（含 4 種對齊關係 + match_rules + JSON schema）
- [ ] schema self-review checklist 過

### Phase 1 自動對齊
- [ ] `alignment_raw.json` 產出
- [ ] `l2_to_kl_links` ≥ 7,000 筆
- [ ] `kl3_to_l2_coverage` 含 36 課
- [ ] `kl4_to_l2_examples` 含 36 課碼

### Phase 2 普查複檢（**核心，必須普查**）
- [ ] `alignment_verified.json` 產出
- [ ] **`_verify_meta.total_files_reviewed == 121`**（普查不漏份）
- [ ] **無 `verify_status: "pending"` 殘留**
- [ ] high confidence accuracy ≥ 90%
- [ ] reject 條目均填 verify_note

### Phase 3 反向產出
- [ ] `kl3_coverage_report.md` 含 36 課
- [ ] `kl4_teaching_examples.md` 含 36 課碼

### Phase 4 報告
- [ ] `四下_國語_L3對齊報告.md` 6 H2 段落齊
- [ ] `JOB-242-Report.md` 完成

---

## ✅ 成果 Checklist (Deliverables)

- [ ] 成果表格填寫完畢
- [ ] 進度總表已同步（`docs/進度彙整_題庫研發與產出.md`）
- [ ] `docs/README_專案發展紀錄.md` 新增 JOB-242 記錄
- [ ] 已執行 `/pj_sync`
- [ ] JOB-242-Report.md 異動清單已列所有實際修改檔案路徑
- [ ] `node scripts/job_manager.js close JOB-242`
- [ ] Discord 結案回報送 chat_id `1487738477608177714`
- [ ] git commit（最終結案）

---

## ⏱️ 執行時間回報

| 子任務 / 階段 | 開始時間 | 結束時間 | 耗時（分鐘）| 備註 |
|:--|:--|:--|:--|:--|
| Phase 0 規格設計 | — | — | — | Claude |
| Phase 1 自動對齊 | — | — | — | Codex |
| Phase 2 普查複檢 | — | — | — | Claude，121 份普查 |
| Phase 3 反向產出 | — | — | — | Codex |
| Phase 4 報告整合 | — | — | — | Claude 親寫 |
| Phase B-E 結案 | — | — | — | — |
| **總計** | — | — | **預估 ~10-12 hr** | — |

---

## 📌 關鍵參考檔案

| 檔案路徑 | 用途 |
|:--|:--|
| `jobs/JOB-238-Report.md` | 四下_國語 L2 抽取的最新狀態 |
| `knowledge/3_考古題/3_L2_結構化抽取/_meta/chinese_codes_legal_II.json` | 61 條合法 codes |
| `knowledge/1_課綱研究/國語/四下/KL3_四下_國語_研究總綱.md` | KL3 主檔（36 課） |
| `knowledge/1_課綱研究/國語/README_KL4單課建置與複製準則.md` | KL4 格式規範 |
| 後續 11 cells（JOB-243+）| 沿用本 JOB 產出的 `L3_alignment_spec_v1.md` |

---

## 🔄 後續延伸（Pilot 驗證後）

| 順序 | JOB | 範圍 | 預估 |
|:--|:--|:--|:--|
| 2 | JOB-243 | 三下_國語 L3 對齊 | ~8hr |
| 3 | JOB-244 | 五下_國語 L3 對齊 | ~8hr |
| 4 | JOB-245 | 六下_國語 L3 對齊 | ~8hr |
| 5-8 | JOB-246~249 | 自然 G3-G6 L3 對齊（注意：KL4 無 RC-01）| 每個 ~8hr |
| 9-12 | JOB-250~253 | 社會 G3-G6 L3 對齊（注意：三下_社會 KL3 在重建）| 每個 ~8hr |

預期所有 11 cells 完成後，本專案具備：
- 12 份 L3 對齊報告
- 完整的「考古題-課綱-課文」三維索引
- 為 L4 階段（題庫升 QL5 + 學生診斷模型）建立完整基礎

---

## 真實回報本次對話的模型與花費

＄作業匯總：Token 數: - | 花費: -（訂閱制無單次計費）| 使用模型: Codex CLI gpt-5.5（Phase 1/3）+ Claude Sonnet 4.6 / Opus 4.7（Phase 0/2/4）| 執行者: Codex + Claude
