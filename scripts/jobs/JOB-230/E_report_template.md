# JOB-230 Report 模板（Phase E 結案）

> 結案時 codex 草擬 + Claude 驗收。對照 jobs/JOB-228-Report.md / jobs/JOB-229-Report.md 的成功 pattern。

寫入：`jobs/JOB-230-Report.md`

## Frontmatter

```
*Created by Claude Code (claude-opus-4-7) at <ISO 時間>*

`last_updated`: <ISO 時間>
`updated_by`: Claude Code (claude-opus-4-7)
```

## 結構（依 _JOB-REPORT-TEMPLATE.md）

### # JOB-230-Report 四下_社會 考古題 L2 結構化抽取

### ## 任務概要
- 派工單：jobs/JOB-230-AG-G4S2-社會-考古題L2結構化抽取.md
- 起訖時間：<開始日期> ~ <結案日期>
- 執行者：Codex（主力 Phase 5 + B/C/D 草擬）+ Claude（PM、Pilot/Report 驗收，黃金樣本親做）
- 主要目標：137 份四下_社會整合 MD → schema v1.0 結構化 JSON

### ## 完成項目

#### Phase 0
- [x] A1 prompt template（四下_社會版，禁引自然 code 硬性已加）
- [x] 黃金樣本：四下_社會_<待 Phase 0.2 確定>.json（Claude 親做、編碼 0 違規）
- [x] Pilot 5 份 PASS（候選由 Phase 0.3 確定）

#### Phase 5 全量
- [x] 131 份分 A/B/C 三 worker 並行（~44+44+43；扣 1 黃金 + 5 Pilot）
- [x] 完成度 <X>/131（<pct>%）
- [x] failed=<N>（已可控）
- [x] Layer 1 編碼合法率 <pct>%

#### Phase B 驗證
- [x] _validation_report_social_g4.json 產出
- [x] A 違規 <int> / B 違規 <int> / C 違規 <int>
- [x] clean=<int> / corrected=<int> / flagged=<int> / manual=<int>

#### Phase C/D 彙整
- [x] 三份 _L2_summary.md（翰林/康軒/南一）
- [x] 四下_社會_L2_整合.md
- [x] _L2_quality_report_social_g4.json

### ## 驗收結果（CQI 與門檻）

| 項目 | 門檻 | 實際值 | 結果 |
| --- | --- | --- | --- |
| Layer 1 編碼合法率 | ≥ 95% | <pct%> | ✅/❌ |
| Phase B clean ratio | ≥ 95% | <pct%> | ✅/❌ |
| 黃金樣本 0 違規 | = 0 | 0 | ✅ |
| Pilot 5/5 PASS | = 5 | <int> | ✅/❌ |
| Phase 5 完成度 | ≥ 95%（125/131）| <int>/131 | ✅/❌ |

### ## 異動清單（實際修改的檔案）

#### 新增
- `scripts/jobs/JOB-230/A1_pilot_prompt_template_social_g4.md`
- `scripts/jobs/JOB-230/A3_pilot_dispatch.sh`
- `scripts/jobs/JOB-230/A4_generate_full_targets.py`
- `scripts/jobs/JOB-230/A5_full_dispatch.sh`
- `scripts/jobs/JOB-230/A6_continuous_loop.sh`
- `scripts/jobs/JOB-230/A7_launch_3workers.sh`
- `scripts/jobs/JOB-230/B_validate_codes.py`
- `scripts/jobs/JOB-230/C_publisher_summary_prompt.md`
- `scripts/jobs/JOB-230/D_subject_integration_prompt.md`
- `scripts/jobs/JOB-230/E_report_template.md`
- `scripts/jobs/JOB-230/dashboard.py`
- `scripts/jobs/JOB-230/spot_check_prompt_template.md`
- `scripts/jobs/JOB-230/_full_targets_{A,B,C}.json`
- `scripts/jobs/JOB-230/_full_progress_{A,B,C}.json`
- `knowledge/3_考古題/3_L2_結構化抽取/_golden_samples/四下_社會_<chosen>.json`
- `knowledge/3_考古題/3_L2_結構化抽取/四下/四下_社會_pilot/*.json` (5 份)
- `knowledge/3_考古題/3_L2_結構化抽取/四下/四下_社會_翰林/*.json` (~41 份)
- `knowledge/3_考古題/3_L2_結構化抽取/四下/四下_社會_康軒/*.json` (~58 份)
- `knowledge/3_考古題/3_L2_結構化抽取/四下/四下_社會_南一/*.json` (~38 份)
- `knowledge/3_考古題/3_L2_結構化抽取/四下/四下_社會_翰林/_L2_summary.md`
- `knowledge/3_考古題/3_L2_結構化抽取/四下/四下_社會_康軒/_L2_summary.md`
- `knowledge/3_考古題/3_L2_結構化抽取/四下/四下_社會_南一/_L2_summary.md`
- `knowledge/3_考古題/3_L2_結構化抽取/四下/四下_社會_L2_整合.md`
- `knowledge/3_考古題/3_L2_結構化抽取/_validation_report_social_g4.json`
- `knowledge/3_考古題/3_L2_結構化抽取/_L2_quality_report_social_g4.json`

#### Reuse（無修改）
- `knowledge/3_考古題/3_L2_結構化抽取/_meta/social_codes_legal_II.json`（JOB-228 已產出）

### ## 執行時間回報

| 子任務 | 耗時 | 備註 |
| --- | --- | --- |
| Phase 0.1 fork 骨架 + A1 prompt | <min> | Claude |
| Phase 0.2 黃金樣本 | <min> | Claude 親做 |
| Phase 0.3 Pilot | <min> | 5 份（含 retry） |
| Phase 5 主跑 | <hr> | 並行 3 worker |
| Phase B-E | <min> | codex 草擬 + Claude 驗收 |
| **總計** | <hr> | — |

### ## 邊界與遺留

- social_codes_legal_II.json 直接沿用 JOB-228（含 G3+G4 第Ⅱ階段編碼）
- 後續 G5/G6 社會需另製 social_codes_legal_III.json + 另開 JOB
- 後續 G4 其他科目（國語/數學/自然/英語）沿用本機制 + 各科編碼清單，另開 JOB-23X
- spot check 標準 ≥3 字（沿用 JOB-229）

### ## 真實回報本次對話的模型與花費

＄作業匯總：Token 數: -- | 花費: --（codex 訂閱內無單次計費）| 使用模型: Codex CLI gpt-5.5 + Claude Opus 4.7（PM、驗收）| 執行者: Codex + Claude

### ## 同步進度與 Discord

- [ ] 進度總表已同步（`docs/進度彙整_題庫研發與產出.md`）
- [ ] docs/README_專案發展紀錄.md 新增 JOB-230 記錄
- [ ] /pj_sync 已執行
- [ ] Discord 結案回報送 chat_id 1487738477608177714
- [ ] node scripts/job_manager.js close JOB-230
- [ ] git commit 最終結案
