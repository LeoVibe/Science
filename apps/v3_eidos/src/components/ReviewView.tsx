import { useState } from 'react';
import { Question, Subject, SUBJECT_THEME_MAP } from '@/data/config';
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
  const theme = SUBJECT_THEME_MAP[subject];
  const filtered = questions.filter(q => q.category === activeTab);
  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors text-lg">← 返回</button>
        <h1 className="text-xl font-bold">📚 分科題庫</h1>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${activeTab === cat
              ? `gradient-${theme} text-primary-foreground shadow-sm`
              : 'bg-muted hover:bg-muted-foreground/10'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

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
                <div key={j} className={`px-3 py-2 rounded-lg text-sm flex items-start gap-2 ${j === q.normalizedAnswer ? 'bg-correct-light font-medium' : 'bg-muted/50'
                  }`}>
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
