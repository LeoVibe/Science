/**
 * JOB-001: Eidos API — Profiles (D1) & Site Settings (KV)
 * - GET/PUT/PATCH /api/profiles/:userId
 * - GET/PUT /api/settings, GET /api/settings/:key
 */

export interface Env {
  DB: D1Database;
  SITE_SETTINGS: KVNamespace;
  ACTIVITY_LOGS: KVNamespace;
}

const KV_KEYS = {
  MAINTENANCE_MODE: 'maintenance_mode',
  ANNOUNCEMENT: 'announcement',
  API_VERSION: 'api_version',
} as const;

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
          const row = await env.DB.prepare(
            'SELECT * FROM profiles WHERE user_id = ?'
          ).bind(userId).first<ProfileRow>();
          if (!row) return json({ error: 'Not found' }, { status: 404, headers });
          return json({
            user_id: row.user_id,
            base_year: row.base_year,
            publisher_preferences: JSON.parse(row.publisher_preferences || '{}'),
            quiz_next_delay: row.quiz_next_delay,
            shortcut_enabled: Boolean(row.shortcut_enabled),
            theme: row.theme,
            created_at: row.created_at,
            updated_at: row.updated_at,
          }, { headers });
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
            publisher_preferences: JSON.parse(updated.publisher_preferences || '{}'),
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
        for (const entry of logs) {
          if (entry?.deviceId && entry?.timestamp && entry?.action) {
            recent.push({
              deviceId: entry.deviceId,
              timestamp: entry.timestamp,
              action: entry.action,
              details: entry.details || {},
            });
          }
        }
        await env.ACTIVITY_LOGS.put('recent', JSON.stringify(recent.slice(-max)));
        return json({ ok: true, count: logs.length }, { headers });
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

      return json({ error: 'Not Found' }, { status: 404, headers });
    } catch (e) {
      console.error(e);
      return json({ error: 'Internal Server Error' }, { status: 500, headers });
    }
  },
};
