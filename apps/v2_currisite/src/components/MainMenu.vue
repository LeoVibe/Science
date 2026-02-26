<template>
  <div class="main-menu" :style="menuStyle">
    <div class="menu-container">
      <h1 class="title">{{ subjectTitle }}</h1>
      <p class="subtitle">
        <span class="subtitle-text">{{ props.grade }}年級 {{ props.subject }} {{ semesterName }} ({{ props.publisher }}版)</span>
        <span v-if="QUESTIONS.length === 0" class="no-questions-badge">⚠️ 尚無題庫</span>
      </p>
      
      <!-- 無題庫：單一友善空狀態，不顯示綜合/分課/全部區塊 -->
      <div v-if="QUESTIONS.length === 0" class="menu-options empty-state-wrap">
        <div class="empty-state-card">
          <div class="empty-state-icon">📚</div>
          <h2 class="empty-state-title">此科目的題庫正在建置中</h2>
          <p class="empty-state-message">敬請期待！完成後將提供綜合練習、分課練習與全部題庫。</p>
          <p class="empty-state-hint">若有建議或想優先使用的年級／科目，歡迎來信：<a href="mailto:yotta0280@gmail.com">yotta0280@gmail.com</a></p>
        </div>
      </div>

      <!-- 有題庫：綜合練習、分課練習、全部題庫 -->
      <div v-else class="menu-options">
        <div class="menu-section">
          <h2>📝 綜合練習</h2>
          <div class="quiz-options">
            <button 
              v-for="option in quizOptions" 
              :key="option.label"
              @click="startQuiz(option.count)"
              class="menu-btn quiz-btn"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <div v-if="lessons.length > 0" class="menu-section lesson-section">
          <h2>📚 分課練習</h2>
          <div class="category-buttons">
            <button
              v-for="(lesson, index) in lessons"
              :key="lesson"
              @click="startLessonQuiz(lesson)"
              class="menu-btn category-btn"
            >
              第{{ index + 1 }}課：{{ lesson }}
            </button>
          </div>
        </div>

        <div class="menu-section">
          <button @click="startReview" class="menu-btn review-btn">
            📖 全部題庫
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { loadQuestions } from '../data/index.js'
import { SUBJECT_ICONS, SEMESTER_NAMES, SUBJECT_COLORS } from '../data/config.js'
import { getAnswerHistory, loadQuizProgress } from '../utils/storage.js'
import { clearCacheForCombination } from '../utils/questionAvailability.js'

const props = defineProps({
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
  }
})

const semesterName = computed(() => SEMESTER_NAMES[props.semester] || '')

const emit = defineEmits(['start-quiz', 'start-review', 'questions-loaded'])

const categories = ref([])
const lessons = ref([]) // 分课练习的课程列表（已按顺序排列）
const lessonOrderMap = ref(new Map()) // 存储课程和其顺序编号的映射
const answerHistory = ref(null)
const questionsModule = ref(null)
const QUESTIONS = ref([])

// 計算科目標題
const subjectTitle = computed(() => {
  const subjectIcon = SUBJECT_ICONS[props.subject] || '📚'
  return `${subjectIcon} ${props.subject}複習 ${subjectIcon}`
})

// 根據科目設置菜單背景色和文字顏色
const menuStyle = computed(() => {
  const colors = SUBJECT_COLORS[props.subject]
  if (colors) {
    return {
      background: colors.gradient,
      color: colors.textColor || '#333'
    }
  }
  return { color: '#333' }
})

// 只保留有效的選擇題（至少2個選項）
const getMultipleChoiceOnly = (questions) => {
  return questions.filter(q => {
    if (!q || !q.question) return false
    if (!q.options || !Array.isArray(q.options) || q.options.length < 2) return false
    // 檢查答案是否有效（數字索引）
    const answer = q.answer !== undefined ? q.answer : q.correctAnswer
    return typeof answer === 'number' && answer >= 0 && answer < q.options.length
  })
}

// 獲取正確答案索引（兼容新舊格式）
const getCorrectAnswer = (question) => {
  return question.answer !== undefined ? question.answer : question.correctAnswer
}

// 載入題目
const loadSubjectQuestions = async () => {
  if (!props.grade || !props.subject || !props.semester || !props.publisher) {
    console.warn('配置不完整，无法加载题目:', { grade: props.grade, subject: props.subject, semester: props.semester, publisher: props.publisher })
    QUESTIONS.value = []
    categories.value = []
    lessons.value = []
    lessonOrderMap.value = new Map()
    return
  }
  
  try {
    console.log('开始加载题目:', { grade: props.grade, subject: props.subject, semester: props.semester, publisher: props.publisher })
    // 加载当前学期的题目（用于综合练习）
    questionsModule.value = await loadQuestions(props.grade, props.subject, props.semester, props.publisher)
    QUESTIONS.value = questionsModule.value.questions || []
    console.log('加载的题目数量:', QUESTIONS.value.length)
    categories.value = questionsModule.value.getAllCategories ? questionsModule.value.getAllCategories() : []
    
    // 分課練習：僅顯示「當前學期」的課程（不合併 S1+S2，避免上下學期課程名稱重複）
    const lessonMap = new Map() // lesson ID -> { title, order, lessonId }
    const currentQuestions = questionsModule.value.questions || []
    currentQuestions.forEach(q => {
      if (q && (q.lesson || q.category || q.lessonTitle)) {
        const lessonId = q.lesson || ''
        const title = q.lessonTitle || q.category || q.lesson
        const order = q.lessonOrder !== undefined ? q.lessonOrder : 999
        if (!lessonMap.has(lessonId)) {
          lessonMap.set(lessonId, { title, order, lessonId })
        }
      }
    })
    
    const sortedLessons = Array.from(lessonMap.entries())
      .sort((a, b) => {
        if (a[1].order !== b[1].order) return a[1].order - b[1].order
        return (a[0] || '').localeCompare(b[0] || '')
      })
    
    const lessonInfoMap = new Map()
    sortedLessons.forEach(([lessonId, info], index) => {
      lessonInfoMap.set(info.title, { lessonId, order: index + 1 })
    })
    
    lessons.value = sortedLessons.map(([, info]) => info.title)
    lessonOrderMap.value = lessonInfoMap
    
    answerHistory.value = getAnswerHistory(props.grade, props.subject, props.semester, props.publisher)
    
    // 题目加载成功后，清除该组合的缓存，确保可用性状态是最新的
    clearCacheForCombination(props.grade, props.subject, props.publisher)
    
    // 通知父组件更新可用性状态（通过事件）
    emit('questions-loaded', {
      grade: props.grade,
      subject: props.subject,
      publisher: props.publisher,
      hasQuestions: QUESTIONS.value.length > 0
    })
  } catch (error) {
    console.error('載入題目失敗:', error)
    console.error('错误详情:', error.stack)
    QUESTIONS.value = []
    categories.value = []
    lessons.value = []
    lessonOrderMap.value = new Map()
    answerHistory.value = null
    // 显示错误提示
    alert(`載入題目失敗：${error.message}\n請檢查配置是否正確。`)
  }
}

// 監聽配置變化
watch([() => props.grade, () => props.subject, () => props.semester, () => props.publisher], () => {
  loadSubjectQuestions()
}, { immediate: true })

// 初始化
onMounted(() => {
  loadSubjectQuestions()
})

const quizOptions = [
  { label: '基本挑戰 (10題)', count: 10 },
  { label: '進階挑戰 (25題)', count: 25 }
]

const startQuiz = (count) => {
  // 注意：这里不再检查保存的进度，因为 startQuiz 函数会在 App.vue 中统一处理
  // 这样可以确保逻辑一致，并且能够正确处理"重新开始"的情况
  
  if (!questionsModule.value || QUESTIONS.value.length === 0) {
    alert('題目尚未載入，請稍候...')
    return
  }
  
  console.log('开始练习，题目数量:', count)
  const history = getAnswerHistory(props.grade, props.subject, props.semester, props.publisher)
  
  // 先获取所有有效题目（包括2选项的是非题和4选项的选择题）
  const allValidQuestions = getMultipleChoiceOnly(QUESTIONS.value)
  console.log('有效题目总数:', allValidQuestions.length)
  console.log('原始题目总数:', QUESTIONS.value.length)
  
  if (allValidQuestions.length === 0) {
    console.error('没有找到有效题目！')
    console.error('题目示例:', QUESTIONS.value.slice(0, 3))
    alert(`抱歉，目前没有可用的题目。\n已加载 ${QUESTIONS.value.length} 题，但都不符合格式要求。`)
    return
  }
  
  // 如果题目总数不足，直接使用所有题目
  if (allValidQuestions.length <= count) {
    const shuffled = [...allValidQuestions].sort(() => Math.random() - 0.5)
    emit('start-quiz', { questions: shuffled, type: count === 10 ? '基本挑戰' : '進階挑戰', count })
    return
  }
  
  // 如果有歷史記錄，優先選擇錯題
  let selectedQuestions = []
  if (history && Object.keys(history).length > 0) {
    const wrongQuestions = allValidQuestions.filter(q => {
      const recordKey = q.id.toString()
      const record = history[recordKey]
      return record && record.wrong > 0
    })
    
    if (wrongQuestions.length > 0) {
      const shuffled = [...wrongQuestions].sort(() => Math.random() - 0.5)
      selectedQuestions = shuffled.slice(0, Math.min(count, wrongQuestions.length))
    }
  }
  
  // 如果錯題不夠，補充其他題目（確保最終題目數量等於 count）
  if (selectedQuestions.length < count) {
    const usedIds = new Set(selectedQuestions.map(q => q.id))
    const available = allValidQuestions.filter(q => !usedIds.has(q.id))
    const shuffled = [...available].sort(() => Math.random() - 0.5)
    const needed = count - selectedQuestions.length
    selectedQuestions.push(...shuffled.slice(0, needed))
  }
  
  // 確保最終題目數量正確（如果題目不足，使用所有可用題目）
  if (selectedQuestions.length !== count && selectedQuestions.length < allValidQuestions.length) {
    console.warn(`題目數量不匹配：期望 ${count} 題，實際 ${selectedQuestions.length} 題`)
  }
  
  console.log('開始練習，題目數量:', count, '實際選擇:', selectedQuestions.length)
  
  if (selectedQuestions.length === 0) {
    console.error('无法获取题目！')
    alert('抱歉，无法获取题目。')
    return
  }
  
  emit('start-quiz', { 
    questions: selectedQuestions,
    type: count === 10 ? '基本挑戰' : '進階挑戰',
    count 
  })
}

const startLessonQuiz = async (lessonTitle) => {
  const history = getAnswerHistory(props.grade, props.subject, props.semester, props.publisher)
  
  const lessonInfo = lessonOrderMap.value.get(lessonTitle)
  if (!lessonInfo) {
    console.warn('找不到課程資訊:', lessonTitle)
    return
  }
  
  // 僅使用「當前學期」的題目（分課練習與學期一致）
  const allQuestions = QUESTIONS.value.filter(
    q => q.category === lessonTitle || q.lessonTitle === lessonTitle || q.lesson === lessonInfo.lessonId
  )
  const filteredQuestions = getMultipleChoiceOnly(allQuestions)
  
  if (filteredQuestions.length === 0) {
    alert(`「${lessonTitle}」目前沒有可用的題目`)
    return
  }
  
  // 根據歷史調整順序（错题优先）
  if (history && Object.keys(history).length > 0) {
    filteredQuestions.sort((a, b) => {
      const aKey = a.id.toString()
      const bKey = b.id.toString()
      const aRecord = history[aKey]
      const bRecord = history[bKey]
      const aWeight = aRecord ? (aRecord.wrong > 0 ? 0.6 : 0.1) : 1.0
      const bWeight = bRecord ? (bRecord.wrong > 0 ? 0.6 : 0.1) : 1.0
      return bWeight - aWeight
    })
  }
  
  emit('start-quiz', { 
    questions: filteredQuestions,
    type: lessonTitle,
    count: filteredQuestions.length
  })
}

const startReview = () => {
  emit('start-review')
}
</script>

<style scoped>
.main-menu {
  min-height: calc(100vh - 80px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 16px;
  box-sizing: border-box;
  transition: background 0.35s ease, color 0.35s ease;
}

.menu-container {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 40px;
  max-width: 800px;
  width: 100%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  box-sizing: border-box;
}

.title {
  font-size: 3.5em;
  text-align: center;
  margin-bottom: 15px;
  font-weight: bold;
  line-height: 1.2;
  color: inherit;
}

.subtitle {
  font-size: 2em;
  text-align: center;
  margin-bottom: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
  color: inherit;
}

.subtitle-text {
  display: inline-block;
}

.subject-icon-inline {
  font-size: 1.2em;
  margin-left: 8px;
  vertical-align: middle;
}

.no-questions-badge {
  display: inline-block;
  padding: 6px 16px;
  background: #ff9800;
  color: white;
  border-radius: 20px;
  font-size: 0.7em;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(255, 152, 0, 0.4);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.menu-section {
  margin-bottom: 40px;
}

.menu-section h2 {
  font-size: 2.5em;
  color: inherit;
  margin-bottom: 20px;
  text-align: center;
}

.quiz-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.category-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

/* 分課練習：字體縮小，不顯示題數 */
.lesson-section h2 {
  font-size: 1.6em;
}
.lesson-section .category-btn {
  font-size: 0.95em;
  padding: 12px 16px;
  min-height: 48px;
}

.menu-btn {
  padding: 20px 30px;
  font-size: 1.8em;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: bold;
  color: white;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  word-wrap: break-word;
}

.quiz-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.quiz-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.quiz-btn:active {
  transform: translateY(0);
}

.category-btn {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.category-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(245, 87, 108, 0.4);
}

.category-btn:active {
  transform: translateY(0);
}

.review-btn {
  width: 100%;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  font-size: 2em;
  padding: 25px;
}

.review-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(79, 172, 254, 0.4);
}

.review-btn:active {
  transform: translateY(0);
}

@media (max-width: 600px) {
  .title {
    font-size: 2.5em;
  }
  
  .subtitle {
    font-size: 1.5em;
    margin-bottom: 30px;
    flex-wrap: wrap;
  }
  
  .no-questions-badge {
    font-size: 0.65em;
    padding: 4px 12px;
  }
  
  .menu-section {
    margin-bottom: 30px;
  }
  
  .menu-section h2 {
    font-size: 2em;
    margin-bottom: 15px;
  }
  
  .menu-btn {
    padding: 15px 20px;
    font-size: 1.5em;
  }
  
  .review-btn {
    font-size: 1.8em;
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .menu-container {
    padding: 20px;
    border-radius: 15px;
  }
  
  .title {
    font-size: 2em;
  }
  
  .subtitle {
    font-size: 1.2em;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }
  
  .no-questions-badge {
    font-size: 0.6em;
    padding: 3px 10px;
  }
  
  .menu-section h2 {
    font-size: 1.8em;
    margin-bottom: 10px;
  }
  
  .menu-btn {
    padding: 12px 15px;
    font-size: 1.2em;
  }
  
  .review-btn {
    font-size: 1.5em;
    padding: 15px;
  }
}

/* 無題庫：友善空狀態 */
.empty-state-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 280px;
}
.empty-state-card {
  text-align: center;
  padding: 2.5rem 2rem;
  max-width: 420px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}
.empty-state-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.9;
}
.empty-state-title {
  font-size: 1.5rem;
  margin: 0 0 0.75rem 0;
  color: inherit;
  font-weight: 700;
}
.empty-state-message {
  font-size: 1.1rem;
  line-height: 1.6;
  margin: 0 0 1rem 0;
  color: inherit;
  opacity: 0.9;
}
.empty-state-hint {
  font-size: 0.95rem;
  margin: 0;
  opacity: 0.85;
}
.empty-state-hint a {
  color: inherit;
  text-decoration: underline;
}
.no-questions-message {
  padding: 15px 20px;
  font-size: 1.5em;
  border: 2px dashed rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.5);
  color: inherit;
  opacity: 0.7;
  text-align: center;
  margin: 5px 0;
}
</style>
