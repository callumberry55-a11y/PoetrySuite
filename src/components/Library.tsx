import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  Search,
  Star,
  Trash2,
  FolderPlus,
  Tag,
  X,
  Folder,
  Globe,
  Lock,
  MoreVertical,
  Plus,
  Edit3
} from 'lucide-react';

interface Poem {
  id: string;
  title: string;
  content: string;
  is_public: boolean;
  word_count: number;
  created_at: string;
  favorited: boolean;
}

interface Collection {
  id: string;
  name: string;
  description: string;
  color: string;
}

interface LibraryProps {
  onNewPoem: () => void;
  onEditPoem: (poemId: string) => void;
}

function Library({ onNewPoem, onEditPoem }: LibraryProps) {
  const { user } = useAuth();
  const [poems, setPoems] = useState<Poem[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'favorites' | 'public' | 'private'>('all');
  const [showNewCollection, setShowNewCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [showCollectionMenu, setShowCollectionMenu] = useState<string | null>(null);
  const [poemCollections, setPoemCollections] = useState<Record<string, string[]>>({});

  const loadPoems = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('poems')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error loading poems:', error);
      return;
    }

    setPoems(data || []);
  }, [user]);

  const loadCollections = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading collections:', error);
      return;
    }

    setCollections(data || []);
  }, [user]);

  const loadPoemCollections = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('poem_collections')
      .select('poem_id, collection_id');

    if (error) {
      console.error('Error loading poem collections:', error);
      return;
    }

    const mapping: Record<string, string[]> = {};
    data?.forEach(pc => {
      if (!mapping[pc.poem_id]) {
        mapping[pc.poem_id] = [];
      }
      mapping[pc.poem_id].push(pc.collection_id);
    });

    setPoemCollections(mapping);
  }, [user]);

  useEffect(() => {
    if (user) {
      loadPoems();
      loadCollections();
      loadPoemCollections();
    }
  }, [user, loadPoems, loadCollections, loadPoemCollections]);

  const addPoemToCollection = useCallback(async (poemId: string, collectionId: string) => {
    const { error } = await supabase
      .from('poem_collections')
      .insert([{ poem_id: poemId, collection_id: collectionId }]);

    if (error) {
      console.error('Error adding poem to collection:', error);
      return;
    }

    loadPoemCollections();
  }, [loadPoemCollections]);

  const removePoemFromCollection = useCallback(async (poemId: string, collectionId: string) => {
    const { error } = await supabase
      .from('poem_collections')
      .delete()
      .eq('poem_id', poemId)
      .eq('collection_id', collectionId);

    if (error) {
      console.error('Error removing poem from collection:', error);
      return;
    }

    loadPoemCollections();
  }, [loadPoemCollections]);

  const filteredPoems = useMemo(() => {
    let filtered = [...poems];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (poem) =>
          poem.title.toLowerCase().includes(query) ||
          poem.content.toLowerCase().includes(query)
      );
    }

    if (filterBy === 'favorites') {
      filtered = filtered.filter((poem) => poem.favorited);
    } else if (filterBy === 'public') {
      filtered = filtered.filter((poem) => poem.is_public);
    } else if (filterBy === 'private') {
      filtered = filtered.filter((poem) => !poem.is_public);
    }

    if (selectedCollection) {
      filtered = filtered.filter(poem => poemCollections[poem.id]?.includes(selectedCollection));
    }

    return filtered;
  }, [poems, searchQuery, filterBy, selectedCollection, poemCollections]);

  const deletePoem = useCallback(async (poemId: string) => {
    if (!confirm('Are you sure you want to delete this poem?')) return;

    const { error } = await supabase
      .from('poems')
      .delete()
      .eq('id', poemId);

    if (error) {
      console.error('Error deleting poem:', error);
      return;
    }

    loadPoems();
  }, [loadPoems]);

  const createCollection = useCallback(async () => {
    if (!user || !newCollectionName.trim()) return;

    const { error } = await supabase
      .from('collections')
      .insert([{
        user_id: user.id,
        name: newCollectionName,
        description: '',
        color: '#6366f1',
      }]);

    if (error) {
      console.error('Error creating collection:', error);
      return;
    }

    setNewCollectionName('');
    setShowNewCollection(false);
    loadCollections();
  }, [user, newCollectionName, loadCollections]);

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Your Library</h2>
          <button
            onClick={onNewPoem}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">New Poem</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <label htmlFor="poem-search" className="sr-only">Search poems</label>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} aria-hidden="true" />
            <input
              id="poem-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search poems..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              aria-label="Search poems by title or content"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto" role="group" aria-label="Filter poems">
            <button
              onClick={() => setFilterBy('all')}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm whitespace-nowrap ${
                filterBy === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
              }`}
              aria-pressed={filterBy === 'all'}
              aria-label="Show all poems"
            >
              All
            </button>
            <button
              onClick={() => setFilterBy('favorites')}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-1.5 text-sm whitespace-nowrap ${
                filterBy === 'favorites'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
              }`}
              aria-pressed={filterBy === 'favorites'}
              aria-label="Show favorite poems only"
            >
              <Star size={16} aria-hidden="true" />
              <span className="hidden xs:inline">Favorites</span>
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2" role="group" aria-label="Collections">
          <button
            onClick={() => setShowNewCollection(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors whitespace-nowrap"
            aria-label="Create new collection"
          >
            <FolderPlus size={18} aria-hidden="true" />
            <span className="text-sm font-medium">New Collection</span>
          </button>

          {collections.map((collection) => (
            <button
              key={collection.id}
              onClick={() =>
                setSelectedCollection(selectedCollection === collection.id ? null : collection.id)
              }
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                selectedCollection === collection.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
              }`}
              aria-pressed={selectedCollection === collection.id}
              aria-label={`${selectedCollection === collection.id ? 'Hide' : 'Show'} collection: ${collection.name}`}
            >
              <Folder size={18} aria-hidden="true" />
              <span className="text-sm font-medium">{collection.name}</span>
            </button>
          ))}
        </div>

        {showNewCollection && (
          <div className="mb-6 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg" role="form" aria-label="Create new collection">
            <div className="flex items-center gap-2">
              <label htmlFor="new-collection-name" className="sr-only">Collection name</label>
              <input
                id="new-collection-name"
                type="text"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="Collection name..."
                className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                onKeyDown={(e) => e.key === 'Enter' && createCollection()}
                aria-label="New collection name"
              />
              <button
                onClick={createCollection}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium"
                aria-label="Create collection"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowNewCollection(false);
                  setNewCollectionName('');
                }}
                className="px-3 py-2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-lg"
                aria-label="Cancel creating collection"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" role="list" aria-label="Poem library">
        {filteredPoems.length === 0 ? (
          <div className="col-span-full text-center py-12" role="status">
            <p className="text-slate-500 dark:text-slate-400">
              {searchQuery || filterBy !== 'all'
                ? 'No poems found matching your criteria'
                : 'No poems yet. Start writing!'}
            </p>
          </div>
        ) : (
          filteredPoems.map((poem) => (
            <article
              key={poem.id}
              className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow group relative"
              role="listitem"
              aria-label={`Poem: ${poem.title}`}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white line-clamp-1 flex-1">
                  {poem.title}
                </h3>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity" role="group" aria-label="Poem actions">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditPoem(poem.id);
                    }}
                    className="text-blue-500 hover:text-blue-600"
                    aria-label={`Edit ${poem.title}`}
                  >
                    <Edit3 size={16} aria-hidden="true" />
                  </button>
                  {poem.favorited && <Star size={16} className="text-yellow-500" fill="currentColor" aria-label="Favorited" />}
                  {poem.is_public ? (
                    <Globe size={16} className="text-green-500" aria-label="Public poem" />
                  ) : (
                    <Lock size={16} className="text-slate-400" aria-label="Private poem" />
                  )}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowCollectionMenu(showCollectionMenu === poem.id ? null : poem.id);
                      }}
                      className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                      aria-label={`${showCollectionMenu === poem.id ? 'Close' : 'Open'} collection menu for ${poem.title}`}
                      aria-expanded={showCollectionMenu === poem.id}
                      aria-haspopup="menu"
                    >
                      <Tag size={16} aria-hidden="true" />
                    </button>
                    {showCollectionMenu === poem.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-700 rounded-lg shadow-lg border border-slate-200 dark:border-slate-600 z-10" role="menu" aria-label="Collection menu">
                        <div className="p-2">
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 px-2 py-1">
                            Add to Collection
                          </p>
                          {collections.length === 0 ? (
                            <p className="text-xs text-slate-500 dark:text-slate-400 px-2 py-2">
                              No collections yet
                            </p>
                          ) : (
                            collections.map((collection) => {
                              const isInCollection = poemCollections[poem.id]?.includes(collection.id);
                              return (
                                <button
                                  key={collection.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (isInCollection) {
                                      removePoemFromCollection(poem.id, collection.id);
                                    } else {
                                      addPoemToCollection(poem.id, collection.id);
                                    }
                                  }}
                                  className={`w-full text-left px-2 py-1.5 rounded text-sm transition-colors ${
                                    isInCollection
                                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                      : 'hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'
                                  }`}
                                  role="menuitem"
                                  aria-label={`${isInCollection ? 'Remove from' : 'Add to'} collection: ${collection.name}`}
                                >
                                  <div className="flex items-center gap-2">
                                    <Folder size={14} aria-hidden="true" />
                                    <span>{collection.name}</span>
                                  </div>
                                </button>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePoem(poem.id);
                    }}
                    className="text-red-500 hover:text-red-600"
                    aria-label={`Delete ${poem.title}`}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3 mb-4 font-serif">
                {poem.content || 'No content yet...'}
              </p>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{poem.word_count} words</span>
                <span>{formatDate(poem.created_at)}</span>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}

export default memo(Library);
