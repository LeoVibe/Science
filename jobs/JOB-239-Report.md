*Created by Claude Code (claude-opus-4-7) at 2026-05-18 18:15*

`last_updated`: 2026-05-18 18:15
`updated_by`: Claude Opus 4.7（Phase E 親寫）

# JOB-239-Report：三下_國語 考古題 L2 結構化抽取

---

## 一、任務摘要

| 項目 | 數值 |
|:--|:--|
| 執行 JOB | JOB-239-AG-三下_國語-考古題L2結構化抽取 |
| 執行者 | Codex CLI gpt-5.5（Phase 5/C/D）+ Claude Opus 4.7 / Sonnet 4.6（PM、黃金樣本、Report）|
| 資料範圍 | 三下_國語，翰林/康軒/南一，114 份（含 1 黃金 + 5 Pilot + 108 全量）|
| 執行期間 | 2026-05-18 00:40 ～ 2026-05-18 18:15 |
| 總耗時 | ~17.6 hr |

---

## 二、執行時間回報

| 子任務 / 階段 | 開始時間（TPE） | 結束時間（TPE） | 耗時 | 備註 |
|:--|:--|:--|:--|:--|
| Phase 0.1 腳本 fork | 2026-05-18 00:40 | 2026-05-18 00:50 | ~10 min | fork JOB-238 → JOB-239，A4 dry-run 114份 OK |
| Phase 0.2 黃金樣本 | 2026-05-18 00:50 | 2026-05-18 01:15 | ~25 min | Claude 親做 67 題，0 violations |
| Phase 0.3 Pilot 5 份 | 2026-05-18 06:08 | 2026-05-18 07:25 | ~77 min | 4/5 一次過；康軒 columns_reordered codex hung 46min → kill + stdin pipe 重跑成功（~5min），307/307 碼合法 |
| Phase 5 全量 108 份 | 2026-05-18 07:26 | 2026-05-18 ~17:30 | ~600 min (~10.0 hr) | 3 worker 並行，A=36/B=36/C=36 |
| Phase B 驗證 | 2026-05-18 18:05 | 2026-05-18 18:05 | < 1 min | 114 files，0 violations |
| Phase C 三版本摘要 | 2026-05-18 18:05 | 2026-05-18 18:10 | ~5 min | 3 codex 並行（翰林/康軒/南一） |
| Phase D 整合報告 | 2026-05-18 18:11 | 2026-05-18 18:14 | ~3 min | 三下_國語_L2_整合.md |
| Phase E Report | 2026-05-18 18:15 | 2026-05-18 18:25 | ~10 min | Claude 親寫 |
| **總計** | 2026-05-18 00:40 | 2026-05-18 18:25 | **~17.6 hr** | |

---

## 三、成果數字

### Phase 5 全量

| 指標 | 數值 |
|:--|:--|
| 目標份數 | 108 份（114 - 1黃金 - 5Pilot）|
| 完成份數 | 108 / 108（✅ 100%）|
| failed | 0 |
| 3 worker 分配 | A=36 / B=36 / C=36 |

### Phase B 編碼驗證

| 指標 | 數值 |
|:--|:--|
| 驗證檔案數 | 114（1 黃金 + 5 Pilot + 108 全量）|
| 總題數 | 4,888 |
| 總 codes_candidate occurrence | 8,441 |
| A 違規（非合法碼）| 0 |
| B 違規（學習階段錯誤）| 0 |
| C 違規（重複編碼）| 0 |
| clean 份數 | 114 / 114（✅ 100%）|
| 編碼合法率 | **100%** |

### Phase C 版本摘要

| 出版社 | _L2_summary.md 行數 | 份數 |
|:--|:--|:--|
| 翰林 | 893 行 | 37（34 + 2 pilot + 1 golden） |
| 康軒 | 378 行 | 41（39 + 2 pilot） |
| 南一 | 437 行 | 36（35 + 1 pilot） |

### Phase D 整合

| 指標 | 數值 |
|:--|:--|
| 輸出檔案 | `三下/三下_國語_L2_整合.md` |
| 行數 | 122 行 |
| 涵蓋三版本 | 翰林+康軒+南一 ✅ |

---

## 四、驗收 Checklist

### Phase 0

- [x] A1 prompt template 完成（grade=三下_國語、編碼指向 chinese_codes_legal_II.json、禁 Ⅰ/Ⅲ/Ⅳ/Ⅴ prefix）
- [x] 1 份黃金樣本（翰林_108_國姓國小_第一次段考，67 題，0 violations）
- [x] Pilot 5 份 schema 一致、編碼合法率 100%（307/307）

### Phase 5（108 份）

- [x] 3 worker 啟動成功（A=36 / B=36 / C=36 = 108）
- [x] 完成度 100%（108/108 ≥ 95% 門檻）
- [x] failed = 0（≤ 5 份門檻）
- [x] 編碼合法率 **100%**（≥ 95% 門檻）

### Phase B/C/D/E

- [x] `_validation_report_chinese_g3.json` 違規率 = 0（clean=114/114）
- [x] 三份 `_L2_summary.md`（翰林 893 / 康軒 378 / 南一 437 行）完成
- [x] `三下_國語_L2_整合.md` 完成（122 行，4888 題 / 8441 codes）
- [x] `jobs/JOB-239-Report.md` 完成（本檔）

---

## 五、成果 Checklist（結案五步走）

- [x] 成果表格填寫完畢
- [x] 進度總表已同步（`docs/進度彙整_題庫研發與產出.md`）
- [x] `docs/README_專案發展紀錄.md` 新增 JOB-239 記錄
- [x] 已執行 `/pj_sync`
- [x] JOB-239-Report.md 異動清單已列所有實際修改檔案路徑
- [ ] `node scripts/job_manager.js close JOB-239`
- [ ] Discord 結案回報送 chat_id `1487738477608177714`
- [ ] git commit（最終結案）

---

## 六、異動清單（實際產出/修改檔案）

### 新增（本 JOB 產出）

**腳本（10 個）**
- `scripts/jobs/JOB-239/A1_pilot_prompt_template_chinese_g3.md`
- `scripts/jobs/JOB-239/A3_pilot_dispatch.sh`（PILOT_LIST 改 5 份三下情境）
- `scripts/jobs/JOB-239/A4_generate_full_targets.py`（OUT_BASE 三下、GOLDEN/PILOT 回填）
- `scripts/jobs/JOB-239/A5_full_dispatch.sh`
- `scripts/jobs/JOB-239/A6_continuous_loop.sh`
- `scripts/jobs/JOB-239/A7_launch_3workers.sh`
- `scripts/jobs/JOB-239/B_validate_codes.py`（EXPECTED_FILES=114）
- `scripts/jobs/JOB-239/C_publisher_summary_prompt.md`
- `scripts/jobs/JOB-239/D_subject_integration_prompt.md`（total_files=114）
- `scripts/jobs/JOB-239/spot_check_prompt_template.md`
- `scripts/jobs/JOB-239/_full_targets_{A,B,C}.json`（A=36/B=36/C=36）
- `scripts/jobs/JOB-239/_full_progress_{A,B,C}.json`

**知識庫**
- `knowledge/3_考古題/3_L2_結構化抽取/_golden_samples/三下_國語_翰林_108_國姓國小_第一次段考.json`（67 題）
- `knowledge/3_考古題/3_L2_結構化抽取/三下/三下_國語_pilot/*.json`（5 份 Pilot）
- `knowledge/3_考古題/3_L2_結構化抽取/三下/三下_國語_翰林/*.json`（34 份 + _L2_summary.md）
- `knowledge/3_考古題/3_L2_結構化抽取/三下/三下_國語_康軒/*.json`（39 份 + _L2_summary.md）
- `knowledge/3_考古題/3_L2_結構化抽取/三下/三下_國語_南一/*.json`（35 份 + _L2_summary.md）
- `knowledge/3_考古題/3_L2_結構化抽取/_validation_report_chinese_g3.json`
- `knowledge/3_考古題/3_L2_結構化抽取/三下/三下_國語_L2_整合.md`

**JOB 文件**
- `jobs/JOB-239-AG-三下-國語-考古題L2結構化抽取.md`（本 JOB 派工單）
- `jobs/JOB-239-Report.md`（本檔）

### 修改（reuse / 未動）

- `knowledge/3_考古題/3_L2_結構化抽取/_meta/chinese_codes_legal_II.json`（reuse JOB-238 產出，未修改）

---

## 七、技術筆記（值得記憶的經驗）

### Pilot 卡死處理（與 JOB-236 相同症狀）

- 5 份 Pilot 中 1 份（康軒_108_中正國小_第一次段考，flags 含 `columns_reordered`）的 codex exec 啟動後 hung 達 46 分鐘無新 log 寫入
- 處理：`pkill -9` 該 codex PID，改用 **stdin pipe 模式**（`cat prompt | codex exec`）重跑，~5 min 完成
- 與 JOB-236 完全相同的失敗模式（Pilot 康軒第三條），確認屬 codex 偶發 issue 而非腳本問題

### 黃金樣本 67 題（高於 JOB-238 的 43 題）

- 因翰林_108_國姓國小_第一次段考試卷大題較多（含字音字形 25 格、改錯 8、選擇 20、標點 6、近義 12、短語 3、造句 3、閱讀 4 = 67 題）
- 涵蓋國語科 5 種題型：fill_blank(25) / multiple_choice(20) / true_false(12) / short_answer(6) / reading_comp(4)
- 認知層次健康分布：理解(25) > 分析(15) > 記憶(12) > 應用(9) > 創造(6)
- 21 種 distinct codes，top: 4-Ⅱ-5(27) / Ab-Ⅱ-9(21) / Ac-Ⅱ-2(13)

### 第Ⅱ階段 codes reuse

- 三下/四下 同屬第Ⅱ學習階段，可共用 `chinese_codes_legal_II.json`（61 codes：30P + 31C）
- 無需新建 codes，省卻 Phase 0.0 步驟（JOB-238 約 5 min）

### C/D 模板 forking 注意事項

- 從 JOB-238 fork 時 `total_files: 121` 殘留需手動改為 `114`
- C 模板的 PUBLISHER × N_FILES placeholder 已正確透過 sed 注入
- D 模板「範本對照」段保留引用 JOB-229 三下_自然 / JOB-230 四下_自然（風格指示，路徑無需改）

---

## 八、遺留問題

無。三下_國語 全量抽取完成，編碼合法率 100%，為 G3-G4 國語 L2 第二份成功實證（JOB-238 為 G4 首發、JOB-239 為 G3 驗證骨架可移植）。

---

## 九、模型與成本

| 項目 | 模型 | 成本 |
|:--|:--|:--|
| PM / 黃金樣本 / Report | Claude Opus 4.7 / Sonnet 4.6 | Claude Pro 訂閱 |
| Phase 5 全量 / Phase C / Phase D | Codex CLI gpt-5.5 | ChatGPT Plus 訂閱 |
| Token 數 | -（訂閱制無單次計費）| - |
| 花費 | 訂閱制，無單次花費 | - |
