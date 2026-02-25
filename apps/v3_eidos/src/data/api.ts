/**
 * JOB-003: 前端與 Cloudflare Worker API 串接
 * 開發環境預設 http://localhost:8787
 */

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8787';

export function getApiBaseUrl(): string {
  return API_BASE.replace(/\/$/, '');
}

export interface SiteSettings {
  maintenance_mode: boolean;
  announcement: string;
  api_version: string;
}

export interface ApiProfile {
  user_id: string;
  base_year: number;
  publisher_preferences: {
    grade?: number;
    semester?: number;
    publisherBySubject?: Record<string, string>;
  };
  quiz_next_delay: number;
  shortcut_enabled: boolean;
  theme: string;
  created_at?: string;
  updated_at?: string;
}

async function fetchApi<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${getApiBaseUrl()}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `API ${res.status}`);
  }
  return res.json() as Promise<T>;
}

/** 取得全站設定（維護模式、公告、api_version） */
export async function fetchSiteSettings(): Promise<SiteSettings> {
  try {
    return await fetchApi<SiteSettings>('/api/settings');
  } catch {
    return {
      maintenance_mode: false,
      announcement: '',
      api_version: '',
    };
  }
}

/** 從 API 取得個人 profile，不存在時回傳 null */
export async function fetchUserProfile(userId: string): Promise<ApiProfile | null> {
  try {
    const url = `${getApiBaseUrl()}/api/profiles/${encodeURIComponent(userId)}`;
    const res = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`API ${res.status}`);
    return (await res.json()) as ApiProfile;
  } catch {
    return null;
  }
}

/** 將個人設定同步到 API（PUT 整筆覆寫） */
export async function syncUserProfile(userId: string, profile: {
  grade: number;
  semester: number;
  publisherBySubject: Record<string, string>;
  autoAdvanceDelayMs?: number;
  shortcut_enabled?: boolean;
  theme?: string;
}): Promise<ApiProfile | null> {
  try {
    const body = {
      base_year: new Date().getFullYear(),
      publisher_preferences: {
        grade: profile.grade,
        semester: profile.semester,
        publisherBySubject: profile.publisherBySubject,
      },
      quiz_next_delay: profile.autoAdvanceDelayMs ?? 1500,
      shortcut_enabled: profile.shortcut_enabled ?? true,
      theme: profile.theme ?? 'light',
    };
    return await fetchApi<ApiProfile>(`/api/profiles/${encodeURIComponent(userId)}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  } catch {
    return null;
  }
}
