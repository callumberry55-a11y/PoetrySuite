import { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface TagType {
  id: string;
  name: string;
  color: string;
  poem_count?: number;
}

export default function TagsManager() {
  const { user } = useAuth();
  const [tags, setTags] = useState<TagType[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3B82F6');
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [loading, setLoading] = useState(true);

  const colorOptions = [
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Green', value: '#10B981' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Yellow', value: '#F59E0B' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Indigo', value: '#6366F1' },
    { name: 'Orange', value: '#F97316' },
  ];

  useEffect(() => {
    if (user) {
      fetchTags();
    }
  }, [user]);

  const fetchTags = async () => {
    try {
      const { data: tagsData, error: tagsError } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', user?.id)
        .order('name');

      if (tagsError) throw tagsError;

      const tagsWithCounts = await Promise.all(
        (tagsData || []).map(async (tag) => {
          const { count } = await supabase
            .from('poem_tags')
            .select('*', { count: 'exact', head: true })
            .eq('tag_id', tag.id);

          return { ...tag, poem_count: count || 0 };
        })
      );

      setTags(tagsWithCounts);
    } catch (error) {
      console.error('Error fetching tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTag = async () => {
    if (!newTagName.trim()) return;

    try {
      const { error } = await supabase
        .from('tags')
        .insert({
          user_id: user?.id,
          name: newTagName.trim(),
          color: newTagColor,
        });

      if (error) throw error;

      setNewTagName('');
      setNewTagColor('#3B82F6');
      fetchTags();
    } catch (error) {
      console.error('Error creating tag:', error);
    }
  };

  const startEdit = (tag: TagType) => {
    setEditingTag(tag.id);
    setEditName(tag.name);
    setEditColor(tag.color);
  };

  const saveEdit = async (tagId: string) => {
    try {
      const { error } = await supabase
        .from('tags')
        .update({
          name: editName,
          color: editColor,
        })
        .eq('id', tagId);

      if (error) throw error;

      setEditingTag(null);
      fetchTags();
    } catch (error) {
      console.error('Error updating tag:', error);
    }
  };

  const deleteTag = async (tagId: string) => {
    if (!confirm('Delete this tag? It will be removed from all poems.')) return;

    try {
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', tagId);

      if (error) throw error;
      fetchTags();
    } catch (error) {
      console.error('Error deleting tag:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">Loading tags...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Tags Manager</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Organize your poems with custom tags and categories
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Create New Tag</h2>

        <div className="flex gap-3">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && createTag()}
            placeholder="Tag name"
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
          />

          <select
            value={newTagColor}
            onChange={(e) => setNewTagColor(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
          >
            {colorOptions.map((color) => (
              <option key={color.value} value={color.value}>
                {color.name}
              </option>
            ))}
          </select>

          <button
            onClick={createTag}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold mb-4">Your Tags</h2>

        {tags.length > 0 ? (
          <div className="space-y-2">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                {editingTag === tag.id ? (
                  <>
                    <div
                      className="w-8 h-8 rounded-full flex-shrink-0"
                      style={{ backgroundColor: editColor }}
                    />
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    />
                    <select
                      value={editColor}
                      onChange={(e) => setEditColor(e.target.value)}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    >
                      {colorOptions.map((color) => (
                        <option key={color.value} value={color.value}>
                          {color.name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => saveEdit(tag.id)}
                      className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingTag(null)}
                      className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <div
                      className="w-8 h-8 rounded-full flex-shrink-0"
                      style={{ backgroundColor: tag.color }}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{tag.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {tag.poem_count} {tag.poem_count === 1 ? 'poem' : 'poems'}
                      </div>
                    </div>
                    <button
                      onClick={() => startEdit(tag)}
                      className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteTag(tag.id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No tags yet. Create your first tag above!</p>
          </div>
        )}
      </div>

      <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Tag className="w-5 h-5" />
          How to Use Tags
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Tags help you organize and find your poems quickly. You can tag poems when editing them in the poem editor.
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
          <li>Use tags for themes, moods, or categories</li>
          <li>Color-code tags for visual organization</li>
          <li>Filter your library by tags to find specific poems</li>
          <li>Create as many tags as you need!</li>
        </ul>
      </div>
    </div>
  );
}
