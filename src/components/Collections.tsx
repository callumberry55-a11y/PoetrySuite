import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { FolderOpen, Plus, Globe, Lock } from 'lucide-react';

interface Collection {
  id: string;
  name: string;
  description: string;
  is_public: boolean;
  created_at: string;
  poem_count?: number;
}

export default function Collections() {
  const { user } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_public: false
  });

  useEffect(() => {
    if (user) {
      loadCollections();
    }
  }, [user]);

  const loadCollections = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('poetry_collections')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCollections(data || []);
    } catch (error) {
      console.error('Error loading collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('poetry_collections')
        .insert({
          ...formData,
          user_id: user?.id
        });

      if (error) throw error;

      setShowCreateModal(false);
      setFormData({ name: '', description: '', is_public: false });
      loadCollections();
    } catch (error) {
      console.error('Error creating collection:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pb-24">
      <div className="relative bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-600 h-32 sm:h-40">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <FolderOpen className="w-10 h-10 sm:w-12 sm:h-12 mb-2 animate-pulse" />
          <h1 className="text-2xl sm:text-4xl font-bold mb-1">Poetry Collections</h1>
          <p className="text-sm sm:text-base opacity-90">Curate your literary anthology</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-8 space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-slate-600 dark:text-slate-400 font-medium">
              Organize your poems into curated collections and anthologies
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              New Collection
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-800"></div>
              <div className="absolute inset-0 rounded-full border-4 border-rose-600 border-t-transparent animate-spin"></div>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {collections.length === 0 ? (
              <div className="col-span-full text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg">
                <FolderOpen className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-700" />
                <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">No collections yet. Create one to get started!</p>
              </div>
            ) : (
              collections.map(collection => (
                <div
                  key={collection.id}
                  className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer shadow-lg"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="p-3 bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl shadow-lg flex-shrink-0">
                        <FolderOpen className="text-white" size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white truncate">
                        {collection.name}
                      </h3>
                    </div>
                    <div className="flex-shrink-0 ml-2">
                      {collection.is_public ? (
                        <div className="p-2 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-xl border border-blue-200 dark:border-blue-800">
                          <Globe className="text-blue-600 dark:text-blue-400" size={18} />
                        </div>
                      ) : (
                        <div className="p-2 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-xl border border-slate-300 dark:border-slate-600">
                          <Lock className="text-slate-600 dark:text-slate-400" size={18} />
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed">
                    {collection.description}
                  </p>
                  <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50 rounded-xl">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {collection.poem_count || 0} poems
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl shadow-lg">
                  <FolderOpen className="text-white" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Create Collection
                </h2>
              </div>
              <form onSubmit={handleCreate} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all font-medium"
                    placeholder="My Poetry Collection"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all font-medium resize-none"
                    placeholder="A collection of my favorite poems..."
                  />
                </div>
                <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50 rounded-xl">
                  <input
                    type="checkbox"
                    id="is_public"
                    checked={formData.is_public}
                    onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                    className="w-5 h-5 text-rose-600 border-slate-300 dark:border-slate-600 rounded focus:ring-rose-500 cursor-pointer"
                  />
                  <label htmlFor="is_public" className="text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer flex-1">
                    Make this collection public
                  </label>
                  <Globe className="text-slate-400" size={18} />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-6 py-3 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
