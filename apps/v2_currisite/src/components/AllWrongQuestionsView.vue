<template>
  <div class="all-wrong-questions-view">
    <div class="wrong-container">
      <div class="wrong-header">
        <button @click="back" class="back-btn">← 返回</button>
        <h1>❌ 累積錯題檢視</h1>
        <div class="wrong-count">共 {{ wrongQuestions.length }} 題</div>
      </div>

      <div class="wrong-content">
        <div v-if="wrongQuestions.length > 0">
          <div 
            v-for="item in wrongQuestions" 
            :key="item.id"
            class="wrong-question-card"
          >
            <div class="question-info">
              <span class="question-id">#{{ item.id }}</span>
              <span class="question-category">{{ getQuestionById(item.id)?.category || '' }}</span>
              <span class="wrong-stats-badge">錯誤 {{ item.wrongCount }} 次 | 正確率 {{ item.accuracy }}%</span>
            </div>
            <div class="question-text">
              {{ getQuestionById(item.id)?.question || '題目載入中...' }}
            </div>
            <div class="question-options">
              <div 
                v-for="(option, index) in getQuestionById(item.id)?.options || []"
                :key="index"
                :class="['option-item', {
                  'correct-option': index === getCorrectAnswerIndex(getQuestionById(item.id))
                }]"
              >
                {{ String.fromCharCode(65 + index) }}. {{ option }}
              </div>
            </div>
            <div class="question-explanation">
              <strong>💡 解釋：</strong>{{ getQuestionById(item.id)?.explanation || '' }}
            </div>
          </div>
        </div>
        <div v-else class="empty-message">
          <p>🎉 太棒了！目前沒有錯題記錄！</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { loadQuestions } from '../data/index.js'
import { getWrongQuestions } from '../utils/storage.js'

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

const wrongQuestions = ref([])
const questionsModule = ref(null)
const allQuestions = ref([])

// 获取正确答案索引（兼容新旧格式）
const getCorrectAnswerIndex = (question) => {
  if (!question) return -1
  return question.answer !== undefined ? question.answer : (question.correctAnswer !== undefined ? question.correctAnswer : -1)
}

// 載入科目題目
const loadSubjectQuestions = async () => {
  if (!props.grade || !props.subject || !props.semester || !props.publisher) {
    allQuestions.value = []
    wrongQuestions.value = []
    return
  }
  
  try {
    questionsModule.value = await loadQuestions(props.grade, props.subject, props.semester, props.publisher)
    allQuestions.value = questionsModule.value.questions || []
    wrongQuestions.value = getWrongQuestions(props.grade, props.subject, props.semester, props.publisher)
  } catch (error) {
    console.error('載入題目失敗:', error)
    allQuestions.value = []
    wrongQuestions.value = []
  }
}

onMounted(() => {
  loadSubjectQuestions()
})

watch(() => [props.grade, props.subject, props.semester, props.publisher], () => {
  loadSubjectQuestions()
})

const getQuestionById = (id) => {
  // 支持字符串和数字类型的ID匹配
  const question = allQuestions.value.find(q => {
    return q.id === id || q.id === String(id) || String(q.id) === String(id)
  })
  return question
}

const back = () => {
  emit('back')
}
</script>

<style scoped>
.all-wrong-questions-view {
  min-height: 100vh;
  padding: 20px;
  padding-top: 70px;
  background: #f5f5f5;
}

.wrong-container {
  max-width: 900px;
  margin: 0 auto;
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.wrong-header {
  margin-bottom: 30px;
  text-align: center;
  position: relative;
}

.back-btn {
  position: absolute;
  left: 0;
  top: 0;
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

.wrong-header h1 {
  font-size: 2.5em;
  color: #1565c0;
  margin: 20px 0 10px;
}

.wrong-count {
  font-size: 1.2em;
  color: #666;
}

.wrong-content {
  display: flex;
  flex-direction: column;
  gap: 25px;
  max-height: 70vh;
  overflow-y: auto;
}

.wrong-question-card {
  background: #fff;
  border: 2px solid #ffcdd2;
  border-radius: 15px;
  padding: 20px;
  transition: all 0.3s;
}

.wrong-question-card:hover {
  border-color: #f44336;
  box-shadow: 0 5px 15px rgba(244, 67, 54, 0.2);
}

.question-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 10px;
}

.question-id {
  font-size: 1.1em;
  color: #999;
  font-weight: bold;
}

.question-category {
  background: #e3f2fd;
  color: #1976d2;
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 0.9em;
  font-weight: bold;
}

.wrong-stats-badge {
  background: #ffebee;
  color: #f44336;
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 0.9em;
  font-weight: bold;
}

.question-text {
  font-size: 1.3em;
  color: #333;
  margin-bottom: 20px;
  line-height: 1.6;
  font-weight: bold;
}

.question-options {
  margin: 20px 0;
}

.option-item {
  padding: 12px 15px;
  margin: 10px 0;
  background: #f9f9f9;
  border-radius: 8px;
  border-left: 3px solid #e0e0e0;
  font-size: 1.1em;
}

.option-item.correct-option {
  background: #e8f5e9;
  border-left-color: #4caf50;
  font-weight: bold;
  color: #2e7d32;
}

.question-explanation {
  margin-top: 20px;
  padding: 15px;
  background: #fff3e0;
  border-radius: 8px;
  border-left: 4px solid #ff9800;
  line-height: 1.8;
  color: #555;
  font-size: 1.1em;
}

.empty-message {
  text-align: center;
  padding: 40px;
  color: #999;
  font-size: 1.5em;
}
</style>
