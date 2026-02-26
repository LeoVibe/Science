<template>
  <div class="h-full flex flex-col items-center justify-center p-4 w-full max-w-2xl mx-auto">
    <div class="glass-card w-full rounded-3xl p-10 flex flex-col items-center animate-fade-in-up">
      
      <!-- Trophy Icon -->
      <div class="text-6xl mb-6 animate-bounce-slow">
        {{ scorePercentage >= 80 ? '🏆' : (scorePercentage >= 60 ? '✨' : '💪') }}
      </div>

      <h2 class="text-3xl font-bold text-gray-800 mb-2">測驗完成！</h2>
      <p class="text-gray-500 mb-8">{{ getEncouragement() }}</p>

      <!-- Score Circle -->
      <div class="relative w-48 h-48 mb-10 flex items-center justify-center">
        <!-- SVG Circle -->
        <svg class="w-full h-full transform -rotate-90">
          <circle
            cx="96"
            cy="96"
            r="88"
            stroke="currentColor"
            stroke-width="12"
            fill="transparent"
            class="text-gray-200"
          />
          <circle
            cx="96"
            cy="96"
            r="88"
            stroke="currentColor"
            stroke-width="12"
            fill="transparent"
            class="text-indigo-500 transition-all duration-1000 ease-out"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="dashOffset"
            stroke-linecap="round"
          />
        </svg>
        <div class="absolute flex flex-col items-center">
          <span class="text-5xl font-bold text-gray-800">{{ Math.round(scorePercentage) }}%</span>
          <span class="text-gray-500 text-sm">正確率</span>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-2 gap-4 w-full mb-8">
        <div class="bg-green-50 rounded-xl p-4 flex flex-col items-center">
          <span class="text-green-600 font-bold text-lg">✅ 正確</span>
          <span class="text-2xl font-bold text-gray-800">{{ score }}</span>
        </div>
        <div class="bg-red-50 rounded-xl p-4 flex flex-col items-center">
          <span class="text-red-500 font-bold text-lg">❌ 錯誤</span>
          <span class="text-2xl font-bold text-gray-800">{{ total - score }}</span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row gap-4 w-full">
        <button 
          @click="$emit('restart')"
          class="flex-1 py-3 px-6 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
        >
          <span>🔄</span> 重來一次
        </button>
        <button 
          @click="$emit('review')"
          class="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2"
        >
          <span>📝</span> 查看錯題
        </button>
      </div>

      <button 
        @click="$emit('home')"
        class="mt-6 text-gray-500 hover:text-gray-800 transition-colors text-sm"
      >
        回首頁
      </button>

    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'

const props = defineProps({
  score: Number,
  total: Number
})

defineEmits(['restart', 'review', 'home'])

const scorePercentage = computed(() => (props.score / props.total) * 100)
const radius = 88
const circumference = 2 * Math.PI * radius
const dashOffset = ref(circumference)

const getEncouragement = () => {
  if (scorePercentage.value >= 100) return '太厲害了！全部答對！🎉'
  if (scorePercentage.value >= 80) return '很棒喔！繼續保持！🌟'
  if (scorePercentage.value >= 60) return '及格了！再接再厲！📚'
  return '別灰心，多練習幾次就會了！💪'
}

onMounted(() => {
  setTimeout(() => {
    dashOffset.value = circumference - (scorePercentage.value / 100) * circumference
  }, 300)
})
</script>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out;
}

.animate-bounce-slow {
  animation: bounce 2s infinite;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes bounce {
  0%, 100% { transform: translateY(-5%); }
  50% { transform: translateY(5%); }
}
</style>
