import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Trophy, Clock, Users, ThumbsUp, Medal, Shield } from 'lucide-react';

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

  const loadContests = useCallback(async () => {
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
  }, [user]);

  useEffect(() => {
    if (user) {
      loadContests();
    }
  }, [user, loadContests]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400';
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'voting':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pb-24">
      <div className="relative bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600 h-32 sm:h-40">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <Trophy className="w-10 h-10 sm:w-12 sm:h-12 mb-2 animate-pulse" />
          <h1 className="text-2xl sm:text-4xl font-bold mb-1">Poetry Contests</h1>
          <p className="text-sm sm:text-base opacity-90">Compete for recognition and prizes</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-8 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-16 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-800"></div>
              <div className="absolute inset-0 rounded-full border-4 border-amber-600 border-t-transparent animate-spin"></div>
            </div>
          </div>
        ) : contests.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-700" />
            <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">No active contests at the moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {contests.map((contest) => (
              <div
                key={contest.id}
                className="group bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-800 p-6 sm:p-8 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="flex items-start justify-between mb-4 gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-2xl shadow-lg">
                        <Trophy className="text-white" size={24} />
                      </div>
                      <span className="truncate">{contest.title}</span>
                    </h3>
                    <span className={`inline-block px-4 py-2 rounded-xl text-sm font-bold shadow-lg ${getStatusColor(contest.status)}`}>
                      {contest.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-4 line-clamp-3 leading-relaxed">
                  {contest.description}
                </p>

                {contest.theme && (
                  <div className="mb-4 p-4 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-2xl border border-amber-200 dark:border-amber-800">
                    <p className="text-sm font-semibold text-amber-700 dark:text-amber-300 mb-1">
                      Theme
                    </p>
                    <p className="text-base text-slate-900 dark:text-white font-serif italic">
                      {contest.theme}
                    </p>
                  </div>
                )}

                <div className="space-y-2 mb-4 p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50 rounded-2xl">
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="text-slate-600 dark:text-slate-400 flex-shrink-0" size={16} />
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {contest.status === 'upcoming' && `Starts ${formatDate(contest.start_date)}`}
                      {contest.status === 'active' && `Ends ${formatDate(contest.end_date)}`}
                      {contest.status === 'voting' && `Voting ends ${formatDate(contest.voting_end_date)}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Users className="text-slate-600 dark:text-slate-400 flex-shrink-0" size={16} />
                    <span className="font-semibold text-slate-900 dark:text-white">{contest.entry_count} entries</span>
                  </div>
                </div>

                {(contest.winner_badge || contest.runner_up_badge || contest.participant_badge) && (
                  <div className="mb-6 p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border-2 border-emerald-200 dark:border-emerald-800">
                    <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300 mb-3">
                      Badge Rewards
                    </p>
                    <div className="space-y-2">
                      {contest.winner_badge && (
                        <div className="flex items-center gap-2 text-sm">
                          <Trophy className="text-yellow-600 dark:text-yellow-400 flex-shrink-0" size={16} />
                          <span className="text-emerald-900 dark:text-emerald-200 font-medium">
                            <strong>1st:</strong> {contest.winner_badge.name} ({contest.winner_badge.rank} • {contest.winner_badge.points} pts)
                          </span>
                        </div>
                      )}
                      {contest.runner_up_badge && (
                        <div className="flex items-center gap-2 text-sm">
                          <Medal className="text-slate-400 flex-shrink-0" size={16} />
                          <span className="text-emerald-900 dark:text-emerald-200 font-medium">
                            <strong>2nd-3rd:</strong> {contest.runner_up_badge.name} ({contest.runner_up_badge.rank} • {contest.runner_up_badge.points} pts)
                          </span>
                        </div>
                      )}
                      {contest.participant_badge && (
                        <div className="flex items-center gap-2 text-sm">
                          <Shield className="text-violet-500 flex-shrink-0" size={16} />
                          <span className="text-emerald-900 dark:text-emerald-200 font-medium">
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
                    className={`w-full px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 text-base ${
                      contest.user_has_entered
                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white hover:shadow-xl hover:scale-105'
                    }`}
                  >
                    {contest.user_has_entered ? 'Already Entered' : 'Submit Entry'}
                  </button>
                )}

                {contest.status === 'voting' && (
                  <button
                    className="w-full px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 text-base"
                  >
                    <ThumbsUp size={18} />
                    Vote Now
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
