import { useState, useEffect } from 'react';
import { BookCopy, Plus, Edit2, Trash2, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Manuscript {
  id: string;
  title: string;
  description: string;
  poem_count: number;
  created_at: string;
}

export default function ManuscriptManager() {
  const { user } = useAuth();
  const [manuscripts, setManuscripts] = useState<Manuscript[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');

  useEffect(() => {
    if (user) {
      fetchManuscripts();
    }
  }, [user]);

  const fetchManuscripts = async () => {
    try {
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_public', false)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const manuscriptsData = await Promise.all(
        (data || []).map(async (collection) => {
          const { count } = await supabase
            .from('collection_poems')
            .select('*', { count: 'exact', head: true })
            .eq('collection_id', collection.id);

          return {
            id: collection.id,
            title: collection.name,
            description: collection.description || '',
            poem_count: count || 0,
            created_at: collection.created_at,
          };
        })
      );

      setManuscripts(manuscriptsData);
    } catch (error) {
      console.error('Error fetching manuscripts:', error);
    } finally {
      setLoading(false);
    }
  };

  const createManuscript = async () => {
    if (!newTitle.trim()) return;

    try {
      const { error } = await supabase.from('collections').insert({
        name: newTitle,
        description: newDescription,
        user_id: user?.id,
        is_public: false,
      });

      if (error) throw error;

      setNewTitle('');
      setNewDescription('');
      setShowForm(false);
      fetchManuscripts();
    } catch (error) {
      console.error('Error creating manuscript:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">Loading manuscripts...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Manuscript Manager</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Organize your poems into manuscripts for publication
        </p>
      </div>

      <button
        onClick={() => setShowForm(!showForm)}
        className="mb-6 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        New Manuscript
      </button>

      {showForm && (
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-4">Create New Manuscript</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter manuscript title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
                placeholder="Describe your manuscript"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={createManuscript}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Create
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {manuscripts.map((manuscript) => (
          <div
            key={manuscript.id}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:border-primary transition-all hover:shadow-lg"
          >
            <div className="flex items-start justify-between mb-4">
              <BookCopy className="w-8 h-8 text-primary" />
              <div className="flex gap-2">
                <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">{manuscript.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
              {manuscript.description || 'No description'}
            </p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {manuscript.poem_count} {manuscript.poem_count === 1 ? 'poem' : 'poems'}
              </span>
              <span className="text-gray-500 dark:text-gray-500">
                {new Date(manuscript.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {manuscripts.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No manuscripts yet. Create your first one to get started!
        </div>
      )}
    </div>
  );
}
