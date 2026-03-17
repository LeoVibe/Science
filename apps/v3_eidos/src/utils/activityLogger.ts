/**
 * 無帳號使用者活動日誌 (Activity Logger)
 * 以裝置識別碼 (deviceId UUID) 追蹤關鍵行為，本機儲存 + 可選雲端同步。
 */

const DEVICE_ID_KEY = 'eidos_device_id';
const ACTIVITY_QUEUE_KEY = 'eidos_activity_queue';
const ACTIVITY_HISTORY_KEY = 'eidos_activity_history';
const MAX_HISTORY_LOGS = 500;
import { getApiBaseUrl } from '@/data/api';

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

function getQueue(): ActivityEntry[] {
  try {
    const raw = localStorage.getItem(ACTIVITY_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function setQueue(logs: ActivityEntry[]) {
  localStorage.setItem(ACTIVITY_QUEUE_KEY, JSON.stringify(logs));
}

function addToHistory(entry: ActivityEntry) {
  try {
    const raw = localStorage.getItem(ACTIVITY_HISTORY_KEY);
    const history: ActivityEntry[] = raw ? JSON.parse(raw) : [];
    history.push(entry);
    localStorage.setItem(ACTIVITY_HISTORY_KEY, JSON.stringify(history.slice(-MAX_HISTORY_LOGS)));
  } catch { }
}

/** 寫入一筆活動紀錄至本機佇列（定時同步） */
export function logActivity(action: string, details: ActivityDetail = {}): void {
  const deviceId = getOrCreateDeviceId();
  const entry: ActivityEntry = {
    deviceId,
    timestamp: new Date().toISOString(),
    action,
    details,
  };

  // 加入佇列
  const queue = getQueue();
  queue.push(entry);
  setQueue(queue);

  // 同步存入歷史紀錄（供本機檢視，不刪除）
  addToHistory(entry);

  // 注意：不再呼叫 syncToCloudflare，改由外部定時器觸發 syncActivityLogs
}

/** 
 * 批次同步佇列中的日誌至 Cloudflare
 * 成功後會清除本機佇列
 */
export async function syncActivityLogs(): Promise<void> {
  const apiBase = getApiBaseUrl();
  if (!apiBase) return;

  const queue = getQueue();
  if (queue.length === 0) return;

  try {
    const url = `${apiBase}/api/activity`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ logs: queue }),
    });

    if (res.ok) {
      // 同步成功，清空佇列
      setQueue([]);
      console.log(`[Activity] Synced ${queue.length} logs.`);
    } else {
      console.warn(`[Activity] Sync failed: ${res.status}`);
    }
  } catch (err) {
    console.error('[Activity] Network error during sync:', err);
  }
}

// 舊函式相容性保留（若有其他地方呼叫）
export const syncToCloudflare = syncActivityLogs;

/** 讀取本機「歷史」活動日誌（供除錯或儀表板檢視） */
export function getLocalActivityLogs(): ActivityEntry[] {
  try {
    const raw = localStorage.getItem(ACTIVITY_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
