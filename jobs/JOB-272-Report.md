*Created by Claude at 2026-07-03 00:20*

`last_updated`: 2026-07-04 01:30
`updated_by`: Claude Code (claude-sonnet-5)

# JOB-272 結案報告

**`job_type`**：`mixed`（子段A：`question_prod` 重鑄誘答；子段B：`question_verify` 雙盲重驗）
**`executor`**：Claude

## 📊 成果摘要

四下社會8課、國語10課（共18課540題）在先前作業中，「正解＝最長選項」比例誤用了`evaluate_question_quality.js`內建的G3/G4特例門檻（75%），未依`question/README_驗證與盲測準則.md` §4.6規定的正式門檻（40%）驗收。本JOB用「正解嚴格唯一最長」定義重新核算，找出272題（占18課的50.4%）需重鑄誘答選項。重鑄後對272題重新跑雙盲驗證（盲測+judge四閘），264題（97.1%）一次通過，8題落閘後用sonnet補題並重新驗證全數通過。最終18課540題「正解嚴格唯一最長」比例全數降至0%~20%，遠低於40%門檻；已寫回主檔、更新6份manifest、重新產出libraryStats.json。

依使用者指示，本JOB追加處理3項發現：①修正康軒國語L8的`meta.title`欄位標記錯誤（記為「小黑的新發現」，實際課文為「動物老師的智慧」，內容本身無誤，題庫檔與manifest同步修正）；②修正`evaluate_question_quality.js`的BIAS判定bug——原邏輯對G3/G4用75%門檻且Math/Science科目完全豁免、且「最長」判定含並列不算唯一，現已統一改為全科目全年級40%門檻、無豁免、且「唯一最長」判定為嚴格大於其餘3選項（不含並列）；③統一`question/README_出題與品管準則.md`與`question/README_驗證與盲測準則.md`兩份文件的「唯一最長」用詞（原§4.6缺「唯一」二字，已對齊§4.2）。

**過程中的意外事故（已排除，記入技術筆記）**：為測量腳本修正後對全站的影響範圍，呼叫`evaluateFile()`掃描全題庫時，意外觸發該函式既有的「每次呼叫即寫回cqi_score到來源檔案」副作用，導致本JOB範圍外約300餘個檔案（G3~G6各科）的`cqi_score`被非預期改寫。已用`git diff --name-only`精確比對出範圍外異動清單並以`git checkout --`全數還原（分兩輪，因後續一次唯讀測量時仍間接誤觸寫回，已再次核實還原），目前確認除本JOB意圖異動的18課+6manifest+2份準則文件+1個腳本檔+libraryStats.json外，`question/platform/`無任何殘留異動。

| 指標 | 數值 |
|:--|:--|
| 重鑄題數 | 272 題（18課，占540題的50.4%） |
| 補題數 | 8 題 |
| CQI-V 四閘通過率（含補題後） | 272/272 = 100% |
| 最終 avgCQI 範圍 | 8.57 ~ 9.37（腳本修正後重算）（全數 ≥6.5門檻） |
| 品質標籤 | QL4 |
| 重鑄前後BIAS比例 | 43%~63% → 0%~20%（真實40%門檻，全數通過） |

## 📋 逐課成果

| 課次 | 中文課名 | 題數 | 重鑄前BIAS% | 重鑄後BIAS% | avgCQI | Match% | 驗證模型 | 執行日期 |
|:--|:--|:--|:--|:--|:--|:--|:--|:--|
| SOC翰林L3 | 家鄉的水資源 | 30 | 50% | 0% | 9.02 | 100% | claude-sonnet-4-6 | 2026-07-02~03 |
| SOC翰林L5 | 家鄉新願景 | 30 | 50% | 20% | 8.88 | 100% | claude-sonnet-4-6 | 2026-07-02~03 |
| SOC康軒L2 | 家鄉的產業（下） | 30 | 43% | 7% | 8.96 | 100% | claude-sonnet-4-6 | 2026-07-02~03 |
| SOC康軒L6 | 家鄉風情畫（下） | 30 | 57% | 10% | 9.19 | 100% | claude-sonnet-4-6 | 2026-07-02~03 |
| SOC南一L2 | 家鄉的氣候與生活 | 30 | 50% | 10% | 9.07 | 100% | claude-sonnet-4-6 | 2026-07-02~03 |
| SOC南一L3 | 家鄉的產業與創新 | 30 | 43% | 0% | 9.26 | 100% | claude-sonnet-4-6 | 2026-07-02~03 |
| SOC南一L4 | 家鄉的人口與交通 | 30 | 50% | 0% | 9.37 | 100% | claude-sonnet-4-6 | 2026-07-02~03 |
| SOC南一L5 | 家鄉的多元文化 | 30 | 47% | 20% | 9.02 | 100% | claude-sonnet-4-6 | 2026-07-02~03 |
| CHI翰林L8 | 夢幻全壘打 | 30 | 60% | 10% | 8.82 | 100% | claude-sonnet-4-6 | 2026-07-02~03 |
| CHI翰林L9 | 單車遊日月潭 | 30 | 47% | 0% | 9.17 | 100% | claude-sonnet-4-6 | 2026-07-02~03 |
| CHI康軒L7 | 未來的模樣 | 30 | 50% | 0% | 9.26 | 100% | claude-sonnet-4-6 | 2026-07-02~03 |
| CHI康軒L8 | 動物老師的智慧（原title欄位誤記「小黑的新發現」，本JOB已修正） | 30 | 57% | 3% | 8.81 | 100% | claude-sonnet-4-6 | 2026-07-02~03 |
| CHI康軒L9 | 向太空出發 | 30 | 47% | 7% | 8.82 | 100% | claude-sonnet-4-6 | 2026-07-02~03 |
| CHI康軒L12 | 如來佛的手掌心 | 30 | 47% | 0% | 8.77 | 100% | claude-sonnet-4-6 | 2026-07-02~03 |
| CHI南一L7 | 不一樣的母親花 | 30 | 47% | 0% | 8.95 | 100% | claude-sonnet-4-6 | 2026-07-02~03 |
| CHI南一L8 | 屋頂上的野貓 | 30 | 63% | 3% | 9.03 | 100% | claude-sonnet-4-6 | 2026-07-02~03 |
| CHI南一L11 | 小事物 大驚奇 | 30 | 47% | 0% | 9.13 | 100% | claude-sonnet-4-6 | 2026-07-02~03 |
| CHI南一L12 | 九蛙傳奇 | 30 | 53% | 0% | 8.57 | 100% | claude-sonnet-4-6 | 2026-07-02~03 |

## 📂 異動清單（追加於原18課清單之後）

| 檔案路徑 | 異動類型 | 說明 |
|:--|:--|:--|
| `scripts/evaluate_question_quality.js` | 修改 | BIAS判定改用嚴格「唯一最長」（原含並列誤判）；長度門檻統一40%（原G3/G4用75%）；移除Math/Science科目豁免 |
| `question/README_出題與品管準則.md` | 修改 | 移除「待修正對齊40%」過期警告；統一「唯一最長」用詞 |
| `question/README_驗證與盲測準則.md` | 修改 | §4.6補上「唯一」二字，與§4.2一致；註明無科目豁免 |
| `question/platform/G4/Chinese/S2/KangHsuan/G4_S2_CHI_KANGHSUAN_L8.json` | 修改 | `meta.title`由「小黑的新發現」修正為「動物老師的智慧」 |
| `question/platform/G4/Chinese/S2/KangHsuan/G4_S2_CHI_KANGHSUAN_manifest.json` | 修改 | 同步修正L8的`title`欄位 |

## 📂 原18課異動清單

| 檔案路徑 | 異動類型 | 說明 |
|:--|:--|:--|
| `question/platform/G4/SocialStudies/S2/HanLin/G4_S2_SOC_HANLIN_L3.json` | 修改 | 重鑄15題誘答選項 |
| `question/platform/G4/SocialStudies/S2/HanLin/G4_S2_SOC_HANLIN_L5.json` | 修改 | 重鑄15題（含1題補題替換） |
| `question/platform/G4/SocialStudies/S2/KangHsuan/G4_S2_SOC_KANGHSUAN_L2.json` | 修改 | 重鑄13題（含1題補題替換） |
| `question/platform/G4/SocialStudies/S2/KangHsuan/G4_S2_SOC_KANGHSUAN_L6.json` | 修改 | 重鑄17題誘答選項 |
| `question/platform/G4/SocialStudies/S2/NanYi/G4_S2_SOC_NANYI_L2.json` | 修改 | 重鑄15題（含1題補題替換） |
| `question/platform/G4/SocialStudies/S2/NanYi/G4_S2_SOC_NANYI_L3.json` | 修改 | 重鑄13題誘答選項 |
| `question/platform/G4/SocialStudies/S2/NanYi/G4_S2_SOC_NANYI_L4.json` | 修改 | 重鑄15題（含2題補題替換） |
| `question/platform/G4/SocialStudies/S2/NanYi/G4_S2_SOC_NANYI_L5.json` | 修改 | 重鑄14題誘答選項 |
| `question/platform/G4/Chinese/S2/HanLin/G4_S2_CHI_HANLIN_L8.json` | 修改 | 重鑄18題誘答選項 |
| `question/platform/G4/Chinese/S2/HanLin/G4_S2_CHI_HANLIN_L9.json` | 修改 | 重鑄14題誘答選項 |
| `question/platform/G4/Chinese/S2/KangHsuan/G4_S2_CHI_KANGHSUAN_L7.json` | 修改 | 重鑄15題誘答選項 |
| `question/platform/G4/Chinese/S2/KangHsuan/G4_S2_CHI_KANGHSUAN_L8.json` | 修改 | 重鑄17題（含1題補題替換） |
| `question/platform/G4/Chinese/S2/KangHsuan/G4_S2_CHI_KANGHSUAN_L9.json` | 修改 | 重鑄14題誘答選項 |
| `question/platform/G4/Chinese/S2/KangHsuan/G4_S2_CHI_KANGHSUAN_L12.json` | 修改 | 重鑄14題誘答選項 |
| `question/platform/G4/Chinese/S2/NanYi/G4_S2_CHI_NANYI_L7.json` | 修改 | 重鑄14題誘答選項 |
| `question/platform/G4/Chinese/S2/NanYi/G4_S2_CHI_NANYI_L8.json` | 修改 | 重鑄19題（含1題補題替換） |
| `question/platform/G4/Chinese/S2/NanYi/G4_S2_CHI_NANYI_L11.json` | 修改 | 重鑄14題（含1題補題替換） |
| `question/platform/G4/Chinese/S2/NanYi/G4_S2_CHI_NANYI_L12.json` | 修改 | 重鑄16題誘答選項 |
| `question/platform/G4/SocialStudies/S2/HanLin/G4_S2_SOC_HANLIN_manifest.json` | 修改 | 更新L3/L5的avg_cqi/count/blind_tested/quality |
| `question/platform/G4/SocialStudies/S2/KangHsuan/G4_S2_SOC_KANGHSUAN_manifest.json` | 修改 | 更新L2/L6的avg_cqi/count/blind_tested/quality |
| `question/platform/G4/SocialStudies/S2/NanYi/G4_S2_SOC_NANYI_manifest.json` | 修改 | 更新L2/L3/L4/L5的avg_cqi/count/blind_tested/quality |
| `question/platform/G4/Chinese/S2/HanLin/G4_S2_CHI_HANLIN_manifest.json` | 修改 | 更新L8/L9的avg_cqi/count/blind_tested/quality |
| `question/platform/G4/Chinese/S2/KangHsuan/G4_S2_CHI_KANGHSUAN_manifest.json` | 修改 | 更新L7/L8/L9/L12的avg_cqi/count/blind_tested/quality |
| `question/platform/G4/Chinese/S2/NanYi/G4_S2_CHI_NANYI_manifest.json` | 修改 | 更新L7/L8/L11/L12的avg_cqi/count/blind_tested/quality |
| `apps/v3_eidos/public/data/libraryStats.json` | 修改 | `generate_library_stats.js`重新產出 |
| `apps/v3_eidos/src/data/libraryStats.json` | 修改 | `generate_library_stats.js`重新產出 |
| `jobs/_goal-work/JOB272/*` | 新增 | 全流程audit trail（rebalance_in/rebal_out/verify_blind/verify_shuffled/verify_result/supplements/gate_result/evaluate_results等），共18課×多檔 |

> 異動檔案共27個（不含`jobs/_goal-work/JOB272/`內部audit trail檔案，該目錄另計約90個中間檔）。

## ✅ Checklist 對照結果

### 驗收 Checklist (Acceptance)
- [x] 18課540題「正解嚴格唯一最長」比例全數≤40% — 實際值：0%~20%（詳見逐課表，python重算輸出見上）
- [x] 四閘（盲測命中/single_answer/belongs/match）通過率100% — 實際值：272/272（264題首輪通過+8題補題後全過）
- [x] `evaluate_question_quality.js` 執行0 crash — 實際值：18課全數評估成功，0 crash
- [x] `validate_review_fields.js` 本次18課540題 0 errors — 實際值：0（註：全庫掃描顯示3105 errors，均屬G3等其他年級的既有問題，與本JOB無關，已用獨立腳本單獨驗證本次18課範圍）
- [x] CQI-V Match Rate ≥ 85% — 實際值：100%（272/272）
- [x] 最終 CQI ≥ 6.5 — 實際值：8.57~9.37（腳本修正後重算，全數達標，來源`evaluateFile()`官方輸出）

### 成果 Checklist (Deliverables)
- [x] 成果表格填寫完畢（18課中文課名/真實模型/執行日期/重鑄前後BIAS百分比對照）
- [ ] 進度總表已同步（`docs/進度彙整_題庫研發與產出.md`）— 待PM執行`/pj_sync`
- [ ] 已執行 `/pj_sync` — 待PM執行
- [x] 異動清單已列出所有實際修改的檔案路徑（含manifest與libraryStats）

## 🔄 同步確認
- [ ] `docs/進度彙整_題庫研發與產出.md` 已更新（待`/pj_sync`）
- [ ] `docs/README_專案發展紀錄.md` 已觸發 /pj_sync（待PM執行）
- [x] `apps/v3_eidos/src/data/libraryStats.json` 已重新產出（`node scripts/generate_library_stats.js`，輸出19 active subjects）

## ⚠️ 遺留問題

1. ~~康軒國語L8 `meta.title`欄位標記錯誤~~ **已修正**：`meta.title`與manifest的`title`皆由「小黑的新發現」改為「動物老師的智慧」，與KL4研究檔案及題目實際內容一致。
2. ~~`scripts/evaluate_question_quality.js`的BIAS長度門檻bug~~ **已修正**：全科目全年級統一40%門檻，移除Math/Science豁免，`isLongestAnswer`改為嚴格「唯一最長」判定。
3. ~~準則文件用詞不一致~~ **已修正**：`README_驗證與盲測準則.md` §4.6與`README_出題與品管準則.md`均統一為「唯一最長」，與§4.2一致。
4. **【新發現，本JOB範圍外，未處理】腳本修正後，全站另有94/671課（14.0%）超過真實40%門檻**：橫跨G3_CHI(6)、G3_ENG(1)、G3_SOC(1)、G4_CHI(21)、G4_SCI(11)、G5_CHI(22)、G5_SOC(14)、G6_CHI(15)、G6_SCI(1)、G6_SOC(2)。此為腳本修正後用唯讀方式測量之全站現況，**未做任何修改**，規模遠大於本JOB的18課，需要另立JOB規劃分批處理（建議依科目/年級分批，比照本JOB的重鑄+重驗流程）。
5. **四下國語尚有21課／630題**（翰林L1-6、康軒L1-6+L10+L11、南一L1-6+L9）因文本錯位問題需全文本重建，本JOB範圍不含，需另案處理。
6. **四下社會18課、國語15課（本次18課的母體批次）尚未push到遠端**，仍在本地commit/待commit狀態，需等後續批次全部確認後依使用者先前決定一併push。

## 🔧 技術筆記

- **BIAS判定的兩種讀法差異**：「唯一最長」（正解嚴格大於其餘3項）vs「含並列最長」（正解等於其餘最大值即算）。用含並列讀法計算時，社會18課有14課超標、國語15課有11課超標；改用較嚴格的唯一最長讀法後，只有社會8課、國語10課超標（本JOB範圍）。兩讀法方向一致（都指向系統性問題），但具體課數與題數不同，執行前務必先確認要用哪個定義，避免重工或漏工。
- **重鑄流程**：只改寫誘答（錯誤）選項文字加長，不動`answer_index`與正解語意，允許對過長正解做同義精簡。272題重鑄後answer_index比對結果為0題被誤改，confirmed。
- **agent串流中斷（Response stalled mid-stream）**：本次3次workflow呼叫中各遇到1次單一agent串流中斷（重鑄階段翰林L8、重驗階段南一社會L2盲測），均用同prompt單獨重跑後成功，未見規律性，研判為偶發網路/串流問題非prompt設計缺陷。
- **KL4檔名與meta.title不一致**：除康軒國語L8外，另有4課檔名格式差異（社會康軒L2/L6用「下」而非「（下）」全形括號；國語南一L11用「小事物大驚奇」無空格），已在prompt中用`fileTitle`欄位個別覆蓋處理，未修改原始檔名（超出範圍）。
- **⚠️`evaluate_question_quality.js`的`evaluateFile()`有寫回副作用，務必留意**：此函式每次呼叫都會把重算的`cqi_score`（及其他`content`物件內欄位）用`fs.writeFileSync`寫回原始JSON檔案（第326行），並非唯讀查詢函式。本次為測量腳本修正後的全站BIAS影響範圍，直接在迴圈中呼叫`evaluateFile()`掃描全題庫，導致本JOB範圍外約300餘個檔案的`cqi_score`被非預期改寫，需額外用`git diff --name-only`比對+`git checkout --`分兩輪還原才排除乾淨。**後續若只是要「查詢/測量」而非「確認並落地」某課的CQI，務必改用純讀檔＋手動套用`evaluateQuestion()`邏輯（或直接讀JSON算length比較），不要在全庫迴圈中呼叫`evaluateFile()`**；只有明確要把recompute結果寫回特定課次時才可呼叫它，且應先用`git status`鎖定只有目標檔案被觸及。建議另開`engineering`小JOB幫`evaluateFile()`加一個`{dryRun:true}`選項，從根本避免此陷阱重演。

## 🔍 驗收確認
| 欄位 | 內容 |
|:--|:--|
| 驗收者 | 待使用者驗收 |
| 驗收時間 | - |
| 驗收結果 | 待定 |
| 退回原因 | 無 |

## ⏱️ 執行時間回報

| 子任務 / 階段 | 開始時間 | 結束時間 | 耗時（分鐘） | 備註 |
|:--|:--|:--|:--|:--|
| 重鑄272題（含1次retry） | 2026-07-02 | 2026-07-02 | ~31 | wf1約24分+retry約7分 |
| 雙盲重驗（含1次retry） | 2026-07-02 | 2026-07-02 | ~31 | wf約25分+retry約6分 |
| 補題生成 | 2026-07-02 | 2026-07-02 | ~7 | 8題並行 |
| 補題驗證 | 2026-07-02 | 2026-07-02 | ~1.5 | 16 agent並行 |
| merge+manifest+libraryStats | 2026-07-03 | 2026-07-03 | ~5 | 人工腳本執行 |
| 最終驗收+Report撰寫 | 2026-07-03 | 2026-07-03 | ~10 | - |
| **總計** | 2026-07-02 | 2026-07-03 | **約86分鐘** | 時間來源：各Workflow回報之`duration_ms`加總換算 |

## 真實回報本次對話的模型與花費
＄作業匯總：Token數:4,489,764（6次Workflow呼叫`subagent_tokens`加總，來源各task-notification的`usage.subagent_tokens`） | 花費: -（Claude Code session額度內執行，非按token計費之外部API，無對應台幣換算） | 使用模型: claude-sonnet-4-6 | 執行者: Claude
