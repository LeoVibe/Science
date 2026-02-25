<template>
  <div class="result-view">
    <div class="result-container">
      <div class="result-header">
        <h1>🎉 答題完成！</h1>
      </div>

      <div class="result-content">
        <div class="score-display">
          <div class="score-circle">
            <div class="score-value">{{ score }}</div>
            <div class="score-total">/ {{ total }}</div>
          </div>
          <div class="score-percentage">
            {{ Math.round((score / total) * 100) }}%
          </div>
        </div>

        <div class="result-message">
          <p v-if="score === total" class="perfect-message">
            🌟 太棒了！全部答對！
          </p>
          <p v-else-if="score >= total * 0.8" class="good-message">
            👍 表現很好！繼續加油！
          </p>
          <p v-else-if="score >= total * 0.6" class="ok-message">
            💪 還不錯，再多練習會更好！
          </p>
          <p v-else class="encourage-message">
            📚 沒關係，多複習幾次就會進步！
          </p>
        </div>

        <!-- 統計資訊 -->
        <div v-if="statistics" class="statistics-section">
          <h3>📊 總體統計</h3>
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

        <!-- 本次練習錯題 -->
        <div v-if="sessionWrongQuestions.length > 0" class="session-wrong-section">
          <h3>❌ 本次答錯題目 ({{ sessionWrongQuestions.length }}題)</h3>
          <button @click="viewWrongQuestions" class="view-wrong-btn">
            📖 查看錯題詳情
          </button>
        </div>

        <!-- 錯題列表 -->
        <div v-if="wrongQuestions.length > 0" class="wrong-questions-section">
          <h3>❌ 累積錯題本 ({{ wrongQuestions.length }}題)</h3>
          <div class="wrong-list">
            <div 
              v-for="item in wrongQuestions.slice(0, 5)" 
              :key="item.id"
              class="wrong-item"
            >
              <div class="wrong-question-id">#{{ item.id }}</div>
              <div class="wrong-question-text">
                {{ getQuestionById(item.id)?.question || '題目載入中...' }}
              </div>
              <div class="wrong-stats">
                錯誤 {{ item.wrongCount }} 次 | 正確率 {{ item.accuracy }}%
              </div>
            </div>
            <div v-if="wrongQuestions.length > 5" class="more-wrong">
              還有 {{ wrongQuestions.length - 5 }} 題錯題...
            </div>
          </div>
        </div>

        <!-- 本次練習統計 -->
        <div v-if="sessionStats" class="session-stats-section">
          <h3>📊 本次練習統計</h3>
          <div class="session-stats-grid">
            <div class="session-stat-card">
              <div class="session-stat-label">練習類型</div>
              <div class="session-stat-value">{{ sessionStats.type || '綜合練習' }}</div>
            </div>
            <div class="session-stat-card">
              <div class="session-stat-label">答題時間</div>
              <div class="session-stat-value">{{ formatDuration(sessionStats.duration || 0) }}</div>
            </div>
            <div class="session-stat-card">
              <div class="session-stat-label">正確率</div>
              <div class="session-stat-value">{{ parseFloat(sessionStats.accuracy || 0).toFixed(1) }}%</div>
            </div>
          </div>
        </div>

        <!-- 練習歷史 -->
        <div v-if="practiceHistory.length > 0" class="practice-history-section">
          <h3>📝 最近練習記錄</h3>
          <div class="history-list">
            <div 
              v-for="(record, index) in practiceHistory.slice(0, 5)" 
              :key="record.id || index"
              class="history-item"
            >
              <div class="history-header">
                <span class="history-type">{{ record.type }}</span>
                <span class="history-date">{{ new Date(record.timestamp).toLocaleString('zh-TW') }}</span>
              </div>
              <div class="history-stats">
                <span>正確率: {{ record.accuracy }}%</span>
                <span>得分: {{ record.score }}/{{ record.count }}</span>
                <span>時間: {{ formatDuration(record.duration) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="result-actions">
          <button @click="restartQuiz" class="action-btn restart-btn">
            🔄 再練習一次
          </button>
          <button @click="backToMenu" class="action-btn menu-btn">
            🏠 返回主選單
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getWrongQuestions, getStatistics, getPracticeHistory, getSessionWrongQuestions } from '../utils/storage.js'
import { QUESTIONS } from '../data/questionLoader.js'

const props = defineProps({
  score: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  sessionWrongQuestions: {
    type: Array,
    default: () => []
  },
  sessionStats: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['back-to-menu', 'restart-quiz', 'view-wrong-questions'])

const wrongQuestions = ref([])
const statistics = ref(null)
const practiceHistory = ref([])
const showWrongQuestions = ref(false)

const accuracy = computed(() => {
  return props.total > 0 ? (props.score / props.total * 100).toFixed(1) : 0
})

onMounted(() => {
  wrongQuestions.value = getWrongQuestions()
  statistics.value = getStatistics()
  practiceHistory.value = getPracticeHistory().slice(-10).reverse() // 最近10次练习
})

const getQuestionById = (id) => {
  return QUESTIONS.find(q => q.id === id)
}

const viewWrongQuestions = () => {
  if (props.sessionWrongQuestions && props.sessionWrongQuestions.length > 0) {
    emit('view-wrong-questions', props.sessionWrongQuestions)
  }
}

const formatDuration = (seconds) => {
  if (seconds < 60) {
    return `${seconds}秒`
  }
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes}分${secs}秒`
}

const backToMenu = () => {
  emit('back-to-menu')
}

const restartQuiz = () => {
  emit('restart-quiz')
}
</script>

<style scoped>
.result-view {
  min-height: 100vh;
  padding: 20px;
  padding-top: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.result-container {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 40px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  text-align: center;
}

.result-header h1 {
  font-size: 2em;
  color: #667eea;
  margin-bottom: 30px;
}

.score-display {
  margin: 30px 0;
}

.score-circle {
  display: inline-flex;
  align-items: baseline;
  justify-content: center;
  margin-bottom: 10px;
}

.score-value {
  font-size: 4em;
  font-weight: bold;
  color: #667eea;
  line-height: 1;
}

.score-total {
  font-size: 2em;
  color: #999;
  margin-left: 5px;
}

.score-percentage {
  font-size: 1.5em;
  color: #764ba2;
  font-weight: bold;
  margin-top: 10px;
}

.result-message {
  margin: 30px 0;
  font-size: 1.2em;
  line-height: 1.6;
}

.perfect-message {
  color: #4caf50;
  font-weight: bold;
}

.good-message {
  color: #2196f3;
  font-weight: bold;
}

.ok-message {
  color: #ff9800;
  font-weight: bold;
}

.encourage-message {
  color: #666;
  font-weight: bold;
}

.result-actions {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 30px;
}

.action-btn {
  padding: 15px 30px;
  font-size: 1.1em;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s;
  color: white;
}

.restart-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.restart-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.menu-btn {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.menu-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(79, 172, 254, 0.4);
}

.statistics-section {
  margin: 30px 0;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 12px;
}

.statistics-section h3 {
  font-size: 1.5em;
  color: #667eea;
  margin-bottom: 15px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.stat-card {
  background: white;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
}

.stat-label {
  font-size: 0.9em;
  color: #666;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 1.8em;
  font-weight: bold;
  color: #667eea;
}

.stat-value.correct {
  color: #4caf50;
}

.stat-value.wrong {
  color: #f44336;
}

.wrong-questions-section {
  margin: 30px 0;
  padding: 20px;
  background: #fff3e0;
  border-radius: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.wrong-questions-section h3 {
  font-size: 1.5em;
  color: #f44336;
  margin-bottom: 15px;
}

.wrong-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.wrong-item {
  background: white;
  padding: 12px;
  border-radius: 8px;
  border-left: 4px solid #f44336;
}

.wrong-question-id {
  font-size: 0.9em;
  color: #999;
  margin-bottom: 5px;
}

.wrong-question-text {
  font-size: 1em;
  color: #333;
  margin-bottom: 8px;
  line-height: 1.4;
}

.wrong-stats {
  font-size: 0.85em;
  color: #f44336;
  font-weight: bold;
}

.more-wrong {
  text-align: center;
  color: #999;
  font-size: 0.9em;
  padding: 10px;
}

.session-stats-section {
  margin: 30px 0;
  padding: 20px;
  background: #e3f2fd;
  border-radius: 12px;
}

.session-stats-section h3 {
  font-size: 1.5em;
  color: #1976d2;
  margin-bottom: 15px;
}

.session-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.session-stat-card {
  background: white;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
}

.session-stat-label {
  font-size: 0.9em;
  color: #666;
  margin-bottom: 8px;
}

.session-stat-value {
  font-size: 1.8em;
  font-weight: bold;
  color: #667eea;
}

.session-stat-value.correct {
  color: #4caf50;
}

.session-stat-value.wrong {
  color: #f44336;
}

.session-wrong-section {
  margin: 30px 0;
  padding: 20px;
  background: #fff3e0;
  border-radius: 12px;
  text-align: center;
}

.session-wrong-section h3 {
  font-size: 1.5em;
  color: #f44336;
  margin-bottom: 15px;
}

.view-wrong-btn {
  padding: 12px 30px;
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1em;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.view-wrong-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 152, 0, 0.4);
}

.practice-history-section {
  margin: 30px 0;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.practice-history-section h3 {
  font-size: 1.5em;
  color: #667eea;
  margin-bottom: 15px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-item {
  background: white;
  padding: 12px;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.history-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.history-type {
  font-weight: bold;
  color: #667eea;
  font-size: 1.1em;
}

.history-date {
  font-size: 0.85em;
  color: #999;
}

.history-stats {
  display: flex;
  gap: 15px;
  font-size: 0.9em;
  color: #666;
}
</style>

