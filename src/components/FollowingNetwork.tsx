import { useState, useEffect } from 'react';
import { Users, UserPlus, UserCheck, BookOpen, Trophy, TrendingUp, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Poet {
  user_id: string;
  username: string;
  display_name: string;
  bio: string;
  poem_count: number;
  follower_count: number;
  following_count: number;
  is_following: boolean;
}

export default function FollowingNetwork() {
  const { user } = useAuth();
  const [poets, setPoets] = useState<Poet[]>([]);
  const [following, setFollowing] = useState<Poet[]>([]);
  const [followers, setFollowers] = useState<Poet[]>([]);
  const [activeTab, setActiveTab] = useState<'discover' | 'following' | 'followers'>('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'discover') {
        const { data: profiles, error: profilesError } = await supabase
          .from('user_profiles')
          .select('*')
          .neq('user_id', user?.id)
          .limit(50);

        if (profilesError) throw profilesError;

        const poetsWithStats = await Promise.all(
          (profiles || []).map(async (profile) => {
            const { count: poemCount } = await supabase
              .from('poems')
              .select('id', { count: 'exact', head: true })
              .eq('user_id', profile.user_id)
              .eq('is_public', true);

            const { count: followerCount } = await supabase
              .from('follows')
              .select('id', { count: 'exact', head: true })
              .eq('following_id', profile.user_id);

            const { count: followingCount } = await supabase
              .from('follows')
              .select('id', { count: 'exact', head: true })
              .eq('follower_id', profile.user_id);

            const { data: followCheck } = await supabase
              .from('follows')
              .select('id')
              .eq('follower_id', user?.id)
              .eq('following_id', profile.user_id)
              .maybeSingle();

            return {
              user_id: profile.user_id,
              username: profile.username || 'Anonymous',
              display_name: profile.display_name || profile.username || 'Anonymous',
              bio: profile.bio || '',
              poem_count: poemCount || 0,
              follower_count: followerCount || 0,
              following_count: followingCount || 0,
              is_following: !!followCheck,
            };
          })
        );

        setPoets(poetsWithStats.sort((a, b) => b.follower_count - a.follower_count));
      } else if (activeTab === 'following') {
        const { data: followData, error: followError } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user?.id);

        if (followError) throw followError;

        const followingIds = followData?.map(f => f.following_id) || [];
        if (followingIds.length === 0) {
          setFollowing([]);
          setLoading(false);
          return;
        }

        const { data: profiles, error: profilesError } = await supabase
          .from('user_profiles')
          .select('*')
          .in('user_id', followingIds);

        if (profilesError) throw profilesError;

        const followingWithStats = await Promise.all(
          (profiles || []).map(async (profile) => {
            const { count: poemCount } = await supabase
              .from('poems')
              .select('id', { count: 'exact', head: true })
              .eq('user_id', profile.user_id)
              .eq('is_public', true);

            const { count: followerCount } = await supabase
              .from('follows')
              .select('id', { count: 'exact', head: true })
              .eq('following_id', profile.user_id);

            const { count: followingCount } = await supabase
              .from('follows')
              .select('id', { count: 'exact', head: true })
              .eq('follower_id', profile.user_id);

            return {
              user_id: profile.user_id,
              username: profile.username || 'Anonymous',
              display_name: profile.display_name || profile.username || 'Anonymous',
              bio: profile.bio || '',
              poem_count: poemCount || 0,
              follower_count: followerCount || 0,
              following_count: followingCount || 0,
              is_following: true,
            };
          })
        );

        setFollowing(followingWithStats);
      } else if (activeTab === 'followers') {
        const { data: followerData, error: followerError } = await supabase
          .from('follows')
          .select('follower_id')
          .eq('following_id', user?.id);

        if (followerError) throw followerError;

        const followerIds = followerData?.map(f => f.follower_id) || [];
        if (followerIds.length === 0) {
          setFollowers([]);
          setLoading(false);
          return;
        }

        const { data: profiles, error: profilesError } = await supabase
          .from('user_profiles')
          .select('*')
          .in('user_id', followerIds);

        if (profilesError) throw profilesError;

        const followersWithStats = await Promise.all(
          (profiles || []).map(async (profile) => {
            const { count: poemCount } = await supabase
              .from('poems')
              .select('id', { count: 'exact', head: true })
              .eq('user_id', profile.user_id)
              .eq('is_public', true);

            const { count: followerCount } = await supabase
              .from('follows')
              .select('id', { count: 'exact', head: true })
              .eq('following_id', profile.user_id);

            const { count: followingCount } = await supabase
              .from('follows')
              .select('id', { count: 'exact', head: true })
              .eq('follower_id', profile.user_id);

            const { data: followCheck } = await supabase
              .from('follows')
              .select('id')
              .eq('follower_id', user?.id)
              .eq('following_id', profile.user_id)
              .maybeSingle();

            return {
              user_id: profile.user_id,
              username: profile.username || 'Anonymous',
              display_name: profile.display_name || profile.username || 'Anonymous',
              bio: profile.bio || '',
              poem_count: poemCount || 0,
              follower_count: followerCount || 0,
              following_count: followingCount || 0,
              is_following: !!followCheck,
            };
          })
        );

        setFollowers(followersWithStats);
      }
    } catch (error) {
      console.error('Error loading poets:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFollow = async (poetId: string, currentlyFollowing: boolean) => {
    if (!user) return;

    try {
      if (currentlyFollowing) {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', poetId);
      } else {
        await supabase
          .from('follows')
          .insert({ follower_id: user.id, following_id: poetId });
      }

      loadData();
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const getDisplayList = () => {
    switch (activeTab) {
      case 'discover':
        return poets;
      case 'following':
        return following;
      case 'followers':
        return followers;
      default:
        return [];
    }
  };

  const filteredList = getDisplayList().filter(
    (poet) =>
      !searchQuery ||
      poet.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      poet.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      poet.bio.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Poetry Community
        </h1>
      </div>

      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Connect with fellow poets, follow their work, and build your writing community.
      </p>

      <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab('discover')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'discover'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Discover Poets
          </div>
        </button>
        <button
          onClick={() => setActiveTab('following')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'following'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            Following ({following.length})
          </div>
        </button>
        <button
          onClick={() => setActiveTab('followers')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'followers'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Followers ({followers.length})
          </div>
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search poets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredList.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              {searchQuery
                ? 'No poets found matching your search.'
                : activeTab === 'following'
                ? "You're not following anyone yet. Discover poets to connect with!"
                : activeTab === 'followers'
                ? 'No followers yet. Keep sharing your work to build your audience!'
                : 'No poets to discover right now.'}
            </div>
          ) : (
            filteredList.map((poet) => (
              <div
                key={poet.user_id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:border-emerald-400 dark:hover:border-emerald-600 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {poet.display_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 dark:text-white truncate">
                        {poet.display_name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        @{poet.username}
                      </p>
                    </div>
                  </div>
                </div>

                {poet.bio && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {poet.bio}
                  </p>
                )}

                <div className="flex items-center gap-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    <span>{poet.poem_count} poems</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{poet.follower_count} followers</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => toggleFollow(poet.user_id, poet.is_following)}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                      poet.is_following
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    {poet.is_following ? (
                      <>
                        <UserCheck className="w-4 h-4" />
                        Following
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        Follow
                      </>
                    )}
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    title="View Profile"
                  >
                    <BookOpen className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'discover' && filteredList.length > 0 && (
        <div className="mt-8 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800 p-6">
          <h3 className="font-bold text-emerald-900 dark:text-emerald-100 mb-3 flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Growing Your Network
          </h3>
          <ul className="text-sm text-emerald-800 dark:text-emerald-200 space-y-2">
            <li>• Follow poets whose work resonates with you</li>
            <li>• Engage with their poems through likes and comments</li>
            <li>• Share your own work regularly to attract followers</li>
            <li>• Participate in contests and challenges to gain visibility</li>
            <li>• Join book clubs and study groups to connect with like-minded writers</li>
          </ul>
        </div>
      )}
    </div>
  );
}
