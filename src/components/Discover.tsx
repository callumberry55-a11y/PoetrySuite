import { useState, useEffect } from 'react';
import { Search, Trophy, BookOpen, TrendingUp, Users, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Poem {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
  user_profiles?: {
      username: string;
      display_name: string;
  };
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
  const [activeTab, setActiveTab] = useState<'feed' | 'contests' | 'trending' | 'following'>('feed');
  const [poems, setPoems] = useState<Poem[]>([]);
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPoem, setSelectedPoem] = useState<Poem | null>(null);

  useEffect(() => {
    if (activeTab === 'contests') {
      loadContests();
    } else {
      loadPoems();
    }
  }, [activeTab]);

  const loadPoems = async () => {
    setLoading(true);
    try {
      const query = supabase
        .from('poems')
        .select(`
          id,
          title,
          content,
          user_id,
          created_at,
          user_profiles(username, display_name)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(20);

      const { data, error } = await query;

      if (error) throw error;

      const poemsData = data?.map(p => ({
          ...p,
          user_profiles: Array.isArray(p.user_profiles) ? p.user_profiles[0] : p.user_profiles
      })) || [];

      setPoems(poemsData as unknown as Poem[]);
    } catch {
      console.debug('Failed to load poems');
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
    } catch {
      console.debug('Failed to load contests');
    } finally {
      setLoading(false);
    }
  };

  const filteredPoems = poems.filter(poem =>
    poem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    poem.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
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
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Trophy className="text-amber-500" size={24} />
                          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{contest.title}</h3>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
                            {contest.status}
                          </span>
                          <span className="px-3 py-1 rounded-full text-sm font-medium bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
                            {contest.theme}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
                      {contest.description}
                    </p>

                    <div className="flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400 mb-4">
                      <div>
                        <span className="font-medium">Submissions:</span> {new Date(contest.start_date).toLocaleDateString()} - {new Date(contest.end_date).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Voting ends:</span> {new Date(contest.voting_end_date).toLocaleDateString()}
                      </div>
                    </div>

                    {contest.status === 'active' && (
                      <button
                        className="w-full mt-4 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
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
                <Trophy className="mx-auto mb-4 text-slate-400" size={48} />
                <p className="text-slate-600 dark:text-slate-400">No contests available</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredPoems.map(poem => (
              <div
                key={poem.id}
                onClick={() => setSelectedPoem(poem)}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-all cursor-pointer"
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

        {/* Poem Detail Modal */}
        {selectedPoem && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full my-8">
              <div className="flex items-start justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedPoem.title}</h2>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    by {selectedPoem.user_profiles?.display_name || selectedPoem.user_profiles?.username || 'Anonymous'}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPoem(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  aria-label="Close"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 max-h-96 overflow-y-auto">
                <div className="prose dark:prose-invert max-w-none mb-6">
                  <p className="whitespace-pre-wrap">{selectedPoem.content}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
