import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, Plus, Eye, Clock, Send, X, ArrowLeft, Pin, TrendingUp, Search, Filter } from 'lucide-react';

interface ForumCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  order_index: number;
}

interface ForumTopic {
  id: string;
  category_id: string;
  title: string;
  content: string;
  user_id: string;
  reply_count: number;
  view_count: number;
  is_pinned: boolean;
  created_at: string;
  last_activity_at: string;
  username?: string;
}

interface ForumReply {
  id: string;
  topic_id: string;
  content: string;
  user_id: string;
  created_at: string;
  username?: string;
}

export default function Forums() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<ForumTopic | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory && !selectedTopic) {
      loadTopics(selectedCategory);
    }
  }, [selectedCategory, selectedTopic]);

  useEffect(() => {
    if (selectedTopic) {
      loadReplies(selectedTopic.id);
      incrementViewCount(selectedTopic.id);
    }
  }, [selectedTopic]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;

      const mockCategories: ForumCategory[] = [
        { id: 'craft', name: 'Poetry Craft', description: 'Discuss techniques, forms, and writing methods', icon: '✍️', order_index: 1 },
        { id: 'feedback', name: 'Feedback & Critique', description: 'Get constructive feedback on your work', icon: '💬', order_index: 2 },
        { id: 'inspiration', name: 'Inspiration & Prompts', description: 'Share ideas and writing prompts', icon: '💡', order_index: 3 },
        { id: 'general', name: 'General Discussion', description: 'Talk about poetry and related topics', icon: '🗨️', order_index: 4 },
      ];

      setCategories((data && data.length > 0) ? data : mockCategories);
      if ((data && data.length > 0) || mockCategories.length > 0) {
        setSelectedCategory((data && data[0]?.id) || mockCategories[0].id);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTopics = async (categoryId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('forum_topics')
        .select('*')
        .eq('category_id', categoryId)
        .order('is_pinned', { ascending: false })
        .order('last_activity_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const topicsWithUsernames = await Promise.all(
        (data || []).map(async (topic) => {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('username')
            .eq('user_id', topic.user_id)
            .maybeSingle();

          return {
            ...topic,
            username: profile?.username || 'Anonymous'
          };
        })
      );

      setTopics(topicsWithUsernames);
    } catch (error) {
      console.error('Error loading topics:', error);
      setTopics([]);
    } finally {
      setLoading(false);
    }
  };

  const loadReplies = async (topicId: string) => {
    try {
      const { data, error } = await supabase
        .from('forum_replies')
        .select('*')
        .eq('topic_id', topicId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const repliesWithUsernames = await Promise.all(
        (data || []).map(async (reply) => {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('username')
            .eq('user_id', reply.user_id)
            .maybeSingle();

          return {
            ...reply,
            username: profile?.username || 'Anonymous'
          };
        })
      );

      setReplies(repliesWithUsernames);
    } catch (error) {
      console.error('Error loading replies:', error);
      setReplies([]);
    }
  };

  const incrementViewCount = async (topicId: string) => {
    try {
      await supabase.rpc('increment_topic_views', { topic_id: topicId });
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please sign in to create a topic');
      return;
    }

    try {
      const { error } = await supabase
        .from('forum_topics')
        .insert({
          category_id: selectedCategory,
          title: formData.title,
          content: formData.content,
          user_id: user.id,
          is_pinned: false,
          reply_count: 0,
          view_count: 0
        });

      if (error) throw error;

      setShowCreateModal(false);
      setFormData({ title: '', content: '' });
      if (selectedCategory) loadTopics(selectedCategory);
    } catch (error) {
      console.error('Error creating topic:', error);
      alert('Failed to create topic. Please try again.');
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedTopic) return;

    try {
      const { error } = await supabase
        .from('forum_replies')
        .insert({
          topic_id: selectedTopic.id,
          content: replyContent,
          user_id: user.id
        });

      if (error) throw error;

      await supabase
        .from('forum_topics')
        .update({
          reply_count: (selectedTopic.reply_count || 0) + 1,
          last_activity_at: new Date().toISOString()
        })
        .eq('id', selectedTopic.id);

      setReplyContent('');
      loadReplies(selectedTopic.id);
    } catch (error) {
      console.error('Error posting reply:', error);
      alert('Failed to post reply. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (selectedTopic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50 dark:from-gray-900 dark:via-emerald-900/10 dark:to-gray-900">
        <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* Back Button */}
          <button
            onClick={() => setSelectedTopic(null)}
            className="group flex items-center gap-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 mb-6 font-medium transition-all"
          >
            <div className="p-1.5 rounded-lg group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </div>
            Back to Topics
          </button>

          {/* Topic Card */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
            <div className="p-6 sm:p-8">
              <div className="flex items-start gap-4 mb-6">
                {selectedTopic.is_pinned && (
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                    <Pin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                    {selectedTopic.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                        {selectedTopic.username?.[0]?.toUpperCase() || 'A'}
                      </div>
                      <span className="font-medium">{selectedTopic.username}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatDate(selectedTopic.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{selectedTopic.view_count} views</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed whitespace-pre-wrap">
                  {selectedTopic.content}
                </p>
              </div>
            </div>
          </div>

          {/* Replies Section */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <MessageSquare className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
                </h2>
              </div>

              <div className="space-y-4 mb-8">
                {replies.map((reply, index) => (
                  <div
                    key={reply.id}
                    className="group relative pl-6 py-4 border-l-4 border-emerald-200 dark:border-emerald-800 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all rounded-r-lg hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                        {reply.username?.[0]?.toUpperCase() || 'A'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {reply.username}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(reply.created_at)}
                          </span>
                        </div>
                        <p className="mt-2 text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                          {reply.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {replies.length === 0 && (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                      No replies yet. Be the first to respond!
                    </p>
                  </div>
                )}
              </div>

              {user && (
                <form onSubmit={handleReply} className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <label className="block text-base font-semibold text-gray-900 dark:text-white mb-3">
                    Add Your Reply
                  </label>
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Share your thoughts, provide feedback, or ask questions..."
                    rows={5}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none"
                  />
                  <div className="flex justify-end mt-4">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-medium rounded-xl hover:from-emerald-700 hover:to-emerald-600 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Post Reply
                    </button>
                  </div>
                </form>
              )}

              {!user && (
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
                  <p className="text-gray-600 dark:text-gray-400">
                    Please sign in to join the conversation
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50 dark:from-gray-900 dark:via-emerald-900/10 dark:to-gray-900">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg shadow-emerald-500/30">
                <MessageSquare className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                  Discussion Forums
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Connect, share insights, and grow together
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="hidden sm:flex px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-medium rounded-xl hover:from-emerald-700 hover:to-emerald-600 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              New Topic
            </button>
          </div>

          {/* Mobile New Topic Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="sm:hidden w-full px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-medium rounded-xl hover:from-emerald-700 hover:to-emerald-600 shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Topic
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-6 space-y-3">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-1 mb-3">
                Categories
              </h2>
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => { setSelectedCategory(category.id); setSelectedTopic(null); }}
                  className={`group w-full text-left p-4 rounded-xl transition-all ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/30 scale-105'
                      : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`text-2xl transition-transform group-hover:scale-110 ${
                      selectedCategory === category.id ? 'drop-shadow-lg' : ''
                    }`}>
                      {category.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold truncate ${
                        selectedCategory === category.id
                          ? 'text-white'
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {category.name}
                      </h3>
                      <p className={`text-xs line-clamp-1 ${
                        selectedCategory === category.id
                          ? 'text-emerald-50'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {category.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Topics List */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Loading discussions...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {topics.length === 0 ? (
                  <div className="text-center py-16 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700">
                    <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      No discussions yet
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                      Be the first to start a conversation in this category
                    </p>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-medium rounded-xl hover:from-emerald-700 hover:to-emerald-600 shadow-lg shadow-emerald-500/30 transition-all inline-flex items-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Start Discussion
                    </button>
                  </div>
                ) : (
                  topics.map(topic => (
                    <div
                      key={topic.id}
                      onClick={() => setSelectedTopic(topic)}
                      className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-5 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-lg transition-all cursor-pointer"
                    >
                      <div className="flex items-start gap-4">
                        {topic.is_pinned && (
                          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex-shrink-0">
                            <Pin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                            {topic.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed">
                            {topic.content}
                          </p>
                          <div className="flex items-center justify-between gap-4 flex-wrap">
                            <div className="flex items-center gap-2 text-sm">
                              <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                {topic.username?.[0]?.toUpperCase() || 'A'}
                              </div>
                              <span className="text-gray-700 dark:text-gray-300 font-medium">
                                {topic.username}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                              <span className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                <MessageSquare className="w-3.5 h-3.5" />
                                {topic.reply_count || 0}
                              </span>
                              <span className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                <Eye className="w-3.5 h-3.5" />
                                {topic.view_count || 0}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                {formatDate(topic.last_activity_at || topic.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg shadow-emerald-500/30">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Create New Topic
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Start a new discussion with the community
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleCreateTopic} className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-160px)]">
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Topic Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="What would you like to discuss?"
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Content
                </label>
                <textarea
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Share your thoughts, questions, or ideas in detail..."
                  rows={10}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none"
                />
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Be clear and descriptive to get the best responses
                </p>
              </div>
            </form>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex gap-3">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleCreateTopic}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-medium rounded-xl hover:from-emerald-700 hover:to-emerald-600 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all"
              >
                Create Topic
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
