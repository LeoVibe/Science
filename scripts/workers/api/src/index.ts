/**
 * JOB-001: Eidos API — Profiles (D1) & Site Settings (KV)
 * JOB-016: Admin auth request + dynamic whitelist (admin_users in KV)
 * - GET/PUT/PATCH /api/profiles/:userId
 * - GET/PUT /api/settings, GET /api/settings/:key
 * - POST /api/admin/auth/request, GET/PATCH /api/admin/auth/users
 */

import { aggregateActivitySummary, aggregateUserAnalysis, aggregateUserStats } from './userAnalysis';

/** 與前端 AdminLogin 本機繞過按鈕共用；僅在 .dev.vars 設 ADMIN_LOCAL_DEV_BYPASS=true 時生效，勿上線正式環境 */
const LOCAL_DEV_ADMIN_BYPASS_TOKEN = 'eidos-local-dev-bypass-v1';

export interface Env {
  DB: D1Database;
  SITE_SETTINGS: KVNamespace;
  ACTIVITY_LOGS: KVNamespace;
  /** Google OAuth Client ID（網頁應用程式），用於驗證 ID Token；需在 wrangler.toml [vars] 或 .dev.vars 設定 */
  GOOGLE_CLIENT_ID?: string;
  /** 後台首次啟動的 owner 種子帳號（逗號分隔 email） */
  ADMIN_OWNER_EMAILS?: string;
  /**
   * 設為字串 "true" 時，允許 Bearer 為 {@link LOCAL_DEV_ADMIN_BYPASS_TOKEN} 的本機繞過登入（僅 wrangler dev + .dev.vars）。
   * 正式部署勿設定此變數。
   */
  ADMIN_LOCAL_DEV_BYPASS?: string;
}

const KV_KEYS = {
  MAINTENANCE_MODE: 'maintenance_mode',
  ANNOUNCEMENT: 'announcement',
  API_VERSION: 'api_version',
  ADMIN_USERS: 'admin_users',
  ADMIN_CONFIG: 'admin_config',
} as const;

/** JOB-016: 後台帳號一筆 */
type AdminUserRecord = {
  email: string;
  role: 'owner' | 'editor';
  status: 'approved' | 'pending' | 'rejected';
  approved_at?: string;
  requested_at?: string;
};

type AdminConfig = {
  site_status: 'Open' | 'Maintenance';
  question_base_url: string;
  default_grade: number;
  default_semester: 1 | 2;
  default_subject: string;
  default_publisher: string;
  enable_survey: boolean;
  max_quiz_questions: number;
  library_config: unknown | null;
};

/** Cloudflare / 反向代理上的客戶端 IP（寫入活動紀錄供後台診斷） */

/** 題目回饋專用：排除全站留言；可選 7 日／30 日內（ISO 時間比對） */
function feedbackQuestionFilter(range: string | null): { clause: string; binds: string[] } {
  const exclude = "question_id != 'SITE_FEEDBACK'";
  if (!range || range === 'all') return { clause: exclude, binds: [] };
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 0;
  if (days <= 0) return { clause: exclude, binds: [] };
  const cut = new Date(Date.now() - days * 86400000).toISOString();
  return { clause: `${exclude} AND created_at >= ?`, binds: [cut] };
}

function extractClientIp(req: Request): string {
  const cf = req.headers.get('CF-Connecting-IP')?.trim();
  if (cf) return cf;
  const xff = req.headers.get('X-Forwarded-For');
  if (xff) {
    const first = xff.split(',')[0]?.trim();
    if (first) return first;
  }
  return '';
}

function parseOwnerSeedEmails(raw: string | undefined): string[] {
  if (!raw) return [];
  const unique = new Set(
    raw
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.length > 0)
  );
  return Array.from(unique);
}

function buildInitialOwners(seedEmails: string[]): AdminUserRecord[] {
  const now = new Date().toISOString();
  return seedEmails.map((email) => ({
    email,
    role: 'owner',
    status: 'approved',
    approved_at: now,
  }));
}

async function verifyGoogleIdToken(idToken: string, expectedClientId: string | undefined): Promise<{ email: string; email_verified: boolean } | null> {
  try {
    const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
    if (!res.ok) return null;
    const data = (await res.json()) as { aud?: string; email?: string; email_verified?: string };
    if (expectedClientId && data.aud !== expectedClientId) return null;
    const email = (data.email ?? '').toLowerCase();
    const emailVerified = data.email_verified === 'true' || data.email_verified === true;
    if (!email) return null;
    return { email, email_verified: emailVerified };
  } catch {
    return null;
  }
}

async function getAdminUsersList(env: Env): Promise<AdminUserRecord[]> {
  const raw = await env.SITE_SETTINGS.get(KV_KEYS.ADMIN_USERS);
  if (raw) {
    try {
      const list = JSON.parse(raw) as AdminUserRecord[];
      if (Array.isArray(list) && list.length > 0) return list;
    } catch {
      /* fallback to seed */
    }
  }
  const initialOwners = buildInitialOwners(parseOwnerSeedEmails(env.ADMIN_OWNER_EMAILS));
  if (initialOwners.length === 0) {
    throw new Error('Missing ADMIN_OWNER_EMAILS for initial admin owner bootstrap');
  }
  await env.SITE_SETTINGS.put(KV_KEYS.ADMIN_USERS, JSON.stringify(initialOwners));
  return initialOwners;
}

async function saveAdminUsersList(env: Env, list: AdminUserRecord[]): Promise<void> {
  await env.SITE_SETTINGS.put(KV_KEYS.ADMIN_USERS, JSON.stringify(list));
}

const DEFAULT_ADMIN_CONFIG: AdminConfig = {
  site_status: 'Open',
  question_base_url: '/questions/platform',
  default_grade: 5,
  default_semester: 2,
  default_subject: '國語',
  default_publisher: '康軒',
  enable_survey: true,
  max_quiz_questions: 25,
  library_config: null,
};

async function getAdminConfig(env: Env): Promise<AdminConfig> {
  const raw = await env.SITE_SETTINGS.get(KV_KEYS.ADMIN_CONFIG);
  if (!raw) return DEFAULT_ADMIN_CONFIG;
  try {
    const parsed = JSON.parse(raw) as Partial<AdminConfig>;
    return {
      site_status: parsed.site_status === 'Maintenance' ? 'Maintenance' : 'Open',
      question_base_url: typeof parsed.question_base_url === 'string' ? parsed.question_base_url : DEFAULT_ADMIN_CONFIG.question_base_url,
      default_grade: typeof parsed.default_grade === 'number' ? parsed.default_grade : DEFAULT_ADMIN_CONFIG.default_grade,
      default_semester: parsed.default_semester === 1 ? 1 : 2,
      default_subject: typeof parsed.default_subject === 'string' ? parsed.default_subject : DEFAULT_ADMIN_CONFIG.default_subject,
      default_publisher: typeof parsed.default_publisher === 'string' ? parsed.default_publisher : DEFAULT_ADMIN_CONFIG.default_publisher,
      enable_survey: typeof parsed.enable_survey === 'boolean' ? parsed.enable_survey : DEFAULT_ADMIN_CONFIG.enable_survey,
      max_quiz_questions: typeof parsed.max_quiz_questions === 'number' ? parsed.max_quiz_questions : DEFAULT_ADMIN_CONFIG.max_quiz_questions,
      library_config: parsed.library_config ?? null,
    };
  } catch {
    return DEFAULT_ADMIN_CONFIG;
  }
}

async function saveAdminConfig(env: Env, config: AdminConfig): Promise<void> {
  await env.SITE_SETTINGS.put(KV_KEYS.ADMIN_CONFIG, JSON.stringify(config));
}

async function verifyAdminBearerToken(req: Request, env: Env): Promise<{ ok: true; email: string; role: 'owner' | 'editor' } | { ok: false; status: number; error: string }> {
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!token) return { ok: false, status: 401, error: 'Unauthorized' };

  if (env.ADMIN_LOCAL_DEV_BYPASS === 'true' && token === LOCAL_DEV_ADMIN_BYPASS_TOKEN) {
    return { ok: true, email: 'local-dev@eidos.local', role: 'owner' };
  }

  const clientId = env.GOOGLE_CLIENT_ID?.trim();
  const verified = await verifyGoogleIdToken(token, clientId ?? undefined);
  if (!verified || !verified.email_verified) {
    return { ok: false, status: 401, error: 'Invalid token' };
  }

  const list = await getAdminUsersList(env);
  const caller = list.find((u) => u.email.toLowerCase() === verified.email.toLowerCase());
  if (!caller || caller.status !== 'approved') {
    return { ok: false, status: 403, error: 'Forbidden: account not approved' };
  }

  return { ok: true, email: caller.email, role: caller.role };
}

type ProfileRow = {
  user_id: string;
  base_year: number;
  publisher_preferences: string;
  quiz_next_delay: number;
  shortcut_enabled: number;
  theme: string;
  created_at: string;
  updated_at: string;
};

function json<T>(data: T, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });
}

function safeParseJSON<T>(raw: string | null | undefined, fallback: T): T {
  if (raw == null || raw === '') return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function corsHeaders(origin: string | null) {
  const o = origin || '*';
  return {
    'Access-Control-Allow-Origin': o,
    'Access-Control-Allow-Methods': 'GET, PUT, PATCH, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-Id',
    'Access-Control-Max-Age': '86400',
  };
}

function handleOptions(req: Request) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(req.headers.get('Origin')),
  });
}

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const origin = req.headers.get('Origin');
    const headers = corsHeaders(origin);

    if (req.method === 'OPTIONS') return handleOptions(req);

    const url = new URL(req.url);
    const path = url.pathname;

    try {
      // --- Profiles (D1) ---
      const profileMatch = path.match(/^\/api\/profiles\/([^/]+)\/?$/);
      if (profileMatch) {
        const userId = decodeURIComponent(profileMatch[1]);
        if (req.method === 'GET') {
          try {
            const row = await env.DB.prepare(
              'SELECT * FROM profiles WHERE user_id = ?'
            ).bind(userId).first<ProfileRow>();
            if (!row) return json({ error: 'Not found' }, { status: 404, headers });
            return json({
              user_id: row.user_id,
              base_year: row.base_year,
              publisher_preferences: safeParseJSON(row.publisher_preferences, {}),
              quiz_next_delay: row.quiz_next_delay,
              shortcut_enabled: Boolean(row.shortcut_enabled),
              theme: row.theme,
              created_at: row.created_at,
              updated_at: row.updated_at,
            }, { headers });
          } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            if (/no such table|profiles|SQLITE_ERROR/i.test(msg)) {
              return json({ error: 'Database not ready', hint: 'Run: cd backend/api && npm run db:migrate' }, { status: 503, headers });
            }
            throw e;
          }
        }
        if (req.method === 'PUT' || req.method === 'PATCH') {
          let body: Record<string, unknown> = {};
          try {
            body = (await req.json()) as Record<string, unknown>;
          } catch {
            return json({ error: 'Invalid JSON' }, { status: 400, headers });
          }
          const now = new Date().toISOString();
          const base_year = typeof body.base_year === 'number' ? body.base_year : undefined;
          const publisher_preferences =
            body.publisher_preferences !== undefined
              ? JSON.stringify(body.publisher_preferences)
              : undefined;
          const quiz_next_delay = typeof body.quiz_next_delay === 'number' ? body.quiz_next_delay : undefined;
          const shortcut_enabled = typeof body.shortcut_enabled === 'boolean' ? (body.shortcut_enabled ? 1 : 0) : undefined;
          const theme = typeof body.theme === 'string' ? body.theme : undefined;

          if (req.method === 'PUT') {
            await env.DB.prepare(
              `INSERT INTO profiles (user_id, base_year, publisher_preferences, quiz_next_delay, shortcut_enabled, theme, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)
               ON CONFLICT(user_id) DO UPDATE SET
                 base_year = excluded.base_year,
                 publisher_preferences = excluded.publisher_preferences,
                 quiz_next_delay = excluded.quiz_next_delay,
                 shortcut_enabled = excluded.shortcut_enabled,
                 theme = excluded.theme,
                 updated_at = excluded.updated_at`
            )
              .bind(
                userId,
                base_year ?? 2026,
                publisher_preferences ?? '{}',
                quiz_next_delay ?? 1000,
                shortcut_enabled ?? 1,
                theme ?? 'light',
                now,
                now
              )
              .run();
          } else {
            const row = await env.DB.prepare('SELECT * FROM profiles WHERE user_id = ?').bind(userId).first<ProfileRow>();
            if (!row) return json({ error: 'Not found' }, { status: 404, headers });
            const newBaseYear = base_year ?? row.base_year;
            const newPrefs = publisher_preferences ?? row.publisher_preferences;
            const newDelay = quiz_next_delay ?? row.quiz_next_delay;
            const newShortcut = shortcut_enabled ?? row.shortcut_enabled;
            const newTheme = theme ?? row.theme;
            await env.DB.prepare(
              `UPDATE profiles SET base_year = ?, publisher_preferences = ?, quiz_next_delay = ?, shortcut_enabled = ?, theme = ?, updated_at = ? WHERE user_id = ?`
            )
              .bind(newBaseYear, newPrefs, newDelay, newShortcut, newTheme, now, userId)
              .run();
          }
          const updated = await env.DB.prepare('SELECT * FROM profiles WHERE user_id = ?').bind(userId).first<ProfileRow>();
          if (!updated) return json({ error: 'Not found' }, { status: 404, headers });
          return json({
            user_id: updated.user_id,
            base_year: updated.base_year,
            publisher_preferences: safeParseJSON(updated.publisher_preferences, {}),
            quiz_next_delay: updated.quiz_next_delay,
            shortcut_enabled: Boolean(updated.shortcut_enabled),
            theme: updated.theme,
            created_at: updated.created_at,
            updated_at: updated.updated_at,
          }, { headers });
        }
        return new Response('Method Not Allowed', { status: 405, headers });
      }

      // --- Site Settings (KV) ---
      if (path === '/api/settings' && (req.method === 'GET' || req.method === 'PUT')) {
        if (req.method === 'GET') {
          const [maintenance_mode, announcement, api_version, adminConfig] = await Promise.all([
            env.SITE_SETTINGS.get(KV_KEYS.MAINTENANCE_MODE),
            env.SITE_SETTINGS.get(KV_KEYS.ANNOUNCEMENT),
            env.SITE_SETTINGS.get(KV_KEYS.API_VERSION),
            getAdminConfig(env),
          ]);
          return json({
            maintenance_mode: maintenance_mode === 'true',
            announcement: announcement ?? '',
            api_version: api_version ?? '',
            default_grade: adminConfig.default_grade,
            default_semester: adminConfig.default_semester,
            default_subject: adminConfig.default_subject,
            default_publisher: adminConfig.default_publisher,
            enable_survey: adminConfig.enable_survey,
            max_quiz_questions: adminConfig.max_quiz_questions,
            site_status: adminConfig.site_status,
            question_base_url: adminConfig.question_base_url,
            library_config: adminConfig.library_config,
          }, { headers });
        }
        let body: Record<string, unknown> = {};
        try {
          body = (await req.json()) as Record<string, unknown>;
        } catch {
          return json({ error: 'Invalid JSON' }, { status: 400, headers });
        }
        const updates: Promise<void>[] = [];
        if (typeof body.maintenance_mode === 'boolean') {
          updates.push(env.SITE_SETTINGS.put(KV_KEYS.MAINTENANCE_MODE, body.maintenance_mode ? 'true' : 'false'));
        }
        if (typeof body.announcement === 'string') {
          updates.push(env.SITE_SETTINGS.put(KV_KEYS.ANNOUNCEMENT, body.announcement));
        }
        if (typeof body.api_version === 'string') {
          updates.push(env.SITE_SETTINGS.put(KV_KEYS.API_VERSION, body.api_version));
        }
        await Promise.all(updates);
        const [maintenance_mode, announcement, api_version] = await Promise.all([
          env.SITE_SETTINGS.get(KV_KEYS.MAINTENANCE_MODE),
          env.SITE_SETTINGS.get(KV_KEYS.ANNOUNCEMENT),
          env.SITE_SETTINGS.get(KV_KEYS.API_VERSION),
        ]);
        return json({
          maintenance_mode: maintenance_mode === 'true',
          announcement: announcement ?? '',
          api_version: api_version ?? '',
        }, { headers });
      }

      if (path === '/api/admin/verify' && req.method === 'GET') {
        const verify = await verifyAdminBearerToken(req, env);
        if (!verify.ok) return json({ error: verify.error }, { status: verify.status, headers });
        return json({
          ok: true,
          session: {
            email: verify.email,
            role: verify.role,
            provider: 'google',
          },
        }, { headers });
      }

      if (path === '/api/admin/config' && (req.method === 'GET' || req.method === 'PUT')) {
        const verify = await verifyAdminBearerToken(req, env);
        if (!verify.ok) return json({ error: verify.error }, { status: verify.status, headers });
        if (req.method === 'GET') {
          const config = await getAdminConfig(env);
          return json({ config }, { headers });
        }

        let body: Partial<AdminConfig> = {};
        try {
          body = (await req.json()) as Partial<AdminConfig>;
        } catch {
          return json({ error: 'Invalid JSON' }, { status: 400, headers });
        }

        const current = await getAdminConfig(env);
        const next: AdminConfig = {
          site_status: body.site_status === 'Maintenance' ? 'Maintenance' : (body.site_status === 'Open' ? 'Open' : current.site_status),
          question_base_url: typeof body.question_base_url === 'string' ? body.question_base_url : current.question_base_url,
          default_grade: typeof body.default_grade === 'number' ? body.default_grade : current.default_grade,
          default_semester: body.default_semester === 1 ? 1 : (body.default_semester === 2 ? 2 : current.default_semester),
          default_subject: typeof body.default_subject === 'string' ? body.default_subject : current.default_subject,
          default_publisher: typeof body.default_publisher === 'string' ? body.default_publisher : current.default_publisher,
          enable_survey: typeof body.enable_survey === 'boolean' ? body.enable_survey : current.enable_survey,
          max_quiz_questions: typeof body.max_quiz_questions === 'number' ? body.max_quiz_questions : current.max_quiz_questions,
          library_config: body.library_config !== undefined ? body.library_config : current.library_config,
        };

        await saveAdminConfig(env, next);
        await env.SITE_SETTINGS.put(
          KV_KEYS.MAINTENANCE_MODE,
          next.site_status === 'Maintenance' ? 'true' : 'false'
        );
        return json({ ok: true, config: next }, { headers });
      }

      const settingsKeyMatch = path.match(/^\/api\/settings\/([^/]+)\/?$/);
      if (settingsKeyMatch && req.method === 'GET') {
        const key = decodeURIComponent(settingsKeyMatch[1]);
        const allowed = [KV_KEYS.MAINTENANCE_MODE, KV_KEYS.ANNOUNCEMENT, KV_KEYS.API_VERSION];
        if (!allowed.includes(key)) return json({ error: 'Forbidden key' }, { status: 400, headers });
        const value = await env.SITE_SETTINGS.get(key);
        if (value === null) return json({ [key]: null }, { headers });
        if (key === KV_KEYS.MAINTENANCE_MODE) return json({ [key]: value === 'true' }, { headers });
        return json({ [key]: value }, { headers });
      }

      // --- Admin Feedback Insights (D1) ---
      if (path === '/api/admin/feedback/stats' && req.method === 'GET') {
        const verify = await verifyAdminBearerToken(req, env);
        if (!verify.ok) return json({ error: verify.error }, { status: verify.status, headers });

        try {
          const range = url.searchParams.get('range');
          const { clause, binds } = feedbackQuestionFilter(range);
          // 1. 總計（僅題目回饋、依時間範圍）
          const totalRow = await env.DB.prepare(`SELECT COUNT(*) as c FROM feedback WHERE ${clause}`).bind(...binds).first();
          const total = typeof (totalRow as { c?: number })?.c === 'number' ? (totalRow as { c: number }).c : 0;

          // 2. 標籤分佈
          const tagStats = await env.DB.prepare(`SELECT tag, COUNT(*) as count FROM feedback WHERE ${clause} GROUP BY tag`).bind(...binds).all();

          // 3. 熱點題目
          const hotspotQuestions = await env.DB.prepare(
            `SELECT question_id, COUNT(*) as report_count FROM feedback WHERE ${clause} GROUP BY question_id ORDER BY report_count DESC LIMIT 10`
          )
            .bind(...binds)
            .all();

          return json(
            {
              ok: true,
              range: range && ['7d', '30d', 'all'].includes(range) ? range : 'all',
              total,
              tagStats: tagStats.results,
              hotspots: hotspotQuestions.results,
            },
            { headers }
          );
        } catch (e) {
          return json({ error: String(e) }, { status: 500, headers });
        }
      }

      if (path === '/api/admin/feedback/entries' && req.method === 'GET') {
        const verify = await verifyAdminBearerToken(req, env);
        if (!verify.ok) return json({ error: verify.error }, { status: verify.status, headers });
        try {
          const range = url.searchParams.get('range');
          const limitRaw = parseInt(url.searchParams.get('limit') || '300', 10);
          const limit = Math.min(500, Math.max(1, Number.isFinite(limitRaw) ? limitRaw : 300));
          const { clause, binds } = feedbackQuestionFilter(range);
          const rows = await env.DB.prepare(
            `SELECT id, user_id, question_id, tag, comment, created_at FROM feedback WHERE ${clause} ORDER BY created_at DESC LIMIT ?`
          )
            .bind(...binds, limit)
            .all();
          return json(
            {
              ok: true,
              range: range && ['7d', '30d', 'all'].includes(range) ? range : 'all',
              entries: rows.results ?? [],
            },
            { headers }
          );
        } catch (e) {
          return json({ error: String(e) }, { status: 500, headers });
        }
      }

      // --- 全站留言（與前台 About 以 question_id=SITE_FEEDBACK 寫入 D1）---
      if (path === '/api/admin/site-feedback' && req.method === 'GET') {
        const verify = await verifyAdminBearerToken(req, env);
        if (!verify.ok) return json({ error: verify.error }, { status: verify.status, headers });
        try {
          const rows = await env.DB.prepare(
            `SELECT user_id as user_id, comment, created_at FROM feedback WHERE question_id = ? ORDER BY created_at DESC LIMIT 200`
          ).bind('SITE_FEEDBACK').all();
          return json({ ok: true, details: rows.results ?? [] }, { headers });
        } catch (e) {
          return json({ error: String(e) }, { status: 500, headers });
        }
      }

      const feedbackDetailMatch = path.match(/^\/api\/admin\/feedback\/questions\/([^/]+)\/?$/);
      if (feedbackDetailMatch && req.method === 'GET') {
        const verify = await verifyAdminBearerToken(req, env);
        if (!verify.ok) return json({ error: verify.error }, { status: verify.status, headers });

        const questionId = decodeURIComponent(feedbackDetailMatch[1]);
        try {
          const details = await env.DB.prepare(
            'SELECT * FROM feedback WHERE question_id = ? ORDER BY created_at DESC'
          ).bind(questionId).all();
          return json({ ok: true, details: details.results }, { headers });
        } catch (e) {
          return json({ error: String(e) }, { status: 500, headers });
        }
      }

      // --- Activity Logs (KV) ---
      if (path === '/api/activity' && req.method === 'POST') {
        let body: { logs?: Array<{ deviceId: string; timestamp: string; action: string; details?: Record<string, unknown> }> } = {};
        try {
          body = (await req.json()) as typeof body;
        } catch {
          return json({ error: 'Invalid JSON' }, { status: 400, headers });
        }
        const logs = Array.isArray(body.logs) ? body.logs : [];
        if (logs.length === 0) return json({ ok: true }, { headers });
        const raw = await env.ACTIVITY_LOGS.get('recent');
        const recent: unknown[] = raw ? JSON.parse(raw) : [];
        const max = 2000;
        const clientIp = extractClientIp(req);
        for (const entry of logs) {
          if (entry?.deviceId && entry?.timestamp && entry?.action) {
            recent.push({
              deviceId: entry.deviceId,
              timestamp: entry.timestamp,
              action: entry.action,
              details: entry.details || {},
              ...(clientIp ? { clientIp } : {}),
            });
          }
        }
        await env.ACTIVITY_LOGS.put('recent', JSON.stringify(recent.slice(-max)));
        return json({ ok: true, count: logs.length }, { headers });
      }

      // --- Question Feedback (D1) ---
      if (path === '/api/feedback' && req.method === 'POST') {
        let body: { userId?: string; questionId?: string; tag?: string; comment?: string } = {};
        try {
          body = (await req.json()) as typeof body;
        } catch {
          return json({ error: 'Invalid JSON' }, { status: 400, headers });
        }

        const userId = body.userId || req.headers.get('X-User-Id') || 'anonymous';
        const { questionId, tag, comment } = body;

        if (!questionId || !tag) {
          return json({ error: 'Missing questionId or tag' }, { status: 400, headers });
        }

        const now = new Date().toISOString();
        try {
          await env.DB.prepare(
            'INSERT INTO feedback (user_id, question_id, tag, comment, created_at) VALUES (?, ?, ?, ?, ?)'
          )
            .bind(userId, questionId, tag, comment || null, now)
            .run();
          return json({ ok: true }, { headers });
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          if (/no such table|feedback/i.test(msg)) {
            return json({ error: 'Database table not ready', hint: 'Run: wrangler d1 migrations apply eidos-db --remote' }, { status: 503, headers });
          }
          throw e;
        }
      }

      if (path === '/api/activity' && req.method === 'GET') {
        const raw = await env.ACTIVITY_LOGS.get('recent');
        const logs = raw ? JSON.parse(raw) : [];
        return json({ logs }, { headers });
      }
      if (path === '/api/activity/insights' && req.method === 'GET') {
        const raw = await env.ACTIVITY_LOGS.get('recent');
        const logs: Array<{ deviceId: string; timestamp: string }> = raw ? JSON.parse(raw) : [];
        const byDevice = new Map<string, { first: string; last: string; days: Set<string> }>();
        for (const e of logs) {
          if (!e.deviceId || !e.timestamp) continue;
          const day = e.timestamp.slice(0, 10);
          let d = byDevice.get(e.deviceId);
          if (!d) {
            d = { first: e.timestamp, last: e.timestamp, days: new Set([day]) };
            byDevice.set(e.deviceId, d);
          } else {
            if (e.timestamp < d.first) d.first = e.timestamp;
            if (e.timestamp > d.last) d.last = e.timestamp;
            d.days.add(day);
          }
        }
        const devices = Array.from(byDevice.entries()).map(([deviceId, v]) => ({
          deviceId,
          firstSeen: v.first,
          lastSeen: v.last,
          activeDays: v.days.size,
        }));
        return json({ devices }, { headers });
      }

      if (path === '/api/admin/activity/user-stats' && req.method === 'GET') {
        const verify = await verifyAdminBearerToken(req, env);
        if (!verify.ok) return json({ error: verify.error }, { status: verify.status, headers });
        const raw = await env.ACTIVITY_LOGS.get('recent');
        const parsed: unknown = raw ? JSON.parse(raw) : [];
        const stats = aggregateUserStats(Array.isArray(parsed) ? parsed : [], new Date().toISOString());
        return json({ ok: true, stats }, { headers });
      }

      // --- JOB-081: Admin-only 使用者分析（活躍天數門檻 + IP / 年級 / 科目 / 時段） ---
      if (path === '/api/admin/activity/user-analysis' && req.method === 'GET') {
        const verify = await verifyAdminBearerToken(req, env);
        if (!verify.ok) return json({ error: verify.error }, { status: verify.status, headers });

        const minDaysParam = url.searchParams.get('minDays');
        let minDays = 5;
        if (minDaysParam !== null) {
          const n = parseInt(minDaysParam, 10);
          if (Number.isFinite(n)) minDays = n;
        }

        const raw = await env.ACTIVITY_LOGS.get('recent');
        const parsed: unknown = raw ? JSON.parse(raw) : [];
        const arr = Array.isArray(parsed) ? parsed : [];
        const devices = aggregateUserAnalysis(arr, minDays);
        const summary = aggregateActivitySummary(arr, minDays);
        return json({ ok: true, minDays, devices, summary }, { headers });
      }

      // --- JOB-016: Admin auth (dynamic whitelist) ---
      if (path === '/api/admin/auth/request' && req.method === 'POST') {
        let body: { id_token?: string } = {};
        try {
          body = (await req.json()) as typeof body;
        } catch {
          return json({ error: 'Invalid JSON' }, { status: 400, headers });
        }
        const idToken = typeof body.id_token === 'string' ? body.id_token.trim() : '';
        if (!idToken) return json({ error: 'Missing id_token' }, { status: 400, headers });

        const clientId = env.GOOGLE_CLIENT_ID?.trim();
        const verified = await verifyGoogleIdToken(idToken, clientId ?? undefined);
        if (!verified) {
          return json({ error: 'Invalid or expired Google token' }, { status: 401, headers });
        }
        if (!verified.email_verified) {
          return json({ error: 'Email not verified by Google' }, { status: 403, headers });
        }
        const email = verified.email;

        const list = await getAdminUsersList(env);
        const existing = list.find((u) => u.email.toLowerCase() === email.toLowerCase());

        if (existing) {
          if (existing.status === 'approved') {
            const session = { email: existing.email, role: existing.role, provider: 'google' as const };
            return json({ session, token: idToken }, { status: 200, headers });
          }
          if (existing.status === 'pending') {
            return json({ message: 'pending', session: null }, { status: 202, headers });
          }
          return json({ error: 'Account access has been rejected' }, { status: 403, headers });
        }

        const now = new Date().toISOString();
        const newUser: AdminUserRecord = {
          email,
          role: 'editor',
          status: 'pending',
          requested_at: now,
        };
        list.push(newUser);
        await saveAdminUsersList(env, list);
        return json({ message: 'pending', session: null }, { status: 202, headers });
      }

      if (path === '/api/admin/auth/users' && req.method === 'GET') {
        const verify = await verifyAdminBearerToken(req, env);
        if (!verify.ok) return json({ error: verify.error }, { status: verify.status, headers });
        if (verify.role !== 'owner') {
          return json({ error: 'Forbidden: owner only' }, { status: 403, headers });
        }
        const list = await getAdminUsersList(env);
        return json({ users: list }, { headers });
      }

      const patchUserMatch = path.match(/^\/api\/admin\/auth\/users\/([^/]+)\/?$/);
      if (patchUserMatch && req.method === 'PATCH') {
        const verify = await verifyAdminBearerToken(req, env);
        if (!verify.ok) return json({ error: verify.error }, { status: verify.status, headers });
        if (verify.role !== 'owner') {
          return json({ error: 'Forbidden: owner only' }, { status: 403, headers });
        }
        const list = await getAdminUsersList(env);

        const targetEmail = decodeURIComponent(patchUserMatch[1]).toLowerCase();
        let bodyPatch: { action?: string } = {};
        try {
          bodyPatch = (await req.json()) as typeof bodyPatch;
        } catch {
          return json({ error: 'Invalid JSON' }, { status: 400, headers });
        }
        const action = bodyPatch.action === 'approve' || bodyPatch.action === 'reject' || bodyPatch.action === 'remove' ? bodyPatch.action : undefined;
        if (!action) return json({ error: 'Missing or invalid action' }, { status: 400, headers });

        const target = list.find((u) => u.email.toLowerCase() === targetEmail);
        if (!target) return json({ error: 'User not found' }, { status: 404, headers });
        if (target.role === 'owner') {
          return json({ error: 'Cannot remove or reject an owner' }, { status: 403, headers });
        }
        const now = new Date().toISOString();
        if (action === 'approve') {
          target.status = 'approved';
          target.approved_at = now;
        } else if (action === 'reject') {
          target.status = 'rejected';
        } else {
          const idx = list.indexOf(target);
          list.splice(idx, 1);
          await saveAdminUsersList(env, list);
          return json({ ok: true, users: list }, { headers });
        }
        await saveAdminUsersList(env, list);
        return json({ ok: true, users: list }, { headers });
      }

      return json({ error: 'Not Found' }, { status: 404, headers });
    } catch (e) {
      console.error(e);
      return json({ error: 'Internal Server Error' }, { status: 500, headers });
    }
  },
};
