import { useState, useEffect, useCallback } from 'react';
import { Lightbulb, Plus, Calendar, Target } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, getDocs, addDoc, query, orderBy, limit, writeBatch, doc } from "firebase/firestore"; 
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
    content: "Write the dialogue you wish you could have with someone. What would you say if fear didn't hold you back?",
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

  const initializePrompts = useCallback(async () => {
    if (!user) return [];

    try {
      const batch = writeBatch(db);
      const promptsCollection = collection(db, "writing_prompts");
      const newPrompts: Prompt[] = [];
      
      predefinedPrompts.forEach((prompt, index) => {
        const docRef = doc(promptsCollection);
        const newPromptData = {
          ...prompt,
          active_date: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        };
        batch.set(docRef, newPromptData);
        newPrompts.push({ id: docRef.id, ...newPromptData });
      });

      await batch.commit();
      return newPrompts.sort((a, b) => new Date(b.active_date).getTime() - new Date(a.active_date).getTime());
    } catch (error) {
      console.error('Error initializing prompts:', error);
      return [];
    }
  }, [user]);

  const loadPrompts = useCallback(async () => {
    setLoading(true);
    try {
      const promptsCollection = collection(db, "writing_prompts");
      const q = query(promptsCollection, orderBy('active_date', 'desc'), limit(50));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        const newPrompts = await initializePrompts();
        setPrompts(newPrompts);
      } else {
        const promptsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Prompt));
        setPrompts(promptsData);
      }
    } catch (error) {
      console.error('Error loading prompts:', error);
      setPrompts([]);
    } finally {
      setLoading(false);
    }
  }, [initializePrompts]);

  useEffect(() => {
    if (user) {
      loadPrompts();
    }
  }, [user, loadPrompts]);

  const addCustomPrompt = async () => {
    if (!user) return;

    const title = prompt('Enter prompt title:');
    if (!title) return;

    const content = prompt('Enter prompt content:');
    if (!content) return;

    const difficulty = prompt('Enter difficulty (beginner/intermediate/advanced):', 'intermediate');
    if (!difficulty) return;

    try {
      const promptsCollection = collection(db, "writing_prompts");
      const newDoc = await addDoc(promptsCollection, {
        title,
        content,
        prompt_type: 'daily',
        difficulty,
        active_date: new Date().toISOString().split('T')[0],
        user_id: user.uid,
      });
      setPrompts(prev => [{ id: newDoc.id, title, content, prompt_type: 'daily', difficulty, active_date: new Date().toISOString().split('T')[0]} as Prompt, ...prev]);
    } catch (error) {
      console.error('Error adding custom prompt:', error);
    }
  };

  const filteredPrompts = filter === 'all'
    ? prompts
    : prompts.filter(p => p.prompt_type === filter);

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-background to-secondary-container/20">
      <div className="p-6 border-b border-outline">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-on-background mb-2">Writing Prompts</h1>
            <p className="text-on-surface-variant">Get inspired and overcome writer's block</p>
          </div>
          <button
            onClick={addCustomPrompt}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-on-primary rounded-lg font-medium transition-colors"
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
                ? 'bg-primary text-on-primary'
                : 'bg-surface text-on-surface-variant hover:bg-surface-variant'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('daily')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'daily'
                ? 'bg-primary text-on-primary'
                : 'bg-surface text-on-surface-variant hover:bg-surface-variant'
            }`}
          >
            <Calendar size={16} />
            Daily
          </button>
          <button
            onClick={() => setFilter('weekly')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'weekly'
                ? 'bg-primary text-on-primary'
                : 'bg-surface text-on-surface-variant hover:bg-surface-variant'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setFilter('challenge')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'challenge'
                ? 'bg-primary text-on-primary'
                : 'bg-surface text-on-surface-variant hover:bg-surface-variant'
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
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPrompts.map(prompt => (
              <div
                key={prompt.id}
                className="bg-surface rounded-xl shadow-sm border border-outline overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 flex-1">
                      <Lightbulb className="text-tertiary flex-shrink-0" size={20} />
                      <h3 className="text-lg font-bold text-on-surface">{prompt.title}</h3>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 ${
                      prompt.difficulty === 'beginner'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        : prompt.difficulty === 'intermediate'
                        ? 'bg-primary-container text-on-primary-container'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                      {prompt.difficulty}
                    </span>
                  </div>

                  <p className="text-on-surface mb-4">{prompt.content}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                      <Calendar size={14} />
                      {new Date(prompt.active_date).toLocaleDateString()}
                    </div>
                    <button
                      onClick={() => onUsePrompt(prompt)}
                      className="px-4 py-2 bg-primary hover:bg-primary/90 text-on-primary rounded-lg text-sm font-medium transition-colors"
                    >
                      Use This Prompt
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredPrompts.length === 0 && (
              <div className="text-center py-12">
                <Lightbulb className="mx-auto mb-4 text-on-surface-variant" size={48} />
                <p className="text-on-surface-variant">No prompts available</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
