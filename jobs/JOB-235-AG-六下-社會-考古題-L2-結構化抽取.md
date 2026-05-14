*Created by Claude Code (claude-sonnet-4-6) at 2026-05-14 22:00*

`last_updated`: 2026-05-14 22:00
`updated_by`: Claude Code (claude-sonnet-4-6)

# JOB-235-AG-六下_社會-考古題L2結構化抽取

**`job_type`**：`question_prod`
**`executor`**：Codex CLI gpt-5.5（Phase 5 主跑 + Phase B/C/D 草擬）+ Claude Sonnet 4.6（PM、黃金樣本親做、Report 親寫）
**`parent_jobs`**：JOB-232（骨架完全沿用）+ `social_codes_legal_III.json`（JOB-232 已建立）

---

## 📌 任務背景

JOB-232 完成五下_社會 L2 抽取（111/111，編碼合法率 100%）。本 JOB 延伸到六下_社會，同樣使用第Ⅲ學習階段編碼（`social_codes_legal_III.json`，46 codes），沿用 JOB-232 三 worker 並行骨架。

六下_社會 整合 MD 共 **118 份**（翰林 41 / 康軒 48 / 南一 29），其中 extract_failed 共 14 份（翰林 2 / 康軒 9 / 南一 3），後續可由 JOB-234 修復結果補充。

### Source MD 分布
| 出版社 | 份數 | extract_failed |
|:--|--:|--:|
| 翰林 | 41 | 2 |
| 康軒 | 48 | 9 |
| 南一 | 29 | 3 |
| **合計** | **118** | **14** |

---

## 🎯 任務目標

1. A1 prompt template（六下_社會版，編碼指 `social_codes_legal_III.json`、禁引 Ⅱ 階段 prefix）
2. 1 份六下_社會 黃金樣本（Claude 親做、翰林 主流候選擇 1、schema v1.0、編碼 0 違規）
3. 5 份 Pilot 全 PASS（對齊黃金樣本）
4. 112 份 Phase 5 全量 codex 抽取（並行 3 worker，A≈38 / B≈37 / C≈37）
5. 編碼合法率 ≥ 95%（目標 100%）
6. `_validation_report_social_g6.json` + 三份 `_L2_summary.md` + `六下_社會_L2_整合.md`
7. `jobs/JOB-235-Report.md`（Claude 親寫）

---

## 🚧 任務邊界

**只做**：
- 沿用 `scripts/jobs/JOB-235/`（已 fork 自 JOB-232，路徑/參數已更新）
- 1 份黃金樣本（Claude 親做、翰林 主流情境）
- 5 份 Pilot（codex 並行 3+2）
- Phase 5 全量 112 份（扣 1 黃金 + 5 Pilot = 112 份，A/B/C 三 worker 輪分）
- Phase B/C/D/E 結案

**不做**：
- 重新製作 social_codes_legal_III.json（已建立，直接 reuse）
- 擴展到六下自然科（另開 JOB-236）
- 修改 JOB-232~234 既有產出
- 修改規範文件

---

## 📖 執行步驟

| Phase | 內容 | 執行者 | 預估時間 |
|:--|:--|:--|:--:|
| Phase 0.1 | 腳本已 fork+修正（B_validate_codes/A4/A1 三檔已更新） | Claude ✅ | — |
| Phase 0.2 | 黃金樣本 1 份（Claude 親做、翰林 `翰林_108_四維國小_第一次段考`） | Claude | 1.5 hr |
| Phase 0.3 | Pilot 5 份 + 驗收 | codex × 3+2 | 15-20 min |
| Phase 5 | 全量 112 份（並行 3 worker，A4 跑完後確認分配） | codex × 3 | ~5-6 hr |
| Phase B | 全量編碼合法性驗證 | python | < 1 min |
| Phase C | 三版本 `_L2_summary.md`（codex 並行 3 條） | codex × 3 | ~15 min |
| Phase D | 全科目整合 `六下_社會_L2_整合.md` | codex | ~5 min |
| Phase E | JOB-235-Report.md | Claude 親寫 | ~10 min |
| **總計** | — | — | **~8-10 hr** |

---

## 📜 關鍵參考檔案

| 檔案路徑 | 用途 |
|:--|:--|
| `jobs/JOB-232-Report.md` | 五下_社會 L2 抽取經驗（同骨架） |
| `knowledge/3_考古題/3_L2_結構化抽取/_meta/social_codes_legal_III.json` | 社會科第Ⅲ階段合法編碼（46 codes）|
| `scripts/jobs/JOB-235/A1_pilot_prompt_template_social_g6.md` | A1 prompt 模板（六下版） |
| `scripts/jobs/JOB-235/A5_full_dispatch.sh` | dispatch（含 25min watchdog） |
| `scripts/jobs/JOB-235/A7_launch_3workers.sh` | launcher（含 progress.json 預建）|
| `scripts/jobs/JOB-235/B_validate_codes.py` | Phase B 全量驗證（EXPECTED=118，III 階段）|
| `scripts/jobs/JOB-235/A4_generate_full_targets.py` | targets 產生器（118 份，扣 6 → 112） |

---

## ✅ 啟動 Checklist (Pre-Flight)

- [ ] JOB-232 Report 已讀（五下骨架經驗）
- [ ] 六下_社會 整合 MD 118 份確認（翰林 41 + 康軒 48 + 南一 29）
- [ ] `social_codes_legal_III.json` 存在且 46 codes 驗證正確
- [ ] `scripts/jobs/JOB-235/` 腳本路徑/參數已更新（B/A4/A1 三檔）
- [ ] 黃金樣本路徑：`六下_社會_翰林/翰林_108_四維國小_第一次段考.md` 存在
- [ ] 預算：使用 ChatGPT 訂閱（無單次計費）
- [ ] 已確認執行模型：Codex CLI gpt-5.5（worker）+ Claude Sonnet 4.6（PM 親做）

---

## ✅ 驗收 Checklist (Acceptance)

> 本 JOB 為 question_prod L2 抽取，以結構完整性 + 編碼合法率 + 對齊度驗收。CQI 指標不適用。

### Phase 0
- [x] A1 prompt template 完成（grade=六下_社會、編碼指向 social_codes_legal_III.json）
- [x] 1 份黃金樣本（Claude 親做、schema v1.0 完整、編碼 0 違規）— 64 題、25 codes、合法率 100%
- [x] Pilot 5 份對黃金樣本 schema 一致、編碼合法率 100%（5/5 總違規 0）

### Phase 5（112 份）
- [x] 3 worker 啟動成功（A=38 / B=37 / C=37 = 112）
- [ ] 整體完成度 ≥ 95%（≥107/112）、failed ≤ 5 份
- [ ] 編碼合法率 ≥ 95%（目標 100%）

### Phase B/C/D/E
- [x] `_validation_report_social_g6.json` 違規率可控（A/B/C 各 ≤ 1%）— A=0/B=0/C=0（0%）
- [x] 三份 `_L2_summary.md`（翰林/康軒/南一）完成 — 415/365/507 行
- [x] `六下_社會_L2_整合.md` 完成 — 142 行，9345 題，16232 codes
- [x] `jobs/JOB-235-Report.md` 完成

---

## ✅ 成果 Checklist (Deliverables)

- [ ] 成果表格填寫完畢（執行者填）
- [ ] 進度總表已同步（`docs/進度彙整_題庫研發與產出.md`）
- [ ] `docs/README_專案發展紀錄.md` 新增 JOB-235 記錄
- [ ] 已執行 `/pj_sync`
- [ ] JOB-235-Report.md 異動清單已列所有實際修改檔案路徑
- [ ] `node scripts/job_manager.js close JOB-235`
- [ ] Discord 結案回報送 chat_id `1487738477608177714`
- [ ] git commit（最終結案）

---

## ⏱️ 執行時間回報

| 子任務 / 階段 | 開始時間 | 結束時間 | 耗時（分鐘） | 備註 |
|:--|:--|:--|:--|:--|
| Phase 0.1 腳本更新 | 2026-05-14 | — | ~30 min | Claude（含 fork + 3 檔修正）|
| Phase 0.2 黃金樣本 | 2026-05-14 20:00 | 2026-05-14 21:00 | ~60 min | Claude 親做 64 題 100% |
| Phase 0.3 Pilot 5 | 2026-05-14 21:36 | 2026-05-14 22:15 | ~47 min | 5/5 PASS，總違規 0 |
| Phase 5 全量 112 | 2026-05-14 22:16 | — | — | 並行 3 worker，PID A=90360/B=90779/C=91196 |
| Phase B-E 結案 | 2026-05-15 05:15 | 2026-05-15 05:25 | ~70 min | B<1min / C並行 / D重跑 / E親寫 |
| **總計** | 2026-05-14 20:00 | 2026-05-15 05:25 | **~565 min** | ~9.4 hr |

---

## 真實回報本次對話的模型與花費

＄作業匯總：Token 數: -- | 花費: --（codex ChatGPT Plus 訂閱無單次計費 + Claude Pro 訂閱）| 使用模型: Codex CLI gpt-5.5（並行 3 條 worker + Phase B/C/D 草擬）+ Claude Sonnet 4.6（PM、黃金樣本親做、Report 親寫）| 執行者: Codex + Claude

---

## 黃金樣本選擇紀錄（Phase 0.2 開跑前填）

`chosen_golden_sample`: **翰林_108_四維國小_第一次段考**

- 來源 MD 路徑：`knowledge/3_考古題/2_MD淬鍊文字_整合版/六下/六下_社會_翰林/翰林_108_四維國小_第一次段考.md`
- 選擇依據：六下_社會翰林版主流情境，paper_full 候選，代表六下社會核心主題（近代臺灣史、日治、戰後發展、民主化）
- 黃金樣本目標路徑：`knowledge/3_考古題/3_L2_結構化抽取/_golden_samples/六下_社會_翰林_108_四維國小_第一次段考.json`
- 題數：64 題（選擇 10 / 勾選 16 / 填充 3 / 配合 35）
- 使用 codes：25 種，主力 `2b-Ⅲ-2`（27次）+ `2a-Ⅲ-2`（18次）+ `Cb-Ⅲ-1`（10次）
- 編碼合法率：100%（A=0/B=0/C=0）
- 已知限制：codex_only（無 Claude 源互校）；配合題(一)11 為地圖定位題，MD 無圖像

## Pilot 名單（Phase 0.3 用）

| # | exam_id | 出版社 | quality_flags |
|:--|:--|:--|:--|
| 1 | 翰林_108_田中國小_第一次段考 | 翰林 | answer_full+codex_only+ocr_corrected+columns_reordered |
| 2 | 翰林_109_海佃國小_第一次段考 | 翰林 | answer_full+codex_only |
| 3 | 康軒_108_大園國小_第一次段考 | 康軒 | answer_full+codex_only+ocr_corrected |
| 4 | 康軒_108_成功國小_第一次段考 | 康軒 | answer_full+codex_only |
| 5 | 南一_108_中正國小_第一次段考 | 南一 | answer_full+codex_only+ocr_corrected+columns_reordered |
