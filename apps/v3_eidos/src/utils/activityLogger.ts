/**
 * 無帳號使用者活動日誌 (Activity Logger)
 * 以裝置識別碼 (deviceId UUID) 追蹤關鍵行為，本機儲存 + 可選雲端同步。
 */

const DEVICE_ID_KEY = 'eidos_device_id';
const ACTIVITY_LOG_KEY = 'eidos_activity_log';
const MAX_LOCAL_LOGS = 500;

export interface ActivityDetail {
  grade?: number;
  subject?: string;
  semester?: number;
  publisher?: string;
  lesson?: string;
  view?: string;
  [key: string]: unknown;
}

export interface ActivityEntry {
  deviceId: string;
  timestamp: string; // ISO 8601
  action: string;
  details: ActivityDetail;
}

/** 取得或建立裝置識別碼 (UUID)，永久寫入 localStorage */
export function getOrCreateDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

function getLocalLogs(): ActivityEntry[] {
  try {
    const raw = localStorage.getItem(ACTIVITY_LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setLocalLogs(logs: ActivityEntry[]) {
  const capped = logs.slice(-MAX_LOCAL_LOGS);
  localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(capped));
}

/** 寫入一筆活動紀錄至本機，並可選同步至雲端 */
export function logActivity(action: string, details: ActivityDetail = {}): void {
  const deviceId = getOrCreateDeviceId();
  const entry: ActivityEntry = {
    deviceId,
    timestamp: new Date().toISOString(),
    action,
    details,
  };
  const logs = getLocalLogs();
  logs.push(entry);
  setLocalLogs(logs);
  syncToCloudflare(entry).catch(() => {});
}

/** 同步單筆或本機批次至 Cloudflare（預留 API）；失敗靜默忽略 */
export async function syncToCloudflare(entry?: ActivityEntry): Promise<void> {
  const apiBase = import.meta.env.VITE_API_URL || '';
  if (!apiBase) return;
  const url = `${apiBase.replace(/\/$/, '')}/api/activity`;
  const body = entry ? [entry] : getLocalLogs().slice(-50);
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ logs: body }),
  });
  if (!res.ok) throw new Error(`Activity sync failed: ${res.status}`);
}

/** 讀取本機活動日誌（供除錯或離線檢視）；後台統計應從 API 取得 */
export function getLocalActivityLogs(): ActivityEntry[] {
  return getLocalLogs();
}
