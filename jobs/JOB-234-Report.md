*Created by AG at 2026-05-14 20:10*

`last_updated`: 2026-05-14 20:10
`updated_by`: Claude Code (claude-sonnet-4-6)

# JOB-234 結案報告

**`job_type`**：`engineering`
**`executor`**：AG（Claude Code + ocrmac Vision）

## 📊 成果摘要

修復三下／四下全科目 118 份 `extract_failed` 整合版 MD，實際成功 117 份（1 份無原始檔，永久 skip）。
DOC 格式（22 份）走 `textutil + python-docx + olefile + ocrmac` 多路徑重抽；掃描 PDF（95 份）以 `PyMuPDF + macOS Vision (ocrmac)` 本地 OCR 逐頁處理，並修正掃描頁面 rotation=270 問題。
Phase 3 驗證：117 pass / 0 fail / 0 error；全部 `extract_failed` flag 已移除，對應修復標記 `docx_extracted` / `ocr_used` 已寫入。

| 指標 | 數值 |
|:--|:--|
| 總修復目標 | 118 份 |
| 成功修復 | 117 份 |
| 永久失敗 | 1 份（無原始檔） |
| Phase 3 pass | 117 / 117 |
| 平均 char_count | 4,690 字元 |
| char_count 範圍 | 500 ~ 11,719 |

## 📋 各階段成果

| Phase | 說明 | 數量 | 成功 | 失敗 |
|:--|:--|:--|:--|:--|
| A0 manifest 建立 | 分類 118 份為 scanned_pdf / doc_format / no_original_found | 118 | — | — |
| B1 DOC 重抽 | textutil / python-docx / olefile+ocrmac 三路徑 | 22 | 22 | 0 |
| B2 掃描 PDF OCR | PyMuPDF + ocrmac Vision（PARALLEL=4，DPI=150） | 95 | 95 | 0 |
| C 驗證 | char_count > 500 + frontmatter + repair flag | 118 | 117 pass | 1 skipped |

**技術決策記錄**：
- Pilot 10 比較測試（A=ocrmac vs B=Codex Vision）：Codex Vision 首份即 timeout 600s；ocrmac 10/10 成功，avg 16s/file，CJK 比例國語/社會/自然 64-74%
- rotation=270 修正：PyMuPDF 渲染後用 PIL rotate(+90) 修正，否則 OCR 輸出亂碼
- olefile JPEG 提取：兩份影像嵌入型 .doc（翰林_108_內安國小、康軒_108_內安國小）掃描 OLE WordDocument stream，提取 JPEG > 5KB，成功 OCR 出 3317 / 7045 字元

## 📂 異動清單

| 檔案路徑 | 異動類型 | 說明 |
|:--|:--|:--|
| `knowledge/3_考古題/2_MD淬鍊文字_整合版/三下/**/*.md` | 修改（56 份） | extract_failed → ocr_used/docx_extracted |
| `knowledge/3_考古題/2_MD淬鍊文字_整合版/四下/**/*.md` | 修改（61 份） | 同上 |
| `scripts/jobs/JOB-234/A0_build_repair_manifest.py` | 新增 | manifest 建構腳本 |
| `scripts/jobs/JOB-234/B1_repair_doc_files.py` | 新增 | DOC 重抽腳本（含 olefile+ocrmac 路徑） |
| `scripts/jobs/JOB-234/B2_repair_scanned_pdfs.py` | 新增 | 掃描 PDF OCR 腳本（PyMuPDF + ocrmac） |
| `scripts/jobs/JOB-234/C_validate_repairs.py` | 新增 | 修復後驗證腳本 |
| `scripts/jobs/JOB-234/_repair_manifest.json` | 新增 | 118 份分類 manifest |
| `scripts/jobs/JOB-234/_doc_repair_log.json` | 新增 | Phase 1 結果 log：22/22 success |
| `scripts/jobs/JOB-234/_ocr_repair_log.json` | 新增 | Phase 2 結果 log：95/95 success |
| `scripts/jobs/JOB-234/_repair_report_JOB234.json` | 新增 | Phase 3 驗證報告：117 pass / 0 fail |

異動 MD 檔案總計 117 份，涵蓋三下（56）與四下（61）。

## ✅ Checklist 對照結果

### 驗收 Checklist
- [x] 所有 `extract_failed` MD 已嘗試修復 — 佐證：manifest 118 份，117 處理，1 份無原始檔永久 skip
- [x] DOC 重抽成功率 100% — 佐證：`_doc_repair_log.json` success=22, failed=0
- [x] OCR 成功率 100% — 佐證：`_ocr_repair_log.json` success=95, failed=0
- [x] Phase 3 pass 100% — 佐證：`_repair_report_JOB234.json` pass=117, fail=0
- [x] `extract_failed` 已從 quality_flags 移除 — 佐證：Phase 3 validator 欄位 `extract_failed_still_present` 0 筆
- [x] 對應 repair flag 已寫入 — 佐證：`docx_extracted`（22 份）、`ocr_used`（95 份）

### 成果 Checklist
- [x] 各 Phase 報告產出（_doc_repair_log.json / _ocr_repair_log.json / _repair_report_JOB234.json）
- [x] 進度總表已同步 — `docs/進度彙整_題庫研發與產出.md` header 更新至 2026-05-14
- [x] 已執行 `/pj_sync` — `docs/README_專案發展紀錄.md` 新增 2026-05-14 JOB-234 條目
- [x] Report 異動清單已列出實際路徑

## ⚠️ 遺留問題

1. **`南一_?_臺南市和順國小_期末考`（三下）**：manifest 建立時原始檔不存在，永久無法修復。需人工確認原始 PDF 是否遺失或年份資訊錯誤。
2. **manifest 重複 exam_id（22 筆）**：manifest 建立階段（A0）疑有重複收入同 exam_id 的不同 PDF，導致 Phase 2 `break` 只更新第一筆；已手動修正 repair_status，不影響實際 MD 內容，但 A0 腳本的去重邏輯建議日後補強。
