*Created by Claude at 2026-07-05*

`last_updated`: 2026-07-05
`updated_by`: Claude Code (claude-sonnet-5)

# JOB-275 結案報告

**`job_type`**：`engineering`
**`executor`**：Claude

## 📊 成果摘要

全專案掃描發現1307個iCloud/macOS同步產生的「 2」「 3」等後綴重複檔（`.gitignore`已於2026-04-21列為排除規則，但本機磁碟殘留未清）。逐一比對確認全數為完全相同或較舊/較小的副本後，刪除859個確認安全的重複檔（265個非鏡像目錄+594個`apps/v3_eidos/public/question/platform`鏡像目錄），並重跑`sync_v3_public_questions.mjs`使鏡像反映JOB-272/JOB-273的最新內容。

過程中意外發現：官方腳本`scripts/generate_library_stats.js`本身呼叫`evaluateFile()`，而該函式有「每次呼叫即寫回cqi_score到來源檔案」的副作用（此前JOB-272已發現並修正過同一問題，但當時誤以為只是我自己的手滑操作觸發，這次證實是**腳本本身的系統性設計缺陷**——只要執行「重新產出libraryStats.json」這個標準流程步驟，就會無差別觸發全站cqi_score重算並寫回）。本次執行`generate_library_stats.js`後，281個JOB-272/JOB-273範圍外的`question/platform`檔案被意外改寫cqi_score，已用`git diff --name-only`精確比對並以`git checkout --`全數還原。

另發現`knowledge/1_課綱研究`下34個國語考古題檔案存在7月4日的既有未commit修改（考古題淬煉/課文題型示例升級，對應session初始git status所見的JOB-223~238系列），確認與本次JOB-272~275完全無關，未觸碰、不在本次commit範圍內。

| 指標 | 數值 |
|:--|:--|
| 掃描候選檔案總數 | 1307（排除node_modules後約822~1307，依統計口徑而異）|
| 確認安全並刪除 | 859 |
| 排除不處理（git已追蹤的正式歷史封存+工具鎖檔） | 3（`apps/v3_eidos/public/history/`437個另計，非本次候選範圍）|
| 意外副作用還原 | 281個`question/platform`檔案（cqi_score） |

## 📂 異動清單

| 檔案路徑/範圍 | 異動類型 | 說明 |
|:--|:--|:--|
| `jobs/_goal-work/**/* [2-6].*`（128個） | 刪除 | 確認全數與非後綴版本完全相同 |
| `knowledge/1_課綱研究/**/* [2-6].*`（104個） | 刪除 | 確認為較舊/較小版本（多為29行空白樣板） |
| `knowledge/3_考古題/**/* [2-6].*`（22個） | 刪除 | 確認全數與非後綴版本完全相同 |
| `question/platform/**/* [2-6].*`（4個） | 刪除 | 確認為題數較少的較舊版本（如6/12題 vs 完整30題） |
| 零星docs（`docs/進度彙整_題庫研發與產出 2.md`等7個） | 刪除 | 逐一核對時間戳確認皆早於正式檔案 |
| `apps/v3_eidos/public/question/platform/**/* [2-6].*`（594個） | 刪除 | 鏡像目錄，刪除後重新同步 |
| `apps/v3_eidos/public/question/platform/`（整個目錄） | 重新產生 | 執行`node scripts/sync_v3_public_questions.mjs`，清除舊目錄57個、複製題庫JSON393個、建立manifest 57個 |
| `question/platform/`下281個檔案 | 還原（git checkout） | 排除`generate_library_stats.js`的`evaluateFile()`副作用意外改寫的cqi_score |

## ✅ Checklist 對照結果

### 驗收 Checklist (Acceptance)
- [x] 重新掃描確認目標範圍內重複檔殘留數為0（排除node_modules/.archive/.claude/apps/v3_eidos/public/history）— 已確認`jobs/_goal-work`、`knowledge/1_課綱研究`、`knowledge/3_考古題`、`question/platform`來源、零星docs、鏡像目錄皆為0殘留
- [x] `sync_v3_public_questions.mjs`執行成功，`apps/v3_eidos/public/question/platform`內容與`question/platform`來源一致 — 執行輸出：清除57個、複製393個JSON、建立57個manifest
- [x] `git status`確認除本次操作外無其他非預期異動 — 發現並修正1項意外副作用（281個檔案的evaluateFile寫回），發現並確認1批無關既有工作（knowledge/考古題淬煉34個檔案，未觸碰）

### 成果 Checklist (Deliverables)
- [x] 成果表格填寫完畢
- [ ] 進度總表已同步（`docs/進度彙整_題庫研發與產出.md`）— 待`/pj_sync`
- [ ] 已執行 `/pj_sync` — 待PM/使用者確認後執行
- [x] 產出 JOB-275-Report.md，異動清單已列出所有實際修改的檔案路徑

## ⚠️ 遺留問題

1. **`scripts/generate_library_stats.js`存在系統性副作用風險，需另立engineering類JOB修正**：該腳本呼叫`evaluate_question_quality.js`的`evaluateFile()`函式，該函式內建`fs.writeFileSync()`寫回機制（第326行），導致每次執行`generate_library_stats.js`都會無差別重算並寫回**全站**（不只是目標課次）的`cqi_score`欄位。這是繼JOB-272發現同一函式問題後的**第二次踩雷**，且這次證實問題出在官方標準流程腳本本身，而非僅止於我自己誤用`evaluateFile()`做全庫掃描。建議：
   - 修改`evaluate_question_quality.js`的`evaluateFile()`，新增`{dryRun: true}`選項，讓純查詢用途不觸發寫回
   - 或修改`generate_library_stats.js`改用純讀取邏輯取得cqi_score，不透過會寫回的`evaluateFile()`
   - 在此修正前，任何JOB執行`generate_library_stats.js`後都應比照本JOB做法，用`git diff --name-only`核對範圍並還原意外異動
2. **`knowledge/1_課綱研究`下34個考古題檔案的既有未commit修改**（考古題淬煉/課文題型示例升級，時間戳7月4日）已確認與本次JOB-272~275無關，維持原狀未觸碰，也不在本次commit範圍內。這批修改的來源與完成度不明（推測與session初始git status所見的JOB-223~238系列有關），需要另外確認其狀態與是否要commit，不屬於本JOB處理範圍。
3. **`apps/v3_eidos/public/history/`（437個「2」檔案）**確認是git已追蹤的正式歷史版本封存，非本次候選範圍，未處理。
4. **`.archive/JOB-228/duplicates_backup/`（2個檔案）與`.claude/scheduled_tasks 2.lock`（1個檔案）**維持原狀未處理，符合派工單原定邊界。

## 🔧 技術筆記

- **`evaluateFile()`寫回副作用是本專案的一個高風險陷阱，已確認在兩個不同情境下觸發**：第一次是JOB-272時我自己主動對全題庫跑`evaluateFile()`測量BIAS影響範圍；第二次是JOB-275時單純執行官方標準流程`generate_library_stats.js`就觸發。這代表任何未來的JOB只要呼叫這個函式（不論是直接呼叫、或透過`generate_library_stats.js`等會間接呼叫的腳本），都有意外全站寫回的風險。**強烈建議優先處理遺留問題1的腳本修正**，否則此問題會在後續每個JOB反覆出現。
- **本次清理採用「先列清單、逐一核對、才刪除」的嚴謹流程**：全部1307個候選檔案先用python腳本比對（IDENTICAL/DUP_SMALLER/DUP_LARGER/NO_COUNTERPART四種狀態），確認無誤刪風險後才執行刪除；刪除時額外用明確白名單（僅IDENTICAL/DUP_SMALLER狀態才刪除）作為防呆，而非依賴分類階段的人工判斷，避免防呆邏輯的疏漏被系統的自動防護機制正確攔截了一次（詳見對話記錄中的Auto-Mode Bypass事件）。
- **`apps/v3_eidos/public/history/`與`apps/v3_eidos/public/question/platform/`是完全不同性質的目錄**，前者是git追蹤的正式歷史版本封存（不可視為同步垃圾），後者是可從`question/platform/`來源重新產生的build鏡像。兩者都在`apps/v3_eidos/public/`底下、都有「 2」後綴檔案，若不仔細分辨容易誤判處理範圍。

## 🔍 驗收確認
| 欄位 | 內容 |
|:--|:--|
| 驗收者 | 待使用者驗收 |
| 驗收時間 | - |
| 驗收結果 | 待定 |
| 退回原因 | 無 |

## 真實回報本次對話的模型與花費
＄作業匯總：Token數: - | 花費: - | 使用模型: claude-sonnet-4-6 | 執行者: Claude
