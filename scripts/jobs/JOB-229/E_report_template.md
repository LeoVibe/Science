# JOB-229 Report 模板（Phase E 結案）

> 結案時 codex 草擬 + Claude 驗收。對照 jobs/JOB-228-Report.md 的成功 pattern。

寫入：`jobs/JOB-229-Report.md`

## Frontmatter

```
*Created by Claude Code (claude-opus-4-7) at <ISO 時間>*

`last_updated`: <ISO 時間>
`updated_by`: Claude Code (claude-opus-4-7)
```

## 結構（依 _JOB-REPORT-TEMPLATE.md）

### # JOB-229-Report 三下_自然 考古題 L2 結構化抽取

### ## 任務概要
- 派工單：jobs/JOB-229-AG-G3S2-自然-考古題L2結構化抽取.md
- 起訖時間：<開始日期> ~ <結案日期>
- 執行者：Codex（主力 Phase 5 + B/C/D 草擬）+ Claude（PM、A0/Pilot/Report 驗收，黃金樣本親做）
- 主要目標：123 份自然整合 MD → schema v1.0 結構化 JSON

### ## 完成項目

#### Phase 0
- [x] A0 編碼清單 75 條（performance 20 + content 55）
- [x] A1 prompt template（自然版，禁引社會 code 硬性已加）
- [x] 黃金樣本：翰林_112_成功國小_第一次段考.json（39 題、17 種編碼、Claude 親做）
- [x] Pilot 5 份 PASS（南一永光1/康軒興南2/南一中正1/康軒伸東1/南一成功2）

#### Phase 5 全量
- [x] 117 份分 A/B/C 三 worker 並行（39+39+39）
- [x] 完成度 <X>/117（<pct>%）
- [x] failed=<N>（已可控）
- [x] Layer 1 編碼合法率 <pct>%

#### Phase B 驗證
- [x] _validation_report_natural.json 產出
- [x] A 違規 <int> / B 違規 <int> / C 違規 <int>
- [x] clean=<int> / corrected=<int> / flagged=<int> / manual=<int>

#### Phase C/D 彙整
- [x] 三份 _L2_summary.md（翰林/康軒/南一）
- [x] 三下_自然_L2_整合.md
- [x] _L2_quality_report_natural.json

### ## 驗收結果（CQI 與門檻）

| 項目 | 門檻 | 實際值 | 結果 |
| --- | --- | --- | --- |
| Layer 1 編碼合法率 | ≥ 95% | <pct%> | ✅/❌ |
| Phase B clean ratio | ≥ 95% | <pct%> | ✅/❌ |
| 黃金樣本 0 違規 | = 0 | 0 | ✅ |
| Pilot 5/5 PASS | = 5 | <int> | ✅/❌ |
| Phase 5 完成度 | ≥ 95%（111/117）| <int>/117 | ✅/❌ |

### ## 異動清單（實際修改的檔案）

#### 新增
- `scripts/jobs/JOB-229/A0_extract_legal_codes.py`（A0 派工 prompt）
- `scripts/jobs/JOB-229/A2_pilot_prompt_template_natural.md`
- `scripts/jobs/JOB-229/A3_pilot_dispatch.sh`
- `scripts/jobs/JOB-229/A4_generate_full_targets.py`
- `scripts/jobs/JOB-229/A5_full_dispatch.sh`
- `scripts/jobs/JOB-229/A6_continuous_loop.sh`
- `scripts/jobs/JOB-229/A7_launch_3workers.sh`
- `scripts/jobs/JOB-229/B_validate_codes.py`
- `scripts/jobs/JOB-229/C_publisher_summary_prompt.md`
- `scripts/jobs/JOB-229/D_subject_integration_prompt.md`
- `scripts/jobs/JOB-229/dashboard.py`
- `scripts/jobs/JOB-229/spot_check_prompt_template.md`
- `scripts/jobs/JOB-229/_full_targets_{A,B,C}.json`
- `scripts/jobs/JOB-229/_full_progress_{A,B,C}.json`
- `scripts/jobs/JOB-229/_golden_evaluation/*` (6 份候選評估 + _summary.md)
- `knowledge/3_考古題/3_L2_結構化抽取/_meta/science_codes_legal_II.json`
- `knowledge/3_考古題/3_L2_結構化抽取/_golden_samples/翰林_112_成功國小_第一次段考.json`
- `knowledge/3_考古題/3_L2_結構化抽取/三下/三下_自然_pilot/*.json` (5 份)
- `knowledge/3_考古題/3_L2_結構化抽取/三下/三下_自然_翰林/*.json` (~14 份)
- `knowledge/3_考古題/3_L2_結構化抽取/三下/三下_自然_康軒/*.json` (~60 份)
- `knowledge/3_考古題/3_L2_結構化抽取/三下/三下_自然_南一/*.json` (~49 份)
- `knowledge/3_考古題/3_L2_結構化抽取/三下/三下_自然_翰林/_L2_summary.md`
- `knowledge/3_考古題/3_L2_結構化抽取/三下/三下_自然_康軒/_L2_summary.md`
- `knowledge/3_考古題/3_L2_結構化抽取/三下/三下_自然_南一/_L2_summary.md`
- `knowledge/3_考古題/3_L2_結構化抽取/三下/三下_自然_L2_整合.md`
- `knowledge/3_考古題/3_L2_結構化抽取/_validation_report_natural.json`
- `knowledge/3_考古題/3_L2_結構化抽取/_L2_quality_report_natural.json`

#### 移動
- `_golden_samples/翰林_108_文德國小_第二次段考.json` → `_golden_samples/_archive_social/`
- `_golden_samples/康軒_111_新北安和國小_期中考.json` → `_golden_samples/_archive_social/`

### ## 執行時間回報

| 子任務 | 耗時 | 備註 |
| --- | --- | --- |
| Phase 0.1 A0 | <min> | codex 草擬 + Claude 驗收 |
| Phase 0.2 黃金樣本 | <min> | Claude 親做 |
| Phase 0.3 Pilot | <min> | 5 份（含 retry） |
| Phase 5 主跑 | <hr> | 並行 3 worker |
| Phase B-E | <min> | codex 草擬 + Claude 驗收 |
| **總計** | <hr> | — |

### ## 邊界與遺留

- 本 JOB 未補 raw 缺口 12 份（須查 raw pipeline，獨立 JOB 處理）
- spot check 標準 ≥3 字微調已驗證 OK（永光1 reason 5/5 specific）
- 後續四/五/六下其他科目沿用本機制（另開 JOB-23X）

### ## 真實回報本次對話的模型與花費

＄作業匯總：Token 數: -- | 花費: --（codex 訂閱內無單次計費）| 使用模型: Codex CLI gpt-5.5 + Claude Opus 4.7（PM、驗收）| 執行者: Codex + Claude

### ## 同步進度與 Discord

- [ ] 進度總表已同步（`docs/進度彙整_題庫研發與產出.md`）
- [ ] /pj_sync 已執行
- [ ] Discord 結案回報送 chat_id 1487738477608177714
- [ ] node scripts/job_manager.js close JOB-229
- [ ] git commit 最終結案
