import { Route, Routes } from 'react-router-dom';
import { SubjectProvider } from '@/context/SubjectContext';
import AppHeader from './components/AppHeader';
import ThemeSwitcher from './components/ThemeSwitcher';
import Nav from './components/Nav';
import MainMenu from './pages/MainMenu';
import QuizView from './pages/QuizView';
import ResultView from './pages/ResultView';
import LearningReportView from './pages/LearningReportView';

export default function App() {
  return (
    <SubjectProvider>
      <div className="min-h-screen pb-24">
        <AppHeader />
        <ThemeSwitcher />
        <main className="pt-4">
          <Routes>
            <Route path="/" element={<MainMenu />} />
            <Route path="/quiz" element={<QuizView />} />
            <Route path="/result" element={<ResultView />} />
            <Route path="/report" element={<LearningReportView />} />
          </Routes>
        </main>
        <Nav />
      </div>
    </SubjectProvider>
  );
}
