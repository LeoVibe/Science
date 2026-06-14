// === App Configuration ===

export const APP_CONFIG = {
  grades: [1, 2, 3, 4, 5, 6] as const,
  semesters: [1, 2] as const,
  publishers: ['康軒', '南一', '翰林'] as const,
};

export type Grade = 1 | 2 | 3 | 4 | 5 | 6;
export type Semester = 1 | 2;
export type Publisher = '康軒' | '南一' | '翰林';
export type Subject = '國語' | '數學' | '英語' | '自然' | '社會' | '生活';

export const SEMESTER_NAMES: Record<Semester, string> = {
  1: '上學期',
  2: '下學期',
};

export const PUBLISHER_META_MAP: Record<Publisher, string> = {
  '康軒': 'KangHsuan',
  '南一': 'NanYi',
  '翰林': 'HanLin',
};

export const PUBLISHER_SHORT: Record<Publisher, string> = {
  '康軒': '康',
  '南一': '南',
  '翰林': '翰',
};

/**
 * 出版社主題色（全站唯一來源）
 * 色系方向：低飽和度、莫蘭迪風，適合長時間閱讀的教育產品
 * 康軒 → 寧靜灰藍  南一 → 柔和粉玫瑰  翰林 → 清新湖水綠
 */
export const PUBLISHER_THEME_COLORS: Record<Publisher, string> = {
  '康軒': 'hsl(200 40% 62%)',
  '南一': 'hsl(340 43% 63%)',
  '翰林': 'hsl(168 35% 52%)',
};

/**
 * 暫不上架的科目（數學、英語品質未達標）。
 * 全站選單與路由的單一真相：移除此清單中的科目即同時恢復選單入口與深連結。
 */
export const DISABLED_SUBJECTS: readonly Subject[] = ['數學', '英語'];

/** 該科目目前是否開放（選單顯示 + 路由可進入） */
export function isSubjectEnabled(subject: Subject): boolean {
  return !DISABLED_SUBJECTS.includes(subject);
}

export function getSubjectsByGrade(grade: Grade): Subject[] {
  const all: Subject[] = grade <= 2
    ? ['國語', '數學', '英語', '生活']
    : ['國語', '數學', '英語', '自然', '社會'];
  return all.filter(isSubjectEnabled);
}

export const SUBJECT_ICONS: Record<Subject, string> = {
  '國語': '📖',
  '數學': '➕',
  '英語': '🔤',
  '自然': '🔬',
  '社會': '🏛️',
  '生活': '🌈',
};

export const SUBJECT_SHORT: Record<Subject, string> = {
  '國語': '國',
  '數學': '數',
  '英語': '英',
  '自然': '自',
  '社會': '社',
  '生活': '生',
};

export type SubjectTheme = 'chinese' | 'math' | 'english' | 'science' | 'social' | 'life';

export const SUBJECT_THEME_MAP: Record<Subject, SubjectTheme> = {
  '國語': 'chinese',
  '數學': 'math',
  '英語': 'english',
  '自然': 'science',
  '社會': 'social',
  '生活': 'life',
};

export const SUBJECT_CODE: Record<Subject, string> = {
  '國語': 'CHI',
  '數學': 'MAT',
  '英語': 'ENG',
  '自然': 'SCI',
  '社會': 'SOC',
  '生活': 'LIFE',
};

export const PUBLISHER_CODE: Record<Publisher, string> = {
  '康軒': 'KNSH',
  '南一': 'NANI',
  '翰林': 'HLM',
};

// For file paths: G3-G6 英語 uses directory name 英文
export function getSubjectForPath(grade: Grade, subject: Subject): string {
  if (subject === '英語' && grade >= 3) return '英文';
  return subject;
}

export interface QuestionMeta {
  grade: string;
  semester: string;
  subject: string;
  publisher: string;
  lesson: string;
  order?: number;
  title: string;
}

export interface RawQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'fill_in_the_blank';
  question: string;
  options?: string[];
  answer: string | number;
  explanation?: string;
  /** 情境描述（L4 題庫） */
  scenario?: string;
  /** 迷思診斷（選錯時顯示） */
  commonMisconception?: string;
  /** 控制題目前台可見度（false = 下架） */
  is_active?: boolean;
  /** 品質門檻：盲測 Match + CQI ≥ 6.5 才為 true；false = 品質未通過，禁止上線 */
  is_publishable?: boolean;
  cqi_score?: number;
  quality_level?: string;
}

export interface Question extends RawQuestion {
  category: string;
  lesson: string;
  lessonTitle: string;
  lessonOrder: number;
  normalizedAnswer: number;
  options: string[];
  /** 題庫檔案來源路徑 (供後台編輯使用) */
  _sourceFile?: string;
}

export interface QuestionFile {
  meta: QuestionMeta;
  questions: RawQuestion[];
}

// === URL Routing Helpers ===

export const SUBJECT_URL_CODE: Record<Subject, string> = {
  '國語': 'chi', '數學': 'mat', '英語': 'eng', '自然': 'sci', '社會': 'SocialStudies', '生活': 'life',
};

export const URL_CODE_SUBJECT: Record<string, Subject> = {
  'chi': '國語', 'mat': '數學', 'eng': '英語', 'sci': '自然', 'SocialStudies': '社會', 'soc': '社會', 'life': '生活',
};

export const PUBLISHER_URL_CODE: Record<Publisher, string> = {
  '康軒': 'knsh', '南一': 'nani', '翰林': 'hlm',
};

export const URL_CODE_PUBLISHER: Record<string, Publisher> = {
  'knsh': '康軒', 'nani': '南一', 'hlm': '翰林',
};

/** 題庫靜態資源路徑用（與 question/platform 目錄一致） */
export const SUBJECT_PLATFORM_PATH: Record<Subject, string> = {
  '國語': 'Chinese',
  '數學': 'Math',
  '英語': 'English',
  '自然': 'Science',
  '社會': 'SocialStudies',
  '生活': 'Life',
};

export const PUBLISHER_PLATFORM_PATH: Record<Publisher, string> = {
  '康軒': 'KangHsuan',
  '南一': 'NanYi',
  '翰林': 'HanLin',
};

/**
 * 建構主路徑。view 為 about 時可帶 subTab（library | features | changelog），
 * 為 stats 時可帶 subTab（wrong）。與路由一致：子分頁用 path，不用 query。
 */
export function buildPath(
  grade: Grade,
  subject: Subject,
  semester: Semester,
  publisher: Publisher,
  view?: string,
  subTab?: string
): string {
  const base = `/g${grade}/${SUBJECT_URL_CODE[subject]}/s${semester}/${PUBLISHER_URL_CODE[publisher]}`;
  if (!view) return base;
  const viewPath = base + '/' + view;
  if (!subTab) return viewPath;
  if (view === 'about' && subTab === 'about') return viewPath;
  if (view === 'stats' && subTab === 'stats') return viewPath;
  return viewPath + '/' + subTab;
}

export function parseGradeParam(param: string): Grade | null {
  const match = param.match(/^g(\d)$/);
  if (!match) return null;
  const n = parseInt(match[1]);
  if (n >= 1 && n <= 6) return n as Grade;
  return null;
}

export function parseSemesterParam(param: string): Semester | null {
  const match = param.match(/^s(\d)$/);
  if (!match) return null;
  const n = parseInt(match[1]);
  if (n === 1 || n === 2) return n as Semester;
  return null;
}
