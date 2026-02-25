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
  '康軒': 'kang_hsuan',
  '南一': 'nan_yi',
  '翰林': 'han_lin',
};

export const PUBLISHER_SHORT: Record<Publisher, string> = {
  '康軒': '康',
  '南一': '南',
  '翰林': '翰',
};

export function getSubjectsByGrade(grade: Grade): Subject[] {
  if (grade <= 2) return ['國語', '數學', '英語', '生活'];
  return ['國語', '數學', '英語', '自然', '社會'];
}

export const SUBJECT_ICONS: Record<Subject, string> = {
  '國語': '📖',
  '數學': '🔢',
  '英語': '🔤',
  '自然': '🔬',
  '社會': '🌍',
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
}

export interface Question extends RawQuestion {
  category: string;
  lesson: string;
  lessonTitle: string;
  lessonOrder: number;
  normalizedAnswer: number;
  options: string[];
}

export interface QuestionFile {
  meta: QuestionMeta;
  questions: RawQuestion[];
}

// === URL Routing Helpers ===

export const SUBJECT_URL_CODE: Record<Subject, string> = {
  '國語': 'chi', '數學': 'mat', '英語': 'eng', '自然': 'sci', '社會': 'soc', '生活': 'life',
};

export const URL_CODE_SUBJECT: Record<string, Subject> = {
  'chi': '國語', 'mat': '數學', 'eng': '英語', 'sci': '自然', 'soc': '社會', 'life': '生活',
};

export const PUBLISHER_URL_CODE: Record<Publisher, string> = {
  '康軒': 'knsh', '南一': 'nani', '翰林': 'hlm',
};

export const URL_CODE_PUBLISHER: Record<string, Publisher> = {
  'knsh': '康軒', 'nani': '南一', 'hlm': '翰林',
};

export function buildPath(grade: Grade, subject: Subject, semester: Semester, publisher: Publisher, view?: string): string {
  return `/g${grade}/${SUBJECT_URL_CODE[subject]}/s${semester}/${PUBLISHER_URL_CODE[publisher]}${view ? '/' + view : ''}`;
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
