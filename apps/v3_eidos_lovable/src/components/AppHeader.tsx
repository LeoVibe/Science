import { Grade, Semester, Publisher, Subject, SUBJECT_ICONS, SUBJECT_SHORT, SUBJECT_THEME_MAP, getSubjectsByGrade } from '@/data/config';

const GRADE_CN: Record<Grade, string> = { 1: '一', 2: '二', 3: '三', 4: '四', 5: '五', 6: '六' };
const SEM_CN: Record<Semester, string> = { 1: '上', 2: '下' };

// Ocean-fresh active pill styles
const SUBJECT_ACTIVE_STYLE: Record<string, React.CSSProperties> = {
  chinese: { background: 'hsl(350 50% 68%)', color: '#fff' },
  math: { background: 'hsl(200 60% 55%)', color: '#fff' },
  english: { background: 'hsl(16 65% 62%)', color: '#fff' },
  science: { background: 'hsl(168 45% 50%)', color: '#fff' },
  social: { background: 'hsl(42 60% 58%)', color: '#fff' },
  life: { background: 'hsl(280 40% 66%)', color: '#fff' },
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
          {/* Grade/Semester badge */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl font-extrabold text-sm sm:text-base active:scale-95 transition-all shrink-0 bg-primary text-primary-foreground shadow-sm hover:shadow-md"
            title="個人設定"
          >
            <span className="text-base">🎒</span>
            <span>{GRADE_CN[grade]}{SEM_CN[semester]}</span>
            <span className="text-[10px] opacity-70">▼</span>
          </button>

          {/* Subject pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide flex-1">
            {subjects.map(s => {
              const isActive = subject === s;
              const sTheme = SUBJECT_THEME_MAP[s];
              return (
                <button
                  key={s}
                  onClick={() => onSubjectChange(s)}
                  className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-2xl text-xs sm:text-sm font-bold transition-all shrink-0 active:scale-95 ${
                    isActive ? 'shadow-sm' : 'bg-secondary text-muted-foreground hover:bg-muted'
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
            <button onClick={onAbout} className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-secondary transition-all flex items-center gap-0.5" title="關於本站">
              🏫<span className="hidden sm:inline ml-0.5">本站</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
