import { useState, useEffect } from 'react';
import { FileText, Plus, Calendar, Tag } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  entry_date: string;
  mood?: string;
  tags: string[];
}

export default function PoetryJournal() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newMood, setNewMood] = useState('');

  useEffect(() => {
    if (user) {
      fetchEntries();
    }
  }, [user]);

  const fetchEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('poems')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      setEntries(
        (data || []).map((poem) => ({
          id: poem.id,
          title: poem.title,
          content: poem.content,
          entry_date: poem.created_at,
          mood: '',
          tags: poem.tags || [],
        }))
      );
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const createEntry = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;

    try {
      const { error } = await supabase.from('poems').insert({
        title: newTitle,
        content: newContent,
        user_id: user?.id,
        is_public: false,
      });

      if (error) throw error;

      setNewTitle('');
      setNewContent('');
      setNewMood('');
      setShowForm(false);
      fetchEntries();
    } catch (error) {
      console.error('Error creating entry:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">Loading journal...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Poetry Journal</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Document your creative journey and thoughts
        </p>
      </div>

      <button
        onClick={() => setShowForm(!showForm)}
        className="mb-6 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        New Entry
      </button>

      {showForm && (
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-4">New Journal Entry</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Entry title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Content</label>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                rows={6}
                placeholder="Write your thoughts..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Mood (optional)</label>
              <input
                type="text"
                value={newMood}
                onChange={(e) => setNewMood(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="How are you feeling?"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={createEntry}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Save Entry
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

      <div className="space-y-4">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:border-primary transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">{entry.title}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(entry.entry_date).toLocaleDateString()}
                  </span>
                  {entry.mood && <span>Mood: {entry.mood}</span>}
                </div>
              </div>
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap line-clamp-3">
              {entry.content}
            </p>
            {entry.tags.length > 0 && (
              <div className="mt-4 flex items-center gap-2 flex-wrap">
                <Tag className="w-4 h-4 text-gray-400" />
                {entry.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {entries.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No journal entries yet. Start documenting your creative journey!
        </div>
      )}
    </div>
  );
}
