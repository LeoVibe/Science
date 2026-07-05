export const meta = {
  name: 'g4-chi-hanlin-diag',
  description: '四下國語翰林12課文本錯位診斷',
  phases: [{ title: '診斷', detail: '逐課讀課文全文+30題,分類錨定本課/通用萬用/錨到別課' }],
}

const lessons = [
  { n: 1, title: '稻間鴨' }, { n: 2, title: '綠色魔法學校' }, { n: 3, title: '石虎兄妹' },
  { n: 4, title: '阿里棒棒' }, { n: 5, title: '快樂兒童日' }, { n: 6, title: '阿公的祕密' },
  { n: 7, title: '棒球英雄夢' }, { n: 8, title: '夢幻全壘打' }, { n: 9, title: '單車遊日月潭' },
  { n: 10, title: '孫悟空三借芭蕉扇' }, { n: 11, title: '最後一片葉子' }, { n: 12, title: '閱讀課' },
]

const SCHEMA = {
  type: 'object',
  properties: {
    classifications: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          idx: { type: 'integer' },
          category: { type: 'string', enum: ['anchored', 'generic', 'wrong_lesson'] },
          note: { type: 'string' },
        },
        required: ['idx', 'category', 'note'],
      },
    },
    summary: { type: 'string' },
  },
  required: ['classifications', 'summary'],
}

function prompt(L) {
  return `你是國小四年級國語科課程審查官。任務：判斷「${L.title}」這一課的既有題目是否真的扣緊本課課文內容。

讀取：
- 本課單課研究紀錄(含課文全文錄製 RC-01) knowledge/1_課綱研究/國語/四下/翰林/KL4_四下_翰林_L${L.n}_${L.title}_單課研究紀錄.md
- 本課考古題與討論 knowledge/1_課綱研究/國語/四下/翰林/KL4_四下_翰林_L${L.n}_${L.title}_考古題與討論.md
- 現有主檔題目 question/platform/G4/Chinese/S2/HanLin/G4_S2_CHI_HANLIN_L${L.n}.json (30題,idx 0~29)

【判準】對每一題判斷：
- **anchored**：題目具體引用本課課文的情節/人物/意象/字詞/主題，換成別課課文就答不出來或不合理。
- **generic**：題目是「小明/小華在...」的通用情境+抽象美德詞(感恩/同理心/成長/誠實)，換成任何一課課文都能套用，不需讀過本課課文也能作答——這是套版填充題，即使選項看起來合理，也判 generic。
- **wrong_lesson**：題目明確引用了「另一篇」課文的具體內容(如非本課的地名/人物/情節)，錨錯課。

嚴格標準：**「學生不必讀《${L.title}》這篇課文就能答對」的題，一律不算 anchored。**

對全部30題逐題分類，並在 summary 用一句話總結本課錯位規模(anchored幾題/generic幾題/wrong_lesson幾題)。`
}

const results = await parallel(lessons.map(L => () =>
  agent(prompt(L), { label: `diag:L${L.n}`, phase: '診斷', model: 'sonnet', schema: SCHEMA })
    .then(r => ({ n: L.n, title: L.title, classifications: r?.classifications || null, summary: r?.summary || null }))
))

return results
