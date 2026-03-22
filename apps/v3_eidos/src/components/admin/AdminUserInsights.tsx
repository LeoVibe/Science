import { useMemo, useState, useEffect, useRef } from 'react';
import { getApiBaseUrl } from '@/data/api';
import { getDeviceDisplayPrimary, useAdminDeviceLabels } from '@/utils/adminDeviceLabels';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface DeviceInsight {
  deviceId: string;
  firstSeen: string;
  lastSeen: string;
  activeDays: number;
}

type WindowKey = '1' | '7' | '30' | '90' | 'all';

interface UniqueUsers {
  d1: number;
  d7: number;
  d30: number;
  d90: number;
  all: number;
}

/** 24 小時制、不帶「上午／下午／晚上」 */
function formatDateTime24h(iso: string): string {
  try {
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const h = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${y}/${m}/${day} ${h}:${min}`;
  } catch {
    return iso;
  }
}

function computeUniqueFromDevices(devices: DeviceInsight[], nowMs: number): UniqueUsers {
  const ms = (d: number) => nowMs - d * 86400000;
  const count = (days: number) =>
    devices.filter((x) => {
      const t = Date.parse(x.lastSeen);
      return Number.isFinite(t) && t >= ms(days);
    }).length;
  return {
    d1: count(1),
    d7: count(7),
    d30: count(30),
    d90: count(90),
    all: devices.length,
  };
}

function filterDevicesByWindow(devices: DeviceInsight[], win: WindowKey, nowMs: number): DeviceInsight[] {
  if (win === 'all') return devices;
  const days = parseInt(win, 10);
  const cut = nowMs - days * 86400000;
  return devices.filter((x) => {
    const t = Date.parse(x.lastSeen);
    return Number.isFinite(t) && t >= cut;
  });
}

export default function AdminUserInsights() {
  const { getLabel } = useAdminDeviceLabels();
  const [devices, setDevices] = useState<DeviceInsight[]>([]);
  const [uniqueUsers, setUniqueUsers] = useState<UniqueUsers | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [windowKey, setWindowKey] = useState<WindowKey>('30');
  const nowMsRef = useRef(Date.now());
  const nowMs = nowMsRef.current;

  useEffect(() => {
    const base = getApiBaseUrl();
    fetch(`${base}/api/activity/insights`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(res.statusText))))
      .then(
        (data: {
          devices?: DeviceInsight[];
          uniqueUsers?: UniqueUsers;
        }) => {
          setDevices(Array.isArray(data.devices) ? data.devices : []);
          setUniqueUsers(
            data.uniqueUsers &&
              typeof data.uniqueUsers.d1 === 'number' &&
              typeof data.uniqueUsers.d7 === 'number'
              ? data.uniqueUsers
              : null
          );
          setError(null);
        }
      )
      .catch(() => {
        setDevices([]);
        setUniqueUsers(null);
        setError('無法載入雲端統計（請確認 Worker API 已部署且 ACTIVITY_LOGS KV 已建立）');
      })
      .finally(() => setLoading(false));
  }, []);

  const counts = useMemo(() => {
    if (uniqueUsers) return uniqueUsers;
    if (!devices.length) return { d1: 0, d7: 0, d30: 0, d90: 0, all: 0 };
    return computeUniqueFromDevices(devices, nowMs);
  }, [uniqueUsers, devices, nowMs]);

  const filteredRows = useMemo(
    () => filterDevicesByWindow(devices, windowKey, nowMs),
    [devices, windowKey, nowMs]
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="bg-card rounded-2xl border p-4 space-y-4">
        <h3 className="font-bold text-sm flex items-center gap-1.5">👥 使用者統計（裝置明細）</h3>
        <p className="text-xs text-muted-foreground">
          以裝置識別碼 (deviceId) 分群，列出初次使用、最後活動與活躍天數。下方快篩為近 N 日至少有一筆活動之不重複裝置數；若需年級分佈與答題彙總，請見「營運統計」分頁。資料來源：KV（需前端同步活動日誌）。
        </p>

        {!loading && !error && devices.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">快篩 · 不重複使用者數</p>
            <ToggleGroup
              type="single"
              value={windowKey}
              onValueChange={(v) => {
                if (v === '1' || v === '7' || v === '30' || v === '90' || v === 'all') setWindowKey(v);
              }}
              variant="outline"
              size="sm"
              className="flex flex-wrap justify-start gap-1"
            >
              <ToggleGroupItem value="1" aria-label="近 1 日" className="text-xs data-[state=on]:bg-muted">
                近 1 日（{counts.d1}）
              </ToggleGroupItem>
              <ToggleGroupItem value="7" aria-label="近 7 日" className="text-xs data-[state=on]:bg-muted">
                近 7 日（{counts.d7}）
              </ToggleGroupItem>
              <ToggleGroupItem value="30" aria-label="近 30 日" className="text-xs data-[state=on]:bg-muted">
                近 30 日（{counts.d30}）
              </ToggleGroupItem>
              <ToggleGroupItem value="90" aria-label="近 90 日" className="text-xs data-[state=on]:bg-muted">
                近 90 日（{counts.d90}）
              </ToggleGroupItem>
              <ToggleGroupItem value="all" aria-label="全部" className="text-xs data-[state=on]:bg-muted">
                全部（{counts.all}）
              </ToggleGroupItem>
            </ToggleGroup>
            <p className="text-[10px] text-muted-foreground">
              目前列表依「最後活動」篩選至所選時間窗；數字與後端日誌一致（舊版 API 時以前端推估）。
            </p>
          </div>
        )}

        {loading && <div className="py-8 text-center text-muted-foreground text-sm">載入中…</div>}
        {error && <div className="py-4 px-3 rounded-xl bg-destructive/10 text-destructive text-xs">{error}</div>}
        {!loading && !error && devices.length === 0 && (
          <div className="py-8 text-center text-muted-foreground text-sm">尚無裝置紀錄</div>
        )}
        {!loading && !error && devices.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2 pr-2 font-bold">裝置</th>
                  <th className="py-2 pr-2 font-bold">初次使用</th>
                  <th className="py-2 pr-2 font-bold">最後活動</th>
                  <th className="py-2 font-bold">活躍天數</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((d) => (
                  <tr key={d.deviceId} className="border-b border-border/50">
                    <td className="py-2 pr-2">
                      <Badge
                        variant="outline"
                        className={getLabel(d.deviceId)?.trim() ? 'text-[10px] max-w-[12rem] truncate' : 'font-mono text-[10px]'}
                        title={d.deviceId}
                      >
                        {getDeviceDisplayPrimary(d.deviceId, getLabel)}
                      </Badge>
                    </td>
                    <td className="py-2 pr-2 text-muted-foreground tabular-nums">{formatDateTime24h(d.firstSeen)}</td>
                    <td className="py-2 pr-2 text-muted-foreground tabular-nums">{formatDateTime24h(d.lastSeen)}</td>
                    <td className="py-2 font-bold tabular-nums">{d.activeDays}</td>
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
