import { useState, useCallback, lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import AuthPage from './components/AuthPage';
import Layout from './components/Layout';

const PoemEditor = lazy(() => import('./components/PoemEditor'));
const Library = lazy(() => import('./components/Library'));
const Analytics = lazy(() => import('./components/Analytics'));
const Settings = lazy(() => import('./components/Settings'));

function AppContent() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<'editor' | 'library' | 'analytics' | 'settings'>('library');
  const [selectedPoemId, setSelectedPoemId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handlePoemSelect = useCallback((poemId: string) => {
    setSelectedPoemId(poemId);
    setCurrentView('editor');
  }, []);

  const handleNewPoem = useCallback(() => {
    setSelectedPoemId(null);
    setCurrentView('editor');
  }, []);

  const handlePoemSaved = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-slate-600 dark:text-slate-400">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView}>
      <Suspense fallback={
        <div className="flex items-center justify-center h-full">
          <div className="text-slate-600 dark:text-slate-400">Loading...</div>
        </div>
      }>
        {currentView === 'editor' && (
          <PoemEditor
            selectedPoemId={selectedPoemId}
            onPoemSaved={handlePoemSaved}
          />
        )}
        {currentView === 'library' && (
          <Library
            onPoemSelect={handlePoemSelect}
            onNewPoem={handleNewPoem}
            refreshTrigger={refreshTrigger}
          />
        )}
        {currentView === 'analytics' && <Analytics />}
        {currentView === 'settings' && <Settings />}
      </Suspense>
    </Layout>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
