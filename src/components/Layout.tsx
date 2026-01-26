import { ReactNode, useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
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
  Sparkles
} from 'lucide-react';

type ViewType = 'write' | 'library' | 'analytics' | 'settings' | 'discover' | 'prompts' | 'forms' | 'submissions' | 'ai-chat';

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
  const { signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  const navItems = [
    { id: 'write' as const, icon: PenLine, label: 'Write' },
    { id: 'library' as const, icon: Library, label: 'Library' },
    { id: 'ai-chat' as const, icon: Sparkles, label: 'AI Chat' },
    { id: 'discover' as const, icon: Compass, label: 'Discover' },
    { id: 'prompts' as const, icon: Lightbulb, label: 'Prompts' },
    { id: 'forms' as const, icon: BookOpen, label: 'Forms' },
    { id: 'submissions' as const, icon: Send, label: 'Submissions' },
    { id: 'analytics' as const, icon: BarChart3, label: 'Analytics' },
    { id: 'settings' as const, icon: Settings, label: 'Settings' },
  ];

  useEffect(() => {
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
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

  const handleSignOut = async () => {
    await signOut();
  };

  const primaryNavItems = navItems.filter(item =>
    ['write', 'library', 'ai-chat', 'discover', 'prompts'].includes(item.id)
  );

  const secondaryNavItems = navItems.filter(item =>
    !['write', 'library', 'ai-chat', 'discover', 'prompts'].includes(item.id)
  );

  return (
    <div className="min-h-screen bg-m3-background flex flex-col pb-16 md:pb-0">
      <a
        href="#main-content"
        className="skip-link bg-m3-primary text-m3-on-primary px-4 py-2 rounded-lg font-medium shadow-lg"
      >
        Skip to main content
      </a>
      {showInstallPrompt && localStorage.getItem('installPromptDismissed') !== 'true' && (
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
              <div className="w-10 h-10 rounded-full bg-m3-primary flex items-center justify-center" aria-hidden="true">
                <BookHeart size={20} className="text-m3-on-primary" />
              </div>
              <h1 className="text-xl font-bold text-m3-on-surface">
                Poetry Suite
              </h1>
            </div>

            <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
              {navItems.map((item) => (
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
            </nav>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-m3-on-surface/10 text-m3-on-surface-variant"
                aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              >
                {isDark ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}
              </button>
              <button
                onClick={handleSignOut}
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg text-m3-on-surface-variant hover:bg-m3-on-surface/10"
                aria-label="Logout of Poetry Suite"
              >
                <LogOut size={18} aria-hidden="true" />
                <span>Logout</span>
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-m3-on-surface/10 text-m3-on-surface-variant"
                aria-label={mobileMenuOpen ? 'Close mobile menu' : 'Open mobile menu'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-m3-outline/20 bg-m3-surface max-h-[calc(100vh-4rem)] overflow-y-auto">
            <nav className="px-4 py-2 space-y-1" aria-label="Mobile navigation">
              <div className="text-xs font-semibold text-m3-on-surface-variant/80 uppercase tracking-wider px-4 py-2">
                More
              </div>
              {secondaryNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onViewChange(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                    currentView === item.id
                      ? 'bg-m3-secondary-container text-m3-on-secondary-container'
                      : 'text-m3-on-surface-variant hover:bg-m3-on-surface/10'
                  }`}
                  aria-label={`Navigate to ${item.label}`}
                  aria-current={currentView === item.id ? 'page' : undefined}
                >
                  <item.icon size={20} aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              ))}
              <div className="border-t border-m3-outline/20 my-2"></div>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-m3-on-surface-variant hover:bg-m3-on-surface/10 font-medium"
                aria-label="Logout of Poetry Suite"
              >
                <LogOut size={20} aria-hidden="true" />
                <span>Logout</span>
              </button>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1 bg-m3-background" id="main-content" role="main">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 bg-m3-surface border-t border-m3-outline/20 z-50"
        aria-label="Mobile bottom navigation"
      >
        <div className="grid grid-cols-5 gap-1 px-2 py-2">
          {primaryNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-lg transition-colors ${
                currentView === item.id
                  ? 'bg-m3-secondary-container text-m3-on-secondary-container'
                  : 'text-m3-on-surface-variant'
              }`}
              aria-label={`Navigate to ${item.label}`}
              aria-current={currentView === item.id ? 'page' : undefined}
            >
              <item.icon size={22} aria-hidden="true" strokeWidth={currentView === item.id ? 2.5 : 2} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
