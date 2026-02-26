// 答题历史存储工具（支持多维度：年级、科目、学期、出版社）

/**
 * 生成存储键名
 * @param {number} grade - 年级
 * @param {string} subject - 科目
 * @param {number} semester - 学期 (1或2)
 * @param {string} publisher - 出版社
 * @param {string} type - 类型 (history, practice, etc.)
 */
function getStorageKey(grade, subject, semester, publisher, type = 'history') {
  // 格式：history_G4_CHI_S1_KNSH
  const subjectCode = subject === '國語' ? 'CHI' : 
                     subject === '數學' ? 'MAT' :
                     subject === '自然' ? 'SCI' :
                     subject === '社會' ? 'SOC' :
                     subject === '英語' ? 'ENG' : subject
  const publisherCode = publisher === '康軒' ? 'KNSH' :
                        publisher === '南一' ? 'NANI' :
                        publisher === '翰林' ? 'HLM' : publisher.toUpperCase()
  return `${type}_G${grade}_${subjectCode}_S${semester}_${publisherCode}`
}

/**
 * 获取答题历史（按年级、科目、学期、出版社）
 */
export function getAnswerHistory(grade, subject, semester, publisher) {
  const key = getStorageKey(grade, subject, semester, publisher, 'history')
  const history = localStorage.getItem(key)
  return history ? JSON.parse(history) : {}
}

/**
 * 保存答题记录
 */
export function saveAnswerRecord(questionId, isCorrect, grade, subject, semester, publisher) {
  const key = getStorageKey(grade, subject, semester, publisher, 'history')
  const history = getAnswerHistory(grade, subject, semester, publisher)
  
  // 使用题目ID作为唯一标识
  const recordKey = questionId.toString()
  
  if (!history[recordKey]) {
    history[recordKey] = {
      questionId: questionId,
      grade: grade,
      subject: subject,
      semester: semester,
      publisher: publisher,
      total: 0,
      correct: 0,
      wrong: 0,
      lastAnswer: null,
      lastAnswerTime: null
    }
  }
  
  history[recordKey].total++
  history[recordKey].lastAnswer = isCorrect
  history[recordKey].lastAnswerTime = Date.now()
  
  if (isCorrect) {
    history[recordKey].correct++
  } else {
    history[recordKey].wrong++
  }
  
  localStorage.setItem(key, JSON.stringify(history))
  return history[recordKey]
}

/**
 * 获取错题列表
 */
export function getWrongQuestions(grade, subject, semester, publisher) {
  const history = getAnswerHistory(grade, subject, semester, publisher)
  const wrongQuestions = []
  
  Object.keys(history).forEach(key => {
    const record = history[key]
    if (record.wrong > 0) {
      wrongQuestions.push({
        id: record.questionId || key,
        grade: record.grade,
        subject: record.subject,
        semester: record.semester,
        publisher: record.publisher,
        wrongCount: record.wrong,
        totalCount: record.total,
        accuracy: record.total > 0 ? (record.correct / record.total * 100).toFixed(1) : 0
      })
    }
  })
  
  return wrongQuestions.sort((a, b) => b.wrongCount - a.wrongCount)
}

/**
 * 获取统计信息
 */
export function getStatistics(grade, subject, semester, publisher) {
  const history = getAnswerHistory(grade, subject, semester, publisher)
  let totalQuestions = 0
  let totalCorrect = 0
  let totalWrong = 0
  
  Object.values(history).forEach(record => {
    totalQuestions += record.total
    totalCorrect += record.correct
    totalWrong += record.wrong
  })
  
  return {
    grade: grade,
    subject: subject,
    semester: semester,
    publisher: publisher,
    totalQuestions,
    totalCorrect,
    totalWrong,
    accuracy: totalQuestions > 0 ? (totalCorrect / totalQuestions * 100).toFixed(1) : 0,
    wrongCount: Object.values(history).filter(r => r.wrong > 0).length
  }
}

/**
 * 清除记录
 */
export function clearHistory(grade, subject, semester, publisher) {
  const key = getStorageKey(grade, subject, semester, publisher, 'history')
  localStorage.removeItem(key)
  
  // 清除该配置的练习记录
  const practiceHistory = getAllPracticeHistory()
  const filtered = practiceHistory.filter(r => 
    !(r.grade === grade && r.subject === subject && r.semester === semester && r.publisher === publisher)
  )
  localStorage.setItem('sci_v2_all_practice_history', JSON.stringify(filtered))
}

/**
 * 保存练习记录
 */
export function savePracticeRecord(record) {
  const allHistory = getAllPracticeHistory()
  record.id = Date.now()
  record.timestamp = Date.now()
  allHistory.push(record)
  
  // 只保留最近200条记录
  if (allHistory.length > 200) {
    allHistory.shift()
  }
  
  localStorage.setItem('sci_v2_all_practice_history', JSON.stringify(allHistory))
  return record
}

/**
 * 获取所有练习历史（用于统计页面）
 */
export function getAllPracticeHistory() {
  const history = localStorage.getItem('sci_v2_all_practice_history')
  return history ? JSON.parse(history) : []
}

/**
 * 获取特定配置的练习历史
 */
export function getPracticeHistory(grade, subject, semester, publisher) {
  const allHistory = getAllPracticeHistory()
  return allHistory.filter(r => 
    r.grade === grade && r.subject === subject && r.semester === semester && r.publisher === publisher
  )
}

/**
 * 获取本次练习的错题列表
 */
export function getSessionWrongQuestions(answeredQuestions) {
  return answeredQuestions
    .filter(q => !q.isCorrect)
    .map(q => q.questionId)
}

// ==================== 用户偏好设置 ====================

/**
 * 保存用户偏好（年级、科目、学期、出版社）
 */
export function saveUserPreference(grade, subject, semester, publisher) {
  const preference = {
    grade: grade,
    subject: subject,
    semester: semester,
    publisher: publisher,
    timestamp: Date.now()
  }
  localStorage.setItem('sci_v2_user_preference', JSON.stringify(preference))
  return preference
}

/**
 * 加载用户偏好
 */
export function loadUserPreference() {
  const preference = localStorage.getItem('sci_v2_user_preference')
  if (preference) {
    try {
      return JSON.parse(preference)
    } catch (e) {
      console.error('解析用户偏好失败:', e)
      return null
    }
  }
  return null
}

/**
 * 清除用户偏好
 */
export function clearUserPreference() {
  localStorage.removeItem('sci_v2_user_preference')
}

// ==================== 答题进度保存 ====================

/**
 * 保存答题进度
 */
export function saveQuizProgress(grade, subject, semester, publisher, progress) {
  const key = getStorageKey(grade, subject, semester, publisher, 'progress')
  localStorage.setItem(key, JSON.stringify({
    ...progress,
    timestamp: Date.now()
  }))
}/**
 * 加载答题进度
 */
export function loadQuizProgress(grade, subject, semester, publisher) {
  const key = getStorageKey(grade, subject, semester, publisher, 'progress')
  const progress = localStorage.getItem(key)
  if (progress) {
    try {
      const data = JSON.parse(progress)
      // 检查是否过期（超过24小时）
      if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
        return data
      } else {
        // 清除过期进度
        localStorage.removeItem(key)
      }
    } catch (e) {
      console.error('解析答题进度失败:', e)
    }
  }
  return null
}/**
 * 清除答题进度
 */
export function clearQuizProgress(grade, subject, semester, publisher) {
  const key = getStorageKey(grade, subject, semester, publisher, 'progress')
  localStorage.removeItem(key)
}
