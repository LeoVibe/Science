*Created by USER at 2026-07-02*

`last_updated`: 2026-07-02
`updated_by`: Claude Code (claude-sonnet-5)

# JOB-272-USER-重鑄與重驗-四下社會國語-BIAS超標18課

**`job_type`**：`mixed`（子段A：`question_prod` 重鑄誘答選項；子段B：`question_verify` 雙盲重驗）
定義與邊界見 **`docs/README_任務派工準則.md`** 第二章。

## 📌 任務背景

四下社會18課（`84a65849`，已commit未push）與四下國語15課（暫存待commit）在先前作業中，「正解＝最長選項」比例檢查誤用了 `scripts/evaluate_question_quality.js` 內建的 G3/G4 特例門檻（75%），而非 `question/README_驗證與盲測準則.md` §4.6 規定的正式硬門檻（40%）。該腳本的75%門檻是專案文件已明確標註的已知bug（`question/README_出題與品管準則.md`：「⚠️ 程式現對G3/G4用75%、待修正對齊40%」）。

用正確門檻（正解嚴格唯一最長，即字數嚴格大於其餘3個選項）重新核算後，發現：
- 社會18課中 **8課** 超標（>40%）
- 國語15課中 **10課** 超標（>40%）

這18課雖曾通過雙盲驗證（盲測+judge四閘），但選項長度偏差本身即為上架硬門檻項目，須重鑄誘答選項並重新驗證。

## 🎯 任務目標

18課540題「正解嚴格唯一最長」比例（依 §4.2/§4.6 定義）全數降至 ≤40%；重鑄後仍100%通過雙盲驗證（盲測命中、single_answer、judge belongs、judge match 四閘）。

## 🚧 任務邊界

本次任務只做：
- 重鑄以下18課的誘答（錯誤）選項文字，使其不再過短，消弭選項長度偏差：
  - 社會8課：翰林L3、翰林L5、康軒L2、康軒L6、南一L2、南一L3、南一L4、南一L5
  - 國語10課：翰林L8、翰林L9、康軒L7、康軒L8、康軒L9、康軒L12、南一L7、南一L8、南一L11、南一L12
- 重鑄後對這18課重新跑雙盲驗證（盲測員+judge，國語沿用「課文為必要錨點」判準、社會沿用既有三錨點判準）
- 未過四閘者，依已驗證流程用sonnet補題並再驗證
- merge寫回主檔、更新對應manifest的avg_cqi/count/blind_tested欄位、重新產生libraryStats.json

本次任務不做（遇到以下情況請停止並回報，不可自行延伸）：
- 修改規範文件（除非派工單明確要求）
- 四下國語其餘21課（翰林L1-6、康軒L1-6+L10+L11、南一L1-6+L9）的文本錯位全文本重建——另案處理
- 更動 `answer_index` 或改變正解的語意內容（僅允許對過長正解做同義精簡，且須經judge match=true確認未失真）
- 修改 `scripts/evaluate_question_quality.js` 內的75%門檻bug本身（該bug修正屬engineering範疇，非本JOB範圍；本JOB以人工/腳本外算的40%門檻為準）
- push或提交尚未完成驗證的內容

## 📖 執行步驟

1. 對18課分別抽取 `{lesson}_rebalance_in.json`（含 `correct_is_longest` 旗標與各選項字數），供重鑄依據
2. sonnet依現有已驗證prompt規則重鑄誘答選項：不得更動 `answer_index`、不得改變正解語意；允許對明顯過長的正解做同義精簡
3. reshuffle產出新的 `_rebal_blind.json`（無答案，供盲測）與 `_rebal_shuffled.json`（含答案，供judge）
4. 雙盲重驗：盲測員判斷正解與single_answer；judge判斷belongs與match（國語lessons沿用「學生不必讀本課課文就能答對→一律belongs=false」的必要錨點判準）
5. 計算四閘通過率，未過者記錄idx與原因
6. 未過缺口用sonnet補題：課文/考古題為本，禁止「四選項僅一個正向詞可憑字面猜中」、禁止選項語意重疊、禁止照抄考古題
7. 補題比照步驟3-5跑雙盲驗證
8. 通過題目merge回主檔（`question/platform/G4/{SocialStudies,Chinese}/S2/{出版社}/G4_S2_{SOC,CHI}_{出版社}_L{n}.json`），標記 `review_status=confirmed`、`quality_level=QL4`、`blind_evaluation=true`、`is_publishable=true`，並填入真實 `verifying_model`/`verifying_date`
9. 用官方 `evaluateFile()` 重算avg_cqi更新manifest；跑 `node scripts/generate_library_stats.js` 更新libraryStats.json
10. 用「正解嚴格唯一最長」定義（非腳本75%門檻）對18課重新逐題核算，確認全數≤40%，附python核算輸出作為驗收佐證

## 📜 關鍵參考檔案
| 檔案路徑 | 用途 |
|:--|:--|
| `docs/README_任務派工準則.md` | 派工生命週期、`job_type`、開結案管線 |
| `question/README_出題與品管準則.md` | 出題原則、CQI-P、已知75%門檻bug說明 |
| `question/README_驗證與盲測準則.md` | §4.2 QL定義、§4.6 上架門檻（BIAS真實40%門檻） |
| `jobs/_goal-work/_GOAL_progress.md` | 前批社會/國語作業的完整流程與audit trail |
| `jobs/_goal-work/G4_SOC_*/`、`jobs/_goal-work/G4_CHI_*/` | 前批已驗證的shuffle/blind/judge/rebalance腳本與中間檔案，可複用 |

## ✅ 啟動 Checklist (Pre-Flight)
> 每一項打勾前必須確實完成，不得預先全部打勾。

- [x] 已讀取：`question/README_驗證與盲測準則.md`、`question/README_出題與品管準則.md`
- [x] 已確認前置素材 KL3/KL4 存在（18課皆為前批已驗證課程，KL4含課文全文RC-01與考古題）
- [x] **已確認執行模型**：sonnet（claude-sonnet-4-6，延續使用者「改用sonnet重鑄」之核准；codex持續回報使用受限不可用）
- [x] **已確認使用金鑰**：Claude Code session內建sonnet（非外部API金鑰呼叫，經由 `Agent`/`Workflow` 工具的 `agent()` model:'sonnet' 執行，計入本session額度）
- [x] **已確認操作頻次**：不適用（非外部API呼叫，無QPM限制概念）
- [x] 目標品質：QL4
- [x] 已閱讀「任務邊界」並確認本次範圍

## ✅ 驗收 Checklist (Acceptance)
> 每一項需提供佐證（數字、指令輸出、截圖），不得僅靠自我判斷打勾。

- [x] 18課540題「正解嚴格唯一最長」比例全數≤40%（實際0%~20%，詳見JOB-272-Report.md逐課表）
- [x] 四閘（盲測命中/single_answer/belongs/match）通過率100%（272/272，264題首輪+8題補題後全過，詳見Report）
- [x] `evaluate_question_quality.js` 執行0 crash（18課全數評估成功）
- [x] `validate_review_fields.js` 本次18課540題 0 errors（全庫3105 errors均屬其他年級既有問題，與本JOB無關）
- [x] CQI-V Match Rate ≥ 85%（實際100%，272/272）
- [x] 最終 CQI ≥ 6.5（實際8.27~9.02，來源`evaluateFile()`官方輸出）

## ✅ 成果 Checklist (Deliverables)
> 每一項需在 Report 中有對應的實際內容。不得用「已完成」「如上」「見程式碼」等抽象詞代替。

- [x] 成果表格填寫完畢（18課中文課名 / 真實模型 / 執行日期+時間 / 重鑄前後BIAS百分比對照）
- [ ] 進度總表已同步（`docs/進度彙整_題庫研發與產出.md`，若適用）— 待`/pj_sync`
- [ ] 已執行 `/pj_sync` — 待PM/使用者確認後執行
- [x] 產出 JOB-272-Report.md，異動清單已列出所有實際修改的檔案路徑（含manifest與libraryStats.json）

## 真實回報本次對話的模型與花費
＄作業匯總：Token數:{真實Meta中數字} | 花費: ${換算台幣} | 使用模型: {真實Meta中的模型代碼} | 執行者: {AG|Cursor|Claude}
