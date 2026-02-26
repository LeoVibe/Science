import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { verifyAdminSession } from '@/data/api';

type AuthState = 'checking' | 'authed' | 'denied';

export default function RequireAdminAuth({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>('checking');

  useEffect(() => {
    let cancelled = false;
    const token = sessionStorage.getItem('admin_token') ?? '';
    if (!token) {
      setState('denied');
      return;
    }
    verifyAdminSession(token).then((session) => {
      if (cancelled) return;
      if (!session) {
        sessionStorage.removeItem('admin_token');
        sessionStorage.removeItem('admin_session');
        setState('denied');
        return;
      }
      sessionStorage.setItem('admin_session', JSON.stringify(session));
      setState('authed');
    });
    return () => { cancelled = true; };
  }, []);

  if (state === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        驗證管理員身分中…
      </div>
    );
  }

  if (state === 'denied') {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
