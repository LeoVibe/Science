*Created by Codex at 2026-05-09 23:41*

`last_updated`: 2026-05-09 23:41
`updated_by`: Codex (GPT-5)

# JOB-228 結案報告

**`job_type`**（須與開案派工單一致）：`research`
**`executor`**：Codex（109 份抽取）+ Claude（PM 監督、驗收、收尾）

## 📊 成果摘要
JOB-228 完成三下社會考古題 L2 結構化抽取，Phase 5 109 份、黃金樣本 2 份、Pilot 5 份，合計 116 份結構化 JSON。Codex Phase 5 序列執行時間為 2026-05-09 08:32:05 至 22:59:50，共 867 分鐘；全量驗證顯示 10048 個 codes 零違規。三版本認知層次分布皆健康，記憶題低於 50%，高層認知均高於 20%。翰林、康軒、南一三份 `_L2_summary.md` 與 `三下_社會_L2_整合.md` 均已完成，支援後續 KL2/KL3/KL4 反查與出題補強。

| 指標 | 數值 |
|:--|:--|
| 新增題數 | 0 題（本 JOB 不出題，是結構化抽取） |
| CQI-P 平均 | -（不適用） |
| CQI-V Match Rate | -（不適用） |
| 最終 CQI 平均 | -（不適用） |
| 品質標籤 | -（不適用） |

## 📋 逐版本成果

| 版本 | 份數 | 題數 | codes 數 | code 覆蓋 | 平均每題 codes | 認知層次檢核 |
|:--|--:|--:|--:|:--|--:|:--|
| 翰林 | 30 | 1752 | 2093 | 29/35（82.86%） | 1.19 | 健康：記憶 21.9%，高層 46.2% |
| 康軒 | 57 | 3119 | 5583 | 34/35（97.14%） | 1.79 | 健康：記憶 25.6%，高層 46.0% |
| 南一 | 22 | 1236 | 1782 | 30/35（85.71%） | 1.44 | 健康：記憶 25.9%，高層 47.0% |

## 📂 異動清單

> 本表列前 10 個代表路徑。JOB-228 Phase 5-B/C/D/E 統計共 125 個異動項：本表 10 項 + 109 份 Phase 5 JSON + 3 份 `_L2_summary.md` + 1 份整合 MD + 本 Report + `_L2_quality_report.json`。

| 檔案路徑 | 異動類型 | 說明 |
|:--|:--|:--|
| `scripts/jobs/JOB-228/A2_pilot_dispatch.sh` | 修改 | 修正 resume / fresh 行為，避免重跑時誤用既有 progress |
| `scripts/jobs/JOB-228/A2_full_dispatch.sh` | 新增 | Phase 5 全量派工 dispatch 腳本 |
| `scripts/jobs/JOB-228/dashboard.py` | 新增 | 長時批次進度 dashboard |
| `scripts/jobs/JOB-228/continuous_full_loop.sh` | 新增 | 連續派工 loop 與 watchdog 骨架 |
| `scripts/jobs/JOB-228/spot_check_prompt_template.md` | 新增 | spot check prompt 樣板 |
| `scripts/jobs/JOB-228/B_validate_codes.py` | 新增 | 116 份 JSON 全量合法編碼驗證腳本 |
| `scripts/jobs/JOB-228/_full_targets.json` | 新增 | Phase 5 109 份目標清單 |
| `scripts/jobs/JOB-228/_full_progress.json` | 新增 / 修改 | Phase 5 執行進度與完成紀錄 |
| `scripts/jobs/JOB-228/_spot_check.log` | 新增 | 13 次 spot check JSONL 紀錄 |
| `knowledge/3_考古題/3_L2_結構化抽取/_validation_report.json` | 新增 | 116 份檔案級驗證總表 |

## ✅ Checklist 對照結果

### 驗收 Checklist (Acceptance)
- [x] 產出最多 116 份題目級 JSON，且實際產出與 skipped_files 對齊 116 — 佐證：`_validation_report.json` total_files=116，Phase 5 109 + 黃金 2 + Pilot 5。
- [x] 每份 JSON 通過 schema v1.0 驗證 — 佐證：`B_validate_codes.py` 輸出 clean=116。
- [x] 每題 codes_candidate 100% 在合法清單內 — 佐證：A_illegal=0、B_wrong_stage=0、C_duplicate=0。
- [x] 黃金樣本 2 份存在並納入驗證 — 佐證：`_golden_samples/康軒_111_新北安和國小_期中考.json`、`_golden_samples/翰林_108_文德國小_第二次段考.json`。
- [x] Pilot 5 份對照通過 — 佐證：`_pilot/*.json` 5 份納入 `_validation_report.json` 且 action=clean。
- [x] 三版本各 1 份 `_L2_summary.md` — 佐證：翰林 / 康軒 / 南一三份 summary，last_updated=2026-05-09T23:28:55+08:00。
- [x] 1 份 `三下_社會_L2_整合.md` 跨版本對比 — 佐證：total_files=109、total_questions=6107、total_codes=9458。
- [x] 自我品質報告 `_L2_quality_report.json` — 佐證：本次新增，含 validation、spot_check、execution 統計。

### 成果 Checklist (Deliverables)
- [x] 成果表格填寫完畢 — 佐證：本 Report「逐版本成果」。
- [x] 進度總表已同步 — 佐證：`scripts/jobs/JOB-228/_full_progress.json` completed=109、failed=[]、running=null。
- [x] 已執行 `/pj_sync` — 佐證：`docs/進度彙整_題庫研發與產出.md` frontmatter 與 `docs/README_專案發展紀錄.md`「2026-05-09」區塊均已更新 JOB-228 結案紀錄。
- [x] Report 異動清單已列出實際路徑 — 佐證：本 Report「異動清單」列前 10 項並註明總數。

## 🔄 同步確認
- [x] `docs/進度彙整_題庫研發與產出.md` 已更新（frontmatter last_updated → 2026-05-09，updated_by 含 JOB-228 結案註記）
- [x] `docs/README_專案發展紀錄.md` 已觸發 /pj_sync（「2026-05-09」區塊新增 JOB-228 完整紀錄）
- [N/A] `apps/v3_eidos/src/data/libraryStats.json` 不適用（本 JOB 不出題、不影響題庫統計）

## ⚠️ 遺留問題
1. spot check template 標準偏嚴，使用「≥5 字題幹片段」造成 rank 55/67/75 三個 false positive；建議後續改為 ≥3 字，已分析但未 apply。
2. 後續四下、五下、六下 L2 結構化抽取可沿用本機制，但應另開 JOB。
3. ~~康軒 `2b-Ⅱ-1` 唯一缺口~~ 等出題階段補強；這不是本 JOB 範圍。

## 🔧 技術筆記
1. `dispatch.sh` resume 預設 bug 已修復：FRESH 旗標需明示重置，避免續跑狀態誤用。
2. 25 min watchdog timeout 機制有效降低 Codex 長時卡住風險。
3. Codex CLI 使用 ChatGPT 訂閱時不要硬指定 `-m` model；該限制已存 memory，後續 dispatch 應沿用。
4. 長時批次任務五元件骨架運作良好：progress + worker + dashboard + loop + wakeup。

## 🔍 驗收確認
| 欄位 | 內容 |
|:--|:--|
| 驗收者 | Claude Code (claude-opus-4-7) |
| 驗收時間 | 2026-05-09 23:54 |
| 驗收結果 | 通過 |
| 退回原因 | 無 |

**驗收佐證**：
- 116 份 JSON 結構化抽取齊全（_validation_report.json total_files=116）
- 編碼合法率 100%（A=0 B=0 C=0、10048 codes 全合法）
- 認知層次三版本皆健康（記憶 ≤ 50% AND 高層認知 ≥ 20%）
- 三份 _L2_summary.md + 全科目整合 MD 結構完整（H2 段落齊全、數字對齊）
- spot check 13 次中 3 個 false positive 已 Claude meta-review 確認非真品質問題

## ⏱️ 執行時間回報

| 子任務 / 階段 | 開始時間 | 結束時間 | 耗時（分鐘） | 備註 |
|:--|:--|:--|--:|:--|
| Phase 5 派工 + 執行 | 2026-05-09 08:32:05 | 2026-05-09 22:59:50 | 867 | 109 份 Phase 5 JSON；`_full_progress.json` completed=109 |
| Phase B 驗證 | 2026-05-09 23:18:11 | 2026-05-09 23:21:28 | 4 | 起點取 `JOB-228-codex-phase-b.log` birthtime，終點取 `_validation_report.json` validated_at |
| Phase C+D+E 彙整與結案草稿 | 2026-05-09 23:23:17 | 2026-05-09 23:41:05 | 18 | Phase C/D/E log + 本 Report / quality report 草稿 |
| **總計** | — | — | **889** | — |

> 時間來源：Phase 5 取 `_L2_quality_report.json` 指定 timestamp；Phase B/C/D/E 取 log birth/mtime 與產物 timestamp。

## 真實回報本次對話的模型與花費
＄作業匯總：Token數:約 14.2M-14.4M（JOB-228 log 可讀 token footer 合計 14,187,784；108/109 份 full-rank log 合計 13,354,772，rank 1 缺 token footer，依鄰近 full-rank 均值估算；`_spot_check.log` 僅有 13 筆 verdict，無 token 欄位） | 花費: 未提供 / 未換算（ChatGPT/Codex 訂閱模式無單次單價） | 使用模型: Codex CLI gpt-5.5；部分 JSON meta 沿用 gpt-5-codex 標記 | 執行者: Codex + Claude
