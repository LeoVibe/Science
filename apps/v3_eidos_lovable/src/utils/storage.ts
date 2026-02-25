import { Grade, Subject, Semester, Publisher, SUBJECT_CODE, PUBLISHER_CODE } from '@/data/config';

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

export interface UserProfile {
  grade: Grade;
  semester: Semester;
  publisherBySubject: Partial<Record<Subject, Publisher>>;
  setupComplete: boolean;
  timestamp: number;
}

const PREF_KEY = 'sci_v2_user_preference';
const PROFILE_KEY = 'sci_v2_user_profile';

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

export function getPublisherForSubject(subject: Subject): Publisher {
  const profile = loadUserProfile();
  return profile?.publisherBySubject?.[subject] ?? '南一';
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
