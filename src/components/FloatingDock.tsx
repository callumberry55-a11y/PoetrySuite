import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { AppWindow, Moon, Sun, LogOut, PenLine, Library, Compass, TrendingUp, BookOpen, Lightbulb, Settings, Users, User, Zap, Trophy, Target, UsersRound, GraduationCap, Award, ShoppingBag, Shield, Landmark, Home, BookHeart, FolderOpen, Sparkles, Calendar, LibraryBig, Heart, UserPlus, MessageSquare, Book, BookMarked, Flame, Timer } from 'lucide-react';
import { ViewType } from '../types';

interface FloatingDockProps {
  onAppDrawerOpen: () => void;
  onViewChange: (view: ViewType) => void;
  currentView: ViewType;
}

const frequentApps: ViewType[] = ['dashboard', 'write', 'library', 'feed', 'challenges'];

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
            dashboard: Home,
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
            goals: Target,
            workshops: GraduationCap,
            collaborative: UsersRound,
            badges: Award,
            store: ShoppingBag,
            'paas-admin': Shield,
            'points-bank': Landmark,
            'book-clubs': BookHeart,
            collections: FolderOpen,
            'daily-prompts': Sparkles,
            'events-calendar': Calendar,
            'famous-poems': LibraryBig,
            favorites: Heart,
            following: UserPlus,
            forums: MessageSquare,
            glossary: Book,
            'reading-lists': BookMarked,
            'study-groups': GraduationCap,
            'writing-streaks': Flame,
            'writing-timer': Timer,
            'writing-tips': Lightbulb,
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
