import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_CATEGORIES, SUBJECT_META } from '@/data/mock';
import { useSubject } from '@/context/SubjectContext';

/*
 * 本頁 JSX 結構 1:1 對應 apps/v3_eidos/src/components/MainMenu.tsx
 * 科目切換改由 AppHeader + SubjectContext 控制（與主專案一致）。
 */

export default function MainMenu() {
  const { subject } = useSubject();
  const [lessonCount, setLessonCount] = useState<'10' | '20' | 'all'>('10');
  const [showRangePanel, setShowRangePanel] = useState(false);
  const [selectedCats, setSelectedCats] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  const meta = SUBJECT_META[subject];
  const theme = subject;

  const counts = useMemo(
    () => MOCK_CATEGORIES.reduce<Record<string, number>>((acc, c, i) => ((acc[c] = 18 - i), acc), {}),
    []
  );

  const excludedCount = selectedCats.size;
  const toggleCat = (cat: string) => {
    setSelectedCats(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  return (
    <>
      {/* === 主卡內容：完全 1:1 對照主專案 MainMenu.tsx === */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-card rounded-3xl shadow-sm border p-6 sm:p-8 space-y-8 relative overflow-hidden">

          {/* 標題列：[三下][南一版] 置中主標題 [💡] */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 shrink-0">
              <span
                className={`text-[11px] font-black px-2 py-0.5 rounded-md subject-bg-${theme}-light subject-text-${theme} leading-tight`}
              >
                三下
              </span>
              <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground leading-tight">
                康軒版
              </span>
            </div>
            <h1
              className={`flex-1 text-xl sm:text-2xl font-black subject-text-${theme} leading-none text-center`}
            >
              {meta.icon} {meta.name}複習 {meta.icon}
            </h1>
            <button
              type="button"
              aria-label="AI 專家說"
              className="w-8 h-8 shrink-0 flex items-center justify-center rounded-full bg-muted/50 text-muted-foreground hover:bg-amber-50 hover:text-amber-600 transition-all border border-transparent hover:border-amber-200"
            >
              <span className="text-base">💡</span>
            </button>
          </div>

          {/* 分課複習 */}
          <section className="space-y-4">
            <div className="flex flex-col items-center gap-3">
              <h2 className="text-center text-base sm:text-lg font-extrabold text-muted-foreground">
                📚 分課複習
              </h2>

              {/* 題數選擇 膠囊式 Segmented Control */}
              {(() => {
                const options: { value: '10' | '20' | 'all'; emoji: string; label: string }[] = [
                  { value: '10', emoji: '🎯', label: '10 題' },
                  { value: '20', emoji: '⭐', label: '20 題' },
                  { value: 'all', emoji: '🏆', label: '全部做' },
                ];
                return (
                  <div className="relative flex w-full bg-muted/60 rounded-full p-1 gap-0.5">
                    <div
                      className={`absolute top-1 bottom-1 w-[calc(33.33%-2px)] rounded-full transition-all duration-300 ease-out gradient-${theme} shadow-sm`}
                      style={{ left: `calc(${options.findIndex(o => o.value === lessonCount) * 33.33}% + 4px)` }}
                    />
                    {options.map(opt => {
                      const isActive = lessonCount === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => setLessonCount(opt.value)}
                          className={`relative z-10 flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 active:scale-[0.97] select-none ${
                            isActive ? 'text-white' : 'text-muted-foreground hover:text-foreground'
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

            {/* 分課卡網格（2 欄） */}
            <div className="grid grid-cols-2 gap-2.5">
              {MOCK_CATEGORIES.map((cat, i) => {
                // 配色：和諧光譜序列（主專案同值）
                const harmonicColors = [
                  '#f97316',
                  '#eab308',
                  '#22c55e',
                  '#06b6d4',
                  '#6366f1',
                  '#ec4899',
                ];
                const accentColor = harmonicColors[i % harmonicColors.length];
                return (
                  <button
                    key={cat}
                    onClick={() => navigate('/quiz')}
                    className="relative overflow-hidden bg-card rounded-2xl py-3 px-4 text-sm shadow-sm border border-border/60 hover:shadow-md hover:border-border hover:-translate-y-0.5 active:scale-[0.97] transition-all text-left w-full group"
                  >
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl"
                      style={{ backgroundColor: accentColor }}
                    />
                    <div className="pl-2 flex items-center justify-between">
                      <span className="text-sm text-foreground font-bold leading-snug">
                        <span className="text-muted-foreground font-semibold">第{i + 1}課　</span>
                        {cat}
                      </span>
                      {/* 改動 M1.4-c：題數 pill 從 text-[10px] px-1.5 放大至 text-xs px-2 py-1 */}
                      <span className="text-xs font-bold px-2 py-1 rounded-md bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        {counts[cat]} 題
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 跨課測驗 + 範圍設定 */}
          <section className="space-y-3 pt-5 mt-5 border-t border-dashed">
            <div className="relative flex items-center h-10">
              <div className="absolute inset-x-0 flex flex-col items-center pointer-events-none">
                <h2 className="flex items-baseline gap-1.5 flex-wrap justify-center">
                  <span className="text-base sm:text-lg font-extrabold text-muted-foreground">
                    🌍 跨課測驗
                  </span>
                </h2>
              </div>
              <button
                onClick={() => setShowRangePanel(p => !p)}
                className={`absolute right-0 flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                  showRangePanel || excludedCount > 0
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

            {showRangePanel && (
              <div className="bg-muted/30 rounded-2xl p-3 space-y-2.5 border border-border/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {excludedCount > 0
                      ? `已排除第 ${Array.from(selectedCats).map(c => MOCK_CATEGORIES.indexOf(c) + 1).sort((a, b) => a - b).join('、')} 課`
                      : '點選課次將排除於測驗外'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSelectedCats(new Set(MOCK_CATEGORIES))}
                      className="text-[11px] font-semibold px-2 py-0.5 rounded-full border border-border/60 text-muted-foreground hover:text-foreground hover:border-border transition-all"
                    >
                      全消
                    </button>
                    <button
                      onClick={() => setSelectedCats(new Set())}
                      className="text-[11px] font-semibold px-2 py-0.5 rounded-full border bg-primary/10 border-primary/30 text-primary hover:bg-primary/20 transition-all"
                    >
                      全選
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {MOCK_CATEGORIES.map((cat, i) => {
                    const isExcluded = selectedCats.has(cat);
                    return (
                      <button
                        key={cat}
                        onClick={() => toggleCat(cat)}
                        title={cat}
                        className={`w-8 h-8 rounded-full border text-xs font-bold transition-all ${
                          isExcluded
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

            <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
              <button
                onClick={() => navigate('/quiz')}
                className="flex flex-col items-center min-w-0 bg-card border-2 rounded-2xl py-4 px-3 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all"
                style={{ borderColor: `hsl(var(--subject-${theme}) / 0.4)` }}
              >
                <div className="flex items-center gap-1.5 flex-wrap justify-center mb-1">
                  <span className="text-xl">🎯</span>
                  <span className="font-extrabold text-base" style={{ color: `hsl(var(--subject-${theme}))` }}>
                    基本挑戰
                  </span>
                </div>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ color: `hsl(var(--subject-${theme}))`, background: `hsl(var(--subject-${theme}) / 0.1)` }}
                >
                  10 題
                </span>
              </button>
              <button
                onClick={() => navigate('/quiz')}
                className={`flex flex-col items-center min-w-0 text-white rounded-2xl py-4 px-3 shadow-sm hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] transition-all gradient-${theme}`}
              >
                <div className="flex items-center gap-1.5 flex-wrap justify-center mb-1">
                  <span className="text-xl">⭐</span>
                  <span className="font-extrabold text-base">進階挑戰</span>
                </div>
                <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full">25 題</span>
              </button>
            </div>
          </section>
        </div>

        {/* 本頁改動對照（雛形專屬說明） */}
        <p className="mt-4 text-[11px] text-muted-foreground text-center leading-relaxed">
          <strong className="text-foreground">本頁套用：</strong>
          <span className="mx-1">M1.4-c</span>
          （分課卡題數 pill 從 10px 放大至 12px、padding 加大）
        </p>
      </div>
    </>
  );
}
