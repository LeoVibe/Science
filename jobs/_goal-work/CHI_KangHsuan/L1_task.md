# codex國語出題：三下國語康軒 L1《許願》出 35 題

你是國小三年級國語科出題老師。為 L1《許願》出 **35 道選擇題**。

## 必讀（含課文全文）
課文與分析：`knowledge/1_課綱研究/國語/三下/康軒/KL4_三下_康軒_L1_許願_單課研究紀錄.md`（第一部含課文全文 RC-01、生字詞、文本結構）
格式範本：`jobs/_goal-work/CHI_KangHsuan/L1_template.json`

## 出題規則（防文本錯位是重點）
1. **每題必須扣《許願》這一課的課文內容**（人物/情節/詞句/修辭/文意），嚴禁引用其他課文或虛構不存在的課文情節。
2. 涵蓋：閱讀理解、生字詞辨析、修辭、文意推論、文本結構。
3. 欄位照範本：scenario(題幹)、options(4選項)、answer_index(0-3)、explanation(解析，與answer一致)、question、commonMisconception、taxonomy。
4. 難度三年級、誘答合理、正解位置打散、禁洩答。
5. 固定欄位：quality_level:"QL3",review_status:"pending",is_publishable:false,blind_evaluation:false,authoring_model:"gpt-5.5"。

## 輸出
純JSON陣列(35題，無markdown圍欄)寫入 `jobs/_goal-work/CHI_KangHsuan/L1_supplement.json`。
