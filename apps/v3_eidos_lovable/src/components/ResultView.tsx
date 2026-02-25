import { Grade, Semester, Publisher, Subject, Question, SUBJECT_THEME_MAP, SUBJECT_ICONS, SEMESTER_NAMES } from '@/data/config';
import { getStatistics, getWrongQuestions, getPracticeHistory, AnswerRecord } from '@/utils/storage';

interface ResultViewProps {
  score: number;
  total: number;
  subject: Subject;
  grade: Grade;
  semester: Semester;
  publisher: Publisher;
  sessionWrongQuestions: Question[];
  onViewWrongQuestions: () => void;
  onRetry: () => void;
  onBackToMenu: () => void;
}

function getEncouragement(accuracy: number): string {
  if (accuracy === 100) return '🏆 太厲害了！全部答對！';
  if (accuracy >= 80) return '🌟 表現很棒！繼續加油！';
  if (accuracy >= 60) return '💪 不錯喔！再多練習會更好！';
  return '📚 加油！多練習幾次就會進步！';
}

export default function ResultView({
  score, total, subject, grade, semester, publisher,
  sessionWrongQuestions, onViewWrongQuestions, onRetry, onBackToMenu,
}: ResultViewProps) {
  const theme = SUBJECT_THEME_MAP[subject];
  const accuracy = Math.round((score / total) * 100);
  const stats = getStatistics(grade, subject, semester, publisher);
  const wrongRecords = getWrongQuestions(grade, subject, semester, publisher);
  const history = getPracticeHistory(grade, subject, semester, publisher).slice(0, 5);

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      {/* Score */}
      <div className="text-center space-y-3">
        <h1 className="text-2xl font-black">🎉 答題完成！</h1>
        <div className={`text-6xl font-black subject-text-${theme}`}>
          {score}<span className="text-2xl text-muted-foreground">/{total}</span>
        </div>
        <div className={`inline-block px-4 py-1 rounded-full text-sm font-bold subject-bg-${theme}-light subject-text-${theme}`}>
          正確率 {accuracy}%
        </div>
        <p className="text-lg font-medium">{getEncouragement(accuracy)}</p>
      </div>

      {/* Overall stats */}
      <div className="bg-card rounded-2xl border p-4 space-y-2">
        <h3 className="font-bold">📊 總體統計</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-muted rounded-xl p-2 text-center">
            <div className="text-lg font-bold">{stats.totalAnswered}</div>
            <div className="text-muted-foreground text-xs">總答題數</div>
          </div>
          <div className="bg-muted rounded-xl p-2 text-center">
            <div className="text-lg font-bold">{stats.accuracy}%</div>
            <div className="text-muted-foreground text-xs">總正確率</div>
          </div>
        </div>
      </div>

      {/* Session wrong questions */}
      {sessionWrongQuestions.length > 0 && (
        <div className="bg-wrong-light rounded-2xl p-4 space-y-2">
          <h3 className="font-bold">❌ 本次答錯題目 ({sessionWrongQuestions.length}題)</h3>
          <button
            onClick={onViewWrongQuestions}
            className="w-full py-2 rounded-xl bg-card border font-medium hover:shadow-sm transition-all"
          >
            📖 查看錯題詳情
          </button>
        </div>
      )}

      {/* Accumulated wrong questions preview */}
      {wrongRecords.length > 0 && (
        <div className="bg-card rounded-2xl border p-4 space-y-2">
          <h3 className="font-bold">📝 累積錯題本</h3>
          <div className="space-y-1">
            {wrongRecords.slice(0, 5).map((r: AnswerRecord) => (
              <div key={r.questionId} className="text-sm flex justify-between items-center py-1 border-b last:border-0">
                <span className="truncate flex-1">題目 {r.questionId}</span>
                <span className="text-destructive text-xs ml-2">錯 {r.wrong} 次</span>
              </div>
            ))}
            {wrongRecords.length > 5 && (
              <p className="text-xs text-muted-foreground">還有 {wrongRecords.length - 5} 題錯題…</p>
            )}
          </div>
        </div>
      )}

      {/* Recent history */}
      {history.length > 0 && (
        <div className="bg-card rounded-2xl border p-4 space-y-2">
          <h3 className="font-bold">📋 最近練習</h3>
          <div className="space-y-1 text-sm">
            {history.map(h => (
              <div key={h.id} className="flex justify-between py-1 border-b last:border-0">
                <span>{h.type}</span>
                <span>{h.accuracy}% ({h.score}/{h.count})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onRetry}
          className={`flex-1 py-3 rounded-xl font-bold gradient-${theme} text-primary-foreground shadow-md active:scale-95 transition-all`}
        >
          🔄 再練習一次
        </button>
        <button
          onClick={onBackToMenu}
          className="flex-1 py-3 rounded-xl font-bold bg-card border hover:shadow-md active:scale-95 transition-all"
        >
          🏠 返回主選單
        </button>
      </div>
    </div>
  );
}
