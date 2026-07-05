export const meta = {
  name: 'g4-chi-diag',
  description: '四下國語康軒+南一24課文本錯位診斷',
  phases: [{ title: '診斷', detail: '逐課讀課文全文+30題,分類錨定本課/通用萬用/錨到別課' }],
}

const PUBS = [
  { key: 'KangHsuan', dir: 'KangHsuan', code: 'KANGHSUAN', name: '康軒', lessons: {
    1: '一束鮮花', 2: '心動不如行動', 3: '選拔動物之星', 4: '米食飄香', 5: '讀書報告——藍色小洋裝', 6: '我愛鹿港',
    7: '未來的模樣', 8: '動物老師的智慧', 9: '向太空出發', 10: '小青蛙想看海', 11: '窗前的月光', 12: '如來佛的手掌心',
  }},
  { key: 'NanYi', dir: 'NanYi', code: 'NANYI', name: '南一', lessons: {
    1: '龍慶元宵', 2: '看戲', 3: '舞吧！小飛魚', 4: '蝶之生', 5: '活出生命奇蹟', 6: '走過就知道',
    7: '不一樣的母親花', 8: '屋頂上的野貓', 9: '用一公斤愛嘉明湖', 10: '想像與發明', 11: '小事物大驚奇', 12: '九蛙傳奇',
  }},
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

function prompt(pub, n, title) {
  return `你是國小四年級國語科課程審查官。任務：判斷「${title}」這一課(${pub.name}版)的既有題目是否真的扣緊本課課文內容。

讀取：
- 本課單課研究紀錄(含課文全文錄製 RC-01) knowledge/1_課綱研究/國語/四下/${pub.name}/KL4_四下_${pub.name}_L${n}_${title}_單課研究紀錄.md
- 本課考古題與討論 knowledge/1_課綱研究/國語/四下/${pub.name}/KL4_四下_${pub.name}_L${n}_${title}_考古題與討論.md
- 現有主檔題目 question/platform/G4/Chinese/S2/${pub.dir}/G4_S2_CHI_${pub.code}_L${n}.json (30題,idx 0~29)

【判準】對每一題判斷：
- **anchored**：題目具體引用本課課文的情節/人物/意象/字詞/主題，換成別課課文就答不出來或不合理。
- **generic**：題目是「小明/小華在...」的通用情境+抽象美德詞(感恩/同理心/成長/誠實)，換成任何一課課文都能套用，不需讀過本課課文也能作答——這是套版填充題，即使選項看起來合理，也判 generic。
- **wrong_lesson**：題目明確引用了「另一篇」課文的具體內容(如非本課的地名/人物/情節)，錨錯課。

嚴格標準：**「學生不必讀《${title}》這篇課文就能答對」的題，一律不算 anchored。**

對全部30題逐題分類，並在 summary 用一句話總結本課錯位規模(anchored幾題/generic幾題/wrong_lesson幾題)。`
}

const tasks = []
for (const pub of PUBS) {
  for (let n = 1; n <= 12; n++) {
    tasks.push({ pub, n, title: pub.lessons[n] })
  }
}

const results = await parallel(tasks.map(t => () =>
  agent(prompt(t.pub, t.n, t.title), { label: `diag:${t.pub.key}_L${t.n}`, phase: '診斷', model: 'sonnet', schema: SCHEMA })
    .then(r => ({ pub: t.pub.key, n: t.n, title: t.title, classifications: r?.classifications || null, summary: r?.summary || null }))
))

return results
