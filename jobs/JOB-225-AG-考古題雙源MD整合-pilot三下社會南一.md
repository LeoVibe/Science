*Created by AG at 2026-05-01 13:14*

`last_updated`: 2026-05-01 13:20
`updated_by`: Claude Code (claude-opus-4-7)

# JOB-225-AG-考古題雙源MD整合-pilot三下社會南一

**`job_type`**：`research`

定義與邊界見 **`docs/README_任務派工準則.md`** 第二章。

---

## 📌 任務背景

`knowledge/3_考古題/` 底下目前有兩份來自不同 Agent 的素材淬鍊成果：

| 來源目錄 | 抽取者 | 抽取工具 | 既知問題 |
|:--|:--|:--|:--|
| `2_MD淬鍊文字_Claude/` | Claude Code | docling / markitdown | 保留 Markdown 結構（`## 一、是非題`），但 OCR 字符常斷字（「一」變「-」、「之-」應為「之一」）；同份試卷的多個 alias 會被重複輸出兩次 |
| `2_MD淬鍊文字_Codex/` | Codex | pdfplumber | frontmatter 較嚴謹（`source_files` 結構化、`quality_flags`、`non_ws_chars`、`aliases`、`kind`、已合併重複來源）；但 PDF 雙欄排版會交錯（題號 1, 3, 4, 6... 與 2, 5, 7... 上下混亂） |

兩源各有缺陷，純規則合併無法處理字符級錯誤與雙欄交錯，需要 LLM 智慧整合。同時，下游 Agent（課綱對應、出題、盲測）需要單一、統一格式的素材檔，不應每次都讀兩份再判斷。

旁邊已存在 `2_MD淬鍊文字_整合版_Codex/` 是 JOB-223 採 Codex backbone 的嘗試，**本任務與之無關，獨立由 Claude 主導重做**，產出 `2_MD淬鍊文字_整合版_claude/`。

## 🎯 任務目標

完成 `三下_社會_南一` 24 份 logical exam group 的雙源整合，落地至：

```
knowledge/3_考古題/2_MD淬鍊文字_整合版_claude/三下/三下_社會_南一/
├── _index.json                          # 24 筆 file 記錄
├── 南一_108_大園國小_第一次段考.md
├── 南一_108_大園國小_第三次段考.md
├── ... (共 24 個 .md)
```

每份 .md 必須符合 §統一輸出格式 規範，且通過 §驗收 Checklist 全部項目。

## 🚧 任務邊界

本次任務只做：
- 處理 `knowledge/3_考古題/2_MD淬鍊文字_Claude/三下/三下_社會_南一/` 與 `..._Codex/三下/三下_社會_南一/` 的 24 份 logical exam group 整合
- 產出 `2_MD淬鍊文字_整合版_claude/三下/三下_社會_南一/` 與其 `_index.json`
- 抽樣 3 份人工驗證

本次任務**不做**（遇以下情況請停止並回報遺留問題）：
- 其他年級/科目/版本的整合（共約 60 個 combo，pilot 驗收後另開 JOB）
- 答案 PDF 為影像式者的 OCR（另開 JOB）
- 5 個長檔名殘留 .md 的清理（另開 docs_ops JOB）
- 課綱對應、出題、盲測（不在本 job_type 範圍）
- 修改規範文件
- 兩源 `_index.json` 與其原始 .md 的內容修改

## 📖 執行步驟

1. **設計整合 prompt**：給 Claude（自己，opus-4-7）使用的 prompt，輸入兩源 MD 全文 + frontmatter，輸出統一格式 MD。Prompt 必須明示：
   - 去除 alias 重複輸出
   - 修正 OCR 字符錯誤（「-」→「一」等）
   - 矯正雙欄交錯，重排題號順序
   - 合併試卷 + 答案至同份檔
   - 標註 `quality_flags`（如 `answer_empty`、`paper_full`、`ocr_corrected`）
2. **盤點 24 份 logical exam group 配對表**：依 `exam_id` 對齊兩源檔案
3. **以 dispatching-parallel-agents 分派整合**：每個 exam group 用獨立 subagent context（避免主對話 context 污染），平行處理
4. **整合產出落地**：每份檔寫入目標目錄
5. **產出 `_index.json`**：24 筆 file 記錄，欄位齊全
6. **抽樣人工驗證**：抽 3 份（短/中/長各一）對照原始 PDF（或最接近的純文字源），確認內容正確
7. **撰寫 Report**：`jobs/JOB-225-Report.md`，含三段抽樣 before/after 對照、Token/花費紀錄、遺留問題清單

## 📋 統一輸出格式（規範）

```yaml
---
publisher: 南一
academic_year: 108
source_school: 大園國小
exam_type: 第一次段考
semester: 三下
subject: 社會
combo: 三下_社會_南一
exam_id: 南一_108_大園國小_第一次段考
integration:
  method: "Claude PM 規則 + LLM 二次清洗"
  llm_model: "claude-opus-4-7"
  integrated_date: 2026-05-01
  sources:
    - agent: claude
      char_count: 1865
      tool: docling
    - agent: codex
      char_count: 0
      tool: pdfplumber
quality_flags:
  - paper_full
  - answer_empty
  - ocr_corrected
topic_hits:
  地方認同: 2
  社區營造: 1
char_count: 1865
source_pdfs:
  - filename: ...
    kind: 試卷
    sha256: ...
---

# 三下 社會 南一｜大園國小 108 學年度 第一次段考

## 整合摘要
（一段話：試卷狀態、答案狀態、LLM 做了什麼處理）

## 主題命中分析
| 主題 | 命中 | 關鍵字 |

## 試卷
（清洗後正文，題號順序正確、字符無 OCR 錯誤）

## 答案
（清洗後正文；若全空則註明「答案 PDF 為影像式，待 OCR」）

## 來源追溯
- 試卷 PDF: ...
- 答案 PDF: ...

## 整合判斷
（給後續 Agent 的決策摘要：完整度、可信度、注意事項）
```

## 📜 關鍵參考檔案

| 檔案路徑 | 用途 |
|:--|:--|
| `CLAUDE.md` | 專案指令集（角色、紀律、規範索引） |
| `docs/README_通用作業準則.md` | 三段式 Checklist、任務邊界、花費格式 |
| `docs/README_任務派工準則.md` | 派工生命週期、`job_type` 邊界 |
| `knowledge/README_研究架構總綱.md` | research 階段 KL/RM 規範 |
| `_agent/API_RULES.md` | 大規模 API 呼叫紀律（雖本任務用訂閱額度，仍套用） |
| `knowledge/3_考古題/2_MD淬鍊文字_Claude/三下/三下_社會_南一/_index.json` | Claude 源索引（24 筆） |
| `knowledge/3_考古題/2_MD淬鍊文字_Codex/三下/三下_社會_南一/_index.json` | Codex 源索引（24 筆） |

## ✅ 啟動 Checklist (Pre-Flight)

- [ ] 已讀取：`CLAUDE.md`、`docs/README_通用作業準則.md`、`docs/README_任務派工準則.md`、`knowledge/README_研究架構總綱.md`、`_agent/API_RULES.md`
- [ ] 已確認兩源 24 份短檔名 .md 都存在（diff ls 驗證）
- [ ] 已確認兩源 `_index.json` 都記載 24 筆短檔名版本
- [ ] **執行模型**：`claude-opus-4-7`（Claude Code session）
- [ ] **金鑰**：N/A（使用 Claude Code 訂閱額度，非 API key 計費）
- [ ] **操作頻次**：subagent 平行 3-5 份；不對外打 API，無 QPM 限制
- [ ] 已閱讀「任務邊界」並確認本次範圍

## ✅ 驗收 Checklist (Acceptance)

> 每一項需提供佐證（指令輸出、檔案路徑、抽樣對照），不得僅靠自我判斷打勾。

**檔案完整性**
- [ ] 24 份整合 .md 全部落地於 `2_MD淬鍊文字_整合版_claude/三下/三下_社會_南一/`（佐證：`ls | wc -l`）
- [ ] `_index.json` 落地，含 24 筆 file 記錄

**格式完整性**
- [ ] 每份檔含 6 個固定區段：`整合摘要` / `主題命中分析` / `試卷` / `答案` / `來源追溯` / `整合判斷`（佐證：`grep -c "^## " *.md`）
- [ ] frontmatter 必填欄位皆非空：`publisher` / `academic_year` / `source_school` / `exam_type` / `combo` / `exam_id` / `integration.method` / `integration.llm_model` / `quality_flags` / `char_count` / `source_pdfs[]`

**內容品質**
- [ ] 試卷正文題號順序正確（無雙欄交錯）— 抽樣 3 份對照
- [ ] 試卷正文字符乾淨（不出現「哪 - 個」「之-」等斷字錯誤）— grep 抽檢
- [ ] 試卷無 alias 重複輸出（同份內容不出兩次）
- [ ] 答案區處理：兩源皆空時明確標 `answer_empty` 並寫缺漏說明

**人工抽樣**
- [ ] 抽樣驗證 3 份檔案（短/中/長各一），對照原始 PDF 內容無誤（佐證：抽樣對照表填入 Report）

**資料追溯**
- [ ] 每份 `source_pdfs[]` 列出所有原始 PDF 與 sha256

**成本紀錄**
- [ ] Token 與花費實算紀錄（從 Claude Code session 真實資訊取，無法取得填 `-`）

## ✅ 成果 Checklist (Deliverables)

- [ ] 24 份整合 .md 落地（路徑：`knowledge/3_考古題/2_MD淬鍊文字_整合版_claude/三下/三下_社會_南一/`）
- [ ] `_index.json` 落地
- [ ] `jobs/JOB-225-Report.md` 完成（依 `_JOB-REPORT-TEMPLATE.md`）
  - [ ] 三份抽樣 before/after 對照表（事實 vs 推論清楚分區）
  - [ ] 異動清單（所有實際修改/新增的檔案路徑）
  - [ ] 真實 Token/花費紀錄
  - [ ] 遺留問題清單（含答案 OCR、全量擴展、長檔名殘留三項）
- [ ] 已執行 `/pj_sync`
- [ ] Discord `1487738477608177714` 結案回報

## ⚠️ 風險與 fallback

| 風險 | 機率 | 應對 |
|:--|:--:|:--|
| LLM 整合品質仍有字符錯誤 | 低 | Prompt 加強具體範例；抽樣失敗則調整 prompt 重跑該檔 |
| 兩源都空的 exam group | 確定有（如大園 108 第一次 Codex 全空） | 以非空源為主；若兩源皆空則標 `extract_failed` 並列入遺留問題 |
| 主對話 context 被原始試卷塞滿 | 中 | 採 subagent 機制每份獨立 context；主對話只看回傳結果 |

## 🚧 遺留問題（pilot 不處理，於 Report 列出）

1. 答案 PDF 為影像式者的 OCR
2. 全量擴展至其他 combo（國/數/自/英 × 三~六下 × 各版本，共約 60 個 combo）
3. Claude 源 5 個長檔名殘留 .md 的清理

## 真實回報本次對話的模型與花費

＄作業匯總：Token數:{真實Meta中數字} | 花費: ${換算台幣 — 訂閱額度內填「訂閱包」} | 使用模型: claude-opus-4-7 | 執行者: Claude
