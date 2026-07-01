export const meta = {
  name: 'soc-g4-rejudge',
  description: '四下社會6課28題校正重判(準則標準:三素材對等)',
  phases: [{ title: '校正重判', detail: 'belongs依課綱/考古/課文任一,不以考古樣本為唯一範疇' }],
}

const lessons = [{"key": "G4_SOC_HanLin_L2", "dir": "G4_SOC_HanLin", "n": 2, "title": "家鄉的山與海", "shuffled": "jobs/_goal-work/G4_SOC_HanLin/L2_shuffled.json", "kao": "knowledge/1_課綱研究/社會/四下/翰林/KL4_四下_翰林_L2_家鄉的山與海_考古題與討論.md", "rec": "knowledge/1_課綱研究/社會/四下/翰林/KL4_四下_翰林_L2_家鄉的山與海_單課研究紀錄.md", "idx": [0, 2, 20]}, {"key": "G4_SOC_HanLin_L4", "dir": "G4_SOC_HanLin", "n": 4, "title": "家鄉的新商機", "shuffled": "jobs/_goal-work/G4_SOC_HanLin/L4_shuffled.json", "kao": "knowledge/1_課綱研究/社會/四下/翰林/KL4_四下_翰林_L4_家鄉的新商機_考古題與討論.md", "rec": "knowledge/1_課綱研究/社會/四下/翰林/KL4_四下_翰林_L4_家鄉的新商機_單課研究紀錄.md", "idx": [0, 1]}, {"key": "G4_SOC_KangHsuan_L2", "dir": "G4_SOC_KangHsuan", "n": 2, "title": "家鄉的產業（下）", "shuffled": "jobs/_goal-work/G4_SOC_KangHsuan/L2_shuffled.json", "kao": "knowledge/1_課綱研究/社會/四下/康軒/KL4_四下_康軒_L2_家鄉的產業下_考古題與討論.md", "rec": "knowledge/1_課綱研究/社會/四下/康軒/KL4_四下_康軒_L2_家鄉的產業下_單課研究紀錄.md", "idx": [0]}, {"key": "G4_SOC_KangHsuan_L3", "dir": "G4_SOC_KangHsuan", "n": 3, "title": "家鄉的人口與交通（上）", "shuffled": "jobs/_goal-work/G4_SOC_KangHsuan/L3_shuffled.json", "kao": "knowledge/1_課綱研究/社會/四下/康軒/KL4_四下_康軒_L3_家鄉的人口與交通上_考古題與討論.md", "rec": "knowledge/1_課綱研究/社會/四下/康軒/KL4_四下_康軒_L3_家鄉的人口與交通上_單課研究紀錄.md", "idx": [9]}, {"key": "G4_SOC_KangHsuan_L6", "dir": "G4_SOC_KangHsuan", "n": 6, "title": "家鄉風情畫（下）", "shuffled": "jobs/_goal-work/G4_SOC_KangHsuan/L6_shuffled.json", "kao": "knowledge/1_課綱研究/社會/四下/康軒/KL4_四下_康軒_L6_家鄉風情畫下_考古題與討論.md", "rec": "knowledge/1_課綱研究/社會/四下/康軒/KL4_四下_康軒_L6_家鄉風情畫下_單課研究紀錄.md", "idx": [0, 2, 3, 5, 6, 8, 10, 11, 13, 14, 16, 17, 20, 21, 23, 24, 26, 27, 28, 29]}, {"key": "G4_SOC_NanYi_L1", "dir": "G4_SOC_NanYi", "n": 1, "title": "家鄉的地形與生活", "shuffled": "jobs/_goal-work/G4_SOC_NanYi/L1_shuffled.json", "kao": "knowledge/1_課綱研究/社會/四下/南一/KL4_四下_南一_L1_家鄉的地形與生活_考古題與討論.md", "rec": "knowledge/1_課綱研究/社會/四下/南一/KL4_四下_南一_L1_家鄉的地形與生活_單課研究紀錄.md", "idx": [19]}]

const SCHEMA = {
  type: 'object',
  properties: {
    judgments: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          idx: { type: 'integer' },
          belongs: { type: 'boolean' },
          match: { type: 'boolean' },
          reason: { type: 'string', description: '判斷理由(扣到哪個素材錨點;或為何不對應)' },
        },
        required: ['idx', 'belongs', 'match', 'reason'],
      },
    },
  },
  required: ['judgments'],
}

function prompt(L) {
  return `你是國小四年級社會科命題審查官,依《驗證與盲測準則》標準複審「${L.title}」這一課的指定題目。

讀取：
- 完整題目(含標示正解)：${L.shuffled}（只審 idx ${JSON.stringify(L.idx)} 這幾題）
- 本課單課研究紀錄(課綱對應/核心概念/課程元素地圖)：${L.rec}
- 本課考古題與討論(真實段考樣本)：${L.kao}

【關鍵判準 — 準則 §文本錯位/§QL定義】
"對應該課素材" 的錨點有三類,**地位對等,符合任一即算 belongs=true**：
①單課研究紀錄的課程元素/課綱對應碼(如 Bc-II-2、2b-II-2 等)；②考古題；③課文。
⚠️ 考古題只是「真實段考的抽樣」,不是本課完整考試範疇。**不得因「考古題樣本裡沒出現這類題」就判不屬**——只要題目扣到單課研究紀錄列出的核心概念/課綱元素,即屬本課。

對每個指定 idx 判斷：
1. belongs：題目主題是否落在本課單課研究紀錄的核心概念/課綱元素範圍內(或考古題/課文)。依上述三錨點對等原則。
2. match：題幹與標示正解(answer_index)是否正確無誤、無事實錯誤、無編造、非格式崩壞(題幹須為完整問句、選項須正常)。
3. reason：說明扣到哪個素材錨點(課綱碼/概念/考點);若 false 簡述原因。

回傳結構化結果,只含指定 idx。`
}

log(`校正重判 ${lessons.length} 課 / ${lessons.reduce((s, l) => s + l.idx.length, 0)} 題`)

const results = await parallel(lessons.map(L => () =>
  agent(prompt(L), { label: `rejudge:${L.key}`, phase: '校正重判', model: 'sonnet', schema: SCHEMA })
    .then(r => ({ key: L.key, dir: L.dir, n: L.n, idx: L.idx, judgments: r?.judgments || null }))
))

return results
