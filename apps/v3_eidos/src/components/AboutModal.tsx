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

        <h2 className="text-xl font-bold mb-4">ℹ️ 關於本站</h2>

        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">Eidos 課後複習網站</strong>是一個為小學生設計的多學科複習練習平台。
          </p>
          <p>
            本站為 vibe coding 練習專案，由 Antigravity + Cursor 協作開發。
          </p>
          <p>📧 聯絡信箱：yotta0280@gmail.com</p>

          <h3 className="text-foreground font-bold mt-4">📋 更版資訊</h3>
          <ul className="space-y-1 list-disc list-inside">
            <li>0.1 版 2026/1/3 — 初始版本，基本架構</li>
            <li>0.2 版 2026/1/10 — 新增多科目支援</li>
            <li>0.3 版 2026/1/20 — 新增統計功能</li>
            <li>0.4 版 2026/2/1 — 新增錯題本</li>
            <li>0.5 版 2026/2/10 — 新增分課練習</li>
            <li>0.6 版 2026/2/18 — UI 全面優化</li>
          </ul>
          <p className="text-xs mt-2">
            後續將依課程研究產出更多題庫，持續優化使用體驗。
          </p>
        </div>
      </div>
    </div>
  );
}
