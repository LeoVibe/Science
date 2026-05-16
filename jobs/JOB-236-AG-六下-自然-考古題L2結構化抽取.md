*Created by Claude Code (claude-sonnet-4-6) at 2026-05-15 08:30*

`last_updated`: 2026-05-15 08:30
`updated_by`: Claude Code (claude-sonnet-4-6)

# JOB-236-AG-六下_自然-考古題L2結構化抽取

**`job_type`**：`question_prod`
**`executor`**：Codex CLI gpt-5.5（Phase 5 主跑 + Phase B/C/D 草擬）+ Claude Sonnet 4.6（PM、黃金樣本親做、Report 親寫）
**`parent_jobs`**：JOB-235（骨架完全沿用）+ `science_codes_legal_III.json`（JOB-233 已建立）

---

## 📌 任務背景

JOB-235 完成六下_社會 L2 抽取（118/118，編碼合法率 100%）。本 JOB 延伸到六下_自然，使用第Ⅲ學習階段編碼（`science_codes_legal_III.json`，89 codes），沿用 JOB-235 三 worker 並行骨架。

六下_自然 整合 MD 共 **91 份**（翰林 29 / 康軒 41 / 南一 21），其中 extract_failed 共 11 份（翰林 2 / 康軒 9 / 南一 0），後續可由 extract_failed 修復 JOB 補充。

### Source MD 分布
| 出版社 | 份數 | extract_failed |
|:--|--:|--:|
| 翰林 | 29 | 2 → ✅ 修復（2026-05-17，ocrmac OCR） |
| 康軒 | 41 | 9 → ✅ 修復（2026-05-17，textutil .doc×3 + ocrmac PDF×6） |
| 南一 | 21 | 0 |
| **合計** | **91+11=102** | **11 → 全部修復，補抽 743 題/1066 codes，合法率 100%** |

---

## 🎯 任務目標

1. A1 prompt template（六下_自然版，編碼指 `science_codes_legal_III.json`、禁引 Ⅱ 階段 prefix）
2. 1 份六下_自然 黃金樣本（Claude 親做、翰林 主流候選擇 1、schema v1.0、編碼 0 違規）
3. 5 份 Pilot 全 PASS（對齊黃金樣本）
4. 85 份 Phase 5 全量 codex 抽取（並行 3 worker，A≈29 / B≈28 / C≈28）
5. 編碼合法率 ≥ 95%（目標 100%）
6. `_validation_report_natural_g6.json` + 三份 `_L2_summary.md` + `六下_自然_L2_整合.md`
7. `jobs/JOB-236-Report.md`（Claude 親寫）

---

## 🚧 任務邊界

**只做**：
- 沿用 `scripts/jobs/JOB-236/`（fork 自 JOB-235，路徑/參數需更新）
- 1 份黃金樣本（Claude 親做、翰林 主流情境）
- 5 份 Pilot（codex 並行 3+2）
- Phase 5 全量 85 份（扣 1 黃金 + 5 Pilot = 85 份，A/B/C 三 worker 輪分）
- Phase B/C/D/E 結案

**不做**：
- 重新製作 science_codes_legal_III.json（JOB-233 已建立，直接 reuse）
- 修復 extract_failed 11 份（另開 extract_failed 修復 JOB）
- 修改 JOB-233~235 既有產出
- 修改規範文件

---

## 📖 執行步驟

| Phase | 內容 | 執行者 | 預估時間 |
|:--|:--|:--|:--:|
| Phase 0.1 | fork JOB-235 骨架 → `scripts/jobs/JOB-236/`，B/A4/A1 三檔更新 | Claude ✅ | ~30 min |
| Phase 0.2 | 黃金樣本 1 份（Claude 親做、翰林 `翰林_111_安和國小_期中考`） | Claude | 1.5 hr |
| Phase 0.3 | Pilot 5 份 + 驗收 | codex × 3+2 | 15-20 min |
| Phase 5 | 全量 85 份（並行 3 worker，A4 跑完後確認分配） | codex × 3 | ~4-5 hr |
| Phase B | 全量編碼合法性驗證 | python | < 1 min |
| Phase C | 三版本 `_L2_summary.md`（codex 並行 3 條） | codex × 3 | ~15 min |
| Phase D | 全科目整合 `六下_自然_L2_整合.md` | codex | ~5 min |
| Phase E | JOB-236-Report.md | Claude 親寫 | ~10 min |
| **總計** | — | — | **~7-9 hr** |

---

## 📜 關鍵參考檔案

| 檔案路徑 | 用途 |
|:--|:--|
| `jobs/JOB-235-Report.md` | 六下_社會 L2 抽取經驗（最新骨架，含 Phase D stdin pipe fix 技術筆記） |
| `jobs/JOB-233-Report.md` | 五下_自然 L2 抽取經驗（science_codes_legal_III 首次使用） |
| `knowledge/3_考古題/3_L2_結構化抽取/_meta/science_codes_legal_III.json` | 自然科第Ⅲ階段合法編碼（89 codes：17 學習表現 + 72 學習內容）|
| `scripts/jobs/JOB-236/A1_pilot_prompt_template_natural_g6.md` | A1 prompt 模板（六下_自然版） |
| `scripts/jobs/JOB-236/A5_full_dispatch.sh` | dispatch（含 25min watchdog） |
| `scripts/jobs/JOB-236/A7_launch_3workers.sh` | launcher（含 progress.json 預建）|
| `scripts/jobs/JOB-236/B_validate_codes.py` | Phase B 全量驗證（EXPECTED=91，III 階段）|
| `scripts/jobs/JOB-236/A4_generate_full_targets.py` | targets 產生器（91 份，扣 6 → 85） |

---

## ✅ 啟動 Checklist (Pre-Flight)

- [ ] JOB-235 Report 已讀（最新骨架 + Phase D stdin pipe fix）
- [ ] JOB-233 Report 已讀（science_codes_legal_III 使用經驗）
- [ ] 六下_自然 整合 MD 91 份確認（翰林 29 + 康軒 41 + 南一 21）
- [ ] `science_codes_legal_III.json` 存在且 89 codes 驗證正確
- [ ] `scripts/jobs/JOB-236/` 腳本路徑/參數已更新（B/A4/A1 三檔）
- [ ] 黃金樣本路徑：`六下_自然_翰林/翰林_111_安和國小_期中考.md` 存在
- [ ] 預算：使用 ChatGPT 訂閱（無單次計費）
- [ ] 已確認執行模型：Codex CLI gpt-5.5（worker）+ Claude Sonnet 4.6（PM 親做）

---

## ✅ 驗收 Checklist (Acceptance)

> 本 JOB 為 question_prod L2 抽取，以結構完整性 + 編碼合法率 + 對齊度驗收。CQI 指標不適用。

### Phase 0
- [ ] A1 prompt template 完成（grade=六下_自然、編碼指向 science_codes_legal_III.json）
- [ ] 1 份黃金樣本（Claude 親做、schema v1.0 完整、編碼 0 違規）— 題數 / codes 種 / 合法率 100%
- [ ] Pilot 5 份對黃金樣本 schema 一致、編碼合法率 100%（5/5 總違規 0）

### Phase 5（85 份）
- [ ] 3 worker 啟動成功（A=29 / B=28 / C=28 = 85）
- [ ] 整體完成度 ≥ 95%（≥81/85）、failed ≤ 4 份
- [ ] 編碼合法率 ≥ 95%（目標 100%）

### Phase B/C/D/E
- [ ] `_validation_report_natural_g6.json` 違規率可控（A/B/C 各 ≤ 1%）
- [ ] 三份 `_L2_summary.md`（翰林/康軒/南一）完成
- [ ] `六下_自然_L2_整合.md` 完成
- [ ] `jobs/JOB-236-Report.md` 完成

---

## ✅ 成果 Checklist (Deliverables)

- [ ] 成果表格填寫完畢（執行者填）
- [ ] 進度總表已同步（`docs/進度彙整_題庫研發與產出.md`）
- [ ] `docs/README_專案發展紀錄.md` 新增 JOB-236 記錄
- [x] 已執行 `/pj_sync`
- [ ] JOB-236-Report.md 異動清單已列所有實際修改檔案路徑
- [ ] `node scripts/job_manager.js close JOB-236`
- [ ] Discord 結案回報送 chat_id `1487738477608177714`
- [ ] git commit（最終結案）

---

## ⏱️ 執行時間回報

| 子任務 / 階段 | 開始時間 | 結束時間 | 耗時（分鐘） | 備註 |
|:--|:--|:--|:--|:--|
| Phase 0.1 腳本更新 | 2026-05-15 08:30 | 2026-05-15 09:00 | ~30 min | Claude（fork + A1/A4/B/A3/C/D 六檔更新）|
| Phase 0.2 黃金樣本 | 2026-05-15 09:00 | 2026-05-15 10:30 | ~90 min | Claude 親做，65 題，編碼合法率 100% ✅ |
| Phase 0.3 Pilot 5 | — | — | — | 5/5 PASS |
| Phase 5 全量 85 | — | — | — | 並行 3 worker |
| Phase B-E 結案 | — | — | — | B<1min / C並行 / D stdin pipe / E親寫 |
| **總計** | — | — | **—** | — |

---

## 真實回報本次對話的模型與花費

＄作業匯總：Token 數: -- | 花費: --（codex ChatGPT Plus 訂閱無單次計費 + Claude Pro 訂閱）| 使用模型: Codex CLI gpt-5.5（並行 3 條 worker + Phase B/C/D 草擬）+ Claude Sonnet 4.6（PM、黃金樣本親做、Report 親寫）| 執行者: Codex + Claude

---

## 黃金樣本選擇紀錄（Phase 0.2 開跑前填）

`chosen_golden_sample`: **翰林_111_安和國小_期中考**

- 來源 MD 路徑：`knowledge/3_考古題/2_MD淬鍊文字_整合版/六下/六下_自然_翰林/翰林_111_安和國小_期中考.md`
- 選擇依據：六下_自然翰林版主流情境，paper_full+answer_full+claude_only，無 ocr_corrected 干擾，clean 樣本
- 黃金樣本目標路徑：`knowledge/3_考古題/3_L2_結構化抽取/_golden_samples/六下_自然_翰林_111_安和國小_期中考.json`
- 題數：65（是非題27 + 選擇題26 + 填空6 + 配合子題12）
- 使用 codes（前五高頻）：INe-Ⅲ-12 (21次) / INd-Ⅲ-13 (14次) / INg-Ⅲ-2 (10次) / INc-Ⅲ-5 (9次) / INd-Ⅲ-3 (7次)
- 編碼合法率：100%（0 違規）
- 已知限制：claude_only（無 codex 源互校）

## Pilot 名單（Phase 0.3 用）

| # | exam_id | 出版社 | quality_flags |
|:--|:--|:--|:--|
| 1 | 翰林_111_新北安和國小_期中考 | 翰林 | paper_full+answer_full+codex_only |
| 2 | 翰林_109_成功國小_第一次段考 | 翰林 | paper_full+answer_partial+codex_only+ocr_corrected+columns_reordered |
| 3 | 康軒_108_中正國小_第一次段考 | 康軒 | paper_full+answer_full+codex_only+columns_reordered |
| 4 | 康軒_108_成德國小_第二次段考 | 康軒 | paper_full+answer_full+codex_only+ocr_corrected+columns_reordered |
| 5 | 南一_109_中正國小_第一次段考 | 南一 | paper_full+answer_full+codex_only+ocr_corrected+columns_reordered |

---

## 技術注意事項（來自 JOB-235 經驗）

1. **Phase D stdin pipe**：`cat prompt.md | codex exec --skip-git-repo-check --full-auto`（不用 `"$PROMPT"` argument mode，大 prompt 會卡住）
2. **progress.json 預建**：A7 啟動前先 `rm _full_progress_{A,B,C}.json`（舊 `{}` 空殼會造成 A5 crash）
3. **Unicode sort order**：南 < 康 < 翰，worker A 會先跑完所有南一，再康軒，再翰林，監控時不要誤判
4. **A6 Batch#2 自動重試**：A5 timeout（25min watchdog）的 rank 會留在 failed[]，A6 detect remaining>0 後自動重跑
