/**
 * JOB-016: Admin auth API 單元測試（mock fetch）
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { adminAuthRequest, fetchAdminUsers, patchAdminUser } from './api';

describe('adminAuthRequest', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('200 回傳 session 與 token', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        session: { email: 'owner@example.com', role: 'owner', provider: 'google' },
        token: 'fake-id-token',
      }),
    } as Response);

    const result = await adminAuthRequest('fake-id-token');
    expect(result.status).toBe(200);
    if (result.status === 200) {
      expect(result.session.email).toBe('owner@example.com');
      expect(result.session.role).toBe('owner');
      expect(result.token).toBe('fake-id-token');
    }
  });

  it('202 回傳 pending', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 202,
      json: async () => ({ message: 'pending', session: null }),
    } as Response);

    const result = await adminAuthRequest('fake-id-token');
    expect(result.status).toBe(202);
    if (result.status === 202) {
      expect(result.message).toBeDefined();
    }
  });

  it('403 回傳 error', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({ error: 'Account access has been rejected' }),
    } as Response);

    const result = await adminAuthRequest('fake-id-token');
    expect(result.status).toBe(403);
    if (result.status === 403) {
      expect(result.error).toContain('rejected');
    }
  });
});

describe('fetchAdminUsers', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('回傳 users 陣列', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        users: [
          { email: 'a@x.com', role: 'owner', status: 'approved', approved_at: '2026-01-01T00:00:00Z' },
          { email: 'b@x.com', role: 'editor', status: 'pending', requested_at: '2026-01-02T00:00:00Z' },
        ],
      }),
    } as Response);

    const users = await fetchAdminUsers('bearer-token');
    expect(users).toHaveLength(2);
    expect(users[0].email).toBe('a@x.com');
    expect(users[0].role).toBe('owner');
    expect(users[1].status).toBe('pending');
  });

  it('非 ok 時拋錯', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      text: async () => 'Forbidden',
    } as Response);

    await expect(fetchAdminUsers('bad-token')).rejects.toThrow();
  });
});

describe('patchAdminUser', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('approve 後回傳更新後 users', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ok: true,
        users: [
          { email: 'b@x.com', role: 'editor', status: 'approved', approved_at: '2026-01-01T12:00:00Z' },
        ],
      }),
    } as Response);

    const users = await patchAdminUser('bearer-token', 'b@x.com', 'approve');
    expect(users).toHaveLength(1);
    expect(users[0].status).toBe('approved');
  });
});
