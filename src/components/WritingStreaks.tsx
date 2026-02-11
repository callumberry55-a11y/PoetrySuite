import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Flame, Award, Calendar, TrendingUp, Clock, BookOpen, FileText, Sparkles, Target, Zap } from 'lucide-react';

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

interface DailyLog {
  word_count: number;
  poems_written: number;
  minutes_spent: number;
  write_date: string;
}

interface Milestone {
  days: number;
  title: string;
  emoji: string;
  color: string;
  bgGradient: string;
}

const MILESTONES: Milestone[] = [
  { days: 7, title: 'One Week', emoji: '🔥', color: 'orange', bgGradient: 'from-orange-500 to-red-500' },
  { days: 14, title: 'Two Weeks', emoji: '⚡', color: 'yellow', bgGradient: 'from-yellow-500 to-amber-500' },
  { days: 30, title: 'One Month', emoji: '🌟', color: 'blue', bgGradient: 'from-blue-500 to-cyan-500' },
  { days: 60, title: 'Two Months', emoji: '💎', color: 'cyan', bgGradient: 'from-cyan-500 to-teal-500' },
  { days: 100, title: '100 Days', emoji: '🏆', color: 'amber', bgGradient: 'from-amber-500 to-yellow-500' },
  { days: 365, title: 'One Year', emoji: '👑', color: 'purple', bgGradient: 'from-purple-500 to-pink-500' },
];

export default function WritingStreaks() {
  const { user } = useAuth();
  const [streak, setStreak] = useState<Streak | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [todayLog, setTodayLog] = useState<DailyLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [celebrating, setCelebrating] = useState(false);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);

  useEffect(() => {
    if (user) {
      loadData();
      subscribeToUpdates();
    }

    return () => {
      supabase.channel('writing_streaks_channel').unsubscribe();
      supabase.channel('user_achievements_channel').unsubscribe();
      supabase.channel('daily_writing_logs_channel').unsubscribe();
    };
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data: streakData } = await supabase
        .from('writing_streaks')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      const { data: achievementsData } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user?.id)
        .order('earned_at', { ascending: false });

      const { data: todayLogData } = await supabase
        .from('daily_writing_logs')
        .select('*')
        .eq('user_id', user?.id)
        .eq('write_date', today)
        .maybeSingle();

      setStreak(streakData);
      setAchievements(achievementsData || []);
      setTodayLog(todayLogData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkMilestoneCelebration = useCallback((streakValue: number) => {
    const milestone = MILESTONES.find(m => m.days === streakValue);
    if (milestone) {
      setCelebrating(true);
      setTimeout(() => setCelebrating(false), 3000);
    }
  }, []);

  const subscribeToUpdates = () => {
    if (!user?.id) return;

    const today = new Date().toISOString().split('T')[0];

    const streaksChannel = supabase
      .channel('writing_streaks_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'writing_streaks',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const newStreak = payload.new as Streak;
            setStreak(newStreak);
            checkMilestoneCelebration(newStreak.current_streak);
          }
        }
      )
      .subscribe();

    const achievementsChannel = supabase
      .channel('user_achievements_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_achievements',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newAch = payload.new as Achievement;
            setAchievements((prev) => [newAch, ...prev]);
            setNewAchievement(newAch);
            setCelebrating(true);
            setTimeout(() => {
              setCelebrating(false);
              setNewAchievement(null);
            }, 4000);
          } else if (payload.eventType === 'UPDATE') {
            setAchievements((prev) =>
              prev.map((a) =>
                (a as any).id === (payload.new as any).id ? (payload.new as Achievement) : a
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setAchievements((prev) =>
              prev.filter((a) => (a as any).id !== (payload.old as any).id)
            );
          }
        }
      )
      .subscribe();

    const dailyLogsChannel = supabase
      .channel('daily_writing_logs_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_writing_logs',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const logDate = (payload.new as any).write_date;
            if (logDate === today) {
              setTodayLog(payload.new as DailyLog);
            }
          }
        }
      )
      .subscribe();
  };

  const getNextMilestone = () => {
    const current = streak?.current_streak || 0;
    return MILESTONES.find(m => m.days > current) || MILESTONES[MILESTONES.length - 1];
  };

  const getMilestoneProgress = () => {
    const current = streak?.current_streak || 0;
    const next = getNextMilestone();
    return (current / next.days) * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-700"></div>
            <div className="absolute inset-0 rounded-full border-4 border-orange-600 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">Loading your progress...</p>
        </div>
      </div>
    );
  }

  const nextMilestone = getNextMilestone();
  const progress = getMilestoneProgress();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pb-24">
      {celebrating && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300"></div>
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 rounded-full animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`,
                background: ['#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899'][Math.floor(Math.random() * 6)],
              }}
            />
          ))}
          {newAchievement && (
            <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-4 border-amber-500 p-8 max-w-md mx-4 animate-in zoom-in duration-500">
              <div className="text-center">
                <div className="text-7xl mb-4 animate-bounce">🎉</div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                  Achievement Unlocked!
                </h2>
                <h3 className="text-xl font-semibold text-amber-600 dark:text-amber-400 mb-2">
                  {newAchievement.achievement_name}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {newAchievement.achievement_description}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="relative bg-gradient-to-r from-orange-600 via-red-600 to-rose-600 h-32 sm:h-40">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <Flame className="w-10 h-10 sm:w-12 sm:h-12 mb-2 animate-pulse" />
          <h1 className="text-2xl sm:text-4xl font-bold mb-1">Writing Streaks</h1>
          <p className="text-sm sm:text-base opacity-90">Track your daily writing journey</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-8 space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg">
              <Calendar className="text-white" size={24} />
            </div>
            <span>Today's Activity</span>
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="group bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-900/30 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-3">
                <Clock className="text-blue-600 dark:text-blue-400" size={32} />
                <Sparkles className="text-blue-400 dark:text-blue-500 opacity-50" size={20} />
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-1">
                {todayLog?.minutes_spent || 0}
              </div>
              <div className="text-sm font-semibold text-blue-700 dark:text-blue-300">Minutes</div>
            </div>
            <div className="group bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-900/30 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-3">
                <BookOpen className="text-emerald-600 dark:text-emerald-400" size={32} />
                <Sparkles className="text-emerald-400 dark:text-emerald-500 opacity-50" size={20} />
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-1">
                {todayLog?.poems_written || 0}
              </div>
              <div className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Poems</div>
            </div>
            <div className="group bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-violet-100 dark:border-violet-900/30 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-3">
                <FileText className="text-violet-600 dark:text-violet-400" size={32} />
                <Sparkles className="text-violet-400 dark:text-violet-500 opacity-50" size={20} />
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-1">
                {todayLog?.word_count || 0}
              </div>
              <div className="text-sm font-semibold text-violet-700 dark:text-violet-300">Words</div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <div className={`group relative bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-3xl border-2 border-orange-200 dark:border-orange-900/40 p-8 overflow-hidden hover:shadow-2xl transition-all ${celebrating ? 'animate-pulse' : ''}`}>
            <div className="absolute top-4 right-4 opacity-20">
              <Flame size={80} className="text-orange-600 dark:text-orange-400" />
            </div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-lg">
                  <Flame className="text-white" size={28} />
                </div>
              </div>
              <div className="text-6xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
                {streak?.current_streak || 0}
              </div>
              <div className="text-base font-bold text-orange-700 dark:text-orange-300 uppercase tracking-wide mb-1">
                Day Streak
              </div>
              <div className="text-xs text-orange-600 dark:text-orange-400">
                Keep the fire burning!
              </div>
            </div>
          </div>

          <div className="group relative bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 p-8 overflow-hidden hover:shadow-2xl transition-all">
            <div className="absolute top-4 right-4 opacity-10">
              <TrendingUp size={80} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl shadow-lg">
                  <TrendingUp className="text-white" size={28} />
                </div>
              </div>
              <div className="text-6xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                {streak?.longest_streak || 0}
              </div>
              <div className="text-base font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wide mb-1">
                Longest Streak
              </div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400">
                Personal record
              </div>
            </div>
          </div>

          <div className="group relative bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 p-8 overflow-hidden hover:shadow-2xl transition-all">
            <div className="absolute top-4 right-4 opacity-10">
              <Calendar size={80} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg">
                  <Calendar className="text-white" size={28} />
                </div>
              </div>
              <div className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                {streak?.total_writing_days || 0}
              </div>
              <div className="text-base font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wide mb-1">
                Total Days
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400">
                Days written
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl shadow-lg">
              <Target className="text-white" size={24} />
            </div>
            <span>Next Milestone</span>
          </h2>
          <div className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-2xl p-6 border-2 border-violet-200 dark:border-violet-900/40">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm font-semibold text-violet-700 dark:text-violet-300 mb-1">
                  {nextMilestone.title}
                </div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white">
                  <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                    {streak?.current_streak || 0}
                  </span>
                  <span className="text-slate-400 dark:text-slate-600"> / {nextMilestone.days}</span>
                </div>
              </div>
              <div className="text-6xl animate-bounce">
                {nextMilestone.emoji}
              </div>
            </div>
            <div className="relative h-4 bg-violet-200 dark:bg-violet-900/50 rounded-full overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 bg-gradient-to-r ${nextMilestone.bgGradient} rounded-full transition-all duration-1000 ease-out`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
            <div className="mt-2 text-xs text-violet-600 dark:text-violet-400 text-right">
              {Math.round(progress)}% complete
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mt-6">
            {MILESTONES.map((milestone) => {
              const isAchieved = (streak?.current_streak || 0) >= milestone.days;
              const isCurrent = milestone.days === nextMilestone.days;

              const getCardStyles = () => {
                if (isAchieved) {
                  switch (milestone.color) {
                    case 'orange':
                      return 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/20 border-orange-300 dark:border-orange-800';
                    case 'yellow':
                      return 'bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/20 border-yellow-300 dark:border-yellow-800';
                    case 'blue':
                      return 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 border-blue-300 dark:border-blue-800';
                    case 'cyan':
                      return 'bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/30 dark:to-cyan-800/20 border-cyan-300 dark:border-cyan-800';
                    case 'amber':
                      return 'bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 border-amber-300 dark:border-amber-800';
                    case 'purple':
                      return 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20 border-purple-300 dark:border-purple-800';
                    default:
                      return 'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border-slate-300 dark:border-slate-600';
                  }
                } else if (isCurrent) {
                  return 'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border-slate-300 dark:border-slate-600 ring-2 ring-violet-500';
                }
                return 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-50';
              };

              return (
                <div
                  key={milestone.days}
                  className={`relative rounded-2xl p-4 border-2 transition-all ${getCardStyles()}`}
                >
                  {isAchieved && (
                    <div className="absolute top-2 right-2">
                      <Zap className="text-amber-500" size={16} />
                    </div>
                  )}
                  <div className="text-3xl mb-2">{milestone.emoji}</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {milestone.title}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    {milestone.days} days
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-2xl shadow-lg">
              <Award className="text-white" size={24} />
            </div>
            <span>Achievements</span>
            <span className="ml-auto text-base sm:text-lg font-semibold px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full">
              {achievements.length}
            </span>
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {achievements.length === 0 ? (
              <div className="col-span-2 text-center py-16">
                <div className="text-6xl mb-4 opacity-50">🏆</div>
                <p className="text-slate-500 dark:text-slate-400 text-lg mb-2">
                  No achievements yet
                </p>
                <p className="text-slate-400 dark:text-slate-500 text-sm">
                  Keep writing to unlock your first achievement!
                </p>
              </div>
            ) : (
              achievements.map((achievement, index) => (
                <div
                  key={index}
                  className="group bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-2xl border-2 border-amber-200 dark:border-amber-900/40 p-5 hover:shadow-xl transition-all hover:scale-105"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-2xl shadow-lg flex-shrink-0">
                      <Award className="text-white" size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 dark:text-white mb-1 text-lg">
                        {achievement.achievement_name}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-2">
                        {achievement.achievement_description}
                      </p>
                      <div className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
                        Earned {new Date(achievement.earned_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
