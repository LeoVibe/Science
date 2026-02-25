import { useState, useEffect } from 'react';
import { getApiBaseUrl } from '@/data/api';

interface ActivityLogEntry {
  deviceId: string;
  timestamp: string;
  action: string;
  details?: Record<string, unknown>;
}

export default function AdminTestRunner() {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const base = getApiBaseUrl();
    fetch(`${base}/api/activity`)
      .then(res => res.ok ? res.json() : Promise.reject(new Error(res.statusText)))
      .then((data: { logs?: ActivityLogEntry[] }) => {
        const list = Array.isArray(data.logs) ? data.logs : [];
        setLogs(list.slice().reverse());
        setError(null);
      })
      .catch(() => {
        setLogs([]);
        setError('無法載入活動日誌（請確認 Worker API 已部署且 ACTIVITY_LOGS KV 已建立）');
      })
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString('zh-TW', { dateStyle: 'short', timeStyle: 'short' });
    } catch {
      return iso;
    }
  };

  const detailStr = (d?: Record<string, unknown>) => {
    if (!d || typeof d !== 'object') return '—';
    const parts: string[] = [];
    if (d.grade != null) parts.push(`${d.grade}年級`);
    if (d.subject) parts.push(String(d.subject));
    if (d.semester != null) parts.push(`S${d.semester}`);
    if (d.publisher) parts.push(String(d.publisher));
    if (d.lesson) parts.push(String(d.lesson));
    if (d.type) parts.push(String(d.type));
    if (d.count != null) parts.push(`${d.count}題`);
    return parts.length ? parts.join(' · ') : '—';
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="bg-card rounded-2xl border p-4 space-y-4">
        <h3 className="font-bold text-sm flex items-center gap-1.5">📋 行動管理（操作日誌）</h3>
        <p className="text-xs text-muted-foreground">
          由新到舊列出所有活動軌跡：哪一天、哪個裝置、看了哪科哪版哪冊。資料來源：Cloudflare KV（前端 logActivity 同步後才會出現）。
        </p>

        {loading && (
          <div className="py-8 text-center text-muted-foreground text-sm">載入中…</div>
        )}
        {error && (
          <div className="py-4 px-3 rounded-xl bg-destructive/10 text-destructive text-xs">{error}</div>
        )}
        {!loading && !error && logs.length === 0 && (
          <div className="py-8 text-center text-muted-foreground text-sm">尚無操作紀錄</div>
        )}
        {!loading && !error && logs.length > 0 && (
          <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-card">
                <tr className="border-b border-border">
                  <th className="py-2 pr-2 font-bold">時間</th>
                  <th className="py-2 pr-2 font-bold">裝置</th>
                  <th className="py-2 pr-2 font-bold">動作</th>
                  <th className="py-2 font-bold">詳情</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-2 pr-2 text-muted-foreground whitespace-nowrap">{formatDate(log.timestamp)}</td>
                    <td className="py-2 pr-2 font-mono text-[10px] truncate max-w-[100px]" title={log.deviceId}>{log.deviceId}</td>
                    <td className="py-2 pr-2">{log.action}</td>
                    <td className="py-2 min-w-[140px]">{detailStr(log.details)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
