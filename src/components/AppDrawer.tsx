import { BookHeart, PenLine, Library, BarChart3, Settings, Compass, Lightbulb, BookOpen, X, User, Users, UsersRound, Zap, Target, Trophy, Award, ShoppingBag, Shield, Landmark, UserPlus, BookMarked, Book, LibraryBig, Sparkles, GraduationCap, Flame, Calendar, MessageSquare, FolderOpen, Heart, Timer, Home } from 'lucide-react';
import { ViewType } from '../types';

interface AppDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onViewChange: (view: ViewType) => void;
  currentView: ViewType;
}

const navItems = [
  { id: 'dashboard' as const, icon: Home, label: 'Dashboard' },
  { id: 'write' as const, icon: PenLine, label: 'Write' },
  { id: 'writing-timer' as const, icon: Timer, label: 'Writing Timer' },
  { id: 'library' as const, icon: Library, label: 'Library' },
  { id: 'collections' as const, icon: FolderOpen, label: 'Collections' },
  { id: 'favorites' as const, icon: Heart, label: 'Favorites' },
  { id: 'discover' as const, icon: Compass, label: 'AI Hub' },
  { id: 'feed' as const, icon: Users, label: 'Social Feed' },
  { id: 'following' as const, icon: UserPlus, label: 'Community' },
  { id: 'book-clubs' as const, icon: BookHeart, label: 'Book Clubs' },
  { id: 'study-groups' as const, icon: GraduationCap, label: 'Study Groups' },
  { id: 'forums' as const, icon: MessageSquare, label: 'Forums' },
  { id: 'events-calendar' as const, icon: Calendar, label: 'Events' },
  { id: 'reading-lists' as const, icon: BookMarked, label: 'Reading Lists' },
  { id: 'writing-streaks' as const, icon: Flame, label: 'Streaks' },
  { id: 'prompts' as const, icon: Lightbulb, label: 'Prompts' },
  { id: 'daily-prompts' as const, icon: Sparkles, label: 'Daily Prompts' },
  { id: 'challenges' as const, icon: Zap, label: 'Challenges' },
  { id: 'contests' as const, icon: Trophy, label: 'Contests' },
  { id: 'badges' as const, icon: Award, label: 'Badges' },
  { id: 'store' as const, icon: ShoppingBag, label: 'Store' },
  { id: 'points-bank' as const, icon: Landmark, label: 'Points Bank' },
  { id: 'workshops' as const, icon: UsersRound, label: 'Workshops' },
  { id: 'collaborative' as const, icon: Users, label: 'Collaborative' },
  { id: 'goals' as const, icon: Target, label: 'Goals' },
  { id: 'forms' as const, icon: BookOpen, label: 'Forms' },
  { id: 'glossary' as const, icon: Book, label: 'Glossary' },
  { id: 'famous-poems' as const, icon: LibraryBig, label: 'Famous Poems' },
  { id: 'writing-tips' as const, icon: Lightbulb, label: 'Writing Tips' },
  { id: 'analytics' as const, icon: BarChart3, label: 'Analytics' },
  { id: 'profile' as const, icon: User, label: 'Profile' },
  { id: 'paas-admin' as const, icon: Shield, label: 'PaaS Admin' },
  { id: 'settings' as const, icon: Settings, label: 'Settings' },
];

export default function AppDrawer({ isOpen, onClose, onViewChange, currentView }: AppDrawerProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" 
      onClick={onClose}
    >
      <div 
        className="bg-surface rounded-2xl shadow-2xl w-[90vw] max-w-4xl h-[80vh] max-h-[600px] p-6 flex flex-col" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center" aria-hidden="true">
              <BookHeart size={20} className="text-on-primary" />
            </div>
            <h1 className="text-xl font-bold text-on-surface">Poetry Suite</h1>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-on-surface/10 text-on-surface-variant">
            <X size={24} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto pr-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onViewChange(item.id);
                  onClose();
                }}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg transition-colors aspect-square ${
                  currentView === item.id
                    ? 'bg-secondary-container text-on-secondary-container'
                    : 'bg-surface-variant/50 hover:bg-surface-variant text-on-surface'
                }`}
              >
                <item.icon size={32} />
                <span className="text-sm font-medium text-center">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
