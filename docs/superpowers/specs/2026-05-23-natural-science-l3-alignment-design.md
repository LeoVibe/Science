*Created by Claude Code (claude-opus-4-7) at 2026-05-23*

`last_updated`: 2026-05-23
`updated_by`: Claude Code (claude-opus-4-7)
`status`: design draft — pending user review
`scope`: 自然 G3-G6 L3 對齊機制設計（spec v2.0）
`upstream`: spec v1.1（國語 G3-G6 已完成）

# L3 對齊 spec v2.0 — 自然版設計（無 RC-01 課文）

> 本 spec 為 spec v1.1（國語）的擴展版本。國語以「課文 RC-01」當對齊樞紐，自然無 RC-01，改以「學習內容/表現 codes」為主樞紐。
> 已完成 6 個關鍵設計決策 + Codex 第二意見交叉驗證 + 全部採納 Codex 修正建議。

---

## §0 動機與背景

JOB-242/243/244/245 已完成 G3-G6 國語 L3 對齊（180 試卷 / 8,439 題 / 平均 90.2% pass / 0 reject）。spec v1.1 在國語成立的關鍵是「**課文 RC-01 全文當對齊證據**」（R1 顯式引用 ≥5 字連續匹配）。

**自然無此資產**：
- 自然 KL4 沒有 RC-01 課文全文（自然教材是實驗/觀察情境，非閱讀文本）
- KL4 只有四下/五下完整（各 12 課），三下/六下未完成
- 但每題 L2 已有 `codes_candidate`（國家 108 課綱 codes，如 INd-Ⅲ-2、po-III-1）

**設計挑戰**：找到適合自然的對齊樞紐 + 對應的 Match Rules + 不依賴 KL4 完整性的機制。

---

## §1 對齊三層架構（核心設計決策）

```
┌────────────────────┐
│ L2.question        │  考古題（codes_candidate 已有國家課綱 codes）
└────────┬───────────┘
         │ A: code 對齊（雙源交叉驗證）
         ▼
┌────────────────────┐
│ 學習內容/表現 codes  │  主樞紐（如 INd-Ⅲ-2、po-III-1）
│ + KL3 單元主題       │  跨年級/版本穩定；無改版問題
└────────┬───────────┘
         │ B: 知識點對齊（僅四下/五下有 KL4 可連）
         ▼
┌────────────────────┐
│ KL4 核心知識點      │  概念粒度（如「鐵生鏽的條件」）
│ + 守衛點/迷思       │  → 反向產出迷思診斷報告
└────────────────────┘
```

### 1.1 主樞紐：學習內容/表現 codes

**為什麼選 codes**：
- L2 已有 codes_candidate（JOB-238/239/240/241 階段已驗證品質）
- codes 是國家 108 課綱層次，**跨年級/跨版本一致**（不像國語有改版問題）
- 不依賴 KL4 完整性（三下/六下 KL4 沒做也能跑）
- 替代物（核心單元主題 / KL4 知識點）都有覆蓋度或穩定性問題

**為什麼補 KL3 §二 單元主題**（Codex 建議 #1）：
- codes 是抽象標籤，單元主題（如「水與物質變化」「動物的構造與適應」）是教師備課的自然單位
- 兩者並存：codes 用於統計分析、unit_theme 用於人類閱讀的教學示例報告

### 1.2 知識點對齊（KL4 連結）

僅 **四下/五下** 有 KL4 完整資料時啟用。輸出欄位：
- `kl4_link`：含 lesson / knowledge_point / kecode
- `kl4_supported`：bool 旗標（題幹含 KL4 核心知識點關鍵字 ≥2 字）
- `misconception_match`：對應的 KL4 守衛點/迷思條目

**注意（Codex 建議 #2）**：`kl4_supported: true` **不直接升 confidence**，因為 KL4 覆蓋不全（三下/六下無 KL4）會造成年級偏誤。kl4_supported 純為「KL4 支持」旗標，便於後續分析。

---

## §2 Match Rules（自然版 N1-N5）

### 2.1 規則表

| Rule | 名稱 | 命中條件 | confidence | 備註 |
|:--|:--|:--|:--|:--|
| **N1** | 雙源一致 | L2.codes_candidate 與 Codex 抽查結果 **same primary code** | **high** | 直接 pass，不重推 |
| **N2** | 雙源相容 | 兩源不同但**同主題 + 同評量動詞類** | **medium** | 收緊版（Codex #3）|
| **N3** | 單源 | 只有一源有 code，題幹 ≥2 KL3 學習內容描述關鍵詞匹配 | **medium** | 採該唯一源 |
| **N4** | KL4 知識點旗標 | 題幹含 KL4 核心知識點關鍵字 ≥2 字 | **不改 confidence** | 加 `kl4_supported: true` 旗標（Codex #2）|
| **N5** | unlinked_general | 兩源都無 code，或衝突無法調和 | none | 標 `general_type` |

### 2.2 評量動詞類（N2 收緊）

**問題**：原本 N2「同主題 INd-III-*」太鬆，因為 INd-III-1（學習內容）與 po-III-1（學習表現）即使主題接近，「測什麼」完全不同。

**修正**：N2 命中除「同主題」外，需「**同評量動詞類**」：

| 動詞類前綴 | 含義 | 範例 |
|:--|:--|:--|
| `INd-` `INc-` `INb-` `INa-` `INe-` `INf-` `INg-` | 學習內容（知識）| INd-III-2「鐵生鏽需要水與氧氣」|
| `po-` | 觀察與提問 | po-III-1「能觀察自然現象並提問」|
| `pa-` | 分析推論 | pa-III-1「能分析數據推論結論」|
| `ai-` `an-` | 態度與興趣 | ai-III-1「能保持好奇心」|
| `tr-` `tm-` `tc-` `ti-` | 探究技能 | tr-III-1「能規劃簡單實驗」|

**N2 命中條件（修正）**：兩源 codes 同前綴 + 同主題（前 6 字）。否則視為衝突 → `verify_status: needs_human_review`。

### 2.3 衝突處理（升級版）

| 衝突情境 | 處理 | verify_status |
|:--|:--|:--|
| L2 與 Codex 完全一致 | N1 直接通過 | `pass` |
| 同主題 + 同動詞類 | N2，採 Codex 為 primary，L2 為 secondary | `pass_with_caveat` |
| 只有一源有 code | N3，採該唯一源 | `pass_with_caveat` |
| 不同主題 / 不同動詞類 | **needs_human_review** | `needs_human_review` |
| 兩源都無 code | N5 unlinked_general | `pass`（若 general_type 明確） |

### 2.4 N1-N5 預期分布（基於四下自然 sample）

| Rule | 預期比例 | 來源 |
|:--|:--|:--|
| N1 | 60-70% | L2 codes_candidate high confidence 比例 |
| N2 | 10% | 兩源 medium 一致 |
| N3 | 8% | 單源命中 |
| N4 旗標（疊加） | 25%+ | 題幹確實含 KL4 知識點 |
| N5 | 15% | 跨概念綜合 / 實驗操作 |

---

## §3 Schema 完整定義

### 3.1 每題對齊資料

```json
{
  "exam_id": "翰林_112_四下_自然_期中考",
  "question_id": "Q5.3",
  "version_match": "current",
  "primary_code": "INd-Ⅲ-2",
  "secondary_codes": ["INd-Ⅲ-1", "po-III-1"],
  "unit_theme": "水與物質變化",
  "kl4_link": {
    "lesson": "L2 水的三態變化",
    "knowledge_point": "凝結與蒸發",
    "kecode": "0140402"
  },
  "kl4_supported": true,
  "misconception_match": ["白煙與水蒸氣不分"],
  "match_rule": "N1",
  "confidence": "high",
  "source_l2": "INd-Ⅲ-2 (high)",
  "source_codex": "INd-Ⅲ-2",
  "verify_status": "pass",
  "verify_note": null
}
```

### 3.2 新增欄位（vs spec v1.1）

| 欄位 | 必填？ | 用途 |
|:--|:--|:--|
| `primary_code` | 必填 | 主 code（最強對齊）|
| `secondary_codes` | 0-3 | 副 codes（multi-link Q-matrix 雛形）|
| `unit_theme` | 必填 | KL3 §二 核心單元主題（補語境）|
| `kl4_link` | option | 知識點 link（僅四下/五下）|
| `kl4_supported` | bool | 題幹含 KL4 知識點 ≥2 字（旗標，不升 conf）|
| `misconception_match` | option | 守衛點/迷思 list（僅四下/五下）|
| `source_l2` | 必填 | L2 codes_candidate 原始輸出 |
| `source_codex` | option | Codex 抽查輸出（僅 N2/N3 邊界）|

### 3.3 移除欄位（vs spec v1.1）

- `kl3_links[]`（國語：對應到課次）→ 改 `primary_code` + `secondary_codes`
- `legacy_lesson_title`（國語：舊版獨有課文名）→ 自然暫無改版
- `shared_versions`（國語：跨版本共用課文）→ 自然 codes 跨版本

---

## §4 執行流程（5 Phase）

### Phase 0：規格 + L2 已有 codes 預覽分析（~30 min）

- 統計四下自然 118 份 L2 試卷的 `codes_candidate` 分布
- 估算 N1/N2/N3/N4/N5 預期比例
- 確認自然無改版（若發現改版證據，回補 Phase 0.1）

### Phase 1a：L2 直接讀入 + 規則套用（Python ~10 min）

- 每題抽取 `codes_candidate` → 標 `primary_code` + `secondary_codes`
- 比對 KL3 §二 核心單元主題 → 填 `unit_theme`
- N1 預判（confidence=high 且唯一 code）→ 直接標 `pass`
- N5 預判（無 code）→ 標 `unlinked_general`

### Phase 1b：Codex 仲裁式抽查（~1-2 hr）

- 抽查範圍（**~20-30% 題目**，非全題重做）：
  - L2 confidence ≤ medium
  - L2 有 ≥2 codes 衝突
  - 含 KL4 知識點關鍵字（觸發 N4）
- 補 `kl4_link` + `misconception_match`（僅四下/五下）
- N2 重判（同主題 + 同動詞類）
- 完全衝突的題 → 標 `needs_human_review`

### Phase 2：auto-verify + 普查（~30 min）

- schema 合規檢驗
- verify_status 分流：
  - `pass`：N1 / N3-N4 高信度
  - `pass_with_caveat`：N2 / 邊界 case
  - `needs_human_review`：完全衝突（Claude 親檢）
  - `reject_high`：lesson_title 字串差異 / 邊界 case（批次降級）

### Phase 3：反向產出（Python ~10 min）

三大報告：

1. **`codes_coverage_report.md`**：每個學習內容/表現 code 被多少題覆蓋
2. **`kl4_teaching_examples.md`**（僅四下/五下）：每個 KL4 知識點對應的教學示例題
3. **`misconception_diagnosis.md`**（僅四下/五下）：每個守衛點/迷思對應的題目（**自然特有產出**，為後續 L4 診斷型題庫起點）

### Phase 4：對齊報告 + Report + 結案（~30 min）

仿 JOB-242/243/244/245 結案套路。

---

## §5 普查標準 + 四下自然 Pilot 設計

### 5.1 普查驗收門檻

| 指標 | 標準 | 與國語 v1.1 對照 |
|:--|:--|:--|
| pass + pass_with_caveat | 100% | 同 |
| reject_high | 0 | 同 |
| needs_human_review | 0 | 同 |
| **N1 雙源一致比例** | **≥ 60%** | 自然特有 |
| **kl4_supported 覆蓋率（四下/五下）** | **≥ 30%** | 自然特有 |
| **codes 覆蓋度** | **≥ 70%** 學習內容 codes | 替代「KL3 課次覆蓋率」 |

### 5.2 四下自然 Pilot 範圍

| 項目 | 數值 |
|:--|:--|
| L2 試卷（總計）| 118 份（翰 ~40 / 康 ~40 / 南 ~38） |
| KL4 完整度 | 12 課完整 ✅ |
| 預估題數 | ~6,000 題 |
| Pilot 5 份抽 | 翰 2 + 康 2 + 南 1（covers 3 publisher × 不同學年）|
| Phase 1a 全量耗時 | Python ~10 min |
| Phase 1b Codex 抽查 | ~20-30%（~1.5 hr） |
| 全量總耗時預估 | ~3 hr |

### 5.3 Pilot 驗收 5 個指標

1. schema 合規率 100%（5 份 partial JSON 全可解析）
2. N1+N2+N3+N4+N5 == total（不漏題）
3. **N1 比例 ≥ 60%**（驗證 L2 codes_candidate 品質可 reuse）
4. **kl4_supported 比例 ≥ 30%**（驗證 N4 機制有意義）
5. 親檢 10/10 正確（抽 5 個 N1 high + 5 個 N4 kl4_supported）

### 5.4 自然版本識別

**自然暫無發現改版**（KL3 codes 是國家層級 108 課綱，跨年穩定）：

| Publisher | 自然 改版判定 | 處理 |
|:--|:--|:--|
| 翰林/康軒/南一 | **暫無發現** | 108+ 全部視為 `current` |

若 Phase 0 或 Pilot 階段發現改版證據（特定 code 在某年後新增/刪除），回頭補黑名單。

---

## §6 反向報告產出規格

### 6.1 codes_coverage_report.md（必產出）

每個學習內容/表現 code 列出：
- code 名稱（如 INd-Ⅲ-2）
- 對應描述（從 KL3 §二抓）
- 被多少題覆蓋
- 三家分布（翰/康/南）
- 認知層級分布（記憶/理解/應用/分析/評鑑/創造）

### 6.2 kl4_teaching_examples.md（僅四下/五下）

每課 / 每知識點列出：
- KL4 lesson + knowledge_point
- 3-5 題教學示例（從 alignment_raw 抽 high confidence + kl4_supported=true 的題目）
- 對應的 KL4 守衛點

### 6.3 misconception_diagnosis.md（僅四下/五下 — 自然特有）

每個 KL4 守衛點/迷思條目列出：
- 迷思描述（如「白煙與水蒸氣不分」）
- 對應的題目 ids（從 misconception_match 反向抽）
- 該迷思在三家 / 不同學年 的命中分布
- **後續 L4 用途**：作為「診斷型題庫」的命題基準

---

## §7 v1.1 → v2.0 變更摘要

| 章節 | v1.1（國語） | v2.0（自然） |
|:--|:--|:--|
| 對齊樞紐 | 課文 RC-01 → KL4 課碼 | **學習內容 codes** → unit_theme → KL4（option） |
| Match Rules | R1-R4（顯式引用 / 課名 / 通用 / 跨課） | **N1-N5**（雙源一致 / 相容 / 單源 / KL4 旗標 / unlinked） |
| 對齊單位 | 1 題 → 1 課次（多數）| 1 題 → 1 primary_code + 0-3 secondary_codes（Q-matrix）|
| 學年版本識別 | 翰林 G3 G4 / 三下/四下/五下各家不同改版 | 自然暫無改版（國家 codes 穩定） |
| 反向報告 | KL3 課次覆蓋 + KL4 教學示例 | **codes 覆蓋 + KL4 教學示例 + 迷思診斷** |
| KL4 角色 | 必要（含 rc01_evidence）| 可選（kl4_supported 旗標，不影響 confidence）|

---

## §8 v2.0 特有風險與處理

| 風險 | 應對 |
|:--|:--|
| L2 codes_candidate 品質參差（不同年級 Agent 不同） | Phase 0 統計 confidence 分布；medium/low → Codex 仲裁 |
| Codex 抽查策略過嚴 → cost 高 | 嚴格控制抽查範圍（~20-30%），不全題重做 |
| 三下/六下無 KL4 → kl4_supported 全部 false | 接受不對稱；codes_coverage_report 為主產出 |
| 概念跨多 code 邊界模糊（一題真的對應 5 個 codes 怎辦）| secondary_codes 上限 3；超過者標 `needs_human_review` |
| N2「同動詞類」分類爭議（如 INb vs INc）| 維護動詞前綴對照表，可單元測試驗證 |

---

## §9 後續路徑（spec v2.0 之後）

1. **JOB-X 四下自然 Pilot**：驗證機制（~3 hr）
2. **JOB-X+1~+3**：三下/五下/六下自然全量（~3 hr × 3 = 9 hr）
3. **JOB-Y**：社會 G3-G6 L3 對齊（社會與自然結構類似，可 reuse spec v2.0 + 微調）
4. **spec v2.1**：若 Pilot 發現 N2 動詞類分類過嚴/過鬆，迭代調整
5. **L4 診斷型題庫**：以 misconception_diagnosis.md 為起點，產出「對症診斷題」

---

## §10 設計來源與驗證

- **6 個關鍵設計決策**：與 user 對話 6 輪 AskUserQuestion 收斂
- **Codex 第二意見**：2026-05-23 14:06 完成獨立 review（gpt-5.5）
- **Codex 5 點建議全採納**：N4 不升 conf / N2 收緊動詞類 / 交叉驗證改抽查式 / KL3 補單元語境 / Q-matrix 借鑑
- **Pilot 驗收門檻**：5 個 measurable 指標
