import { Grade, Semester, Publisher, Subject, SUBJECT_ICONS, SUBJECT_THEME_MAP, SEMESTER_NAMES } from '@/data/config';
import { Question } from '@/data/config';

interface MainMenuProps {
  grade: Grade;
  semester: Semester;
  publisher: Publisher;
  subject: Subject;
  questions: Question[];
  categories: string[];
  onStartQuiz: (type: string, count: number) => void;
  onStartLessonQuiz: (category: string) => void;
  onStartReview: () => void;
}

export default function MainMenu({
  grade, semester, publisher, subject,
  questions, categories,
  onStartQuiz, onStartLessonQuiz, onStartReview,
}: MainMenuProps) {
  const theme = SUBJECT_THEME_MAP[subject];
  const icon = SUBJECT_ICONS[subject];
  const hasQuestions = categories.length > 0;

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
          {!hasQuestions && (
            <p className="text-destructive font-medium mt-2">⚠️ 尚無題庫</p>
          )}
        </div>

        {/* 綜合練習 */}
        {hasQuestions && (
          <section className="space-y-3">
            <h2 className="text-center text-base sm:text-lg font-extrabold text-muted-foreground flex items-center justify-center gap-2">
              📝 綜合練習
            </h2>
            <div className="space-y-2.5">
              <button
                onClick={() => onStartQuiz('基本挑戰', 10)}
                className="w-full gradient-challenge text-white rounded-2xl py-4 px-6 font-extrabold text-lg shadow-sm hover:shadow-md active:scale-[0.98] transition-all"
              >
                基本挑戰（10題）
              </button>
              <button
                onClick={() => onStartQuiz('進階挑戰', 25)}
                className="w-full gradient-challenge text-white rounded-2xl py-4 px-6 font-extrabold text-lg shadow-sm hover:shadow-md active:scale-[0.98] transition-all opacity-85"
              >
                進階挑戰（25題）
              </button>
            </div>
          </section>
        )}

        {/* 分課練習 */}
        <section className="space-y-3">
          <h2 className="text-center text-base sm:text-lg font-extrabold text-muted-foreground flex items-center justify-center gap-2">
            📚 分課練習
          </h2>
          {hasQuestions && categories.length > 0 ? (
            <div className="grid grid-cols-2 gap-2.5">
              {categories.map((cat, i) => (
                <button
                  key={cat}
                  onClick={() => onStartLessonQuiz(cat)}
                  className="gradient-lesson text-white rounded-2xl py-3 px-3 font-bold text-sm sm:text-base shadow-sm hover:shadow-md active:scale-[0.98] transition-all"
                >
                  第{i + 1}課：{cat}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-6 text-sm">
              {hasQuestions ? '無分課資料' : '尚無對應題庫 📭'}
            </p>
          )}
        </section>

      </div>
    </div>
  );
}
