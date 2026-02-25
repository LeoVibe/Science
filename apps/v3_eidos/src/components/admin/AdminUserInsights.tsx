import { useState, useEffect } from 'react';
import { getApiBaseUrl } from '@/data/api';

interface DeviceInsight {
  deviceId: string;
  firstSeen: string;
  lastSeen: string;
  activeDays: number;
}

export default function AdminUserInsights() {
  const [devices, setDevices] = useState<DeviceInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const base = getApiBaseUrl();
    fetch(`${base}/api/activity/insights`)
      .then(res => res.ok ? res.json() : Promise.reject(new Error(res.statusText)))
      .then((data: { devices?: DeviceInsight[] }) => {
        setDevices(Array.isArray(data.devices) ? data.devices : []);
        setError(null);
      })
      .catch(() => {
        setDevices([]);
        setError('無法載入雲端統計（請確認 Worker API 已部署且 ACTIVITY_LOGS KV 已建立）');
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

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="bg-card rounded-2xl border p-4 space-y-4">
        <h3 className="font-bold text-sm flex items-center gap-1.5">👥 裝置統計（依活動軌跡）</h3>
        <p className="text-xs text-muted-foreground">
          以裝置識別碼 (deviceId) 分群，顯示初次使用日、最後活動時間與總活躍天數。資料來源：Cloudflare KV（需前端同步後才會出現）。
        </p>

        {loading && (
          <div className="py-8 text-center text-muted-foreground text-sm">載入中…</div>
        )}
        {error && (
          <div className="py-4 px-3 rounded-xl bg-destructive/10 text-destructive text-xs">{error}</div>
        )}
        {!loading && !error && devices.length === 0 && (
          <div className="py-8 text-center text-muted-foreground text-sm">尚無裝置紀錄</div>
        )}
        {!loading && !error && devices.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2 pr-2 font-bold">裝置 ID</th>
                  <th className="py-2 pr-2 font-bold">初次使用</th>
                  <th className="py-2 pr-2 font-bold">最後活動</th>
                  <th className="py-2 font-bold">活躍天數</th>
                </tr>
              </thead>
              <tbody>
                {devices.map(d => (
                  <tr key={d.deviceId} className="border-b border-border/50">
                    <td className="py-2 pr-2 font-mono text-[10px] truncate max-w-[120px]" title={d.deviceId}>{d.deviceId}</td>
                    <td className="py-2 pr-2 text-muted-foreground">{formatDate(d.firstSeen)}</td>
                    <td className="py-2 pr-2 text-muted-foreground">{formatDate(d.lastSeen)}</td>
                    <td className="py-2 font-bold">{d.activeDays}</td>
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
