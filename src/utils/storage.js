// 答题历史存储工具（支持多科目）

// 获取答题历史（按科目）
export function getAnswerHistory(subject = null) {
  const key = subject ? `answerHistory_${subject}` : 'answerHistory'
  const history = localStorage.getItem(key)
  return history ? JSON.parse(history) : {}
}

// 保存答题记录（按科目）
export function saveAnswerRecord(questionId, isCorrect, subject = null) {
  const key = subject ? `answerHistory_${subject}` : 'answerHistory'
  const history = getAnswerHistory(subject)
  
  // 使用科目+题目ID作为唯一标识
  const recordKey = subject ? `${subject}_${questionId}` : questionId.toString()
  
  if (!history[recordKey]) {
    history[recordKey] = {
      questionId: questionId,
      subject: subject,
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

// 获取错题列表（按科目）
export function getWrongQuestions(subject = null) {
  const history = getAnswerHistory(subject)
  const wrongQuestions = []
  
  Object.keys(history).forEach(key => {
    const record = history[key]
    if (record.wrong > 0) {
      wrongQuestions.push({
        id: record.questionId || parseInt(key),
        subject: record.subject || subject,
        wrongCount: record.wrong,
        totalCount: record.total,
        accuracy: record.total > 0 ? (record.correct / record.total * 100).toFixed(1) : 0
      })
    }
  })
  
  return wrongQuestions.sort((a, b) => b.wrongCount - a.wrongCount)
}

// 获取统计信息（按科目）
export function getStatistics(subject = null) {
  const history = getAnswerHistory(subject)
  let totalQuestions = 0
  let totalCorrect = 0
  let totalWrong = 0
  
  Object.values(history).forEach(record => {
    totalQuestions += record.total
    totalCorrect += record.correct
    totalWrong += record.wrong
  })
  
  return {
    subject: subject,
    totalQuestions,
    totalCorrect,
    totalWrong,
    accuracy: totalQuestions > 0 ? (totalCorrect / totalQuestions * 100).toFixed(1) : 0,
    wrongCount: Object.values(history).filter(r => r.wrong > 0).length
  }
}

// 清除所有记录（按科目）
export function clearHistory(subject = null) {
  if (subject) {
    localStorage.removeItem(`answerHistory_${subject}`)
    // 清除该科目的练习记录
    const practiceHistory = getPracticeHistory()
    const filtered = practiceHistory.filter(r => r.subject !== subject)
    localStorage.setItem('practiceHistory', JSON.stringify(filtered))
  } else {
    // 清除所有科目的记录
    localStorage.removeItem('answerHistory')
    localStorage.removeItem('practiceHistory')
    // 清除所有科目的单独记录
    const subjects = ['science', 'chinese', 'social', 'math', 'english']
    subjects.forEach(s => {
      localStorage.removeItem(`answerHistory_${s}`)
    })
  }
}

// 保存练习记录
export function savePracticeRecord(record) {
  const history = getPracticeHistory()
  record.id = Date.now()
  record.timestamp = Date.now()
  history.push(record)
  // 只保留最近100条记录
  if (history.length > 100) {
    history.shift()
  }
  localStorage.setItem('practiceHistory', JSON.stringify(history))
  return record
}

// 获取练习历史
export function getPracticeHistory() {
  const history = localStorage.getItem('practiceHistory')
  return history ? JSON.parse(history) : []
}

// 获取本次练习的错题列表
export function getSessionWrongQuestions(answeredQuestions) {
  return answeredQuestions
    .filter(q => !q.isCorrect)
    .map(q => q.questionId)
}

