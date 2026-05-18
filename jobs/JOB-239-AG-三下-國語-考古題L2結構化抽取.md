*Created by Claude Code (claude-opus-4-7) at 2026-05-18 00:40*

`last_updated`: 2026-05-18 00:40
`updated_by`: Claude Code (claude-opus-4-7)

# JOB-239-AG-三下_國語-考古題L2結構化抽取

**`job_type`**：`question_prod`
**`executor`**：Codex CLI gpt-5.5（Phase 5 主跑 + Phase B/C/D 草擬）+ Claude Sonnet 4.6（PM、黃金樣本親做、Report 親寫）
**`parent_jobs`**：JOB-238（直接 fork，骨架已穩定）+ `chinese_codes_legal_II.json`（reuse，第Ⅱ學習階段同階段）

---

## 📌 任務背景

JOB-238（四下_國語）首次建立國語科 L2 抽取骨架並驗證可行（115/115，0 violations，編碼合法率 100%）。本 JOB 延續同骨架擴展至 **三下_國語**。

三下_國語 整合 MD 共 **114 份**（翰林 37 / 康軒 41 / 南一 36），0 份 extract_failed（南一 1 份已由 JOB-237 修復可用）。codes 直接 reuse `chinese_codes_legal_II.json`（61 codes，第Ⅱ學習階段同階段）。

### Source MD 分布

| 出版社 | 份數 | extract_failed |
|:--|--:|--:|
| 翰林 | 37 | 0 |
| 康軒 | 41 | 0 |
| 南一 | 36 | 0（1 份已 JOB-237 修復）|
| **合計** | **114** | **0** |

---

## 🎯 任務目標

1. fork JOB-238 骨架 → `scripts/jobs/JOB-239/`（B/A4/A1 三檔更新：grade=三下_國語、EXPECTED_FILES=114）
2. 1 份三下_國語 黃金樣本（Claude 親做、翰林 主流候選、schema v1.0、編碼 0 違規）
3. 5 份 Pilot 全 PASS（對齊黃金樣本）
4. 108 份 Phase 5 全量 codex 抽取（並行 3 worker，A=36 / B=36 / C=36）
5. 編碼合法率 ≥ 95%（目標 100%）
6. `_validation_report_chinese_g3.json` + 三份 `_L2_summary.md` + `三下_國語_L2_整合.md`
7. `jobs/JOB-239-Report.md`（Claude 親寫）

---

## 🚧 任務邊界

**只做**：
- fork JOB-238 骨架（`scripts/jobs/JOB-239/`）
- 1 份黃金樣本（Claude 親做、翰林 主流情境）
- 5 份 Pilot（codex 並行 3+2）
- Phase 5 全量 108 份（扣 1 黃金 + 5 Pilot = 108 份，A/B/C 三 worker 輪分）
- Phase B/C/D/E 結案

**不做**：
- 重做 `chinese_codes_legal_II.json`（reuse JOB-238 產出）
- 五下/六下_國語 L2（另開 JOB-240/241，且需新建第Ⅲ階段 codes）
- 修改 JOB-231~238 既有產出
- 修改規範文件
- 三下_國語題庫升 QL（另議）

---

## 📖 執行步驟

| Phase | 內容 | 執行者 | 預估時間 |
|:--|:--|:--|:--:|
| 0.1 | fork JOB-238 骨架 → `scripts/jobs/JOB-239/`，B/A4/A1 三檔更新 | Claude | ~20 min |
| 0.2 | 黃金樣本 1 份（Claude 親做、翰林 主流候選） | Claude | ~30 min |
| 0.3 | Pilot 5 份 + 驗收 | codex × 3+2 | ~20 min |
| 5 | 全量 108 份（並行 3 worker，A=36/B=36/C=36） | codex × 3 | ~5-6 hr |
| B | 全量編碼合法性驗證 | python | < 1 min |
| C | 三版本 `_L2_summary.md`（codex 並行 3 條） | codex × 3 | ~15 min |
| D | 全科目整合 `三下_國語_L2_整合.md` | codex | ~5 min |
| E | JOB-239-Report.md | Claude 親寫 | ~10 min |
| **總計** | — | — | **~6-7 hr** |

---

## 📜 關鍵參考檔案

| 檔案路徑 | 用途 |
|:--|:--|
| `jobs/JOB-238-Report.md` | 最新骨架（國語科 L2 首次驗證，路徑 C/D 模板 bug 已修） |
| `knowledge/3_考古題/3_L2_結構化抽取/_meta/chinese_codes_legal_II.json` | 國語第Ⅱ階段合法編碼（61 codes，reuse） |
| `scripts/jobs/JOB-238/A1_pilot_prompt_template_chinese_g4.md` | A1 模板（grade 改三下_國語、輸出路徑改 g3） |
| `scripts/jobs/JOB-238/A4_generate_full_targets.py` | targets 產生器（GOLDEN/PILOT/OUT_BASE 改三下） |
| `scripts/jobs/JOB-238/B_validate_codes.py` | 驗證腳本（EXPECTED 改 114、subject 三下_國語） |
| `scripts/jobs/JOB-238/A5/A6/A7` | dispatch/loop/launcher（路徑替換） |
| `scripts/jobs/JOB-238/C_publisher_summary_prompt.md` | Phase C 模板（已修六下→四下，本次改三下，N_FILES 三版本各別計） |
| `scripts/jobs/JOB-238/D_subject_integration_prompt.md` | Phase D 模板（路徑四下→三下，total_files 改 114） |

---

## ✅ 啟動 Checklist (Pre-Flight)

- [x] `scripts/jobs/JOB-239/` 腳本路徑/參數已更新（B/A4/A1 三檔）—— A4 dry-run OK（114份/A=B=C=38，GOLDEN/PILOT 待 Phase 0.2/0.3 後回填）
- [x] `chinese_codes_legal_II.json` 已 reuse（無需重建）
- [x] JOB-238 Report 已讀（骨架穩定、C/D bug 已修）
- [x] 三下_國語 整合 MD 114 份確認（翰林 37 + 康軒 41 + 南一 36）
- [ ] 黃金樣本路徑：翰林 主流情境（待 Phase 0.2 選定）
- [ ] 預算：ChatGPT 訂閱（無單次計費）
- [ ] 已確認執行模型：Codex CLI gpt-5.5（worker）+ Claude Sonnet 4.6（PM 親做）

---

## ✅ 驗收 Checklist (Acceptance)

> 本 JOB 為 question_prod L2 抽取，以結構完整性 + 編碼合法率 + 對齊度驗收。

### Phase 0
- [x] A1 prompt template 完成（grade=三下_國語、編碼指向 chinese_codes_legal_II.json）
- [x] 1 份黃金樣本（翰林_108_國姓國小_第一次段考，67 題，schema v1.0 完整，0 violations）
- [x] Pilot 5 份對黃金樣本 schema 一致、編碼合法率 100%（307 碼全合法）

### Phase 5（108 份）
- [ ] 3 worker 啟動成功（A=36 / B=36 / C=36 = 108）
- [ ] 整體完成度 ≥ 95%（≥103/108）、failed ≤ 5 份
- [ ] 編碼合法率 ≥ 95%（目標 100%）

### Phase B/C/D/E
- [ ] `_validation_report_chinese_g3.json` 違規率可控
- [ ] 三份 `_L2_summary.md`（翰林/康軒/南一）完成
- [ ] `三下_國語_L2_整合.md` 完成
- [ ] `jobs/JOB-239-Report.md` 完成

---

## ✅ 成果 Checklist (Deliverables)

- [ ] 成果表格填寫完畢
- [ ] 進度總表已同步（`docs/進度彙整_題庫研發與產出.md`）
- [ ] `docs/README_專案發展紀錄.md` 新增 JOB-239 記錄
- [ ] 已執行 `/pj_sync`
- [ ] JOB-239-Report.md 異動清單已列所有實際修改檔案路徑
- [ ] `node scripts/job_manager.js close JOB-239`
- [ ] Discord 結案回報送 chat_id `1487738477608177714`
- [ ] git commit（最終結案）

---

## ⏱️ 執行時間回報

| 子任務 / 階段 | 開始時間 | 結束時間 | 耗時（分鐘） | 備註 |
|:--|:--|:--|:--|:--|
| Phase 0.1 腳本更新 | 2026-05-18 00:40 | 2026-05-18 00:50 | ~10 min | fork JOB-238 → JOB-239，B(114)/A4(三下)/A1(三下) 三檔已更新，A4 dry-run 114份 OK |
| Phase 0.2 黃金樣本 | 2026-05-18 00:50 | 2026-05-18 01:15 | ~25 min | 翰林_108_國姓國小_第一次段考，67 題，0 violations |
| Phase 0.3 Pilot 5 | 2026-05-18 06:08 | 2026-05-18 07:25 | ~77 min | 4/5 一次跑通；康軒 columns_reordered codex hung 46min（與 JOB-236 同症狀），kill 後 stdin pipe 重跑成功（~5min）。合法率 100% (307/307) |
| Phase 5 全量 108 | 2026-05-18 07:26 | 進行中 | — | 並行 3 worker，A=36/B=36/C=36 |
| Phase B-E 結案 | — | — | — | — |
| **總計** | — | — | **—** | — |

---

## 技術注意事項（沿用 JOB-238 經驗）

1. **C/D 模板路徑替換**：JOB-238 C/D 模板有「六下→四下」殘留 bug 已修，本 JOB 需再做「四下→三下」替換並驗證
2. **OUTPUT_PATH 換代**：`四下/四下_國語_*` → `三下/三下_國語_*`
3. **validation 報告檔名**：`_validation_report_chinese_g4.json` → `_validation_report_chinese_g3.json`
4. **codes reuse**：直接指向 `_meta/chinese_codes_legal_II.json`（同 JOB-238）
5. **黃金樣本**：選翰林主流情境（codex_only + answer_full 為佳）；題目類型以閱讀理解/生字注音/造句/修辭為主
6. **progress.json 預建**：A7 啟動前先建 `_full_progress_{A,B,C}.json` 避 loop wrapper 死循環
7. **3 worker 分配**：A=36 / B=36 / C=36（基本平均）
8. **南一 1 份 ocrmac 修復檔**：南一_?_臺南市和順國小_期末考（JOB-237 修復），可正常 L2 抽取

---

## 真實回報本次對話的模型與花費

＄作業匯總：Token 數: - | 花費: -（Codex CLI ChatGPT Plus 訂閱無單次計費 + Claude Pro 訂閱）| 使用模型: Codex CLI gpt-5.5（並行 3 worker + Phase B/C/D）+ Claude Sonnet 4.6（PM、黃金樣本親做、Report 親寫）| 執行者: Codex + Claude
