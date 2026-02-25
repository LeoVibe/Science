import { useState, useCallback } from 'react';
import { Question, SUBJECT_THEME_MAP, Subject } from '@/data/config';

interface QuizViewProps {
  questions: Question[];
  quizType: string;
  subject: Subject;
  onFinish: (score: number, total: number, wrongQuestions: Question[], answeredList: { question: Question; isCorrect: boolean; selected: number }[]) => void;
  onBack: () => void;
  onSaveAnswer: (questionId: string, isCorrect: boolean) => void;
  initialIndex?: number;
  initialScore?: number;
  initialAnswered?: { question: Question; isCorrect: boolean; selected: number }[];
}

export default function QuizView({
  questions, quizType, subject, onFinish, onBack, onSaveAnswer,
  initialIndex = 0, initialScore = 0, initialAnswered = [],
}: QuizViewProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [score, setScore] = useState(initialScore);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [answered, setAnswered] = useState(initialAnswered);
  const [sessionCorrect, setSessionCorrect] = useState(initialAnswered.filter(a => a.isCorrect).length);
  const [sessionWrong, setSessionWrong] = useState(initialAnswered.filter(a => !a.isCorrect).length);

  const theme = SUBJECT_THEME_MAP[subject];
  const current = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const progress = ((currentIndex + (confirmed ? 1 : 0)) / questions.length) * 100;

  const handleConfirm = useCallback(() => {
    if (selectedOption === null || confirmed) return;
    const isCorrect = selectedOption === current.normalizedAnswer;
    setConfirmed(true);
    if (isCorrect) {
      setScore(s => s + 1);
      setSessionCorrect(c => c + 1);
    } else {
      setSessionWrong(w => w + 1);
    }
    const entry = { question: current, isCorrect, selected: selectedOption };
    setAnswered(prev => [...prev, entry]);
    onSaveAnswer(current.id, isCorrect);
  }, [selectedOption, confirmed, current, onSaveAnswer]);

  const handleNext = useCallback(() => {
    if (isLast) {
      const wrongQs = answered.filter(a => !a.isCorrect).map(a => a.question);
      // Include current if just confirmed and wrong
      if (confirmed && selectedOption !== current.normalizedAnswer) {
        wrongQs.push(current);
      }
      onFinish(score + (confirmed && selectedOption === current.normalizedAnswer ? 0 : 0), questions.length, wrongQs, answered);
      return;
    }
    setCurrentIndex(i => i + 1);
    setSelectedOption(null);
    setConfirmed(false);
  }, [isLast, confirmed, selectedOption, current, score, questions.length, answered, onFinish]);

  const handleFinish = () => {
    const wrongQs = answered.filter(a => !a.isCorrect).map(a => a.question);
    onFinish(score, questions.length, wrongQs, answered);
  };

  if (!current) return null;

  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
      {/* Top bar */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors text-lg">
          ← 返回
        </button>
        <span className="text-sm text-muted-foreground ml-auto">{quizType}</span>
      </div>

      {/* Progress */}
      <div className="space-y-1">
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full gradient-${theme} rounded-full transition-all duration-500`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>第 {currentIndex + 1} 題 / 共 {questions.length} 題</span>
          <span>✓ {sessionCorrect}　✗ {sessionWrong}</span>
        </div>
      </div>

      {/* Question card */}
      <div className="bg-card rounded-2xl border shadow-sm p-5 space-y-4">
        <div className="flex gap-2 flex-wrap">
          <span className={`text-xs px-2 py-0.5 rounded-full subject-bg-${theme}-light subject-text-${theme} font-medium`}>
            {current.category}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            選擇題
          </span>
        </div>

        <p className="text-lg font-medium leading-relaxed">{current.question}</p>

        <div className="space-y-2">
          {current.options.map((opt, i) => {
            let optClass = 'bg-background border hover:border-primary/50';
            if (confirmed) {
              if (i === current.normalizedAnswer) {
                optClass = 'bg-correct-light border-2 border-correct';
              } else if (i === selectedOption && i !== current.normalizedAnswer) {
                optClass = 'bg-wrong-light border-2 border-wrong';
              } else {
                optClass = 'bg-muted/50 border opacity-60';
              }
            } else if (i === selectedOption) {
              optClass = `subject-bg-${theme}-light border-2 subject-border-${theme}`;
            }
            return (
              <button
                key={i}
                onClick={() => !confirmed && setSelectedOption(i)}
                disabled={confirmed}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-start gap-3 ${optClass}`}
              >
                <span className="font-bold text-muted-foreground shrink-0">{optionLabels[i]}</span>
                <span>{opt}</span>
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {confirmed && current.explanation && (
          <div className={`p-3 rounded-xl text-sm ${
            selectedOption === current.normalizedAnswer ? 'bg-correct-light' : 'bg-wrong-light'
          }`}>
            <p className="font-bold mb-1">
              {selectedOption === current.normalizedAnswer ? '✅ 答對了！' : '❌ 答錯了！'}
            </p>
            <p className="text-muted-foreground">{current.explanation}</p>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        {!confirmed ? (
          <button
            onClick={handleConfirm}
            disabled={selectedOption === null}
            className={`flex-1 py-3 rounded-xl font-bold text-lg transition-all ${
              selectedOption !== null
                ? `gradient-${theme} text-primary-foreground shadow-md active:scale-95`
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            確認答案
          </button>
        ) : isLast ? (
          <button
            onClick={handleFinish}
            className={`flex-1 py-3 rounded-xl font-bold text-lg gradient-${theme} text-primary-foreground shadow-md active:scale-95 transition-all`}
          >
            🎉 查看結果
          </button>
        ) : (
          <button
            onClick={handleNext}
            className={`flex-1 py-3 rounded-xl font-bold text-lg gradient-${theme} text-primary-foreground shadow-md active:scale-95 transition-all`}
          >
            下一題 →
          </button>
        )}
      </div>
    </div>
  );
}
