*Created by Claude Code (claude-opus-4-7) at 2026-05-19 12:22*

`last_updated`: 2026-05-19 12:22
`updated_by`: Claude Opus 4.7（Phase E 親寫）

# JOB-240-Report：五下_國語 考古題 L2 結構化抽取

---

## 一、任務摘要

| 項目 | 數值 |
|:--|:--|
| 執行 JOB | JOB-240-AG-五下_國語-考古題L2結構化抽取 |
| 執行者 | Codex CLI gpt-5.5（Phase 5/C/D）+ Claude Opus 4.7 / Sonnet 4.6（PM、黃金樣本、Report）|
| 資料範圍 | 五下_國語，翰林/康軒/南一，115 份（含 1 黃金 + 5 Pilot + 109 全量）|
| 執行期間 | 2026-05-18 18:40 ～ 2026-05-19 12:30 |
| 總耗時 | ~17.8 hr（建立第Ⅲ階段 codes + 一次到位 pilot + 全量）|

---

## 二、執行時間回報

| 子任務 / 階段 | 開始時間（TPE） | 結束時間（TPE） | 耗時 | 備註 |
|:--|:--|:--|:--|:--|
| Phase 0.0 chinese_codes_legal_III.json | 2026-05-18 18:40 | 2026-05-18 18:45 | ~5 min | 65 條（P=31+C=34）抽自 108課綱原始結構化檔 |
| Phase 0.1 腳本 fork | 2026-05-18 18:45 | 2026-05-18 19:00 | ~15 min | fork JOB-239→240，sed II→III + 路徑替換 |
| Phase 0.2 黃金樣本 | 2026-05-18 19:00 | 2026-05-18 19:30 | ~30 min | 翰林_108_內安國小_第二次段考，51 題，18 distinct codes，0 violations |
| Phase 0.3 Pilot 5 份 | 2026-05-18 19:30 | 2026-05-18 19:44 | ~14 min | 5/5 一次過（avg 5.5min/份）；307/307 碼合法 — **無任何 hung** |
| Phase 5 全量 109 份 | 2026-05-18 19:46 | 2026-05-19 12:11 | ~985 min (~16.4 hr) | 3 worker 並行，A=37/B=36/C=36 |
| Phase B 驗證 | 2026-05-19 12:11 | 2026-05-19 12:11 | < 1 min | 115 files，0 violations |
| Phase C 三版本摘要 | 2026-05-19 12:12 | 2026-05-19 12:17 | ~6 min | 3 codex 並行 |
| Phase D 整合報告 | 2026-05-19 12:18 | 2026-05-19 12:22 | ~4 min | 五下_國語_L2_整合.md |
| Phase E Report | 2026-05-19 12:22 | 2026-05-19 12:30 | ~8 min | Claude 親寫 |
| **總計** | 2026-05-18 18:40 | 2026-05-19 12:30 | **~17.8 hr** | |

---

## 三、成果數字

### Phase 5 全量

| 指標 | 數值 |
|:--|:--|
| 目標份數 | 109 份（115 - 1 黃金 - 5 Pilot） |
| 完成份數 | 109 / 109（✅ 100%）|
| failed | 0 |
| 3 worker 分配 | A=37 / B=36 / C=36 |

### Phase B 編碼驗證

| 指標 | 數值 |
|:--|:--|
| 驗證檔案數 | 115（1 黃金 + 5 Pilot + 109 全量）|
| 總題數 | 9,685 |
| 總 codes_candidate occurrence | 19,508 |
| A 違規（非合法碼）| 0 |
| B 違規（學習階段錯誤）| 0 |
| C 違規（重複編碼）| 0 |
| clean 份數 | 115 / 115（✅ 100%）|
| 編碼合法率 | **100%** |

### Phase C 版本摘要

| 出版社 | _L2_summary.md 行數 | 份數 |
|:--|:--|:--|
| 翰林 | 406 行 | 22（19 + 2 pilot + 1 golden） |
| 康軒 | 476 行 | 48（46 + 2 pilot） |
| 南一 | 568 行 | 45（44 + 1 pilot） |

### Phase D 整合

| 指標 | 數值 |
|:--|:--|
| 輸出檔案 | `五下/五下_國語_L2_整合.md` |
| 行數 | 124 行 |
| total_questions | 9,685 |
| total_codes | 19,508 |
| 涵蓋三版本 | 翰林+康軒+南一 ✅ |

---

## 四、驗收 Checklist

### Phase 0

- [x] chinese_codes_legal_III.json 65 條完成（含 hint_raw，抽自 108課綱原始結構化檔）
- [x] A1 prompt template 完成（grade=五下_國語、stage=Ⅲ、codes 指向 III json）
- [x] 1 份黃金樣本（翰林_108_內安國小_第二次段考，51 題，schema v1.0，0 violations）
- [x] Pilot 5 份 schema 一致、編碼合法率 100%（307/307）

### Phase 5（109 份）

- [x] 3 worker 啟動成功（A=37 / B=36 / C=36 = 109）
- [x] 完成度 100%（109/109 ≥ 95% 門檻）
- [x] failed = 0（≤ 5 門檻）
- [x] 編碼合法率 **100%**（≥ 95% 門檻）

### Phase B/C/D/E

- [x] `_validation_report_chinese_g5.json` 違規率 = 0（clean=115/115）
- [x] 三份 `_L2_summary.md`（翰林 406 / 康軒 476 / 南一 568 行）完成
- [x] `五下_國語_L2_整合.md` 完成（124 行，9685 題 / 19508 codes）
- [x] `jobs/JOB-240-Report.md` 完成（本檔）

---

## 五、成果 Checklist（結案五步走）

- [x] 成果表格填寫完畢
- [x] 進度總表已同步（`docs/進度彙整_題庫研發與產出.md`）
- [x] `docs/README_專案發展紀錄.md` 新增 JOB-240 記錄
- [x] 已執行 `/pj_sync`
- [x] JOB-240-Report.md 異動清單已列所有實際修改檔案路徑
- [ ] `node scripts/job_manager.js close JOB-240`
- [ ] Discord 結案回報送 chat_id `1487738477608177714`
- [ ] git commit（最終結案）

---

## 六、異動清單（實際產出/修改檔案）

### 新增（本 JOB 產出）

**腳本（10 個）**
- `scripts/jobs/JOB-240/A1_pilot_prompt_template_chinese_g5.md`
- `scripts/jobs/JOB-240/A3_pilot_dispatch.sh`
- `scripts/jobs/JOB-240/A4_generate_full_targets.py`
- `scripts/jobs/JOB-240/A5_full_dispatch.sh`
- `scripts/jobs/JOB-240/A6_continuous_loop.sh`
- `scripts/jobs/JOB-240/A7_launch_3workers.sh`
- `scripts/jobs/JOB-240/B_validate_codes.py`（EXPECTED_FILES=115、EXPECTED_LEGAL_CODES=65、STAGE=Ⅲ）
- `scripts/jobs/JOB-240/C_publisher_summary_prompt.md`
- `scripts/jobs/JOB-240/D_subject_integration_prompt.md`（total_files=115）
- `scripts/jobs/JOB-240/spot_check_prompt_template.md`
- `scripts/jobs/JOB-240/_full_targets_{A,B,C}.json`（A=37/B=36/C=36）
- `scripts/jobs/JOB-240/_full_progress_{A,B,C}.json`

**知識庫**
- `knowledge/3_考古題/3_L2_結構化抽取/_meta/chinese_codes_legal_III.json`（65 條，新建）
- `knowledge/3_考古題/3_L2_結構化抽取/_golden_samples/五下_國語_翰林_108_內安國小_第二次段考.json`（51 題）
- `knowledge/3_考古題/3_L2_結構化抽取/五下/五下_國語_pilot/*.json`（5 份 Pilot）
- `knowledge/3_考古題/3_L2_結構化抽取/五下/五下_國語_翰林/*.json`（19 份 + _L2_summary.md）
- `knowledge/3_考古題/3_L2_結構化抽取/五下/五下_國語_康軒/*.json`（46 份 + _L2_summary.md）
- `knowledge/3_考古題/3_L2_結構化抽取/五下/五下_國語_南一/*.json`（44 份 + _L2_summary.md）
- `knowledge/3_考古題/3_L2_結構化抽取/_validation_report_chinese_g5.json`
- `knowledge/3_考古題/3_L2_結構化抽取/五下/五下_國語_L2_整合.md`

**JOB 文件**
- `jobs/JOB-240-AG-五下-國語-考古題L2結構化抽取.md`（派工單）
- `jobs/JOB-240-Report.md`（本檔）

**設計 spec（過程插曲，已存檔待裁定）**
- `docs/spec_insight_memory.md`（專案長期記憶 skill 設計規格）

---

## 七、技術筆記（值得記憶的經驗）

### 第Ⅲ階段 codes 一次性建立成功

- 從 `knowledge/1_課綱研究/108課綱研究成果/2_課綱淬鍊文字/國語文/國語文_學習重點_結構化.md` 抽出 65 條（31P + 34C）
- 結構化檔的 `| \`code\` | hint | page |` 表格規則一致，regex 一次抓全
- **後續 JOB-241 六下_國語可直接 reuse 本 JSON**

### Pilot 5/5 一次過（vs JOB-239 的 1 hung）

- 五下選擇 Pilot 候選時刻意**避開 columns_reordered** flag
- 5 份 codex_only 主流情境，avg 5.5min/份
- 對照 JOB-239 中 1 份康軒 columns_reordered hung 46min — 避開即解
- **教訓記入**：未來 Pilot 選擇要規避已知 codex hung 模式

### Phase 5 速率較慢但穩定

- ~6.5 份/小時（vs JOB-239 的 ~10 份/小時）
- 推測：第Ⅲ階段題數較多（每份平均 89 題 vs 三下/四下 44/66 題）
- Phase 5 全 109 份耗時 ~16.4hr，無 failed

### 三層深度 entry 結構（spec 草稿產出）

- 過程中討論「淬煉 vs 脈絡」張力，產出 `docs/spec_insight_memory.md`
- 該 spec 是過程插曲，待日後另開 JOB 實作

---

## 八、遺留問題

無。五下_國語 全量抽取完成，編碼合法率 100%，G3-G5 國語 L2 三連發完成（JOB-238/239/240）。

下一步 JOB-241 六下_國語可直接 reuse 本 JOB 產出的 `chinese_codes_legal_III.json`。

---

## 九、模型與成本

| 項目 | 模型 | 成本 |
|:--|:--|:--|
| PM / 黃金樣本 / Report | Claude Opus 4.7 / Sonnet 4.6 | Claude Pro 訂閱 |
| Phase 5 全量 / Phase C / Phase D | Codex CLI gpt-5.5 | ChatGPT Plus 訂閱 |
| Token 數 | -（訂閱制無單次計費） | - |
| 花費 | 訂閱制，無單次花費 | - |
