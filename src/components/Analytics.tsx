import { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { TrendingUp, BookOpen, Feather, Calendar, Flame } from 'lucide-react';

interface WritingStats {
  date: string;
  poems_written: number;
  words_written: number;
  minutes_writing: number;
}

function Analytics() {
  const { user } = useAuth();
  const [stats, setStats] = useState<WritingStats[]>([]);
  const [totalPoems, setTotalPoems] = useState(0);
  const [totalWords, setTotalWords] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);

  const calculateStreaks = useCallback((statsData: WritingStats[]) => {
    if (statsData.length === 0) {
      setCurrentStreak(0);
      setLongestStreak(0);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sortedStats = [...statsData].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    let current = 0;
    let longest = 0;
    let tempStreak = 0;
    let checkDate = new Date(today);

    for (const stat of sortedStats) {
      const statDate = new Date(stat.date);
      statDate.setHours(0, 0, 0, 0);

      if (statDate.getTime() === checkDate.getTime()) {
        tempStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    current = tempStreak;

    tempStreak = 1;
    let prevDate = new Date(sortedStats[0].date);
    prevDate.setHours(0, 0, 0, 0);

    for (let i = 1; i < sortedStats.length; i++) {
      const currentDate = new Date(sortedStats[i].date);
      currentDate.setHours(0, 0, 0, 0);

      const dayDiff = Math.floor(
        (prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (dayDiff === 1) {
        tempStreak++;
        longest = Math.max(longest, tempStreak);
      } else {
        tempStreak = 1;
      }

      prevDate = currentDate;
    }

    longest = Math.max(longest, tempStreak, current);

    setCurrentStreak(current);
    setLongestStreak(longest);
  }, []);

  const loadStats = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('writing_stats')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(30);

    if (error) {
      console.error('Error loading stats:', error);
      return;
    }

    setStats(data || []);
    calculateStreaks(data || []);
  }, [user, calculateStreaks]);

  const loadPoemCount = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('poems')
      .select('word_count')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error loading poem count:', error);
      return;
    }

    setTotalPoems(data?.length || 0);
    setTotalWords(data?.reduce((sum, poem) => sum + poem.word_count, 0) || 0);
  }, [user]);

  useEffect(() => {
    if (user) {
      loadStats();
      loadPoemCount();
    }
  }, [user, loadStats, loadPoemCount]);

  const last7Days = useMemo(() => stats.slice(0, 7).reverse(), [stats]);

  const totalWordsLast7Days = useMemo(() => {
    return last7Days.reduce((sum, stat) => sum + stat.words_written, 0);
  }, [last7Days]);

  const totalPoemsLast7Days = useMemo(() => {
    return last7Days.reduce((sum, stat) => sum + stat.poems_written, 0);
  }, [last7Days]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Your Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <BookOpen className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{totalPoems}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">Total Poems</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Feather className="text-green-600 dark:text-green-400" size={24} />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
            {totalWords.toLocaleString()}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">Total Words</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Flame className="text-orange-600 dark:text-orange-400" size={24} />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{currentStreak}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">Day Streak</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <TrendingUp className="text-purple-600 dark:text-purple-400" size={24} />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{longestStreak}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">Longest Streak</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
            Last 7 Days Activity
          </h3>
          <div className="space-y-4">
            {last7Days.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400 text-center py-8">
                No activity in the last 7 days
              </p>
            ) : (
              last7Days.map((stat) => {
                const date = new Date(stat.date);
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                return (
                  <div
                    key={stat.date}
                    className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Calendar className="text-blue-600 dark:text-blue-400" size={18} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {dayName}, {dateStr}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {stat.poems_written} poems, {stat.words_written} words
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-slate-500">
                      {stat.minutes_writing} min
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
            Weekly Summary
          </h3>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Poems Written
                </span>
                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  {totalPoemsLast7Days}
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min((totalPoemsLast7Days / 7) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Words Written
                </span>
                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  {totalWordsLast7Days.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min((totalWordsLast7Days / 1000) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                Average per day (last 7 days)
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {(totalPoemsLast7Days / 7).toFixed(1)}
                  </p>
                  <p className="text-xs text-slate-500">poems/day</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {Math.round(totalWordsLast7Days / 7)}
                  </p>
                  <p className="text-xs text-slate-500">words/day</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(Analytics);
