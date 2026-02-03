import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Trophy, Clock, Users, ThumbsUp, Award, Medal, Shield } from 'lucide-react';

interface Badge {
  id: string;
  name: string;
  rank: string;
  points: number;
}

interface Contest {
  id: string;
  title: string;
  description: string;
  theme: string;
  start_date: string;
  end_date: string;
  voting_end_date: string;
  prize_description: string;
  status: 'upcoming' | 'active' | 'voting' | 'completed';
  entry_count: number;
  user_has_entered: boolean;
  winner_badge?: Badge;
  runner_up_badge?: Badge;
  participant_badge?: Badge;
}

export default function Contests() {
  const { user } = useAuth();
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadContests();
    }
  }, [user]);

  const loadContests = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('contests')
      .select(`
        *,
        winner_badge:winner_badge_id(id, name, rank, points),
        runner_up_badge:runner_up_badge_id(id, name, rank, points),
        participant_badge:participant_badge_id(id, name, rank, points)
      `)
      .in('status', ['active', 'voting', 'upcoming'])
      .order('start_date', { ascending: true });

    if (error) {
      console.error('Error loading contests:', error);
      setLoading(false);
      return;
    }

    const contestsWithData = await Promise.all(
      (data || []).map(async (contest) => {
        const { count } = await supabase
          .from('contest_entries')
          .select('id', { count: 'exact', head: true })
          .eq('contest_id', contest.id);

        const { data: userEntry } = await supabase
          .from('contest_entries')
          .select('id')
          .eq('contest_id', contest.id)
          .eq('user_id', user.id)
          .maybeSingle();

        return {
          ...contest,
          entry_count: count || 0,
          user_has_entered: !!userEntry
        };
      })
    );

    setContests(contestsWithData);
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'voting':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8 pb-24">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1 sm:mb-2">Poetry Contests</h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
          Compete with fellow poets for recognition and prizes
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : contests.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg">
          <p className="text-slate-500 dark:text-slate-400">No active contests at the moment</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {contests.map((contest) => (
            <div
              key={contest.id}
              className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 sm:p-6"
            >
              <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="text-yellow-500 flex-shrink-0" size={18} />
                    <h3 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white truncate">
                      {contest.title}
                    </h3>
                  </div>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(contest.status)}`}>
                    {contest.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">
                {contest.description}
              </p>

              {contest.theme && (
                <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Theme
                  </p>
                  <p className="text-sm sm:text-base text-slate-900 dark:text-white font-serif">
                    {contest.theme}
                  </p>
                </div>
              )}

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  <Clock size={12} className="sm:w-[14px] sm:h-[14px] flex-shrink-0" />
                  <span className="truncate">
                    {contest.status === 'upcoming' && `Starts ${formatDate(contest.start_date)}`}
                    {contest.status === 'active' && `Ends ${formatDate(contest.end_date)}`}
                    {contest.status === 'voting' && `Voting ends ${formatDate(contest.voting_end_date)}`}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  <Users size={12} className="sm:w-[14px] sm:h-[14px] flex-shrink-0" />
                  <span>{contest.entry_count} entries</span>
                </div>
              </div>

              {(contest.winner_badge || contest.runner_up_badge || contest.participant_badge) && (
                <div className="mb-4 p-3 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-lg">
                  <p className="text-xs sm:text-sm font-medium text-emerald-800 dark:text-emerald-300 mb-2">
                    Badge Rewards
                  </p>
                  <div className="space-y-2">
                    {contest.winner_badge && (
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <Trophy size={14} className="text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                        <span className="text-emerald-900 dark:text-emerald-200">
                          <strong>1st:</strong> {contest.winner_badge.name} ({contest.winner_badge.rank} • {contest.winner_badge.points} pts)
                        </span>
                      </div>
                    )}
                    {contest.runner_up_badge && (
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <Medal size={14} className="text-slate-400 flex-shrink-0" />
                        <span className="text-emerald-900 dark:text-emerald-200">
                          <strong>2nd-3rd:</strong> {contest.runner_up_badge.name} ({contest.runner_up_badge.rank} • {contest.runner_up_badge.points} pts)
                        </span>
                      </div>
                    )}
                    {contest.participant_badge && (
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <Shield size={14} className="text-blue-500 flex-shrink-0" />
                        <span className="text-emerald-900 dark:text-emerald-200">
                          <strong>All:</strong> {contest.participant_badge.name} ({contest.participant_badge.rank} • {contest.participant_badge.points} pts)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {contest.status === 'active' && (
                <button
                  disabled={contest.user_has_entered}
                  className={`w-full px-4 py-2 rounded-lg font-medium transition-colors touch-manipulation text-sm sm:text-base ${
                    contest.user_has_entered
                      ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white'
                  }`}
                >
                  {contest.user_has_entered ? 'Already Entered' : 'Submit Entry'}
                </button>
              )}

              {contest.status === 'voting' && (
                <button
                  className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white rounded-lg font-medium transition-colors touch-manipulation flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <ThumbsUp size={14} className="sm:w-4 sm:h-4" />
                  Vote Now
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
