import { useEffect } from 'react';
import type { SubjectPrincipleContent } from '@/data/subjectPrincipleContent';

interface InsightDrawerProps {
  open: boolean;
  onClose: () => void;
  /** 本科出題原則文案 */
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
          {/* Section: AI 專家心法 - 改由完全資料驅動，包含配比說明 */}
          {principleContent && (
            <section className="space-y-3 pt-2">
              <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                🎯 {principleContent.title}
              </h3>
              <div className="space-y-3">
                {principleContent.sections.map((sec, i) => (
                  <div key={i} className="bg-amber-50/50 rounded-2xl p-4 border border-amber-200/30 space-y-1.5">
                    <h4 className="font-bold text-amber-800 text-[11px]">{sec.title}</h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{sec.body}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <p className="text-[10px] text-muted-foreground/60 text-center pt-4 italic">
            出題研究
          </p>
        </div>
      </aside>
    </>
  );
}
