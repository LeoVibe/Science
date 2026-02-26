<template>
  <div class="app" :style="appStyle">
    <!-- 顶部快速选择菜单 -->
    <div class="app-header" :style="headerStyle">
      <div class="quick-select-menu">
        <!-- 年级和学期组合（同一个区块） -->
        <div class="config-block grade-semester-block">
          <div class="select-item">
            <select :value="currentGrade" @change="(e) => requestConfigChange({ grade: Number(e.target.value) })" class="select-input">
              <option 
                v-for="grade in APP_CONFIG.grades" 
                :key="grade" 
                :value="grade"
                :disabled="!isGradeAvailable(grade)"
              >
                {{ grade }}年級{{ !isGradeAvailable(grade) ? ' (無題庫)' : '' }}
              </option>
            </select>
          </div>
          <div class="select-item">
            <select :value="currentSemester" @change="(e) => requestConfigChange({ semester: Number(e.target.value) })" class="select-input">
              <option v-for="sem in APP_CONFIG.semesters" :key="sem" :value="sem">
                {{ SEMESTER_NAMES[sem] }}
              </option>
            </select>
          </div>
        </div>

        <!-- 分隔线 -->
        <div class="divider"></div>

        <!-- 出版社选择（图标化按钮，标签和按钮同一水平线） -->
        <div class="config-block publisher-block">
          <label class="inline-label">出版社</label>
          <div class="icon-buttons">
            <button
              v-for="pub in APP_CONFIG.publishers"
              :key="pub"
              @click="requestConfigChange({ publisher: pub })"
              :class="['icon-btn', 'publisher-btn', { 
                active: currentPublisher === pub,
                disabled: !isPublisherSubjectAvailable(pub, currentSubject)
              }]"
              :title="pub"
              :disabled="!isPublisherSubjectAvailable(pub, currentSubject)"
            >
              <span class="publisher-full">{{ pub }}</span>
              <span class="publisher-short">{{ getPublisherShortName(pub) }}</span>
            </button>
          </div>
        </div>

        <!-- 分隔线 -->
        <div class="divider"></div>

        <!-- 科目选择（图标化按钮，标签和按钮同一水平线） -->
        <div class="config-block subject-block">
          <label class="inline-label">科目</label>
          <div class="icon-buttons">
            <button
              v-for="sub in availableSubjects"
              :key="sub"
              @click="requestConfigChange({ subject: sub })"
              :class="['icon-btn', 'subject-btn', { 
                active: currentSubject === sub,
                'life-subject': sub === '生活',
                disabled: !isPublisherSubjectAvailable(currentPublisher, sub)
              }]"
              :title="sub"
              :disabled="!isPublisherSubjectAvailable(currentPublisher, sub)"
            >
              <span class="subject-icon-inline">{{ SUBJECT_ICONS[sub] }}</span>
              <span class="subject-text-inline subject-full">{{ sub }}</span>
              <span class="subject-text-inline subject-short">{{ getSubjectShortName(sub) }}</span>
            </button>
          </div>
        </div>

        <!-- 统计、错题、關於本站按钮（同一行） -->
        <div class="action-buttons">
          <button @click="showStatistics" class="action-btn stats-btn" title="統計">📊<span class="btn-text">統計</span></button>
          <button @click="showAllWrongQuestions" class="action-btn wrong-btn" title="錯題">❌<span class="btn-text">錯題</span></button>
          <button @click="showAboutModal = true" class="action-btn about-btn" title="關於本站">ℹ️<span class="btn-text">關於</span></button>
        </div>

        <!-- 手機版頂部：科目按鈕快速切換 + 選單 -->
        <div class="mobile-top-row">
          <div class="mobile-subject-buttons">
            <button
              v-for="sub in availableSubjects"
              :key="sub"
              type="button"
              @click="requestConfigChange({ subject: sub })"
              :class="['mobile-subject-btn', { active: currentSubject === sub, disabled: !isPublisherSubjectAvailable(currentPublisher, sub) }]"
              :disabled="!isPublisherSubjectAvailable(currentPublisher, sub)"
            >
              <span class="mobile-subject-icon" aria-hidden="true">{{ SUBJECT_ICONS[sub] }}</span>
              <span class="mobile-subject-label">{{ getSubjectShortName(sub) }}</span>
            </button>
          </div>
          <button type="button" class="mobile-menu-toggle" @click="showMobileMenu = !showMobileMenu" aria-label="開啟選單">
            <span>☰</span>
            <span class="menu-toggle-label">選單</span>
          </button>
        </div>
        
        <!-- 移動端下拉選單：分區清楚、大按鈕、含科目；點背景關閉 -->
        <div v-if="showMobileMenu" class="mobile-menu-dropdown" @click.self="showMobileMenu = false">
          <div class="mobile-dropdown-inner" @click.stop>
            <div class="mobile-section">
              <div class="mobile-section-title">年級</div>
              <div class="mobile-btn-row mobile-grade-row">
                <button
                  v-for="grade in APP_CONFIG.grades"
                  :key="grade"
                  type="button"
                  @click="requestConfigChange({ grade: grade }) && (showMobileMenu = false)"
                  :class="['mobile-tap-btn', 'grade-btn', { active: currentGrade === grade, disabled: !isGradeAvailable(grade) }]"
                  :disabled="!isGradeAvailable(grade)"
                >
                  {{ grade }}年級
                </button>
              </div>
            </div>
            <div class="mobile-section">
              <div class="mobile-section-title">學期</div>
              <div class="mobile-btn-row">
                <button
                  v-for="sem in APP_CONFIG.semesters"
                  :key="sem"
                  type="button"
                  @click="requestConfigChange({ semester: sem }) && (showMobileMenu = false)"
                  :class="['mobile-tap-btn', 'semester-btn', { active: currentSemester === sem }]"
                >
                  {{ SEMESTER_NAMES[sem] }}
                </button>
              </div>
            </div>
            <div class="mobile-section">
              <div class="mobile-section-title">出版社</div>
              <div class="mobile-btn-row">
                <button
                  v-for="pub in APP_CONFIG.publishers"
                  :key="pub"
                  @click="requestConfigChange({ publisher: pub }) && (showMobileMenu = false)"
                  :class="['mobile-tap-btn', 'publisher-btn', { active: currentPublisher === pub, disabled: !isPublisherSubjectAvailable(pub, currentSubject) }]"
                  :disabled="!isPublisherSubjectAvailable(pub, currentSubject)"
                >
                  {{ pub }}
                </button>
              </div>
            </div>
            <div class="mobile-section">
              <div class="mobile-section-title">科目</div>
              <div class="mobile-btn-row mobile-subject-row">
                <button
                  v-for="sub in availableSubjects"
                  :key="sub"
                  @click="requestConfigChange({ subject: sub }) && (showMobileMenu = false)"
                  :class="['mobile-tap-btn', 'subject-btn', { active: currentSubject === sub, disabled: !isPublisherSubjectAvailable(currentPublisher, sub) }]"
                  :disabled="!isPublisherSubjectAvailable(currentPublisher, sub)"
                >
                  <span class="mobile-subject-icon">{{ SUBJECT_ICONS[sub] }}</span>
                  <span class="mobile-subject-name">{{ sub }}</span>
                </button>
              </div>
            </div>
            <div class="mobile-section mobile-actions">
              <div class="mobile-section-title">功能</div>
              <div class="mobile-btn-row">
                <button type="button" @click="showStatistics(); showMobileMenu = false" class="mobile-tap-btn action-stats">📊 統計</button>
                <button type="button" @click="showAllWrongQuestions(); showMobileMenu = false" class="mobile-tap-btn action-wrong">❌ 錯題</button>
                <button type="button" @click="showAboutModal = true; showMobileMenu = false" class="mobile-tap-btn action-about">ℹ️ 關於</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 關於本站 彈窗 -->
    <div v-if="showAboutModal" class="about-overlay" @click.self="showAboutModal = false">
      <div class="about-modal">
        <div class="about-header">
          <h2>關於本站</h2>
          <button class="about-close" @click="showAboutModal = false" aria-label="關閉">×</button>
        </div>
        <div class="about-body">
          <section class="about-section">
            <h3>開發緣由</h3>
            <p>本站是一個 <strong>vibe coding</strong> 練習網站，從發想到實作皆由 <strong>Antigravity</strong> 與 <strong>Cursor</strong> 協作撰寫與驗證。</p>
            <p>若有任何想法、建議或互動回饋，歡迎來信：<a href="mailto:yotta0280@gmail.com">yotta0280@gmail.com</a></p>
          </section>
          <section class="about-section">
            <h3>更版資訊</h3>
            <ol class="about-versions">
              <li><span class="ver">0.1 版</span> <span class="ver-date">2026/1/3</span> 產出三年級自然學科練習。</li>
              <li><span class="ver">0.2 版</span> <span class="ver-date">2026/1/7</span> 擴充至三年級國語、英文、數學。</li>
              <li><span class="ver">0.3 版</span> <span class="ver-date">2026/1/14</span> 新增三年級社會；支援南一、康軒、翰林多出版社。</li>
              <li><span class="ver">0.4 版</span> <span class="ver-date">2026/1/21</span> 擴展至四年級多學科，並支援上、下學期切換。</li>
              <li><span class="ver">0.5 版</span> <span class="ver-date">2026/2/4</span> 擴展至五年級；分課練習、全部題庫、綜合練習完整上線。</li>
              <li><span class="ver">0.6 版</span> <span class="ver-date">2026/2/18</span> 累積錯題檢視、關於本站說明；分課練習與學期正確對應。</li>
              <li><span class="ver">0.7 版</span> <span class="ver-date">2026/2/18</span> 測驗中切換先確認、錯題檢視修復、版面抖動與桌面簡稱、文件與 AI 協作原則、漢堡選單全點選。</li>
              <li><span class="ver">0.8 版</span> <span class="ver-date">2026/2/18</span> 介面優化：分課練習字體縮小、進階挑戰改為25題；題庫驗證與錯誤修正；清理未使用檔案。</li>
            </ol>
            <p class="about-future">後續將依課程研究產出，持續擴充更多年級與學期題庫。</p>
          </section>
        </div>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="app-main">
    <MainMenu 
      v-if="currentView === 'menu'"
      :grade="currentGrade"
      :subject="currentSubject"
      :semester="currentSemester"
      :publisher="currentPublisher"
      @start-quiz="startQuiz"
      @start-review="startReview"
      @questions-loaded="onQuestionsLoaded"
    />
    <QuizView 
      v-else-if="currentView === 'quiz'"
      :questions="quizQuestions"
      :quiz-type="quizType"
      :start-time="quizStartTime"
      :grade="currentGrade"
      :subject="currentSubject"
      :semester="currentSemester"
      :publisher="currentPublisher"
      :saved-progress="savedQuizProgress"
      @finish-quiz="finishQuiz"
      @back-to-menu="backToMenu"
    />
    <ReviewView 
      v-else-if="currentView === 'review'"
      :grade="currentGrade"
      :subject="currentSubject"
      :semester="currentSemester"
      :publisher="currentPublisher"
      @back-to-menu="backToMenu"
    />
    <ResultView 
      v-else-if="currentView === 'result'"
      :score="quizScore"
      :total="quizTotal"
      :session-wrong-questions="sessionWrongQuestions"
      :session-stats="sessionStats"
      :grade="currentGrade"
      :subject="currentSubject"
      :semester="currentSemester"
      :publisher="currentPublisher"
      @back-to-menu="backToMenu"
      @restart-quiz="restartQuiz"
      @view-wrong-questions="viewWrongQuestions"
    />
    <WrongQuestionsView 
      v-else-if="currentView === 'wrong-questions'"
      :wrong-questions="currentWrongQuestions"
      :question-list="quizQuestions"
      :grade="currentGrade"
      :subject="currentSubject"
      :semester="currentSemester"
      :publisher="currentPublisher"
      @back="backFromWrongQuestions"
    />
    <StatisticsView 
      v-else-if="currentView === 'statistics'"
      :grade="currentGrade"
      :subject="currentSubject"
      :semester="currentSemester"
      :publisher="currentPublisher"
      @back="backToMenu"
    />
    <AllWrongQuestionsView 
      v-else-if="currentView === 'all-wrong-questions'"
      :grade="currentGrade"
      :subject="currentSubject"
      :semester="currentSemester"
      :publisher="currentPublisher"
      @back="backToMenu"
    />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import MainMenu from './components/MainMenu.vue'
import QuizView from './components/QuizView.vue'
import ReviewView from './components/ReviewView.vue'
import ResultView from './components/ResultView.vue'
import WrongQuestionsView from './components/WrongQuestionsView.vue'
import StatisticsView from './components/StatisticsView.vue'
import AllWrongQuestionsView from './components/AllWrongQuestionsView.vue'
import { APP_CONFIG, SUBJECT_ICONS, SUBJECT_COLORS, SEMESTER_NAMES, getSubjectShortName, getPublisherShortName, getSubjectsByGrade } from './data/config.js'
import { saveUserPreference, loadUserPreference, savePracticeRecord, saveQuizProgress, loadQuizProgress, clearQuizProgress } from './utils/storage.js'
import { checkAllGradesAvailability, checkPublisherSubjectAvailability, clearCacheForCombination, clearAvailabilityCache, hasPublisherSubjectQuestions } from './utils/questionAvailability.js'

// 配置状态 - 默认值：3年级下学期国文
const currentGrade = ref(3)
const currentSubject = ref('國語')
const currentSemester = ref(2) // 下学期
const currentPublisher = ref('康軒')

// 视图状态
const currentView = ref('menu')
const quizQuestions = ref([])
const quizScore = ref(0)
const quizTotal = ref(0)
const quizType = ref('')
const quizStartTime = ref(null)
const sessionWrongQuestions = ref([])
const currentWrongQuestions = ref([])
const sessionStats = ref(null)
const savedQuizProgress = ref(null)

// 保存当前正在进行的测验配置（用于在配置变化时显示正确的提示）
const currentQuizConfig = ref({
  grade: null,
  subject: null,
  semester: null,
  publisher: null
})

// 測驗中切換配置時，使用者已確認離開，避免 confirm 重複出現
const userConfirmedLeaveQuiz = ref(false)

// 移动端菜单显示状态
const showMobileMenu = ref(false)
// 關於本站彈窗
const showAboutModal = ref(false)

// 题库可用性状态
const gradeAvailability = ref(new Map())
const publisherSubjectAvailability = ref(new Map())

// 根据年级获取可用科目
const availableSubjects = computed(() => {
  return getSubjectsByGrade(currentGrade.value)
})

// 检查年级是否可用
const isGradeAvailable = computed(() => {
  return (grade) => {
    return gradeAvailability.value.get(grade) !== false
  }
})

// 检查出版社+科目组合是否可用
const isPublisherSubjectAvailable = computed(() => {
  return (publisher, subject) => {
    const key = `${publisher}-${subject}`
    return publisherSubjectAvailability.value.get(key) !== false
  }
})

// 科目颜色主题
const appStyle = computed(() => {
  const colors = SUBJECT_COLORS[currentSubject.value]
  if (!colors) return {}
  return {
    '--subject-primary': colors.primary,
    '--subject-secondary': colors.secondary,
    '--subject-text-color': colors.textColor // 新增主题文字颜色
  }
})

const headerStyle = computed(() => {
  const colors = SUBJECT_COLORS[currentSubject.value]
  if (!colors) return {}
  return {
    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`
  }
})

// 初始化：加载用户偏好或使用默认值
onMounted(async () => {
  // 检查所有年级的可用性
  const gradesAvail = await checkAllGradesAvailability()
  gradeAvailability.value = gradesAvail
  
  // 检查当前年级下所有出版社+科目组合的可用性
  const pubSubjAvail = await checkPublisherSubjectAvailability(currentGrade.value)
  publisherSubjectAvailability.value = pubSubjAvail
  
  const preference = loadUserPreference()
  if (preference && preference.grade && preference.subject && preference.semester && preference.publisher) {
    currentGrade.value = preference.grade
    currentSubject.value = preference.subject
    currentSemester.value = preference.semester
    currentPublisher.value = preference.publisher
  }
  // 否则使用默认值（3年级下学期国文）
  updateDocumentTitle()
})

// 监听年级变化，更新出版社+科目组合的可用性
watch(currentGrade, async (newGrade) => {
  // 清除该年级的缓存，强制重新检查
  clearAvailabilityCache()
  const pubSubjAvail = await checkPublisherSubjectAvailability(newGrade)
  publisherSubjectAvailability.value = pubSubjAvail
})

// 监听科目或出版社变化，动态更新可用性
watch([currentSubject, currentPublisher], async ([newSubject, newPublisher], [oldSubject, oldPublisher]) => {
  // 如果科目或出版社变化，清除相关缓存并重新检查
  if (oldSubject && oldPublisher) {
    clearCacheForCombination(currentGrade.value, oldSubject, oldPublisher)
  }
  if (newSubject && newPublisher) {
    clearCacheForCombination(currentGrade.value, newSubject, newPublisher)
    // 重新检查当前组合的可用性
    const key = `${newPublisher}-${newSubject}`
    const available = await hasPublisherSubjectQuestions(currentGrade.value, newSubject, newPublisher)
    publisherSubjectAvailability.value.set(key, available)
  }
})

// 当题目加载成功时，更新可用性状态
const onQuestionsLoaded = async (data) => {
  if (data && data.grade && data.subject && data.publisher) {
    // 更新该组合的可用性状态
    const key = `${data.publisher}-${data.subject}`
    publisherSubjectAvailability.value.set(key, data.hasQuestions)
    
    // 如果当前年级没有可用题库，重新检查整个年级
    const hasAnyGradeQuestions = Array.from(publisherSubjectAvailability.value.values()).some(v => v === true)
    if (!hasAnyGradeQuestions) {
      const gradeAvailable = await hasPublisherSubjectQuestions(data.grade, data.subject, data.publisher)
      if (gradeAvailable) {
        gradeAvailability.value.set(data.grade, true)
      }
    }
  }
}

// 更新 document.title
const updateDocumentTitle = () => {
  const semesterName = currentSemester.value === 1 ? '上學期' : '下學期'
  document.title = `${currentGrade.value}年級${currentSubject.value} ${semesterName} (${currentPublisher.value})`
}

/** 測驗中切換配置：不彈窗、直接離開並保存進度；回傳是否已套用變更 */
function requestConfigChange (payload) {
  const inQuiz = currentView.value === 'quiz'
  if (inQuiz) userConfirmedLeaveQuiz.value = true
  if (payload.grade !== undefined) currentGrade.value = payload.grade
  if (payload.semester !== undefined) currentSemester.value = payload.semester
  if (payload.publisher !== undefined) currentPublisher.value = payload.publisher
  if (payload.subject !== undefined) currentSubject.value = payload.subject
  onConfigChange()
  return true
}

// 配置变化处理
const onConfigChange = () => {
  // 检查年级变化时，如果当前科目不在新年级的可用科目中，自动重置为默认科目
  if (availableSubjects.value.length > 0 && !availableSubjects.value.includes(currentSubject.value)) {
    // 找到第一个可用的科目（有题库的）
    const firstAvailableSubject = availableSubjects.value.find(sub => 
      isPublisherSubjectAvailable.value(currentPublisher.value, sub)
    ) || availableSubjects.value[0]
    currentSubject.value = firstAvailableSubject
  }
  
  // 如果当前出版社+科目组合不可用，尝试切换到可用的组合
  if (!isPublisherSubjectAvailable.value(currentPublisher.value, currentSubject.value)) {
    // 先尝试切换出版社
    const availablePublisher = APP_CONFIG.publishers.find(pub => 
      isPublisherSubjectAvailable.value(pub, currentSubject.value)
    )
    if (availablePublisher) {
      currentPublisher.value = availablePublisher
    } else {
      // 如果所有出版社都不可用，切换到第一个可用的科目
      const availableSubject = availableSubjects.value.find(sub => {
        return APP_CONFIG.publishers.some(pub => 
          isPublisherSubjectAvailable.value(pub, sub)
        )
      })
      if (availableSubject) {
        currentSubject.value = availableSubject
        const availablePublisher = APP_CONFIG.publishers.find(pub => 
          isPublisherSubjectAvailable.value(pub, availableSubject)
        )
        if (availablePublisher) {
          currentPublisher.value = availablePublisher
        }
      }
    }
  }
  
  // 如果正在答题中：無條件保存並離開（不再彈窗，避免干擾）
  if (currentView.value === 'quiz') {
    const quizGrade = currentQuizConfig.value.grade !== null ? currentQuizConfig.value.grade : currentGrade.value
    const quizSubject = currentQuizConfig.value.subject !== null ? currentQuizConfig.value.subject : currentSubject.value
    const quizSemester = currentQuizConfig.value.semester !== null ? currentQuizConfig.value.semester : currentSemester.value
    const quizPublisher = currentQuizConfig.value.publisher !== null ? currentQuizConfig.value.publisher : currentPublisher.value
    const quizSemesterName = SEMESTER_NAMES[quizSemester] || '上學期'
    const latestProgress = loadQuizProgress(quizGrade, quizSubject, quizSemester, quizPublisher)
    const answeredCount = latestProgress?.answeredQuestions?.length || savedQuizProgress.value?.answeredQuestions?.length || 0
    const totalCount = quizQuestions.value.length || 0

    userConfirmedLeaveQuiz.value = true

    // 用户确认离开，先强制保存当前进度（从 localStorage 读取最新进度）
    // 因为 QuizView 会在 watch(currentIndex) 和 onBeforeUnmount 时保存进度
    // 但为了确保获取最新状态，我们先从 localStorage 读取
    if (quizQuestions.value.length > 0) {
      // 先尝试从 localStorage 读取最新保存的进度
      const latestProgress = loadQuizProgress(quizGrade, quizSubject, quizSemester, quizPublisher)
      
      // 如果 localStorage 中有更新的进度，使用它；否则使用当前状态
      const progressToSave = latestProgress && latestProgress.answeredQuestions && latestProgress.answeredQuestions.length > 0
        ? latestProgress
        : {
            questions: quizQuestions.value,
            currentIndex: savedQuizProgress.value?.currentIndex || 0,
            answeredQuestions: savedQuizProgress.value?.answeredQuestions || [],
            startTime: quizStartTime.value || Date.now(),
            type: quizType.value,
            score: quizScore.value
          }
      
      saveQuizProgress(
        quizGrade, 
        quizSubject, 
        quizSemester, 
        quizPublisher,
        progressToSave
      )
    }
    // 跳转到首页
    currentView.value = 'menu'
    quizQuestions.value = []
    quizScore.value = 0
    quizTotal.value = 0
    quizType.value = ''
    quizStartTime.value = null
    savedQuizProgress.value = null
    currentQuizConfig.value = { grade: null, subject: null, semester: null, publisher: null }
    userConfirmedLeaveQuiz.value = false
  }

  // 如果当前在统计或错题页面，也跳转到首页
  if (currentView.value === 'statistics' || currentView.value === 'all-wrong-questions') {
    currentView.value = 'menu'
  }
  
  // 保存用户偏好
  saveUserPreference(currentGrade.value, currentSubject.value, currentSemester.value, currentPublisher.value)
  updateDocumentTitle()
  
  // 如果当前在菜单页面，重新加载题目
  if (currentView.value === 'menu') {
    // MainMenu 会自动监听 props 变化并重新加载
  }
}

// 监听配置变化，更新标题
watch([currentGrade, currentSubject, currentSemester, currentPublisher], () => {
  updateDocumentTitle()
})

// 开始练习
const startQuiz = (data) => {
  // 如果是新开始的练习（有 data 参数）
  if (data) {
    // 获取新测驗的類型
    const newQuizType = (typeof data === 'object' && data.type) ? data.type : ''
    const newQuestionCount = (typeof data === 'object' && data.questions) ? data.questions.length : (Array.isArray(data) ? data.length : 0)
    
    // 先检查是否有保存的进度
    const savedProgress = loadQuizProgress(currentGrade.value, currentSubject.value, currentSemester.value, currentPublisher.value)
    
    // 若有未完成進度：檢查類型是否匹配
    if (savedProgress && savedProgress.questions && savedProgress.questions.length > 0 && savedProgress.answeredQuestions && savedProgress.answeredQuestions.length > 0) {
      const savedType = savedProgress.type || ''
      const savedCount = savedProgress.questions.length
      
      // 只有當測驗類型相同且題目數量匹配時，才恢復進度
      // 基本挑戰和進階挑戰是固定題數的測驗，如果類型不同或數量不匹配，應該開始新的測驗
      const isSameType = savedType === newQuizType
      const isSameCount = savedCount === newQuestionCount
      
      // 如果是基本挑戰或進階挑戰，必須類型相同且數量匹配
      const isFixedQuiz = newQuizType === '基本挑戰' || newQuizType === '進階挑戰'
      
      if (isSameType && (isSameCount || !isFixedQuiz)) {
        // 類型相同且（數量匹配 或 不是固定題數的測驗），恢復進度
        quizQuestions.value = savedProgress.questions
        quizType.value = savedProgress.type || ''
        quizTotal.value = savedProgress.questions.length
        quizStartTime.value = savedProgress.startTime || Date.now()
        quizScore.value = savedProgress.score || 0
        savedQuizProgress.value = savedProgress
        currentQuizConfig.value = {
          grade: currentGrade.value,
          subject: currentSubject.value,
          semester: currentSemester.value,
          publisher: currentPublisher.value
        }
        currentView.value = 'quiz'
        return
      } else {
        // 類型不同或數量不匹配，清除舊進度
        console.log('測驗類型或數量不匹配，清除舊進度:', { savedType, newQuizType, savedCount, newQuestionCount })
        clearQuizProgress(currentGrade.value, currentSubject.value, currentSemester.value, currentPublisher.value)
      }
    }
    
    // 开始新的练习（没有保存的进度，或用户选择重新开始，或类型不匹配）
    savedQuizProgress.value = null
    
    // 保存当前测验配置（用于在切换配置时显示正确的提示）
    currentQuizConfig.value = {
      grade: currentGrade.value,
      subject: currentSubject.value,
      semester: currentSemester.value,
      publisher: currentPublisher.value
    }
    
    if (typeof data === 'object' && data.questions) {
      quizQuestions.value = data.questions
      quizType.value = data.type || ''
      quizTotal.value = data.questions.length
    } else {
      quizQuestions.value = data
      quizType.value = ''
      quizTotal.value = data.length
    }
    quizScore.value = 0
    quizStartTime.value = Date.now()
  } else {
    // 从菜单恢复进度（data 为 null）
    const savedProgress = loadQuizProgress(currentGrade.value, currentSubject.value, currentSemester.value, currentPublisher.value)
    
    if (savedProgress && savedProgress.questions && savedProgress.questions.length > 0) {
      // 恢复保存的进度
      quizQuestions.value = savedProgress.questions
      quizType.value = savedProgress.type || ''
      quizTotal.value = savedProgress.questions.length
      quizStartTime.value = savedProgress.startTime || Date.now()
      quizScore.value = savedProgress.score || 0
      savedQuizProgress.value = savedProgress // 传递给 QuizView 用于恢复状态
      
      // 保存当前测验配置（用于在切换配置时显示正确的提示）
      currentQuizConfig.value = {
        grade: currentGrade.value,
        subject: currentSubject.value,
        semester: currentSemester.value,
        publisher: currentPublisher.value
      }
    } else {
      // 没有保存的进度，返回菜单
      currentView.value = 'menu'
      return
    }
  }
  
  currentView.value = 'quiz'
}

// 开始复习
const startReview = () => {
  currentView.value = 'review'
}

// 完成练习
const finishQuiz = (data) => {
  // 清除答题进度（已完成）
  clearQuizProgress(currentGrade.value, currentSubject.value, currentSemester.value, currentPublisher.value)
  savedQuizProgress.value = null
  
  if (typeof data === 'object' && data.score !== undefined) {
    quizScore.value = data.score
    quizTotal.value = data.total
    sessionWrongQuestions.value = data.answeredQuestions?.filter(q => !q.isCorrect).map(q => q.questionId) || []
    
    sessionStats.value = {
      type: data.type || '未知',
      duration: data.duration || 0,
      accuracy: data.accuracy || 0,
      grade: currentGrade.value,
      subject: currentSubject.value,
      semester: currentSemester.value,
      publisher: currentPublisher.value
    }
    
    // 保存练习记录
    savePracticeRecord({
      grade: currentGrade.value,
      subject: currentSubject.value,
      semester: currentSemester.value,
      publisher: currentPublisher.value,
      type: data.type || '未知',
      count: data.total || 0,
      score: data.score || 0,
      accuracy: data.accuracy || 0,
      duration: data.duration || 0,
      wrongQuestions: sessionWrongQuestions.value
    })
  } else {
    quizScore.value = data
    sessionWrongQuestions.value = []
    sessionStats.value = null
  }
  currentView.value = 'result'
}

// 返回主菜单
const backToMenu = () => {
  currentView.value = 'menu'
}

// 重新开始练习
const restartQuiz = () => {
  currentView.value = 'quiz'
  quizScore.value = 0
  quizStartTime.value = Date.now()
}

// 查看错题
const viewWrongQuestions = (wrongQuestions) => {
  currentWrongQuestions.value = wrongQuestions
  currentView.value = 'wrong-questions'
}

// 从错题返回
const backFromWrongQuestions = () => {
  currentView.value = 'result'
}

// 显示统计
const showStatistics = () => {
  currentView.value = 'statistics'
}

// 显示所有错题
const showAllWrongQuestions = () => {
  currentView.value = 'all-wrong-questions'
}
</script>

<style scoped>
.app {
  width: 100%;
  min-height: 100vh;
  position: relative;
  padding-top: 80px; /* 为快速选择菜单留出空间 */
  transition: background-color 0.35s ease, color 0.35s ease;
}

.app-main {
  min-height: calc(100vh - 80px);
  position: relative;
  /* 避免切換科目/按鈕時內容高度變化造成整頁抖動 */
  contain: layout;
}

.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  min-height: 80px;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 10px 16px;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  transition: background 0.35s ease, color 0.35s ease;
}

.quick-select-menu {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: nowrap;
  overflow-x: auto;
  overflow-y: hidden;
  justify-content: flex-start;
  min-height: 56px;
  flex: 1;
  min-width: 0;
}

/* 配置区块通用样式 */
.config-block {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
}

/* 年级和学期组合（同一个区块） */
.grade-semester-block {
  display: flex;
  gap: 10px;
  align-items: center;
}

/* 分隔线 */
.divider {
  width: 2px;
  height: 50px;
  background: rgba(255, 255, 255, 0.4);
  margin: 0 8px;
  flex-shrink: 0;
}

.select-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.select-label {
  font-size: 0.8em;
  font-weight: bold;
  opacity: 0.9;
  white-space: nowrap;
}

.select-input {
  padding: 6px 10px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.2);
  color: #2c3e50;
  font-size: 1.1em;
  cursor: pointer;
  min-width: 75px;
  font-weight: 500;
}

.select-input:hover {
  background: rgba(255, 255, 255, 0.25);
}

.select-input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

.select-input option {
  background: #667eea;
  color: white;
}

.select-input option:disabled {
  background: #cccccc;
  color: #888888;
  opacity: 0.6;
}

/* 科目和出版社组（标签和按钮同一水平线） */
.subject-block,
.publisher-block {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 固定科目和出版社按钮区域宽度，避免切换年级时位置跳动 */
.subject-block {
  min-width: 380px; /* 固定最小宽度，容纳最多5个科目按钮（高年级） */
  flex-shrink: 0; /* 不允许收缩 */
}

.publisher-block {
  min-width: 180px; /* 固定最小宽度，容纳3个出版社按钮 */
  flex-shrink: 0; /* 不允许收缩 */
}

.inline-label {
  font-size: 1.1em;
  font-weight: bold;
  color: #2c3e50;
  white-space: nowrap;
  min-width: 50px;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
}

/* 非手機版也顯示簡稱，避免按鈕過大；完整名稱留給 title 與窄版需時再開 */
.publisher-full,
.subject-full { display: none; }
.publisher-short,
.subject-short { display: inline; }

.icon-buttons {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: nowrap; /* 确保按钮不换行 */
}

/* 科目和出版社按钮区域固定宽度，避免切换年级时位置跳动 */
.subject-block .icon-buttons {
  min-width: 320px; /* 固定宽度，容纳最多5个科目按钮 */
  justify-content: flex-start; /* 左对齐 */
}

.publisher-block .icon-buttons {
  min-width: 120px; /* 固定宽度，容纳3个出版社按钮 */
  justify-content: flex-start; /* 左对齐 */
}

/* 科目按钮区域固定宽度，避免切换年级时位置跳动 */
.subject-block {
  min-width: 380px; /* 固定最小宽度，容纳最多5个科目按钮（高年级） */
  flex-shrink: 0; /* 不允许收缩 */
}

.subject-block .icon-buttons {
  min-width: 320px; /* 固定宽度，容纳最多5个科目按钮 */
  justify-content: flex-start; /* 左对齐 */
}

.publisher-block {
  flex-shrink: 0; /* 不允许收缩 */
}

.icon-btn {
  min-width: 42px;
  height: 42px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.15);
  color: #2c3e50;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  padding: 4px 6px;
  position: relative;
}

.icon-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-1px);
  border-color: rgba(255, 255, 255, 0.4);
}

.icon-btn.disabled,
.icon-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed !important;
  background: rgba(200, 200, 200, 0.2) !important;
  border-color: rgba(200, 200, 200, 0.3) !important;
  color: #888888 !important;
  filter: grayscale(0.6);
}

.icon-btn.disabled:hover,
.icon-btn:disabled:hover {
  background: rgba(200, 200, 200, 0.2) !important;
  transform: none !important;
  border-color: rgba(200, 200, 200, 0.3) !important;
}

.icon-btn.active {
  background: rgba(255, 255, 255, 0.6) !important;
  border-color: rgba(255, 255, 255, 1) !important;
  border-width: 3px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4), inset 0 2px 6px rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
  font-weight: bold;
  color: #1a1a1a !important;
}

.icon-btn.active.disabled,
.icon-btn.active:disabled {
  opacity: 0.5;
  filter: grayscale(0.4);
}

.icon-btn.active::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 70%;
  height: 4px;
  background: rgba(255, 255, 255, 1);
  border-radius: 2px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* 出版社按钮选中状态 - 与科目按钮相同的反白效果 */
.publisher-btn.active {
  background: rgba(255, 255, 255, 0.6) !important;
  border-color: rgba(255, 255, 255, 1) !important;
  border-width: 3px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4), inset 0 2px 6px rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
  font-weight: bold;
  color: #1a1a1a !important;
}

.publisher-btn.active::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 70%;
  height: 4px;
  background: rgba(255, 255, 255, 1);
  border-radius: 2px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.subject-btn {
  min-width: 60px;
  flex-direction: row;
  gap: 4px;
  padding: 6px 10px;
}

/* 生活科目特殊样式（粉橘色） */
.subject-btn.life-subject {
  background: linear-gradient(135deg, rgba(255, 179, 186, 0.3), rgba(255, 223, 186, 0.3));
  border-color: rgba(255, 179, 186, 0.5);
}

.subject-btn.life-subject:hover {
  background: linear-gradient(135deg, rgba(255, 179, 186, 0.4), rgba(255, 223, 186, 0.4));
  border-color: rgba(255, 179, 186, 0.7);
}

.subject-btn.life-subject.active {
  background: linear-gradient(135deg, rgba(255, 179, 186, 0.7), rgba(255, 223, 186, 0.7)) !important;
  border-color: rgba(255, 179, 186, 1) !important;
}

/* 科目切换动画已取消 */

.subject-icon-inline {
  font-size: 1.4em;
  line-height: 1;
}

.subject-text-inline {
  font-size: 1.1em;
  font-weight: bold;
  line-height: 1;
  color: #2c3e50;
}

.publisher-btn {
  font-size: 1.1em;
  min-width: 38px;
  color: #2c3e50;
}

/* 统计和错题按钮 */
.action-buttons {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-left: auto;
  flex-shrink: 0;
}

.action-btn {
  padding: 6px 12px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.2);
  color: #1565c0; /* 深色字体 */
  font-size: 0.9em;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
  white-space: nowrap;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
  border-color: rgba(255, 255, 255, 0.5);
}

.action-btn:active {
  transform: translateY(0);
  background: rgba(255, 255, 255, 0.25);
}

.stats-btn {
  border-left: 3px solid #4caf50;
}

.wrong-btn {
  border-left: 3px solid #f44336;
}

.about-btn {
  border-left: 3px solid #1565c0;
}

.btn-text {
  font-size: 0.9em;
  color: #1565c0; /* 深色字体 */
}

/* 關於本站彈窗 */
.about-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1rem;
}
.about-modal {
  background: #fff;
  border-radius: 12px;
  max-width: 520px;
  width: 100%;
  max-height: 85vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}
.about-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e0e0e0;
  background: linear-gradient(135deg, #1565c0 0%, #0d47a1 100%);
  color: #fff;
}
.about-header h2 {
  margin: 0;
  font-size: 1.25rem;
}
.about-close {
  background: none;
  border: none;
  font-size: 1.75rem;
  line-height: 1;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.9);
  padding: 0 4px;
}
.about-close:hover {
  color: #fff;
}
.about-body {
  padding: 1.25rem 1.5rem;
  overflow-y: auto;
}
.about-section {
  margin-bottom: 1.25rem;
}
.about-section:last-child {
  margin-bottom: 0;
}
.about-section h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.05rem;
  color: #1565c0;
}
.about-versions {
  margin: 0 0 0.75rem 0;
  padding-left: 1.35rem;
  line-height: 1.7;
  color: #333;
}
.about-versions li {
  margin-bottom: 0.5rem;
}
.about-versions li:last-of-type {
  margin-bottom: 0;
}
.about-versions .ver {
  font-weight: 600;
  color: #1565c0;
  margin-right: 0.25rem;
}
.about-versions .ver-date {
  color: #666;
  font-size: 0.9em;
  margin-right: 0.35rem;
}
.about-future {
  margin: 0.75rem 0 0 0;
  font-size: 0.95rem;
  color: #555;
  font-style: italic;
}
.about-section p {
  margin: 0 0 0.5rem 0;
  line-height: 1.6;
  color: #333;
}
.about-section p:last-child {
  margin-bottom: 0;
}
.about-section a {
  color: #1565c0;
  text-decoration: none;
}
.about-section a:hover {
  text-decoration: underline;
}
/* 手機版頂部列：科目按鈕 + 選單，固定高度避免切換時抖動 */
.mobile-top-row {
  display: none;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
  min-height: 56px;
}
.mobile-subject-buttons {
  display: flex;
  flex-wrap: nowrap;
  gap: 4px;
  flex: 1;
  min-width: 0;
  justify-content: flex-end;
  align-items: center;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.mobile-subject-buttons::-webkit-scrollbar {
  display: none;
}
.mobile-subject-btn {
  min-height: 44px;
  min-width: auto;
  padding: 8px 10px;
  font-size: 0.85rem;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.25);
  color: #2c3e50;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.mobile-subject-icon {
  display: inline-block;
  font-size: 1em;
  line-height: 1;
  flex-shrink: 0;
}
.mobile-subject-label {
  display: inline-block;
  line-height: 1;
}
/* iPhone 及小螢幕：隱藏 icon，縮小按鈕 */
@media (max-width: 430px) {
  .mobile-subject-buttons {
    gap: 3px;
  }
  .mobile-subject-btn {
    padding: 7px 9px;
    font-size: 0.8rem;
    min-height: 40px;
  }
  .mobile-subject-icon {
    display: none;
  }
}
/* 極小螢幕：進一步縮小 */
@media (max-width: 360px) {
  .mobile-subject-btn {
    padding: 6px 8px;
    font-size: 0.75rem;
    min-height: 38px;
  }
}
.mobile-subject-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.mobile-subject-btn:not(:disabled).active {
  background: rgba(255, 255, 255, 0.5);
  border-color: rgba(255, 255, 255, 0.8);
}
.mobile-subject-btn:not(:disabled):active {
  transform: scale(0.98);
}

/* 移動端選單按鈕：小螢幕時顯示，夠大易按 */
.mobile-menu-toggle {
  display: none;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 44px;
  min-width: 44px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.25);
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-radius: 10px;
  cursor: pointer;
  font-size: 1.4em;
  color: #2c3e50;
}
.mobile-menu-toggle:hover {
  background: rgba(255, 255, 255, 0.35);
}
.mobile-menu-toggle .menu-toggle-label {
  display: none;
}
@media (max-width: 600px) {
  .mobile-menu-toggle .menu-toggle-label {
    display: inline;
    font-size: 0.95rem;
    font-weight: 600;
  }
  .quick-select-menu {
    justify-content: flex-end;
  }
}

/* 移动端下拉菜单 */
/* 移動端下拉：分區清楚、可捲動、大按鈕防誤觸 */
.mobile-menu-dropdown {
  position: fixed;
  top: 56px;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1001;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
.mobile-dropdown-inner {
  background: #fff;
  border-radius: 0 0 16px 16px;
  padding: 16px;
  max-height: calc(100vh - 56px);
  overflow-y: auto;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}
.mobile-section {
  margin-bottom: 18px;
}
.mobile-section:last-child {
  margin-bottom: 0;
}
.mobile-section-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: #555;
  margin-bottom: 10px;
  padding-left: 2px;
}
.mobile-btn-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.mobile-grade-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.mobile-grade-row .mobile-tap-btn {
  min-width: 0;
}
.mobile-tap-btn {
  min-height: 44px;
  min-width: 44px;
  padding: 10px 14px;
  font-size: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  background: #f5f5f5;
  color: #333;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.mobile-tap-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.mobile-tap-btn:not(:disabled):active {
  transform: scale(0.98);
}
/* 漢堡選單中已選擇的條件：明顯的視覺標示 */
.mobile-tap-btn.active:not(:disabled) {
  background: #1565c0;
  border-color: #1565c0;
  border-width: 3px;
  color: #fff;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(21, 101, 192, 0.4);
  position: relative;
}
.mobile-tap-btn.active:not(:disabled)::before {
  content: '✓';
  position: absolute;
  top: 4px;
  right: 6px;
  font-size: 0.85em;
  font-weight: bold;
  opacity: 0.9;
}
.mobile-subject-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}
.mobile-subject-row .mobile-tap-btn {
  flex: 1;
  min-width: 0;
  justify-content: flex-start;
  padding-left: 12px;
}
.mobile-subject-icon {
  font-size: 1.2em;
}
.mobile-subject-name {
  font-size: 1rem;
}
.mobile-actions .mobile-btn-row {
  display: flex;
  gap: 10px;
}
.mobile-actions .mobile-tap-btn {
  flex: 1;
  min-width: 0;
}
.mobile-tap-btn.action-stats { background: #e8f5e9; border-color: #4caf50; color: #2e7d32; }
.mobile-tap-btn.action-wrong { background: #ffebee; border-color: #f44336; color: #c62828; }
.mobile-tap-btn.action-about { background: #e3f2fd; border-color: #2196f3; color: #1565c0; }

/* 响应式设计 */
@media (max-width: 1024px) {
  .quick-select-menu {
    gap: 12px;
  }
  
  .grade-semester-block {
    gap: 8px;
  }
  
  .select-input {
    min-width: 70px;
    font-size: 0.9em;
  }
  
  .icon-btn {
    min-width: 40px;
    height: 40px;
  }
  
  .subject-btn {
    min-width: 46px;
  }
  
  .publisher-btn {
    min-width: 36px;
  }
}

/* 第一优先级：隐藏年级和学期（1200px以下） */
@media (max-width: 1200px) {
  .grade-semester-block,
  .divider,
  .publisher-block,
  .subject-block,
  .action-buttons {
    display: none !important;
  }
  .mobile-top-row {
    display: flex !important;
  }
  .mobile-menu-toggle {
    display: flex !important;
  }
}

/* 第二优先级：隐藏统计、错题、出版社（900px以下） */
@media (max-width: 900px) {
  .publisher-block,
  .action-buttons {
    display: none !important;
  }
  
  .app-header {
    position: relative; /* 允许下拉菜单定位 */
  }
  
  .app {
    padding-top: 0; /* 移除顶部padding，因为header不再是fixed */
  }
}

/* 第三优先级：最后才隐藏科目（600px以下，尽量不隐藏） */
@media (max-width: 600px) {
  .subject-block {
    display: none !important;
  }
}

@media (max-width: 768px) {
  .app {
    padding-top: 0;
  }
  
  .quick-select-menu {
    gap: 8px;
  }
  
  .config-block {
    padding: 6px 10px;
    gap: 8px;
  }
  
  .divider {
    height: 40px;
    margin: 0 4px;
  }
  
  .select-label,
  .inline-label {
    font-size: 1.05em;
  }
  
  .inline-label {
    min-width: 40px;
  }
  
  .select-input {
    min-width: 65px;
    font-size: 1em;
    padding: 5px 8px;
  }
  
  .icon-btn {
    min-width: 38px;
    height: 38px;
    padding: 3px 5px;
  }
  
  .subject-btn {
    min-width: 55px;
    padding: 5px 8px;
  }
  
  .subject-icon-inline {
    font-size: 1.2em;
  }
  
  .subject-text-inline {
    font-size: 1.05em;
  }
  
  .publisher-btn {
    font-size: 1em;
    min-width: 34px;
  }
  
  .action-btn {
    padding: 5px 10px;
    font-size: 0.85em;
  }
}

@media (max-width: 600px) {
  .app {
    padding-top: 0;
  }
  
  .app-header {
    padding: 8px 12px;
  }
  
  .quick-select-menu {
    gap: 6px;
  }
  
  .config-block {
    padding: 5px 8px;
    gap: 6px;
  }
  
  .divider {
    height: 35px;
    margin: 0 3px;
    width: 1px;
  }
  
  .grade-semester-block {
    gap: 6px;
  }
  
  .select-label,
  .inline-label {
    font-size: 1em;
  }
  
  .inline-label {
    min-width: 35px;
  }
  
  .select-input {
    min-width: 60px;
    font-size: 0.95em;
    padding: 4px 6px;
  }
  
  .icon-buttons {
    gap: 4px;
  }
  
  .icon-btn {
    min-width: 36px;
    height: 36px;
    padding: 3px 4px;
  }
  
  .subject-btn {
    min-width: 50px;
    padding: 4px 6px;
  }
  
  .subject-icon-inline {
    font-size: 1.1em;
  }
  
  .subject-text-inline {
    font-size: 1em;
    color: #2c3e50;
  }
  
  .publisher-btn {
    font-size: 0.95em;
    min-width: 32px;
  }
  
  .action-btn {
    padding: 4px 8px;
    font-size: 0.8em;
  }
  
  .btn-text {
    display: none; /* 隐藏文字，只显示图标 */
  }
}

@media (max-width: 480px) {
  .app {
    padding-top: 110px;
  }
  
  .quick-select-menu {
    gap: 4px;
  }
  
  .config-block {
    padding: 4px 6px;
    gap: 4px;
  }
  
  .divider {
    height: 30px;
    margin: 0 2px;
    width: 1px;
  }
  
  .select-label,
  .inline-label {
    font-size: 0.95em;
  }
  
  .inline-label {
    min-width: 30px;
  }
  
  .select-input {
    min-width: 55px;
    font-size: 0.9em;
    padding: 4px 5px;
  }
  
  .icon-btn {
    min-width: 34px;
    height: 34px;
    padding: 2px 3px;
  }
  
  .subject-btn {
    min-width: 48px;
    padding: 3px 5px;
  }
  
  .subject-icon-inline {
    font-size: 1em;
  }
  
  .subject-text-inline {
    font-size: 0.95em;
    color: #2c3e50;
  }
  
  .publisher-btn {
    font-size: 0.9em;
    min-width: 30px;
  }
  
  .action-btn {
    padding: 4px 6px;
    font-size: 0.75em;
    min-width: 36px;
  }
  
  .btn-text {
    display: none;
  }
}
</style>
