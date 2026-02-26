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
  default_grade?: number;
  default_semester?: number;
  default_subject?: string;
  default_publisher?: string;
  enable_survey?: boolean;
  max_quiz_questions?: number;
  site_status?: 'Open' | 'Maintenance';
  question_base_url?: string;
  library_config?: unknown | null;
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

// --- JOB-016: Admin auth (dynamic whitelist) ---

export interface AdminSession {
  email: string;
  role: string;
  provider: string;
}

export interface AdminConfig {
  site_status: 'Open' | 'Maintenance';
  question_base_url: string;
  default_grade: number;
  default_semester: 1 | 2;
  default_subject: string;
  default_publisher: string;
  enable_survey: boolean;
  max_quiz_questions: number;
  library_config: unknown | null;
}

export type AdminAuthRequestResult =
  | { status: 200; session: AdminSession; token: string }
  | { status: 202; message: string }
  | { status: 403; error: string };

/** 以 Google ID Token 向後端申請登入／審核狀態 */
export async function adminAuthRequest(idToken: string): Promise<AdminAuthRequestResult> {
  const url = `${getApiBaseUrl()}/api/admin/auth/request`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_token: idToken }),
  });
  const data = (await res.json().catch(() => ({}))) as { session?: AdminSession; token?: string; message?: string; error?: string };
  if (res.status === 200 && data.session && data.token) {
    return { status: 200, session: data.session, token: data.token };
  }
  if (res.status === 202) return { status: 202, message: data.message ?? 'pending' };
  return { status: 403, error: data.error ?? 'Access denied' };
}

export interface AdminUserRecord {
  email: string;
  role: 'owner' | 'editor';
  status: 'approved' | 'pending' | 'rejected';
  approved_at?: string;
  requested_at?: string;
}

/** 取得所有後台帳號（僅 owner）；需傳入 admin_token (Bearer) */
export async function fetchAdminUsers(adminToken: string): Promise<AdminUserRecord[]> {
  const url = `${getApiBaseUrl()}/api/admin/auth/users`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
  });
  if (!res.ok) throw new Error(await res.text().catch(() => `API ${res.status}`));
  const data = (await res.json()) as { users: AdminUserRecord[] };
  return Array.isArray(data.users) ? data.users : [];
}

/** 更新帳號狀態：approve | reject | remove（僅 owner） */
export async function patchAdminUser(
  adminToken: string,
  email: string,
  action: 'approve' | 'reject' | 'remove'
): Promise<AdminUserRecord[]> {
  const url = `${getApiBaseUrl()}/api/admin/auth/users/${encodeURIComponent(email)}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ action }),
  });
  if (!res.ok) throw new Error(await res.text().catch(() => `API ${res.status}`));
  const data = (await res.json()) as { users: AdminUserRecord[] };
  return Array.isArray(data.users) ? data.users : [];
}

/** 驗證目前 admin_token 是否有效 */
export async function verifyAdminSession(adminToken: string): Promise<AdminSession | null> {
  try {
    const url = `${getApiBaseUrl()}/api/admin/verify`;
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { ok?: boolean; session?: AdminSession };
    if (!data?.ok || !data.session) return null;
    return data.session;
  } catch {
    return null;
  }
}

/** 讀取後台全域配置（含題庫開關） */
export async function fetchAdminConfig(adminToken: string): Promise<AdminConfig | null> {
  try {
    const url = `${getApiBaseUrl()}/api/admin/config`;
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { config?: AdminConfig };
    return data?.config ?? null;
  } catch {
    return null;
  }
}

/** 儲存後台全域配置（含題庫開關） */
export async function saveAdminConfig(
  adminToken: string,
  config: Partial<AdminConfig>
): Promise<AdminConfig | null> {
  try {
    const url = `${getApiBaseUrl()}/api/admin/config`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(config),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { config?: AdminConfig };
    return data?.config ?? null;
  } catch {
    return null;
  }
}
