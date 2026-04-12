<!--
last_updated: 2026-04-05 00:00
updated_by: Claude Code (claude-sonnet-4-6)
-->

# JOB-143 結案報告：G3 S2 國語 三版本深層盲測（翰林／康軒／南一）

**`job_type`**：`question_verify`
**`executor`**：Cursor Agent（`run_blind_eval.js`）+ Claude Code（Mismatch 審視與修正）

---

## 1. 執行指令（依序）

工作目錄：`/Users/s389080/Documents/doc/work/0_AI_Project/eidosProject`

```bash
node scripts/run_blind_eval.js question/platform/G3/Chinese/S2/HanLin --force
node scripts/run_blind_eval.js question/platform/G3/Chinese/S2/KangHsuan --force
node scripts/run_blind_eval.js question/platform/G3/Chinese/S2/NanYi --force
```

執行時間：2026-04-04 02:12 ~ 02:26（共約 14 分鐘）
執行金鑰：Yotta（Gemini-3.1-Flash-Lite）

**stdout 摘要：**

| 目錄 | 腳本總結 |
|:--|:--|
| HanLin | `🎉 盲審大調查結束！ 命中: 346 / 失敗: 4 (98.9%)` |
| KangHsuan | `🎉 盲審大調查結束！ 命中: 448 / 失敗: 13 (97.2%)` |
| NanYi | `🎉 盲審大調查結束！ 命中: 253 / 失敗: 19 (93.0%)` |

---

## 2. 各目錄 Match Rate 彙整

### 2.1 HanLin — 目錄合計 **98.9%**（346／350）

| 課檔 | Match／總題 | Match Rate | Mismatch 題號 |
|:--|:--|:--|:--|
| L1 ~ L5, L8, L10 ~ L12 | 全數通過 | 100% | — |
| `G3_S2_CHI_HANLIN_L6` | 28/30 | 93.3% | Q11, Q19 |
| `G3_S2_CHI_HANLIN_L7` | 28/29 | 96.6% | Q21 |
| `G3_S2_CHI_HANLIN_L9` | 28/29 | 96.6% | Q21 |

### 2.2 KangHsuan — 目錄合計 **97.2%**（448／461）

| 課檔 | Match／總題 | Match Rate | Mismatch 題號 |
|:--|:--|:--|:--|
| L3, L4, L7 ~ L9, L11, L12 | 全數通過 | 100% | — |
| `G3_S2_CHI_KANGHSUAN_L1` | 59/60 | 98.3% | Q33 |
| `G3_S2_CHI_KANGHSUAN_L2` | 53/62 | 85.5% | Q1,2,4,7,10,22,25,28,30 ⚠️ |
| `G3_S2_CHI_KANGHSUAN_L5` | 24/25 | 96.0% | Q11 |
| `G3_S2_CHI_KANGHSUAN_L6` | 28/29 | 96.6% | Q1 |
| `G3_S2_CHI_KANGHSUAN_L10` | 29/30 | 96.7% | Q23 |

### 2.3 NanYi — 目錄合計 **93.0%**（253／272）

| 課檔 | Match／總題 | Match Rate | Mismatch 題號 |
|:--|:--|:--|:--|
| L1, L4 ~ L6, L9 | 全數通過 | 100% | — |
| `G3_S2_CHI_NANYI_L2` | 25/28 | 89.3% | Q3, Q10, Q22 ⚠️ |
| `G3_S2_CHI_NANYI_L3` | 29/30 | 96.7% | Q1 |
| `G3_S2_CHI_NANYI_L7` | 7/8 | 87.5% | Q8 |
| `G3_S2_CHI_NANYI_L8` | 21/24 | 87.5% | Q20, Q22, Q24 ⚠️ |
| `G3_S2_CHI_NANYI_L10` | 28/30 | 93.3% | Q2, Q3 |
| `G3_S2_CHI_NANYI_L11` | 25/30 | 83.3% | Q4,11,20,21,30 ⚠️ |
| `G3_S2_CHI_NANYI_L12` | 26/30 | 86.7% | Q3,8,11,26 ⚠️ |

## 3. 整體合計 Match Rate

| 版本 | Match | 總題 | Match Rate |
|:--|:--|:--|:--|
| HanLin | 346 | 350 | **98.9%** ✅ |
| KangHsuan | 448 | 461 | **97.2%** ✅ |
| NanYi | 253 | 272 | **93.0%** ✅ |
| **三版本合計** | **1047** | **1083** | **96.7%** ✅ |

---

## 4. §2.5 超門檻課檔（Mismatch > 2）

依 `README_驗證與盲測準則.md §2.5`，以下課檔 Mismatch 題數 > 2，需 Claude Code 人工審視：

| 課檔 | Mismatch 題數 | 審視結論 |
|:--|:--|:--|
| `G3_S2_CHI_KANGHSUAN_L2` | 9 | ✅ 人工確認（見 §5） |
| `G3_S2_CHI_NANYI_L2` | 3 | ✅ 人工確認 |
| `G3_S2_CHI_NANYI_L8` | 3 | ✅ 人工確認 |
| `G3_S2_CHI_NANYI_L11` | 5 | ✅ 人工確認 |
| `G3_S2_CHI_NANYI_L12` | 4 | ✅ 1題 answer_index 修正，3題人工確認 |

---

## 5. Claude Code 審視與修正紀錄（2026-04-05）

### 5.1 根因分析

本次 36 題 Mismatch 可分為兩類：

**A. AI 無法確定選項（ai_selected = -1）：32 題**

驗證引擎 Gemini-3.1-Flash-Lite 缺乏各版本課文的完整原文，對於需要對照「課文第幾段」原文的問題，無法從選項中指定正確答案，因此回傳 `-1`。
這是盲測引擎的已知限制，**非題目品質問題**。各題 explanation 均可佐證 answer_index 正確。

**B. AI 選擇特定錯誤答案（ai_selected ≠ correct）：4 題**

| 課檔 | 題號 | AI選 | 正確 | 原因 |
|:--|:--|:--|:--|:--|
| L10 Q2 | NanYi | 雲朵 | 水滴 | AI 混淆水滴與雲朵的凝結關係 |
| L10 Q3 | NanYi | 大水缸 | 大淚盆 | 課文比喻「海洋如大淚盆」，AI 選到其他容器 |
| L11 Q4 | NanYi | 天牛幼蟲 | 獨角仙幼蟲 | AI 混淆兩種昆蟲偏好的枯木種類 |
| L11 Q11 | NanYi | 腐木 | 沉木 | AI 混淆腐木與沉木概念 |
| L12 Q8 | NanYi | 特色功能 | ~~詳細地址~~ → **特色功能** | **answer_index 錯誤（見下方修正）** |

### 5.2 修正清單（1 題）

| 檔案 | 題號（1-based） | 修正內容 |
|:--|:--|:--|
| `G3_S2_CHI_NANYI_L12.json` | Q8 | answer_index 2→1；explanation 更新（「作者寫這篇課文最主要讓讀者了解什麼」，正確答案為「騎樓的特色、功能與在臺灣的特殊性」） |

### 5.3 修正後 CQI-P 驗證

```bash
node scripts/evaluate_question_quality.js question/platform/G3/Chinese/S2/NanYi/G3_S2_CHI_NANYI_L12.json
# → avgCqi: 8.59 ✅
```

所有修正課檔 CQI-P ≥ 5.5，品質達標。

---

## 📂 異動清單

| 檔案路徑 | 異動類型 | 說明 |
|:--|:--|:--|
| `question/platform/G3/Chinese/S2/NanYi/G3_S2_CHI_NANYI_L12.json` | 修改 | Q8 answer_index 2→1，explanation 更新，blind_eval_mismatch.review_status→corrected |
| `question/platform/G3/Chinese/S2/HanLin/G3_S2_CHI_HANLIN_L{6,7,9}.json` | 修改 | 各題 blind_eval_mismatch.review_status→confirmed（無 answer_index 修正） |
| `question/platform/G3/Chinese/S2/KangHsuan/G3_S2_CHI_KANGHSUAN_L{1,2,5,6,10}.json` | 修改 | 各題 blind_eval_mismatch.review_status→confirmed（無 answer_index 修正） |
| `question/platform/G3/Chinese/S2/NanYi/G3_S2_CHI_NANYI_L{2,3,7,8,10,11}.json` | 修改 | 各題 blind_eval_mismatch.review_status→confirmed（無 answer_index 修正） |

---

## ✅ Checklist 對照結果

### 驗收 Checklist (Acceptance)
- [x] CQI-V Match Rate ≥ 85%（三目錄）— HanLin 98.9% / KangHsuan 97.2% / NanYi 93.0%
- [x] §2.5 超門檻課檔已人工審視 — 5 個課檔均完成審視，1 題修正，35 題確認
- [x] 修正後 CQI-P ≥ 5.5 — L12 修正後 avgCqi = 8.59

### 成果 Checklist (Deliverables)
- [x] 成果表格填寫完畢
- [x] 已執行 `/pj_sync` 確認（`question_verify` 任務，無規格文件異動；進度彙整表 G3 S2 國語已標示 QL4）
- [x] Report 異動清單已列出所有實際路徑

---

## ⚠️ 遺留問題

1. **KangHsuan L2 單課 Match Rate = 85.5%**：雖略高於 85% 門檻，但 9 題全為 ai=-1（AI 缺乏課文原文），建議未來以 R4 課文素材強化問題說明，提高盲測 AI 的可辨識度。

---

## 🔧 技術筆記

- **ai=-1 大量出現原因**：KangHsuan L2 整課以多篇獨立故事（小松鼠/小猴子/小豬/刺蝟/大象）組成，每題需結合特定故事情境，Gemini Flash Lite 無原文時無法選定。此為引擎限制，answer_index 均正確。
- **NanYi L12 Q8 answer_index 錯誤**：題幹為「作者寫這篇課文最主要讓讀者了解什麼？」，正確答案應為選項B「騎樓的特色、功能與在臺灣的特殊性」，但 answer_index 誤設為 2（選項C「詳細地址和開放時間」，為明顯誘答選項）。根因：出題 AI 在解釋為何排除其他選項時標錯答案。

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
| 盲測腳本執行（三目錄） | ~14 分鐘 | log 記錄 02:12~02:26 |
| Claude Code Mismatch 審視與修正 | - | Claude Code 環境無法取得壁鐘時間 |
| **總計** | **~14 min + -** | 腳本執行有精確時間，人工審視無法量測 |

## 真實回報本次對話的模型與花費
＄作業匯總：Token數:- | 花費: $- | 使用模型: claude-sonnet-4-6 | 執行者: Claude Code
