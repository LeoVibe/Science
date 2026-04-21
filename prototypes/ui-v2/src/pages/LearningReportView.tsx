import { useState } from 'react';
import { MOCK_STATS, PUBLISHER_META, type PublisherKey } from '@/data/mock';

const SUBJECT: 'chinese' = 'chinese';

/*
 * 本頁 JSX 結構 1:1 對應 apps/v3_eidos/src/components/LearningReportView.tsx
 * 不引入 Clay Shadow、大圓角、font-zh 標題。
 * 出版社色：照抄主專案 config.ts 的 PUBLISHER_THEME_COLORS。
 */

const PUBLISHER_COLOR_HSL: Record<PublisherKey, string> = {
  kanghsuan: 'hsl(200 40% 62%)',
  nanyi: 'hsl(340 43% 63%)',
  hanlin: 'hsl(168 35% 52%)',
};

export default function LearningReportView() {
  const [pub, setPub] = useState<PublisherKey>('kanghsuan');
  const [tab, setTab] = useState<'stats' | 'wrong'>('stats');

  const stats = MOCK_STATS[pub];
  const theme = SUBJECT;
  const avgAccuracy = stats.accuracy;
  const totalAnswered = stats.totalAnswered;
  const totalCorrect = stats.totalCorrect;
  const practiceCount = stats.practiceCount;
  const hasRealStats = totalAnswered > 0;
  const wrongCount = stats.perCategory.length > 0 ? 3 : 0; // mock 錯題數

  return (
    <div className="max-w-lg mx-auto px-3 sm:px-4 py-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button className="text-muted-foreground hover:text-foreground transition-colors text-lg">
          ←
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-xl font-black text-foreground">📊 學習統計</h1>
          <p className="text-xs text-muted-foreground truncate">3年級 國語 下學期</p>
        </div>
      </div>

      {/* Publisher filter */}
      <div className="flex gap-1.5">
        {(Object.keys(PUBLISHER_META) as PublisherKey[]).map(p => {
          const isActive = pub === p;
          return (
            <button
              key={p}
              onClick={() => setPub(p)}
              className={`flex-1 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all active:scale-95 ${
                isActive ? 'shadow-sm text-white' : 'bg-secondary text-secondary-foreground hover:bg-muted'
              }`}
              style={isActive ? { background: PUBLISHER_COLOR_HSL[p] } : undefined}
            >
              {PUBLISHER_META[p].name}版
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
        >
          📊 統計總覽
        </button>
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
              <p className="text-sm text-muted-foreground">
                先完成一場測驗，這裡就會出現你的學習報告。
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2">
                <SummaryCard label="練習次數" value={practiceCount} icon="🏋️" />
                <SummaryCard label="總答題數" value={totalAnswered} icon="✍️" />
                <SummaryCard
                  label="平均正確率"
                  value={`${avgAccuracy}%`}
                  icon={avgAccuracy >= 80 ? '🌟' : avgAccuracy >= 60 ? '👍' : '💪'}
                />
              </div>

              <div className="bg-card rounded-2xl border p-4">
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 shrink-0">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="hsl(var(--muted))"
                        strokeWidth="3"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke={`hsl(var(--subject-${theme}))`}
                        strokeWidth="3"
                        strokeDasharray={`${avgAccuracy}, 100`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-black">{avgAccuracy}%</span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="font-bold text-sm">
                      整體正確率（{PUBLISHER_META[pub].name}版）
                    </p>
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-correct inline-block" />
                        正確 {totalCorrect}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-destructive inline-block" />
                        錯誤 {totalAnswered - totalCorrect}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {avgAccuracy >= 80
                        ? '表現優異！繼續保持 🎉'
                        : avgAccuracy >= 60
                        ? '穩定進步中，加油！💪'
                        : '多多練習，一定會進步的！📚'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-2xl border p-4 space-y-3">
                <h3 className="font-bold text-sm flex items-center gap-1.5">📚 各課正確率</h3>
                <div className="space-y-2.5">
                  {stats.perCategory.map(c => (
                    <div key={c.category} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium truncate flex-1">{c.category}</span>
                        <span className="text-muted-foreground shrink-0 ml-2">
                          {c.accuracy}% <span className="text-[10px]">({c.correct}/{c.total})</span>
                        </span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${c.accuracy}%`,
                            background:
                              c.accuracy >= 80
                                ? 'hsl(var(--correct))'
                                : c.accuracy >= 60
                                ? `hsl(var(--subject-${theme}))`
                                : 'hsl(var(--wrong))',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card rounded-2xl border p-4 space-y-3">
                <h3 className="font-bold text-sm flex items-center gap-1.5">🕐 練習歷史</h3>
                <div className="space-y-0">
                  {stats.recentHistory.map((h, i, arr) => (
                    <div
                      key={h.id}
                      className={`flex justify-between items-center py-2.5 ${
                        i < arr.length - 1 ? 'border-b border-border' : ''
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="font-medium text-sm truncate">{h.type}</div>
                        <div className="text-[10px] text-muted-foreground">{h.date}</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-muted-foreground">
                          {h.score}/{h.count}
                        </span>
                        <span
                          className={`text-sm font-bold ${
                            h.accuracy >= 80
                              ? 'text-correct'
                              : h.accuracy >= 60
                              ? 'text-foreground'
                              : 'text-wrong'
                          }`}
                        >
                          {h.accuracy}%
                        </span>
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
          <div className="bg-card rounded-2xl border p-8 text-center space-y-2">
            <span className="text-4xl">🎉</span>
            <p className="font-bold">沒有錯題！</p>
            <p className="text-sm text-muted-foreground">太棒了，繼續保持！</p>
            <p className="text-[11px] text-muted-foreground pt-2">
              （雛形此分頁僅示意；實際畫面會列出錯題卡片）
            </p>
          </div>
        </div>
      )}

      {/* 本頁改動對照 */}
      <p className="text-[11px] text-muted-foreground text-center leading-relaxed pt-2">
        <strong className="text-foreground">本頁套用：</strong>
        <span className="mx-1">L4.4-a</span>（SummaryCard icon 從 18px 放大到 30px）・
        <span className="mx-1">L4.4-b</span>（數字從 20px 升 24px）
      </p>
    </div>
  );
}

function SummaryCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    // 改動 L4.4-a：icon 從 text-lg 放大到 text-3xl；L4.4-b：數字從 text-xl 升 text-2xl
    <div className="bg-card rounded-2xl border p-3 text-center space-y-1.5">
      <span className="text-3xl block leading-none">{icon}</span>
      <div className="text-2xl font-black text-foreground">{value}</div>
      <div className="text-[10px] text-muted-foreground font-medium">{label}</div>
    </div>
  );
}
