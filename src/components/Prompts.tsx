import { useState, useEffect } from 'react';
import { Lightbulb, Plus, Calendar, Target } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Prompt {
  id: string;
  title: string;
  content: string;
  prompt_type: string;
  difficulty: string;
  active_date: string;
}

interface PromptsProps {
  onUsePrompt: (prompt: Prompt) => void;
}

const predefinedPrompts: Omit<Prompt, 'id' | 'active_date'>[] = [
  {
    title: 'Morning Ritual',
    content: 'Write about the first hour of your day. Focus on sensory details and small moments of awareness.',
    prompt_type: 'daily',
    difficulty: 'beginner',
  },
  {
    title: 'Transformation',
    content: 'Explore a moment of personal change. What was the catalyst? How did you emerge different?',
    prompt_type: 'weekly',
    difficulty: 'intermediate',
  },
  {
    title: 'In the Voice of Water',
    content: 'Personify an element of nature. Write from its perspective about witnessing human life.',
    prompt_type: 'challenge',
    difficulty: 'advanced',
  },
  {
    title: 'Memory Fragment',
    content: 'Capture a childhood memory using only sensory details. No explanations, just images and feelings.',
    prompt_type: 'daily',
    difficulty: 'beginner',
  },
  {
    title: 'Conversations Unspoken',
    content: 'Write the dialogue you wish you could have with someone. What would you say if fear didn\'t hold you back?',
    prompt_type: 'weekly',
    difficulty: 'intermediate',
  },
  {
    title: 'Ekphrastic Challenge',
    content: 'Find a painting or photograph that moves you. Write a poem responding to or entering the image.',
    prompt_type: 'challenge',
    difficulty: 'advanced',
  },
  {
    title: 'Weather Within',
    content: 'Describe your current emotional state using only weather metaphors and imagery.',
    prompt_type: 'daily',
    difficulty: 'beginner',
  },
  {
    title: 'The Abandoned',
    content: 'Write about an abandoned place you know or imagine. What stories do the empty spaces hold?',
    prompt_type: 'weekly',
    difficulty: 'intermediate',
  },
  {
    title: 'Constraint: Lipogram',
    content: 'Write a poem without using the letter "e". Embrace the challenge and find creative solutions.',
    prompt_type: 'challenge',
    difficulty: 'advanced',
  },
  {
    title: 'Sound Poem',
    content: 'Write a poem focused entirely on sounds. Use onomatopoeia, rhythm, and auditory imagery.',
    prompt_type: 'daily',
    difficulty: 'intermediate',
  },
];

export default function Prompts({ onUsePrompt }: PromptsProps) {
  const { user } = useAuth();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'daily' | 'weekly' | 'challenge'>('all');

  useEffect(() => {
    loadPrompts();
  }, [loadPrompts]);

  const loadPrompts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('writing_prompts')
        .select('*')
        .order('active_date', { ascending: false })
        .limit(50);

      if (error) throw error;

      if (!data || data.length === 0) {
        await initializePrompts();
      } else {
        setPrompts(data || []);
      }
    } catch (error) {
      console.error('Error loading prompts:', error);
      setPrompts([]);
    } finally {
      setLoading(false);
    }
  };

  const initializePrompts = async () => {
    if (!user) return;

    try {
      const promptsToInsert = predefinedPrompts.map((prompt, index) => ({
        ...prompt,
        active_date: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      }));

      const { data, error } = await supabase
        .from('writing_prompts')
        .insert(promptsToInsert)
        .select();

      if (error) throw error;

      setPrompts(data || []);
    } catch (error) {
      console.error('Error initializing prompts:', error);
    }
  };

  const addCustomPrompt = async () => {
    if (!user) return;

    const title = prompt('Enter prompt title:');
    if (!title) return;

    const content = prompt('Enter prompt content:');
    if (!content) return;

    const difficulty = prompt('Enter difficulty (beginner/intermediate/advanced):', 'intermediate');
    if (!difficulty) return;

    try {
      const { error } = await supabase
        .from('writing_prompts')
        .insert({
          title,
          content,
          prompt_type: 'daily',
          difficulty,
          active_date: new Date().toISOString().split('T')[0],
        });

      if (error) throw error;

      await loadPrompts();
    } catch (error) {
      console.error('Error adding custom prompt:', error);
    }
  };

  const filteredPrompts = filter === 'all'
    ? prompts
    : prompts.filter(p => p.prompt_type === filter);

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Writing Prompts</h1>
            <p className="text-slate-600 dark:text-slate-400">Get inspired and overcome writer's block</p>
          </div>
          <button
            onClick={addCustomPrompt}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <Plus size={18} />
            Add Custom
          </button>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('daily')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'daily'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <Calendar size={16} />
            Daily
          </button>
          <button
            onClick={() => setFilter('weekly')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'weekly'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setFilter('challenge')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'challenge'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <Target size={16} />
            Challenges
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            {filteredPrompts.map(prompt => (
              <div
                key={prompt.id}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 flex-1">
                      <Lightbulb className="text-amber-500 flex-shrink-0" size={20} />
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{prompt.title}</h3>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 ${
                      prompt.difficulty === 'beginner'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        : prompt.difficulty === 'intermediate'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                      {prompt.difficulty}
                    </span>
                  </div>

                  <p className="text-slate-700 dark:text-slate-300 mb-4">{prompt.content}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <Calendar size={14} />
                      {new Date(prompt.active_date).toLocaleDateString()}
                    </div>
                    <button
                      onClick={() => onUsePrompt(prompt)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Use This Prompt
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredPrompts.length === 0 && (
              <div className="text-center py-12">
                <Lightbulb className="mx-auto mb-4 text-slate-400" size={48} />
                <p className="text-slate-600 dark:text-slate-400">No prompts available</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
