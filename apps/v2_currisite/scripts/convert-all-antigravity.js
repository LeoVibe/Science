#!/usr/bin/env node
/**
 * 將 antigravity 的所有年級題庫轉換為項目所需的 JS 模組格式
 * 
 * 使用方法：
 * node scripts/convert-all-antigravity.js
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 配置
const ANTIGRAVITY_DIR = '/Users/s389080/Documents/文件 - NM389080/miaw/antigravity/questions'
const TARGET_DIR = '/Users/s389080/Documents/文件 - NM389080/miaw/Cursor/Science-Standalone/src/data/library'

// 科目映射
const SUBJECT_MAP = {
  '國語': 'Chinese',
  '數學': 'Math',
  '自然': 'Science',
  '社會': 'Social',
  '英語': 'English',
  '生活': 'Life'
}

// 出版社映射
const PUBLISHER_MAP = {
  '康軒': 'knsh',
  '南一': 'nani',
  '翰林': 'hlm'
}

// 出版社反向映射（从 antigravity 的格式）
const PUBLISHER_REVERSE_MAP = {
  'kang_hsuan': 'knsh',
  'nan_i': 'nani',
  'han_lin': 'hlm',
  '康軒': 'knsh',
  '南一': 'nani',
  '翰林': 'hlm'
}

/**
 * 從 meta 或 lesson 判斷學期
 */
function getSemesterFromMeta(meta, lesson) {
  // 優先使用 meta.semester
  if (meta && meta.semester) {
    if (meta.semester === '上學期' || meta.semester === 1 || meta.semester === '1') {
      return 1
    }
    if (meta.semester === '下學期' || meta.semester === 2 || meta.semester === '2') {
      return 2
    }
  }
  
  // 如果沒有，從 lesson_id 判斷
  if (lesson) {
    const match = lesson.match(/(\d+)/)
    if (match) {
      const num = parseInt(match[1])
      if (lesson.startsWith('L')) {
        return num <= 6 ? 1 : 2
      } else if (lesson.startsWith('M')) {
        return num <= 5 ? 1 : 2
      } else if (lesson.startsWith('Sci')) {
        return num <= 4 ? 1 : 2
      } else if (lesson.startsWith('Life')) {
        return num <= 6 ? 1 : 2
      } else if (lesson.startsWith('E')) {
        return num <= 4 ? 1 : 2
      }
    }
  }
  
  return 1 // 默認上學期
}

/**
 * 將答案從字符串轉換為數字索引
 */
function convertAnswerToIndex(answer, options) {
  if (typeof answer === 'number') {
    return answer
  }
  
  if (typeof answer === 'string') {
    // 處理 True/False
    if (answer === 'True' || answer === 'true' || answer === '是') {
      return 0
    }
    if (answer === 'False' || answer === 'false' || answer === '否') {
      return 1
    }
    
    // 處理字母答案 (A, B, C, D)
    if (answer.length === 1 && /^[A-D]$/i.test(answer)) {
      return answer.toUpperCase().charCodeAt(0) - 65 // A=0, B=1, C=2, D=3
    }
    
    // 在選項中查找匹配
    const index = options.findIndex(opt => opt === answer || opt.includes(answer))
    if (index !== -1) {
      return index
    }
  }
  
  return 0 // 默認返回第一個選項
}

/**
 * 生成題目 ID
 */
function generateQuestionId(grade, subjectCode, semester, publisherCode, index) {
  const subjectPrefix = {
    'Chinese': 'CHI',
    'Math': 'MATH',
    'Science': 'SCI',
    'Social': 'SOC',
    'English': 'ENG',
    'Life': 'LIFE'
  }[subjectCode] || 'UNK'
  
  const publisherPrefix = publisherCode.toUpperCase()
  const paddedIndex = String(index).padStart(3, '0')
  
  return `G${grade}-${subjectPrefix}-S${semester}-${publisherPrefix}-${paddedIndex}`
}

/**
 * 轉換單個 JSON 文件
 */
function convertJsonFile(jsonPath, grade, subjectDir, publisherDir) {
  try {
    const content = fs.readFileSync(jsonPath, 'utf-8')
    const data = JSON.parse(content)
    
    if (!data.questions || !Array.isArray(data.questions)) {
      console.warn(`⚠️  文件 ${jsonPath} 沒有有效的 questions 數組`)
      return []
    }
    
    const meta = data.meta || {}
    const lesson = meta.lesson_id || meta.lesson || ''
    const semester = getSemesterFromMeta(meta, lesson)
    const category = meta.lesson_title || meta.title || lesson || '未分類'
    
    // 轉換問題格式
    const convertedQuestions = data.questions.map((q, idx) => {
      // 處理選項
      let options = []
      let answer = 0
      
      if (q.type === 'multiple_choice' && Array.isArray(q.options)) {
        options = q.options
        answer = convertAnswerToIndex(q.answer, options)
      } else if (q.type === 'phonetic_choice' || q.type === 'word_recognition' || q.type === 'reading_comprehension') {
        // 這些類型也是選擇題
        if (Array.isArray(q.options)) {
          options = q.options
          answer = convertAnswerToIndex(q.answer, options)
        } else {
          return null
        }
      } else if (q.type === 'true_false') {
        // 是非題轉換為選擇題
        options = ['是', '否']
        answer = convertAnswerToIndex(q.answer, options)
      } else if (q.type === 'fill_in_the_blank') {
        // 填空題暫時跳過
        return null
      } else if (Array.isArray(q.options) && q.options.length > 0) {
        // 如果有選項，當作選擇題處理
        options = q.options
        answer = convertAnswerToIndex(q.answer, options)
      } else {
        // 其他類型暫時跳過
        return null
      }
      
      // 確保選項至少有2個
      if (options.length < 2) {
        return null
      }
      
      // 生成 ID
      const subjectCode = SUBJECT_MAP[meta.subject] || subjectDir
      const publisherCode = PUBLISHER_REVERSE_MAP[meta.publisher] || PUBLISHER_MAP[publisherDir] || 'knsh'
      const questionId = generateQuestionId(grade, subjectCode, semester, publisherCode, idx + 1)
      
      return {
        id: questionId,
        semester: semester,
        question: q.question,
        options: options,
        answer: answer,
        category: category,
        explanation: q.explanation || ''
      }
    }).filter(q => q !== null) // 過濾掉 null
    
    return convertedQuestions
  } catch (error) {
    console.error(`❌ 轉換文件失敗 ${jsonPath}:`, error.message)
    return []
  }
}

/**
 * 處理單個科目
 */
function processSubject(grade, subjectName, subjectDir) {
  const subjectPath = path.join(ANTIGRAVITY_DIR, `G${grade}`, subjectName)
  
  if (!fs.existsSync(subjectPath)) {
    console.warn(`⚠️  科目目錄不存在: ${subjectPath}`)
    return
  }
  
  const publishers = fs.readdirSync(subjectPath).filter(item => {
    const itemPath = path.join(subjectPath, item)
    return fs.statSync(itemPath).isDirectory()
  })
  
  for (const publisherDir of publishers) {
    const publisherPath = path.join(subjectPath, publisherDir)
    const jsonFiles = fs.readdirSync(publisherPath)
      .filter(file => file.endsWith('.json'))
      .sort() // 按文件名排序
    
    if (jsonFiles.length === 0) {
      console.warn(`⚠️  沒有找到 JSON 文件: ${publisherPath}`)
      continue
    }
    
    // 按學期分組
    const questionsBySemester = {
      1: [],
      2: []
    }
    
    // 轉換所有 JSON 文件
    for (const jsonFile of jsonFiles) {
      const jsonPath = path.join(publisherPath, jsonFile)
      const questions = convertJsonFile(jsonPath, grade, subjectDir, publisherDir)
      
      // 按學期分組
      questions.forEach(q => {
        questionsBySemester[q.semester].push(q)
      })
    }
    
    // 為每個學期生成 JS 文件
    const publisherCode = PUBLISHER_MAP[publisherDir] || 'knsh'
    
    for (const semester of [1, 2]) {
      const questions = questionsBySemester[semester]
      
      if (questions.length === 0) {
        console.log(`⏭️  跳過空文件: G${grade}/${subjectDir}/s${semester}_${publisherCode}.js`)
        continue
      }
      
      // 重新編號 ID（確保連續）
      questions.forEach((q, idx) => {
        const subjectCode = SUBJECT_MAP[subjectName] || subjectDir
        q.id = generateQuestionId(grade, subjectCode, semester, publisherCode, idx + 1)
      })
      
      // 生成 JS 文件內容
      const jsContent = `// ${subjectName} - ${publisherDir} - ${semester === 1 ? '上學期' : '下學期'}
// 共 ${questions.length} 題

export const questions = ${JSON.stringify(questions, null, 2)}
`
      
      // 寫入文件
      const targetSubjectDir = path.join(TARGET_DIR, `G${grade}`, subjectDir)
      if (!fs.existsSync(targetSubjectDir)) {
        fs.mkdirSync(targetSubjectDir, { recursive: true })
      }
      
      const targetFile = path.join(targetSubjectDir, `s${semester}_${publisherCode}.js`)
      fs.writeFileSync(targetFile, jsContent, 'utf-8')
      
      console.log(`✅ 已生成: ${targetFile} (${questions.length} 題)`)
    }
  }
}

/**
 * 處理單個年級
 */
function processGrade(grade) {
  const gradePath = path.join(ANTIGRAVITY_DIR, `G${grade}`)
  
  if (!fs.existsSync(gradePath)) {
    console.warn(`⚠️  年級目錄不存在: ${gradePath}`)
    return
  }
  
  const subjects = fs.readdirSync(gradePath).filter(item => {
    const itemPath = path.join(gradePath, item)
    return fs.statSync(itemPath).isDirectory() && item !== 'library'
  })
  
  for (const subjectName of subjects) {
    const subjectDir = SUBJECT_MAP[subjectName]
    if (!subjectDir) {
      console.warn(`⚠️  未知科目: ${subjectName}`)
      continue
    }
    
    console.log(`\n📚 處理年級 ${grade} 科目: ${subjectName} (${subjectDir})`)
    processSubject(grade, subjectName, subjectDir)
  }
}

/**
 * 主函數
 */
function main() {
  console.log('🚀 開始轉換 antigravity 所有年級題庫...\n')
  
  // 確保目標目錄存在
  if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true })
  }
  
  // 處理每個年級
  const grades = [1, 2, 3, 4, 5, 6]
  
  for (const grade of grades) {
    console.log(`\n📖 處理年級: G${grade}`)
    processGrade(grade)
  }
  
  console.log('\n✨ 轉換完成！')
}

// 執行
main()

