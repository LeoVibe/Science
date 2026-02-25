// 轉換腳本：將 questions.js 轉換為新格式的 JSON 檔案
import { QUESTIONS } from './src/data/questions.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 定義單元對應的課次
const units = [
  {
    lesson: 'Sci1',
    title: '多采多姿的植物',
    startId: 1,
    endId: 25,
    category: '植物的身體'
  },
  {
    lesson: 'Sci2',
    title: '神奇的磁鐵',
    startId: 26,
    endId: 50,
    category: '神奇的磁鐵'
  },
  {
    lesson: 'Sci3',
    title: '奇妙的空氣',
    startId: 51,
    endId: 75,
    category: '奇妙的空氣'
  },
  {
    lesson: 'Sci4',
    title: '廚房裡的科學-溶解',
    startId: 76,
    endId: 100,
    category: '廚房裡的科學'
  }
]

// 轉換函數：將舊格式轉換為新格式
function convertQuestion(oldQ, order) {
  const newQ = {
    id: String(oldQ.id),
    type: 'multiple_choice',
    question: oldQ.question,
    options: oldQ.options,
    answer: oldQ.options[oldQ.correctAnswer], // 轉換索引為選項文字
    explanation: oldQ.explanation
  }
  return newQ
}

// 為每個單元創建 JSON 檔案
units.forEach((unit, unitIndex) => {
  // 篩選該單元的題目
  const unitQuestions = QUESTIONS.filter(q => 
    q.id >= unit.startId && q.id <= unit.endId
  )
  
  // 轉換題目格式
  const convertedQuestions = unitQuestions.map((q, index) => 
    convertQuestion(q, index + 1)
  )
  
  // 創建 meta 資料
  const meta = {
    grade: 'grade_3',
    semester: 'semester_1',
    subject: '自然',
    publisher: 'kang_hsuan',
    lesson: unit.lesson,
    order: unitIndex + 1,
    title: unit.title,
    verified: true,
    verification_source: '現有題庫轉換'
  }
  
  // 組合完整的 JSON 結構
  const jsonData = {
    meta: meta,
    questions: convertedQuestions
  }
  
  // 檔案名稱
  const filename = `${unit.lesson}_${unit.title}.json`
  const filepath = path.join(
    __dirname,
    'questions',
    'platform',
    'G3',
    '自然',
    'S1',
    '康軒',
    filename
  )
  
  // 確保目錄存在
  const dir = path.dirname(filepath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  
  // 寫入檔案（使用 2 空格縮排，UTF-8）
  fs.writeFileSync(
    filepath,
    JSON.stringify(jsonData, null, 2),
    'utf8'
  )
  
  console.log(`✓ 已創建: ${filename} (${convertedQuestions.length} 題)`)
})

console.log('\n轉換完成！')
