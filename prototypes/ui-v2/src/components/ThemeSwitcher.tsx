import { useEffect, useState } from 'react';

type Mode = 'light' | 'dark';

export default function ThemeSwitcher() {
  const [mode, setMode] = useState<Mode>(() => {
    if (typeof window === 'undefined') return 'light';
    const saved = localStorage.getItem('ui-v2-mode') as Mode | null;
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (mode === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('ui-v2-mode', mode);
  }, [mode]);

  return (
    <button
      type="button"
      onClick={() => setMode(m => (m === 'light' ? 'dark' : 'light'))}
      aria-label={mode === 'light' ? '切換到深色模式' : '切換到淺色模式'}
      className="fixed top-4 right-4 z-50 w-11 h-11 rounded-full bg-card border shadow-sm flex items-center justify-center text-lg hover:shadow-md active:scale-95 transition-all"
    >
      {mode === 'light' ? '🌙' : '☀️'}
    </button>
  );
}
