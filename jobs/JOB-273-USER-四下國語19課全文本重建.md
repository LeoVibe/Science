*Created by USER at 2026-07-04*

`last_updated`: 2026-07-04
`updated_by`: Claude Code (claude-sonnet-5)

# JOB-273-USER-重建-四下國語-19課全文本

**`job_type`**：`mixed`（子段A：`question_prod` 全新出題；子段B：`question_verify` 雙盲驗證）
定義與邊界見 **`docs/README_任務派工準則.md`** 第二章。

## 📌 任務背景

四下國語36課中，21課（翰林L1-6、康軒L1-6+L10+L11、南一L1-6+L9）先前經診斷確認題目與課文內容脫鉤（anchored<15，多數為0），屬套版通用題（可用於任何一課的通用情境題）或誤植其他課內容，非真正扣緊本課課文。JOB-272已完成另外15課（翰林L7-12、康軒L7/8/9/12、南一L7/8/10/11/12）的BIAS修正，本JOB處理21課中的19課全文本重建；其餘2課（康軒L10、L11）因課文素材僅有一句「故事便利貼」摘要（134~147字），非真正課文全文，素材不足，另立research JOB補課文後再處理。

## 🎯 任務目標

19課570題全數用「課文為必要錨點」規則重新出題取代舊題：每題須具體引用該課課文的情節/人物/意象/字詞，換成別課課文就答不出來。雙盲驗證（盲測+judge四閘）全數通過。BIAS（正解嚴格唯一最長比例）真實40%門檻全數合格。

## 🚧 任務邊界

本次任務只做：
- 翰林L1-6（6課）、康軒L1-6（6課，不含L10/L11）、南一L1-6+L9（7課），共19課570題
- 讀取各課RC-01課文全文+考古題與討論，重新出題（非修改舊題，是全新出題取代）
- 雙盲驗證（盲測+judge，課文必要錨點判準）
- 未過四閘者補題+再驗證
- merge寫回主檔、更新manifest、重新產出libraryStats.json
- 用真實40%門檻（正解嚴格唯一最長）確認全數合格

本次任務不做（遇到以下情況請停止並回報，不可自行延伸）：
- 修改規範文件（除非派工單明確要求）
- 康軒L10、L11（課文素材不足，需另立research JOB補齊課文全文後才能處理）
- 修改課文研究素材本身（RC-01~RC-06研究工作屬`research` job_type範疇）
- 已完成的15課（翰林L7-12、康軒L7/8/9/12、南一L7/8/10/11/12，JOB-272已處理）
- push（維持使用者先前決定：社會國語全部完成後一併push）

## 📖 執行步驟

1. 讀取19課的RC-01課文全文（單課研究紀錄）與考古題與討論
2. sonnet依課文全文出30題新題/課，規則（嚴格）：
   - 每題須具體引用本課課文情節/人物/意象/字詞，非通用套版情境題
   - 禁止「四選項僅一個正向詞」可憑字面情感猜答的題型
   - 選項須語意獨立不重疊
   - 禁止照抄考古題題幹/選項/誘答結構
   - 正解字數不可嚴格大於其餘3個誘答選項（避免BIAS）
   - 若特定課難以湊滿30題不重複，如實回報缺口，不用套版題硬湊
3. reshuffle產出blind（無答案）/shuffled（含答案）驗證檔
4. 雙盲驗證：盲測員判斷正解+single_answer；judge判斷belongs（課文必要錨點）+match
5. 計算四閘（盲測命中/single_answer/belongs/match）通過率，記錄未過題目
6. 未過者用sonnet補題（讀課文全文，避開原缺陷），再跑雙盲驗證
7. 通過題目merge回主檔，標記review_status=confirmed、quality_level=QL4、blind_evaluation=true、is_publishable=true
8. 用官方`evaluateFile()`重算avg_cqi更新manifest；重新產出libraryStats.json
9. 用「正解嚴格唯一最長」定義對19課逐題核算，確認全數≤40%

## 📜 關鍵參考檔案
| 檔案路徑 | 用途 |
|:--|:--|
| `docs/README_任務派工準則.md` | 派工生命週期、`job_type`、開結案管線 |
| `question/README_出題與品管準則.md` | 出題原則、CQI-P |
| `question/README_驗證與盲測準則.md` | §4.2 QL定義、§4.6 BIAS上架門檻（40%，已於JOB-272對齊） |
| `jobs/JOB-272-Report.md` | 前批（15課BIAS修正）完整流程與方法論參考 |
| `knowledge/1_課綱研究/國語/四下/{翰林,康軒,南一}/` | 19課的RC-01課文全文與考古題 |

## ✅ 啟動 Checklist (Pre-Flight)
> 每一項打勾前必須確實完成，不得預先全部打勾。

- [x] 已讀取：`question/README_驗證與盲測準則.md`、`question/README_出題與品管準則.md`、`JOB-272-Report.md`
- [x] 已確認前置素材：19課RC-01課文全文皆存在且非摘要占位（365~1074字，已逐課核實）；康軒L10/L11因僅有摘要故排除於本次範圍
- [x] **已確認執行模型**：sonnet（claude-sonnet-4-6，Claude Code session內建，經由`Agent`/`Workflow`工具的`agent()` model:'sonnet'執行）
- [x] **已確認使用金鑰**：不適用（非外部API金鑰呼叫）
- [x] **已確認操作頻次**：不適用（非外部API呼叫，無QPM限制概念）
- [x] 目標品質：QL4
- [x] 已閱讀「任務邊界」並確認本次範圍

## ✅ 驗收 Checklist (Acceptance)
> 每一項需提供佐證（數字、指令輸出、截圖），不得僅靠自我判斷打勾。

- [x] 19課542題四閘（盲測命中/single_answer/belongs/match）通過率100%（初次驗證86.3%，74題落閘經3輪補題修正後全數通過，實際542題比原目標570少28題，因4課課文過短誠實回報無法湊滿30題）
- [x] 19課「正解嚴格唯一最長」比例全數≤40%（實際0%~25%，python重算輸出見Report）
- [x] `evaluate_question_quality.js` 執行0 crash（19課全數評估成功）
- [x] `validate_review_fields.js` 本次19課542題0 errors
- [x] CQI-V Match Rate ≥ 85%（實際100%，542/542）
- [x] 最終 CQI ≥ 6.5（實際8.29~9.47，來源`evaluateFile()`官方輸出）
- [x] 內容含 scenario + explanation（schema強制欄位）

## ✅ 成果 Checklist (Deliverables)
> 每一項需在 Report 中有對應的實際內容。不得用「已完成」「如上」「見程式碼」等抽象詞代替。

- [x] 成果表格填寫完畢（19課中文課名/真實模型/執行日期/題數與avgCQI）
- [ ] 進度總表已同步（`docs/進度彙整_題庫研發與產出.md`）— 待`/pj_sync`
- [ ] 已執行 `/pj_sync` — 待PM/使用者確認後執行
- [x] 產出 JOB-273-Report.md，異動清單已列出所有實際修改的檔案路徑

## 真實回報本次對話的模型與花費
＄作業匯總：Token數:{真實Meta中數字} | 花費: ${換算台幣} | 使用模型: {真實Meta中的模型代碼} | 執行者: {AG|Cursor|Claude}
