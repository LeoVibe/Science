<template>
  <div class="main-menu">
    <div class="menu-container">
      <h1 class="title">🌱 自然科學複習 🌱</h1>
      <p class="subtitle">國小三年級</p>
      
      <div class="menu-options">
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

        <div v-if="categories.length > 0" class="menu-section">
          <h2>📚 分類複習</h2>
          <div class="category-buttons">
            <button
              v-for="category in categories"
              :key="category"
              @click="startCategoryQuiz(category)"
              class="menu-btn category-btn"
            >
              {{ category }}
            </button>
          </div>
        </div>

        <div class="menu-section">
          <button @click="startReview" class="menu-btn review-btn">
            📖 知識複習
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { getQuestionsBySubject } from '../data/questions.js'
import { getAnswerHistory } from '../utils/storage.js'

const props = defineProps({
  subject: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['start-quiz', 'start-review'])

const categories = ref([])
const answerHistory = ref(null)
const questionsModule = ref(null)
const QUESTIONS = ref([])

// 只保留4選項的選擇題（題目數據中沒有type字段，所有有options的都是選擇題）
const getMultipleChoiceOnly = (questions) => {
  return questions.filter(q => 
    q.options && 
    Array.isArray(q.options) &&
    q.options.length === 4 &&
    typeof q.correctAnswer === 'number'
  )
}

// 載入科目題目
const loadSubjectQuestions = async () => {
  if (!props.subject) return
  
  try {
    questionsModule.value = await getQuestionsBySubject(props.subject)
    QUESTIONS.value = questionsModule.value.QUESTIONS || []
    categories.value = questionsModule.value.getAllCategories ? questionsModule.value.getAllCategories() : []
    answerHistory.value = getAnswerHistory(props.subject)
  } catch (error) {
    console.error('載入題目失敗:', error)
    alert('載入題目失敗，請稍後再試')
  }
}

// 監聽科目變化
watch(() => props.subject, () => {
  loadSubjectQuestions()
}, { immediate: true })

// 初始化時載入答題歷史
onMounted(() => {
  loadSubjectQuestions()
})

const quizOptions = [
  { label: '基本挑戰 (10題)', count: 10 },
  { label: '高級挑戰 (20題)', count: 20 }
]

const startQuiz = (count) => {
  if (!questionsModule.value || QUESTIONS.value.length === 0) {
    alert('題目尚未載入，請稍候...')
    return
  }
  
  console.log('开始练习，题目数量:', count)
  const history = getAnswerHistory(props.subject)
  
  // 先获取所有4选项题目
  const all4Options = getMultipleChoiceOnly(QUESTIONS.value)
  console.log('4选项题目总数:', all4Options.length)
  
  if (all4Options.length === 0) {
    console.error('没有找到4选项题目！')
    alert('抱歉，目前没有可用的题目。')
    return
  }
  
  // 如果题目总数不足，直接使用所有题目
  if (all4Options.length <= count) {
    const shuffled = [...all4Options].sort(() => Math.random() - 0.5)
    emit('start-quiz', { questions: shuffled, type: count === 10 ? '基本挑戰' : '高級挑戰', count })
    return
  }
  
  // 如果有歷史記錄，優先選擇錯題
  let selectedQuestions = []
  if (history && Object.keys(history).length > 0) {
    const wrongQuestions = all4Options.filter(q => {
      const recordKey = props.subject ? `${props.subject}_${q.id}` : q.id.toString()
      const record = history[recordKey]
      return record && record.wrong > 0
    })
    
    if (wrongQuestions.length > 0) {
      const shuffled = [...wrongQuestions].sort(() => Math.random() - 0.5)
      selectedQuestions = shuffled.slice(0, Math.min(count, wrongQuestions.length))
    }
  }
  
  // 如果錯題不夠，補充其他題目
  if (selectedQuestions.length < count) {
    const usedIds = new Set(selectedQuestions.map(q => q.id))
    const available = all4Options.filter(q => !usedIds.has(q.id))
    const shuffled = [...available].sort(() => Math.random() - 0.5)
    selectedQuestions.push(...shuffled.slice(0, count - selectedQuestions.length))
  }
  
  console.log('最终题目数量:', selectedQuestions.length)
  
  if (selectedQuestions.length === 0) {
    console.error('无法获取题目！')
    alert('抱歉，无法获取题目。')
    return
  }
  
  emit('start-quiz', { 
    questions: selectedQuestions,
    type: count === 10 ? '基本挑戰' : '高級挑戰',
    count 
  })
}

const startCategoryQuiz = (category) => {
  if (!questionsModule.value) {
    alert('題目尚未載入，請稍候...')
    return
  }
  
  const history = getAnswerHistory(props.subject)
  const getQuestionsByCategory = questionsModule.value.getQuestionsByCategory
  if (!getQuestionsByCategory) {
    alert('此科目不支持分類練習')
    return
  }
  
  const questions = getQuestionsByCategory(category)
  const filteredQuestions = getMultipleChoiceOnly(questions)
  
  // 根據歷史調整順序
  if (history && Object.keys(history).length > 0) {
    filteredQuestions.sort((a, b) => {
      const aKey = props.subject ? `${props.subject}_${a.id}` : a.id.toString()
      const bKey = props.subject ? `${props.subject}_${b.id}` : b.id.toString()
      const aRecord = history[aKey]
      const bRecord = history[bKey]
      const aWeight = aRecord ? (aRecord.wrong > 0 ? 0.6 : 0.1) : 1.0
      const bWeight = bRecord ? (bRecord.wrong > 0 ? 0.6 : 0.1) : 1.0
      return bWeight - aWeight
    })
  }
  
  emit('start-quiz', { 
    questions: filteredQuestions,
    type: category,
    count: filteredQuestions.length
  })
}

const startReview = () => {
  emit('start-review')
}
</script>

<style scoped>
.main-menu {
  min-height: calc(100vh - 60px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 16px;
  box-sizing: border-box;
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
  font-size: 5em;
  color: #667eea;
  text-align: center;
  margin-bottom: 20px;
  font-weight: bold;
  line-height: 1.2;
}

.subtitle {
  font-size: 2.6em;
  color: #764ba2;
  text-align: center;
  margin-bottom: 60px;
}

.menu-section {
  margin-bottom: 60px;
}

.menu-section h2 {
  font-size: 3em;
  color: #333;
  margin-bottom: 30px;
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

.menu-btn {
  padding: 30px 50px;
  font-size: 2.2em;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: bold;
  color: white;
  min-height: 60px; /* 确保触摸目标足够大 */
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
  font-size: 2.4em;
  padding: 36px;
}

.review-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(79, 172, 254, 0.4);
}

.review-btn:active {
  transform: translateY(0);
}

/* 平板响应式 */
@media (max-width: 768px) {
  .menu-container {
    padding: 30px 24px;
  }
  
  .title {
    font-size: 3.5em;
  }
  
  .subtitle {
    font-size: 2em;
    margin-bottom: 40px;
  }
  
  .menu-section {
    margin-bottom: 40px;
  }
  
  .menu-section h2 {
    font-size: 2.5em;
    margin-bottom: 20px;
  }
  
  .menu-btn {
    padding: 24px 40px;
    font-size: 1.8em;
  }
  
  .review-btn {
    font-size: 2em;
    padding: 28px;
  }
}

/* 手机响应式 */
@media (max-width: 600px) {
  .main-menu {
    padding: 16px 12px;
    min-height: calc(100vh - 55px);
  }
  
  .menu-container {
    padding: 24px 16px;
    border-radius: 16px;
  }
  
  .title {
    font-size: 2.5em;
    margin-bottom: 12px;
  }
  
  .subtitle {
    font-size: 1.5em;
    margin-bottom: 30px;
  }
  
  .menu-section {
    margin-bottom: 30px;
  }
  
  .menu-section h2 {
    font-size: 1.8em;
    margin-bottom: 16px;
  }
  
  .category-buttons {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .quiz-options {
    gap: 8px;
  }
  
  .menu-btn {
    padding: 20px 24px;
    font-size: 1.4em;
    border-radius: 10px;
    min-height: 56px;
  }
  
  .review-btn {
    font-size: 1.6em;
    padding: 20px;
  }
}

/* 小屏幕手机 */
@media (max-width: 480px) {
  .main-menu {
    padding: 12px 8px;
  }
  
  .menu-container {
    padding: 20px 12px;
  }
  
  .title {
    font-size: 2em;
  }
  
  .subtitle {
    font-size: 1.3em;
    margin-bottom: 24px;
  }
  
  .menu-section {
    margin-bottom: 24px;
  }
  
  .menu-section h2 {
    font-size: 1.5em;
    margin-bottom: 12px;
  }
  
  .menu-btn {
    padding: 16px 20px;
    font-size: 1.2em;
    min-height: 52px;
  }
  
  .review-btn {
    font-size: 1.4em;
    padding: 16px;
  }
}

/* 超小屏幕 */
@media (max-width: 360px) {
  .title {
    font-size: 1.8em;
  }
  
  .subtitle {
    font-size: 1.1em;
  }
  
  .menu-section h2 {
    font-size: 1.3em;
  }
  
  .menu-btn {
    padding: 14px 16px;
    font-size: 1.1em;
    min-height: 48px;
  }
  
  .review-btn {
    font-size: 1.2em;
    padding: 14px;
  }
}
</style>

