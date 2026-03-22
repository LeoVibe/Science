/**
 * JOB-003: 前端與 Cloudflare Worker API 串接
 * 開發環境預設 http://localhost:8787
 *
 * 本機開發可設定：
 * - VITE_API_URL：本機 Worker（預設 localhost:8787）
 * - VITE_API_URL_REMOTE：遠端 Worker；Google 後台登入成功後設 SESSION_ADMIN_API_REMOTE，後台請求改打遠端。
 * 「本機認證測試」繞過 token 一律只打本機 Worker。
 */

const LOCAL_DEV_BYPASS_TOKEN = 'eidos-local-dev-bypass-v1';

/** Google 後台登入成功後設為 '1'，登出／本機繞過時清除 */
export const SESSION_ADMIN_API_REMOTE = 'eidos_admin_api_remote';

/**
 * 正式 Worker 基底（建置未注入 VITE_API_URL 時，靜態託管網域不可當 API）
 * 與 deploy.yml / env.production.example 一致。
 */
const FALLBACK_PRODUCTION_API_URL = 'https://eidos-api.eidos.workers.dev';

function isStaticSiteHost(hostname: string): boolean {
  return (
    hostname.endsWith('.pages.dev') ||
    hostname.endsWith('.github.io') ||
    hostname === 'pages.dev'
  );
}

function getLocalApiBaseUrl(): string {
  if (import.meta.env.VITE_API_URL) {
    return String(import.meta.env.VITE_API_URL).replace(/\/$/, '');
  }
  if (typeof window !== 'undefined') {
    const { hostname } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8787';
    }
    // Cloudflare Pages / GitHub Pages 僅靜態檔，沒有 /api；不可使用 location.origin
    if (isStaticSiteHost(hostname)) {
      return FALLBACK_PRODUCTION_API_URL;
    }
  }
  return 'http://localhost:8787';
}

function getRemoteApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_URL_REMOTE;
  return typeof raw === 'string' ? raw.trim().replace(/\/$/, '') : '';
}

export function getApiBaseUrl(): string {
  const local = getLocalApiBaseUrl();
  const remote = getRemoteApiBaseUrl();
  if (!remote) return local;

  try {
    if (typeof window === 'undefined') return local;
    const token = sessionStorage.getItem('admin_token') ?? '';
    if (token === LOCAL_DEV_BYPASS_TOKEN) return local;
    if (
      token.startsWith('eyJ') &&
      sessionStorage.getItem(SESSION_ADMIN_API_REMOTE) === '1'
    ) {
      return remote;
    }
  } catch {
    /* sessionStorage 不可用 */
  }
  return local;
}

function getAdminAuthRequestBaseUrl(): string {
  const remote = getRemoteApiBaseUrl();
  if (remote) return remote;
  return getLocalApiBaseUrl();
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

export async function adminAuthRequest(idToken: string): Promise<AdminAuthRequestResult> {
  const url = `${getAdminAuthRequestBaseUrl()}/api/admin/auth/request`;
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

export async function verifyAdminSession(adminToken: string): Promise<AdminSession | null> {
  const host = typeof window !== 'undefined' ? window.location.hostname : '';
  const isLocalHost = host === 'localhost' || host === '127.0.0.1';
  if (adminToken === 'local-dev-token' && isLocalHost) {
    return { email: 'dev@local.host', role: 'owner', provider: 'local' };
  }
  if (adminToken === LOCAL_DEV_BYPASS_TOKEN && isLocalHost) {
    return { email: 'local-dev@eidos.local', role: 'owner', provider: 'local-dev' };
  }

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
