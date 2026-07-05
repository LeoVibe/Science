export const meta = {
  name: 'g4-chi-15-verify',
  description: '四下國語三版15課雙盲驗證(課文必要錨點judge)',
  phases: [{ title: '雙盲驗證', detail: '每課盲測員+課文錨點judge,課文為必要非三選一' }],
}

const lessons = [
  { dir: 'HanLin', pubName: '翰林', d: 'HanLin', n: 7, title: '棒球英雄夢' },
  { dir: 'HanLin', pubName: '翰林', d: 'HanLin', n: 8, title: '夢幻全壘打' },
  { dir: 'HanLin', pubName: '翰林', d: 'HanLin', n: 9, title: '單車遊日月潭' },
  { dir: 'HanLin', pubName: '翰林', d: 'HanLin', n: 10, title: '孫悟空三借芭蕉扇' },
  { dir: 'HanLin', pubName: '翰林', d: 'HanLin', n: 11, title: '最後一片葉子' },
  { dir: 'HanLin', pubName: '翰林', d: 'HanLin', n: 12, title: '閱讀課' },
  { dir: 'KangHsuan', pubName: '康軒', d: 'KangHsuan', n: 7, title: '未來的模樣' },
  { dir: 'KangHsuan', pubName: '康軒', d: 'KangHsuan', n: 8, title: '動物老師的智慧' },
  { dir: 'KangHsuan', pubName: '康軒', d: 'KangHsuan', n: 9, title: '向太空出發' },
  { dir: 'KangHsuan', pubName: '康軒', d: 'KangHsuan', n: 12, title: '如來佛的手掌心' },
  { dir: 'NanYi', pubName: '南一', d: 'NanYi', n: 7, title: '不一樣的母親花' },
  { dir: 'NanYi', pubName: '南一', d: 'NanYi', n: 8, title: '屋頂上的野貓' },
  { dir: 'NanYi', pubName: '南一', d: 'NanYi', n: 10, title: '想像與發明' },
  { dir: 'NanYi', pubName: '南一', d: 'NanYi', n: 11, title: '小事物大驚奇' },
  { dir: 'NanYi', pubName: '南一', d: 'NanYi', n: 12, title: '九蛙傳奇' },
]

const BLIND_SCHEMA = { type: 'object', properties: { answers: { type: 'array', items: { type: 'object', properties: { idx: { type: 'integer' }, answer_index: { type: 'integer' }, single_answer: { type: 'boolean' } }, required: ['idx', 'answer_index', 'single_answer'] } } }, required: ['answers'] }
const JUDGE_SCHEMA = { type: 'object', properties: { judgments: { type: 'array', items: { type: 'object', properties: { idx: { type: 'integer' }, belongs: { type: 'boolean' }, match: { type: 'boolean' }, reason: { type: 'string' } }, required: ['idx', 'belongs', 'match', 'reason'] } } }, required: ['judgments'] }

function blindPrompt(L) {
  return `你是國小四年級國語科專家,盲測作答「${L.title}」(${L.pubName}版)的題目。
讀取(無標示答案)：jobs/_goal-work/G4_CHI_${L.dir}/L${L.n}_blind.json,共30題(idx 0~29)。
每題：①判最合理正解(0-based) ②single_answer:是否恰好唯一明確正解。
回傳結構化結果,涵蓋全30題。`
}

function judgePrompt(L) {
  return `你是國小四年級國語科課程審查官,審查「${L.title}」(${L.pubName}版)題目是否真正扣緊本課課文。

讀取：
- 完整題(含標示正解) jobs/_goal-work/G4_CHI_${L.dir}/L${L.n}_shuffled.json
- 本課單課研究紀錄(含課文全文錄製RC-01) knowledge/1_課綱研究/國語/四下/${L.pubName}/KL4_四下_${L.pubName}_L${L.n}_${L.title}_單課研究紀錄.md
- 本課考古題與討論 knowledge/1_課綱研究/國語/四下/${L.pubName}/KL4_四下_${L.pubName}_L${L.n}_${L.title}_考古題與討論.md

【國語專用嚴格判準——課文是必要錨點,不是三選一】
belongs=true 的唯一條件：題目具體引用本課課文的情節/人物/意象/字詞/主題，換成別課課文就答不出來或不合理。
**「學生不必讀《${L.title}》這篇課文就能答對」的題，一律 belongs=false**（即使題目看似有道理、選項合理、對應到抽象美德或課綱元素，只要沒有具體扣本課課文內容，就是不合格）。
不接受單純的「小明/小華在家庭聚餐/圖書館...」通用情境+抽象美德詞(感恩/同理心/成長)作為合格理由。
若題目明確引用了「另一篇課文」的具體情節/意象(非本課)，也判 belongs=false，reason 註明錨錯課。

match=true 的條件：題幹與標示正解(answer_index)正確無誤、無事實錯誤、無編造、非格式崩壞(題幹為完整問句、非題幹即答案)。

對每題判斷 belongs / match / reason(引用課文哪個具體元素,或說明為何不合格)，回傳結構化結果,涵蓋全30題。`
}

const results = await parallel(lessons.map(L => () =>
  parallel([
    () => agent(blindPrompt(L), { label: `blind:${L.dir}_L${L.n}`, phase: '雙盲驗證', model: 'sonnet', schema: BLIND_SCHEMA }),
    () => agent(judgePrompt(L), { label: `judge:${L.dir}_L${L.n}`, phase: '雙盲驗證', model: 'sonnet', schema: JUDGE_SCHEMA }),
  ]).then(([b, j]) => ({ dir: L.dir, n: L.n, title: L.title, blind: b?.answers || null, judge: j?.judgments || null }))
))

return results
