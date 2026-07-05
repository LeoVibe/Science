*Created by USER at 2026-07-05*

`last_updated`: 2026-07-05
`updated_by`: Claude Code (claude-sonnet-5)

# JOB-275-USER-清理-全站-iCloud同步重複檔

**`job_type`**：`engineering`（清理repo檔案+重跑既有同步腳本，非題庫內容變更）
定義與邊界見 **`docs/README_任務派工準則.md`** 第二章。

## 📌 任務背景

iCloud/macOS同步在本機repo多個目錄產生「 2」「 3」等後綴重複檔（`.gitignore`已於2026-04-21將此模式列為排除規則，註解明確標註「iCloud/macOS同步時產生的重複檔」）。這些檔案從未進入git版本控制，但仍留在本機磁碟上，曾兩次在本session誤導內容查驗（誤把空白樣板當成正式檔案：康軒國語L8考古題、南一國語L11考古題）。逐一比對全部1307個此類檔案後，確認皆為較舊或完全相同的副本，無誤刪風險。

## 🎯 任務目標

清除已核對確認安全的重複檔；`apps/v3_eidos/public/question/platform`鏡像重跑既有同步腳本，更新為反映JOB-272/JOB-273最新內容的狀態。

## 🚧 任務邊界

本次任務只做：
- 刪除以下目錄中已逐一核對為「完全相同」或「較舊/較小」的「 2」「 3」等後綴重複檔：
  - `jobs/_goal-work/`（128個，全數確認完全相同）
  - `knowledge/1_課綱研究/`（104個，確認為較舊版本）
  - `knowledge/3_考古題/`（22個，全數確認完全相同）
  - `question/platform/`（題庫正式來源，4個，確認為較舊/題數較少版本）
  - 零星docs（`docs/進度彙整_題庫研發與產出`、`docs/README_專案發展紀錄`、`docs/superpowers/specs/...design`、`jobs/JOB-268-Report`、`question/README_出題與品管準則`、`scripts/generate_library_stats.js`，共7個，時間戳皆早於正式檔案）
  - `apps/v3_eidos/public/question/platform/`鏡像目錄下的重複檔（594個）
- 重跑`sync_v3_public_questions.mjs`（及`sync_v3_public_g6_question.mjs`，若適用）重新產生鏡像目錄，確保反映`question/platform/`最新內容

本次任務不做（遇到以下情況請停止並回報，不可自行延伸）：
- 修改規範文件（除非派工單明確要求）
- `apps/v3_eidos`內`node_modules/`下的重複檔（依賴套件管理範疇，非專案內容，不處理，會由npm重新安裝管理）
- `.archive/JOB-228/duplicates_backup/`內的2個檔案（既有封存備份資料夾，本來就是刻意保留的備份，略過不動）
- `.claude/scheduled_tasks 2.lock`（Claude Code工具鎖檔，非專案內容，略過不動）
- 修改任何題庫題目內容本身（本JOB只刪除重複檔案與重跑鏡像同步，不涉及`question_prod`/`question_verify`範疇的內容變更）

## 📖 執行步驟

1. 刪除`jobs/_goal-work/`、`knowledge/1_課綱研究/`、`knowledge/3_考古題/`、`question/platform/`（4個）、零星docs（7個）共265個已核對安全的重複檔
2. 刪除`apps/v3_eidos/public/question/platform/`鏡像目錄下的594個重複檔
3. 重跑`sync_v3_public_questions.mjs`（及`sync_v3_public_g6_question.mjs`，若適用）重新產生鏡像內容
4. `find`重新掃描確認殘留數量降為0（排除`node_modules`、`.archive`、`.claude`）
5. `git status`確認除本次刪除操作與鏡像重新產生外，無其他非預期異動

## 📜 關鍵參考檔案
| 檔案路徑 | 用途 |
|:--|:--|
| `docs/README_任務派工準則.md` | 派工生命週期、`job_type`、開結案管線 |
| `.gitignore` | 第83~100行，「 2」「 3」等後綴重複檔的既有排除規則與說明註解 |
| `scripts/sync_v3_public_questions.mjs` | 重新產生`apps/v3_eidos/public/question/platform`鏡像的既有腳本 |

## ✅ 啟動 Checklist (Pre-Flight)
> 每一項打勾前必須確實完成，不得預先全部打勾。

- [x] 已讀取：`.gitignore`（確認第83~100行既有排除規則與說明）
- [x] 已確認前置素材：已用python逐一比對全部1307個候選檔案，分類為IDENTICAL/DUP_SMALLER/DUP_LARGER/NO_COUNTERPART，確認無誤刪風險（詳見對話記錄的分類統計）
- [x] **已確認執行模型**：不適用（本JOB為檔案清理與既有腳本執行，非LLM出題/驗證任務）
- [x] **已確認使用金鑰**：不適用
- [x] **已確認操作頻次**：不適用
- [x] 目標品質：不適用（engineering類，非QL題庫任務）
- [x] 已閱讀「任務邊界」並確認本次範圍

## ✅ 驗收 Checklist (Acceptance)
> engineering類JOB不涉及CQI-P/CQI-V，改以清理完整度與同步正確性為驗收依據。

- [x] 重新掃描確認目標範圍內「 2」「 3」等後綴重複檔殘留數為0（排除node_modules/.archive/.claude/apps/v3_eidos/public/history）
- [x] `sync_v3_public_questions.mjs`執行成功（清除57個、複製393個JSON、建立57個manifest），`apps/v3_eidos/public/question/platform`內容與`question/platform`來源一致
- [x] `git status`確認除本次操作外無其他非預期異動 — 過程中發現並還原1項意外副作用（generate_library_stats.js的evaluateFile寫回，281個檔案），詳見遺留問題

## ✅ 成果 Checklist (Deliverables)
> 每一項需在 Report 中有對應的實際內容。不得用「已完成」「如上」「見程式碼」等抽象詞代替。

- [x] 成果表格填寫完畢（各目錄清理數量、執行日期+時間）
- [ ] 進度總表已同步（`docs/進度彙整_題庫研發與產出.md`，若適用）— 待`/pj_sync`
- [ ] 已執行 `/pj_sync` — 待PM/使用者確認後執行
- [ ] 產出 JOB-275-Report.md，異動清單已列出所有實際修改的檔案路徑

## 真實回報本次對話的模型與花費
＄作業匯總：Token數:{真實Meta中數字} | 花費: ${換算台幣} | 使用模型: {真實Meta中的模型代碼} | 執行者: {AG|Cursor|Claude}
