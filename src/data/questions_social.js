// 國小三年級社會題目數據庫
// 您可以在此文件中添加、修改或刪除題目

export const CATEGORIES = {
  COMMUNITY: '社區',
  FAMILY: '家庭',
  SCHOOL: '學校',
  ENVIRONMENT: '環境',
  CULTURE: '文化',
  ECONOMY: '經濟'
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
    category: '社區',
    question: '社區中常見的公共設施不包括下列哪一項？',
    options: ['公園', '圖書館', '私人住宅', '運動場'],
    correctAnswer: 2,
    explanation: '私人住宅屬於個人財產，不是公共設施。公共設施是大家都可以使用的設施。',
    funFact: '公共設施是為了服務社區居民而設置的，讓大家的生活更方便！'
  },
  {
    id: 2,
    category: '家庭',
    question: '家庭的主要功能不包括下列哪一項？',
    options: ['提供生活照顧', '提供情感支持', '賺取金錢', '教育子女'],
    correctAnswer: 2,
    explanation: '賺取金錢是工作場所的功能，不是家庭的主要功能。',
    funFact: '家庭是我們最重要的支持系統，提供愛與關懷！'
  },
  {
    id: 3,
    category: '學校',
    question: '學校的主要功能是什麼？',
    options: ['賺錢', '提供教育', '生產商品', '經營商店'],
    correctAnswer: 1,
    explanation: '學校的主要功能是提供教育，讓學生學習知識和技能。',
    funFact: '學校是我們學習知識、培養品德的重要場所！'
  },
  {
    id: 4,
    category: '環境',
    question: '下列哪種行為有助於保護環境？',
    options: ['亂丟垃圾', '節約用水', '浪費電力', '破壞樹木'],
    correctAnswer: 1,
    explanation: '節約用水可以保護水資源，是保護環境的好行為。',
    funFact: '保護環境從小事做起，每個人都可以貢獻一份力量！'
  },
  {
    id: 5,
    category: '文化',
    question: '傳統節慶的主要意義是什麼？',
    options: ['賺錢', '傳承文化', '放假', '購物'],
    correctAnswer: 1,
    explanation: '傳統節慶是為了傳承文化、凝聚社區情感。',
    funFact: '傳統節慶讓我們了解祖先的智慧和文化！'
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

