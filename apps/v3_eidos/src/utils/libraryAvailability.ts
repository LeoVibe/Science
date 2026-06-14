import type { Grade, Semester, Subject, Publisher } from '@/data/config';
import libraryStatsJson from '@/data/libraryStats.json';

type PubRow = { units?: number; questions?: number; publishedQuestions?: number; quality?: string };

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

/** 該題庫的品質標籤（QL1–QL4），無資料回 undefined */
export function getLibraryQuality(
  grade: Grade,
  semester: Semester,
  subject: Subject,
  publisher: Publisher
): string | undefined {
  return publisherStats[publisherStatsKey(grade, semester, subject, publisher)]?.quality;
}

/**
 * 是否為 beta 題庫（品質未達 QL4：通過盲測精修的等級）。
 * QL3 以下或查無資料皆視為 beta，前台需標示「尚未嚴謹測試」。
 */
export function isBetaLibrary(
  grade: Grade,
  semester: Semester,
  subject: Subject,
  publisher: Publisher
): boolean {
  return getLibraryQuality(grade, semester, subject, publisher) !== 'QL4';
}
