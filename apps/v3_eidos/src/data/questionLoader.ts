import { Grade, Subject, Semester, Publisher, Question, PUBLISHER_META_MAP, SUBJECT_CODE, SUBJECT_PLATFORM_PATH, PUBLISHER_PLATFORM_PATH } from './config';
import { withBase } from '@/utils/basePath';

/** 題庫 manifest 內單元/課的結構（支援 units / items / manifest 三種格式） */
interface ManifestUnitLike {
  id?: string;
  order?: number;
  title: string;
  file: string;
}

/** 原始題目 JSON 單題（AG 格式 answer_index 或 L4 correctAnswer） */
interface RawQuestionLike {
  id?: string;
  question?: string;
  options?: string[];
  answer_index?: number;
  correctAnswer?: number | string;
  answer?: number | string;
  explanation?: string;
  scenario?: string;
  commonMisconception?: string;
  type?: string;
  concept?: string;
  is_active?: boolean;
  cqi_score?: number;
  quality_level?: string;
}

export type QuestionLoadStatus = 'success' | 'empty' | 'error';

function normalizeAnswer(q: { type: string; answer: string | number; options?: string[] }): number {
  if (q.type === 'true_false') {
    if (String(q.answer) === 'True' || q.answer === 0) return 0;
    return 1;
  }
  if (typeof q.answer === 'number') {
    if (q.options && (q.answer < 0 || q.answer >= q.options.length)) {
      console.warn(`[questionLoader] answer_index out of bounds: ${q.answer}, options=${q.options.length}`);
      return 0;
    }
    return q.answer;
  }
  const str = String(q.answer).trim();
  const letterIndex = 'ABCD'.indexOf(str.toUpperCase());
  if (letterIndex >= 0) return letterIndex;
  if (q.options) {
    const idx = q.options.findIndex(o => o === str);
    if (idx >= 0) return idx;
  }
  const num = parseInt(str);
  if (!isNaN(num)) {
    if (q.options && (num < 0 || num >= q.options.length)) {
      console.warn(`[questionLoader] parsed answer out of bounds: ${num}, options=${q.options.length}`);
      return 0;
    }
    return num;
  }
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
  status: QuestionLoadStatus;
  questions: Question[];
  getAllCategories: () => string[];
  getQuestionsByCategory: (cat: string) => Question[];
  manifest?: Record<string, unknown> | null;
  errorMessage?: string;
}

export async function loadQuestions(
  grade: Grade, subject: Subject, semester: Semester, publisher: Publisher,
  manifestOnly: boolean = false
): Promise<LoadedQuestions> {
  const makeResult = (status: QuestionLoadStatus, overrides: Partial<LoadedQuestions> = {}): LoadedQuestions => ({
    status,
    questions: [],
    getAllCategories: () => [],
    getQuestionsByCategory: () => [],
    manifest: null,
    ...overrides,
  });

  try {
    // 題庫靜態資源統一路徑，需帶上 Vite BASE_URL（GitHub Pages 子路徑部署）
    const basePath = withBase(`question/platform/G${grade}/${SUBJECT_PLATFORM_PATH[subject]}/S${semester}/${PUBLISHER_PLATFORM_PATH[publisher]}`);
    const manifestRes = await fetch(`${basePath}/manifest.json`);
    if (!manifestRes.ok) {
      return makeResult('error', { errorMessage: `Manifest 載入失敗 (${manifestRes.status})` });
    }

    const manifest = await manifestRes.json();

    if (manifestOnly) {
      const items = Array.isArray(manifest.items) ? (manifest.items as ManifestUnitLike[]) : [];
      const categories = items.map((it) => it.title ?? '').filter(Boolean);
      return {
        status: 'success',
        questions: [],
        getAllCategories: () => categories,
        getQuestionsByCategory: () => [],
        manifest: manifest as Record<string, unknown>,
      };
    }

    let allQuestions: Question[] = [];

    if (manifest.csv) {
      const csvRes = await fetch(`${basePath}/${manifest.csv}`);
      if (!csvRes.ok) return makeResult('error', { errorMessage: `CSV 載入失敗 (${csvRes.status})` });
      const csvText = await csvRes.text();
      allQuestions = loadQuestionsFromCSV(csvText, grade, subject, semester);
    } else {
      let unitList: ManifestUnitLike[] = [];
      let fileList: string[] = [];

      const rawUnits = Array.isArray(manifest.items)
        ? (manifest.items as ManifestUnitLike[])
        : Array.isArray(manifest.units)
          ? (manifest.units as ManifestUnitLike[])
          : Array.isArray(manifest.manifest)
            ? (manifest.manifest as ManifestUnitLike[])
            : [];

      if (rawUnits.length > 0) {
        const items = rawUnits;
        unitList = items.map((it, i) => ({
          id: it.id,
          order: it.order ?? i + 1,
          title: it.title,
          file: it.file ?? (it as ManifestUnitLike & { path?: string }).path ?? ''
        }));
        fileList = unitList.map((u) => u.file);
      }

      const publisherCode = PUBLISHER_META_MAP[publisher];
      const fetchPromises = fileList.map(async (fileName, uIdx) => {
        if (!fileName) return [];
        const unitMeta = unitList[uIdx];
        const category = unitMeta?.title ?? '';
        const lesson = unitMeta?.id ?? `U${uIdx + 1}`;
        const lessonOrder = unitMeta?.order ?? uIdx + 1;

        const fileRes = await fetch(`${basePath}/${fileName}`);
        if (!fileRes.ok) {
          throw new Error(`Question file load failed: ${fileName} (${fileRes.status})`);
        }
        const data = await fileRes.json();
        let unitQuestions: Question[] = [];

          if (data.meta && Array.isArray(data.questions)) {
            const m = data.meta as { publisher?: string; title?: string; lesson?: string; order?: number };
            if (m.publisher && m.publisher !== publisherCode && m.publisher !== publisher) return [];
            unitQuestions = (data.questions as RawQuestionLike[]).map((q) => {
              const options = q.options || (q.type === 'true_false' ? ['是', '否'] : []);
              return { ...q, options, category: category || m.title || m.lesson, lesson: m.lesson, lessonTitle: category || m.title, lessonOrder: m.order ?? 0, normalizedAnswer: normalizeAnswer({ type: q.type || 'multiple_choice', answer: q.answer || 0, options }), _sourceFile: `${basePath}/${fileName}`, cqi_score: q.cqi_score, quality_level: q.quality_level } as Question;
            }).filter(q => q.is_active !== false); // Default to true if undefined
          } else if (typeof data === 'object' && Array.isArray(data.questions)) {
            const lessonId = (data as { lesson_id?: string }).lesson_id ?? lesson;
            const lessonTitle = (data as { lesson_title?: string }).lesson_title ?? category;
            unitQuestions = (data.questions as RawQuestionLike[]).map((q, i) => {
              if (!q || typeof q.question !== 'string' || !Array.isArray(q.options)) return null;
              const options = q.options;
              const rawAnswer = q.answer_index ?? q.correctAnswer ?? q.answer;
              return {
                id: q.id ?? `${lessonId}_q${i + 1}`,
                type: 'multiple_choice' as const,
                question: q.question,
                options: options as string[],
                answer: rawAnswer,
                explanation: q.explanation,
                scenario: q.scenario,
                commonMisconception: q.commonMisconception,
                category: category || lessonTitle || q.concept || lessonId,
                lesson: lessonId,
                lessonTitle: category || lessonTitle,
                lessonOrder: lessonOrder,
                normalizedAnswer: typeof rawAnswer === 'number' ? rawAnswer : normalizeAnswer({ type: 'multiple_choice', answer: rawAnswer, options }),
                is_active: q.is_active,
                _sourceFile: `${basePath}/${fileName}`,
                cqi_score: q.cqi_score,
                quality_level: q.quality_level
              } as Question;
            }).filter((q): q is Question => q !== null && q.is_active !== false);
          } else if (typeof data === 'object' && data.question && Array.isArray(data.options)) {
            const rawAnswer = data.correctAnswer ?? data.answer;
            unitQuestions = [{
              id: data.id,
              type: 'multiple_choice' as const,
              question: data.question,
              options: data.options as string[],
              answer: rawAnswer,
              explanation: data.explanation,
              scenario: data.scenario,
              commonMisconception: data.commonMisconception,
              category: category || data.concept || lesson,
              lesson,
              lessonTitle: category || data.concept || lesson,
              lessonOrder,
              normalizedAnswer: typeof rawAnswer === 'number' ? rawAnswer : normalizeAnswer({ type: 'multiple_choice', answer: rawAnswer, options: data.options }),
              is_active: data.is_active,
              _sourceFile: `${basePath}/${fileName}`,
              cqi_score: data.cqi_score,
              quality_level: data.quality_level
            } as Question].filter((q): q is Question => q.is_active !== false);
          } else if (Array.isArray(data)) {
            unitQuestions = (data as RawQuestionLike[]).map((q) => {
              if (!q || typeof q.question !== 'string' || !Array.isArray(q.options)) return null;
              const rawAnswer = q.correctAnswer ?? q.answer;
              return {
                id: q.id,
                type: 'multiple_choice' as const,
                question: q.question,
                options: q.options as string[],
                answer: rawAnswer,
                explanation: q.explanation,
                scenario: q.scenario,
                commonMisconception: q.commonMisconception,
                category: category || q.concept || lesson,
                lesson,
                lessonTitle: category || q.concept || lesson,
                lessonOrder,
                normalizedAnswer: typeof rawAnswer === 'number' ? rawAnswer : normalizeAnswer({ type: 'multiple_choice', answer: rawAnswer, options: q.options }),
                is_active: q.is_active,
                _sourceFile: `${basePath}/${fileName}`,
                cqi_score: q.cqi_score,
                quality_level: q.quality_level
              } as Question;
            }).filter((q): q is Question => q !== null && q.is_active !== false);
          }
        return unitQuestions;
      });

      const results = await Promise.all(fetchPromises);
      allQuestions = results.flat();
    }

    allQuestions.sort((a, b) => a.lessonOrder - b.lessonOrder);
    const status: QuestionLoadStatus = allQuestions.length > 0 || manifestOnly ? 'success' : 'empty';
    return {
      status,
      questions: allQuestions,
      getAllCategories: () => [...new Set(allQuestions.map(q => q.category))],
      getQuestionsByCategory: (cat: string) => allQuestions.filter(q => q.category === cat),
      manifest
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : '題庫載入時發生未知錯誤';
    return makeResult('error', { errorMessage: message });
  }
}
