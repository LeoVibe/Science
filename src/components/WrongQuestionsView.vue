<template>
  <div class="wrong-questions-view">
    <div class="wrong-container">
      <div class="wrong-header">
        <button @click="back" class="back-btn">← 返回</button>
        <h1>❌ 錯題檢視</h1>
        <div class="wrong-count">共 {{ wrongQuestions.length }} 題</div>
      </div>

      <div class="wrong-content">
        <div 
          v-for="questionId in wrongQuestions" 
          :key="questionId"
          class="wrong-question-card"
        >
          <div class="question-info">
            <span class="question-id">#{{ questionId }}</span>
            <span class="question-category">{{ getQuestionById(questionId)?.category || '' }}</span>
          </div>
          <div class="question-text">
            {{ getQuestionById(questionId)?.question || '題目載入中...' }}
          </div>
          <div class="question-options">
            <div 
              v-for="(option, index) in getQuestionById(questionId)?.options || []"
              :key="index"
              :class="['option-item', {
                'correct-option': index === getQuestionById(questionId)?.correctAnswer
              }]"
            >
              {{ String.fromCharCode(65 + index) }}. {{ option }}
            </div>
          </div>
          <div class="question-explanation">
            <strong>💡 解釋：</strong>{{ getQuestionById(questionId)?.explanation || '' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getQuestionsBySubject } from '../data/questions.js'

const props = defineProps({
  wrongQuestions: {
    type: Array,
    default: () => []
  },
  subject: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['back'])

const questionsModule = ref(null)
const QUESTIONS = ref([])

// 載入科目題目
const loadSubjectQuestions = async () => {
  if (!props.subject) {
    QUESTIONS.value = []
    return
  }
  
  try {
    questionsModule.value = await getQuestionsBySubject(props.subject)
    QUESTIONS.value = questionsModule.value.QUESTIONS || []
  } catch (error) {
    console.error('載入題目失敗:', error)
    QUESTIONS.value = []
  }
}

onMounted(async () => {
  await loadSubjectQuestions()
})

const getQuestionById = (id) => {
  return QUESTIONS.value.find(q => q.id === id)
}

const back = () => {
  emit('back')
}
</script>

<style scoped>
.wrong-questions-view {
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
}

.back-btn {
  position: absolute;
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
  color: #f44336;
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
  margin-bottom: 15px;
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
</style>

