<template>
  <div class="app">
    <div class="app-header">
      <h1 class="app-title">{{ appTitle }}</h1>
      <div class="header-buttons">
        <button v-if="currentSubject" @click="changeSubject" class="header-btn subject-btn">🔄 換科目</button>
        <button @click="showStatistics" class="header-btn stats-btn">📊 統計</button>
        <button @click="showAllWrongQuestions" class="header-btn wrong-btn">❌ 錯題</button>
      </div>
      <span class="app-version">v1.3.0</span>
    </div>
    <SubjectSelector 
      v-if="currentView === 'subject-selector'"
      @select-subject="selectSubject"
    />
    <MainMenu 
      v-else-if="currentView === 'menu'"
      :subject="currentSubject"
      @start-quiz="startQuiz"
      @start-review="startReview"
    />
    <QuizView 
      v-else-if="currentView === 'quiz'"
      :questions="quizQuestions"
      :quiz-type="quizType"
      :start-time="quizStartTime"
      @finish-quiz="finishQuiz"
      @back-to-menu="backToMenu"
    />
    <ReviewView 
      v-else-if="currentView === 'review'"
      @back-to-menu="backToMenu"
    />
    <ResultView 
      v-else-if="currentView === 'result'"
      :score="quizScore"
      :total="quizTotal"
      :session-wrong-questions="sessionWrongQuestions"
      :session-stats="sessionStats"
      @back-to-menu="backToMenu"
      @restart-quiz="restartQuiz"
      @view-wrong-questions="viewWrongQuestions"
    />
    <WrongQuestionsView 
      v-else-if="currentView === 'wrong-questions'"
      :wrong-questions="currentWrongQuestions"
      @back="backFromWrongQuestions"
    />
    <StatisticsView 
      v-else-if="currentView === 'statistics'"
      @back="backToMenu"
    />
    <AllWrongQuestionsView 
      v-else-if="currentView === 'all-wrong-questions'"
      @back="backToMenu"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import SubjectSelector from './components/SubjectSelector.vue'
import MainMenu from './components/MainMenu.vue'
import QuizView from './components/QuizView.vue'
import ReviewView from './components/ReviewView.vue'
import ResultView from './components/ResultView.vue'
import WrongQuestionsView from './components/WrongQuestionsView.vue'
import StatisticsView from './components/StatisticsView.vue'
import AllWrongQuestionsView from './components/AllWrongQuestionsView.vue'
import { SUBJECT_NAMES, SUBJECT_ICONS } from './data/questions.js'

const currentView = ref('subject-selector')
const currentSubject = ref(null)
const quizQuestions = ref([])
const quizScore = ref(0)
const quizTotal = ref(0)
const quizType = ref('')
const quizStartTime = ref(null)
const sessionWrongQuestions = ref([])
const currentWrongQuestions = ref([])
const sessionStats = ref(null)

// 計算應用標題
const appTitle = computed(() => {
  if (!currentSubject.value) {
    return '國小題庫練習'
  }
  const subjectName = SUBJECT_NAMES[currentSubject.value] || '題庫'
  const subjectIcon = SUBJECT_ICONS[currentSubject.value] || '📚'
  return `${subjectIcon} 國小${subjectName} 題庫練習`
})

// 選擇科目
const selectSubject = (subjectId) => {
  currentSubject.value = subjectId
  currentView.value = 'menu'
  // 保存選擇的科目
  localStorage.setItem('lastSelectedSubject', subjectId)
}

// 切換科目
const changeSubject = () => {
  currentView.value = 'subject-selector'
}

// 初始化時載入上次選擇的科目
const lastSubject = localStorage.getItem('lastSelectedSubject')
if (lastSubject) {
  currentSubject.value = lastSubject
  currentView.value = 'menu'
}

const startQuiz = (data) => {
  // 支持新格式（包含type）和旧格式（只有questions数组）
  if (data && typeof data === 'object' && data.questions) {
    quizQuestions.value = data.questions
    quizType.value = data.type || ''
    quizTotal.value = data.questions.length
  } else {
    // 兼容旧格式
    quizQuestions.value = data
    quizType.value = ''
    quizTotal.value = data.length
  }
  quizScore.value = 0
  quizStartTime.value = Date.now()
  currentView.value = 'quiz'
}

const startReview = () => {
  currentView.value = 'review'
}

const finishQuiz = (data) => {
  // 支持新格式（对象）和旧格式（数字）
  if (typeof data === 'object' && data.score !== undefined) {
    quizScore.value = data.score
    quizTotal.value = data.total
    sessionWrongQuestions.value = data.answeredQuestions?.filter(q => !q.isCorrect).map(q => q.questionId) || []
    
    // 保存本次练习统计信息
    sessionStats.value = {
      type: data.type || '未知',
      duration: data.duration || 0,
      accuracy: data.accuracy || 0,
      subject: currentSubject.value
    }
    
    // 保存练习记录
    import('./utils/storage.js').then(({ savePracticeRecord }) => {
      savePracticeRecord({
        subject: currentSubject.value,
        type: data.type || '未知',
        count: data.total || 0,
        score: data.score || 0,
        accuracy: data.accuracy || 0,
        duration: data.duration || 0,
        wrongQuestions: sessionWrongQuestions.value
      })
    })
  } else {
    quizScore.value = data
    sessionWrongQuestions.value = []
    sessionStats.value = null
  }
  currentView.value = 'result'
}

const backToMenu = () => {
  currentView.value = 'menu'
}

const restartQuiz = () => {
  currentView.value = 'quiz'
  quizScore.value = 0
  quizStartTime.value = Date.now()
}

const viewWrongQuestions = (wrongQuestions) => {
  currentWrongQuestions.value = wrongQuestions
  currentView.value = 'wrong-questions'
}

const backFromWrongQuestions = () => {
  currentView.value = 'result'
}

const showStatistics = () => {
  currentView.value = 'statistics'
}

const showAllWrongQuestions = () => {
  currentView.value = 'all-wrong-questions'
}
</script>

<style scoped>
.app {
  width: 100%;
  min-height: 100vh;
  position: relative;
  padding-top: 60px; /* 为固定 header 留出空间 */
}

.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 10px 12px;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 50px;
  box-sizing: border-box;
}

.app-title {
  font-size: 1em;
  margin: 0;
  font-weight: bold;
  flex: 1;
  text-align: center;
  padding: 0 80px; /* 为左右按钮留出空间 */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header-buttons {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-shrink: 0;
}

.header-btn {
  padding: 6px 10px;
  font-size: 0.75em;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s;
  color: white;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  white-space: nowrap;
  min-width: 44px; /* 确保触摸目标足够大 */
}

.header-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.header-btn:active {
  transform: translateY(0);
}

.subject-btn {
  border-left: 3px solid #ff9800;
}

.stats-btn {
  border-left: 3px solid #4caf50;
}

.wrong-btn {
  border-left: 3px solid #f44336;
}

.app-version {
  position: absolute;
  top: 4px;
  right: 8px;
  font-size: 0.6em;
  opacity: 0.8;
  color: rgba(255, 255, 255, 0.9);
  font-weight: normal;
  line-height: 1;
}

/* 手机端响应式 */
@media (max-width: 480px) {
  .app {
    padding-top: 55px;
  }
  
  .app-header {
    padding: 8px 8px;
    min-height: 48px;
  }
  
  .app-title {
    font-size: 0.85em;
    padding: 0 70px;
  }
  
  .header-btn {
    padding: 5px 8px;
    font-size: 0.7em;
    min-width: 40px;
  }
  
  .header-buttons {
    gap: 4px;
  }
  
  .app-version {
    font-size: 0.55em;
    top: 2px;
    right: 6px;
  }
}

/* 小屏幕手机 */
@media (max-width: 360px) {
  .app-title {
    font-size: 0.75em;
    padding: 0 60px;
  }
  
  .header-btn {
    padding: 4px 6px;
    font-size: 0.65em;
    min-width: 36px;
  }
  
  .app-version {
    font-size: 0.5em;
  }
}
</style>

