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
  /** 從 manifest 讀取的各單元/課題數 */
  categoryCounts?: Record<string, number>;
  /** 進階挑戰題數（來自 User Profile） */
  maxQuizQuestions?: number;
  onStartQuiz: (type: string, count: number, restrictCategories?: string[]) => void;
  onStartLessonQuiz: (category: string, count: '10' | '20' | 'all') => void;
  onStartReview: () => void;
  initialLessonQuizCount?: '10' | '20' | 'all';
}

export default function MainMenu({
  grade, semester, publisher, subject,
  questions, categories, categoryCounts = {}, loadStatus, loadError, libraryDisabled = false,
  totalQuestionCount = 0, maxQuizQuestions = 25,
  onStartQuiz, onStartLessonQuiz, onStartReview,
  initialLessonQuizCount = '10',
}: MainMenuProps) {
  const [insightDrawerOpen, setInsightDrawerOpen] = useState(false);
  const [lessonQuizCount, setLessonQuizCount] = useState<'10' | '20' | 'all'>(initialLessonQuizCount);
  const [showRangePanel, setShowRangePanel] = useState(false);
  const [selectedCats, setSelectedCats] = useState<Set<string>>(new Set());
  const theme = SUBJECT_THEME_MAP[subject];
  const principleContent = getSubjectPrincipleContent(grade, semester, subject);
  const icon = SUBJECT_ICONS[subject];
  const hasQuestions = categories.length > 0;
  const showError = loadStatus === 'error';
  const showEmpty = loadStatus === 'empty' && !libraryDisabled;
  const effectiveMax = Math.max(10, Math.min(50, maxQuizQuestions));

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="bg-card rounded-3xl shadow-sm border p-6 sm:p-8 space-y-8 relative overflow-hidden">
        <InsightDrawer
          open={insightDrawerOpen}
          onClose={() => setInsightDrawerOpen(false)}
          principleContent={principleContent}
        />

        {/* 標題列：[三下][南一版]  置中主標題  [💡] 全在同一行 */}
        <div className="flex items-center gap-2">
          {/* 左側標籤組 */}
          <div className="flex items-center gap-1 shrink-0">
            <span className={`text-[11px] font-black px-2 py-0.5 rounded-md subject-bg-${theme}-light subject-text-${theme} leading-tight`}>
              {['', '一', '二', '三', '四', '五', '六'][grade]}{semester === 1 ? '上' : '下'}
            </span>
            <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground leading-tight">
              {publisher}版
            </span>
          </div>
          {/* 主標題：展滿中間並置中 */}
          <h1 className={`flex-1 text-xl sm:text-2xl font-black subject-text-${theme} leading-none text-center`}>
            {icon} {subject}複習 {icon}
          </h1>
          {/* 燈泡按鈕（小，右對齊） */}
          <button
            type="button"
            onClick={() => setInsightDrawerOpen(true)}
            className="w-8 h-8 shrink-0 flex items-center justify-center rounded-full bg-muted/50 text-muted-foreground hover:bg-amber-50 hover:text-amber-600 transition-all border border-transparent hover:border-amber-200"
            aria-label="AI 專家說"
          >
            <span className="text-base">💡</span>
          </button>
        </div>

        {(libraryDisabled || (!libraryDisabled && showError) || (!libraryDisabled && showEmpty)) && (
          <div>
            {libraryDisabled && <p className="text-muted-foreground font-medium">🚫 此題庫已關閉，請切換其他版本。</p>}
            {!libraryDisabled && showError && <p className="text-destructive font-medium">⚠️ 題庫檔案讀取失敗：{loadError ?? '請稍後再試'}</p>}
            {!libraryDisabled && showEmpty && <p className="text-destructive font-medium">⚠️ 尚無題庫</p>}
          </div>
        )}

        {/* 分課練習 (移至上方並加入題數選擇) */}
        <section className="space-y-4">
          <div className="flex flex-col items-center gap-3">
            <h2 className="text-center text-base sm:text-lg font-extrabold text-muted-foreground">
              📚 分課複習
            </h2>

            {/* 題數選擇 — 膠囊式 Segmented Control，有滑動互斥感 */}
            {hasQuestions && !libraryDisabled && !showError && (() => {
              const options: { value: '10' | '20' | 'all'; emoji: string; label: string }[] = [
                { value: '10', emoji: '🎯', label: '10 題' },
                { value: '20', emoji: '⭐', label: '20 題' },
                { value: 'all', emoji: '🏆', label: '全部做' },
              ];
              return (
                <div className="relative flex w-full bg-muted/60 rounded-full p-1 gap-0.5">
                  {/* 滑動高亮底層 */}
                  <div
                    className={`absolute top-1 bottom-1 w-[calc(33.33%-2px)] rounded-full transition-all duration-300 ease-out gradient-${theme} shadow-sm`}
                    style={{ left: `calc(${options.findIndex(o => o.value === lessonQuizCount) * 33.33}% + 4px)` }}
                  />
                  {options.map(opt => {
                    const isActive = lessonQuizCount === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setLessonQuizCount(opt.value)}
                        className={`relative z-10 flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 active:scale-[0.97] select-none ${isActive ? 'text-white' : 'text-muted-foreground hover:text-foreground'
                          }`}
                      >
                        <span className="text-base leading-none">{opt.emoji}</span>
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          {hasQuestions && categories.length > 0 && !libraryDisabled && !showError ? (
            <div className="grid grid-cols-2 gap-2.5">
              {categories.map((cat, i) => {
                // 配色：和謐光譜序列（暖色→中性→冷色），諜覺上自然過渡
                const harmonicColors = [
                  '#f97316', // 暖橙
                  '#eab308', // 金黃
                  '#22c55e', // 清綠
                  '#06b6d4', // 準藍
                  '#6366f1', // 藍紫
                  '#ec4899', // 硅瑰粉
                ];
                const accentColor = harmonicColors[i % harmonicColors.length];
                return (
                  <button
                    key={cat}
                    onClick={() => onStartLessonQuiz(cat, lessonQuizCount)}
                    className="relative overflow-hidden bg-card rounded-2xl py-3 px-4 text-sm shadow-sm border border-border/60 hover:shadow-md hover:border-border hover:-translate-y-0.5 active:scale-[0.97] transition-all text-left w-full group"
                  >
                    {/* 左側彩虹色線條（唯一的趣味點） */}
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl" style={{ backgroundColor: accentColor }} />
                    <div className="pl-2 flex items-center justify-between">
                      <span className="text-sm text-foreground font-bold leading-snug">
                        {/* JOB-204 C4：前綴顏色 muted-foreground → foreground/60，font-semibold → font-medium */}
                        <span className="text-foreground/60 font-medium">第{i + 1}課　</span>{cat}
                      </span>
                      {/* JOB-204 C2+C3：題數 pill 10px→12px、padding 放大、透明度 70% → 100%；D4：數字包 .num */}
                      <span className="text-xs font-bold px-2 py-1 rounded-md bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <span className="num">{categoryCounts[cat] ?? 0}</span> 題
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

          ) : (
            <p className="text-muted-foreground text-center py-8 text-sm bg-muted/30 rounded-2xl">
              {libraryDisabled
                ? '此題庫目前關閉中'
                : showError
                  ? '題庫讀取失敗，請稍後再試'
                  : (hasQuestions ? '無分課資料' : '尚無對應題庫 📭')}
            </p>
          )}
        </section>

        {/* 跨課測驗 + 範圍設定 */}
        {hasQuestions && !libraryDisabled && !showError && (() => {
          // 除列模式：預設全選，点選某課則將其從測驗中排除
          // excludedCats 為空集 = 全課參與；有內容 = 排除這些課
          const activeCats = selectedCats.size > 0
            ? categories.filter(c => !selectedCats.has(c))
            : undefined;
          const toggleCat = (cat: string) => {
            setSelectedCats(prev => {
              const next = new Set(prev);
              if (next.has(cat)) next.delete(cat); else next.add(cat);
              return next;
            });
          };
          const excludedCount = selectedCats.size;
          return (
            <section className="space-y-3 pt-5 mt-5 border-t border-dashed">
              {/* 標題列：真正全頁置中 + 按鈕不占位 */}
              <div className="relative flex items-center h-10">
                {/* 標題：絕對定位全寬置中 */}
                <div className="absolute inset-x-0 flex flex-col items-center pointer-events-none">
                  <h2 className="flex items-baseline gap-1.5 flex-wrap justify-center">
                    <span className="text-base sm:text-lg font-extrabold text-muted-foreground">🌍 跨課測驗</span>
                  </h2>
                </div>
                {/* 課程範圍按鈕：絕對定位靠右 */}
                <button
                  onClick={() => setShowRangePanel(p => !p)}
                  className={`absolute right-0 flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${showRangePanel || excludedCount > 0
                    ? 'bg-primary/10 border-primary/30 text-primary'
                    : 'bg-muted/50 border-border/50 text-muted-foreground hover:text-foreground'
                    }`}
                >
                  <span>🎯</span>
                  <span>課程範圍</span>
                  {excludedCount > 0 && (
                    <span className="bg-amber-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                      -{excludedCount}
                    </span>
                  )}
                </button>
              </div>


              {/* 課程範圍展開面板 */}
              {showRangePanel && (
                <div className="bg-muted/30 rounded-2xl p-3 space-y-2.5 border border-border/40">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">
                      {excludedCount > 0 ? `已排除第 ${Array.from(selectedCats).map(c => categories.indexOf(c) + 1).sort((a, b) => a - b).join('、')} 課` : '點選課次將排除於測驗外'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedCats(new Set(categories))}
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border transition-all ${excludedCount === categories.length
                          ? 'bg-muted/50 border-border/50 text-muted-foreground/50 cursor-default'
                          : 'border-border/60 text-muted-foreground hover:text-foreground hover:border-border'
                          }`}
                        disabled={excludedCount === categories.length}
                      >
                        全消
                      </button>
                      <button
                        onClick={() => setSelectedCats(new Set())}
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border transition-all ${excludedCount === 0
                          ? 'bg-muted/50 border-border/50 text-muted-foreground/50 cursor-default'
                          : 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/20'
                          }`}
                        disabled={excludedCount === 0}
                      >
                        全選
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {categories.map((cat, i) => {
                      // 排除模式：預設全亮起（全選），點選變暗（排除）
                      const isExcluded = selectedCats.has(cat);
                      return (
                        <button
                          key={cat}
                          onClick={() => toggleCat(cat)}
                          title={cat}
                          className={`w-8 h-8 rounded-full border text-xs font-bold transition-all ${isExcluded
                            ? 'bg-muted/40 border-border/30 text-muted-foreground/40 line-through scale-90'
                            : 'bg-primary text-white border-primary shadow-sm scale-100'
                            }`}
                        >
                          {i + 1}
                        </button>
                      );
                    })}
                  </div>

                </div>
              )}

              {/* 測驗按鈕 */}
              <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                <button
                  onClick={() => onStartQuiz('基本挑戰', 15, activeCats)}
                  className="flex flex-col items-center min-w-0 bg-card border-2 rounded-2xl py-4 px-3 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all"
                  style={{ borderColor: `hsl(var(--subject-${theme}) / 0.4)` }}
                >
                  <div className="flex items-center gap-1.5 flex-wrap justify-center mb-1">
                    <span className="text-xl">🎯</span>
                    <span className="font-extrabold text-base" style={{ color: `hsl(var(--subject-${theme}))` }}>基本挑戰</span>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ color: `hsl(var(--subject-${theme}))`, background: `hsl(var(--subject-${theme}) / 0.1)` }}>10 題</span>
                </button>
                <button
                  onClick={() => onStartQuiz('進階挑戰', effectiveMax, activeCats)}
                  className={`flex flex-col items-center min-w-0 text-white rounded-2xl py-4 px-3 shadow-sm hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] transition-all gradient-${theme}`}
                >
                  <div className="flex items-center gap-1.5 flex-wrap justify-center mb-1">
                    <span className="text-xl">⭐</span>
                    <span className="font-extrabold text-base">進階挑戰</span>
                  </div>
                  <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full">{effectiveMax} 題</span>
                </button>
              </div>
            </section>
          );
        })()}

      </div>
    </div>
  );
}
