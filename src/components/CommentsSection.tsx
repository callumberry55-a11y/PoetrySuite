import { useState, useEffect, useCallback } from 'react';
import { Heart, MessageCircle, Trash2, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Comment {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  user_profiles?: {
    username: string;
    display_name: string;
  };
}

interface CommentsSectionProps {
  poemId: string;
}

export default function CommentsSection({ poemId }: CommentsSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [likes, setLikes] = useState<number>(0);
  const [userLiked, setUserLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  
  const loadCommentsAndLikes = useCallback(async () => {
    if (!poemId) return;
    setLoading(true);
    try {
      // Load comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select(`
          *,
          user_profiles(username, display_name)
        `)
        .eq('poem_id', poemId)
        .order('created_at', { ascending: false });

      if (commentsError) throw commentsError;
      setComments(commentsData || []);

      // Load likes count
      const { data: likesData, error: likesError } = await supabase
        .from('reactions')
        .select('id', { count: 'exact' })
        .eq('poem_id', poemId)
        .eq('reaction_type', 'like');

      if (likesError) throw likesError;
      setLikes(likesData?.length || 0);

      // Check if user liked
      if (user) {
        const { data: userLikeData } = await supabase
          .from('reactions')
          .select('id')
          .eq('poem_id', poemId)
          .eq('user_id', user.id)
          .eq('reaction_type', 'like')
          .maybeSingle();

        setUserLiked(!!userLikeData);
      }
    } catch {
      console.debug('Failed to load comments and likes');
    } finally {
      setLoading(false);
    }
  }, [poemId, user]);

  useEffect(() => {
    loadCommentsAndLikes();
  }, [poemId, loadCommentsAndLikes]);

  const handleLike = async () => {
    if (!user) {
      alert('Please log in to like poems');
      return;
    }

    try {
      if (userLiked) {
        // Unlike
        const { error } = await supabase
          .from('reactions')
          .delete()
          .eq('poem_id', poemId)
          .eq('user_id', user.id)
          .eq('reaction_type', 'like');

        if (error) throw error;
        setUserLiked(false);
        setLikes(Math.max(0, likes - 1));
      } else {
        // Like
        const { error } = await supabase
          .from('reactions')
          .insert({
            poem_id: poemId,
            user_id: user.id,
            reaction_type: 'like',
          });

        if (error) throw error;
        setUserLiked(true);
        setLikes(likes + 1);
      }
    } catch {
      console.debug('Failed to update like');
      alert('Failed to update like');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          poem_id: poemId,
          user_id: user.id,
          content: newComment.trim(),
        });

      if (error) throw error;

      setNewComment('');
      await loadCommentsAndLikes();
    } catch {
      console.debug('Failed to add comment');
      alert('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Delete this comment?')) return;

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user?.id);

      if (error) throw error;
      setComments(comments.filter(c => c.id !== commentId));
    } catch {
      console.debug('Failed to delete comment');
      alert('Failed to delete comment');
    }
  };

  if (loading) {
    return <div className="text-center py-4 text-slate-400">Loading comments...</div>;
  }

  return (
    <div className="space-y-6 py-6 border-t border-slate-200 dark:border-slate-700">
      {/* Like Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            userLiked
              ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
              : 'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
          aria-pressed={userLiked}
          aria-label={userLiked ? 'Unlike' : 'Like'}
        >
          <Heart size={20} fill={userLiked ? 'currentColor' : 'none'} />
          <span>{likes}</span>
        </button>
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <MessageCircle size={20} />
          <span>{comments.length}</span>
        </div>
      </div>

      {/* Add Comment Form */}
      {user && (
        <form onSubmit={handleAddComment} className="space-y-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts on this poem..."
            maxLength={500}
            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {newComment.length}/500
            </span>
            <button
              type="submit"
              disabled={!newComment.trim() || submittingComment}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
            >
              <Send size={16} />
              {submittingComment ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      )}

      {!user && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Sign in to like and comment on poems
          </p>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900 dark:text-white">
          Comments ({comments.length})
        </h3>

        {comments.length === 0 ? (
          <p className="text-slate-600 dark:text-slate-400 py-4">No comments yet. Be the first!</p>
        ) : (
          comments.map(comment => (
            <div
              key={comment.id}
              className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg space-y-2"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {comment.user_profiles?.display_name || comment.user_profiles?.username || 'Anonymous'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {new Date(comment.created_at).toLocaleDateString()} at{' '}
                    {new Date(comment.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                {user?.id === comment.user_id && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1"
                    aria-label="Delete comment"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words">
                {comment.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
