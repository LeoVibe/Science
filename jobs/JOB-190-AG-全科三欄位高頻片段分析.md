*Created by Claude Code (PM) at 2026-04-15*

`last_updated`: 2026-04-15
`updated_by`: Claude Code (claude-sonnet-4-6)

# JOB-190-AG-全科三欄位高頻片段分析

**`job_type`**：`engineering`
**`executor`**：Claude Code（使用者授權例外）
**`priority`**：P2
**`depends_on`**：JOB-189（發現欄位盲區）、JOB-128（舊案對照基準）

---

## 📌 任務背景

JOB-189 完成全庫 `options` 欄位 AI 評註殘留清除（653 檔，2,124 → 0 個殘留）。
JOB-128 完成國語 G3-G6 的 `question`/`scenario`/`options` 套話清除（229 檔）。

**盲區分析**：以下欄位從未被系統掃描：
- `question`（題幹）：社/數/自/英 四科從未掃過
- `scenario`（情境）：社/數/自/英 四科從未掃過
- `explanation`（解析）：**全科目從未掃過**，且 AI 撰寫解析時元評論密度最高

若這些欄位含有 AI 評註殘留，前台解析頁即會曝光，影響使用者信任。

**因果紀錄**：
- JOB-128 發現問題：國語 options+question+scenario 有套話，但只清了國語
- JOB-189 發現問題：全科 options 有 AI 評註，清除完成
- 本 JOB 填補最後盲區：全科 question+scenario+explanation 尚未掃描

---

## 🎯 任務目標

產出 **全科題庫三欄位高頻片段分析報告**，包含：
1. `question` / `scenario` / `explanation` 各欄位 Top 100 高頻片段（分科子榜 + 跨科總榜）
2. JOB-128 的 36 個 REMOVAL_PHRASES 在這三個欄位中的殘留狀況對照表

報告作為 JOB-191（清除任務）的規則制定依據。

---

## 🚧 任務邊界

**只做**：
- 讀取 `question/platform/` 下所有題庫 JSON
- 統計 `question` / `scenario` / `explanation` 欄位的片段頻次
- 輸出 `.md` 與 `.json` 兩份報告

**不做**：
- 修改任何 `question/platform/` 檔案（零寫入）
- 修改 `options` 欄位（已由 JOB-189 處理）
- 制定清除規則（留給使用者審視報告後決定）
- 開立 JOB-191（PM 職責，執行完成後告知 PM）

---

## 📖 執行步驟

1. 讀取實作計畫：`docs/superpowers/plans/2026-04-15-field-segment-analysis-plan.md`
2. 建立腳本 `scripts/analyze_field_segments.mjs`（依計畫 Task 1–3）
3. 執行腳本，確認掃描檔案數 ≥ 600
4. 驗證輸出（JSON 合法、三欄位榜存在、舊案對照 36 列）
5. Commit 腳本與報告
6. 撰寫 `jobs/JOB-190-Report.md`

---

## 📜 關鍵參考檔案

| 檔案路徑 | 用途 |
|:--|:--|
| `docs/superpowers/plans/2026-04-15-field-segment-analysis-plan.md` | 完整實作計畫（含程式碼） |
| `docs/superpowers/specs/2026-04-15-field-segment-analysis-design.md` | 設計規格書 |
| `scripts/analyze_chinese_question_bank_comma_segments.mjs` | JOB-128 參考腳本 |
| `scripts/clean_option_artifacts.js` | JOB-189 參考腳本 |
| `jobs/JOB-128-Report.md` | 舊案背景 |
| `jobs/JOB-189-Report.md` | 前次清除背景 |

---

## ✅ 啟動 Checklist (Pre-Flight)

- [x] 已讀取：`docs/superpowers/plans/2026-04-15-field-segment-analysis-plan.md`
- [x] 已讀取：`docs/superpowers/specs/2026-04-15-field-segment-analysis-design.md`
- [x] 已確認執行模型：claude-sonnet-4-6
- [x] 已確認任務邊界：零寫入 question/platform/，只輸出 docs/研究紀錄/
- [x] 已閱讀「任務邊界」並確認本次範圍

---

## ✅ 驗收 Checklist (Acceptance)

- [ ] 掃描檔案數 ≥ 600 — 佐證：腳本輸出「掃描 N 個題庫 JSON」
- [ ] 三欄位均有獨立榜 — 佐證：`grep -c "欄位 Top" .md` = 3
- [ ] 舊案對照 36 列完整 — 佐證：`grep -c "已清除\|仍有殘留" .md` = 36
- [ ] JSON 格式合法 — 佐證：`node -e "JSON.parse(...)"` 無錯誤
- [ ] 零寫入驗證 — 佐證：`git diff question/` 無任何變更

## ✅ 成果 Checklist (Deliverables)

- [ ] `scripts/analyze_field_segments.mjs` 腳本已產出
- [ ] `docs/研究紀錄/全科題庫_三欄位_高頻片段分析.md` 已產出
- [ ] `docs/研究紀錄/全科題庫_三欄位_高頻片段分析.json` 已產出
- [ ] `jobs/JOB-190-Report.md` 已產出
- [ ] 已執行 `/pj_sync`

---

## 真實回報本次對話的模型與花費
＄作業匯總：Token數:- | 花費: $- | 使用模型: claude-sonnet-4-6 | 執行者: Claude Code（使用者授權例外）
