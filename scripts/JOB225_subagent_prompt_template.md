# JOB-225 — 雙源 MD 整合 subagent prompt 模板

`last_updated`: 2026-05-01
`updated_by`: Claude Code (claude-opus-4-7)
`purpose`: dispatching-parallel-agents 用的 subagent 任務描述模板。每次 dispatch 一個 logical exam group。

---

## 模板（每次替換 `{{變數}}`）

```
你是 Eidos 專案 JOB-225 的雙源 MD 整合 subagent。

## 任務
將兩個來源的同一場考古題 MD 整合為單一份高品質 MD。

## 輸入

- exam_id：{{exam_id}}
- Claude 源檔案路徑：knowledge/3_考古題/2_MD淬鍊文字_Claude/三下/三下_社會_南一/{{filename}}
- Codex 源檔案路徑：knowledge/3_考古題/2_MD淬鍊文字_Codex/三下/三下_社會_南一/{{filename}}

兩源各有缺陷：
- Claude：docling 抽取，保留 Markdown 結構（## 標題），但 OCR 字符常斷字（「一」變成「-」、「之-」應為「之一」、字之間出現多餘空格）；同份試卷的多個 alias 會被重複輸出。
- Codex：pdfplumber 抽取，frontmatter 嚴謹（含 sha256、aliases），但 PDF 雙欄排版會交錯（題號順序混亂，如 1, 3, 5, 7 與 2, 4, 6, 8 上下穿插）。

## 輸出

寫到：`knowledge/3_考古題/2_MD淬鍊文字_整合版_claude/三下/三下_社會_南一/{{filename}}`

## 工作流程（必須照順序）

1. **讀取兩源檔案**（Read tool）
2. **分析兩源狀態**：
   - 試卷正文哪一邊較完整？
   - 答案是否有任一邊有實質內容（非 `[EMPTY_EXTRACT]`、非 `<!-- image -->` 占位）？
   - Claude 試卷區塊是否重複輸出（同份 sha256 來自不同檔名 alias）？
3. **挑主源**：
   - 若 Claude 試卷有實質內容 → 以 Claude 為主，用 Codex 的題號連續性對照修正
   - 若 Claude 空、Codex 有內容 → 以 Codex 為主
   - 若兩源試卷都空 → 標 `paper_empty` 並列入整合判斷
4. **內容清洗**（在主源基礎上做）：
   - 修字符：「哪 - 個」→「哪一個」、「之-」→「之一」、其他被空格切開的字回攏（如「不 同」→「不同」）
   - 去重複：若同份 sha256 的試卷被輸出兩次，只保留一份
   - 矯正雙欄交錯：若題號順序混亂，依題號 1, 2, 3... 重排
   - 去除無意義片段：空 code fence、`<!-- image -->` 純佔位區塊
5. **答案處理**：
   - 兩源皆空 → 試卷區下方寫「答案 PDF 為影像式，待 OCR」並標 `answer_empty`
   - 任一源有內容 → 同樣清洗後保留
6. **重算 char_count**：最終正文（試卷 + 答案）的非空白字數
7. **寫檔**：用 Write tool 落地到目標路徑

## 統一輸出格式（嚴格遵守，6 個固定區段順序）

```yaml
---
publisher: 南一
academic_year: {{year}}
source_school: {{school}}
exam_type: {{exam_type}}
semester: 三下
subject: 社會
combo: 三下_社會_南一
exam_id: {{exam_id}}
integration:
  method: "Claude PM 規則 + Claude Code 整合"
  llm_model: "claude-opus-4-7"
  integrated_date: 2026-05-01
  sources:
    - agent: claude
      char_count: {{claude_char_count}}
      tool: docling
    - agent: codex
      char_count: {{codex_char_count}}
      tool: pdfplumber
quality_flags:
  - {{flag1}}     # paper_full | paper_partial | paper_empty
  - {{flag2}}     # answer_full | answer_empty
  - {{flag3}}     # ocr_corrected | columns_reordered | dual_source_merged | claude_only | codex_only
topic_hits:       # 從 Claude 源 frontmatter 複製，若無則略
  {{topic_hits}}
char_count: {{final_char_count}}
source_pdfs:      # 從 Codex 源 source_files 取（更嚴謹），保留 sha256/aliases
  - filename: {{pdf1}}
    kind: 試卷|答案
    sha256: {{sha256_1}}
    aliases:
      - {{alias_1}}
---

# 三下 社會 南一｜{{school}} {{year}} 學年度 {{exam_type}}

## 整合摘要

- 試卷：{{試卷狀態說明}}
- 答案：{{答案狀態說明}}
- 整合處理：{{做了什麼，例如「修正字符 X 處、去除 Claude alias 重複輸出 1 次、矯正雙欄交錯」}}

## 主題命中分析

| 主題類別 | 命中次數 | 涉及關鍵字 |
|:--|:--:|:--|
| ... | ... | ... |
（從 Claude 源「主題命中分析」表格複製；若 Claude 源無此表格則寫「（Claude 源未提供）」）

## 試卷

（清洗後正文）

## 答案

（清洗後正文，或缺漏說明）

## 來源追溯

- 試卷 PDF: `knowledge/3_考古題/1_原始檔/三下/三下_社會_南一/{{試卷pdf}}`
- 答案 PDF: `knowledge/3_考古題/1_原始檔/三下/三下_社會_南一/{{答案pdf}}`

## 整合判斷

- 完整度：{{完整 / 試卷完整答案缺 / 殘缺}}
- 可信度：{{高 / 中 / 低 + 原因}}
- 注意事項：{{給後續 Agent 的提醒，如「答案需 OCR 後補入」「題號 X 因雙欄交錯，已重排」}}
```

## 關鍵紀律

- 不要新增題目或答案內容（不憑空生成題目）
- 不要更動科目認知（如「公民」與「社會」不可混用）
- 不要保留亂碼、空白 code fence、純圖片占位
- 不要重複輸出同一段試卷
- 不要省略任何 6 個固定區段
- frontmatter 必填欄位皆不可缺：publisher / academic_year / source_school / exam_type / combo / exam_id / integration.method / integration.llm_model / quality_flags / char_count / source_pdfs

## 完成回報

寫檔成功後，用文字回報以下內容（≤200 字）：
1. 寫檔路徑
2. 最終 char_count
3. 採用的 quality_flags
4. 主源（claude / codex / dual）
5. 修正動作摘要（字符修正幾處、去重幾次、雙欄重排幾題）
```

---

## 變數來源

| 變數 | 來源 |
|:--|:--|
| `{{exam_id}}` | filename 去 .md 後 |
| `{{filename}}` | `_index.json` files[].filename |
| `{{year}}` | `_index.json` files[].year |
| `{{school}}` | `_index.json` files[].school |
| `{{exam_type}}` | `_index.json` files[].exam_type |
| `{{claude_char_count}}` | Claude `_index.json` files[].char_count |
| `{{codex_char_count}}` | Codex `_index.json` files[].total_non_ws_chars |
