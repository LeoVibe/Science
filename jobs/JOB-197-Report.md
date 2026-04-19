# JOB-197 Report — QL 定義 canonical 整合，統一全專案品質分級體系

`completed`: 2026-04-18
`executor`: Claude Code（使用者授權例外）

---

## 執行摘要

建立 QL（Quality Level）品質等級的 **Single Source of Truth**，統一全專案 8 處散落定義為單一 canonical 位置（`question/README_驗證與盲測準則.md` 第四章）。同時整理五個互補分級系統（KL / RM / CQI-P / CQI-V / QL）的關係，並對齊腳本邏輯。

---

## QL Canonical 定義（摘要）

### 每題 QL

| QL | 必要條件 | 對應 RM | 具體可驗證 |
|:--:|:--|:--:|:--|
| QL1 | 未達 QL2 | — | 結構不完整或無 KL4 研究 |
| QL2 | 該課 KL4 單課研究紀錄存在 | RM1+ | `KL4_..._單課研究紀錄.md` 存在 |
| QL3 | QL2 + 該課 KL4 考古題與討論存在 | RM2+ | `KL4_..._考古題與討論.md` 存在 |
| QL4 | QL3 + 盲測通過 | RM3 | `blind_evaluation === true` |
| QL5 | QL4 + 專家認證 | — | `verifying_model` 含 Expert（未來）|

### 每科 QL

```
該題庫 QL_X = 該題庫中達 QL_X 以上等級的題目比例 ≥ 90%，取最高達標等級
```

### 五系統關係

```
研究階段 ─────► 出題階段 ─────► 驗證階段 ─────► 上架
KL1-KL4       CQI-P ≥ 5.5       CQI-V + 盲測
   │              │                 │
   ▼              │                 │
RM0-RM3 ◄─────────┼─────────────────┘
                  ▼
              QL（每題/每科）
```

---

## 修改檔案清單

| # | 檔案 | 變更類型 | 重點 |
|:-:|:--|:--|:--|
| 1 | `question/README_驗證與盲測準則.md` §4 | **Canonical 定型** | 重寫第四章，擴充為完整 SSOT：五系統關係圖、每題定義、每科公式、CQI 關係、上架門檻 |
| 2 | `question/README_出題與品管準則.md` P-J | 指標化 | 明確 QL1→QL4 條件並指向 canonical |
| 3 | `knowledge/README_研究架構總綱.md` RM 段 | 補對應 | 新增「該課題目最高可達 QL」欄位，並指向 canonical |
| 4 | `docs/網站功能規格書.md` §3.2 | 指標化 | 改為指向 canonical |
| 5 | `docs/進度彙整_題庫研發與產出.md` §題庫品質等級 | 統一用語 | QQL1-5 → QL1-5，條件更新為 KL4 檔案存在性，指向 canonical |
| 6 | `apps/v3_eidos/src/components/AboutView.tsx` | UI 文案 | 改為「**{QL4} 代表 該題庫有 90% 的題目達到 {QL4} 以上的標準**」；legend 每列條件描述對齊 canonical |
| 7 | `scripts/evaluate_question_quality.js` | **邏輯重構** | 新增 `checkLessonKL4Files()`；每題 QL 判定改為 KL4 檔存在性 + blind；檔級 QL 改為 90% 門檻（從 80%）；廢除舊「研究天花板」邏輯 |
| 8 | `scripts/generate_library_stats.js` | 無變更 | JOB-196 已落地 90% 聚合；邏輯與 canonical 一致 |

---

## 腳本一致性驗證

| 腳本 | 用途 | canonical 對齊 |
|:--|:--|:--|
| `evaluate_question_quality.js` | 每題 QL 判定，寫入 `quality_level` 欄位 | ✅ 已對齊（檢查 KL4 雙檔 + blind） |
| `generate_library_stats.js` | 每科 QL 聚合 | ✅ 已對齊（90% 門檻累積）|

**驗證**：執行 `node scripts/evaluate_question_quality.js question/platform/G3/Chinese/S2/HanLin/G3_S2_CHI_HANLIN_L8.json` 結果：
- `kl4Status`：`hasResearch: true, hasExam: true` ✓
- `quality: QL4` ✓
- `avgCqi: 9.30` ✓

執行 `node scripts/generate_library_stats.js` 產出 `libraryStats.json` 無破壞，37 個 QL3/QL4 題庫與 JOB-196 結果一致。

---

## 重要遺留事項（需使用者決策）

### 1. 題目 JSON 的 `quality_level` 欄位未全面重評

**現況**：腳本 canonical 邏輯已就位，但 `question/platform/` 下所有 JSON 檔的 `quality_level` 欄位仍是舊值（由舊版 evaluate 腳本寫入）。

**影響**：
- 若對某檔重跑 `evaluate_question_quality.js`，該檔題目的 `quality_level` 會按新 canonical 重寫
- 特別提醒：**英語科**目前沒有 KL4 per-lesson 雙檔結構（只有學期級素材庫），按 canonical 會判為 QL1
- 未重跑的檔案仍保留舊值；UI 顯示基於 JSON 當前狀態

**建議**：另開 JOB 執行全面重評（或決定是否為英語另立 canonical 變體）

### 2. backup 資料夾統計

`G4_S2_自然_NanYi_backup_job169` 被 generate_library_stats 計入統計。建議在 manifest 或腳本排除 `*backup*` 資料夾（沿用 JOB-196 遺留事項）。

---

## 驗收 Checklist

- [x] Canonical 位置（`README_驗證與盲測準則.md` §4）完整重寫，含五系統關係圖、每題/每科公式、CQI 關係、上架門檻
- [x] 7 份文件/UI 統一指向 canonical，無重複或衝突定義
- [x] `evaluate_question_quality.js` 每題 QL 邏輯已對齊 canonical
- [x] `generate_library_stats.js` 聚合邏輯已對齊 canonical（JOB-196 已做）
- [x] 執行 `generate_library_stats.js` 無破壞（37 個 QL3/QL4 科目與 JOB-196 一致）
- [x] UI 文案已改為「{QL4} 代表 該題庫有 90% 的題目達到 {QL4} 以上的標準」
- [x] 已執行 /pj_sync 全域知識沉澱

＄作業匯總：Token數:- | 花費:$- | 使用模型: claude-sonnet-4-6 | 執行者: Claude Code（使用者授權例外）
