import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { AppWindow, Moon, Sun, LogOut, PenLine, Library, Compass, TrendingUp, BookOpen, Lightbulb, Settings, Users, User, Zap, Trophy, Target, UsersRound, GraduationCap, Award, ShoppingBag, Shield, Landmark, UserPlus, ListChecks, BookMarked, Feather, Pencil, MessageSquare, FolderHeart, Heart, Timer, Wrench, Download, FileText, BookCopy, Shuffle, Gamepad2, RefreshCw, UserCheck, MessageCircle, Mic, Grid3x3, Focus, BarChart3, Tag, Calendar as CalendarIcon } from 'lucide-react';
import { ViewType } from './Layout';

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
    <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-full px-2 sm:px-4 slide-up">
      <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 bg-surface/95 backdrop-blur-md rounded-full shadow-xl p-2 sm:p-2.5 lg:p-3 border border-outline/20 hover:shadow-2xl transition-shadow duration-300">
        <button
          onClick={onAppDrawerOpen}
          className="p-3 sm:p-3.5 lg:p-4 rounded-full hover:bg-on-surface/10 active:bg-on-surface/20 text-on-surface-variant transition-all duration-300 touch-manipulation hover:scale-110 hover:rotate-12 group min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Open app drawer"
        >
          <AppWindow size={20} className="sm:w-6 sm:h-6 lg:w-7 lg:h-7 group-hover:scale-110 transition-transform duration-300" />
        </button>

        <div className="w-px h-6 sm:h-8 lg:h-10 bg-outline/50 mx-0.5 sm:mx-1"></div>

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
            goals: Target,
            workshops: GraduationCap,
            collaborative: UsersRound,
            badges: Award,
            store: ShoppingBag,
            'paas-admin': Shield,
            'points-bank': Landmark,
            following: UserPlus,
            'reading-lists': ListChecks,
            glossary: BookMarked,
            'famous-poems': Feather,
            'writing-tips': Pencil,
            'daily-prompts': Lightbulb,
            'book-clubs': GraduationCap,
            'study-groups': UsersRound,
            'writing-streaks': Zap,
            forums: MessageSquare,
            collections: FolderHeart,
            favorites: Heart,
            quizzes: BookOpen,
            'writing-timer': Timer,
            'writing-tools': Wrench,
            'export-tools': Download,
            'manuscript-manager': BookCopy,
            'poetry-journal': FileText,
            'prompt-roulette': Shuffle,
            'word-games': Gamepad2,
            'poetry-swaps': RefreshCw,
            'writing-buddies': UserCheck,
            'critique-circles': MessageCircle,
            'public-readings': Mic,
            'poetry-bingo': Grid3x3,
            'focus-mode': Focus,
            'writing-statistics': BarChart3,
            'daily-word-goals': Target,
            'form-challenges': Zap,
            'tags-manager': Tag,
            'writing-calendar': CalendarIcon,
          }[appId] || Library;

          return (
            <button
              key={appId}
              onClick={() => onViewChange(appId)}
              className={`p-3 sm:p-3.5 lg:p-4 rounded-full transition-all duration-300 touch-manipulation group relative min-w-[44px] min-h-[44px] flex items-center justify-center ${
                currentView === appId
                  ? 'bg-secondary-container text-on-secondary-container shadow-md scale-110'
                  : 'hover:bg-on-surface/10 text-on-surface-variant active:bg-on-surface/20 hover:scale-110 hover:-translate-y-1'
              }`}
              aria-label={`Open ${appId}`}
            >
              <Icon size={20} className={`sm:w-6 sm:h-6 lg:w-7 lg:h-7 transition-transform duration-300 ${currentView === appId ? 'scale-110' : 'group-hover:scale-110'}`} />
              {currentView === appId && (
                <span className="absolute -bottom-1 sm:-bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-secondary rounded-full"></span>
              )}
            </button>
          );
        })}

        <div className="w-px h-6 sm:h-8 lg:h-10 bg-outline/50 mx-0.5 sm:mx-1"></div>

        <button
          onClick={toggleTheme}
          className="p-3 sm:p-3.5 lg:p-4 rounded-full hover:bg-on-surface/10 active:bg-on-surface/20 text-on-surface-variant transition-all duration-300 touch-manipulation hover:scale-110 hover:rotate-180 group min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
          {isDark ? <Sun size={20} className="sm:w-6 sm:h-6 lg:w-7 lg:h-7 group-hover:scale-110 transition-transform duration-300" /> : <Moon size={20} className="sm:w-6 sm:h-6 lg:w-7 lg:h-7 group-hover:scale-110 transition-transform duration-300" />}
        </button>
        <button
          onClick={signOut}
          className="p-3 sm:p-3.5 lg:p-4 rounded-full hover:bg-error-container/50 active:bg-error-container/70 text-on-surface-variant hover:text-error transition-all duration-300 touch-manipulation hover:scale-110 group min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Logout"
        >
          <LogOut size={20} className="sm:w-6 sm:h-6 lg:w-7 lg:h-7 group-hover:scale-110 group-hover:translate-x-0.5 transition-transform duration-300" />
        </button>
      </div>
    </div>
  );
}
