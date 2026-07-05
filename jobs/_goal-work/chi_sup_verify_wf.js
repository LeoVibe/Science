export const meta = {
  name: 'g4-chi-sup-verify',
  description: '四下國語9課補21題盲測+judge(課文必要錨點)',
  phases: [{ title: '補題雙盲', detail: '盲測員+judge,課文為必要錨點' }],
}

const lessons = [
  { d: 'HanLin', pn: '翰林', n: 8, title: '夢幻全壘打', nq: 3 },
  { d: 'HanLin', pn: '翰林', n: 9, title: '單車遊日月潭', nq: 4 },
  { d: 'HanLin', pn: '翰林', n: 10, title: '孫悟空三借芭蕉扇', nq: 3 },
  { d: 'HanLin', pn: '翰林', n: 11, title: '最後一片葉子', nq: 2 },
  { d: 'KangHsuan', pn: '康軒', n: 8, title: '動物老師的智慧', nq: 2 },
  { d: 'KangHsuan', pn: '康軒', n: 12, title: '如來佛的手掌心', nq: 2 },
  { d: 'NanYi', pn: '南一', n: 7, title: '不一樣的母親花', nq: 2 },
  { d: 'NanYi', pn: '南一', n: 8, title: '屋頂上的野貓', nq: 1 },
  { d: 'NanYi', pn: '南一', n: 11, title: '小事物大驚奇', nq: 2 },
]

const BLIND_SCHEMA = { type: 'object', properties: { answers: { type: 'array', items: { type: 'object', properties: { idx: { type: 'integer' }, answer_index: { type: 'integer' }, single_answer: { type: 'boolean' } }, required: ['idx', 'answer_index', 'single_answer'] } } }, required: ['answers'] }
const JUDGE_SCHEMA = { type: 'object', properties: { judgments: { type: 'array', items: { type: 'object', properties: { idx: { type: 'integer' }, belongs: { type: 'boolean' }, match: { type: 'boolean' }, reason: { type: 'string' } }, required: ['idx', 'belongs', 'match', 'reason'] } } }, required: ['judgments'] }

function blindPrompt(L) {
  return `你是國小四年級國語科專家,盲測作答「${L.title}」(${L.pn}版)的補題。
讀取(無標示答案)：jobs/_goal-work/G4_CHI_${L.d}/L${L.n}_sup_blind.json,共${L.nq}題(idx 0~${L.nq - 1})。
每題：①判最合理正解(0-based) ②single_answer:是否恰好唯一明確正解。
回傳結構化結果,涵蓋全部${L.nq}題,idx從0開始不可跳號或位移。`
}

function judgePrompt(L) {
  return `你是國小四年級國語科課程審查官,審查「${L.title}」(${L.pn}版)補題是否真正扣緊本課課文。

讀取：完整題(含正解) jobs/_goal-work/G4_CHI_${L.d}/L${L.n}_sup_shuffled.json；單課研究紀錄(含課文全文RC-01) knowledge/1_課綱研究/國語/四下/${L.pn}/KL4_四下_${L.pn}_L${L.n}_${L.title}_單課研究紀錄.md；考古題 knowledge/1_課綱研究/國語/四下/${L.pn}/KL4_四下_${L.pn}_L${L.n}_${L.title}_考古題與討論.md。共${L.nq}題。

【國語專用嚴格判準——課文是必要錨點】
belongs=true 唯一條件：題目具體引用本課課文的情節/人物/意象/字詞，換成別課課文就答不出來。
「學生不必讀本課課文就能答對」一律 belongs=false。
match=true：標示正解正確無誤、無事實錯誤、非格式崩壞。

對每題判斷belongs/match/reason,回傳結構化結果,涵蓋全部${L.nq}題,idx從0開始不可跳號或位移。`
}

const results = await parallel(lessons.map(L => () =>
  parallel([
    () => agent(blindPrompt(L), { label: `sup-blind:${L.d}_L${L.n}`, phase: '補題雙盲', model: 'sonnet', schema: BLIND_SCHEMA }),
    () => agent(judgePrompt(L), { label: `sup-judge:${L.d}_L${L.n}`, phase: '補題雙盲', model: 'sonnet', schema: JUDGE_SCHEMA }),
  ]).then(([b, j]) => ({ d: L.d, n: L.n, title: L.title, nq: L.nq, blind: b?.answers || null, judge: j?.judgments || null }))
))

return results
