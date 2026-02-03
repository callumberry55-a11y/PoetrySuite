import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Award, Lock, Trophy, Star } from 'lucide-react';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rank: 'Fochlog' | 'Cli' | 'Anruth' | 'Ollamh';
  category: string;
  requirement_type: string;
  requirement_value: number;
  points: number;
  earned: boolean;
  earned_at?: string;
  progress?: number;
}

export default function Badges() {
  const { user } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'earned' | 'locked'>('all');
  const [rankFilter, setRankFilter] = useState<string>('all');

  useEffect(() => {
    if (user) {
      loadBadges();
    }
  }, [user]);

  const loadBadges = async () => {
    if (!user) return;

    const { data: allBadges, error: badgesError } = await supabase
      .from('badges')
      .select('*')
      .order('points', { ascending: false });

    if (badgesError) {
      console.error('Error loading badges:', badgesError);
      setLoading(false);
      return;
    }

    const { data: userBadges, error: userBadgesError } = await supabase
      .from('user_badges')
      .select('badge_id, earned_at')
      .eq('user_id', user.id);

    if (userBadgesError) {
      console.error('Error loading user badges:', userBadgesError);
    }

    const earnedBadgeIds = new Set(userBadges?.map(ub => ub.badge_id) || []);
    const earnedBadgeMap = new Map(userBadges?.map(ub => [ub.badge_id, ub.earned_at]) || []);

    const badgesWithStatus = (allBadges || []).map(badge => ({
      ...badge,
      earned: earnedBadgeIds.has(badge.id),
      earned_at: earnedBadgeMap.get(badge.id)
    }));

    setBadges(badgesWithStatus);
    setLoading(false);
  };

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'Ollamh':
        return 'from-yellow-400 to-yellow-600';
      case 'Anruth':
        return 'from-blue-400 to-blue-600';
      case 'Cli':
        return 'from-green-400 to-green-600';
      case 'Fochlog':
        return 'from-slate-400 to-slate-600';
      default:
        return 'from-slate-400 to-slate-600';
    }
  };

  const getRankLabel = (rank: string) => {
    switch (rank) {
      case 'Ollamh':
        return 'Master';
      case 'Anruth':
        return 'Expert';
      case 'Cli':
        return 'Journeyman';
      case 'Fochlog':
        return 'Apprentice';
      default:
        return rank;
    }
  };

  const filteredBadges = badges.filter(badge => {
    if (filter === 'earned' && !badge.earned) return false;
    if (filter === 'locked' && badge.earned) return false;
    if (rankFilter !== 'all' && badge.rank !== rankFilter) return false;
    return true;
  });

  const earnedCount = badges.filter(b => b.earned).length;
  const totalPoints = badges.filter(b => b.earned).reduce((sum, b) => sum + b.points, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8 pb-24">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1 sm:mb-2">
          Badges
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
          Earn badges by achieving milestones in your poetry journey
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-3 sm:p-4 text-center">
          <Trophy className="mx-auto mb-2 text-yellow-500" size={20} />
          <div className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white">
            {earnedCount}
          </div>
          <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Earned</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-3 sm:p-4 text-center">
          <Star className="mx-auto mb-2 text-blue-500" size={20} />
          <div className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white">
            {totalPoints}
          </div>
          <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Points</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-3 sm:p-4 text-center">
          <Award className="mx-auto mb-2 text-green-500" size={20} />
          <div className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white">
            {badges.length}
          </div>
          <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Total</div>
        </div>
      </div>

      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              filter === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('earned')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              filter === 'earned'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            Earned
          </button>
          <button
            onClick={() => setFilter('locked')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              filter === 'locked'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            Locked
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {['all', 'Fochlog', 'Cli', 'Anruth', 'Ollamh'].map((rank) => (
            <button
              key={rank}
              onClick={() => setRankFilter(rank)}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                rankFilter === rank
                  ? 'bg-green-500 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {rank === 'all' ? 'All Ranks' : getRankLabel(rank)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredBadges.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg">
          <p className="text-slate-500 dark:text-slate-400">No badges found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredBadges.map((badge) => (
            <div
              key={badge.id}
              className={`bg-white dark:bg-slate-800 rounded-lg p-4 sm:p-6 relative overflow-hidden ${
                badge.earned ? 'ring-2 ring-green-500' : 'opacity-60'
              }`}
            >
              {badge.earned && (
                <div className="absolute top-2 right-2">
                  <div className="bg-green-500 text-white rounded-full p-1">
                    <Award size={14} />
                  </div>
                </div>
              )}

              <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br ${getRankColor(badge.rank)} flex items-center justify-center mx-auto mb-3 sm:mb-4 ${
                !badge.earned && 'opacity-40'
              }`}>
                {badge.earned ? (
                  <Trophy className="text-white" size={28} />
                ) : (
                  <Lock className="text-white" size={28} />
                )}
              </div>

              <div className="text-center mb-3">
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-1">
                  {badge.name}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-2">
                  {badge.description}
                </p>
                <div className={`inline-block px-2 py-1 rounded text-xs font-medium bg-gradient-to-r ${getRankColor(badge.rank)} text-white`}>
                  {getRankLabel(badge.rank)} • {badge.points} pts
                </div>
              </div>

              {badge.earned && badge.earned_at && (
                <div className="text-center text-xs text-slate-500 dark:text-slate-500 mt-2">
                  Earned {new Date(badge.earned_at).toLocaleDateString()}
                </div>
              )}

              {!badge.earned && (
                <div className="mt-3 text-center">
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    Requirement: {badge.requirement_value} {badge.requirement_type.replace(/_/g, ' ')}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
