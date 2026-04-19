import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Grade, APP_CONFIG, getSubjectsByGrade, Semester, Subject, SUBJECT_THEME_MAP, buildPath, Publisher, PUBLISHER_THEME_COLORS } from '@/data/config';
import libraryData from '@/data/libraryStats.json';
import type { LibraryConfig } from '@/components/admin/AdminLibraryManager';
import { withBase } from '@/utils/basePath';
import { generateUUID } from '@/utils/uuid';


import { toast } from 'sonner';
import { getApiBaseUrl } from '@/data/api';
import { getOrCreateUserId } from '@/utils/storage';

const ABOUT_TABS = ['about', 'library', 'deepdive', 'changelog'] as const;
export type AboutTab = (typeof ABOUT_TABS)[number];

function SiteFeedbackForm() {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': getOrCreateUserId(),
        },
        body: JSON.stringify({
          questionId: 'SITE_FEEDBACK',
          tag: 'general',
          comment: trimmed,
          userId: getOrCreateUserId(),
        }),
      });

      if (!response.ok) throw new Error('Failed to submit');
      
      toast.success('感謝您的留言！我們會認真閱讀並持續優化：）');
      setText('');
    } catch (e) {
      toast.error('發送失敗，請稍後再試。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-2">
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="請輸入您的建議..."
        maxLength={1000}
        rows={3}
        className="w-full px-3 py-2.5 rounded-xl border border-border/60 bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none transition-shadow"
      />
      <div className="flex justify-end">
        <button 
          type="submit" 
          disabled={isSubmitting || !text.trim()}
          className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '傳送中...' : '送出留言'}
        </button>
      </div>
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

export default function AboutView({ tab, onTabChange, onBack, grade: userGrade, semester: userSemester }: AboutViewProps) {
  const [libraryConfig, setLibraryConfig] = useState<LibraryConfig | null>(null);
  const publisherStats = (libraryData as {
    publisherStats?: Record<string, {
      units: number;
      questions: number;
      bankQuestions?: number;
      publishedQuestions?: number;
      quality: string;
      cqi?: number | string;
    }>;
  }).publisherStats ?? {};

  useEffect(() => {
    const configData = localStorage.getItem('EIDOS_LIBRARY_CONFIG');
    if (configData) {
      try { setLibraryConfig(JSON.parse(configData)); } catch (e) { }
    }
  }, []);

  const [filterGrade, setFilterGrade] = useState<Grade | 'all'>(userGrade);
  const [filterSem, setFilterSem] = useState<Semester | 'all'>(userSemester);

  const gradeStyle: Record<number, { badge: string; header: string; border: string }> = {
    3: { badge: 'bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-400', header: 'bg-pink-50/80 dark:bg-pink-900/15', border: 'border-pink-200/60 dark:border-pink-500/20' },
    4: { badge: 'bg-lime-100 text-lime-800 dark:bg-lime-500/20 dark:text-lime-400', header: 'bg-lime-50/80 dark:bg-lime-900/15', border: 'border-lime-200/60 dark:border-lime-500/20' },
    5: { badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400', header: 'bg-indigo-50/80 dark:bg-indigo-900/15', border: 'border-indigo-200/60 dark:border-indigo-500/20' },
    6: { badge: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400', header: 'bg-amber-50/80 dark:bg-amber-900/15', border: 'border-amber-200/60 dark:border-amber-500/20' },
  };

  return (
    <div className="max-w-lg mx-auto px-3 sm:px-4 py-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors text-lg">←</button>
      </div>

      {/* Tabs */}
      <div className="flex rounded-2xl bg-secondary p-1 gap-1">
        {([
          { key: 'about' as AboutTab, label: '🏠 關於本站' },
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

            {/* Grade + Semester filter */}
            <div className="flex flex-wrap items-center gap-2 pb-1 border-b border-border/20">
              <div className="flex gap-1">
                {([3, 4, 5, 6] as Grade[]).map(g => {
                  const gs = gradeStyle[g];
                  const isActive = filterGrade === g;
                  return (
                    <button
                      key={g}
                      onClick={() => setFilterGrade(isActive ? 'all' : g)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-all ${
                        isActive ? gs.badge : 'bg-secondary/60 text-muted-foreground hover:bg-secondary'
                      }`}
                    >
                      {g}年
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-1 ml-auto">
                {([1, 2] as Semester[]).map(s => (
                  <button
                    key={s}
                    onClick={() => setFilterSem(filterSem === s ? 'all' : s)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-all ${
                      filterSem === s ? 'bg-foreground/10 text-foreground' : 'bg-secondary/60 text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    {s === 1 ? '上學期' : '下學期'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              {APP_CONFIG.grades.filter(g => filterGrade === 'all' || g === filterGrade).map(grade => {
                const subjects = getSubjectsByGrade(grade);
                const gConfig = libraryConfig?.grades[grade as Grade];
                if (libraryConfig && gConfig?.enabled === false) return null;

                const semesterBlocks: JSX.Element[] = [];

                APP_CONFIG.semesters.filter(s => filterSem === 'all' || s === filterSem).forEach(sem => {
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
                      const shelf = stat?.publishedQuestions ?? stat?.questions ?? 0;
                      const bank = stat?.bankQuestions ?? shelf;
                      if (stat && (stat.units > 0 || bank > 0 || shelf > 0)) {
                        pubData[pub] = stat;
                        hasAnyData = true;
                      }
                    });
                    if (hasAnyData) {
                      rows.push({ subj: subj as Subject, pubData });
                    }
                  });

                  if (rows.length === 0) return;

                  const gs = gradeStyle[grade as number] ?? { badge: 'bg-primary/10 text-primary', header: 'bg-secondary/40', border: 'border-border/30' };

                  semesterBlocks.push(
                    <div
                      key={`${grade}-S${sem}`}
                      className={`rounded-xl overflow-hidden border shadow-sm ${gs.border}`}
                    >
                      <h4 className={`text-xs font-bold text-foreground px-3 py-2 border-b border-inherit flex items-center gap-1.5 ${gs.header}`}>
                        {grade}年級
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${gs.badge}`}>
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

                                  const getQualityColor = (q: string | undefined) => {
                                    if (!q) return 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500';
                                    if (q.includes('QL5')) return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400';
                                    if (q.includes('QL4')) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400';
                                    if (q.includes('QL3')) return 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400';
                                    if (q.includes('QL2')) return 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-400';
                                    return 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500';
                                  };

                                  const shelfCount = stat.publishedQuestions ?? stat.questions ?? 0;
                                  const bankCount = stat.bankQuestions ?? shelfCount;
                                  const showBankHint = typeof stat.bankQuestions === 'number' && bankCount > shelfCount;

                                  return (
                                    <td key={pub} className="px-2 py-1.5 text-center align-middle">
                                      <Link
                                        to={buildPath(grade as Grade, row.subj, sem as Semester, pub as Publisher, 'review')}
                                        className="inline-flex flex-col items-center justify-center bg-background/60 hover:bg-background/90 hover:shadow-sm rounded-md p-1 min-w-[50px] w-full transition-all border border-transparent hover:border-border/50"
                                      >
                                        <div className="flex items-center gap-1 flex-wrap justify-center">
                                          <span className="text-[10px] text-foreground font-bold">{shelfCount} 題</span>
                                          <span className="text-[8px] text-muted-foreground font-medium">上架</span>
                                          <span className={`text-[8px] leading-tight font-bold px-1 py-0.5 rounded-sm ${getQualityColor(stat.quality)}`}>{stat.quality}</span>
                                        </div>
                                        {showBankHint && (
                                          <div className="text-[8px] text-muted-foreground/80 mt-0.5">
                                            題庫 {bankCount} 題
                                          </div>
                                        )}
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
            <div className="mt-4 bg-secondary/30 rounded-2xl p-4 border border-border/30 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-sm text-foreground">如何定義題庫品質</span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-[10px] dark:bg-emerald-500/20 dark:text-emerald-400">QL4</span>
                  <span>代表 該題庫有 90% 的題目達到</span>
                  <span className="bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-[10px] dark:bg-emerald-500/20 dark:text-emerald-400">QL4</span>
                  <span>以上的標準</span>
                </span>
              </div>
                <table className="w-full text-[10px] mt-2 border-collapse">
                  <tbody>
                    {([
                      { level: 'QL1', badge: 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400', label: '課綱基礎', desc: '僅依課綱與關鍵字產出，學習目標不夠精準。' },
                      { level: 'QL2', badge: 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-400', label: '課文歸納', desc: '該課已完成 KL4 單課研究（有課文）；題目能具體歸納課程內容與精髓。' },
                      { level: 'QL3', badge: 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400', label: '考古參考', desc: '該課額外完成 KL4 考古題與討論；誘答設計有實證基礎。' },
                      { level: 'QL4', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400', label: '深思與盲測', desc: '用不同 Agent 進行盲測且通過；題幹與選項經實測精修。' },
                      { level: 'QL5', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400', label: '專家認證', desc: '經多層次邏輯檢查、教師審閱與使用者回饋驗證。（未來期待）' },
                    ] as { level: string; badge: string; label: string; desc: string }[]).map(({ level, badge, label, desc }) => (
                      <tr key={level} className="border-b border-border/20 last:border-0">
                        <td className="py-2 pr-3 align-top w-10 whitespace-nowrap">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${badge}`}>{level}</span>
                        </td>
                        <td className="py-2 text-muted-foreground leading-relaxed break-words">
                          <span className="font-semibold text-foreground/80 mr-1.5">{label}</span>{desc}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                  <p className="text-xs leading-relaxed">
                    傳統題庫往往讓孩子陷入機械式刷題，缺乏真正的思考空間。這個網站用 AI 重新設計每一道題，讓每天 15 分鐘的複習，都能幫孩子真正內化課程，而不只是對答案。
                  </p>
                </div>

                <div className="bg-secondary rounded-2xl p-4 space-y-2">
                  <h3 className="font-bold text-foreground text-sm">🛠️ 本站怎麼做出來的？</h3>
                  <p className="text-xs leading-relaxed">
                    利用晚上陪伴孩子的空檔，和幾個厲害的 AI 小助手 (cursor、antigravity、lovable、Gemini) 一起研發、出題。這對我來說是這是個一個不斷進步的育兒實驗。
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

            {/* 🆕 每道題目背後的四層嚴謹工法 */}
            <div className="bg-secondary/20 rounded-2xl border-2 border-primary/10 p-5 space-y-5">
              <div className="space-y-1.5">
                <h4 className="font-black text-foreground text-[15px] flex items-center gap-2 text-primary">
                  <span>📐</span> 本站題目有什麼不同？
                </h4>
                <p className="text-[12px] text-muted-foreground leading-relaxed">
                  讓孩子寫題庫，不是為了機械化的反覆刷題。我們的每一道題目產出，都需要經過四層嚴謹的「AI 專家思考」，確保題目真的能幫助孩子成長。以下是我們對學習的堅持：
                </p>
              </div>

              <div className="space-y-3.5">
                {/* 🧠 第一層 */}
                <div className="rounded-xl border border-border/50 p-4 space-y-2.5 bg-background shadow-sm hover:border-violet-300 transition-colors">
                  <div className="flex items-start gap-3">
                    <span className="w-9 h-9 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center text-[17px] shrink-0 border border-violet-200 dark:border-violet-800">🧠</span>
                    <div className="space-y-1">
                      <p className="font-black text-sm text-foreground">第一層：讀懂孩子的大腦</p>
                      <p className="text-[11px] font-bold text-violet-600 dark:text-violet-400">了解認知極限，保護學習胃口</p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        一到六年級的孩子，大腦能處理的資訊量完全不同。低年級需要記憶與直觀的圖片輔助，不能有太多打擊信心的陷阱；中年級開始發展「推理能力」，我們會慢慢加入轉彎的思考題；到了高年級，則全面啟動「批判性思考」。在出題前，我們先確保難度剛剛好：既有挑戰，又不會弄壞孩子的學習胃口。
                      </p>
                    </div>
                  </div>
                </div>

                {/* 🗺️ 第二層 */}
                <div className="rounded-xl border border-border/50 p-4 space-y-2.5 bg-background shadow-sm hover:border-blue-300 transition-colors">
                  <div className="flex items-start gap-3">
                    <span className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-[17px] shrink-0 border border-blue-200 dark:border-blue-800">🗺️</span>
                    <div className="space-y-1">
                      <p className="font-black text-sm text-foreground">第二層：為每個科目量身打造學習路徑</p>
                      <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400">這科到底該怎麼學？怎麼考？</p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        國語的本質不是死背注音，而是要「聽懂弦外之音」；數學最怕「看到數字就亂加減」，所以我們把重點放在「讀懂題意」；自然科則要呵護「親手實驗的好奇心」。我們為每一科明確規範了 AI 專家該怎麼引導，避開生硬的填鴨，讓每一題都能鍛鍊到該有的核心素養。
                      </p>
                    </div>
                  </div>
                </div>

                {/* 📚 第三層 */}
                <div className="rounded-xl border border-border/50 p-4 space-y-2.5 bg-background shadow-sm hover:border-emerald-300 transition-colors">
                  <div className="flex items-start gap-3">
                    <span className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-[17px] shrink-0 border border-emerald-200 dark:border-emerald-800">📚</span>
                    <div className="space-y-1">
                      <p className="font-black text-sm text-foreground">第三層：探索這學期孩子的痛點與需求</p>
                      <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">最貼心的學習指引 ──「AI 專家學習引導」</p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        不同年級和學期都有獨特的「大魔王」。例如：三年級開始從「聽故事」轉為「自己讀完一篇文章」；四年級的國語突然變長，數學開始有多步驟的邏輯；五年級則會碰上小數的強烈交鋒。我們為每個學期量身寫了一份專屬的學習引導，這就是您在每一科頁面上方看到的「💡 AI 專家說」。不僅陪伴孩子，也能幫助家長理解孩子目前卡在哪裡、該如何介入指導。
                      </p>
                    </div>
                  </div>
                </div>

                {/* 🔧 第四層 */}
                <div className="rounded-xl border border-border/50 p-4 space-y-2.5 bg-background shadow-sm hover:border-amber-300 transition-colors">
                  <div className="flex items-start gap-3">
                    <span className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-[17px] shrink-0 border border-amber-200 dark:border-amber-800">🔧</span>
                    <div className="space-y-1">
                      <p className="font-black text-sm text-foreground">第四層：深入每一課與每一版本的細膩度</p>
                      <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400">精雕細琢，對齊學校進度</p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        有了大方向之後，最後一步就是「落地」。康軒版第三課在教哪些修辭？翰林版的測驗卷最喜歡考哪個生字的錯別字？南一版的課文小朋友最常誤解這句話的意思？我們逐課、逐版本地進行「微觀拆解」，分析歷年考古題與常見的學習迷思，並將這些細節轉化為「溫暖的提示詳解」，確保孩子在寫每一道題時，都像有一位專屬家教在旁細心解說。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 🆕 給我回饋留言區塊 */}
            <div className="bg-secondary/20 rounded-2xl border border-border/50 p-5 mt-6 space-y-3">
              <h4 className="font-black text-foreground text-[14px] flex items-center gap-2">
                <span>💬</span> 有什麼想告訴我們的嗎？
              </h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                不論是對題目的建議、希望追加的新功能，或是給開發者的鼓勵，都歡迎在這邊留言喔！（您的留言信將會被妥善收藏在管理後台）
              </p>
              <SiteFeedbackForm />
            </div>

          </div>
        </div>
      )}

      {/* Changelog / 更版資訊 Tab */}
      {tab === 'changelog' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-card rounded-2xl border p-5 space-y-0">
            {[
              {
                ver: '1.4',
                date: '2026/4/18',
                items: [
                  '小三下 國語、自然、社會題庫更新，用 500 題以上考古題，重新校正題幹與選項之適配度，確認題意與學習意涵',
                  '新增小四下 自然、社會題庫，重塑前期學習路徑定義，完成 900 題以上全新題庫，並完成雙盲測試',
                  '題庫品質說明更直白、題目總覽介面更簡潔，新增年級與學期過濾器',
                ],
                highlight: true,
              },
              {
                ver: '1.3',
                date: '2026/3/20',
                items: [
                  '將題目產出架構化繁為簡，利用 AI 的迭代能力強化出題深度與意涵',
                  '新增「AI 專家學習引導」，讓每位使用者都能清楚題目意涵與設計邏輯',
                  '每一題都有溫暖提示說明，孩子做題、家長一同陪伴理解',
                ],
                highlight: false,
              },
              {
                ver: '1.2',
                date: '2026/3/1',
                items: [
                  '讓 AI 扮演各科專家，對題目進行深度研究與翻新，每課 30 題以上',
                  '針對中年級的程度與耐性調整題型比例，讓練習節奏與智力成長接軌',
                ],
                highlight: false,
              },
              {
                ver: '1.1',
                date: '2026/2/27',
                items: [
                  '優化介面佈局，讓操作更直覺順手',
                  '改進選題功能：錯題補強、新題挑戰、熟題複習三種模式比例配置',
                ],
                highlight: false,
              },
              {
                ver: '1.0',
                date: '2026/2/21',
                items: [
                  '正式版上線：登入機制、錯題統計、題目審核機制、續答機制、連結防呆全面完成',
                ],
                highlight: false,
              },
              {
                ver: '0.9',
                date: '2026/2/19',
                items: [
                  '設定與管理升級：入站設定年級、各科目設定出版社，題庫管理與維護設定整合',
                ],
                highlight: false,
              },
              {
                ver: '0.8',
                date: '2026/2/18',
                items: [
                  '規劃題庫評分機制，嚴格處理真實課文、設計意涵與文字細膩度、與選項合理性',
                ],
                highlight: false,
              },
              {
                ver: '0.7',
                date: '2026/2/17',
                items: [
                  '產出新版介面設計：主選單、導覽分頁與學習流程互動體驗更新',
                ],
                highlight: false,
              },
              {
                ver: '0.6',
                date: '2026/2/15',
                items: [
                  '擴大題庫廣度與研究深度，擴充為三個出版社',
                  '設定出題深度與流程，AI 不自由發揮出題',
                ],
                highlight: false,
              },
              {
                ver: '0.5',
                date: '2026/2/14',
                items: ['多科目擴充版'],
                note: '仍可測試使用，但停止維護',
                highlight: false,
                link: withBase('history/v2_currisite/index.html'),
                linkLabel: '🏛️ 體驗舊版系統：v2 舊版(多科) →',
              },
              {
                ver: '0.1',
                date: '2026/1/3',
                items: ['初始版本，基本架構'],
                note: '仍可測試使用，但停止維護',
                highlight: false,
                link: withBase('history/v1_science/index.html'),
                linkLabel: '🏛️ 體驗舊版系統：v1 初版(自然) →',
              },
            ].map((v: { ver: string; date: string; items: string[]; note?: string; highlight: boolean; link?: string; legacy?: boolean; linkLabel?: string }, i, arr) => (
              <div key={v.ver} className={`flex items-start gap-3 py-3 ${i < arr.length - 1 ? 'border-b border-border' : ''}`}>
                <div className="shrink-0 w-16 text-center space-y-0.5">
                  {v.highlight && (
                    <span className="block text-[8px] font-black bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full mb-1">NEW</span>
                  )}
                  <span className={`block text-sm font-black ${v.highlight ? 'text-primary' : 'text-foreground'}`}>v{v.ver}</span>
                  <span className="block text-[9px] text-muted-foreground">{v.date}</span>
                </div>
                <div className="min-w-0 flex-1">
                  {v.items.length === 1 ? (
                    <p className="text-sm font-medium text-muted-foreground flex flex-wrap items-center gap-1.5">
                      <span>{v.items[0]}</span>
                      {v.note && (
                        <span className="text-[9px] font-semibold bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded-full border border-red-200/60 dark:border-red-700/40">
                          {v.note}
                        </span>
                      )}
                    </p>
                  ) : (
                    <ol className="space-y-1">
                      {v.items.map((item, idx) => (
                        <li key={idx} className="text-sm flex gap-1.5 font-medium text-muted-foreground">
                          <span className="shrink-0 text-[10px] font-black mt-0.5 text-muted-foreground/50">{idx + 1}.</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                  {v.items.length > 1 && v.note && (
                    <span className="inline-flex mt-1.5 text-[9px] font-medium bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded-full border border-red-200/60 dark:border-red-700/40">
                      {v.note}
                    </span>
                  )}
                  {v.link && (
                    <a
                      href={v.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-1.5 text-[11px] font-bold text-primary hover:underline"
                    >
                      {v.linkLabel || (v.legacy ? '🕹️ 觀看歷史版本 →' : '🕹️ 體驗此版本 →')}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
