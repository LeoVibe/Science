import { useState, useEffect } from 'react';
import {
  Grade,
  Semester,
  Subject,
  Publisher,
  APP_CONFIG,
  getSubjectsByGrade,
  SEMESTER_NAMES,
  SUBJECT_ICONS,
} from '@/data/config';
import libraryData from '@/data/libraryStats.json';

export interface LibraryConfig {
  grades: Partial<
    Record<
      Grade,
      {
        enabled: boolean;
        semesters: Partial<
          Record<
            Semester,
            {
              enabled: boolean;
              subjects: Partial<
                Record<
                  Subject,
                  {
                    enabled: boolean;
                    publishers: Publisher[];
                  }
                >
              >;
            }
          >
        >;
      }
    >
  >;
}

const STORAGE_KEY = 'EIDOS_LIBRARY_CONFIG';

const DEFAULT_CONFIG: LibraryConfig = {
  grades: Object.fromEntries(
    APP_CONFIG.grades.map((g) => {
      const grade = g as Grade;
      const isDefaultGrade = grade === 3 || grade === 4 || grade === 5;

      const semesters = Object.fromEntries(
        ([1, 2] as Semester[]).map((s) => {
          const sem = s as Semester;
          const enabled = isDefaultGrade && sem === 2; // 預設開放 G3/G4/G5 下學期
          return [
            sem,
            {
              enabled,
              subjects: {},
            },
          ];
        })
      ) as LibraryConfig['grades'][Grade]['semesters'];

      return [
        grade,
        {
          enabled: isDefaultGrade, // G3/G4/G5 預設開啟，其餘關閉
          semesters,
        },
      ];
    })
  ) as LibraryConfig['grades'],
};

const PUBLISHER_COLORS: Record<Publisher, string> = {
  康軒: 'hsl(200 55% 55%)',
  南一: 'hsl(350 50% 65%)',
  翰林: 'hsl(168 45% 50%)',
};

/** 品質等級對應的樣式（與前台題庫總覽一致） */
function getQualityStyle(quality: string): string {
  if (!quality) return 'bg-muted text-muted-foreground';
  if (quality.includes('L5') || quality.includes('L4+') || quality.includes('L4'))
    return 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400';
  if (quality.includes('L3')) return 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400';
  if (quality.includes('L2')) return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400';
  return 'bg-muted text-muted-foreground';
}

export default function AdminLibraryManager() {
  const [config, setConfig] = useState<LibraryConfig>(DEFAULT_CONFIG);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as LibraryConfig;
      setConfig((prev) => ({
        ...prev,
        grades: { ...prev.grades, ...parsed.grades },
      }));
    } catch (e) {
      console.error('Failed to parse library config', e);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const toggleGrade = (grade: Grade) => {
    setConfig((prev) => {
      const g = prev.grades[grade] ?? { enabled: false, semesters: {} };
      return {
        ...prev,
        grades: { ...prev.grades, [grade]: { ...g, enabled: !g.enabled } },
      };
    });
    setSaved(false);
  };

  const toggleSemester = (grade: Grade, semester: Semester) => {
    setConfig((prev) => {
      const g = prev.grades[grade]!;
      const s = g.semesters[semester] ?? { enabled: false, subjects: {} };
      return {
        ...prev,
        grades: {
          ...prev.grades,
          [grade]: {
            ...g,
            semesters: { ...g.semesters, [semester]: { ...s, enabled: !s.enabled } },
          },
        },
      };
    });
    setSaved(false);
  };

  const toggleSubject = (grade: Grade, semester: Semester, subject: Subject) => {
    setConfig((prev) => {
      const g = prev.grades[grade]!;
      const s = g.semesters[semester]!;
      const sub = s.subjects[subject] ?? { enabled: false, publishers: [...APP_CONFIG.publishers] };
      return {
        ...prev,
        grades: {
          ...prev.grades,
          [grade]: {
            ...g,
            semesters: {
              ...g.semesters,
              [semester]: {
                ...s,
                subjects: { ...s.subjects, [subject]: { ...sub, enabled: !sub.enabled } },
              },
            },
          },
        },
      };
    });
    setSaved(false);
  };

  const togglePublisher = (grade: Grade, semester: Semester, subject: Subject, publisher: Publisher) => {
    setConfig((prev) => {
      const g = prev.grades[grade]!;
      const s = g.semesters[semester]!;
      const sub = s.subjects[subject] ?? { enabled: true, publishers: [] };
      const list = sub.publishers.includes(publisher)
        ? sub.publishers.filter((p) => p !== publisher)
        : [...sub.publishers, publisher];
      return {
        ...prev,
        grades: {
          ...prev.grades,
          [grade]: {
            ...g,
            semesters: {
              ...g.semesters,
              [semester]: {
                ...s,
                subjects: { ...s.subjects, [subject]: { ...sub, publishers: list } },
              },
            },
          },
        },
      };
    });
    setSaved(false);
  };

  const publisherStats = (libraryData as { publisherStats?: Record<string, { units: number; questions: number; quality: string }> })
    .publisherStats ?? {};

  return (
    <div className="max-w-2xl mx-auto px-4 pb-16 animate-in fade-in duration-200">
      {/* 頂部：標題（對齊前台學習與使用設定的 header 概念） */}
      <div className="pt-4 pb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📚</span>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-foreground">題庫管理</h1>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              開放年級、學期與各科出版社，設定將套用至全站題庫總覽與複習入口。
            </p>
          </div>
        </div>
      </div>

      {/* 1. 頂層：全局年級開關區（精簡版面，使用按鈕而非 Switch） */}
      <div className="bg-card rounded-2xl border p-3 sm:p-4 mb-5">
        <label className="block text-[11px] font-bold text-muted-foreground mb-2 tracking-wider">
          年級開放狀態
        </label>
        <div className="flex flex-wrap gap-1.5">
          {APP_CONFIG.grades.map((g) => {
            const grade = g as Grade;
            const isEnabled = config.grades[grade]?.enabled ?? false;
            return (
              <button
                key={grade}
                type="button"
                onClick={() => toggleGrade(grade)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                  isEnabled
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {grade} 年級
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. 內容層：年級細部設定區塊（僅顯示已啟用年級） */}
      <div className="space-y-8">
        {APP_CONFIG.grades.map((g) => {
          const grade = g as Grade;
          const gConfig = config.grades[grade];
          const isGEnabled = gConfig?.enabled ?? false;
          if (!isGEnabled) return null;

          const subjects = getSubjectsByGrade(grade);

          return (
            <div key={grade} className="bg-card rounded-2xl border overflow-hidden">
              {/* 年級標題 */}
              <div className="px-4 py-3 bg-muted/40 border-b flex items-center gap-2">
                <span className="font-black text-sm text-foreground">G{grade}</span>
                <span className="text-sm font-bold text-muted-foreground">{grade}年級細部設定</span>
              </div>

              <div className="p-4 sm:p-5">
                <div className="grid gap-4 md:grid-cols-2">
                  {([1, 2] as Semester[]).map((sem) => {
                    const sConfig = gConfig?.semesters[sem];
                    const isSEnabled = sConfig?.enabled ?? false;

                    return (
                      <div key={`${grade}-S${sem}`} className="border rounded-xl p-3 sm:p-4">
                        {/* 學期層：學期整體啟用開關 */}
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-[11px] font-bold text-muted-foreground tracking-wider">
                            {SEMESTER_NAMES[sem]}
                          </label>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isSEnabled ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              {isSEnabled ? '已開放' : '未開放'}
                            </span>
                            <Switch
                              checked={isSEnabled}
                              onChange={() => toggleSemester(grade, sem)}
                              size="sm"
                            />
                          </div>
                        </div>

                        {/* 科目清單：科目啟用開關 + 出版社按鈕 */}
                        <div className={`space-y-3 ${!isSEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
                          {subjects.map((subject) => {
                            const subConfig = sConfig?.subjects[subject];
                            const isSubEnabled = subConfig?.enabled ?? false;
                            const publishers = subConfig?.publishers ?? [];

                            return (
                              <div
                                key={subject}
                                className={`rounded-lg border p-2.5 transition-colors ${
                                  isSubEnabled ? 'border-border bg-background' : 'border-border/50 bg-muted/20'
                                }`}
                              >
                                {/* 科目列：科目名在左、啟用開關在右 */}
                                <div className="flex items-center justify-between gap-2 mb-2">
                                  <span className="flex items-center gap-1.5 font-bold text-sm">
                                    <span>{SUBJECT_ICONS[subject]}</span>
                                    {subject}
                                  </span>
                                  <Switch
                                    checked={isSubEnabled}
                                    onChange={() => toggleSubject(grade, sem, subject)}
                                    disabled={!isSEnabled}
                                    size="sm"
                                  />
                                </div>

                                {/* 出版社：長條形、列的排列，每列一個出版社，顯示兩字全名 */}
                                <div className="space-y-1.5">
                                  {APP_CONFIG.publishers.map((pub) => {
                                    const isOn = publishers.includes(pub);
                                    const statKey = `G${grade}_S${sem}_${subject}_${pub}`;
                                    const stat = publisherStats[statKey];
                                    const quality = stat?.quality ?? '—';
                                    const questionCount = stat?.questions ?? 0;
                                    const hasData = stat && stat.units > 0;
                                    const isSelectable = !!hasData;

                                    return (
                                      <button
                                        key={pub}
                                        type="button"
                                        disabled={!isSEnabled || !isSubEnabled || !isSelectable}
                                        onClick={() => togglePublisher(grade, sem, subject, pub)}
                                        className={`
                                          w-full relative flex items-center gap-3 py-1.5 px-3 rounded-lg border text-left transition-all
                                          active:scale-[0.99]
                                          disabled:opacity-40 disabled:cursor-not-allowed
                                          ${
                                            isOn && isSelectable
                                              ? 'border-transparent text-white shadow-sm'
                                              : 'border-border bg-muted/40 text-muted-foreground hover:border-muted-foreground/30'
                                          }
                                        `}
                                        style={isOn && isSelectable ? { backgroundColor: PUBLISHER_COLORS[pub] } : undefined}
                                      >
                                        <span className="font-bold text-sm w-10 shrink-0">{pub}</span>
                                        <span
                                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                                            isOn && isSelectable ? 'bg-white/20' : getQualityStyle(quality)
                                          }`}
                                        >
                                          {quality}
                                        </span>
                                        <span className={`text-[10px] font-medium ml-auto shrink-0 ${isOn ? 'opacity-90' : 'text-muted-foreground'}`}>
                                          {hasData ? `${questionCount} 題` : '無題庫'}
                                        </span>
                                        {isOn && isSelectable && (
                                          <span className="w-4 h-4 rounded-full bg-white/40 flex items-center justify-center text-[10px] text-white font-bold shrink-0">
                                            ✓
                                          </span>
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. 底層：儲存操作（不浮動、位於表單最下方） */}
      <div className="mt-10 pt-6 border-t">
        <p className="text-[10px] text-muted-foreground mb-3 text-center">
          數據來源：libraryStats.json，與前台題庫總覽一致。更新題庫後請執行 scripts/generate_library_stats.js 並重新部署以同步數字。
        </p>
        <button
          type="button"
          onClick={handleSave}
          className={`
            w-full py-4 rounded-2xl font-bold text-base transition-all active:scale-[0.98]
            flex items-center justify-center gap-2
            ${saved
              ? 'bg-green-600 text-white border-2 border-green-500/50'
              : 'bg-primary text-primary-foreground hover:opacity-90 border-2 border-primary/30'
            }
          `}
        >
          {saved ? (
            <>
              <span>✅</span>
              <span>已儲存</span>
            </>
          ) : (
            <>
              <span>💾</span>
              <span>儲存並套用至全站</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function Switch({
  checked,
  onChange,
  disabled,
  size = 'md',
}: {
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
}) {
  const w = size === 'sm' ? 'w-9' : 'w-11';
  const h = size === 'sm' ? 'h-5' : 'h-6';
  const knob = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const translate = size === 'sm' ? 'translate-x-4' : 'translate-x-5';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange({} as React.ChangeEvent<HTMLInputElement>)}
      className={`
        relative inline-flex ${w} ${h} shrink-0 rounded-full border-2 border-transparent
        transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
        disabled:opacity-40 disabled:cursor-not-allowed
        ${checked ? 'bg-primary' : 'bg-muted'}
      `}
    >
      <span
        className={`absolute top-0.5 block ${knob} rounded-full bg-white shadow transition-transform ${checked ? translate : 'translate-x-0.5'}`}
      />
    </button>
  );
}
