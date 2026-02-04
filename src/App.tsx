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

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-primary animate-spin [animation-duration:1.5s] [animation-direction:reverse]"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="text-on-background font-medium animate-pulse">Loading...</div>
        </div>
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
    const [currentView, setCurrentView] = useState<'write' | 'library' | 'analytics' | 'settings' | 'discover' | 'prompts' | 'forms' | 'profile' | 'feed' | 'workshops' | 'collaborative' | 'challenges' | 'goals' | 'contests' | 'badges' | 'store' | 'paas-admin' | 'points-bank'>('library');
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
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
                <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-primary animate-spin [animation-duration:1.5s] [animation-direction:reverse]"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                </div>
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
          {currentView === 'prompts' && (
            <Prompts
              onUsePrompt={() => {
                setCurrentView('write');
                setSelectedPoemId(null);
              }}
            />
          )}
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
