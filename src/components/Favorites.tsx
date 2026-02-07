import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Heart, BookMarked } from 'lucide-react';

interface FavoritePoem {
  id: string;
  poem_id: string;
  created_at: string;
  poems: {
    id: string;
    title: string;
    content: string;
    created_at: string;
  };
}

export default function Favorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoritePoem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'favorites' | 'bookmarks'>('favorites');

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('poem_favorites')
        .select(`
          *,
          poems (id, title, content, created_at)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFavorites(data || []);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (favoriteId: string) => {
    try {
      await supabase
        .from('poem_favorites')
        .delete()
        .eq('id', favoriteId);

      loadFavorites();
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <Heart className="w-8 h-8 text-red-600 dark:text-red-400" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Favorites & Bookmarks
        </h1>
      </div>

      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab('favorites')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'favorites'
              ? 'border-red-600 text-red-600 dark:text-red-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Heart className="w-4 h-4 inline mr-2" />
          Favorites
        </button>
        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'bookmarks'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <BookMarked className="w-4 h-4 inline mr-2" />
          Bookmarks
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {favorites.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No favorites yet. Star poems to save them here!
            </div>
          ) : (
            favorites.map(fav => (
              <div
                key={fav.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:border-red-400 dark:hover:border-red-600 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {fav.poems.title}
                  </h3>
                  <button
                    onClick={() => removeFavorite(fav.id)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400"
                  >
                    <Heart className="w-5 h-5 fill-current" />
                  </button>
                </div>
                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap line-clamp-4">
                  {fav.poems.content}
                </p>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                  Added {new Date(fav.created_at).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
