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
  Plus,
  Edit3,
  Download,
  Sparkles,
  RefreshCw,
  BookOpen
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

interface InternetPoem {
  title: string;
  author: string;
  lines: string[];
  linecount: string;
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

  const [activeTab, setActiveTab] = useState<'library' | 'discover'>('library');
  const [internetPoems, setInternetPoems] = useState<InternetPoem[]>([]);
  const [loadingInternet, setLoadingInternet] = useState(false);
  const [internetSearchQuery, setInternetSearchQuery] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState<string>('');

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
      Promise.all([loadPoems(), loadCollections(), loadPoemCollections()]);
    }
  }, [user, loadPoems, loadCollections, loadPoemCollections]);

  const fetchInternetPoems = useCallback(async (action: string, params: Record<string, string> = {}) => {
    if (!user) return;

    setLoadingInternet(true);
    try {
      const queryParams = new URLSearchParams({ action, ...params });
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-poems?${queryParams}`;

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch poems');
      }

      const data = await response.json();
      setInternetPoems(data.poems || []);
    } catch (error) {
      console.error('Error fetching internet poems:', error);
      setInternetPoems([]);
    } finally {
      setLoadingInternet(false);
    }
  }, [user]);

  const loadRandomPoems = useCallback(() => {
    fetchInternetPoems('random', { count: '20' });
  }, [fetchInternetPoems]);

  const searchInternetPoems = useCallback(() => {
    if (selectedAuthor) {
      fetchInternetPoems('by_author', { author: selectedAuthor });
    } else if (internetSearchQuery) {
      fetchInternetPoems('by_title', { title: internetSearchQuery });
    } else {
      loadRandomPoems();
    }
  }, [selectedAuthor, internetSearchQuery, fetchInternetPoems, loadRandomPoems]);

  const saveInternetPoem = useCallback(async (poem: InternetPoem) => {
    if (!user) return;

    const content = poem.lines.join('\n');
    const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;

    const { error } = await supabase
      .from('poems')
      .insert([{
        user_id: user.id,
        title: `${poem.title} by ${poem.author}`,
        content: content,
        is_public: false,
        word_count: wordCount,
        favorited: false,
      }]);

    if (error) {
      console.error('Error saving poem:', error);
      alert('Failed to save poem');
      return;
    }

    alert('Poem saved to your library!');
    loadPoems();
  }, [user, loadPoems]);

  useEffect(() => {
    if (activeTab === 'discover' && internetPoems.length === 0 && !loadingInternet) {
      const timer = setTimeout(() => {
        loadRandomPoems();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [activeTab, internetPoems.length, loadingInternet, loadRandomPoems]);

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

  const popularAuthors = [
    'William Shakespeare', 'Emily Dickinson', 'Walt Whitman', 'Robert Frost',
    'Maya Angelou', 'Langston Hughes', 'Edgar Allan Poe', 'Pablo Neruda',
    'Sylvia Plath', 'T. S. Eliot', 'William Wordsworth', 'John Keats'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            {activeTab === 'library' ? 'Your Library' : 'Discover Poems'}
          </h2>
          <button
            onClick={onNewPoem}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">New Poem</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>

        <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('library')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === 'library'
                ? 'border-blue-500 text-blue-500'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <BookOpen size={18} />
              Your Poems
            </div>
          </button>
          <button
            onClick={() => setActiveTab('discover')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === 'discover'
                ? 'border-blue-500 text-blue-500'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles size={18} />
              Discover
            </div>
          </button>
        </div>

        {activeTab === 'library' ? (
          <>
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
          </>
        ) : (
          <div className="space-y-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="search"
                  value={internetSearchQuery}
                  onChange={(e) => setInternetSearchQuery(e.target.value)}
                  placeholder="Search by title..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  onKeyDown={(e) => e.key === 'Enter' && searchInternetPoems()}
                />
              </div>
              <button
                onClick={searchInternetPoems}
                disabled={loadingInternet}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Search size={18} />
                Search
              </button>
              <button
                onClick={loadRandomPoems}
                disabled={loadingInternet}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-slate-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <RefreshCw size={18} />
                Random
              </button>
            </div>

            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Popular Authors:</p>
              <div className="flex gap-2 flex-wrap">
                {popularAuthors.map((author) => (
                  <button
                    key={author}
                    onClick={() => {
                      setSelectedAuthor(author);
                      setInternetSearchQuery('');
                      fetchInternetPoems('by_author', { author });
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedAuthor === author
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {author}
                  </button>
                ))}
              </div>
              {selectedAuthor && (
                <button
                  onClick={() => {
                    setSelectedAuthor('');
                    loadRandomPoems();
                  }}
                  className="mt-3 text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1"
                >
                  <X size={14} />
                  Clear author filter
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {activeTab === 'library' ? (
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loadingInternet ? (
            <div className="col-span-full text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="text-slate-500 dark:text-slate-400 mt-4">Loading poems...</p>
            </div>
          ) : internetPoems.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-slate-500 dark:text-slate-400">No poems found. Try searching or loading random poems.</p>
            </div>
          ) : (
            internetPoems.map((poem, index) => (
              <article
                key={`${poem.author}-${poem.title}-${index}`}
                className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white line-clamp-2">
                      {poem.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">by {poem.author}</p>
                  </div>
                  <button
                    onClick={() => saveInternetPoem(poem)}
                    className="text-blue-500 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Save to your library"
                  >
                    <Download size={18} />
                  </button>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-6 mb-4 font-serif whitespace-pre-wrap">
                  {poem.lines.slice(0, 8).join('\n')}
                  {poem.lines.length > 8 && '\n...'}
                </p>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{poem.linecount} lines</span>
                </div>
              </article>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default memo(Library);
