import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    // Simulate auth — in production this hits the Worker API
    setTimeout(() => {
      if (username && password) {
        sessionStorage.setItem('admin_token', btoa(`${username}:${password}`));
        navigate('/admin');
      } else {
        setError('請輸入帳號與密碼');
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo area */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 mx-auto flex items-center justify-center">
            <span className="text-3xl">🔐</span>
          </div>
          <h1 className="text-xl font-black text-foreground">後台管理系統</h1>
          <p className="text-sm text-muted-foreground">ScienceQuest 管理員登入</p>
        </div>

        {/* Login form */}
        <form onSubmit={handleLogin} className="bg-card rounded-2xl border p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground">管理員帳號</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="輸入帳號"
              className="w-full h-11 rounded-xl border border-input bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground">密碼</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="輸入密碼"
              className="w-full h-11 rounded-xl border border-input bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive text-xs font-medium px-3 py-2 rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-bold text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? '驗證中...' : '登入'}
          </button>
        </form>

        <p className="text-center text-[10px] text-muted-foreground">
          驗證機制：Cloudflare Workers + Basic Auth
        </p>
      </div>
    </div>
  );
}
