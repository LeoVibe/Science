<template>
  <div class="statistics-view">
    <div class="statistics-container">
      <div class="statistics-header">
        <button @click="back" class="back-btn">← 返回</button>
        <h1>📊 學習統計報告</h1>
        <div class="header-config">
          {{ grade }}年級 {{ subject }} {{ getSemesterName(semester) }} ({{ publisher }}版)
        </div>
      </div>

      <div class="statistics-content">
        <!-- 第一段：綜合練習統計 -->
        <section class="stats-section card-section">
          <div class="section-header">
            <h2>📊 綜合練習統計</h2>
            <p class="section-subtitle">計時測驗與全範圍隨機練習的整體表現</p>
          </div>
          
          <div v-if="generalStats.totalCount > 0" class="general-stats-content">
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-icon">📝</div>
                <div class="stat-label">練習次數</div>
                <div class="stat-value">{{ generalStats.totalCount }}</div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">⭐</div>
                <div class="stat-label">平均得分</div>
                <div class="stat-value">{{ generalStats.averageScore.toFixed(1) }}</div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">✓</div>
                <div class="stat-label">平均正確率</div>
                <div class="stat-value correct">{{ generalStats.averageAccuracy.toFixed(1) }}%</div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">⏱️</div>
                <div class="stat-label">平均時間</div>
                <div class="stat-value">{{ formatDuration(Number(generalStats.averageDuration.toFixed(1))) }}</div>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <div class="empty-icon">📭</div>
            <p>此項目尚無練習記錄</p>
            <p class="empty-hint">開始練習後，統計數據會顯示在這裡</p>
          </div>
        </section>

        <!-- 第二段：分類複習統計 -->
        <section class="stats-section card-section">
          <div class="section-header">
            <h2>📑 分類複習統計</h2>
            <p class="section-subtitle">各單元的掌握度與學習進度</p>
          </div>
          
          <div v-if="categoryStats.length > 0" class="category-stats-content">
            <div 
              v-for="category in categoryStats" 
              :key="category.name"
              class="category-progress-card"
            >
              <div class="category-header">
                <span class="category-name">{{ category.name }}</span>
                <span class="category-accuracy">{{ category.accuracy.toFixed(1) }}%</span>
              </div>
              <div class="progress-bar-container">
                <div 
                  class="progress-bar-fill" 
                  :style="{ width: `${category.accuracy}%` }"
                  :class="{ 'high-accuracy': category.accuracy >= 80, 'medium-accuracy': category.accuracy >= 60 && category.accuracy < 80, 'low-accuracy': category.accuracy < 60 }"
                ></div>
              </div>
              <div class="category-details">
                <span>答題數: {{ category.total }}</span>
                <span>正確: {{ category.correct }}</span>
                <span>錯誤: {{ category.wrong }}</span>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <div class="empty-icon">📚</div>
            <p>此項目尚無分類練習記錄</p>
            <p class="empty-hint">進行分類複習後，各單元的統計會顯示在這裡</p>
          </div>
        </section>

        <!-- 第三段：練習歷史記錄 -->
        <section class="stats-section card-section">
          <div class="section-header">
            <h2>📝 練習歷史記錄</h2>
            <p class="section-subtitle">詳細的練習歷程與成績</p>
          </div>
          
          <div v-if="filteredHistory.length > 0" class="history-content">
            <div class="history-list">
              <div 
                v-for="(record, index) in filteredHistory" 
                :key="record.id || index"
                class="history-item"
              >
                <div class="history-header">
                  <div class="history-type-wrapper">
                    <span class="history-type">{{ record.type }}</span>
                    <span class="history-date">{{ new Date(record.timestamp).toLocaleString('zh-TW') }}</span>
                  </div>
                  <div class="history-score">
                    <span class="score-value">{{ record.score }}/{{ record.count }}</span>
                    <span class="score-percentage">{{ parseFloat(record.accuracy || 0).toFixed(1) }}%</span>
                  </div>
                </div>
                <div class="history-stats">
                  <span class="stat-badge">⏱️ {{ formatDuration(record.duration || 0) }}</span>
                  <span class="stat-badge" :class="{ 'correct-badge': parseFloat(record.accuracy || 0) >= 80, 'warning-badge': parseFloat(record.accuracy || 0) >= 60 && parseFloat(record.accuracy || 0) < 80, 'error-badge': parseFloat(record.accuracy || 0) < 60 }">
                    正確率: {{ parseFloat(record.accuracy || 0).toFixed(1) }}%
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <div class="empty-icon">📋</div>
            <p>此項目尚無練習記錄</p>
            <p class="empty-hint">快去開始練習吧！</p>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { getStatistics, getPracticeHistory, getAnswerHistory } from '../utils/storage.js'
import { loadQuestions } from '../data/index.js'
import { SEMESTER_NAMES } from '../data/config.js'

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

const emit = defineEmits(['back'])

const statistics = ref(null)
const practiceHistory = ref([])
const questionsModule = ref(null)
const allQuestions = ref([])

// 过滤历史记录（只显示当前配置的记录）
const filteredHistory = computed(() => {
  return practiceHistory.value.filter(record => 
    record.grade === props.grade && 
    record.subject === props.subject && 
    record.semester === props.semester && 
    record.publisher === props.publisher
  )
})

// 综合练习统计（第一段）
const generalStats = computed(() => {
  const history = filteredHistory.value
  if (history.length === 0) {
    return {
      totalCount: 0,
      averageScore: 0,
      averageAccuracy: 0,
      averageDuration: 0
    }
  }
  
  const totalCount = history.length
  const totalScore = history.reduce((sum, r) => sum + (r.score || 0), 0)
  const totalAccuracy = history.reduce((sum, r) => sum + parseFloat(r.accuracy || 0), 0)
  const totalDuration = history.reduce((sum, r) => sum + (r.duration || 0), 0)
  
  return {
    totalCount,
    averageScore: Number((totalScore / totalCount).toFixed(1)),
    averageAccuracy: Number((totalAccuracy / totalCount).toFixed(1)),
    averageDuration: Number((totalDuration / totalCount).toFixed(1))
  }
})

// 分类复习统计（第二段）
const categoryStats = computed(() => {
  if (!allQuestions.value || allQuestions.value.length === 0) {
    return []
  }
  
  // 获取所有分类
  const categories = [...new Set(allQuestions.value.map(q => q.category).filter(Boolean))]
  
  // 從答題歷史中計算每個分類的統計
  const history = getAnswerHistory(props.grade, props.subject, props.semester, props.publisher)
  
  // 从统计信息中获取每个分类的数据
  const categoryData = categories.map(category => {
    // 筛选该分类的题目
    const categoryQuestions = allQuestions.value.filter(q => q.category === category)
    const questionIds = categoryQuestions.map(q => q.id)
    
    // 從答題歷史中計算該分類的統計
    let total = 0
    let correct = 0
    let wrong = 0
    
    questionIds.forEach(qId => {
      const recordKey = qId.toString()
      const record = history[recordKey]
      if (record) {
        total += record.total || 0
        correct += record.correct || 0
        wrong += record.wrong || 0
      }
    })
    
    const accuracy = total > 0 ? Number(((correct / total) * 100).toFixed(1)) : 0
    
    return {
      name: category,
      total,
      correct,
      wrong,
      accuracy
    }
  })
  
  return categoryData.filter(cat => cat.total > 0).sort((a, b) => b.accuracy - a.accuracy)
})

onMounted(() => {
  loadStats()
  loadQuestionsData()
})

watch([() => props.grade, () => props.subject, () => props.semester, () => props.publisher], () => {
  loadStats()
  loadQuestionsData()
})

const loadStats = () => {
  statistics.value = getStatistics(props.grade, props.subject, props.semester, props.publisher)
  practiceHistory.value = getPracticeHistory(props.grade, props.subject, props.semester, props.publisher).slice().reverse() // 最新的在前面
}

const loadQuestionsData = async () => {
  try {
    questionsModule.value = await loadQuestions(props.grade, props.subject, props.semester, props.publisher)
    allQuestions.value = questionsModule.value.questions || []
  } catch (error) {
    console.error('載入題目失敗:', error)
    allQuestions.value = []
  }
}

const formatDuration = (seconds) => {
  // 确保秒数只显示到小数点第一位
  const roundedSeconds = Number(seconds.toFixed(1))
  
  if (roundedSeconds < 60) {
    return `${roundedSeconds}秒`
  }
  const minutes = Math.floor(roundedSeconds / 60)
  const secs = Number((roundedSeconds % 60).toFixed(1))
  return `${minutes}分${secs}秒`
}

const getSemesterName = (semester) => {
  return SEMESTER_NAMES[semester] || '上學期'
}

const back = () => {
  emit('back')
}
</script>

<style scoped>
.statistics-view {
  min-height: 100vh;
  padding: 20px;
  padding-top: 70px;
  background: #f5f5f5;
}

.statistics-container {
  max-width: 1000px;
  margin: 0 auto;
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.statistics-header {
  margin-bottom: 30px;
  text-align: center;
  position: relative;
}

.back-btn {
  position: absolute;
  left: 0;
  background: #f0f0f0;
  border: none;
  padding: 8px 15px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9em;
  transition: background 0.3s;
}

.back-btn:hover {
  background: #e0e0e0;
}

.statistics-header h1 {
  font-size: 2.5em;
  color: #1565c0;
  margin: 20px 0 10px;
}

.header-config {
  font-size: 1.2em;
  color: #666;
  margin-top: 10px;
}

.statistics-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* 卡片样式 */
.card-section {
  background: #fafafa;
  border-radius: 15px;
  padding: 25px;
  border: 1px solid #e0e0e0;
  transition: all 0.3s;
}

.card-section:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.section-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e0e0e0;
}

.section-header h2 {
  font-size: 1.8em;
  color: #1565c0;
  margin: 0 0 8px 0;
}

.section-subtitle {
  font-size: 0.95em;
  color: #999;
  margin: 0;
}

/* 综合练习统计 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.stat-card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  text-align: center;
  border: 2px solid #e0e0e0;
  transition: all 0.3s;
}

.stat-card:hover {
  border-color: #1565c0;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(21, 101, 192, 0.2);
}

.stat-icon {
  font-size: 2.5em;
  margin-bottom: 10px;
}

.stat-label {
  font-size: 1em;
  color: #666;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 2.5em;
  font-weight: bold;
  color: #1565c0;
}

.stat-value.correct {
  color: #4caf50;
}

/* 分类复习统计 */
.category-stats-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 20px;
}

.category-progress-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  transition: all 0.3s;
}

.category-progress-card:hover {
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.category-name {
  font-size: 1.2em;
  font-weight: bold;
  color: #333;
}

.category-accuracy {
  font-size: 1.3em;
  font-weight: bold;
  color: #1565c0;
}

.progress-bar-container {
  width: 100%;
  height: 12px;
  background: #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-bar-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 0.5s ease;
}

.progress-bar-fill.high-accuracy {
  background: linear-gradient(90deg, #4caf50, #66bb6a);
}

.progress-bar-fill.medium-accuracy {
  background: linear-gradient(90deg, #ff9800, #ffb74d);
}

.progress-bar-fill.low-accuracy {
  background: linear-gradient(90deg, #f44336, #e57373);
}

.category-details {
  display: flex;
  gap: 20px;
  font-size: 0.9em;
  color: #666;
}

/* 练习历史 */
.history-content {
  margin-top: 20px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-height: 500px;
  overflow-y: auto;
}

.history-item {
  background: white;
  padding: 20px;
  border-radius: 12px;
  border-left: 4px solid #1565c0;
  transition: all 0.3s;
}

.history-item:hover {
  background: #f9f9f9;
  transform: translateX(5px);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.history-type-wrapper {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.history-type {
  font-weight: bold;
  color: #1565c0;
  font-size: 1.1em;
}

.history-date {
  font-size: 0.9em;
  color: #999;
}

.history-score {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 5px;
}

.score-value {
  font-size: 1.5em;
  font-weight: bold;
  color: #333;
}

.score-percentage {
  font-size: 1.1em;
  color: #1565c0;
  font-weight: bold;
}

.history-stats {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.stat-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.9em;
  background: #f0f0f0;
  color: #666;
}

.stat-badge.correct-badge {
  background: #e8f5e9;
  color: #2e7d32;
}

.stat-badge.warning-badge {
  background: #fff3e0;
  color: #e65100;
}

.stat-badge.error-badge {
  background: #ffebee;
  color: #c62828;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.empty-icon {
  font-size: 4em;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state p {
  font-size: 1.2em;
  margin: 10px 0;
}

.empty-hint {
  font-size: 0.95em;
  color: #bbb;
}

@media (max-width: 768px) {
  .statistics-container {
    padding: 20px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }
  
  .stat-card {
    padding: 20px;
  }
  
  .category-progress-card {
    padding: 15px;
  }
}
</style>
