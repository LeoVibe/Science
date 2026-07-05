export const meta = {
  name: 'g4-chi-rebal-verify',
  description: '四下國語4課重鑄後重新盲測+judge(課文錨點)',
  phases: [{ title: '重鑄後雙盲', detail: '盲測+課文必要錨點judge,確認精簡正解未破壞正確性' }],
}

const lessons = [
  { dir: 'HanLin', pn: '翰林', n: 7, title: '棒球英雄夢' },
  { dir: 'HanLin', pn: '翰林', n: 11, title: '最後一片葉子' },
  { dir: 'HanLin', pn: '翰林', n: 12, title: '閱讀課' },
  { dir: 'NanYi', pn: '南一', n: 10, title: '想像與發明' },
]

const BLIND_SCHEMA = { type: 'object', properties: { answers: { type: 'array', items: { type: 'object', properties: { idx: { type: 'integer' }, answer_index: { type: 'integer' }, single_answer: { type: 'boolean' } }, required: ['idx', 'answer_index', 'single_answer'] } } }, required: ['answers'] }
const JUDGE_SCHEMA = { type: 'object', properties: { judgments: { type: 'array', items: { type: 'object', properties: { idx: { type: 'integer' }, belongs: { type: 'boolean' }, match: { type: 'boolean' }, reason: { type: 'string' } }, required: ['idx', 'belongs', 'match', 'reason'] } } }, required: ['judgments'] }

function blindPrompt(L) {
  return `你是國小四年級國語科專家,盲測作答「${L.title}」(${L.pn}版,誘答選項剛經改寫消除長度偏差,需確認是否仍唯一正解)。
讀取(無標示答案)：jobs/_goal-work/G4_CHI_${L.dir}/L${L.n}_rebal_blind.json,共30題(idx 0~29)。
每題：①判最合理正解(0-based) ②single_answer:是否恰好唯一明確正解(若改寫後出現第二個也對的選項,填false)。
回傳結構化結果,涵蓋全30題,idx從0開始不可跳號或位移。`
}

function judgePrompt(L) {
  return `你是國小四年級國語科課程審查官,審查「${L.title}」(${L.pn}版)題目(誘答剛改寫、部分正解文字經精簡)是否仍真正扣緊本課課文。

讀取：完整題(含正解) jobs/_goal-work/G4_CHI_${L.dir}/L${L.n}_rebal_shuffled.json；單課研究紀錄(含課文全文RC-01) knowledge/1_課綱研究/國語/四下/${L.pn}/KL4_四下_${L.pn}_L${L.n}_${L.title}_單課研究紀錄.md；考古題 knowledge/1_課綱研究/國語/四下/${L.pn}/KL4_四下_${L.pn}_L${L.n}_${L.title}_考古題與討論.md。共30題。

【國語專用嚴格判準——課文是必要錨點】
belongs=true 唯一條件：題目具體引用本課課文的情節/人物/意象/字詞，換成別課課文就答不出來。「學生不必讀本課課文就能答對」一律belongs=false。
match=true：標示正解正確無誤、無事實錯誤、精簡後語意未失真、改寫的誘答無一變成也正確、非格式崩壞。

對每題判斷belongs/match/reason,回傳結構化結果,涵蓋全30題,idx從0開始不可跳號或位移。`
}

const results = await parallel(lessons.map(L => () =>
  parallel([
    () => agent(blindPrompt(L), { label: `rb-blind:${L.dir}_L${L.n}`, phase: '重鑄後雙盲', model: 'sonnet', schema: BLIND_SCHEMA }),
    () => agent(judgePrompt(L), { label: `rb-judge:${L.dir}_L${L.n}`, phase: '重鑄後雙盲', model: 'sonnet', schema: JUDGE_SCHEMA }),
  ]).then(([b, j]) => ({ dir: L.dir, n: L.n, title: L.title, blind: b?.answers || null, judge: j?.judgments || null }))
))
return results
