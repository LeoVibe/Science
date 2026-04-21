import { useNavigate } from 'react-router-dom';
import { MOCK_QUESTIONS } from '@/data/mock';

const SUBJECT: 'chinese' = 'chinese';
const optionLabels = ['A', 'B', 'C', 'D'];

/*
 * 本頁 JSX 結構 1:1 對應 apps/v3_eidos/src/components/ResultView.tsx
 * 不引入 Clay Shadow、環形 SVG 進度、大圖示
 */

function getEncouragement(accuracy: number): string {
  if (accuracy === 100) return '🏆 太厲害了！全部答對！';
  if (accuracy >= 80) return '🌟 表現很棒！繼續加油！';
  if (accuracy >= 60) return '💪 不錯喔！再多練習會更好！';
  return '📚 加油！多練習幾次就會進步！';
}

export default function ResultView() {
  const score = 3;
  const total = 4;
  const subject: 'chinese' = SUBJECT;
  const theme = subject;
  const accuracy = Math.round((score / total) * 100);

  // Mock session wrong (第 4 題)
  const sessionWrong = MOCK_QUESTIONS.slice(3, 4);
  // Mock 累積錯題紀錄
  const wrongRecords = MOCK_QUESTIONS.slice(3, 4).map(q => ({ questionId: q.id, wrong: 2, total: 3 }));
  const questionMap = new Map(MOCK_QUESTIONS.map(q => [q.id, q]));
  const navigate = useNavigate();

  // Mock 總體統計與最近練習
  const stats = { totalAnswered: 128, accuracy: 92 };
  const history = [
    { id: 'h1', type: '進階挑戰', accuracy: 92, score: 23, count: 25 },
    { id: 'h2', type: '第1課', accuracy: 90, score: 9, count: 10 },
    { id: 'h3', type: '基本挑戰', accuracy: 90, score: 9, count: 10 },
    { id: 'h4', type: '第3課', accuracy: 85, score: 17, count: 20 },
    { id: 'h5', type: '全部做', accuracy: 88, score: 88, count: 100 },
  ];

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      {/* Score */}
      <div className="text-center space-y-3">
        <h1 className="text-2xl font-black">🎉 答題完成！</h1>
        <div className={`text-6xl font-black subject-text-${theme}`}>
          {score}
          <span className="text-2xl text-muted-foreground">/{total}</span>
        </div>
        <div
          className={`inline-block px-4 py-1 rounded-full text-sm font-bold subject-bg-${theme}-light subject-text-${theme}`}
        >
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
      {sessionWrong.length > 0 && (
        <div className="bg-wrong-light rounded-2xl p-4 space-y-2">
          <h3 className="font-bold">❌ 本次答錯題目 ({sessionWrong.length}題)</h3>
          <button className="w-full py-2 rounded-xl bg-card border font-medium hover:shadow-sm transition-all">
            📖 查看錯題詳情
          </button>
        </div>
      )}

      {/* Accumulated wrong questions */}
      {wrongRecords.length > 0 && (
        <div className="bg-card rounded-2xl border p-4 space-y-3">
          <h3 className="font-bold">📝 累積錯題本</h3>
          <div className="space-y-3">
            {wrongRecords.slice(0, 5).map(r => {
              const q = questionMap.get(r.questionId);
              return (
                <div key={r.questionId} className="rounded-xl border bg-muted/30 p-3 space-y-2">
                  <div className="flex justify-between items-center flex-wrap gap-1">
                    {q?.category && (
                      <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{q.category}</span>
                    )}
                    <span className="text-xs text-destructive">
                      錯 {r.wrong} 次 / 共 {r.total} 次
                    </span>
                  </div>
                  {q ? (
                    <>
                      <p className="font-medium text-sm">{q.question}</p>
                      <div className="space-y-1">
                        {q.options.map((opt, j) => (
                          <div
                            key={j}
                            className={`px-2 py-1.5 rounded-lg text-sm flex items-start gap-2 ${
                              j === q.answerIndex ? 'bg-correct-light font-medium' : 'bg-muted/50'
                            }`}
                          >
                            <span className="font-bold text-muted-foreground">{optionLabels[j]}</span>
                            <span>{opt}</span>
                            {j === q.answerIndex && (
                              <span className="ml-auto text-green-600">✓ 正確答案</span>
                            )}
                          </div>
                        ))}
                      </div>
                      {q.explanation && (
                        <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-2">
                          💡 {q.explanation}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      題目 {r.questionId}（目前題庫中無此題）
                    </p>
                  )}
                </div>
              );
            })}
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
                <span>
                  {h.accuracy}% ({h.score}/{h.count})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => navigate('/quiz')}
          className={`flex-1 py-3 rounded-xl font-bold gradient-${theme} text-primary-foreground shadow-md active:scale-95 transition-all`}
        >
          🔄 再練習一次
        </button>
        <button
          onClick={() => navigate('/')}
          className="flex-1 py-3 rounded-xl font-bold bg-card border hover:shadow-md active:scale-95 transition-all"
        >
          🏠 返回主選單
        </button>
      </div>
    </div>
  );
}
