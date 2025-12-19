import { ReactNode, useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
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
  MessageCircle,
  Sparkles
} from 'lucide-react';

type ViewType = 'write' | 'library' | 'analytics' | 'settings' | 'discover' | 'prompts' | 'forms' | 'submissions' | 'chat' | 'beta';

interface LayoutProps {
  children: ReactNode;
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export default function Layout({ children, currentView, onViewChange }: LayoutProps) {
  const { signOut, user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isBetaTester, setIsBetaTester] = useState(false);

  const navItems = [
    { id: 'write' as const, icon: PenLine, label: 'Write' },
    { id: 'library' as const, icon: Library, label: 'Library' },
    { id: 'discover' as const, icon: Compass, label: 'Discover' },
    { id: 'chat' as const, icon: MessageCircle, label: 'Chat' },
    { id: 'prompts' as const, icon: Lightbulb, label: 'Prompts' },
    { id: 'forms' as const, icon: BookOpen, label: 'Forms' },
    { id: 'submissions' as const, icon: Send, label: 'Submissions' },
    { id: 'analytics' as const, icon: BarChart3, label: 'Analytics' },
    ...(isBetaTester ? [{ id: 'beta' as const, icon: Sparkles, label: 'Beta' }] : []),
    { id: 'settings' as const, icon: Settings, label: 'Settings' },
  ];

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  useEffect(() => {
    checkBetaStatus();
  }, [user]);

  const checkBetaStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('is_beta_tester')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setIsBetaTester(data?.is_beta_tester || false);
    } catch (error) {
      console.error('Error checking beta status:', error);
    }
  };

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
    ['write', 'library', 'discover', 'chat'].includes(item.id)
  );

  const secondaryNavItems = navItems.filter(item =>
    !['write', 'library', 'discover', 'chat'].includes(item.id)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[rgb(var(--bg-primary))] to-[rgb(var(--bg-secondary))] flex flex-col pb-16 md:pb-0">
      <a
        href="#main-content"
        className="skip-link bg-blue-600 text-white px-4 py-2 rounded-lg font-medium shadow-lg"
      >
        Skip to main content
      </a>
      {showInstallPrompt && localStorage.getItem('installPromptDismissed') !== 'true' && (
        <aside className="glass-strong text-slate-900 dark:text-white px-4 py-3 shadow-lg" role="banner" aria-label="Install app banner">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Download size={20} className="flex-shrink-0" aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base font-medium">Install Poetry Suite</p>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 hidden sm:block">Get quick access and offline support</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleInstallClick}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors text-sm whitespace-nowrap"
                aria-label="Install Poetry Suite app"
              >
                Install
              </button>
              <button
                onClick={handleDismissInstall}
                className="p-1.5 sm:p-2 hover:bg-blue-600/50 rounded-lg transition-colors"
                aria-label="Dismiss install banner"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
          </div>
        </aside>
      )}

      <header className="glass-strong sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center" aria-hidden="true">
                <BookHeart size={20} className="text-white" />
              </div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  Poetry Suite
                </h1>
                {isBetaTester && (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-md text-xs font-medium">
                    <Sparkles size={12} />
                    Beta
                  </span>
                )}
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                    currentView === item.id
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
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
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
                aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              >
                {isDark ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}
              </button>
              <button
                onClick={handleSignOut}
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                aria-label="Logout of Poetry Suite"
              >
                <LogOut size={18} aria-hidden="true" />
                <span>Logout</span>
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
                aria-label={mobileMenuOpen ? 'Close mobile menu' : 'Open mobile menu'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden glass-strong max-h-[calc(100vh-4rem)] overflow-y-auto">
            <nav className="px-4 py-2 space-y-1" aria-label="Mobile navigation">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-4 py-2">
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
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                  aria-label={`Navigate to ${item.label}`}
                  aria-current={currentView === item.id ? 'page' : undefined}
                >
                  <item.icon size={20} aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              ))}
              <div className="border-t border-slate-200 dark:border-slate-700 my-2"></div>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium"
                aria-label="Logout of Poetry Suite"
              >
                <LogOut size={20} aria-hidden="true" />
                <span>Logout</span>
              </button>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1" id="main-content" role="main">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 glass-strong shadow-lg z-50"
        aria-label="Mobile bottom navigation"
      >
        <div className="grid grid-cols-4 gap-1 px-2 py-2">
          {primaryNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-colors ${
                currentView === item.id
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400'
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
