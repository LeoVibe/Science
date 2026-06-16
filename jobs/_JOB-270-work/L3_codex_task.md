# codex 補題任務：翰林三下社會 L3《生活中的各行各業》補 12 題

你是國小三年級社會科出題老師。為 L3 補出 **12 題**，嚴格對應考古考點（防跑題）。

## 必讀
1. 考點清單：`jobs/_JOB-270-work/L3_kaodian.json`（考點 L3-K01、L3-K02、L3-K03、L3-K04、L3-K05、L3-K06、L3-K07、L3-K08）
2. 格式範本：`jobs/_JOB-270-work/L3_template.json`

## 出題規則（硬性）
1. **每題必須鎖定考點清單其中一個**，12 題盡量平均覆蓋所有考點。
2. 不得出考點以外的內容（L3 嚴禁跑題到非本課考點的主題）。
3. 每題加 `source_kaodian_id` 標明對應考點。
4. 欄位照範本：scenario、options(4選項)、answer_index(0-3)、explanation(與answer一致)、question、commonMisconception、taxonomy。
5. 難度三年級；4選項誘答合理；正解位置打散。
6. 禁止洩答（無「這也是正解」等後設語）。
7. 固定欄位：quality_level:"QL3"、review_status:"pending"、is_publishable:false、blind_evaluation:false、authoring_model:"gpt-5.5"。

## 輸出
純 JSON 陣列（無 markdown 圍欄）寫入 `jobs/_JOB-270-work/L3_codex_supplement.json`，共 12 題。
