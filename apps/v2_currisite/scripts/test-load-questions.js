#!/usr/bin/env node

/**
 * 測試題庫載入功能
 * 模擬平台載入流程，驗證是否能正確讀取題庫
 */

import { loadQuestions } from '../src/data/index.js'

async function testLoadQuestions() {
  console.log('🧪 開始測試題庫載入功能...\n')
  
  const testCases = [
    { grade: 3, subject: '自然', semester: 1, publisher: '康軒' },
    { grade: 3, subject: '國語', semester: 1, publisher: '南一' },
    { grade: 4, subject: '自然', semester: 1, publisher: '康軒' },
  ]
  
  for (const testCase of testCases) {
    const { grade, subject, semester, publisher } = testCase
    console.log(`\n📚 測試載入: ${grade}年級 ${subject} ${semester === 1 ? '上' : '下'}學期 ${publisher}`)
    
    try {
      const module = await loadQuestions(grade, subject, semester, publisher)
      
      if (!module || !module.questions) {
        console.log(`  ❌ 載入失敗：未返回有效模組`)
        continue
      }
      
      const questions = module.questions || []
      console.log(`  ✅ 載入成功：${questions.length} 題`)
      
      if (questions.length > 0) {
        // 檢查題目格式
        const sample = questions[0]
        console.log(`  📝 範例題目：`)
        console.log(`     ID: ${sample.id}`)
        console.log(`     類型: ${sample.type}`)
        console.log(`     題目: ${sample.question?.substring(0, 50)}...`)
        
        if (sample.type === 'multiple_choice') {
          console.log(`     選項數: ${sample.options?.length || 0}`)
          console.log(`     答案: ${sample.answer} (類型: ${typeof sample.answer})`)
        }
        
        // 檢查分類
        const categories = module.getAllCategories()
        console.log(`  📂 課程分類: ${categories.length} 個`)
        if (categories.length > 0) {
          console.log(`     範例: ${categories.slice(0, 3).join(', ')}`)
        }
      } else {
        console.log(`  ⚠️  警告：載入的題目為空`)
      }
    } catch (error) {
      console.log(`  ❌ 載入失敗：${error.message}`)
      console.error(error)
    }
  }
  
  console.log('\n✨ 測試完成')
}

testLoadQuestions().catch(console.error)
