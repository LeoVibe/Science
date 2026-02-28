import { useState } from 'react';
import { Grade, Semester, Publisher, Subject, SUBJECT_ICONS, SUBJECT_THEME_MAP, SEMESTER_NAMES } from '@/data/config';
import { Question } from '@/data/config';
import type { QuestionLoadStatus } from '@/data/questionLoader';
import InsightDrawer from '@/components/InsightDrawer';
import { getSubjectPrincipleContent } from '@/data/subjectPrincipleContent';

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
  /** 當前科目/出版者總題數，用於顯示「總計 X 題」 */
  totalQuestionCount?: number;
  /** 進階挑戰題數（來自 User Profile） */
  maxQuizQuestions?: number;
  onStartQuiz: (type: string, count: number) => void;
  onStartLessonQuiz: (category: string) => void;
  onStartReview: () => void;
}

export default function MainMenu({
  grade, semester, publisher, subject,
  questions, categories, loadStatus, loadError, libraryDisabled = false,
  totalQuestionCount = 0, maxQuizQuestions = 25,
  onStartQuiz, onStartLessonQuiz, onStartReview,
}: MainMenuProps) {
  const [insightDrawerOpen, setInsightDrawerOpen] = useState(false);
  const theme = SUBJECT_THEME_MAP[subject];
  const principleContent = getSubjectPrincipleContent(grade, subject);
  const icon = SUBJECT_ICONS[subject];
  const hasQuestions = categories.length > 0;
  const showError = loadStatus === 'error';
  const showEmpty = loadStatus === 'empty' && !libraryDisabled;
  const effectiveMax = Math.max(10, Math.min(50, maxQuizQuestions));

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="bg-card rounded-3xl shadow-sm border p-6 sm:p-8 space-y-8 relative overflow-hidden">
        {/* 右上角整合入口：AI 專家說 (💡 圓圈按鈕) */}
        <button
          type="button"
          onClick={() => setInsightDrawerOpen(true)}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-muted/50 text-muted-foreground hover:bg-amber-100 hover:text-amber-600 transition-all shadow-sm border border-transparent hover:border-amber-200"
          aria-label="AI 專家說：出題原則與配比說明"
        >
          <span className="text-xl">💡</span>
        </button>

        <InsightDrawer
          open={insightDrawerOpen}
          onClose={() => setInsightDrawerOpen(false)}
          principleContent={principleContent}
        />

        {/* Title */}
        <div className="text-center space-y-4">
          <div className="space-y-2">
            <h1 className={`text-2xl sm:text-3xl font-black subject-text-${theme}`}>
              {icon} {subject}複習 {icon}
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm font-medium">
              {grade}年級 {subject} {SEMESTER_NAMES[semester]} ({publisher}版)
            </p>
          </div>

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
            <h2 className="text-center text-base sm:text-lg font-extrabold text-muted-foreground flex items-center justify-center gap-2 flex-wrap">
              📝 綜合練習
              {totalQuestionCount > 0 && (
                <span className="text-sm font-bold text-muted-foreground/90">（總計 {totalQuestionCount} 題）</span>
              )}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onStartQuiz('基本挑戰', 10)}
                className="flex flex-col items-center min-w-0 bg-card border-2 rounded-2xl py-3 px-3 hover:shadow-md active:scale-[0.98] transition-all"
                style={{
                  borderColor: `hsl(var(--subject-${theme}) / 0.4)`,
                }}
              >
                <div className="flex items-center gap-1.5 flex-wrap justify-center">
                  <span className="text-xl">🎯</span>
                  <span className="font-extrabold text-base" style={{ color: `hsl(var(--subject-${theme}))` }}>基本挑戰</span>
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded-full shrink-0" style={{ color: `hsl(var(--subject-${theme}))`, background: `hsl(var(--subject-${theme}) / 0.1)` }}>10題</span>
                </div>
                <span className="text-xs text-muted-foreground mt-1">隨機出題・快速複習</span>
              </button>
              <button
                onClick={() => onStartQuiz('進階挑戰', effectiveMax)}
                className={`flex flex-col items-center min-w-0 text-white rounded-2xl py-3 px-3 shadow-sm hover:shadow-lg active:scale-[0.98] transition-all gradient-${theme}`}
              >
                <div className="flex items-center gap-1.5 flex-wrap justify-center">
                  <span className="text-xl">⭐</span>
                  <span className="font-extrabold text-base">進階挑戰</span>
                  <span className="text-xs font-bold bg-white/20 px-1.5 py-0.5 rounded-full shrink-0">{effectiveMax}題</span>
                </div>
                <span className="text-xs text-white/70 mt-1">深度練習・全面檢測</span>
              </button>
            </div>
          </section>
        )}

        {/* 分課練習 */}
        <section className="space-y-3">
          <h2 className="text-center text-base sm:text-lg font-extrabold text-muted-foreground">
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
