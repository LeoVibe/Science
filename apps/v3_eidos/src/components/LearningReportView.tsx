import { useSearchParams } from 'react-router-dom';
import { Grade, Semester, Publisher, Subject, SUBJECT_THEME_MAP, SEMESTER_NAMES, Question, APP_CONFIG, PUBLISHER_THEME_COLORS } from '@/data/config';
import { getStatistics, getPracticeHistory, getAnswerHistory, getWrongQuestions as getWrongRecords, type PracticeRecord } from '@/utils/storage';
import IntentionTooltip from '@/components/IntentionTooltip';

const VALID_PUBLISHERS: Publisher[] = ['康軒', '南一', '翰林'];
function parsePublisherParam(pub: string | null, fallback: Publisher): Publisher {
  if (pub && VALID_PUBLISHERS.includes(pub as Publisher)) return pub as Publisher;
  return fallback;
}

interface LearningReportViewProps {
  grade: Grade;
  semester: Semester;
  publisher: Publisher;
  subject: Subject;
  questions: Question[];
  categories: string[];
  wrongQuestions: Question[];
  wrongCounts: Record<string, { wrong: number; total: number }>;
  tab?: 'stats' | 'wrong';
  onTabChange?: (tab: 'stats' | 'wrong') => void;
  onBack: () => void;
}

export default function LearningReportView({
  grade, semester, publisher, subject, questions, categories,
  wrongQuestions, wrongCounts, tab: tabProp, onTabChange, onBack,
}: LearningReportViewProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab: 'stats' | 'wrong' = tabProp ?? (searchParams.get('tab') === 'wrong' ? 'wrong' : 'stats');
  const pubParam = searchParams.get('pub');
  const selectedPub = parsePublisherParam(pubParam, publisher);
  const theme = SUBJECT_THEME_MAP[subject];

  const setTab = (newTab: 'stats' | 'wrong') => {
    if (onTabChange) onTabChange(newTab);
    else setSearchParams(prev => { const next = new URLSearchParams(prev); next.set('tab', newTab); return next; }, { replace: true });
  };
  const setSelectedPub = (newPub: Publisher) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('pub', newPub);
      return next;
    }, { replace: true });
  };

  const stats = getStatistics(grade, subject, semester, selectedPub);
  const history = getPracticeHistory(grade, subject, semester, selectedPub);
  const answerHistory = getAnswerHistory(grade, subject, semester, selectedPub);

  const isCurrentPub = selectedPub === publisher;
  const realCatStats = isCurrentPub ? categories.map(cat => {
    const catQs = questions.filter(q => q.category === cat);
    let total = 0, correct = 0;
    catQs.forEach(q => {
      const record = answerHistory[q.id];
      if (record) { total += record.total; correct += record.correct; }
    });
    return { category: cat, total, correct, accuracy: total > 0 ? Math.round((correct / total) * 100) : 0 };
  }) : [];

  const wrongRecords = getWrongRecords(grade, subject, semester, selectedPub);
  const questionMap = new Map(questions.map(q => [q.id, q]));
  const pubWrongQs = isCurrentPub ? wrongRecords.map(r => questionMap.get(r.questionId)).filter(Boolean) as Question[] : [];
  const pubWrongCounts = isCurrentPub ? Object.fromEntries(
    wrongRecords.map(r => [r.questionId, { wrong: r.wrong, total: r.total }])
  ) : {};

  const hasRealStats = stats.totalAnswered > 0;
  const practiceList = history;
  const catStats = realCatStats;
  const avgAccuracy = stats.accuracy;
  const totalAnswered = stats.totalAnswered;
  const totalCorrect = stats.totalCorrect;
  const practiceCount = history.length;

  const hasRealWrong = pubWrongQs.length > 0 || wrongQuestions.length > 0;
  const displayWrongQs = hasRealWrong ? (isCurrentPub ? pubWrongQs : wrongQuestions) : [];
  const displayWrongCounts = hasRealWrong
    ? (isCurrentPub ? pubWrongCounts : wrongCounts)
    : {};
  const wrongCount = displayWrongQs.length;

  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="max-w-lg mx-auto px-3 sm:px-4 py-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors text-lg">←</button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-xl font-black text-foreground">📊 學習統計</h1>
          <p className="text-xs text-muted-foreground truncate">{grade}年級 {subject} {SEMESTER_NAMES[semester]}</p>
        </div>
      </div>

      {/* Publisher filter */}
      <div className="flex gap-1.5">
        {APP_CONFIG.publishers.map(pub => {
          const isActive = selectedPub === pub;
          return (
            <button
              key={pub}
              onClick={() => setSelectedPub(pub)}
              className={`flex-1 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all active:scale-95 ${
                isActive ? 'shadow-sm text-white' : 'bg-secondary text-secondary-foreground hover:bg-muted'
              }`}
              style={isActive ? { background: PUBLISHER_THEME_COLORS[pub] } : undefined}
            >
              {pub}版
            </button>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex rounded-2xl bg-secondary p-1 gap-1">
        <button
          onClick={() => setTab('stats')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
            tab === 'stats' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >📊 統計總覽</button>
        <button
          onClick={() => setTab('wrong')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all relative ${
            tab === 'wrong' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          ❌ 錯題記錄
          {wrongCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-white text-[10px] font-bold flex items-center justify-center">
              {wrongCount}
            </span>
          )}
        </button>
      </div>

      {/* Stats Tab */}
      {tab === 'stats' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {!hasRealStats ? (
            <div className="bg-card rounded-2xl border p-8 text-center space-y-2">
              <span className="text-4xl">🎒</span>
              <p className="font-bold">你還沒有開始練習唷！</p>
              <p className="text-sm text-muted-foreground">先完成一場測驗，這裡就會出現你的學習報告。</p>
            </div>
          ) : (
            <>
          <div className="grid grid-cols-3 gap-2">
            <SummaryCard label="練習次數" value={practiceCount} icon="🏋️" />
            <SummaryCard label="總答題數" value={totalAnswered} icon="✍️" />
            <SummaryCard label="平均正確率" value={`${avgAccuracy}%`} icon={avgAccuracy >= 80 ? '🌟' : avgAccuracy >= 60 ? '👍' : '💪'} />
          </div>

          <div className="bg-card rounded-2xl border p-4">
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={`hsl(var(--subject-${theme}))`} strokeWidth="3" strokeDasharray={`${avgAccuracy}, 100`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-black">{avgAccuracy}%</span>
                </div>
              </div>
              <div className="flex-1 space-y-1">
                <p className="font-bold text-sm">整體正確率（{selectedPub}版）</p>
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-correct inline-block" />正確 {totalCorrect}</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-destructive inline-block" />錯誤 {totalAnswered - totalCorrect}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {avgAccuracy >= 80 ? '表現優異！繼續保持 🎉' : avgAccuracy >= 60 ? '穩定進步中，加油！💪' : '多多練習，一定會進步的！📚'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl border p-4 space-y-3">
            <h3 className="font-bold text-sm flex items-center gap-1.5">📚 各課正確率</h3>
            <div className="space-y-2.5">
              {catStats.filter(c => c.total > 0).map(c => (
                <div key={c.category} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium truncate flex-1">{c.category}</span>
                    <span className="text-muted-foreground shrink-0 ml-2">{c.accuracy}% <span className="text-[10px]">({c.correct}/{c.total})</span></span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{
                      width: `${c.accuracy}%`,
                      background: c.accuracy >= 80 ? 'hsl(var(--correct))' : c.accuracy >= 60 ? `hsl(var(--subject-${theme}))` : 'hsl(var(--wrong))',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-2xl border p-4 space-y-3">
            <h3 className="font-bold text-sm flex items-center gap-1.5">🕐 練習歷史</h3>
            <div className="space-y-0">
              {practiceList.slice(0, 8).map((h: PracticeRecord, i: number) => (
                <div key={h.id ?? i} className={`flex justify-between items-center py-2.5 ${i < practiceList.slice(0, 8).length - 1 ? 'border-b border-border' : ''}`}>
                  <div className="min-w-0">
                    <div className="font-medium text-sm truncate">{h.type}</div>
                    <div className="text-[10px] text-muted-foreground">{new Date(h.timestamp).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground">{h.score}/{h.count}</span>
                    <span className={`text-sm font-bold ${h.accuracy >= 80 ? 'text-correct' : h.accuracy >= 60 ? 'text-foreground' : 'text-wrong'}`}>{h.accuracy}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
            </>
          )}
        </div>
      )}

      {/* Wrong Questions Tab */}
      {tab === 'wrong' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          {displayWrongQs.length === 0 ? (
            <div className="bg-card rounded-2xl border p-8 text-center space-y-2">
              <span className="text-4xl">🎉</span>
              <p className="font-bold">沒有錯題！</p>
              <p className="text-sm text-muted-foreground">太棒了，繼續保持！</p>
            </div>
          ) : (
            <>
              <p className="text-xs text-muted-foreground text-center">共 {displayWrongQs.length} 題錯題（{selectedPub}版），多練習就能攻克！</p>
              {displayWrongQs.map((q, i) => (
                <div key={q.id} className="bg-card rounded-2xl border p-4 space-y-2.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold bg-secondary px-2 py-0.5 rounded-full">#{i + 1}</span>
                    <span className="text-[10px] font-bold bg-secondary px-2 py-0.5 rounded-full">{q.category}</span>
                    {displayWrongCounts[q.id] && (
                      <span className="text-[10px] font-bold bg-wrong-light text-destructive px-2 py-0.5 rounded-full">
                        錯 {displayWrongCounts[q.id].wrong} / 共 {displayWrongCounts[q.id].total} 次
                      </span>
                    )}
                  </div>
                  <p className="font-medium text-sm leading-relaxed">{q.question}</p>
                  <div className="space-y-1">
                    {q.options.map((opt, j) => (
                      <div key={j} className={`px-3 py-1.5 rounded-xl text-xs flex items-start gap-2 ${
                        j === q.normalizedAnswer ? 'bg-correct-light border border-correct/30 font-medium' : 'bg-secondary'
                      }`}>
                        <span className="font-bold text-muted-foreground shrink-0">{optionLabels[j]}</span>
                        <span className="flex-1">{opt}</span>
                        {j === q.normalizedAnswer && <span className="text-correct shrink-0">✓</span>}
                      </div>
                    ))}
                  </div>
                  {q.explanation && (
                    <p className="text-xs text-muted-foreground bg-accent/8 rounded-xl p-2.5 leading-relaxed inline-flex flex-wrap items-center gap-1">
                      💡 {q.explanation}
                      <IntentionTooltip />
                    </p>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="bg-card rounded-2xl border p-3 text-center space-y-1">
      <span className="text-lg">{icon}</span>
      <div className="text-xl font-black text-foreground">{value}</div>
      <div className="text-[10px] text-muted-foreground font-medium">{label}</div>
    </div>
  );
}
