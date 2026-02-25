import { useState } from 'react';

interface AboutViewProps {
  onBack: () => void;
}

type AboutTab = 'features' | 'changelog' | 'about';

export default function AboutView({ onBack }: AboutViewProps) {
  const [tab, setTab] = useState<AboutTab>('about');

  return (
    <div className="max-w-lg mx-auto px-3 sm:px-4 py-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors text-lg">←</button>
        <h1 className="text-lg sm:text-xl font-black text-foreground">🏫 關於本站</h1>
      </div>

      {/* Tabs */}
      <div className="flex rounded-2xl bg-secondary p-1 gap-1">
        {([
          { key: 'about' as AboutTab, label: '🏠 創站緣由' },
          { key: 'features' as AboutTab, label: '✨ 功能特色' },
          { key: 'changelog' as AboutTab, label: '📋 更版資訊' },
        ]).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              tab === t.key
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* About / 本站定位 Tab */}
      {tab === 'about' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-card rounded-2xl border overflow-hidden">
            <div className="px-5 py-4 bg-primary/8">
              <h2 className="text-lg font-black text-foreground">ScienceQuest 課後複習網站</h2>
              <p className="text-sm text-muted-foreground mt-1">為小學生設計的多學科互動複習平台</p>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <div className="bg-secondary rounded-2xl p-4 space-y-2">
                  <h3 className="font-bold text-foreground text-sm">📖 專案背景</h3>
                  <p className="text-xs leading-relaxed">
                    本站的起始，只是 2026 過年期間的 vibe coding 練習。原始動機是發現兒子常常考試很粗心，希望能有多一點的練習時間。純粹是設計題目給自己小三的兒子刷題玩，無任何營利想法與目標。
                  </p>
                </div>
                <div className="bg-secondary rounded-2xl p-4 space-y-2">
                  <h3 className="font-bold text-foreground text-sm">🛠️ 開發歷程</h3>
                  <p className="text-xs leading-relaxed">
                    本站從發想到實作皆由 Antigravity 與 Cursor 協作開發，後續加入 Lovable 與 Gemini 進行科目研究與題目設計。
                  </p>
                </div>
                <div className="bg-secondary rounded-2xl p-4 space-y-2">
                  <h3 className="font-bold text-foreground text-sm">🎯 定位與目標</h3>
                  <p className="text-xs leading-relaxed">
                    台灣目前有許多優質教育網站，但本站著重在題庫練習之用，未來會強化題目意涵。目前類似的網站有{' '}
                    <a href="https://www.tcool.cc" target="_blank" rel="noopener noreferrer" className="text-primary font-bold hover:underline">高中國中國小題庫</a> 與{' '}
                    <a href="https://www.studyark.org" target="_blank" rel="noopener noreferrer" className="text-primary font-bold hover:underline">學習方舟</a>。
                    但本站只希望操作可以更簡單，省心一點，每天回家用 5 分鐘，刷個題。
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-secondary rounded-2xl p-3">
                <span className="text-lg">📧</span>
                <div>
                  <p className="text-[10px] text-muted-foreground">聯絡信箱</p>
                  <p className="text-sm font-medium text-foreground">yotta0280@gmail.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Features / 功能特色 Tab */}
      {tab === 'features' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-card rounded-2xl border p-5 space-y-4">
            <div className="grid grid-cols-1 gap-3">
              {[
                { icon: '📖', title: '多學科支援', desc: '國語、數學、英語、自然、社會，一站搞定所有科目複習' },
                { icon: '🎯', title: '分課練習', desc: '依據課本章節分類，針對特定課程重點加強練習' },
                { icon: '🏆', title: '綜合挑戰', desc: '隨機出題的基本挑戰（10題）與進階挑戰（25題）模式' },
                { icon: '📊', title: '學習統計', desc: '即時追蹤各科正確率、練習次數與各課表現' },
                { icon: '❌', title: '錯題記錄', desc: '自動收集答錯題目，方便重複練習直到完全掌握' },
                { icon: '📚', title: '知識複習', desc: '瀏覽所有題庫，含答案與解析，適合考前快速複習' },
              ].map(f => (
                <div key={f.title} className="flex items-start gap-3 bg-secondary rounded-2xl p-4">
                  <span className="text-2xl shrink-0">{f.icon}</span>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">{f.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-2xl border p-5 space-y-3">
            <h3 className="font-bold text-sm flex items-center gap-1.5">📝 支援出版社</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { name: '康軒', color: 'hsl(200 55% 55%)' },
                { name: '南一', color: 'hsl(350 50% 65%)' },
                { name: '翰林', color: 'hsl(168 45% 50%)' },
              ].map(p => (
                <div key={p.name} className="text-center py-3 rounded-2xl text-white font-bold text-sm" style={{ background: p.color }}>
                  {p.name}版
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Changelog / 更版資訊 Tab */}
      {tab === 'changelog' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-card rounded-2xl border p-5 space-y-0">
            {[
              { ver: '0.7', date: '2026/2/21', desc: '海洋清爽配色、本站分頁改版', highlight: true },
              { ver: '0.6', date: '2026/2/18', desc: 'UI 全面優化、URL 路由', highlight: false },
              { ver: '0.5', date: '2026/2/10', desc: '野心亂測版，囊括全年級、全學科與三大出版社題庫版，但題目出的很爛沒實質效用', highlight: false, link: 'https://preview--e073379c-012a-4381-8f1a-309b4eb311c6.lovable.app/history/v0.5' },
              { ver: '0.4', date: '2026/2/1', desc: '新增錯題記錄', highlight: false },
              { ver: '0.3', date: '2026/1/20', desc: '新增統計功能', highlight: false },
              { ver: '0.2', date: '2026/1/10', desc: '新增多科目支援', highlight: false },
              { ver: '0.1', date: '2026/1/3', desc: '自然科題庫版，只有三上自然康軒的一科', highlight: false, link: 'https://preview--e073379c-012a-4381-8f1a-309b4eb311c6.lovable.app/history/v0.1' },
            ].map((v, i, arr) => (
              <div key={v.ver} className={`flex items-start gap-3 py-3 ${i < arr.length - 1 ? 'border-b border-border' : ''}`}>
                <div className="shrink-0 w-16 text-center space-y-0.5">
                  <span className={`block text-sm font-black ${v.highlight ? 'text-primary' : 'text-foreground'}`}>v{v.ver}</span>
                  <span className="block text-[9px] text-muted-foreground">{v.date}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm ${v.highlight ? 'font-bold text-foreground' : 'font-medium'}`}>{v.desc}</p>
                  {v.link && (
                    <a
                      href={v.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-1.5 text-[11px] font-bold text-primary hover:underline"
                    >
                      🕹️ 體驗此版本 →
                    </a>
                  )}
                </div>
                {v.highlight && <span className="text-xs bg-accent/12 text-accent font-bold px-2 py-0.5 rounded-full shrink-0">NEW</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground pb-4">
        後續將依課程研究產出更多題庫，持續優化使用體驗 🚀
      </p>
    </div>
  );
}
