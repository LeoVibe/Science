*Created by AG at 2026-03-29 23:30*

`last_updated`: 2026-03-29 23:30  
`updated_by`: Cursor Agent  

# JOB-131-AG-驗證-社會/自然-占位/套話殘留（同 JOB-128 掃描機制）

**`job_type`**：`engineering`
定義與邊界見 **`docs/README_任務派工準則.md`** 第二章。

## 📌 任務背景
JOB-128 針對國語題庫的「占位/套話殘留」做清除與驗證；你希望用同一機制，確認 **社會（SocialStudies）**與 **自然（Science）** 題庫是否也有類似占位選項殘留，避免誤刪或漏刪。

## 🎯 任務目標
1. 掃描 `question/platform/G3|G4|G5|G6` 下的 `SocialStudies` 與 `Science` JSON（排除 manifest）。
2. 以「占位/待人工重寫類」字串作為檢測依據（至少檢測：`與課文敘述明顯不符（選項待人工重寫）` 與包含 `待人工重寫`）。
3. 產出可直接寫入 Discord/Report 的統計表，給出結論：是否為 0、若非 0 則列出受影響課檔與題列。

## 📖 執行步驟
1. 新增並執行掃描腳本 `scripts/scan_placeholder_like_options_in_subjects.js`（若已存在則直接執行）。
2. 將掃描結果整理到 `jobs/JOB-131-Report.md`（含 exact 與 like 兩種檢測）。
3. 若統計非 0：另外開派工處理對應課檔；若統計為 0：本任務結案並給出「不需套用清除腳本」的判斷依據。

## 📜 關鍵參考檔案
| 檔案路徑 | 用途 |
|:--|:--|
| `jobs/JOB-128-Report.md` | JOB-128 機制/占位定義參照 |
| `scripts/strip_chinese_bank_template_phrases.mjs` | 參照占位句常數（`待人工重寫`相關） |
| `docs/README_任務派工準則.md` | 結案流程 + Discord 回報規範 |

## ✅ 啟動 Checklist (Pre-Flight)
- [ ] 已讀取：`jobs/JOB-128-Report.md`、`scripts/strip_chinese_bank_template_phrases.mjs`、`docs/README_任務派工準則.md`
- [ ] 已確認 Discord 回報目標頻道（目前環境變數未提供 `channelId/guildId`，需你補）
- [x] **已確認本次任務不涉及題庫內容修改**（僅掃描與報告）

## ✅ 驗收 Checklist (Acceptance)
- [x] 掃描結果含 exact 與 like 兩張統計表
- [x] 結論明確回答「社會/自然是否存在類似占位問題」

## ✅ 成果 Checklist (Deliverables)
- [x] 產出 `jobs/JOB-131-Report.md`
- [ ] 已執行 `/pj_sync`（若本任務有動到進度/文件）

## 真實回報本次對話的模型與花費
＄作業匯總 ：Token數:{未提供} | 花費: {未提供} | 使用模型: {未提供} | 執行者: Cursor