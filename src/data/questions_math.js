// 國小三年級數學題目數據庫
// 您可以在此文件中添加、修改或刪除題目

export const CATEGORIES = {
  ADDITION: '加法',
  SUBTRACTION: '減法',
  MULTIPLICATION: '乘法',
  DIVISION: '除法',
  GEOMETRY: '幾何',
  MEASUREMENT: '測量'
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
    category: '加法',
    question: '小明有 25 顆糖果，小華給他 18 顆，請問小明現在有幾顆糖果？',
    options: ['33 顆', '43 顆', '53 顆', '63 顆'],
    correctAnswer: 1,
    explanation: '25 + 18 = 43，所以小明現在有 43 顆糖果。',
    funFact: '加法就是把兩個數字合在一起計算！'
  },
  {
    id: 2,
    category: '減法',
    question: '書店裡有 87 本書，賣出了 35 本，還剩下幾本書？',
    options: ['42 本', '52 本', '62 本', '72 本'],
    correctAnswer: 1,
    explanation: '87 - 35 = 52，所以還剩下 52 本書。',
    funFact: '減法就是從一個數字中拿走另一個數字！'
  },
  {
    id: 3,
    category: '乘法',
    question: '一盒鉛筆有 8 支，買了 5 盒，總共有幾支鉛筆？',
    options: ['35 支', '40 支', '45 支', '50 支'],
    correctAnswer: 1,
    explanation: '8 × 5 = 40，所以總共有 40 支鉛筆。',
    funFact: '乘法是加法的快速計算方法！8 × 5 就是 8 + 8 + 8 + 8 + 8'
  },
  {
    id: 4,
    category: '除法',
    question: '老師要把 48 顆糖果平均分給 6 個小朋友，每個小朋友可以分到幾顆？',
    options: ['6 顆', '7 顆', '8 顆', '9 顆'],
    correctAnswer: 2,
    explanation: '48 ÷ 6 = 8，所以每個小朋友可以分到 8 顆糖果。',
    funFact: '除法就是把東西平均分配給每個人！'
  },
  {
    id: 5,
    category: '幾何',
    question: '一個正方形有幾條邊？',
    options: ['3 條', '4 條', '5 條', '6 條'],
    correctAnswer: 1,
    explanation: '正方形有 4 條邊，而且每條邊都一樣長。',
    funFact: '正方形是四邊形的一種，四個角都是直角！'
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

