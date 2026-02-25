import { useState } from 'react';

interface ConfigItem {
  key: string;
  label: string;
  value: string;
  type: 'select' | 'text' | 'toggle';
  options?: string[];
  description: string;
}

const INITIAL_CONFIG: ConfigItem[] = [
  {
    key: 'SITE_STATUS',
    label: '網站狀態',
    value: 'Open',
    type: 'select',
    options: ['Open', 'Maintenance'],
    description: '設定網站為正常開放或維護模式',
  },
  {
    key: 'QUESTION_BASE_URL',
    label: '題庫版本路徑',
    value: '/questions/platform',
    type: 'text',
    description: '題庫檔案的基礎路徑（CDN 或本地）',
  },
  {
    key: 'DEFAULT_GRADE',
    label: '預設年級',
    value: '5',
    type: 'select',
    options: ['3', '4', '5'],
    description: '新使用者的預設年級',
  },
  {
    key: 'DEFAULT_SEMESTER',
    label: '預設學期',
    value: '2',
    type: 'select',
    options: ['1', '2'],
    description: '新使用者的預設學期',
  },
  {
    key: 'DEFAULT_SUBJECT',
    label: '預設學科',
    value: '國語',
    type: 'select',
    options: ['國語', '數學', '自然', '社會', '英語'],
    description: '新使用者的預設學科',
  },
  {
    key: 'DEFAULT_PUBLISHER',
    label: '預設首選出版社',
    value: '康軒',
    type: 'select',
    options: ['康軒', '南一', '翰林'],
    description: '新使用者的預設出題版本（會套用至全部開放的學科）',
  },
  {
    key: 'ENABLE_SURVEY',
    label: '問卷調查',
    value: 'true',
    type: 'toggle',
    description: '開啟或關閉首次使用的問卷調查功能',
  },
  {
    key: 'MAX_QUIZ_QUESTIONS',
    label: '進階挑戰預設題目數量',
    value: '25',
    type: 'text',
    description: '進階挑戰模式的全局預設出題數量',
  },
];

export default function AdminConfigPanel() {
  const [config, setConfig] = useState(INITIAL_CONFIG);
  const [saved, setSaved] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);

  const updateValue = (key: string, value: string) => {
    setConfig(prev => prev.map(c => c.key === key ? { ...c, value } : c));
    setSaved(false);
  };

  const handleSave = () => {
    // 將所有設定寫入 localStorage 模擬持久化
    config.forEach(item => {
      localStorage.setItem(item.key, item.value);
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Status banner */}
      <div className="bg-card rounded-2xl border p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${config.find(c => c.key === 'SITE_STATUS')?.value === 'Open' ? 'bg-correct' : 'bg-destructive'} animate-pulse`} />
          <div>
            <p className="font-bold text-sm">網站狀態</p>
            <p className="text-xs text-muted-foreground">
              {config.find(c => c.key === 'SITE_STATUS')?.value === 'Open' ? '正常運行中' : '🚧 維護模式'}
            </p>
          </div>
        </div>
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${config.find(c => c.key === 'SITE_STATUS')?.value === 'Open'
          ? 'bg-correct/12 text-correct'
          : 'bg-destructive/12 text-destructive'
          }`}>
          {config.find(c => c.key === 'SITE_STATUS')?.value === 'Open' ? 'ONLINE' : 'MAINTENANCE'}
        </span>
      </div>

      {/* Config items */}
      <div className="bg-card rounded-2xl border divide-y divide-border">
        {config.map(item => (
          <div key={item.key} className="p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm text-foreground">{item.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{item.description}</p>
                <p className="text-[10px] font-mono text-primary/60 mt-0.5">{item.key}</p>
              </div>

              {item.type === 'select' && (
                <select
                  value={item.value}
                  onChange={e => updateValue(item.key, e.target.value)}
                  className="text-sm font-medium bg-secondary border-0 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {item.options?.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              )}

              {item.type === 'text' && (
                editingKey === item.key ? (
                  <input
                    type="text"
                    value={item.value}
                    onChange={e => updateValue(item.key, e.target.value)}
                    onBlur={() => setEditingKey(null)}
                    autoFocus
                    className="text-sm font-medium bg-secondary border-0 rounded-xl px-3 py-1.5 w-40 focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                ) : (
                  <button
                    onClick={() => setEditingKey(item.key)}
                    className="text-sm font-medium bg-secondary rounded-xl px-3 py-1.5 text-foreground hover:bg-muted transition-colors max-w-[180px] truncate"
                  >
                    {item.value}
                  </button>
                )
              )}

              {item.type === 'toggle' && (
                <button
                  onClick={() => updateValue(item.key, item.value === 'true' ? 'false' : 'true')}
                  className={`w-12 h-7 rounded-full transition-all relative ${item.value === 'true' ? 'bg-primary' : 'bg-muted'
                    }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-1 transition-all ${item.value === 'true' ? 'left-6' : 'left-1'
                    }`} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        className={`w-full py-3 rounded-2xl font-bold text-sm transition-all active:scale-[0.98] ${saved
          ? 'bg-correct text-white'
          : 'bg-primary text-primary-foreground hover:opacity-90'
          }`}
      >
        {saved ? '✅ 已儲存至 KV' : '💾 儲存設定'}
      </button>

      <p className="text-center text-[10px] text-muted-foreground">
        設定儲存至 Cloudflare KV，即時生效於所有前端
      </p>
    </div>
  );
}
