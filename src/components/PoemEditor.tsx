import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { generateTags } from '@/lib/functions';
import { Save, Star, Globe, Lock, ArrowLeft, Tags } from 'lucide-react';

interface PoemEditorProps {
  selectedPoemId: string | null;
  onBack: () => void;
}

export default function PoemEditor({ selectedPoemId, onBack }: PoemEditorProps) {
  const { user } = useAuth();
  const [currentPoemId, setCurrentPoemId] = useState<string | null>(selectedPoemId);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const lineCount = content.trim() ? content.split('\n').length : 1;

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
      if (currentPoemId !== selectedPoemId) {
        loadPoem(selectedPoemId);
      }
    } else {
      resetEditor();
    }
  }, [selectedPoemId, currentPoemId, loadPoem, resetEditor]);

  useEffect(() => {
    if (content.trim() || title.trim()) {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(savePoem, 1500);
    }
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [title, content, savePoem]);

  return (
    <div className="h-full flex flex-col bg-background flex-1">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface mb-6 transition-colors"
            aria-label="Go back to library"
          >
            <ArrowLeft size={20} aria-hidden="true" />
            <span className="font-medium">Back to Library</span>
          </button>

          {error && (
            <div
              className="mb-4 p-4 bg-error-container text-on-error-container rounded-lg"
              role="alert"
              aria-live="assertive"
            >
              {error}
            </div>
          )}

          <div className="bg-surface rounded-2xl shadow-sm overflow-hidden border border-outline/30">
            <div className="p-4 sm:p-6 border-b border-outline/30">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <label htmlFor="poem-title" className="sr-only">Poem Title</label>
                <input
                  id="poem-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-2xl sm:text-3xl font-bold bg-transparent border-none outline-none text-on-surface flex-1 placeholder:text-on-surface-variant/70 w-full"
                  placeholder="Untitled Poem"
                  aria-label="Poem title"
                />
                <div className="flex items-center justify-end gap-3 text-sm" aria-live="polite" aria-atomic="true">
                  {saving && (
                    <div className="flex items-center gap-2 text-on-secondary-container bg-secondary-container/50 px-3 py-1.5 rounded-full">
                      <Save size={14} className="animate-pulse" aria-hidden="true" />
                      <span>Saving...</span>
                    </div>
                  )}
                  {!saving && lastSaved && (
                    <div className="text-on-surface-variant bg-surface-variant px-3 py-1.5 rounded-full hidden sm:block">
                      <span aria-label={`Poem saved at ${lastSaved.toLocaleTimeString()}`}>
                        Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFavorited(!favorited)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors w-full sm:w-auto justify-center ${
                      favorited
                        ? 'bg-primary-container text-on-primary-container'
                        : 'bg-surface-variant text-on-surface-variant hover:bg-on-surface-variant/10'
                    }`}
                    aria-pressed={favorited}
                    aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Star size={18} fill={favorited ? 'currentColor' : 'none'} aria-hidden="true" />
                    <span className="text-sm">Favorite</span>
                  </button>

                  <button
                    onClick={() => setIsPublic(!isPublic)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors w-full sm:w-auto justify-center ${
                      isPublic
                        ? 'bg-primary-container text-on-primary-container'
                        : 'bg-surface-variant text-on-surface-variant hover:bg-on-surface-variant/10'
                    }`}
                    aria-pressed={isPublic}
                    aria-label={isPublic ? 'Make poem private' : 'Make poem public'}
                  >
                    {isPublic ? <Globe size={18} aria-hidden="true" /> : <Lock size={18} aria-hidden="true" />}
                    <span className="text-sm">{isPublic ? 'Public' : 'Private'}</span>
                  </button>
                </div>

                <div className="mt-2 sm:mt-0 sm:ml-auto flex items-center justify-center gap-4 text-sm text-on-surface-variant bg-surface-variant px-4 py-2 rounded-lg" role="status" aria-live="polite">
                  <span className="font-medium" aria-label={`${wordCount} words`}>{wordCount} words</span>
                  <span className="text-outline" aria-hidden="true">·</span>
                  <span className="font-medium" aria-label={`${lineCount} lines`}>{lineCount} lines</span>
                </div>
              </div>
              {tags.length > 0 && (
                <div className="mt-4 flex items-center gap-2 flex-wrap">
                    <Tags size={18} className="text-on-surface-variant" />
                    {tags.map(tag => (
                        <span key={tag} className="bg-secondary-container text-on-secondary-container text-xs font-medium px-2 py-1 rounded-full">{tag}</span>
                    ))}
                </div>
              )}
            </div>

            <div className="p-4 sm:p-6">
              <label htmlFor="poem-content" className="sr-only">Poem Content</label>
              <textarea
                id="poem-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full min-h-[calc(100vh-300px)] sm:min-h-[500px] bg-transparent border-none outline-none text-on-surface text-base sm:text-lg leading-relaxed resize-none font-serif placeholder:text-on-surface-variant/70"
                placeholder="Let your words flow..."
                aria-label="Poem content"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
