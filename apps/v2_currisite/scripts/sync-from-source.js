#!/usr/bin/env node

/**
 * 從 antigravity 專案的 questions/source 目錄
 * 同步題庫到本專案的 public/questions/platform 目錄。
 *
 * 使用方式：
 *   node scripts/sync-from-source.js
 *
 * 建議搭配：
 *   node scripts/sync-from-source.js && node scripts/generate-manifests.js
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 路徑設定：依據目前使用者實際目錄
const PROJECT_ROOT = path.resolve(__dirname, '..')
const SOURCE_ROOT = path.join(
  PROJECT_ROOT,
  'antigravity',
  'questions',
  'source'
)
const TARGET_ROOT = path.join(
  PROJECT_ROOT,
  'public',
  'questions',
  'platform'
)

/**
 * 確保目錄存在
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

/**
 * 複製單一 JSON 檔案（原樣複製，不改動內容）
 */
function copyJsonFile(sourcePath, targetPath) {
  ensureDir(path.dirname(targetPath))
  const content = fs.readFileSync(sourcePath, 'utf-8')

  // 簡單驗證 JSON 格式是否正確（避免壞檔案）
  try {
    JSON.parse(content)
  } catch (e) {
    console.warn(`⚠️ 無法解析 JSON，已跳過：${sourcePath}`)
    return false
  }

  fs.writeFileSync(targetPath, content, 'utf-8')
  return true
}

/**
 * 將 source 路徑轉成 platform 目標路徑（符合規格：出版社目錄下直接放單一 JSON）
 * - 若為 .../出版社/檔名.json -> .../出版社/檔名.json
 * - 若為 .../出版社/課次資料夾/檔名.json -> .../出版社/課次資料夾.json（扁平化）
 */
function mapSourceToTarget(sourceFile) {
  const rel = path.relative(SOURCE_ROOT, sourceFile)
  const segments = rel.split(path.sep)
  if (segments.length <= 4) {
    return path.join(TARGET_ROOT, rel)
  }
  // 例：G4/自然/S2/康軒/Sci1_白天和夜晚/生活中的力.json -> .../康軒/Sci1_白天和夜晚.json
  const publisherDir = path.join(TARGET_ROOT, segments.slice(0, 4).join(path.sep))
  const lessonDirName = segments[4]
  const flatName = lessonDirName.endsWith('.json') ? lessonDirName : `${lessonDirName}.json`
  return path.join(publisherDir, flatName)
}

/**
 * 主流程
 */
function main() {
  console.log('🚀 開始從 antigravity/source 同步題庫到本專案 platform ...\n')

  if (!fs.existsSync(SOURCE_ROOT)) {
    console.error(`❌ 找不到來源目錄：${SOURCE_ROOT}`)
    process.exit(1)
  }

  ensureDir(TARGET_ROOT)

  let totalFiles = 0
  let copiedFiles = 0

  /**
   * 遞迴掃描目錄，處理所有 .json 檔案
   */
  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        walk(fullPath)
      } else if (entry.isFile() && entry.name.endsWith('.json')) {
        totalFiles += 1
        const targetPath = mapSourceToTarget(fullPath)
        const ok = copyJsonFile(fullPath, targetPath)
        if (ok) {
          copiedFiles += 1
          console.log(
            `✅ 複製：${path.relative(SOURCE_ROOT, fullPath)} -> ${path.relative(
              PROJECT_ROOT,
              targetPath
            )}`
          )
        }
      }
    }
  }

  walk(SOURCE_ROOT)

  console.log('\n✨ 同步完成')
  console.log(`  總檔案數：${totalFiles}`)
  console.log(`  已複製：${copiedFiles}`)
  console.log(
    `\n💡 接下來建議執行：node scripts/generate-manifests.js 來重建 manifest.json`
  )
}

main()

