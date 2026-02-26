<template>
  <div class="h-full flex flex-col items-center p-4 w-full max-w-4xl mx-auto overflow-hidden">
    
    <div class="w-full flex justify-between items-center mb-6 text-white px-2">
      <h2 class="text-2xl font-bold flex items-center gap-2">
        <span>📝</span> 錯題複習
      </h2>
      <button 
        @click="$emit('back')"
        class="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl text-sm hover:bg-white/30 transition-colors"
      >
        返回
      </button>
    </div>

    <div class="w-full overflow-y-auto pb-20 space-y-6 scrollbar-hide">
      <div 
        v-for="(item, index) in wrongQuestions" 
        :key="index"
        class="glass-card w-full rounded-2xl p-6"
      >
        <span class="inline-block bg-red-100 text-red-700 text-xs px-2 py-1 rounded-md mb-2 font-bold">
          第 {{ index + 1 }} 題
        </span>
        <h3 class="text-xl font-bold text-gray-800 mb-4">{{ item.question.question }}</h3>
        
        <div class="grid gap-2 mb-4">
          <div 
            v-for="(option, optIndex) in item.question.options" 
            :key="optIndex"
            class="p-3 rounded-lg border flex items-center justify-between"
            :class="getOptionClass(item, optIndex)"
          >
            <span>{{ option }}</span>
            <span v-if="optIndex === item.question.correctAnswer">✅ 正確答案</span>
            <span v-if="optIndex === item.selectedAnswer">❌ 你的選擇</span>
          </div>
        </div>

        <div class="bg-blue-50/80 rounded-lg p-3 text-blue-900 text-sm">
          <p class="font-bold mb-1">💡 解析：</p>
          <p>{{ item.question.explanation }}</p>
        </div>
      </div>

      <div v-if="wrongQuestions.length === 0" class="text-center text-white py-20">
        <div class="text-6xl mb-4">🎉</div>
        <p class="text-xl">太棒了！沒有錯誤題目！</p>
      </div>
    </div>

  </div>
</template>

<script setup>
const props = defineProps({
  wrongQuestions: {
    type: Array, // Array of { question: Object, selectedAnswer: Number }
    default: () => []
  }
})

defineEmits(['back'])

const getOptionClass = (item, optIndex) => {
  if (optIndex === item.question.correctAnswer) return 'bg-green-100 border-green-500 text-green-900'
  if (optIndex === item.selectedAnswer) return 'bg-red-100 border-red-500 text-red-900'
  return 'bg-white/50 border-gray-200 text-gray-500 opacity-60'
}
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
