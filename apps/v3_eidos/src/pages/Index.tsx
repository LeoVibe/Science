import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Grade, Semester, Publisher, Subject, Question, SUBJECT_ICONS, SEMESTER_NAMES, SUBJECT_THEME_MAP,
  getSubjectsByGrade, buildPath, parseGradeParam, parseSemesterParam,
  URL_CODE_SUBJECT, URL_CODE_PUBLISHER,
} from '@/data/config';
import { loadQuestions, LoadedQuestions } from '@/data/questionLoader';
import {
  loadUserPreference, saveUserPreference, saveAnswerRecord,
  savePracticeRecord, clearQuizProgress, getWrongQuestions as getWrongRecords, getAnswerHistory,
  loadUserProfile, saveUserProfile, getPublisherForSubject, getAutoAdvanceDelayMs,
  getOrCreateUserId, fetchAndMergeUserProfile, syncUserProfileToApi, isShortcutEnabled, loadQuizProgress, saveQuizProgress,
} from '@/utils/storage';
import { logActivity } from '@/utils/activityLogger';
import type { SiteSettings } from '@/data/api';
import { fetchSiteSettings } from '@/data/api';
import type { UserProfile } from '@/utils/storage';
import AppHeader from '@/components/AppHeader';
import MainMenu from '@/components/MainMenu';
import QuizView from '@/components/QuizView';
import ResultView from '@/components/ResultView';
import ReviewView from '@/components/ReviewView';
import WrongQuestionsView from '@/components/WrongQuestionsView';
import LearningReportView from '@/components/LearningReportView';
import ProfileSetup from '@/components/ProfileSetup';
import AboutView from '@/components/AboutView';
import type { UserProfile as ProfileData } from '@/components/ProfileSetup';
import { toast } from 'sonner';

type View = 'menu' | 'quiz' | 'result' | 'review' | 'wrong-questions' | 'learning-report' | 'settings' | 'about';

const VIEW_URL_MAP: Record<string, View> = {
  'quiz': 'quiz',
  'result': 'result',
  'review': 'review',
  'wrong': 'wrong-questions',
  'stats': 'learning-report',
  'about': 'about',
};

const VIEW_TO_URL: Partial<Record<View, string>> = {
  'quiz': 'quiz',
  'result': 'result',
  'review': 'review',
  'wrong-questions': 'wrong',
  'learning-report': 'stats',
  'about': 'about',
};

/** 合法題庫路徑格式，用於判斷是否為使用者點 Link 後的 URL，避免用舊 state 覆寫 */
const VALID_APP_PATH = /^\/g\d\/[^/]+\/s\d\/[^/]+\/[^/]+(\/[^/]+)?$/;

type LibraryConfig = {
  grades?: Partial<Record<Grade, {
    enabled?: boolean;
    semesters?: Partial<Record<Semester, {
      enabled?: boolean;
      subjects?: Partial<Record<Subject, {
        enabled?: boolean;
        publishers?: Publisher[];
      }>>;
    }>>;
  }>>;
};

function isLibraryEnabled(
  config: LibraryConfig | null,
  grade: Grade,
  subject: Subject,
  semester: Semester,
  publisher: Publisher
): boolean {
  if (!config?.grades) return true;
  const g = config.grades[grade];
  if (!g || g.enabled === false) return false;
  const s = g.semesters?.[semester];
  if (!s || s.enabled === false) return false;
  const sub = s.subjects?.[subject];
  if (!sub || sub.enabled === false) return false;
  const publishers = sub.publishers ?? [];
  return publishers.includes(publisher);
}

const Index = () => {
  const params = useParams();
  const navigate = useNavigate();

  // Profile / first-time setup
  const [showSetup, setShowSetup] = useState(false);
  const [profileReady, setProfileReady] = useState(false);

  // Config state
  const [grade, setGrade] = useState<Grade>(3);
  const [semester, setSemester] = useState<Semester>(1);
  const [publisher, setPublisher] = useState<Publisher>('南一');
  const [subject, setSubject] = useState<Subject>('國語');

  // App state
  const [view, setView] = useState<View>('menu');
  const [loaded, setLoaded] = useState<LoadedQuestions>({ status: 'success', questions: [], getAllCategories: () => [], getQuestionsByCategory: () => [] });
  const [loading, setLoading] = useState(false);
  const loadPromiseRef = useRef<Promise<LoadedQuestions> | null>(null);
  const fullLoadPromiseRef = useRef<Promise<LoadedQuestions> | null>(null);
  /** 目前 loaded 對應的組合，點題庫總覽連結切到不同科/社時必須重新載入 */
  const loadedForRef = useRef<string>('');

  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [quizType, setQuizType] = useState('');
  const [quizStartTime, setQuizStartTime] = useState(0);

  // Result state
  const [resultScore, setResultScore] = useState(0);
  const [resultTotal, setResultTotal] = useState(0);
  const [sessionWrongQuestions, setSessionWrongQuestions] = useState<Question[]>([]);

  // 全站設定（API）：維護模式、公告
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [libraryConfig, setLibraryConfig] = useState<LibraryConfig | null>(null);
  const isDeepLinkedRef = useRef(false);

  const [quizInitialIndex, setQuizInitialIndex] = useState(0);
  const [quizInitialScore, setQuizInitialScore] = useState(0);
  const [quizInitialAnswered, setQuizInitialAnswered] = useState<{ question: Question; isCorrect: boolean; selected: number }[]>([]);
  const [quizInitialStartTime, setQuizInitialStartTime] = useState<number>(Date.now());

  // URL → State sync (on mount and whenever URL params change, e.g. 切換出版社)
  const { grade: gp, subject: sp, semester: semp, publisher: pp, view: vp } = params;
  useEffect(() => {
    if (gp && sp && semp && pp) {
      isDeepLinkedRef.current = true;
      const g = parseGradeParam(gp);
      const sub = URL_CODE_SUBJECT[sp];
      const sem = parseSemesterParam(semp);
      const pub = URL_CODE_PUBLISHER[pp];
      if (g && sub && sem && pub) {
        setGrade(g);
        setSubject(sub);
        setSemester(sem);
        setPublisher(pub);
        const v = vp ? VIEW_URL_MAP[vp] : 'menu';
        // 依 URL 同步 view；直接開啟 /quiz 等連結時若無題目，QuizView 會顯示空狀態
        setView(v || 'menu');
        setProfileReady(true);
        return;
      }
    }
    isDeepLinkedRef.current = false;
    // 無 URL 參數時：依 profile 或舊版 preference 還原；僅在「從未完成設定」時自動跳出設定頁
    const profile = loadUserProfile();
    if (profile?.setupComplete) {
      setGrade(profile.grade);
      setSemester(profile.semester);
      const pubKey = `國語_S${profile.semester ?? 1}`;
      const pub = (profile.publisherBySubject as Record<string, Publisher>)?.[pubKey] ?? '南一';
      setPublisher(pub);
      setProfileReady(true);
      return;
    }
    const pref = loadUserPreference();
    if (pref) {
      setGrade(pref.grade);
      setSemester(pref.semester);
      setPublisher(pref.publisher);
      const subjects = getSubjectsByGrade(pref.grade);
      if (subjects.includes(pref.subject)) setSubject(pref.subject);
      setProfileReady(true);
      return;
    }
    if (settingsLoaded && siteSettings) {
      const defaultGrade = Math.min(6, Math.max(1, siteSettings.default_grade ?? 3)) as Grade;
      const defaultSemester = (siteSettings.default_semester === 1 ? 1 : 2) as Semester;
      const defaultSubject = (siteSettings.default_subject as Subject) || '國語';
      const defaultPublisher = (siteSettings.default_publisher as Publisher) || '南一';
      setGrade(defaultGrade);
      setSemester(defaultSemester);
      setSubject(defaultSubject);
      setPublisher(defaultPublisher);
    }
    setShowSetup(true);
    setProfileReady(true);
  }, [gp, sp, semp, pp, vp, settingsLoaded, siteSettings]); // 依 URL params 變動同步 state（含切換出版社）

  // 進入時取得全站設定（維護模式、公告）
  useEffect(() => {
    let cancelled = false;
    fetchSiteSettings().then(s => {
      if (!cancelled) {
        setSiteSettings(s);
        if (s.library_config) {
          const cfg = s.library_config as LibraryConfig;
          setLibraryConfig(cfg);
          localStorage.setItem('EIDOS_LIBRARY_CONFIG', JSON.stringify(cfg));
        } else {
          const local = localStorage.getItem('EIDOS_LIBRARY_CONFIG');
          if (local) {
            try {
              setLibraryConfig(JSON.parse(local) as LibraryConfig);
            } catch {
              setLibraryConfig(null);
            }
          }
        }
        setSettingsLoaded(true);
      }
    });
    return () => { cancelled = true; };
  }, []);

  // 進入時從 API 拉取 profile 並合併（可選，不阻塞畫面）
  useEffect(() => {
    if (!settingsLoaded) return;
    if (isDeepLinkedRef.current) return;
    const userId = getOrCreateUserId();
    fetchAndMergeUserProfile(userId).then(merged => {
      if (merged) {
        setGrade(merged.grade);
        setSemester(merged.semester);
        const pubKey = `國語_S${merged.semester}`;
        setPublisher((merged.publisherBySubject?.[pubKey] as Publisher) ?? '南一');
      }
    });
  }, [settingsLoaded]);

  // State → URL sync（子分頁用 path：about → /about 或 /about/library，stats → /stats 或 /stats/wrong）
  // 若目前 URL 已是合法題庫路徑（例如使用者剛點題庫總覽的 Link），不要用舊 state 覆寫，讓 URL→State 先更新
  // 若使用者從根路徑 `/` 進入且未主動操作，不自動跳轉到深層路徑
  const subTab = params.subTab;
  const hasUrlParams = !!(gp && sp && semp && pp);
  useEffect(() => {
    if (!profileReady) return;
    // 使用者從根路徑 `/` 進入、尚未主動操作科目/年級時，不自動跳轉
    if (!hasUrlParams && view === 'menu') return;
    const urlView = VIEW_TO_URL[view];
    const aboutTab = view === 'about' ? (subTab || 'about') : undefined;
    const statsTab = view === 'learning-report' ? (subTab === 'wrong' ? 'wrong' : undefined) : undefined;
    const path = buildPath(
      grade,
      subject,
      semester,
      publisher,
      urlView,
      aboutTab || statsTab
    );
    const currentPath = window.location.pathname;
    if (currentPath !== path) {
      if (VALID_APP_PATH.test(currentPath)) return; // 使用者剛點題庫總覽 Link，不覆寫 URL
      navigate(path, { replace: true });
    }
  }, [grade, subject, semester, publisher, view, subTab, profileReady, hasUrlParams, navigate]);

  // 深連結防呆：需要 session state 的 view 不允許直接空降
  useEffect(() => {
    if (!profileReady || !hasUrlParams) return;
    const needsSessionView = view === 'quiz' || view === 'result' || view === 'wrong-questions';
    if (!needsSessionView) return;
    const hasSessionData = (
      (view === 'quiz' && quizQuestions.length > 0) ||
      (view === 'result' && resultTotal > 0) ||
      (view === 'wrong-questions' && sessionWrongQuestions.length > 0)
    );
    if (!hasSessionData) {
      setView('menu');
      navigate(buildPath(grade, subject, semester, publisher), { replace: true });
    }
  }, [profileReady, hasUrlParams, view, quizQuestions.length, resultTotal, sessionWrongQuestions.length, grade, subject, semester, publisher, navigate]);

  // When subject changes（例如點科目標籤），用 profile 的出版社；若 URL 指定的出版社與 profile 不同，表示使用者刻意切到該社，不覆寫
  useEffect(() => {
    const profilePub = getPublisherForSubject(subject);
    if (pp != null && pp !== '' && URL_CODE_PUBLISHER[pp] !== profilePub) return; // URL 已指定不同出版社，保留
    setPublisher(profilePub);
  }, [subject, pp]);

  // Load questions when config changes (Lazy loading: load manifest only first；並行加載、防重複 fetch)
  useEffect(() => {
    if (!profileReady) return;
    let cancelled = false;
    const loadKey = `${grade}_${subject}_${semester}_${publisher}`;
    const enabled = isLibraryEnabled(libraryConfig, grade, subject, semester, publisher);

    if (!enabled) {
      setLoaded({
        status: 'empty',
        questions: [],
        getAllCategories: () => [],
        getQuestionsByCategory: () => [],
        errorMessage: '此題庫已關閉',
      });
      setLoading(false);
      return;
    }

    // 如果是 review/quiz/result/wrong-questions 需完整題目；僅在「已載過同一組合」時略過
    const needFull = ['review', 'quiz', 'result', 'wrong-questions'].includes(view);
    if (needFull && loaded.questions.length > 0 && loadedForRef.current === loadKey) return;

    setLoading(true);
    const promise = loadQuestions(grade, subject, semester, publisher, !needFull);
    loadPromiseRef.current = promise;
    promise.then((result) => {
      if (!cancelled && loadPromiseRef.current === promise) {
        setLoaded(result);
        loadedForRef.current = loadKey;
        setLoading(false);
        loadPromiseRef.current = null;
      }
    }).finally(() => {
      if (loadPromiseRef.current === promise) loadPromiseRef.current = null;
    });
    saveUserPreference(grade, subject, semester, publisher);
    document.title = `${SUBJECT_ICONS[subject]} ${grade}年級${subject}複習 - Eidos`;
    return () => { cancelled = true; };
  }, [grade, subject, semester, publisher, view, profileReady, libraryConfig]);

  // Ensure questions are fully loaded before action（進入分科題庫/測驗時若尚未載入則觸發一次完整並行加載；防雙擊重複 fetch）
  const ensureQuestionsLoaded = useCallback(async (): Promise<boolean> => {
    if (!isLibraryEnabled(libraryConfig, grade, subject, semester, publisher)) return false;
    if (loaded.questions.length > 0) return true;
    const existing = fullLoadPromiseRef.current;
    if (existing) {
      const result = await existing;
      setLoaded(result);
      setLoading(false);
      return result.questions.length > 0;
    }
    setLoading(true);
    const promise = loadQuestions(grade, subject, semester, publisher, false);
    fullLoadPromiseRef.current = promise;
    try {
      const result = await promise;
      if (fullLoadPromiseRef.current === promise) {
        setLoaded(result);
        fullLoadPromiseRef.current = null;
      }
      return result.questions.length > 0;
    } finally {
      setLoading(false);
      if (fullLoadPromiseRef.current === promise) fullLoadPromiseRef.current = null;
    }
  }, [grade, subject, semester, publisher, loaded.questions.length, libraryConfig]);

  // Profile save handler（local + API 同步；每次變更即存檔，state 更新後由 State→URL effect 同步網址）
  const handleProfileSave = useCallback((profileData: ProfileData) => {
    const current = loadUserProfile();
    saveUserProfile({
      grade: profileData.grade,
      semester: profileData.semester,
      publisherBySubject: profileData.publisherBySubject,
      setupComplete: true,
      autoAdvanceDelayMs: profileData.autoAdvanceDelayMs,
      shortcut_enabled: profileData.shortcut_enabled ?? current?.shortcut_enabled ?? true,
      theme: current?.theme ?? 'light',
    });
    setGrade(profileData.grade);
    setSemester(profileData.semester);
    // 出版社 key 為 科目_S學期，與 storage.getPublisherForSubject 一致
    const pubKey = `${subject}_S${profileData.semester}`;
    const pub = (profileData.publisherBySubject as Record<string, Publisher>)?.[pubKey] ?? '南一';
    setPublisher(pub);
    syncUserProfileToApi(getOrCreateUserId()).catch(() => { });
    toast.success('已儲存');
  }, [subject]);

  const handleCloseSetup = useCallback(() => {
    setShowSetup(false);
    if (view === 'settings') setView('menu');
  }, [view]);

  const handleStartReview = useCallback(async () => {
    if (!isLibraryEnabled(libraryConfig, grade, subject, semester, publisher)) {
      toast.error('此題庫已關閉');
      return;
    }
    const isLoaded = await ensureQuestionsLoaded();
    if (isLoaded) setView('review');
  }, [ensureQuestionsLoaded, libraryConfig, grade, subject, semester, publisher]);

  const handleSubjectChange = useCallback((s: Subject) => {
    setSubject(s);
    if (view !== 'menu') setView('menu');
  }, [view]);

  // Quiz start
  const handleStartQuiz = useCallback(async (type: string, count: number) => {
    if (!isLibraryEnabled(libraryConfig, grade, subject, semester, publisher)) {
      toast.error('此題庫已關閉');
      return;
    }
    const isLoaded = await ensureQuestionsLoaded();
    if (!isLoaded) return;
    const progress = loadQuizProgress(grade, subject, semester, publisher);
    if (progress && progress.type === type) {
      const shouldResume = window.confirm('偵測到未完成的作答進度，是否繼續？');
      if (shouldResume) {
        setQuizQuestions(progress.questions as Question[]);
        setQuizType(progress.type);
        setQuizStartTime(progress.startTime);
        setQuizInitialIndex(progress.currentIndex);
        setQuizInitialScore(progress.score);
        setQuizInitialAnswered(progress.answeredQuestions as { question: Question; isCorrect: boolean; selected: number }[]);
        setQuizInitialStartTime(progress.startTime);
        setView('quiz');
        return;
      }
      clearQuizProgress(grade, subject, semester, publisher);
    }
    setLoaded(prev => {
      const validQs = prev.questions.filter(q => q.type === 'multiple_choice' && q.options.length >= 2);
      if (validQs.length === 0) return prev;
      const shuffled = [...validQs].sort(() => Math.random() - 0.5);
      setQuizQuestions(shuffled.slice(0, Math.min(count, shuffled.length)));
      setQuizType(type);
      const now = Date.now();
      setQuizStartTime(now);
      setQuizInitialIndex(0);
      setQuizInitialScore(0);
      setQuizInitialAnswered([]);
      setQuizInitialStartTime(now);
      setView('quiz');
      logActivity('start_quiz', { grade, subject, semester, publisher, view: 'quiz', type, count });
      return prev;
    });
  }, [grade, subject, semester, publisher, ensureQuestionsLoaded, libraryConfig]);

  const handleStartLessonQuiz = useCallback(async (category: string) => {
    if (!isLibraryEnabled(libraryConfig, grade, subject, semester, publisher)) {
      toast.error('此題庫已關閉');
      return;
    }
    const isLoaded = await ensureQuestionsLoaded();
    if (!isLoaded) return;
    setLoaded(prev => {
      const catQs = prev.questions.filter(q => q.category === category && q.type === 'multiple_choice' && q.options.length >= 2);
      if (catQs.length === 0) return prev;
      const shuffled = [...catQs].sort(() => Math.random() - 0.5);
      setQuizQuestions(shuffled);
      setQuizType(`分課：${category}`);
      const now = Date.now();
      setQuizStartTime(now);
      setQuizInitialIndex(0);
      setQuizInitialScore(0);
      setQuizInitialAnswered([]);
      setQuizInitialStartTime(now);
      setView('quiz');
      logActivity('view_lesson', { grade, subject, semester, publisher, lesson: category, view: 'quiz' });
      return prev;
    });
  }, [grade, subject, semester, publisher, ensureQuestionsLoaded, libraryConfig]);

  // Quiz finish (QuizView may pass 4th arg: answeredList)
  const handleQuizFinish = useCallback((score: number, total: number, wrongQs: Question[], _answeredList?: unknown) => {
    const duration = Math.round((Date.now() - quizStartTime) / 1000);
    const accuracy = Math.round((score / total) * 100);
    savePracticeRecord({ grade, subject, semester, publisher, type: quizType, score, count: total, accuracy, duration });
    clearQuizProgress(grade, subject, semester, publisher);
    setResultScore(score);
    setResultTotal(total);
    setSessionWrongQuestions(wrongQs);
    setQuizInitialIndex(0);
    setQuizInitialScore(0);
    setQuizInitialAnswered([]);
    setQuizInitialStartTime(Date.now());
    setView('result');
  }, [grade, subject, semester, publisher, quizType, quizStartTime]);

  const handleSaveAnswer = useCallback((questionId: string, isCorrect: boolean) => {
    saveAnswerRecord(questionId, isCorrect, grade, subject, semester, publisher);
  }, [grade, subject, semester, publisher]);

  // All wrong questions (accumulated)
  const getAccumulatedWrongQuestions = useCallback((): { questions: Question[]; counts: Record<string, { wrong: number; total: number }> } => {
    const records = getWrongRecords(grade, subject, semester, publisher);
    const questionMap = new Map(loaded.questions.map(q => [q.id, q]));
    const questions: Question[] = [];
    const counts: Record<string, { wrong: number; total: number }> = {};
    records.forEach(r => {
      const q = questionMap.get(r.questionId);
      if (q) {
        questions.push(q);
        counts[q.id] = { wrong: r.wrong, total: r.total };
      }
    });
    return { questions, counts };
  }, [grade, subject, semester, publisher, loaded.questions]);

  // Show setup wizard as overlay
  const renderSetupOverlay = () => {
    if (!showSetup && view !== 'settings') return null;
    const profile = loadUserProfile();
    return (
      <ProfileSetup
        initial={profile?.setupComplete ? { grade: profile.grade, semester: profile.semester, publisherBySubject: profile.publisherBySubject, autoAdvanceDelayMs: profile.autoAdvanceDelayMs, shortcut_enabled: profile.shortcut_enabled } : undefined}
        onSave={handleProfileSave}
        onClose={handleCloseSetup}
      />
    );
  };

  const theme = SUBJECT_THEME_MAP[subject];
  const libraryEnabled = isLibraryEnabled(libraryConfig, grade, subject, semester, publisher);
  const maintenanceMode = siteSettings?.maintenance_mode === true;
  const announcement = siteSettings?.announcement?.trim() ?? '';

  if (settingsLoaded && maintenanceMode) {
    return (
      <div className="min-h-screen bg-muted flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4">
          <h1 className="text-2xl font-bold text-foreground">🔧 系統維護中</h1>
          <p className="text-muted-foreground">
            我們正在進行系統優化，請稍後再回來看看。
          </p>
          {announcement && (
            <p className="text-sm text-muted-foreground bg-background/80 rounded-xl p-4">{announcement}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        grade={grade} semester={semester} publisher={publisher} subject={subject}
        onSubjectChange={handleSubjectChange}
        onOpenSettings={() => setShowSetup(true)}
        onLearningReport={() => setView('learning-report')}
        onAbout={() => setView('about')}
      />

      <main className="pb-8" style={{ minHeight: 'calc(100vh - 120px)' }}>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div key={`${subject}-${view}`} className={`w-10 h-10 border-4 border-muted rounded-full border-t-current subject-text-${theme} animate-spin`} />
          </div>
        ) : (
          <>
            {view === 'menu' && (
              <>
                {announcement && (
                  <div className="max-w-2xl mx-auto px-4 pt-2 pb-2">
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 text-sm text-amber-900 dark:text-amber-100">
                      📢 {announcement}
                    </div>
                  </div>
                )}
                <MainMenu
                  grade={grade} semester={semester} publisher={publisher} subject={subject}
                  questions={loaded.questions}
                  categories={loaded.getAllCategories()}
                  loadStatus={loaded.status}
                  loadError={loaded.errorMessage}
                  libraryDisabled={!libraryEnabled}
                  onStartQuiz={handleStartQuiz}
                  onStartLessonQuiz={handleStartLessonQuiz}
                  onStartReview={handleStartReview}
                />
              </>
            )}

            {view === 'quiz' && (
              <QuizView
                questions={quizQuestions}
                quizType={quizType}
                subject={subject}
                autoAdvanceDelayMs={getAutoAdvanceDelayMs()}
                shortcutEnabled={isShortcutEnabled()}
                onFinish={handleQuizFinish}
                onBack={() => setView('menu')}
                onSaveAnswer={handleSaveAnswer}
                onProgressSave={(progress) => {
                  saveQuizProgress(grade, subject, semester, publisher, progress);
                }}
                initialIndex={quizInitialIndex}
                initialScore={quizInitialScore}
                initialAnswered={quizInitialAnswered}
                initialStartTime={quizInitialStartTime}
              />
            )}

            {view === 'result' && (
              <ResultView
                score={resultScore}
                total={resultTotal}
                subject={subject}
                grade={grade}
                semester={semester}
                publisher={publisher}
                sessionWrongQuestions={sessionWrongQuestions}
                allQuestions={loaded.questions}
                onViewWrongQuestions={() => setView('wrong-questions')}
                onRetry={() => handleStartQuiz(quizType, quizQuestions.length)}
                onBackToMenu={() => setView('menu')}
              />
            )}

            {view === 'review' && (
              <ReviewView
                questions={loaded.questions}
                categories={loaded.getAllCategories()}
                subject={subject}
                onBack={() => navigate(buildPath(grade, subject, semester, publisher, 'about', 'library'))}
              />
            )}

            {view === 'wrong-questions' && (
              <WrongQuestionsView
                questions={sessionWrongQuestions}
                title="❌ 本次錯題檢視"
                onBack={() => setView('result')}
              />
            )}

            {view === 'learning-report' && (() => {
              const { questions: wqs, counts } = getAccumulatedWrongQuestions();
              return (
                <LearningReportView
                  grade={grade} semester={semester} publisher={publisher} subject={subject}
                  questions={loaded.questions}
                  categories={loaded.getAllCategories()}
                  wrongQuestions={wqs}
                  wrongCounts={counts}
                  tab={params.subTab === 'wrong' ? 'wrong' : 'stats'}
                  onTabChange={(newTab) => navigate(buildPath(grade, subject, semester, publisher, 'stats', newTab === 'wrong' ? 'wrong' : undefined))}
                  onBack={() => setView('menu')}
                />
              );
            })()}

            {view === 'about' && (
              <AboutView
                tab={(params.subTab && ['about', 'library', 'features', 'changelog'].includes(params.subTab)) ? (params.subTab as 'about' | 'library' | 'features' | 'changelog') : 'about'}
                onTabChange={(newTab) => navigate(buildPath(grade, subject, semester, publisher, 'about', newTab === 'about' ? undefined : newTab))}
                onBack={() => setView('menu')}
                grade={grade}
                semester={semester}
              />
            )}
          </>
        )}
      </main>

      {renderSetupOverlay()}
    </div>
  );
};

export default Index;
