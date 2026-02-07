import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Flame, Award, Calendar, TrendingUp } from 'lucide-react';

interface Streak {
  current_streak: number;
  longest_streak: number;
  total_writing_days: number;
  last_write_date: string;
}

interface Achievement {
  achievement_name: string;
  achievement_description: string;
  earned_at: string;
}

export default function WritingStreaks() {
  const { user } = useAuth();
  const [streak, setStreak] = useState<Streak | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: streakData } = await supabase
        .from('writing_streaks')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      const { data: achievementsData } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user?.id)
        .order('earned_at', { ascending: false });

      setStreak(streakData);
      setAchievements(achievementsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 flex items-center justify-center h-96">
        <div className="inline-block w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Flame className="w-8 h-8 text-orange-600 dark:text-orange-400" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Writing Streaks
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg border-2 border-orange-200 dark:border-orange-800 p-6">
          <Flame className="w-8 h-8 text-orange-600 dark:text-orange-400 mb-3" />
          <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
            {streak?.current_streak || 0}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Day Streak
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <TrendingUp className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mb-3" />
          <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
            {streak?.longest_streak || 0}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Longest Streak
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-3" />
          <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
            {streak?.total_writing_days || 0}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total Days
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Award className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
          Achievements
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {achievements.length === 0 ? (
            <div className="col-span-2 text-center py-12 text-gray-500 dark:text-gray-400">
              No achievements yet. Keep writing to unlock them!
            </div>
          ) : (
            achievements.map((achievement, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 p-4"
              >
                <div className="flex items-start gap-3">
                  <Award className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                      {achievement.achievement_name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {achievement.achievement_description}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
