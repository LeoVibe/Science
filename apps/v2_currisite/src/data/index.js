// 數據加載中心 - 使用新的 JSON 檔案架構

import { PUBLISHER_META_MAP } from './config.js'

/**
 * 依規格取得路徑用科目名稱：G3-G6 為「英文」，G1-G2 為「英語」
 * @param {number} grade - 年級 (1-6)
 * @param {string} subject - UI 科目名稱
 * @returns {string} 用於路徑的科目名稱
 */
function getSubjectForPath(grade, subject) {
  if (grade >= 3 && subject === '英語') return '英文'
  return subject
}

/**
 * 根據年級、科目、學期、出版社載入對應的題庫
 * @param {number} grade - 年級 (1-6)
 * @param {string} subject - 科目名稱 (如 '自然', '數學', '英語')
 * @param {number} semester - 學期 (1=上學期, 2=下學期)
 * @param {string} publisher - 出版社名稱 (如 '康軒', '南一')
 * @returns {Promise<Object>} 返回題庫模組，包含 questions 陣列和工具函數
 */
// 與 Vite base 一致，部署在子路徑（如 /Science/）時 fetch 才能正確
const getBaseUrl = () => (import.meta.env.BASE_URL || '/').replace(/\/?$/, '/')

export async function loadQuestions(grade, subject, semester, publisher) {
  const pathSubject = getSubjectForPath(grade, subject)
  const semesterDir = `S${semester}`
  const gradeDir = `G${grade}`
  const basePath = `${getBaseUrl()}questions/platform/${gradeDir}/${pathSubject}/${semesterDir}/${publisher}`

  const questions = await loadQuestionsFromDirectory(basePath, grade, pathSubject, semester, publisher, [])

  // 返回標準化的模組格式
  return {
    questions: questions,
    getAllCategories: () => {
      // 優先使用 category（課程標題），如果沒有則使用 lessonTitle，最後才用 lesson
      const categories = [...new Set(questions.map(q => q.category || q.lessonTitle || q.lesson).filter(Boolean))]
      return categories
    },
    getQuestionsByCategory: (category) => {
      // 支援用課程標題或課次ID來篩選
      return questions.filter(q =>
        q.category === category ||
        q.lessonTitle === category ||
        q.lesson === category
      )
    }
  }
}

/**
 * 根據科目獲取課次 ID 前綴
 */
function getLessonPrefixes(subject) {
  const prefixes = {
    '國語': 'L',
    '數學': 'M',
    '英文': 'U',
    '英語': 'U',
    '自然': 'Sci',
    '社會': 'Soc',
    '生活': 'Life'
  }
  return prefixes[subject] || 'L'
}

/**
 * 從目錄載入所有符合條件的 JSON 檔案
 */
async function loadQuestionsFromDirectory(basePath, grade, subject, semester, publisher, fileList) {
  const allQuestions = []
  const publisherMeta = PUBLISHER_META_MAP[publisher] || publisher.toLowerCase()
  const semesterMeta = `semester_${semester}`
  const gradeMeta = `grade_${grade}`

  // 依規格僅讀取 manifest.json（404 = 尚無題庫，不寫入 platform）
  if (fileList.length === 0) {
    try {
      const manifestResponse = await fetch(`${basePath}/manifest.json`)
      if (manifestResponse.ok) {
        const manifest = await manifestResponse.json()
        if (manifest.items && Array.isArray(manifest.items)) {
          fileList = manifest.items.map(item => item.file || item.path).filter(Boolean)
        } else {
          fileList = manifest.files || manifest.units?.map(u => u.file) || []
        }
      }
    } catch (e) {
      // 404 或網路錯誤：該組合尚無題庫，靜默返回空陣列
    }
  }

  if (fileList.length === 0) {
    return []
  }

  // 載入所有檔案
  const loadPromises = fileList.map(async (fileName) => {
    try {
      const filePath = `${basePath}/${fileName}`
      const response = await fetch(filePath)

      if (!response.ok) {
        return null // 檔案不存在
      }

      const data = await response.json()

      // 驗證檔案格式
      if (!data.meta || !data.questions) {
        console.warn(`檔案格式不正確: ${filePath}`)
        return null
      }

      // 驗證 meta 資訊是否符合條件
      if (data.meta.grade !== gradeMeta ||
        data.meta.semester !== semesterMeta ||
        data.meta.subject !== subject ||
        data.meta.publisher !== publisherMeta) {
        console.warn(`檔案 meta 不符合條件: ${filePath}`, {
          expected: { grade: gradeMeta, semester: semesterMeta, subject, publisher: publisherMeta },
          actual: data.meta
        })
        return null // 不符合條件
      }

      // 處理題目，添加課程資訊
      const processedQuestions = data.questions.map(q => {
        // 處理答案格式
        let answer = q.answer
        let correctAnswer = q.answer

        // 如果是選擇題，答案可能是字串（選項內容）或數字（索引）
        if (q.type === 'multiple_choice' && q.options) {
          if (typeof answer === 'string') {
            // 嘗試在選項中找到匹配的答案
            const answerIndex = q.options.findIndex(opt => opt === answer || opt.trim() === answer.trim())
            if (answerIndex >= 0) {
              answer = answerIndex
              correctAnswer = answerIndex
            } else {
              // 如果找不到匹配，嘗試解析為數字
              const numAnswer = parseInt(answer, 10)
              if (!isNaN(numAnswer) && numAnswer >= 0 && numAnswer < q.options.length) {
                answer = numAnswer
                correctAnswer = numAnswer
              }
            }
          } else if (typeof answer === 'number') {
            // 確保答案索引在有效範圍內
            if (answer >= 0 && answer < q.options.length) {
              correctAnswer = answer
            }
          }
        } else if (q.type === 'true_false') {
          // 是非題：將 "True"/"False" 轉換為 0/1
          if (answer === 'True' || answer === true) {
            answer = 0
            correctAnswer = 0
          } else if (answer === 'False' || answer === false) {
            answer = 1
            correctAnswer = 1
          }
          // 為是非題添加選項（如果沒有）
          if (!q.options || q.options.length === 0) {
            q.options = ['是', '否']
          }
        }
        // fill_in_the_blank 類型的答案保持原樣（字串）

        // 生成唯一題目ID：使用 lesson_id 格式，確保不同課程的題目不會重複
        const uniqueId = data.meta.lesson ? `${data.meta.lesson}_${q.id}` : q.id

        return {
          ...q,
          id: uniqueId, // 使用唯一ID
          originalId: q.id, // 保留原始ID以供顯示
          answer: answer,
          correctAnswer: correctAnswer, // 向後兼容
          category: q.category || data.meta.title || data.meta.lesson, // 優先使用課程標題作為分類顯示
          lesson: data.meta.lesson,
          lessonTitle: data.meta.title,
          lessonOrder: data.meta.order
        }
      })

      return processedQuestions
    } catch (error) {
      console.warn(`載入檔案失敗: ${fileName}`, error)
      return null
    }
  })

  // 等待所有檔案載入完成
  const results = await Promise.all(loadPromises)

  // 合併所有題目，按 lessonOrder 排序
  for (const questions of results) {
    if (questions && questions.length > 0) {
      allQuestions.push(...questions)
    }
  }

  // 按課程順序排序
  allQuestions.sort((a, b) => {
    if (a.lessonOrder !== undefined && b.lessonOrder !== undefined) {
      return a.lessonOrder - b.lessonOrder
    }
    return 0
  })

  return allQuestions
}
