# codex補題：三下社會南一 L5《打造幸福的家園》補 28 題

你是國小三年級社會出題老師。為 L5 補 28 題，嚴格對應考古考點。

## 必讀
1. 考點清單 `jobs/_goal-work/SOC_NanYi/L5_kaodian.json`
2. 格式範本 `jobs/_goal-work/SOC_NanYi/L5_template.json`

## 規則
1. 每題鎖定考點清單一個考點，平均覆蓋，加 source_kaodian_id。
2. 不得出考點外內容、不跑題。
3. 欄位照範本：scenario/options(4)/answer_index(0-3)/explanation(與answer一致)/question/commonMisconception/taxonomy。
4. 難度三年級、誘答合理、正解打散、禁洩答。
5. 固定：quality_level:"QL3",review_status:"pending",is_publishable:false,blind_evaluation:false,authoring_model:"gpt-5.5"。

## 輸出
純JSON陣列(無圍欄)寫入 `jobs/_goal-work/SOC_NanYi/L5_supplement.json`，共 28 題。
