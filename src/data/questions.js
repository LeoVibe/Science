// 統一的題目數據入口
// 根據科目載入對應的題目

export function getQuestionsBySubject(subject) {
  switch (subject) {
    case 'science':
      return import('./questions_science.js').then(module => module)
    case 'chinese':
      return import('./questions_chinese.js').then(module => module)
    case 'social':
      return import('./questions_social.js').then(module => module)
    case 'math':
      return import('./questions_math.js').then(module => module)
    case 'english':
      return import('./questions_english.js').then(module => module)
    default:
      return import('./questions_science.js').then(module => module)
  }
}

// 同步獲取題目（用於需要立即獲取的情況）
export async function getQuestionsSync(subject) {
  const module = await getQuestionsBySubject(subject)
  return module
}

// 科目名稱對應
export const SUBJECT_NAMES = {
  science: '自然',
  chinese: '國語',
  social: '社會',
  math: '數學',
  english: '英文'
}

// 科目圖標對應
export const SUBJECT_ICONS = {
  science: '🌱',
  chinese: '📖',
  social: '🌍',
  math: '🔢',
  english: '🔤'
}
