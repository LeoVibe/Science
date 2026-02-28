import { useState, useRef, useCallback, useEffect } from 'react';
import { Grade, Semester, Publisher, Subject, SUBJECT_ICONS, SUBJECT_THEME_MAP, APP_CONFIG, SEMESTER_NAMES, getSubjectsByGrade } from '@/data/config';
import { clearSubjectHistory, getPublisherForSubject } from '@/utils/storage';
import type { LibraryConfig } from '@/components/admin/AdminLibraryManager';

const PUBLISHER_COLORS: Record<Publisher, string> = {
  '康軒': 'hsl(200 55% 55%)',
  '南一': 'hsl(350 50% 65%)',
  '翰林': 'hsl(168 45% 50%)',
};

/** 可選的答題後自動下一題停留時間（毫秒），0 = 不自動 */
export const AUTO_ADVANCE_OPTIONS = [
  { value: 0, label: '不自動' },
  { value: 1000, label: '1 秒' },
  { value: 1500, label: '1.5 秒' },
  { value: 2000, label: '2 秒' },
  { value: 3000, label: '3 秒' },
] as const;

export interface UserProfile {
  grade: Grade;
  semester: Semester;
  publisherBySubject: Partial<Record<Subject, Publisher>>;
  /** 答題後停留多久自動下一題（毫秒），0 = 不自動 */
  autoAdvanceDelayMs?: number;
  /** 是否開啟 A–D 快捷鍵答題 */
  shortcut_enabled?: boolean;
  /** 進階挑戰題目數量 */
  maxQuizQuestions?: number;
  /** 是否已完成首次設定 */
  setupComplete?: boolean;
}

interface ProfileSetupProps {
  initial?: UserProfile;
  onSave: (profile: UserProfile) => void;
  onClose: () => void;
}

const GRADE_LABELS: Record<Grade, string> = { 1: '一', 2: '二', 3: '三', 4: '四', 5: '五', 6: '六' };

function getDefaultPublisher(): Publisher {
  const globalPub = localStorage.getItem('DEFAULT_PUBLISHER') as Publisher | null;
  if (globalPub && APP_CONFIG.publishers.includes(globalPub)) {
    return globalPub;
  }
  const pubs = APP_CONFIG.publishers;
  return pubs[Math.floor(Math.random() * pubs.length)];
}

const DEFAULT_AUTO_ADVANCE_MS = 1500;

export default function ProfileSetup({ initial, onSave, onClose }: ProfileSetupProps) {
  const [activeTab, setActiveTab] = useState<'education' | 'habits'>('education');

  const [grade, setGrade] = useState<Grade>(() => {
    if (initial?.grade) return initial.grade;
    const def = localStorage.getItem('DEFAULT_GRADE');
    return def ? (parseInt(def, 10) as Grade) : 5;
  });
  const [semester, setSemester] = useState<Semester>(() => {
    if (initial?.semester) return initial.semester;
    const def = localStorage.getItem('DEFAULT_SEMESTER');
    return def ? (parseInt(def, 10) as Semester) : 2;
  });
  const [autoAdvanceDelayMs, setAutoAdvanceDelayMs] = useState<number>(initial?.autoAdvanceDelayMs ?? DEFAULT_AUTO_ADVANCE_MS);
  const [shortcutEnabled, setShortcutEnabled] = useState<boolean>(initial?.shortcut_enabled !== false);
  const [maxQuizQuestions, setMaxQuizQuestions] = useState<number>(() => {
    if (initial?.maxQuizQuestions) return initial.maxQuizQuestions;
    const globalMax = localStorage.getItem('MAX_QUIZ_QUESTIONS');
    return globalMax ? parseInt(globalMax, 10) : 25;
  });
  const [libraryConfig, setLibraryConfig] = useState<LibraryConfig | null>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const configData = localStorage.getItem('EIDOS_LIBRARY_CONFIG');
    if (configData) {
      try { setLibraryConfig(JSON.parse(configData)); } catch (e) { }
    }
  }, []);

  const [publisherBySubject, setPublisherBySubject] = useState<Partial<Record<Subject, Publisher>>>(() => {
    if (initial?.publisherBySubject && Object.keys(initial.publisherBySubject).length > 0) {
      return initial.publisherBySubject;
    }
    const defaults: Partial<Record<Subject, Publisher>> = {};
    getSubjectsByGrade(grade).forEach(s => {
      defaults[s] = getDefaultPublisher();
    });
    return defaults;
  });

  const subjects = getSubjectsByGrade(grade);

  const doSave = useCallback((g: Grade, s: Semester, pubs: Partial<Record<string, Publisher>>, advanceMs?: number, shortcut?: boolean, maxQ?: number) => {
    const filled = { ...pubs };
    getSubjectsByGrade(g).forEach(subj => {
      const key = `${subj}_S${s}`;
      if (!filled[key]) filled[key] = getDefaultPublisher();
    });
    onSave({
      grade: g,
      semester: s,
      publisherBySubject: filled,
      autoAdvanceDelayMs: advanceMs ?? autoAdvanceDelayMs,
      shortcut_enabled: shortcut ?? shortcutEnabled,
      maxQuizQuestions: maxQ ?? maxQuizQuestions,
    });
  }, [onSave, autoAdvanceDelayMs, shortcutEnabled, maxQuizQuestions]);

  const handleClose = useCallback(() => {
    doSave(grade, semester, publisherBySubject, autoAdvanceDelayMs, shortcutEnabled, maxQuizQuestions);
    onClose();
  }, [grade, semester, publisherBySubject, autoAdvanceDelayMs, shortcutEnabled, maxQuizQuestions, doSave, onClose]);

  const handleGradeChange = (g: Grade) => {
    setGrade(g);
    const newSubjects = getSubjectsByGrade(g);
    setPublisherBySubject(prev => {
      const updated = { ...prev };
      newSubjects.forEach(s => {
        if (!updated[s]) updated[s] = getDefaultPublisher();
      });
      setTimeout(() => doSave(g, semester, updated, autoAdvanceDelayMs, shortcutEnabled), 0);
      return updated;
    });
  };

  const handleSemesterChange = (s: Semester) => {
    setSemester(s);
    doSave(grade, s, publisherBySubject, autoAdvanceDelayMs, shortcutEnabled);
  };

  const handlePublisherSelect = (subject: Subject, pub: Publisher) => {
    setPublisherBySubject(prev => {
      const key = `${subject}_S${semester}`;
      const updated = { ...prev, [key]: pub };
      setTimeout(() => doSave(grade, semester, updated, autoAdvanceDelayMs, shortcutEnabled), 0);
      return updated;
    });
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) handleClose();
  };

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[100] bg-black/25 backdrop-blur-sm flex items-center justify-center p-3"
    >
      <div className="bg-card rounded-3xl shadow-xl w-full max-w-[420px] relative animate-in fade-in zoom-in-95 duration-200 overflow-hidden border">
        {/* Header */}
        <div className="relative px-5 pt-5 pb-4 bg-primary/8">
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-border transition-all text-sm"
            aria-label="關閉"
          >✕</button>
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🎒</span>
            <div>
              <h1 className="text-base sm:text-lg font-black text-foreground">學習與使用設定</h1>
              <p className="text-[11px] text-muted-foreground">
                {activeTab === 'education' ? '選擇年級、學期與各科出版社' : '自訂答題體驗與進階挑戰模式'}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            className={`flex-1 py-3 text-sm font-bold flex justify-center items-center gap-1.5 transition-colors ${activeTab === 'education' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted-foreground hover:bg-secondary/50'}`}
            onClick={() => setActiveTab('education')}
          >
            <span>🎒</span>學科、出版社設定
          </button>
          <button
            className={`flex-1 py-3 text-sm font-bold flex justify-center items-center gap-1.5 transition-colors ${activeTab === 'habits' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted-foreground hover:bg-secondary/50'}`}
            onClick={() => setActiveTab('habits')}
          >
            <span>⚡️</span>操作習慣
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {activeTab === 'education' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-200">
              {/* Grade */}
              <div>
                <label className="block text-[11px] font-bold text-muted-foreground mb-1.5 tracking-wider">年級</label>
                <div className="grid grid-cols-6 gap-1.5">
                  {APP_CONFIG.grades.map(g => {
                    const isSystemSupported = g >= 3 && g <= 5;
                    const gConfig = libraryConfig?.grades[g as Grade];
                    const isConfigEnabled = libraryConfig ? (gConfig?.enabled === true) : true;
                    const isEnabled = isSystemSupported && isConfigEnabled;

                    return (
                      <button
                        key={g}
                        disabled={!isEnabled}
                        onClick={() => handleGradeChange(g)}
                        className={`py-2.5 rounded-xl font-extrabold text-sm transition-all ${!isEnabled ? 'opacity-30 cursor-not-allowed bg-secondary/50 text-secondary-foreground line-through decoration-muted-foreground/50' :
                          grade === g
                            ? 'bg-primary text-primary-foreground shadow-sm active:scale-95'
                            : 'bg-secondary text-secondary-foreground hover:bg-muted active:scale-95'
                          }`}
                      >
                        {GRADE_LABELS[g]}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1.5 leading-tight">
                  灰底劃線表示該年級尚未開放題庫。
                </p>
              </div>

              {/* Semester */}
              <div>
                <label className="block text-[11px] font-bold text-muted-foreground mb-1.5 tracking-wider">學期</label>
                <div className="grid grid-cols-2 gap-2">
                  {APP_CONFIG.semesters.map(s => {
                    const gConfig = libraryConfig?.grades[grade as Grade];
                    const sConfig = gConfig?.semesters[s as Semester];
                    const isConfigEnabled = libraryConfig ? (sConfig?.enabled === true) : true;
                    const isEnabled = isConfigEnabled;

                    return (
                      <button
                        key={s}
                        disabled={!isEnabled}
                        onClick={() => handleSemesterChange(s)}
                        className={`py-2.5 rounded-xl font-extrabold text-sm transition-all ${!isEnabled ? 'opacity-30 cursor-not-allowed bg-secondary/50 text-secondary-foreground line-through decoration-muted-foreground/50' :
                          semester === s
                            ? 'bg-accent text-accent-foreground shadow-sm active:scale-95'
                            : 'bg-secondary text-secondary-foreground hover:bg-muted active:scale-95'
                          }`}
                      >{SEMESTER_NAMES[s]}</button>
                    );
                  })}
                </div>
              </div>

              {/* Publisher */}
              <div className="border-t border-border pt-3">
                <p className="text-[11px] font-bold text-muted-foreground mb-2.5 tracking-wider">各科出版社（成為預設）</p>
                <div className="space-y-2">
                  {subjects.map(subj => {
                    const key = `${subj}_S${semester}`;
                    const selected = publisherBySubject[key];

                    const gConfig = libraryConfig?.grades[grade as Grade];
                    const sConfig = gConfig?.semesters[semester as Semester];
                    const subConfig = sConfig?.subjects[subj as Subject];
                    const isSubEnabled = libraryConfig ? (subConfig?.enabled === true) : true;
                    const availablePubs = subConfig?.publishers || APP_CONFIG.publishers;

                    return (
                      <div key={subj} className={`flex items-center gap-2.5 ${!isSubEnabled ? 'opacity-40 grayscale' : ''}`}>
                        <div className="flex items-center gap-1 w-14 shrink-0">
                          <span className="text-sm">{SUBJECT_ICONS[subj]}</span>
                          <span className="font-bold text-xs text-foreground">{subj}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5 flex-1">
                          {APP_CONFIG.publishers.map(pub => {
                            const isPubEnabled = availablePubs.includes(pub);
                            const isSelected = selected === pub && isPubEnabled;
                            return (
                              <button
                                key={pub}
                                disabled={!isPubEnabled || !isSubEnabled}
                                onClick={() => handlePublisherSelect(subj, pub)}
                                className={`py-1.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center ${!isSubEnabled ? 'cursor-not-allowed opacity-50 bg-secondary' :
                                  !isPubEnabled ? 'opacity-20 cursor-not-allowed bg-secondary/50' :
                                    isSelected ? 'shadow-sm text-white active:scale-95' : 'bg-secondary text-secondary-foreground hover:bg-muted active:scale-95'
                                  }`}
                                style={isSelected && isPubEnabled && isSubEnabled ? { background: PUBLISHER_COLORS[pub] } : undefined}
                              >
                                <span className={!isPubEnabled && isSubEnabled ? 'line-through decoration-muted-foreground/60' : ''}>{pub}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'habits' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-200">
              {/* 答題後自動下一題 */}
              <div>
                <p className="text-[11px] font-bold text-muted-foreground mb-2 tracking-wider">答題後停留多久自動下一題</p>
                <div className="flex flex-wrap gap-1.5">
                  {AUTO_ADVANCE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setAutoAdvanceDelayMs(opt.value);
                        doSave(grade, semester, publisherBySubject, opt.value, shortcutEnabled);
                      }}
                      className={`py-1.5 px-3 rounded-xl font-bold text-xs transition-all active:scale-95 ${autoAdvanceDelayMs === opt.value
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-secondary text-secondary-foreground hover:bg-muted'
                        }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shortcutEnabled}
                    onChange={(e) => {
                      setShortcutEnabled(e.target.checked);
                      doSave(grade, semester, publisherBySubject, autoAdvanceDelayMs, e.target.checked);
                    }}
                    className="rounded border-input"
                  />
                  <span className="text-sm font-medium">使用 A–D 快捷鍵答題</span>
                </label>
              </div>

              {/* 進階挑戰預設題目數量 */}
              <div className="border-t border-border pt-3">
                <p className="text-[11px] font-bold text-muted-foreground mb-2 tracking-wider">進階挑戰題目數量</p>
                <div className="flex flex-wrap gap-1.5">
                  {[10, 15, 20, 25, 30].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        setMaxQuizQuestions(num);
                        doSave(grade, semester, publisherBySubject, autoAdvanceDelayMs, shortcutEnabled, num);
                      }}
                      className={`py-1.5 px-3 rounded-xl font-bold text-xs transition-all active:scale-95 ${maxQuizQuestions === num
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-secondary text-secondary-foreground hover:bg-muted'
                        }`}
                    >
                      {num} 題
                    </button>
                  ))}
                </div>
              </div>

              {/* 清除學習紀錄 */}
              <div className="border-t border-border pt-3">
                <p className="text-[11px] font-bold text-muted-foreground mb-1 tracking-wider">🗑️ 清除學習紀錄</p>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {subjects.map(subj => {
                    const pub = getPublisherForSubject(subj);
                    return (
                      <div key={subj} className="flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg border border-border/60 hover:bg-muted/50 transition-colors">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm">{SUBJECT_ICONS[subj]}</span>
                            <span className="text-sm font-medium text-foreground">{subj}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground block truncate">({pub}版)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`確定要清除 ${GRADE_LABELS[grade]}年級 ${subj}（${pub}版）的答題紀錄嗎？\n\n此操作不可恢復，但後台累計統計不受影響。`)) {
                              clearSubjectHistory(grade, subj, semester, pub);
                              alert(`✅ 已清除 ${subj} 的答題紀錄`);
                            }
                          }}
                          className="text-[10px] font-medium text-destructive/70 hover:text-destructive bg-destructive/5 hover:bg-destructive/10 px-2 py-1 rounded-lg transition-colors shrink-0"
                        >
                          清除
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Done */}
          <div className="pt-1 pb-1">
            <button
              onClick={handleClose}
              className="w-full rounded-2xl py-3 font-extrabold text-sm bg-primary text-primary-foreground shadow-sm hover:shadow-md active:scale-[0.98] transition-all"
            >✅ 完成設定</button>
          </div>
        </div>
      </div>
    </div>
  );
}
