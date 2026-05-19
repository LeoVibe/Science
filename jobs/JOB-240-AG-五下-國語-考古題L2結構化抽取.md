*Created by Claude Code (claude-opus-4-7) at 2026-05-18 18:40*

`last_updated`: 2026-05-18 18:40
`updated_by`: Claude Code (claude-opus-4-7)

# JOB-240-AG-五下_國語-考古題L2結構化抽取

**`job_type`**：`question_prod`
**`executor`**：Codex CLI gpt-5.5（Phase 5/B/C/D）+ Claude Sonnet 4.6 / Opus 4.7（PM、黃金樣本親做、Report 親寫）
**`parent_jobs`**：JOB-238/239（國語 L2 骨架）+ JOB-235/236（第Ⅲ階段 codes 建立經驗）

---

## 📌 任務背景

延續 JOB-238（四下_國語 ✅）+ JOB-239（三下_國語 ✅，G3-G4 雙連發完成），擴展至 **五下_國語**。五下屬第Ⅲ學習階段，需新建 `chinese_codes_legal_III.json`（**65 條：31 學習表現 + 34 學習內容**，源於 `國語文_學習重點_結構化.md`）。

### Source MD 分布

| 出版社 | 份數 | extract_failed |
|:--|--:|--:|
| 翰林 | 22 | 0 |
| 康軒 | 48 | 0 |
| 南一 | 45 | 0 |
| **合計** | **115** | **0** |

---

## 🎯 任務目標

1. **Phase 0.0** 建立 `chinese_codes_legal_III.json`（65 條，含 hint_raw）
2. **Phase 0.1** fork JOB-239 骨架 → `scripts/jobs/JOB-240/`，B/A4/A1 更新（grade=五下_國語、stage=Ⅲ、EXPECTED=115、codes 指向 III json）
3. **Phase 0.2** 1 份黃金樣本（Claude 親做、翰林 主流候選、schema v1.0、0 violations）
4. **Phase 0.3** 5 份 Pilot 全 PASS
5. **Phase 5** 109 份 Phase 5 全量（並行 3 worker，A=37/B=36/C=36）
6. **Phase B-E** 驗證 + 三版本摘要 + 整合 MD + Report

---

## 🚧 任務邊界

**只做**：JOB-240 Phase 0.0~E

**不做**：
- 修改 JOB-238/239 既有產出
- 六下_國語 L2（另開 JOB-241，可 reuse 本 JOB chinese_codes_legal_III.json）
- 修改規範文件
- 五下_國語題庫升 QL（另議）

---

## 📖 執行步驟

| Phase | 內容 | 執行者 | 預估時間 |
|:--|:--|:--|:--:|
| 0.0 | 建立 chinese_codes_legal_III.json（65 條） | Claude | ~5 min |
| 0.1 | fork JOB-239 → JOB-240，B/A4/A1 更新 + 第Ⅲ階段標記 | Claude | ~15 min |
| 0.2 | 黃金樣本 1 份（翰林主流） | Claude | ~30 min |
| 0.3 | Pilot 5 份 + 驗收 | codex × 3+2 | ~20-30 min |
| 5 | 全量 109 份（A=37/B=36/C=36） | codex × 3 | ~5-6 hr |
| B | 編碼合法性驗證 | python | < 1 min |
| C | 三版本 _L2_summary.md | codex × 3 | ~15 min |
| D | 五下_國語_L2_整合.md | codex | ~5 min |
| E | JOB-240-Report.md | Claude 親寫 | ~10 min |
| **總計** | — | — | **~6-7 hr** |

---

## 📜 關鍵參考檔案

| 檔案路徑 | 用途 |
|:--|:--|
| `jobs/JOB-239-Report.md` | 最新骨架（三下_國語 100% 成功） |
| `knowledge/1_課綱研究/108課綱研究成果/2_課綱淬鍊文字/國語文/國語文_學習重點_結構化.md` | 第Ⅲ階段 codes 源頭 |
| `scripts/jobs/JOB-239/` | 完整骨架 fork 來源 |

---

## ✅ 啟動 Checklist (Pre-Flight)

- [ ] `chinese_codes_legal_III.json` 65 條建立（31 P + 34 C，全部 -Ⅲ- 中綴）
- [ ] `scripts/jobs/JOB-240/` 腳本路徑/參數更新（B/A4/A1，stage=Ⅲ、EXPECTED=115）
- [ ] JOB-239 Report 已讀
- [ ] 五下_國語 整合 MD 115 份確認（翰林 22 + 康軒 48 + 南一 45）
- [ ] 黃金樣本路徑：翰林 主流情境（待 Phase 0.2 選定）
- [ ] 預算：ChatGPT 訂閱（無單次計費）
- [ ] 已確認執行模型：Codex CLI gpt-5.5（worker）+ Claude（PM 親做）

---

## ✅ 驗收 Checklist (Acceptance)

### Phase 0
- [ ] chinese_codes_legal_III.json 65 條完成（含 hint_raw）
- [ ] A1 prompt template 完成（grade=五下_國語、stage=Ⅲ、codes 指向 III json）
- [ ] 1 份黃金樣本（schema v1.0 完整、0 violations、全 -Ⅲ-）
- [ ] Pilot 5 份對齊黃金、編碼合法率 100%

### Phase 5（109 份）
- [ ] 3 worker 啟動成功（A=37 / B=36 / C=36 = 109）
- [ ] 完成度 ≥ 95%（≥104/109）、failed ≤ 5
- [ ] 編碼合法率 ≥ 95%（目標 100%）

### Phase B/C/D/E
- [ ] `_validation_report_chinese_g5.json` 違規率可控
- [ ] 三份 `_L2_summary.md` 完成
- [ ] `五下_國語_L2_整合.md` 完成
- [ ] `jobs/JOB-240-Report.md` 完成

---

## ✅ 成果 Checklist (Deliverables)

- [ ] 成果表格填寫完畢
- [ ] 進度總表已同步
- [ ] README_專案發展紀錄.md 新增 JOB-240 記錄
- [ ] 已執行 `/pj_sync`
- [ ] JOB-240-Report.md 異動清單完整
- [ ] `node scripts/job_manager.js close JOB-240`
- [ ] Discord 結案回報送 chat_id `1487738477608177714`
- [ ] git commit（最終結案）

---

## ⏱️ 執行時間回報

| 子任務 / 階段 | 開始時間 | 結束時間 | 耗時（分鐘）| 備註 |
|:--|:--|:--|:--|:--|
| Phase 0.0 codes_III | 2026-05-18 18:40 | 2026-05-18 18:45 | ~5 min | 65 條（P=31+C=34）抽自 108課綱原始結構化檔 |
| Phase 0.1 腳本 fork | 2026-05-18 18:45 | 2026-05-18 19:00 | ~15 min | fork JOB-239→240，sed 替換 + A4 dry-run 115份 OK |
| Phase 0.2 黃金樣本 | 2026-05-18 19:00 | 2026-05-18 19:30 | ~30 min | 翰林_108_內安國小_第二次段考，51 題，18 distinct codes，0 violations |
| Phase 0.3 Pilot 5 | 2026-05-18 19:30 | 2026-05-18 19:44 | ~14 min | 5/5 PASS（avg 5.5min/份），編碼合法率 100% |
| Phase 5 全量 109 | 2026-05-18 19:46 | 進行中 | — | 並行 3 worker，A=37/B=36/C=36 |
| Phase B-E 結案 | — | — | — | — |
| **總計** | — | — | **—** | — |

---

## 技術注意事項

1. **第Ⅲ階段標記嚴格**：A1 prompt 禁引 `-Ⅰ-` `-Ⅱ-` `-Ⅳ-` `-Ⅴ-`
2. **B_validate STAGE_MARK 改 Ⅲ**：JOB-239 是 Ⅱ
3. **路徑替換**：`三下→五下`、`g3→g5`、`II→III`
4. **codes JSON reuse**：JOB-241 六下_國語可直接 reuse 本 JOB 產出
5. **Pilot 卡死風險**：康軒 columns_reordered 已知 codex hung 模式（JOB-236/239 重現），備好 stdin pipe 重跑方案

---

## 真實回報本次對話的模型與花費

＄作業匯總：Token 數: - | 花費: -（訂閱制無單次計費）| 使用模型: Codex CLI gpt-5.5 + Claude Sonnet 4.6 / Opus 4.7 | 執行者: Codex + Claude
