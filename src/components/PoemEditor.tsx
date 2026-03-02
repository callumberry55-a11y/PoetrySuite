import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { generateTags } from '@/lib/functions';
import {
  Save, Star, Globe, Lock, ArrowLeft, Tags, Sparkles, X,
  Eye, EyeOff, Type, BookOpen, Clock, Maximize2, Minimize2, Wrench,
  History, RotateCcw, FileText, Zap, Quote, Heart, Sunrise, Moon, Coffee
} from 'lucide-react';
import AIAssistant from './AIAssistant';
import PoetryTools from './PoetryTools';

interface PoemVersion {
  id: string;
  title: string;
  content: string;
  version_number: number;
  created_at: string;
}

interface PoemTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
  icon: typeof Quote;
}

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
  const [showTools, setShowTools] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [showVersions, setShowVersions] = useState(false);
  const [versions, setVersions] = useState<PoemVersion[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const savePoemRef = useRef<(() => Promise<void>) | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const lineCount = content.trim() ? content.split('\n').length : 1;
  const charCount = content.length;
  const readingTime = Math.ceil(wordCount / 200); // Average reading speed

  const templates: PoemTemplate[] = [
    {
      id: 'haiku',
      name: 'Haiku',
      description: '3 lines: 5-7-5 syllables',
      icon: Sunrise,
      content: `[Line 1 - 5 syllables]
[Line 2 - 7 syllables]
[Line 3 - 5 syllables]`,
    },
    {
      id: 'sonnet',
      name: 'Sonnet',
      description: '14 lines with ABAB CDCD EFEF GG rhyme',
      icon: Heart,
      content: `[Line 1 - A]
[Line 2 - B]
[Line 3 - A]
[Line 4 - B]

[Line 5 - C]
[Line 6 - D]
[Line 7 - C]
[Line 8 - D]

[Line 9 - E]
[Line 10 - F]
[Line 11 - E]
[Line 12 - F]

[Line 13 - G]
[Line 14 - G]`,
    },
    {
      id: 'acrostic',
      name: 'Acrostic',
      description: 'First letter of each line spells a word',
      icon: Quote,
      content: `[P]
[O]
[E]
[M]`,
    },
    {
      id: 'free-verse',
      name: 'Free Verse',
      description: 'No rules, just expression',
      icon: Zap,
      content: ``,
    },
    {
      id: 'limerick',
      name: 'Limerick',
      description: '5 lines with AABBA rhyme',
      icon: Coffee,
      content: `[Line 1 - A]
[Line 2 - A]
[Line 3 - B]
[Line 4 - B]
[Line 5 - A]`,
    },
    {
      id: 'villanelle',
      name: 'Villanelle',
      description: '19 lines with repeated refrains',
      icon: Moon,
      content: `[Line 1 - A1 (refrain)]
[Line 2 - b]
[Line 3 - A2 (refrain)]

[Line 4 - a]
[Line 5 - b]
[Line 6 - A1]

[Line 7 - a]
[Line 8 - b]
[Line 9 - A2]

[Line 10 - a]
[Line 11 - b]
[Line 12 - A1]

[Line 13 - a]
[Line 14 - b]
[Line 15 - A2]

[Line 16 - a]
[Line 17 - b]
[Line 18 - A1]
[Line 19 - A2]`,
    },
  ];

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

      if (poemId && content.trim() && generateTags) {
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

  const loadVersionHistory = useCallback(async () => {
    if (!currentPoemId) return;

    setLoadingVersions(true);
    try {
      const { data, error } = await supabase
        .from('poem_versions')
        .select('*')
        .eq('poem_id', currentPoemId)
        .order('version_number', { ascending: false });

      if (error) throw error;

      setVersions(data || []);
    } catch (error) {
      console.error('Error loading version history:', error);
      setVersions([]);
    } finally {
      setLoadingVersions(false);
    }
  }, [currentPoemId]);

  const saveVersion = useCallback(async () => {
    if (!currentPoemId || !content.trim()) return;

    try {
      const { data: existingVersions } = await supabase
        .from('poem_versions')
        .select('version_number')
        .eq('poem_id', currentPoemId)
        .order('version_number', { ascending: false })
        .limit(1);

      const nextVersion = existingVersions && existingVersions.length > 0
        ? existingVersions[0].version_number + 1
        : 1;

      const { error } = await supabase
        .from('poem_versions')
        .insert({
          poem_id: currentPoemId,
          title,
          content,
          version_number: nextVersion,
        });

      if (error) throw error;

      await loadVersionHistory();
    } catch (error) {
      console.error('Error saving version:', error);
    }
  }, [currentPoemId, title, content, loadVersionHistory]);

  const restoreVersion = useCallback(async (version: PoemVersion) => {
    if (!confirm(`Restore version ${version.version_number}? Current content will be saved as a new version.`)) return;

    await saveVersion();

    setTitle(version.title);
    setContent(version.content);
    setShowVersions(false);

    setTimeout(() => {
      savePoemRef.current?.();
    }, 100);
  }, [saveVersion]);

  const applyTemplate = useCallback((template: PoemTemplate) => {
    if (content.trim() && !confirm('Replace current content with template?')) return;

    setContent(template.content);
    setTitle(title || `New ${template.name}`);
    setShowTemplates(false);

    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  }, [content, title]);

  useEffect(() => {
    if (showVersions && currentPoemId) {
      loadVersionHistory();
    }
  }, [showVersions, currentPoemId, loadVersionHistory]);

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
                      onClick={() => {
                        setShowTools(!showTools);
                        if (!showTools) setShowAI(false);
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all hover:scale-105 active:scale-95 ${
                        showTools
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30'
                          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:shadow-md'
                      }`}
                      aria-pressed={showTools}
                    >
                      <Wrench size={16} className={showTools ? 'animate-pulse' : ''} />
                      <span className="text-sm font-semibold">Poetry Tools</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowAI(!showAI);
                        if (!showAI) setShowTools(false);
                      }}
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

                    <button
                      onClick={() => setShowTemplates(!showTemplates)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all hover:scale-105 active:scale-95 ${
                        showTemplates
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30'
                          : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:shadow-md'
                      }`}
                      aria-pressed={showTemplates}
                    >
                      <FileText size={16} className={showTemplates ? 'animate-pulse' : ''} />
                      <span className="text-sm font-semibold">Templates</span>
                    </button>

                    {currentPoemId && (
                      <button
                        onClick={() => setShowVersions(!showVersions)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all hover:scale-105 active:scale-95 ${
                          showVersions
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30'
                            : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:shadow-md'
                        }`}
                        aria-pressed={showVersions}
                      >
                        <History size={16} className={showVersions ? 'animate-pulse' : ''} />
                        <span className="text-sm font-semibold">Versions</span>
                      </button>
                    )}

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

      {/* Poetry Tools Panel */}
      {showTools && !zenMode && (
        <div className="w-full lg:w-96 border-l border-outline/20 bg-surface flex-shrink-0 overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
          <div className="flex justify-between items-center p-4 border-b border-outline/20 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
            <div className="flex items-center gap-2">
              <Wrench size={18} className="text-blue-600 dark:text-blue-400" />
              <h3 className="font-bold text-on-surface">Poetry Tools</h3>
            </div>
            <button
              onClick={() => setShowTools(false)}
              className="p-2 hover:bg-surface rounded-lg transition-all hover:rotate-90"
              aria-label="Close Poetry Tools"
            >
              <X size={20} />
            </button>
          </div>
          <PoetryTools content={content} />
        </div>
      )}

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

      {/* Templates Panel */}
      {showTemplates && !zenMode && (
        <div className="w-full lg:w-96 border-l border-outline/20 bg-surface flex-shrink-0 overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
          <div className="flex justify-between items-center p-4 border-b border-outline/20 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-bold text-on-surface">Poem Templates</h3>
            </div>
            <button
              onClick={() => setShowTemplates(false)}
              className="p-2 hover:bg-surface rounded-lg transition-all hover:rotate-90"
              aria-label="Close templates"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {templates.map((template) => {
              const Icon = template.icon;
              return (
                <button
                  key={template.id}
                  onClick={() => applyTemplate(template)}
                  className="w-full p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-lg transition-all group text-left"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Icon className="text-emerald-600 dark:text-emerald-400" size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 dark:text-white mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {template.name}
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {template.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Version History Panel */}
      {showVersions && !zenMode && currentPoemId && (
        <div className="w-full lg:w-96 border-l border-outline/20 bg-surface flex-shrink-0 overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
          <div className="flex justify-between items-center p-4 border-b border-outline/20 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
            <div className="flex items-center gap-2">
              <History size={18} className="text-amber-600 dark:text-amber-400" />
              <h3 className="font-bold text-on-surface">Version History</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={saveVersion}
                disabled={!content.trim()}
                className="px-3 py-1.5 bg-amber-600 text-white rounded-lg font-medium text-sm hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <Save size={14} />
                <span>Save Version</span>
              </button>
              <button
                onClick={() => setShowVersions(false)}
                className="p-2 hover:bg-surface rounded-lg transition-all hover:rotate-90"
                aria-label="Close version history"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {loadingVersions ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
              </div>
            ) : versions.length === 0 ? (
              <div className="text-center py-12 px-4">
                <History className="mx-auto text-slate-400 dark:text-slate-600 mb-3" size={48} />
                <p className="text-slate-600 dark:text-slate-400 font-medium mb-2">No saved versions yet</p>
                <p className="text-sm text-slate-500 dark:text-slate-500">
                  Click "Save Version" to create your first version snapshot
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {versions.map((version) => (
                  <div
                    key={version.id}
                    className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-lg transition-all group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-xs font-bold">
                          v{version.version_number}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {new Date(version.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <button
                        onClick={() => restoreVersion(version)}
                        className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-lg text-xs font-medium hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <RotateCcw size={12} />
                        <span>Restore</span>
                      </button>
                    </div>
                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-1 line-clamp-1">
                      {version.title}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                      {version.content}
                    </p>
                    <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      {version.content.split(/\s+/).length} words
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
