import { useState, useCallback } from 'react';
import { Grade, Semester, Publisher, Subject, SUBJECT_ICONS, APP_CONFIG, SEMESTER_NAMES, getSubjectsByGrade } from '@/data/config';
import type { UserProfile } from '@/components/ProfileSetup';
import { LibraryConfig } from '@/pages/Index';

interface WelcomeSetupProps {
    onComplete: (profile: UserProfile) => void;
    libraryConfig: LibraryConfig | null;
}

const GRADE_LABELS: Record<Grade, string> = { 1: '一', 2: '二', 3: '三', 4: '四', 5: '五', 6: '六' };
const PUBLISHER_COLORS: Record<Publisher, string> = {
    '康軒': 'hsl(200 55% 55%)',
    '南一': 'hsl(350 50% 65%)',
    '翰林': 'hsl(168 45% 50%)',
};

// 盾牌圖示組件 (供提示使用)
const ShieldIconHint = ({ gradeLabel }: { gradeLabel: string }) => (
    <div className="shrink-0 flex items-center gap-1 scale-75 origin-left">
        <svg width="36" height="40" viewBox="0 0 36 40" fill="none">
            <path d="M18 1L2 8V20C2 29 9 36 18 39C27 36 34 29 34 20V8L18 1Z" fill="hsl(38 80% 52%)" />
            <text x="18" y="24" textAnchor="middle" fill="white" fontSize="20" fontWeight="900" fontFamily="sans-serif">{gradeLabel}</text>
        </svg>
    </div>
);

const DEFAULT_SEMESTER = (() => {
    const month = new Date().getMonth() + 1; // 1-12
    // 2到8月預設為下學期 (2), 9到1月預設為上學期 (1)
    if (month >= 2 && month <= 8) return 2 as Semester;
    return 1 as Semester;
})();

export default function WelcomeSetup({ onComplete, libraryConfig }: WelcomeSetupProps) {
    const [grade, setGrade] = useState<Grade | null>(null);
    const [semester, setSemester] = useState<Semester>(DEFAULT_SEMESTER);
    const [publisherBySubject, setPublisherBySubject] = useState<Partial<Record<string, Publisher>>>({});
    const [publisherExpanded, setPublisherExpanded] = useState<boolean>(true);

    const handleFinish = useCallback(() => {
        if (!grade) return;

        const finalPubs: Partial<Record<string, Publisher>> = { ...publisherBySubject };
        getSubjectsByGrade(grade).forEach(subj => {
            const key = `${subj}_S${semester}`;
            if (!finalPubs[key]) {
                const pubs = APP_CONFIG.publishers;
                finalPubs[key] = pubs[Math.floor(Math.random() * pubs.length)];
            }
        });

        onComplete({
            grade,
            semester,
            publisherBySubject: finalPubs,
            setupComplete: true,
            autoAdvanceDelayMs: 1500,
            shortcut_enabled: true,
            maxQuizQuestions: 25,
        });
    }, [grade, semester, publisherBySubject, onComplete]);

    const isGradeEnabled = (g: Grade) => {
        if (!libraryConfig?.grades) return g >= 3 && g <= 5; // Default fallback
        return libraryConfig.grades[g]?.enabled !== false;
    };

    return (
        <div className="fixed inset-0 z-[200] bg-background overflow-y-auto animate-in fade-in duration-500">
            <div className="max-w-lg mx-auto px-6 py-12 space-y-10">
                {/* Header Section */}
                <div className="space-y-6">
                    <div className="space-y-4">
                        <h1 className="text-3xl font-black tracking-tight text-foreground">
                            你是第一次使用本站嗎？
                        </h1>
                        <div className="p-5 bg-primary/5 rounded-2xl border border-primary/10 space-y-3">
                            <p className="text-sm font-bold text-foreground leading-relaxed">
                                歡迎來到「陪孩子一起複習」！這是一個專為國小學生設計的 AI 題庫實驗網站。<br />
                                在開始之前，您需先設定孩子就讀的年級與學期，<br />
                                教科書出版社的選擇，可以先設定，也可後續動態調整。
                            </p>
                            <div className="flex items-start gap-3 pt-2">
                                <ShieldIconHint gradeLabel={grade ? GRADE_LABELS[grade] : '三'} />
                                <p className="text-[11px] text-muted-foreground leading-relaxed pt-1">
                                    ※ 若不清楚教科書版本，可先略過，之後隨時可以點選左上符號修改。
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grade Selection */}
                <section className="space-y-4">
                    <label className="block text-sm font-black text-foreground">1. 設定孩童就讀年級 <span className="text-destructive">*</span></label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {APP_CONFIG.grades.map(g => {
                            const isEnabled = isGradeEnabled(g as Grade);
                            const isSelected = grade === g;
                            return (
                                <button
                                    key={g}
                                    disabled={!isEnabled}
                                    onClick={() => setGrade(g as Grade)}
                                    className={`py-3 rounded-2xl font-black text-base transition-all ${!isEnabled ? 'opacity-20 cursor-not-allowed bg-secondary' :
                                        isSelected ? 'bg-primary text-primary-foreground shadow-md scale-105' : 'bg-secondary text-secondary-foreground hover:bg-muted'
                                        }`}
                                >
                                    {GRADE_LABELS[g as Grade]}
                                </button>
                            );
                        })}
                    </div>
                    <p className="text-[11px] text-muted-foreground italic">目前僅開放已完成校對之題庫，其餘年級將陸續釋出。</p>
                </section>

                {/* Semester Selection */}
                {grade && (
                    <section className="space-y-4 animate-in fade-in slide-in-from-top-2">
                        <label className="block text-sm font-black text-foreground">2. 目前學期</label>
                        <div className="grid grid-cols-2 gap-3">
                            {APP_CONFIG.semesters.map(s => (
                                <button
                                    key={s}
                                    onClick={() => setSemester(s)}
                                    className={`py-3 rounded-2xl font-black text-sm transition-all ${semester === s ? 'bg-accent text-accent-foreground shadow-md' : 'bg-secondary text-secondary-foreground hover:bg-muted'
                                        }`}
                                >
                                    {SEMESTER_NAMES[s]}
                                </button>
                            ))}
                        </div>
                    </section>
                )}

                {/* Publisher Selection */}
                {grade && (
                    <section className="space-y-4 animate-in fade-in">
                        <div className="flex items-center justify-between">
                            <label className="block text-sm font-black text-foreground">3. 各科出版社設定 (選填)</label>
                            <button
                                onClick={() => setPublisherExpanded(v => !v)}
                                className="text-[11px] text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-secondary"
                            >
                                {publisherExpanded ? '▲ 收合' : '▼ 展開'}
                            </button>
                        </div>

                        {publisherExpanded && (
                            <div className="space-y-3 bg-secondary/30 p-4 rounded-2xl border border-dashed animate-in zoom-in-95">
                                {getSubjectsByGrade(grade).map(subj => {
                                    const key = `${subj}_S${semester}`;
                                    const selected = publisherBySubject[key as string];
                                    return (
                                        <div key={subj} className="flex items-center gap-3">
                                            <span className="text-xs font-bold w-12 shrink-0">{SUBJECT_ICONS[subj]} {subj}</span>
                                            <div className="grid grid-cols-3 gap-1.5 flex-1">
                                                {APP_CONFIG.publishers.map(pub => {
                                                    const isSelected = selected === pub;
                                                    return (
                                                        <button
                                                            key={pub}
                                                            onClick={() => setPublisherBySubject(prev => ({ ...prev, [key as string]: pub }))}
                                                            className={`py-1.5 rounded-xl font-bold text-[10px] transition-all ${isSelected ? 'text-white shadow-sm' : 'bg-background border'
                                                                }`}
                                                            style={isSelected ? { background: PUBLISHER_COLORS[pub] } : undefined}
                                                        >
                                                            {pub}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                )}

                {/* Footer Section */}
                <div className="pt-8 border-t space-y-6">
                    <div className="space-y-2">
                        <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                            <span>💡</span> 關於本站
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            觀察到孩子在練習傳統題庫時，常因內容機械化而感到無厭。開發團隊設計了這套結合 AI 技術的系統，旨在為每一道題目注入邏輯與思考價值，陪伴孩子進行更有質感的複習。
                        </p>
                    </div>
                </div>

                {/* Action Button */}
                <div className="sticky bottom-6 pt-4 bg-background/80 backdrop-blur-md">
                    <button
                        onClick={handleFinish}
                        disabled={!grade}
                        className={`w-full py-4 rounded-2xl font-black text-lg shadow-xl transition-all ${grade ? 'bg-primary text-primary-foreground hover:scale-[1.01] active:scale-[0.99]' : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                            }`}
                    >
                        {grade ? `完成設定，開始練習 →` : `請先選擇孩童年級`}
                    </button>
                </div>

                <p className="text-center text-[10px] text-muted-foreground/40 pb-8">
                    exam15 © 2026 - 一鍵設定，開啟學習新節奏。
                </p>
            </div>
        </div>
    );
}
