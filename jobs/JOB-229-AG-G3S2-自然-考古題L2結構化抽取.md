*Created by Claude Code (claude-opus-4-7) at 2026-05-10 13:08*

`last_updated`: 2026-05-10
`updated_by`: Claude Code (claude-opus-4-7)

# JOB-229-AG-G3S2-自然-考古題L2結構化抽取

**`job_type`**：`research`
**`executor`**：Codex（主任務 123 份 + Phase 0/B/C/D/E 草擬）+ Claude（PM、A0 驗收、黃金樣本親做、最終驗收）
**`parent_jobs`**：JOB-228（沿用機制 + 兩優化：Phase 5 並行 3 條、黃金樣本縮 1 份）

---

## 📌 任務背景

JOB-228 完成三下社會 109 份考古題 L2 結構化抽取，實測 14.7 hr 序列跑（占總時長 71%）。本 JOB 沿用全套機制做三下_自然，加上兩優化：

1. **Phase 5 並行 3 條 codex**（已驗證 3 條/6 條長任務無 rate limit）
2. **黃金樣本縮減為 1 份**（dual_source + paper_full + answer_full 主流情境）

JOB-226 已完成自然科三版本整合 MD（status=done、PASS），可用素材
**123 份**（翰林 14 + 康軒 60 + 南一 49；12 份 raw 階段缺口不在本 JOB 範圍）。

---

## 🎯 任務目標

完成後達到：
1. `_meta/science_codes_legal_II.json` 產出（codex 草擬 + Claude 驗收 ≥ 5 條對課綱原文）
2. `A2_pilot_prompt_template_natural.md` 自然版 prompt（spot check ≥3 字標準）
3. 1 份自然科黃金樣本（Claude 親做、schema v1.0、編碼 0 違規）
4. 5 份 Pilot 全 PASS（對齊黃金樣本）
5. 123 份 Phase 5 全量 codex 序列抽取（並行 3 worker，預估 ~5-6 hr）
6. Layer 1 編碼合法率 ≥ 95%（目標 100%）
7. _validation_report_natural.json + 三份 _L2_summary.md + 全科目整合 MD + _L2_quality_report_natural.json
8. JOB-229-Report.md（Codex 草擬 + Claude 驗收）

---

## 🚧 任務邊界

**只做**：
- A0 自然科合法編碼清單（codex 派工）
- A1 自然版 prompt template
- 1 份黃金樣本（Claude 親做）
- 5 份 Pilot
- Phase 5 全量 123 份（並行 3 worker）
- Phase B/C/D/E 結案

**不做**（遇到以下請停止並回報）：
- 補 raw 缺口 12 份（raw 階段問題、需另開 JOB 修 raw pipeline）
- 擴展到三下其他科目（國語/數學/英語）
- 擴展到四/五/六下
- 修改 JOB-228 既有產出
- 修改規範文件

---

## 📖 執行步驟

依 `docs/superpowers/plans/2026-05-10-job229-natural-l2-extraction.md` Task 1-15 執行。

| Phase | 內容 | 執行者 | 預估時間 |
|:--|:--|:--|:--:|
| Phase 0.1 | A0 編碼清單（派 codex） | codex 草擬 + Claude 驗收 | 30-60 min |
| Phase 0.2 | 黃金樣本 1 份（Claude 親做） | Claude | 2-3 hr |
| Phase 0.3 | Pilot 5 份 + 驗收 | codex 派工 + Claude 驗收 | 1 hr |
| Phase 5 | 全量 123 份（並行 3 worker） | codex × 3 | ~5-6 hr |
| Phase B-E | 驗證 + 彙整 + Report + 結案 | codex 草擬 + Claude 驗收 | ~1 hr |
| **總計** | — | — | **~9-11 hr** |

---

## 📜 關鍵參考檔案

| 檔案路徑 | 用途 |
|:--|:--|
| `docs/superpowers/specs/2026-05-10-job229-natural-l2-extraction-design.md` | 本 JOB 設計 spec |
| `docs/superpowers/plans/2026-05-10-job229-natural-l2-extraction.md` | 15 個 task 實作計畫 |
| `docs/superpowers/specs/2026-05-09-job228-phase5-batch-design.md` | JOB-228 spec（基底機制） |
| `jobs/JOB-228-Report.md` | JOB-228 結案報告（時間花費分析來源） |
| `knowledge/3_考古題/3_L2_結構化抽取/_meta/social_codes_legal_II.json` | 社會科編碼清單（A0 結構參考） |
| `scripts/jobs/JOB-228/A2_pilot_prompt_template.md` | 社會版 prompt template（A1 改寫基底） |
| `scripts/jobs/JOB-228/A2_full_dispatch.sh` | dispatch 腳本（含 watchdog + Layer 1） |
| `scripts/jobs/JOB-228/continuous_full_loop.sh` | loop wrapper |
| `~/.claude/projects/.../memory/feedback_codex_cli_model.md` | codex 不指定 -m |

---

## ✅ 啟動 Checklist (Pre-Flight)

- [x] JOB-228 流程文件已讀（dispatch.sh、dashboard、loop wrapper）
- [x] 三版本整合 MD 123 份齊全（翰林 14 + 康軒 60 + 南一 49）
- [x] codex 並行 3 條已驗證（本 session 兩次測試）
- [x] 預算：使用 ChatGPT 訂閱（無單次計費）
- [x] 已確認執行模型：Codex CLI gpt-5.5（codex 預設）+ Claude Opus 4.7（PM）
- [x] 已確認使用金鑰：使用者 ChatGPT Plus 訂閱（無 API key）
- [x] 已確認操作頻次：codex CLI 並行 3 條（已實證無 rate limit）
- [x] 已閱讀「任務邊界」並確認本次範圍

---

## ✅ 驗收 Checklist (Acceptance)

> 本 JOB 為 research，無 CQI 指標。改以結構完整性 + 編碼合法率 + 對齊度驗收。

### Phase 0
- [ ] science_codes_legal_II.json 產出 + Claude 抽 5 條對課綱原文驗證 PASS
- [ ] A2_pilot_prompt_template_natural.md 完成（spot check ≥3 字標準）
- [ ] 1 份黃金樣本（Claude 親做、結構完整、編碼 0 違規）

### Phase 5（123 份）
- [ ] 5/5 Pilot PASS（對黃金樣本 schema 一致、編碼合法 ≥ 95%）
- [ ] 3 worker 啟動成功（A 41 + B 41 + C 41 = 123）
- [ ] 整體完成度 = 123/123、failed = 0 或可控（≤ 5 份）
- [ ] Layer 1 編碼合法率 ≥ 95%（目標 100%）

### Phase B/C/D/E
- [ ] _validation_report_natural.json 違規率可控（≥ 95% clean）
- [ ] 三份 _L2_summary.md（翰林/康軒/南一），每份 5 H2 段落、≥ 200 行
- [ ] 三下_自然_L2_整合.md 完成（6 H2 段落、跨版本對照）
- [ ] _L2_quality_report_natural.json 完成
- [ ] JOB-229-Report.md 完成

---

## ✅ 成果 Checklist (Deliverables)

- [ ] 成果表格填寫完畢（執行者填）
- [ ] 進度總表已同步（`docs/進度彙整_題庫研發與產出.md`）
- [ ] 已執行 `/pj_sync`
- [ ] 產出 JOB-229-Report.md，異動清單已列出所有實際修改的檔案路徑
- [ ] node scripts/job_manager.js close JOB-229
- [ ] Discord 結案回報送 chat_id `1487738477608177714`
- [ ] git commit（最終結案）

---

## ⏱️ 執行時間回報

| 子任務 / 階段 | 開始時間 | 結束時間 | 耗時（分鐘） | 備註 |
|:--|:--|:--|:--|:--|
| Phase 0.1 A0 編碼清單 | — | — | — | 待跑 |
| Phase 0.2 黃金樣本 | — | — | — | Claude 親做 |
| Phase 0.3 Pilot | — | — | — | — |
| Phase 5 主跑 | — | — | — | 並行 3 worker |
| Phase B-E | — | — | — | — |
| **總計** | — | — | — | — |

> 時間欄由執行者填入，能取得 wall clock 者填精確值。

---

## 真實回報本次對話的模型與花費

＄作業匯總：Token 數: -- | 花費: --（codex 訂閱內無單次計費）| 使用模型: Codex CLI gpt-5.5（並行 3 條）+ Claude Opus 4.7（PM、驗收）| 執行者: Codex + Claude

---

## 邊界與遺留

- 不補 raw 缺口 12 份（須查 raw pipeline 根因，獨立 JOB 處理）
- 後續四/五/六下其他科目沿用本機制（另開 JOB-23X）
- spot check 標準微調：本 JOB 採 ≥3 字（依 JOB-228 遺留問題），跑完看是否仍 false positive 再決定是否進一步調整

---

## 黃金樣本選擇紀錄（Task 4 完成）

`chosen_golden_sample`: **翰林_112_成功國小_第一次段考**

來源 MD: `knowledge/3_考古題/2_MD淬鍊文字_整合版/三下/三下_自然_翰林/翰林_112_成功國小_第一次段考.md`

### 選擇依據（6 候選 codex 並行評估）

- 評估彙整: `scripts/jobs/JOB-229/_golden_evaluation/_summary.md`
- 6 份候選明細: `scripts/jobs/JOB-229/_golden_evaluation/三下_自然_*.md`

### 選定原因
1. 唯一同時滿足 dual_source_merged + paper_full + answer_full（claude 2726 + codex 2379 char）
2. 50 題（最多），題型 4 種完整（是非 12 / 選擇 13 / 回答 20 / 閱讀 5）
3. codex 評分結構 9 / 題型 8（最高）
4. 與 JOB-228 翰林_108_文德國小（社會黃金樣本）品質等級對應

### 已知限制
- topic_hits 集中「植物生長: 49」「天氣觀測: 1」
- 對策: Pilot 5 份補主題覆蓋（含天氣、動物、水三態、浮力）

### 並行 6 條 codex 性能實測
- 總耗時 209s，6 條 exit=0 全成功，無 rate limit
- 結論: 6 條並行可行，但本 JOB Phase 5 仍採並行 3 條（保守）
