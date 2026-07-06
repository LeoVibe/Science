*Created by Claude Code (claude-sonnet-4-6) at 2026-05-12 20:00*

`last_updated`: 2026-05-12 20:00
`updated_by`: Claude Code (claude-sonnet-4-6)

# JOB-232-AG-五下_社會-考古題L2結構化抽取

**`job_type`**：`question_prod`
**`executor`**：Codex CLI gpt-5.5（Phase 5 主跑 + Phase B/C/D 草擬）+ Claude Sonnet 4.6（PM、黃金樣本親做、Report 親寫）
**`parent_jobs`**：JOB-230（並行骨架沿用）+ 本 JOB 新製 `social_codes_legal_III.json`

---

## 📌 任務背景

JOB-228~231 完成三下/四下 社會+自然 L2 抽取（共 4 科目，478 份）。本 JOB 延伸到五下_社會，首次使用第Ⅲ學習階段編碼（`social_codes_legal_III.json`，46 codes），沿用 JOB-230 三 worker 並行骨架。

五下_社會 整合 MD 共 **120 份**（翰林 42 / 康軒 48 / 南一 30）。

### Source MD 分布
| 出版社 | 份數 |
|:--|--:|
| 翰林 | 42 |
| 康軒 | 48 |
| 南一 | 30 |
| **合計** | **120** |

---

## 🎯 任務目標

1. A1 prompt template（五下_社會版，編碼指 `social_codes_legal_III.json`、禁引 Ⅱ 階段 prefix）
2. 1 份五下_社會 黃金樣本（Claude 親做、翰林 主流候選擇 1、schema v1.0、編碼 0 違規）
3. 5 份 Pilot 全 PASS（對齊黃金樣本）
4. 114 份 Phase 5 全量 codex 抽取（並行 3 worker，A=38 / B=38 / C=38）
5. 編碼合法率 ≥ 95%（目標 100%）
6. `_validation_report_social_g5.json` + 三份 `_L2_summary.md` + `五下_社會_L2_整合.md`
7. `jobs/JOB-232-Report.md`（Claude 親寫）

---

## 🚧 任務邊界

**只做**：
- fork JOB-230 骨架 → `scripts/jobs/JOB-232/`，改 grade=五下_社會 + 編碼指 social_codes_legal_III.json
- 1 份黃金樣本（Claude 親做、翰林 主流情境）
- 5 份 Pilot（codex 並行 3+2）
- Phase 5 全量 114 份（扣 1 黃金 + 5 Pilot = 114 份，A=38+B=38+C=38）
- Phase B/C/D/E 結案

**不做**：
- 重新製作 social_codes_legal_III.json（本 JOB 前已建立，直接 reuse）
- 擴展到五下其他科目或六下
- 修改 JOB-228~231 既有產出
- 修改規範文件

---

## 📖 執行步驟

| Phase | 內容 | 執行者 | 預估時間 |
|:--|:--|:--|:--:|
| Phase 0.1 | fork JOB-230 骨架 → `scripts/jobs/JOB-232/`，A1 prompt 改五下_社會 + 編碼清單指 social_codes_legal_III.json | Claude | 20 min |
| Phase 0.2 | 黃金樣本 1 份（Claude 親做、翰林） | Claude | 1.5 hr |
| Phase 0.3 | Pilot 5 份 + 驗收 | codex × 3+2 | 15-20 min |
| Phase 5 | 全量 114 份（並行 3 worker） | codex × 3 | ~5-6 hr |
| Phase B | 全量編碼合法性驗證 | python | < 1 min |
| Phase C | 三版本 `_L2_summary.md`（codex 並行 3 條） | codex × 3 | ~15 min |
| Phase D | 全科目整合 `五下_社會_L2_整合.md` | codex | ~5 min |
| Phase E | JOB-232-Report.md | Claude 親寫 | ~10 min |
| **總計** | — | — | **~8-10 hr** |

---

## 📜 關鍵參考檔案

| 檔案路徑 | 用途 |
|:--|:--|
| `jobs/JOB-230-Report.md` | 社會科 L2 並行骨架經驗 |
| `knowledge/3_考古題/3_L2_結構化抽取/_meta/social_codes_legal_III.json` | 社會科第Ⅲ階段合法編碼（46 codes）|
| `scripts/jobs/JOB-230/A1_pilot_prompt_template_social_g4.md` | A1 prompt 結構參考（改 grade=五下_社會 + 編碼清單路徑）|
| `scripts/jobs/JOB-230/A5_full_dispatch.sh` | dispatch（含 25min watchdog + Layer 1）|
| `scripts/jobs/JOB-230/A7_launch_3workers.sh` | launcher（含 progress.json 預建 fix）|
| `scripts/jobs/JOB-230/B_validate_codes.py` | Phase B 全量驗證（改 EXPECTED_FILES/LEGAL_CODES）|

---

## ✅ 啟動 Checklist (Pre-Flight)

- [ ] JOB-230 Report 已讀（經驗教訓）
- [ ] 五下_社會 整合 MD 120 份齊全（翰林 42 + 康軒 48 + 南一 30）
- [ ] `social_codes_legal_III.json` 存在且 46 codes 驗證正確
- [ ] codex 並行 3 條已驗證（JOB-230/231 均 0 failed）
- [ ] 預算：使用 ChatGPT 訂閱（無單次計費）
- [ ] 已確認執行模型：Codex CLI gpt-5.5（codex 預設）+ Claude Sonnet 4.6（PM 親做）
- [ ] 已閱讀「任務邊界」並確認本次範圍

---

## ✅ 驗收 Checklist (Acceptance)

> 本 JOB 為 question_prod L2 抽取（非新出題、非盲測），以結構完整性 + 編碼合法率 + 對齊度驗收。CQI 指標不適用。

### Phase 0
- [ ] A1 prompt template 完成（grade=五下_社會、編碼指向 social_codes_legal_III.json）
- [ ] 1 份黃金樣本（Claude 親做、schema v1.0 完整、編碼 0 違規）
- [ ] Pilot 5 份對黃金樣本 schema 一致、編碼合法率 100%

### Phase 5（114 份）
- [ ] 3 worker 啟動成功（A=38 / B=38 / C=38）
- [ ] 整體完成度 ≥ 95%（≥108/114）、failed ≤ 5 份
- [ ] 編碼合法率 ≥ 95%（目標 100%）

### Phase B/C/D/E
- [ ] `_validation_report_social_g5.json` 違規率可控（A/B/C 各 ≤ 1%）
- [ ] 三份 `_L2_summary.md`（翰林/康軒/南一）完成
- [ ] `五下_社會_L2_整合.md` 完成
- [ ] `jobs/JOB-232-Report.md` 完成

---

## ✅ 成果 Checklist (Deliverables)

- [ ] 成果表格填寫完畢（執行者填）
- [ ] 進度總表已同步（`docs/進度彙整_題庫研發與產出.md`）
- [ ] `docs/README_專案發展紀錄.md` 新增 JOB-232 記錄
- [ ] 已執行 `/pj_sync`
- [ ] JOB-232-Report.md 異動清單已列所有實際修改檔案路徑
- [ ] `node scripts/job_manager.js close JOB-232`
- [ ] Discord 結案回報送 chat_id `1487738477608177714`
- [ ] git commit（最終結案）

---

## ⏱️ 執行時間回報

| 子任務 / 階段 | 開始時間 | 結束時間 | 耗時（分鐘） | 備註 |
|:--|:--|:--|:--|:--|
| Phase 0.1 fork 骨架 + A1 prompt | — | — | — | Claude |
| Phase 0.2 黃金樣本 | — | — | — | Claude 親做 |
| Phase 0.3 Pilot 5 | — | — | — | — |
| Phase 5 全量 114 | — | — | — | 並行 3 worker |
| Phase B-E 結案 | — | — | — | — |
| **總計** | — | — | — | — |

---

## 真實回報本次對話的模型與花費

＄作業匯總：Token 數: -- | 花費: --（codex ChatGPT Plus 訂閱無單次計費 + Claude Pro 訂閱）| 使用模型: Codex CLI gpt-5.5（並行 3 條 worker + Phase B/C/D 草擬）+ Claude Sonnet 4.6（PM、A1 prompt/Pilot/Report 親寫，黃金樣本親做）| 執行者: Codex + Claude

---

## 邊界與遺留

- `social_codes_legal_III.json` 第Ⅲ階段含 G5+G6 社會編碼，本 JOB 首次使用
- 後續 G6 社會需另開 JOB，同樣 reuse 此 III 清單
- 後續 G5/G6 自然另開 JOB-233（JOB-232 平行進行）
- spot check 標準沿用 JOB-229/230 ≥3 字

---

## 黃金樣本選擇紀錄（Phase 0.2 開跑前填）

`chosen_golden_sample`: **翰林_108_四維國小_第一次段考**

- 來源 MD 路徑：`knowledge/3_考古題/2_MD淬鍊文字_整合版/五下/五下_社會_翰林/翰林_108_四維國小_第一次段考.md`
- 選擇依據：paper_full + answer_full + codex_only 主流情境；40 題、題型多元（是非8/選擇11/配對12/填空7）；主題涵蓋日治時期/清朝/戰後臺灣/社會運動，代表五下社會核心史觀
- 黃金樣本路徑：`knowledge/3_考古題/3_L2_結構化抽取/_golden_samples/五下_社會_翰林_108_四維國小_第一次段考.json`
- 題數：40 題；10 種 code（distinct），Cb-Ⅲ-1 主力（29 次），全部 -Ⅲ- 中綴，編碼合法率 100%
- 已知限制：codex_only（無 Claude 源互校）
