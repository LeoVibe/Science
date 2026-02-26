import { Grade, Semester, Publisher, Subject, SUBJECT_ICONS, SUBJECT_THEME_MAP, SEMESTER_NAMES } from '@/data/config';
import { Question } from '@/data/config';
import type { QuestionLoadStatus } from '@/data/questionLoader';

interface MainMenuProps {
  grade: Grade;
  semester: Semester;
  publisher: Publisher;
  subject: Subject;
  questions: Question[];
  categories: string[];
  loadStatus: QuestionLoadStatus;
  loadError?: string;
  libraryDisabled?: boolean;
  onStartQuiz: (type: string, count: number) => void;
  onStartLessonQuiz: (category: string) => void;
  onStartReview: () => void;
}

export default function MainMenu({
  grade, semester, publisher, subject,
  questions, categories, loadStatus, loadError, libraryDisabled = false,
  onStartQuiz, onStartLessonQuiz, onStartReview,
}: MainMenuProps) {
  const theme = SUBJECT_THEME_MAP[subject];
  const icon = SUBJECT_ICONS[subject];
  const hasQuestions = categories.length > 0;
  const showError = loadStatus === 'error';
  const showEmpty = loadStatus === 'empty' && !libraryDisabled;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="bg-card rounded-3xl shadow-sm border p-6 sm:p-8 space-y-8">
        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className={`text-2xl sm:text-3xl font-black subject-text-${theme}`}>
            {icon} {subject}複習 {icon}
          </h1>
          <p className="text-muted-foreground text-sm">
            {grade}年級 {subject} {SEMESTER_NAMES[semester]} ({publisher}版)
          </p>
          {libraryDisabled && (
            <p className="text-muted-foreground font-medium mt-2">🚫 此題庫已關閉，請切換其他版本。</p>
          )}
          {!libraryDisabled && showError && (
            <p className="text-destructive font-medium mt-2">⚠️ 題庫檔案讀取失敗：{loadError ?? '請稍後再試'}</p>
          )}
          {!libraryDisabled && showEmpty && (
            <p className="text-destructive font-medium mt-2">⚠️ 尚無題庫</p>
          )}
        </div>

        {/* 綜合練習 */}
        {hasQuestions && !libraryDisabled && !showError && (
          <section className="space-y-3">
            <h2 className="text-center text-base sm:text-lg font-extrabold text-muted-foreground flex items-center justify-center gap-2">
              📝 綜合練習
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onStartQuiz('基本挑戰', 10)}
                className="flex flex-col items-center bg-card border-2 rounded-2xl py-2.5 px-3 hover:shadow-md active:scale-[0.98] transition-all"
                style={{
                  borderColor: `hsl(var(--subject-${theme}) / 0.4)`,
                }}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">🎯</span>
                  <span className="font-extrabold text-sm" style={{ color: `hsl(var(--subject-${theme}))` }}>基本挑戰</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ color: `hsl(var(--subject-${theme}))`, background: `hsl(var(--subject-${theme}) / 0.1)` }}>10題</span>
                </div>
                <span className="text-[10px] text-muted-foreground mt-0.5">隨機出題・快速複習</span>
              </button>
              <button
                onClick={() => onStartQuiz('進階挑戰', 25)}
                className={`flex flex-col items-center text-white rounded-2xl py-2.5 px-3 shadow-sm hover:shadow-lg active:scale-[0.98] transition-all gradient-${theme}`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">⭐</span>
                  <span className="font-extrabold text-sm">進階挑戰</span>
                  <span className="text-[10px] font-bold bg-white/20 px-1.5 py-0.5 rounded-full">25題</span>
                </div>
                <span className="text-[10px] text-white/70 mt-0.5">深度練習・全面檢測</span>
              </button>
            </div>
          </section>
        )}

        {/* 分課練習 */}
        <section className="space-y-3">
          <h2 className="text-center text-base sm:text-lg font-extrabold text-muted-foreground flex items-center justify-center gap-2">
            📚 分課練習
          </h2>
          {hasQuestions && categories.length > 0 && !libraryDisabled && !showError ? (
            <div className="grid grid-cols-2 gap-2.5">
              {categories.map((cat, i) => (
                <button
                  key={cat}
                  onClick={() => onStartLessonQuiz(cat)}
                  className="bg-white border border-gray-100 rounded-2xl py-3.5 px-4 font-bold text-sm shadow-sm hover:shadow-md active:scale-[0.98] transition-all text-left relative overflow-hidden w-full"
                >
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
                    style={{ backgroundColor: `hsl(var(--subject-${theme}))` }}
                  />
                  <span className="pl-2 text-gray-700 leading-snug block">
                    第{i + 1}課：{cat}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-6 text-sm">
              {libraryDisabled
                ? '此題庫目前關閉中'
                : showError
                  ? '題庫讀取失敗，請稍後再試'
                  : (hasQuestions ? '無分課資料' : '尚無對應題庫 📭')}
            </p>
          )}
        </section>

      </div>
    </div>
  );
}
