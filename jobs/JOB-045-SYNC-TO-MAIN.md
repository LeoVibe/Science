# JOB-045 同步至主專案說明

> 本檔用於將 JOB-045 的實作從 worktree 同步到主專案  
> 主專案路徑：`/Users/s389080/Documents/doc/work/0_AI_Project/eidosProject`

## 一、請在主專案「新增」的兩個檔案

### 1. `apps/v3_eidos/src/data/subjectGuideContent.ts`

（請在主專案建立此檔，內容如下）

```ts
import type { Grade, Subject } from '@/data/config';

export interface SubjectGuideSection {
  title: string;
  body: string;
}

export interface SubjectGuideContent {
  title: string;
  sections: SubjectGuideSection[];
}

/**
 * 依年級與科目取得單科出題指南內容。
 * 目前以測試用文案為主，保留未來依參數讀取 CMS/API 的彈性。
 */
export function getSubjectGuideContent(grade: Grade, subject: Subject): SubjectGuideContent {
  if (grade === 3 && subject === '國語') {
    return {
      title: 'G3 國語科命題心法：從死背生字，走向語境的真實理解',
      sections: [
        { title: '📈 4-4-2 認知配比革命', body: '三年級是語文過渡的關鍵。我們捨棄了九成的「抄寫注音」背誦題，轉而將配比重押在 40% 的「邏輯推論 (Inferential)」與 20% 的「情境決策 (Contextual)」。' },
        { title: '📖 長文本降載策略', body: '即使是長文素養題，我們也堅持加入 【在閱讀科學百科時】 等背景標籤，減少兒童大腦的「情境載入阻力」。' },
        { title: '🎯 拒絕截搭題的誘惑', body: '我們的錯誤選項，精準對焦在兒童最常犯的「表面字義曲解」與「以偏概全」。' },
      ],
    };
  }
  return {
    title: `${grade}年級 ${subject} 出題指南`,
    sections: [{ title: '大腦友善三原則', body: '本平台題目依認知負荷與情境設計，避免盲猜、強化推論。詳細內容請見「關於 → 出題指南」。' }],
  };
}

export const CROSS_SUBJECT_GUIDE = {
  title: 'Eidos 出題指南：我們如何為孩子構築防盲猜的測驗大腦',
  principles: [
    { title: '原則一：大腦友善的同理心投射', body: '我們不考冷冰冰的選擇題。藉由賦予每個題目情境角色，我們讓孩子的視覺快速建立場景，專注於推論而非與死板的文字博鬥。' },
    { title: '原則二：迷思誘答診斷 (Distractor Design)', body: '本平台的錯誤選項絕非亂數產生。每一個選項都是為了抓出「孩子在該認知階段特有的盲區」而設計。選錯了，我們就有機會徹底治癒盲點。' },
  ],
} as const;
```

### 2. `apps/v3_eidos/src/components/SubjectGuideDrawer.tsx`

（請在主專案建立此檔，內容如下）

```tsx
import { useEffect } from 'react';
import type { SubjectGuideContent } from '@/data/subjectGuideContent';

interface SubjectGuideDrawerProps {
  open: boolean;
  onClose: () => void;
  content: SubjectGuideContent;
}

export default function SubjectGuideDrawer({ open, onClose, content }: SubjectGuideDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[105] bg-black/20 backdrop-blur-[2px] animate-in fade-in duration-200" aria-hidden onClick={onClose} />
      <aside className="fixed top-0 right-0 bottom-0 z-[106] w-full max-w-md bg-card border-l border-border shadow-xl animate-in slide-in-from-right duration-200 overflow-y-auto" role="dialog" aria-label="本科出題指南">
        <div className="sticky top-0 flex items-center justify-between gap-2 p-4 border-b border-border bg-card/95 backdrop-blur">
          <h2 className="font-black text-foreground text-base">📖 本科出題指南</h2>
          <button type="button" onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-border transition-colors text-sm font-bold shrink-0" aria-label="關閉">✕</button>
        </div>
        <div className="p-4 space-y-4">
          <h3 className="font-bold text-foreground text-sm leading-snug">{content.title}</h3>
          {content.sections.map((sec, i) => (
            <div key={i} className="bg-primary/10 rounded-2xl p-4 border border-primary/20 space-y-1.5">
              <h4 className="font-bold text-foreground text-xs">{sec.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{sec.body}</p>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}
```

---

## 二、請在主專案「修改」的檔案與要點

- **MainMenu.tsx**：新增 import `SubjectGuideDrawer`、`getSubjectGuideContent`；新增 state `subjectGuideOpen`、`subjectGuideContent`；在卡片最上方加「右上方」區塊：按鈕「📖 本科出題指南」+ `<SubjectGuideDrawer open={subjectGuideOpen} onClose=... content={subjectGuideContent} />`。
- **OnboardingModal.tsx**：新增 props `onGoToGuide`、`hasChosenGrade?`、`grade?`；引用 `CROSS_SUBJECT_GUIDE`；依 hasChosenGrade/grade 顯示年級策略區塊或未設定提示；按鈕改「前往出題指南」、呼叫 `onGoToGuide`。
- **Index.tsx**：OnboardingModal 的 `onGoToDeepDive` 改為 `onGoToGuide`，並傳入 `hasChosenGrade={!!loadUserProfile()?.setupComplete}`、`grade={grade}`。
- **AboutView.tsx**：deepdive Tab 的 label 改為「📖 出題指南」；該 Tab 區塊標題改為「出題指南」。
- **InsightDrawer.tsx**：「關於 → 研究深探」改為「關於 → 出題指南」。

---

## 三、完工報告

將 `jobs/JOB-045-Report.md` 複製到主專案的 `jobs/` 下（或從本 worktree 的 `jobs/JOB-045-Report.md` 複製）。

---

## 四、建議作法

1. **手動複製**：從 worktree 目錄  
   `~/.cursor/worktrees/eidosProject/bio/`  
   將上述新檔與已改過的檔覆蓋到主專案對應路徑。
2. **或在主專案開新對話**：在 Cursor 開啟主專案資料夾後，說：「請依 `jobs/JOB-045-SYNC-TO-MAIN.md`（或 JOB-045-Report）與派工單 JOB-045，在主專案實作 JOB-045，包含新增 subjectGuideContent.ts、SubjectGuideDrawer.tsx，並修改 MainMenu、OnboardingModal、Index、AboutView、InsightDrawer。」
