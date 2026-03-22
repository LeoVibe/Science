import { useState, useEffect } from 'react';
import { Question, Subject } from '@/data/config';
import IntentionTooltip from '@/components/IntentionTooltip';
import { EducationalBadges } from './EducationalBadges';
import { stripOptionPrefix } from '@/utils/format';

interface ReviewViewProps {
  questions: Question[];
  categories: string[];
  subject: Subject;
  onBack: () => void;
}

export default function ReviewView({ questions, categories, subject, onBack }: ReviewViewProps) {
  const [activeTab, setActiveTab] = useState(categories[0] || '');

  useEffect(() => {
    if (categories.length === 0) {
      setActiveTab('');
      return;
    }
    setActiveTab((prev) => (prev && categories.includes(prev) ? prev : categories[0]));
  }, [categories]);

  const filtered = questions.filter((q) => q.category === activeTab);
  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors text-lg">
          ← 返回
        </button>
        <h1 className="text-xl font-bold">📚 分科題庫</h1>
      </div>

      <p className="text-[10px] text-muted-foreground leading-relaxed -mt-1">
        課次依順序排列；手機版用雙欄精簡選課，點選後往下滑看題目。
      </p>

      {/* 課次：雙欄緊湊網格 + 限高捲動，避免手機一屏只剩選課 */}
      <div className="rounded-xl border border-border bg-card/80 overflow-hidden">
        <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 border-b border-border bg-muted/40">
          <span className="text-[10px] font-bold text-muted-foreground tracking-wide">選擇課次</span>
          <span className="text-[9px] text-muted-foreground/80 tabular-nums">共 {categories.length} 課</span>
        </div>
        <nav
          className="max-h-[min(26vh,8.5rem)] sm:max-h-[10rem] overflow-y-auto overscroll-contain p-1 touch-manipulation"
          aria-label="課次選擇"
        >
          <div className="grid grid-cols-2 gap-1">
            {categories.map((cat, idx) => {
              const isActive = activeTab === cat;
              const n = idx + 1;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveTab(cat)}
                  title={`第${n}課 ${cat}`}
                  className={`flex w-full items-center rounded-md px-1.5 py-0.5 text-left transition-all border min-h-0 ${
                    isActive
                      ? `border-primary/50 bg-primary/10 shadow-sm`
                      : 'border-border/60 bg-muted/15 hover:bg-muted/40 active:scale-[0.98]'
                  }`}
                >
                  <span
                    className={`min-w-0 flex-1 text-[10px] leading-snug line-clamp-1 ${
                      isActive ? 'text-foreground font-semibold' : 'text-foreground/90 font-medium'
                    }`}
                  >
                    <span className="tabular-nums text-muted-foreground font-semibold">第{n}課</span>
                    <span className="text-muted-foreground/40"> </span>
                    <span className="break-all">{cat}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* 目前選中課（可快速確認，不必回捲列表） */}
      {activeTab && (
        <div className="flex items-center gap-1.5 rounded-lg border border-dashed border-border px-2 py-1 bg-muted/20 min-w-0">
          <span className="text-[9px] font-bold text-muted-foreground shrink-0">目前</span>
          <span className="text-[10px] font-semibold text-foreground line-clamp-1 min-w-0">
            <span className="text-muted-foreground tabular-nums">第{categories.indexOf(activeTab) + 1}課</span>{' '}
            {activeTab}
          </span>
        </div>
      )}

      {/* Question cards */}
      <div className="space-y-3">
        {filtered.map((q, i) => (
          <div key={q.id} className="bg-card rounded-2xl border p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs bg-muted px-2 py-0.5 rounded-full">第 {i + 1} 題</span>
              <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{q.type === 'multiple_choice' ? '選擇題' : '是非題'}</span>
            </div>
            <p className="font-medium">{q.question}</p>
            <div className="space-y-1">
              {q.options.map((opt, j) => (
                <div
                  key={j}
                  className={`px-3 py-2 rounded-lg text-sm flex items-start gap-2 ${
                    j === q.normalizedAnswer ? 'bg-correct-light font-medium' : 'bg-muted/50'
                  }`}
                >
                  <span className="font-bold text-muted-foreground">{optionLabels[j]}</span>
                  <span>{stripOptionPrefix(opt)}</span>
                  {j === q.normalizedAnswer && <span className="ml-auto text-accent">✓</span>}
                </div>
              ))}
            </div>
            {q.explanation && (
              <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-2 inline-flex flex-wrap items-center gap-1">
                💡 {q.explanation}
                <IntentionTooltip />
              </p>
            )}
            <EducationalBadges
              explanationLength={q.explanation?.length}
              cqiScore={q.cqi_score}
              qualityLevel={q.quality_level}
            />
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-8">此分類無題目</p>
        )}
      </div>
    </div>
  );
}
