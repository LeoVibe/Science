import { Grade, Subject, Semester, Publisher, SUBJECT_CODE, PUBLISHER_CODE } from '@/data/config';
import type { ApiProfile } from '@/data/api';
import { fetchUserProfile as apiFetchProfile, syncUserProfile as apiSyncProfile } from '@/data/api';

function getStorageKey(grade: Grade, subject: Subject, semester: Semester, publisher: Publisher): string {
  return `history_G${grade}_${SUBJECT_CODE[subject]}_S${semester}_${PUBLISHER_CODE[publisher]}`;
}

function getProgressKey(grade: Grade, subject: Subject, semester: Semester, publisher: Publisher): string {
  return `progress_G${grade}_${SUBJECT_CODE[subject]}_S${semester}_${PUBLISHER_CODE[publisher]}`;
}

export interface AnswerRecord {
  questionId: string;
  grade: Grade;
  subject: Subject;
  semester: Semester;
  publisher: Publisher;
  total: number;
  correct: number;
  wrong: number;
  lastAnswer: boolean;
  lastAnswerTime: number;
}

export function getAnswerHistory(grade: Grade, subject: Subject, semester: Semester, publisher: Publisher): Record<string, AnswerRecord> {
  try {
    const key = getStorageKey(grade, subject, semester, publisher);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : {};
  } catch { return {}; }
}

export function saveAnswerRecord(questionId: string, isCorrect: boolean, grade: Grade, subject: Subject, semester: Semester, publisher: Publisher): void {
  const history = getAnswerHistory(grade, subject, semester, publisher);
  const existing = history[questionId] || { questionId, grade, subject, semester, publisher, total: 0, correct: 0, wrong: 0, lastAnswer: false, lastAnswerTime: 0 };
  existing.total += 1;
  if (isCorrect) existing.correct += 1;
  else existing.wrong += 1;
  existing.lastAnswer = isCorrect;
  existing.lastAnswerTime = Date.now();
  history[questionId] = existing;
  localStorage.setItem(getStorageKey(grade, subject, semester, publisher), JSON.stringify(history));
}

export function getWrongQuestions(grade: Grade, subject: Subject, semester: Semester, publisher: Publisher): AnswerRecord[] {
  const history = getAnswerHistory(grade, subject, semester, publisher);
  return Object.values(history).filter(r => r.wrong > 0).sort((a, b) => b.wrong - a.wrong);
}

export function getStatistics(grade: Grade, subject: Subject, semester: Semester, publisher: Publisher) {
  const history = getAnswerHistory(grade, subject, semester, publisher);
  const records = Object.values(history);
  const totalAnswered = records.reduce((s, r) => s + r.total, 0);
  const totalCorrect = records.reduce((s, r) => s + r.correct, 0);
  const totalWrong = records.reduce((s, r) => s + r.wrong, 0);
  const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
  return { totalAnswered, totalCorrect, totalWrong, accuracy };
}

export interface PracticeRecord {
  id: string;
  timestamp: number;
  grade: Grade;
  subject: Subject;
  semester: Semester;
  publisher: Publisher;
  type: string;
  score: number;
  count: number;
  accuracy: number;
  duration: number;
}

const PRACTICE_KEY = 'sci_v2_all_practice_history';

export function getAllPracticeHistory(): PracticeRecord[] {
  try {
    const data = localStorage.getItem(PRACTICE_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

export function getPracticeHistory(grade: Grade, subject: Subject, semester: Semester, publisher: Publisher): PracticeRecord[] {
  return getAllPracticeHistory().filter(r =>
    r.grade === grade && r.subject === subject && r.semester === semester && r.publisher === publisher
  );
}

export function savePracticeRecord(record: Omit<PracticeRecord, 'id' | 'timestamp'>): void {
  const all = getAllPracticeHistory();
  all.unshift({ ...record, id: crypto.randomUUID(), timestamp: Date.now() });
  if (all.length > 200) all.length = 200;
  localStorage.setItem(PRACTICE_KEY, JSON.stringify(all));
}

export interface UserPreference {
  grade: Grade;
  subject: Subject;
  semester: Semester;
  publisher: Publisher;
  timestamp: number;
}

/** 答題後自動下一題的停留時間（毫秒），0 = 不自動 */
export const AUTO_ADVANCE_DELAY_DEFAULT_MS = 1500;

export interface UserProfile {
  grade: Grade;
  semester: Semester;
  /** 出版社偏好：改為 key 包含學期資訊，例如 'Math_S1': '南一' */
  publisherBySubject: Partial<Record<string, Publisher>>;
  setupComplete: boolean;
  /** 答題後停留多久自動下一題（毫秒），0 為不自動 */
  autoAdvanceDelayMs?: number;
  /** 是否開啟 A–D 快捷鍵答題 */
  shortcut_enabled?: boolean;
  /** 進階挑戰題目數量（預設 25） */
  maxQuizQuestions?: number;
  /** 深色/淺色 */
  theme?: string;
  timestamp: number;
}

const PREF_KEY = 'sci_v2_user_preference';
const PROFILE_KEY = 'sci_v2_user_profile';
const USER_ID_KEY = 'eidos_user_id';

export function loadUserPreference(): UserPreference | null {
  try {
    const data = localStorage.getItem(PREF_KEY);
    return data ? JSON.parse(data) : null;
  } catch { return null; }
}

export function saveUserPreference(grade: Grade, subject: Subject, semester: Semester, publisher: Publisher): void {
  localStorage.setItem(PREF_KEY, JSON.stringify({ grade, subject, semester, publisher, timestamp: Date.now() }));
}

export function loadUserProfile(): UserProfile | null {
  try {
    const data = localStorage.getItem(PROFILE_KEY);
    return data ? JSON.parse(data) : null;
  } catch { return null; }
}

export function saveUserProfile(profile: Omit<UserProfile, 'timestamp'>): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify({ ...profile, timestamp: Date.now() }));
}

/** 取得或建立匿名使用者 ID（用於 API profile 同步） */
export function getOrCreateUserId(): string {
  let id = localStorage.getItem(USER_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(USER_ID_KEY, id);
  }
  return id;
}

/** 從 API 拉取 profile 並合併進 localStorage（進入時優先呼叫） */
export async function fetchAndMergeUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const api = await apiFetchProfile(userId);
    if (!api?.publisher_preferences) return null;
    const prefs = api.publisher_preferences as { grade?: number; semester?: number; publisherBySubject?: Record<string, string> };
    const grade = Math.min(6, Math.max(1, prefs.grade ?? 3)) as Grade;
    const semester = ((prefs.semester === 1 || prefs.semester === 2) ? prefs.semester : 1) as Semester;
    const publisherBySubject = (prefs.publisherBySubject ?? {}) as Partial<Record<Subject, Publisher>>;
    // 重要：不再僅依據是否有 grade 就自動設為 setupComplete
    // 而是保留既有的本地狀態，或是明確遵循 API 的設定（如果有的話）
    const localProfile = loadUserProfile();
    const setupComplete = localProfile?.setupComplete ?? false;
    const profile: UserProfile = {
      grade,
      semester,
      publisherBySubject,
      setupComplete,
      autoAdvanceDelayMs: api.quiz_next_delay ?? 1500,
      shortcut_enabled: api.shortcut_enabled ?? true,
      theme: api.theme ?? 'light',
      timestamp: Date.now(),
    };
    saveUserProfile(profile);
    return profile;
  } catch {
    return null;
  }
}

/** 將目前 localStorage 的 profile 同步到 API */
export async function syncUserProfileToApi(userId: string): Promise<boolean> {
  const profile = loadUserProfile();
  if (!profile) return false;
  const publisherBySubject: Record<string, string> = {};
  Object.entries(profile.publisherBySubject ?? {}).forEach(([k, v]) => {
    publisherBySubject[k] = v;
  });
  const result = await apiSyncProfile(userId, {
    grade: profile.grade,
    semester: profile.semester,
    publisherBySubject,
    autoAdvanceDelayMs: profile.autoAdvanceDelayMs,
    shortcut_enabled: profile.shortcut_enabled,
    theme: profile.theme,
  });
  return result != null;
}

export function getAutoAdvanceDelayMs(): number {
  const p = loadUserProfile();
  const v = p?.autoAdvanceDelayMs;
  if (v === 0) return 0;
  if (typeof v === 'number' && v > 0) return v;
  return AUTO_ADVANCE_DELAY_DEFAULT_MS;
}

export function getPublisherForSubject(subject: Subject): Publisher {
  const profile = loadUserProfile();
  if (!profile) return '南一';
  const semester = profile.semester || 1;
  const key = `${subject}_S${semester}`;
  return (profile.publisherBySubject?.[key as any] as Publisher) || '南一';
}

export function isShortcutEnabled(): boolean {
  const profile = loadUserProfile();
  return profile?.shortcut_enabled !== false;
}

/** 進階挑戰題目數量（來自 User Profile，預設 25） */
export function getMaxQuizQuestions(): number {
  const profile = loadUserProfile();
  const v = profile?.maxQuizQuestions;
  if (typeof v === 'number' && v >= 10 && v <= 50) return v;
  return 25;
}

export interface QuizProgress {
  questions: unknown[];
  currentIndex: number;
  answeredQuestions: unknown[];
  score: number;
  type: string;
  startTime: number;
  timestamp: number;
}

export function loadQuizProgress(grade: Grade, subject: Subject, semester: Semester, publisher: Publisher): QuizProgress | null {
  try {
    const key = getProgressKey(grade, subject, semester, publisher);
    const data = localStorage.getItem(key);
    if (!data) return null;
    const progress: QuizProgress = JSON.parse(data);
    // Expire after 24h
    if (Date.now() - progress.timestamp > 24 * 60 * 60 * 1000) {
      localStorage.removeItem(key);
      return null;
    }
    return progress;
  } catch { return null; }
}

export function saveQuizProgress(grade: Grade, subject: Subject, semester: Semester, publisher: Publisher, progress: Omit<QuizProgress, 'timestamp'>): void {
  const key = getProgressKey(grade, subject, semester, publisher);
  localStorage.setItem(key, JSON.stringify({ ...progress, timestamp: Date.now() }));
}

export function clearQuizProgress(grade: Grade, subject: Subject, semester: Semester, publisher: Publisher): void {
  localStorage.removeItem(getProgressKey(grade, subject, semester, publisher));
}

/** 清除當前科目/出版社的答題歷程與練習進度；並從 sci_v2_all_practice_history 移除對應紀錄 */
export function clearSubjectHistory(grade: Grade, subject: Subject, semester: Semester, publisher: Publisher): void {
  const historyKey = getStorageKey(grade, subject, semester, publisher);
  const progressKey = getProgressKey(grade, subject, semester, publisher);
  localStorage.removeItem(historyKey);
  localStorage.removeItem(progressKey);
  const all = getAllPracticeHistory().filter(
    r => !(r.grade === grade && r.subject === subject && r.semester === semester && r.publisher === publisher)
  );
  localStorage.setItem(PRACTICE_KEY, JSON.stringify(all));
}

/** 刪除所有 history_*、progress_* 與 sci_v2_all_practice_history，可選是否清除 user/profile 偏好 */
export function clearAllHistory(includeProfileData: boolean = false): void {
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith('history_') || key.startsWith('progress_'))) keysToRemove.push(key);
  }
  keysToRemove.forEach(k => localStorage.removeItem(k));
  localStorage.removeItem(PRACTICE_KEY);
  if (includeProfileData) {
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem(PREF_KEY);
    localStorage.removeItem(PROFILE_KEY);
  }
}
