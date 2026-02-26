// 題庫可用性檢查工具
// 用於檢查哪些年級、科目、出版社組合有可用的題庫

import { SUBJECT_MAP, PUBLISHER_MAP } from '../data/config.js'
import { loadQuestions } from '../data/index.js'

// 緩存已檢查的題庫可用性
const availabilityCache = new Map()

/**
 * 清除緩存，強制重新檢查
 * @param {string} cacheKey - 可選，指定要清除的緩存鍵，如果不提供則清除所有緩存
 */
export function clearAvailabilityCache(cacheKey = null) {
  if (cacheKey) {
    availabilityCache.delete(cacheKey)
  } else {
    availabilityCache.clear()
  }
}

/**
 * 清除特定年級、科目、出版社組合的緩存
 */
export function clearCacheForCombination(grade, subject, publisher) {
  const semesters = [1, 2]
  for (const semester of semesters) {
    const cacheKey = `${grade}-${subject}-${semester}-${publisher}`
    availabilityCache.delete(cacheKey)
  }
}

/**
 * 檢查題庫文件是否存在且有內容
 * @param {number} grade - 年級
 * @param {string} subject - 科目
 * @param {number} semester - 學期
 * @param {string} publisher - 出版社
 * @returns {Promise<boolean>} 是否有可用題庫
 */
async function checkQuestionFileExists(grade, subject, semester, publisher) {
  const cacheKey = `${grade}-${subject}-${semester}-${publisher}`
  
  // 檢查緩存
  if (availabilityCache.has(cacheKey)) {
    return availabilityCache.get(cacheKey)
  }
  
  try {
    // 使用 loadQuestions 函数来检查，这样路径处理一致
    const module = await loadQuestions(grade, subject, semester, publisher)
    // 检查是否有questions数组且长度大于0
    const hasQuestions = module && 
                         module.questions && 
                         Array.isArray(module.questions) && 
                         module.questions.length > 0 &&
                         // 确保不是空数组（只有注释或空对象）
                         module.questions.some(q => q && (q.question || q.id))
    availabilityCache.set(cacheKey, hasQuestions)
    return hasQuestions
  } catch (error) {
    // 如果加载失败，说明文件不存在或没有题目
    availabilityCache.set(cacheKey, false)
    return false
  }
}

/**
 * 檢查某個年級是否有任何可用的題庫
 * @param {number} grade - 年級
 * @returns {Promise<boolean>} 是否有可用題庫
 */
export async function hasGradeQuestions(grade) {
  const subjects = grade <= 2 
    ? ['國語', '數學', '英語', '生活']
    : ['國語', '數學', '英語', '自然', '社會']
  
  const publishers = ['康軒', '南一', '翰林']
  const semesters = [1, 2]
  
  // 檢查所有可能的組合
  for (const subject of subjects) {
    for (const publisher of publishers) {
      for (const semester of semesters) {
        const exists = await checkQuestionFileExists(grade, subject, semester, publisher)
        if (exists) {
          return true
        }
      }
    }
  }
  
  return false
}

/**
 * 檢查某個出版社+科目組合是否有任何可用的題庫
 * @param {number} grade - 年級
 * @param {string} subject - 科目
 * @param {string} publisher - 出版社
 * @returns {Promise<boolean>} 是否有可用題庫
 */
export async function hasPublisherSubjectQuestions(grade, subject, publisher) {
  const semesters = [1, 2]
  
  // 只要有一個學期有題庫就返回 true
  for (const semester of semesters) {
    const exists = await checkQuestionFileExists(grade, subject, semester, publisher)
    if (exists) {
      return true
    }
  }
  
  return false
}

/**
 * 預先檢查所有年級的可用性（用於初始化）
 * @returns {Promise<Map<number, boolean>>} 年級可用性映射
 */
export async function checkAllGradesAvailability() {
  const grades = [1, 2, 3, 4, 5, 6]
  const availabilityMap = new Map()
  
  // 並行檢查所有年級
  const promises = grades.map(async (grade) => {
    const available = await hasGradeQuestions(grade)
    availabilityMap.set(grade, available)
  })
  
  await Promise.all(promises)
  return availabilityMap
}

/**
 * 預先檢查某個年級下所有出版社+科目組合的可用性
 * @param {number} grade - 年級
 * @returns {Promise<Map<string, boolean>>} 出版社+科目組合可用性映射，key格式為 "publisher-subject"
 */
export async function checkPublisherSubjectAvailability(grade) {
  const subjects = grade <= 2 
    ? ['國語', '數學', '英語', '生活']
    : ['國語', '數學', '英語', '自然', '社會']
  
  const publishers = ['康軒', '南一', '翰林']
  const availabilityMap = new Map()
  
  // 並行檢查所有組合
  const promises = []
  for (const publisher of publishers) {
    for (const subject of subjects) {
      promises.push(
        hasPublisherSubjectQuestions(grade, subject, publisher).then(available => {
          availabilityMap.set(`${publisher}-${subject}`, available)
        })
      )
    }
  }
  
  await Promise.all(promises)
  return availabilityMap
}

