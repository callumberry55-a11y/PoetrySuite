import { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { TrendingUp, BookOpen, Feather, Calendar, Flame } from 'lucide-react';

interface WritingStats {
  date: string;
  poems_written: number;
  words_written: number;
  minutes_writing: number;
}

interface Poem {
    created_at: string;
    word_count?: number;
}

function Analytics() {
  const { user } = useAuth();
  const [stats, setStats] = useState<WritingStats[]>([]);
  const [totalPoems, setTotalPoems] = useState(0);
  const [totalWords, setTotalWords] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);

  const calculateStreaks = useCallback((poems: Poem[]) => {
    if (poems.length === 0) {
      setCurrentStreak(0);
      setLongestStreak(0);
      return;
    }

    const uniqueDates = Array.from(
      new Set(poems.map(p => new Date(p.created_at).toDateString()))
    ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let current = 0;
    const checkDate = new Date(today);

    for (const dateStr of uniqueDates) {
      const poemDate = new Date(dateStr);
      poemDate.setHours(0, 0, 0, 0);

      if (poemDate.getTime() === checkDate.getTime()) {
        current++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    let longest = 0;
    let tempStreak = 1;

    for (let i = 0; i < uniqueDates.length - 1; i++) {
      const currentDate = new Date(uniqueDates[i]);
      const nextDate = new Date(uniqueDates[i + 1]);
      currentDate.setHours(0, 0, 0, 0);
      nextDate.setHours(0, 0, 0, 0);

      const dayDiff = Math.floor(
        (currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (dayDiff === 1) {
        tempStreak++;
      } else {
        longest = Math.max(longest, tempStreak);
        tempStreak = 1;
      }
    }

    longest = Math.max(longest, tempStreak, current);

    setCurrentStreak(current);
    setLongestStreak(longest);
  }, []);

  const loadStats = useCallback(async () => {
    if (!user) return;

    const { data: poems, error } = await supabase
      .from('poems')
      .select('id, created_at, word_count')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading poems:', error);
      return;
    }

    const poemData: Poem[] = poems || [];

    setTotalPoems(poemData.length);
    setTotalWords(poemData.reduce((sum, poem) => sum + (poem.word_count || 0), 0));

    calculateStreaks(poemData);

    const dailyStats: { [key: string]: WritingStats } = {};

    poemData.forEach(poem => {
      const dateStr = new Date(poem.created_at).toISOString().split('T')[0];

      if (!dailyStats[dateStr]) {
        dailyStats[dateStr] = {
          date: dateStr,
          poems_written: 0,
          words_written: 0,
          minutes_writing: 0,
        };
      }

      dailyStats[dateStr].poems_written++;
      dailyStats[dateStr].words_written += poem.word_count || 0;
      dailyStats[dateStr].minutes_writing += Math.ceil((poem.word_count || 0) / 50);
    });

    const statsArray = Object.values(dailyStats)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 30);

    setStats(statsArray);
  }, [user, calculateStreaks]);

useEffect(() => {
    if (!user) return;

    loadStats();

    const channel = supabase
      .channel('analytics-poems-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'poems',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          loadStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, loadStats]);

  const last7Days = useMemo(() => stats.slice(0, 7).reverse(), [stats]);

  const totalWordsLast7Days = useMemo(() => {
    return last7Days.reduce((sum, stat) => sum + stat.words_written, 0);
  }, [last7Days]);

  const totalPoemsLast7Days = useMemo(() => {
    return last7Days.reduce((sum, stat) => sum + stat.poems_written, 0);
  }, [last7Days]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex-1">
      <h2 className="text-3xl font-bold text-m3-on-surface mb-8">Your Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-m3-surface-container-low rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-m3-primary-container flex items-center justify-center">
              <BookOpen className="text-m3-on-primary-container" size={24} />
            </div>
          </div>
          <p className="text-3xl font-bold text-m3-on-surface mb-1">{totalPoems}</p>
          <p className="text-sm text-m3-on-surface-variant">Total Poems</p>
        </div>

        <div className="bg-m3-surface-container-low rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-m3-tertiary-container flex items-center justify-center">
              <Feather className="text-m3-on-tertiary-container" size={24} />
            </div>
          </div>
          <p className="text-3xl font-bold text-m3-on-surface mb-1">
            {totalWords.toLocaleString()}
          </p>
          <p className="text-sm text-m3-on-surface-variant">Total Words</p>
        </div>

        <div className="bg-m3-surface-container-low rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-m3-error-container flex items-center justify-center">
              <Flame className="text-m3-on-error-container" size={24} />
            </div>
          </div>
          <p className="text-3xl font-bold text-m3-on-surface mb-1">{currentStreak}</p>
          <p className="text-sm text-m3-on-surface-variant">Day Streak</p>
        </div>

        <div className="bg-m3-surface-container-low rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-m3-secondary-container flex items-center justify-center">
              <TrendingUp className="text-m3-on-secondary-container" size={24} />
            </div>
          </div>
          <p className="text-3xl font-bold text-m3-on-surface mb-1">{longestStreak}</p>
          <p className="text-sm text-m3-on-surface-variant">Longest Streak</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-m3-surface-container-low rounded-xl p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-m3-on-surface mb-6">
            Last 7 Days Activity
          </h3>
          <div className="space-y-4">
            {last7Days.length === 0 ? (
              <p className="text-m3-on-surface-variant text-center py-8">
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
                    className="flex items-center justify-between py-3 border-b border-m3-outline-variant last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-m3-primary-container flex items-center justify-center">
                        <Calendar className="text-m3-on-primary-container" size={18} />
                      </div>
                      <div>
                        <p className="font-medium text-m3-on-surface">
                          {dayName}, {dateStr}
                        </p>
                        <p className="text-sm text-m3-on-surface-variant">
                          {stat.poems_written} poems, {stat.words_written} words
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-m3-on-surface-variant">
                      {stat.minutes_writing} min
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-m3-surface-container-low rounded-xl p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-m3-on-surface mb-6">
            Weekly Summary
          </h3>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-m3-on-surface-variant">
                  Poems Written
                </span>
                <span className="text-2xl font-bold text-m3-on-surface">
                  {totalPoemsLast7Days}
                </span>
              </div>
              <div className="w-full bg-m3-surface-variant rounded-full h-2">
                <div
                  className="bg-m3-primary h-2 rounded-full transition-all"
                  style={{ width: `${Math.min((totalPoemsLast7Days / 7) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-m3-on-surface-variant">
                  Words Written
                </span>
                <span className="text-2xl font-bold text-m3-on-surface">
                  {totalWordsLast7Days.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-m3-surface-variant rounded-full h-2">
                <div
                  className="bg-m3-tertiary h-2 rounded-full transition-all"
                  style={{ width: `${Math.min((totalWordsLast7Days / 1000) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-m3-outline-variant">
              <p className="text-sm text-m3-on-surface-variant mb-2">
                Average per day (last 7 days)
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold text-m3-on-surface">
                    {(totalPoemsLast7Days / 7).toFixed(1)}
                  </p>
                  <p className="text-xs text-m3-on-surface-variant">poems/day</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-m3-on-surface">
                    {Math.round(totalWordsLast7Days / 7)}
                  </p>
                  <p className="text-xs text-m3-on-surface-variant">words/day</p>
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
