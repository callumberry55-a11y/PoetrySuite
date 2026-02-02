import { useState, useEffect } from 'react';
import { Trophy, BookOpen, TrendingUp, Users, X, Shield, Heart, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { runSecurityChecks } from '../utils/security';
import { CommentsSection } from './CommentsSection';

interface Poem {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
  username?: string;
  like_count?: number;
  comment_count?: number;
  user_has_liked?: boolean;
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

export default function Discover() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'feed' | 'contests' | 'trending' | 'following'>('feed');
  const [poems, setPoems] = useState<Poem[]>([]);
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPoem, setSelectedPoem] = useState<Poem | null>(null);
  const [securityStatus, setSecurityStatus] = useState<'active' | 'inactive' | 'checking'>('checking');

  useEffect(() => {
    if (activeTab === 'contests') {
      loadContests();
    } else {
      loadPoems();
    }
  }, [activeTab]);

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

  const loadPoems = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('poems')
        .select('id, title, content, user_id, created_at')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const poemsWithData = await Promise.all(
        (data || []).map(async (poem) => {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('username')
            .eq('user_id', poem.user_id)
            .maybeSingle();

          const { data: likeData } = await supabase
            .from('reactions')
            .select('id', { count: 'exact', head: true })
            .eq('poem_id', poem.id);

          const { data: commentData } = await supabase
            .from('comments')
            .select('id', { count: 'exact', head: true })
            .eq('poem_id', poem.id);

          const { data: userLike } = user ? await supabase
            .from('reactions')
            .select('id')
            .eq('poem_id', poem.id)
            .eq('user_id', user.id)
            .maybeSingle() : { data: null };

          return {
            ...poem,
            username: profile?.username || 'Anonymous',
            like_count: likeData?.length || 0,
            comment_count: commentData?.length || 0,
            user_has_liked: !!userLike,
          };
        })
      );

      setPoems(poemsWithData);
    } catch (error) {
      console.error('Failed to load poems:', error);
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

  const handleLike = async (poemId: string, currentlyLiked: boolean) => {
    if (!user) return;

    try {
      if (currentlyLiked) {
        const { error } = await supabase
          .from('reactions')
          .delete()
          .eq('poem_id', poemId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('reactions')
          .insert({ poem_id: poemId, user_id: user.id });

        if (error) throw error;
      }

      setPoems(poems.map(poem =>
        poem.id === poemId
          ? {
              ...poem,
              user_has_liked: !currentlyLiked,
              like_count: (poem.like_count || 0) + (currentlyLiked ? -1 : 1)
            }
          : poem
      ));

      if (selectedPoem?.id === poemId) {
        setSelectedPoem({
          ...selectedPoem,
          user_has_liked: !currentlyLiked,
          like_count: (selectedPoem.like_count || 0) + (currentlyLiked ? -1 : 1)
        });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const renderSecurityStatus = () => {
    switch (securityStatus) {
      case 'active':
        return (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <Shield size={18} />
            <span>AI Security Guard: Active</span>
          </div>
        );
      case 'inactive':
        return (
          <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
            <Shield size={18} />
            <span>AI Security Guard: Inactive</span>
          </div>
        );
      case 'checking':
        return (
          <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400">
            <Shield size={18} className="animate-pulse" />
            <span>AI Security Guard: Checking...</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-background to-secondary-container/20">
      <div className="p-6 border-b border-outline">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-on-background">AI Hub</h1>
          {renderSecurityStatus()}
        </div>

        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
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
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
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
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
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
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
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

      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : activeTab === 'contests' ? (
          <div className="space-y-6">
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
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Trophy className="text-tertiary" size={24} />
                          <h3 className="text-2xl font-bold text-on-surface">{contest.title}</h3>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
                            {contest.status}
                          </span>
                          <span className="px-3 py-1 rounded-full text-sm font-medium bg-tertiary-container text-on-tertiary-container">
                            {contest.theme}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-on-surface-variant mb-4 leading-relaxed">
                      {contest.description}
                    </p>

                    <div className="flex items-center gap-6 text-sm text-on-surface-variant mb-4">
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
          <div className="space-y-6">
            {poems.map((poem:Poem) => (
              <div
                key={poem.id}
                className="bg-surface rounded-xl shadow-sm border border-outline overflow-hidden hover:shadow-md transition-all"
              >
                <div
                  className="p-6 cursor-pointer"
                  onClick={() => setSelectedPoem(poem)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-on-surface mb-1">{poem.title}</h3>
                      <p className="text-sm text-on-surface-variant">
                        by {poem.username || 'Anonymous'}
                      </p>
                    </div>
                  </div>

                  <div className="prose dark:prose-invert max-w-none mb-4">
                    <p className="whitespace-pre-wrap line-clamp-6">{poem.content}</p>
                  </div>
                </div>

                <div className="px-6 pb-4 flex items-center gap-4 border-t border-outline pt-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(poem.id, poem.user_has_liked || false);
                    }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                      poem.user_has_liked
                        ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20'
                        : 'text-on-surface-variant hover:bg-surface-variant'
                    }`}
                  >
                    <Heart
                      size={18}
                      fill={poem.user_has_liked ? 'currentColor' : 'none'}
                    />
                    <span className="text-sm font-medium">{poem.like_count || 0}</span>
                  </button>

                  <button
                    onClick={() => setSelectedPoem(poem)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-on-surface-variant hover:bg-surface-variant transition-colors"
                  >
                    <MessageSquare size={18} />
                    <span className="text-sm font-medium">{poem.comment_count || 0}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Poem Detail Modal */}
        {selectedPoem && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-surface rounded-2xl shadow-2xl max-w-2xl w-full my-8">
              <div className="flex items-start justify-between p-6 border-b border-outline">
                <div>
                  <h2 className="text-2xl font-bold text-on-surface">{selectedPoem.title}</h2>
                  <p className="text-on-surface-variant mt-1">
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

              <div className="p-6 max-h-[60vh] overflow-y-auto">
                <div className="prose dark:prose-invert max-w-none mb-6">
                  <p className="whitespace-pre-wrap">{selectedPoem.content}</p>
                </div>

                <div className="flex items-center gap-4 pb-6 mb-6 border-b border-outline">
                  <button
                    onClick={() => handleLike(selectedPoem.id, selectedPoem.user_has_liked || false)}
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
