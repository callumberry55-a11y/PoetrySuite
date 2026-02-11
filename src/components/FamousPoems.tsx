import { useState, useEffect } from 'react';
import { LibraryBig, Search, BookOpen, Calendar, User, Filter, Save, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface FamousPoem {
  id: string;
  title: string;
  author: string;
  content: string;
  year_published: number | null;
  form: string | null;
  era: string | null;
  analysis: string | null;
  is_public_domain: boolean;
  created_at: string;
}

export default function FamousPoems() {
  const { user } = useAuth();
  const [poems, setPoems] = useState<FamousPoem[]>([]);
  const [filteredPoems, setFilteredPoems] = useState<FamousPoem[]>([]);
  const [selectedPoem, setSelectedPoem] = useState<FamousPoem | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEra, setFilterEra] = useState<string>('all');
  const [filterAuthor, setFilterAuthor] = useState<string>('all');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchPoems();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterEra, filterAuthor, poems]);

  async function fetchPoems() {
    try {
      const { data, error } = await supabase
        .from('famous_poems')
        .select('*')
        .order('year_published', { ascending: true });

      if (error) throw error;
      setPoems(data || []);
      setFilteredPoems(data || []);
    } catch (error) {
      console.error('Error fetching poems:', error);
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    let filtered = [...poems];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(poem =>
        poem.title.toLowerCase().includes(term) ||
        poem.author.toLowerCase().includes(term) ||
        poem.content.toLowerCase().includes(term)
      );
    }

    if (filterEra !== 'all') {
      filtered = filtered.filter(poem => poem.era === filterEra);
    }

    if (filterAuthor !== 'all') {
      filtered = filtered.filter(poem => poem.author === filterAuthor);
    }

    setFilteredPoems(filtered);
  }

  async function saveToLibrary(poem: FamousPoem) {
    if (!user) {
      alert('Please sign in to save poems to your library.');
      return;
    }

    setSaving(true);
    setSaveSuccess(false);

    try {
      const wordCount = poem.content.split(/\s+/).filter(w => w.length > 0).length;
      const { error } = await supabase
        .from('poems')
        .insert({
          user_id: user.id,
          title: `${poem.title} by ${poem.author}`,
          content: poem.content,
          form_type: poem.form || '',
          is_public: false,
          word_count: wordCount,
          theme: poem.era || '',
          mood: poem.form || ''
        });

      if (error) {
        console.error('Error saving poem:', error);
        if (error.code === '23505') {
          alert('This poem is already in your library.');
        } else {
          alert(`Failed to save poem: ${error.message || 'Unknown error'}`);
        }
      } else {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Unexpected error saving poem:', error);
      alert('Failed to save poem. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  const eras = Array.from(new Set(poems.map(p => p.era).filter((era): era is string => Boolean(era))));
  const authors = Array.from(new Set(poems.map(p => p.author))).sort();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pb-24">
      <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 h-32 sm:h-40">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <LibraryBig className="w-10 h-10 sm:w-12 sm:h-12 mb-2 animate-pulse" />
          <h1 className="text-2xl sm:text-4xl font-bold mb-1">Famous Poems Archive</h1>
          <p className="text-sm sm:text-base opacity-90">Explore {poems.length} classic poems from literary masters</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-8">

      {/* Search and Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search poems, authors, or content..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-medium"
          />
        </div>

        <div className="flex gap-3 flex-wrap items-center">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Filter className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <select
              value={filterEra}
              onChange={(e) => setFilterEra(e.target.value)}
              className="flex-1 px-4 py-2 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
            >
              <option value="all">All Eras</option>
              {eras.map(era => (
                <option key={era} value={era}>{era}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <User className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <select
              value={filterAuthor}
              onChange={(e) => setFilterAuthor(e.target.value)}
              className="flex-1 px-4 py-2 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
            >
              <option value="all">All Authors</option>
              {authors.map(author => (
                <option key={author} value={author}>{author}</option>
              ))}
            </select>
          </div>

          {(searchTerm || filterEra !== 'all' || filterAuthor !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterEra('all');
                setFilterAuthor('all');
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:shadow-lg transition-all"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {filteredPoems.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
          <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            No poems found matching your criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Poems List */}
          <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
            {filteredPoems.map((poem) => (
              <div
                key={poem.id}
                onClick={() => setSelectedPoem(poem)}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl ${
                  selectedPoem?.id === poem.id
                    ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 shadow-emerald-200 dark:shadow-emerald-900/50 scale-[1.02]'
                    : 'border-slate-200 dark:border-slate-700 hover:border-emerald-400 bg-white dark:bg-slate-900'
                }`}
              >
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
                  {poem.title}
                </h3>
                <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-3">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    {poem.author}
                  </span>
                  {poem.year_published && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {poem.year_published}
                    </span>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {poem.era && (
                    <span className="text-xs px-3 py-1.5 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800">
                      {poem.era}
                    </span>
                  )}
                  {poem.form && (
                    <span className="text-xs px-3 py-1.5 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-300 font-semibold border border-purple-200 dark:border-purple-800">
                      {poem.form}
                    </span>
                  )}
                  {poem.is_public_domain && (
                    <span className="text-xs px-3 py-1.5 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-300 font-semibold border border-green-200 dark:border-green-800">
                      Public Domain
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Poem Display */}
          <div className="lg:sticky lg:top-6">
            {selectedPoem ? (
              <div className="p-6 rounded-3xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl">
                <div className="flex items-start gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl shadow-lg flex-shrink-0">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                      {selectedPoem.title}
                    </h2>
                    <p className="text-lg text-slate-700 dark:text-slate-300 mb-2">
                      by {selectedPoem.author}
                    </p>
                    <div className="flex gap-3 text-sm text-slate-600 dark:text-slate-400 flex-wrap">
                      {selectedPoem.year_published && (
                        <span className="font-medium">{selectedPoem.year_published}</span>
                      )}
                      {selectedPoem.era && <span>• {selectedPoem.era}</span>}
                      {selectedPoem.form && <span>• {selectedPoem.form}</span>}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => saveToLibrary(selectedPoem)}
                  disabled={saving || saveSuccess}
                  className={`w-full mb-6 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 ${
                    saveSuccess
                      ? 'bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-300 border-2 border-green-500'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                >
                  {saveSuccess ? (
                    <>
                      <Check className="w-5 h-5" />
                      Saved to Library!
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      {saving ? 'Saving...' : 'Save to My Library'}
                    </>
                  )}
                </button>

                <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50 rounded-2xl p-6 mb-6 border border-slate-200 dark:border-slate-700">
                  <pre className="whitespace-pre-wrap font-serif text-base leading-relaxed text-slate-800 dark:text-slate-200">
                    {selectedPoem.content}
                  </pre>
                </div>

                {selectedPoem.analysis && (
                  <div className="pt-6 border-t-2 border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                        <BookOpen className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                        Analysis
                      </h3>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      {selectedPoem.analysis}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-600 text-center bg-white dark:bg-slate-900">
                <div className="p-4 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-2xl w-fit mx-auto mb-4">
                  <BookOpen className="w-12 h-12 text-slate-400" />
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">
                  Select a poem to read
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
