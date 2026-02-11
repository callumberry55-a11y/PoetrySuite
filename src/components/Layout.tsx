import { ReactNode, useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import AppDrawer from './AppDrawer';
import FloatingDock from './FloatingDock';

export type ViewType = 'write' | 'library' | 'analytics' | 'settings' | 'discover' | 'prompts' | 'forms' | 'profile' | 'feed' | 'workshops' | 'collaborative' | 'challenges' | 'goals' | 'contests' | 'badges' | 'store' | 'paas-admin' | 'points-bank' | 'following' | 'reading-lists' | 'glossary' | 'famous-poems' | 'writing-tips' | 'daily-prompts' | 'book-clubs' | 'study-groups' | 'writing-streaks' | 'forums' | 'collections' | 'favorites' | 'writing-timer' | 'quizzes' | 'writing-tools' | 'export-tools' | 'manuscript-manager' | 'poetry-journal' | 'prompt-roulette' | 'word-games' | 'poetry-swaps' | 'writing-buddies' | 'critique-circles' | 'public-readings' | 'poetry-bingo' | 'focus-mode' | 'writing-statistics' | 'daily-word-goals' | 'form-challenges' | 'tags-manager' | 'writing-calendar';

interface LayoutProps {
  children: ReactNode;
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed', platform: string }>;
  prompt(): Promise<void>;
}

declare global {
  interface Window {
    BeforeInstallPromptEvent: BeforeInstallPromptEvent;
  }
}

export default function Layout({ children, currentView, onViewChange }: LayoutProps) {
  const [isAppDrawerOpen, setAppDrawerOpen] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (localStorage.getItem('installPromptDismissed') !== 'true') {
        setShowInstallPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler as EventListener);

    window.addEventListener('appinstalled', () => {
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler as EventListener);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowInstallPrompt(false);
    }

    setDeferredPrompt(null);
  };

  const handleDismissInstall = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('installPromptDismissed', 'true');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <a
        href="#main-content"
        className="skip-link bg-primary text-on-primary px-4 py-2 rounded-lg font-medium shadow-lg"
      >
        Skip to main content
      </a>
      
      {showInstallPrompt && (
        <aside className="bg-primary-container text-on-primary-container px-3 sm:px-4 py-2.5 sm:py-3 shadow-xl fixed top-0 left-0 right-0 z-[100] slide-up" role="banner" aria-label="Install app banner">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <Download size={18} className="sm:w-5 sm:h-5 flex-shrink-0 animate-bounce" aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm lg:text-base font-medium truncate">Install Poetry Suite</p>
                <p className="text-[10px] sm:text-xs lg:text-sm text-on-primary-container/80 hidden xs:block truncate">Get quick access and offline support</p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <button
                onClick={handleInstallClick}
                className="px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 bg-primary text-on-primary rounded-lg sm:rounded-xl font-semibold hover:bg-primary/90 transition-all duration-300 text-xs sm:text-sm whitespace-nowrap shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 min-h-[36px] flex items-center justify-center"
                aria-label="Install Poetry Suite app"
              >
                Install
              </button>
              <button
                onClick={handleDismissInstall}
                className="p-2 sm:p-2.5 hover:bg-on-primary-container/10 rounded-lg transition-all duration-300 hover:scale-110 hover:rotate-90 min-w-[36px] min-h-[36px] flex items-center justify-center"
                aria-label="Dismiss install banner"
              >
                <X size={16} className="sm:w-[18px] sm:h-[18px]" aria-hidden="true" />
              </button>
            </div>
          </div>
        </aside>
      )}

      <main className="flex-1" id="main-content" role="main">
        {children}
      </main>

      <FloatingDock 
        onAppDrawerOpen={() => setAppDrawerOpen(true)} 
        onViewChange={onViewChange} 
        currentView={currentView} 
      />

      <AppDrawer 
        isOpen={isAppDrawerOpen} 
        onClose={() => setAppDrawerOpen(false)} 
        onViewChange={onViewChange} 
        currentView={currentView} 
      />
    </div>
  );
}
