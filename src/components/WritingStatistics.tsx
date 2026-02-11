import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Clock, Calendar, BookOpen, Award } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Stats {
  total_poems: number;
  total_words: number;
  avg_words_per_poem: number;
  poems_this_month: number;
  poems_this_week: number;
  longest_streak: number;
  current_streak: number;
  favorite_form?: string;
}

export default function WritingStatistics() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    total_poems: 0,
    total_words: 0,
    avg_words_per_poem: 0,
    poems_this_month: 0,
    poems_this_week: 0,
    longest_streak: 0,
    current_streak: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStatistics();
    }
  }, [user]);

  const fetchStatistics = async () => {
    try {
      const { data, error } = await supabase
        .from('poems')
        .select('created_at, word_count, form')
        .eq('user_id', user?.id);

      if (error) throw error;

      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const totalPoems = data?.length || 0;
      const totalWords = data?.reduce((sum, p) => sum + (p.word_count || 0), 0) || 0;
      const poemsThisWeek = data?.filter((p) => new Date(p.created_at) >= weekAgo).length || 0;
      const poemsThisMonth = data?.filter((p) => new Date(p.created_at) >= monthAgo).length || 0;

      setStats({
        total_poems: totalPoems,
        total_words: totalWords,
        avg_words_per_poem: totalPoems > 0 ? Math.round(totalWords / totalPoems) : 0,
        poems_this_month: poemsThisMonth,
        poems_this_week: poemsThisWeek,
        longest_streak: 0,
        current_streak: 0,
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">Loading statistics...</div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Poems',
      value: stats.total_poems,
      icon: BookOpen,
      color: 'blue',
    },
    {
      label: 'Total Words',
      value: stats.total_words.toLocaleString(),
      icon: BarChart3,
      color: 'green',
    },
    {
      label: 'Avg Words/Poem',
      value: stats.avg_words_per_poem,
      icon: TrendingUp,
      color: 'purple',
    },
    {
      label: 'This Week',
      value: stats.poems_this_week,
      icon: Calendar,
      color: 'orange',
    },
    {
      label: 'This Month',
      value: stats.poems_this_month,
      icon: Clock,
      color: 'pink',
    },
    {
      label: 'Current Streak',
      value: `${stats.current_streak} days`,
      icon: Award,
      color: 'red',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Writing Statistics</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your progress and celebrate your achievements
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:border-primary transition-all hover:shadow-lg"
          >
            <div className="flex items-start justify-between mb-4">
              <stat.icon className={`w-8 h-8 text-${stat.color}-500`} />
            </div>
            <div className="text-3xl font-bold mb-1">{stat.value}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-4">Writing Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Poems per week</span>
              <span className="font-semibold">
                {stats.poems_this_week > 0 ? (stats.poems_this_week / 1).toFixed(1) : '0'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Words per poem</span>
              <span className="font-semibold">{stats.avg_words_per_poem}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Longest streak</span>
              <span className="font-semibold">{stats.longest_streak} days</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg border border-primary/20 p-6">
          <h3 className="text-lg font-semibold mb-4">Keep Going!</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            You're doing great! Consistency is key to developing your craft. Keep writing regularly
            to build your skills and discover your unique voice.
          </p>
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <TrendingUp className="w-4 h-4" />
            Keep up the momentum
          </div>
        </div>
      </div>
    </div>
  );
}
