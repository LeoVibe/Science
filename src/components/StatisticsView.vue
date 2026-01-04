<template>
  <div class="statistics-view">
    <div class="statistics-container">
      <div class="statistics-header">
        <button @click="back" class="back-btn">← 返回</button>
        <h1>📊 答題統計</h1>
      </div>

      <div class="statistics-content">
        <!-- 總體統計 -->
        <div v-if="statistics" class="statistics-section">
          <h2>📊 總體統計</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-label">總答題數</div>
              <div class="stat-value">{{ statistics.totalQuestions }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">總正確數</div>
              <div class="stat-value correct">{{ statistics.totalCorrect }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">總錯誤數</div>
              <div class="stat-value wrong">{{ statistics.totalWrong }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">正確率</div>
              <div class="stat-value">{{ statistics.accuracy }}%</div>
            </div>
          </div>
        </div>

        <!-- 練習歷史 -->
        <div v-if="filteredHistory.length > 0" class="practice-history-section">
          <h2>📝 練習歷史記錄 {{ subject ? `(${getSubjectDisplay(subject)})` : '(全部科目)' }}</h2>
          <div class="history-list">
            <div 
              v-for="(record, index) in filteredHistory" 
              :key="record.id || index"
              class="history-item"
            >
              <div class="history-header">
                <div class="history-type-wrapper">
                  <span class="history-subject">{{ getSubjectDisplay(record.subject) }}</span>
                  <span class="history-type">{{ record.type }}</span>
                </div>
                <span class="history-date">{{ new Date(record.timestamp).toLocaleString('zh-TW') }}</span>
              </div>
              <div class="history-stats">
                <span>正確率: {{ parseFloat(record.accuracy || 0).toFixed(1) }}%</span>
                <span>得分: {{ record.score }}/{{ record.count }}</span>
                <span>時間: {{ formatDuration(record.duration || 0) }}</span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="empty-message">
          <p>還沒有練習記錄，快去開始練習吧！</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { getStatistics, getPracticeHistory } from '../utils/storage.js'
import { SUBJECT_NAMES, SUBJECT_ICONS } from '../data/questions.js'

const props = defineProps({
  subject: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['back'])

const statistics = ref(null)
const practiceHistory = ref([])

// 获取科目显示名称
const getSubjectDisplay = (subjectKey) => {
  if (!subjectKey) return ''
  const name = SUBJECT_NAMES[subjectKey] || subjectKey
  const icon = SUBJECT_ICONS[subjectKey] || '📚'
  return `${icon} ${name}`
}

// 过滤历史记录（如果指定了科目，只显示该科目的记录）
const filteredHistory = computed(() => {
  if (!props.subject) {
    return practiceHistory.value
  }
  return practiceHistory.value.filter(record => record.subject === props.subject)
})

onMounted(() => {
  statistics.value = getStatistics(props.subject)
  practiceHistory.value = getPracticeHistory().slice().reverse() // 最新的在前面
})

watch(() => props.subject, () => {
  statistics.value = getStatistics(props.subject)
})

const formatDuration = (seconds) => {
  if (seconds < 60) {
    return `${seconds}秒`
  }
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes}分${secs}秒`
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
  max-width: 900px;
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
  color: #667eea;
  margin: 20px 0;
}

.statistics-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.statistics-section h2,
.practice-history-section h2 {
  font-size: 1.8em;
  color: #667eea;
  margin-bottom: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  border: 2px solid #e0e0e0;
  transition: all 0.3s;
}

.stat-card:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.2);
}

.stat-label {
  font-size: 1em;
  color: #666;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 2.5em;
  font-weight: bold;
  color: #667eea;
}

.stat-value.correct {
  color: #4caf50;
}

.stat-value.wrong {
  color: #f44336;
}

.practice-history-section {
  margin-top: 30px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-height: 600px;
  overflow-y: auto;
}

.history-item {
  background: #f9f9f9;
  padding: 15px;
  border-radius: 10px;
  border-left: 4px solid #667eea;
  transition: all 0.3s;
}

.history-item:hover {
  background: #f0f0f0;
  transform: translateX(5px);
}

.history-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  align-items: center;
}

.history-type-wrapper {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.history-subject {
  font-weight: bold;
  color: #4caf50;
  font-size: 1em;
}

.history-type {
  font-weight: bold;
  color: #667eea;
  font-size: 1.1em;
}

.history-date {
  font-size: 0.9em;
  color: #999;
}

.history-stats {
  display: flex;
  gap: 20px;
  font-size: 0.95em;
  color: #666;
  flex-wrap: wrap;
}

.empty-message {
  text-align: center;
  padding: 40px;
  color: #999;
  font-size: 1.2em;
}
</style>

