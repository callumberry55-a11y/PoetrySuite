import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { BarChart3, TrendingUp, Clock, Calendar, Target, Award, ArrowLeft, FileText, PieChart, Sunrise, Sunset, Sun, Moon, Zap, BookOpen } from 'lucide-react';
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
  poemsLastMonth: number;
  wordsThisMonth: number;
  wordsLastMonth: number;
  mostProductiveHour: string;
  longestPoem: number;
  shortestPoem: number;
}

interface DailyActivity {
  date: string;
  poems: number;
  words: number;
}

interface FormDistribution {
  form: string;
  count: number;
  percentage: number;
}

interface HourlyActivity {
  hour: number;
  count: number;
}

interface MonthlyTrend {
  month: string;
  poems: number;
  words: number;
}

export default function AdvancedMetrics() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<WritingMetrics | null>(null);
  const [dailyActivity, setDailyActivity] = useState<DailyActivity[]>([]);
  const [formDistribution, setFormDistribution] = useState<FormDistribution[]>([]);
  const [hourlyActivity, setHourlyActivity] = useState<HourlyActivity[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([]);
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
          totalMinutesWriting: 0,
          poemsLastMonth: 0,
          wordsThisMonth: 0,
          wordsLastMonth: 0,
          mostProductiveHour: 'N/A',
          longestPoem: 0,
          shortestPoem: 0
        });
        setDailyActivity([]);
        setFormDistribution([]);
        setHourlyActivity([]);
        setMonthlyTrends([]);
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
      const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      const poemsThisWeek = poems.filter(p =>
        new Date(p.created_at) >= weekAgo
      ).length;

      const poemsThisMonth = poems.filter(p =>
        new Date(p.created_at) >= monthAgo
      ).length;

      const poemsLastMonth = poems.filter(p => {
        const date = new Date(p.created_at);
        return date >= twoMonthsAgo && date < monthAgo;
      }).length;

      const wordsThisMonth = poems
        .filter(p => new Date(p.created_at) >= monthAgo)
        .reduce((sum, poem) => sum + (poem.content?.split(/\s+/).filter((w: string) => w.trim()).length || 0), 0);

      const wordsLastMonth = poems
        .filter(p => {
          const date = new Date(p.created_at);
          return date >= twoMonthsAgo && date < monthAgo;
        })
        .reduce((sum, poem) => sum + (poem.content?.split(/\s+/).filter((w: string) => w.trim()).length || 0), 0);

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

      const formDist: FormDistribution[] = Object.entries(formCount)
        .map(([form, count]) => ({
          form: form.replace(/_/g, ' '),
          count,
          percentage: Math.round((count / poems.length) * 100)
        }))
        .sort((a, b) => b.count - a.count);

      setFormDistribution(formDist);

      const hourCount: Record<number, number> = {};
      poems.forEach(poem => {
        const hour = new Date(poem.created_at).getHours();
        hourCount[hour] = (hourCount[hour] || 0) + 1;
      });

      const hourlyData: HourlyActivity[] = Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        count: hourCount[i] || 0
      }));

      setHourlyActivity(hourlyData);

      const mostProductiveHour = Object.keys(hourCount).length > 0
        ? Object.entries(hourCount).sort(([, a], [, b]) => b - a)[0][0]
        : 'N/A';

      const getTimeOfDay = (hour: string) => {
        const h = parseInt(hour);
        if (h >= 5 && h < 12) return 'Morning';
        if (h >= 12 && h < 17) return 'Afternoon';
        if (h >= 17 && h < 21) return 'Evening';
        return 'Night';
      };

      const productiveTime = mostProductiveHour !== 'N/A'
        ? `${getTimeOfDay(mostProductiveHour)} (${parseInt(mostProductiveHour) % 12 || 12}${parseInt(mostProductiveHour) >= 12 ? 'pm' : 'am'})`
        : 'N/A';

      const monthlyData: Record<string, { poems: number; words: number }> = {};
      poems.forEach(poem => {
        const monthKey = new Date(poem.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { poems: 0, words: 0 };
        }
        monthlyData[monthKey].poems++;
        monthlyData[monthKey].words += poem.content?.split(/\s+/).filter((w: string) => w.trim()).length || 0;
      });

      const monthlyTrendData: MonthlyTrend[] = Object.entries(monthlyData)
        .map(([month, data]) => ({ month, ...data }))
        .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
        .slice(-6);

      setMonthlyTrends(monthlyTrendData);

      const wordCounts = poems.map(p => p.content?.split(/\s+/).filter((w: string) => w.trim()).length || 0);
      const longestPoem = Math.max(...wordCounts, 0);
      const shortestPoem = Math.min(...wordCounts.filter(w => w > 0), 0) || 0;

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
        totalMinutesWriting: poems.length * 15,
        poemsLastMonth,
        wordsThisMonth,
        wordsLastMonth,
        mostProductiveHour: productiveTime,
        longestPoem,
        shortestPoem
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <PieChart size={20} className="text-blue-600 dark:text-blue-400" />
                Poetry Form Distribution
              </h3>
              <div className="space-y-3">
                {formDistribution.length > 0 ? (
                  formDistribution.map((form, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">
                          {form.form}
                        </span>
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {form.count} ({form.percentage}%)
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-sky-500 rounded-full transition-all"
                          style={{ width: `${form.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-slate-500 dark:text-slate-400 py-4">No forms data</p>
                )}
              </div>
            </div>

            <div className="glass rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Clock size={20} className="text-blue-600 dark:text-blue-400" />
                Writing Time Patterns
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    {metrics.mostProductiveHour.includes('Morning') && <Sunrise className="text-amber-600 dark:text-amber-400" size={24} />}
                    {metrics.mostProductiveHour.includes('Afternoon') && <Sun className="text-orange-600 dark:text-orange-400" size={24} />}
                    {metrics.mostProductiveHour.includes('Evening') && <Sunset className="text-orange-600 dark:text-orange-400" size={24} />}
                    {metrics.mostProductiveHour.includes('Night') && <Moon className="text-slate-600 dark:text-slate-400" size={24} />}
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Most Productive Time</p>
                      <p className="text-lg font-semibold text-slate-900 dark:text-white">{metrics.mostProductiveHour}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {['Morning', 'Afternoon', 'Evening', 'Night'].map((period) => {
                    const periodHours = period === 'Morning' ? [5, 6, 7, 8, 9, 10, 11]
                      : period === 'Afternoon' ? [12, 13, 14, 15, 16]
                      : period === 'Evening' ? [17, 18, 19, 20]
                      : [21, 22, 23, 0, 1, 2, 3, 4];

                    const periodCount = hourlyActivity
                      .filter(h => periodHours.includes(h.hour))
                      .reduce((sum, h) => sum + h.count, 0);

                    return (
                      <div key={period} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-center">
                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">{period}</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">{periodCount}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-blue-600 dark:text-blue-400" />
                Monthly Trends
              </h3>
              <div className="space-y-3">
                {monthlyTrends.length > 0 ? (
                  monthlyTrends.map((trend, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <span className="text-sm text-slate-600 dark:text-slate-400 w-20">
                        {trend.month}
                      </span>
                      <div className="flex-1">
                        <div className="h-8 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden flex items-center px-2">
                          <div
                            className="h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded transition-all flex items-center justify-end pr-2"
                            style={{ width: `${Math.min((trend.poems / Math.max(...monthlyTrends.map(t => t.poems))) * 100, 100)}%` }}
                          >
                            <span className="text-xs text-white font-semibold">{trend.poems}</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-slate-600 dark:text-slate-400 w-24 text-right">
                        {trend.words.toLocaleString()} words
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-slate-500 dark:text-slate-400 py-4">No trends data</p>
                )}
              </div>
            </div>

            <div className="glass rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Zap size={20} className="text-blue-600 dark:text-blue-400" />
                Quick Stats
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20 rounded-lg">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">This Month</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{metrics.poemsThisMonth}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {metrics.poemsThisMonth > metrics.poemsLastMonth ? '↑' : metrics.poemsThisMonth < metrics.poemsLastMonth ? '↓' : '→'}
                    {' '}{metrics.poemsLastMonth > 0 ? Math.abs(Math.round(((metrics.poemsThisMonth - metrics.poemsLastMonth) / metrics.poemsLastMonth) * 100)) : 0}% vs last month
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Words/Month</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{metrics.wordsThisMonth.toLocaleString()}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {metrics.wordsThisMonth > metrics.wordsLastMonth ? '↑' : metrics.wordsThisMonth < metrics.wordsLastMonth ? '↓' : '→'}
                    {' '}{metrics.wordsLastMonth > 0 ? Math.abs(Math.round(((metrics.wordsThisMonth - metrics.wordsLastMonth) / metrics.wordsLastMonth) * 100)) : 0}% vs last month
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Longest Poem</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{metrics.longestPoem}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">words</p>
                </div>

                <div className="p-4 bg-gradient-to-br from-sky-50 to-cyan-50 dark:from-sky-900/20 dark:to-cyan-900/20 rounded-lg">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Shortest Poem</p>
                  <p className="text-2xl font-bold text-sky-600 dark:text-sky-400">{metrics.shortestPoem}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">words</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass rounded-xl p-6 shadow-sm bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Award className="text-green-600 dark:text-green-400" size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Achievement Level</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    {metrics.totalPoems < 10 ? 'Beginner' : metrics.totalPoems < 50 ? 'Intermediate' : metrics.totalPoems < 100 ? 'Advanced' : 'Master'}
                  </p>
                </div>
              </div>
            </div>

            <div className="glass rounded-xl p-6 shadow-sm bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Zap className="text-blue-600 dark:text-blue-400" size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Writing Velocity</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    {(metrics.poemsThisMonth / 4).toFixed(1)} poems/week
                  </p>
                </div>
              </div>
            </div>

            <div className="glass rounded-xl p-6 shadow-sm bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <BookOpen className="text-orange-600 dark:text-orange-400" size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Consistency Score</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    {Math.min(Math.round((metrics.writingStreak / 30) * 100 + (metrics.poemsThisMonth / 30) * 100), 100)}%
                  </p>
                </div>
              </div>
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
              {' '}Your favorite form is {metrics.favoriteForm}, and you tend to write most during the {metrics.mostProductiveHour}.
            </p>
          </div>
        </div>
      )}
    </div>
    </BetaGuard>
  );
}
