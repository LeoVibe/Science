import { useCallback, useEffect, useState } from 'react';
import { getApiBaseUrl } from '@/data/api';
import { Button } from '@/components/ui/button';

interface UserStatsSnapshot {
  uniqueDevices1d: number;
  uniqueDevices7d: number;
  uniqueDevices30d: number;
  gradeDistribution: Array<{ grade: number; deviceCount: number }>;
  totalAnswerEvents30d: number;
  devicesWithAnswers30d: number;
  avgAnswerEventsPerDevice30d: number | null;
}

export default function AdminUserStats() {
  const [stats, setStats] = useState<UserStatsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = sessionStorage.getItem('admin_token');
      if (!token) {
        setError('請先登入後台');
        setStats(null);
        return;
      }
      const base = getApiBaseUrl();
      const res = await fetch(`${base}/api/admin/activity/user-stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const t = await res.text().catch(() => '');
        throw new Error(t || res.statusText);
      }
      const data = (await res.json()) as { ok?: boolean; stats?: UserStatsSnapshot };
      setStats(data.stats ?? null);
    } catch (e) {
      setStats(null);
      setError(e instanceof Error ? e.message : '載入失敗');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="bg-card rounded-2xl border p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm flex items-center gap-1.5">📊 使用者統計</h3>
            <p className="text-xs text-muted-foreground mt-1">
              以裝置識別（deviceId）估算不重複使用者；以「最近 1 天／7 天／30 天」內至少有一筆活動紀錄的裝置數為準。下方為近 30 日內裝置之年級推斷分佈（依日誌中出現最多次的年級）。
            </p>
          </div>
          <Button type="button" variant="secondary" size="sm" onClick={() => void load()}>
            重新整理
          </Button>
        </div>

        {loading && <div className="py-8 text-center text-muted-foreground text-sm">載入中…</div>}
        {error && <div className="py-4 px-3 rounded-xl bg-destructive/10 text-destructive text-xs">{error}</div>}

        {!loading && !error && stats && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <StatCard label="最近 1 天" value={stats.uniqueDevices1d} hint="至少一筆活動" />
              <StatCard label="最近 7 天" value={stats.uniqueDevices7d} hint="至少一筆活動" />
              <StatCard label="最近 30 天" value={stats.uniqueDevices30d} hint="至少一筆活動" />
            </div>

            <div className="rounded-xl border border-border/60 p-3 space-y-2">
              <div className="text-xs font-bold text-foreground">近 30 日 · 年級分佈（裝置數）</div>
              {stats.gradeDistribution.length === 0 ? (
                <p className="text-xs text-muted-foreground">尚無足夠年級資訊（請於前台操作並同步活動日誌）。</p>
              ) : (
                <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {stats.gradeDistribution.map((g) => (
                    <li
                      key={g.grade}
                      className="flex justify-between rounded-lg bg-muted/40 px-3 py-2 border border-border/40"
                    >
                      <span className="text-muted-foreground">{g.grade} 年級</span>
                      <span className="font-bold text-foreground">{g.deviceCount}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-xl border border-dashed border-border/60 p-3 space-y-1">
              <p className="text-xs font-bold text-foreground">近 30 日 · 答題事件（answer_question）</p>
              <p className="text-xs text-muted-foreground">
                總答題事件：{stats.totalAnswerEvents30d} · 曾答題裝置：{stats.devicesWithAnswers30d} ·
                平均每裝置答題數：
                {stats.avgAnswerEventsPerDevice30d != null
                  ? ` ${stats.avgAnswerEventsPerDevice30d.toFixed(1)}`
                  : ' —（尚無答題紀錄）'}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/20 p-4 text-center space-y-1">
      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">{label}</div>
      <div className="text-2xl font-black text-foreground tabular-nums">{value}</div>
      <div className="text-[10px] text-muted-foreground">{hint}</div>
    </div>
  );
}
