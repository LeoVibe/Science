<template>
  <div class="review-view">
    <div class="review-container">
      <div class="review-header">
        <button @click="backToMenu" class="back-btn">← 返回</button>
        <h1>📚 知識複習</h1>
      </div>

      <div class="category-tabs">
        <button
          v-for="category in categories"
          :key="category"
          @click="selectedCategory = category"
          :class="['tab-btn', { active: selectedCategory === category }]"
        >
          {{ category }}
        </button>
      </div>

      <div class="review-content">
        <div v-for="question in categoryQuestions" :key="question.id" class="review-card">
          <div class="review-card-header">
            <span class="question-type">{{ question.type }}</span>
            <span class="question-id">#{{ question.id }}</span>
          </div>
          <div class="review-question">{{ question.question }}</div>
          <div v-if="question.type === '選擇題'" class="review-options">
            <div
              v-for="(option, index) in question.options"
              :key="index"
              :class="['review-option', { correct: index === question.correctAnswer }]"
            >
              {{ String.fromCharCode(65 + index) }}. {{ option }}
            </div>
          </div>
          <div v-else-if="question.type === '是非題'" class="review-answer">
            <strong>答案：</strong>{{ question.correctAnswer ? '是' : '否' }}
          </div>
          <div v-else class="review-answer">
            <strong>答案：</strong>{{ question.correctAnswer }}
          </div>
          <div class="review-explanation">
            <strong>💡 解釋：</strong>{{ question.explanation }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getAllCategories, getQuestionsByCategory } from '../data/questions.js'

const emit = defineEmits(['back-to-menu'])

const categories = getAllCategories()
const selectedCategory = ref(categories[0])

const categoryQuestions = computed(() => {
  return getQuestionsByCategory(selectedCategory.value)
})

const backToMenu = () => {
  emit('back-to-menu')
}
</script>

<style scoped>
.review-view {
  min-height: 100vh;
  padding: 20px;
}

.review-container {
  max-width: 900px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.review-header {
  margin-bottom: 25px;
}

.review-header h1 {
  font-size: 2em;
  color: #667eea;
  text-align: center;
  margin-top: 10px;
}

.back-btn {
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

.category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 25px;
  justify-content: center;
}

.tab-btn {
  padding: 10px 20px;
  background: #f5f5f5;
  border: 2px solid #e0e0e0;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1em;
  transition: all 0.3s;
}

.tab-btn:hover {
  background: #e8e8e8;
}

.tab-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
}

.review-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.review-card {
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 15px;
  padding: 20px;
  transition: all 0.3s;
}

.review-card:hover {
  border-color: #667eea;
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.2);
}

.review-card-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.question-type {
  background: #e3f2fd;
  color: #1976d2;
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 0.85em;
  font-weight: bold;
}

.question-id {
  color: #999;
  font-size: 0.9em;
}

.review-question {
  font-size: 1.2em;
  color: #333;
  margin-bottom: 15px;
  font-weight: bold;
  line-height: 1.6;
}

.review-options {
  margin: 15px 0;
}

.review-option {
  padding: 10px 15px;
  margin: 8px 0;
  background: #f9f9f9;
  border-radius: 8px;
  border-left: 3px solid #e0e0e0;
}

.review-option.correct {
  background: #e8f5e9;
  border-left-color: #4caf50;
  font-weight: bold;
  color: #2e7d32;
}

.review-answer {
  margin: 15px 0;
  padding: 12px;
  background: #e8f5e9;
  border-radius: 8px;
  color: #2e7d32;
  font-size: 1.1em;
}

.review-explanation {
  margin-top: 15px;
  padding: 15px;
  background: #fff3e0;
  border-radius: 8px;
  border-left: 4px solid #ff9800;
  line-height: 1.8;
  color: #555;
}
</style>

