import { lazy, Suspense, useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import AuthPage from '@/components/AuthPage';
import Layout from '@/components/Layout';

const PoemEditor = lazy(() => import('@/components/PoemEditor'));
const Library = lazy(() => import('@/components/Library'));
const Analytics = lazy(() => import('@/components/Analytics'));
const Settings = lazy(() => import('@/components/Settings'));
const Discover = lazy(() => import('@/components/Discover'));
const Prompts = lazy(() => import('@/components/Prompts'));
const Forms = lazy(() => import('@/components/Forms'));
const Profile = lazy(() => import('@/components/Profile'));
const SocialFeed = lazy(() => import('@/components/SocialFeed'));
const Workshops = lazy(() => import('@/components/Workshops'));
const Collaborative = lazy(() => import('@/components/Collaborative'));
const Challenges = lazy(() => import('@/components/Challenges'));
const Goals = lazy(() => import('@/components/Goals'));
const Contests = lazy(() => import('@/components/Contests'));
const Badges = lazy(() => import('@/components/Badges'));
const Store = lazy(() => import('@/components/Store'));
const PaaSAuth = lazy(() => import('@/components/PaaSAuth'));
const PointsBank = lazy(() => import('@/components/PointsBank'));
const FollowingNetwork = lazy(() => import('@/components/FollowingNetwork'));
const ReadingLists = lazy(() => import('@/components/ReadingLists'));
const PoetryGlossary = lazy(() => import('@/components/PoetryGlossary'));
const FamousPoems = lazy(() => import('@/components/FamousPoems'));
const WritingTips = lazy(() => import('@/components/WritingTips'));
const DailyPrompts = lazy(() => import('@/components/DailyPrompts'));
const BookClubs = lazy(() => import('@/components/BookClubs'));
const StudyGroups = lazy(() => import('@/components/StudyGroups'));
const WritingStreaks = lazy(() => import('@/components/WritingStreaks'));
const EventsCalendar = lazy(() => import('@/components/EventsCalendar'));
const Forums = lazy(() => import('@/components/Forums'));
const Collections = lazy(() => import('@/components/Collections'));
const Favorites = lazy(() => import('@/components/Favorites'));
const WritingTimer = lazy(() => import('@/components/WritingTimer'));

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-24 h-24">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full animate-[walk_0.8s_ease-in-out_infinite]"
            >
              {/* Pigeon body */}
              <ellipse cx="50" cy="55" rx="20" ry="18" fill="currentColor" className="text-primary opacity-90" />

              {/* Pigeon head */}
              <circle cx="65" cy="45" r="12" fill="currentColor" className="text-primary" />

              {/* Pigeon beak */}
              <path d="M 75 45 L 82 43 L 82 47 Z" fill="currentColor" className="text-primary/70" />

              {/* Pigeon eye */}
              <circle cx="70" cy="43" r="2" fill="currentColor" className="text-background" />

              {/* Pigeon wing */}
              <ellipse cx="45" cy="55" rx="12" ry="15" fill="currentColor" className="text-primary/60" transform="rotate(-20 45 55)" />

              {/* Pigeon tail */}
              <ellipse cx="32" cy="58" rx="8" ry="12" fill="currentColor" className="text-primary/80" transform="rotate(25 32 58)" />

              {/* Pigeon legs - animated */}
              <g className="animate-[step-left_0.8s_ease-in-out_infinite]">
                <line x1="45" y1="70" x2="45" y2="80" stroke="currentColor" strokeWidth="2" className="text-primary/90" />
                <path d="M 45 80 L 42 82 M 45 80 L 48 82" stroke="currentColor" strokeWidth="2" className="text-primary/90" />
              </g>
              <g className="animate-[step-right_0.8s_ease-in-out_infinite]">
                <line x1="55" y1="70" x2="55" y2="80" stroke="currentColor" strokeWidth="2" className="text-primary/90" />
                <path d="M 55 80 L 52 82 M 55 80 L 58 82" stroke="currentColor" strokeWidth="2" className="text-primary/90" />
              </g>
            </svg>
          </div>
          <div className="text-on-background font-medium animate-pulse">Loading...</div>
        </div>

        <style>{`
          @keyframes walk {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
          }

          @keyframes step-left {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            25% { transform: translateY(-3px) rotate(-10deg); }
            50% { transform: translateY(0px) rotate(0deg); }
            75% { transform: translateY(0px) rotate(0deg); }
          }

          @keyframes step-right {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            25% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(0px) rotate(0deg); }
            75% { transform: translateY(-3px) rotate(10deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/*" element={user ? <MainApp /> : <AuthPage />} />
    </Routes>
  );
}

function MainApp() {
    const [currentView, setCurrentView] = useState<'write' | 'library' | 'analytics' | 'settings' | 'discover' | 'prompts' | 'forms' | 'profile' | 'feed' | 'workshops' | 'collaborative' | 'challenges' | 'goals' | 'contests' | 'badges' | 'store' | 'paas-admin' | 'points-bank' | 'following' | 'reading-lists' | 'glossary' | 'famous-poems' | 'writing-tips' | 'daily-prompts' | 'book-clubs' | 'study-groups' | 'writing-streaks' | 'events-calendar' | 'forums' | 'collections' | 'favorites' | 'writing-timer'>('library');
    const [selectedPoemId, setSelectedPoemId] = useState<string | null>(null);

    const handleNewPoem = useCallback(() => {
      setSelectedPoemId(null);
      setCurrentView('write');
    }, []);

    const handleEditPoem = useCallback((poemId: string) => {
      setSelectedPoemId(poemId);
      setCurrentView('write');
    }, []);

    const handleBackToLibrary = useCallback(() => {
      setSelectedPoemId(null);
      setCurrentView('library');
    }, []);

    return (
        <Layout currentView={currentView} onViewChange={setCurrentView}>
        <Suspense fallback={
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-20 h-20">
                <svg
                  viewBox="0 0 100 100"
                  className="w-full h-full animate-[walk_0.8s_ease-in-out_infinite]"
                >
                  <ellipse cx="50" cy="55" rx="20" ry="18" fill="currentColor" className="text-primary opacity-90" />
                  <circle cx="65" cy="45" r="12" fill="currentColor" className="text-primary" />
                  <path d="M 75 45 L 82 43 L 82 47 Z" fill="currentColor" className="text-primary/70" />
                  <circle cx="70" cy="43" r="2" fill="currentColor" className="text-background" />
                  <ellipse cx="45" cy="55" rx="12" ry="15" fill="currentColor" className="text-primary/60" transform="rotate(-20 45 55)" />
                  <ellipse cx="32" cy="58" rx="8" ry="12" fill="currentColor" className="text-primary/80" transform="rotate(25 32 58)" />
                  <g className="animate-[step-left_0.8s_ease-in-out_infinite]">
                    <line x1="45" y1="70" x2="45" y2="80" stroke="currentColor" strokeWidth="2" className="text-primary/90" />
                    <path d="M 45 80 L 42 82 M 45 80 L 48 82" stroke="currentColor" strokeWidth="2" className="text-primary/90" />
                  </g>
                  <g className="animate-[step-right_0.8s_ease-in-out_infinite]">
                    <line x1="55" y1="70" x2="55" y2="80" stroke="currentColor" strokeWidth="2" className="text-primary/90" />
                    <path d="M 55 80 L 52 82 M 55 80 L 58 82" stroke="currentColor" strokeWidth="2" className="text-primary/90" />
                  </g>
                </svg>
              </div>
              <div className="text-on-background text-sm font-medium animate-pulse">Loading...</div>
            </div>
          </div>
        }>
          {currentView === 'write' && (
            <PoemEditor
              selectedPoemId={selectedPoemId}
              onBack={handleBackToLibrary}
            />
          )}
          {currentView === 'library' && (
            <Library
              onNewPoem={handleNewPoem}
              onEditPoem={handleEditPoem}
            />
          )}
          {currentView === 'discover' && <Discover />}
          {currentView === 'prompts' && <Prompts />}
          {currentView === 'forms' && (
            <Forms
              onSelectForm={() => {
                setCurrentView('write');
                setSelectedPoemId(null);
              }}
            />
          )}
          {currentView === 'analytics' && <Analytics />}
          {currentView === 'settings' && <Settings />}
          {currentView === 'profile' && <Profile />}
          {currentView === 'feed' && <SocialFeed />}
          {currentView === 'workshops' && <Workshops />}
          {currentView === 'collaborative' && <Collaborative />}
          {currentView === 'challenges' && <Challenges />}
          {currentView === 'goals' && <Goals />}
          {currentView === 'contests' && <Contests />}
          {currentView === 'badges' && <Badges />}
          {currentView === 'store' && <Store />}
          {currentView === 'paas-admin' && <PaaSAuth />}
          {currentView === 'points-bank' && <PointsBank />}
          {currentView === 'following' && <FollowingNetwork />}
          {currentView === 'reading-lists' && <ReadingLists />}
          {currentView === 'glossary' && <PoetryGlossary />}
          {currentView === 'famous-poems' && <FamousPoems />}
          {currentView === 'writing-tips' && <WritingTips />}
          {currentView === 'daily-prompts' && <DailyPrompts />}
          {currentView === 'book-clubs' && <BookClubs />}
          {currentView === 'study-groups' && <StudyGroups />}
          {currentView === 'writing-streaks' && <WritingStreaks />}
          {currentView === 'events-calendar' && <EventsCalendar />}
          {currentView === 'forums' && <Forums />}
          {currentView === 'collections' && <Collections />}
          {currentView === 'favorites' && <Favorites />}
          {currentView === 'writing-timer' && <WritingTimer />}
        </Suspense>
      </Layout>
    )
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
