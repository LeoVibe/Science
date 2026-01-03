# 國小自然科 題庫練習 - 完整構建 Prompt

這是一個完整的構建指南，可以讓任何人重建整個網站。

## 項目概述

這是一個使用 Vue 3 + Vite 構建的國小自然科題庫練習網站，包含：
- 基本挑戰（10題）和高級挑戰（20題）
- 分類練習
- 答題統計功能
- 錯誤題目檢視功能
- 練習歷史記錄

## 技術棧

- **框架**: Vue 3 (Composition API)
- **構建工具**: Vite 5
- **語言**: JavaScript (ES Modules)
- **存儲**: localStorage

---

## 第一步：創建項目結構

創建以下目錄結構：

```
Science/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── src/
│   ├── components/
│   │   ├── AllWrongQuestionsView.vue
│   │   ├── MainMenu.vue
│   │   ├── QuizView.vue
│   │   ├── ResultView.vue
│   │   ├── ReviewView.vue
│   │   ├── StatisticsView.vue
│   │   └── WrongQuestionsView.vue
│   ├── data/
│   │   └── questions.js
│   ├── utils/
│   │   └── storage.js
│   ├── App.vue
│   ├── main.js
│   └── style.css
├── .gitignore
├── index.html
├── package.json
└── vite.config.js
```

---

## 第二步：創建配置文件

### 1. package.json

```json
{
  "name": "science-review",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.4.21"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.4",
    "vite": "^5.2.0"
  }
}
```

### 2. vite.config.js

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: process.env.NODE_ENV === 'production' ? '/Science/' : '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  server: {
    port: 5173,
    open: true
  }
})
```

### 3. index.html

```html
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>國小自然科 題庫練習</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

### 4. .gitignore

```
node_modules/
dist/
.vite/
.DS_Store
*.log
```

---

## 第三步：創建核心文件

### 1. src/main.js

```javascript
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

createApp(App).mount('#app')
```

### 2. src/utils/storage.js

```javascript
// 答题历史存储工具

// 获取答题历史
export function getAnswerHistory() {
  const history = localStorage.getItem('answerHistory')
  return history ? JSON.parse(history) : {}
}

// 保存答题记录
export function saveAnswerRecord(questionId, isCorrect) {
  const history = getAnswerHistory()
  
  if (!history[questionId]) {
    history[questionId] = {
      total: 0,
      correct: 0,
      wrong: 0,
      lastAnswer: null,
      lastAnswerTime: null
    }
  }
  
  history[questionId].total++
  history[questionId].lastAnswer = isCorrect
  history[questionId].lastAnswerTime = Date.now()
  
  if (isCorrect) {
    history[questionId].correct++
  } else {
    history[questionId].wrong++
  }
  
  localStorage.setItem('answerHistory', JSON.stringify(history))
  return history[questionId]
}

// 获取错题列表
export function getWrongQuestions() {
  const history = getAnswerHistory()
  const wrongQuestions = []
  
  Object.keys(history).forEach(questionId => {
    const record = history[questionId]
    if (record.wrong > 0) {
      wrongQuestions.push({
        id: parseInt(questionId),
        wrongCount: record.wrong,
        totalCount: record.total,
        accuracy: record.total > 0 ? (record.correct / record.total * 100).toFixed(1) : 0
      })
    }
  })
  
  return wrongQuestions.sort((a, b) => b.wrongCount - a.wrongCount)
}

// 获取统计信息
export function getStatistics() {
  const history = getAnswerHistory()
  let totalQuestions = 0
  let totalCorrect = 0
  let totalWrong = 0
  
  Object.values(history).forEach(record => {
    totalQuestions += record.total
    totalCorrect += record.correct
    totalWrong += record.wrong
  })
  
  return {
    totalQuestions,
    totalCorrect,
    totalWrong,
    accuracy: totalQuestions > 0 ? (totalCorrect / totalQuestions * 100).toFixed(1) : 0,
    wrongCount: Object.values(history).filter(r => r.wrong > 0).length
  }
}

// 清除所有记录
export function clearHistory() {
  localStorage.removeItem('answerHistory')
  localStorage.removeItem('practiceHistory')
}

// 保存练习记录
export function savePracticeRecord(record) {
  const history = getPracticeHistory()
  record.id = Date.now()
  record.timestamp = Date.now()
  history.push(record)
  // 只保留最近100条记录
  if (history.length > 100) {
    history.shift()
  }
  localStorage.setItem('practiceHistory', JSON.stringify(history))
  return record
}

// 获取练习历史
export function getPracticeHistory() {
  const history = localStorage.getItem('practiceHistory')
  return history ? JSON.parse(history) : []
}
```

---

## 第四步：安裝依賴並運行

```bash
# 安裝依賴
npm install

# 開發模式運行
npm run dev

# 構建生產版本
npm run build
```

---

## 第五步：創建 Vue 組件

由於組件文件較大，請按照以下順序創建：

1. **src/App.vue** - 主應用組件（路由和狀態管理）
2. **src/components/MainMenu.vue** - 主選單
3. **src/components/QuizView.vue** - 答題視圖
4. **src/components/ResultView.vue** - 結果視圖
5. **src/components/StatisticsView.vue** - 統計視圖
6. **src/components/AllWrongQuestionsView.vue** - 所有錯題視圖
7. **src/components/ReviewView.vue** - 複習視圖
8. **src/components/WrongQuestionsView.vue** - 錯題視圖
9. **src/data/questions.js** - 題目數據
10. **src/style.css** - 樣式文件

---

## 第六步：GitHub Pages 部署配置

### .github/workflows/deploy.yml

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          NODE_ENV: production

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

---

## 完整構建指令（一鍵執行）

```bash
# 1. 創建項目目錄
mkdir Science && cd Science

# 2. 初始化 npm 項目
npm init -y

# 3. 安裝依賴
npm install vue@^3.4.21
npm install -D vite@^5.2.0 @vitejs/plugin-vue@^5.0.4

# 4. 創建目錄結構
mkdir -p src/components src/data src/utils .github/workflows

# 5. 創建所有配置文件（參考上面的內容）

# 6. 安裝依賴並生成 package-lock.json
npm install

# 7. 測試構建
npm run build

# 8. 本地預覽
npm run preview
```

---

## 重要提示

1. **base 路徑配置**：如果部署到 GitHub Pages 子目錄，需要修改 `vite.config.js` 中的 `base` 路徑
2. **題目數據**：`src/data/questions.js` 文件包含所有題目，需要完整創建
3. **樣式文件**：`src/style.css` 包含所有樣式，需要完整創建
4. **組件文件**：所有 Vue 組件都需要完整創建，包括模板、腳本和樣式

---

## 下一步

由於組件文件較大，建議：
1. 先創建基本結構和配置文件
2. 然後逐步添加組件文件
3. 最後添加題目數據和樣式

如果需要完整的組件代碼，請告訴我，我可以提供每個組件的完整內容。

