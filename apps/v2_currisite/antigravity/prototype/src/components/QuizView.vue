<template>
  <div class="h-full flex flex-col items-center justify-center p-4 max-w-3xl mx-auto w-full">
    
    <!-- Progress Header -->
    <div class="w-full flex justify-between items-center mb-6 text-white px-2">
      <div class="flex items-center gap-2">
        <span class="text-2xl">🧪</span>
        <span class="font-bold">第 {{ currentIndex + 1 }} 題</span>
        <span class="text-white/60 text-sm">/ 共 {{ totalQuestions }} 題</span>
      </div>
      <div class="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
        得分: {{ score }}
      </div>
    </div>

    <!-- Question Card -->
    <div class="glass-card w-full rounded-3xl p-8 relative overflow-hidden min-h-[400px] flex flex-col">
      <!-- Background Decor -->
      <div class="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>

      <!-- Question Text -->
      <div class="mb-8 relative z-10 flex-grow">
        <span class="inline-block bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-md mb-3 font-bold tracking-wider">
          {{ currentQuestion.category }}
        </span>
        <h2 class="text-2xl font-bold text-gray-800 leading-relaxed">
          {{ currentQuestion.question }}
        </h2>
      </div>

      <!-- Options Grid -->
      <div class="grid gap-4 relative z-10">
        <button 
          v-for="(option, index) in currentQuestion.options" 
          :key="index"
          @click="handleAnswer(index)"
          :disabled="showFeedback"
          class="w-full p-4 rounded-xl text-left transition-all duration-200 border-2 flex items-center group relative overflow-hidden"
          :class="getOptionClass(index)"
        >
          <!-- Hover Gradient -->
          <div class="absolute inset-0 bg-white/50 opacity-0 group-hover:opacity-100 transition-opacity" v-if="!showFeedback"></div>
          
          <!-- Option Label (A, B, C...) -->
          <div 
            class="w-8 h-8 rounded-full flex items-center justify-center mr-4 text-sm font-bold shrink-0 transition-colors"
            :class="getOptionLabelClass(index)"
          >
            {{ ['A', 'B', 'C', 'D'][index] }}
          </div>
          
          <span class="font-medium text-lg relative z-10" :class="getOptionTextClass(index)">
            {{ option }}
          </span>

          <!-- Feedback Icon -->
          <div class="ml-auto text-2xl" v-if="showFeedback && index === currentQuestion.correctAnswer">
            ✅
          </div>
          <div class="ml-auto text-2xl" v-if="showFeedback && selectedAnswer === index && index !== currentQuestion.correctAnswer">
            ❌
          </div>
        </button>
      </div>

      <!-- Explanation / Next Button -->
      <div v-if="showFeedback" class="mt-6 pt-6 border-t border-gray-200/50 animate-fade-in">
        <div class="bg-blue-50/80 rounded-xl p-4 mb-4 text-blue-900">
          <p class="font-bold text-sm mb-1">💡 小知識</p>
          <p>{{ currentQuestion.explanation }}</p>
        </div>
        
        <button 
          @click="nextQuestion"
          class="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all active:scale-95"
        >
          {{ isLastQuestion ? '查看結果 🏆' : '下一題 ➡️' }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  questions: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['finish-quiz'])

const currentIndex = ref(0)
const score = ref(0)
const selectedAnswer = ref(null)
const showFeedback = ref(false)
const history = ref([]) // Track answers for review

const currentQuestion = computed(() => props.questions[currentIndex.value] || {})
const totalQuestions = computed(() => props.questions.length)
const isLastQuestion = computed(() => currentIndex.value === props.questions.length - 1)

// Colors logic
const getOptionClass = (index) => {
  if (!showFeedback.value) {
    return 'bg-white/40 border-white/20 hover:border-indigo-300 hover:bg-white/60'
  }
  
  if (index === currentQuestion.value.correctAnswer) {
    return 'bg-green-100/80 border-green-500 text-green-900'
  }
  
  if (index === selectedAnswer.value) {
    return 'bg-red-100/80 border-red-500 text-red-900'
  }
  
  return 'bg-white/20 border-transparent opacity-50'
}

const getOptionLabelClass = (index) => {
  if (!showFeedback.value) return 'bg-white text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'
  if (index === currentQuestion.value.correctAnswer) return 'bg-green-500 text-white'
  if (index === selectedAnswer.value) return 'bg-red-500 text-white'
  return 'bg-gray-200 text-gray-500'
}

const getOptionTextClass = (index) => {
  if (!showFeedback.value) return 'text-gray-700'
  return ''
}

const handleAnswer = (index) => {
  if (showFeedback.value) return
  
  selectedAnswer.value = index
  showFeedback.value = true
  
  const isCorrect = index === currentQuestion.value.correctAnswer
  if (isCorrect) {
    score.value += 1
  }

  // Record history
  history.value.push({
    questionId: currentQuestion.value.id,
    selected: index,
    correct: currentQuestion.value.correctAnswer,
    isCorrect
  })
}

const nextQuestion = () => {
  if (isLastQuestion.value) {
    emit('finish-quiz', {
      score: score.value,
      total: totalQuestions.value,
      history: history.value
    })
  } else {
    currentIndex.value++
    selectedAnswer.value = null
    showFeedback.value = false
  }
}
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
