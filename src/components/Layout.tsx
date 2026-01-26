import { ReactNode, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  BookHeart,
  PenLine,
  Library,
  BarChart3,
  Settings,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  Download,
  Compass,
  Lightbulb,
  BookOpen,
  Send,
  MoreVertical,
} from 'lucide-react';

type ViewType = 'write' | 'library' | 'analytics' | 'settings' | 'discover' | 'prompts' | 'forms' | 'submissions';

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

const navItems = [
  { id: 'write' as const, icon: PenLine, label: 'Write' },
  { id: 'library' as const, icon: Library, label: 'Library' },
  { id: 'discover' as const, icon: Compass, label: 'Discover' },
  { id: 'prompts' as const, icon: Lightbulb, label: 'Prompts' },
  { id: 'forms' as const, icon: BookOpen, label: 'Forms' },
  { id: 'submissions' as const, icon: Send, label: 'Submissions' },
  { id: 'analytics' as const, icon: BarChart3, label: 'Analytics' },
  { id: 'settings' as const, icon: Settings, label: 'Settings' },
];

export default function Layout({ children, currentView, onViewChange }: LayoutProps) {
  const { signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const [visibleNavItems, setVisibleNavItems] = useState<number>(9);

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

  const handleResize = useCallback(() => {
    if (navRef.current) {
      const navWidth = navRef.current.offsetWidth;
      // Rough estimation of item width
      const itemWidth = window.innerWidth > 1024 ? 120 : 90;
      const maxVisible = Math.floor(navWidth / itemWidth);
      setVisibleNavItems(Math.min(navItems.length, maxVisible));
    }
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial calculation
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

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

  const handleSignOut = async () => {
    await signOut();
  };

  const displayedNavItems = navItems.slice(0, visibleNavItems);
  const hiddenNavItems = navItems.slice(visibleNavItems);

  return (
    <div className="min-h-screen bg-m3-background flex flex-col">
      <a
        href="#main-content"
        className="skip-link bg-m3-primary text-m3-on-primary px-4 py-2 rounded-lg font-medium shadow-lg"
      >
        Skip to main content
      </a>
      {showInstallPrompt && (
        <aside className="bg-m3-primary-container text-m3-on-primary-container px-4 py-3 shadow-lg" role="banner" aria-label="Install app banner">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Download size={20} className="flex-shrink-0" aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base font-medium">Install Poetry Suite</p>
                <p className="text-xs sm:text-sm text-m3-on-primary-container/80 hidden sm:block">Get quick access and offline support</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleInstallClick}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-m3-primary text-m3-on-primary rounded-lg font-medium hover:opacity-90 transition-opacity text-sm whitespace-nowrap"
                aria-label="Install Poetry Suite app"
              >
                Install
              </button>
              <button
                onClick={handleDismissInstall}
                className="p-1.5 sm:p-2 hover:bg-m3-on-primary-container/10 rounded-lg transition-colors"
                aria-label="Dismiss install banner"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
          </div>
        </aside>
      )}

      <header className="bg-m3-surface border-b border-m3-outline/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-m3-on-surface/10 text-m3-on-surface-variant"
                aria-label={mobileMenuOpen ? 'Close mobile menu' : 'Open mobile menu'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-m3-primary flex items-center justify-center" aria-hidden="true">
                  <BookHeart size={20} className="text-m3-on-primary" />
                </div>
                <h1 className="text-xl font-bold text-m3-on-surface hidden sm:block">
                  Poetry Suite
                </h1>
              </div>
            </div>

            <nav ref={navRef} className="hidden md:flex items-center gap-1 flex-1 justify-center" aria-label="Main navigation">
              {displayedNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                    currentView === item.id
                      ? 'bg-m3-secondary-container text-m3-on-secondary-container'
                      : 'text-m3-on-surface-variant hover:bg-m3-on-surface/10'
                  }`}
                  aria-label={`Navigate to ${item.label}`}
                  aria-current={currentView === item.id ? 'page' : undefined}
                >
                  <item.icon size={16} aria-hidden="true" />
                  <span className="hidden lg:inline">{item.label}</span>
                </button>
              ))}
              {hiddenNavItems.length > 0 && (
                 <div className="relative">
                   <button onClick={() => setShowMoreMenu(!showMoreMenu)} className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors text-sm text-m3-on-surface-variant hover:bg-m3-on-surface/10">
                     <MoreVertical size={16} />
                     <span className="hidden lg:inline">More</span>
                   </button>
                   {showMoreMenu && (
                     <div className="absolute right-0 mt-2 w-48 bg-m3-surface-container rounded-lg shadow-lg py-1 z-50">
                       {hiddenNavItems.map(item => (
                         <button
                           key={item.id}
                           onClick={() => {
                             onViewChange(item.id);
                             setShowMoreMenu(false);
                           }}
                           className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-m3-on-surface hover:bg-m3-on-surface/10"
                         >
                           <item.icon size={16} />
                           {item.label}
                         </button>
                       ))}
                     </div>
                   )}
                 </div>
              )}
            </nav>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-m3-on-surface/10 text-m3-on-surface-variant"
                aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              >
                {isDark ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}
              </button>
              <button
                onClick={handleSignOut}
                className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-m3-on-surface-variant hover:bg-m3-on-surface/10"
                aria-label="Logout of Poetry Suite"
              >
                <LogOut size={18} aria-hidden="true" />
                <span className="hidden xl:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)}></div>
        )}

        <div className={`fixed top-0 left-0 h-full w-72 bg-m3-surface shadow-xl z-50 transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform md:hidden`}>
           <div className="flex items-center justify-between p-4 border-b border-m3-outline/20">
              <h2 className="font-bold text-m3-on-surface">Menu</h2>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg hover:bg-m3-on-surface/10">
                <X size={24} />
              </button>
            </div>
            <nav className="p-4 space-y-1" aria-label="Mobile navigation">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onViewChange(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors text-lg ${
                    currentView === item.id
                      ? 'bg-m3-secondary-container text-m3-on-secondary-container'
                      : 'text-m3-on-surface-variant hover:bg-m3-on-surface/10'
                  }`}
                  aria-label={`Navigate to ${item.label}`}
                  aria-current={currentView === item.id ? 'page' : undefined}
                >
                  <item.icon size={22} aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              ))}
              <div className="border-t border-m3-outline/20 my-2 pt-2">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-m3-on-surface-variant hover:bg-m3-on-surface/10 font-medium text-lg"
                  aria-label="Logout of Poetry Suite"
                >
                  <LogOut size={22} aria-hidden="true" />
                  <span>Logout</span>
                </button>
              </div>
            </nav>
          </div>
      </header>

      <main className="flex-1 bg-m3-background flex" id="main-content" role="main">
        {children}
      </main>
    </div>
  );
}
