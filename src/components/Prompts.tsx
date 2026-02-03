import { useState, useEffect, useCallback } from 'react';
import { Lightbulb, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface Prompt {
  id: string;
  prompt_text: string;
  prompt_date: string;
  category: string;
  response_count: number;
  user_has_responded: boolean;
}

export default function Prompts() {
  const { user } = useAuth();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'theme' | 'form' | 'word' | 'image'>('all');

  const loadPrompts = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('daily_prompts')
        .select('*')
        .order('prompt_date', { ascending: false })
        .limit(30);

      if (error) throw error;

      const promptsWithData = await Promise.all(
        (data || []).map(async (prompt) => {
          const { count } = await supabase
            .from('prompt_responses')
            .select('id', { count: 'exact', head: true })
            .eq('prompt_id', prompt.id);

          const { data: userResponse } = await supabase
            .from('prompt_responses')
            .select('id')
            .eq('prompt_id', prompt.id)
            .eq('user_id', user.id)
            .maybeSingle();

          return {
            ...prompt,
            response_count: count || 0,
            user_has_responded: !!userResponse
          };
        })
      );

      setPrompts(promptsWithData);
    } catch (error) {
      console.error('Error loading prompts:', error);
      setPrompts([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadPrompts();
    }
  }, [user, loadPrompts]);

  const filteredPrompts = filter === 'all'
    ? prompts
    : prompts.filter(p => p.category === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8 pb-24">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">Writing Prompts</h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">Get inspired and overcome writer's block</p>
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
            filter === 'all'
              ? 'bg-blue-500 text-white'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('theme')}
          className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
            filter === 'theme'
              ? 'bg-blue-500 text-white'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
          }`}
        >
          Theme
        </button>
        <button
          onClick={() => setFilter('form')}
          className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
            filter === 'form'
              ? 'bg-blue-500 text-white'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
          }`}
        >
          Form
        </button>
        <button
          onClick={() => setFilter('word')}
          className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
            filter === 'word'
              ? 'bg-blue-500 text-white'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
          }`}
        >
          Word
        </button>
        <button
          onClick={() => setFilter('image')}
          className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
            filter === 'image'
              ? 'bg-blue-500 text-white'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
          }`}
        >
          Image
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {filteredPrompts.map(prompt => (
            <div
              key={prompt.id}
              className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20">
                  <Lightbulb className="text-blue-600 dark:text-blue-400" size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 mb-2">
                    {prompt.category}
                  </span>
                  {prompt.user_has_responded && (
                    <span className="ml-2 text-green-600 dark:text-green-400 text-xs font-medium">
                      ✓ Responded
                    </span>
                  )}
                </div>
              </div>

              <p className="text-base sm:text-lg text-slate-900 dark:text-white font-serif mb-4">
                "{prompt.prompt_text}"
              </p>

              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Calendar size={14} />
                  {new Date(prompt.prompt_date).toLocaleDateString()}
                </div>
                <span className="text-slate-600 dark:text-slate-400">
                  {prompt.response_count} {prompt.response_count === 1 ? 'response' : 'responses'}
                </span>
              </div>
            </div>
          ))}

          {filteredPrompts.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Lightbulb className="mx-auto mb-4 text-slate-400" size={48} />
              <p className="text-slate-500 dark:text-slate-400">No prompts available in this category</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
