import { Grade, Semester, Publisher, Subject, SUBJECT_ICONS, SUBJECT_SHORT, SUBJECT_THEME_MAP, getSubjectsByGrade } from '@/data/config';

const GRADE_CN: Record<Grade, string> = { 1: '一', 2: '二', 3: '三', 4: '四', 5: '五', 6: '六' };
const SEM_CN: Record<Semester, string> = { 1: '上', 2: '下' };

// Warm-amber active pill styles（與 index.css subject 色同步）
const SUBJECT_ACTIVE_STYLE: Record<string, React.CSSProperties> = {
  chinese: { background: 'hsl(345 42% 62%)', color: '#fff' },
  math: { background: 'hsl(200 45% 55%)', color: '#fff' },
  english: { background: 'hsl(8 50% 60%)', color: '#fff' },
  science: { background: 'hsl(165 35% 50%)', color: '#fff' },
  social: { background: 'hsl(85 35% 50%)', color: '#fff' },
  life: { background: 'hsl(275 32% 62%)', color: '#fff' },
};

interface AppHeaderProps {
  grade: Grade;
  semester: Semester;
  publisher: Publisher;
  subject: Subject;
  onSubjectChange: (s: Subject) => void;
  onOpenSettings: () => void;
  onLearningReport: () => void;
  onAbout: () => void;
}

export default function AppHeader({
  grade, semester, publisher, subject,
  onSubjectChange, onOpenSettings,
  onLearningReport, onAbout,
}: AppHeaderProps) {
  const subjects = getSubjectsByGrade(grade);

  return (
    <header className="sticky top-0 z-50 bg-card/90 backdrop-blur-md border-b">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Grade/Semester — 琥珀盾牌徽章 */}
          <button
            onClick={onOpenSettings}
            className="shrink-0 active:scale-95 transition-all hover:drop-shadow-md"
            title="個人設定"
          >
            <svg width="42" height="46" viewBox="0 0 36 40" fill="none">
              <path
                d="M18 1L2 8V20C2 29 9 36 18 39C27 36 34 29 34 20V8L18 1Z"
                fill="hsl(38 80% 52%)"
              />
              <text x="13" y="16" textAnchor="middle" fill="white" fontSize="16" fontWeight="900" fontFamily="Nunito, sans-serif" dominantBaseline="middle">{GRADE_CN[grade]}</text>
              <text x="24" y="28" textAnchor="middle" fill="white" fontSize="10" fontWeight="700" fontFamily="Nunito, sans-serif" dominantBaseline="middle" opacity="0.85">{SEM_CN[semester]}</text>
            </svg>
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-border/60 shrink-0" />

          {/* Subject pills */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide flex-1">
            {subjects.map(s => {
              const isActive = subject === s;
              const sTheme = SUBJECT_THEME_MAP[s];
              return (
                <button
                  key={s}
                  onClick={() => onSubjectChange(s)}
                  className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-2xl text-xs sm:text-sm font-bold transition-all shrink-0 active:scale-95 ${isActive ? 'shadow-sm' : 'bg-secondary text-muted-foreground hover:bg-muted'
                    }`}
                  style={isActive ? SUBJECT_ACTIVE_STYLE[sTheme] : undefined}
                >
                  <span>{SUBJECT_ICONS[s]}</span>
                  <span className="hidden sm:inline">{s}</span>
                  <span className="sm:hidden">{SUBJECT_SHORT[s]}</span>
                </button>
              );
            })}
          </div>

          {/* Utility buttons */}
          <div className="flex gap-0.5 shrink-0">
            <button onClick={onLearningReport} className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-secondary transition-all flex items-center gap-0.5" title="學習統計">
              📊<span className="hidden sm:inline ml-0.5">統計</span>
            </button>
            <button onClick={onAbout} className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-secondary transition-all flex items-center gap-0.5" title="關於這裡">
              🏫<span className="hidden sm:inline ml-0.5">紀錄</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
