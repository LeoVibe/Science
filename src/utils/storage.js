// 答题历史存储工具

// 获取答题历史
export function getAnswerHistory() {
  const history = localStorage.getItem('answerHistory')
  return history ? JSON.parse(history) : {}
}

// 保存答题记录
export function saveAnswerRecord(questionId, isCorrect) {
  const history = getAnswerHistory()
  
  if (!history[questionId]) {
    history[questionId] = {
      total: 0,
      correct: 0,
      wrong: 0,
      lastAnswer: null,
      lastAnswerTime: null
    }
  }
  
  history[questionId].total++
  history[questionId].lastAnswer = isCorrect
  history[questionId].lastAnswerTime = Date.now()
  
  if (isCorrect) {
    history[questionId].correct++
  } else {
    history[questionId].wrong++
  }
  
  localStorage.setItem('answerHistory', JSON.stringify(history))
  return history[questionId]
}

// 获取错题列表
export function getWrongQuestions() {
  const history = getAnswerHistory()
  const wrongQuestions = []
  
  Object.keys(history).forEach(questionId => {
    const record = history[questionId]
    if (record.wrong > 0) {
      wrongQuestions.push({
        id: parseInt(questionId),
        wrongCount: record.wrong,
        totalCount: record.total,
        accuracy: record.total > 0 ? (record.correct / record.total * 100).toFixed(1) : 0
      })
    }
  })
  
  return wrongQuestions.sort((a, b) => b.wrongCount - a.wrongCount)
}

// 获取统计信息
export function getStatistics() {
  const history = getAnswerHistory()
  let totalQuestions = 0
  let totalCorrect = 0
  let totalWrong = 0
  
  Object.values(history).forEach(record => {
    totalQuestions += record.total
    totalCorrect += record.correct
    totalWrong += record.wrong
  })
  
  return {
    totalQuestions,
    totalCorrect,
    totalWrong,
    accuracy: totalQuestions > 0 ? (totalCorrect / totalQuestions * 100).toFixed(1) : 0,
    wrongCount: Object.values(history).filter(r => r.wrong > 0).length
  }
}

// 清除所有记录
export function clearHistory() {
  localStorage.removeItem('answerHistory')
  localStorage.removeItem('practiceHistory')
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

