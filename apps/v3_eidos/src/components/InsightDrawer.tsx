import { useEffect } from 'react';
import type { SubjectPrincipleContent } from '@/data/subjectPrincipleContent';

interface InsightDrawerProps {
  open: boolean;
  onClose: () => void;
  /** 本科出題原則文案（學習重點＋三層學習規劃） */
  principleContent?: SubjectPrincipleContent;
}

export default function InsightDrawer({ open, onClose, principleContent }: InsightDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [open, onClose]);

  if (!open) return null;

  const layers = principleContent?.researchLayers;

  return (
    <>
      <div
        className="fixed inset-0 z-[105] bg-black/20 backdrop-blur-[2px] animate-in fade-in duration-200"
        aria-hidden
        onClick={onClose}
      />
      <aside
        className="fixed top-0 right-0 bottom-0 z-[106] w-full max-w-sm bg-card border-l border-border shadow-xl animate-in slide-in-from-right duration-200 overflow-y-auto"
        role="dialog"
        aria-label="AI 專家說"
      >
        <div className="sticky top-0 flex items-center justify-between gap-2 p-4 border-b border-border bg-card/95 backdrop-blur">
          <h2 className="font-black text-foreground text-base">💡 AI 專家說</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-border transition-colors text-sm font-bold shrink-0"
            aria-label="關閉"
          >
            ✕
          </button>
        </div>
        <div className="p-4 space-y-6">
          {principleContent && (
            <section className="space-y-2 pt-2 border-b border-border/60 pb-4">
              <h3 className="font-bold text-foreground text-sm leading-snug">{principleContent.title}</h3>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                先從這一科「學習重點」看起，再往下了解我們在出題方向、本冊焦點與學習節奏上的規劃。
              </p>
            </section>
          )}

          {principleContent && principleContent.sections.length > 0 && (
            <section className="space-y-3 pt-0">
              <h3 className="font-bold text-foreground text-sm flex items-center gap-2">學習重點</h3>
              <div className="space-y-3">
                {principleContent.sections.map((sec, i) => (
                  <div key={i} className="rounded-2xl p-4 border border-border bg-muted/30 space-y-1.5">
                    <h4 className="font-bold text-foreground text-[11px]">{sec.title}</h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{sec.body}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {layers && (
            <section className="space-y-3 pt-2 border-t border-border/60">
              <h3 className="font-bold text-foreground text-xs uppercase tracking-wide text-muted-foreground">
                學習規劃
              </h3>
              <div className="space-y-3">
                {[layers.r2, layers.r3, layers.r1].map((sec, i) => (
                  <div
                    key={i}
                    className="rounded-2xl p-4 border border-border bg-secondary/40 space-y-1.5"
                  >
                    <h4 className="font-bold text-primary text-[11px] leading-snug">{sec.title}</h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{sec.body}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <p className="text-[10px] text-muted-foreground/70 text-center pt-2 leading-relaxed">
            從學習節奏、科目方向到本冊課次，我們層層把關，讓練習更貼近真實學習。
          </p>
        </div>
      </aside>
    </>
  );
}
