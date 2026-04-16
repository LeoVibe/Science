*Created by Claude Code (PM) at 2026-04-15*

`last_updated`: 2026-04-16
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

本 JOB 分兩個 Phase 執行，共同產出 JOB-191（清除任務）所需的完整規則依據。

### Phase 1（已完成）：三欄位高頻片段頻率分析
1. `question` / `scenario` / `explanation` 各欄位 Top 100 高頻片段（分科子榜 + 跨科總榜）
2. JOB-128 的 36 個 REMOVAL_PHRASES 在這三個欄位中的殘留狀況對照表
3. 對所有片段加入 🔴/🟡/🟢 判斷欄（「片段單獨存在是否有知識/說明價值」）

### Phase 2（補強）：explanation 欄位關鍵字深度掃描
**補強原因**：
- 盲測機制嚴禁讀取 `explanation`（準則 §2.2），explanation 品質從未被系統驗收
- Phase 1 頻率分析僅捕捉 ≥5 次片段；**每課 1 次 × 全庫分散 = 低頻但仍是元評論**的模板無法被頻率統計發現
- G4/Science/NanYi L1 實地驗證：20 題 explanation 全為同一套模板，每課出現 5 次，恰好壓在閾值邊緣

**目標**：不依賴頻率，以關鍵字正規表達式主動偵測已知元評論句型，輸出逐題完整原句清單，作為 JOB-191 清除腳本的精確輸入。

---

## 🚧 任務邊界

**只做**：
- 讀取 `question/platform/` 下所有題庫 JSON
- Phase 1：統計 `question` / `scenario` / `explanation` 欄位的片段頻次，產出紅黃綠燈判斷榜
- Phase 2：以關鍵字掃描 `explanation` 欄位，逐題輸出命中句、命中類型、所在檔案
- 輸出 `.md` 與 `.json` 報告（Phase 1 與 Phase 2 分別輸出）

**不做**：
- 修改任何 `question/platform/` 檔案（零寫入，兩個 Phase 均適用）
- 修改 `options` 欄位（已由 JOB-189 處理）
- 制定清除規則（留給使用者審視 Phase 2 報告後決定）
- 開立 JOB-191（PM 職責，執行完成後告知 PM）

---

## 📖 執行步驟

### Phase 1（已完成）
1. ✅ 讀取實作計畫：`docs/superpowers/plans/2026-04-15-field-segment-analysis-plan.md`
2. ✅ 建立腳本 `scripts/analyze_field_segments.mjs`（依計畫 Task 1–3）
3. ✅ 執行腳本，確認掃描檔案數 = 653
4. ✅ 驗證輸出（JSON 合法、三欄位榜存在、舊案對照 36 列）
5. ✅ 對 285 個片段加入 🔴/🟡/🟢 判斷欄
6. ✅ Commit 腳本與報告，撰寫 `jobs/JOB-190-Report.md`

### Phase 2（待執行）
1. 建立腳本 `scripts/scan_explanation_artifacts.mjs`
   - 掃描 `question/platform/` 所有 JSON 的 `explanation` 欄位
   - 以關鍵字正規表達式比對（見下方關鍵字清單）
   - 輸出欄位：`file`、`lesson`、`question_index`、`matched_pattern`、`matched_text`、`full_explanation`
2. 執行腳本，確認掃描覆蓋 ≥ 600 檔
3. 輸出 `docs/研究紀錄/explanation_元評論_關鍵字掃描.md`（人工審視用）
4. 輸出 `docs/研究紀錄/explanation_元評論_關鍵字掃描.json`（供 JOB-191 清除腳本直接引用）
5. Commit 腳本與報告，更新 `jobs/JOB-190-Report.md`

### Phase 2 關鍵字清單（初版，執行前可擴充）

| 類型 | 關鍵字 / 正規表達式 | 說明 |
|:--|:--|:--|
| AI 自我評分 | `高品質命題` | 直接標示 AI 出題品質詞彙 |
| 元評論—出題意圖 | `此題旨在` / `此題引導` | 描述出題者意圖，非知識解析 |
| 元評論—出題意圖 | `引導學生進行批判性思考` | 同上 |
| 元評論—選項設計 | `正確選項陳述符合` | 描述選項設計，非知識點 |
| 元評論—選項設計 | `其餘選項.*(?:混淆\|誤解\|迷思\|錯置)` | 描述干擾選項設計邏輯 |
| 元評論—選項設計 | `而在選項設計中` | 同上 |
| 元評論—閱讀策略 | `可回到課文關鍵段落` | 考試攻略，非知識 |
| 元評論—閱讀策略 | `將四個選項逐一對照文本線索` | 同上 |
| 元評論—閱讀策略 | `正解與課文敘述一致` | 同上 |
| 元評論—閱讀策略 | `其餘選項多為字面誤讀` | 同上 |
| 截斷殘留 | `^\[?選項\s*[A-D]\]?\s*為?正(?:解\|確)` | 「選項 B 為正解」等截斷殘留 |
| 批判性思考標籤 | `批判性思考` | 分類標籤混入解析文字 |

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

## ✅ 驗收 Checklist — Phase 1（已完成）

- [x] 掃描檔案數 ≥ 600 — 佐證：653 個
- [x] 三欄位均有獨立榜 — 佐證：三欄位 Top 100 均存在
- [x] 舊案對照 36 列完整 — 佐證：36 列均標記「已清除」
- [x] JSON 格式合法 — 佐證：`node -e "JSON.parse(...)"` 輸出 `JSON OK`
- [x] 零寫入驗證 — 佐證：question/platform diff 均為 JOB-189 既有未 commit 變更
- [x] 285 片段全數加入 🔴/🟡/🟢 判斷欄 — 佐證：🔴20/🟡18/🟢247

## ✅ 驗收 Checklist — Phase 2（待執行）

- [ ] 掃描覆蓋 ≥ 600 檔 — 佐證：腳本輸出「掃描 N 個 JSON」
- [ ] 關鍵字清單 ≥ 12 條完整掃描 — 佐證：腳本輸出各類型命中數
- [ ] 輸出含完整欄位：file / lesson / question_index / matched_pattern / full_explanation
- [ ] `.json` 格式合法 — 佐證：`node -e "JSON.parse(...)"` 無錯誤
- [ ] 零寫入驗證 — 佐證：`git diff question/` 無任何變更

## ✅ 成果 Checklist (Deliverables)

**Phase 1（已完成）**
- [x] `scripts/analyze_field_segments.mjs` 腳本
- [x] `docs/研究紀錄/全科題庫_三欄位_高頻片段分析.md`（含判斷欄）
- [x] `docs/研究紀錄/全科題庫_三欄位_高頻片段分析.json`
- [x] `jobs/JOB-190-Report.md` 初版

**Phase 2（待執行）**
- [ ] `scripts/scan_explanation_artifacts.mjs` 腳本
- [ ] `docs/研究紀錄/explanation_元評論_關鍵字掃描.md`
- [ ] `docs/研究紀錄/explanation_元評論_關鍵字掃描.json`
- [ ] `jobs/JOB-190-Report.md` 更新（補充 Phase 2 成果）
- [ ] 已執行 `/pj_sync`

---

## 真實回報本次對話的模型與花費
＄作業匯總：Token數:- | 花費: $- | 使用模型: claude-sonnet-4-6 | 執行者: Claude Code（使用者授權例外）
