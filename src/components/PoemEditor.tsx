import { useState, useEffect, useRef, useCallback, memo, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Save, Star, Globe, Lock, Sparkles, Lightbulb, Wand2, X, RefreshCw } from 'lucide-react';
import { generateWritingPrompt, enhancePoem, generateTitleSuggestions } from '../lib/gemini';

interface PoemEditorProps {
  selectedPoemId: string | null;
  onPoemSaved: () => void;
}

const FALLBACK_PROMPTS = [
  'Write about a moment of silence',
  'Describe the color of a memory',
  'What does hope sound like?',
  'A conversation with the moon',
  'The space between words',
  'When the rain remembers',
  'A letter to your younger self',
  'The taste of nostalgia',
  'Dancing with shadows',
  'The weight of a whisper',
];

function PoemEditor({ selectedPoemId, onPoemSaved }: PoemEditorProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [currentPoemId, setCurrentPoemId] = useState<string | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [showEnhancement, setShowEnhancement] = useState(false);
  const [enhancement, setEnhancement] = useState<{ feedback: string; suggestions: string[] } | null>(null);
  const [showTitleSuggestions, setShowTitleSuggestions] = useState(false);
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const startTimeRef = useRef<Date>(new Date());
  const previousWordCountRef = useRef<number>(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const wordCount = useMemo(() => {
    return content.trim() ? content.trim().split(/\s+/).length : 0;
  }, [content]);

  const lineCount = useMemo(() => {
    return content.split('\n').length;
  }, [content]);

  const charCount = useMemo(() => {
    return content.length;
  }, [content]);

  useEffect(() => {
    if (selectedPoemId) {
      loadPoem(selectedPoemId);
    } else {
      resetEditor();
    }
  }, [selectedPoemId, loadPoem, resetEditor]);

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
  }, [title, content, isPublic, favorited, savePoem]);

  const resetEditor = useCallback(() => {
    setCurrentPoemId(null);
    setTitle('');
    setContent('');
    setIsPublic(false);
    setFavorited(false);
    setLastSaved(null);
    startTimeRef.current = new Date();
    previousWordCountRef.current = 0;
    setShowPrompt(false);
    setShowEnhancement(false);
    setShowTitleSuggestions(false);
  }, []);

  const loadPoem = useCallback(async (poemId: string) => {
    const { data, error } = await supabase
      .from('poems')
      .select('*')
      .eq('id', poemId)
      .maybeSingle();

    if (error) {
      console.error('Error loading poem:', error);
      return;
    }

    if (data) {
      setCurrentPoemId(data.id);
      setTitle(data.title);
      setContent(data.content);
      setIsPublic(data.is_public);
      setFavorited(data.favorited);
      startTimeRef.current = new Date();
      previousWordCountRef.current = data.word_count;
    }
  }, []);

  const updateWritingStats = useCallback(async (isNewPoem: boolean) => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const minutesWriting = Math.floor((new Date().getTime() - startTimeRef.current.getTime()) / 60000);
    const wordsDelta = wordCount - previousWordCountRef.current;

    const { data: existingStats } = await supabase
      .from('writing_stats')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle();

    if (existingStats) {
      await supabase
        .from('writing_stats')
        .update({
          poems_written: isNewPoem ? existingStats.poems_written + 1 : existingStats.poems_written,
          words_written: existingStats.words_written + wordsDelta,
          minutes_writing: existingStats.minutes_writing + minutesWriting,
        })
        .eq('id', existingStats.id);
    } else {
      await supabase
        .from('writing_stats')
        .insert([{
          user_id: user.id,
          date: today,
          poems_written: isNewPoem ? 1 : 0,
          words_written: wordsDelta,
          minutes_writing: minutesWriting,
        }]);
    }

    previousWordCountRef.current = wordCount;
  }, [user, wordCount]);

  const savePoem = useCallback(async () => {
    if (!user || (!content.trim() && !title.trim())) return;

    setSaving(true);

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

      if (currentPoemId) {
        const { error } = await supabase
          .from('poems')
          .update(poemData)
          .eq('id', currentPoemId);

        if (error) throw error;
        await updateWritingStats(false);
      } else {
        const { data, error } = await supabase
          .from('poems')
          .insert([poemData])
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setCurrentPoemId(data.id);
          await updateWritingStats(true);
        }
      }

      setLastSaved(new Date());
      onPoemSaved();
    } catch (error) {
      console.error('Error saving poem:', error);
    } finally {
      setSaving(false);
    }
  }, [user, title, content, isPublic, favorited, wordCount, currentPoemId, updateWritingStats, onPoemSaved]);

  const getRandomPrompt = useCallback(async () => {
    setLoadingAI(true);
    try {
      const aiPrompt = await generateWritingPrompt();
      setCurrentPrompt(aiPrompt);
      setShowPrompt(true);
    } catch (error) {
      console.error('Error generating prompt:', error);
      const fallbackPrompt = FALLBACK_PROMPTS[Math.floor(Math.random() * FALLBACK_PROMPTS.length)];
      setCurrentPrompt(fallbackPrompt);
      setShowPrompt(true);
    } finally {
      setLoadingAI(false);
    }
  }, []);

  const getAIEnhancement = useCallback(async () => {
    if (!content.trim()) return;

    setLoadingAI(true);
    setShowEnhancement(true);
    try {
      const result = await enhancePoem(content);
      setEnhancement(result);
    } catch (error) {
      console.error('Error enhancing poem:', error);
      setEnhancement({
        feedback: 'Unable to generate feedback at this time. Please try again later.',
        suggestions: []
      });
    } finally {
      setLoadingAI(false);
    }
  }, [content]);

  const getTitleSuggestions = useCallback(async () => {
    if (!content.trim()) return;

    setLoadingAI(true);
    setShowTitleSuggestions(true);
    try {
      const suggestions = await generateTitleSuggestions(content);
      setTitleSuggestions(suggestions);
    } catch (error) {
      console.error('Error generating titles:', error);
      setTitleSuggestions(['Unable to generate titles. Please try again later.']);
    } finally {
      setLoadingAI(false);
    }
  }, [content]);

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
            <div className="p-6 sm:p-8 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-white to-slate-50 dark:from-slate-800 dark:to-slate-800/50">
              <div className="flex items-start justify-between gap-4 mb-4">
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
                      ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Star size={18} fill={favorited ? 'currentColor' : 'none'} strokeWidth={2} />
                  <span className="text-sm">Favorite</span>
                </button>

                <button
                  onClick={() => setIsPublic(!isPublic)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    isPublic
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {isPublic ? <Globe size={18} strokeWidth={2} /> : <Lock size={18} strokeWidth={2} />}
                  <span className="text-sm">{isPublic ? 'Public' : 'Private'}</span>
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-8 border-b border-slate-200 dark:border-slate-700">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={getRandomPrompt}
                  disabled={loadingAI}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles size={18} className={loadingAI ? 'animate-spin' : ''} />
                  <span className="text-sm">Get Prompt</span>
                </button>

                <button
                  onClick={getTitleSuggestions}
                  disabled={loadingAI || !content.trim()}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Lightbulb size={18} />
                  <span className="text-sm">Title Ideas</span>
                </button>

                <button
                  onClick={getAIEnhancement}
                  disabled={loadingAI || !content.trim()}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Wand2 size={18} />
                  <span className="text-sm">Get Feedback</span>
                </button>

                <div className="ml-auto flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-4 py-2 rounded-xl">
                  <span className="font-medium">{wordCount} words</span>
                  <span className="text-slate-400 dark:text-slate-600">·</span>
                  <span className="font-medium">{lineCount} lines</span>
                  <span className="text-slate-400 dark:text-slate-600 hidden sm:inline">·</span>
                  <span className="font-medium hidden sm:inline">{charCount} chars</span>
                </div>
              </div>
            </div>

            {showPrompt && currentPrompt && (
              <div className="mx-6 sm:mx-8 mt-6 p-5 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles size={18} className="text-blue-600 dark:text-blue-400" />
                      <p className="text-sm font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wide">
                        Writing Prompt
                      </p>
                    </div>
                    <p className="text-blue-800 dark:text-blue-300 text-lg leading-relaxed">{currentPrompt}</p>
                  </div>
                  <button
                    onClick={() => setShowPrompt(false)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors p-1 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            )}

            {showTitleSuggestions && (
              <div className="mx-6 sm:mx-8 mt-6 p-5 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border border-violet-200 dark:border-violet-800 rounded-2xl shadow-sm">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Lightbulb size={18} className="text-violet-600 dark:text-violet-400" />
                    <p className="text-sm font-bold text-violet-900 dark:text-violet-300 uppercase tracking-wide">
                      Title Suggestions
                    </p>
                  </div>
                  <button
                    onClick={() => setShowTitleSuggestions(false)}
                    className="text-violet-600 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-300 transition-colors p-1 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-900/40"
                  >
                    <X size={20} />
                  </button>
                </div>
                {loadingAI ? (
                  <div className="flex items-center gap-3 text-violet-600 dark:text-violet-400 py-4">
                    <RefreshCw size={18} className="animate-spin" />
                    <span className="text-sm font-medium">Generating creative titles...</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {titleSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setTitle(suggestion);
                          setShowTitleSuggestions(false);
                        }}
                        className="block w-full text-left px-4 py-3 rounded-xl text-violet-700 dark:text-violet-300 font-medium hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-all duration-200 border border-transparent hover:border-violet-200 dark:hover:border-violet-700"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {showEnhancement && (
              <div className="mx-6 sm:mx-8 mt-6 p-5 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl shadow-sm">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Wand2 size={18} className="text-emerald-600 dark:text-emerald-400" />
                    <p className="text-sm font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wide">
                      AI Feedback
                    </p>
                  </div>
                  <button
                    onClick={() => setShowEnhancement(false)}
                    className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors p-1 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
                  >
                    <X size={20} />
                  </button>
                </div>
                {loadingAI ? (
                  <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 py-4">
                    <RefreshCw size={18} className="animate-spin" />
                    <span className="text-sm font-medium">Analyzing your poem...</span>
                  </div>
                ) : enhancement ? (
                  <div className="space-y-4">
                    <div className="text-emerald-800 dark:text-emerald-300 leading-relaxed">
                      {enhancement.feedback}
                    </div>
                    {enhancement.suggestions.length > 0 && (
                      <div>
                        <p className="text-sm font-bold text-emerald-900 dark:text-emerald-300 mb-3 uppercase tracking-wide">
                          Suggestions:
                        </p>
                        <ul className="space-y-2">
                          {enhancement.suggestions.map((suggestion, index) => (
                            <li
                              key={index}
                              className="text-emerald-700 dark:text-emerald-400 flex items-start gap-3 bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-lg"
                            >
                              <span className="text-emerald-600 dark:text-emerald-500 font-bold mt-0.5">•</span>
                              <span className="flex-1">{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            )}

            <div className="p-6 sm:p-8">
              <textarea
                ref={textareaRef}
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

export default memo(PoemEditor);
