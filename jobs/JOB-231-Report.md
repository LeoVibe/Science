# JOB-231-Report 四下_自然 考古題 L2 結構化抽取

*Created by Claude Code (claude-sonnet-4-6) at 2026-05-12T19:25:00+08:00*

`last_updated`: 2026-05-12 19:25
`updated_by`: Claude Code (claude-sonnet-4-6)

---

## 任務概要

| 欄位 | 內容 |
|:--|:--|
| JOB | JOB-231 |
| 類型 | AG（自動化） |
| 科目 | 四下_自然（翰林 / 康軒 / 南一） |
| 執行者 | Codex (gpt-5.5) × 3 worker |
| 驗收者 | Claude Code (claude-sonnet-4-6) |
| 開始 | 2026-05-12 10:56（黃金樣本） |
| 結案 | 2026-05-12 19:25 |
| 總耗時 | ~8.5h |

---

## 成果

### Phase 0：黃金樣本 + Pilot

| 階段 | 檔案 | 題數 | Codes | 編碼合法率 |
|:--|:--|--:|--:|--:|
| 黃金樣本 | 翰林_108_四維國小_第二次段考 | 50 | 57 | 100% |
| Pilot 1 | 翰林_110_員林國小_第一次段考 | 51 | 100 | 100% |
| Pilot 2 | 康軒_108_安慶國小_第一次段考 | 49 | 83 | 100% |
| Pilot 3 | 翰林_111_勝利國小_期中考 | 35 | 44 | 100% |
| Pilot 4 | 康軒_113_2_期末考 | 100 | 113 | 100% |
| Pilot 5 | 南一_112_新北桃子腳國小_期末考 | 197 | 242 | 100% |
| **合計** | **6 份** | **482** | **639** | **100%** |

### Phase 5：全量 118 份

| Worker | 份數 | 狀態 | Failed |
|:--|--:|:--|--:|
| A | 40/40 | ✅ | 0 |
| B | 39/39 | ✅ | 0 |
| C | 39/39 | ✅ | 0 |
| **合計** | **118/118** | **✅** | **0** |

### 全量總計（黃金 + Pilot + 全量）

| 出版社 | 份數（全量） | 題數（全量） | 備註 |
|:--|--:|--:|:--|
| 翰林 | 20 | 1,138 | +1 黃金 +2 Pilot |
| 康軒 | 55 | 4,046 | +2 Pilot |
| 南一 | 43 | 3,726 | +1 Pilot |
| **全量合計** | **118** | **8,910** | |
| **含 Pilot + 黃金** | **124** | **9,392** | |

| 統計項目 | 數值 |
|:--|--:|
| 總題數（124 份） | 9,392 |
| 總 codes_candidate | 12,759 |
| 平均每題 codes | 1.36 |

---

## Phase B 驗證

| 項目 | 結果 |
|:--|:--|
| 總檔數 | 124 份 |
| clean | 124 / 124 (100%) |
| A_illegal（非法 code） | 0 |
| B_wrong_stage（學習階段錯） | 0 |
| C_duplicate（重複 code） | 0 |
| flagged_for_rerun | 0 |
| manual_review | 0 |
| **編碼合法率** | **100%** |

報告路徑：`knowledge/3_考古題/3_L2_結構化抽取/_validation_report_natural_g4.json`

---

## Phase C：版本級摘要

| 出版社 | 摘要路徑 | 行數 |
|:--|:--|--:|
| 翰林 | `四下/四下_自然_翰林/_L2_summary.md` | 472 |
| 康軒 | `四下/四下_自然_康軒/_L2_summary.md` | 372 |
| 南一 | `四下/四下_自然_南一/_L2_summary.md` | 457 |

## Phase D：全科目整合

| 項目 | 內容 |
|:--|:--|
| 整合報告 | `四下/四下_自然_L2_整合.md` |
| 行數 | 132 行 |
| 總題數（報告記載） | 9,392 |
| extractor | Codex (gpt-5.5) - JOB-231 Phase D |

---

## 啟動 Checklist

- [x] 黃金樣本確認（`四下_自然_翰林_108_四維國小_第二次段考.json`，50 題，100%合法）
- [x] Pilot 5/5 通過，編碼合法率 100%
- [x] science_codes_legal_II.json（75 條）確認正確
- [x] Phase 5 targets 正確排除黃金 + Pilot（124 - 1 - 5 = 118）
- [x] 三 worker 並行骨架（A5/A6/A7）驗證可用

## 驗收 Checklist

- [x] Phase 5 全量 118/118，failed=0（✅事實：progress A/B/C JSON 確認）
- [x] 編碼合法率 100%（✅事實：B_validate_codes.py 產出 A_illegal=0, B_wrong_stage=0, C_duplicate=0）
- [x] _summary.total_questions 與 questions[] 數一致（✅事實：Layer 1 check 全部通過）
- [x] Phase B 報告寫入（✅事實：`_validation_report_natural_g4.json` 存在）
- [x] Phase C 三版本摘要（✅事實：翰林 472 行、康軒 372 行、南一 457 行）
- [x] Phase D 整合報告（✅事實：`四下_自然_L2_整合.md` 132 行）

## 成果 Checklist

- [x] `_validation_report_natural_g4.json` 寫入
- [x] 三版本 `_L2_summary.md` 寫入
- [x] `四下_自然_L2_整合.md` 寫入
- [x] JOB-231-Report.md 完成
- [x] `node scripts/job_manager.js close JOB-231`（✅ 結案完成）
- [x] `docs/README_專案發展紀錄.md` 更新（2026-05-12 19:30）
- [x] `/pj_sync`（進度彙整 + 發展紀錄 同步完成）
- [ ] Discord 結案回報

---

## 遺留問題

無。全 118 份完成，0 failed，0 違規。

---

## 效能記錄

| 指標 | 數值 |
|:--|:--|
| Pilot 均速 | ~7.5 min/份 |
| Phase 5 均速 | ~2.9–7.5 min/份（翰林最慢） |
| Phase 5 總耗時 | ~6h06m（11:40 → 17:46） |
| Phase B 耗時 | < 1 min |
| Phase C 耗時 | ~40 min（3 版本並行） |
| Phase D 耗時 | ~36 min |
| Token 數 | - |
| 花費 | - |
| 使用模型 | gpt-5.5（codex exec 預設） |
| 執行者 | Codex |
