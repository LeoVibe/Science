*Created by Claude Code (claude-sonnet-4-6) at 2026-05-17 00:00*

`last_updated`: 2026-05-17 00:00
`updated_by`: Claude Code (claude-sonnet-4-6)

# JOB-237-AG-全科目-extract-failed-95份修復-MD補抽

**`job_type`**：`docs_ops`
**`executor`**：Claude Code（Python 修復腳本執行）+ Codex CLI gpt-5.5（社會/自然 L2 補抽，36 份）

---

## 📌 任務背景

JOB-236 完成六下_自然 11 份 extract_failed 修復。本 JOB 延伸至全科目，修復散落在 五下/六下（以及 1 份三下） 的 95 份 extract_failed 整合 MD。

**根本原因**：三類原始檔抽取失敗 —
1. 掃描型 PDF（無文字層）→ ocrmac（macOS Vision OCR）
2. 舊格式 .doc（soffice 超時）→ textutil（macOS 內建，毫秒級）
3. 其他（無 source_pdfs 或混合型）→ 逐案確認

**分布摘要**（截至 2026-05-17）：

| 類型 | 份數 | 修復方法 |
|:--|:--|:--|
| 掃描 PDF | 75 | ocrmac |
| 舊格式 .doc | 20 | textutil |
| **合計** | **95** | — |

科目分布：社會 28 份 / 自然 8 份 / 國語 20 份 / 數學 19 份 / 英語 17 份 / 其他 3 份

---

## 🎯 任務目標

1. **Phase A**：95 份整合 MD 修復（textutil/ocrmac），quality_flags 去掉 extract_failed 加 repaired
2. **Phase B**：36 份 社會/自然 L2 補抽（Codex 並行，沿用對應 JOB 的 A1 prompt template）
   - 五下_社會 ~14 份（沿用 JOB-234 社會 codes）
   - 五下_自然 ~8 份（沿用 JOB-233 自然 codes）
   - 六下_社會 ~14 份（沿用 JOB-235 社會 codes）
3. **Phase C**：更新各科目驗證報告（重跑 B_validate_codes.py for 社會/自然）
4. **Phase D**：Report

---

## 🚧 任務邊界

**只做**：
- 95 份 extract_failed MD 修復（textutil/ocrmac）
- 36 份 社會/自然 L2 補抽（覆寫現有空殼 JSON）
- 更新驗證報告 JSON

**不做**：
- 國語/數學/英語 的 L2 抽取（尚無對應 codes JSON）
- 修改規範文件
- 建立新 codes JSON（屬 JOB-238 前置）
- 修改 JOB-231~236 既有腳本

---

## 📖 執行步驟

| Phase | 內容 | 執行者 | 預估時間 |
|:--|:--|:--|:--:|
| Phase A | 95 份 MD 修復腳本 `scripts/jobs/JOB-237/repair_all.py` | Claude | ~30 min |
| Phase B | 36 份 L2 補抽（社會/自然 各跑 B_validate 前確認名單） | Codex × 2-3 | ~3-4 hr |
| Phase C | 重跑 B_validate_codes.py × 3（五下_社會/五下_自然/六下_社會） | python | < 1 min |
| Phase D | JOB-237-Report.md | Claude | ~10 min |

### Phase A 關鍵技術（沿用 JOB-236 經驗）

```python
# .doc → textutil
subprocess.run(["textutil", "-convert", "txt", "-output", out_txt, doc_path])

# 掃描 PDF → ocrmac
from ocrmac.ocrmac import text_from_image
import fitz  # PyMuPDF, /usr/local/lib/python3.11
# 每頁轉 PNG (dpi=2x) → text_from_image → 合併

# 修復後 quality_flags：移除 extract_failed/empty_extract/extract_error/paper_empty/answer_empty，加 repaired
```

### Phase B 目標名單（Phase A 完成後確認）

| 科目 | 對應 JOB | L2 codes JSON | 補抽目標 |
|:--|:--|:--|:--|
| 五下_社會 | JOB-234 | social_codes_legal_II.json | ~14 份 |
| 五下_自然 | JOB-233 | science_codes_legal_II.json | ~8 份 |
| 六下_社會 | JOB-235 | social_codes_legal_III.json | ~14 份 |

---

## 📜 關鍵參考檔案

| 檔案路徑 | 用途 |
|:--|:--|
| `jobs/JOB-236-Report.md` | ocrmac/textutil 修復技術筆記（最新） |
| `knowledge/3_考古題/3_L2_結構化抽取/_meta/social_codes_legal_II.json` | 五下_社會 合法編碼 |
| `knowledge/3_考古題/3_L2_結構化抽取/_meta/social_codes_legal_III.json` | 六下_社會 合法編碼 |
| `knowledge/3_考古題/3_L2_結構化抽取/_meta/science_codes_legal_II.json` | 五下_自然 合法編碼 |
| `scripts/jobs/JOB-234/A1_pilot_prompt_template_social_g5.md` | 五下_社會 L2 prompt 模板 |
| `scripts/jobs/JOB-235/A1_pilot_prompt_template_social_g6.md` | 六下_社會 L2 prompt 模板 |
| `scripts/jobs/JOB-233/A1_pilot_prompt_template_natural_g5.md` | 五下_自然 L2 prompt 模板 (或 JOB-233 同名) |
| `scripts/jobs/JOB-234/B_validate_codes.py` | 五下_社會 驗證腳本 |
| `scripts/jobs/JOB-235/B_validate_codes.py` | 六下_社會 驗證腳本 |
| `scripts/jobs/JOB-233/B_validate_codes.py` | 五下_自然 驗證腳本 |

---

## ✅ 啟動 Checklist (Pre-Flight)

- [ ] JOB-236 Report 已讀（ocrmac/textutil 修復技術筆記）
- [ ] 95 份目標名單確認（`scripts/jobs/JOB-237/targets.json` 由 Phase A 腳本輸出）
- [ ] `/usr/local/bin/python3.11` 可用（ocrmac 相依）
- [ ] `ocrmac` 模組可 import（`/usr/local/bin/python3.11 -c "from ocrmac.ocrmac import text_from_image"`）
- [ ] 各出版社 source PDF 路徑確認（`knowledge/3_考古題/1_原始PDF/`）
- [ ] 預算：Claude Pro 訂閱（無單次計費）+ ChatGPT Plus 訂閱

---

## ✅ 驗收 Checklist (Acceptance)

> 本 JOB 為 docs_ops，以 MD 內容完整性 + 編碼合法率驗收。CQI 指標不適用。

### Phase A（MD 修復）
- [ ] 95 份 MD quality_flags 均含 `repaired`（無殘留 extract_failed）
- [ ] 修復 char_count > 500（ocrmac 輸出非空殼）
- [ ] 佐證：`scripts/jobs/JOB-237/repair_all.py` 執行紀錄

### Phase B（L2 補抽）
- [ ] 36 份 L2 JSON 存在且非空殼（questions[] 有內容）
- [ ] 編碼合法率 ≥ 95%（目標 100%）

### Phase C（驗證報告）
- [ ] 三份 B_validate 輸出中補抽份數 > 修復前

---

## ✅ 成果 Checklist (Deliverables)

- [ ] `scripts/jobs/JOB-237/repair_all.py` 完成
- [ ] 95 份整合 MD 修復完成
- [ ] 36 份 L2 JSON 補抽完成（社會/自然）
- [ ] 三份 validation_report JSON 更新
- [ ] 進度總表已同步（`docs/進度彙整_題庫研發與產出.md`）
- [ ] `docs/README_專案發展紀錄.md` 新增 JOB-237 記錄
- [ ] 已執行 `/pj_sync`
- [ ] `jobs/JOB-237-Report.md` 完成
- [ ] `node scripts/job_manager.js close JOB-237`
- [ ] Discord 結案回報送 chat_id `1487738477608177714`
- [ ] git commit（最終結案）

---

## ⏱️ 執行時間回報

| 子任務 / 階段 | 開始時間 | 結束時間 | 耗時（分鐘） | 備註 |
|:--|:--|:--|:--|:--|
| Phase A MD 修復 | — | — | — | 95 份 textutil/ocrmac |
| Phase B L2 補抽 | — | — | — | 36 份並行 Codex |
| Phase C 驗證更新 | — | — | — | — |
| Phase D Report | — | — | — | — |
| **總計** | — | — | **—** | — |

---

## 真實回報本次對話的模型與花費

＄作業匯總：Token 數: - | 花費: -（Claude Pro 訂閱 + ChatGPT Plus 訂閱無單次計費）| 使用模型: Claude Code claude-sonnet-4-6（修復腳本）+ Codex CLI gpt-5.5（L2 補抽）| 執行者: Claude + Codex
