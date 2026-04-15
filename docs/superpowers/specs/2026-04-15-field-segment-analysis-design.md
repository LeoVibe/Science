# 全科題庫三欄位高頻片段分析與清除 — 設計規格書

`created`: 2026-04-15
`created_by`: Claude Code (claude-sonnet-4-6)
`status`: approved — awaiting JOB creation

---

## 背景與動機

JOB-189 完成全庫 `options` 欄位 AI 評註殘留清除（653 檔、2,124 → 0 個殘留）。
JOB-128 完成國語 G3-G6 的 `question`/`scenario`/`options` 套話清除（229 檔）。

**尚未處理的盲區**：
- `question`（題幹）：社/數/自/英 從未掃過
- `scenario`（情境）：社/數/自/英 從未掃過
- `explanation`（解析）：全科目從未掃過，且 AI 寫解析時最容易留「這題考的是…」「符合課綱…」等元評論

本設計規格覆蓋兩個 JOB 的完整流程：
- **JOB-A**：純分析，輸出排行榜，不修改任何題庫
- **JOB-B**：依人工審視結果執行清除（JOB-A 結案後才開立）

---

## JOB-A：欄位頻次分析

### 目標

全庫三欄位高頻片段排行榜，提供 JOB-B 制定清除規則的依據。

### 掃描範圍

| 項目 | 內容 |
|:--|:--|
| 目錄 | `question/platform/` 遞迴掃描 |
| 科目 | 國語、社會、數學、自然、英語 |
| 年級 | G3–G6（S1 + S2 全掃） |
| 目標欄位 | `question` / `scenario` / `explanation` |
| 排除 | manifest、mismatch、catalog、backup、libraryStats.json |

### 片段切割方式

1. 以 `/[。，！？；]/` 為分隔符切割原始文字
2. 每個片段執行 `trim()`
3. 過濾條件（丟棄）：
   - 長度 < 4 字
   - 長度 > 30 字
   - 純數字片段
   - 純英文字母片段

### 統計方式

- 三個欄位各自建立獨立頻次 map
- 出現次數 ≥ 5 次才進榜（抑制雜訊）
- 各科目 × 各欄位 另建子榜（方便定位哪個科目問題最多）
- JOB-128 的 36 個 REMOVAL_PHRASES 在報告中標記為「舊案」（驗證是否仍有殘留）

### 新建腳本

```
scripts/analyze_field_segments.mjs
```

架構參考 `scripts/analyze_chinese_question_bank_comma_segments.mjs`（JOB-128）。

支援參數：
- `--fields question,scenario,explanation`（預設全三欄）
- `--min-freq N`（最低頻次門檻，預設 5）
- `--top N`（每榜顯示前 N 筆，預設 100）

### 輸出

```
docs/研究紀錄/
  全科題庫_三欄位_高頻片段分析.md     ← 人工審視用
  全科題庫_三欄位_高頻片段分析.json   ← 機器可讀，JOB-B 規則撰寫依據
```

`.md` 報告結構：
```
# 全科題庫三欄位高頻片段分析
## 掃描摘要
   - 掃描檔案數、題數
   - 各欄位有效片段總數
## question 欄位 Top 100
   - 總榜（跨科）
   - 分科子榜（各科 Top 20）
## scenario 欄位 Top 100
   - 同上
## explanation 欄位 Top 100
   - 同上
## 舊案對照
   - JOB-128 的 36 個 REMOVAL_PHRASES 殘留狀況逐一標記
```

### 驗收 DoD

| 項目 | 標準 |
|:--|:--|
| 掃描覆蓋率 | 掃描檔案數 ≥ 600（對齊 JOB-189 基準 653 個） |
| 三欄位均有輸出 | question / scenario / explanation 各自有獨立榜 |
| 舊案對照完成 | JOB-128 的 36 個 REMOVAL_PHRASES 逐一標記殘留狀況 |
| 人工可審視 | .md 報告無需額外處理即可閱讀 |
| 零寫入 | 不修改任何 question/platform/ 檔案 |

---

## JOB-B：三欄位垃圾清除（輪廓）

> JOB-B 在 JOB-A 結案、使用者完成人工審視後才開立。
> 規則清單（REMOVAL_RULES）由審視結果決定，本規格不預設。

### 前置條件

- JOB-A 已結案
- 使用者已審視 `.md` 報告並確認垃圾模式清單

### 任務定義

| 項目 | 內容 |
|:--|:--|
| 目標欄位 | `question` / `scenario` / `explanation` |
| 科目 | 全科 G3-G6 |
| 腳本 | 新建 `scripts/clean_field_artifacts.js` |
| 架構 | 參考 JOB-189 的 `clean_option_artifacts.js`，支援 `--dry-run`、`--fields` 參數 |
| 規則來源 | JOB-A 輸出 + 使用者確認的 REMOVAL_RULES 清單 |

### JOB-B 驗收 DoD（預定）

| 項目 | 標準 |
|:--|:--|
| dry-run 先行 | 列出所有受影響檔案與片段 |
| 語意不破壞 | 各科各版本抽驗 3 題確認清除後語意正確 |
| 殘留歸零 | 清除後目標模式殘留 = 0 |
| libraryStats 重建 | 執行 verify_and_build.js 重建統計 |
| /pj_sync | 執行全域知識沉澱 |

---

## 因果紀錄

### 為什麼拆成兩個 JOB？

- 分析（JOB-A）與清除（JOB-B）是不同性質的工作：JOB-A 是觀察，JOB-B 是修改
- 中間有**人工審視**步驟不可省略——自動分析無法判斷「高頻」是否等於「垃圾」
- 分開結案可獨立驗收，避免一個大 JOB 卡在人工審視階段

### 為什麼選句號+逗號雙重分割？

- JOB-128 只用逗號，`explanation` 欄位句子較長，句號是更自然的語義切割點
- 雙重分割能抓到完整評論句型（如「這題考驗學生的推理能力。」）

### 為什麼 explanation 是優先目標？

- 從未被任何 JOB 掃描過
- AI 撰寫解析時元評論密度最高（「這題考的是…」「符合課綱…」「常見迷思為…」）
- explanation 內容前台有機會曝光（解析頁），品質影響使用者信任

### 為什麼最小片段長度設為 4 字？

- 少於 4 字的片段幾乎都是助詞、連接詞、數字，無意義
- JOB-128 實測驗證 4 字是合理下限
