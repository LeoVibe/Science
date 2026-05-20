*Created by Claude Code (claude-opus-4-7) at 2026-05-19 12:40*

`last_updated`: 2026-05-19 12:40
`updated_by`: Claude Code (claude-opus-4-7)

# JOB-241-AG-六下_國語-考古題L2結構化抽取

**`job_type`**：`question_prod`
**`executor`**：Codex CLI gpt-5.5（Phase 5/B/C/D）+ Claude Opus 4.7 / Sonnet 4.6（PM、黃金樣本親做、Report 親寫）
**`parent_jobs`**：JOB-240（直接 fork）+ `chinese_codes_legal_III.json`（reuse，JOB-240 產出）

---

## 📌 任務背景

延續 G3-G5 國語 L2 三連發（JOB-238/239/240），補完 **六下_國語**。同屬第Ⅲ學習階段，**`chinese_codes_legal_III.json` 65 條直接 reuse**（無需 Phase 0.0）。

### Source MD 分布

| 出版社 | 份數 | extract_failed |
|:--|--:|--:|
| 翰林 | 26 | 0 |
| 康軒 | 21 | 0 |
| 南一 | 43 | 0 |
| **合計** | **90** | **0**（國語 L2 系列規模最小）|

---

## 🎯 任務目標

1. **Phase 0.1** fork JOB-240 骨架 → `scripts/jobs/JOB-241/`，B/A4/A1 更新（grade=六下_國語、EXPECTED=90、路徑 五→六、g5→g6）
2. **Phase 0.2** 1 份黃金樣本（Claude 親做、翰林 主流候選、schema v1.0、0 violations）
3. **Phase 0.3** 5 份 Pilot 全 PASS（**避開 columns_reordered** 已知 codex hung 模式）
4. **Phase 5** 84 份全量（並行 3 worker，A=28/B=28/C=28）
5. **Phase B-E** 驗證 + 三版本摘要 + 整合 MD + Report 親寫

---

## 🚧 任務邊界

**只做**：JOB-241 Phase 0.1~E

**不做**：
- 重建 chinese_codes_legal_III.json（reuse JOB-240）
- 修改 JOB-238/239/240 既有產出
- 修改規範文件
- 六下_國語題庫升 QL（另議）

---

## 📖 執行步驟

| Phase | 內容 | 執行者 | 預估時間 |
|:--|:--|:--|:--:|
| 0.1 | fork JOB-240 → JOB-241，sed 五下→六下、g5→g6 | Claude | ~15 min |
| 0.2 | 黃金樣本 1 份（翰林主流） | Claude | ~30 min |
| 0.3 | Pilot 5 份 + 驗收 | codex × 3+2 | ~15-20 min |
| 5 | 全量 84 份（A=28/B=28/C=28，國語系列最快） | codex × 3 | ~4-5 hr |
| B | 編碼合法性驗證 | python | < 1 min |
| C | 三版本 _L2_summary.md | codex × 3 | ~10 min |
| D | 六下_國語_L2_整合.md | codex | ~5 min |
| E | JOB-241-Report.md | Claude 親寫 | ~10 min |
| **總計** | — | — | **~5-6 hr** |

---

## 📜 關鍵參考檔案

| 檔案路徑 | 用途 |
|:--|:--|
| `jobs/JOB-240-Report.md` | 直接 parent，骨架已驗證 |
| `knowledge/3_考古題/3_L2_結構化抽取/_meta/chinese_codes_legal_III.json` | 第Ⅲ階段 codes（reuse） |
| `scripts/jobs/JOB-240/` | 完整骨架 fork 來源 |

---

## ✅ 啟動 Checklist (Pre-Flight)

- [ ] `scripts/jobs/JOB-241/` 腳本路徑/參數已更新（B/A4/A1，stage=Ⅲ、EXPECTED=90、g5→g6）
- [ ] `chinese_codes_legal_III.json` 已 reuse（無需重建）
- [ ] JOB-240 Report 已讀（骨架穩定）
- [ ] 六下_國語 整合 MD 90 份確認（翰林 26 + 康軒 21 + 南一 43）
- [ ] 黃金樣本路徑：翰林 主流情境（待 Phase 0.2 選定）
- [ ] 預算：ChatGPT 訂閱（無單次計費）
- [ ] 已確認執行模型：Codex CLI gpt-5.5（worker）+ Claude（PM 親做）

---

## ✅ 驗收 Checklist (Acceptance)

### Phase 0
- [ ] A1 prompt template 完成（grade=六下_國語、codes 指向 chinese_codes_legal_III.json）
- [ ] 1 份黃金樣本（schema v1.0 完整、0 violations、全 -Ⅲ-）
- [ ] Pilot 5 份對齊黃金、編碼合法率 100%

### Phase 5（84 份）
- [ ] 3 worker 啟動成功（A=28 / B=28 / C=28 = 84）
- [ ] 完成度 ≥ 95%（≥80/84）、failed ≤ 5
- [ ] 編碼合法率 ≥ 95%（目標 100%）

### Phase B/C/D/E
- [ ] `_validation_report_chinese_g6.json` 違規率可控
- [ ] 三份 `_L2_summary.md` 完成
- [ ] `六下_國語_L2_整合.md` 完成
- [ ] `jobs/JOB-241-Report.md` 完成

---

## ✅ 成果 Checklist (Deliverables)

- [ ] 成果表格填寫完畢
- [ ] 進度總表已同步
- [ ] README_專案發展紀錄.md 新增 JOB-241 記錄（含「G3-G6 國語 L2 全齊」里程碑）
- [ ] 已執行 `/pj_sync`
- [ ] JOB-241-Report.md 異動清單完整
- [ ] `node scripts/job_manager.js close JOB-241`
- [ ] Discord 結案回報送 chat_id `1487738477608177714`
- [ ] git commit（最終結案）

---

## ⏱️ 執行時間回報

| 子任務 / 階段 | 開始時間 | 結束時間 | 耗時（分鐘）| 備註 |
|:--|:--|:--|:--|:--|
| Phase 0.1 腳本 fork | 2026-05-19 12:40 | 2026-05-19 12:55 | ~15 min | fork JOB-240→241，sed 五→六 + 修正 A1 自相矛盾的階段禁引列 |
| Phase 0.2 黃金樣本 | 2026-05-19 12:55 | 2026-05-19 13:25 | ~30 min | 翰林_109_內安國小_第一次段考，71 題，20 distinct codes，0 violations |
| Phase 0.3 Pilot 5 | 2026-05-19 13:25 | 2026-05-19 22:35 | ~? min | 3/5 一次跑 + 2/5 stdin pipe 補跑（dispatcher 被 \| head -1 誤殺 SIGPIPE）；307+ 碼合法 |
| Phase 5 全量 84 | 2026-05-19 22:38 | 進行中 | — | 並行 3 worker，A=28/B=28/C=28 |
| Phase B-E 結案 | — | — | — | — |
| **總計** | — | — | **—** | — |

---

## 技術注意事項

1. **codes JSON reuse**：`chinese_codes_legal_III.json` 65 條（JOB-240 產出），直接指向不重建
2. **第Ⅲ階段標記嚴格**：禁引 -Ⅰ- -Ⅱ- -Ⅳ- -Ⅴ-
3. **路徑替換**：`五下→六下`、`g5→g6`（II→III 不需動）
4. **B_validate STAGE_MARK = Ⅲ**（沿用 JOB-240）
5. **避開 columns_reordered**：Pilot 選擇規避已知 codex hung（JOB-236/239/240 經驗）
6. **規模最小**：90 份 vs JOB-240 的 115 份，預估時間最短

---

## 意義

完成本 JOB 後：
- **G3-G6 國語 L2 全齊**（JOB-238/239/240/241）
- chinese_codes_legal_II/III.json 雙 codes 完備
- 國語 L2 抽取骨架經 4 個 JOB 驗證，可作為其他科目 L2 抽取的成熟參考

---

## 真實回報本次對話的模型與花費

＄作業匯總：Token 數: - | 花費: -（訂閱制無單次計費）| 使用模型: Codex CLI gpt-5.5 + Claude Sonnet 4.6 / Opus 4.7 | 執行者: Codex + Claude
