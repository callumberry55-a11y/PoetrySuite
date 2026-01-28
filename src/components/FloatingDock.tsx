import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { AppWindow, Moon, Sun, LogOut, PenLine, Library, Compass, TrendingUp, BookOpen, Lightbulb, Settings } from 'lucide-react';

type ViewType = 'write' | 'library' | 'analytics' | 'settings' | 'discover' | 'prompts' | 'forms';

interface FloatingDockProps {
  onAppDrawerOpen: () => void;
  onViewChange: (view: ViewType) => void;
  currentView: ViewType;
}

const frequentApps: ViewType[] = ['write', 'library'];

export default function FloatingDock({ onAppDrawerOpen, onViewChange, currentView }: FloatingDockProps) {
  const { signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-full overflow-x-auto hide-scrollbar">
      <div className="flex items-center gap-2 bg-surface/80 backdrop-blur-md rounded-full shadow-lg p-2 border border-outline/20">
        <button
          onClick={onAppDrawerOpen}
          className="p-3 rounded-full hover:bg-on-surface/10 text-on-surface-variant transition-colors"
          aria-label="Open app drawer"
        >
          <AppWindow size={24} />
        </button>

        <div className="w-px h-8 bg-outline/50 mx-1"></div>

        {frequentApps.map(appId => {
          const Icon = {
            write: PenLine,
            library: Library,
            discover: Compass,
            analytics: TrendingUp,
            forms: BookOpen,
            prompts: Lightbulb,
            settings: Settings,
          }[appId];

          return (
            <button
              key={appId}
              onClick={() => onViewChange(appId)}
              className={`p-3 rounded-full transition-colors ${
                currentView === appId
                  ? 'bg-secondary-container text-on-secondary-container'
                  : 'hover:bg-on-surface/10 text-on-surface-variant'
              }`}
              aria-label={`Open ${appId}`}
            >
              <Icon size={24} />
            </button>
          );
        })}

        <div className="w-px h-8 bg-outline/50 mx-1"></div>

        <button
          onClick={toggleTheme}
          className="p-3 rounded-full hover:bg-on-surface/10 text-on-surface-variant transition-colors"
          aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
          {isDark ? <Sun size={24} /> : <Moon size={24} />}
        </button>
        <button
          onClick={signOut}
          className="p-3 rounded-full hover:bg-on-surface/10 text-on-surface-variant transition-colors"
          aria-label="Logout"
        >
          <LogOut size={24} />
        </button>
      </div>
    </div>
  );
}
