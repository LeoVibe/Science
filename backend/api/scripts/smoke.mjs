#!/usr/bin/env node
/**
 * JOB-028 Phase 3 冒煙測試：對 Production API 打 GET 並檢查狀態碼。
 * 使用方式：BASE=https://eidos-api.你的子網域.workers.dev node scripts/smoke.mjs
 * 或：node scripts/smoke.mjs https://eidos-api.你的子網域.workers.dev
 */
const BASE = process.env.BASE || process.argv[2] || '';
if (!BASE) {
  console.error('請設定 BASE 或傳入 API 基底網址，例：');
  console.error('  BASE=https://eidos-api.xxx.workers.dev node scripts/smoke.mjs');
  console.error('  node scripts/smoke.mjs https://eidos-api.xxx.workers.dev');
  process.exit(1);
}
const base = BASE.replace(/\/$/, '');

const cases = [
  { path: '/api/settings', expect: 200, name: 'GET /api/settings' },
  { path: '/api/profiles/smoke-test-nonexistent-id', expect: 404, name: 'GET /api/profiles/:id (不存在)' },
  { path: '/api/admin/verify', expect: 401, name: 'GET /api/admin/verify (無 token)' },
];

let failed = 0;
for (const { path, expect, name } of cases) {
  const url = base + path;
  try {
    const res = await fetch(url);
    const ok = res.status === expect;
    if (!ok) failed++;
    console.log(ok ? '✅' : '❌', name, '→', res.status, ok ? '' : `(預期 ${expect})`);
  } catch (e) {
    failed++;
    console.log('❌', name, '→', e.message);
  }
}
process.exit(failed ? 1 : 0);
