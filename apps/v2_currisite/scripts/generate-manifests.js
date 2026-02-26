#!/usr/bin/env node

/**
 * 生成題庫 manifest.json 檔案
 * 掃描 public/questions/platform/ 目錄，為每個年級/科目/學期/出版社組合生成 manifest.json
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')
const platformDir = path.join(projectRoot, 'public', 'questions', 'platform')

/**
 * 遞迴掃描目錄，找出所有 JSON 檔案
 */
function findJsonFiles(dir) {
  const files = []
  
  if (!fs.existsSync(dir)) {
    return files
  }
  
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    
    if (entry.isDirectory()) {
      files.push(...findJsonFiles(fullPath))
    } else if (entry.isFile() && entry.name.endsWith('.json') && entry.name !== 'manifest.json' && entry.name !== 'index.json') {
      files.push(entry.name)
    }
  }
  
  return files
}

/**
 * 為指定路徑生成 manifest.json
 */
function generateManifest(dirPath) {
  const jsonFiles = findJsonFiles(dirPath)
  
  if (jsonFiles.length === 0) {
    return false
  }
  
  // 排序檔案名稱
  jsonFiles.sort()
  
  const manifest = {
    version: '1.0.0',
    generated: new Date().toISOString(),
    files: jsonFiles
  }
  
  const manifestPath = path.join(dirPath, 'manifest.json')
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8')
  
  console.log(`✓ 生成 manifest.json: ${path.relative(projectRoot, manifestPath)} (${jsonFiles.length} 個檔案)`)
  
  return true
}

/**
 * 主函數：掃描所有目錄並生成 manifest
 */
function main() {
  console.log('開始掃描題庫目錄...\n')
  
  if (!fs.existsSync(platformDir)) {
    console.warn(`警告: 目錄不存在: ${platformDir}`)
    console.log('請確保題庫檔案已放置在 public/questions/platform/ 目錄下')
    console.log('目錄結構應為: questions/platform/G{年級}/{科目}/S{學期}/{出版社}/*.json')
    return
  }
  
  let manifestCount = 0
  
  // 掃描所有年級
  const grades = ['G1', 'G2', 'G3', 'G4', 'G5', 'G6']
  
  for (const grade of grades) {
    const gradePath = path.join(platformDir, grade)
    
    if (!fs.existsSync(gradePath)) {
      continue
    }
    
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
      
      for (const semester of semesters) {
        const semesterPath = path.join(subjectPath, semester)
        
        // 掃描出版社
        const publishers = fs.readdirSync(semesterPath, { withFileTypes: true })
          .filter(entry => entry.isDirectory())
          .map(entry => entry.name)
        
        for (const publisher of publishers) {
          const publisherPath = path.join(semesterPath, publisher)
          
          // 為這個出版社目錄生成 manifest.json
          if (generateManifest(publisherPath)) {
            manifestCount++
          }
        }
      }
    }
  }
  
  console.log(`\n完成！共生成 ${manifestCount} 個 manifest.json 檔案`)
}

main()
