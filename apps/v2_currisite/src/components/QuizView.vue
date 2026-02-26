<template>
  <div class="quiz-view">
    <div class="quiz-container">
      <div class="quiz-header">
        <button @click="backToMenu" class="back-btn">← 返回</button>
        <div class="progress-info">
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: `${(currentIndex + 1) / questions.length * 100}%` }"
            ></div>
          </div>
          <div class="progress-text">
            第 {{ currentIndex + 1 }} 題 / 共 {{ questions.length }} 題
          </div>
          <div class="session-stats">
            <span class="stat-item correct-stat">✓ {{ sessionStats.correct }}</span>
            <span class="stat-item wrong-stat">✗ {{ sessionStats.wrong }}</span>
            <span class="stat-item total-stat">總: {{ sessionStats.total }}</span>
          </div>
        </div>
      </div>

      <div 
        v-if="currentQuestion" 
        class="question-card" 
        :class="{ 'result-flash': showResult, 'result-correct': showResult && isCorrect, 'result-wrong': showResult && !isCorrect }"
        ref="questionCardRef" 
        tabindex="0"
      >
        <div class="question-header">
          <span class="category-badge">{{ currentQuestion.category }}</span>
          <span class="type-badge">選擇題</span>
        </div>

        <div class="question-content">
          <h2 class="question-text">{{ displayQuestion }}</h2>

          <!-- 選擇題 -->
          <div v-if="currentQuestion.options" class="options">
            <button
              v-for="(option, index) in currentQuestion.options"
              :key="index"
              @click="selectAnswer(index)"
              :class="['option-btn', {
                'selected': selectedAnswer === index,
                'correct': showResult && index === getCorrectAnswerIndex(currentQuestion),
                'wrong': showResult && selectedAnswer === index && selectedAnswer !== getCorrectAnswerIndex(currentQuestion)
              }]"
              :disabled="showResult"
            >
              {{ String.fromCharCode(65 + index) }}. {{ option }}
            </button>
          </div>

        </div>

        <!-- 答案解釋：明顯正確/錯誤回饋 + 解析 -->
        <div v-if="showResult" class="explanation">
          <div :class="['result-badge', isCorrect ? 'correct-badge' : 'wrong-badge']">
            {{ isCorrect ? '✓ 答對了！' : '✗ 答錯了' }}
          </div>
          <div class="explanation-text">
            <strong>正確答案：</strong>{{ correctAnswerText }}<br>
            <strong>解釋：</strong>{{ currentQuestion.explanation || '(無解析)' }}
          </div>
        </div>

        <!-- 控制按鈕：答題後顯示明顯「下一題」按鈕，計分器已即時更新 -->
        <div v-if="showResult && currentIndex < questions.length - 1" class="quiz-controls">
          <button @click="nextQuestion" class="control-btn next-btn">
            下一題 →
          </button>
          <div class="auto-next-hint">或稍後自動進入下一題</div>
        </div>
        <div v-else-if="showResult && currentIndex >= questions.length - 1" class="quiz-controls">
          <button 
            @click="nextQuestion"
            class="control-btn next-btn"
          >
            查看結果 (Enter)
          </button>
        </div>
        <div v-else-if="!showResult && selectedAnswer !== null" class="quiz-controls">
          <button 
            @click="checkAnswer"
            class="control-btn check-btn"
          >
            確認答案
          </button>
        </div>
        
        <!-- 快捷鍵提示 -->
        <div v-if="!showResult" class="shortcut-hint">
          快捷鍵：<kbd>1-4</kbd> 或 <kbd>A-D</kbd>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick, onBeforeUnmount } from 'vue'
import { saveAnswerRecord, getAnswerHistory, saveQuizProgress } from '../utils/storage.js'

const props = defineProps({
  questions: {
    type: Array,
    required: true
  },
  quizType: {
    type: String,
    default: ''
  },
  startTime: {
    type: Number,
    default: null
  },
  grade: {
    type: Number,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  semester: {
    type: Number,
    required: true
  },
  publisher: {
    type: String,
    required: true
  },
  savedProgress: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['finish-quiz', 'back-to-menu'])

const currentIndex = ref(0)
const selectedAnswer = ref(null)
const showResult = ref(false)
const score = ref(0)
const answeredQuestions = ref([])
const sessionStats = ref({ correct: 0, wrong: 0, total: 0 })
const questionHistory = ref(null)
const questionCardRef = ref(null)

const currentQuestion = computed(() => {
  return props.questions[currentIndex.value]
})

const displayQuestion = computed(() => {
  if (!currentQuestion.value) return ''
  return currentQuestion.value.question
})

// 获取正确答案索引（兼容新旧格式）
const getCorrectAnswerIndex = (question) => {
  return question.answer !== undefined ? question.answer : question.correctAnswer
}

const isCorrect = computed(() => {
  if (!currentQuestion.value || selectedAnswer.value === null) return false
  const correctAnswer = getCorrectAnswerIndex(currentQuestion.value)
  return selectedAnswer.value === correctAnswer
})

const correctAnswerText = computed(() => {
  if (!currentQuestion.value) return ''
  const index = getCorrectAnswerIndex(currentQuestion.value)
  return String.fromCharCode(65 + index) + '. ' + currentQuestion.value.options[index]
})

// 初始化sessionStats和恢复进度
watch(() => props.questions, () => {
  if (props.questions && props.questions.length > 0) {
    // 如果有保存的进度，恢复状态
    if (props.savedProgress) {
      answeredQuestions.value = props.savedProgress.answeredQuestions || []
      score.value = props.savedProgress.score || 0
      sessionStats.value = {
        correct: answeredQuestions.value.filter(q => q.isCorrect).length,
        wrong: answeredQuestions.value.filter(q => !q.isCorrect).length,
        total: answeredQuestions.value.length
      }
      // 重要：currentIndex 应该等于已答题数，这样会显示下一题（未答的题）
      // 例如：已答3题，currentIndex应该是3，显示第4题（索引3）
      const answeredCount = answeredQuestions.value.length
      currentIndex.value = answeredCount < props.questions.length ? answeredCount : props.questions.length - 1
    } else {
      sessionStats.value = { correct: 0, wrong: 0, total: 0 }
      currentIndex.value = 0
      answeredQuestions.value = []
      score.value = 0
    }
  }
}, { immediate: true })

watch(currentIndex, () => {
  selectedAnswer.value = null
  showResult.value = false
  // 保存当前进度
  saveCurrentProgress()
  // 每次切換題目時重新聚焦
  nextTick(() => {
    if (questionCardRef.value) {
      questionCardRef.value.focus()
    }
  })
})

// 保存当前答题进度
const saveCurrentProgress = () => {
  if (props.questions && props.questions.length > 0) {
    saveQuizProgress(
      props.grade,
      props.subject,
      props.semester,
      props.publisher,
      {
        questions: props.questions,
        currentIndex: currentIndex.value,
        answeredQuestions: answeredQuestions.value,
        score: score.value,
        type: props.quizType,
        startTime: props.startTime || Date.now()
      }
    )
  }
}

const selectAnswer = (answer) => {
  if (showResult.value) return
  selectedAnswer.value = answer
}

const checkAnswer = () => {
  if (selectedAnswer.value === null) {
    return
  }
  
  showResult.value = true
  
  const correct = isCorrect.value
  if (correct) {
    score.value++
    sessionStats.value.correct++
  } else {
    sessionStats.value.wrong++
  }
  sessionStats.value.total++
  
  // 保存答題記錄
  saveAnswerRecord(currentQuestion.value.id, correct, props.grade, props.subject, props.semester, props.publisher)
  
  answeredQuestions.value.push({
    questionId: currentQuestion.value.id,
    isCorrect: correct
  })
  
  // 自動進入下一題
  // 如果該題有解釋說明，停留1秒；否則停留0.75秒
  const hasExplanation = currentQuestion.value.explanation && currentQuestion.value.explanation.trim().length > 0
  const delay = hasExplanation ? 1000 : 750
  
  setTimeout(() => {
    nextQuestion()
  }, delay)
}

const nextQuestion = () => {
  if (currentIndex.value < props.questions.length - 1) {
    currentIndex.value++
  } else {
    // 计算答题总时间（秒）
    const duration = props.startTime ? Math.floor((Date.now() - props.startTime) / 1000) : 0
    // 计算正确率
    const accuracy = props.questions.length > 0 ? (score.value / props.questions.length * 100).toFixed(1) : 0
    
    // 获取题目分类（如果有多个分类，取第一个）
    const categories = [...new Set(props.questions.map(q => q.category))]
    const category = categories.length === 1 ? categories[0] : '綜合練習'
    
    emit('finish-quiz', {
      score: score.value,
      total: props.questions.length,
      accuracy: parseFloat(accuracy),
      duration: duration,
      type: props.quizType || (props.questions.length === 10 ? '基本挑戰' : props.questions.length === 25 ? '進階挑戰' : category),
      category: category,
      answeredQuestions: answeredQuestions.value
    })
  }
}

const backToMenu = () => {
  // 离开前保存当前进度
  saveCurrentProgress()
  emit('back-to-menu')
}

// 鍵盤快捷鍵處理
const handleKeyPress = (event) => {
  // 防止在輸入框中觸發
  if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.isContentEditable) {
    return
  }
  
  // 如果已經顯示結果，按 Enter 或空格鍵進入下一題
  if (showResult.value) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation()
      nextQuestion()
    }
    return
  }

  // 選擇題：1-4 或 A-D 對應選項
  if (currentQuestion.value?.options) {
    const key = event.key.toUpperCase()
    let optionIndex = -1
    
    // 數字鍵 1-4 (支援多種格式)
    if (event.key === '1' || event.key === 'Digit1' || event.code === 'Digit1') {
      optionIndex = 0
    } else if (event.key === '2' || event.key === 'Digit2' || event.code === 'Digit2') {
      optionIndex = 1
    } else if (event.key === '3' || event.key === 'Digit3' || event.code === 'Digit3') {
      optionIndex = 2
    } else if (event.key === '4' || event.key === 'Digit4' || event.code === 'Digit4') {
      optionIndex = 3
    }
    // 字母鍵 A-D (不區分大小寫)
    else if (key === 'A' || event.code === 'KeyA') {
      optionIndex = 0
    } else if (key === 'B' || event.code === 'KeyB') {
      optionIndex = 1
    } else if (key === 'C' || event.code === 'KeyC') {
      optionIndex = 2
    } else if (key === 'D' || event.code === 'KeyD') {
      optionIndex = 3
    }
    
    if (optionIndex >= 0 && optionIndex < currentQuestion.value.options.length) {
      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation()
      selectAnswer(optionIndex)
      // 自動確認答案
      setTimeout(() => {
        if (selectedAnswer.value === optionIndex) {
          checkAnswer()
        }
      }, 50)
    }
  }
}

onMounted(() => {
  // 載入答題歷史
  questionHistory.value = getAnswerHistory(props.grade, props.subject, props.semester, props.publisher)
  
  // 立即綁定事件，使用 capture 模式確保能捕獲所有按鍵事件
  window.addEventListener('keydown', handleKeyPress, { capture: true, passive: false })
  document.addEventListener('keydown', handleKeyPress, { capture: true, passive: false })
  document.body.addEventListener('keydown', handleKeyPress, { capture: true, passive: false })
  
  // 確保問題卡片獲得焦點
  nextTick(() => {
    if (questionCardRef.value) {
      questionCardRef.value.focus()
    }
  })
  
  console.log('快捷键已绑定')
})

onBeforeUnmount(() => {
  // 组件卸载前保存进度
  saveCurrentProgress()
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress, { capture: true })
  document.removeEventListener('keydown', handleKeyPress, { capture: true })
  document.body.removeEventListener('keydown', handleKeyPress, { capture: true })
})
</script>

<style scoped>
.quiz-view {
  min-height: calc(100vh - 60px);
  padding: 16px 12px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  overflow-y: auto;
  box-sizing: border-box;
}

.quiz-container {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 10px;
  padding: 10px;
  max-width: 520px;
  width: 100%;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 0;
}

.quiz-header {
  margin-bottom: 8px;
}

.back-btn {
  background: #f0f0f0;
  border: none;
  padding: 4px 10px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.8em;
  margin-bottom: 6px;
  transition: background 0.2s;
}

.back-btn:hover {
  background: #e0e0e0;
}

.progress-bar {
  width: 100%;
  height: 12px;
  background: #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 4px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s;
}

.progress-text {
  text-align: center;
  color: #666;
  font-size: 1.5em;
  margin-bottom: 8px;
}

.session-stats {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.stat-item {
  font-size: 1.3em;
  padding: 4px 12px;
  border-radius: 8px;
  font-weight: bold;
  white-space: nowrap;
}

.correct-stat {
  background: #e8f5e9;
  color: #2e7d32;
}

.wrong-stat {
  background: #ffebee;
  color: #c62828;
}

.total-stat {
  background: #e3f2fd;
  color: #1976d2;
}

.question-card {
  background: white;
  border-radius: 8px;
  padding: 8px;
  outline: none;
}

.question-card:focus {
  outline: 2px solid transparent;
}

/* 答題後明顯正確/錯誤回饋動畫 */
.question-card.result-flash {
  animation: result-flash 0.6s ease-out;
}
.question-card.result-correct {
  box-shadow: 0 0 0 3px #4caf50;
}
.question-card.result-wrong {
  box-shadow: 0 0 0 3px #f44336;
}
@keyframes result-flash {
  0% { filter: brightness(1); }
  25% { filter: brightness(1.15); }
  100% { filter: brightness(1); }
}

.question-header {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
}

.category-badge, .type-badge {
  padding: 4px 12px;
  border-radius: 10px;
  font-size: 1.4em;
  font-weight: bold;
}

.category-badge {
  background: #e3f2fd;
  color: #1976d2;
}

.type-badge {
  background: #f3e5f5;
  color: #7b1fa2;
}

.question-text {
  font-size: 1.9em;
  color: #333;
  margin-bottom: 16px;
  line-height: 1.4;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.options {
  display: grid;
  grid-template-columns: 1fr;
  gap: 6px;
  margin-bottom: 8px;
}

/* iPad 和平板：一列兩個答案 */
@media (min-width: 768px) and (max-width: 1024px) {
  .options {
    grid-template-columns: repeat(2, 1fr);
  }
}

.option-btn {
  padding: 16px 20px;
  background: #f5f5f5;
  border: 2px solid #e0e0e0;
  border-radius: 5px;
  cursor: pointer;
  text-align: left;
  font-size: 1.7em;
  transition: all 0.2s;
  min-height: 56px; /* 确保触摸目标足够大 */
  word-wrap: break-word;
  overflow-wrap: break-word;
  display: flex;
  align-items: center;
}

.option-btn:hover:not(:disabled) {
  background: #e8e8e8;
  border-color: #667eea;
}

.option-btn.selected {
  background: #e3f2fd;
  border-color: #667eea;
  color: #1976d2;
}

.option-btn.correct {
  background: #c8e6c9;
  border-color: #4caf50;
  color: #2e7d32;
}

.option-btn.wrong {
  background: #ffcdd2;
  border-color: #f44336;
  color: #c62828;
}

.true-false-options {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.tf-btn {
  flex: 1;
  padding: 10px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9em;
  font-weight: bold;
  transition: all 0.2s;
}

.true-btn {
  background: #e8f5e9;
  color: #2e7d32;
}

.false-btn {
  background: #ffebee;
  color: #c62828;
}

.tf-btn:hover:not(:disabled) {
  transform: scale(1.05);
}

.tf-btn.selected {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

.tf-btn.correct {
  background: #c8e6c9;
  border-color: #4caf50;
}

.tf-btn.wrong {
  background: #ffcdd2;
  border-color: #f44336;
}

.fill-blank {
  margin-bottom: 8px;
}

.fill-input {
  width: 100%;
  padding: 8px;
  font-size: 0.9em;
  border: 2px solid #e0e0e0;
  border-radius: 5px;
  margin-bottom: 8px;
}

.fill-input:focus {
  outline: none;
  border-color: #667eea;
}

.submit-btn {
  padding: 6px 16px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 0.85em;
  cursor: pointer;
  transition: background 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background: #5568d3;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.explanation {
  margin-top: 8px;
  padding: 8px;
  background: #f9f9f9;
  border-radius: 5px;
  border-left: 3px solid #667eea;
}

.result-badge {
  font-size: 1.8em;
  font-weight: bold;
  margin-bottom: 12px;
  padding: 8px 20px;
  border-radius: 5px;
  display: inline-block;
}

.correct-badge {
  background: #4caf50;
  color: #fff;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.4);
  animation: badge-pop 0.35s ease-out;
}
.wrong-badge {
  background: #f44336;
  color: #fff;
  box-shadow: 0 2px 8px rgba(244, 67, 54, 0.4);
  animation: badge-pop 0.35s ease-out;
}
@keyframes badge-pop {
  0% { transform: scale(0.95); opacity: 0.9; }
  70% { transform: scale(1.03); }
  100% { transform: scale(1); opacity: 1; }
}

.explanation-text {
  line-height: 1.5;
  color: #555;
  font-size: 1.7em;
}

.quiz-controls {
  position: sticky;
  bottom: 0;
  background: rgba(255, 255, 255, 0.98);
  padding: 6px;
  text-align: center;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
  border-top: 1px solid #e0e0e0;
  margin-top: 6px;
  margin-bottom: 0;
}

.control-btn {
  padding: 12px 40px;
  font-size: 1.7em;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s;
  min-width: 200px;
}

.check-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.check-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.next-btn {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: white;
}

.next-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(76, 175, 80, 0.4);
}

.shortcut-hint {
  margin-top: 12px;
  text-align: center;
  font-size: 1.4em;
  color: #999;
  padding: 8px;
}

.shortcut-hint kbd {
  display: inline-block;
  padding: 4px 8px;
  background: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 3px;
  font-family: monospace;
  font-size: 1.6em;
  margin: 0 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.auto-next-hint {
  font-size: 0.8em;
  color: #666;
  padding: 6px;
}

/* 手机响应式 */
@media (max-width: 600px) {
  .quiz-view {
    padding: 12px 8px;
    min-height: calc(100vh - 55px);
  }
  
  .quiz-container {
    padding: 8px;
    border-radius: 8px;
  }
  
  .back-btn {
    padding: 6px 12px;
    font-size: 0.9em;
  }
  
  .progress-text {
    font-size: 1.2em;
  }
  
  .session-stats {
    gap: 8px;
  }
  
  .stat-item {
    font-size: 1em;
    padding: 4px 8px;
  }
  
  .category-badge, .type-badge {
    font-size: 1.1em;
    padding: 3px 10px;
  }
  
  .question-text {
    font-size: 1.4em;
    margin-bottom: 12px;
  }
  
  .options {
    gap: 8px;
  }
  
  .option-btn {
    padding: 14px 16px;
    font-size: 1.3em;
    min-height: 52px;
  }
  
  .explanation {
    padding: 10px;
  }
  
  .result-badge {
    font-size: 1.4em;
    padding: 6px 16px;
  }
  
  .explanation-text {
    font-size: 1.3em;
  }
  
  .control-btn {
    padding: 14px 24px;
    font-size: 1.4em;
    min-width: 160px;
    width: 100%;
    max-width: 100%;
  }
  
  .shortcut-hint {
    font-size: 1.1em;
    padding: 6px;
  }
  
  .shortcut-hint kbd {
    font-size: 1.2em;
    padding: 3px 6px;
  }
}

/* 小屏幕手机 */
@media (max-width: 480px) {
  .quiz-view {
    padding: 10px 6px;
  }
  
  .quiz-container {
    padding: 6px;
  }
  
  .progress-text {
    font-size: 1.1em;
  }
  
  .stat-item {
    font-size: 0.9em;
    padding: 3px 6px;
  }
  
  .question-text {
    font-size: 1.2em;
  }
  
  .option-btn {
    padding: 12px 14px;
    font-size: 1.1em;
    min-height: 48px;
  }
  
  .result-badge {
    font-size: 1.2em;
    padding: 5px 12px;
  }
  
  .explanation-text {
    font-size: 1.1em;
  }
  
  .control-btn {
    padding: 12px 20px;
    font-size: 1.2em;
    min-width: 140px;
  }
  
  .shortcut-hint {
    font-size: 1em;
  }
}

/* 超小屏幕 */
@media (max-width: 360px) {
  .question-text {
    font-size: 1.1em;
  }
  
  .option-btn {
    padding: 10px 12px;
    font-size: 1em;
    min-height: 44px;
  }
  
  .control-btn {
    font-size: 1.1em;
    padding: 10px 16px;
  }
}
</style>


