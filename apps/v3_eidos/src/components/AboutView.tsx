import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Grade, APP_CONFIG, getSubjectsByGrade, Semester, Subject, SUBJECT_THEME_MAP, buildPath, Publisher, PUBLISHER_THEME_COLORS } from '@/data/config';
import libraryData from '@/data/libraryStats.json';
import type { LibraryConfig } from '@/components/admin/AdminLibraryManager';
import { withBase } from '@/utils/basePath';

const ABOUT_TABS = ['about', 'library', 'deepdive', 'changelog'] as const;
export type AboutTab = (typeof ABOUT_TABS)[number];

const DEEPDIVE_STORAGE_KEY_LIKES = 'EIDOS_DEEPDIVE_LIKES';
const DEEPDIVE_STORAGE_KEY_COMMENTS = 'EIDOS_DEEPDIVE_COMMENTS';

function getDeepDiveLikes(): Record<string, number> {
  try {
    const raw = localStorage.getItem(DEEPDIVE_STORAGE_KEY_LIKES);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function setDeepDiveLike(articleId: string, count: number): void {
  const prev = getDeepDiveLikes();
  prev[articleId] = count;
  localStorage.setItem(DEEPDIVE_STORAGE_KEY_LIKES, JSON.stringify(prev));
}

export interface DeepDiveComment {
  id: string;
  articleId: string;
  text: string;
  timestamp: number;
}

function getDeepDiveComments(): DeepDiveComment[] {
  try {
    const raw = localStorage.getItem(DEEPDIVE_STORAGE_KEY_COMMENTS);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function addDeepDiveComment(comment: Omit<DeepDiveComment, 'id' | 'timestamp'>): void {
  const list = getDeepDiveComments();
  list.unshift({
    ...comment,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  });
  if (list.length > 200) list.length = 200;
  localStorage.setItem(DEEPDIVE_STORAGE_KEY_COMMENTS, JSON.stringify(list));
}

function DeepDiveCommentForm({ articleId, onSubmitted }: { articleId: string; onSubmitted: () => void }) {
  const [text, setText] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    addDeepDiveComment({ articleId, text: trimmed });
    setText('');
    onSubmitted();
  };
  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
      <input
        type="text"
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="輸入留言或提問（僅存於本機，未來將串接後端）"
        className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        maxLength={500}
      />
      <button type="submit" className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors shrink-0">
        送出
      </button>
    </form>
  );
}

interface AboutViewProps {
  tab: AboutTab;
  onTabChange: (tab: AboutTab) => void;
  onBack: () => void;
  /** 當前使用者設定的年級 */
  grade: Grade;
  /** 當前使用者設定的學期 */
  semester: Semester;
}

const DEEPDIVE_ARTICLES: { id: string; category: string; title: string; summary: string; content: JSX.Element }[] = [
  {
    id: 'design-paradigm',
    category: '我的初衷',
    title: '為什麼這裡的題目寫起來「不太一樣」？',
    summary: '我不只是在找題目，是在幫孩子重塑題目。我希望每一題都能抓到課文的靈魂，而不只是考記憶。',
    content: (
      <div className="space-y-4">
        <section className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
          <h5 className="font-bold text-primary text-xs mb-2">我的核心理念：懂了，比寫對更重要</h5>
          <p className="text-xs text-muted-foreground leading-relaxed">
            在陪孩子練習時，我發現很多題庫都跟課本脫節。所以我試著讓 AI 先讀過整篇課文，拆解出作者想表達的核心論點和邏輯，再根據這些重點來出題。
          </p>
        </section>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-background border border-border/50">
            <p className="font-bold text-[11px] mb-1">不再盲目亂猜</p>
            <p className="text-[10px] text-muted-foreground leading-snug">錯誤的選項是我故意設計過的，它們代表了孩子最容易卡關的地方。選錯了沒關係，那代表我們發現了可以進步的空間。</p>
          </div>
          <div className="p-3 rounded-xl bg-background border border-border/50">
            <p className="font-bold text-[11px] mb-1">平等的選項設計</p>
            <p className="text-[10px] text-muted-foreground leading-snug">我特別要求題目選項要差不多長，這樣孩子就不會因為「選最長的那個」而猜中，而是真的讀完並思考過。</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'chinese-insight',
    category: '學科心得',
    title: '國語：從故事裡找感覺',
    summary: '拋棄死背注音符號。我希望孩子能在文字的脈絡中感受到語氣，而不僅僅是處理生字。',
    content: (
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground leading-relaxed italic">
          「語文不該是負擔，它是孩子觀察世界的眼睛。」
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          在幫兒子設計國語題時，我儘量避開那些會考倒人的冷門字彙。我更在意：
        </p>
        <ul className="list-disc pl-4 space-y-1 text-[11px] text-muted-foreground">
          <li>能否在新的文章場景裡認出學過的字？</li>
          <li>能不能聽懂角色為什麼要說這句話？</li>
          <li>能不能分辨出作者想傳遞的微小情感？</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'math-insight',
    category: '學科心得',
    title: '數學：讓數字變成生活的小幫手',
    summary: '數學不等於計算。我重新設計題目，讓孩子看見問題背後的模型，而不僅僅是在撥算盤。',
    content: (
      <div className="space-y-3">
        <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-100 dark:border-amber-900/30">
          <h5 className="font-bold text-amber-800 dark:text-amber-400 text-[11px] mb-1">告別機械運算</h5>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            我發現孩子會算 156 ÷ 6，但不懂「平分彩色筆」是什麼場景。所以我把題目改成像是規劃校外教學、或是去超市買東西，讓數學真的有用。
          </p>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          特別是在分數和時間這類難關，我會加入更多情境引導，幫助孩子在大腦裡建立畫面。
        </p>
      </div>
    ),
  },
  {
    id: 'cognitive-load',
    category: '陪練心法',
    title: '剛剛好的難度：4-4-2 的節奏',
    summary: '為什麼孩子寫練習會想逃避？因為太難會畏懼，太簡單會無聊。我用這套配比來維持練習的動力。',
    content: (
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground leading-relaxed">
          我不想讓孩子練習到精疲力竭。所以每份練習中：
        </p>
        <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0 font-black text-primary text-[10px]">4:4:2</div>
          <p className="text-[10px] text-muted-foreground leading-snug">
            40% 複習今天的重點，增加信心；40% 練習常錯的地方，補強盲點；20% 給一點小挑戰，讓孩子發現自己可以做得到！
          </p>
        </div>
      </div>
    ),
  },
];

export default function AboutView({ tab, onTabChange, onBack, grade: userGrade, semester: userSemester }: AboutViewProps) {
  const [libraryConfig, setLibraryConfig] = useState<LibraryConfig | null>(null);
  const [deepDiveLikes, setDeepDiveLikes] = useState<Record<string, number>>(getDeepDiveLikes);
  const [deepDiveComments, setDeepDiveComments] = useState<DeepDiveComment[]>(getDeepDiveComments);
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
          { key: 'deepdive' as AboutTab, label: '📖 出題研究' },
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
              {[userGrade].map(grade => {
                const subjects = getSubjectsByGrade(grade);
                const gConfig = libraryConfig?.grades[grade as Grade];
                if (libraryConfig && gConfig?.enabled === false) return null;

                const semesterBlocks: JSX.Element[] = [];

                ([userSemester] as Semester[]).forEach(sem => {
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
                <span>📈 我對題目的挑剔程度</span>
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[10px] text-muted-foreground whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-border/40 text-foreground">
                      <th className="py-1 pr-2 font-bold whitespace-nowrap">等級</th>
                      <th className="py-1 px-2 font-bold whitespace-nowrap">核心依據</th>
                      <th className="py-1 px-2 font-bold w-full whitespace-normal">品質層次 (我想讓孩子學到的重點)</th>
                      <th className="py-1 pl-2 font-bold whitespace-nowrap">推薦程度</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    <tr>
                      <td className="py-1.5 pr-2 font-bold text-foreground">L1</td>
                      <td className="py-1.5 px-2">課綱關鍵字</td>
                      <td className="py-1.5 px-2 whitespace-normal break-words">簡單掃描： 僅依據標題產出，可能不夠精準。</td>
                      <td className="py-1.5 pl-2">低</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 pr-2 font-bold text-foreground">L2</td>
                      <td className="py-1.5 px-2">實質課文</td>
                      <td className="py-1.5 px-2 whitespace-normal break-words">基礎練習： 具備課文內容，適合快速複習基礎記憶。</td>
                      <td className="py-1.5 pl-2">中</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 pr-2 font-bold text-foreground">L4</td>
                      <td className="py-1.5 px-2">中心思想</td>
                      <td className="py-1.5 px-2 whitespace-normal break-words">深度思考： 精修過題幹與選項，確保題目能引發孩子思考。</td>
                      <td className="py-1.5 pl-2">極高</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 pr-2 font-bold text-foreground">L5</td>
                      <td className="py-1.5 px-2">專家認證</td>
                      <td className="py-1.5 px-2 whitespace-normal break-words">最終把關： 經過多層次邏輯檢查，確保教學與思考的嚴密。</td>
                      <td className="py-1.5 pl-2">滿分</td>
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
              <h2 className="text-xl font-black text-foreground">陪孩子一起複習</h2>
              <p className="text-sm text-muted-foreground mt-1.5 font-medium">回家 15 分鐘，把今天學過的重點帶走</p>
            </div>
            <div className="px-5 pt-2 pb-5 space-y-4">
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <div className="bg-secondary rounded-2xl p-4 space-y-2">
                  <h3 className="font-bold text-foreground text-sm">為什麼做這個網站</h3>
                  <p className="text-xs leading-relaxed">
                    2026 年的過年，我發現正讀小三的兒子在練習題目時，常常因為題目太無聊或太死板而分心。身為一個爸爸，我希望能在枯燥的練習中，加入一點點邏輯和故事感。我不追求寫得多，我只希望他寫的每一題，都能讓他稍微停下來思考一下。
                  </p>
                </div>
                <div className="bg-secondary rounded-2xl p-4 space-y-3">
                  <h3 className="font-bold text-foreground text-sm">本站的目標</h3>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        讓小朋友更容易複習功課，每天 15 分鐘刷個題。<br />
                        我希望透過這裡的複習，讓孩子真的內化課程本質，而不是機械式的答題。
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-secondary rounded-2xl p-4 space-y-2">
                  <h3 className="font-bold text-foreground text-sm">🛠️ 本站怎麼做出來的？</h3>
                  <p className="text-xs leading-relaxed">
                    我利用晚上陪伴孩子的空檔，和幾個厲害的 AI 小助手一起研發、出題。這對我來說是一個不斷進步的育兒實驗。
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


      {/* 出題研究 Tab */}
      {tab === 'deepdive' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-card rounded-2xl border p-5 space-y-6">
            <div className="space-y-1.5">
              <h3 className="font-black text-base flex items-center gap-2">📖 研究中心</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                這裡記錄了我在出題時的堅持：從對大腦的理解到各科目的陪練心得。我希望確保孩子遇到的每一道題，都有它存在的價值。
              </p>
            </div>

            <div className="space-y-5">
              {DEEPDIVE_ARTICLES.map(art => {
                const likes = deepDiveLikes[art.id] ?? 0;
                const articleComments = deepDiveComments.filter(c => c.articleId === art.id);
                return (
                  <article key={art.id} className="group bg-secondary/30 rounded-2xl border border-border/30 hover:border-primary/30 transition-all overflow-hidden">
                    {/* Header: Category & Title */}
                    <div className="p-4 pb-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-[9px] tracking-wider leading-none">
                          {art.category}
                        </span>
                      </div>
                      <h4 className="font-black text-foreground text-base tracking-tight">{art.title}</h4>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {art.summary}
                      </p>
                    </div>

                    {/* Content Section (Always expanded for now as per design) */}
                    <div className="px-4 pb-4">
                      <div className="pt-4 border-t border-border/40 prose prose-sm max-w-none dark:prose-invert">
                        {art.content}
                      </div>
                    </div>

                    {/* Footer: Interaction */}
                    <div className="px-4 py-3 bg-secondary/40 border-t border-border/20 flex flex-wrap items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          const next = likes + 1;
                          setDeepDiveLike(art.id, next);
                          setDeepDiveLikes(prev => ({ ...prev, [art.id]: next }));
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-background border border-border/60 text-primary font-bold text-[10px] hover:bg-primary/5 hover:border-primary/30 transition-all"
                      >
                        👍 認同這份用心 {likes > 0 && `(${likes})`}
                      </button>
                      <span className="text-[10px] text-muted-foreground/60 italic">
                        {articleComments.length} 則留言回饋
                      </span>
                    </div>

                    {/* Comments Area */}
                    <div className="p-4 pt-2 space-y-3 bg-secondary/20">
                      <p className="text-[10px] font-bold text-muted-foreground/80 flex items-center gap-1">
                        💬 家長與老師的話
                      </p>
                      <DeepDiveCommentForm
                        articleId={art.id}
                        onSubmitted={() => setDeepDiveComments(getDeepDiveComments())}
                      />
                      {articleComments.length > 0 && (
                        <ul className="space-y-1.5 mt-2">
                          {articleComments.slice(0, 3).map(c => (
                            <li key={c.id} className="text-[10px] text-muted-foreground bg-background/40 rounded-lg px-3 py-2 border border-border/20">
                              {c.text}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>

            <p className="text-[10px] text-muted-foreground/60 text-center py-4">
              學術研究與命題方法持續更新中... 🚀
            </p>
          </div>
        </div>
      )}

      {/* Changelog / 更版資訊 Tab */}
      {tab === 'changelog' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-card rounded-2xl border p-5 space-y-0">
            {[
              {
                ver: '1.2',
                date: '2026/3/1',
                desc: '讓 AI 扮演各科專家，對題目進行深度研究與翻新，每課都有 30 題以上。也針對中年級的程度與耐性調整了題型比例，讓練習節奏能與智力成長接軌。',
                highlight: true,
              },
              {
                ver: '1.1',
                date: '2026/2/27',
                desc: '為了留住的專注力，優化了介面佈局，讓操作更直覺順手。同時也改進了選題功能、將錯題補強、新題挑戰、與熟題複習、作整體進行比例配置，確保每次能啟發新鮮的思考挑戰。',
                highlight: false,
              },
              {
                ver: '1.0',
                date: '2026/2/21',
                desc: '正式版上線：登入機制、錯題統計、題目審核機制、續答機制、連結防呆全面完成。',
                highlight: false,
              },
              {
                ver: '0.9',
                date: '2026/2/19',
                desc: '設定與管理升級：入站設定年級、各科目設定出版社，題庫管理與維護設定整合。',
                highlight: false,
              },
              {
                ver: '0.8',
                date: '2026/2/18',
                desc: '規劃題庫評分機制，嚴格處理真實課文、設計意涵與文字細膩度、與選項合理性。',
                highlight: false,
              },
              {
                ver: '0.7',
                date: '2026/2/17',
                desc: '產出新版介面設計：主選單、導覽分頁與學習流程互動體驗更新。',
                highlight: false,
              },
              {
                ver: '0.6',
                date: '2026/2/15',
                desc: '擴大題庫廣度與研究深度，擴充為三個出版社，設定出題深度與流程，AI不會自由發揮的出題。',
                highlight: false,
              },
              {
                ver: '0.5',
                date: '2026/2/14',
                desc: '多科目嘗試版（現為相容模式入口）',
                highlight: false,
              },
              {
                ver: '0.1',
                date: '2026/1/3',
                desc: '初始版本，基本架構（現為相容模式入口）',
                highlight: false,
              },
            ].map((v: { ver: string; date: string; desc: string; highlight: boolean; link?: string; legacy?: boolean }, i, arr) => (
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
                      {v.legacy ? '🕹️ 觀看歷史版本 →' : '🕹️ 體驗此版本 →'}
                    </a>
                  )}
                </div>
                {v.highlight && <span className="text-xs bg-accent/12 text-accent font-bold px-2 py-0.5 rounded-full shrink-0">NEW</span>}
              </div>
            ))}
          </div>
          <div className="bg-secondary/40 rounded-2xl border border-dashed border-border p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-foreground font-bold">
              <span className="text-lg">🏛️</span>
              <span>典藏館：體驗舊版系統</span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={withBase('history/v1_science/index.html')}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-background border rounded-xl text-[11px] font-bold text-primary hover:bg-primary/5 hover:border-primary/30 transition-all shadow-sm"
              >
                v0.1 初版(自然科)
              </a>
              <a
                href={withBase('history/v2_currisite/index.html')}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-background border rounded-xl text-[11px] font-bold text-primary hover:bg-primary/5 hover:border-primary/30 transition-all shadow-sm"
              >
                v0.2 多科目版
              </a>
            </div>
          </div>
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground pb-4">
        後續將依課程研究產出更多題庫，持續優化使用體驗 🚀
      </p>
    </div>
  );
}
