import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  Target, Plus, TrendingUp, CheckCircle, Award, Lock,
  Trophy, Star, Zap, Flame, Heart, BookOpen, Feather,
  PenTool, Sparkles, Crown, Medal, Flag, Rocket
} from 'lucide-react';

interface Goal {
  id: string;
  goal_type: string;
  target_value: number;
  current_value: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'failed';
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement_type: string;
  requirement_value: number;
  earned: boolean;
  earned_at?: string;
}

export default function Goals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'goals' | 'badges'>('goals');
  const [newGoal, setNewGoal] = useState({
    goal_type: 'weekly_poems',
    target_value: 3
  });

  const loadGoals = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('writing_goals')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['active', 'completed'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading goals:', error);
      return;
    }

    setGoals(data || []);
  }, [user]);

  const loadBadges = useCallback(async () => {
    if (!user) return;

    const { data: allBadges, error: badgesError } = await supabase
      .from('badges')
      .select('*')
      .order('requirement_value', { ascending: true });

    if (badgesError) {
      console.error('Error loading badges:', badgesError);
      return;
    }

    const { data: earnedBadges, error: earnedError } = await supabase
      .from('user_badges')
      .select('badge_id, earned_at')
      .eq('user_id', user.id);

    if (earnedError) {
      console.error('Error loading earned badges:', earnedError);
    }

    const earnedBadgeIds = new Set(earnedBadges?.map(b => b.badge_id) || []);
    const earnedBadgesMap = new Map(earnedBadges?.map(b => [b.badge_id, b.earned_at]) || []);

    const badgesWithStatus = (allBadges || []).map(badge => ({
      ...badge,
      earned: earnedBadgeIds.has(badge.id),
      earned_at: earnedBadgesMap.get(badge.id)
    }));

    setBadges(badgesWithStatus);
  }, [user]);

  useEffect(() => {
    if (user) {
      loadGoals();
      loadBadges();
    }
  }, [user, loadGoals, loadBadges]);

  const createGoal = async () => {
    if (!user) return;

    const now = new Date();
    const endDate = new Date(now);
    if (newGoal.goal_type.includes('weekly')) {
      endDate.setDate(endDate.getDate() + 7);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    const { error } = await supabase
      .from('writing_goals')
      .insert([{
        user_id: user.id,
        goal_type: newGoal.goal_type,
        target_value: newGoal.target_value,
        current_value: 0,
        start_date: now.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        status: 'active'
      }]);

    if (error) {
      console.error('Error creating goal:', error);
      alert('Failed to create goal');
      return;
    }

    setShowCreateForm(false);
    setNewGoal({ goal_type: 'weekly_poems', target_value: 3 });
    loadGoals();
  };

  const getProgressPercentage = (goal: Goal) => {
    return Math.min((goal.current_value / goal.target_value) * 100, 100);
  };

  const formatGoalType = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getBadgeIcon = (iconName: string) => {
    const iconMap: Record<string, typeof Award> = {
      'trophy': Trophy,
      'star': Star,
      'zap': Zap,
      'flame': Flame,
      'heart': Heart,
      'book-open': BookOpen,
      'feather': Feather,
      'pen-tool': PenTool,
      'sparkles': Sparkles,
      'crown': Crown,
      'medal': Medal,
      'flag': Flag,
      'rocket': Rocket,
      'award': Award
    };

    return iconMap[iconName.toLowerCase()] || Award;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pb-24">
      <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 h-32 sm:h-40">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <Target className="w-10 h-10 sm:w-12 sm:h-12 mb-2 animate-pulse" />
          <h1 className="text-2xl sm:text-4xl font-bold mb-1">Goals & Achievements</h1>
          <p className="text-sm sm:text-base opacity-90">Track your progress and earn rewards</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-8 space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('goals')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === 'goals'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg scale-105'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Target size={20} />
                Goals
              </button>
              <button
                onClick={() => setActiveTab('badges')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === 'badges'
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-lg scale-105'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Award size={20} />
                Badges ({badges.filter(b => b.earned).length}/{badges.length})
              </button>
            </div>

            {activeTab === 'goals' && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Plus size={20} />
                New Goal
              </button>
            )}
          </div>

          {showCreateForm && (
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border-2 border-emerald-200 dark:border-emerald-800 p-6 space-y-4 animate-in slide-in-from-top duration-300">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Target className="text-emerald-600 dark:text-emerald-400" size={24} />
                Create New Goal
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Goal Type
                  </label>
                  <select
                    value={newGoal.goal_type}
                    onChange={(e) => setNewGoal({ ...newGoal, goal_type: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  >
                    <option value="weekly_poems">Weekly Poems</option>
                    <option value="monthly_poems">Monthly Poems</option>
                    <option value="word_count">Total Word Count</option>
                    <option value="daily_writing">Daily Writing Streak</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Target
                  </label>
                  <input
                    type="number"
                    value={newGoal.target_value}
                    onChange={(e) => setNewGoal({ ...newGoal, target_value: parseInt(e.target.value) })}
                    min="1"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={createGoal}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    Create Goal
                  </button>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="px-6 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-semibold transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {activeTab === 'goals' ? (
          <div className="space-y-6">
            {goals.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg">
                <Target className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-700" />
                <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">No goals yet. Create one to get started!</p>
              </div>
            ) : (
              goals.map((goal) => (
                <div
                  key={goal.id}
                  className="group bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-800 p-6 sm:p-8 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl shadow-lg">
                          <Target className="text-white" size={24} />
                        </div>
                        {formatGoalType(goal.goal_type)}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                        {new Date(goal.start_date).toLocaleDateString()} - {new Date(goal.end_date).toLocaleDateString()}
                      </p>
                    </div>
                    {goal.status === 'completed' && (
                      <span className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl text-sm font-semibold shadow-lg">
                        <CheckCircle size={18} />
                        Completed
                      </span>
                    )}
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-3">
                      <span className="text-slate-600 dark:text-slate-400 font-semibold">Progress</span>
                      <span className="font-bold text-lg bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        {goal.current_value} / {goal.target_value}
                      </span>
                    </div>
                    <div className="w-full h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          goal.status === 'completed'
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                            : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                        } shadow-lg`}
                        style={{ width: `${getProgressPercentage(goal)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                      <TrendingUp className="text-emerald-600 dark:text-emerald-400" size={16} />
                      <span className="text-emerald-700 dark:text-emerald-300">
                        {getProgressPercentage(goal).toFixed(0)}% complete
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {badges.map((badge) => {
              const IconComponent = getBadgeIcon(badge.icon);
              return (
                <div
                  key={badge.id}
                  className={`relative bg-white dark:bg-slate-900 rounded-3xl shadow-lg border-2 p-6 text-center transition-all duration-300 ${
                    badge.earned
                      ? 'border-amber-400 dark:border-amber-500 hover:shadow-2xl hover:scale-105'
                      : 'border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-80'
                  }`}
                >
                  {!badge.earned && (
                    <div className="absolute inset-0 bg-slate-900/10 dark:bg-slate-100/10 backdrop-blur-[1px] rounded-3xl flex items-center justify-center">
                      <Lock className="text-slate-400" size={32} />
                    </div>
                  )}
                  <div className={`mx-auto w-20 h-20 rounded-2xl flex items-center justify-center mb-4 shadow-lg transition-transform duration-300 ${
                    badge.earned
                      ? 'bg-gradient-to-br from-amber-400 to-yellow-500 group-hover:scale-110'
                      : 'bg-slate-200 dark:bg-slate-700'
                  }`}>
                    <IconComponent
                      className={badge.earned ? 'text-white' : 'text-slate-400'}
                      size={36}
                    />
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
                    {badge.name}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
                    {badge.description}
                  </p>
                  {badge.earned && badge.earned_at && (
                    <div className="mt-3 pt-3 border-t border-amber-200 dark:border-amber-800">
                      <p className="text-xs text-green-600 dark:text-green-400 font-semibold">
                        Earned {new Date(badge.earned_at).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
