import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Heart, MessageSquare, BookmarkPlus, BookmarkCheck, UserPlus, UserCheck, Trophy, BookOpen, TrendingUp, Users, X, Shield } from 'lucide-react';
import { runSecurityChecks } from '../utils/security';
import { CommentsSection } from './CommentsSection';

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

  useEffect(() => {
    if (activeTab === 'contests') {
      loadContests();
    } else {
      loadFeed();
    }
  }, [activeTab, user]);

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

  const loadFeed = async () => {
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
  };

  const loadContests = async () => {
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
  };

  const toggleLike = async (poemId: string) => {
    if (!user) return;

    const poem = feed.find(p => p.id === poemId);
    if (!poem) return;

    try {
      if (poem.user_has_liked) {
        await supabase
          .from('reactions')
          .delete()
          .eq('poem_id', poemId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('reactions')
          .insert([{ poem_id: poemId, user_id: user.id }]);
      }

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
    } catch (error) {
      console.error('Error toggling like:', error);
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
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-background to-secondary-container/20">
      <div className="p-4 sm:p-6 border-b border-outline">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-on-background">Poetry Feed</h1>
          {renderSecurityStatus()}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors text-sm sm:text-base ${
              activeTab === 'feed'
                ? 'bg-primary text-on-primary'
                : 'bg-surface text-on-surface-variant hover:bg-surface-variant'
            }`}
          >
            <BookOpen size={18} />
            Feed
          </button>
          <button
            onClick={() => setActiveTab('contests')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors text-sm sm:text-base ${
              activeTab === 'contests'
                ? 'bg-primary text-on-primary'
                : 'bg-surface text-on-surface-variant hover:bg-surface-variant'
            }`}
          >
            <Trophy size={18} />
            Contests
          </button>
          <button
            onClick={() => setActiveTab('trending')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors text-sm sm:text-base ${
              activeTab === 'trending'
                ? 'bg-primary text-on-primary'
                : 'bg-surface text-on-surface-variant hover:bg-surface-variant'
            }`}
          >
            <TrendingUp size={18} />
            Trending
          </button>
          <button
            onClick={() => setActiveTab('following')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors text-sm sm:text-base ${
              activeTab === 'following'
                ? 'bg-primary text-on-primary'
                : 'bg-surface text-on-surface-variant hover:bg-surface-variant'
            }`}
          >
            <Users size={18} />
            Following
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : activeTab === 'contests' ? (
          <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
            {contests.map(contest => {
              const statusColor = contest.status === 'active'
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                : contest.status === 'voting'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300';

              return (
                <div
                  key={contest.id}
                  className="bg-surface rounded-xl shadow-sm border border-outline overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Trophy className="text-tertiary flex-shrink-0" size={24} />
                          <h3 className="text-xl sm:text-2xl font-bold text-on-surface">{contest.title}</h3>
                        </div>
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
                            {contest.status}
                          </span>
                          <span className="px-3 py-1 rounded-full text-sm font-medium bg-tertiary-container text-on-tertiary-container">
                            {contest.theme}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-on-surface-variant mb-4 leading-relaxed text-sm sm:text-base">
                      {contest.description}
                    </p>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-xs sm:text-sm text-on-surface-variant mb-4">
                      <div>
                        <span className="font-medium">Submissions:</span> {new Date(contest.start_date).toLocaleDateString()} - {new Date(contest.end_date).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Voting ends:</span> {new Date(contest.voting_end_date).toLocaleDateString()}
                      </div>
                    </div>

                    {contest.status === 'active' && (
                      <button
                        className="w-full mt-4 px-4 py-3 bg-primary hover:bg-primary/90 text-on-primary rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <Trophy size={18} />
                        Submit Your Poem
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {contests.length === 0 && (
              <div className="text-center py-12">
                <Trophy className="mx-auto mb-4 text-on-surface-variant" size={48} />
                <p className="text-on-surface-variant">No contests available</p>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6 pb-20">
            {feed.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-on-surface-variant">
                  {activeTab === 'following'
                    ? 'Follow some poets to see their work here'
                    : 'No poems to display yet'}
                </p>
              </div>
            ) : (
              feed.map((poem) => (
                <article
                  key={poem.id}
                  className="bg-surface rounded-xl shadow-sm border border-outline overflow-hidden hover:shadow-md transition-all"
                >
                  <div
                    className="p-4 sm:p-6 cursor-pointer"
                    onClick={() => setSelectedPoem(poem)}
                  >
                    <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary flex items-center justify-center text-on-primary font-semibold flex-shrink-0 text-sm sm:text-base">
                          {poem.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-on-surface text-sm sm:text-base truncate">{poem.username}</div>
                          <div className="text-xs text-on-surface-variant">{formatDate(poem.created_at)}</div>
                        </div>
                      </div>
                      {poem.user_id !== user?.id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFollow(poem.user_id);
                          }}
                          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors touch-manipulation flex-shrink-0 ${
                            poem.user_is_following
                              ? 'bg-surface-variant text-on-surface-variant'
                              : 'bg-primary text-on-primary hover:bg-primary/90'
                          }`}
                        >
                          {poem.user_is_following ? (
                            <>
                              <UserCheck size={12} className="sm:w-[14px] sm:h-[14px]" />
                              <span className="hidden sm:inline">Following</span>
                            </>
                          ) : (
                            <>
                              <UserPlus size={12} className="sm:w-[14px] sm:h-[14px]" />
                              <span className="hidden sm:inline">Follow</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold text-on-surface mb-2">{poem.title}</h3>
                    <div className="prose dark:prose-invert max-w-none mb-4">
                      <p className="whitespace-pre-wrap line-clamp-6 text-sm sm:text-base text-on-surface-variant">{poem.content}</p>
                    </div>
                  </div>

                  <div className="px-4 sm:px-6 pb-4 flex items-center gap-3 sm:gap-4 border-t border-outline pt-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(poem.id);
                      }}
                      className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                        poem.user_has_liked
                          ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20'
                          : 'text-on-surface-variant hover:bg-surface-variant'
                      }`}
                    >
                      <Heart
                        size={16}
                        className="sm:w-[18px] sm:h-[18px]"
                        fill={poem.user_has_liked ? 'currentColor' : 'none'}
                      />
                      <span className="text-xs sm:text-sm font-medium">{poem.like_count}</span>
                    </button>

                    <button
                      onClick={() => setSelectedPoem(poem)}
                      className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-lg text-on-surface-variant hover:bg-surface-variant transition-colors"
                    >
                      <MessageSquare size={16} className="sm:w-[18px] sm:h-[18px]" />
                      <span className="text-xs sm:text-sm font-medium">{poem.comment_count}</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(poem.id);
                      }}
                      className={`flex items-center gap-1.5 sm:gap-2 transition-colors ml-auto touch-manipulation px-3 py-1.5 rounded-lg ${
                        poem.user_has_bookmarked
                          ? 'text-primary hover:bg-primary/10'
                          : 'text-on-surface-variant hover:bg-surface-variant'
                      }`}
                    >
                      {poem.user_has_bookmarked ? (
                        <BookmarkCheck size={16} className="sm:w-[18px] sm:h-[18px]" fill="currentColor" />
                      ) : (
                        <BookmarkPlus size={16} className="sm:w-[18px] sm:h-[18px]" />
                      )}
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        )}

        {selectedPoem && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-surface rounded-2xl shadow-2xl max-w-2xl w-full my-8">
              <div className="flex items-start justify-between p-4 sm:p-6 border-b border-outline">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-on-surface">{selectedPoem.title}</h2>
                  <p className="text-on-surface-variant mt-1 text-sm sm:text-base">
                    by {selectedPoem.username || 'Anonymous'}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPoem(null)}
                  className="text-on-surface-variant hover:text-on-surface"
                  aria-label="Close"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto">
                <div className="prose dark:prose-invert max-w-none mb-6">
                  <p className="whitespace-pre-wrap text-on-surface">{selectedPoem.content}</p>
                </div>

                <div className="flex items-center gap-4 pb-6 mb-6 border-b border-outline">
                  <button
                    onClick={() => toggleLike(selectedPoem.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedPoem.user_has_liked
                        ? 'bg-red-50 text-red-500 dark:bg-red-950/20'
                        : 'bg-surface-variant text-on-surface-variant hover:bg-on-surface-variant/10'
                    }`}
                  >
                    <Heart
                      size={18}
                      fill={selectedPoem.user_has_liked ? 'currentColor' : 'none'}
                    />
                    <span>{selectedPoem.like_count || 0} {(selectedPoem.like_count || 0) === 1 ? 'Like' : 'Likes'}</span>
                  </button>
                </div>

                <CommentsSection poemId={selectedPoem.id} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
