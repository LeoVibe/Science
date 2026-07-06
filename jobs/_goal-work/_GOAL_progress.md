# GOAL：三下國自社完整驗證+正式上版（2026-06-17 自主執行）

## 已驗證(無需處理)
- 國語翰林(sonnet06-16)、國語南一(sonnet06-14)、自然三版(opus06-14)、社會翰林(JOB-270)

## 待處理 3 版本
1. [進行中] 社會康軒：6課300題_new → JOB-270馬車
2. [待] 社會南一：5課250題_new → JOB-270馬車
3. [待] 國語康軒：無_new，92錯位題已下架 → codex重出+校正

## 馬車SOP：打散→盲讀版→盲測+對應judge→過閘→codex補→補題盲測→升QL4→主檔→manifest→commit
## 模型：codex gpt-5.5出題 / sonnet盲測+judge / opus PM

## 執行進度（2026-06-17）
### 社會康軒（馬車跑完盲測+judge）
- 過閘 263/300，缺額 L1:3/L2:5/L3:6/L4:8/L5:6/L6:9（共37）→ codex補題中
- 對應率 41-48，無整課跑題，品質良好
### 社會南一（馬車跑完盲測+judge）
- 過閘 203/250，缺額 L1:3/L2:6/L3:7/L4:3/L5:28（共47）
- L5《打造幸福的家園》對應僅24/50（跑題一半），補28題
- 素材就緒待 codex 補題
### 國語康軒（待處理，第3版）
- 錯位集中 L1(上架19/錯位31)、L2(30/32)、L3(30/29)；L4-L12 正常(上架25-30/錯位0)
- L1 上架19<25門檻，必須重出補題
- 課文素材 knowledge/國語/三下/康軒 齊備
- 計畫：L1/L2/L3 codex按課文重出錯位題 → 盲測+課文錨點judge → 上架

## ✅ 社會三版本全部上架完成（2026-06-17）
- 翰林 300題QL4（JOB-270, commit 9d78921c）
- 康軒 300題QL4 + 南一 250題QL4（commit d12e4a2b）
- 三版本共 850題，雙盲馬車驗證，已部署

## 🔄 國語康軒（最後一塊，進行中）
- L1《許願》/L2《下雨的時候》/L3《遇見美如奶奶》文本錯位 → codex重出各35題（扣KL4課文全文，防錯位）
- codex重出背景中（b1v0kz026）
- 接續：codex出題完成 → sonnet盲測 + 課文錨點judge（題目是否扣本課課文）→ 升QL4取代主檔 → 上架
- L4-L12 為Gemini舊驗證、無錯位、已上架25-30題，本次不動（風險點僅L1/L2/L3）

## 上版文字待確認事項（晨間回報用戶）
- 第4點「QL3標BETA」：三下全QL4無QL3題，此條無對應（除非指四下）
- 日期寫6/14（用戶指定）

## 🔄 四下驗證（2026-06-17 啟動，跨session大工程）
### 素材狀態（實查audit）
- 四下社會 翰/康/南 6課：RM3素材足 ✓
- 四下自然 翰/康/南 4課：RM3素材足 ✓
- 四下國語 12課×3：**audit顯示無KL4考古素材**（但knowledge/國語/四下/有翰康南目錄+KL3總綱+KL4原始素材庫，需確認課文錨點素材）
- 四下全科均 Gemini-Lite 2026-04 舊驗證，無_new草稿（驗證對象=現有主檔題）

### 執行方法（驗證現有主檔題，不污染正式檔）
打散主檔題「副本」→盲測+對應judge→過閘題升sonnet驗證寫回主檔→缺額codex補→補題盲測→升QL4

### 四下自然翰林 pilot（已完成盲測+judge）
- 過閘 84/120：L1=19(缺11)/L2=24(缺6)/L3=19(缺11)/L4=22(缺8)，缺36
- 盲測Match L1=21/L2=28/L3=23/L4=26（Gemini舊題過閘率約70%）
- 打散副本在 jobs/_goal-work/G4_SCI_HanLin/，主檔未動
- **待續**：codex補36題→補題盲測→升QL4寫回主檔→自然康軒南一8課→社會18課→國語36課

### 四下執行順序建議
自然(12課,最小,翰林已pilot) → 社會(18課,素材足) → 國語(36課,需先確認課文素材)

## 四下自然 盲測+judge 完成（2026-06-17，待補題升級）
### 過閘結果（打散副本驗證，主檔未動）
- 翰林：過閘84/120，缺36（L1:11/L2:6/L3:11/L4:8）→ codex補題進行中（bnw97wkyl，L1/L2已完成）
- 康軒：過閘55/120，缺65（L1:16/L2:14/L3:15/L4:20）→ 舊Gemini題跑題重，尤其L4僅12對應
- 南一：過閘82/120，缺~10（L1:4/L2:4/L3:0/L4:格式待修，agent回報對應28/不對應2）

### ⚠️ 已知技術問題（接續時處理）
1. 部分sonnet agent寫result用了非標準欄位（answer而非answer_index、matched而非match）→ 整合需相容（已寫相容版gA/gM）
2. 南一L4 judge_result用了 meta/keypoints/judgments 結構（非results陣列）→ 需重跑或手動適配
3. 四下自然各版本KL4課名不同（康軒L1天空/南一L1昆蟲），版本間單元安排差異大

### 接續步驟（四下自然）
1. 等翰林codex補36題完成（背景bnw97wkyl）
2. codex補康軒65題、南一~10題（task素材需生成，同三下方法）
3. 三版本補題盲測 → 過閘題升sonnet驗證寫回主檔 → manifest/libraryStats → commit
4. 接著四下社會18課、四下國語36課（國語需先確認課文錨點素材）

### 工作量提醒
四下自然補題量大（翰36+康65+南10=111題），康軒舊題品質低需大量重出。四下社會/國語尚未開始。

## ✅ 四下自然翰林 端到端完成（2026-06-19，本地commit待push）
- 補題盲測 32/36→修正L2範疇描述後 36/36 全過閘（盲測員誤殺虹吸/連通管/靜止液面題，原因是PM給的單元範疇描述漏列，已修正重跑）
- 各課30題：L1=原19+補11 / L2=原24+補6 / L3=原19+補11 / L4=原22+補8
- 全部sonnet雙盲過閘（盲測答對+single_answer+belongs+考點對應四閘）
- 寫回主檔用被盲測的shuffled版（答案對齊不變式，抽8題對讀options[answer_index]vs解析全一致）
- 答案重新打散破壞idx%4；manifest avg_cqi據實重算9.3→8.08（真實cqi非舊估值）
- 四下自然翰林4課獨立驗證 0 errors
- **commit策略**：本地commit不push，等康軒南一好三版自然一起push部署（仿三下先例）

### 接續：康軒（補70）→ 南一（補10）→ 三版自然一起push

## 🔄 四下自然康軒+南一（2026-06-19 統一四閘重算，codex補題中）
### 修正欄位不一致後重算（統一四閘：答對+single_answer+belongs+對應）
- 康軒 L2/L3/L4 舊盲測缺 single_answer → 已重跑盲測補齊（agent標準四欄）
- 南一 L4 judge 是 judgments/verdict 結構 → 寫 verdict==="對應" 適配器（不重跑）
- 過閘清單存於各課 L{n}_passIdx.json，_gaps.json 已更新
### 精確缺額
- 康軒：過閘50/120 缺70（L1:16/L2:18/L3:16/L4:20）單元:白天夜晚天空/水的移動/昆蟲家族/自然資源
- 南一：過閘110/120 缺10（L1:4/L2:4/L3:0/L4:2）單元:昆蟲一生/神奇電力/水的移動/星空
### codex補題中（2026-06-19）
- 康軒 codex b3o689yag（補70題，log: scripts/orchestrator-logs/G4_SCI_KangHsuan-codex.log）
- 南一 codex bxto9lcg6（補10題，log: G4_SCI_NanYi-codex.log）
### 補題素材已生成：各課 L{n}_kaodian.json/template.json/task.md（kaodian從judge內嵌提取）
### 接續：codex補完→補題盲測（同翰林四閘）→merge升QL4寫回主檔→三版自然一起push
### ⚠️ 寫回不變式（翰林已驗證）：原題從shuffled[passIdx]取、補題從sup_shuffled取、review_status用"confirmed"、is_publishable=true需review_date

## ✅✅✅ 四下自然三版全部完成（2026-06-19）
- **翰林 ✅ commit 02c56c5e**（30×4，avg_cqi 8.08）
- **南一 ✅ commit a3e198e1**（30×4，avg_cqi 7.36/7.11/7.45/7.2，補10題全過閘）
- **康軒 ✅ commit 9890ccbf**（30×4，avg_cqi 7.73-8.01；原題過閘L1=14/L2=12/L3=14/L4=10 + codex補16/18/16/20全過閘）
### 驗證佐證（2026-06-19 實查）
- 康軒主檔 G4_S2_SCI_KANGHSUAN_L1~L4 各 30 題 = 120 題 ✓
- 全庫 validate_review_fields 3075 errors 中無一筆屬四下自然康軒/翰林/南一（即三版自然 0 欄位錯誤）
- 三版皆 sonnet 雙盲四閘（盲測答對+single_answer+belongs+考點對應）過閘
### ⏸ push 狀態：本地領先 origin/main 3 筆（02c56c5e/a3e198e1/9890ccbf），**尚未 push**
- 仿三下先例「三版自然一起push部署」→ push 為對外部署動作，待用戶許可後執行
- 注意：push 大包需 http.postBuffer 已設 500MB（見 memory git_push_postbuffer）
### 三版push後待辦：四下社會18課、四下國語36課（國語需先確認課文錨點素材）

## 🔄 四下社會+國語 啟動前素材調查（2026-06-19 實查）
### 國語課文錨點素材 ✅ 齊備（推翻舊 audit「無 KL4 素材」判斷）
- 三版（翰/康/南）× 12 課 = 36 課，單課研究紀錄均含「課文全文錄製 RC-01」
- 路徑：knowledge/1_課綱研究/國語/四下/{翰林|康軒|南一}/KL4_*_單課研究紀錄.md
- → 國語 judge 用「課文錨點」(judge prompt 須塞入 RC-01 課文全文)，異於自然/社會的「考點對應」
### 社會 18課主檔 ✅ 齊全，屬 Gemini 舊驗證（同四下自然起點）
- 各課30題，blind_evaluation=true / review_status=confirmed / review_date 2026-04-11 / authoring_model Gemini-2.5-Pro
- 需 sonnet 雙盲馬車重驗（四閘）
### _new 檔 = 主檔重複（已完整比對，非抽1筆）
- 翰林L1/L4/L6、康軒L5 共4個 _new：各 30/30 題幹與主檔相同、metadata 一致 → 忽略，驗主檔
### 啟動方針（advisor 壓測後）
- 批次單位=科目×版本；順序 社會6課×3 → 國語12課×3
- pilot：社會翰林6課先端到端，確認節奏再放大
- 沿用自然踩過的雷：欄位一致(answer_index/match)、judge結構相容(results vs judgments/verdict)、寫回不變式(原題shuffled[passIdx]/補題sup_shuffled/review_status=confirmed/is_publishable需review_date)
- 驗0errors用scoped(grep本批檔名)；自然3版push仍懸置待用戶決定

## 🔄 四下社會18課雙盲驗證 進行中（2026-06-20）
- 用戶決策：社會三版18課一起開；自然3版等社會國語全好一起push
- 打散副本已建：jobs/_goal-work/G4_SOC_{HanLin|KangHsuan|NanYi}/L{n}_shuffled+blind.json（driver: shuffle_soc.py, seed 20260620）
- 南一L6既有28題（非30），其餘各課30題，共538題
- workflow soc_verify_wf.js 跑18課×(盲測員+judge)=36 sonnet agent（背景 w7olch8jb / wf_0fe845dd-d6d）
- 四閘=盲測答對+single_answer+belongs+match；過閘計算腳本 gate_soc.py 已備
- 接續：workflow完成→跑gate_soc.py算過閘+缺額→codex補→補題盲測→寫回升QL4→manifest
- 素材路徑表 soc_kl4_paths.json / 課清單 soc_lessons.json

### 首輪雙盲過閘結果（2026-06-20，gate_soc.py）
- 翰林 175/180 缺5 | 康軒 158/180 缺22 | 南一 176/178 缺4（社會主檔品質遠高於四下自然）
- 各課passIdx已存 L{n}_passIdx.json，_gaps.json已更新

### ⚖️ judge標準不一致已抓出並校正重判（重要）
- 康軒L6《家鄉風情畫(下)》20題被判belongs=false，異常聚集→查根因
- 根因：judge對L6獨家用「考古題樣本」當範疇（L6考古題全是生態保育:陸蟹/老鷹紅豆/淨灘），把多元文化題判不屬
- 但①單課研究紀錄明定L6核心=多元文化尊重融合(課綱碼Bc-II-2/2b-II-2) ②準則§183/185/170:對應錨點=課文/考古題/課綱元素三者**對等**,任一即算對應 ③同batch的L5用單課紀錄當範疇全過(節慶民俗),標準不一致
- 結論:L6 belongs=false 是judge用錯標準(考古題樣本≠課程範疇),非題目真跑題
- 處置:6課28題(belongs/match=false者)用校正準則重判→workflow w6hdjd7uq/wf_aa8cba51-6ee
  - 校正標準:三素材錨點對等,不得因考古題樣本未涵蓋判不屬;match查正解正確/無事實錯誤/非格式崩壞
- ⚠️教訓:judge prompt未明示「三錨點對等」會讓sonnet自行偏向考古題樣本→後續國語judge須在prompt寫死此原則

### 校正重判結果→真實缺額（2026-06-20，gate_soc_merge.py）
- 重判救回:翰林L2 idx20/L4 idx0、康軒L6全20題、南一L1 idx19
- 真實壞題:翰林L2 idx0(致富效益超範疇)+idx2(格式崩壞)、L4 idx1(高速公路錯置L3)、康軒L2 idx0(原住民祭典不屬產業課)、L3 idx9(格式崩壞)、L6 idx16(盲測落閘)、南一L2 idx29
- **真實缺額共9題**(假缺額31→真9):翰林3(L2:2/L4:1)、康軒3(L2/L3/L6各1)、南一3(L2:1/L6:2題數補足)
- 各課passIdx已用重判覆寫重算;南一L6本就28題需補2到30
- 重判結果存 soc_rejudge_result.json

## ✅✅✅ 四下社會18課端到端完成（2026-06-20，本地待push）
- codex補9題:首批7課並行(set--分詞bug致4課空跑,已修)→補齊;改每課獨立codex呼叫(reasoning high)成功
- 補題雙盲(w0av1cjfr,judge寫死三錨點對等):9/9全過四閘
- 寫回主檔:18課各30題=540題,寫回用被盲測shuffled版;答案對齊不變式抽3課12題對讀全一致;答案分布健康破壞idx%4
- 全部confirmed/QL4/is_publishable=true/review_date 2026-06-20/verifying_model claude-sonnet-4-6
- manifest avg_cqi據實重算:翰林7.72-8.31/康軒8.05-8.45/南一8.21-8.62
- libraryStats重生成(public+src):三版177/175/175→各180 published QL4
- 四下社會 0 欄位錯誤(scoped驗證,3075全庫錯誤無一筆屬四下社會)
### 關鍵教訓沉澱
- codex exec一次塞多課會「先全讀素材再寫」耗盡turn→須每課獨立呼叫或強制讀完即寫
- judge prompt未明示三錨點對等→sonnet偏向考古題樣本誤判(康軒L6冤殺20題);prompt寫死後正常
### ⚠️ 提交前官方腳本(evaluate_question_quality.js)抓到BIAS,commit暫停(2026-06-20)
- 5課判QL1(BIAS)「選項長度偏差過大」:翰林L1(26/30=87%)/L4(29/30=97%)/L6(25/30=83%)、康軒L5(25/30=83%)、南一L6(26/30=87%)
- 根因:Gemini原題正解冗長、誘答簡短→「正解=最長選項」>75%門檻,學生可憑選最長猜對
- 對比:四下自然0 BIAS(過閘率低、codex補多數題已均衡);社會過閘率高、保留多數Gemini原題→偏差存活
- BIAS為上架硬門檻(出題準則§40),不能誠實蓋QL4 publishable
- 教訓:自建四閘pipeline無BIAS檢查,須在寫回前跑官方evaluate_question_quality.js(§四強制,我原漏跑,advisor抓出)
- ⚠️另:9補題cqi_score是codex自編(template無此欄),manifest avg_cqi含此9筆編造值,待用官方CQI-P重算或標註
- 用戶裁定:A=codex重鑄5課誘答長度+重驗
- ⚠️codex額度用盡(usage limit,7/1才重置;先前policy錯誤是表象)→用戶改裁:改用sonnet重鑄(不等codex)
- 5課重鑄輸入已備 L{n}_rebalance_in.json(含correct_is_longest標記);sonnet重鑄workflow wsdic3l6c執行中
- 重鑄規則:只調誘答長度使正解非最長,不改answer_index/正解語意,不讓誘答變正確
- 接續:重鑄→驗BIAS<75%→重新盲測+judge(確認改寫沒破壞正解唯一性)→寫回→重算manifest→commit

### sonnet重鑄完成(2026-06-22,分2批)
- 批1 wsdic3l6c:翰林L1/L4/L6成功;康軒L5+南一L6因輸出超32000token失敗
- 批2 wywx7v6tf:康軒L5+南一L6改精簡schema(去explanation)成功
- 5課BIAS全改善:正解最長0%/7%/0%/47%/10%(全<75%)
- ✅關鍵:5課answer_index 30/30保持、正解文字30/30原樣未動→sonnet只改寫誘答、零碰正解
- 合併重鑄選項進候選+打散→L{n}_rebal_shuffled/blind.json
- 重新盲測+judge驗證中 w4ftj2vj0(single_answer閘把關改寫誘答是否變第二正解)
- 接續:過閘→寫回5課主檔→重算manifest+libraryStats→修9補題cqi→驗BIAS零→commit

## ✅✅✅ 四下社會18課全部完成,0 BIAS,待commit(2026-06-22)
- 5課重鑄後重新盲測+judge:全5課30/30過四閘(改寫誘答未破壞single_answer)
- 寫回5課重鑄版→全18課BIAS複查=0(QL4:18課/BIAS:0)
- cqi誠實性修正:9補題codex自編cqi已用官方公式重算;全540題cqi_score重算;manifest avg_cqi取evaluateFile官方值(自算公式與官方0誤差驗證)
- 重鑄課cqi反升(正解非最長→選項對稱+2.0):翰林L1 9.19/L4 9.08/L6 9.37/康軒L5 8.65/南一L6 9.4
- libraryStats重生成;四下社會0欄位錯誤;format驗證✓
### ⚠️_new檔發現(session初期判斷錯誤)
- 4個_new(翰林L1/L4/L6、康軒L5)來自前session commit ef3acc14「四下社會4課BIAS平衡修復(_new暫存待上架)」=前session早做過同樣BIAS修復
- session初期我比對_new只比題幹(30/30同)就判「重複檔忽略」→漏看選項已被前session修復(BIAS改的是選項非題幹)
- 結果無害:我獨立sonnet重鑄得到同樣修復且已驗證30/30,南一L6無_new只有我修
- _new為orphan(manifest不引用)、被我已驗證主檔取代→commit時刪除(完成"暫存待上架"生命週期)
- 教訓:比對_new/草稿檔須比options不只題幹

### 📌 遺留問題(研究線裁定):康軒社會L6素材自相矛盾
- 考古題(113真實段考)全生態保育 vs 單課研究紀錄=多元文化;主檔題現全多元文化
- 若真實段考考生態,學生練的對不上→需研究線裁定L6實際課程範疇,非本次驗證能解

### 🔴 四下國語翰林pilot啟動,發現重大問題:文本錯位(2026-06-22)
- L1《稻間鴨》全30題0%命中課文關鍵詞,題目講「鵝鑾鼻燈塔」「古早味爺爺」「成長急躁變耐心」,與稻鴨完全無關
- 「媽媽辛苦做一桌菜…感恩精神」同一句萬用題橫跨L1/L3/L5→證實系統性套版填充,非個案(advisor確認鐵證)
- 主檔生成model=Gemini-2.5-Pro/2026-04-05,推測(🟡未證實因果)生成當下課文研究可能未到位
- ⚠️流程設計漏洞(advisor抓出,建workflow前):社會的「三錨點對等」judge標準若原樣套用國語,通用感恩題會因課綱錨點被誤判belongs=true而放行(反向於社會L6的假否定,這裡是假肯定)
- 修正判準:國語judge須把課文設為必要錨點(非三選一)——"學生不必讀本課課文就能答對"一律判不屬/generic,不可套社會的寬鬆三錨點對等
- 已棄用粗糙關鍵詞grep(L7樣本被誤判命中,實際文房四寶與棒球無關),改派12個agent逐題分類anchored/generic/wrong_lesson(讀課文全文+30題)
- 診斷workflow執行中 wgyl5um3g,診斷結果將決定scope:若多數錯位→比照三下國語康軒模式「照課文重製」(sonnet,codex額度已盡)而非社會式「驗證救回」
- 待診斷結果出爐後帶12課實測數字向用戶報告scope決策(sonnet重製規模若大需用戶確認)

### ✅事實:12課診斷結果出爐(wgyl5um3g,2026-06-22)
- **L1-L6完全故障**: anchored=0/30(全部6課),generic 24-30題+wrong_lesson 0-6題,錨定率0%
- **L7-L12基本正常**: anchored 27-30/30(六課皆高),錨定率90-100%
- 12課總計: anchored175/generic168/wrong_lesson17,共360題,整體錨定率48.6%
- 🟡推論(時間共現非因果):L1-6生成日期全2026-04-05,L7-12全2026-04-06→兩個不同生成批次,批次1系統性失敗
- L3考古題檔查實仍是29行空白模板(RC-04/RC-05未補)→該課研究本身不完整,佐證批次1當時課文研究未到位
- **scope結論**:L1-6(180題)需整批依課文重製(同三下國語康軒模式),非驗證救回;L7-12(180題)走社會式驗證流程即可
- 用戶要求:先查康軒/南一是否同樣問題,再決定整體作法
- 三版日期模式完全一致(L1-6=4/5,L7-12=4/6),但抽樣康軒/南一L1內容混雜(南一idx0扣課文/idx1-2套版;康軒idx0疑錨錯課)→不可外推,啟動同等嚴謹度24課診斷 w4tx53phz(康軒12+南一12)
- 待24課診斷結果出爐,合併翰林12課,共36課數字向用戶報告scope決策

### ✅事實:三版36課完整診斷結果(2026-06-22/07-02,w4tx53phz+wgyl5um3g)
- 三版1080題總計: anchored445/generic574/wrong_lesson61,整體錨定率41.2%
- 7課乾淨(30/30 anchored): 翰林L8/L9/L12、康軒L7/L8/L9、南一L8(+部分近乎乾淨)
- 8課部分堪用(15-29 anchored,需正常補缺額流程): 翰林L7/L10/L11、康軒L12、南一L7/L10/L11/L12
- **21課(630題)需整批重製**(anchored<15,多數為0): 翰林L1-6、康軒L1-6+L10+L11、南一L1-6+L9
- 型態不是社會式的「選項偏差」,是題目**完全脫離課文**(套版通用題/錨錯別課),judge三錨點對等標準若照社會版套用會誤放行(已修正為「不必讀本課課文就能答對=不合格」)
- 規律不完全等於「生成日期批次」:康軒L10/L11屬批次二(4/6)卻仍故障,南一批次二品質也不均勻(L9=14,L11=19)→不可用日期直接分類,須逐課看診斷結果
- codex仍不可用(2026-07-02複查,90秒0輸出,同policy快取卡死症狀)→重製沿用sonnet,同社會先例
- 用戶裁定:先完成15課(7乾淨+8部分堪用共450題),21課(630題)重製另開新批次
### 15課雙盲驗證進行中(2026-07-02)
- 15課清單:翰林L7/L8/L9/L10/L11/L12、康軒L7/L8/L9/L12、南一L7/L8/L10/L11/L12
- 打散建副本 jobs/_goal-work/G4_CHI_{HanLin|KangHsuan|NanYi}/L{n}_shuffled+blind.json(seed 20260702)
- judge獨立重驗(不直接沿用診斷結果,避免單一來源偏誤)+課文必要錨點判準寫死於prompt:「不必讀本課課文就能答對=belongs false」,不接受社會式三選一寬鬆對等
- workflow wdcn4hh29執行中(15課×盲測+judge=30 agent)
- 接續:算四閘過閘→缺額(部分堪用8課預期有較大缺額,15-29 anchored扣掉答錯/多解/格式後可能更少)→sonnet補題(課文全文為本)→補題盲測→寫回→evaluate_question_quality.js官方複查(BIAS+題數)→manifest/libraryStats→commit
- 21課(630題)整批重製留待15課完成後另開新批次,不在本次範圍

### 15課雙盲驗證完成,結果優於預期(2026-07-02)
- 過閘429/450(95.3%),僅缺21題(9課有缺額,6課0缺)
- 修正資料完整性問題:翰林L7/L11、南一L12的judge輸出idx用1-indexed(1-30)而非0-indexed(0-29),已核實位移方向(judge idx N=shuffled[N-1])並修正重算,非隨機錯誤而是一致性偏移
- 缺額課:翰林L8補3/L9補4/L10補3/L11補2,康軒L8補2/L12補2,南一L7補2/L8補1/L11補2,共21題
- codex複查仍不可用(90秒0輸出);21題補題走sonnet(w2l4c714g),prompt含避重複覆蓋清單+課文全文為本+嚴格錨定判準
- 接續:補題盲測+judge(同課文必要錨點標準)→merge→寫回→evaluate_question_quality.js官方複查(BIAS/題數)→manifest/libraryStats→commit

### 補題+寫回完成,官方複查抓到4課BIAS(2026-07-02)
- 21題補題全過閘(w2qcp46zu,18 agent),idx對齊正常(吸取前次1-indexed教訓,先查對齊才算)
- 寫回15課450題(原429+補21)成功,答案對齊不變式通過
- **evaluate_question_quality.js官方複查**(未再自建pipeline跳過,吸取社會批次教訓):15課中4課BIAS
  - 精確歸屬(區分我這批vs待重製21課,非只看BIAS清單就動手):翰林L7(80%)/L11(87%)/L12(80%)、南一L10(83%)屬本批需修
  - 另6課BIAS(翰林L1/L3/L4、康軒L2/L6、南一L6)屬待重製21課清單內,之後整批重出自然解決,本次不動
- 4課BIAS用sonnet重鑄(同社會手法,只調誘答長度不改正解)進行中 w89jlrvtc,額外要求「誘答仍須維持本課課文情境相關,不可退化成通用美德套版句」(防止修BIAS時意外破壞剛救回的課文錨定)
- 接續:重鑄→驗BIAS<75%+正解保持→重新盲測+judge(課文錨點+四閘)→寫回→manifest/libraryStats→commit

### 4課重鑄完成(2026-07-02,分2批因session額度中斷重試)
- 批1 w89jlrvtc:僅南一L10成功,翰林L7/L11/L12因「session額度用盡12:10pm重置」失敗(非bug)
- 等待重置後批2 wiaot26nr:翰林3課重試全成功
- BIAS改善:翰林L7 3%/L11 27%/L12 30%、南一L10 0%(全<75%),answer_index 30/30保持
- ⚠️正解文字改動較社會批次多(6-14/30 vs社會30/30):抽查確認皆為同義精簡(去冗字如「透過保送」→「靠保送」),語意不變,非破壞性改動
- 合併+打散→重新盲測+judge驗證中 wra0cjxy9(確認精簡未破壞課文錨定與正確性)
- 接續:過閘→寫回4課→manifest/libraryStats重算→commit(15課完整批次)

### 4課重鑄後過閘,再抓到4題新問題(2026-07-02)
- 過閘:翰林L7=29/30、L11=28/30、L12=29/30、南一L10=30/30(滿),共缺4題
- 4題落閘原因:翰林L7 idx14(成語辨義題,4選項僅1正向詞可猜中,belongs=false)、L11 idx20+25(誘答與正解語意重疊,判為跑題)、L12 idx17(盲測答錯)
- ⚠️教訓:重鑄BIAS時可能引入新弱點(成語辨義類題易變成「找正向詞」的猜題)→已補入補題prompt規則:禁純情感色彩猜答題、選項須語意獨立不重疊
- 補4題進行中 wy932wccm(sonnet,依課文全文)
- 接續:補題盲測+judge→merge全部(15課:原題passIdx+補題sup_passIdx+4課用rebal_passIdx取代原passIdx+這輪補4題)→寫回→manifest/libraryStats→evaluate_question_quality.js最終複查→commit

### 接續:四下國語36課(課文錨點素材已確認齊備);三版社會+自然+國語全好一起push

## ⚠️ 全庫遺留問題（範圍外，記錄待處理）
- validate_review_fields.js 全庫掃出 3075 errors「Publishable question lacks review_date」
- 集中在三下國語等舊庫（非本次四下自然，四下自然翰林0 errors）
- 不影響前端顯示（前端不讀review_date），屬metadata不全；待專門JOB處理
