import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Users, Plus, Send } from 'lucide-react';

interface CollaborativePoem {
  id: string;
  title: string;
  content: string;
  mode: 'exquisite_corpse' | 'open';
  status: 'active' | 'completed';
  creator_id: string;
  max_contributors: number;
  contributor_count: number;
  created_at: string;
}

interface Contribution {
  id: string;
  user_id: string;
  username: string;
  contribution: string;
  position: number;
  contributed_at: string;
}

interface RawContribution {
  id: string;
  user_id: string;
  contribution: string;
  position: number;
  contributed_at: string;
  user_profiles: {
    username: string;
  }[];
}

export default function Collaborative() {
  const { user } = useAuth();
  const [poems, setPoems] = useState<CollaborativePoem[]>([]);
  const [selectedPoem, setSelectedPoem] = useState<string | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [newContribution, setNewContribution] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPoem, setNewPoem] = useState({
    title: '',
    mode: 'open' as 'open' | 'exquisite_corpse',
    max_contributors: 10
  });

  const loadPoems = useCallback(async () => {
    const { data, error } = await supabase
      .from('collaborative_poems')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading poems:', error);
      return;
    }

    const poemsWithCounts = await Promise.all(
      (data || []).map(async (poem) => {
        const { count } = await supabase
          .from('poem_collaborators')
          .select('id', { count: 'exact', head: true })
          .eq('collaborative_poem_id', poem.id);

        return {
          ...poem,
          contributor_count: count || 0
        };
      })
    );

    setPoems(poemsWithCounts);
  }, []);

  const loadContributions = useCallback(async (poemId: string) => {
    const { data, error } = await supabase
      .from('poem_collaborators')
      .select(`
        id,
        user_id,
        contribution,
        position,
        contributed_at,
        user_profiles!inner(username)
      `)
      .eq('collaborative_poem_id', poemId)
      .order('position', { ascending: true });

    if (error) {
      console.error('Error loading contributions:', error);
      return;
    }

    setContributions((data || []).map((c: RawContribution) => ({
      id: c.id,
      user_id: c.user_id,
      username: c.user_profiles[0]?.username || 'Anonymous',
      contribution: c.contribution,
      position: c.position,
      contributed_at: c.contributed_at
    })));
  }, []);

  useEffect(() => {
    if (user) {
      loadPoems();
    }
  }, [user, loadPoems]);

  useEffect(() => {
    if (selectedPoem) {
      loadContributions(selectedPoem);
    }
  }, [selectedPoem, loadContributions]);

  const createPoem = async () => {
    if (!user || !newPoem.title.trim()) return;

    const { error } = await supabase
      .from('collaborative_poems')
      .insert([{
        creator_id: user.id,
        ...newPoem,
        content: '',
        status: 'active'
      }]);

    if (error) {
      console.error('Error creating poem:', error);
      alert('Failed to create collaborative poem');
      return;
    }

    setShowCreateForm(false);
    setNewPoem({ title: '', mode: 'open', max_contributors: 10 });
    loadPoems();
  };

  const addContribution = async () => {
    if (!user || !selectedPoem || !newContribution.trim()) return;

    const nextPosition = contributions.length + 1;

    const { error } = await supabase
      .from('poem_collaborators')
      .insert([{
        collaborative_poem_id: selectedPoem,
        user_id: user.id,
        contribution: newContribution,
        position: nextPosition
      }]);

    if (error) {
      console.error('Error adding contribution:', error);
      alert('Failed to add contribution');
      return;
    }

    setNewContribution('');
    loadContributions(selectedPoem);
    loadPoems();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Collaborative Poems</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
        >
          <Plus size={18} />
          Start Collaboration
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Start a Collaborative Poem</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Title
              </label>
              <input
                type="text"
                value={newPoem.title}
                onChange={(e) => setNewPoem({ ...newPoem, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                placeholder="Give your collaborative poem a title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Mode
              </label>
              <select
                value={newPoem.mode}
                onChange={(e) => setNewPoem({ ...newPoem, mode: e.target.value as 'open' | 'exquisite_corpse' })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              >
                <option value="open">Open (everyone can see all contributions)</option>
                <option value="exquisite_corpse">Exquisite Corpse (see only last line)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Max Contributors
              </label>
              <input
                type="number"
                value={newPoem.max_contributors}
                onChange={(e) => setNewPoem({ ...newPoem, max_contributors: parseInt(e.target.value) })}
                min="2"
                max="50"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={createPoem}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium"
              >
                Create
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Active Collaborations</h3>
            {poems.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No active collaborations</p>
            ) : (
              <div className="space-y-2">
                {poems.map((poem) => (
                  <button
                    key={poem.id}
                    onClick={() => setSelectedPoem(poem.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedPoem === poem.id
                        ? 'bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-500'
                        : 'bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600'
                    }`}
                  >
                    <div className="font-medium text-slate-900 dark:text-white mb-1">{poem.title}</div>
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <Users size={12} />
                        {poem.contributor_count}/{poem.max_contributors}
                      </div>
                      <span className="capitalize">{poem.mode.replace('_', ' ')}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedPoem ? (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Contributions</h3>
              <div className="space-y-4 mb-6">
                {contributions.length === 0 ? (
                  <p className="text-slate-500 dark:text-slate-400 text-center py-4">
                    Be the first to contribute!
                  </p>
                ) : (
                  contributions.map((contribution, index) => (
                    <div
                      key={contribution.id}
                      className="border-l-4 border-purple-500 pl-4 py-2"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-purple-500">#{index + 1}</span>
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          {contribution.username}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 font-serif">
                        {contribution.contribution}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Add Your Contribution</h4>
                <textarea
                  value={newContribution}
                  onChange={(e) => setNewContribution(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-serif mb-2"
                  placeholder="Write your contribution..."
                />
                <button
                  onClick={addContribution}
                  disabled={!newContribution.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-slate-400 text-white rounded-lg font-medium transition-colors"
                >
                  <Send size={16} />
                  Submit Contribution
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 text-center">
              <p className="text-slate-500 dark:text-slate-400">Select a collaboration to view and contribute</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
