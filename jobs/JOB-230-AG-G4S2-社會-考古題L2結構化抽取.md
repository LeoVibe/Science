*Created by Claude Code (claude-opus-4-7) at 2026-05-11 03:12*

`last_updated`: 2026-05-11 03:15
`updated_by`: Claude Code (claude-opus-4-7)

# JOB-230-AG-G4S2-社會-考古題L2結構化抽取

**`job_type`**：`question_prod`
**`executor`**：Codex CLI（主任務 + Phase B/C/D/E 草擬）+ Claude Opus 4.7（PM、A0/Pilot 驗收、黃金樣本親做、最終驗收）
**`parent_jobs`**：JOB-228（社會編碼清單沿用）+ JOB-229（三 worker 並行骨架）

---

## 📌 任務背景

JOB-228 完成三下_社會 L2 結構化抽取（109 份、6530 題、編碼合法率 100%、14h43m 序列）。JOB-229 完成三下_自然 L2（123 份、5860 題、4h53m，三 worker 並行 3x 加速）。本 JOB 延伸社會科到四下，沿用 JOB-229 並行骨架 + JOB-228 社會編碼清單。

四下_社會 整合 MD 共 **134 份**（翰林 40 / 康軒 57 / 南一 37；ls *.md 看到 137 份，但每出版社 1 份 `_integration_report.md` 屬整合階段報告須扣除），由 JOB-226 雙源整合產出。social_codes_legal_II.json 為第Ⅱ學習階段（涵蓋 G3/G4），可直接 reuse。

---

## 🎯 任務目標

完成後達到：
1. 1 份四下_社會 黃金樣本（Claude 親做、schema v1.0、編碼 0 違規）
2. A1 prompt template 改 grade 標記為「四下_社會」，編碼清單指向 `social_codes_legal_II.json`
3. 5 份 Pilot 全 PASS（對齊黃金樣本）
4. 134 份 Phase 5 全量 codex 抽取（並行 3 worker，預估 ~5-6 hr）
5. Layer 1 編碼合法率 ≥ 95%（目標 100%）
6. `_validation_report_social_g4.json` + 三份 `_L2_summary.md` + 全科目整合 `四下_社會_L2_整合.md` + `_L2_quality_report_social_g4.json`
7. `jobs/JOB-230-Report.md`（Codex 草擬 + Claude 驗收）

---

## 🚧 任務邊界

**只做**：
- A1 prompt template 改寫（社會四下版）
- 1 份黃金樣本（Claude 親做）
- 5 份 Pilot
- Phase 5 全量 134 份（並行 3 worker）
- Phase B/C/D/E 結案

**不做**（遇到以下請停止並回報）：
- 重新產 social_codes_legal_II.json（JOB-228 已驗收，直接 reuse）
- 擴展到四下其他科目（國語/數學/自然/英語）
- 擴展到五/六下（第Ⅲ階段，需另製 codes_legal_III.json）
- 修改 JOB-228/229 既有產出
- 修改規範文件
- 補 raw 階段缺口

---

## 📖 執行步驟

| Phase | 內容 | 執行者 | 預估時間 |
|:--|:--|:--|:--:|
| Phase 0.1 | fork JOB-229 骨架 → `scripts/jobs/JOB-230/`，A1 prompt 改四下_社會 + 編碼清單指 social_codes_legal_II.json | Claude | 30 min |
| Phase 0.2 | 黃金樣本 1 份（Claude 親做） | Claude | 2-3 hr |
| Phase 0.3 | Pilot 5 份 + 驗收 | codex × 3 + Claude 驗收 | 1 hr |
| Phase 5 | 全量 134 份（並行 3 worker） | codex × 3 | ~5-6 hr |
| Phase B | 全量編碼合法性驗證 | python script | 5 min |
| Phase C | 三版本 `_L2_summary.md`（codex 並行 3 條） | codex × 3 | ~10 min |
| Phase D | 全科目整合 `四下_社會_L2_整合.md` | codex | ~5 min |
| Phase E | JOB-230-Report.md | codex 草擬 + Claude 驗收 | ~15 min |
| **總計** | — | — | **~9-11 hr** |

---

## 📜 關鍵參考檔案

| 檔案路徑 | 用途 |
|:--|:--|
| `jobs/JOB-228-Report.md` | 社會科 L2 抽取基底機制（編碼清單來源） |
| `jobs/JOB-229-Report.md` | 三 worker 並行骨架 + 經驗教訓 |
| `knowledge/3_考古題/3_L2_結構化抽取/_meta/social_codes_legal_II.json` | 社會科第Ⅱ階段合法編碼（reuse） |
| `scripts/jobs/JOB-229/A1_pilot_prompt_template_natural.md` | prompt template 改寫基底（改自然→社會 + grade） |
| `scripts/jobs/JOB-229/A5_full_dispatch.sh` | dispatch（含 25min watchdog + Layer 1） |
| `scripts/jobs/JOB-229/A6_continuous_loop.sh` | loop wrapper |
| `scripts/jobs/JOB-229/A7_launch_3workers.sh` | launcher（含 progress.json 預建 fix） |
| `scripts/jobs/JOB-229/B_validate_codes.py` | Phase B 全量驗證 |
| `knowledge/3_考古題/3_L2_結構化抽取/三下/三下_社會_翰林/*.json` | schema v1.0 結構參考 |
| `~/.claude/projects/.../memory/feedback_codex_cli_model.md` | codex 不指定 -m |

---

## ✅ 啟動 Checklist (Pre-Flight)

- [ ] JOB-228/229 Report 已讀（時間花費 + 經驗教訓）
- [ ] 四下_社會 整合 MD 134 份齊全（待 listing 確認三版本分配）
- [ ] codex 並行 3 條已驗證（JOB-229 兩次測試 + 6 條 209s 性能）
- [ ] 預算：使用 ChatGPT 訂閱（無單次計費）
- [ ] 已確認執行模型：Codex CLI gpt-5.5（codex 預設）+ Claude Opus 4.7（PM）
- [ ] 已確認使用金鑰：使用者 ChatGPT Plus 訂閱（無 API key）
- [ ] 已確認操作頻次：codex CLI 並行 3 條
- [ ] 已閱讀「任務邊界」並確認本次範圍

---

## ✅ 驗收 Checklist (Acceptance)

> 本 JOB 為 question_prod L2 抽取（非新出題、非盲測），改以結構完整性 + 編碼合法率 + 對齊度驗收。CQI 指標不適用。

### Phase 0
- [ ] A1 prompt template 完成（grade=四下_社會、編碼指向 social_codes_legal_II.json、保留 JOB-229 硬性禁引機制 whitelist + 看到 INa/Aa 立即停止）
- [ ] 1 份黃金樣本（Claude 親做、schema v1.0 完整、編碼 0 違規）
- [ ] Pilot 5 份對黃金樣本 schema 一致、編碼合法率 100%

### Phase 5（134 份）
- [ ] 3 worker 啟動成功（扣 1 黃金 + 5 Pilot = 128 份 Phase 5 → A=43 + B=43 + C=42 = 128）
- [ ] 整體完成度 = 128/128（Phase 5 全量）、failed = 0 或可控（≤ 5 份）
- [ ] Layer 1 編碼合法率 ≥ 95%（目標 100%）

### Phase B/C/D/E
- [ ] `_validation_report_social_g4.json` 違規率可控（A_illegal / B_wrong_stage / C_duplicate 各 ≤ 1%）
- [ ] 三份 `_L2_summary.md`（翰林/康軒/南一），每份 5 H2 段落、≥ 200 行
- [ ] `四下_社會_L2_整合.md` 完成（6 H2 段落、跨版本對照）
- [ ] `_L2_quality_report_social_g4.json` 完成
- [ ] `jobs/JOB-230-Report.md` 完成（依 `_JOB-REPORT-TEMPLATE.md`）

---

## ✅ 成果 Checklist (Deliverables)

- [ ] 成果表格填寫完畢（執行者填）
- [ ] 進度總表已同步（`docs/進度彙整_題庫研發與產出.md`）
- [ ] `docs/README_專案發展紀錄.md` 新增 JOB-230 記錄
- [ ] 已執行 `/pj_sync`
- [ ] JOB-230-Report.md 異動清單已列所有實際修改檔案路徑
- [ ] `node scripts/job_manager.js close JOB-230`
- [ ] Discord 結案回報送 chat_id `1487738477608177714`
- [ ] git commit（最終結案）

---

## ⏱️ 執行時間回報

| 子任務 / 階段 | 開始時間 | 結束時間 | 耗時（分鐘） | 備註 |
|:--|:--|:--|:--|:--|
| Phase 0.1 fork 骨架 + A1 prompt | — | — | — | — |
| Phase 0.2 黃金樣本 | — | — | — | Claude 親做 |
| Phase 0.3 Pilot 5 | — | — | — | — |
| Phase 5 全量 128（扣 1 黃金+5 Pilot）| — | — | — | 並行 3 worker |
| Phase B-E 結案 | — | — | — | — |
| **總計** | — | — | — | — |

> 時間欄由執行者填入，能取得 wall clock 者填精確值。

---

## 真實回報本次對話的模型與花費

＄作業匯總：Token 數: -- | 花費: --（codex ChatGPT Plus 訂閱無單次計費）| 使用模型: Codex CLI gpt-5.5（並行 3 條 worker + Phase B/C/D/E 草擬）+ Claude Opus 4.7（PM、Pilot/Report 驗收、黃金樣本親做）| 執行者: Codex + Claude

---

## 邊界與遺留

- social_codes_legal_II.json 第Ⅱ階段含 G3+G4 編碼，沿用 JOB-228 既有驗收結果
- 後續 G5/G6 社會需另製 social_codes_legal_III.json（第Ⅲ階段）+ 另開 JOB
- 後續 G4 其他科目（國語/數學/自然/英語）沿用本機制 + JOB-229 自然編碼清單，另開 JOB-23X
- spot check 標準沿用 JOB-229 ≥3 字（修正 JOB-228 ≥5 字邊界誤判）
- 全量 128 份（扣黃金+Pilot）比 JOB-229 的 117 份多 ~9%，watchdog 25min 維持不變，跑前 10 份觀察平均耗時，若超過 18min 則調整

---

## 黃金樣本選擇紀錄（Phase 0.2 開跑前填）

`chosen_golden_sample`: **待選**

候選原則（沿用 JOB-229 Task 4 邏輯）：
1. 必須 dual_source_merged（兩源整合）+ paper_full（題目完整）+ answer_full（答案完整）
2. 題數適中（30-50 題優先）
3. 題型多元（選擇 + 是非 + 回答 + 閱讀理解 / 圖表題等）
4. 主題覆蓋廣（避免單一單元）
5. 三版本擇一即可（建議翰林優先，與 JOB-228 黃金樣本來源一致）

選定後填入：
- 來源 MD 路徑：
- 選擇依據：
- 已知限制：
- Pilot 5 主題補位策略：
