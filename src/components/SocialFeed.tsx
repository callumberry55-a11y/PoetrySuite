import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Heart, MessageSquare, BookmarkPlus, BookmarkCheck, UserPlus, UserCheck } from 'lucide-react';

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

export default function SocialFeed() {
  const { user } = useAuth();
  const [feed, setFeed] = useState<FeedPoem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'following' | 'discover'>('discover');

  useEffect(() => {
    if (user) {
      loadFeed();
    }
  }, [user, filter]);

  const loadFeed = async () => {
    if (!user) return;

    setLoading(true);

    let query = supabase
      .from('poems')
      .select(`
        id,
        title,
        content,
        created_at,
        user_id,
        user_profiles!inner(username)
      `)
      .eq('is_public', true)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(50);

    if (filter === 'following') {
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

    if (error) {
      console.error('Error loading feed:', error);
      setLoading(false);
      return;
    }

    const feedItems = await Promise.all(
      (poems || []).map(async (poem: any) => {
        const { count: likeCount } = await supabase
          .from('reactions')
          .select('id', { count: 'exact', head: true })
          .eq('poem_id', poem.id);

        const { count: commentCount } = await supabase
          .from('comments')
          .select('id', { count: 'exact', head: true })
          .eq('poem_id', poem.id);

        const { data: userLike } = await supabase
          .from('reactions')
          .select('id')
          .eq('poem_id', poem.id)
          .eq('user_id', user.id)
          .maybeSingle();

        const { data: userBookmark } = await supabase
          .from('bookmarks')
          .select('id')
          .eq('poem_id', poem.id)
          .eq('user_id', user.id)
          .maybeSingle();

        const { data: userFollow } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', poem.user_id)
          .maybeSingle();

        return {
          id: poem.id,
          title: poem.title,
          content: poem.content,
          created_at: poem.created_at,
          user_id: poem.user_id,
          username: poem.user_profiles.username,
          like_count: likeCount || 0,
          comment_count: commentCount || 0,
          user_has_liked: !!userLike,
          user_has_bookmarked: !!userBookmark,
          user_is_following: !!userFollow,
        };
      })
    );

    setFeed(feedItems);
    setLoading(false);
  };

  const toggleLike = async (poemId: string) => {
    if (!user) return;

    const poem = feed.find(p => p.id === poemId);
    if (!poem) return;

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

    loadFeed();
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

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 sm:py-8 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Poetry Feed</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('discover')}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors touch-manipulation text-sm sm:text-base ${
              filter === 'discover'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-600'
            }`}
          >
            Discover
          </button>
          <button
            onClick={() => setFilter('following')}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors touch-manipulation text-sm sm:text-base ${
              filter === 'following'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-600'
            }`}
          >
            Following
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : feed.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500 dark:text-slate-400">
            {filter === 'following'
              ? 'Follow some poets to see their work here'
              : 'No poems to display yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {feed.map((poem) => (
            <article
              key={poem.id}
              className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 sm:p-6"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold flex-shrink-0 text-sm sm:text-base">
                    {poem.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base truncate">{poem.username}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{formatDate(poem.created_at)}</div>
                  </div>
                </div>
                {poem.user_id !== user?.uid && (
                  <button
                    onClick={() => toggleFollow(poem.user_id)}
                    className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors touch-manipulation flex-shrink-0 ${
                      poem.user_is_following
                        ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                        : 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700'
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

              <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-2 sm:mb-3">{poem.title}</h3>
              <div className="text-sm sm:text-base text-slate-600 dark:text-slate-400 whitespace-pre-wrap font-serif mb-3 sm:mb-4 line-clamp-6">
                {poem.content}
              </div>

              <div className="flex items-center gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => toggleLike(poem.id)}
                  className={`flex items-center gap-1.5 sm:gap-2 transition-colors touch-manipulation ${
                    poem.user_has_liked
                      ? 'text-red-500'
                      : 'text-slate-500 dark:text-slate-400 hover:text-red-500 active:text-red-600'
                  }`}
                >
                  <Heart size={16} className="sm:w-[18px] sm:h-[18px]" fill={poem.user_has_liked ? 'currentColor' : 'none'} />
                  <span className="text-xs sm:text-sm font-medium">{poem.like_count}</span>
                </button>
                <button className="flex items-center gap-1.5 sm:gap-2 text-slate-500 dark:text-slate-400 hover:text-blue-500 active:text-blue-600 transition-colors touch-manipulation">
                  <MessageSquare size={16} className="sm:w-[18px] sm:h-[18px]" />
                  <span className="text-xs sm:text-sm font-medium">{poem.comment_count}</span>
                </button>
                <button
                  onClick={() => toggleBookmark(poem.id)}
                  className={`flex items-center gap-1.5 sm:gap-2 transition-colors ml-auto touch-manipulation ${
                    poem.user_has_bookmarked
                      ? 'text-blue-500'
                      : 'text-slate-500 dark:text-slate-400 hover:text-blue-500 active:text-blue-600'
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
          ))}
        </div>
      )}
    </div>
  );
}
