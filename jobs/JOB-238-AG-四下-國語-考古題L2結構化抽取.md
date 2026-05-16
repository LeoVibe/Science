*Created by Claude Code (claude-sonnet-4-6) at 2026-05-17 00:10*

`last_updated`: 2026-05-17 00:10
`updated_by`: Claude Code (claude-sonnet-4-6)

# JOB-238-AG-四下_國語-考古題L2結構化抽取

**`job_type`**：`question_prod`
**`executor`**：Codex CLI gpt-5.5（Phase 5 主跑 + Phase B/C/D 草擬）+ Claude Sonnet 4.6（PM、黃金樣本親做、Report 親寫）
**`parent_jobs`**：JOB-235/236（骨架完全沿用）+ `chinese_codes_legal_II.json`（本 JOB Phase 0.0 建立）

---

## 📌 任務背景

完成 JOB-231~236（三下/四下/五下/六下 社會+自然 L2 抽取）後，延伸至 國語 科目。本 JOB 為國語 L2 抽取首跑，以四下_國語作為起點（無 extract_failed，資料最乾淨）。

四下_國語 整合 MD 共 **121 份**（翰林 41 / 康軒 49 / 南一 31），0 份 extract_failed。使用第 Ⅱ 學習階段編碼（`chinese_codes_legal_II.json`，61 codes：30 學習表現 + 31 學習內容）。

### Source MD 分布
| 出版社 | 份數 | extract_failed |
|:--|--:|--:|
| 翰林 | 41 | 0 |
| 康軒 | 49 | 0 |
| 南一 | 31 | 0 |
| **合計** | **121** | **0** |

---

## 🎯 任務目標

1. A1 prompt template（四下_國語版，編碼指 `chinese_codes_legal_II.json`、禁引 Ⅰ/Ⅲ/Ⅳ/Ⅴ 階段 prefix）
2. 1 份四下_國語 黃金樣本（Claude 親做、翰林 主流候選擇 1、schema v1.0、編碼 0 違規）
3. 5 份 Pilot 全 PASS（對齊黃金樣本）
4. 115 份 Phase 5 全量 codex 抽取（並行 3 worker，A≈39 / B≈38 / C≈38）
5. 編碼合法率 ≥ 95%（目標 100%）
6. `_validation_report_chinese_g4.json` + 三份 `_L2_summary.md` + `四下_國語_L2_整合.md`
7. `jobs/JOB-238-Report.md`（Claude 親寫）

---

## 🚧 任務邊界

**只做**：
- 沿用 `scripts/jobs/JOB-238/`（fork 自 JOB-236，路徑/參數需更新）
- 1 份黃金樣本（Claude 親做、翰林 主流情境）
- 5 份 Pilot（codex 並行 3+2）
- Phase 5 全量 115 份（扣 1 黃金 + 5 Pilot = 115 份，A/B/C 三 worker 輪分）
- Phase B/C/D/E 結案

**不做**：
- 重新製作 chinese_codes_legal_II.json（本 JOB Phase 0.0 已建立，直接 reuse）
- 修復 extract_failed（四下_國語 無 extract_failed）
- 修改 JOB-231~237 既有產出
- 修改規範文件
- 其他年級/科目國語 L2（另開 JOB）

---

## 📖 執行步驟

| Phase | 內容 | 執行者 | 預估時間 |
|:--|:--|:--|:--:|
| Phase 0.0 | chinese_codes_legal_II.json 建立 ✅ | Claude ✅ | done |
| Phase 0.1 | fork JOB-236 骨架 → `scripts/jobs/JOB-238/`，B/A4/A1 三檔更新 | Claude | ~30 min |
| Phase 0.2 | 黃金樣本 1 份（Claude 親做、翰林 主流候選） | Claude | 1.5 hr |
| Phase 0.3 | Pilot 5 份 + 驗收 | codex × 3+2 | 15-20 min |
| Phase 5 | 全量 115 份（並行 3 worker，A4 跑完後確認分配） | codex × 3 | ~6-7 hr |
| Phase B | 全量編碼合法性驗證 | python | < 1 min |
| Phase C | 三版本 `_L2_summary.md`（codex 並行 3 條） | codex × 3 | ~15 min |
| Phase D | 全科目整合 `四下_國語_L2_整合.md` | codex | ~5 min |
| Phase E | JOB-238-Report.md | Claude 親寫 | ~10 min |
| **總計** | — | — | **~10-12 hr** |

---

## 📜 關鍵參考檔案

| 檔案路徑 | 用途 |
|:--|:--|
| `jobs/JOB-236-Report.md` | 最新骨架（含 stdin pipe fix / progress.json 預建）|
| `knowledge/3_考古題/3_L2_結構化抽取/_meta/chinese_codes_legal_II.json` | 國語第 Ⅱ 階段合法編碼（61 codes）|
| `scripts/jobs/JOB-236/A1_pilot_prompt_template_natural_g6.md` | 參考 A1 模板（要改科目/codes）|
| `scripts/jobs/JOB-236/A5_full_dispatch.sh` | 參考 dispatch（25min watchdog）|
| `scripts/jobs/JOB-236/A7_launch_3workers.sh` | 參考 launcher（progress.json 預建）|
| `scripts/jobs/JOB-236/B_validate_codes.py` | 參考驗證腳本（EXPECTED 改 121，stage Ⅱ）|
| `scripts/jobs/JOB-236/A4_generate_full_targets.py` | 參考 targets 產生器 |

---

## ✅ 啟動 Checklist (Pre-Flight)

- [x] `chinese_codes_legal_II.json` 建立完成（61 codes：30 performance + 31 content）
- [ ] JOB-236 Report 已讀（最新骨架 + stdin pipe fix）
- [ ] 四下_國語 整合 MD 121 份確認（翰林 41 + 康軒 49 + 南一 31）
- [ ] `scripts/jobs/JOB-238/` 腳本路徑/參數已更新（B/A4/A1 三檔）
- [ ] 黃金樣本路徑：`四下_國語_翰林/` 下主流試卷存在且 paper_full+answer_full
- [ ] 預算：ChatGPT 訂閱（無單次計費）
- [ ] 已確認執行模型：Codex CLI gpt-5.5（worker）+ Claude Sonnet 4.6（PM 親做）

---

## ✅ 驗收 Checklist (Acceptance)

> 本 JOB 為 question_prod L2 抽取，以結構完整性 + 編碼合法率 + 對齊度驗收。

### Phase 0
- [ ] A1 prompt template 完成（grade=四下_國語、編碼指向 chinese_codes_legal_II.json）
- [ ] 1 份黃金樣本（Claude 親做、schema v1.0 完整、編碼 0 違規）
- [ ] Pilot 5 份對黃金樣本 schema 一致、編碼合法率 100%

### Phase 5（115 份）
- [ ] 3 worker 啟動成功（A≈39 / B≈38 / C≈38 = 115）
- [ ] 整體完成度 ≥ 95%（≥109/115）、failed ≤ 5 份
- [ ] 編碼合法率 ≥ 95%（目標 100%）

### Phase B/C/D/E
- [ ] `_validation_report_chinese_g4.json` 違規率可控
- [ ] 三份 `_L2_summary.md`（翰林/康軒/南一）完成
- [ ] `四下_國語_L2_整合.md` 完成
- [ ] `jobs/JOB-238-Report.md` 完成

---

## ✅ 成果 Checklist (Deliverables)

- [ ] 成果表格填寫完畢
- [ ] 進度總表已同步（`docs/進度彙整_題庫研發與產出.md`）
- [ ] `docs/README_專案發展紀錄.md` 新增 JOB-238 記錄
- [ ] 已執行 `/pj_sync`
- [ ] JOB-238-Report.md 異動清單已列所有實際修改檔案路徑
- [ ] `node scripts/job_manager.js close JOB-238`
- [ ] Discord 結案回報送 chat_id `1487738477608177714`
- [ ] git commit（最終結案）

---

## ⏱️ 執行時間回報

| 子任務 / 階段 | 開始時間 | 結束時間 | 耗時（分鐘） | 備註 |
|:--|:--|:--|:--|:--|
| Phase 0.0 chinese_codes_legal_II.json | 2026-05-17 00:00 | 2026-05-17 00:05 | ~5 min | Claude inline extraction，61 codes |
| Phase 0.1 腳本更新 | — | — | — | — |
| Phase 0.2 黃金樣本 | — | — | — | — |
| Phase 0.3 Pilot 5 | — | — | — | — |
| Phase 5 全量 115 | — | — | — | 並行 3 worker |
| Phase B-E 結案 | — | — | — | — |
| **總計** | — | — | **—** | — |

---

## 技術注意事項（來自 JOB-235/236 經驗）

1. **Phase D stdin pipe**：`cat prompt.md | codex exec --skip-git-repo-check --full-auto`
2. **progress.json 預建**：A7 啟動前先 `rm _full_progress_{A,B,C}.json`
3. **Unicode sort order**：南 < 康 < 翰，worker A 先跑完南一
4. **A6 Batch#2 自動重試**：timeout rank 自動補跑
5. **國語特有注意**：
   - 學習表現編碼格式：`{數字}-Ⅱ-{數字}`（如 `5-Ⅱ-3`）
   - 學習內容編碼格式：`{大寫字母}-Ⅱ-{數字}`（如 `Bb-Ⅱ-4`）
   - 禁引 Ⅰ/Ⅲ/Ⅳ/Ⅴ 階段前綴
   - 題目類型以閱讀理解/生字注音/造句/修辭為主，codes 分布需試跑黃金樣本後確認

---

## 真實回報本次對話的模型與花費

＄作業匯總：Token 數: - | 花費: -（Codex CLI ChatGPT Plus 訂閱無單次計費 + Claude Pro 訂閱）| 使用模型: Codex CLI gpt-5.5（並行 3 worker + Phase B/C/D）+ Claude Sonnet 4.6（PM、黃金樣本親做、Report 親寫）| 執行者: Codex + Claude
