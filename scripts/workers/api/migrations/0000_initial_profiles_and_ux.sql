-- JOB-001: 個人資料 (profiles) 與作業偏好 (UX)
-- 執行: wrangler d1 migrations apply eidos-db

CREATE TABLE IF NOT EXISTS profiles (
  user_id TEXT PRIMARY KEY,
  base_year INTEGER NOT NULL DEFAULT 2026,
  publisher_preferences TEXT NOT NULL DEFAULT '{}',
  quiz_next_delay INTEGER NOT NULL DEFAULT 1000,
  shortcut_enabled INTEGER NOT NULL DEFAULT 1,
  theme TEXT NOT NULL DEFAULT 'light',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
