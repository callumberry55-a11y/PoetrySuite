import { BookHeart, PenLine, Library, BarChart3, Settings, Compass, Lightbulb, BookOpen, X, User, Users, UsersRound, Zap, Target, Trophy, Award, ShoppingBag, Shield, Landmark, UserPlus, BookMarked, Book, LibraryBig, Sparkles, GraduationCap, Flame, MessageSquare, FolderOpen, Heart, Timer, Brain, Wrench, Download, BookCopy, FileText, Shuffle, Gamepad2, RefreshCw, UserCheck, MessageCircle, Mic, Grid3x3, Focus, Tag, Calendar as CalendarIcon } from 'lucide-react';

type ViewType = 'write' | 'library' | 'analytics' | 'settings' | 'discover' | 'prompts' | 'forms' | 'profile' | 'feed' | 'workshops' | 'collaborative' | 'challenges' | 'goals' | 'contests' | 'badges' | 'store' | 'paas-admin' | 'points-bank' | 'following' | 'reading-lists' | 'glossary' | 'famous-poems' | 'writing-tips' | 'daily-prompts' | 'book-clubs' | 'study-groups' | 'writing-streaks' | 'forums' | 'collections' | 'favorites' | 'writing-timer' | 'quizzes' | 'writing-tools' | 'export-tools' | 'manuscript-manager' | 'poetry-journal' | 'prompt-roulette' | 'word-games' | 'poetry-swaps' | 'writing-buddies' | 'critique-circles' | 'public-readings' | 'poetry-bingo' | 'focus-mode' | 'writing-statistics' | 'daily-word-goals' | 'form-challenges' | 'tags-manager' | 'writing-calendar';

interface AppDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onViewChange: (view: ViewType) => void;
  currentView: ViewType;
}

const navSections = [
  {
    title: 'Writing',
    items: [
      { id: 'write' as const, icon: PenLine, label: 'Write', color: 'text-blue-500' },
      { id: 'focus-mode' as const, icon: Focus, label: 'Focus Mode', color: 'text-indigo-500' },
      { id: 'writing-timer' as const, icon: Timer, label: 'Timer', color: 'text-orange-500' },
      { id: 'library' as const, icon: Library, label: 'Library', color: 'text-emerald-500' },
      { id: 'collections' as const, icon: FolderOpen, label: 'Collections', color: 'text-cyan-500' },
      { id: 'favorites' as const, icon: Heart, label: 'Favorites', color: 'text-rose-500' },
      { id: 'poetry-journal' as const, icon: FileText, label: 'Journal', color: 'text-yellow-500' },
      { id: 'manuscript-manager' as const, icon: BookCopy, label: 'Manuscripts', color: 'text-purple-500' },
      { id: 'tags-manager' as const, icon: Tag, label: 'Tags', color: 'text-pink-500' },
    ]
  },
  {
    title: 'Community',
    items: [
      { id: 'feed' as const, icon: Users, label: 'Social Feed', color: 'text-violet-500' },
      { id: 'following' as const, icon: UserPlus, label: 'Community', color: 'text-pink-500' },
      { id: 'writing-buddies' as const, icon: UserCheck, label: 'Writing Buddies', color: 'text-blue-500' },
      { id: 'critique-circles' as const, icon: MessageCircle, label: 'Critique Circles', color: 'text-green-500' },
      { id: 'poetry-swaps' as const, icon: RefreshCw, label: 'Poetry Swaps', color: 'text-cyan-500' },
      { id: 'public-readings' as const, icon: Mic, label: 'Public Readings', color: 'text-purple-500' },
      { id: 'book-clubs' as const, icon: BookHeart, label: 'Book Clubs', color: 'text-fuchsia-500' },
      { id: 'study-groups' as const, icon: GraduationCap, label: 'Study Groups', color: 'text-amber-500' },
      { id: 'forums' as const, icon: MessageSquare, label: 'Forums', color: 'text-teal-500' },
      { id: 'workshops' as const, icon: UsersRound, label: 'Workshops', color: 'text-lime-500' },
      { id: 'collaborative' as const, icon: Users, label: 'Collaborative', color: 'text-sky-500' },
    ]
  },
  {
    title: 'Tools',
    items: [
      { id: 'writing-tools' as const, icon: Wrench, label: 'Writing Tools', color: 'text-blue-500' },
      { id: 'export-tools' as const, icon: Download, label: 'Export', color: 'text-orange-500' },
      { id: 'writing-statistics' as const, icon: BarChart3, label: 'Statistics', color: 'text-green-500' },
      { id: 'writing-calendar' as const, icon: CalendarIcon, label: 'Calendar', color: 'text-purple-500' },
    ]
  },
  {
    title: 'Learning',
    items: [
      { id: 'discover' as const, icon: Compass, label: 'AI Hub', color: 'text-cyan-500' },
      { id: 'quizzes' as const, icon: Brain, label: 'Quizzes', color: 'text-purple-500' },
      { id: 'reading-lists' as const, icon: BookMarked, label: 'Reading Lists', color: 'text-emerald-500' },
      { id: 'glossary' as const, icon: Book, label: 'Glossary', color: 'text-blue-500' },
      { id: 'famous-poems' as const, icon: LibraryBig, label: 'Famous Poems', color: 'text-amber-500' },
      { id: 'writing-tips' as const, icon: Lightbulb, label: 'Writing Tips', color: 'text-yellow-500' },
      { id: 'forms' as const, icon: BookOpen, label: 'Forms', color: 'text-teal-500' },
    ]
  },
  {
    title: 'Motivation',
    items: [
      { id: 'prompts' as const, icon: Lightbulb, label: 'Prompts', color: 'text-yellow-500' },
      { id: 'daily-prompts' as const, icon: Sparkles, label: 'Daily Prompts', color: 'text-pink-500' },
      { id: 'prompt-roulette' as const, icon: Shuffle, label: 'Prompt Roulette', color: 'text-purple-500' },
      { id: 'writing-streaks' as const, icon: Flame, label: 'Streaks', color: 'text-orange-500' },
      { id: 'challenges' as const, icon: Zap, label: 'Challenges', color: 'text-yellow-500' },
      { id: 'form-challenges' as const, icon: Zap, label: 'Form Challenges', color: 'text-red-500' },
      { id: 'goals' as const, icon: Target, label: 'Goals', color: 'text-green-500' },
      { id: 'daily-word-goals' as const, icon: Target, label: 'Word Goals', color: 'text-blue-500' },
    ]
  },
  {
    title: 'Games',
    items: [
      { id: 'word-games' as const, icon: Gamepad2, label: 'Word Games', color: 'text-blue-500' },
      { id: 'poetry-bingo' as const, icon: Grid3x3, label: 'Poetry Bingo', color: 'text-green-500' },
    ]
  },
  {
    title: 'Rewards',
    items: [
      { id: 'contests' as const, icon: Trophy, label: 'Contests', color: 'text-amber-500' },
      { id: 'badges' as const, icon: Award, label: 'Badges', color: 'text-blue-500' },
      { id: 'store' as const, icon: ShoppingBag, label: 'Store', color: 'text-pink-500' },
      { id: 'points-bank' as const, icon: Landmark, label: 'Points Bank', color: 'text-emerald-500' },
    ]
  },
  {
    title: 'Account',
    items: [
      { id: 'profile' as const, icon: User, label: 'Profile', color: 'text-blue-500' },
      { id: 'analytics' as const, icon: BarChart3, label: 'Analytics', color: 'text-violet-500' },
      { id: 'settings' as const, icon: Settings, label: 'Settings', color: 'text-gray-500' },
      { id: 'paas-admin' as const, icon: Shield, label: 'PaaS Admin', color: 'text-red-500' },
    ]
  }
];

export default function AppDrawer({ isOpen, onClose, onViewChange, currentView }: AppDrawerProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center fade-in backdrop-blur-md p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface/70 dark:bg-surface/50 backdrop-blur-2xl rounded-3xl shadow-2xl w-full max-w-[95vw] sm:max-w-5xl lg:max-w-6xl h-[90vh] sm:h-[85vh] max-h-[800px] p-4 sm:p-6 lg:p-8 flex flex-col scale-in border border-white/10 dark:border-white/5 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none"></div>

        <div className="flex items-center justify-between mb-4 sm:mb-6 relative z-10">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 hover:rotate-12 cursor-pointer backdrop-blur-sm" aria-hidden="true">
              <BookHeart size={20} className="sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-on-surface">Poetry Suite</h1>
              <p className="text-xs text-on-surface-variant hidden sm:block">Explore all features</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 sm:p-3 rounded-xl hover:bg-on-surface/10 dark:hover:bg-white/10 text-on-surface-variant transition-all duration-300 hover:scale-110 hover:rotate-90 group backdrop-blur-sm"
            aria-label="Close app drawer"
          >
            <X size={24} className="group-hover:scale-110 transition-transform duration-300" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 hide-scrollbar relative z-10">
          <div className="space-y-6 sm:space-y-8">
            {navSections.map((section, sectionIndex) => (
              <div
                key={section.title}
                className="fade-in"
                style={{ animationDelay: `${sectionIndex * 0.1}s` }}
              >
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-outline/30 to-transparent"></div>
                  <h2 className="text-xs sm:text-sm font-semibold text-on-surface-variant uppercase tracking-wider px-2">
                    {section.title}
                  </h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-outline/30 to-transparent"></div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
                  {section.items.map((item, index) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        onViewChange(item.id);
                        onClose();
                      }}
                      className={`flex flex-col items-center justify-center gap-2 sm:gap-2.5 p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-all duration-300 aspect-square group relative overflow-hidden min-w-0 ${
                        currentView === item.id
                          ? 'bg-primary/20 dark:bg-primary/30 backdrop-blur-xl shadow-lg scale-105 border border-primary/30'
                          : 'bg-white/40 dark:bg-white/5 backdrop-blur-xl hover:bg-white/60 dark:hover:bg-white/10 hover:shadow-lg hover:scale-105 hover:-translate-y-1 active:scale-95 border border-white/20 dark:border-white/10'
                      }`}
                      style={{ animationDelay: `${(sectionIndex * 0.1) + (index * 0.02)}s` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:from-white/10 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      <item.icon
                        size={28}
                        className={`sm:w-8 sm:h-8 transition-all duration-300 flex-shrink-0 relative z-10 ${
                          currentView === item.id
                            ? `${item.color} scale-110`
                            : `text-on-surface group-hover:scale-110 group-hover:rotate-6 ${item.color}`
                        }`}
                      />

                      <span className={`text-xs sm:text-sm font-medium text-center relative z-10 line-clamp-2 w-full px-1 transition-colors duration-300 ${
                        currentView === item.id
                          ? 'text-on-surface'
                          : 'text-on-surface-variant group-hover:text-on-surface'
                      }`}>
                        {item.label}
                      </span>

                      {currentView === item.id && (
                        <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full shadow-lg animate-pulse"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/10 dark:border-white/5 relative z-10">
          <p className="text-xs text-on-surface-variant text-center">
            {navSections.reduce((total, section) => total + section.items.length, 0)} features available
          </p>
        </div>
      </div>
    </div>
  );
}
