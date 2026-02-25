import { useState, useRef, useCallback } from 'react';
import { Grade, Semester, Publisher, Subject, SUBJECT_ICONS, SUBJECT_THEME_MAP, APP_CONFIG, SEMESTER_NAMES, getSubjectsByGrade } from '@/data/config';

const PUBLISHER_COLORS: Record<Publisher, string> = {
  '康軒': 'hsl(200 55% 55%)',
  '南一': 'hsl(350 50% 65%)',
  '翰林': 'hsl(168 45% 50%)',
};

export interface UserProfile {
  grade: Grade;
  semester: Semester;
  publisherBySubject: Partial<Record<Subject, Publisher>>;
}

interface ProfileSetupProps {
  initial?: UserProfile;
  onSave: (profile: UserProfile) => void;
  onClose: () => void;
}

const GRADE_LABELS: Record<Grade, string> = { 1: '一', 2: '二', 3: '三', 4: '四', 5: '五', 6: '六' };

function randomPublisher(): Publisher {
  const pubs = APP_CONFIG.publishers;
  return pubs[Math.floor(Math.random() * pubs.length)];
}

export default function ProfileSetup({ initial, onSave, onClose }: ProfileSetupProps) {
  const [grade, setGrade] = useState<Grade>(initial?.grade ?? 3);
  const [semester, setSemester] = useState<Semester>(initial?.semester ?? 1);
  const backdropRef = useRef<HTMLDivElement>(null);

  const [publisherBySubject, setPublisherBySubject] = useState<Partial<Record<Subject, Publisher>>>(() => {
    if (initial?.publisherBySubject && Object.keys(initial.publisherBySubject).length > 0) {
      return initial.publisherBySubject;
    }
    const defaults: Partial<Record<Subject, Publisher>> = {};
    getSubjectsByGrade(initial?.grade ?? 3).forEach(s => {
      defaults[s] = randomPublisher();
    });
    return defaults;
  });

  const subjects = getSubjectsByGrade(grade);

  const doSave = useCallback((g: Grade, s: Semester, pubs: Partial<Record<Subject, Publisher>>) => {
    const filled = { ...pubs };
    getSubjectsByGrade(g).forEach(subj => {
      if (!filled[subj]) filled[subj] = randomPublisher();
    });
    onSave({ grade: g, semester: s, publisherBySubject: filled });
  }, [onSave]);

  const handleClose = useCallback(() => {
    doSave(grade, semester, publisherBySubject);
    onClose();
  }, [grade, semester, publisherBySubject, doSave, onClose]);

  const handleGradeChange = (g: Grade) => {
    setGrade(g);
    const newSubjects = getSubjectsByGrade(g);
    setPublisherBySubject(prev => {
      const updated = { ...prev };
      newSubjects.forEach(s => {
        if (!updated[s]) updated[s] = randomPublisher();
      });
      setTimeout(() => doSave(g, semester, updated), 0);
      return updated;
    });
  };

  const handleSemesterChange = (s: Semester) => {
    setSemester(s);
    doSave(grade, s, publisherBySubject);
  };

  const handlePublisherSelect = (subject: Subject, pub: Publisher) => {
    setPublisherBySubject(prev => {
      const updated = { ...prev, [subject]: pub };
      setTimeout(() => doSave(grade, semester, updated), 0);
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
              <h1 className="text-base sm:text-lg font-black text-foreground">學習設定</h1>
              <p className="text-[11px] text-muted-foreground">選擇年級、學期與各科出版社</p>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Grade */}
          <div>
            <label className="block text-[11px] font-bold text-muted-foreground mb-1.5 tracking-wider">年級</label>
            <div className="grid grid-cols-6 gap-1.5">
              {APP_CONFIG.grades.map(g => (
                <button
                  key={g}
                  onClick={() => handleGradeChange(g)}
                  className={`py-2.5 rounded-xl font-extrabold text-sm transition-all active:scale-95 ${
                    grade === g
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-secondary text-secondary-foreground hover:bg-muted'
                  }`}
                >{GRADE_LABELS[g]}</button>
              ))}
            </div>
          </div>

          {/* Semester */}
          <div>
            <label className="block text-[11px] font-bold text-muted-foreground mb-1.5 tracking-wider">學期</label>
            <div className="grid grid-cols-2 gap-2">
              {APP_CONFIG.semesters.map(s => (
                <button
                  key={s}
                  onClick={() => handleSemesterChange(s)}
                  className={`py-2.5 rounded-xl font-extrabold text-sm transition-all active:scale-95 ${
                    semester === s
                      ? 'bg-accent text-accent-foreground shadow-sm'
                      : 'bg-secondary text-secondary-foreground hover:bg-muted'
                  }`}
                >{SEMESTER_NAMES[s]}</button>
              ))}
            </div>
          </div>

          {/* Publisher */}
          <div className="border-t border-border pt-3">
            <p className="text-[11px] font-bold text-muted-foreground mb-2.5 tracking-wider">各科出版社（成為預設）</p>
            <div className="space-y-2">
              {subjects.map(subj => {
                const selected = publisherBySubject[subj];
                return (
                  <div key={subj} className="flex items-center gap-2.5">
                    <div className="flex items-center gap-1 w-14 shrink-0">
                      <span className="text-sm">{SUBJECT_ICONS[subj]}</span>
                      <span className="font-bold text-xs text-foreground">{subj}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 flex-1">
                      {APP_CONFIG.publishers.map(pub => {
                        const isSelected = selected === pub;
                        return (
                          <button
                            key={pub}
                            onClick={() => handlePublisherSelect(subj, pub)}
                            className={`py-1.5 rounded-xl font-bold text-xs transition-all active:scale-95 ${
                              isSelected ? 'shadow-sm text-white' : 'bg-secondary text-secondary-foreground hover:bg-muted'
                            }`}
                            style={isSelected ? { background: PUBLISHER_COLORS[pub] } : undefined}
                          >{pub}</button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

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
