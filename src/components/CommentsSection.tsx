import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Trash2, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Comment {
  id: string;
  poem_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  username?: string;
}

interface CommentsSectionProps {
  poemId: string;
}

export function CommentsSection({ poemId }: CommentsSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadComments = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          poem_id,
          user_id,
          content,
          created_at,
          updated_at
        `)
        .eq('poem_id', poemId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const commentsWithUsernames = await Promise.all(
        (data || []).map(async (comment) => {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('username')
            .eq('user_id', comment.user_id)
            .maybeSingle();

          return {
            ...comment,
            username: profile?.username || 'Anonymous',
          };
        })
      );

      setComments(commentsWithUsernames);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  }, [poemId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    const commentContent = newComment.trim();
    setNewComment('');

    try {
      setSubmitting(true);
      const { data, error } = await supabase.from('comments').insert({
        poem_id: poemId,
        user_id: user.id,
        content: commentContent,
      }).select().single();

      if (error) throw error;

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('username')
        .eq('user_id', user.id)
        .maybeSingle();

      const newCommentData: Comment = {
        ...data,
        username: profile?.username || 'Anonymous',
      };

      setComments([...comments, newCommentData]);
    } catch (error) {
      console.error('Error posting comment:', error);
      setNewComment(commentContent);
      alert('Failed to post comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return;

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      setComments(comments.filter((c) => c.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-on-surface-variant">
        <MessageSquare size={20} />
        <h3 className="font-semibold">
          Comments ({comments.length})
        </h3>
      </div>

      {loading ? (
        <div className="text-center py-8 text-on-surface-variant">
          Loading comments...
        </div>
      ) : (
        <>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {comments.length === 0 ? (
              <p className="text-center py-8 text-on-surface-variant">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-surface-variant rounded-lg p-3 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold text-on-surface">
                          {comment.username}
                        </span>
                        <span className="text-on-surface-variant text-xs">
                          {formatDate(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-on-surface mt-1 whitespace-pre-wrap break-words">
                        {comment.content}
                      </p>
                    </div>
                    {user && user.id === comment.user_id && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="flex-shrink-0 p-1.5 rounded-lg hover:bg-error-container hover:text-error transition-colors"
                        aria-label="Delete comment"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {user && (
            <form onSubmit={handleSubmitComment} className="space-y-3">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full px-4 py-3 bg-surface-variant text-on-surface rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
                maxLength={500}
              />
              <div className="flex items-center justify-between">
                <span className="text-sm text-on-surface-variant">
                  {newComment.length}/500
                </span>
                <button
                  type="submit"
                  disabled={!newComment.trim() || submitting}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={16} />
                  {submitting ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
}
