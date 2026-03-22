import { useCallback, useEffect, useState } from 'react';
import { getApiBaseUrl } from '@/data/api';
import { withBase } from '@/utils/basePath';
import { Button } from '@/components/ui/button';
import { ExternalLink, ChevronDown, ChevronRight } from 'lucide-react';

interface DayHourSegment {
  hourUtc: number;
  firstAt: string;
  lastAt: string;
  eventCount: number;
}


interface ActivitySummary {
  topSubject30d: string | null;
  topGradeSubject30d: { grade: number; subject: string; events: number } | null;
  activeDaysRank: Array<{ rank: number; deviceId: string; activeDays: number; lastSeen: string }>;
}

interface UserAnalysisDevice {
  deviceId: string;
  activeDays: number;
  firstSeen: string;
  lastSeen: string;
  clientIps: string[];
  topGrade: number | null;
  topSubject: string | null;
  statsWrongPath: string | null;
  byDay: Array<{ date: string; hours: DayHourSegment[] }>;
}

/** 本機開發時活動多在同一天，預設門檻 5 會永遠為空；正式建置仍用 5 */
const DEFAULT_MIN_DAYS = import.meta.env.DEV ? 1 : 5;

export default function AdminUserAnalysis() {
  const [devices, setDevices] = useState<UserAnalysisDevice[]>([]);
  const [minDays, setMinDays] = useState(DEFAULT_MIN_DAYS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [summary, setSummary] = useState<ActivitySummary | null>(null);

  const toggle = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = sessionStorage.getItem('admin_token');
      if (!token) {
        setError('請先登入後台');
        setDevices([]);
        return;
      }
      const base = getApiBaseUrl();
      const res = await fetch(`${base}/api/admin/activity/user-analysis?minDays=${minDays}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const t = await res.text().catch(() => '');
        const isLocalBase =
          /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$/i.test(base) ||
          base.includes('localhost:') ||
          base.includes('127.0.0.1:');
        const hint404 =
          res.status === 404
            ? isLocalBase
              ? '（本機 Worker 請在 `backend/api` 執行 `npm run dev` 或 `npx wrangler dev`，確認程式已含 `/api/admin/activity/user-analysis` 後重啟）'
              : '（遠端 Worker 尚未部署此 API：請在 `backend/api` 執行 `npx wrangler deploy`，或推送 `main` 觸發 GitHub Actions；亦可暫時移除 `VITE_API_URL_REMOTE` 並用「本機認證測試」連本機）'
            : '';
        throw new Error((t || res.statusText) + hint404);
      }
      const data = (await res.json()) as { devices?: UserAnalysisDevice[]; summary?: ActivitySummary };
      setDevices(Array.isArray(data.devices) ? data.devices : []);
      setSummary(data.summary ?? null);
    } catch (e) {
      setDevices([]);
      setSummary(null);
      const msg = e instanceof Error ? e.message : String(e);
      setError(
        `無法載入使用者分析。請確認：① 已登入後台 ② 目前 API：${getApiBaseUrl()} ③ 本機測試請啟動 Worker（\`cd backend/api && npm run dev\`，:8787）；遠端若 404 請部署 Worker。詳情：${msg || '請求失敗'}`
      );
    } finally {
      setLoading(false);
    }
  }, [minDays]);

  useEffect(() => {
    void load();
  }, [load]);

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString('zh-TW', { dateStyle: 'short', timeStyle: 'short' });
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="bg-card rounded-2xl border p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm flex items-center gap-1.5">🧭 使用者分析（高活躍裝置）</h3>
            <p className="text-xs text-muted-foreground mt-1">
              僅列出活躍天數達門檻的裝置；依日曆日與 UTC 小時彙整活動時段、Edge 記錄的來源 IP、日誌中推斷的年級與常點科目。錯題統計連結依最近一次完整脈絡（年級／科目／學期／出版社）產生，與該裝置瀏覽器本機統計一致。
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <label htmlFor="user-analysis-min-days" className="text-muted-foreground whitespace-nowrap">
              活躍天數 ≥
            </label>
            <input
              id="user-analysis-min-days"
              type="number"
              min={1}
              max={365}
              value={minDays}
              onChange={(e) => setMinDays(Math.min(365, Math.max(1, parseInt(e.target.value, 10) || 5)))}
              className="w-16 rounded-md border border-input bg-background px-2 py-1 text-foreground"
            />
            <Button type="button" variant="secondary" size="sm" onClick={() => void load()}>
              重新整理
            </Button>
          </div>
        </div>

        {!loading && !error && summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1">
              <div className="font-bold text-foreground">近 30 日 · 最常科目（事件數）</div>
              <p className="text-muted-foreground">{summary.topSubject30d ?? '—'}</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1">
              <div className="font-bold text-foreground">近 30 日 · 年級＋科目熱點</div>
              {summary.topGradeSubject30d ? (
                <p className="text-muted-foreground">
                  {summary.topGradeSubject30d.grade} 年級 · {summary.topGradeSubject30d.subject}（{summary.topGradeSubject30d.events} 次）
                </p>
              ) : (
                <p className="text-muted-foreground">—</p>
              )}
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1 sm:col-span-2 lg:col-span-1">
              <div className="font-bold text-foreground">活躍日數排名（前 5，依目前門檻）</div>
              <ol className="list-decimal list-inside text-muted-foreground space-y-0.5">
                {summary.activeDaysRank.slice(0, 5).map((r) => (
                  <li key={r.deviceId}>
                    <span className="font-mono text-[10px]">{r.deviceId.slice(0, 8)}…</span> · {r.activeDays} 天
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}

        {loading && <div className="py-8 text-center text-muted-foreground text-sm">載入中…</div>}
        {error && <div className="py-4 px-3 rounded-xl bg-destructive/10 text-destructive text-xs">{error}</div>}
        {!loading && !error && devices.length === 0 && (
          <div className="py-8 text-center text-muted-foreground text-sm space-y-2">
            <p>尚無符合「活躍天數 ≥ {minDays}」的裝置。</p>
            <p className="text-xs">
              本機請先在前台操作幾次（觸發活動同步），或把上方門檻調為 <strong className="text-foreground">1</strong> 再按「重新整理」。
              若完全沒有 KV 資料，請確認 Worker 已啟動且 <code className="text-[10px] bg-muted px-1 rounded">VITE_API_URL</code> 指向該 Worker。
            </p>
          </div>
        )}
        {!loading && !error && devices.length > 0 && (
          <div className="overflow-x-auto space-y-2">
            {devices.map((d, idx) => {
              const open = expanded.has(d.deviceId);
              return (
                <div key={d.deviceId} className="rounded-xl border border-border/60 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggle(d.deviceId)}
                    className="w-full flex items-start gap-2 text-left px-3 py-2.5 bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    {open ? <ChevronDown className="w-4 h-4 shrink-0 mt-0.5" /> : <ChevronRight className="w-4 h-4 shrink-0 mt-0.5" />}
                    <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground block">排名 / 裝置 ID</span>
                        <span className="font-semibold text-foreground">#{idx + 1}</span>
                        <span className="font-mono text-[10px] break-all block">{d.deviceId}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">活躍 / 年級 / 科目</span>
                        <span className="font-semibold">
                          {d.activeDays} 天
                          {d.topGrade != null ? ` · 年級 ${d.topGrade}` : ''}
                          {d.topSubject ? ` · ${d.topSubject}` : ''}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">來源 IP</span>
                        <span className="break-all">{d.clientIps.length ? d.clientIps.join(', ') : '—（舊資料或本機請求）'}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground block">錯題／成果</span>
                        {d.statsWrongPath ? (
                          <a
                            href={withBase(d.statsWrongPath)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-primary font-medium underline-offset-2 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            開啟錯題統計 <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground">無法推斷路徑</span>
                        )}
                      </div>
                    </div>
                  </button>
                  {open && (
                    <div className="px-3 py-3 text-xs border-t border-border/50 space-y-3 bg-background">
                      <p className="text-muted-foreground">
                        初次 {formatDate(d.firstSeen)} · 最後 {formatDate(d.lastSeen)} · 時段以 UTC 小時分桶（與前端 ISO 紀錄一致）
                      </p>
                      <ul className="space-y-2">
                        {d.byDay.map((day) => (
                          <li key={day.date} className="rounded-lg border border-border/40 p-2">
                            <div className="font-semibold mb-1">{day.date}</div>
                            <ul className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
                              {day.hours.map((h) => (
                                <li key={`${day.date}-${h.hourUtc}`} className="text-muted-foreground">
                                  <span className="text-foreground font-medium">UTC {h.hourUtc}:00</span>
                                  {' · '}
                                  {h.eventCount} 筆 · {formatDate(h.firstAt)} — {formatDate(h.lastAt)}
                                </li>
                              ))}
                            </ul>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
