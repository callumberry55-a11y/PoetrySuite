import { lazy, Suspense, useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import AuthPage from './components/AuthPage';
import Layout from './components/Layout';
import DeveloperDashboard from './components/DeveloperDashboard';
import DeveloperLogin from './components/DeveloperLogin';

const PoemEditor = lazy(() => import('./components/PoemEditor'));
const Library = lazy(() => import('./components/Library'));
const Analytics = lazy(() => import('./components/Analytics'));
const Settings = lazy(() => import('./components/Settings'));
const Discover = lazy(() => import('./components/Discover'));
const Prompts = lazy(() => import('./components/Prompts'));
const Forms = lazy(() => import('./components/Forms'));
const Submissions = lazy(() => import('./components/Submissions'));

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const { user, userProfile, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user || !userProfile?.is_developer) {
        return <Navigate to="/developer-login" />;
    }

    return children;
};

function MainApp() {
  const [currentView, setCurrentView] = useState<'write' | 'library' | 'analytics' | 'settings' | 'discover' | 'prompts' | 'forms' | 'submissions'>('library');
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
          <div className="text-slate-600 dark:text-slate-400">Loading...</div>
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
            onUsePrompt={(prompt) => {
              setCurrentView('write');
              setSelectedPoemId(null);
            }}
          />
        )}
        {currentView === 'forms' && (
          <Forms
            onSelectForm={(form) => {
              setCurrentView('write');
              setSelectedPoemId(null);
            }}
          />
        )}
        {currentView === 'submissions' && <Submissions />}
        {currentView === 'analytics' && <Analytics />}
        {currentView === 'settings' && <Settings />}
      </Suspense>
    </Layout>
  )
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-slate-600 dark:text-slate-400">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/developer-login" element={<DeveloperLogin />} />
      <Route path="/developer/dashboard" element={<ProtectedRoute><DeveloperDashboard /></ProtectedRoute>} />
      <Route path="/*" element={user ? <MainApp /> : <AuthPage />} />
    </Routes>
  );
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