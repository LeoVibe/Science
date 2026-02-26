#!/usr/bin/env node

/**
 * 測試題庫載入功能（Node.js 版本）
 * 直接讀取檔案系統，模擬平台載入流程
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PROJECT_ROOT = path.resolve(__dirname, '..')
const PLATFORM_DIR = path.join(PROJECT_ROOT, 'public', 'questions', 'platform')

const PUBLISHER_META_MAP = {
  '康軒': 'kang_hsuan',
  '南一': 'nan_yi',
  '翰林': 'han_lin'
}

/** G3-G6 路徑用「英文」，G1-G2 用「英語」 */
function getSubjectForPath(grade, subject) {
  if (grade >= 3 && subject === '英語') return '英文'
  return subject
}

/**
 * 載入 manifest.json
 */
function loadManifest(grade, subject, semester, publisher) {
  const manifestPath = path.join(
    PLATFORM_DIR,
    `G${grade}`,
    subject,
    `S${semester}`,
    publisher,
    'manifest.json'
  )
  
  if (!fs.existsSync(manifestPath)) {
    return null
  }
  
  const content = fs.readFileSync(manifestPath, 'utf-8')
  return JSON.parse(content)
}

/**
 * 載入題庫檔案
 */
function loadQuestionFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(content)
}

/**
 * 模擬平台載入流程（路徑科目與 index.js 一致：G3-G6 英語→英文）
 */
function loadQuestions(grade, subject, semester, publisher) {
  const pathSubject = getSubjectForPath(grade, subject)
  const basePath = path.join(
    PLATFORM_DIR,
    `G${grade}`,
    pathSubject,
    `S${semester}`,
    publisher
  )
  
  if (!fs.existsSync(basePath)) {
    return { questions: [], error: '目錄不存在' }
  }
  
  const manifest = loadManifest(grade, pathSubject, semester, publisher)
  if (!manifest || !manifest.files || manifest.files.length === 0) {
    return { questions: [], error: 'manifest.json 不存在或為空' }
  }
  
  const publisherMeta = PUBLISHER_META_MAP[publisher]
  const semesterMeta = `semester_${semester}`
  const gradeMeta = `grade_${grade}`
  
  const allQuestions = []
  
  // 載入所有檔案
  for (const fileName of manifest.files) {
    const filePath = path.join(basePath, fileName)
    
    if (!fs.existsSync(filePath)) {
      console.warn(`  ⚠️  檔案不存在: ${fileName}`)
      continue
    }
    
    try {
      const data = loadQuestionFile(filePath)
      
      // 驗證 meta
      if (!data.meta || !data.questions) {
        console.warn(`  ⚠️  檔案格式不正確: ${fileName}`)
        continue
      }
      
      const meta = data.meta
      
      // 檢查 meta 是否符合條件（subject 用 pathSubject，與目錄一致）
      if (meta.grade !== gradeMeta ||
          meta.semester !== semesterMeta ||
          meta.subject !== pathSubject ||
          meta.publisher !== publisherMeta) {
        console.warn(`  ⚠️  meta 不符合條件: ${fileName}`)
        continue
      }
      
      // 處理題目
      const processedQuestions = data.questions.map(q => {
        let answer = q.answer
        let correctAnswer = q.answer
        
        // 處理選擇題答案
        if (q.type === 'multiple_choice' && q.options) {
          if (typeof answer === 'string') {
            const answerIndex = q.options.findIndex(opt => 
              opt === answer || opt.trim() === answer.trim()
            )
            if (answerIndex >= 0) {
              answer = answerIndex
              correctAnswer = answerIndex
            }
          } else if (typeof answer === 'number') {
            if (answer >= 0 && answer < q.options.length) {
              correctAnswer = answer
            }
          }
        } else if (q.type === 'true_false') {
          if (answer === 'True' || answer === true) {
            answer = 0
            correctAnswer = 0
          } else if (answer === 'False' || answer === false) {
            answer = 1
            correctAnswer = 1
          }
          if (!q.options || q.options.length === 0) {
            q.options = ['是', '否']
          }
        }
        
        return {
          ...q,
          answer: answer,
          correctAnswer: correctAnswer,
          category: q.category || meta.lesson || meta.title,
          lesson: meta.lesson,
          lessonTitle: meta.title,
          lessonOrder: meta.order
        }
      })
      
      allQuestions.push(...processedQuestions)
    } catch (error) {
      console.warn(`  ⚠️  載入檔案失敗: ${fileName} - ${error.message}`)
    }
  }
  
  // 按課程順序排序
  allQuestions.sort((a, b) => {
    if (a.lessonOrder !== undefined && b.lessonOrder !== undefined) {
      return a.lessonOrder - b.lessonOrder
    }
    return 0
  })
  
  return {
    questions: allQuestions,
    getAllCategories: () => {
      const categories = [...new Set(allQuestions.map(q => q.category || q.lesson).filter(Boolean))]
      return categories
    },
    getQuestionsByCategory: (category) => {
      return allQuestions.filter(q => (q.category || q.lesson) === category)
    }
  }
}

/**
 * 測試函數
 */
async function testLoadQuestions() {
  console.log('🧪 開始測試題庫載入功能（Node.js 版本）...\n')
  
  const testCases = [
    { grade: 3, subject: '自然', semester: 1, publisher: '康軒' },
    { grade: 3, subject: '國語', semester: 1, publisher: '南一' },
    { grade: 4, subject: '自然', semester: 1, publisher: '康軒' },
    { grade: 3, subject: '數學', semester: 1, publisher: '翰林' },
    { grade: 5, subject: '英語', semester: 1, publisher: '康軒' }, // 路徑為「英文」目錄
  ]
  
  let successCount = 0
  let failCount = 0
  
  for (const testCase of testCases) {
    const { grade, subject, semester, publisher } = testCase
    console.log(`\n📚 測試載入: ${grade}年級 ${subject} ${semester === 1 ? '上' : '下'}學期 ${publisher}`)
    
    const module = loadQuestions(grade, subject, semester, publisher)
    
    if (module.error) {
      console.log(`  ❌ 載入失敗：${module.error}`)
      failCount++
      continue
    }
    
    const questions = module.questions || []
    console.log(`  ✅ 載入成功：${questions.length} 題`)
    
    if (questions.length > 0) {
      successCount++
      
      // 檢查題目格式
      const sample = questions[0]
      console.log(`  📝 範例題目：`)
      console.log(`     ID: ${sample.id}`)
      console.log(`     類型: ${sample.type}`)
      console.log(`     題目: ${sample.question?.substring(0, 50)}...`)
      
      if (sample.type === 'multiple_choice') {
        console.log(`     選項數: ${sample.options?.length || 0}`)
        console.log(`     答案索引: ${sample.answer} (類型: ${typeof sample.answer})`)
      }
      
      // 檢查分類
      const categories = module.getAllCategories()
      console.log(`  📂 課程分類: ${categories.length} 個`)
      if (categories.length > 0) {
        console.log(`     分類: ${categories.slice(0, 5).join(', ')}`)
      }
      
      // 統計題型
      const typeStats = {}
      questions.forEach(q => {
        typeStats[q.type] = (typeStats[q.type] || 0) + 1
      })
      console.log(`  📊 題型統計: ${Object.entries(typeStats).map(([t, c]) => `${t}:${c}`).join(', ')}`)
    } else {
      console.log(`  ⚠️  警告：載入的題目為空`)
      failCount++
    }
  }
  
  console.log(`\n📊 測試結果：`)
  console.log(`  成功: ${successCount}/${testCases.length}`)
  console.log(`  失敗: ${failCount}/${testCases.length}`)
  
  if (failCount === 0) {
    console.log('\n✅ 所有測試通過！')
    process.exit(0)
  } else {
    console.log('\n❌ 部分測試失敗，請檢查上述錯誤訊息')
    process.exit(1)
  }
}

testLoadQuestions().catch(console.error)
