import { useState } from 'react';
import { X, Folder, FolderPlus, Save, Trash2, Edit3, Palette } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface Collection {
  id: string;
  name: string;
  description: string;
  color: string;
  poem_count?: number;
}

interface CollectionManagerProps {
  collections: Collection[];
  onCollectionChange: () => void;
  selectedCollection: string | null;
  onSelectCollection: (id: string | null) => void;
  poemCollections: Record<string, string[]>;
}

const colorOptions = [
  { name: 'Blue', value: 'from-blue-500 to-cyan-500', hex: '#3b82f6' },
  { name: 'Purple', value: 'from-purple-500 to-pink-500', hex: '#a855f7' },
  { name: 'Green', value: 'from-green-500 to-emerald-500', hex: '#10b981' },
  { name: 'Orange', value: 'from-orange-500 to-amber-500', hex: '#f97316' },
  { name: 'Red', value: 'from-red-500 to-rose-500', hex: '#ef4444' },
  { name: 'Teal', value: 'from-teal-500 to-cyan-500', hex: '#14b8a6' },
  { name: 'Indigo', value: 'from-indigo-500 to-violet-500', hex: '#6366f1' },
  { name: 'Pink', value: 'from-pink-500 to-fuchsia-500', hex: '#ec4899' },
];

export default function CollectionManager({
  collections,
  onCollectionChange,
  selectedCollection,
  onSelectCollection,
  poemCollections,
}: CollectionManagerProps) {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: colorOptions[0].value,
  });
  const [saving, setSaving] = useState(false);

  const collectionsWithCounts = collections.map(collection => ({
    ...collection,
    poem_count: Object.values(poemCollections).filter(
      collectionIds => collectionIds.includes(collection.id)
    ).length,
  }));

  const openCreateModal = () => {
    setEditingCollection(null);
    setFormData({
      name: '',
      description: '',
      color: colorOptions[0].value,
    });
    setShowModal(true);
  };

  const openEditModal = (collection: Collection) => {
    setEditingCollection(collection);
    setFormData({
      name: collection.name,
      description: collection.description || '',
      color: collection.color,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCollection(null);
    setFormData({
      name: '',
      description: '',
      color: colorOptions[0].value,
    });
  };

  const saveCollection = async () => {
    if (!user || !formData.name.trim()) return;

    setSaving(true);
    try {
      if (editingCollection) {
        const { error } = await supabase
          .from('collections')
          .update({
            name: formData.name,
            description: formData.description,
            color: formData.color,
          })
          .eq('id', editingCollection.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('collections')
          .insert({
            user_id: user.id,
            name: formData.name,
            description: formData.description,
            color: formData.color,
          });

        if (error) throw error;
      }

      onCollectionChange();
      closeModal();
    } catch (error) {
      console.error('Error saving collection:', error);
      alert('Failed to save collection');
    } finally {
      setSaving(false);
    }
  };

  const deleteCollection = async (collectionId: string) => {
    if (!confirm('Are you sure you want to delete this collection? Poems will not be deleted.')) return;

    try {
      const { error } = await supabase
        .from('collections')
        .delete()
        .eq('id', collectionId);

      if (error) throw error;

      if (selectedCollection === collectionId) {
        onSelectCollection(null);
      }

      onCollectionChange();
    } catch (error) {
      console.error('Error deleting collection:', error);
      alert('Failed to delete collection');
    }
  };

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Collections</h3>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <FolderPlus size={18} />
            New Collection
          </button>
        </div>

        {collectionsWithCounts.length === 0 ? (
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-600 p-8 text-center">
            <Folder className="w-12 h-12 mx-auto mb-3 text-slate-400" />
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              No collections yet. Create one to organize your poems!
            </p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <FolderPlus size={18} />
              Create Your First Collection
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {collectionsWithCounts.map((collection) => {
              const isSelected = selectedCollection === collection.id;
              return (
                <div
                  key={collection.id}
                  className={`group bg-white dark:bg-slate-900 rounded-3xl shadow-lg border-2 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] cursor-pointer ${
                    isSelected
                      ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                  onClick={() => onSelectCollection(isSelected ? null : collection.id)}
                >
                  <div className={`h-2 bg-gradient-to-r ${collection.color} rounded-t-3xl`}></div>

                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`p-2.5 bg-gradient-to-r ${collection.color} rounded-xl shadow-lg flex-shrink-0`}>
                          <Folder className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-base font-bold text-slate-900 dark:text-white truncate">
                            {collection.name}
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {collection.poem_count} {collection.poem_count === 1 ? 'poem' : 'poems'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(collection);
                          }}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                          aria-label={`Edit ${collection.name}`}
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteCollection(collection.id);
                          }}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                          aria-label={`Delete ${collection.name}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {collection.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                        {collection.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-2 border-slate-200 dark:border-slate-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className={`sticky top-0 bg-gradient-to-r ${formData.color} p-6 rounded-t-3xl flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Folder className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">
                  {editingCollection ? 'Edit Collection' : 'Create Collection'}
                </h2>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-white/20 rounded-xl transition-all"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label htmlFor="collection-name" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Collection Name *
                </label>
                <input
                  id="collection-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Nature Poems, Love Letters, Haikus..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="collection-description" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  id="collection-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Add a brief description of this collection..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  <div className="flex items-center gap-2">
                    <Palette size={16} />
                    Color Theme
                  </div>
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {colorOptions.map((color) => {
                    const isSelected = formData.color === color.value;
                    return (
                      <button
                        key={color.value}
                        onClick={() => setFormData({ ...formData, color: color.value })}
                        className={`relative p-4 rounded-2xl transition-all duration-300 ${
                          isSelected
                            ? 'ring-2 ring-offset-2 ring-blue-500 scale-105'
                            : 'hover:scale-105'
                        }`}
                      >
                        <div className={`h-12 bg-gradient-to-r ${color.value} rounded-xl shadow-lg`}></div>
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-2 text-center">
                          {color.name}
                        </p>
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-lg">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={saveCollection}
                  disabled={!formData.name.trim() || saving}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      {editingCollection ? 'Update Collection' : 'Create Collection'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
