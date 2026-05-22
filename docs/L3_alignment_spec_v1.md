*Created by Claude Code (claude-opus-4-7) at 2026-05-20 16:00*
*Updated to v1.1 at 2026-05-21 09:35 — 加入學年版本識別機制*

`last_updated`: 2026-05-21 09:35
`updated_by`: Claude Code (claude-opus-4-7)
`schema_version`: 1.1
`pilot_scope`: 四下_國語（JOB-242）
`reuse_scope`: 11 cells（國語/自然/社會 × G3-G6）

# L3 對齊機制規格 v1.1

> 本規格定義「**考古題 L2 結構化抽取** ↔ **課綱研究 KL3/KL4**」的對齊機制。
> JOB-242 為 Pilot，驗證後沿用於 JOB-243~253（後續 11 cells）。

## v1.1 變更摘要（2026-05-21）

依 Pilot 蒐證發現翰林版四下國語於 110 → 111 學年改版，KL4 內容為新版（111+），舊版（108-110）課程在專案內無對應紀錄。新增「**學年版本識別**」機制：

- **核心原則**：以最新版（KL4）為最高標準
- 新增 `version_match` 欄位（值 `current` / `legacy` / `shared` / `unknown`）
- Pilot 範圍僅納入 `version_match=current` 與 `shared` 試卷
- 舊版試卷（`legacy`）排除（檔不被刪，但 alignment 不跑）
- 改版證據與舊版課程清單見 `docs/archive/翰林舊版四下國語_課程對應表.md`

---

## §1. 文件定位與適用範圍

### 適用

- L2 結構化抽取已完成的 cell（國語 G3-G6 已齊）
- KL4 完整 12 課/版本的 cell（國語四下確認完整）

### 不適用（需先補完素材或另設機制）

- 社會/自然：**無課文 RC-01**，需另設對齊樞紐（待 Pilot 結案後決定）
- 三下_社會：KL3 在重建中
- 無 KL4 的 cell：對齊降級為「L2 → KL3」單向粗粒度

---

## §2. 對齊機制全景

```
┌─────────────────┐
│  L2 結構化抽取   │  121 份 × 平均 60 題 ≈ 7,200 題
│  (考古題)        │  每題已 link codes_candidate
└────────┬────────┘
         │ A: L2.question → KL3.課次（粗粒度）
         │ B: L2.question → KL4.課碼（細粒度，繼承自 A）
         ▼
┌─────────────────┐
│  KL3 / KL4 研究  │  36 課（康軒 12 + 翰林 12 + 南一 12）
│  (課綱)          │  KL4 含 RC-01 課文全文（國語特有）
└────────┬────────┘
         │ C: KL3.課次 → L2.questions（反向，覆蓋率）
         │ D: KL4.課碼 → L2.questions（反向，教學示例）
         ▼
   覆蓋率報告 + 教學示例報告
```

---

## §3. 既有素材結構（實際確認，2026-05-20）

### §3.1 L2 JSON schema（每份試卷一檔）

```yaml
_meta:
  exam_id: "翰林_108_內安國小_第一次段考"
  publisher: "翰林" | "康軒" | "南一"
  academic_year: int     # 108
  source_school: str
  exam_type: str         # 第一次段考 / 期末考 / ...
  semester: "四下"
  subject: "國語"
  combo: "四下_國語_翰林"
  schema_version: "1.0"

questions:
  - question_id: "Q1.1"  # 格式：Q{大題編號}.{小題編號}
    type: "fill_blank" | "multiple_choice" | "matching" | "short_answer"
    stem: str            # 題幹（含「大題 X Q Y」前綴）
    options: list | null
    answer: any | null
    topic_keywords: list[str]
    cognitive_level: "記憶" | "理解" | "應用" | "分析" | "評鑑" | "創造"
    codes_candidate:
      - code: "Aa-Ⅱ-1"      # 108 課綱 codes
        confidence: "high" | "medium" | "low"
        reason: str          # 為什麼 link 此 code
        trace: list[str]     # 題幹中的具體 evidence 字串
```

### §3.2 KL4 結構（主索引）

每課 2 份檔案：
- `KL4_四下_{版本}_L{n}_{課程名稱}_單課研究紀錄.md`（含 RC-01）
- `KL4_四下_{版本}_L{n}_{課程名稱}_考古題與討論.md`（副檔）

**單課研究紀錄** 關鍵欄位：
```
**課碼**：0140201
**KL3 錨點**：kl3-0140201-84aa3faf96
**檔案定位**：四年級下學期 / 翰林版 / 第一課 / 《稻間鴨》

## 📖 第一部：文本深度層次分析
   - 文體分類
   - 文本結構（起承轉合）
   - 認知核心

### 1. 課文全文錄製 (Textual Evidence) - RC-01
   > 課文標題、作者、來源連結、課文全文逐行

## 🔤 第二部：關鍵詞彙與識字部件地圖
## ⚖️ 第三部：語法守衛點與地雷區
## ✅ 品質稽核 Checklist (RC-01 ~ RC-06)
```

### §3.3 KL3 結構（補強用，highlight only）

`KL3_四下_國語_研究總綱.md` 結構：

```
## 一、國語命題核心
## 二、國語內容發展矩陣
   ### 1. 康軒版（只列 L1, L2, L8, L12 = 4 課 highlight）
   ### 2. 翰林版（只列 L1, L2, L11, L12）
   ### 3. 南一版（只列 L3, L9, L10, L12）
## 三、數位題型設計方向與規範 (L4 Strategy)
## 五、R3 實證驗證區
## 六、品質稽核與斷言
```

每課 KL3 highlight 欄位：**課次 / 課程名稱 / 單元主題 / L4+ 研發關鍵點**

### §3.5 學年版本識別（v1.1 新增）

L2 試卷跨多個學年（四下_國語為 108-113），但 KL4 只有最新版。對齊前必須先識別版本：

```yaml
version_match 欄位定義:
  current : L2 試卷學年 ≥ 該 publisher 改版後年份，且引用課文命中 KL4 既有 36 課
            → 完整對齊（kl3_links + kl4_links 含 rc01_evidence）
  
  legacy  : L2 試卷學年 < 改版年份，或引用舊版課文（KL4 不存在）
            → 標 version_match=legacy，僅記課文名稱，kl4_links 為空陣列
            → JOB-242 Pilot 不對 legacy 試卷做對齊（排除範圍）
  
  shared  : 題目引用課文同時存在於新舊版（如「孫悟空三借芭蕉扇」「最後一片葉子」）
            → 完整對齊到 KL4（同 current）
  
  unknown : 試卷學年欄位空缺
            → 用內容啟發式判定：題幹含 ≥1 KL4 既有課文 → 推測 current
            → 題幹含舊版專屬課文 + 無 KL4 課文 → 推測 legacy（排除）
            → 兩者都無 / 矛盾 → 排除
```

### 已確認的改版年份表

| Publisher | 改版分界 | 舊版（legacy）| 新版（current）|
|:--|:--|:--|:--|
| 翰林（四下_國語）| 110 → 111 | 108-110 | 111+ |
| 康軒（四下_國語）| 暫未發現改版（L1/L2/L4 跨年一致）| — | 108+（全部視為 current）|
| 南一（四下_國語）| 暫未發現改版 | — | 108+（全部視為 current）|

> 翰林舊版完整 12 課對應表見 `docs/archive/翰林舊版四下國語_課程對應表.md`。
> 後續 cells（自然/社會、G3/G5/G6）若發現改版，需補建對應的「舊版課程對應表」於同 archive 目錄。

### §3.4 課碼格式（修正派工單錯誤）

**正確格式**：`0{版本碼1}{年級1}{學期碼2}{課次2}` = 7 碼

| 位 | 內容 | 範例 |
|:--|:--|:--|
| 1 | 固定 `0` | `0` |
| 2 | 版本碼：1=翰林, 2=康軒, 3=南一 | `1` |
| 3 | 年級：3/4/5/6 | `4` |
| 4-5 | 學期碼：01=上, 02=下 | `02` |
| 6-7 | 課次：01-12 | `01` |

範例：
- 翰林四下 L1 稻間鴨 = `0140201`
- 康軒四下 L1 一束鮮花 = `0240201`
- 南一四下 L1 龍慶元宵 = `0340201`
- 翰林四下 L11 最後一片葉子 = `0140211`

KL3 錨點格式：`kl3-{課碼}-{hash10}`，例：`kl3-0140201-84aa3faf96`

> ⚠️ 派工單 §0.2 寫的 `0{年級}{學期}{版本碼}{課次}` 順序不對，以本 §3.4 為準。

---

## §4. 對齊關係定義（A / B / C / D）

### §4.0 前置：學年版本判定（v1.1）

**對任何題目對齊前，必先判定該試卷的 `version_match`**：

1. 讀 L2 試卷 `_meta.academic_year` 與 `_meta.publisher`
2. 對照 §3.5「改版年份表」
3. 若試卷學年欄位空缺 → 啟動內容啟發式（題幹是否含 KL4 既有課文）
4. 最終填入 `version_match`：`current` / `legacy` / `shared` / `unknown`

**結果決定對齊深度**：

| version_match | 對齊範圍 | 輸出欄位 |
|:--|:--|:--|
| `current` | 完整對齊（kl3 + kl4 + rc01_evidence）| 全欄位填 |
| `shared` | 同 `current`，但標明跨版本共用 | 全欄位填 + 多帶 `shared_versions` |
| `legacy` | 僅記課文名稱，無 KL4 kecode | kl4_links = []，記 legacy_lesson_title |
| `unknown` | 排除（不對齊）| 整個試卷跳過 |

### §4.1 A: L2.question → KL3.課次（粗粒度，主對齊）

**目的**：把考古題對應到課綱研究的課次層級。

**邏輯**：
- 輸入：L2.question.stem + codes_candidate[].reason + codes_candidate[].trace
- 輸出：每題 link 0~N 個 KL3 課次（不限版本，允許跨版本連結）

**為什麼允許跨版本**：考古題試卷是 publisher-bound（翰林試卷只考翰林課文），但 unlinked_general 題型（注音字音、修辭、改錯）跨版本通用，會 link 多版本同名概念。

### §4.2 B: L2.question → KL4.課碼（細粒度，繼承自 A）

**邏輯**：
- 從 A 衍生：A 已 link `(publisher, lesson)` → 自動 link 到該課的 KL4 課碼
- 補充：若題幹引用 KL4.RC-01 內字句（≥5 字連續匹配），標 `rc01_evidence: true`

**為什麼分開記**：
- KL4 是「教學現場」視角，含課文、字詞、修辭
- 後續題庫升 L4 / 教師備課時，需要靠 B 找「教這課時哪些題目可用」

### §4.3 C: KL3.課次 → L2.questions（反向，覆蓋率）

**目的**：知道每課被考古題覆蓋的廣度與深度。

**每課輸出**：
```yaml
publisher: "翰林"
lesson: "L1"
lesson_title: "稻間鴨"
kecode: "0140201"
linked_question_count: int
linked_question_ids: list[str]    # e.g., ["翰林_108_內安國小:Q3.1", ...]
linked_codes: dict[str, int]       # e.g., {"4-Ⅱ-7": 3, "Bc-Ⅱ-2": 2}
cognitive_level_distribution: dict[str, int]
misconception_topics: list[str]    # 從題目 topic_keywords 萃取
```

### §4.4 D: KL4.課碼 → L2.questions（反向，教學現場）

**目的**：給老師備課用，每課 3-5 題教學示例。

**每課輸出**：
```yaml
kecode: "0140201"
lesson_title: "稻間鴨"
linked_questions:
  - exam_id: "翰林_108_內安國小_第一次段考"
    question_id: "Q3.1"
    stem_preview: str (前 50 字)
    rc01_evidence: bool             # 國語特有
    cognitive_level: str
rc01_evidence_count: int            # 引用課文字句的題目數
teaching_examples: list[QuestionRef]  # 從 linked_questions 挑 3-5 題代表
```

---

## §5. Match Rules R1-R4

### §5.1 R1 顯式引用（confidence: high）

**Pattern**：題幹含 `《X》一文` / `X 一文` / `X 中` / `根據 X` / `依據 X`，X 為課程名稱。

**示例**：
- 題幹 `依據《最後一片葉子》一文，主角為什麼...` → link 翰林 L11
- 題幹 `遊廬山有感一文，告訴我們...` → link 該版本對應課次

**處理**：R1 命中即停，confidence=high。

### §5.2 R2 標題關鍵字（confidence: medium）

**Pattern**：題幹或 codes_candidate.reason 含**課程名稱 ≥3 字連續匹配**（含部分匹配）。

**示例**：
- 課程名稱「稻間鴨」(3 字) → 題幹含「稻間鴨」即匹配
- 課程名稱「綠色魔法學校」(6 字) → 題幹含「綠色魔法」或「魔法學校」(≥3 字連續) 匹配

**處理**：R1 不命中才用 R2，confidence=medium。

**注意 false positive**：
- 課程名稱含通用字（「閱讀課」「向太空出發」）易誤匹配
- 處理：對通用度高的課名加 disambiguation 要求（題幹同段須含至少 1 個課文特有詞，例「稻間鴨」必須同時出現「鴨子」或「稻穗」或「林世仁」）

### §5.3 R3 通用題型（unlinked_general）

**Pattern**：題型為下列任一，且無 R1/R2 命中：
- 注音字音、字形辨識（type=fill_blank + topic_keywords 含「注音」「國字」「字形」）
- 改錯字
- 修辭題（無特定課文）
- 標點符號
- 部首/筆順
- 語詞填空（無上下文）

**處理**：標 `unlinked_general`，**不留空**，明列 `general_type` 欄位（例：`general_type: "字音字形"`）。

### §5.4 R4 跨課（confidence: medium，多 link）

**Pattern**：題目涉及多課，最常見：
- 閱讀測驗類整合課程（一段文字後出 3-5 題，文字非單一課文）
- 比較題（「比較 X 課與 Y 課的...」）
- 大題首題引文後續題（Q5.1~Q5.6 共用一段引文）

**處理**：允許 link 多 KL3 課次（用陣列），但每 link 都需有 evidence。

---

## §6. 輸出檔案結構（alignment_raw.json schema）

寫入路徑：`knowledge/3_考古題/3_L2_結構化抽取/四下/alignment/alignment_raw.json`

```yaml
_meta:
  schema_version: "1.1"
  pilot_scope: "四下_國語"
  extracted_at: ISO timestamp
  extractor: "Codex (gpt-5.5) - JOB-242 Phase 1"
  total_exams_processed: int       # 納入 alignment 的試卷數（不含 legacy / unknown excluded）
  total_questions_processed: int
  excluded_exams:                  # v1.1 新增
    legacy_count: int              # 舊版排除
    unknown_excluded_count: int    # 學年未知且內容無法判定
  
l2_to_kl_links:
  - exam_id: "翰林_112_內安國小_第一次段考"
    question_id: "Q3.1"
    version_match: "current"       # v1.1 必填：current / legacy / shared / unknown
    shared_versions: null          # version_match=shared 時填 ["新版","舊版"]
    kl3_links:                     # 0~N 條，unlinked_general 為空陣列
      - publisher: "翰林"
        lesson: "L1"
        lesson_title: "稻間鴨"
        confidence: "high"
        match_rule: "R1_explicit_quote"
        evidence: "題幹引用《稻間鴨》"   # R1/R2 必填
    kl4_links:                     # 衍生自 kl3_links；legacy 時為空陣列
      - kecode: "0140201"
        kl3_anchor: "kl3-0140201-84aa3faf96"
        rc01_evidence: bool
        rc01_quote: str | null
    legacy_lesson_title: str | null  # v1.1：version_match=legacy 且 R1/R2 命中時記課文名（kl4_links 為空，但保留命中課文資訊）
    general_type: str | null
    verify_status: "pending"
    verify_note: null

kl3_to_l2_coverage:                # C 關係輸出
  - publisher: "翰林"
    lesson: "L1"
    lesson_title: "稻間鴨"
    kecode: "0140201"
    linked_question_count: 12
    linked_question_ids: ["翰林_108_內安國小:Q3.1", ...]
    linked_codes: {"4-Ⅱ-7": 3, "Bc-Ⅱ-2": 2}
    cognitive_level_distribution: {"理解": 5, "分析": 4, ...}
    misconception_topics: ["擬人手法", "課文主旨歸納", ...]

kl4_to_l2_examples:                # D 關係輸出
  - kecode: "0140201"
    lesson_title: "稻間鴨"
    linked_questions:
      - exam_id: ..., question_id: ..., stem_preview: ..., rc01_evidence: true, cognitive_level: "理解"
    rc01_evidence_count: 4
    teaching_examples: [...]       # 從 linked_questions 挑 3-5 題

unlinked_general_stats:            # 統計區
  total_count: int
  by_general_type: dict[str, int]  # {"字音字形": 350, "修辭": 120, ...}
```

---

## §7. verify_status 分類定義（Phase 2 用）

Phase 2 Claude 普查時，對每題 link 填 `verify_status`：

| status | 意義 | 觸發條件 |
|:--|:--|:--|
| `pass` | 完全正確 | evidence 確實存在 + lesson 正確 |
| `pass_with_caveat` | 對但有疑慮 | 對齊合理但 reason 偏空泛、可改 link 多課 |
| `reject_high` | high confidence 卻錯 | R1 evidence 在題幹中找不到，或 lesson 錯 |
| `reject_medium` | medium confidence 錯 | R2 關鍵字匹配是 false positive（例「閱讀課」誤匹配） |
| `reject_overlinked` | R4 過度連結 | 多 link 中有 ≥1 條無 evidence |
| `missed_should_link` | R3 漏抓 | 標 unlinked_general 但實際應 link 某課 |

**verify_note 規則**：reject_* 與 pass_with_caveat 必填，pass 可空。

---

## §8. 已知 edge cases（Phase 0 self-review 預先想到的）

### §8.1 cross-publisher 引用

題目同卷可能引用其他版本課文（不常見但有）。
**處理**：R1/R2 命中即 link，不限該卷 publisher。

### §8.2 大題引文（Q5.1~Q5.6）

一段引文後接多題，引文可能是課文也可能是外部文章。
**處理**：
- 若引文是課文（R1/R2 命中）→ 所有子題繼承同 KL3 link
- 若引文是外部文章 → 所有子題標 unlinked_general，general_type=「閱讀測驗」

### §8.3 注音題覆蓋多課字詞

「ㄒㄩˋ低落」「面帶憂ㄩˋ」可能來自多課課文。
**處理**：R3 unlinked_general（注音字音是通用題型，不深度溯源到課）。

### §8.4 KL3 highlight 缺漏的課

KL3 主檔只列 12 課 highlight，其他 24 課無 KL3 描述但有 KL4。
**處理**：A 關係靠 KL4 課程名稱對齊，KL3 link 只在 highlight 課填，其他課 KL3 link 為空但 KL4 link 完整。

### §8.5 cognitive_level 缺漏

部分 L2 question.cognitive_level 為 null。
**處理**：C 統計時跳過 null 項，於 _meta 註明 `null_cognitive_count`。

---

## §9. self-review checklist（Phase 0 收尾必跑）

- [x] 4 種對齊關係（A/B/C/D）schema 都有明確定義 → §4
- [x] Match rules R1/R2/R3/R4 都有具體 example → §5
- [x] R3 unlinked_general 有處理規則（不留空，明列 general_type）→ §5.3, §6
- [x] R4 cross_lesson 有處理規則（允許多 link + 每 link 有 evidence）→ §5.4
- [x] 輸出 JSON schema 含 verify_status 欄位（給 Phase 2 用）→ §6, §7
- [x] 課碼格式與派工單矛盾已修正並標註 → §3.4
- [x] KL3 主檔覆蓋不完整問題已說明 → §3.3, §8.4
- [x] verify_status 6 種分類齊備 → §7
- [x] edge cases 預想 5 條 → §8

---

## §10. 後續 11 cells 適用性說明

| Cell | 適用？ | 需調整項 |
|:--|:--|:--|
| 三/五/六下_國語 | ✅ 直接 reuse | 改 pilot_scope + 重讀對應 KL3/KL4 |
| 三/四/五/六下_自然 | ⚠️ 部分適用 | **無 RC-01**，B 關係降級為「課碼 → L2」不靠 RC-01 evidence。Match R1/R2 改靠「實驗主題、單元名稱」匹配 |
| 三/四/五/六下_社會 | ⚠️ 部分適用 | 三下_社會 KL3 重建中，需先補完；其他年級同自然模式 |

**Pilot 結案後**，依驗證結果決定：
1. 自然/社會的「對齊樞紐」具體用什麼（單元主題？能力指標？學科概念？）
2. 是否升 spec v1.1 處理無課文情境

---

## §11. 派工單更正清單

本 spec 編寫過程中發現派工單需更正：

| # | 派工單原文 | 實際情況 | 修正動作 |
|:--|:--|:--|:--|
| 1 | `0{年級}{學期}{版本碼}{課次}` | `0{版本碼}{年級}{學期}{課次}` | 本 spec §3.4 為準 |
| 2 | 「KL3 主檔 36 課」 | KL3 主檔只列 12 課 highlight | 對齊以 KL4 為主索引（§8.4）|
| 3 | match_rules 範例「依據五月．風箏．少年一文」→ 對齊到康軒 L5「五月．風箏．少年」 | 康軒四下 L5 是「讀書報告——藍色小洋裝」，無「五月．風箏．少年」 | 範例失效，本 spec §5.1 用實際課文「最後一片葉子」「稻間鴨」為例 |
| 4 | 派工單未考慮學年版本差異（假設 121 份試卷全部對齊到當前 KL4）| L2 試卷跨 108-113 學年，翰林 110→111 改版，KL4 為新版 | spec v1.1 加 §3.5 + §4.0 學年版本識別；Pilot 範圍從 121 縮為 ~69 份（111+ 新版 + unknown 推測新版）|

> 派工單本體**不修改**（避免污染歷史），由本 spec 在 Phase 1 階段作為 authoritative source。

---

## §12. v1.0 → v1.1 變更紀錄

| 章節 | 變更內容 |
|:--|:--|
| §3.5（新增）| 學年版本識別機制 + 改版年份表 |
| §4.0（新增）| 前置：學年版本判定 + 各 version_match 對齊深度 |
| §6 schema | 加 `version_match` `shared_versions` `legacy_lesson_title` 欄位 + `_meta.excluded_exams` 統計 |
| §11.4（新增）| 派工單未考慮學年版本差異的更正項 |
| Pilot 範圍 | 從 121 份縮為 ~69 份（111+ 新版 65 + unknown 推測新版 4）|

**v1.1 提交時間**：2026-05-21 09:35
**外部證據檔**：`docs/archive/翰林舊版四下國語_課程對應表.md`
