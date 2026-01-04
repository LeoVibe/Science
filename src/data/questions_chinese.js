// 國小三年級國語題目數據庫
// 您可以在此文件中添加、修改或刪除題目

export const CATEGORIES = {
  VOCABULARY: '字詞',
  READING: '閱讀理解',
  GRAMMAR: '語法',
  WRITING: '寫作',
  POETRY: '詩詞',
  CLASSICS: '經典文學'
}

export const QUESTION_TYPES = {
  MULTIPLE_CHOICE: '選擇題',
  TRUE_FALSE: '是非題',
  FILL_BLANK: '填空題'
}

// 題目數據
export const QUESTIONS = [
  {
    id: 1,
    category: '字詞',
    question: '下列哪個詞語的意思是「非常高興」？',
    options: ['興高采烈', '垂頭喪氣', '心平氣和', '忐忑不安'],
    correctAnswer: 0,
    explanation: '「興高采烈」形容人非常高興、興奮的樣子。',
    funFact: '這個成語出自《史記》，形容人精神飽滿、情緒高昂。'
  },
  {
    id: 2,
    category: '字詞',
    question: '「忐忑不安」中的「忐忑」是什麼意思？',
    options: ['高興', '擔心', '平靜', '生氣'],
    correctAnswer: 1,
    explanation: '「忐忑」是指心裡不安、擔心的意思。',
    funFact: '「忐忑」兩個字都是「心」字旁，都和心情有關喔！'
  },
  {
    id: 3,
    category: '閱讀理解',
    question: '「春眠不覺曉，處處聞啼鳥」這句詩描寫的是什麼季節？',
    options: ['春天', '夏天', '秋天', '冬天'],
    correctAnswer: 0,
    explanation: '這句詩出自孟浩然的《春曉》，描寫春天的景象。',
    funFact: '這是唐代詩人孟浩然的著名作品，描寫春天早晨醒來的情景。'
  },
  {
    id: 4,
    category: '語法',
    question: '下列哪個句子使用了「比喻」的修辭手法？',
    options: ['他跑得很快', '他像風一樣跑得很快', '他跑得比別人快', '他跑得很快很快'],
    correctAnswer: 1,
    explanation: '「像風一樣」使用了比喻的修辭手法，將人比作風。',
    funFact: '比喻是將一個事物比作另一個事物的修辭手法，讓描述更生動！'
  },
  {
    id: 5,
    category: '字詞',
    question: '「小心翼翼」的意思是？',
    options: ['非常小心', '非常大膽', '非常快樂', '非常生氣'],
    correctAnswer: 0,
    explanation: '「小心翼翼」形容做事非常小心謹慎。',
    funFact: '這個成語出自《詩經》，原本形容恭敬謹慎的樣子。'
  }
]

// 獲取所有分類
export function getAllCategories() {
  return Object.values(CATEGORIES)
}

// 根據分類獲取題目
export function getQuestionsByCategory(category) {
  return QUESTIONS.filter(q => q.category === category)
}

// 獲取隨機題目
export function getRandomQuestions(count, history = {}) {
  const availableQuestions = [...QUESTIONS]
  
  // 如果有歷史記錄，優先選擇錯題
  if (history && Object.keys(history).length > 0) {
    availableQuestions.sort((a, b) => {
      const aRecord = history[a.id]
      const bRecord = history[b.id]
      const aWeight = aRecord ? (aRecord.wrong > 0 ? 0.8 : 0.2) : 1.0
      const bWeight = bRecord ? (bRecord.wrong > 0 ? 0.8 : 0.2) : 1.0
      return bWeight - aWeight
    })
  }
  
  // 隨機打亂
  const shuffled = [...availableQuestions].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

// 只獲取選擇題（4選項）
export function getMultipleChoiceOnly(questions) {
  return questions.filter(q => 
    q.options && 
    Array.isArray(q.options) &&
    q.options.length === 4 &&
    typeof q.correctAnswer === 'number'
  )
}

