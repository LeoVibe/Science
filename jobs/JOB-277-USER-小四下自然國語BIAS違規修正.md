*Created by USER at 2026-07-07*

`last_updated`: 2026-07-07
`updated_by`: Claude Code (claude-sonnet-5)

# JOB-277-USER-修正-小四下自然國語-BIAS違規

**`job_type`**：`mixed`（子段A：`question_prod` 誘答選項重鑄；子段B：`question_verify` 雙盲驗證）
定義與邊界見 **`docs/README_任務派工準則.md`** 第二章。

## 📌 任務背景

盤點四下（G4S2）自然、國語現況時發現：12課的BIAS（正解嚴格唯一最長比例）實際超過40%硬門檻（用`evaluate_question_quality.js`修正後的正確邏輯逐課核算），卻仍標記`is_publishable=true`正在正式上架，學生現在有可能用「選最長」矇對這些題目。確認這12課從未被JOB-272/273/276任何一次BIAS修正或全文本重建處理過（git log顯示最後修改是很久以前的舊commit），屬於既有缺口，非本輪工作造成。

## 🎯 任務目標

12課共360題的BIAS比例全數降至≤40%門檻，雙盲驗證確認Match Rate≥85%後才維持`is_publishable=true`上架狀態；未通過驗證的題目改為`review_status: pending`並移除`is_publishable`，不得繼續上架。

## 🚧 任務邊界

本次任務只做：
- 自然8課：翰林L1(現況50.0%)/L3(50.0%)、康軒L1(50.0%)/L2(43.3%)、南一L1(73.3%)/L2(76.7%)/L3(66.7%)/L4(73.3%)
- 國語4課：翰林L7(50.0%)/L11(76.7%)/L12(66.7%)、南一L10(73.3%)
- 沿用JOB-272已驗證的BIAS修正方法：重鑄過短的誘答選項字數使4個選項長度相近（不改正解、不改題意），再跑`evaluate_question_quality.js`（僅針對本次12個檔案，避免觸發全站寫回副作用）確認BIAS降至≤40%
- 雙盲驗證（比照JOB-276已釐清的官方標準：盲測Match Rate≥85%為主要判準，judge belongs作為通用知識題過濾器，不使用`single_answer`這類非官方判準）
- 更新對應manifest；重新產出libraryStats.json後務必核對`git diff --name-only -- question/platform/`範圍，排除evaluateFile()寫回副作用波及其他課次（已知系統性風險，見JOB-275/276技術筆記）

本次任務不做（遇到以下情況請停止並回報，不可自行延伸）：
- 修改規範文件（除非派工單明確要求）
- JOB-273等級的全文本重建（除非雙盲驗證發現通用套版題/文本錯位等問題，屆時停止並回報，不可自行擴大範圍重新出題）
- 動這12課以外的其他課次
- push（維持使用者先前決定）

## 📖 執行步驟
1. 針對12課，逐題核算現有選項長度分布，找出正解字數嚴格大於其餘3項的題目
2. 重寫過短的誘答選項使4選項長度相近（保留正解與題意不變）
3. 針對這12個檔案跑`evaluate_question_quality.js`確認BIAS降至≤40%
4. 雙盲驗證：盲測+judge belongs（依JOB-276確立的官方Match Rate為主要判準）
5. 未通過者按JOB-273已驗證的補題方法修正（要求依賴具體情節/事件而非通用字詞/標點/修辭定義）
6. 通過後更新review_status/is_publishable/blind_evaluation/quality_level/cqi_score等欄位
7. 更新manifest；重新產出libraryStats.json，核對diff範圍後還原意外異動
8. 同步apps/v3_eidos鏡像

## 📜 關鍵參考檔案
| 檔案路徑 | 用途 |
|:--|:--|
| `docs/README_任務派工準則.md` | 派工生命週期、`job_type`、開結案管線 |
| `question/README_出題與品管準則.md` | §BIAS 40%硬門檻定義、CQI-P |
| `question/README_驗證與盲測準則.md` | §4.6 BIAS上架門檻、Match Rate判準 |
| `jobs/JOB-272-Report.md` | BIAS重鑄方法論、腳本修正紀錄 |
| `jobs/JOB-276-Report.md` | 官方Match Rate vs 自訂`single_answer`判準的釐清 |
| `jobs/JOB-275-Report.md` | `evaluateFile()`寫回副作用風險與應對方式 |

## ✅ 啟動 Checklist (Pre-Flight)
> 每一項打勾前必須確實完成，不得預先全部打勾。

- [x] 已讀取：`jobs/JOB-272-Report.md`、`jobs/JOB-276-Report.md`
- [x] 已確認前置素材：12課現有題目/課文/manifest皆存在
- [x] **已確認執行模型**：sonnet（claude-sonnet-4-6，Claude Code session內建）
- [x] **已確認使用金鑰**：不適用
- [x] **已確認操作頻次**：不適用
- [x] 目標品質：QL4
- [x] 已閱讀「任務邊界」並確認本次範圍

## ✅ 驗收 Checklist (Acceptance)
- [x] 12課BIAS比例全數≤40% — 全數 0.0%（重鑄前 43.3%~76.7%，逐課數值見 Report 表；PM 唯讀腳本獨立重算）
- [x] 12課雙盲驗證Match Rate≥85% — 第一輪 225/225=100%（每課 100%）；補題修正 4 題後第二輪 4/4=100%
- [x] `evaluate_question_quality.js`針對這12個檔案執行0 crash — 12/12 成功，quality 全 QL4
- [x] `git diff --name-only -- question/platform/`確認除這12課外無其他非預期異動 — 恰為 12 檔＋4 manifest；generate_library_stats 副作用 267 檔已全數還原
- [x] 最終CQI≥6.5 — 8.43~9.36
- [x] 內容含scenario+explanation欄位 — 360 題缺欄數 0（python 實掃）

## ✅ 成果 Checklist (Deliverables)
- [x] 成果表格填寫完畢（12課名稱/修正前後BIAS%/Match Rate/avgCQI/執行日期）— 見 `jobs/JOB-277-Report.md`
- [x] 進度總表已同步（`docs/進度彙整_題庫研發與產出.md`）
- [x] 已執行 `/pj_sync`
- [x] 產出 JOB-277-Report.md，異動清單已列出所有實際修改的檔案路徑

## 真實回報本次對話的模型與花費
＄作業匯總：Token數:2,744,161（30 subagent 加總；主迴圈無法取得填-） | 花費: -（訂閱制無單次計費） | 使用模型: claude-fable-5 | 執行者: Claude
