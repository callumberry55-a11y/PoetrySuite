import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { generateTags } from '@/lib/functions';
import {
  Save, Star, Globe, Lock, ArrowLeft, Tags, Sparkles, X,
  Eye, EyeOff, Type, BookOpen, Clock, Maximize2, Minimize2
} from 'lucide-react';
import AIAssistant from './AIAssistant';

interface PoemEditorProps {
  selectedPoemId: string | null;
  onBack: () => void;
}

export default function PoemEditor({ selectedPoemId, onBack }: PoemEditorProps) {
  const { user } = useAuth();
  const [currentPoemId, setCurrentPoemId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAI, setShowAI] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const savePoemRef = useRef<(() => Promise<void>) | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const lineCount = content.trim() ? content.split('\n').length : 1;
  const charCount = content.length;
  const readingTime = Math.ceil(wordCount / 200); // Average reading speed

  const savePoem = useCallback(async () => {
    if (!user || !user.id || (!content.trim() && !title.trim())) return;

    setSaving(true);
    setError(null);

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    try {
      const poemData = {
        user_id: user.id,
        title: title.trim() || 'Untitled Poem',
        content,
        is_public: isPublic,
        favorited,
        word_count: wordCount,
        updated_at: new Date().toISOString(),
      };

      let poemId = currentPoemId;

      if (currentPoemId) {
        const { error } = await supabase.from('poems').update(poemData).eq('id', currentPoemId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('poems').insert(poemData).select('id').single();
        if (error) throw error;
        if (data) {
          poemId = data.id;
          setCurrentPoemId(data.id);
        }
      }

      if (poemId && content.trim()) {
        try {
          const result = await generateTags({ poemContent: content });
          const data = result.data as { tags?: string[] };
          if (data && Array.isArray(data.tags) && data.tags.length > 0) {
            await supabase.from('poem_tags').delete().eq('poem_id', poemId);

            for (const tagName of data.tags) {
              let tagId: string | null = null;

              const { data: existingTag } = await supabase
                .from('tags')
                .select('id')
                .eq('name', tagName)
                .eq('user_id', user.id)
                .maybeSingle();

              if (existingTag) {
                tagId = existingTag.id;
              } else {
                const { data: newTag, error: tagError } = await supabase
                  .from('tags')
                  .insert({ name: tagName, user_id: user.id })
                  .select('id')
                  .single();

                if (!tagError && newTag) {
                  tagId = newTag.id;
                }
              }

              if (tagId) {
                await supabase.from('poem_tags').insert({ poem_id: poemId, tag_id: tagId });
              }
            }

            const { data: poemTagsData } = await supabase
              .from('poem_tags')
              .select('tag_id, tags(name)')
              .eq('poem_id', poemId);

            if (poemTagsData) {
              const tagNames = poemTagsData
                .map(pt => (pt.tags as unknown as { name: string })?.name)
                .filter(Boolean);
              setTags(tagNames);
            }
          }
        } catch (tagError) {
          console.warn('Could not generate or save tags:', tagError);
        }
      }

      setLastSaved(new Date());
    } catch (err) {
      console.error(err);
      setError('Failed to save poem. Please check your connection.');
    } finally {
      setSaving(false);
    }
  }, [user, content, title, isPublic, favorited, wordCount, currentPoemId]);

  // Keep ref updated with latest savePoem function
  useEffect(() => {
    savePoemRef.current = savePoem;
  }, [savePoem]);

  const resetEditor = useCallback(() => {
    setTitle('');
    setContent('');
    setIsPublic(false);
    setFavorited(false);
    setTags([]);
    setLastSaved(null);
    setError(null);
    setCurrentPoemId(null);
  }, []);

  const loadPoem = useCallback(async (poemId: string) => {
    if (!poemId || !user) return;

    try {
      const { data, error } = await supabase.from('poems').select('*').eq('id', poemId).single();
      if (error) throw error;

      if (data) {
        setTitle(data.title);
        setContent(data.content);
        setIsPublic(data.is_public);
        setFavorited(data.favorited);
        setLastSaved(null);
        setError(null);
        setCurrentPoemId(poemId);

        const { data: poemTagsData } = await supabase
          .from('poem_tags')
          .select('tag_id, tags(name)')
          .eq('poem_id', poemId);

        if (poemTagsData && poemTagsData.length > 0) {
          const tagNames = poemTagsData
            .map(pt => (pt.tags as unknown as { name: string })?.name)
            .filter(Boolean);
          setTags(tagNames);
        } else {
          setTags([]);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load poem.');
    }
  }, [user]);

  useEffect(() => {
    if (selectedPoemId) {
      loadPoem(selectedPoemId);
    } else {
      resetEditor();
    }
  }, [selectedPoemId, loadPoem, resetEditor]);

  // Autosave effect - only depends on title and content, uses ref for savePoem
  useEffect(() => {
    if (content.trim() || title.trim()) {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        savePoemRef.current?.();
      }, 1500);
    }
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [title, content]);

  const handleInsertText = (text: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.substring(0, start) + text + content.substring(end);
      setContent(newContent);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + text.length, start + text.length);
      }, 0);
    } else {
      setContent(content + text);
    }
  };

  const handleReplaceText = (text: string) => {
    setContent(text);
  };

  const fontSizeClasses = {
    small: 'text-base',
    medium: 'text-lg',
    large: 'text-xl'
  };

  return (
    <div className={`h-full flex ${zenMode ? 'bg-slate-50 dark:bg-slate-900' : 'bg-background'} flex-1 transition-colors duration-300`}>
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className={`${zenMode ? 'max-w-3xl' : focusMode ? 'max-w-4xl' : 'max-w-5xl'} mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 transition-all duration-300`}>
          {/* Header */}
          {!zenMode && (
            <div className="flex items-center justify-between mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-all hover:gap-3 group"
                aria-label="Go back to library"
              >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Back to Library</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZenMode(true)}
                  className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant rounded-lg transition-all"
                  aria-label="Enter zen mode"
                  title="Zen Mode"
                >
                  <Maximize2 size={18} />
                </button>
                <button
                  onClick={() => setFocusMode(!focusMode)}
                  className={`p-2 rounded-lg transition-all ${
                    focusMode
                      ? 'text-primary bg-primary-container'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant'
                  }`}
                  aria-label={focusMode ? 'Exit focus mode' : 'Enter focus mode'}
                  title="Focus Mode"
                >
                  {focusMode ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>
          )}

          {/* Zen Mode Header */}
          {zenMode && (
            <div className="flex items-center justify-end mb-6 animate-in fade-in duration-500">
              <button
                onClick={() => setZenMode(false)}
                className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant rounded-lg transition-all"
                aria-label="Exit zen mode"
              >
                <Minimize2 size={18} />
              </button>
            </div>
          )}

          {error && (
            <div
              className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-xl border border-red-200 dark:border-red-800 animate-in slide-in-from-top-2 duration-300"
              role="alert"
              aria-live="assertive"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1">{error}</div>
                <button
                  onClick={() => setError(null)}
                  className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Main Editor Card */}
          <div className={`bg-surface rounded-2xl shadow-xl overflow-hidden border transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 ${
            zenMode ? 'border-transparent shadow-2xl' : 'border-outline/20 hover:border-outline/40'
          }`}>
            {/* Toolbar */}
            {!focusMode && !zenMode && (
              <div className="p-4 sm:p-6 border-b border-outline/20 bg-gradient-to-r from-surface to-surface-variant/30">
                <div className="flex flex-col gap-4">
                  {/* Primary Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setFavorited(!favorited)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all hover:scale-105 active:scale-95 ${
                        favorited
                          ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 shadow-md'
                          : 'bg-surface-variant/50 text-on-surface-variant hover:bg-surface-variant'
                      }`}
                      aria-pressed={favorited}
                    >
                      <Star size={16} fill={favorited ? 'currentColor' : 'none'} className={favorited ? 'animate-in zoom-in duration-300' : ''} />
                      <span className="text-sm font-semibold">Favorite</span>
                    </button>

                    <button
                      onClick={() => setIsPublic(!isPublic)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all hover:scale-105 active:scale-95 ${
                        isPublic
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 shadow-md'
                          : 'bg-surface-variant/50 text-on-surface-variant hover:bg-surface-variant'
                      }`}
                      aria-pressed={isPublic}
                    >
                      {isPublic ? <Globe size={16} /> : <Lock size={16} />}
                      <span className="text-sm font-semibold">{isPublic ? 'Public' : 'Private'}</span>
                    </button>

                    <button
                      onClick={() => setShowAI(!showAI)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all hover:scale-105 active:scale-95 ${
                        showAI
                          ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg shadow-purple-500/30'
                          : 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 hover:shadow-md'
                      }`}
                      aria-pressed={showAI}
                    >
                      <Sparkles size={16} className={showAI ? 'animate-pulse' : ''} />
                      <span className="text-sm font-semibold">AI Assistant</span>
                    </button>

                    {/* Font Size Selector */}
                    <div className="flex items-center gap-1 bg-surface-variant/50 rounded-xl p-1 ml-auto">
                      <button
                        onClick={() => setFontSize('small')}
                        className={`p-2 rounded-lg transition-all ${
                          fontSize === 'small' ? 'bg-surface text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                        title="Small text"
                      >
                        <Type size={14} />
                      </button>
                      <button
                        onClick={() => setFontSize('medium')}
                        className={`p-2 rounded-lg transition-all ${
                          fontSize === 'medium' ? 'bg-surface text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                        title="Medium text"
                      >
                        <Type size={16} />
                      </button>
                      <button
                        onClick={() => setFontSize('large')}
                        className={`p-2 rounded-lg transition-all ${
                          fontSize === 'large' ? 'bg-surface text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                        title="Large text"
                      >
                        <Type size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Stats Bar */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-on-surface-variant">
                    <div className="flex items-center gap-6 bg-surface/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-outline/10">
                      <div className="flex items-center gap-2">
                        <BookOpen size={14} />
                        <span className="font-semibold">{wordCount}</span>
                        <span className="text-xs opacity-70">words</span>
                      </div>
                      <div className="w-px h-4 bg-outline/20" />
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{lineCount}</span>
                        <span className="text-xs opacity-70">lines</span>
                      </div>
                      <div className="w-px h-4 bg-outline/20" />
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{charCount}</span>
                        <span className="text-xs opacity-70">chars</span>
                      </div>
                      <div className="w-px h-4 bg-outline/20" />
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        <span className="font-semibold">{readingTime}</span>
                        <span className="text-xs opacity-70">min read</span>
                      </div>
                    </div>

                    {/* Save Status */}
                    <div className="ml-auto">
                      {saving && (
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-800">
                          <Save size={14} className="animate-pulse" />
                          <span className="text-xs font-semibold">Saving...</span>
                        </div>
                      )}
                      {!saving && lastSaved && (
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                          <span className="text-xs font-semibold">
                            Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  {tags.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-outline/10">
                      <Tags size={16} className="text-on-surface-variant opacity-60" />
                      {tags.map(tag => (
                        <span
                          key={tag}
                          className="bg-gradient-to-r from-primary-container to-secondary-container text-on-primary-container text-xs font-semibold px-3 py-1 rounded-full shadow-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Title Input */}
            <div className={`${focusMode || zenMode ? 'p-6 sm:p-8' : 'p-4 sm:p-6'} border-b border-outline/10`}>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full ${zenMode ? 'text-4xl' : 'text-3xl sm:text-4xl'} font-bold bg-transparent border-none outline-none text-on-surface placeholder:text-on-surface-variant/50 transition-all focus:placeholder:text-on-surface-variant/70`}
                placeholder="Untitled Poem"
                aria-label="Poem title"
              />
            </div>

            {/* Content Area */}
            <div className={`${focusMode || zenMode ? 'p-8 sm:p-12' : 'p-6 sm:p-8'}`}>
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className={`w-full min-h-[calc(100vh-400px)] sm:min-h-[600px] bg-transparent border-none outline-none text-on-surface ${fontSizeClasses[fontSize]} leading-relaxed resize-none font-serif placeholder:text-on-surface-variant/50 transition-all focus:placeholder:text-on-surface-variant/70`}
                placeholder="Let your words flow like a gentle stream..."
                aria-label="Poem content"
                spellCheck="true"
              />
            </div>

            {/* Footer - Writing Progress */}
            {!focusMode && !zenMode && wordCount > 0 && (
              <div className="p-4 bg-gradient-to-r from-surface-variant/30 to-surface border-t border-outline/10">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="h-2 bg-outline/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 ease-out rounded-full"
                        style={{ width: `${Math.min((wordCount / 100) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-on-surface-variant whitespace-nowrap">
                    {wordCount < 50 ? 'Just starting...' : wordCount < 100 ? 'Getting there!' : 'Great progress!'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Assistant Panel */}
      {showAI && !zenMode && (
        <div className="w-full lg:w-96 border-l border-outline/20 bg-surface flex-shrink-0 overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
          <div className="flex justify-between items-center p-4 border-b border-outline/20 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-violet-600 dark:text-violet-400" />
              <h3 className="font-bold text-on-surface">AI Assistant</h3>
            </div>
            <button
              onClick={() => setShowAI(false)}
              className="p-2 hover:bg-surface rounded-lg transition-all hover:rotate-90"
              aria-label="Close AI Assistant"
            >
              <X size={20} />
            </button>
          </div>
          <AIAssistant
            content={content}
            onInsertText={handleInsertText}
            onReplaceText={handleReplaceText}
          />
        </div>
      )}
    </div>
  );
}
