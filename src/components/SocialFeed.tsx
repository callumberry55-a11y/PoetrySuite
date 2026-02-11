import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Heart, MessageSquare, BookmarkPlus, BookmarkCheck, UserPlus, UserCheck, Trophy, BookOpen, TrendingUp, Users, X, Shield } from 'lucide-react';
import { runSecurityChecks } from '../utils/security';
import { CommentsSection } from './CommentsSection';
import Stories from './Stories';

interface FeedPoem {
  id: string;
  title: string;
  content: string;
  created_at: string;
  user_id: string;
  username: string;
  like_count: number;
  comment_count: number;
  user_has_liked: boolean;
  user_has_bookmarked: boolean;
  user_is_following: boolean;
}

interface Contest {
  id: string;
  title: string;
  description: string;
  theme: string;
  start_date: string;
  end_date: string;
  voting_end_date: string;
  status: string;
  created_at: string;
}

export default function SocialFeed() {
  const { user } = useAuth();
  const [feed, setFeed] = useState<FeedPoem[]>([]);
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'feed' | 'contests' | 'trending' | 'following'>('feed');
  const [selectedPoem, setSelectedPoem] = useState<FeedPoem | null>(null);
  const [securityStatus, setSecurityStatus] = useState<'active' | 'inactive' | 'checking'>('checking');

  const loadFeed = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('poems')
        .select('id, title, content, user_id, created_at')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(50);

      if (activeTab === 'following' && user) {
        const { data: follows } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user.id);

        const followingIds = follows?.map(f => f.following_id) || [];
        if (followingIds.length === 0) {
          setFeed([]);
          setLoading(false);
          return;
        }
        query = query.in('user_id', followingIds);
      }

      const { data: poems, error } = await query;

      if (error) throw error;

      const feedItems = await Promise.all(
        (poems || []).map(async (poem) => {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('username')
            .eq('user_id', poem.user_id)
            .maybeSingle();

          const { count: likeCount } = await supabase
            .from('reactions')
            .select('id', { count: 'exact', head: true })
            .eq('poem_id', poem.id);

          const { count: commentCount } = await supabase
            .from('comments')
            .select('id', { count: 'exact', head: true })
            .eq('poem_id', poem.id);

          const { data: userLike } = user ? await supabase
            .from('reactions')
            .select('id')
            .eq('poem_id', poem.id)
            .eq('user_id', user.id)
            .maybeSingle() : { data: null };

          const { data: userBookmark } = user ? await supabase
            .from('bookmarks')
            .select('id')
            .eq('poem_id', poem.id)
            .eq('user_id', user.id)
            .maybeSingle() : { data: null };

          const { data: userFollow } = user ? await supabase
            .from('follows')
            .select('id')
            .eq('follower_id', user.id)
            .eq('following_id', poem.user_id)
            .maybeSingle() : { data: null };

          return {
            id: poem.id,
            title: poem.title,
            content: poem.content,
            created_at: poem.created_at,
            user_id: poem.user_id,
            username: profile?.username || 'Anonymous',
            like_count: likeCount || 0,
            comment_count: commentCount || 0,
            user_has_liked: !!userLike,
            user_has_bookmarked: !!userBookmark,
            user_is_following: !!userFollow,
          };
        })
      );

      setFeed(feedItems);
    } catch (error) {
      console.error('Failed to load feed:', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, user]);

  const loadContests = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contests')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) throw error;
      setContests(data || []);
    } catch (error) {
      console.error('Failed to load contests:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'contests') {
      loadContests();
    } else {
      loadFeed();
    }
  }, [activeTab, user, loadContests, loadFeed]);

  useEffect(() => {
    const performCheck = async () => {
      setSecurityStatus('checking');
      const result = await runSecurityChecks('some-user-input');
      setSecurityStatus(result ? 'active' : 'inactive');
    };

    performCheck();
    const interval = setInterval(performCheck, 5000);

    return () => clearInterval(interval);
  }, []);

  const toggleLike = async (poemId: string) => {
    if (!user) {
      alert('Please sign in to like poems');
      return;
    }

    const poem = feed.find(p => p.id === poemId);
    if (!poem) return;

    const wasLiked = poem.user_has_liked;
    const previousCount = poem.like_count;

    setFeed(feed.map(p =>
      p.id === poemId
        ? {
            ...p,
            user_has_liked: !p.user_has_liked,
            like_count: p.like_count + (p.user_has_liked ? -1 : 1)
          }
        : p
    ));

    if (selectedPoem?.id === poemId) {
      setSelectedPoem({
        ...selectedPoem,
        user_has_liked: !selectedPoem.user_has_liked,
        like_count: selectedPoem.like_count + (selectedPoem.user_has_liked ? -1 : 1)
      });
    }

    try {
      if (wasLiked) {
        const { error } = await supabase
          .from('reactions')
          .delete()
          .eq('poem_id', poemId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('reactions')
          .insert([{ poem_id: poemId, user_id: user.id }]);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error toggling like:', error);

      setFeed(feed.map(p =>
        p.id === poemId
          ? {
              ...p,
              user_has_liked: wasLiked,
              like_count: previousCount
            }
          : p
      ));

      if (selectedPoem?.id === poemId) {
        setSelectedPoem({
          ...selectedPoem,
          user_has_liked: wasLiked,
          like_count: previousCount
        });
      }

      alert('Failed to update like. Please try again.');
    }
  };

  const toggleBookmark = async (poemId: string) => {
    if (!user) return;

    const poem = feed.find(p => p.id === poemId);
    if (!poem) return;

    if (poem.user_has_bookmarked) {
      await supabase
        .from('bookmarks')
        .delete()
        .eq('poem_id', poemId)
        .eq('user_id', user.id);
    } else {
      await supabase
        .from('bookmarks')
        .insert([{ poem_id: poemId, user_id: user.id }]);
    }

    loadFeed();
  };

  const toggleFollow = async (authorId: string) => {
    if (!user || authorId === user.id) return;

    const poem = feed.find(p => p.user_id === authorId);
    if (!poem) return;

    if (poem.user_is_following) {
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', authorId);
    } else {
      await supabase
        .from('follows')
        .insert([{ follower_id: user.id, following_id: authorId }]);
    }

    loadFeed();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderSecurityStatus = () => {
    switch (securityStatus) {
      case 'active':
        return (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <Shield size={18} />
            <span className="hidden sm:inline">AI Security Guard: Active</span>
            <span className="sm:hidden">Security Active</span>
          </div>
        );
      case 'inactive':
        return (
          <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
            <Shield size={18} />
            <span className="hidden sm:inline">AI Security Guard: Inactive</span>
            <span className="sm:hidden">Security Inactive</span>
          </div>
        );
      case 'checking':
        return (
          <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400">
            <Shield size={18} className="animate-pulse" />
            <span className="hidden sm:inline">AI Security Guard: Checking...</span>
            <span className="sm:hidden">Checking...</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              Poetry Feed
            </h1>
            {renderSecurityStatus()}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
            <button
              onClick={() => setActiveTab('feed')}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-semibold whitespace-nowrap transition-all text-sm sm:text-base ${
                activeTab === 'feed'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:scale-105'
              }`}
            >
              <BookOpen size={18} />
              <span>Feed</span>
            </button>
            <button
              onClick={() => setActiveTab('contests')}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-semibold whitespace-nowrap transition-all text-sm sm:text-base ${
                activeTab === 'contests'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-500/30 scale-105'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:scale-105'
              }`}
            >
              <Trophy size={18} />
              <span>Contests</span>
            </button>
            <button
              onClick={() => setActiveTab('trending')}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-semibold whitespace-nowrap transition-all text-sm sm:text-base ${
                activeTab === 'trending'
                  ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-500/30 scale-105'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:scale-105'
              }`}
            >
              <TrendingUp size={18} />
              <span>Trending</span>
            </button>
            <button
              onClick={() => setActiveTab('following')}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-semibold whitespace-nowrap transition-all text-sm sm:text-base ${
                activeTab === 'following'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30 scale-105'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:scale-105'
              }`}
            >
              <Users size={18} />
              <span>Following</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stories Section */}
      {activeTab === 'feed' && <Stories />}

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-700"></div>
              <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
            </div>
            <p className="mt-4 text-slate-600 dark:text-slate-400 font-medium">Loading feed...</p>
          </div>
        ) : activeTab === 'contests' ? (
          <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
            {contests.map(contest => {
              const statusConfig = contest.status === 'active'
                ? {
                    bg: 'bg-gradient-to-r from-emerald-500 to-teal-500',
                    text: 'text-white',
                    badge: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                  }
                : contest.status === 'voting'
                ? {
                    bg: 'bg-gradient-to-r from-blue-500 to-cyan-500',
                    text: 'text-white',
                    badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  }
                : {
                    bg: 'bg-gradient-to-r from-slate-500 to-slate-600',
                    text: 'text-white',
                    badge: 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300'
                  };

              return (
                <div
                  key={contest.id}
                  className="group bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
                >
                  <div className={`h-2 ${statusConfig.bg}`}></div>
                  <div className="p-6 sm:p-8">
                    <div className="flex items-start gap-4 mb-6">
                      <div className={`p-4 rounded-2xl ${statusConfig.bg} shadow-lg`}>
                        <Trophy className="text-white" size={32} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3 leading-tight">
                          {contest.title}
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide ${statusConfig.badge}`}>
                            {contest.status}
                          </span>
                          <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                            {contest.theme}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed text-base sm:text-lg">
                      {contest.description}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">Submissions Period</span>
                        <span className="text-slate-900 dark:text-white font-medium">
                          {new Date(contest.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(contest.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">Voting Ends</span>
                        <span className="text-slate-900 dark:text-white font-medium">
                          {new Date(contest.voting_end_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    {contest.status === 'active' && (
                      <button
                        className={`w-full px-6 py-4 ${statusConfig.bg} ${statusConfig.text} rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 group-hover:scale-105`}
                      >
                        <Trophy size={20} />
                        Submit Your Poem
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {contests.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="p-6 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-3xl mb-6">
                  <Trophy className="text-amber-600 dark:text-amber-400" size={64} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Contests Available</h3>
                <p className="text-slate-600 dark:text-slate-400">Check back soon for exciting poetry competitions</p>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-24">
            {feed.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="p-6 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-3xl mb-6">
                  <BookOpen className="text-blue-600 dark:text-blue-400" size={64} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {activeTab === 'following' ? 'No Posts Yet' : 'No Poems Available'}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {activeTab === 'following'
                    ? 'Follow some poets to see their work here'
                    : 'Be the first to share your poetry'}
                </p>
              </div>
            ) : (
              feed.map((poem) => (
                <article
                  key={poem.id}
                  className="group bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300"
                >
                  <div
                    className="p-5 sm:p-6 cursor-pointer"
                    onClick={() => setSelectedPoem(poem)}
                  >
                    <div className="flex items-center justify-between mb-4 gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="relative">
                          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg">
                            {poem.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-slate-900 dark:text-white text-sm sm:text-base truncate">{poem.username}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{formatDate(poem.created_at)}</div>
                        </div>
                      </div>
                      {poem.user_id !== user?.id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFollow(poem.user_id);
                          }}
                          className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all touch-manipulation flex-shrink-0 ${
                            poem.user_is_following
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                              : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-105'
                          }`}
                        >
                          {poem.user_is_following ? (
                            <>
                              <UserCheck size={14} />
                              <span>Following</span>
                            </>
                          ) : (
                            <>
                              <UserPlus size={14} />
                              <span>Follow</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-3 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {poem.title}
                    </h3>
                    <div className="prose dark:prose-invert max-w-none">
                      <p className="whitespace-pre-wrap line-clamp-6 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                        {poem.content}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 sm:px-6 pb-4 flex items-center gap-2 sm:gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(poem.id);
                      }}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all font-semibold ${
                        poem.user_has_liked
                          ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/50 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-rose-600 dark:hover:text-rose-400'
                      }`}
                    >
                      <Heart
                        size={18}
                        className={`transition-all ${poem.user_has_liked ? 'scale-110' : ''}`}
                        fill={poem.user_has_liked ? 'currentColor' : 'none'}
                      />
                      <span className="text-sm">{poem.like_count}</span>
                    </button>

                    <button
                      onClick={() => setSelectedPoem(poem)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-all font-semibold"
                    >
                      <MessageSquare size={18} />
                      <span className="text-sm">{poem.comment_count}</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(poem.id);
                      }}
                      className={`flex items-center gap-2 transition-all ml-auto touch-manipulation px-4 py-2.5 rounded-xl font-semibold ${
                        poem.user_has_bookmarked
                          ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-950/50 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-amber-600 dark:hover:text-amber-400'
                      }`}
                    >
                      {poem.user_has_bookmarked ? (
                        <BookmarkCheck size={18} fill="currentColor" />
                      ) : (
                        <BookmarkPlus size={18} />
                      )}
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        )}

        {selectedPoem && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-3xl w-full my-8 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
              <div className="relative">
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 rounded-t-3xl"></div>

                <div className="flex items-start justify-between p-6 sm:p-8 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex-1 pr-4">
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">
                      {selectedPoem.title}
                    </h2>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow">
                        {(selectedPoem.username || 'A').charAt(0).toUpperCase()}
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base font-semibold">
                        {selectedPoem.username || 'Anonymous'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedPoem(null)}
                    className="flex-shrink-0 p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all"
                    aria-label="Close"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="p-6 sm:p-8 max-h-[60vh] overflow-y-auto">
                  <div className="prose dark:prose-invert max-w-none mb-8">
                    <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-200 text-base sm:text-lg leading-relaxed">
                      {selectedPoem.content}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pb-8 mb-8 border-b border-slate-200 dark:border-slate-800">
                    <button
                      onClick={() => toggleLike(selectedPoem.id)}
                      className={`flex items-center gap-2.5 px-5 py-3 rounded-xl font-bold transition-all ${
                        selectedPoem.user_has_liked
                          ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/50 shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-rose-600 dark:hover:text-rose-400'
                      }`}
                    >
                      <Heart
                        size={20}
                        className={`transition-all ${selectedPoem.user_has_liked ? 'scale-110' : ''}`}
                        fill={selectedPoem.user_has_liked ? 'currentColor' : 'none'}
                      />
                      <span className="text-sm sm:text-base">
                        {selectedPoem.like_count || 0} {(selectedPoem.like_count || 0) === 1 ? 'Like' : 'Likes'}
                      </span>
                    </button>
                  </div>

                  <CommentsSection poemId={selectedPoem.id} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
