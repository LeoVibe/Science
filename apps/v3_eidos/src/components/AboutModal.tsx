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
            <li><strong className="text-foreground">1.0 版（2026/2/26）</strong> — 正式版上線：登入機制、錯題統計、題目審核機制、續答機制、連結防呆全面完成。</li>
            <li>0.9 版（2026/2/25）— 設定與管理升級：入站設定年級、各科目設定出版社，題庫管理與維護設定整合。</li>
            <li>0.8 版（2026/2/24）— 規劃題庫評分機制，嚴格處理真實課文、設計意涵與文字細膩度、與選項合理性。</li>
            <li>0.7 版（2026/2/21）— 產出新版介面設計：主選單、導覽分頁與學習流程互動體驗更新。</li>
            <li>0.6 版（2026/2/18）— 擴大題庫廣度與研究深度，擴充為三個出版社，設定出題深度與流程，AI不會自由發揮的出題。</li>
            <li>0.5 版（2026/2/10）— 多科目嘗試版（現為相容模式入口）。</li>
            <li>0.1 版（2026/1/3）— 初始版本，基本架構（現為相容模式入口）。</li>
          </ul>
          <div className="text-xs mt-2 space-y-1">
            <a href={withBase('history/v1_science/')} target="_blank" rel="noopener noreferrer" className="block font-bold text-primary hover:underline">v0.1 初版(自然科)</a>
            <a href={withBase('history/v2_currisite/')} target="_blank" rel="noopener noreferrer" className="block font-bold text-primary hover:underline">v0.2 多科目版</a>
          </div>
          <p className="text-xs mt-2">
            後續將依課程研究產出更多題庫，持續優化使用體驗。
          </p>
        </div>
      </div>
    </div>
  );
}
