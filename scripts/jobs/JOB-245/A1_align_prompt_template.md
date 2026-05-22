# JOB-245 Phase 1：L2 ↔ KL3/KL4 自動對齊（六下_國語，spec v1.1）

你是 Codex（gpt-5.5），負責對單一試卷做 L3 對齊。

> **JOB-245 重點**：本試卷已預先篩選為「新版（current）」範圍：
> - 翰林：112-113 學年（111 及以前為舊版，已排除）
> - 康軒：108+ 全部納入（暫未發現改版，與四下康軒類似）
> - 南一：109+ 學年（108 為舊版，已排除）
>
> 六下三家改版年份**各自不同**（翰林 111→112、康軒無改版、南一 108→109），且**六下 KL4 共 11 課**（非 12，畢業班特性）。

---

## 任務

對試卷 `{EXAM_ID}` 的所有題目做 L3 對齊（題目 ↔ KL3 課次 ↔ KL4 課碼），產出 partial JSON。

---

## 必讀素材（依此順序）

1. **規格書（必讀全文）**：`docs/L3_alignment_spec_v1.md`
   - 重點：§3（既有素材結構）、§3.5（學年版本識別）、§4（4 種對齊關係）、§5（Match Rules R1-R4）、§6（輸出 schema）、§8（edge cases）

2. **試卷 L2 JSON**：`{L2_JSON_PATH}`

3. **KL3 主檔（highlight 12 課）**：
   - `knowledge/1_課綱研究/國語/六下/KL3_六下_國語_研究總綱.md`

4. **KL4 單課研究紀錄（33 份，含 RC-01 課文）**：
   - `knowledge/1_課綱研究/國語/六下/翰林/KL4_六下_翰林_L*_單課研究紀錄.md`（12 份）
   - `knowledge/1_課綱研究/國語/六下/康軒/KL4_六下_康軒_L*_單課研究紀錄.md`（12 份）
   - `knowledge/1_課綱研究/國語/六下/南一/KL4_六下_南一_L*_單課研究紀錄.md`（12 份）
   - 抓欄位：**課碼**、**KL3 錨點**、**課程名稱**、**RC-01 課文全文**

5. **合法 codes（reference，不修改）**：
   - `knowledge/3_考古題/3_L2_結構化抽取/_meta/chinese_codes_legal_II.json`

---

## 輸出

寫入 `{OUTPUT_PATH}`

**本檔為單試卷 partial**，schema 遵守 `L3_alignment_spec_v1.md §6`，但只含：
- `_meta`（partial 標記，含 exam_id / processed_at / total_questions）
- `l2_to_kl_links`（該試卷所有題目的 link）

**不含**：`kl3_to_l2_coverage` 與 `kl4_to_l2_examples` — 這兩個在 merge 階段（A4_merge.py）一次性計算，partial 不重複算。

### Schema 範本（v1.1）

```json
{
  "_meta": {
    "schema_version": "1.1",
    "partial_for": "{EXAM_ID}",
    "publisher": "翰林" | "康軒" | "南一",
    "academic_year": "{ACADEMIC_YEAR}",
    "version_match_inferred": "current" | "shared" | "unknown_inferred_current",
    "processed_at": "2026-05-22T22:00:00+08:00",
    "extractor": "Codex (gpt-5.5) - JOB-245 Phase 1",
    "total_questions": <int>
  },
  "l2_to_kl_links": [
    {
      "exam_id": "{EXAM_ID}",
      "question_id": "Q3.1",
      "version_match": "current",
      "shared_versions": null,
      "kl3_links": [
        {
          "publisher": "翰林",
          "lesson": "L1",
          "lesson_title": "撐開你的傘",
          "confidence": "high",
          "match_rule": "R1_explicit_quote",
          "evidence": "題幹中『撐開你的傘』一詞與第二段引用"
        }
      ],
      "kl4_links": [
        {
          "kecode": "0160201",
          "kl3_anchor": "kl3-0160201-XXXXXXXXXX",
          "rc01_evidence": true,
          "rc01_quote": "傘下擋雨的人是我的爸爸"
        }
      ],
      "legacy_lesson_title": null,
      "general_type": null,
      "verify_status": "pending",
      "verify_note": null
    }
  ]
}
```

---

## 嚴格規則（v1.1）

1. **逐題對齊**：該試卷**所有題目**都要出現在 `l2_to_kl_links`（含 unlinked_general），不漏題、不抽樣
2. **匹配順序**：依 R1 → R2 → R3 → R4 順序試（spec §5），R1 命中即停
3. **confidence 必填**：`high` / `medium` / `low` / `none`
4. **evidence 必填**：
   - R1/R2 命中 → `evidence` 填題幹中的具體字串
   - R3 unlinked_general → `general_type` 必填（例 `字音字形` / `修辭` / `改錯字`），`kl3_links` 為空陣列
5. **rc01_evidence 判定**：題幹引用 KL4.RC-01 內字句 **≥5 字連續匹配** → `rc01_evidence: true` 且填 `rc01_quote`
6. **kl4_links 衍生自 kl3_links**：每個 kl3_link 對應一個 kl4_link（用課碼格式 `0{版本}{年級}{學期}{課次}`）
7. **`verify_status: "pending"`** 全部填 pending（Phase 2 由 Claude 改）
8. **R2 防 false positive**：課程名稱 ≥3 字連續匹配，但若課名通用度高（如「真相」「真正的「聰明」」「人「聲」就是戲」），題幹同段須含至少 1 個課文特有詞（從 KL4 §關鍵詞彙 抓）才採用
9. **version_match 必填**（v1.1 新增）：
   - 預設 `current`（本試卷已通過外部篩選為新版範圍）
   - 若題幹意外引用**六下舊版專屬課文**（清單見下方），標 `version_match: "legacy"` + `legacy_lesson_title` 填課文名 + `kl4_links` 為空陣列
   - 若引用**閱讀測驗外部選文**（題目本身明確標示為外部選文，非教科書課文）→ `version_match: "shared"` + `general_type: "閱讀測驗_外部選文"`
   - 若無法判定 → `version_match: "unknown"` + `verify_note` 寫明原因

### 六下舊版專屬課文（v1.1 黑名單 — JOB-245 Phase 0 驗證所得）

避免誤對齊到 KL4 kecode，本清單只用作識別 + 標 legacy，不對齊：

| Publisher | 舊版年份範圍 | 已知舊版專屬課文 |
|:--|:--|:--|
| 翰林（六下）| 108-111 | 上書救父——緹縈 |
| 康軒（六下）| 無（108+ 全 current）| — |
| 南一（六下）| 108 | 漁歌子 |

⚠️ 本黑名單為非完整清單（Phase 0 從 L2 試卷抽出的可見舊版線索）。試卷既已按年份篩選為新版範圍，碰到任何「不在 KL4 既有 36 課內」的具體課名引用 → 標 `version_match: "unknown"` + `verify_note: "課名 XXX 不在 KL4 36 課內，疑為外部選文或殘留舊版"`。

---

## 課碼快查（避免 Codex 算錯）

格式：`0{版本碼}{年級}{學期碼}{課次}` = 7 碼

| 版本 | 版本碼 | 六下 L1 範例 |
|:--|:--|:--|
| 翰林 | 1 | `0160201` |
| 康軒 | 2 | `0260201` |
| 南一 | 3 | `0360201` |

六下 → 年級 6 + 學期碼 02
KL3 錨點格式：`kl3-{課碼}-{hash10}`，hash10 必須從 KL4 單課研究紀錄抓，不可自編。

---

## 處理步驟

1. **讀 spec 完整**（先讀 §3, §3.5, §4, §5, §6）
2. **建 KL4 index**（36 課的 課碼/KL3 錨點/課程名稱/RC-01 摘要）
3. **讀該試卷 L2 JSON**
4. **逐題對齊**：
   - 對每題 stem，先試 R1（顯式引用 `《X》一文` `X 一文` `X 中`）
   - R1 不命中試 R2（課程名稱 ≥3 字連續匹配 + disambiguation 防 false positive）
   - R2 不命中試 R3（通用題型，標 general_type）
   - 大題引文類題目（如 Q5.1~Q5.6 共用引文）試 R4，可多 link
5. **rc01_evidence 確認**：對 high confidence 題，去對應 KL4 RC-01 找是否有 ≥5 字連續匹配
6. **輸出 partial JSON**：使用 `json.dumps(d, ensure_ascii=False, indent=2)` 寫入

---

## 產出前自查清單

- [ ] 該試卷所有題目都在 `l2_to_kl_links`（題數 == L2 JSON questions[] 長度）
- [ ] 所有 link 都有 `evidence`（R1/R2）或 `general_type`（R3）
- [ ] R3 unlinked_general 的 `kl3_links` 為空陣列
- [ ] 所有 `verify_status` 都是 `"pending"`
- [ ] kl4_links 課碼格式正確（7 碼，版本碼對，年級為 6）
- [ ] 輸出 JSON 可被 `python3 -c "import json; json.load(open('...'))"` 解析

完成後 print 一行統計：
```
[{EXAM_ID}] done: total_questions=N, R1=A, R2=B, R3=C, R4=D, rc01_evidence_count=E
```
