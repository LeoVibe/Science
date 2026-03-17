import { Question } from '@/data/config';
import IntentionTooltip from '@/components/IntentionTooltip';
import { EducationalBadges } from './EducationalBadges';
import { stripOptionPrefix } from '@/utils/format';

interface WrongQuestionsViewProps {
  questions: Question[];
  title: string;
  onBack: () => void;
  wrongCounts?: Record<string, { wrong: number; total: number }>;
}

export default function WrongQuestionsView({ questions, title, onBack, wrongCounts }: WrongQuestionsViewProps) {
  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors text-lg">← 返回</button>
        <h1 className="text-xl font-bold">{title}</h1>
        <span className="text-sm text-muted-foreground ml-auto">{questions.length} 題</span>
      </div>

      {questions.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">🎉 沒有錯題！太棒了！</p>
      ) : (
        <div className="space-y-3">
          {questions.map((q, i) => (
            <div key={q.id} className="bg-card rounded-2xl border p-4 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs bg-muted px-2 py-0.5 rounded-full">第 {i + 1} 題</span>
                <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{q.category}</span>
                {wrongCounts?.[q.id] && (
                  <span className="text-xs bg-wrong-light px-2 py-0.5 rounded-full text-destructive">
                    錯 {wrongCounts[q.id].wrong} 次 / 共 {wrongCounts[q.id].total} 次
                  </span>
                )}
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
        </div>
      )}
    </div>
  );
}
