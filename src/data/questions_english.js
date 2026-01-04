// 國小三年級英文題目數據庫
// 您可以在此文件中添加、修改或刪除題目

export const CATEGORIES = {
  VOCABULARY: '單字',
  GRAMMAR: '文法',
  READING: '閱讀',
  CONVERSATION: '會話',
  PHONICS: '發音',
  SENTENCE: '句型'
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
    category: '單字',
    question: 'What is the English word for "蘋果"?',
    options: ['apple', 'orange', 'banana', 'grape'],
    correctAnswer: 0,
    explanation: 'Apple is the English word for "蘋果".',
    funFact: 'An apple a day keeps the doctor away! (一天一蘋果，醫生遠離我)'
  },
  {
    id: 2,
    category: '單字',
    question: 'What is the English word for "貓"?',
    options: ['dog', 'cat', 'bird', 'fish'],
    correctAnswer: 1,
    explanation: 'Cat is the English word for "貓".',
    funFact: 'Cats are one of the most popular pets in the world!'
  },
  {
    id: 3,
    category: '文法',
    question: 'Which sentence is correct?',
    options: ['I am a student.', 'I is a student.', 'I are a student.', 'I be a student.'],
    correctAnswer: 0,
    explanation: 'The correct sentence is "I am a student." because "I" goes with "am".',
    funFact: 'In English, "I" always uses "am", "you" uses "are", and "he/she/it" uses "is"!'
  },
  {
    id: 4,
    category: '會話',
    question: 'How do you greet someone in the morning?',
    options: ['Good night', 'Good morning', 'Good afternoon', 'Goodbye'],
    correctAnswer: 1,
    explanation: 'We say "Good morning" to greet someone in the morning.',
    funFact: 'In English, we use different greetings for different times of the day!'
  },
  {
    id: 5,
    category: '單字',
    question: 'What color is the sky on a sunny day?',
    options: ['red', 'blue', 'green', 'yellow'],
    correctAnswer: 1,
    explanation: 'The sky is blue on a sunny day.',
    funFact: 'The sky appears blue because of how sunlight scatters in the atmosphere!'
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

