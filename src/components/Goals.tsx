import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Target, Plus, TrendingUp, CheckCircle, Award, Lock } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

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

  useEffect(() => {
    if (user) {
      loadGoals();
      loadBadges();
    }
  }, [user]);

  const loadGoals = async () => {
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
  };

  const loadBadges = async () => {
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
  };

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
    const iconKey = iconName.split('-').map((part, i) =>
      i === 0 ? part.charAt(0).toUpperCase() + part.slice(1) : part.charAt(0).toUpperCase() + part.slice(1)
    ).join('');

    const Icon = (LucideIcons as any)[iconKey];
    return Icon || Award;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Goals & Achievements</h2>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('goals')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'goals'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Target size={18} />
            Goals
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'badges'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Award size={18} />
            Badges ({badges.filter(b => b.earned).length}/{badges.length})
          </button>
        </div>

        {activeTab === 'goals' && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
          >
            <Plus size={18} />
            New Goal
          </button>
        )}
      </div>

      {showCreateForm && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Create New Goal</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Goal Type
              </label>
              <select
                value={newGoal.goal_type}
                onChange={(e) => setNewGoal({ ...newGoal, goal_type: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              >
                <option value="weekly_poems">Weekly Poems</option>
                <option value="monthly_poems">Monthly Poems</option>
                <option value="word_count">Total Word Count</option>
                <option value="daily_writing">Daily Writing Streak</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Target
              </label>
              <input
                type="number"
                value={newGoal.target_value}
                onChange={(e) => setNewGoal({ ...newGoal, target_value: parseInt(e.target.value) })}
                min="1"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={createGoal}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium"
              >
                Create
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'goals' ? (
        <div className="space-y-4">
          {goals.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg">
              <p className="text-slate-500 dark:text-slate-400">No goals yet. Create one to get started!</p>
            </div>
          ) : (
            goals.map((goal) => (
              <div
                key={goal.id}
                className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                      {formatGoalType(goal.goal_type)}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {new Date(goal.start_date).toLocaleDateString()} - {new Date(goal.end_date).toLocaleDateString()}
                    </p>
                  </div>
                  {goal.status === 'completed' && (
                    <span className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm font-medium">
                      <CheckCircle size={16} />
                      Completed
                    </span>
                  )}
                </div>

                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-600 dark:text-slate-400">Progress</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {goal.current_value} / {goal.target_value}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        goal.status === 'completed'
                          ? 'bg-green-500'
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${getProgressPercentage(goal)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <TrendingUp size={14} />
                  {getProgressPercentage(goal).toFixed(0)}% complete
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {badges.map((badge) => {
            const IconComponent = getBadgeIcon(badge.icon);
            return (
              <div
                key={badge.id}
                className={`relative bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 text-center transition-all ${
                  badge.earned
                    ? 'ring-2 ring-yellow-400 dark:ring-yellow-500'
                    : 'opacity-60'
                }`}
              >
                {!badge.earned && (
                  <div className="absolute inset-0 bg-slate-900/10 dark:bg-slate-100/10 backdrop-blur-[1px] rounded-lg flex items-center justify-center">
                    <Lock className="text-slate-400" size={24} />
                  </div>
                )}
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-3 ${
                  badge.earned
                    ? 'bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30'
                    : 'bg-slate-200 dark:bg-slate-700'
                }`}>
                  <IconComponent
                    className={badge.earned ? 'text-yellow-600 dark:text-yellow-400' : 'text-slate-400'}
                    size={28}
                  />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                  {badge.name}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                  {badge.description}
                </p>
                {badge.earned && badge.earned_at && (
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                    Earned {new Date(badge.earned_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
