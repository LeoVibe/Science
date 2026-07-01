export const meta = {
  name: 'soc-g4-rebal-verify',
  description: '四下社會5課重鑄後重新盲測+judge(四閘)',
  phases: [{ title: '重鑄後雙盲', detail: '盲測single_answer把關誘答未變正確' }],
}

const lessons = [
  { vdir: 'G4_SOC_HanLin', n: 1, title: '家鄉老故事', kao: 'knowledge/1_課綱研究/社會/四下/翰林/KL4_四下_翰林_L1_家鄉老故事_考古題與討論.md', rec: 'knowledge/1_課綱研究/社會/四下/翰林/KL4_四下_翰林_L1_家鄉老故事_單課研究紀錄.md' },
  { vdir: 'G4_SOC_HanLin', n: 4, title: '家鄉的新商機', kao: 'knowledge/1_課綱研究/社會/四下/翰林/KL4_四下_翰林_L4_家鄉的新商機_考古題與討論.md', rec: 'knowledge/1_課綱研究/社會/四下/翰林/KL4_四下_翰林_L4_家鄉的新商機_單課研究紀錄.md' },
  { vdir: 'G4_SOC_HanLin', n: 6, title: '歡迎來到我的家鄉', kao: 'knowledge/1_課綱研究/社會/四下/翰林/KL4_四下_翰林_L6_歡迎來到我的家鄉_考古題與討論.md', rec: 'knowledge/1_課綱研究/社會/四下/翰林/KL4_四下_翰林_L6_歡迎來到我的家鄉_單課研究紀錄.md' },
  { vdir: 'G4_SOC_KangHsuan', n: 5, title: '家鄉風情畫（上）', kao: 'knowledge/1_課綱研究/社會/四下/康軒/KL4_四下_康軒_L5_家鄉風情畫上_考古題與討論.md', rec: 'knowledge/1_課綱研究/社會/四下/康軒/KL4_四下_康軒_L5_家鄉風情畫上_單課研究紀錄.md' },
  { vdir: 'G4_SOC_NanYi', n: 6, title: '想像家鄉的樣子', kao: 'knowledge/1_課綱研究/社會/四下/南一/KL4_四下_南一_L6_想像家鄉的樣子_考古題與討論.md', rec: 'knowledge/1_課綱研究/社會/四下/南一/KL4_四下_南一_L6_想像家鄉的樣子_單課研究紀錄.md' },
]

const BLIND_SCHEMA = { type: 'object', properties: { answers: { type: 'array', items: { type: 'object', properties: { idx: { type: 'integer' }, answer_index: { type: 'integer' }, single_answer: { type: 'boolean' } }, required: ['idx', 'answer_index', 'single_answer'] } } }, required: ['answers'] }
const JUDGE_SCHEMA = { type: 'object', properties: { judgments: { type: 'array', items: { type: 'object', properties: { idx: { type: 'integer' }, belongs: { type: 'boolean' }, match: { type: 'boolean' } }, required: ['idx', 'belongs', 'match'] } } }, required: ['judgments'] }

function blindPrompt(L) {
  return `你是國小四年級社會科專家,盲測作答「${L.title}」的題目(誘答選項剛經改寫,需確認是否仍只有一個明確正解)。
讀取(無標示答案)：jobs/_goal-work/${L.vdir}/L${L.n}_rebal_blind.json,共30題(idx 0~29)。
每題：①以四年級社會知識判最合理正解(0-based) ②single_answer:是否恰好唯一明確正解(若改寫後出現第二個也對的選項,填false)。
回傳結構化結果,涵蓋全30題。`
}
function judgePrompt(L) {
  return `你是國小四年級社會科審查官,依《驗證與盲測準則》審查「${L.title}」題目(誘答剛改寫)。
讀取:完整題(含正解) jobs/_goal-work/${L.vdir}/L${L.n}_rebal_shuffled.json;單課研究紀錄 ${L.rec};考古題 ${L.kao}。共30題。
【三錨點對等】對應素材=單課研究紀錄課程元素/課綱碼 或 考古題 或 課文,任一即belongs=true,不得因考古題樣本未涵蓋判不屬。
每題判:①belongs(屬本課核心概念/課綱元素) ②match(題幹與標示正解正確無誤、無事實錯誤、改寫的誘答無一變成也正確、非格式崩壞)。
回傳結構化結果,涵蓋全30題。`
}

const results = await parallel(lessons.map(L => () =>
  parallel([
    () => agent(blindPrompt(L), { label: `rb-blind:${L.vdir}_L${L.n}`, phase: '重鑄後雙盲', model: 'sonnet', schema: BLIND_SCHEMA }),
    () => agent(judgePrompt(L), { label: `rb-judge:${L.vdir}_L${L.n}`, phase: '重鑄後雙盲', model: 'sonnet', schema: JUDGE_SCHEMA }),
  ]).then(([b, j]) => ({ vdir: L.vdir, n: L.n, blind: b?.answers || null, judge: j?.judgments || null }))
))
return results
