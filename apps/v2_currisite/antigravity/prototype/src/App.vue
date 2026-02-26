<template>
  <div class="app-container min-h-screen w-full relative overflow-hidden font-sans text-gray-800">
    
    <!-- Animated Background -->
    <div class="absolute inset-0 bg-gradient-to-br from-[#667eea] to-[#764ba2] z-0"></div>
    <div class="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20 pointer-events-none">
      <div class="absolute top-[10%] left-[10%] w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
      <div class="absolute top-[30%] right-[20%] w-72 h-72 bg-purple-300 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"></div>
      <div class="absolute bottom-[20%] left-[30%] w-80 h-80 bg-pink-300 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-4000"></div>
    </div>

    <!-- Content Area -->
    <div class="relative z-10 w-full h-screen overflow-hidden">
      <transition name="fade" mode="out-in">
        
        <!-- View: Dashboard -->
        <Dashboard 
          v-if="currentView === 'dashboard'" 
          @start-quiz="startQuiz"
          @review-mistakes="startReview"
          @show-stats="showStats"
        />

        <!-- View: Quiz -->
        <QuizView 
          v-else-if="currentView === 'quiz'" 
          :questions="quizQuestions"
          @finish-quiz="handleQuizFinish"
        />

        <!-- View: Result -->
        <ResultView 
          v-else-if="currentView === 'result'" 
          :score="currentScore" 
          :total="quizTotal"
          @restart="startQuiz"
          @review="viewWrongQuestions"
          @home="goHome"
        />

        <!-- View: Review -->
        <ReviewView 
          v-else-if="currentView === 'review'" 
          :wrong-questions="wrongQuestionsData"
          @back="goBackFromReview"
        />

      </transition>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Dashboard from './components/Dashboard.vue'
import QuizView from './components/QuizView.vue'
import ResultView from './components/ResultView.vue'
import ReviewView from './components/ReviewView.vue'
import { QUESTIONS } from './data/questions'

const currentView = ref('dashboard')
const quizQuestions = ref([])
const currentScore = ref(0)
const quizTotal = ref(0)
const quizHistory = ref([])
const previousView = ref('dashboard')

// Start a new quiz
const startQuiz = () => {
  // Shuffle questions and pick 10 (or all if less than 10)
  // For prototype, let's take 10 random
  const shuffled = [...QUESTIONS].sort(() => 0.5 - Math.random())
  quizQuestions.value = shuffled.slice(0, 5) // 5 questions for quick testing, change to 10 or 20 later
  quizTotal.value = quizQuestions.value.length
  currentScore.value = 0
  currentView.value = 'quiz'
}

const handleQuizFinish = (result) => {
  currentScore.value = result.score
  quizHistory.value = result.history
  currentView.value = 'result'
}

const viewWrongQuestions = () => {
  previousView.value = 'result'
  currentView.value = 'review'
}

const startReview = () => {
  // Logic to review ALL mistakes from storage could go here
  // For now, let's just show mistakes from the last session if available, or tell user no data
  if (quizHistory.value.length === 0) {
    alert('暫無本次測驗紀錄，請先進行測驗！')
    return
  }
  viewWrongQuestions()
}

const wrongQuestionsData = computed(() => {
  return quizHistory.value
    .filter(h => !h.isCorrect)
    .map(h => {
      const q = QUESTIONS.find(q => q.id === h.questionId)
      return {
        question: q,
        selectedAnswer: h.selected
      }
    })
})

const goHome = () => {
  currentView.value = 'dashboard'
}

const goBackFromReview = () => {
  currentView.value = previousView.value
}

const showStats = () => {
  alert('統計功能開發中！')
}
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}
</style>
