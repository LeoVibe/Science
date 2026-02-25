import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Grade, APP_CONFIG, getSubjectsByGrade, Semester, Subject, SUBJECT_THEME_MAP, buildPath, Publisher } from '@/data/config';
import libraryData from '@/data/libraryStats.json';
import type { LibraryConfig } from '@/components/admin/AdminLibraryManager';

const ABOUT_TABS = ['about', 'library', 'features', 'changelog'] as const;
type AboutTab = (typeof ABOUT_TABS)[number];

interface AboutViewProps {
  tab: AboutTab;
  onTabChange: (tab: AboutTab) => void;
  onBack: () => void;
}

export default function AboutView({ tab, onTabChange, onBack }: AboutViewProps) {
  const [libraryConfig, setLibraryConfig] = useState<LibraryConfig | null>(null);
  const publisherStats = (libraryData as { publisherStats?: Record<string, { units: number; questions: number; quality: string }> }).publisherStats ?? {};

  useEffect(() => {
    const configData = localStorage.getItem('EIDOS_LIBRARY_CONFIG');
    if (configData) {
      try { setLibraryConfig(JSON.parse(configData)); } catch (e) { }
    }
  }, []);

  return (
    <div className="max-w-lg mx-auto px-3 sm:px-4 py-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors text-lg">←</button>
      </div>

      {/* Tabs */}
      <div className="flex rounded-2xl bg-secondary p-1 gap-1">
        {([
          { key: 'about' as AboutTab, label: '🏠 創站緣由' },
          { key: 'library' as AboutTab, label: '📚 題庫總覽' },
          { key: 'features' as AboutTab, label: '✨ 功能特色' },
          { key: 'changelog' as AboutTab, label: '📋 更版資訊' },
        ]).map(t => (
          <button
            key={t.key}
            onClick={() => onTabChange(t.key)}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${tab === t.key
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Library / 現有題庫 Tab */}
      {tab === 'library' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-card rounded-2xl border p-5 space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-sm flex items-center gap-1.5">題庫品質與題目總覽</h3>
              <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">最後更新: {libraryData.lastUpdated}</span>
            </div>

            <div className="space-y-6">
              {APP_CONFIG.grades.slice().reverse().map(grade => {
                const subjects = getSubjectsByGrade(grade);
                const gConfig = libraryConfig?.grades[grade as Grade];
                if (libraryConfig && gConfig?.enabled === false) return null;

                const semesterBlocks: JSX.Element[] = [];

                ([1, 2] as Semester[]).forEach(sem => {
                  const sConfig = gConfig?.semesters[sem];
                  if (libraryConfig && sConfig?.enabled === false) return;

                  const rows: { subj: Subject; pubData: Record<string, any> }[] = [];

                  subjects.forEach(subj => {
                    const subConfig = sConfig?.subjects[subj as Subject];
                    if (libraryConfig && subConfig?.enabled === false) return;

                    const pubData: Record<string, any> = {};
                    let hasAnyData = false;
                    APP_CONFIG.publishers.forEach(pub => {
                      if (libraryConfig && subConfig?.publishers && !subConfig.publishers.includes(pub)) return;

                      const stat = publisherStats[`G${grade}_S${sem}_${subj}_${pub}`];
                      if (stat && stat.units > 0) {
                        pubData[pub] = stat;
                        hasAnyData = true;
                      }
                    });
                    if (hasAnyData) {
                      rows.push({ subj: subj as Subject, pubData });
                    }
                  });

                  if (rows.length === 0) return;

                  semesterBlocks.push(
                    <div
                      key={`${grade}-S${sem}`}
                      className="bg-secondary/20 rounded-xl overflow-hidden border border-border/30 shadow-sm"
                    >
                      <h4 className="text-xs font-bold text-foreground bg-secondary/40 px-3 py-2 border-b flex items-center gap-1.5">
                        <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px]">G{grade}</span>
                        {grade}年級
                        <span className="ml-2 text-[10px] text-muted-foreground">
                          {sem === 1 ? '上學期' : '下學期'}
                        </span>
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-[11px] sm:text-xs">
                          <thead>
                            <tr className="bg-secondary/20 text-muted-foreground border-b border-border/40">
                              <th className="px-3 py-2 font-medium w-[80px]">科目</th>
                              {APP_CONFIG.publishers.map(pub => (
                                <th key={pub} className="px-2 py-2 font-medium text-center">{pub}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/20">
                            {rows.map(row => (
                              <tr key={row.subj} className="hover:bg-secondary/30 transition-colors">
                                <td className="px-3 py-2 align-middle whitespace-nowrap">
                                  <span className={`font-bold text-[11px] subject-text-${SUBJECT_THEME_MAP[row.subj]}`}>{row.subj}</span>
                                </td>
                                {APP_CONFIG.publishers.map(pub => {
                                  const stat = row.pubData[pub];
                                  if (!stat) {
                                    return <td key={pub} className="px-2 py-2 text-center text-muted-foreground/30 font-medium align-middle">-</td>;
                                  }

                                  const getQualityColor = (q: string) => {
                                    if (q.includes('L4') || q.includes('L5')) return 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400';
                                    if (q.includes('L3')) return 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400';
                                    if (q.includes('L2')) return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400';
                                    return 'bg-secondary text-muted-foreground';
                                  };

                                  return (
                                    <td key={pub} className="px-2 py-1.5 text-center align-middle">
                                      <Link
                                        to={buildPath(grade as Grade, row.subj, sem as Semester, pub as Publisher, 'review')}
                                        className="inline-flex flex-col items-center justify-center bg-background/60 hover:bg-background/90 hover:shadow-sm rounded-md p-1 min-w-[50px] w-full transition-all border border-transparent hover:border-border/50"
                                      >
                                        <div className="flex items-center gap-1">
                                          <span className="text-[10px] text-foreground font-bold">{stat.questions} 題</span>
                                          <span className={`text-[8px] leading-tight font-bold px-1 py-0.5 rounded-sm ${getQualityColor(stat.quality)}`}>{stat.quality}</span>
                                        </div>
                                        <div className="font-bold text-[9px] text-muted-foreground mt-0.5">
                                          {stat.units} 單元
                                        </div>
                                      </Link>
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                });

                if (semesterBlocks.length === 0) return null;
                return <div key={grade} className="space-y-4">{semesterBlocks}</div>;
              })}
            </div>



            {/* Depth Legend */}
            <div className="mt-4 bg-secondary/30 rounded-2xl p-4 border border-border/30">
              <h4 className="text-[11px] font-bold text-foreground mb-2 flex items-center gap-1.5">
                <span>📈 題庫品質評估標準</span>
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[10px] text-muted-foreground whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-border/40 text-foreground">
                      <th className="py-1 pr-2 font-bold whitespace-nowrap">等級</th>
                      <th className="py-1 px-2 font-bold whitespace-nowrap">核心依據</th>
                      <th className="py-1 px-2 font-bold w-full whitespace-normal">品質層次（執行標準）</th>
                      <th className="py-1 pl-2 font-bold whitespace-nowrap">預期信效度</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    <tr>
                      <td className="py-1.5 pr-2 font-bold text-foreground">L1</td>
                      <td className="py-1.5 px-2">課綱關鍵字</td>
                      <td className="py-1.5 px-2 whitespace-normal break-words">AI 逕行推論： 僅依據標題產出，缺乏具體教材支撐，易生偏誤。</td>
                      <td className="py-1.5 pl-2">極低</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 pr-2 font-bold text-foreground">L2</td>
                      <td className="py-1.5 px-2">實質課文</td>
                      <td className="py-1.5 px-2 whitespace-normal break-words">基礎內容擷取： 具備課文實證，但僅止於低階的記憶性或填空式試題。</td>
                      <td className="py-1.5 pl-2">中低</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 pr-2 font-bold text-foreground">L3</td>
                      <td className="py-1.5 px-2">考古題庫</td>
                      <td className="py-1.5 px-2 whitespace-normal break-words">規範化控管： 經題庫比對驗證，依題目價值調整配重，並嚴格控制選項格式與隨機性。</td>
                      <td className="py-1.5 pl-2">中</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 pr-2 font-bold text-foreground">L4</td>
                      <td className="py-1.5 px-2">中心思想</td>
                      <td className="py-1.5 px-2 whitespace-normal break-words">核心目標對齊： 精修題幹與選項語意，確保符合課程深度，具備極佳誘答力與測驗價值。</td>
                      <td className="py-1.5 pl-2">高</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 pr-2 font-bold text-foreground">L5</td>
                      <td className="py-1.5 px-2">專家認證</td>
                      <td className="py-1.5 px-2 whitespace-normal break-words">權威審定： 經學科專家親自修撰或最終認證，確保教學實務與邏輯之極致嚴密。</td>
                      <td className="py-1.5 pl-2">極高</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* About / 本站定位 Tab */}
      {tab === 'about' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-card rounded-2xl border overflow-hidden">
            <div className="px-5 pt-6 pb-4 bg-primary/8 border-b">
              <h2 className="text-xl font-black text-foreground">eidos 課後複習網</h2>
              <p className="text-sm text-muted-foreground mt-1.5 font-medium">專為小學生設計，回家 15 分鐘、完成今日複習</p>
            </div>
            <div className="px-5 pt-2 pb-5 space-y-4">
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <div className="bg-secondary rounded-2xl p-4 space-y-2">
                  <h3 className="font-bold text-foreground text-sm">📖 發展背景</h3>
                  <p className="text-xs leading-relaxed">
                    本站的起始，只是 2026 過年期間的 vibe coding 練習。原始動機是發現兒子常常考試很粗心，希望能有多一點的練習時間。純粹是設計題目給自己小三的兒子刷題玩，無任何營利想法與目標。
                  </p>
                </div>
                <div className="bg-secondary rounded-2xl p-4 space-y-3">
                  <h3 className="font-bold text-foreground text-sm">🎯 目標與定位</h3>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-foreground">目標：</p>
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        操作更簡單、省心，每天 5 分鐘刷個題。<br />
                        最好的學習，是將底層思考轉化為反射動作。透過 eidos 的複習，讓孩子在刷題中內化課程本質，建立從大腦到指尖的肌肉記憶。
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-foreground">定位：</p>
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        本站初始著重在題庫的簡化操作開始，未來會往深化題目意涵前進，會從小三到小五的課程開始深化研究。<br />
                        目前類似的網站有 <a href="https://www.studyark.org/" target="_blank" rel="noopener noreferrer" className="text-primary font-bold hover:underline">學習方舟</a> 與 <a href="https://www.tcool.cc/" target="_blank" rel="noopener noreferrer" className="text-primary font-bold hover:underline">高中國中國小題庫</a>。
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-secondary rounded-2xl p-4 space-y-2">
                  <h3 className="font-bold text-foreground text-sm">🛠️ 開發歷程</h3>
                  <p className="text-xs leading-relaxed">
                    本站從發想到實作皆由 Antigravity 與 Cursor 協作開發，後續加入 Lovable 與 Gemini 進行科目研究與題目設計。
                  </p>
                </div>

                {/* AI & Legal Summary */}
                <div className="bg-secondary rounded-2xl p-4 space-y-2.5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-foreground">
                      <span>🤖</span>
                      <span>關於本站題庫</span>
                    </div>
                    <p className="text-[10px] leading-relaxed text-muted-foreground ml-5">
                      均由 AI 研究網路上課文後自行出題，僅供使用者參考。
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-foreground">
                      <span>📚</span>
                      <span>資訊來源</span>
                    </div>
                    <p className="text-[10px] leading-relaxed text-muted-foreground ml-5">
                      標明參考自網路公開資料，並尊重原出版社與文章版權。
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-foreground">
                      <span>✨</span>
                      <span>版權說明</span>
                    </div>
                    <p className="text-[10px] leading-relaxed text-muted-foreground ml-5">
                      若題目有侵權疑慮，請聯繫信箱，我們將第一時間配合處理。
                    </p>
                  </div>

                  <div className="pt-1 mt-1 border-t border-border/40">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-foreground">📧 聯絡信箱</span>
                      <span className="text-[11px] text-muted-foreground">yotta0280@gmail.com</span>
                    </div>
                    <p className="text-[9px] text-muted-foreground/60 mt-1">有任何網站使用與題庫建議，歡迎聯繫我們。</p>
                  </div>
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
                { icon: '📚', title: '分科題庫', desc: '瀏覽所有題庫，含答案與解析，適合考前快速複習' },
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
