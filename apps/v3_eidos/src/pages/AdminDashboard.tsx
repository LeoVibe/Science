import { useEffect, useMemo, useState } from 'react';
import { SESSION_ADMIN_API_REMOTE } from '@/data/api';
import { useNavigate, useLocation } from 'react-router-dom';
import AdminConfigPanel from '@/components/admin/AdminConfigPanel';
import AdminUserInsights from '@/components/admin/AdminUserInsights';
import AdminTestRunner from '@/components/admin/AdminTestRunner';
import AdminLibraryManager from '@/components/admin/AdminLibraryManager';
import AdminQualityAnalyzer from '@/components/admin/AdminQualityAnalyzer';
import AdminUserManager from '@/components/admin/AdminUserManager';
import AdminSiteFeedback from '@/components/admin/AdminSiteFeedback';
import AdminFeedbackInsights from '@/components/admin/AdminFeedbackInsights';
import AdminUserStats from '@/components/admin/AdminUserStats';
import AdminUserAnalysis from '@/components/admin/AdminUserAnalysis';
import AdminReviewDashboard from '@/components/admin/AdminReviewDashboard';
import AdminQuestionReview from '@/components/admin/AdminQuestionReview';
import libraryStats from '@/data/libraryStats.json';


type LibraryStatsFile = {
  lastUpdated?: string;
  totalIndexed?: number;
  stats?: Record<string, { count?: number }>;
  publisherStats?: Record<string, unknown>;
};

function getAdminHeadlineFromLibrary(): {
  totalQuestions: number;
  matrixCount: number;
  publisherComboCount: number;
  lastUpdated: string;
} {
  const raw = libraryStats as LibraryStatsFile;
  const stats = raw.stats ?? {};
  const publisherStats = raw.publisherStats ?? {};
  const sumCounts = Object.values(stats).reduce((acc, s) => acc + (typeof s?.count === 'number' ? s.count : 0), 0);
  const totalQuestions =
    typeof raw.totalIndexed === 'number' && raw.totalIndexed > 0 ? raw.totalIndexed : sumCounts;
  return {
    totalQuestions,
    matrixCount: Object.keys(stats).length,
    publisherComboCount: Object.keys(publisherStats).length,
    lastUpdated: raw.lastUpdated?.trim() || '—',
  };
}

// ─── 三大功能群組定義 ───────────────────────────────────
// 頂層 3 個 Tab + 每個群組內部的子分頁

type GroupKey = 'library' | 'analytics' | 'system';
type SubTabKey = string;

interface SubTab {
  key: SubTabKey;
  label: string;
  icon: string;
  ownerOnly?: boolean;
  component: React.ComponentType;
}

interface TabGroup {
  key: GroupKey;
  label: string;
  icon: string;
  subTabs: SubTab[];
}

const TAB_GROUPS: TabGroup[] = [
  {
    key: 'library',
    label: '題庫中心',
    icon: '📚',
    subTabs: [
      { key: 'review', label: '品質審核', icon: '✅', component: AdminReviewDashboard },
      { key: 'manage', label: '上架管理', icon: '📦', component: AdminLibraryManager },
      { key: 'quality', label: '品質重評', icon: '📊', component: AdminQualityAnalyzer },
    ],
  },
  {
    key: 'analytics',
    label: '分析中心',
    icon: '📈',
    subTabs: [
      { key: 'site_feedback', label: '留言回饋', icon: '💌', component: AdminSiteFeedback },
      { key: 'feedback', label: '題目回饋', icon: '💬', component: AdminFeedbackInsights },
      { key: 'user_stats', label: '營運統計', icon: '📊', component: AdminUserStats },
      { key: 'user_analysis', label: '使用者分析', icon: '🧭', component: AdminUserAnalysis },
      { key: 'usage', label: '使用者統計', icon: '👥', component: AdminUserInsights },
      { key: 'logs', label: '操作日誌', icon: '📋', component: AdminTestRunner },
    ],
  },
  {
    key: 'system',
    label: '系統管理',
    icon: '⚙️',
    subTabs: [
      { key: 'config', label: '全局參數', icon: '🎛️', component: AdminConfigPanel },
      { key: 'users', label: '帳號管理', icon: '🔐', ownerOnly: true, component: AdminUserManager },
    ],
  },
];

export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [role, setRole] = useState<string>('');

  const adminHeadline = useMemo(() => getAdminHeadlineFromLibrary(), []);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('admin_session');
      const session = raw ? (JSON.parse(raw) as { role?: string }) : null;
      setRole(session?.role ?? '');
    } catch {
      setRole('');
    }
  }, []);

  // 解析路由：從 pathname 提取 group 和 sub
  // /admin → 預設群組預設子頁
  // /admin/library → 題庫中心預設子頁
  // /admin/library/quality → 題庫中心的品質重評
  const { activeGroup, activeSubTab } = useMemo(() => {
    const segments = location.pathname.replace(/^\/admin\/?/, '').split('/').filter(Boolean);
    const groupKey = segments[0] || TAB_GROUPS[0].key;
    const group = TAB_GROUPS.find(g => g.key === groupKey) || TAB_GROUPS[0];

    const subKey = segments[1] || '';
    const availableSubs = group.subTabs.filter(s => !s.ownerOnly || role === 'owner');
    const sub = availableSubs.find(s => s.key === subKey) || availableSubs[0];

    return { activeGroup: group, activeSubTab: sub };
  }, [location.pathname, role]);

  const handleLogout = () => {
    try {
      sessionStorage.removeItem(SESSION_ADMIN_API_REMOTE);
    } catch { /* */ }
    sessionStorage.removeItem('admin_session');
    sessionStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  // 子頁路由導航
  const navigateToSub = (groupKey: string, subKey: string) => {
    navigate(`/admin/${groupKey}/${subKey}`);
  };

  const ActiveComponent = activeSubTab?.component;

  // 過濾掉需要 owner 才能看到的子分頁
  const visibleSubTabs = activeGroup.subTabs.filter(
    s => !s.ownerOnly || role === 'owner'
  );

  return (
    <div className="min-h-screen bg-background">
      {/* 頂部導航列 */}
      <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🛠️</span>
            <h1 className="text-base font-black text-foreground">eidos 後台管理</h1>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs font-bold text-muted-foreground hover:text-destructive transition-colors px-3 py-1.5 rounded-lg hover:bg-destructive/8"
          >
            登出
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 space-y-4">
        {/* 快速統計列 */}
        <div className="grid grid-cols-3 gap-2">
          <QuickStat
            icon="📝"
            value={adminHeadline.totalQuestions.toLocaleString('zh-TW')}
            label="上架題數（索引）"
            trend={`libraryStats · ${adminHeadline.lastUpdated}`}
          />
          <QuickStat
            icon="📚"
            value={adminHeadline.matrixCount.toLocaleString('zh-TW')}
            label="年級／學期／科矩陣"
            trend="見 libraryStats.stats"
          />
          <QuickStat
            icon="✅"
            value={adminHeadline.publisherComboCount.toLocaleString('zh-TW')}
            label="教材版本組合"
            trend="見 publisherStats"
            positive
          />
        </div>

        {/* ─── 頂層 3 大群組 Tab ─── */}
        <div className="flex rounded-2xl bg-secondary p-1 gap-1">
          {TAB_GROUPS.map(g => (
            <button
              key={g.key}
              onClick={() => navigateToSub(g.key, g.subTabs.filter(s => !s.ownerOnly || role === 'owner')[0]?.key || g.subTabs[0].key)}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${activeGroup.key === g.key
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              {g.icon} {g.label}
            </button>
          ))}
        </div>

        {/* ─── 子分頁切換列（膠囊按鈕） ─── */}
        {visibleSubTabs.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {visibleSubTabs.map(s => (
              <button
                key={s.key}
                onClick={() => navigateToSub(activeGroup.key, s.key)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeSubTab?.key === s.key
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-card border text-muted-foreground hover:text-foreground hover:border-primary/30'
                  }`}
              >
                {s.icon} {s.label}
              </button>
            ))}
          </div>
        )}

        {/* ─── 子頁內容 ─── */}
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  );
}

function QuickStat({ icon, value, label, trend, positive }: {
  icon: string; value: string; label: string; trend: string; positive?: boolean;
}) {
  return (
    <div className="bg-card rounded-2xl border p-3 text-center space-y-1">
      <span className="text-lg">{icon}</span>
      <div className="text-lg font-black text-foreground">{value}</div>
      <div className="text-[10px] text-muted-foreground font-medium">{label}</div>
      <div className={`text-[10px] font-bold ${positive ? 'text-correct' : 'text-primary'}`}>{trend}</div>
    </div>
  );
}
