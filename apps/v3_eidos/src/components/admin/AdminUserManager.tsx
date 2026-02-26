/**
 * JOB-016: 後台帳號管理 — 僅 owner 可見
 * 待審核區：許可 / 拒絕；已核准區：列表（owner 不可操作）；已拒絕區：可重新許可
 */

import { useEffect, useState } from 'react';
import { fetchAdminUsers, patchAdminUser, type AdminUserRecord } from '@/data/api';

export default function AdminUserManager() {
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [acting, setActing] = useState<string | null>(null);

  const token = sessionStorage.getItem('admin_token') ?? '';

  const load = async () => {
    if (!token) {
      setError('未取得登入憑證');
      setLoading(false);
      return;
    }
    setError('');
    setLoading(true);
    try {
      const list = await fetchAdminUsers(token);
      setUsers(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : '無法載入帳號清單');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAction = async (email: string, action: 'approve' | 'reject' | 'remove') => {
    if (!token) return;
    setActing(email);
    setError('');
    try {
      const list = await patchAdminUser(token, email, action);
      setUsers(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : '操作失敗');
    } finally {
      setActing(null);
    }
  };

  const pending = users.filter((u) => u.status === 'pending');
  const approved = users.filter((u) => u.status === 'approved');
  const rejected = users.filter((u) => u.status === 'rejected');

  if (loading) {
    return (
      <div className="rounded-2xl border bg-card p-6 text-center text-muted-foreground">
        載入帳號清單中…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl bg-destructive/10 text-destructive text-sm font-medium px-4 py-2">
          {error}
        </div>
      )}

      {/* 待審核 */}
      <section>
        <h2 className="text-sm font-bold text-foreground mb-2">👤 待審核 (Pending)</h2>
        {pending.length === 0 ? (
          <p className="text-xs text-muted-foreground">目前沒有待審核的帳號</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {pending.map((u) => (
              <div
                key={u.email}
                className="rounded-xl border bg-card p-4 flex flex-wrap items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="font-medium text-foreground truncate">{u.email}</div>
                  {u.requested_at && (
                    <div className="text-[10px] text-muted-foreground">
                      申請於 {new Date(u.requested_at).toLocaleString('zh-TW')}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={acting === u.email}
                    onClick={() => handleAction(u.email, 'approve')}
                    className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                  >
                    {acting === u.email ? '處理中…' : '✅ 許可'}
                  </button>
                  <button
                    type="button"
                    disabled={acting === u.email}
                    onClick={() => handleAction(u.email, 'reject')}
                    className="rounded-lg border border-destructive/50 px-3 py-1.5 text-xs font-bold text-destructive hover:bg-destructive/10 disabled:opacity-50"
                  >
                    ❌ 拒絕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 已核准 */}
      <section>
        <h2 className="text-sm font-bold text-foreground mb-2">✅ 已核准 (Approved)</h2>
        {approved.length === 0 ? (
          <p className="text-xs text-muted-foreground">尚無已核准帳號</p>
        ) : (
          <ul className="rounded-xl border bg-card divide-y">
            {approved.map((u) => (
              <li
                key={u.email}
                className="px-4 py-3 flex items-center justify-between gap-2"
              >
                <div>
                  <span className="font-medium text-foreground">{u.email}</span>
                  {u.role === 'owner' && (
                    <span className="ml-2 text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                      Owner
                    </span>
                  )}
                  {u.approved_at && (
                    <div className="text-[10px] text-muted-foreground">
                      核准於 {new Date(u.approved_at).toLocaleString('zh-TW')}
                    </div>
                  )}
                </div>
                {u.role !== 'owner' && (
                  <button
                    type="button"
                    disabled={acting === u.email}
                    onClick={() => handleAction(u.email, 'remove')}
                    className="text-[10px] font-bold text-muted-foreground hover:text-destructive disabled:opacity-50"
                  >
                    {acting === u.email ? '處理中…' : '移除'}
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 已拒絕 */}
      <section>
        <h2 className="text-sm font-bold text-foreground mb-2">❌ 已拒絕 (Rejected)</h2>
        {rejected.length === 0 ? (
          <p className="text-xs text-muted-foreground">尚無被拒絕的帳號</p>
        ) : (
          <ul className="rounded-xl border bg-card divide-y">
            {rejected.map((u) => (
              <li
                key={u.email}
                className="px-4 py-3 flex items-center justify-between gap-2"
              >
                <span className="font-medium text-foreground">{u.email}</span>
                <button
                  type="button"
                  disabled={acting === u.email}
                  onClick={() => handleAction(u.email, 'approve')}
                  className="rounded-lg bg-primary/80 px-3 py-1.5 text-xs font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  {acting === u.email ? '處理中…' : '重新許可'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
