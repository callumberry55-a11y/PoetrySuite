import { useState, useEffect } from 'react';
import { Search, Heart, MessageCircle, Trophy, BookOpen, TrendingUp, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Poem {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
  views_count: number;
  shares_count: number;
  user_profiles?: {
    username: string;
    display_name: string;
  };
  reactions_count?: number;
  comments_count?: number;
}

export default function Discover() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'feed' | 'contests' | 'trending' | 'following'>('feed');
  const [poems, setPoems] = useState<Poem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadPoems();
  }, [activeTab]);

  const loadPoems = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('poems')
        .select(`
          *,
          user_profiles!inner(username, display_name)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(20);

      const { data, error } = await query;

      if (error) throw error;

      setPoems(data || []);
    } catch (error) {
      console.error('Error loading poems:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReact = async (poemId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('reactions')
        .insert({
          poem_id: poemId,
          user_id: user.id,
          reaction_type: 'like',
        });

      if (error) throw error;

      loadPoems();
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const filteredPoems = poems.filter(poem =>
    poem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    poem.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Discover Poetry</h1>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search poems..."
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === 'feed'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <BookOpen size={18} />
            Feed
          </button>
          <button
            onClick={() => setActiveTab('contests')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === 'contests'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <Trophy size={18} />
            Contests
          </button>
          <button
            onClick={() => setActiveTab('trending')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === 'trending'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <TrendingUp size={18} />
            Trending
          </button>
          <button
            onClick={() => setActiveTab('following')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === 'following'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
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
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {filteredPoems.map(poem => (
              <div
                key={poem.id}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{poem.title}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        by {poem.user_profiles?.display_name || poem.user_profiles?.username || 'Anonymous'}
                      </p>
                    </div>
                  </div>

                  <div className="prose dark:prose-invert max-w-none mb-4">
                    <p className="whitespace-pre-wrap line-clamp-6">{poem.content}</p>
                  </div>

                  <div className="flex items-center gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => handleReact(poem.id)}
                      className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      <Heart size={18} />
                      <span className="text-sm">{poem.reactions_count || 0}</span>
                    </button>
                    <button className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      <MessageCircle size={18} />
                      <span className="text-sm">{poem.comments_count || 0}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredPoems.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-600 dark:text-slate-400">No poems found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
