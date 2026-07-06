*Created by AG at 2026-04-30 21:34*

`last_updated`: 2026-05-01 08:05
`updated_by`: Codex (GPT-5)

# JOB-223-AG-三四五六下考古題全格式重轉MD-Codex品質對照

**`job_type`**：`engineering`

## 📌 任務背景

`JOB-216` 已完成三下、四下、五下、六下共 60 個組合的考古題轉檔，並產出一套 Claude 版成果：

- 輸出根目錄：`knowledge/3_考古題/2_MD淬鍊文字_Claude/`
- 現況：`1083` 份 `.md`、`60` 份 `_index.json`、`41` 份 `_doc_index.json`

本次要重開一條 **Codex 平行轉檔線**，直接從原始檔重新建置，不覆蓋既有 Claude 版：

- 來源根目錄：`knowledge/3_考古題/1_原始檔/`
- 目標根目錄：`knowledge/3_考古題/2_MD淬鍊文字_Codex/`
- 實體目標路徑：`/Users/s389080/Documents/doc/work/0_AI_Project/eidosProject/knowledge/3_考古題/2_MD淬鍊文字_Codex`

目前已盤點到的來源規模如下：

- 60 個 combo（四學期各 15 個）
- 來源總數 `3956` 份；可轉檔來源共 `3914` 份：`3659` PDF、`214` DOC、`41` DOCX
- 圖片 OCR 經 pilot 驗證品質不穩，`8` 份 JPG 改列跳過，不納入主轉檔目標
- 原先偵測到的 iCloud 佔位符已 materialize；最終 audit 顯示 `.icloud` placeholder `0` 份
- 明確排除的非本次格式：`32` 份音訊/影音與其他非文字附件（`mp3`/`m4a`/`wav`/`aac`/`mp4` 等）

前次分析顯示，Codex 路線在「正文保真、少噪音」上較好；Claude 路線在「frontmatter、標題、索引結構」上較完整。但 Claude 版目前也存在以下已知問題：

- `815` 筆 PDF index entry 中，`292` 筆 school metadata 可疑
- `105` 筆 year 為未知值
- `316` 處原文被 `8000` 字截斷
- `144` 份 MD 有明顯空 code block 訊號
- 部分 `_index.json` 的 `path` 仍指向舊的 `2_MD淬鍊文字/`，與實際輸出路徑不一致

本單目標不是單純「再跑一次」，而是做出一個 **兼顧 Codex 正文品質與 Claude 結構可讀性** 的新版成果，並用量化方式比較兩邊品質。

## 🎯 任務目標

- 在 `knowledge/3_考古題/2_MD淬鍊文字_Codex/` 下完成三下、四下、五下、六下共 `60` 個 combo 的平行輸出。
- 對所有可轉格式建立可追溯結果：PDF 進 `_index.json`，Word 類另建 `_doc_index.json`。
- 新版 Codex 輸出必須保留完整正文，不得再出現 `僅顯示前 8000` 或 `...（截斷）` 這類截斷標記。
- 新版 renderer 不得產生空白的「原文」區段樣板。
- 所有新產出的 `_index.json` 之 `path` 欄位都必須指向 `knowledge/3_考古題/2_MD淬鍊文字_Codex/...`。
- 最終需產出 Claude vs Codex 的品質比較報告，至少涵蓋：完整度、metadata 正確率、正文保真度、Markdown 結構可讀性、噪音量。
- 若最終結論是「Codex 版更好」，報告中必須提供量化佐證；若沒有更好，必須如實回報，不可硬判優勝。

## 🚧 任務邊界

本次任務只做：

- 三下、四下、五下、六下考古題的 PDF / DOC / DOCX 轉 Markdown
- 以 `knowledge/3_考古題/2_MD淬鍊文字_Codex/` 為唯一輸出位置建立新版成果
- 視需要先將 `.icloud` 佔位符 materialize 成本機實體檔後再轉檔
- 建立或新增本單專用的轉檔、比較、驗證腳本
- 產出對照 Claude 版的品質分析與結案報告

本次任務不做（遇到以下情況請停止並回報，不可自行延伸）：

- 不覆蓋、不刪除、不重寫 `knowledge/3_考古題/2_MD淬鍊文字_Claude/`
- 不做音訊或影音轉文字（`mp3`/`m4a`/`wav`/`aac`/`mp4` 不在本單範圍）
- 不做圖片 OCR；JPG 僅在 manifest / report 中列為跳過項
- 不修改課綱研究區、題庫產出區或其他與考古題轉檔無關之內容
- 不在未驗證前直接改寫 `scripts/job207_distill_to_md.py` 的既有產線行為
- 不修改規範文件（除非本單後續明確擴充範圍）
- 超出上列範圍的任何變更

## 📖 執行步驟

### Phase 0 — Baseline 與前置盤點

1. 重新掃描 `knowledge/3_考古題/1_原始檔/`，建立四學期來源 manifest。
2. 確認 `2_MD淬鍊文字_Claude` 的基線數字，作為比較對象。
3. 盤點 `.icloud` 佔位符，必要時先下載為本機可讀檔。
4. 建立 `Codex` 目標目錄與進度追蹤檔。

### Phase 1 — Pilot Benchmark

1. 挑代表樣本做小規模 benchmark：
   - 國語豎排題本
   - 數學版面題
   - 掃描件 PDF
   - DOC / DOCX
   - JPG 品質不穩，列為 skip image，不進主批次
2. 比較至少一組「正文保真」引擎與一組「結構化」引擎或後處理方案。
3. 定出版型策略，不預設所有科目只用同一套引擎。

### Phase 2 — 實作 Codex 專用管線

1. 新建本單專用腳本，避免直接污染既有 `JOB-216` / `job207` 產線。
2. 實作輸出格式：
   - frontmatter
   - 主標題
   - 試卷 / 答案 / 原文追溯
   - `_index.json` / `_doc_index.json`
3. 修正已知痛點：
   - 不截斷正文
   - 避免空 code block
   - 提升 school / year / exam_type parsing
   - `path` 欄位寫入真實 Codex 目錄

### Phase 3 — 全批重轉

1. 依學期 / 科目 / 出版社分 wave 執行，並保留續跑能力。
2. PDF、Word 各自記錄成功、失敗、跳過與補救方式；JPG 僅記錄為 skip image。
3. 若某類檔案需 fallback，引擎切換需在 log 與 report 中留痕。

### Phase 4 — 品質驗證與 A/B 比較

1. 對 Claude / Codex 兩版建立統一的比較指標。
2. 至少量化以下項目：
   - combo 覆蓋率
   - md 數量與索引數量
   - suspicious school / unknown year
   - 空白原文區塊數
   - 截斷標記數
   - 原文保真度抽樣
   - Markdown 結構可讀性抽樣
3. 若部分 combo 無法明顯優於 Claude，需在報告逐項說明原因。

### Phase 5 — 結案

1. 產出 `JOB-223-Report.md`。
2. 明列新增腳本、輸出根目錄、比較結論與殘留風險。
3. 依專案流程完成 close 與同步。

## 📜 關鍵參考檔案

| 檔案路徑 | 用途 |
|:--|:--|
| `README.md` | 專案總覽、L0/L1/L2 閱讀順序、任務啟動原則 |
| `CLAUDE.md` | 專案 PM / architect 作業模式與派工準則 |
| `docs/README_通用作業準則.md` | JOB 必備三份 checklist 與通用工作規範 |
| `docs/README_任務派工準則.md` | 建單、結案、job_type 與命名規則 |
| `docs/長時任務執行範本.md` | 長時批次任務的分 wave、續跑與回報模式 |
| `knowledge/3_考古題/README.md` | 考古題資料結構與既有 SOP 說明 |
| `jobs/JOB-216-AG-四五六下考古題PDF全批轉MD-45組合2529份.md` | 前次批次轉檔派工單 |
| `jobs/JOB-216-Report.md` | 前次轉檔成果與踩坑紀錄 |
| `scripts/job207_distill_to_md.py` | 既有 PDF/DOC 轉 MD 腳本，供策略參照 |

## ✅ 啟動 Checklist (Pre-Flight)
> 每一項打勾前必須確實完成，不得預先全部打勾。

- [x] 已讀取：`README.md`、`CLAUDE.md`、`docs/README_通用作業準則.md`、`docs/README_任務派工準則.md`
- [x] 已讀取：`docs/長時任務執行範本.md`、`knowledge/3_考古題/README.md`
- [x] 已讀取：`jobs/JOB-216-AG-四五六下考古題PDF全批轉MD-45組合2529份.md`、`jobs/JOB-216-Report.md`
- [x] 已盤點來源與目標路徑，確認本單目標為 `knowledge/3_考古題/2_MD淬鍊文字_Codex/`
- [x] 已確認比較對象為 `knowledge/3_考古題/2_MD淬鍊文字_Claude/`
- [x] 已確認本單範圍調整為 `PDF / DOC / DOCX`，排除音訊 / 影音，JPG 改列跳過
- [x] 已建立本單專用 manifest / progress 檔
- [x] 已完成第一輪 pilot benchmark，結果已寫入 `_manifest/JOB223_pilot_*`
- [x] 已確認實際執行模型與工具鏈版本：Codex GPT-5；Python 3.11.2；MarkItDown 0.1.5；Docling 2.9.0；pdfplumber 0.11.9；PyMuPDF 1.27.2.2；LibreOffice 26.2.2.2
- [x] 已閱讀「任務邊界」並確認本次範圍

## 🧭 執行進度紀錄

### 2026-05-01 00:06

- 已完成 3/60 個 combo：`三下_數學_翰林`、`四下_國語_南一`、`四下_數學_南一`
- Codex 目前產出：`93` 份 `.md`、`3` 份 `_index.json`、`2` 份 `_doc_index.json`
- `四下_數學_南一` 已完成 `55/55` 組，問題旗標 `18` 組
- 已補強 `scripts/JOB223_distill_to_md.py`：未來有 Word 來源的 combo 會同步產生 `_doc_index.json`
- 已回補既有 Word 來源索引：`三下_數學_翰林` 2 筆、`四下_數學_南一` 8 筆；`四下_國語_南一` 無 Word 來源，故不產生 `_doc_index.json`
- 已確認 JPG / OCR 不納入主批次，僅於 manifest / report 記錄為 skip image

### 2026-05-01 00:31

- 已完成 10/60 個 combo，Codex 目前產出：`189` 份 `.md`、`10` 份 `_index.json`、`2` 份 `_doc_index.json`
- 新增完成：`六下_數學_康軒`、`六下_數學_翰林`、`四下_數學_翰林`、`六下_英語_翰林`、`六下_自然_翰林`、`六下_國語_康軒`、`四下_英語_翰林`
- 已根據 `六下_國語_康軒` 實測修正國語直排抽取策略：降低乾淨 `pymupdf_vertical` 的早停門檻，並避免 `vertical_spacing_noise` 的 `pdfplumber` 候選太早勝出
- `六下_國語_康軒` 重跑後 `vertical_spacing_noise` 由 4 份降為 0 份，issue files 由 9 份降為 5 份
- 目前仍保留的 issue 以 `empty_extract`、`answer_empty`、`paper_empty`、`missing_answer` 為主，初步判斷多與掃描型 PDF、來源缺答案或被排除的附件格式有關

### 2026-05-01 00:39

- 已完成 12/60 個 combo，Codex 目前產出：`248` 份 `.md`、`12` 份 `_index.json`、`4` 份 `_doc_index.json`
- 新增完成含 Word 組合：`四下_數學_康軒` 26/26 組，`_doc_index.json` 7 筆；`六下_社會_翰林` 33/33 組，`_doc_index.json` 3 筆
- 已確認正式批次中的 Word 來源索引會記錄：原檔名、status、engine、out_md、char_count、kind、source_relpath、sha256、quality_flags
- 目前 dashboard 顯示無 blocked combo；後續可繼續擴大到無 iCloud 的 Word/PDF 混合組，再處理 iCloud 佔位符組合

### 2026-05-01 00:55

- 已完成 15/60 個 combo，達到本單四分之一進度；Codex 目前產出：`351` 份 `.md`、`15` 份 `_index.json`、`7` 份 `_doc_index.json`
- 新增完成：`四下_國語_翰林`、`五下_社會_翰林`、`五下_社會_康軒`
- `四下_國語_翰林` 完成 31/31 組，`_doc_index.json` 3 筆，`vertical_spacing_noise` 0 份
- `五下_社會_翰林` 完成 34/34 組，`_doc_index.json` 4 筆
- `五下_社會_康軒` 完成 38/38 組，`_doc_index.json` 2 筆；issue 較高，後續 report 需列入掃描 / 空抽取複核
- 目前無 blocked combo；已完成的主要風險類型包含 PDF-only、國語直排、Word 混合與跨出版社社會科

### 2026-05-01 08:05

- 全批轉檔已完成：`60/60` 個 combo 全部 `done`，`running=0`、`pending=0`、`blocked=0`
- 最終 Codex 輸出：`1834` 份已索引 `.md`、`60` 份 `_index.json`、`41` 份 `_doc_index.json`
- 各學期皆完成：三下 `15/15`、四下 `15/15`、五下 `15/15`、六下 `15/15`
- iCloud 佔位符處理完成，`JOB223_audit_icloud.py` 驗證 `placeholder_count=0`
- dry-run 驗證無剩餘任務：`Selected 0 combos for mode=all-pending sort=size-asc`
- 內容驗證：`all_md=1834`、`indexed_md=1834`、`extra_unindexed=0`、`missing_indexed=0`、`path_bad=0`
- 品質驗證：截斷標記 `0` 份、空 fenced code block `0` 份、空白原文 heading `0` 份
- 清理 5 份早期重跑留下的 unindexed stale md，確保輸出樹與索引完全一致
- 已產出 `jobs/JOB-223-Report.md`，記錄 Claude vs Codex 量化比較、已知限制與後續建議

## ✅ 驗收 Checklist (Acceptance)
> 每一項需提供佐證（數字、指令輸出、抽樣結果），不得僅靠自我判斷打勾。

- [x] `knowledge/3_考古題/2_MD淬鍊文字_Codex/` 下 60 個 combo 全部完成建置
- [x] `60` 個 combo 皆有 `_index.json`
- [x] 有 Word 來源的 combo 均有 `_doc_index.json`，或於 report 清楚標示例外
- [x] 新版 Codex 輸出 `0` 筆 `僅顯示前 8000` / `...（截斷）`
- [x] 新版 Codex 輸出 `0` 份 renderer 造成的空白原文區塊
- [x] 所有 `_index.json.path` 均指向 `knowledge/3_考古題/2_MD淬鍊文字_Codex/...`
- [x] 品質比較報告已量化 Claude vs Codex 的完整度、metadata、正文保真度、結構可讀性、噪音量
- [x] 若宣告 Codex 版優於 Claude 版，Report 已提供可驗證佐證；若未優於，Report 已明確說明

## ✅ 成果 Checklist (Deliverables)
> 每一項需在 Report 中有對應的實際內容。不得用「已完成」「如上」「見程式碼」等抽象詞代替。

- [x] `jobs/JOB-223-Report.md` 已產出
- [x] 本單新增或修改的腳本路徑已完整列於 Report
- [x] `knowledge/3_考古題/2_MD淬鍊文字_Codex/` 的輸出結構與索引規格已於 Report 說明
- [x] Claude vs Codex 比較結論已在 Report 具體列出
- [x] 若有失敗檔、低品質檔、需人工複核檔，已在 Report 明列清單
- [ ] 已依流程執行 close、同步必要進度文件，並完成 `/pj_sync`

## 真實回報本次對話的模型與花費

本檔為派工單建立階段；實際執行模型、Token 與花費請於 `JOB-223-Report.md` 依真實執行情況填寫。
