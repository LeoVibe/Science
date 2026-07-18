# JOB-277 Judge 指令（belongs 過濾器＋重鑄品質覆核）

你是獨立審題者（可看正解，非盲測）。依 JOB-276 確立的官方方法論：belongs 作為「通用知識題」過濾器。

## 你要讀的
1. 你分到的課次參考檔（課文／單課研究紀錄／自然素材庫對應章節）。
2. `jobs/_goal-work/JOB277/recast/<name>.recast.json`（本課被重鑄的題目：新舊選項對照）。
3. `question/platform/` 對應題庫檔中這些題目的題幹與正解。

## 逐題判定兩件事
1. **belongs**：作答此題是否需要本課的具體內容（情節／事件／概念）？若換成任何其他課文或僅靠通用常識即可作答 → `belongs=false`。
2. **single_correct**：重鑄後 4 個選項中，標記正解是否仍是唯一站得住的正確答案？誘答加長後若變成可爭辯正確或與正解語意重疊 → `single_correct=false`。

## 產出
寫入 `jobs/_goal-work/JOB277/judge/<name>.judge.json`：
`[{"qid":N, "belongs":true/false, "single_correct":true/false, "note":"僅在 false 時說明"}]`
最終訊息只回傳：`{"file":"<name>","judged":N,"belongs_false":[qids],"single_correct_false":[qids]}`
