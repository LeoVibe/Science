import { withBase } from '@/utils/basePath';

interface AboutModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AboutModal({ open, onClose }: AboutModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" />
      <div
        className="relative bg-card rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-muted hover:bg-muted-foreground/20 flex items-center justify-center text-lg transition-colors"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold mb-4">ℹ️ 關於這裡</h2>

        <div className="space-y-4 text-sm text-muted-foreground">
          <p>
            這是一個為我兒子，也為所有想陪孩子一起練習的家長設計的複習小空間。
          </p>
          <p className="italic">
            「我想把題目出得更能引發思考，讓練習不再是機械式的壓力。」
          </p>
          <p>📧 聯絡爸爸：yotta0280@gmail.com</p>

          <h3 className="text-foreground font-bold mt-4">📋 這裡的成長腳步</h3>
          <ul className="space-y-1.5 list-disc list-inside text-[13px]">
            <li><strong className="text-foreground">v1.1（2026/2/27）</strong> — 幫測驗頁加了小燈泡，分享我的出題心法。</li>
            <li><strong className="text-foreground">v1.0（2026/2/26）</strong> — 練習跟錯題紀錄都做好了，孩子可以接續練習。</li>
            <li>v0.9（2026/2/25）— 開始可以選年級和出版社了。</li>
            <li>v0.8（2026/2/24）— 我開始對題目品質變得挑剔，要求 AI 不能亂出。</li>
            <li>v0.6（2026/2/18）— 讓 AI 學習各家課本內容後再出題。</li>
            <li>v0.1（2026/1/3）— 只有自然科的第一個草稿版本。</li>
          </ul>
          <div className="mt-6 pt-4 border-t border-border/40">
            <p className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
              <span>🏛️</span> 之前的草稿 (舊版系統)
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <a href={withBase('history/v1_science/index.html')} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 bg-secondary/50 hover:bg-secondary rounded-lg text-xs font-bold text-primary transition-colors border border-border/50">v0.1 草稿版</a>
              <a href={withBase('history/v2_currisite/index.html')} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 bg-secondary/50 hover:bg-secondary rounded-lg text-xs font-bold text-primary transition-colors border border-border/50">v0.2 實驗版</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
