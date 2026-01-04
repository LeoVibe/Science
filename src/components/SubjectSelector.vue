<template>
  <div class="subject-selector">
    <div class="selector-container">
      <h1 class="selector-title">📚 選擇科目</h1>
      <p class="selector-subtitle">請選擇要練習的科目</p>
      
      <div class="subjects-grid">
        <button
          v-for="subject in subjects"
          :key="subject.id"
          @click="selectSubject(subject.id)"
          :class="['subject-btn', { 'active': currentSubject === subject.id }]"
          :style="{ background: subject.color }"
        >
          <span class="subject-icon">{{ subject.icon }}</span>
          <span class="subject-name">{{ subject.name }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits } from 'vue'

const emit = defineEmits(['select-subject'])

const currentSubject = ref(null)

const subjects = [
  {
    id: 'science',
    name: '自然',
    icon: '🌱',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    id: 'chinese',
    name: '國語',
    icon: '📖',
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    id: 'social',
    name: '社會',
    icon: '🌍',
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  {
    id: 'math',
    name: '數學',
    icon: '🔢',
    color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  },
  {
    id: 'english',
    name: '英文',
    icon: '🔤',
    color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  }
]

const selectSubject = (subjectId) => {
  currentSubject.value = subjectId
  emit('select-subject', subjectId)
}
</script>

<style scoped>
.subject-selector {
  min-height: calc(100vh - 60px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 16px;
  box-sizing: border-box;
}

.selector-container {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 40px;
  max-width: 900px;
  width: 100%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  box-sizing: border-box;
}

.selector-title {
  font-size: 3em;
  color: #667eea;
  text-align: center;
  margin-bottom: 12px;
  font-weight: bold;
}

.selector-subtitle {
  font-size: 1.5em;
  color: #666;
  text-align: center;
  margin-bottom: 40px;
}

.subjects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.subject-btn {
  padding: 40px 30px;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: bold;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 180px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
}

.subject-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.1);
  opacity: 0;
  transition: opacity 0.3s;
}

.subject-btn:hover::before {
  opacity: 1;
}

.subject-btn:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.subject-btn:active {
  transform: translateY(-2px);
}

.subject-btn.active {
  transform: scale(1.05);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
  border: 3px solid white;
}

.subject-icon {
  font-size: 4em;
  line-height: 1;
}

.subject-name {
  font-size: 2em;
  line-height: 1;
}

/* 平板响应式 */
@media (max-width: 768px) {
  .selector-container {
    padding: 30px 24px;
  }
  
  .selector-title {
    font-size: 2.5em;
  }
  
  .selector-subtitle {
    font-size: 1.3em;
    margin-bottom: 30px;
  }
  
  .subjects-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  .subject-btn {
    padding: 30px 24px;
    min-height: 150px;
  }
  
  .subject-icon {
    font-size: 3em;
  }
  
  .subject-name {
    font-size: 1.6em;
  }
}

/* 手机响应式 */
@media (max-width: 600px) {
  .subject-selector {
    padding: 16px 12px;
    min-height: calc(100vh - 55px);
  }
  
  .selector-container {
    padding: 24px 16px;
    border-radius: 16px;
  }
  
  .selector-title {
    font-size: 2em;
  }
  
  .selector-subtitle {
    font-size: 1.1em;
    margin-bottom: 24px;
  }
  
  .subjects-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .subject-btn {
    padding: 24px 20px;
    min-height: 120px;
    border-radius: 12px;
  }
  
  .subject-icon {
    font-size: 2.5em;
  }
  
  .subject-name {
    font-size: 1.4em;
  }
}

/* 小屏幕手机 */
@media (max-width: 480px) {
  .selector-title {
    font-size: 1.8em;
  }
  
  .subject-btn {
    padding: 20px 16px;
    min-height: 100px;
  }
  
  .subject-icon {
    font-size: 2em;
  }
  
  .subject-name {
    font-size: 1.2em;
  }
}
</style>

