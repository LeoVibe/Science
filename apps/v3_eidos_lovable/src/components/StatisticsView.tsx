import { Grade, Semester, Publisher, Subject, SUBJECT_THEME_MAP, SEMESTER_NAMES, Question } from '@/data/config';
import { getStatistics, getPracticeHistory, getAnswerHistory } from '@/utils/storage';

interface StatisticsViewProps {
  grade: Grade;
  semester: Semester;
  publisher: Publisher;
  subject: Subject;
  questions: Question[];
  categories: string[];
  onBack: () => void;
}

export default function StatisticsView({
  grade, semester, publisher, subject, questions, categories, onBack,
}: StatisticsViewProps) {
  const theme = SUBJECT_THEME_MAP[subject];
  const stats = getStatistics(grade, subject, semester, publisher);
  const history = getPracticeHistory(grade, subject, semester, publisher);
  const answerHistory = getAnswerHistory(grade, subject, semester, publisher);

  // Category stats
  const catStats = categories.map(cat => {
    const catQs = questions.filter(q => q.category === cat);
    let total = 0, correct = 0;
    catQs.forEach(q => {
      const record = answerHistory[q.id];
      if (record) {
        total += record.total;
        correct += record.correct;
      }
    });
    return { category: cat, total, correct, wrong: total - correct, accuracy: total > 0 ? Math.round((correct / total) * 100) : 0 };
  });

  // Practice history stats
  const practiceHistory = history.filter(h => h.type?.includes('挑戰')); 
  const avgScore = practiceHistory.length > 0
    ? Math.round(practiceHistory.reduce((s, h) => s + h.accuracy, 0) / practiceHistory.length)
    : 0;

  return (
    <div className="max-w-lg mx-auto px-4 py-4 space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors text-lg">← 返回</button>
        <div>
          <h1 className="text-xl font-bold">📊 學習統計報告</h1>
          <p className="text-xs text-muted-foreground">{grade}年級 {subject} {SEMESTER_NAMES[semester]} ({publisher}版)</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">對照選單選擇的科目與年級分別統計，含做題日期、答對率等</p>
        </div>
      </div>

      {/* Overall */}
      <div className={`rounded-2xl p-5 subject-bg-${theme}-light space-y-3`}>
        <h2 className="font-bold">綜合練習統計</h2>
        {practiceHistory.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            <StatBox label="練習次數" value={practiceHistory.length} />
            <StatBox label="平均正確率" value={`${avgScore}%`} />
            <StatBox label="總答題" value={stats.totalAnswered} />
            <StatBox label="總正確" value={stats.totalCorrect} />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-3">此項目尚無練習記錄</p>
        )}
      </div>

      {/* Category stats */}
      <div className="bg-card rounded-2xl border p-5 space-y-3">
        <h2 className="font-bold">分類複習統計</h2>
        {catStats.some(c => c.total > 0) ? (
          <div className="space-y-2">
            {catStats.map(c => (
              <div key={c.category} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{c.category}</span>
                  <span className="text-muted-foreground">{c.accuracy}% ({c.correct}/{c.total})</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full gradient-${theme} rounded-full transition-all`} style={{ width: `${c.accuracy}%` }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-3">此項目尚無分類練習記錄</p>
        )}
      </div>

      {/* Practice history */}
      <div className="bg-card rounded-2xl border p-5 space-y-3">
        <h2 className="font-bold">練習歷史記錄</h2>
        {history.length > 0 ? (
          <div className="space-y-2 text-sm">
            {history.slice(0, 10).map(h => (
              <div key={h.id} className="flex justify-between items-center py-2 border-b last:border-0">
                <div>
                  <div className="font-medium">{h.type}</div>
                  <div className="text-xs text-muted-foreground">{new Date(h.timestamp).toLocaleString('zh-TW')}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{h.accuracy}%</div>
                  <div className="text-xs text-muted-foreground">{h.score}/{h.count}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-3">此項目尚無練習記錄</p>
        )}
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-card rounded-xl p-3 text-center">
      <div className="text-xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
