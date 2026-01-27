import { ReactNode, useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import AppDrawer from './AppDrawer';
import FloatingDock from './FloatingDock';

type ViewType = 'write' | 'library' | 'analytics' | 'settings' | 'discover' | 'prompts' | 'forms' | 'submissions' | 'ai';

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
        <aside className="bg-primary-container text-on-primary-container px-4 py-3 shadow-lg fixed top-0 left-0 right-0 z-[100]" role="banner" aria-label="Install app banner">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Download size={20} className="flex-shrink-0" aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base font-medium">Install Poetry Suite</p>
                <p className="text-xs sm:text-sm text-on-primary-container/80 hidden sm:block">Get quick access and offline support</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleInstallClick}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-primary text-on-primary rounded-lg font-medium hover:opacity-90 transition-opacity text-sm whitespace-nowrap"
                aria-label="Install Poetry Suite app"
              >
                Install
              </button>
              <button
                onClick={handleDismissInstall}
                className="p-1.5 sm:p-2 hover:bg-on-primary-container/10 rounded-lg transition-colors"
                aria-label="Dismiss install banner"
              >
                <X size={18} aria-hidden="true" />
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
