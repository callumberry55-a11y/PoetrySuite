import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Save, Star, Globe, Lock, ArrowLeft } from 'lucide-react';

interface PoemEditorProps {
  selectedPoemId: string | null;
  onBack: () => void;
}

export default function PoemEditor({ selectedPoemId, onBack }: PoemEditorProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const lineCount = content.split('\n').length;

  useEffect(() => {
    if (selectedPoemId) {
      loadPoem();
    } else {
      resetEditor();
    }
  }, [selectedPoemId]);

  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    if (content.trim() || title.trim()) {
      saveTimeoutRef.current = setTimeout(() => {
        savePoem();
      }, 2000);
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [title, content, isPublic, favorited]);

  const resetEditor = () => {
    setTitle('');
    setContent('');
    setIsPublic(false);
    setFavorited(false);
    setLastSaved(null);
    setError(null);
  };

  const loadPoem = async () => {
    if (!selectedPoemId || !user) return;

    try {
      const { data, error } = await supabase
        .from('poems')
        .select('*')
        .eq('id', selectedPoemId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setTitle(data.title);
        setContent(data.content);
        setIsPublic(data.is_public);
        setFavorited(data.favorited);
        setError(null);
      }
    } catch (err) {
      console.error('Error loading poem:', err);
      setError('Failed to load poem');
    }
  };

  const savePoem = async () => {
    if (!user || (!content.trim() && !title.trim())) return;

    setSaving(true);
    setError(null);

    try {
      const poemData = {
        user_id: user.id,
        title: title.trim() || 'Untitled',
        content,
        is_public: isPublic,
        favorited,
        word_count: wordCount,
        updated_at: new Date().toISOString(),
      };

      if (selectedPoemId) {
        const { error } = await supabase
          .from('poems')
          .update(poemData)
          .eq('id', selectedPoemId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('poems')
          .insert([poemData]);

        if (error) throw error;
      }

      setLastSaved(new Date());
    } catch (err) {
      console.error('Error saving poem:', err);
      setError('Failed to save poem');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Library</span>
          </button>

          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
            <div className="p-6 sm:p-8 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-start justify-between gap-4 mb-6">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-3xl sm:text-4xl font-bold bg-transparent border-none outline-none text-slate-900 dark:text-white flex-1 placeholder:text-slate-400 dark:placeholder:text-slate-600"
                  placeholder="Untitled Poem"
                />
                <div className="flex items-center gap-3">
                  {saving && (
                    <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-full">
                      <Save size={14} className="animate-pulse" />
                      <span className="hidden sm:inline">Saving</span>
                    </div>
                  )}
                  {!saving && lastSaved && (
                    <div className="text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-3 py-1.5 rounded-full hidden sm:block">
                      Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFavorited(!favorited)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    favorited
                      ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                      : 'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Star size={18} fill={favorited ? 'currentColor' : 'none'} />
                  <span className="text-sm">Favorite</span>
                </button>

                <button
                  onClick={() => setIsPublic(!isPublic)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    isPublic
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                      : 'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {isPublic ? <Globe size={18} /> : <Lock size={18} />}
                  <span className="text-sm">{isPublic ? 'Public' : 'Private'}</span>
                </button>

                <div className="ml-auto flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-4 py-2 rounded-xl">
                  <span className="font-medium">{wordCount} words</span>
                  <span className="text-slate-400 dark:text-slate-600">·</span>
                  <span className="font-medium">{lineCount} lines</span>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full min-h-[500px] bg-transparent border-none outline-none text-slate-900 dark:text-white text-lg sm:text-xl leading-relaxed resize-none font-serif placeholder:text-slate-400 dark:placeholder:text-slate-600"
                placeholder="Let your words flow..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
