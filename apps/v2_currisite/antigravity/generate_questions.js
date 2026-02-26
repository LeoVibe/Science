
const fs = require('fs');
const path = require('path');

// 設定目標根目錄
const TARGET_DIR = '/Users/s389080/Documents/文件 - NM389080/miaw/antigravity/questions/library';

// 設定參數
const GRADES = [1, 2, 3, 4, 5, 6];
const SEMESTERS = [1, 2];
const PUBLISHERS = ['knsh', 'nani', 'hlm'];

// 科目設定
const SUBJECTS_LOW = ['Chinese', 'Math', 'English', 'Life']; // 1-2年級
const SUBJECTS_HIGH = ['Chinese', 'Math', 'English', 'Science', 'Social']; // 3-6年級

// 科目中文名稱對照 (用於註解)
const SUBJECT_NAMES = {
  'Chinese': '國語',
  'Math': '數學',
  'English': '英語',
  'Life': '生活',
  'Science': '自然',
  'Social': '社會'
};

// 出版社中文名稱對照
const PUBLISHER_NAMES = {
  'knsh': '康軒',
  'nani': '南一',
  'hlm': '翰林'
};

// 產生檔案內容的函數
function generateFileContent(grade, subject, semester, publisher) {
  const subjectName = SUBJECT_NAMES[subject];
  const publisherName = PUBLISHER_NAMES[publisher];
  const semesterName = semester === 1 ? '上學期' : '下學期';
  
  // 根據科目產生不同的 Categories
  let categories = {};
  if (subject === 'Chinese') {
    categories = {
      VOCABULARY: '字詞',
      READING: '閱讀理解', 
      GRAMMAR: '語法',
      PHONETICS: '字音字形',
      IDIOMS: '成語運用',
      RHETORIC: '修辭',
      PUNCTUATION: '標點符號',
      CLASSICS: '國學常識'
    };
  } else if (subject === 'Math') {
    categories = {
      CALCULATION: '計算',
      GEOMETRY: '幾何',
      APPLICATION: '應用題',
      CONCEPTS: '數念'
    };
  } else if (subject === 'English') {
    categories = {
      VOCABULARY: '單字',
      GRAMMAR: '文法',
      READING: '閱讀',
      CONVERSATION: '會話'
    };
  } else {
    categories = {
      KNOWLEDGE: '基礎知識',
      APPLICATION: '生活應用',
      CONCEPT: '重要概念'
    };
  }

  const categoryString = Object.entries(categories)
    .map(([key, value]) => `  ${key}: '${value}'`)
    .join(',\n');

  return `// ${grade}年級 ${subjectName} ${semesterName} (${publisherName}) 題庫
// 這是自動產生的模板檔案

export const CATEGORIES = {
${categoryString}
}

export const QUESTION_TYPES = {
  MULTIPLE_CHOICE: '選擇題',
  TRUE_FALSE: '是非題',
  FILL_BLANK: '填空題'
}

// 題目數據模板
export const QUESTIONS = [
  {
    id: 1,
    category: '${Object.values(categories)[0]}',
    question: '這是一個範例題目，請修改為實際內容。',
    options: ['選項A', '選項B', '選項C', '選項D'],
    correctAnswer: 0,
    explanation: '這是範例解析',
    funFact: '這是範例豆知識'
  }
]
`;
}

// 確保目錄存在
function ensureDirectoryExistence(filePath) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

// 主執行邏輯
console.log('開始建立題庫結構...');

GRADES.forEach(grade => {
  const subjects = grade <= 2 ? SUBJECTS_LOW : SUBJECTS_HIGH;
  
  subjects.forEach(subject => {
    // 建立目錄結構: G{grade}/{Subject}
    const dirPath = path.join(TARGET_DIR, `G${grade}`, subject);
    
    // 確保目錄存在 (遞迴建立)
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    SEMESTERS.forEach(semester => {
      PUBLISHERS.forEach(publisher => {
        // 檔案名稱: s{semester}_{publisher}.js
        const fileName = `s${semester}_${publisher}.js`;
        const filePath = path.join(dirPath, fileName);
        
        const content = generateFileContent(grade, subject, semester, publisher);
        
        fs.writeFileSync(filePath, content);
        console.log(`Created: ${filePath}`);
      });
    });
  });
});

console.log('所有題庫檔案建立完成！');
