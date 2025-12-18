import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { BarChart3, TrendingUp, Clock, Calendar, Target, Award, ArrowLeft, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import BetaGuard from './BetaGuard';

interface WritingMetrics {
  totalPoems: number;
  totalWords: number;
  avgWordsPerPoem: number;
  mostProductiveDay: string;
  writingStreak: number;
  longestStreak: number;
  poemsThisWeek: number;
  poemsThisMonth: number;
  favoriteForm: string;
  totalMinutesWriting: number;
}

interface DailyActivity {
  date: string;
  poems: number;
  words: number;
}

export default function AdvancedMetrics() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<WritingMetrics | null>(null);
  const [dailyActivity, setDailyActivity] = useState<DailyActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    loadMetrics();
  }, [user, timeRange]);

  const loadMetrics = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data: poems, error } = await supabase
        .from('poems')
        .select('content, form_id, created_at, updated_at')
        .eq('user_id', user.id);

      if (error) throw error;

      if (!poems || poems.length === 0) {
        setMetrics({
          totalPoems: 0,
          totalWords: 0,
          avgWordsPerPoem: 0,
          mostProductiveDay: 'N/A',
          writingStreak: 0,
          longestStreak: 0,
          poemsThisWeek: 0,
          poemsThisMonth: 0,
          favoriteForm: 'N/A',
          totalMinutesWriting: 0
        });
        setDailyActivity([]);
        setIsLoading(false);
        return;
      }

      const totalWords = poems.reduce((sum, poem) =>
        sum + (poem.content?.split(/\s+/).filter((w: string) => w.trim()).length || 0), 0
      );

      const avgWords = poems.length > 0 ? Math.round(totalWords / poems.length) : 0;

      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const poemsThisWeek = poems.filter(p =>
        new Date(p.created_at) >= weekAgo
      ).length;

      const poemsThisMonth = poems.filter(p =>
        new Date(p.created_at) >= monthAgo
      ).length;

      const dayCount: Record<string, number> = {};
      poems.forEach(poem => {
        const day = new Date(poem.created_at).toLocaleDateString('en-US', { weekday: 'long' });
        dayCount[day] = (dayCount[day] || 0) + 1;
      });

      const mostProductiveDay = Object.keys(dayCount).length > 0
        ? Object.entries(dayCount).sort(([, a], [, b]) => b - a)[0][0]
        : 'N/A';

      const formCount: Record<string, number> = {};
      poems.forEach(poem => {
        const form = poem.form_id || 'free_verse';
        formCount[form] = (formCount[form] || 0) + 1;
      });

      const favoriteForm = Object.keys(formCount).length > 0
        ? Object.entries(formCount).sort(([, a], [, b]) => b - a)[0][0].replace(/_/g, ' ')
        : 'Free Verse';

      const sortedDates = poems
        .map(p => new Date(p.created_at).toDateString())
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

      let currentStreak = 0;
      let longestStreak = 0;
      let streakCount = 1;

      for (let i = 1; i < sortedDates.length; i++) {
        const prevDate = new Date(sortedDates[i - 1]);
        const currDate = new Date(sortedDates[i]);
        const daysDiff = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

        if (daysDiff === 1) {
          streakCount++;
        } else {
          longestStreak = Math.max(longestStreak, streakCount);
          streakCount = 1;
        }
      }
      longestStreak = Math.max(longestStreak, streakCount);

      const lastPoemDate = new Date(sortedDates[sortedDates.length - 1]);
      const daysSinceLastPoem = Math.floor((now.getTime() - lastPoemDate.getTime()) / (1000 * 60 * 60 * 24));
      currentStreak = daysSinceLastPoem <= 1 ? streakCount : 0;

      const getDaysToShow = () => {
        switch (timeRange) {
          case 'week': return 7;
          case 'month': return 30;
          case 'year': return 365;
        }
      };

      const daysToShow = getDaysToShow();
      const dailyData: DailyActivity[] = [];

      for (let i = daysToShow - 1; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        const dayPoems = poems.filter(p =>
          new Date(p.created_at).toISOString().split('T')[0] === dateStr
        );

        dailyData.push({
          date: dateStr,
          poems: dayPoems.length,
          words: dayPoems.reduce((sum, poem) =>
            sum + (poem.content?.split(/\s+/).filter((w: string) => w.trim()).length || 0), 0
          )
        });
      }

      setDailyActivity(dailyData);
      setMetrics({
        totalPoems: poems.length,
        totalWords,
        avgWordsPerPoem: avgWords,
        mostProductiveDay,
        writingStreak: currentStreak,
        longestStreak,
        poemsThisWeek,
        poemsThisMonth,
        favoriteForm,
        totalMinutesWriting: poems.length * 15
      });
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const maxActivity = Math.max(...dailyActivity.map(d => d.poems), 1);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <BetaGuard>
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => window.location.hash = ''}
          className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline mb-4"
        >
          <ArrowLeft size={16} />
          Back to Beta Features
        </button>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-sky-500 flex items-center justify-center">
            <BarChart3 className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Advanced Metrics</h2>
            <p className="text-slate-600 dark:text-slate-400">Detailed insights into your writing journey</p>
          </div>
        </div>
      </div>

      {metrics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <FileText className="text-blue-600 dark:text-blue-400" size={20} />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Total Poems</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{metrics.totalPoems}</p>
                </div>
              </div>
            </div>

            <div className="glass rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <TrendingUp className="text-green-600 dark:text-green-400" size={20} />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Total Words</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{metrics.totalWords.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="glass rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <Target className="text-orange-600 dark:text-orange-400" size={20} />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Avg Words/Poem</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{metrics.avgWordsPerPoem}</p>
                </div>
              </div>
            </div>

            <div className="glass rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                  <Award className="text-sky-600 dark:text-sky-400" size={20} />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Current Streak</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{metrics.writingStreak} days</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Writing Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="text-blue-600 dark:text-blue-400" size={18} />
                    <span className="text-slate-700 dark:text-slate-300">Most Productive Day</span>
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white">{metrics.mostProductiveDay}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Award className="text-blue-600 dark:text-blue-400" size={18} />
                    <span className="text-slate-700 dark:text-slate-300">Longest Streak</span>
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white">{metrics.longestStreak} days</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="text-blue-600 dark:text-blue-400" size={18} />
                    <span className="text-slate-700 dark:text-slate-300">Poems This Week</span>
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white">{metrics.poemsThisWeek}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="text-blue-600 dark:text-blue-400" size={18} />
                    <span className="text-slate-700 dark:text-slate-300">Poems This Month</span>
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white">{metrics.poemsThisMonth}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="text-blue-600 dark:text-blue-400" size={18} />
                    <span className="text-slate-700 dark:text-slate-300">Favorite Form</span>
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white capitalize">{metrics.favoriteForm}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="text-blue-600 dark:text-blue-400" size={18} />
                    <span className="text-slate-700 dark:text-slate-300">Est. Writing Time</span>
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white">{Math.round(metrics.totalMinutesWriting / 60)}h</span>
                </div>
              </div>
            </div>

            <div className="glass rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Activity Timeline</h3>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | 'year')}
                  className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white"
                >
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                  <option value="year">Last Year</option>
                </select>
              </div>

              <div className="space-y-2">
                {dailyActivity.map((day, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400 w-20 text-right">
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <div className="flex-1 h-8 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-sky-500 rounded-lg transition-all"
                        style={{ width: `${(day.poems / maxActivity) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-slate-600 dark:text-slate-400 w-12">
                      {day.poems} {day.poems === 1 ? 'poem' : 'poems'}
                    </span>
                  </div>
                ))}
              </div>

              {dailyActivity.every(d => d.poems === 0) && (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <BarChart3 size={48} className="mx-auto mb-3 opacity-30" />
                  <p>No activity in this time range</p>
                </div>
              )}
            </div>
          </div>

          <div className="glass rounded-xl p-6 shadow-sm bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Keep Up the Great Work!
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              You've written {metrics.totalPoems} poems totaling {metrics.totalWords.toLocaleString()} words.
              {metrics.writingStreak > 0 && ` You're on a ${metrics.writingStreak}-day writing streak!`}
              {metrics.writingStreak === 0 && ' Write a poem today to start a new streak!'}
            </p>
          </div>
        </div>
      )}
    </div>
    </BetaGuard>
  );
}
