import { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import AuthPage from './components/AuthPage';
import Layout from './components/Layout';

const PoemEditor = lazy(() => import('./components/PoemEditor'));
const Library = lazy(() => import('./components/Library'));
const Analytics = lazy(() => import('./components/Analytics'));
const Settings = lazy(() => import('./components/Settings'));
const Discover = lazy(() => import('./components/Discover'));
const Prompts = lazy(() => import('./components/Prompts'));
const Forms = lazy(() => import('./components/Forms'));
const Submissions = lazy(() => import('./components/Submissions'));
const Chat = lazy(() => import('./components/Chat'));
const Beta = lazy(() => import('./components/Beta'));
const AdvancedAIAnalysis = lazy(() => import('./components/beta/AdvancedAIAnalysis'));
const VoiceRecording = lazy(() => import('./components/beta/VoiceRecording'));
const AdvancedMetrics = lazy(() => import('./components/beta/AdvancedMetrics'));
const CustomThemes = lazy(() => import('./components/beta/CustomThemes'));
const CollaborativeWriting = lazy(() => import('./components/beta/CollaborativeWriting'));
const AIWallpapers = lazy(() => import('./components/beta/AIWallpapers'));
const PoetryTranslation = lazy(() => import('./components/beta/PoetryTranslation'));
const RhymeDictionary = lazy(() => import('./components/beta/RhymeDictionary'));
const MoodBoardGenerator = lazy(() => import('./components/beta/MoodBoardGenerator'));
const ReadingTimeEstimator = lazy(() => import('./components/beta/ReadingTimeEstimator'));
const VerseVariations = lazy(() => import('./components/beta/VerseVariations'));
const PerformanceMode = lazy(() => import('./components/beta/PerformanceMode'));
const PoetryChallenges = lazy(() => import('./components/beta/PoetryChallenges'));
const WordCloudVisualizer = lazy(() => import('./components/beta/WordCloudVisualizer'));
const PoetryContests = lazy(() => import('./components/beta/PoetryContests'));
const HistoricalFormsExplorer = lazy(() => import('./components/beta/HistoricalFormsExplorer'));

type ViewType = 'write' | 'library' | 'analytics' | 'settings' | 'discover' | 'prompts' | 'forms' | 'submissions' | 'chat' | 'beta' | 'beta-ai-analysis' | 'beta-voice-recording' | 'beta-metrics' | 'beta-themes' | 'beta-collab' | 'beta-wallpapers' | 'beta-translation' | 'beta-rhyme-dictionary' | 'beta-mood-board' | 'beta-reading-time' | 'beta-verse-variations' | 'beta-performance' | 'beta-challenges' | 'beta-word-cloud' | 'beta-contests' | 'beta-historical-forms';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('library');
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

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      const viewMap: Record<string, ViewType> = {
        'ai-analysis': 'beta-ai-analysis',
        'voice-recording': 'beta-voice-recording',
        'metrics': 'beta-metrics',
        'themes': 'beta-themes',
        'collaborative': 'beta-collab',
        'wallpapers': 'beta-wallpapers',
        'translation': 'beta-translation',
        'rhyme-dictionary': 'beta-rhyme-dictionary',
        'mood-board': 'beta-mood-board',
        'reading-time': 'beta-reading-time',
        'verse-variations': 'beta-verse-variations',
        'performance': 'beta-performance',
        'challenges': 'beta-challenges',
        'word-cloud': 'beta-word-cloud',
        'contests': 'beta-contests',
        'historical-forms': 'beta-historical-forms'
      };

      if (viewMap[hash]) {
        setCurrentView(viewMap[hash]);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[rgb(var(--bg-primary))] to-[rgb(var(--bg-secondary))] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-slate-600 dark:text-slate-400">Loading...</div>
        </div>
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
        {currentView === 'chat' && <Chat />}
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
        {currentView === 'beta' && <Beta />}
        {currentView === 'beta-ai-analysis' && <AdvancedAIAnalysis />}
        {currentView === 'beta-voice-recording' && <VoiceRecording />}
        {currentView === 'beta-metrics' && <AdvancedMetrics />}
        {currentView === 'beta-themes' && <CustomThemes />}
        {currentView === 'beta-collab' && <CollaborativeWriting />}
        {currentView === 'beta-wallpapers' && <AIWallpapers />}
        {currentView === 'beta-translation' && <PoetryTranslation />}
        {currentView === 'beta-rhyme-dictionary' && <RhymeDictionary />}
        {currentView === 'beta-mood-board' && <MoodBoardGenerator />}
        {currentView === 'beta-reading-time' && <ReadingTimeEstimator />}
        {currentView === 'beta-verse-variations' && <VerseVariations />}
        {currentView === 'beta-performance' && <PerformanceMode />}
        {currentView === 'beta-challenges' && <PoetryChallenges />}
        {currentView === 'beta-word-cloud' && <WordCloudVisualizer />}
        {currentView === 'beta-contests' && <PoetryContests />}
        {currentView === 'beta-historical-forms' && <HistoricalFormsExplorer />}
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
