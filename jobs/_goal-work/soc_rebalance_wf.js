export const meta = {
  name: 'soc-g4-rebalance',
  description: '四下社會5課BIAS:sonnet重鑄誘答長度(保正解不變)',
  phases: [{ title: '誘答長度重鑄', detail: '5課sonnet,只調選項長度不改正解' }],
}

const lessons = [
  { dir: 'G4_SOC_HanLin', n: 1, title: '家鄉老故事' },
  { dir: 'G4_SOC_HanLin', n: 4, title: '家鄉的新商機' },
  { dir: 'G4_SOC_HanLin', n: 6, title: '歡迎來到我的家鄉' },
  { dir: 'G4_SOC_KangHsuan', n: 5, title: '家鄉風情畫（上）' },
  { dir: 'G4_SOC_NanYi', n: 6, title: '想像家鄉的樣子' },
]

const SCHEMA = {
  type: 'object',
  properties: {
    questions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          i: { type: 'integer' },
          options: { type: 'array', items: { type: 'string' }, minItems: 4, maxItems: 4 },
          answer_index: { type: 'integer' },
          explanation: { type: 'string' },
        },
        required: ['i', 'options', 'answer_index', 'explanation'],
      },
    },
  },
  required: ['questions'],
}

function prompt(L) {
  return `你是國小四年級社會科命題專家。修正「${L.title}」這一課選擇題的「選項長度偏差」。

## 問題
本課多數題目「正解」是四選項中明顯最長的,學生可憑「選最長」猜對(作弊線索)。需消除。

## 輸入
讀取 jobs/_goal-work/${L.dir}/L${L.n}_rebalance_in.json(30題,每題含 options/answer_index/correct_is_longest/lens 各選項字數)。

## 修正規則(逐題)
1. 對 correct_is_longest=true 的題:改寫「誘答選項(非正解)」使長度與正解相當——為過短誘答補充合理但**錯誤**的細節(可辨識迷思),讓四選項長度接近;必要時可在不失真前提下精簡冗長正解。
2. **絕不改變哪個選項是正解**:answer_index 維持不變,正解選項語意與正確性不得改動。
3. **絕不讓任何誘答變成也正確**:補充的誘答內容必須是錯的。
4. 目標:每題正解長度落在四選項中段,不再是唯一最長。
5. correct_is_longest=false 的題,options/answer_index 原樣回傳。
6. 維持四年級用語、誘答合理鑑別。explanation 若因誘答改寫需微調則更新,否則原樣。

## 輸出
回傳結構化結果,30題全含 {i, options(4), answer_index, explanation},i 對應輸入。`
}

const results = await parallel(lessons.map(L => () =>
  agent(prompt(L), { label: `rebal:${L.dir}_L${L.n}`, phase: '誘答長度重鑄', model: 'sonnet', schema: SCHEMA })
    .then(r => ({ dir: L.dir, n: L.n, questions: r?.questions || null }))
))

return results
