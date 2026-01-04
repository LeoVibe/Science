# 多科目題庫使用指南

## 📚 支持的科目

目前支持以下 5 個科目：

1. **🌱 自然** - 自然科學題目
2. **📖 國語** - 國語文題目
3. **🌍 社會** - 社會科題目
4. **🔢 數學** - 數學題目
5. **🔤 英文** - 英文題目

## 🎯 功能說明

### 科目選擇
- 首次進入應用時，會顯示科目選擇畫面
- 選擇科目後，會進入該科目的主選單
- 可以隨時點擊 Header 的「🔄 換科目」按鈕切換科目

### 題目管理
每個科目都有獨立的題目文件：
- `src/data/questions_science.js` - 自然科題目
- `src/data/questions_chinese.js` - 國語題目
- `src/data/questions_social.js` - 社會題目
- `src/data/questions_math.js` - 數學題目
- `src/data/questions_english.js` - 英文題目

### 數據存儲
- 每個科目的答題記錄獨立存儲
- 統計信息按科目分別計算
- 錯題列表按科目分別顯示

## ✏️ 如何添加或修改題目

### 1. 找到對應的題目文件

例如要修改國語題目，打開：
```
src/data/questions_chinese.js
```

### 2. 題目格式

每個題目遵循以下格式：

```javascript
{
  id: 1,                    // 題目 ID（必須唯一）
  category: '字詞',         // 分類名稱
  question: '題目內容',     // 題目文字
  options: [                // 選項陣列（4個選項）
    '選項 A',
    '選項 B',
    '選項 C',
    '選項 D'
  ],
  correctAnswer: 0,         // 正確答案索引（0-3）
  explanation: '解釋說明',  // 答案解釋
  funFact: '有趣小知識'     // 額外知識（可選）
}
```

### 3. 添加新題目

在 `QUESTIONS` 陣列中添加新的題目對象：

```javascript
export const QUESTIONS = [
  // ... 現有題目 ...
  {
    id: 6,  // 使用新的 ID
    category: '字詞',
    question: '新的題目內容？',
    options: ['選項 A', '選項 B', '選項 C', '選項 D'],
    correctAnswer: 0,
    explanation: '這是解釋',
    funFact: '有趣的小知識'
  }
]
```

### 4. 修改現有題目

找到要修改的題目，直接編輯對應的屬性：

```javascript
{
  id: 1,
  category: '字詞',
  question: '修改後的題目內容？',  // 修改這裡
  options: ['新的選項 A', '選項 B', '選項 C', '選項 D'],  // 修改選項
  correctAnswer: 1,  // 修改正確答案
  explanation: '修改後的解釋',
  funFact: '修改後的小知識'
}
```

### 5. 刪除題目

從 `QUESTIONS` 陣列中移除對應的題目對象即可。

### 6. 添加新分類

1. 在 `CATEGORIES` 對象中添加新分類：

```javascript
export const CATEGORIES = {
  VOCABULARY: '字詞',
  READING: '閱讀理解',
  NEW_CATEGORY: '新分類名稱'  // 添加新分類
}
```

2. 在題目中使用新分類：

```javascript
{
  id: 7,
  category: '新分類名稱',  // 使用新分類
  // ... 其他屬性 ...
}
```

## 📝 注意事項

1. **ID 必須唯一**：每個題目的 `id` 必須在該科目內唯一
2. **選項數量**：目前只支持 4 個選項的選擇題
3. **正確答案索引**：`correctAnswer` 必須是 0-3 之間的數字
4. **分類名稱**：分類名稱必須與 `CATEGORIES` 中的值一致
5. **保存後重新載入**：修改題目後，需要重新載入頁面才能看到效果

## 🔄 更新題目後的步驟

1. 修改對應的題目文件
2. 保存文件
3. 如果使用開發模式，Vite 會自動重新載入
4. 如果已部署，需要重新構建和部署

## 💡 提示

- 建議定期備份題目文件
- 可以為不同年級創建不同的題目文件
- 題目可以包含圖片（需要額外配置）
- 可以添加多媒體內容（需要額外配置）

## 📞 問題反饋

如果遇到問題或需要幫助，請聯繫開發者。

