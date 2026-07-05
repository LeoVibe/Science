export const meta = {
  name: 'g4-chi-15-rebalance2',
  description: '四下國語3課BIAS重鑄重試(翰林L7/L11/L12)',
  phases: [{ title: '誘答長度重鑄重試', detail: '前次因session額度中斷,重試' }],
}

const lessons = [
  { dir: 'HanLin', n: 7, title: '棒球英雄夢' },
  { dir: 'HanLin', n: 11, title: '最後一片葉子' },
  { dir: 'HanLin', n: 12, title: '閱讀課' },
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
  return `你是國小四年級國語科命題專家。修正「${L.title}」這一課選擇題的「選項長度偏差」。

## 問題
本課多數題目「正解」是四選項中明顯最長的,學生可憑「選最長」猜對。需消除。

## 輸入
讀取 jobs/_goal-work/G4_CHI_${L.dir}/L${L.n}_rebalance_in.json(30題,每題含 options/answer_index/correct_is_longest/lens)。

## 修正規則(逐題)
1. 對 correct_is_longest=true 的題:改寫「誘答選項(非正解)」使長度與正解相當——為過短誘答補充合理但**錯誤**的細節;必要時精簡冗長正解。
2. **絕不改變哪個選項是正解**:answer_index 不變,正解語意與正確性不得改動。
3. **絕不讓任何誘答變成也正確**。
4. **正解與誘答都是本課課文具體內容的一部分,改寫誘答時仍須維持與本課課文情境相關(不可變成通用美德套版句)**。
5. 目標:正解長度落在四選項中段,不再唯一最長。
6. correct_is_longest=false 的題,options/answer_index 原樣回傳。
7. 四年級用語、誘答合理。

## 輸出
只回傳 {i, options(4), answer_index},30題全含(不需explanation)。`
}

const results = await parallel(lessons.map(L => () =>
  agent(prompt(L), { label: `rebal2:${L.dir}_L${L.n}`, phase: '誘答長度重鑄重試', model: 'sonnet', schema: SCHEMA })
    .then(r => ({ dir: L.dir, n: L.n, questions: r?.questions || null }))
))

return results
