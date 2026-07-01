export const meta = {
  name: 'soc-g4-rebalance2',
  description: '四下社會2課BIAS重鑄(精簡schema避token上限)',
  phases: [{ title: '誘答長度重鑄2', detail: '康軒L5+南一L6,只回options+answer_index' }],
}

const lessons = [
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
        },
        required: ['i', 'options', 'answer_index'],
      },
    },
  },
  required: ['questions'],
}

function prompt(L) {
  return `你是國小四年級社會科命題專家。修正「${L.title}」這一課選擇題的「選項長度偏差」。

## 問題
本課多數題目「正解」是四選項中明顯最長的,學生可憑「選最長」猜對。需消除。

## 輸入
讀取 jobs/_goal-work/${L.dir}/L${L.n}_rebalance_in.json(30題,每題含 options/answer_index/correct_is_longest/lens)。

## 修正規則(逐題)
1. 對 correct_is_longest=true 的題:改寫「誘答選項(非正解)」使長度與正解相當——為過短誘答補充合理但**錯誤**的細節;必要時精簡冗長正解。
2. **絕不改變哪個選項是正解**:answer_index 不變,正解語意與正確性不得改動。
3. **絕不讓任何誘答變成也正確**。
4. 目標:正解長度落在四選項中段,不再唯一最長。
5. correct_is_longest=false 的題,options/answer_index 原樣回傳。
6. 四年級用語、誘答合理。

## 輸出
只回傳 {i, options(4), answer_index},30題全含(不需explanation)。`
}

const results = await parallel(lessons.map(L => () =>
  agent(prompt(L), { label: `rebal2:${L.dir}_L${L.n}`, phase: '誘答長度重鑄2', model: 'sonnet', schema: SCHEMA })
    .then(r => ({ dir: L.dir, n: L.n, questions: r?.questions || null }))
))

return results
