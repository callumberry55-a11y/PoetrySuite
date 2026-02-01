import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { AppWindow, Moon, Sun, LogOut, PenLine, Library, Compass, TrendingUp, BookOpen, Lightbulb, Settings, Users, User, Zap, Trophy } from 'lucide-react';

type ViewType = 'write' | 'library' | 'analytics' | 'settings' | 'discover' | 'prompts' | 'forms' | 'profile' | 'feed' | 'workshops' | 'collaborative' | 'challenges' | 'goals' | 'contests';

interface FloatingDockProps {
  onAppDrawerOpen: () => void;
  onViewChange: (view: ViewType) => void;
  currentView: ViewType;
}

const frequentApps: ViewType[] = ['write', 'library', 'feed', 'challenges'];

export default function FloatingDock({ onAppDrawerOpen, onViewChange, currentView }: FloatingDockProps) {
  const { signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-full px-4">
      <div className="flex items-center gap-1 sm:gap-2 bg-surface/95 backdrop-blur-md rounded-full shadow-lg p-2 border border-outline/20">
        <button
          onClick={onAppDrawerOpen}
          className="p-2.5 sm:p-3 rounded-full hover:bg-on-surface/10 active:bg-on-surface/20 text-on-surface-variant transition-colors touch-manipulation"
          aria-label="Open app drawer"
        >
          <AppWindow size={20} className="sm:w-6 sm:h-6" />
        </button>

        <div className="w-px h-6 sm:h-8 bg-outline/50 mx-0.5 sm:mx-1"></div>

        {frequentApps.map(appId => {
          const Icon = {
            write: PenLine,
            library: Library,
            discover: Compass,
            analytics: TrendingUp,
            forms: BookOpen,
            prompts: Lightbulb,
            settings: Settings,
            feed: Users,
            profile: User,
            challenges: Zap,
            contests: Trophy,
          }[appId] || Library;

          return (
            <button
              key={appId}
              onClick={() => onViewChange(appId)}
              className={`p-2.5 sm:p-3 rounded-full transition-colors touch-manipulation ${
                currentView === appId
                  ? 'bg-secondary-container text-on-secondary-container'
                  : 'hover:bg-on-surface/10 text-on-surface-variant active:bg-on-surface/20'
              }`}
              aria-label={`Open ${appId}`}
            >
              <Icon size={20} className="sm:w-6 sm:h-6" />
            </button>
          );
        })}

        <div className="w-px h-6 sm:h-8 bg-outline/50 mx-0.5 sm:mx-1"></div>

        <button
          onClick={toggleTheme}
          className="p-2.5 sm:p-3 rounded-full hover:bg-on-surface/10 active:bg-on-surface/20 text-on-surface-variant transition-colors touch-manipulation"
          aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
          {isDark ? <Sun size={20} className="sm:w-6 sm:h-6" /> : <Moon size={20} className="sm:w-6 sm:h-6" />}
        </button>
        <button
          onClick={signOut}
          className="p-2.5 sm:p-3 rounded-full hover:bg-on-surface/10 active:bg-on-surface/20 text-on-surface-variant transition-colors touch-manipulation"
          aria-label="Logout"
        >
          <LogOut size={20} className="sm:w-6 sm:h-6" />
        </button>
      </div>
    </div>
  );
}
