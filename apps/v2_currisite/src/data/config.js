// 全局配置：年级、科目、学期、出版社
export const APP_CONFIG = {
  grades: [1, 2, 3, 4, 5, 6],
  subjects: ['國語', '數學', '自然', '社會', '英語', '生活'], // 包含所有可能的科目
  semesters: [1, 2], // 学期：1=上学期，2=下学期
  publishers: ['康軒', '南一', '翰林']
}

// 根据年级获取可用科目
export const SUBJECT_CONFIG = {
  // 低年级（1-2年级）
  low: ['國語', '數學', '英語', '生活'],
  // 中高年级（3-6年级）
  high: ['國語', '數學', '英語', '自然', '社會']
}

/**
 * 根据年级获取可用科目列表
 * @param {number} grade - 年级 (1-6)
 * @returns {string[]} 可用科目列表
 */
export function getSubjectsByGrade(grade) {
  if (grade <= 2) {
    return SUBJECT_CONFIG.low
  } else {
    return SUBJECT_CONFIG.high
  }
}

// 科目映射（用于内部标识）
export const SUBJECT_MAP = {
  '國語': 'Chinese',
  '數學': 'Math',
  '自然': 'Science',
  '社會': 'Social',
  '英語': 'English',
  '生活': 'Life'
}

// 科目反向映射
export const SUBJECT_REVERSE_MAP = {
  'Chinese': '國語',
  'Math': '數學',
  'Science': '自然',
  'Social': '社會',
  'English': '英語',
  'Life': '生活'
}

// 出版社映射（用于文件名）- 使用新缩写（舊格式，向後兼容）
export const PUBLISHER_MAP = {
  '康軒': 'knsh',
  '南一': 'nani',
  '翰林': 'hlm'
}

// 出版社反向映射（舊格式）
export const PUBLISHER_REVERSE_MAP = {
  'knsh': '康軒',
  'nani': '南一',
  'hlm': '翰林'
}

// 出版社映射（新架構：JSON meta 中的格式）
export const PUBLISHER_META_MAP = {
  '康軒': 'kang_hsuan',
  '南一': 'nan_yi',
  '翰林': 'han_lin'
}

// 出版社反向映射（新架構）
export const PUBLISHER_META_REVERSE_MAP = {
  'kang_hsuan': '康軒',
  'nan_yi': '南一',
  'han_lin': '翰林'
}

// 学期显示名称
export const SEMESTER_NAMES = {
  1: '上學期',
  2: '下學期'
}

// 科目图标（英文與英語同為 G3-G6 / G1-G2 用，目錄名為「英文」時亦可用）
export const SUBJECT_ICONS = {
  '國語': '📖',
  '數學': '🔢',
  '自然': '🌱',
  '社會': '🌍',
  '英語': '🔤',
  '英文': '🔤',
  '生活': '🎨'
}

// 科目颜色主题（更柔和的马卡龙色调，无黄色，搭配深色文字）
export const SUBJECT_COLORS = {
  '國語': {
    primary: '#ff9a9e',
    secondary: '#fecfef',
    gradient: 'linear-gradient(135deg, #fef7f7, #fef0f0)',
    textColor: '#8b4a4d'
  },
  '數學': {
    primary: '#a8edea',
    secondary: '#fed6e3',
    gradient: 'linear-gradient(135deg, #f5f9f9, #f0f5f5)',
    textColor: '#4a6b6a'
  },
  '自然': {
    primary: '#c8e6c9', // 更柔和的浅绿色
    secondary: '#a5d6a7', // 更柔和的绿色
    gradient: 'linear-gradient(135deg, #f1f8f4, #e8f5e9)', // 更柔和的绿色渐变
    textColor: '#4a7c59' // 柔和的深绿色文字
  },
  '社會': {
    primary: '#b3d9f2', // 更柔和的浅蓝色
    secondary: '#90caf9', // 更柔和的蓝色
    gradient: 'linear-gradient(135deg, #f0f7fc, #e3f2fd)', // 更柔和的蓝色渐变
    textColor: '#4a6fa5' // 柔和的深蓝色文字
  },
  '英語': {
    primary: '#ffecd2',
    secondary: '#fcb69f',
    gradient: 'linear-gradient(135deg, #fefaf7, #fef7f2)',
    textColor: '#8b6a4a'
  },
  '英文': {
    primary: '#ffecd2',
    secondary: '#fcb69f',
    gradient: 'linear-gradient(135deg, #fefaf7, #fef7f2)',
    textColor: '#8b6a4a'
  },
  '生活': {
    primary: '#ffb3ba',
    secondary: '#ffdfba',
    gradient: 'linear-gradient(135deg, #fff5f5, #fff0e6)',
    textColor: '#8b5a3c'
  }
}

// 出版社图标
export const PUBLISHER_ICONS = {
  '康軒': '📚',
  '南一': '📖',
  '翰林': '📘'
}

// 根据年级和科目获取可用的出版社（用于动态显示）
export const getAvailablePublishers = (grade, subject) => {
  // 默认所有科目都支持所有出版社
  // 可以根据实际需求定制
  return APP_CONFIG.publishers
}

// 获取科目简称
export const getSubjectShortName = (subject) => {
  const shortNames = {
    '國語': '國',
    '數學': '數',
    '自然': '自',
    '社會': '社',
    '英語': '英',
    '英文': '英',
    '生活': '生'
  }
  return shortNames[subject] || subject
}

// 获取出版社简称
export const getPublisherShortName = (publisher) => {
  const shortNames = {
    '康軒': '康',
    '南一': '南',
    '翰林': '翰'
  }
  return shortNames[publisher] || publisher
}
