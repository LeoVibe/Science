import type { Grade, Semester, Subject, Publisher } from '@/data/config';
import libraryStatsJson from '@/data/libraryStats.json';

type PubRow = { units?: number; questions?: number; publishedQuestions?: number };

const publisherStats = (libraryStatsJson as { publisherStats?: Record<string, PubRow> }).publisherStats ?? {};

/** 與 libraryStats.publisherStats 鍵名一致 */
export function publisherStatsKey(
  grade: Grade,
  semester: Semester,
  subject: Subject,
  publisher: Publisher
): string {
  return `G${grade}_S${semester}_${subject}_${publisher}`;
}

/**
 * 以「可推出題數」（publishedQuestions，無則 questions）判斷是否可進入複習。
 * 若有列且上架數為 0、但 units 大於 0（僅結構／未達上架門檻），視為未上架（導覽反灰）。
 * 無列則不攔截（維持與舊版相容，避免 stats 漏鍵誤殺）。
 */
export function hasPublishedLibraryUnits(
  grade: Grade,
  semester: Semester,
  subject: Subject,
  publisher: Publisher
): boolean {
  const key = publisherStatsKey(grade, semester, subject, publisher);
  const row = publisherStats[key];
  if (row === undefined) return true;
  const shelf =
    typeof row.publishedQuestions === 'number'
      ? row.publishedQuestions
      : typeof row.questions === 'number'
        ? row.questions
        : 0;
  if (shelf > 0) return true;
  const u = row.units;
  if (typeof u === 'number' && u > 0) return false;
  return true;
}
