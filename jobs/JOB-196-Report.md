# JOB-196 Report — 重新定義 QL 計算邏輯並更新題庫統計

`completed`: 2026-04-18
`executor`: Claude Code（使用者授權例外）

---

## 執行摘要

重新定義 QL 等級的計算方式，從「單課最高值 ≥ 80%」改為「全科累積比例 ≥ 90%」，並以題目欄位為直接依據。更新 `generate_library_stats.js` 並重新生成兩份 `libraryStats.json`。

---

## 新 QL 定義

### 每題判定（優先序）

| 條件 | 等級 |
|:--|:--:|
| `blind_evaluation === true` | QL4（不受 research ceiling 限制）|
| `quality_level` 開頭為 QL3、QL4、QL5 | QL3 |
| `quality_level` 開頭為 QL2 | QL2 |
| 其餘（空值、QL1） | QL1 |

### 科目等級（grade / semester / subject / publisher 全科加總）

| 條件 | 等級 |
|:--|:--:|
| QL4 題數 / 總題數 ≥ 90% | QL4 |
| (QL3+QL4) / 總題數 ≥ 90% | QL3 |
| (QL2+QL3+QL4) / 總題數 ≥ 90% | QL2 |
| 否則 | QL1 |

---

## 修改檔案

| 檔案 | 變更 |
|:--|:--|
| `scripts/generate_library_stats.js` | 新增 `getQuestionQLevel()`、`computeSubjectQL()`；替換品質聚合邏輯；新增 `qlCounts`/`qlTotal`/`ql4pct`/`ql3pct` 欄位輸出；同步寫入 public 目錄 |
| `apps/v3_eidos/src/data/libraryStats.json` | 重新生成 |
| `apps/v3_eidos/public/data/libraryStats.json` | 重新生成 |

---

## 新舊 QL 對照（有題目科目，QL 改變者）

| 科目 | 舊 QL | 新 QL | 備註 |
|:--|:--:|:--:|:--|
| G3 S1 數學 全3家 | QL2 | **QL3** | 全部 100% QL3+，升級 |
| G3 S2 英語 全3家 | QL3 | **QL4** | blind_evaluation 全通過，research ceiling 已廢除 |
| G3 S2 國語 翰林 | QL4 | **QL4** | 100% blind eval 通過（↑更可信）|
| G3 S2 國語 南一 | QL4 | **QL4** | 同上 |
| G3 S2 國語 康軒 | QL3 | QL3 | 87%，尚差 15 題 |
| G3 S2 數學/自然/社會 全3家 | QL4 | **QL4** | 100% 確認 |
| G4 S2 國語 全3家 | QL4 | **QL4** | 100% 確認 |
| G4 S2 自然 全3家 | QL4 | **QL4** | 100% 確認 |
| G4 S2 社會 翰林/康軒 | QL4 | **QL4** | 100% |
| G4 S2 社會 南一 | QL4 | **QL3** | 僅 84%，降級 |
| G5 S2 國語 全3家 | QL4 | **QL3** | 翰林68%、康軒43%、南一34%，降級 |
| G6 S2 國語 全3家 | QL4 | **QL4** | 100% 確認 |

---

## 升級分析表

### 距 QL4 最近（差距 ≤ 20%）

| 科目 | 現 QL | QL4% | 差距 | 還需 N 題通過盲測 |
|:--|:--:|:--:|:--:|:--:|
| G3 S2 國語 康軒 | QL3 | 87% | 3% | **15 題** |
| G4 S2 社會 南一 | QL3 | 84% | 6% | **11 題** |
| G5 S2 國語 翰林 | QL3 | 68% | 22% | 115 題 |
| G5 S2 國語 康軒 | QL3 | 43% | 47% | 185 題 |
| G5 S2 國語 南一 | QL3 | 34% | 56% | 187 題 |

> G3 S2 國語 康軒 與 G4 S2 社會 南一 最接近 QL4，優先推薦補做盲測。

### 目前 QL3 → 盲測全做可升 QL4 的科目

以下科目 QL3+ 已 100%，問題只是尚未做盲測。只要補做盲測即可升 QL4：

| 科目 | 總題數 | 需做盲測題數 |
|:--|:--:|:--:|
| G4 S2 英語 翰林/康軒/南一 | 92 | 92 |
| G4 S2 數學 翰林/康軒 | 300 | 300 |
| G5 S2 英語 全3家 | 80–120 | 80–120 |
| G5 S2 數學 全3家 | 300 | 300 |
| G5 S2 社會 全3家 | 165–225 | ~165–225 |
| G6 S2 自然/社會/數學 全3家 | 40–160 | 各科全量 |

---

## 遺留問題

1. **G4 S2 自然 NanYi_backup_job169**：backup 資料夾被計入統計（顯示 QL4）。建議在 manifest 或腳本中排除 backup 目錄。
2. **G3 S1 國語**：約 70% 題目 quality_level 未設定（QL1），實際品質可能更高，建議補跑 evaluate_question_quality.js。
3. **AboutView 的 QL 等級說明文字**尚未更新以反映新定義（80% → 90%，以及全科累積說明）。

---

## 驗收 Checklist

- [x] `generate_library_stats.js` 已加入新 QL 計算函式
- [x] `src/data/libraryStats.json` 已重新生成
- [x] `public/data/libraryStats.json` 已重新生成
- [x] 升級分析表已產出
- [x] 新舊 QL 對照完整
- [x] 已執行 /pj_sync 全域知識沉澱

＄作業匯總：Token數:- | 花費:$- | 使用模型: claude-sonnet-4-6 | 執行者: Claude Code（使用者授權例外）
