*Created by Claude Code (claude-opus-4-7) at 2026-05-12 03:25*

`last_updated`: 2026-05-12 03:25
`updated_by`: Claude Code (claude-opus-4-7)

# JOB-231-AG-G4S3-自然-考古題L2結構化抽取

**`job_type`**：`question_prod`
**`executor`**：Codex CLI gpt-5.5（Phase 5 主跑 + Phase B/C/D 草擬）+ Claude Opus 4.7（PM、A1/Pilot 驗收、黃金樣本親做、Report 親寫）
**`parent_jobs`**：JOB-229（自然科 science_codes_legal_II.json 沿用）+ JOB-230（並行骨架 + watchdog + Layer 1 機制沿用）

---

## 📌 任務背景

JOB-228 完成三下_社會 109 份 L2 抽取（序列 14h43m）。JOB-229 完成三下_自然 117 份（並行 3 worker 4h53m、3x 加速）。JOB-230 完成四下_社會 127/128 份（5h31m、編碼合法率 100%）。本 JOB 延伸自然科到四下，沿用 JOB-229 自然編碼清單 + JOB-230 三 worker 並行骨架。

四下_自然 整合 MD 共 **124 份**（翰林 23 / 康軒 57 / 南一 44；ls 看到 127 份扣 3 個 `_integration_report.md`），由 JOB-226 雙源整合產出。`science_codes_legal_II.json` 為第Ⅱ學習階段（涵蓋 G3/G4），JOB-229 已驗收，可直接 reuse。

### Source MD quality_flags 分布（124 份）

- `dual_source_merged` 僅 3 份（翰林 2 + 康軒 1）— 稀少
- `codex_only` 100 份（主流情境）
- `claude_only` 21 份
- `paper_full + answer_full` 29 份（翰林 3 / 康軒 11 / 南一 15）
- raw 缺口估 21-38 份（paper_empty 21 + extract_failed 17 部分重疊）

---

## 🎯 任務目標

1. A1 prompt template（四下_自然版，編碼指 `science_codes_legal_II.json`、禁引社會 prefix `Aa/Bb/Cc/Dc` 等）
2. 1 份四下_自然 黃金樣本（Claude 親做、翰林 codex_only+paper_full+answer_full 主流候選擇 1、schema v1.0、編碼 0 違規）
3. 5 份 Pilot 全 PASS（對齊黃金樣本）
4. 118 份 Phase 5 全量 codex 抽取（並行 3 worker，預估 ~5-6 hr）
5. Layer 1 編碼合法率 ≥ 95%（目標 100%）
6. `_validation_report_natural_g4.json` + 三份 `_L2_summary.md` + `四下_自然_L2_整合.md` + `_L2_quality_report_natural_g4.json`
7. `jobs/JOB-231-Report.md`（Claude 親寫）

---

## 🚧 任務邊界

**只做**：
- fork JOB-230 骨架 → `scripts/jobs/JOB-231/` + 改 grade=四下_自然 + 編碼指 science_codes_legal_II.json
- 1 份黃金樣本（Claude 親做、翰林 codex_only+paper_full+answer_full 主流情境）
- 5 份 Pilot（codex 並行 3+2）
- Phase 5 全量 118 份（扣 1 黃金 + 5 Pilot 後 = 118 份，A=40+B=39+C=39）
- Phase B/C/D/E 結案

**不做**（遇到以下請停止並回報）：
- 重新產 science_codes_legal_II.json（JOB-229 已驗收，直接 reuse）
- 擴展到四下其他科目（國語/數學/社會/英語）
- 擴展到五/六下（第Ⅲ階段，需另製 codes_legal_III.json）
- 修改 JOB-228/229/230 既有產出
- 修改規範文件
- 補 raw 缺口（21-38 份 paper_empty/extract_failed 邊界）
- 修 A5 watchdog 競態 bug（獨立 JOB）

---

## 📖 執行步驟

| Phase | 內容 | 執行者 | 預估時間 |
|:--|:--|:--|:--:|
| Phase 0.1 | fork JOB-230 骨架 → `scripts/jobs/JOB-231/`，A1 prompt 改四下_自然 + 編碼清單指 science_codes_legal_II.json | Claude | 20 min |
| Phase 0.2 | 黃金樣本 1 份（Claude 親做、翰林 codex_only+paper_full+answer_full 主流） | Claude | 1.5 hr |
| Phase 0.3 | Pilot 5 份 + 驗收 | codex × 3+2 | 15-20 min |
| Phase 5 | 全量 118 份（並行 3 worker） | codex × 3 | ~5-6 hr |
| Phase B | 全量編碼合法性驗證 | python | < 1 min |
| Phase C | 三版本 `_L2_summary.md`（codex 並行 3 條） | codex × 3 | ~15 min |
| Phase D | 全科目整合 `四下_自然_L2_整合.md` | codex | ~5 min |
| Phase E | JOB-231-Report.md | Claude 親寫 | ~10 min |
| **總計** | — | — | **~8-10 hr** |

---

## 📜 關鍵參考檔案

| 檔案路徑 | 用途 |
|:--|:--|
| `jobs/JOB-229-Report.md` | 自然科 L2 抽取 schema + 編碼清單來源 |
| `jobs/JOB-230-Report.md` | 四下_社會 L2 並行骨架經驗 + watchdog 案例 |
| `knowledge/3_考古題/3_L2_結構化抽取/_meta/science_codes_legal_II.json` | 自然科第Ⅱ階段合法編碼（75 條：performance 20 + content 55）|
| `scripts/jobs/JOB-230/A1_pilot_prompt_template_social_g4.md` | A1 prompt 結構參考（改 grade + 編碼清單路徑） |
| `scripts/jobs/JOB-229/A2_pilot_prompt_template_natural.md` | 三下_自然 prompt（grade 改四下_自然即可） |
| `scripts/jobs/JOB-230/A5_full_dispatch.sh` | dispatch（含 25min watchdog + Layer 1） |
| `scripts/jobs/JOB-230/A7_launch_3workers.sh` | launcher（含 progress.json 預建 fix） |
| `scripts/jobs/JOB-230/B_validate_codes.py` | Phase B 全量驗證 |
| `knowledge/3_考古題/3_L2_結構化抽取/_golden_samples/翰林_112_成功國小_第一次段考.json` | JOB-229 自然黃金樣本（schema 對照）|

---

## ✅ 啟動 Checklist (Pre-Flight)

- [ ] JOB-229/230 Report 已讀（時間花費 + 經驗教訓）
- [ ] 四下_自然 整合 MD 124 份齊全（翰林 23 + 康軒 57 + 南一 44）
- [ ] science_codes_legal_II.json 存在且可 reuse
- [ ] codex 並行 3 條已驗證（JOB-230 5h31m 跑完 127 份）
- [ ] 預算：使用 ChatGPT 訂閱（無單次計費）
- [ ] 已確認執行模型：Codex CLI gpt-5.5（codex 預設）+ Claude Opus 4.7（PM、親做）
- [ ] 已閱讀「任務邊界」並確認本次範圍

---

## ✅ 驗收 Checklist (Acceptance)

> 本 JOB 為 question_prod L2 抽取（非新出題、非盲測），改以結構完整性 + 編碼合法率 + 對齊度驗收。CQI 指標不適用。

### Phase 0
- [ ] A1 prompt template 完成（grade=四下_自然、編碼指向 science_codes_legal_II.json、保留 JOB-229 硬性禁引機制 + 看到 Aa/Bb/Dc 立即停止）
- [ ] 1 份黃金樣本（Claude 親做、schema v1.0 完整、編碼 0 違規）
- [ ] Pilot 5 份對黃金樣本 schema 一致、編碼合法率 100%

### Phase 5（118 份）
- [ ] 3 worker 啟動成功（扣 1 黃金 + 5 Pilot = 118 份 → A=40 + B=39 + C=39）
- [ ] 整體完成度 ≥ 95%（≥112/118）、failed ≤ 5 份（含 raw 缺口）
- [ ] Layer 1 編碼合法率 ≥ 95%（目標 100%）

### Phase B/C/D/E
- [ ] `_validation_report_natural_g4.json` 違規率可控（A/B/C 各 ≤ 1%）
- [ ] 三份 `_L2_summary.md`（翰林/康軒/南一），每份 5 H2 段落、≥ 200 行
- [ ] `四下_自然_L2_整合.md` 完成（6 H2 段落、跨版本對照）
- [ ] `jobs/JOB-231-Report.md` 完成（依 `_JOB-REPORT-TEMPLATE.md`）

---

## ✅ 成果 Checklist (Deliverables)

- [ ] 成果表格填寫完畢（執行者填）
- [ ] 進度總表已同步（`docs/進度彙整_題庫研發與產出.md`）
- [ ] `docs/README_專案發展紀錄.md` 新增 JOB-231 記錄
- [ ] 已執行 `/pj_sync`
- [ ] JOB-231-Report.md 異動清單已列所有實際修改檔案路徑
- [ ] `node scripts/job_manager.js close JOB-231`
- [ ] Discord 結案回報送 chat_id `1487738477608177714`
- [ ] git commit（最終結案）

---

## ⏱️ 執行時間回報

| 子任務 / 階段 | 開始時間 | 結束時間 | 耗時（分鐘） | 備註 |
|:--|:--|:--|:--|:--|
| Phase 0.1 fork 骨架 + A1 prompt | — | — | — | Claude |
| Phase 0.2 黃金樣本 | — | — | — | Claude 親做 |
| Phase 0.3 Pilot 5 | — | — | — | — |
| Phase 5 全量 118 | — | — | — | 並行 3 worker |
| Phase B-E 結案 | — | — | — | — |
| **總計** | — | — | — | — |

> 時間欄由執行者填入，能取得 wall clock 者填精確值。

---

## 真實回報本次對話的模型與花費

＄作業匯總：Token 數: -- | 花費: --（codex ChatGPT Plus 訂閱無單次計費 + Claude Pro 訂閱）| 使用模型: Codex CLI gpt-5.5（並行 3 條 worker + Phase B/C/D 草擬）+ Claude Opus 4.7（PM、A1 prompt/Pilot/Report 親寫，黃金樣本親做）| 執行者: Codex + Claude

---

## 邊界與遺留

- `science_codes_legal_II.json` 第Ⅱ階段含 G3+G4 編碼，沿用 JOB-229 既有驗收結果
- 後續 G5/G6 自然需另製 `science_codes_legal_III.json`（第Ⅲ階段）+ 另開 JOB
- 後續 G4 其他科目（國語/數學/英語）需先做各科第Ⅱ階段編碼清單，另開 JOB-23X
- spot check 標準沿用 JOB-229/230 ≥3 字
- 124 份比 JOB-230 的 134 份略少，預估 5-6 hr 完成
- A5 dispatch.sh watchdog 競態 bug（JOB-230 發現）—— 本 JOB 內不修，獨立 JOB 處理

---

## 黃金樣本選擇紀錄（Phase 0.2 開跑前填）

`chosen_golden_sample`: **待選**

候選原則（沿用 JOB-230 邏輯）：
1. 必須 codex_only + paper_full + answer_full 主流情境（翰林有 3 份候選）
2. 題數適中（30-50 題優先）
3. 題型多元（是非 + 選擇 + 填空 + 短答 + 圖表 / 閱讀理解等）
4. 主題覆蓋廣（避免單一單元集中）
5. 翰林優先（與 JOB-228/229/230 翰林黃金樣本來源一致）

選定後填入：
- 來源 MD 路徑：
- 選擇依據：
- 已知限制：
- Pilot 5 主題補位策略：
