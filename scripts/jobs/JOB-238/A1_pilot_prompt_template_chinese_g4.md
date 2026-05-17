# JOB-238 Phase 0.3 Codex Pilot Prompt 模板（四下_國語）

> 此模板由 dispatch 腳本注入 `{EXAM_ID}` / `{MD_PATH}` / `{OUTPUT_PATH}` 後送給 codex exec。
> 派工單依據：`jobs/JOB-238-AG-四下-國語-考古題L2結構化抽取.md`
> 黃金樣本參照：`knowledge/3_考古題/3_L2_結構化抽取/_golden_samples/`

---

## 任務

你是 Codex，負責對一份四下_國語 整合版 MD 試卷做 **Phase A1 + A2 整合抽取**：
1. 從整合 MD 抽出每一題的結構化欄位（題幹、選項、答案、題型）
2. 對每題從合法編碼清單中選 1-3 條 108 課綱 第 Ⅱ 學習階段編碼

最終產出**單一 JSON 檔**到指定 OUTPUT_PATH。

## 輸入

- `EXAM_ID`：`{EXAM_ID}`
- `MD 整合檔`：`{MD_PATH}`
- `合法編碼清單`：`knowledge/3_考古題/3_L2_結構化抽取/_meta/chinese_codes_legal_II.json`（61 條：30 學習表現 + 31 學習內容）
- `黃金樣本（唯一 schema 範例）`：
  - **只能讀**：`knowledge/3_考古題/3_L2_結構化抽取/_golden_samples/四下_國語_翰林_*.json`（國語四下主黃金樣本，Claude Sonnet 4.6 親做、編碼合法率 100%）
  - **❌ 嚴禁參考**：`knowledge/3_考古題/3_L2_結構化抽取/_meta/social_codes_legal_*.json`（社會科編碼清單）
  - **❌ 嚴禁參考**：`knowledge/3_考古題/3_L2_結構化抽取/_meta/science_codes_legal_*.json`（自然科編碼清單）
  - **❌ 嚴禁參考**：任何社會科或自然科黃金樣本
  - **❌ 嚴禁參考**：任何 `-Ⅲ-` 或 `-Ⅰ-` 或 `-Ⅳ-` 或 `-Ⅴ-` 編碼（四下使用第 Ⅱ 學習階段）
  - 國語科 code 格式**僅限**：
    - performance（學習表現）：`{數字}-Ⅱ-{數字}`，如 `1-Ⅱ-1`、`5-Ⅱ-3`（共 30 條）
    - content（學習內容）：`{大寫字母組合}-Ⅱ-{數字}`，如 `Aa-Ⅱ-1`、`Bb-Ⅱ-4`（共 31 條）
  - **若你看到 `-Ⅲ-`、`ti-`、`INa-`、`1a/2a`（社會科/自然科 prefix）→ 立即停止並重讀 chinese_codes_legal_II.json**
  - **若你看到 `-Ⅰ-` 或 `-Ⅲ-` 中綴 → 立即停止，四下國語必須用 `-Ⅱ-` 中綴**

## 輸出

寫入 `{OUTPUT_PATH}`，schema 必須與黃金樣本一致。核心結構：

```json
{
  "_meta": {
    "exam_id": "<EXAM_ID>",
    "publisher": "<從 MD frontmatter>",
    "academic_year": <int>,
    "source_school": "<從 MD frontmatter>",
    "exam_type": "<從 MD frontmatter>",
    "semester": "四下",
    "subject": "國語",
    "combo": "<從 MD frontmatter>",
    "schema_version": "1.0",
    "extracted_at": "<ISO 時間>",
    "extractor": "Codex (gpt-5.5) - JOB-238 Pilot",
    "_inheritance": {
      "integration_method": "<從 MD frontmatter integration.method>",
      "llm_model": "<從 MD frontmatter integration.llm_model>",
      "integrated_date": "<從 MD frontmatter integration.integrated_date>",
      "quality_flags": ["<從 MD frontmatter quality_flags>"],
      "char_count": <int>,
      "source_warning": "<若 quality_flags 含 codex_only / claude_only 須註明單源警告>"
    },
    "source_pdfs": [<從 MD frontmatter source_pdfs>],
    "_known_inconsistencies": [<僅在 MD「整合判斷」段落明示注意事項時填，否則用空陣列>]
  },
  "questions": [
    {
      "question_id": "Q{大題}.{中題?}.{小題?}",
      "type": "true_false | multiple_choice | fill_blank | short_answer | matching | chart_question | reading_comp",
      "stem": "<題幹原文>",
      "options": <選擇/連連看用 dict，其他用 null>,
      "answer": "<答案>",
      "topic_keywords": ["<2-5 個從題幹抽的關鍵字>"],
      "misconception_type": "概念混淆 | 事實錯誤 | 空心知識 | null",
      "misconception_evidence": "<若有 misconception_type 則填說明，否則 null>",
      "cognitive_level": "記憶 | 理解 | 應用 | 分析 | 評鑑 | 創造 | null",
      "codes_candidate": [
        {
          "code": "<必須來自 61 條合法清單，且含 -Ⅱ- 中綴>",
          "confidence": "high | medium | low",
          "reason": "<≤50 字，引用題幹原句說明為何選此編碼>",
          "trace": ["<命中的關鍵字或語意片段，從題幹直接引用>"]
        }
      ]
    }
  ],
  "_summary": {
    "total_questions": <int>,
    "by_type": {<type: count>},
    "by_code_count": {"1_code": <int>, "2_codes": <int>, "3_codes": <int>},
    "by_misconception": {<type: count>},
    "by_cognitive_level": {<level: count>},
    "code_frequency": {<code: count>}
  }
}
```

## 強制規則（違反必觸發退件重抽）

### 編碼合法性（最重要）

1. **❌ 禁止使用不在 61 條合法清單的 code。** 國語科第 Ⅱ 階段合法格式：performance（`{數字}-Ⅱ-{數字}`）+ content（`{大寫字母組合}-Ⅱ-{數字}`）。其他格式一律不合法。
2. **❌ 禁止使用其他學習階段（Ⅰ/Ⅲ/Ⅳ/Ⅴ）的編碼。** 四下_國語 = 第 Ⅱ 學習階段，code 必須以 `-Ⅱ-` 中綴。
3. **✅ 找不到合適編碼時**，留 `codes_candidate: []` 並在題目欄加 `"extract_skipped": "no_matching_code"`，**不可硬塞**。

### Reason 品質

4. **❌ 禁止寫「相關」「對應」「與此題有關」等空泛字眼。** 必須引用題幹原句。
5. **✅ 範例（合格）**：`"題幹「請將下列詞語按照筆畫多寡排列」直接對應「書寫能力」的字形辨識能力。"`
6. **❌ 範例（不合格）**：`"與此題相關"`、`"考國語知識"`。

### Confidence 列舉

7. `high`：題幹語意完全匹配編碼描述（直接命中關鍵詞 + 主題）
8. `medium`：題幹部分匹配，主題輕度相關
9. `low`：弱關聯，作為備案（建議只在 1 條主編碼之外做為次要候選）

### Schema 一致性

10. `question_id` 用三層格式 `Q{大題}.{中題?}.{小題?}`，例：`Q1.1`、`Q3.1.2`、`Q5.2.4`。
11. `stem` 保留題幹原文（含標點），不做改寫。
12. `options` 用代號當 key（`①/②/③/④` 或 `A/B/C` 或 `甲/乙/丙` 等），值為選項文字。
13. 連連看 / 配合題用 `type: "matching"`，每對配對為一題（共享選項池可重複列出）。
14. 答案缺漏（quality_flags 含 answer_empty）時，`answer` 填 `null`，並在 `_meta._known_inconsistencies` 註明。

## 自查清單（產出前必跑）

- [ ] questions[] 數 == MD 試卷部分題目數（子題分拆計算）
- [ ] 全部 codes_candidate.code 在 61 條合法清單內（檢查 chinese_codes_legal_II.json）
- [ ] 全部 code 含 `-Ⅱ-` 中綴（無任何 `-Ⅲ-` 或 `-Ⅰ-`）
- [ ] 全部 confidence 在 {high, medium, low}
- [ ] reason 平均字數 ≤50 字，且每條都引用題幹片段（不空泛）
- [ ] _summary 統計與實際 questions[] 一致
- [ ] _meta._inheritance.quality_flags 與 MD frontmatter 完全一致

## 執行流程建議

1. 讀 `{MD_PATH}` 與 `chinese_codes_legal_II.json`
2. 解析 MD frontmatter 寫入 `_meta`（注意 semester 為「四下」、subject 為「國語」）
3. 解析「## 試卷」與「## 答案」段落，逐題抽結構化
4. 對每題從 61 條中找 1-3 條最匹配的 code（四下_國語主題：注音符號/字形辨識 / 詞語理解與應用 / 句型與造句 / 閱讀理解與段落大意 / 修辭與文學表現 / 標點符號 / 寫作與語文應用）
5. 寫 `_summary` 統計
6. 自查清單跑一遍，發現違規修正
7. 寫入 `{OUTPUT_PATH}`，最後用 `python3 -c "import json; json.load(open('{OUTPUT_PATH}'))"` 驗 JSON 格式
