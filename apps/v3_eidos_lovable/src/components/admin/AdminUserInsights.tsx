import { useState } from 'react';

type InsightTab = 'overview' | 'publishers' | 'survey';

const GRADE_DIST = [
  { grade: 1, count: 45, pct: 4 },
  { grade: 2, count: 67, pct: 5 },
  { grade: 3, count: 198, pct: 16 },
  { grade: 4, count: 234, pct: 19 },
  { grade: 5, count: 412, pct: 33 },
  { grade: 6, count: 291, pct: 23 },
];

const PUBLISHER_PREF = [
  { subject: '國語', publishers: [{ name: '南一', pct: 52 }, { name: '康軒', pct: 31 }, { name: '翰林', pct: 17 }] },
  { subject: '數學', publishers: [{ name: '康軒', pct: 45 }, { name: '南一', pct: 38 }, { name: '翰林', pct: 17 }] },
  { subject: '英語', publishers: [{ name: '翰林', pct: 40 }, { name: '康軒', pct: 35 }, { name: '南一', pct: 25 }] },
  { subject: '自然', publishers: [{ name: '南一', pct: 48 }, { name: '翰林', pct: 30 }, { name: '康軒', pct: 22 }] },
  { subject: '社會', publishers: [{ name: '康軒', pct: 42 }, { name: '南一', pct: 36 }, { name: '翰林', pct: 22 }] },
];

const SURVEY_DATA = [
  { source: '老師推薦', count: 412, pct: 33 },
  { source: '家長分享', count: 298, pct: 24 },
  { source: '搜尋引擎', count: 224, pct: 18 },
  { source: '社群媒體', count: 187, pct: 15 },
  { source: '其他', count: 126, pct: 10 },
];

const PUB_COLORS: Record<string, string> = {
  '康軒': 'hsl(200 55% 55%)',
  '南一': 'hsl(350 50% 65%)',
  '翰林': 'hsl(168 45% 50%)',
};

export default function AdminUserInsights() {
  const [subtab, setSubtab] = useState<InsightTab>('overview');

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Sub-tabs */}
      <div className="flex gap-2">
        {([
          { key: 'overview' as InsightTab, label: '📊 註冊畫像' },
          { key: 'publishers' as InsightTab, label: '📚 出版社偏好' },
          { key: 'survey' as InsightTab, label: '📋 問卷分析' },
        ]).map(t => (
          <button
            key={t.key}
            onClick={() => setSubtab(t.key)}
            className={`flex-1 py-2 rounded-xl font-bold text-xs transition-all ${
              subtab === t.key
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {subtab === 'overview' && (
        <div className="space-y-4">
          <div className="bg-card rounded-2xl border p-4 space-y-4">
            <h3 className="font-bold text-sm flex items-center gap-1.5">📈 年級分布</h3>
            <div className="space-y-2.5">
              {GRADE_DIST.map(g => (
                <div key={g.grade} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium">{g.grade} 年級</span>
                    <span className="text-muted-foreground">{g.count} 人 ({g.pct}%)</span>
                  </div>
                  <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-700"
                      style={{ width: `${g.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <StatBox icon="🏫" label="學校數" value="87" sub="遍佈全台" />
            <StatBox icon="📱" label="行動裝置" value="73%" sub="手機使用者" />
            <StatBox icon="⏱️" label="平均時長" value="12 分" sub="每次練習" />
            <StatBox icon="🔄" label="回訪率" value="64%" sub="7 日內回訪" />
          </div>
        </div>
      )}

      {/* Publisher preferences */}
      {subtab === 'publishers' && (
        <div className="space-y-3">
          {PUBLISHER_PREF.map(sp => (
            <div key={sp.subject} className="bg-card rounded-2xl border p-4 space-y-3">
              <h4 className="font-bold text-sm">{sp.subject}</h4>
              <div className="flex gap-1 h-5 rounded-full overflow-hidden">
                {sp.publishers.map(p => (
                  <div
                    key={p.name}
                    className="h-full transition-all"
                    style={{ width: `${p.pct}%`, background: PUB_COLORS[p.name] }}
                  />
                ))}
              </div>
              <div className="flex gap-3">
                {sp.publishers.map(p => (
                  <div key={p.name} className="flex items-center gap-1.5 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: PUB_COLORS[p.name] }} />
                    <span className="font-medium">{p.name}</span>
                    <span className="text-muted-foreground">{p.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Survey */}
      {subtab === 'survey' && (
        <div className="space-y-4">
          <div className="bg-card rounded-2xl border p-4 space-y-4">
            <h3 className="font-bold text-sm flex items-center gap-1.5">🔍 來源管道分析</h3>
            <div className="space-y-2.5">
              {SURVEY_DATA.map((s, i) => (
                <div key={s.source} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium flex items-center gap-1.5">
                      <span className="text-sm">{['🏫', '👨‍👩‍👧', '🔍', '📱', '💬'][i]}</span>
                      {s.source}
                    </span>
                    <span className="text-muted-foreground">{s.count} 人 ({s.pct}%)</span>
                  </div>
                  <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-accent transition-all duration-700"
                      style={{ width: `${s.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-2xl border p-4 space-y-3">
            <h3 className="font-bold text-sm flex items-center gap-1.5">💬 使用者回饋摘要</h3>
            <div className="space-y-2">
              {[
                { feedback: '希望增加更多年級的題庫', count: 89, sentiment: 'neutral' },
                { feedback: '介面設計很棒，小孩很喜歡', count: 67, sentiment: 'positive' },
                { feedback: '希望能加入計時挑戰模式', count: 45, sentiment: 'neutral' },
                { feedback: '錯題重練功能非常實用', count: 38, sentiment: 'positive' },
              ].map(f => (
                <div key={f.feedback} className="flex items-start gap-2 bg-secondary rounded-xl p-3">
                  <span className="text-sm shrink-0">{f.sentiment === 'positive' ? '😊' : '💡'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground">{f.feedback}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{f.count} 人提及</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <p className="text-center text-[10px] text-muted-foreground">
        數據來源：Cloudflare D1 · 模擬展示資料
      </p>
    </div>
  );
}

function StatBox({ icon, label, value, sub }: { icon: string; label: string; value: string; sub: string }) {
  return (
    <div className="bg-card rounded-2xl border p-3 space-y-1">
      <div className="flex items-center gap-1.5">
        <span className="text-base">{icon}</span>
        <span className="text-[10px] text-muted-foreground font-medium">{label}</span>
      </div>
      <div className="text-xl font-black text-foreground">{value}</div>
      <div className="text-[10px] text-muted-foreground">{sub}</div>
    </div>
  );
}
