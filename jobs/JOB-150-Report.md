<!--
last_updated: 2026-04-05 00:00
updated_by: Claude Code (claude-sonnet-4-6)
-->

# JOB-150 結案報告：G3 S2 自然 三版本深層盲測（翰林／康軒／南一）

**`job_type`**：`question_verify`
**`executor`**：Claude Code（直接執行腳本 + Mismatch 審視修正）

---

## 1. 執行指令

工作目錄：`/Users/s389080/Documents/doc/work/0_AI_Project/eidosProject`

```bash
node scripts/run_blind_eval.js question/platform/G3/Science/S2/HanLin --force
node scripts/run_blind_eval.js question/platform/G3/Science/S2/KangHsuan --force
node scripts/run_blind_eval.js question/platform/G3/Science/S2/NanYi --force
```

完整日誌：`jobs/JOB-150-blind-eval.log`

**前置修正（本 JOB 首次執行）：**
`scripts/run_blind_eval.js` 的 `R4_MAPPING` 缺少 'Science' 科目條目，導致腳本跳過所有自然科目錄（靜默輸出 "命中: 0 / 失敗: 0 (0%)"）。本 JOB 補入完整 Science 映射（G3~G6 S2 + G5 S1）後重新執行。

**stdout 摘要：**

| 目錄 | 腳本總結 |
|:--|:--|
| HanLin | `🎉 盲審大調查結束！ 命中: 119 / 失敗: 1 (99.2%)` |
| KangHsuan | `🎉 盲審大調查結束！ 命中: 118 / 失敗: 2 (98.3%)` |
| NanYi | `🎉 盲審大調查結束！ 命中: 150 / 失敗: 0 (100.0%)` |

---

## 2. 各目錄 Match Rate 彙整

### 2.1 HanLin — 目錄合計 **99.2%**（119／120）

| 課檔 | Match／總題 | Match Rate | Mismatch |
|:--|:--|:--|:--|
| L1, L2, L4, L5 | 全數通過 | 100% | — |
| `G3_S2_SCI_HANLIN_L3` | 29/30 | 96.7% | Q14 |

### 2.2 KangHsuan — 目錄合計 **98.3%**（118／120）

| 課檔 | Match／總題 | Match Rate | Mismatch |
|:--|:--|:--|:--|
| L1, L3, L4, L5 | 全數通過 | 100% | — |
| `G3_S2_SCI_KANGHSUAN_L2` | 28/30 | 93.3% | Q21, Q29 |

### 2.3 NanYi — 目錄合計 **100.0%**（150／150）

| 課檔 | Match／總題 | Match Rate | Mismatch |
|:--|:--|:--|:--|
| L1 ~ L5 | 全數通過 | 100% | — |

## 3. 整體合計 Match Rate

| 版本 | Match | 總題 | Match Rate |
|:--|:--|:--|:--|
| HanLin | 119 | 120 | **99.2%** ✅ |
| KangHsuan | 118 | 120 | **98.3%** ✅ |
| NanYi | 150 | 150 | **100.0%** ✅ |
| **三版本合計** | **387** | **390** | **99.2%** ✅ |

---

## 4. Claude Code 審視與修正紀錄（2026-04-05）

### 4.1 Mismatch 詳細分析（3 題）

| 課檔 | 題號 | AI選 | 正確 | 根因 | 處置 |
|:--|:--|:--|:--|:--|:--|
| HanLin L3 | Q14 | C.雜食性 | B.草食性 | 松鼠在科學上屬雜食性，但小學教材定義為草食性；AI 依通識知識選雜食性 | **confirmed**（課本定義草食性正確）+ 清除選項 artifact |
| KangHsuan L2 | Q21 | ai=-1 | B.水蒸氣凝結成小水滴 | AI 無法確定選項（科學術語混淆） | **confirmed** |
| KangHsuan L2 | Q29 | C.去除髒污細菌 | ~~A.香香的~~ → **C.去除髒污細菌** | **answer_index 錯誤**：answer_index=3 指向誘答「讓手變得香香的」，實際應為 index=2「清水和肥皂可以去除手上的髒污和細菌，保持衛生。」 | **corrected** |

### 4.2 修正清單（2 處）

| 檔案 | 修正內容 |
|:--|:--|
| `G3_S2_SCI_KANGHSUAN_L2.json` Q29 | answer_index 3→2；blind_eval_mismatch.review_status→corrected |
| `G3_S2_SCI_HANLIN_L3.json` Q14 | options[1] 清除 AI artifact 文字（「，並且需要經過深思熟慮的考量。」）；review_status→confirmed |

### 4.3 修正後 CQI-P 驗證

```bash
node scripts/evaluate_question_quality.js question/platform/G3/Science/S2/KangHsuan/G3_S2_SCI_KANGHSUAN_L2.json
# → avgCqi: 7.83 ✅

node scripts/evaluate_question_quality.js question/platform/G3/Science/S2/HanLin/G3_S2_SCI_HANLIN_L3.json
# → avgCqi: 8.40 ✅
```

---

## 📂 異動清單

| 檔案路徑 | 異動類型 | 說明 |
|:--|:--|:--|
| `scripts/run_blind_eval.js` | 修改 | R4_MAPPING 補入 Science 科目（G3~G6 S2 + G5 S1）；對所有 run_blind_eval.js 執行自然科目均有效 |
| `question/platform/G3/Science/S2/KangHsuan/G3_S2_SCI_KANGHSUAN_L2.json` | 修改 | Q29 answer_index 3→2；Q21 review_status→confirmed |
| `question/platform/G3/Science/S2/HanLin/G3_S2_SCI_HANLIN_L3.json` | 修改 | Q14 options[1] 清除 artifact 文字；review_status→confirmed |

---

## ✅ Checklist 對照結果

### 驗收 Checklist (Acceptance)
- [x] 全版本 Match Rate ≥ 85% — HanLin 99.2% / KangHsuan 98.3% / NanYi 100.0%
- [x] Mismatch 逐題分析完成（3 題：1 修正 + 1 確認 + 1 artifact 清除）
- [x] 修正後 CQI-P ≥ 5.5 — KangHsuan L2: 7.83 / HanLin L3: 8.40

### 成果 Checklist (Deliverables)
- [x] 成果表格填寫完畢
- [x] 已執行 `/pj_sync` 確認（`question_verify` 任務，無規格書異動；進度彙整表 G3 S2 自然 QL4 確認）
- [x] Report 異動清單已列出所有實際路徑

---

## ⚠️ 遺留問題

1. **`R4_MAPPING` 未來擴充**：已補入 Science G3~G6，但 G3/S1、G4/S1 等尚未加入（無對應題庫，暫不需要）。若未來新增這些學期的自然題庫，需再補 mapping。

---

## 🔧 技術筆記

- **Science R4_MAPPING 缺漏根因**：`run_blind_eval.js` 早期設計時只含 Chinese/Math/SocialStudies，後來新增 English 但未補 Science。自然科目過去使用 JOB-053 backfill 且盲測細節不詳，因此缺漏未被發現。
- **KangHsuan L2 Q29 錯誤模式**：與 JOB-143（國語）、JOB-145（社會）相同的出題 AI 錯誤模式—生成選項後重排順序，但未同步更新 answer_index，導致 index 指向誘答而非正確答。

---

## 🔍 驗收確認

| 欄位 | 內容 |
|:--|:--|
| 驗收者 | Claude Code (claude-sonnet-4-6) |
| 驗收時間 | 2026-04-05 |
| 驗收結果 | 通過 |
| 退回原因 | 無 |

---

## ⏱️ 執行時間回報

| 子任務 / 階段 | 耗時 | 備註 |
|:--|:--|:--|
| R4_MAPPING 修正 + 語法驗證 | - | Claude Code 環境無法取得壁鐘時間 |
| 盲測腳本執行（三版本合計） | ~10 分鐘（估） | HanLin + KangHsuan + NanYi |
| Mismatch 審視與修正 | - | — |
| **總計** | **~10 min + -** | — |

## 真實回報本次對話的模型與花費
＄作業匯總：Token數:- | 花費: $- | 使用模型: claude-sonnet-4-6 | 執行者: Claude Code
