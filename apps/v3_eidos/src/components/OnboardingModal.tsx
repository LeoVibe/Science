import { useEffect, useState } from 'react';
import type { Grade } from '@/data/config';
import { CROSS_SUBJECT_PRINCIPLE } from '@/data/subjectPrincipleContent';

const HAS_SEEN_KEY = 'hasSeenValueOnboarding';

export function hasSeenValueOnboarding(): boolean {
  try {
    return localStorage.getItem(HAS_SEEN_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setHasSeenValueOnboarding(): void {
  try {
    localStorage.setItem(HAS_SEEN_KEY, 'true');
  } catch { }
}

const GRADE_LABELS: Record<Grade, string> = {
  1: '一', 2: '二', 3: '三', 4: '四', 5: '五', 6: '六',
};

interface OnboardingModalProps {
  onClose: () => void;
  /** 前往出題原則大廳 (About -> 出題原則) */
  onGoToPrinciple: () => void;
  /** 是否已選定年級（完成過設定） */
  hasChosenGrade?: boolean;
  /** 當前年級，用於動態呈現該年級策略 */
  grade?: Grade;
}

export default function OnboardingModal({ onClose, onGoToPrinciple, hasChosenGrade = false, grade }: OnboardingModalProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card rounded-3xl shadow-xl border border-border max-w-md w-full max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-black text-foreground">陪孩子一起複習</h2>
            <button
              type="button"
              onClick={() => {
                setHasSeenValueOnboarding();
                onClose();
              }}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-border transition-colors text-sm font-bold"
              aria-label="關閉"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-muted-foreground italic">
            「我發現在陪兒子練習時，加一點點心思，他學得更有成就感。」
          </p>

          {/* 情境 A：已選定年級 — 動態推播該年級策略 */}
          {hasChosenGrade && grade && (
            <div className="bg-primary/10 rounded-2xl p-4 border border-primary/20">
              <h3 className="font-bold text-foreground text-sm mb-1.5">
                📌 {GRADE_LABELS[grade]}年級的練習重點
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                題目都依據孩子的成長階段設計過了。您可以點擊測驗頁面上的「小燈泡」，看看我是怎麼幫孩子出題的。
              </p>
            </div>
          )}

          {/* 情境 B：未設定年級 */}
          {!hasChosenGrade && (
            <p className="text-xs text-muted-foreground">
              請先選擇年級與學期，之後可以在各科測驗頁看見我的「命題心法」。
            </p>
          )}

          <div className="space-y-3">
            <div className="bg-primary/10 rounded-2xl p-4 border border-primary/20">
              <h3 className="font-bold text-foreground text-sm mb-1.5">🧠 {CROSS_SUBJECT_PRINCIPLE.principles[0].title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {CROSS_SUBJECT_PRINCIPLE.principles[0].body}
              </p>
            </div>
            <div className="bg-accent/10 rounded-2xl p-4 border border-accent/20">
              <h3 className="font-bold text-foreground text-sm mb-1.5">✨ {CROSS_SUBJECT_PRINCIPLE.principles[1].title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {CROSS_SUBJECT_PRINCIPLE.principles[1].body}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setHasSeenValueOnboarding();
                onClose();
                onGoToPrinciple();
              }}
              className="w-full py-2.5 rounded-xl font-bold text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              👉 看看爸爸是怎麼出題的
            </button>
            <button
              type="button"
              onClick={() => {
                setHasSeenValueOnboarding();
                onClose();
              }}
              className="w-full py-2.5 rounded-xl font-bold text-sm bg-muted text-muted-foreground hover:bg-border transition-colors"
            >
              稍後再說
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
