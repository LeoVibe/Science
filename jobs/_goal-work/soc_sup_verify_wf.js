export const meta = {
  name: 'soc-g4-sup-verify',
  description: '四下社會補題9題盲測+judge(四閘,三錨點對等)',
  phases: [{ title: '補題雙盲', detail: '盲測員+judge,judge寫死三錨點對等' }],
}

const lessons = [
  {"key":"G4_SOC_HanLin_L2","dir":"G4_SOC_HanLin","n":2,"title":"家鄉的山與海","kao":"knowledge/1_課綱研究/社會/四下/翰林/KL4_四下_翰林_L2_家鄉的山與海_考古題與討論.md","rec":"knowledge/1_課綱研究/社會/四下/翰林/KL4_四下_翰林_L2_家鄉的山與海_單課研究紀錄.md","nq":2},
  {"key":"G4_SOC_HanLin_L4","dir":"G4_SOC_HanLin","n":4,"title":"家鄉的新商機","kao":"knowledge/1_課綱研究/社會/四下/翰林/KL4_四下_翰林_L4_家鄉的新商機_考古題與討論.md","rec":"knowledge/1_課綱研究/社會/四下/翰林/KL4_四下_翰林_L4_家鄉的新商機_單課研究紀錄.md","nq":1},
  {"key":"G4_SOC_KangHsuan_L2","dir":"G4_SOC_KangHsuan","n":2,"title":"家鄉的產業（下）","kao":"knowledge/1_課綱研究/社會/四下/康軒/KL4_四下_康軒_L2_家鄉的產業下_考古題與討論.md","rec":"knowledge/1_課綱研究/社會/四下/康軒/KL4_四下_康軒_L2_家鄉的產業下_單課研究紀錄.md","nq":1},
  {"key":"G4_SOC_KangHsuan_L3","dir":"G4_SOC_KangHsuan","n":3,"title":"家鄉的人口與交通（上）","kao":"knowledge/1_課綱研究/社會/四下/康軒/KL4_四下_康軒_L3_家鄉的人口與交通上_考古題與討論.md","rec":"knowledge/1_課綱研究/社會/四下/康軒/KL4_四下_康軒_L3_家鄉的人口與交通上_單課研究紀錄.md","nq":1},
  {"key":"G4_SOC_KangHsuan_L6","dir":"G4_SOC_KangHsuan","n":6,"title":"家鄉風情畫（下）","kao":"knowledge/1_課綱研究/社會/四下/康軒/KL4_四下_康軒_L6_家鄉風情畫下_考古題與討論.md","rec":"knowledge/1_課綱研究/社會/四下/康軒/KL4_四下_康軒_L6_家鄉風情畫下_單課研究紀錄.md","nq":1},
  {"key":"G4_SOC_NanYi_L2","dir":"G4_SOC_NanYi","n":2,"title":"家鄉的氣候與生活","kao":"knowledge/1_課綱研究/社會/四下/南一/KL4_四下_南一_L2_家鄉的氣候與生活_考古題與討論.md","rec":"knowledge/1_課綱研究/社會/四下/南一/KL4_四下_南一_L2_家鄉的氣候與生活_單課研究紀錄.md","nq":1},
  {"key":"G4_SOC_NanYi_L6","dir":"G4_SOC_NanYi","n":6,"title":"想像家鄉的樣子","kao":"knowledge/1_課綱研究/社會/四下/南一/KL4_四下_南一_L6_想像家鄉的樣子_考古題與討論.md","rec":"knowledge/1_課綱研究/社會/四下/南一/KL4_四下_南一_L6_想像家鄉的樣子_單課研究紀錄.md","nq":2},
]

const BLIND_SCHEMA = { type: 'object', properties: { answers: { type: 'array', items: { type: 'object', properties: { idx: { type: 'integer' }, answer_index: { type: 'integer' }, single_answer: { type: 'boolean' } }, required: ['idx', 'answer_index', 'single_answer'] } } }, required: ['answers'] }
const JUDGE_SCHEMA = { type: 'object', properties: { judgments: { type: 'array', items: { type: 'object', properties: { idx: { type: 'integer' }, belongs: { type: 'boolean' }, match: { type: 'boolean' }, reason: { type: 'string' } }, required: ['idx', 'belongs', 'match', 'reason'] } } }, required: ['judgments'] }

function blindPrompt(L) {
  return `你是國小四年級社會科專家,盲測作答「${L.title}」這一課的補題。
讀取(無標示答案)：jobs/_goal-work/${L.dir}/${L.n}_sup_blind.json，共 ${L.nq} 題(idx 0~${L.nq - 1})。
對每題：①以四年級社會知識判最合理正解(0-based) ②single_answer:是否恰好唯一明確正解。
回傳結構化結果,涵蓋全部 ${L.nq} 題。`
}

function judgePrompt(L) {
  return `你是國小四年級社會科命題審查官,依《驗證與盲測準則》審查「${L.title}」補題。
讀取：完整題(含正解) jobs/_goal-work/${L.dir}/${L.n}_sup_shuffled.json；單課研究紀錄 ${L.rec}；考古題 ${L.kao}。共 ${L.nq} 題。

【關鍵判準】"對應該課素材"錨點有三類,**地位對等,符合任一即 belongs=true**：①單課研究紀錄的課程元素/課綱碼 ②考古題 ③課文。⚠️考古題只是真實段考抽樣,不是完整考範;**不得因考古題樣本沒這類題就判不屬**,只要扣到單課研究紀錄列出的核心概念/課綱元素即屬本課。

對每題判：①belongs(題目落在本課核心概念/課綱元素範圍,依三錨點對等) ②match(題幹與標示正解正確無誤、無事實錯誤、非編造、非格式崩壞、題幹須完整問句且非題幹即答案) ③reason。
回傳結構化結果,涵蓋全部 ${L.nq} 題。`
}

const results = await parallel(lessons.map(L => () =>
  parallel([
    () => agent(blindPrompt(L), { label: `sup-blind:${L.key}`, phase: '補題雙盲', model: 'sonnet', schema: BLIND_SCHEMA }),
    () => agent(judgePrompt(L), { label: `sup-judge:${L.key}`, phase: '補題雙盲', model: 'sonnet', schema: JUDGE_SCHEMA }),
  ]).then(([b, j]) => ({ key: L.key, dir: L.dir, n: L.n, nq: L.nq, blind: b?.answers || null, judge: j?.judgments || null }))
))

return results
