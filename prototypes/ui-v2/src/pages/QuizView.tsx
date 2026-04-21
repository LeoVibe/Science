import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_QUESTIONS } from '@/data/mock';

const SUBJECT: 'chinese' = 'chinese';
const optionLabels = ['A', 'B', 'C', 'D'];

/*
 * 本頁 JSX 結構 1:1 對應 apps/v3_eidos/src/components/QuizView.tsx
 * 選項用純文字 badge（font-bold text-muted-foreground），非方形底色
 * 不引入 shake、vibrate、✓/✕ 放大圖示、aria-live alert
 */

export default function QuizView() {
  const [index, setIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [score, setScore] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionWrong, setSessionWrong] = useState(0);
  const navigate = useNavigate();

  const questions = MOCK_QUESTIONS;
  const currentIndex = index;
  const current = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const theme = SUBJECT;
  const progress = ((currentIndex + (confirmed ? 1 : 0)) / questions.length) * 100;

  const doConfirm = (optionIndex: number) => {
    if (confirmed) return;
    const isCorrect = optionIndex === current.answerIndex;
    setSelectedOption(optionIndex);
    setConfirmed(true);
    if (isCorrect) {
      setScore(s => s + 1);
      setSessionCorrect(c => c + 1);
    } else {
      setSessionWrong(w => w + 1);
    }
  };

  const handleConfirm = () => {
    if (selectedOption === null || confirmed) return;
    doConfirm(selectedOption);
  };

  const handleNext = () => {
    if (isLast) {
      navigate('/result');
      return;
    }
    setIndex(i => i + 1);
    setSelectedOption(null);
    setConfirmed(false);
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.isComposing) return;
      const target = e.target as HTMLElement;
      if (target?.closest?.('input, textarea, select')) return;
      if (confirmed) return;

      const key = e.key.toUpperCase();
      const idx = 'ABCD'.indexOf(key);
      if (idx >= 0 && idx < current.options.length) {
        e.preventDefault();
        e.stopPropagation();
        doConfirm(idx);
      }
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [current, confirmed]);

  if (!current) return null;

  return (
    <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
      {/* Top bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="text-muted-foreground hover:text-foreground transition-colors text-lg"
        >
          ← 返回
        </button>
        <span className="text-sm text-muted-foreground ml-auto">基本挑戰</span>
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
          <span>
            第 {currentIndex + 1} 題 / 共 {questions.length} 題
          </span>
          <span>
            ✓ {sessionCorrect} ✗ {sessionWrong}
          </span>
        </div>
      </div>

      {/* Question card */}
      <div className="bg-card rounded-2xl border shadow-sm p-5 space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-xs px-2 py-0.5 rounded-full subject-bg-${theme}-light subject-text-${theme} font-medium`}
          >
            {current.category}
          </span>
          {current.scenario && (
            <span className="text-xs text-muted-foreground">📌 {current.scenario}</span>
          )}
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground ml-auto shrink-0">
            選擇題
          </span>
        </div>

        <p className="text-lg font-medium leading-relaxed">{current.question}</p>

        <div className="space-y-2">
          {current.options.map((opt, i) => {
            let optClass = 'bg-background border hover:border-primary/50';
            if (confirmed) {
              if (i === current.answerIndex) {
                optClass = 'bg-correct-light border-2 border-correct';
              } else if (i === selectedOption && i !== current.answerIndex) {
                optClass = 'bg-wrong-light border-2 border-wrong';
              } else {
                optClass = 'bg-muted/50 border opacity-60';
              }
            } else if (i === selectedOption) {
              optClass = `subject-bg-${theme}-light border-2 subject-border-${theme}`;
            }

            // 改動 Q2.5-a：A/B/C/D badge 從純文字升級為 28×28 方形 badge
            let badgeClass = 'bg-muted text-primary';
            if (confirmed && i === current.answerIndex) {
              badgeClass = 'bg-correct text-white';
            } else if (confirmed && i === selectedOption && i !== current.answerIndex) {
              badgeClass = 'bg-wrong text-white';
            } else if (!confirmed && i === selectedOption) {
              badgeClass = `subject-bg-${theme} text-white`;
            }

            return (
              <button
                key={i}
                onClick={() => !confirmed && setSelectedOption(i)}
                disabled={confirmed}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-150 flex items-center gap-3 ${optClass}`}
              >
                <span
                  className={`shrink-0 w-7 h-7 rounded-lg font-bold grid place-items-center text-sm transition-colors ${badgeClass}`}
                  aria-hidden="true"
                >
                  {optionLabels[i]}
                </span>
                <span className="flex-1">{opt}</span>
                {/* 改動 Q2.5-e：正解 ✓ / 錯選 ✕ 圖示（色盲友善，不只靠顏色） */}
                {confirmed && i === current.answerIndex && (
                  <span className="text-correct text-xl font-black shrink-0" aria-label="正解">✓</span>
                )}
                {confirmed && i === selectedOption && i !== current.answerIndex && (
                  <span className="text-wrong text-xl font-black shrink-0" aria-label="錯選">✕</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {confirmed && (
          <div
            className={`p-3 rounded-xl text-sm space-y-2 ${
              selectedOption === current.answerIndex ? 'bg-correct-light' : 'bg-wrong-light'
            }`}
          >
            <p className="font-bold mb-1">
              {selectedOption === current.answerIndex
                ? '✅ 答對了！很棒～'
                : '💡 差一點點～ 看看下面的說明，下次一定可以！'}
            </p>
            {selectedOption !== current.answerIndex && current.commonMisconception && (
              // 改動 Q2.6-b：迷思診斷卡從硬編碼 bg-amber-100 改用 token（Dark Mode 自動一致）
              <div className="rounded-lg bg-accent/10 border border-accent/30 p-2.5">
                <p className="font-semibold text-accent text-sm mb-1">
                  💡 迷思診斷
                </p>
                <p className="text-foreground text-sm leading-relaxed">
                  {current.commonMisconception}
                </p>
              </div>
            )}
            <p className="text-muted-foreground">{current.explanation}</p>
          </div>
        )}
      </div>

      {/* Action buttons — 遵循 UX 研究：左回報 (1/5) | 右確認 (4/5) */}
      <div className="flex gap-3 items-stretch">
        <div className="flex-[1] flex">
          <button
            className="w-full rounded-xl bg-card border shadow-sm hover:shadow-md text-muted-foreground hover:text-foreground active:scale-95 transition-all flex items-center justify-center"
            aria-label="回報問題"
          >
            🚩
          </button>
        </div>
        <div className="flex-[4] flex">
          {!confirmed ? (
            <button
              onClick={handleConfirm}
              disabled={selectedOption === null}
              className={`flex-1 py-3 rounded-xl font-bold text-lg transition-all ${
                selectedOption !== null
                  ? 'bg-primary text-white shadow-md active:scale-95 hover:opacity-95'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
            >
              確認答案 <span className="text-xs font-normal opacity-90 hidden sm:inline">(或按 A–D)</span>
            </button>
          ) : isLast ? (
            <button
              onClick={handleNext}
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

      {/* 本頁改動對照 */}
      <p className="text-[11px] text-muted-foreground text-center leading-relaxed pt-2">
        <strong className="text-foreground">本頁套用：</strong>
        <span className="mx-1">Q2.5-a</span>（選項 A/B/C/D 方形 badge 28×28）・
        <span className="mx-1">Q2.5-e</span>（正解 ✓ / 錯選 ✕ 右側圖示）・
        <span className="mx-1">Q2.6-b</span>（迷思診斷卡改 token 底色）
      </p>
    </div>
  );
}
