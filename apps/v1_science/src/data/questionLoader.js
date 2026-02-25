// 題庫載入器：從 JSON 檔案讀取題目並轉換為組件可用的格式

// 載入所有題庫檔案（使用相對路徑，從 src/data/ 到專案根目錄）
const questionModules = import.meta.glob('/questions/platform/**/*.json', { eager: true, import: 'default' })

// 分類映射：將 meta.title 映射到舊的分類名稱
const categoryMap = {
  '多采多姿的植物': '植物的身體',
  '神奇的磁鐵': '神奇的磁鐵',
  '奇妙的空氣': '奇妙的空氣',
  '廚房裡的科學-溶解': '廚房裡的科學'
}

// 轉換函數：將新格式轉換為組件可用的格式
function convertToComponentFormat(jsonData) {
  const { meta, questions } = jsonData
  
  return questions.map(q => {
    // 找出正確答案的索引
    let correctAnswerIndex = -1
    if (q.type === 'multiple_choice' && q.options && q.answer) {
      correctAnswerIndex = q.options.findIndex(opt => opt === q.answer)
    } else if (q.type === 'true_false') {
      // 是非題：True = 0, False = 1
      correctAnswerIndex = q.answer === 'True' ? 0 : 1
    }
    
    // 從 meta.title 映射到分類名稱，如果題目有 category 則優先使用
    const category = q.category || categoryMap[meta.title] || meta.title || meta.subject
    
    return {
      id: parseInt(q.id) || q.id, // 保持數字 ID 以兼容現有代碼
      category: category,
      question: q.question,
      options: q.options || (q.type === 'true_false' ? ['True', 'False'] : []),
      correctAnswer: correctAnswerIndex,
      explanation: q.explanation || '',
      type: q.type,
      meta: meta // 保留 meta 資訊以供未來使用
    }
  })
}

// 載入所有題目
let allQuestions = []
let allCategories = new Set()

try {
  // 遍歷所有載入的 JSON 檔案
  Object.values(questionModules).forEach((jsonData, index) => {
    if (jsonData) {
      const converted = convertToComponentFormat(jsonData)
      allQuestions.push(...converted)
      
      // 收集所有分類
      converted.forEach(q => {
        if (q.category) {
          allCategories.add(q.category)
        }
      })
    }
  })
  
  console.log(`已載入 ${allQuestions.length} 題，來自 ${Object.keys(questionModules).length} 個檔案`)
  console.log('分類:', Array.from(allCategories))
} catch (error) {
  console.error('載入題庫時發生錯誤:', error)
  // 如果載入失敗，使用空陣列
  allQuestions = []
}

// 導出題目陣列（兼容舊格式）
export const QUESTIONS = allQuestions

// 根據分類獲取題目
export function getQuestionsByCategory(category) {
  return QUESTIONS.filter(q => q.category === category)
}

// 獲取所有分類
export function getAllCategories() {
  return Array.from(allCategories)
}

// 根據答題歷史調整題目出現概率
function getQuestionWeight(questionId, history) {
  if (!history || !history[questionId]) {
    return 1.0 // 未答過的題目正常權重
  }
  
  const record = history[questionId]
  const accuracy = record.total > 0 ? record.correct / record.total : 1.0
  
  // 答錯的題目有60%的重複出現率（權重設為6.0，更容易被選中）
  if (record.wrong > 0) {
    return 6.0
  }
  
  // 答對的題目只有10%的重複出現率（權重設為0.1，更不容易被選中）
  if (accuracy >= 0.8 && record.correct > 0) {
    return 0.1
  }
  
  // 其他情況正常權重
  return 1.0
}

// 隨機獲取題目（考慮答題歷史）
export function getRandomQuestions(count = 10, history = null) {
  // 如果沒有歷史記錄，使用簡單隨機
  if (!history) {
    const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, Math.min(count, QUESTIONS.length))
  }
  
  // 根據權重選擇題目
  const weightedQuestions = QUESTIONS.map(q => ({
    question: q,
    weight: getQuestionWeight(q.id, history)
  }))
  
  // 計算總權重
  const totalWeight = weightedQuestions.reduce((sum, item) => sum + item.weight, 0)
  
  // 根據權重隨機選擇
  const selected = []
  const available = [...weightedQuestions]
  
  while (selected.length < count && available.length > 0) {
    let random = Math.random() * totalWeight
    let currentWeight = 0
    
    for (let i = 0; i < available.length; i++) {
      currentWeight += available[i].weight
      if (random <= currentWeight) {
        selected.push(available[i].question)
        totalWeight -= available[i].weight
        available.splice(i, 1)
        break
      }
    }
  }
  
  // 如果選出的題目不夠，用隨機填充
  if (selected.length < count) {
    const remaining = QUESTIONS.filter(q => !selected.find(s => s.id === q.id))
    const shuffled = remaining.sort(() => Math.random() - 0.5)
    selected.push(...shuffled.slice(0, count - selected.length))
  }
  
  return selected
}
