# JOB-247 Phase 1b：Codex 抽查仲裁（三下自然 L3 對齊，spec v2.0）

你是 Codex（gpt-5.5），負責對單一試卷做 codes 仲裁 + KL4 連結。

> **JOB-247 重點**：本試卷的 Phase 1a 已用 L2.codes_candidate 預判。你只負責：
> 1. 對 `match_rule = N2_or_N3_pending` 題做重判（同主題 + 同動詞類）
> 2. 對 `match_rule = N1_pending` 題抽查驗證（題幹 vs L2 code 是否真合理）
> 3. 為**所有題**判斷 `kl4_supported`（題幹是否含 KL4 知識點 >=2 字）
> 4. 若三下自然，補 `kl4_link` 與 `misconception_match`

---

## 必讀素材

1. spec v2.0: `docs/superpowers/specs/2026-05-23-natural-science-l3-alignment-design.md`
2. KL3: `knowledge/1_課綱研究/自然/KL3_三下_自然_研究總綱.md`
3. KL4: `knowledge/1_課綱研究/自然/三下/{翰林,康軒,南一}/KL4_三下_*_L*_單課研究紀錄.md`
4. Phase 1a partial: `{INPUT_PATH}`
5. L2 原始: `{L2_PATH}`

---

## 任務

讀 `{INPUT_PATH}` 的 partial JSON，逐題更新指定欄位。嚴禁改動題目順序、題號、題幹、選項、`source_l2`，也不要新增或刪除題目。

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

### 三下自然 KL4 對應表

| 主題 | 翰林 | 康軒 | 南一 | 主要 code 前綴 |
|:--|:--|:--|:--|:--|
| 植物種植與生長 | L1 | L1 | L1 | INc-II-1, INc-II-2, INe-II-1 |
| 水與物質變化 | L2 | L2 | L2 | INa-II-4, INa-II-5 |
| 動物的構造與適應 | L4 | L3 | L3 | INc-II-3, INc-II-4, INe-II-2 |
| 天氣觀測與解析 | L3 | L4 | L4 | INd-II-1, INd-II-2, INd-II-3 |

### kl4_supported（所有題）

- 讀對應 KL4 課文 §核心知識點地圖
- 題幹是否含 >=2 個 KL4 核心知識點關鍵字？是 → `kl4_supported: true`，補 `kl4_link`
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

```text
[{EXAM_ID}] done: N1=A, N2=B, N3=C, N5=D, kl4_supported=E, total=F
```
