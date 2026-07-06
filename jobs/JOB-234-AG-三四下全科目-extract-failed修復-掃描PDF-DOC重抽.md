*Created by Claude Code (claude-sonnet-4-6) at 2026-05-14 09:40*

`last_updated`: 2026-05-14 09:40
`updated_by`: Claude Code (claude-sonnet-4-6)

# JOB-234-AG-三四下全科目-extract_failed修復-掃描PDF+DOC重抽

**`job_type`**：`engineering`
**`executor`**：Claude Code（Phase 0 腳本製作）+ Codex CLI（Phase 2 OCR 批次）

---

## 📌 任務背景

JOB-228~233 對三下/四下 社會+自然進行 L2 結構化抽取，但部分 MD 整合版檔案標記 `extract_failed`，導致這些試卷無內容可供抽取。

品質普查（2026-05-14）發現三下/四下全科目共 **118 份** extract_failed，確認兩種根因：

1. **掃描 PDF**（~100 份）：原始 PDF 為影像掃描型，pdfplumber 抽取 char_count = 0，需 LLM Vision OCR
2. **DOC 格式**（~15 份）：原始檔為 `.doc`，pdfplumber 不支援，soffice 逾時 120s 失敗

原始檔全數存在於 `knowledge/3_考古題/1_原始檔/{grade}/{combo}/`，具備重新抽取的條件。

---

## 🎯 任務目標

1. 所有 118 份 extract_failed 的 MD 整合版，其中 **可修復份數** 完成內容填充（去除 `extract_failed` flag，更新 `char_count`）
2. `_repair_report_JOB234.json` 記錄：每份處理結果（成功/失敗/跳過），修復前後 char_count
3. 修復後 MD 檔案可直接作為 L2 結構化抽取輸入（三下/四下 社會+自然優先受益）
4. 人工無法修復的案例（PDF 加密/損壞確認）明確列出並標記 `permanently_failed`

---

## 🚧 任務邊界

**只做**：
- Phase 0：產修復清單腳本（Python）
- Phase 1：DOC 格式重抽（python-docx，不使用 LLM）
- Phase 2：掃描 PDF OCR（pdftoppm + Codex vision，並行 4 條）
- Phase 3：驗證腳本 + 產出 `_repair_report_JOB234.json`
- 直接覆寫 `2_MD淬鍊文字_整合版` 對應 MD（frontmatter 保留，content + flags 更新）

**不做**：
- 重跑 JOB-226 雙源整合流程
- 修改尚未標記 extract_failed 的 MD 檔案
- 擴展到五下/六下
- 修改 L2 JSON 產出（整合版 MD 修復後，L2 重抽為後續獨立 JOB）
- 修改規範文件

---

## 📖 執行步驟

| Phase | 內容 | 執行者 | 預估時間 |
|:--|:--|:--|:--:|
| Phase 0 | 產修復清單腳本：掃描 118 份 → 配對原始檔 → 分類 DOC/掃描PDF/無法配對 → 產 `_repair_manifest.json` | Claude | 30 min |
| Phase 1 | DOC 批次重抽：python-docx 逐份讀取 → 格式化 MD → 覆寫整合版 | Claude | 20 min |
| Phase 2 | 掃描 PDF OCR：pdftoppm → PNG → Codex vision OCR → 覆寫整合版（並行 4 條） | Codex × 4 | ~3-5 hr |
| Phase 3 | 驗證 + 產 `_repair_report_JOB234.json` | Python | < 5 min |
| Phase E | JOB-234-Report.md | Claude | 10 min |
| **總計** | — | — | **~5-7 hr** |

---

## 📜 關鍵參考檔案

| 檔案路徑 | 用途 |
|:--|:--|
| `_agent/skills/ei_md_extract/SKILL.md` | PDF/DOC 轉 MD 工程經驗集（工具選型、OCR prompt、坑記錄）|
| `knowledge/3_考古題/2_MD淬鍊文字_整合版/三下/` | 待修復 MD 目標目錄（三下）|
| `knowledge/3_考古題/2_MD淬鍊文字_整合版/四下/` | 待修復 MD 目標目錄（四下）|
| `knowledge/3_考古題/1_原始檔/三下/` | 原始 PDF/DOC 來源（三下）|
| `knowledge/3_考古題/1_原始檔/四下/` | 原始 PDF/DOC 來源（四下）|
| `scripts/jobs/JOB-234/` | 本 JOB 所有腳本放置目錄 |

---

## 📐 技術規格

### Phase 0：修復清單產生（`A0_build_repair_manifest.py`）

輸出 `scripts/jobs/JOB-234/_repair_manifest.json`，每筆格式：

```json
{
  "exam_id": "翰林_108_草港國小_第一次段考",
  "grade": "三下",
  "combo": "三下_自然_翰林",
  "md_path": "knowledge/3_考古題/2_MD淬鍊文字_整合版/三下/三下_自然_翰林/翰林_108_草港國小_第一次段考.md",
  "source_type": "scanned_pdf",
  "original_files": [
    "knowledge/3_考古題/1_原始檔/三下/三下_自然_翰林/縣立草港國小 三年級 108 下學期 自然科學領域 自然 第一次段考 期中考 翰林 試卷.pdf",
    "knowledge/3_考古題/1_原始檔/三下/三下_自然_翰林/縣立草港國小 三年級 108 下學期 自然科學領域 自然 第一次段考 期中考 翰林 答案.pdf"
  ],
  "original_files_found": true,
  "repair_status": "pending"
}
```

`source_type` 值：`scanned_pdf` / `doc_format` / `unknown_pdf` / `no_original_found`

### Phase 1：DOC 重抽（`B1_repair_doc_files.py`）

- 使用 `python-docx`（`from docx import Document`）
- 輸出格式：保留整合版 frontmatter，替換 content 段落
- quality_flags 更新：移除 `extract_failed`、`paper_empty`；加入 `docx_extracted`
- integration.method 更新：`"JOB-234 python-docx 重抽"`

### Phase 2：掃描 PDF OCR（`B2_repair_scanned_pdfs.sh`）

每份流程：
```bash
# 1. PDF → PNG（每頁 dpi=200）
pdftoppm -png -r 200 "試卷.pdf" tmp_imgs/exam_page
pdftoppm -png -r 200 "答案.pdf" tmp_imgs/ans_page

# 2. Codex vision OCR（送 prompt + 圖片）
codex exec --skip-git-repo-check --full-auto \
  "$(cat scripts/jobs/JOB-234/ocr_prompt_template.md | \
     sed 's|{EXAM_ID}|...|g' | \
     sed 's|{OUTPUT_PATH}|...|g')"
```

OCR prompt 必含（依 ei_md_extract SKILL.md §2.3 規範）：
- 保留原文順序，不重排不增刪
- 中文字之間若有多餘空白請去掉
- 表格輸出 markdown table
- 不確定的字用 `[?]` 標記，不要亂猜
- 只輸出 MD 內容本身，不要 code fence

quality_flags 更新：移除 `extract_failed`、`paper_empty`；加入 `ocr_used`

watchdog：單份 timeout = 1500s（依 SKILL.md §3.3）；並行 PARALLEL = 4

### Phase 3：驗證（`C_validate_repairs.py`）

對每份修復後 MD 檢查：
- char_count 是否 > 500（基本內容門檻）
- frontmatter 是否完整（exam_id / quality_flags / char_count 欄位存在）
- `extract_failed` 是否已從 quality_flags 移除
- 寫入 `scripts/jobs/JOB-234/_repair_report_JOB234.json`

---

## ✅ 啟動 Checklist (Pre-Flight)

- [ ] `python-docx` 已安裝（`pip install python-docx`）
- [ ] `pdftoppm` 可用（`which pdftoppm`，屬於 poppler-utils）
- [ ] Codex CLI 可用（`codex --version`）
- [ ] `knowledge/3_考古題/1_原始檔/三下/` 與 `四下/` 目錄可讀取
- [ ] `scripts/jobs/JOB-234/` 目錄已建立
- [ ] 已閱讀 `_agent/skills/ei_md_extract/SKILL.md`（OCR 工具選型 + prompt 規範）
- [ ] 已確認執行模型：Codex CLI gpt-5.5（Phase 2 OCR）+ Claude Sonnet 4.6（腳本製作）
- [ ] 已閱讀「任務邊界」並確認本次範圍

---

## ✅ 驗收 Checklist (Acceptance)

- [ ] `_repair_manifest.json` 存在，涵蓋 118 份 extract_failed（或確認實際數）
- [ ] Phase 1 DOC 重抽：所有 `doc_format` 類型完成，char_count > 500
- [ ] Phase 2 掃描 PDF OCR：完成率 ≥ 90%（`no_original_found` 除外）
- [ ] Phase 3 驗證：修復後 MD 無殘留 `extract_failed` flag
- [ ] `_repair_report_JOB234.json` 存在，記錄每份修復狀態
- [ ] 三下/四下 社會+自然 extract_failed 歸零（或列出永久無法修復清單）

---

## ✅ 成果 Checklist (Deliverables)

- [ ] `scripts/jobs/JOB-234/_repair_manifest.json`
- [ ] `scripts/jobs/JOB-234/_repair_report_JOB234.json`
- [ ] 修復後 MD 已覆寫至 `2_MD淬鍊文字_整合版/三下/` 與 `四下/`
- [ ] `jobs/JOB-234-Report.md` 完成
- [ ] 進度總表已同步（`docs/進度彙整_題庫研發與產出.md`）
- [ ] `docs/README_專案發展紀錄.md` 新增 JOB-234 記錄
- [ ] 已執行 `/pj_sync`
- [ ] `node scripts/job_manager.js close JOB-234`
- [ ] Discord 結案回報送 chat_id `1487738477608177714`
- [ ] git commit（最終結案）

---

## ⏱️ 執行時間回報

| 子任務 / 階段 | 開始時間 | 結束時間 | 耗時（分鐘） | 備註 |
|:--|:--|:--|:--|:--|
| Phase 0 清單腳本 | — | — | — | Claude |
| Phase 1 DOC 重抽 | — | — | — | Claude |
| Phase 2 掃描 PDF OCR | — | — | — | Codex × 4 並行 |
| Phase 3 驗證 | — | — | — | — |
| **總計** | — | — | — | — |

---

## 真實回報本次對話的模型與花費

＄作業匯總：Token 數: -- | 花費: --（Claude Pro 訂閱 + Codex ChatGPT Plus 訂閱）| 使用模型: Claude Sonnet 4.6（腳本）+ Codex CLI gpt-5.5（OCR 批次）| 執行者: Claude + Codex

---

## 邊界與遺留

- 修復範圍僅限三下/四下；五下/六下如有 extract_failed 需另開 JOB
- DOC 重抽後內容為純文字（無圖片），若原 DOC 含圖片題目，題目內容仍可能不完整
- OCR 結果品質取決於原始 PDF 掃描解析度；低解析度檔案可能仍有亂碼，標記 `ocr_low_confidence`
- L2 重抽（對修復後 MD 補做 L2 extraction）不在本 JOB 範圍，後續由 PM 決定是否開 JOB-235
