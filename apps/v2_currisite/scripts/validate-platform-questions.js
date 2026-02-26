#!/usr/bin/env node

/**
 * 驗證平台題庫檔案格式與結構
 * 檢查 manifest.json 和題庫 JSON 是否符合規格
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PROJECT_ROOT = path.resolve(__dirname, '..')
const PLATFORM_DIR = path.join(PROJECT_ROOT, 'public', 'questions', 'platform')

// 出版社映射
const PUBLISHER_META_MAP = {
  '康軒': 'kang_hsuan',
  '南一': 'nan_yi',
  '翰林': 'han_lin'
}

const errors = []
const warnings = []
const stats = {
  totalManifests: 0,
  totalQuestionFiles: 0,
  validManifests: 0,
  validQuestionFiles: 0,
  totalQuestions: 0
}

/**
 * 驗證 manifest.json
 */
function validateManifest(manifestPath, publisherDir) {
  stats.totalManifests++
  
  try {
    const content = fs.readFileSync(manifestPath, 'utf-8')
    const manifest = JSON.parse(content)
    
    // 支援兩種格式：files 陣列或 lessons 陣列
    let fileList = null
    
    if (manifest.files && Array.isArray(manifest.files)) {
      fileList = manifest.files
    } else if (manifest.lessons && Array.isArray(manifest.lessons)) {
      // 從 lessons 格式轉換為 files 陣列
      fileList = manifest.lessons.map(lesson => lesson.file || lesson.filename)
      fileList = fileList.filter(file => file) // 過濾掉空值
    } else {
      errors.push(`❌ ${manifestPath}: manifest.json 缺少 files 或 lessons 陣列`)
      return null
    }
    
    if (fileList.length === 0) {
      warnings.push(`⚠️  ${manifestPath}: manifest.json 的檔案列表為空`)
    }
    
    stats.validManifests++
    return fileList
  } catch (error) {
    errors.push(`❌ ${manifestPath}: 無法解析 JSON - ${error.message}`)
    return null
  }
}

/**
 * 驗證單一題庫 JSON 檔案
 */
function validateQuestionFile(filePath, expectedGrade, expectedSemester, expectedSubject, expectedPublisher) {
  stats.totalQuestionFiles++
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const data = JSON.parse(content)
    
    // 檢查頂層結構
    if (!data.meta) {
      errors.push(`❌ ${filePath}: 缺少 meta 欄位`)
      return false
    }
    
    if (!data.questions || !Array.isArray(data.questions)) {
      errors.push(`❌ ${filePath}: 缺少 questions 陣列`)
      return false
    }
    
    const meta = data.meta
    
    // 驗證 meta 欄位
    const expectedGradeMeta = `grade_${expectedGrade}`
    const expectedSemesterMeta = `semester_${expectedSemester}`
    const expectedPublisherMeta = PUBLISHER_META_MAP[expectedPublisher]
    
    if (meta.grade !== expectedGradeMeta) {
      errors.push(`❌ ${filePath}: meta.grade 不符 (期望: ${expectedGradeMeta}, 實際: ${meta.grade})`)
      return false
    }
    
    if (meta.semester !== expectedSemesterMeta) {
      errors.push(`❌ ${filePath}: meta.semester 不符 (期望: ${expectedSemesterMeta}, 實際: ${meta.semester})`)
      return false
    }
    
    if (meta.subject !== expectedSubject) {
      errors.push(`❌ ${filePath}: meta.subject 不符 (期望: ${expectedSubject}, 實際: ${meta.subject})`)
      return false
    }
    
    if (meta.publisher !== expectedPublisherMeta) {
      errors.push(`❌ ${filePath}: meta.publisher 不符 (期望: ${expectedPublisherMeta}, 實際: ${meta.publisher})`)
      return false
    }
    
    if (!meta.title) {
      warnings.push(`⚠️  ${filePath}: meta.title 缺失`)
    }
    
    // 驗證題目
    let validQuestions = 0
    data.questions.forEach((q, idx) => {
      if (!q.id) {
        errors.push(`❌ ${filePath}: 題目 #${idx + 1} 缺少 id`)
        return
      }
      
      if (!q.type) {
        errors.push(`❌ ${filePath}: 題目 #${idx + 1} (id: ${q.id}) 缺少 type`)
        return
      }
      
      if (!q.question) {
        errors.push(`❌ ${filePath}: 題目 #${idx + 1} (id: ${q.id}) 缺少 question`)
        return
      }
      
      if (q.answer === undefined || q.answer === null) {
        errors.push(`❌ ${filePath}: 題目 #${idx + 1} (id: ${q.id}) 缺少 answer`)
        return
      }
      
      // 驗證題型特定欄位
      if (q.type === 'multiple_choice') {
        if (!q.options || !Array.isArray(q.options) || q.options.length < 2) {
          errors.push(`❌ ${filePath}: 題目 #${idx + 1} (id: ${q.id}) multiple_choice 缺少有效的 options`)
          return
        }
        
        // 檢查答案是否在選項中
        if (typeof q.answer === 'string') {
          const found = q.options.some(opt => opt === q.answer || opt.trim() === q.answer.trim())
          if (!found) {
            warnings.push(`⚠️  ${filePath}: 題目 #${idx + 1} (id: ${q.id}) answer "${q.answer}" 不在 options 中`)
          }
        } else if (typeof q.answer === 'number') {
          if (q.answer < 0 || q.answer >= q.options.length) {
            errors.push(`❌ ${filePath}: 題目 #${idx + 1} (id: ${q.id}) answer 索引 ${q.answer} 超出範圍`)
            return
          }
        }
      } else if (q.type === 'true_false') {
        if (q.answer !== 'True' && q.answer !== 'False') {
          warnings.push(`⚠️  ${filePath}: 題目 #${idx + 1} (id: ${q.id}) true_false 的 answer 應為 "True" 或 "False"`)
        }
      } else if (q.type === 'fill_in_the_blank') {
        if (typeof q.answer !== 'string') {
          warnings.push(`⚠️  ${filePath}: 題目 #${idx + 1} (id: ${q.id}) fill_in_the_blank 的 answer 應為字串`)
        }
      }
      
      validQuestions++
    })
    
    stats.totalQuestions += validQuestions
    
    if (validQuestions === data.questions.length) {
      stats.validQuestionFiles++
      return true
    }
    
    return false
  } catch (error) {
    errors.push(`❌ ${filePath}: 無法解析 JSON - ${error.message}`)
    return false
  }
}

/**
 * 掃描並驗證所有題庫
 */
function scanAndValidate() {
  if (!fs.existsSync(PLATFORM_DIR)) {
    errors.push(`❌ 平台目錄不存在: ${PLATFORM_DIR}`)
    return
  }
  
  const grades = ['G1', 'G2', 'G3', 'G4', 'G5', 'G6']
  
  for (const grade of grades) {
    const gradePath = path.join(PLATFORM_DIR, grade)
    if (!fs.existsSync(gradePath)) {
      continue
    }
    
    const gradeNum = parseInt(grade.replace('G', ''))
    
    // 掃描科目
    const subjects = fs.readdirSync(gradePath, { withFileTypes: true })
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name)
    
    for (const subject of subjects) {
      const subjectPath = path.join(gradePath, subject)
      
      // 掃描學期
      const semesters = fs.readdirSync(subjectPath, { withFileTypes: true })
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name)
      
      for (const semesterDir of semesters) {
        const semesterMatch = semesterDir.match(/^S(\d+)$/)
        if (!semesterMatch) {
          warnings.push(`⚠️  異常的學期目錄名稱: ${semesterDir}`)
          continue
        }
        
        const semesterNum = parseInt(semesterMatch[1])
        const semesterPath = path.join(subjectPath, semesterDir)
        
        // 掃描出版社
        const publishers = fs.readdirSync(semesterPath, { withFileTypes: true })
          .filter(entry => entry.isDirectory())
          .map(entry => entry.name)
        
        for (const publisher of publishers) {
          const publisherPath = path.join(semesterPath, publisher)
          
          // 驗證 manifest.json
          const manifestPath = path.join(publisherPath, 'manifest.json')
          if (!fs.existsSync(manifestPath)) {
            errors.push(`❌ ${manifestPath}: manifest.json 不存在`)
            continue
          }
          
          const fileList = validateManifest(manifestPath, publisher)
          if (!fileList) {
            continue
          }
          
          // 驗證 manifest 中列出的檔案
          for (const fileName of fileList) {
            const filePath = path.join(publisherPath, fileName)
            
            if (!fs.existsSync(filePath)) {
              errors.push(`❌ ${manifestPath}: manifest.json 列出但檔案不存在: ${fileName}`)
              continue
            }
            
            validateQuestionFile(filePath, gradeNum, semesterNum, subject, publisher)
          }
          
          // 檢查是否有未列在 manifest 中的檔案
          const allJsonFiles = fs.readdirSync(publisherPath)
            .filter(file => file.endsWith('.json') && file !== 'manifest.json')
          
          for (const jsonFile of allJsonFiles) {
            if (!fileList.includes(jsonFile)) {
              warnings.push(`⚠️  ${publisherPath}: ${jsonFile} 未列在 manifest.json 中`)
            }
          }
        }
      }
    }
  }
}

/**
 * 主函數
 */
function main() {
  console.log('🔍 開始驗證平台題庫檔案...\n')
  
  scanAndValidate()
  
  // 輸出結果
  console.log('\n📊 驗證統計：')
  console.log(`  總 manifest 數：${stats.totalManifests}`)
  console.log(`  有效 manifest 數：${stats.validManifests}`)
  console.log(`  總題庫檔案數：${stats.totalQuestionFiles}`)
  console.log(`  有效題庫檔案數：${stats.validQuestionFiles}`)
  console.log(`  總題目數：${stats.totalQuestions}`)
  
  if (warnings.length > 0) {
    console.log(`\n⚠️  警告 (${warnings.length} 個)：`)
    warnings.forEach(w => console.log(`  ${w}`))
  }
  
  if (errors.length > 0) {
    console.log(`\n❌ 錯誤 (${errors.length} 個)：`)
    errors.forEach(e => console.log(`  ${e}`))
    console.log('\n❌ 驗證失敗！請修正上述錯誤。')
    process.exit(1)
  } else {
    console.log('\n✅ 所有檔案驗證通過！')
    process.exit(0)
  }
}

main()
