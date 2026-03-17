import { useState, useEffect } from 'react';
import { Grade, Semester, Subject, Publisher, Question } from '@/data/config';
import { loadQuestions } from '@/data/questionLoader';
import { getQualityStyle } from './AdminLibraryManager';
import { stripOptionPrefix } from '../../utils/format';

interface Props {
    grade: Grade;
    semester: Semester;
    subject: Subject;
    publisher: Publisher;
    onClose: () => void;
}

export default function AdminUnitCuration({ grade, semester, subject, publisher, onClose }: Props) {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchQuestions() {
            setLoading(true);
            const res = await loadQuestions(grade, subject, semester, publisher, false);
            setQuestions(res.questions);
            setLoading(false);
        }
        fetchQuestions();
    }, [grade, semester, subject, publisher]);

    const handleToggleActive = async (q: Question, newActive: boolean) => {
        // 預先在畫面端更新
        setQuestions(prev => prev.map(item => item.id === q.id ? { ...item, is_active: newActive } : item));

        try {
            const res = await fetch('/api/local/curation/toggle', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    filePath: q._sourceFile || '',
                    questionId: q.id,
                    isActive: newActive
                })
            });
            if (!res.ok) {
                throw new Error('Failed to update question status');
            }
        } catch (err) {
            console.error(err);
            // 還原狀態
            setQuestions(prev => prev.map(item => item.id === q.id ? { ...item, is_active: !newActive } : item));
            alert('狀態更新失敗，請確認開發伺服器是否執行中');
        }
    };

    const questionsByUnit = questions.reduce((acc, q) => {
        const key = q.lessonTitle || q.lesson || '未分類';
        if (!acc[key]) acc[key] = [];
        acc[key].push(q);
        return acc;
    }, {} as Record<string, Question[]>);

    return (
        <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm overflow-y-auto">
            <div className="max-w-4xl mx-auto my-8 bg-card border rounded-2xl shadow-xl overflow-hidden">

                <div className="sticky top-0 z-10 bg-card/95 backdrop-blur border-b px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <span>{grade}年級 {subject}</span>
                            <span className="text-muted-foreground text-sm">/ {semester === 1 ? '上學期' : '下學期'} / {publisher}</span>
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">單題審查與上架控制</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-muted/50 hover:bg-muted text-muted-foreground transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-6 space-y-8">
                    {loading ? (
                        <div className="text-center py-12 text-muted-foreground animate-pulse">
                            載入題目中...
                        </div>
                    ) : questions.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            此單元目前沒有題庫資料
                        </div>
                    ) : (
                        Object.entries(questionsByUnit).map(([unitName, unitQuestions]) => (
                            <div key={unitName} className="space-y-4">
                                <h3 className="text-lg font-bold border-b pb-2 text-foreground/80">{unitName}</h3>

                                <div className="space-y-4">
                                    {unitQuestions.map(q => {
                                        const isActive = q.is_active !== false; // undefined or true is active

                                        return (
                                            <div key={q.id} className={`p-4 rounded-xl border transition-colors ${isActive ? 'bg-background border-border' : 'bg-muted/30 border-dashed opacity-80'}`}>
                                                <div className="flex gap-4">
                                                    <div className="flex-1 space-y-3">
                                                        {/* Header */}
                                                        <div className="flex items-center gap-2 text-xs">
                                                            <span className="font-mono text-muted-foreground">{q.id}</span>
                                                            <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">品質評級待串接</span>
                                                        </div>

                                                        {/* 題幹 */}
                                                        <div className="font-medium text-base">
                                                            {q.question}
                                                        </div>

                                                        {/* 選項 */}
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mt-2">
                                                            {q.options?.map((opt, i) => {
                                                                const isCorrect = q.normalizedAnswer === i;
                                                                return (
                                                                    <div key={i} className={`px-3 py-2 rounded-lg border ${isCorrect ? 'bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400 font-bold' : 'bg-muted/30 border-transparent text-muted-foreground'}`}>
                                                                        {String.fromCharCode(65 + i)}. {stripOptionPrefix(opt)}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>

                                                        {/* 解析 */}
                                                        {q.explanation && (
                                                            <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg mt-3">
                                                                <span className="font-bold mr-2">解析:</span>
                                                                {q.explanation}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* 右側 - 控制區 */}
                                                    <div className="flex flex-col items-end gap-3 shrink-0 ml-4 border-l pl-4">
                                                        <label className="text-xs font-bold text-muted-foreground">狀態</label>
                                                        <button
                                                            onClick={() => handleToggleActive(q, !isActive)}
                                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isActive ? 'bg-primary' : 'bg-muted'}`}
                                                        >
                                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                                                        </button>
                                                        <span className={`text-[10px] font-bold px-2 py-1 rounded ${isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 'bg-muted text-muted-foreground'}`}>
                                                            {isActive ? '啟用中' : '已下架'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
