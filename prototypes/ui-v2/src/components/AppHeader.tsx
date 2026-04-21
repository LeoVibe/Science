import { useNavigate } from 'react-router-dom';
import { useSubject } from '@/context/SubjectContext';
import { SUBJECT_META, type SubjectTheme } from '@/data/mock';

/*
 * 1:1 對照 apps/v3_eidos/src/components/AppHeader.tsx
 * - 年級盾牌（三下）為 SVG，點擊原在主專案開啟設定 modal，雛形簡化為無動作
 * - 6 科目 pill（此處寫死 G3 有的 5 科 + 生活全開）
 * - 右側 📊 統計 / 🏫 本站 / ☰ 設定
 */

const SUBJECT_SHORT: Record<SubjectTheme, string> = {
  chinese: '國',
  math: '數',
  english: '英',
  science: '自',
  social: '社',
  life: '生',
};

// G3 有：國語、數學、英語、自然、社會（生活只有 G1/G2）— 與主專案 getSubjectsByGrade 一致
const SUBJECTS_G3: SubjectTheme[] = ['chinese', 'math', 'english', 'science', 'social'];

export default function AppHeader() {
  const { subject, setSubject } = useSubject();
  const navigate = useNavigate();
  const shieldColor = 'hsl(38 80% 52%)';

  return (
    <header className="sticky top-0 z-50 bg-card/90 backdrop-blur-md border-b">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* 年級盾牌 */}
          <button
            className="shrink-0 active:scale-95 transition-all hover:drop-shadow-md"
            title="個人設定"
          >
            <svg width="38" height="42" viewBox="0 0 36 40" fill="none">
              <path
                d="M18 1L2 8V20C2 29 9 36 18 39C27 36 34 29 34 20V8L18 1Z"
                fill={shieldColor}
              />
              <text
                x="13"
                y="16"
                textAnchor="middle"
                fill="white"
                fontSize="16"
                fontWeight="900"
                fontFamily="Nunito, sans-serif"
                dominantBaseline="middle"
              >
                三
              </text>
              <text
                x="24"
                y="28"
                textAnchor="middle"
                fill="white"
                fontSize="10"
                fontWeight="700"
                fontFamily="Nunito, sans-serif"
                dominantBaseline="middle"
                opacity="0.85"
              >
                下
              </text>
            </svg>
          </button>

          <div className="w-px h-6 bg-border/60 shrink-0" />

          {/* 科目 tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide flex-1">
            {SUBJECTS_G3.map(s => {
              const isActive = subject === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSubject(s)}
                  className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-2xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
                    isActive
                      ? 'shadow-sm active:scale-95 text-white'
                      : 'bg-secondary text-muted-foreground hover:bg-muted active:scale-95'
                  }`}
                  style={isActive ? { background: `hsl(var(--subject-${s}))` } : undefined}
                >
                  <span>{SUBJECT_META[s].icon}</span>
                  <span className="hidden sm:inline">{SUBJECT_META[s].name}</span>
                  <span className="sm:hidden">{SUBJECT_SHORT[s]}</span>
                </button>
              );
            })}
          </div>

          {/* Utility buttons */}
          <div className="flex gap-0.5 shrink-0">
            <button
              onClick={() => navigate('/report')}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-secondary transition-all flex items-center gap-0.5"
              title="學習統計"
            >
              📊<span className="hidden sm:inline ml-0.5">統計</span>
            </button>
            <button
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-secondary transition-all flex items-center gap-0.5"
              title="關於本站"
            >
              🏫<span className="hidden sm:inline ml-0.5">本站</span>
            </button>
            <button className="p-1.5 rounded-xl transition-all active:scale-95" title="設定">
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 sm:w-6 sm:h-6"
                fill="none"
                stroke={shieldColor}
                strokeWidth="3.5"
                strokeLinecap="round"
              >
                <path d="M4 8h16M4 16h16" />
                <circle cx="8" cy="8" r="1.5" fill={shieldColor} stroke="none" />
                <circle cx="16" cy="16" r="1.5" fill={shieldColor} stroke="none" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
