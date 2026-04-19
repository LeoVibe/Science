*Created by Claude Code (PM) at 2026-04-18*

`last_updated`: 2026-04-18
`updated_by`: Claude Code (claude-sonnet-4-6)

# JOB-191-AG-explanation元評論清除

**`job_type`**：`engineering`
**`executor`**：Claude Code（使用者授權例外）
**`priority`**：P1（上版前必要步驟）
**`depends_on`**：JOB-190 Phase 2（`docs/研究紀錄/explanation_元評論_關鍵字掃描.json`）

---

## 📌 任務背景

JOB-190 Phase 2 掃描確認：100 個檔案 / 350 題 / 743 筆元評論命中。
`explanation` 從未被盲測驗收（準則 §2.2），元評論長期殘留在解析頁。
179 課已達 pub≥25 可上架門檻，清除為上版前必要步驟。

## 🎯 任務目標

建立 `scripts/clean_explanation_artifacts.js`，以 Phase 2 掃描 JSON 為輸入，
對 350 題逐句清除元評論，保留真實知識解析內容。

## 🚧 任務邊界

**只做**：修改 `explanation` 欄位（sentence-level）
**不做**：修改 question/scenario/options/manifest；重新盲測

## ✅ 啟動 Checklist
- [x] 已讀取 JOB-190-Report.md
- [x] 已確認輸入：`docs/研究紀錄/explanation_元評論_關鍵字掃描.json`（350 題）
- [x] 已確認執行模型：claude-sonnet-4-6
- [x] 已確認任務邊界：只改 explanation 欄位

## ✅ 驗收 Checklist
- [ ] 修改檔案數 ≤ 100
- [ ] 修改題數 ≤ 350
- [ ] review_needed 標記數記錄在 Report
- [ ] git diff 確認只有 explanation 欄位變動
- [ ] validate_review_fields.js → 0 errors
- [ ] Dry-run 與 Actual Run 結果一致

## ✅ 成果 Checklist
- [ ] `scripts/clean_explanation_artifacts.js` 已產出
- [ ] `logs/clean_explanation_YYYYMMDD.json` 執行紀錄
- [ ] `jobs/JOB-191-Report.md` 已產出
- [ ] 已執行 `/pj_sync`

## 真實回報本次對話的模型與花費
＄作業匯總：Token數:- | 花費: $- | 使用模型: claude-sonnet-4-6 | 執行者: Claude Code（使用者授權例外）
