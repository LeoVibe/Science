*Created by Claude at 2026-07-18*

`last_updated`: 2026-07-18
`updated_by`: Claude Code (claude-fable-5)

# JOB-277 結案報告

**`job_type`**：`mixed`（子段A：`question_prod` 誘答選項重鑄；子段B：`question_verify` 雙盲驗證）
**`executor`**：Claude（主迴圈編排＋subagent 執行）

## 📊 成果摘要

四下（G4S2）自然 8 課＋國語 4 課共 12 課 360 題，開單時「正解嚴格唯一最長」比例 43.3%~76.7%（超過 40% 硬門檻）卻仍上架中。本 JOB 依 JOB-272 已驗證方法重鑄 225 題誘答選項（只加長誘答、不動 answer_index 與正解語意），重鑄後 12 課 BIAS 全數降至 **0.0%**。

雙盲驗證採 JOB-276 確立的官方標準：第一輪盲測 **225/225 = 100% Match Rate**（每課皆 100%，門檻 85%）；judge belongs/single_correct 覆核揪出 4 題**重鑄前即存在**的內容缺陷（翰林L11 一題正解與課文情節矛盾、翰林L12 三題近似重複的拔河通用常識題），依派工單步驟 5 以 JOB-273 補題方法修正（依賴課文具體情節重寫），第二輪盲測 4/4 Match、judge 全過且去重確認。

12 檔 CQI 重算全數 QL4、avgCQI 8.43~9.36（全 ≥6.5 門檻）、0 crash；4 份 manifest 的 avg_cqi 同步更新；libraryStats.json 重產（`evaluateFile()` 寫回副作用第 4 次觸發，267 個範圍外檔案已用 git checkout 精確還原）；public 鏡像已同步。

| 指標 | 數值 |
|:--|:--|
| 重鑄題數 | 225 題（12 課，佔 360 題的 62.5%） |
| 補題修正 | 4 題（judge 揪出之既有缺陷，非重鑄造成） |
| 第一輪盲測 Match Rate | 225/225 = 100%（每課 100%，官方門檻 85%） |
| 第二輪盲測（修正 4 題） | 4/4 = 100% |
| judge belongs / single_correct | 第一輪 221/225 過 → 修正後全過 |
| 重鑄前後 BIAS | 43.3%~76.7% → **全數 0.0%**（門檻 40%） |
| avgCQI | 8.43~9.36（全 ≥6.5） |
| 品質標籤 | QL4（12 課維持） |

## 📋 逐課成果

| 課次 | 中文課名 | 題數 | 重鑄題數 | 重鑄前BIAS% | 重鑄後BIAS% | avgCQI | Match% | 執行日期 |
|:--|:--|:--|:--|:--|:--|:--|:--|:--|
| SCI翰林L1 | 生活中的力 | 30 | 15 | 50.0% | 0.0% | 9.31 | 100% | 2026-07-18 |
| SCI翰林L3 | 變動的大地 | 30 | 15 | 50.0% | 0.0% | 9.36 | 100% | 2026-07-18 |
| SCI康軒L1 | 白天和夜晚的天空 | 30 | 15 | 50.0% | 0.0% | 9.07 | 100% | 2026-07-18 |
| SCI康軒L2 | 水的移動 | 30 | 13 | 43.3% | 0.0% | 9.07 | 100% | 2026-07-18 |
| SCI南一L1 | 昆蟲的一生 | 30 | 22 | 73.3% | 0.0% | 8.60 | 100% | 2026-07-18 |
| SCI南一L2 | 神奇的電力 | 30 | 23 | 76.7% | 0.0% | 8.47 | 100% | 2026-07-18 |
| SCI南一L3 | 水的移動 | 30 | 20 | 66.7% | 0.0% | 8.65 | 100% | 2026-07-18 |
| SCI南一L4 | 星空 | 30 | 22 | 73.3% | 0.0% | 8.43 | 100% | 2026-07-18 |
| CHI翰林L7 | 棒球英雄夢 | 30 | 15 | 50.0% | 0.0% | 9.18 | 100% | 2026-07-18 |
| CHI翰林L11 | 最後一片葉子 | 30 | 23 | 76.7% | 0.0% | 8.86 | 100%（含1題補題修正二輪通過） | 2026-07-18 |
| CHI翰林L12 | 閱讀課 | 30 | 20 | 66.7% | 0.0% | 9.26 | 100%（含3題補題修正二輪通過） | 2026-07-18 |
| CHI南一L10 | 想像與發明 | 30 | 22 | 73.3% | 0.0% | 9.14 | 100% | 2026-07-18 |

## 🔧 補題修正明細（4 題，皆為重鑄前既有缺陷）

1. **翰林L11 questions[27]**：原正解「蘇西知道葉子是老畫家的傑作」與課文矛盾（課文中老畫家暗自行動、蘇西事後才知真相）。重寫為「經過整晚風雨葉子仍在藤上，喬安有希望了」，並修正 explanation。
2. **翰林L12 questions[10]/[17]/[23]**：三題近似重複，正解皆為拔河通用常識（不需讀課文即可作答）。分別重寫為三個不同角度的課文情節題：甲仙風災後重生的隱喻、經費短缺下以牆代拔河機的苦練條件、亞軍眼淚與榮耀家鄉的心願。

## 📂 異動清單

| 檔案路徑 | 異動類型 | 說明 |
|:--|:--|:--|
| `question/platform/G4/Science/S2/HanLin/G4_S2_SCI_HANLIN_L1.json`／`L3.json` | 修改 | 各重鑄 15 題誘答＋review 欄位＋cqi_score |
| `question/platform/G4/Science/S2/KangHsuan/G4_S2_SCI_KANGHSUAN_L1.json`／`L2.json` | 修改 | 重鑄 15／13 題誘答＋review 欄位＋cqi_score |
| `question/platform/G4/Science/S2/NanYi/G4_S2_SCI_NANYI_L1~L4.json` | 修改 | 重鑄 22/23/20/22 題誘答＋review 欄位＋cqi_score |
| `question/platform/G4/Chinese/S2/HanLin/G4_S2_CHI_HANLIN_L7.json` | 修改 | 重鑄 15 題（含1題正解同義精簡） |
| `question/platform/G4/Chinese/S2/HanLin/G4_S2_CHI_HANLIN_L11.json` | 修改 | 重鑄 23 題＋questions[27] 補題修正 |
| `question/platform/G4/Chinese/S2/HanLin/G4_S2_CHI_HANLIN_L12.json` | 修改 | 重鑄 20 題＋questions[10]/[17]/[23] 補題修正 |
| `question/platform/G4/Chinese/S2/NanYi/G4_S2_CHI_NANYI_L10.json` | 修改 | 重鑄 22 題（含2題正解同義精簡） |
| 4 份 manifest（SCI 翰林/康軒/南一、CHI 翰林） | 修改 | 對應課次 avg_cqi 更新（CHI 南一 manifest avg_cqi 9.14 不變故無 diff） |
| `apps/v3_eidos/public/data/libraryStats.json`、`src/data/libraryStats.json` | 重產 | `generate_library_stats.js`（19 active subjects） |
| `apps/v3_eidos/public/question/platform/`（對應 12 檔＋manifest） | 同步 | `sync_v3_public_questions.mjs`（清除57目錄/複製393 JSON/建立57 manifest） |
| `jobs/_goal-work/JOB277/*` | 新增 | 全流程 audit trail（targets 12／recast 12＋fix 2／blind+key 13 組／answers 13／judge 13／腳本 5） |

## ✅ Checklist 對照結果

### 驗收 Checklist (Acceptance)
- [x] 12 課 BIAS 全數 ≤40% — 實際值：**全數 0.0%**（重鑄前 43.3%~76.7%，逐課對照見上表；PM 以唯讀腳本獨立重算，非採信 subagent 自報）
- [x] 12 課雙盲驗證 Match Rate ≥85% — 實際值：第一輪 225/225=100%（每課 100%）；修正 4 題後第二輪 4/4=100%
- [x] `evaluate_question_quality.js` 12 檔執行 0 crash — 實際值：12/12 成功輸出，quality 全 QL4
- [x] `git diff --name-only -- question/platform/` 無非預期異動 — 實際值：恰為 12 題庫檔＋4 manifest；`generate_library_stats.js` 副作用波及的 267 個範圍外檔案已全數 `git checkout --` 還原（還原後複驗異動清單）
- [x] 最終 CQI ≥6.5 — 實際值：8.43~9.36（evaluateFile 官方輸出）
- [x] 內容含 scenario+explanation 欄位 — 實際值：12 檔 360 題缺欄數 0（python 實掃）

### 成果 Checklist (Deliverables)
- [x] 成果表格填寫完畢（12 課名稱/修正前後BIAS%/Match Rate/avgCQI/執行日期）
- [x] 進度總表已同步（`docs/進度彙整_題庫研發與產出.md` 四下自然/國語行）
- [x] 已執行 `/pj_sync`
- [x] 產出 JOB-277-Report.md，異動清單已列出所有實際修改的檔案路徑

## ⚠️ 遺留問題

1. **南一自然 L1《昆蟲的一生》存在 12 題高度重複題組**（「身體分頭胸腹」×4、「不屬於昆蟲」×4、「跳蚤無翅」×4，重鑄 agent 發現）。題目本身正確且通過盲測，但同課重複度過高影響練習體驗，需另案處理（題目多樣化重出）。
2. **`evaluateFile()` 無條件寫回副作用第 4 次觸發**（JOB-272/275/276/本次）：執行 `generate_library_stats.js` 再次改寫 267 個範圍外檔案的 cqi_score，本次已還原。修 `{dryRun}` 選項的 engineering JOB 仍未開，強烈建議儘速處理。
3. **執行模型偏離開單記載**：派工單啟動 Checklist 記載執行模型為 sonnet（claude-sonnet-4-6），實際本次 session 模型為 claude-fable-5（Claude Code session 內建，同屬訂閱制無單次計費）。據實記載於此。
4. 本 JOB 依邊界**未 push**；12 檔＋manifest＋libraryStats＋鏡像之 commit 待使用者核准 commit 訊息後執行。

## 🔧 技術筆記

- 重鑄與驗證全程使用唯讀 python 腳本計算 BIAS（`jobs/_goal-work/JOB277/` 內 prep_targets/bias 檢查），僅在「確認落地」階段對 12 個目標檔呼叫 `evaluateFile()`，成功避開全站寫回陷阱；但 `generate_library_stats.js` 的間接呼叫仍不可避免，副作用照 SOP 用 `git diff --name-only` 比對＋`git checkout --` 還原。
- 盲測隔離設計：盲測 agent 只拿得到「洗牌後選項＋題幹」的獨立 blind 檔（固定 seed 洗牌、答案存另一 key 檔），指令明文禁讀題庫檔與 knowledge/；判分由 PM 腳本對 key 執行，非 agent 自報。
- judge 覆核的價值在本次再度驗證：盲測 100% Match 的題目中仍揪出 4 題內容缺陷（盲測者答對 ≠ 題目正確——L11 qid27 盲測者靠排除法答對，但正解本身與課文矛盾）。Match Rate 主判準＋belongs/faithful 過濾器的雙閘設計（JOB-276 方法論）應維持。

## 🔍 驗收確認
| 欄位 | 內容 |
|:--|:--|
| 驗收者 | Claude Code（PM）＋待使用者驗收 |
| 驗收時間 | 2026-07-18 |
| 驗收結果 | 通過（佐證：PM 唯讀腳本獨立重算 12 課 BIAS 全 0.0%；360 題與 git HEAD 逐題比對 answer_index/題幹/非目標題零異動；盲測判分由 PM 腳本對 key 執行 225/225＋4/4） |
| 退回原因 | 無 |

## ⏱️ 執行時間回報

| 子任務 / 階段 | 耗時 | 備註 |
|:--|:--|:--|
| 前置查核＋目標清單（225 題） | ~5 分 | PM 唯讀腳本 |
| 重鑄 12 課（12 subagent 並行） | ~8 分（牆鐘） | 單課 3.7~7.8 分 |
| 第一輪盲測 12＋judge 12（並行） | ~8 分（牆鐘） | — |
| 補題修正 2 agent＋第二輪盲測/judge | ~9 分（牆鐘） | — |
| 欄位/CQI/manifest/libraryStats/鏡像＋還原副作用 | ~6 分 | — |
| Report＋結案 | ~5 分 | — |

## 真實回報本次對話的模型與花費
＄作業匯總：Token數:2,744,161（30 個 subagent 之 subagent_tokens 加總；主迴圈 token 無法取得填 -） | 花費: -（Claude Code session 訂閱額度內，無單次計費） | 使用模型: claude-fable-5 | 執行者: Claude
