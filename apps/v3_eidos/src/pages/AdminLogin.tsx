import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAuthRequest, getApiBaseUrl } from '@/data/api';

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (res: { credential: string }) => void }) => void;
          prompt: (momentListener?: (v: unknown) => void) => void;
        };
      };
    };
  }
}

type LoginState = 'idle' | 'loading' | 'approved' | 'pending' | 'rejected';

export default function AdminLogin() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginState, setLoginState] = useState<LoginState>('idle');
  const [gisReady, setGisReady] = useState(false);
  const initialized = useRef(false);
  const navigate = useNavigate();

  const clientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined)?.trim() || undefined;

  const processCredential = useCallback(
    async (credential: string) => {
      setLoading(true);
      setError('');
      setLoginState('idle');

      try {
        const payload = decodeJwtPayload(credential);
        if (!payload) {
          setError('Google 登入回傳資料無效，請重新嘗試。');
          return;
        }
        const clientIdEnv = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
        if (clientIdEnv && payload.aud && payload.aud !== clientIdEnv) {
          setError('Google Token 的 clientId 不符設定，請檢查 OAuth Client ID。');
          return;
        }
        const now = Date.now() / 1000;
        if (typeof payload.exp === 'number' && payload.exp < now) {
          setError('Google 登入已過期，請重新登入。');
          return;
        }
        const email = String(payload.email || '').toLowerCase();
        const emailVerified = payload.email_verified === true || payload.email_verified === 'true';
        if (!email || !emailVerified) {
          setError('Google 尚未驗證此 Email，無法登入後台。');
          return;
        }

        const result = await adminAuthRequest(credential);
        if (result.status === 200) {
          sessionStorage.setItem('admin_session', JSON.stringify(result.session));
          sessionStorage.setItem('admin_token', result.token);
          setLoginState('approved');
          navigate('/admin', { replace: true });
          return;
        }
        if (result.status === 202) {
          setLoginState('pending');
          return;
        }
        setLoginState('rejected');
        setError(result.error || '此帳號已被管理者拒絕存取。');
      } catch (e) {
        const msg = e instanceof Error ? e.message : '後端驗證失敗，請稍後再試。';
        if (msg === 'Failed to fetch' || msg.includes('fetch') || msg.includes('NetworkError')) {
          setError(`無法連線後端 API。目前設定指向：${getApiBaseUrl()}。請確認後端服務是否已啟動或 URL 是否正確。`);
        } else {
          setError(msg);
        }
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );

  const callbackRef = useRef(processCredential);
  callbackRef.current = processCredential;

  useEffect(() => {
    if (window.google?.accounts?.id) {
      setGisReady(true);
      return;
    }
    const check = () => {
      if (window.google?.accounts?.id) {
        setGisReady(true);
        return true;
      }
      return false;
    };
    if (check()) return;
    const t = setInterval(() => {
      if (check()) clearInterval(t);
    }, 100);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!gisReady || !clientId || initialized.current) return;
    initialized.current = true;
    window.google!.accounts.id.initialize({
      client_id: clientId,
      callback: (res) => callbackRef.current(res.credential),
    });
  }, [gisReady, clientId]);

  const handleGoogleLogin = () => {
    setError('');
    setLoginState('idle');
    if (!clientId) {
      setError('尚未設定 VITE_GOOGLE_CLIENT_ID，請先在環境變數中設定 Google OAuth Client ID。');
      return;
    }
    if (!gisReady) {
      setError('Google 登入載入中，請稍候再試。');
      return;
    }
    if (loading) return;
    try {
      window.google!.accounts.id.prompt();
    } catch (e) {
      setError('無法開啟 Google 登入視窗，請重新整理頁面再試。');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 mx-auto flex items-center justify-center">
            <span className="text-3xl">🔐</span>
          </div>
          <h1 className="text-xl font-black text-foreground">系統管理</h1>
          <p className="text-sm text-muted-foreground">管理員登入（透過 Google OAuth 驗證）</p>
        </div>

        <div className="bg-card rounded-2xl border p-6 space-y-4">
          {loginState === 'pending' && (
            <div className="bg-primary/10 text-primary text-sm font-medium px-3 py-3 rounded-xl text-center">
              ✅ 申請已送出！請等待管理者審核。
            </div>
          )}
          {error && (
            <div className="bg-destructive/10 text-destructive text-xs font-medium px-3 py-2 rounded-xl">
              {error}
            </div>
          )}

          <button
            type="button"
            disabled={loading || !gisReady}
            onClick={handleGoogleLogin}
            className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-bold text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? '驗證中...' : !gisReady ? '載入 Google 登入...' : '使用 Google 帳號登入'}
          </button>
        </div>

        <p className="text-center text-[10px] text-muted-foreground">
          驗證機制：須先透過 Google OAuth 登入，經管理者許可後方可進入後台。
        </p>
        {clientId && (
          <p className="text-center text-[10px] text-muted-foreground/80 break-all">
            目前網站來源：<code className="bg-muted px-1 rounded">{window.location.origin}</code>
            <br />
            <span className="text-muted-foreground/60">請在 Google Console 的「授權的 JavaScript 來源」加入此網址</span>
          </p>
        )}
      </div>
    </div>
  );
}
