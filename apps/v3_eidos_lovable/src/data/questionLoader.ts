import { Grade, Subject, Semester, Publisher, Question, QuestionFile, PUBLISHER_META_MAP, SUBJECT_CODE, PUBLISHER_CODE, getSubjectForPath } from './config';

function normalizeAnswer(q: { type: string; answer: string | number; options?: string[] }): number {
  if (q.type === 'true_false') {
    if (String(q.answer) === 'True' || q.answer === 0) return 0;
    return 1;
  }
  if (typeof q.answer === 'number') return q.answer;
  const str = String(q.answer).trim();
  const letterIndex = 'ABCD'.indexOf(str.toUpperCase());
  if (letterIndex >= 0) return letterIndex;
  if (q.options) {
    const idx = q.options.findIndex(o => o === str);
    if (idx >= 0) return idx;
  }
  const num = parseInt(str);
  if (!isNaN(num)) return num;
  return 0;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (const char of line) {
    if (char === '"') { inQuotes = !inQuotes; }
    else if (char === ',' && !inQuotes) { result.push(current.trim()); current = ''; }
    else { current += char; }
  }
  result.push(current.trim());
  return result;
}

function loadQuestionsFromCSV(
  csvText: string, grade: Grade, subject: Subject, semester: Semester
): Question[] {
  const lines = csvText.split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];

  const allQuestions: Question[] = [];
  const lessonOrderMap: Record<string, number> = {};
  let orderCounter = 0;

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length < 8) continue;

    const lessonRaw = cols[0];
    const questionText = cols[2];
    const options = [cols[3], cols[4], cols[5], cols[6]];
    const answer = cols[7];
    const explanation = cols[8] || '';

    const lessonMatch = lessonRaw.match(/^(L\d+)\s+(.+)$/);
    if (!lessonMatch) continue;

    const lesson = lessonMatch[1];
    const title = lessonMatch[2];

    if (!(lesson in lessonOrderMap)) {
      lessonOrderMap[lesson] = ++orderCounter;
    }

    const id = `g${grade}_${SUBJECT_CODE[subject].toLowerCase()}_s${semester}_${lesson.toLowerCase()}_${i}`;

    allQuestions.push({
      id,
      type: 'multiple_choice',
      question: questionText,
      options,
      answer,
      category: title,
      lesson,
      lessonTitle: title,
      lessonOrder: lessonOrderMap[lesson],
      normalizedAnswer: normalizeAnswer({ type: 'multiple_choice', answer, options }),
    });
  }

  return allQuestions;
}

export interface LoadedQuestions {
  questions: Question[];
  getAllCategories: () => string[];
  getQuestionsByCategory: (cat: string) => Question[];
}

export async function loadQuestions(
  grade: Grade, subject: Subject, semester: Semester, publisher: Publisher
): Promise<LoadedQuestions> {
  const empty: LoadedQuestions = {
    questions: [],
    getAllCategories: () => [],
    getQuestionsByCategory: () => [],
  };

  try {
    const subjectDir = getSubjectForPath(grade, subject);
    const basePath = `/questions/platform/G${grade}/${subjectDir}/S${semester}/${publisher}`;
    const manifestRes = await fetch(`${basePath}/manifest.json`);
    if (!manifestRes.ok) return empty;

    const manifest = await manifestRes.json();

    let allQuestions: Question[] = [];

    // CSV-based loading
    if (manifest.csv) {
      const csvRes = await fetch(`${basePath}/${manifest.csv}`);
      if (!csvRes.ok) return empty;
      const csvText = await csvRes.text();
      allQuestions = loadQuestionsFromCSV(csvText, grade, subject, semester);
    }
    // JSON file-based loading
    else if (manifest.files && Array.isArray(manifest.files)) {
      const publisherCode = PUBLISHER_META_MAP[publisher];

      for (const fileName of manifest.files) {
        try {
          const fileRes = await fetch(`${basePath}/${fileName}`);
          if (!fileRes.ok) continue;
          const data: QuestionFile = await fileRes.json();
          if (!data.meta || !data.questions) continue;

          const m = data.meta;
          if (m.publisher && m.publisher !== publisherCode && m.publisher !== publisher) continue;

          for (const q of data.questions) {
            const options = q.options || (q.type === 'true_false' ? ['是', '否'] : []);
            allQuestions.push({
              ...q,
              options,
              category: m.title || m.lesson,
              lesson: m.lesson,
              lessonTitle: m.title,
              lessonOrder: m.order ?? 0,
              normalizedAnswer: normalizeAnswer({ ...q, options }),
            });
          }
        } catch {
          continue;
        }
      }
    }

    allQuestions.sort((a, b) => a.lessonOrder - b.lessonOrder);

    return {
      questions: allQuestions,
      getAllCategories: () => [...new Set(allQuestions.map(q => q.category))],
      getQuestionsByCategory: (cat: string) => allQuestions.filter(q => q.category === cat),
    };
  } catch {
    return empty;
  }
}
