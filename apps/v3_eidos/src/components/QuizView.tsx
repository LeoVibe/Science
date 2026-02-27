import { useState, useCallback, useEffect, useRef } from 'react';
import { Question, SUBJECT_THEME_MAP, Subject } from '@/data/config';
import QuestionFeedback from './QuestionFeedback';

interface QuizViewProps {
  questions: Question[];
  quizType: string;
  subject: Subject;
  /** 答對後停留多久自動下一題（毫秒），0 = 不自動 */
  autoAdvanceDelayMs?: number;
  /** 是否開啟 A–D 快捷鍵（由 profile.shortcut_enabled / API 控制） */
  shortcutEnabled?: boolean;
  onFinish: (score: number, total: number, wrongQuestions: Question[], answeredList: { question: Question; isCorrect: boolean; selected: number }[]) => void;
  onBack: () => void;
  onSaveAnswer: (questionId: string, isCorrect: boolean) => void;
  userId?: string;
  onProgressSave?: (payload: {
    questions: Question[];
    currentIndex: number;
    answeredQuestions: { question: Question; isCorrect: boolean; selected: number }[];
    score: number;
    type: string;
    startTime: number;
  }) => void;
  initialIndex?: number;
  initialScore?: number;
  initialAnswered?: { question: Question; isCorrect: boolean; selected: number }[];
  initialStartTime?: number;
}

const DEFAULT_AUTO_ADVANCE_MS = 1500;

export default function QuizView({
  questions, quizType, subject, autoAdvanceDelayMs = DEFAULT_AUTO_ADVANCE_MS, shortcutEnabled = true, onFinish, onBack, onSaveAnswer,
  userId, onProgressSave, initialIndex = 0, initialScore = 0, initialAnswered = [], initialStartTime = Date.now(),
}: QuizViewProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [score, setScore] = useState(initialScore);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  /** A–D 按鍵視覺反饋：短暫顯示對應選項縮放 */
  const [keyFeedbackIndex, setKeyFeedbackIndex] = useState<number | null>(null);
  const [answered, setAnswered] = useState(initialAnswered);
  const [sessionCorrect, setSessionCorrect] = useState(initialAnswered.filter(a => a.isCorrect).length);
  const [sessionWrong, setSessionWrong] = useState(initialAnswered.filter(a => !a.isCorrect).length);

  const theme = SUBJECT_THEME_MAP[subject];
  const current = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const progress = ((currentIndex + (confirmed ? 1 : 0)) / questions.length) * 100;

  const doConfirm = useCallback((optionIndex: number) => {
    if (confirmed) return;
    const isCorrect = optionIndex === current.normalizedAnswer;
    const nextScore = isCorrect ? score + 1 : score;
    const entry = { question: current, isCorrect, selected: optionIndex };
    const nextAnswered = [...answered, entry];
    setSelectedOption(optionIndex);
    setConfirmed(true);
    if (isCorrect) {
      setScore(s => s + 1);
      setSessionCorrect(c => c + 1);
    } else {
      setSessionWrong(w => w + 1);
    }
    setAnswered(nextAnswered);
    onSaveAnswer(current.id, isCorrect);
    onProgressSave?.({
      questions,
      currentIndex: Math.min(currentIndex + 1, questions.length - 1),
      answeredQuestions: nextAnswered,
      score: nextScore,
      type: quizType,
      startTime: initialStartTime,
    });
  }, [confirmed, current, onSaveAnswer, onProgressSave, questions, currentIndex, score, answered, quizType, initialStartTime]);

  const handleConfirm = useCallback(() => {
    if (selectedOption === null || confirmed) return;
    doConfirm(selectedOption);
  }, [selectedOption, confirmed, doConfirm]);

  const handleNext = useCallback(() => {
    if (isLast) {
      const wrongQs = answered.filter(a => !a.isCorrect).map(a => a.question);
      if (confirmed && selectedOption !== current.normalizedAnswer) {
        wrongQs.push(current);
      }
      onFinish(score, questions.length, wrongQs, answered);
      return;
    }
    // 清除自動跳題定時器，避免手動切換與自動跳題衝突
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    setCurrentIndex(i => i + 1);
    setSelectedOption(null);
    setConfirmed(false);
  }, [isLast, confirmed, selectedOption, current, score, questions.length, answered, onFinish]);

  const handleFinish = () => {
    const wrongQs = answered.filter(a => !a.isCorrect).map(a => a.question);
    onFinish(score, questions.length, wrongQs, answered);
  };

  // A–D 快捷鍵（受 shortcutEnabled 控制）；注音/IME 組字中不觸發，避免搶鍵
  useEffect(() => {
    if (!shortcutEnabled) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.isComposing) return; // 注音、日文等 IME 組字中不處理
      const target = e.target as HTMLElement;
      if (target?.closest?.('input, textarea, select')) return;
      if (confirmed) return;

      const key = e.key.toUpperCase();
      const idx = 'ABCD'.indexOf(key);
      if (idx >= 0 && idx < current.options.length) {
        e.preventDefault();
        e.stopPropagation();
        setKeyFeedbackIndex(idx);
        window.setTimeout(() => setKeyFeedbackIndex(null), 150);
        doConfirm(idx);
      }
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [current, confirmed, doConfirm, shortcutEnabled]);

  // 答對時顯示解析，停留 autoAdvanceDelayMs 後自動下一題（0 = 不自動）
  // 修正：只有在 confirmed 為 true 且正確時啟動，並確保 handleNext 被正確調用
  const autoAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const delayMs = autoAdvanceDelayMs > 0 ? autoAdvanceDelayMs : 0;
  useEffect(() => {
    const correctIndex = current?.normalizedAnswer;
    const isCorrect = confirmed && selectedOption !== null && correctIndex !== undefined && selectedOption === correctIndex;

    // 如果不符合自動跳題條件，直接返回
    if (!isCorrect || isLast || delayMs <= 0) return;

    const id = setTimeout(() => {
      handleNext();
    }, delayMs);
    autoAdvanceTimerRef.current = id;

    return () => {
      if (id) clearTimeout(id);
    };
  }, [confirmed, selectedOption, current, isLast, delayMs, handleNext]);

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
          <span>✓ {sessionCorrect} ✗ {sessionWrong}</span>
        </div>
      </div>

      {/* Question card */}
      <div className="bg-card rounded-2xl border shadow-sm p-5 space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs px-2 py-0.5 rounded-full subject-bg-${theme}-light subject-text-${theme} font-medium`}>
            {current.category}
          </span>
          {current.scenario && (
            <span className="text-xs text-muted-foreground">
              📌 {current.scenario}
            </span>
          )}
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground ml-auto shrink-0">
            選擇題
          </span>
          <QuestionFeedback questionId={current.id} userId={userId} />
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
            const isKeyFeedback = keyFeedbackIndex === i;
            return (
              <button
                key={i}
                onClick={() => !confirmed && setSelectedOption(i)}
                disabled={confirmed}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-150 flex items-start gap-3 ${optClass} ${isKeyFeedback ? 'scale-[0.98] ring-2 ring-primary/50' : 'scale-100'}`}
              >
                <span className="font-bold text-muted-foreground shrink-0">{optionLabels[i]}</span>
                <span>{opt}</span>
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {confirmed && (
          <div className={`p-3 rounded-xl text-sm space-y-2 ${selectedOption === current.normalizedAnswer ? 'bg-correct-light' : 'bg-wrong-light'
            }`}>
            <p className="font-bold mb-1">
              {selectedOption === current.normalizedAnswer ? '✅ 答對了！很棒～' : '💡 差一點點～ 看看下面的說明，下次一定可以！'}
            </p>
            {selectedOption !== current.normalizedAnswer && current.commonMisconception && (
              <div className="rounded-lg bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 p-2">
                <p className="font-medium text-amber-900 dark:text-amber-200 text-xs mb-0.5">💡 迷思診斷</p>
                <p className="text-amber-800 dark:text-amber-100 text-sm">{current.commonMisconception}</p>
              </div>
            )}
            {current.explanation && (
              <p className="text-muted-foreground">{current.explanation}</p>
            )}
          </div>
        )}
      </div>

      {/* Action buttons — 固定使用 bg-primary + text-white 確保對比可見（不依賴動態 gradient） */}
      <div className="flex gap-3">
        {!confirmed ? (
          <button
            onClick={handleConfirm}
            disabled={selectedOption === null}
            className={`flex-1 py-3 rounded-xl font-bold text-lg transition-all ${selectedOption !== null
              ? 'bg-primary text-white shadow-md active:scale-95 hover:opacity-95'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
          >
            確認答案 {shortcutEnabled && <span className="text-xs font-normal opacity-90">(或按 A–D)</span>}
          </button>
        ) : isLast ? (
          <button
            onClick={handleFinish}
            className="flex-1 py-3 rounded-xl font-bold text-lg bg-primary text-white shadow-md active:scale-95 hover:opacity-95 transition-all"
          >
            🎉 查看結果
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex-1 py-3 rounded-xl font-bold text-lg bg-primary text-white shadow-md active:scale-95 hover:opacity-95 transition-all"
          >
            下一題 →
          </button>
        )}
      </div>
    </div>
  );
}
