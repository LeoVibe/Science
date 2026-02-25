import { useParams, useNavigate } from 'react-router-dom';
import AdminConfigPanel from '@/components/admin/AdminConfigPanel';
import AdminUserInsights from '@/components/admin/AdminUserInsights';
import AdminTestRunner from '@/components/admin/AdminTestRunner';
import AdminLibraryManager from '@/components/admin/AdminLibraryManager';
import AdminQualityAnalyzer from '@/components/admin/AdminQualityAnalyzer';

type AdminTab = 'library' | 'config' | 'insights' | 'actions' | 'quality';

const TABS: { key: AdminTab; label: string; icon: string }[] = [
  { key: 'library', label: '題庫管理', icon: '📚' },
  { key: 'quality', label: '品質分析', icon: '📊' },
  { key: 'config', label: '全局參數', icon: '⚙️' },
  { key: 'insights', label: '使用統計', icon: '👥' },
  { key: 'actions', label: '行動管理', icon: '🧪' },
];


export default function AdminDashboard() {
  const { tab } = useParams<{ tab: string }>();
  const navigate = useNavigate();

  // Default strictly to library
  const activeTab: AdminTab = (tab && TABS.some(t => t.key === tab)) ? (tab as AdminTab) : 'library';

  const handleLogout = () => {
    sessionStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
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
        {/* Quick stats row */}
        <div className="grid grid-cols-3 gap-2">
          <QuickStat icon="👤" value="1,247" label="註冊人數" trend="+12%" />
          <QuickStat icon="📝" value="38,459" label="總答題數" trend="+8%" />
          <QuickStat icon="✅" value="42" label="題庫組合" trend="正常" positive />
        </div>

        {/* Tab navigation */}
        <div className="flex rounded-2xl bg-secondary p-1 gap-1">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => navigate(`/admin/${t.key}`)}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${activeTab === t.key
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'library' && <AdminLibraryManager />}
        {activeTab === 'quality' && <AdminQualityAnalyzer />}
        {activeTab === 'config' && <AdminConfigPanel />}
        {activeTab === 'insights' && <AdminUserInsights />}
        {activeTab === 'actions' && <AdminTestRunner />}
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
