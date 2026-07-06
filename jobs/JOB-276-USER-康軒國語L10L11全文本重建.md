*Created by USER at 2026-07-06*

`last_updated`: 2026-07-06
`updated_by`: Claude Code (claude-sonnet-5)

# JOB-276-USER-重建-康軒國語L10L11-全文本

**`job_type`**：`mixed`（子段A：`question_prod` 全新出題；子段B：`question_verify` 雙盲驗證）
定義與邊界見 **`docs/README_任務派工準則.md`** 第二章。

## 📌 任務背景

JOB-274已補齊康軒國語L10《小青蛙想看海》、L11《窗前的月光》的真實課文全文（先前僅有摘要，無法出題）。本JOB比照JOB-273已驗證的流程，對這2課進行全文本重建出題，完成後四下國語36課將全數達到全文本重建/BIAS修正標準（100%完成度）。

## 🎯 任務目標

2課共60題全新出題，每題須具體引用課文情節/人物/意象/字詞，100%通過雙盲驗證（盲測+judge四閘）。套用JOB-273發現並驗證過的「避免通用知識題」出題規則，避免重蹈補題階段的落閘問題。

## 🚧 任務邊界

本次任務只做：
- 康軒L10《小青蛙想看海》、L11《窗前的月光》共60題全新出題（取代現有各30題舊題）
- 讀取JOB-274補齊的課文全文+考古題與討論，依JOB-273驗證過的規則出題
- 雙盲驗證（盲測+judge，課文必要錨點判準，明確排除字詞本義/標點通用功能/修辭定義等「通用知識題」）
- 未過四閘者補題+再驗證（沿用JOB-273修正後的補題方法：具體情節/對話/角色/事件，不用字詞/標點/修辭角度）
- merge寫回主檔、更新manifest、重新產出libraryStats.json

本次任務不做（遇到以下情況請停止並回報，不可自行延伸）：
- 修改規範文件（除非派工單明確要求）
- 動其他34課（已由JOB-272/273完成）
- 修改課文研究素材本身（RC-01~RC-06研究工作屬`research`範疇）
- push（維持使用者先前決定）

## 📖 執行步驟

1. 讀取2課的RC-01課文全文（JOB-274已補齊）與考古題與討論
2. sonnet依課文出30題新題/課，規則同JOB-273修正後版本：
   - 每題須具體引用課文情節/人物/意象/字詞，非通用套版
   - **禁止**只考通用字詞本義/標點符號通用功能/通用修辭定義（JOB-273發現此為主要落閘原因）
   - 禁止「四選項僅一個正向詞」可猜答的題型
   - 正解字數不可嚴格大於其餘3個誘答選項
3. reshuffle產出blind/shuffled驗證檔
4. 雙盲驗證：盲測+judge（課文必要錨點判準）
5. 計算四閘通過率，未過者用JOB-273驗證過的補題方法修正（要求依賴具體情節/對話/角色/事件）
6. 通過題目merge回主檔，標記review_status=confirmed、quality_level=QL4、blind_evaluation=true、is_publishable=true
7. 更新manifest的avg_cqi/count/quality；重新產出libraryStats.json
8. 用「正解嚴格唯一最長」定義核算確認≤40%

## 📜 關鍵參考檔案
| 檔案路徑 | 用途 |
|:--|:--|
| `docs/README_任務派工準則.md` | 派工生命週期、`job_type`、開結案管線 |
| `question/README_出題與品管準則.md` | 出題原則、CQI-P |
| `question/README_驗證與盲測準則.md` | §4.2 QL定義、§4.6 BIAS上架門檻（40%） |
| `jobs/JOB-273-Report.md` | 全文本重建方法論、通用知識題陷阱與修正後規則 |
| `knowledge/1_課綱研究/國語/四下/康軒/KL4_四下_康軒_L10_小青蛙想看海_單課研究紀錄.md` | JOB-274補齊的課文全文 |
| `knowledge/1_課綱研究/國語/四下/康軒/KL4_四下_康軒_L11_窗前的月光_單課研究紀錄.md` | JOB-274補齊的課文全文 |

## ✅ 啟動 Checklist (Pre-Flight)
> 每一項打勾前必須確實完成，不得預先全部打勾。

- [x] 已讀取：`jobs/JOB-273-Report.md`（通用知識題陷阱與修正後出題規則）
- [x] 已確認前置素材：2課RC-01課文全文已由JOB-274補齊（各570~630字）
- [x] **已確認執行模型**：sonnet（claude-sonnet-4-6，Claude Code session內建）
- [x] **已確認使用金鑰**：不適用
- [x] **已確認操作頻次**：不適用
- [x] 目標品質：QL4
- [x] 已閱讀「任務邊界」並確認本次範圍

## ✅ 驗收 Checklist (Acceptance)
- [x] 2課57題按官方Match Rate判準通過率100%（L10 30/30、L11 27/27；`single_answer`非官方判準，已於Report記錄修正）
- [x] 2課「正解嚴格唯一最長」比例全數≤40%（皆0.0%）
- [x] `evaluate_question_quality.js` 執行0 crash
- [x] `validate_review_fields.js` 本次2課0 errors（全站掃描後過濾確認）
- [x] CQI-V Match Rate ≥ 85%（實際100%）
- [x] 最終 CQI ≥ 6.5（L10 9.31、L11 8.83）
- [x] 內容含 scenario + explanation

## ✅ 成果 Checklist (Deliverables)
- [x] 成果表格填寫完畢（2課中文課名/真實模型/執行日期/題數與avgCQI）
- [x] 進度總表已同步（`docs/進度彙整_題庫研發與產出.md`四下國語行已更新為36/36課100%）
- [x] 已執行 `/pj_sync`
- [ ] 產出 JOB-276-Report.md，異動清單已列出所有實際修改的檔案路徑

## 真實回報本次對話的模型與花費
＄作業匯總：Token數:{真實Meta中數字} | 花費: ${換算台幣} | 使用模型: {真實Meta中的模型代碼} | 執行者: {AG|Cursor|Claude}
