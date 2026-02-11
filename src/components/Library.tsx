import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  Star,
  Trash2,
  Tag,
  X,
  Folder,
  Globe,
  Lock,
  Edit3,
  Download,
  Sparkles,
  RefreshCw,
  BookOpen,
  Heart,
  MessageSquare
} from 'lucide-react';
import CollectionManager from './CollectionManager';
import AISearchBar from './AISearchBar';

interface Poem {
  id: string;
  title: string;
  content: string;
  is_public: boolean;
  word_count: number;
  created_at: string;
  favorited: boolean;
  like_count?: number;
  comment_count?: number;
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

function Library({ onEditPoem }: LibraryProps) {
  const { user } = useAuth();
  const [poems, setPoems] = useState<Poem[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'favorites' | 'public' | 'private'>('all');
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

    const poemsWithCounts = await Promise.allSettled(
      (data || []).map(async (poem) => {
        try {
          const { count: likeCount } = await supabase
            .from('reactions')
            .select('id', { count: 'exact', head: true })
            .eq('poem_id', poem.id);

          const { count: commentCount } = await supabase
            .from('comments')
            .select('id', { count: 'exact', head: true })
            .eq('poem_id', poem.id);

          return {
            ...poem,
            like_count: likeCount || 0,
            comment_count: commentCount || 0,
          };
        } catch {
          return {
            ...poem,
            like_count: 0,
            comment_count: 0,
          };
        }
      })
    ).then(results => results.map(r => r.status === 'fulfilled' ? r.value : null).filter(Boolean) as Poem[]);

    setPoems(poemsWithCounts);
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
      const loadData = async () => {
        try {
          await Promise.all([loadPoems(), loadCollections(), loadPoemCollections()]);
        } catch (error) {
          console.error('Error loading library data:', error);
        }
      };
      loadData();
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

  const [savingPoems, setSavingPoems] = useState<Set<string>>(new Set());
  const [savedPoems, setSavedPoems] = useState<Set<string>>(new Set());

  const saveInternetPoem = useCallback(async (poem: InternetPoem, index: number) => {
    if (!user) {
      alert('Please sign in to save poems');
      return;
    }

    const poemKey = `${poem.author}-${poem.title}-${index}`;

    setSavingPoems(prev => new Set(prev).add(poemKey));

    try {
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
        if (error.code === '23505') {
          alert('This poem is already in your library');
        } else {
          alert(`Failed to save poem: ${error.message || 'Unknown error'}`);
        }
        return;
      }

      setSavedPoems(prev => new Set(prev).add(poemKey));
      setTimeout(() => {
        setSavedPoems(prev => {
          const newSet = new Set(prev);
          newSet.delete(poemKey);
          return newSet;
        });
      }, 3000);

      await loadPoems();
    } catch (err) {
      console.error('Unexpected error saving poem:', err);
      alert('An unexpected error occurred while saving the poem');
    } finally {
      setSavingPoems(prev => {
        const newSet = new Set(prev);
        newSet.delete(poemKey);
        return newSet;
      });
    }
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
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            {activeTab === 'library' ? 'Your Library' : 'Discover Poems'}
          </h2>
        </div>

        <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6">
          <button
            onClick={() => setActiveTab('library')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === 'library'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen size={18} />
            <span>Your Poems</span>
          </button>
          <button
            onClick={() => setActiveTab('discover')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === 'discover'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles size={18} />
            <span>Discover</span>
          </button>
        </div>

        {activeTab === 'library' ? (
          <>
            <div className="mb-6">
              <AISearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                onSearch={() => {}}
                placeholder="Search your poems by title, content, or theme..."
                poems={poems}
                mode="library"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto mb-6 pb-2" role="group" aria-label="Filter poems">
              <button
                onClick={() => setFilterBy('all')}
                className={`px-4 py-2.5 rounded-xl font-semibold transition-all text-sm whitespace-nowrap ${
                  filterBy === 'all'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-600'
                }`}
                aria-pressed={filterBy === 'all'}
                aria-label="Show all poems"
              >
                All Poems
              </button>
              <button
                onClick={() => setFilterBy('favorites')}
                className={`px-4 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 text-sm whitespace-nowrap ${
                  filterBy === 'favorites'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-600'
                }`}
                aria-pressed={filterBy === 'favorites'}
                aria-label="Show favorite poems only"
              >
                <Star size={16} aria-hidden="true" fill={filterBy === 'favorites' ? 'currentColor' : 'none'} />
                <span>Favorites</span>
              </button>
              <button
                onClick={() => setFilterBy('public')}
                className={`px-4 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 text-sm whitespace-nowrap ${
                  filterBy === 'public'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-600'
                }`}
                aria-pressed={filterBy === 'public'}
                aria-label="Show public poems only"
              >
                <Globe size={16} aria-hidden="true" />
                <span>Public</span>
              </button>
              <button
                onClick={() => setFilterBy('private')}
                className={`px-4 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 text-sm whitespace-nowrap ${
                  filterBy === 'private'
                    ? 'bg-gradient-to-r from-slate-500 to-slate-600 text-white shadow-lg'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-600'
                }`}
                aria-pressed={filterBy === 'private'}
                aria-label="Show private poems only"
              >
                <Lock size={16} aria-hidden="true" />
                <span>Private</span>
              </button>
            </div>

            <CollectionManager
              collections={collections}
              onCollectionChange={loadCollections}
              selectedCollection={selectedCollection}
              onSelectCollection={setSelectedCollection}
              poemCollections={poemCollections}
            />
          </>
        ) : (
          <div className="space-y-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <AISearchBar
                  value={internetSearchQuery}
                  onChange={setInternetSearchQuery}
                  onSearch={searchInternetPoems}
                  placeholder="Search poems by title, author, or theme..."
                  mode="discover"
                />
              </div>
              <button
                onClick={loadRandomPoems}
                disabled={loadingInternet}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-slate-400 disabled:to-slate-400 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:cursor-not-allowed flex items-center gap-2 justify-center"
              >
                <RefreshCw size={18} />
                Random Poems
              </button>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50 rounded-3xl p-6 border-2 border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Sparkles size={16} className="text-blue-500" />
                  Popular Authors
                </p>
                {selectedAuthor && (
                  <button
                    onClick={() => {
                      setSelectedAuthor('');
                      loadRandomPoems();
                    }}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 font-semibold"
                  >
                    <X size={14} />
                    Clear
                  </button>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                {popularAuthors.map((author) => (
                  <button
                    key={author}
                    onClick={() => {
                      setSelectedAuthor(author);
                      setInternetSearchQuery('');
                      fetchInternetPoems('by_author', { author });
                    }}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md ${
                      selectedAuthor === author
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white scale-105'
                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'
                    }`}
                  >
                    {author}
                  </button>
                ))}
              </div>
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
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:border-slate-300 dark:hover:border-slate-600 transition-all hover:shadow-xl hover:-translate-y-1 group relative cursor-pointer"
                role="listitem"
                aria-label={`Poem: ${poem.title}`}
                onClick={() => onEditPoem(poem.id)}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500"></div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0 pr-4">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                        {poem.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs">
                        {poem.favorited && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full font-medium">
                            <Star size={12} fill="currentColor" aria-hidden="true" />
                            Favorite
                          </span>
                        )}
                        {poem.is_public ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full font-medium">
                            <Globe size={12} aria-hidden="true" />
                            Public
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full font-medium">
                            <Lock size={12} aria-hidden="true" />
                            Private
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity" role="group" aria-label="Poem actions">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditPoem(poem.id);
                        }}
                        className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-100 dark:hover:bg-cyan-900/30 transition-colors"
                        aria-label={`Edit ${poem.title}`}
                      >
                        <Edit3 size={16} aria-hidden="true" />
                      </button>
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowCollectionMenu(showCollectionMenu === poem.id ? null : poem.id);
                          }}
                          className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                          aria-label={`${showCollectionMenu === poem.id ? 'Close' : 'Open'} collection menu for ${poem.title}`}
                          aria-expanded={showCollectionMenu === poem.id}
                          aria-haspopup="menu"
                        >
                          <Tag size={16} aria-hidden="true" />
                        </button>
                        {showCollectionMenu === poem.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-700 rounded-xl shadow-xl border border-slate-200 dark:border-slate-600 z-10" role="menu" aria-label="Collection menu">
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
                                      className={`w-full text-left px-2 py-1.5 rounded-lg text-sm transition-colors ${
                                        isInCollection
                                          ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300'
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
                        className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                        aria-label={`Delete ${poem.title}`}
                      >
                        <Trash2 size={16} aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed line-clamp-4 mb-6 font-serif">
                    {poem.content || 'No content yet...'}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                        <Heart size={16} className="text-rose-500" aria-hidden="true" />
                        <span className="font-medium">{poem.like_count || 0}</span>
                      </span>
                      <span className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                        <MessageSquare size={16} className="text-blue-500" aria-hidden="true" />
                        <span className="font-medium">{poem.comment_count || 0}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-medium">{poem.word_count} words</span>
                      <span>•</span>
                      <span>{formatDate(poem.created_at)}</span>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loadingInternet ? (
            <div className="col-span-full text-center py-12">
              <div className="inline-flex items-center justify-center">
                <div className="text-6xl animate-walk">🐦</div>
              </div>
              <p className="text-slate-500 dark:text-slate-400 mt-4">Loading poems...</p>
              <style>{`
                @keyframes walk {
                  0%, 100% { transform: translateY(0px) rotate(-5deg); }
                  25% { transform: translateY(-8px) rotate(0deg); }
                  50% { transform: translateY(0px) rotate(5deg); }
                  75% { transform: translateY(-8px) rotate(0deg); }
                }
                .animate-walk {
                  animation: walk 0.6s ease-in-out infinite;
                }
              `}</style>
            </div>
          ) : internetPoems.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-slate-500 dark:text-slate-400">No poems found. Try searching or loading random poems.</p>
            </div>
          ) : (
            internetPoems.map((poem, index) => {
              const poemKey = `${poem.author}-${poem.title}-${index}`;
              const isSaving = savingPoems.has(poemKey);
              const isSaved = savedPoems.has(poemKey);

              return (
                <article
                  key={poemKey}
                  className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden hover:border-emerald-300 dark:hover:border-emerald-600 transition-all hover:shadow-xl hover:-translate-y-1 group relative"
                >
                  <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"></div>

                  <div className="p-4 sm:p-6">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {poem.title}
                        </h3>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                          <span className="text-slate-400">by</span> {poem.author}
                        </p>
                      </div>
                    </div>

                    <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed line-clamp-6 mb-4 sm:mb-6 font-serif whitespace-pre-wrap">
                      {poem.lines.slice(0, 8).join('\n')}
                      {poem.lines.length > 8 && '\n...'}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t-2 border-slate-100 dark:border-slate-700 gap-3">
                      <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <BookOpen size={14} className="flex-shrink-0" />
                        {poem.linecount} lines
                      </span>
                      <button
                        onClick={() => saveInternetPoem(poem, index)}
                        disabled={isSaving || isSaved}
                        className={`inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-semibold transition-all text-xs sm:text-sm shadow-md hover:shadow-lg min-h-[44px] ${
                          isSaved
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white scale-105'
                            : isSaving
                            ? 'bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-wait'
                            : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white hover:scale-105 active:scale-95'
                        } disabled:cursor-not-allowed`}
                        aria-label={`Save ${poem.title} to your library`}
                      >
                        {isSaved ? (
                          <>
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="hidden xs:inline">Saved!</span>
                          </>
                        ) : isSaving ? (
                          <>
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="hidden xs:inline">Saving...</span>
                          </>
                        ) : (
                          <>
                            <Download size={16} className="sm:w-[18px] sm:h-[18px]" />
                            <span>Save</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default memo(Library);
