import { useState, useEffect } from 'react';
import { Target, TrendingUp, Calendar, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface WordGoal {
  id: string;
  goal_date: string;
  target_words: number;
  actual_words: number;
  completed: boolean;
  notes: string;
}

export default function DailyWordGoals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<WordGoal[]>([]);
  const [todayGoal, setTodayGoal] = useState<WordGoal | null>(null);
  const [targetWords, setTargetWords] = useState(500);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchGoals();
    }
  }, [user]);

  const fetchGoals = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('daily_word_goals')
        .select('*')
        .eq('user_id', user?.id)
        .order('goal_date', { ascending: false })
        .limit(30);

      if (error) throw error;

      const todaysGoal = data?.find(g => g.goal_date === today);
      setTodayGoal(todaysGoal || null);
      setGoals(data || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTodayGoal = async () => {
    const today = new Date().toISOString().split('T')[0];

    try {
      const { data, error } = await supabase
        .from('daily_word_goals')
        .insert({
          user_id: user?.id,
          goal_date: today,
          target_words: targetWords,
          actual_words: 0,
          completed: false,
        })
        .select()
        .single();

      if (error) throw error;
      setTodayGoal(data);
      fetchGoals();
    } catch (error) {
      console.error('Error creating goal:', error);
    }
  };

  const updateProgress = async (actualWords: number) => {
    if (!todayGoal) return;

    try {
      const completed = actualWords >= todayGoal.target_words;

      const { error } = await supabase
        .from('daily_word_goals')
        .update({
          actual_words: actualWords,
          completed
        })
        .eq('id', todayGoal.id);

      if (error) throw error;
      fetchGoals();
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const completedCount = goals.filter(g => g.completed).length;
  const streak = calculateStreak(goals);

  function calculateStreak(goals: WordGoal[]): number {
    if (goals.length === 0) return 0;

    let streak = 0;
    const sortedGoals = [...goals].sort((a, b) =>
      new Date(b.goal_date).getTime() - new Date(a.goal_date).getTime()
    );

    for (const goal of sortedGoals) {
      if (goal.completed) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">Loading goals...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Daily Word Goals</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Set and track your daily writing targets
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Target className="w-6 h-6 text-blue-500" />
            </div>
            <div className="text-2xl font-bold">{todayGoal?.target_words || 0}</div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Today's Target</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
            <div className="text-2xl font-bold">{completedCount}</div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Goals Completed</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <Calendar className="w-6 h-6 text-orange-500" />
            </div>
            <div className="text-2xl font-bold">{streak}</div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Day Streak</div>
        </div>
      </div>

      {todayGoal ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Today's Progress</h2>

          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Progress</span>
              <span className="font-semibold">
                {todayGoal.actual_words} / {todayGoal.target_words} words
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  todayGoal.completed ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{
                  width: `${Math.min((todayGoal.actual_words / todayGoal.target_words) * 100, 100)}%`
                }}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <input
              type="number"
              value={todayGoal.actual_words}
              onChange={(e) => updateProgress(parseInt(e.target.value) || 0)}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
              placeholder="Words written today"
            />
            {todayGoal.completed && (
              <div className="flex items-center px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg font-semibold">
                Goal Complete!
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 mb-6 text-center">
          <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Set Today's Goal</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            How many words do you want to write today?
          </p>

          <div className="flex gap-3 max-w-md mx-auto">
            <input
              type="number"
              value={targetWords}
              onChange={(e) => setTargetWords(parseInt(e.target.value) || 0)}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
              placeholder="500"
            />
            <button
              onClick={createTodayGoal}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Set Goal
            </button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold mb-4">Goal History</h2>
        <div className="space-y-2">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className={`p-4 rounded-lg border-2 ${
                goal.completed
                  ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">
                    {new Date(goal.goal_date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {goal.actual_words} / {goal.target_words} words
                  </div>
                </div>
                {goal.completed && (
                  <div className="text-green-500 font-semibold">✓ Complete</div>
                )}
              </div>
            </div>
          ))}

          {goals.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No goals yet. Set your first goal today!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
