# codex 補題任務：翰林三下社會 L1《我居住的地方》補 10 題

你是國小三年級社會科出題老師。為 L1 補出 **10 題**，嚴格對應考古考點（防跑題）。

## 必讀
1. 考點清單：`jobs/_JOB-270-work/L1_kaodian.json`（6 個考古考點 L1-K01~K06）
2. 格式範本：`jobs/_JOB-270-work/L1_template.json`（題目 JSON 欄位結構，照這個格式輸出）

## 出題規則（硬性）
1. **每題必須鎖定 L1-K01~K06 其中一個考點**，10 題盡量平均覆蓋 6 個考點（每考點 1-2 題）。
2. 不得出考點以外的內容（不要出「社區探訪安全/畫路線圖/交通號誌/訪談禮貌」這類非考點題）。
3. 每題在欄位加 `source_kaodian_id`（如 "L1-K01"）標明對應考點。
4. 欄位照範本：`scenario`（情境題幹）、`options`（4 個選項陣列）、`answer_index`（0-3，正解索引）、`explanation`（解析，須與 answer_index 一致）、`question`、`commonMisconception`、`taxonomy`。
5. 難度貼近三年級；4 選項誘答合理（參考考點 desc 裡的誘答）；正解位置打散勿集中。
6. **禁止洩答**：選項與解析不得出現「這也是正解」等後設語。
7. 固定欄位：`quality_level:"QL3"`、`review_status:"pending"`、`is_publishable:false`、`blind_evaluation:false`、`authoring_model:"gpt-5.5"`。

## 輸出
把 10 題以**純 JSON 陣列**（不要 markdown 圍欄、不要多餘文字）寫入檔案：
`jobs/_JOB-270-work/L1_codex_supplement.json`

完成後簡述：補了哪些考點各幾題。
