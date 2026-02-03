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
const PaaSAdmin = lazy(() => import('@/components/PaaSAdmin'));

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <div className="text-on-background">Loading...</div>
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
    const [currentView, setCurrentView] = useState<'write' | 'library' | 'analytics' | 'settings' | 'discover' | 'prompts' | 'forms' | 'profile' | 'feed' | 'workshops' | 'collaborative' | 'challenges' | 'goals' | 'contests' | 'badges' | 'store' | 'paas-admin'>('library');
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
            <div className="text-on-background">Loading...</div>
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
          {currentView === 'paas-admin' && <PaaSAdmin />}
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
