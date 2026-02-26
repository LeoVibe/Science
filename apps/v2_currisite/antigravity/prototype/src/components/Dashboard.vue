<template>
  <div class="h-full flex flex-col items-center justify-center p-4">
    <div class="glass-card w-full max-w-4xl rounded-3xl p-8 transform transition-all hover:scale-[1.01]">
      <!-- Header Section -->
      <div class="flex items-center justify-between mb-12">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
            <span class="text-2xl">🧬</span>
          </div>
          <div>
            <h1 class="text-3xl font-bold text-gray-800">國小自然科 題庫練習</h1>
            <p class="text-gray-500 text-sm">讓學習科學變得更有趣！</p>
          </div>
        </div>
        <div class="flex gap-3">
          <div class="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center cursor-pointer hover:bg-white transition-colors">
            👤
          </div>
          <div class="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center cursor-pointer hover:bg-white transition-colors">
            🔔
          </div>
        </div>
      </div>

      <!-- Main Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <!-- Start Quiz Card -->
        <button 
          @click="$emit('start-quiz')"
          class="aspect-[3/4] glass-btn rounded-2xl p-6 flex flex-col items-center justify-between group text-left relative overflow-hidden"
        >
          <div class="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          <div class="w-full">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
              <span class="text-3xl text-white">▶️</span>
            </div>
            <h2 class="text-2xl font-bold text-gray-800 mb-2">開始測驗</h2>
            <p class="text-gray-500 text-sm">全範圍隨機出題，挑戰你的科學知識！</p>
          </div>

          <div class="w-full bg-white/50 rounded-xl p-3 backdrop-blur-sm">
            <div class="flex justify-between text-xs text-gray-600 mb-1">
              <span>上次進度</span>
              <span>80%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-1.5">
              <div class="bg-green-500 h-1.5 rounded-full" style="width: 80%"></div>
            </div>
          </div>
        </button>

        <!-- Review Mistakes Card -->
        <button 
          @click="$emit('review-mistakes')"
          class="aspect-[3/4] glass-btn rounded-2xl p-6 flex flex-col items-center justify-between group text-left relative overflow-hidden"
        >
          <div class="absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          <div class="w-full">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
              <span class="text-3xl text-white">⚠️</span>
            </div>
            <h2 class="text-2xl font-bold text-gray-800 mb-2">錯題複習</h2>
            <p class="text-gray-500 text-sm">針對錯誤題目進行加強練習。</p>
          </div>

          <div class="w-full bg-white/50 rounded-xl p-3 backdrop-blur-sm flex items-center justify-center">
            <span class="text-red-500 font-bold mr-2">15</span>
            <span class="text-gray-600 text-xs">題待複習</span>
          </div>
        </button>

        <!-- Statistics Card -->
        <button 
          @click="$emit('show-stats')"
          class="aspect-[3/4] glass-btn rounded-2xl p-6 flex flex-col items-center justify-between group text-left relative overflow-hidden"
        >
          <div class="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          <div class="w-full">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
              <span class="text-3xl text-white">📊</span>
            </div>
            <h2 class="text-2xl font-bold text-gray-800 mb-2">學習統計</h2>
            <p class="text-gray-500 text-sm">查看你的學習曲線與成效分析。</p>
          </div>

          <div class="w-full h-12 flex items-end justify-between px-2 pb-1 gap-1">
            <div class="w-1/6 bg-blue-300 rounded-t-sm h-[40%]"></div>
            <div class="w-1/6 bg-blue-400 rounded-t-sm h-[60%]"></div>
            <div class="w-1/6 bg-blue-300 rounded-t-sm h-[30%]"></div>
            <div class="w-1/6 bg-blue-500 rounded-t-sm h-[80%]"></div>
            <div class="w-1/6 bg-blue-400 rounded-t-sm h-[50%]"></div>
          </div>
        </button>

      </div>

      <!-- Footer -->
      <div class="mt-12 flex justify-center gap-6 text-sm text-gray-500">
        <a href="#" class="hover:text-indigo-600 transition-colors">關於我們</a>
        <a href="#" class="hover:text-indigo-600 transition-colors">使用條款</a>
        <a href="#" class="hover:text-indigo-600 transition-colors">聯繫支持</a>
      </div>
    </div>
  </div>
</template>

<script setup>
defineEmits(['start-quiz', 'review-mistakes', 'show-stats'])
</script>
