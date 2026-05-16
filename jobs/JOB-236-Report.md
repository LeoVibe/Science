*Created by Claude Code (claude-sonnet-4-6) at 2026-05-16 23:20*

`last_updated`: 2026-05-16 23:20
`updated_by`: Claude Code (claude-sonnet-4-6)

# JOB-236 結案報告 — 六下_自然 考古題 L2 結構化抽取

**`job_type`**：`question_prod`
**`executor`**：Codex CLI gpt-5.5（Phase 5 主跑 + Phase B/C/D 草擬）+ Claude Sonnet 4.6（PM、黃金樣本親做、Report 親寫）

---

## 📊 成果摘要

對六下_自然整合 MD 91 份（翰林 29 / 康軒 41 / 南一 21）完成 L2 結構化抽取，含 1 份 Claude 親做黃金樣本、5 份 Pilot 全 PASS、85 份 Phase 5 全量。編碼合法率 100%（A-違規 0、B-違規 0）；3 份 C-違規（重複 code，全數 auto_corrected）。

| 指標 | 數值 |
|:--|:--|
| 總抽取份數 | 91（黃金 1 + Pilot 5 + Phase 5 85） |
| 總題數 | 7,182 |
| 總 codes 數 | 10,343 |
| 編碼合法率（A-violation） | **100%**（0 違規） |
| 錯學習階段（B-violation） | **0** |
| 重複 code（C-violation） | 14 筆 → 3 份 auto_corrected |
| Pilot 通過率 | 5/5（100%） |
| Phase 5 完成率 | 85/85（100%） |
| 使用編碼清單 | science_codes_legal_III.json（89 codes） |

---

## 📋 執行時間

| 子任務 / 階段 | 開始 | 結束 | 耗時 |
|:--|:--|:--|:--|
| Phase 0.1 腳本更新 | 2026-05-15 08:30 | 2026-05-15 09:00 | ~30 min |
| Phase 0.2 黃金樣本（Claude 親做） | 2026-05-15 09:00 | 2026-05-15 10:30 | ~90 min |
| Phase 0.3 Pilot 5 份 | 2026-05-15 10:30 | 2026-05-16 13:05 | ※ 康軒第一批 hung 24h，重跑後 ~10 min |
| Phase 5 全量 85 份 | 2026-05-16 14:56 | 2026-05-16 22:53 | ~8 hr（3 worker 並行） |
| Phase B 驗證 | 2026-05-16 22:55 | 2026-05-16 22:55 | < 1 min |
| Phase C 三份 summary | 2026-05-16 23:00 | 2026-05-16 23:08 | ~8 min（3 條並行） |
| Phase D 整合 | 2026-05-16 23:08 | 2026-05-16 23:16 | ~8 min |
| Phase E Report（Claude 親寫） | 2026-05-16 23:20 | 2026-05-16 23:30 | ~10 min |

※ Pilot 第三條（康軒_108_中正國小）在 2026-05-15 首次跑時 hung 超過 24 小時（CPU 佔用 0.2%），於 2026-05-16 手動 kill 並重跑，362s 完成。

---

## 📂 異動清單

| 檔案路徑 | 異動類型 | 說明 |
|:--|:--|:--|
| `jobs/JOB-236-AG-六下-自然-考古題L2結構化抽取.md` | 新增 | 派工單本體 |
| `jobs/JOB-236-Report.md` | 新增 | 本 Report |
| `scripts/jobs/JOB-236/A1_pilot_prompt_template_natural_g6.md` | 新增 | Pilot/Phase 5 派工 prompt 模板（六下_自然版） |
| `scripts/jobs/JOB-236/A3_pilot_dispatch.sh` | 新增 | Pilot 5 份 dispatch 腳本 |
| `scripts/jobs/JOB-236/A4_generate_full_targets.py` | 新增 | Phase 5 全量 targets 產生器（85 份） |
| `scripts/jobs/JOB-236/A5_full_dispatch.sh` | 新增 | Phase 5 序列 dispatch（含 25min watchdog） |
| `scripts/jobs/JOB-236/A6_continuous_loop.sh` | 新增 | Phase 5 continuous loop wrapper |
| `scripts/jobs/JOB-236/A7_launch_3workers.sh` | 新增 | 三 worker launcher（含 progress.json 預建） |
| `scripts/jobs/JOB-236/B_validate_codes.py` | 新增 | Phase B 全量編碼驗證（EXPECTED=91，III 階段） |
| `scripts/jobs/JOB-236/C_publisher_summary_prompt.md` | 新增 | Phase C 各出版社 summary prompt |
| `scripts/jobs/JOB-236/D_subject_integration_prompt.md` | 新增 | Phase D 全科目整合 prompt |
| `scripts/jobs/JOB-236/dashboard.py` | 新增 | Phase 5 即時監控儀表板 |
| `scripts/jobs/JOB-236/_full_targets_A/B/C.json` | 新增 | Phase 5 三 worker 分配表（A=29/B=28/C=28） |
| `knowledge/3_考古題/3_L2_結構化抽取/_golden_samples/六下_自然_翰林_111_安和國小_期中考.json` | 新增 | Claude 親做黃金樣本（65 題，編碼合法率 100%） |
| `knowledge/3_考古題/3_L2_結構化抽取/六下/六下_自然_pilot/*.json` | 新增 | Pilot 5 份 JSON（共 5 檔） |
| `knowledge/3_考古題/3_L2_結構化抽取/六下/六下_自然_翰林/*.json` | 新增 | 翰林全量 26 份 JSON |
| `knowledge/3_考古題/3_L2_結構化抽取/六下/六下_自然_康軒/*.json` | 新增 | 康軒全量 39 份 JSON |
| `knowledge/3_考古題/3_L2_結構化抽取/六下/六下_自然_南一/*.json` | 新增 | 南一全量 20 份 JSON |
| `knowledge/3_考古題/3_L2_結構化抽取/_validation_report_natural_g6.json` | 新增 | Phase B 驗證報告（91 份） |
| `knowledge/3_考古題/3_L2_結構化抽取/六下/六下_自然_翰林/_L2_summary.md` | 新增 | 翰林版本級摘要（528 行） |
| `knowledge/3_考古題/3_L2_結構化抽取/六下/六下_自然_康軒/_L2_summary.md` | 新增 | 康軒版本級摘要（401 行） |
| `knowledge/3_考古題/3_L2_結構化抽取/六下/六下_自然_南一/_L2_summary.md` | 新增 | 南一版本級摘要（540 行） |
| `knowledge/3_考古題/3_L2_結構化抽取/六下/六下_自然_L2_整合.md` | 新增 | 全科目整合（127 行，7182 題，10343 codes） |

---

## ✅ Checklist 對照結果

### Phase 0 驗收

- [x] A1 prompt template 完成（grade=六下_自然、編碼指向 science_codes_legal_III.json）
  - 佐證：`scripts/jobs/JOB-236/A1_pilot_prompt_template_natural_g6.md` 89 codes，prefix 限 ti/tr/tc/tm/po/pe/pa/ah/ai/an + INa-INg，禁社會科前綴
- [x] 1 份黃金樣本（Claude 親做、schema v1.0 完整、編碼 0 違規）
  - 佐證：`_golden_samples/六下_自然_翰林_111_安和國小_期中考.json`，65 題，B_validate_codes A=0 B=0 C=0
- [x] Pilot 5 份對黃金樣本 schema 一致、編碼合法率 100%（5/5 總違規 0）
  - 佐證：`A3_pilot_dispatch.sh` 驗證輸出：5/5 JSON 合法，合法 419/419 (100.0%)，總違規數 0

### Phase 5（85 份）驗收

- [x] 3 worker 啟動成功（A=29 / B=28 / C=28 = 85）
  - 佐證：`A7_launch_3workers.sh` PID A=62445/B=62701/C=63214
- [x] 整體完成度 100%（85/85，failed=0 實際，progress.json 殘留 1 筆 Batch#1 timeout 已 Batch#2 補完）
  - 佐證：dashboard done=85，`翰林_113_未知國小_期末考.json` 存在，150 題
- [x] 編碼合法率 100%（A-violation=0，B-violation=0）
  - 佐證：`_validation_report_natural_g6.json` violations.A_illegal=0, B_wrong_stage=0

### Phase B/C/D/E 驗收

- [x] `_validation_report_natural_g6.json` 違規率可控
  - 佐證：C_duplicate=14（3 份），全數 auto_corrected，0 份 flagged_for_rerun
- [x] 三份 `_L2_summary.md` 完成
  - 佐證：翰林 528 行 / 康軒 401 行 / 南一 540 行
- [x] `六下_自然_L2_整合.md` 完成
  - 佐證：127 行，total_questions=7182，total_codes=10343
- [x] `jobs/JOB-236-Report.md` 完成（本文）
- [x] 已執行 `/pj_sync` 全域知識沉澱

---

## ⚠️ 遺留問題

1. **extract_failed 11 份未處理**：六下_自然 MD 中 extract_failed 翰林 2 份 + 康軒 9 份，本 JOB 不處理，須另開 extract_failed 修復 JOB。
2. **翰林_113_未知國小_期末考 exam_id 異常**：`source_school` 為「未知」，frontmatter 資訊不完整，後續可補正。
3. **Pilot 康軒 hung 問題**：`codex exec` argument mode 在大 prompt 下有機率 hung（已知問題，本次 stdin pipe 重跑解決）。未來可考慮全面改 stdin pipe 或加入 `--output-schema` 強制結構化輸出。
4. **dashboard 顯示 JOB-231**：儀表板標題殘留舊 JOB 號，不影響功能，下次 fork 時修正。

---

## 真實花費

＄作業匯總：Token 數: - | 花費: -（Codex CLI ChatGPT Plus 訂閱無單次計費 + Claude Pro 訂閱）| 使用模型: Codex CLI gpt-5.5（並行 3 worker + Phase B/C/D）+ Claude Sonnet 4.6（PM、黃金樣本親做、Report 親寫）| 執行者: Codex + Claude
