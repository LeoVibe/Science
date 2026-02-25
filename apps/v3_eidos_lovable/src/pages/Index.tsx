import { useState, useEffect, useCallback } from 'react';
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
  loadUserProfile, saveUserProfile, getPublisherForSubject,
} from '@/utils/storage';
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
  const [loaded, setLoaded] = useState<LoadedQuestions>({ questions: [], getAllCategories: () => [], getQuestionsByCategory: () => [] });
  const [loading, setLoading] = useState(false);

  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [quizType, setQuizType] = useState('');
  const [quizStartTime, setQuizStartTime] = useState(0);

  // Result state
  const [resultScore, setResultScore] = useState(0);
  const [resultTotal, setResultTotal] = useState(0);
  const [sessionWrongQuestions, setSessionWrongQuestions] = useState<Question[]>([]);

  // URL → State sync (on mount / URL change)
  useEffect(() => {
    const { grade: gp, subject: sp, semester: semp, publisher: pp, view: vp } = params;
    if (gp && sp && semp && pp) {
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
        // For ephemeral views, redirect to menu if no state
        if (v === 'quiz' || v === 'result' || v === 'wrong-questions') {
          setView('menu');
        } else {
          setView(v || 'menu');
        }
        setProfileReady(true);
        return;
      }
    }
    // No valid URL params - load from profile/localStorage
    const profile = loadUserProfile();
    if (profile && profile.setupComplete) {
      setGrade(profile.grade);
      setSemester(profile.semester);
      const pub = profile.publisherBySubject?.['國語'] ?? '南一';
      setPublisher(pub);
      setProfileReady(true);
    } else {
      const pref = loadUserPreference();
      if (pref) {
        setGrade(pref.grade);
        setSemester(pref.semester);
        setPublisher(pref.publisher);
        const subjects = getSubjectsByGrade(pref.grade);
        if (subjects.includes(pref.subject)) setSubject(pref.subject);
        setProfileReady(true);
      } else {
        setShowSetup(true);
        setProfileReady(true);
      }
    }
  }, []); // Only on mount

  // State → URL sync
  useEffect(() => {
    if (!profileReady) return;
    const urlView = VIEW_TO_URL[view];
    const path = buildPath(grade, subject, semester, publisher, urlView);
    // Only replace if URL is different from current
    const currentPath = window.location.pathname;
    if (currentPath !== path) {
      navigate(path, { replace: true });
    }
  }, [grade, subject, semester, publisher, view, profileReady, navigate]);

  // When subject changes, update publisher from profile
  useEffect(() => {
    const pub = getPublisherForSubject(subject);
    setPublisher(pub);
  }, [subject]);

  // Load questions when config changes
  useEffect(() => {
    if (!profileReady) return;
    let cancelled = false;
    setLoading(true);
    loadQuestions(grade, subject, semester, publisher).then(result => {
      if (!cancelled) {
        setLoaded(result);
        setLoading(false);
      }
    });
    saveUserPreference(grade, subject, semester, publisher);
    document.title = `${SUBJECT_ICONS[subject]} ${grade}年級${subject}複習 - ScienceQuest`;
    return () => { cancelled = true; };
  }, [grade, subject, semester, publisher, profileReady]);

  // Profile save handler
  const handleProfileSave = useCallback((profileData: ProfileData) => {
    saveUserProfile({
      grade: profileData.grade,
      semester: profileData.semester,
      publisherBySubject: profileData.publisherBySubject,
      setupComplete: true,
    });
    setGrade(profileData.grade);
    setSemester(profileData.semester);
    const pub = profileData.publisherBySubject[subject] ?? '南一';
    setPublisher(pub);
  }, [subject]);

  const handleCloseSetup = useCallback(() => {
    setShowSetup(false);
    if (view === 'settings') setView('menu');
  }, [view]);

  const handleSubjectChange = useCallback((s: Subject) => {
    setSubject(s);
    if (view !== 'menu') setView('menu');
  }, [view]);

  // Quiz start
  const handleStartQuiz = useCallback((type: string, count: number) => {
    const validQs = loaded.questions.filter(q => q.type === 'multiple_choice' && q.options.length >= 2);
    if (validQs.length === 0) return;
    const shuffled = [...validQs].sort(() => Math.random() - 0.5);
    setQuizQuestions(shuffled.slice(0, Math.min(count, shuffled.length)));
    setQuizType(type);
    setQuizStartTime(Date.now());
    setView('quiz');
  }, [loaded.questions]);

  const handleStartLessonQuiz = useCallback((category: string) => {
    const catQs = loaded.questions.filter(q => q.category === category && q.type === 'multiple_choice' && q.options.length >= 2);
    if (catQs.length === 0) return;
    const shuffled = [...catQs].sort(() => Math.random() - 0.5);
    setQuizQuestions(shuffled);
    setQuizType(`分課：${category}`);
    setQuizStartTime(Date.now());
    setView('quiz');
  }, [loaded.questions]);

  // Quiz finish
  const handleQuizFinish = useCallback((score: number, total: number, wrongQs: Question[]) => {
    const duration = Math.round((Date.now() - quizStartTime) / 1000);
    const accuracy = Math.round((score / total) * 100);
    savePracticeRecord({ grade, subject, semester, publisher, type: quizType, score, count: total, accuracy, duration });
    clearQuizProgress(grade, subject, semester, publisher);
    setResultScore(score);
    setResultTotal(total);
    setSessionWrongQuestions(wrongQs);
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
        initial={profile?.setupComplete ? { grade: profile.grade, semester: profile.semester, publisherBySubject: profile.publisherBySubject } : undefined}
        onSave={handleProfileSave}
        onClose={handleCloseSetup}
      />
    );
  };

  const theme = SUBJECT_THEME_MAP[subject];

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
            <div className={`w-10 h-10 border-4 border-muted rounded-full border-t-current subject-text-${theme} animate-spin`} />
          </div>
        ) : (
          <>
            {view === 'menu' && (
              <MainMenu
                grade={grade} semester={semester} publisher={publisher} subject={subject}
                questions={loaded.questions}
                categories={loaded.getAllCategories()}
                onStartQuiz={handleStartQuiz}
                onStartLessonQuiz={handleStartLessonQuiz}
                onStartReview={() => setView('review')}
              />
            )}

            {view === 'quiz' && (
              <QuizView
                questions={quizQuestions}
                quizType={quizType}
                subject={subject}
                onFinish={handleQuizFinish}
                onBack={() => setView('menu')}
                onSaveAnswer={handleSaveAnswer}
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
                onBack={() => setView('menu')}
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
                  onBack={() => setView('menu')}
                />
              );
            })()}

            {view === 'about' && (
              <AboutView onBack={() => setView('menu')} />
            )}
          </>
        )}
      </main>

      {renderSetupOverlay()}
    </div>
  );
};

export default Index;
