# 國小自然科 題庫練習 - 完整構建 Prompt（包含所有代碼）

這是一個完整的構建指南，包含所有必要的文件內容，可以讓任何人完全重建整個網站。

## 📋 項目信息

- **項目名稱**: 國小自然科 題庫練習
- **版本**: v1.2.0
- **技術棧**: Vue 3 + Vite 5
- **總代碼行數**: 約 3700+ 行

---

## 🚀 快速開始

### 步驟 1: 初始化項目

```bash
# 創建項目目錄
mkdir Science && cd Science

# 初始化 npm 項目
npm init -y

# 安裝依賴
npm install vue@^3.4.21
npm install -D vite@^5.2.0 @vitejs/plugin-vue@^5.0.4

# 創建目錄結構
mkdir -p src/components src/data src/utils .github/workflows
```

---

## 📁 項目結構

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

## 📝 配置文件

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

### 5. .github/workflows/deploy.yml

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

## 💻 核心文件

### src/main.js

```javascript
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

createApp(App).mount('#app')
```

### src/utils/storage.js

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

## ⚠️ 重要提示

由於組件文件（Vue 文件）和數據文件較大（總共約 3700+ 行），無法在此文檔中完整展示。請按照以下方式獲取完整代碼：

### 方式 1: 從 GitHub 獲取

如果項目已推送到 GitHub，可以直接克隆：

```bash
git clone https://github.com/LeoVibe/Science.git
cd Science
npm install
npm run dev
```

### 方式 2: 從本地項目複製

如果已有本地項目，可以複製以下文件：

1. **src/App.vue** - 主應用組件（約 230 行）
2. **src/components/MainMenu.vue** - 主選單（約 200 行）
3. **src/components/QuizView.vue** - 答題視圖（約 650 行）
4. **src/components/ResultView.vue** - 結果視圖（約 560 行）
5. **src/components/StatisticsView.vue** - 統計視圖（約 300 行）
6. **src/components/AllWrongQuestionsView.vue** - 所有錯題視圖（約 200 行）
7. **src/components/ReviewView.vue** - 複習視圖（約 150 行）
8. **src/components/WrongQuestionsView.vue** - 錯題視圖（約 150 行）
9. **src/data/questions.js** - 題目數據（約 1000+ 行）
10. **src/style.css** - 樣式文件（約 500+ 行）

### 方式 3: 使用 AI 助手

告訴 AI 助手：
> "請幫我創建一個國小自然科題庫練習網站，使用 Vue 3 + Vite，包含以下功能：
> - 基本挑戰（10題）和高級挑戰（20題）
> - 分類練習
> - 答題統計功能
> - 錯誤題目檢視功能
> - 練習歷史記錄
> 
> 請提供完整的代碼，包括所有 Vue 組件、樣式文件和題目數據。"

---

## 🎯 構建和運行

```bash
# 安裝依賴
npm install

# 開發模式運行
npm run dev

# 構建生產版本
npm run build

# 預覽生產版本
npm run preview
```

---

## 📦 部署到 GitHub Pages

1. 在 GitHub 上創建名為 `Science` 的倉庫
2. 推送代碼到 GitHub
3. 在倉庫設置中，將 GitHub Pages 源設置為 "GitHub Actions"
4. 等待部署完成
5. 訪問：https://leovibe.github.io/Science/

---

## 📌 功能說明

### 主要功能

1. **基本挑戰**：10 題隨機練習
2. **高級挑戰**：20 題隨機練習
3. **分類練習**：按主題分類練習
4. **答題統計**：記錄每次練習的時間、正確率、類型
5. **錯誤題目檢視**：查看所有答錯的題目
6. **練習歷史**：查看所有練習記錄

### 數據存儲

- 使用 `localStorage` 存儲答題歷史
- 自動記錄每次練習的統計信息
- 保留最近 100 條練習記錄

---

## 🔧 自定義配置

### 修改部署路徑

如果部署到不同的路徑，修改 `vite.config.js`：

```javascript
base: process.env.NODE_ENV === 'production' ? '/YourPath/' : '/',
```

### 修改題目數據

編輯 `src/data/questions.js` 文件，添加或修改題目。

---

## 📚 技術文檔

- Vue 3: https://vuejs.org/
- Vite: https://vitejs.dev/
- GitHub Pages: https://pages.github.com/

---

## ✅ 檢查清單

構建前請確認：

- [ ] Node.js 已安裝（版本 18+）
- [ ] npm 或 yarn 已安裝
- [ ] 所有配置文件已創建
- [ ] 所有組件文件已創建
- [ ] 題目數據文件已創建
- [ ] 樣式文件已創建
- [ ] `npm install` 執行成功
- [ ] `npm run dev` 可以正常運行
- [ ] `npm run build` 可以正常構建

---

## 🆘 常見問題

### Q: 構建失敗，提示找不到模組
A: 執行 `npm install` 安裝所有依賴

### Q: 開發服務器無法啟動
A: 檢查端口 5173 是否被占用，或修改 `vite.config.js` 中的端口號

### Q: GitHub Pages 顯示 404
A: 確認 `vite.config.js` 中的 `base` 路徑正確，並在 GitHub 設置中選擇 "GitHub Actions" 作為源

### Q: 樣式不正確
A: 確認 `src/style.css` 文件已完整創建並在 `main.js` 中正確導入

---

## 📞 獲取完整代碼

如果需要完整的組件代碼，請：
1. 從 GitHub 倉庫克隆項目
2. 或聯繫項目維護者獲取完整代碼文件
3. 或使用 AI 助手根據此 prompt 生成完整代碼

---

**最後更新**: 2026-01-04
**版本**: v1.2.0

