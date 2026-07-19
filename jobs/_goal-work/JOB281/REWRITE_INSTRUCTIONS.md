# JOB-281 選項插字清除指令（單課執行者用）

## 背景
你分到的檔案裡，targets 清單標出的題目選項（有時題幹也有）文字中間被插入了不通順的贅字（「標記」「標籤」「標識」「標示」「標語」），例如：
「旨在強調必須幸運地擁有魔法般的直覺標記，才能在創作過程中無往不利」
→ 「標記」是插入痕跡，正確應該是：
「旨在強調必須幸運地擁有魔法般的直覺，才能在創作過程中無往不利」

有些題目贅字重複出現（如「標記標記」），也要一併清除。

## 鐵律
1. **只刪除贅字本身，不改其他任何文字**：句子的其餘部分、標點、語意、長度，除了移除贅字造成的空格/逗號調整外，一律保留原樣。
2. **不改 `answer_index`**、不改正解語意。
3. **不改 targets 清單以外的題目**（同檔案內非 target 的題完全不動）。
4. 移除贅字後，若該句子讀起來仍不通順（例如標點錯位），可做最小幅度的標點/連接詞調整讓句子通順，但**不得改變句子原本要表達的意思**。
5. 移除贅字後重新檢查全課 BIAS（正解嚴格唯一最長比例），若某題移除贅字後變成該課唯一最長選項超過 40% 門檻，該題可對誘答做最小幅度加長（比照 JOB-277 方法，只加長誘答不改正解），確保清除後 BIAS 仍 ≤40%。

## 執行步驟
1. 讀 targets 清單（`jobs/_goal-work/JOB281/targets/<檔名>.targets.json`）
2. 逐題找出贅字位置，刪除
3. 用 python 手術式修改來源檔（`json.dump(d, f, ensure_ascii=False, indent=2)`，2 空格縮排，只改 target 題的 options/question）
4. 自我驗證（唯讀，不呼叫 evaluate_question_quality.js）：
   - 題數不變、非 target 題 byte-identical
   - target 題 answer_index 與重寫前完全相同
   - 用正則再次掃描：`(標記|標籤|標識|標示|標語)[，。：]` 出現次數應降為 0（除非該詞彙是句子原本自然使用，如真的在講「路標」「商標」等——若有這種情況需特別註明，不要誤刪）
   - 重算全課 BIAS（正解嚴格唯一最長比例）≤40%
5. 產出重寫紀錄 `jobs/_goal-work/JOB281/recast/<檔名>.recast.json`：
   `[{"index":N, "old_question":"...", "new_question":"...", "old_options":[...], "new_options":[...]}]`
   （question 欄位若未動可省略，只記有變動的欄位）
6. **禁止**呼叫 `evaluate_question_quality.js` 或 `generate_library_stats.js`（有全站寫回副作用，本 JOB 後段會統一用 `--write` 指定檔案處理）。

## 回傳格式（最終訊息，純 JSON）
{"file":"<路徑>","fixed_count":N,"bias_pct_after":N,"remaining_pad_word_hits":N,"all_assertions_passed":true}
