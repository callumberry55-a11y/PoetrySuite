import { useState, useEffect, useCallback } from 'react';
import { Lightbulb, Calendar, Sparkles, Pen, X, Save, Eye, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { generateWritingPrompt } from '@/utils/ai';

interface Prompt {
  id: string;
  prompt_text: string;
  prompt_date: string;
  category: string;
  response_count: number;
  user_has_responded: boolean;
}

interface PromptResponse {
  id: string;
  content: string;
  created_at: string;
}

export default function Prompts() {
  const { user } = useAuth();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiPrompt, setAiPrompt] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'theme' | 'form' | 'word' | 'image'>('all');
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseContent, setResponseContent] = useState('');
  const [submittingResponse, setSubmittingResponse] = useState(false);
  const [userResponse, setUserResponse] = useState<PromptResponse | null>(null);
  const [apiKeyAvailable, setApiKeyAvailable] = useState(false);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    setApiKeyAvailable(!!apiKey);
  }, []);

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

  const generateAIPrompt = async () => {
    setGeneratingAI(true);
    try {
      const prompt = await generateWritingPrompt();
      setAiPrompt(prompt);
    } catch (error) {
      console.error('Failed to generate AI prompt:', error);
    } finally {
      setGeneratingAI(false);
    }
  };

  const openResponseModal = async (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setResponseContent('');
    setUserResponse(null);

    if (prompt.user_has_responded) {
      try {
        const { data, error } = await supabase
          .from('prompt_responses')
          .select('*')
          .eq('prompt_id', prompt.id)
          .eq('user_id', user?.id)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          setUserResponse(data);
          setResponseContent(data.content);
        }
      } catch (error) {
        console.error('Error loading response:', error);
      }
    }

    setShowResponseModal(true);
  };

  const submitResponse = async () => {
    if (!user || !selectedPrompt || !responseContent.trim()) return;

    setSubmittingResponse(true);
    try {
      if (userResponse) {
        const { error } = await supabase
          .from('prompt_responses')
          .update({ content: responseContent, updated_at: new Date().toISOString() })
          .eq('id', userResponse.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('prompt_responses')
          .insert({
            prompt_id: selectedPrompt.id,
            user_id: user.id,
            content: responseContent
          });

        if (error) throw error;
      }

      setShowResponseModal(false);
      setResponseContent('');
      setSelectedPrompt(null);
      setUserResponse(null);
      loadPrompts();
    } catch (error) {
      console.error('Error submitting response:', error);
      alert('Failed to submit response. Please try again.');
    } finally {
      setSubmittingResponse(false);
    }
  };

  const filteredPrompts = filter === 'all'
    ? prompts
    : prompts.filter(p => p.category === filter);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pb-24">
      <div className="relative bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 h-32 sm:h-40">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <Lightbulb className="w-10 h-10 sm:w-12 sm:h-12 mb-2 animate-pulse" />
          <h1 className="text-2xl sm:text-4xl font-bold mb-1">Writing Prompts</h1>
          <p className="text-sm sm:text-base opacity-90">Get inspired and overcome writer's block</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-8 space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Need instant inspiration?</h3>
            <button
              onClick={generateAIPrompt}
              disabled={generatingAI || !apiKeyAvailable}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-xl font-semibold hover:from-violet-600 hover:to-fuchsia-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-105 duration-300"
              title={apiKeyAvailable ? "Generate AI writing prompt" : "AI features unavailable - API key not configured"}
            >
              <Sparkles size={20} />
              {generatingAI ? 'Generating...' : 'AI Prompt'}
            </button>
          </div>

          {aiPrompt && (
            <div className="p-6 bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-900/20 dark:to-fuchsia-900/20 border-2 border-violet-300 dark:border-violet-700 rounded-2xl animate-in slide-in-from-top duration-300">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl shadow-lg">
                  <Sparkles className="text-white" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-violet-900 dark:text-violet-100 mb-2">AI-Generated Prompt</h3>
                  <p className="text-slate-800 dark:text-slate-200 leading-relaxed mb-3 italic">{aiPrompt}</p>
                  <button
                    onClick={() => setAiPrompt(null)}
                    className="text-sm px-4 py-2 bg-violet-200 dark:bg-violet-800 text-violet-800 dark:text-violet-200 rounded-xl hover:bg-violet-300 dark:hover:bg-violet-700 font-semibold transition-all"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-5 py-3 rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base shadow-lg ${
              filter === 'all'
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white scale-105'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('theme')}
            className={`px-5 py-3 rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base shadow-lg ${
              filter === 'theme'
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white scale-105'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            Theme
          </button>
          <button
            onClick={() => setFilter('form')}
            className={`px-5 py-3 rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base shadow-lg ${
              filter === 'form'
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white scale-105'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            Form
          </button>
          <button
            onClick={() => setFilter('word')}
            className={`px-5 py-3 rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base shadow-lg ${
              filter === 'word'
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white scale-105'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            Word
          </button>
          <button
            onClick={() => setFilter('image')}
            className={`px-5 py-3 rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base shadow-lg ${
              filter === 'image'
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white scale-105'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            Image
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-800"></div>
              <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPrompts.map(prompt => (
              <div
                key={prompt.id}
                className="group bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-800 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
                    <Lightbulb className="text-white" size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="inline-block px-3 py-1 rounded-xl text-sm font-semibold bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 mb-2">
                      {prompt.category}
                    </span>
                    {prompt.user_has_responded && (
                      <span className="ml-2 px-3 py-1 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-semibold shadow-lg">
                        ✓ Responded
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-lg text-slate-900 dark:text-white font-serif mb-4 italic leading-relaxed">
                  "{prompt.prompt_text}"
                </p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm p-3 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50 rounded-xl">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium">
                      <Calendar size={16} />
                      {new Date(prompt.prompt_date).toLocaleDateString()}
                    </div>
                    <span className="text-slate-700 dark:text-slate-300 font-semibold">
                      {prompt.response_count} {prompt.response_count === 1 ? 'response' : 'responses'}
                    </span>
                  </div>

                  <button
                    onClick={() => openResponseModal(prompt)}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 hover:scale-[1.02] ${
                      prompt.user_has_responded
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                        : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white'
                    }`}
                  >
                    {prompt.user_has_responded ? (
                      <>
                        <Eye size={18} />
                        View My Response
                      </>
                    ) : (
                      <>
                        <Pen size={18} />
                        Write Response
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}

            {filteredPrompts.length === 0 && (
              <div className="col-span-full text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg">
                <Lightbulb className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-700" />
                <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">No prompts available in this category</p>
              </div>
            )}
          </div>
        )}
      </div>

      {showResponseModal && selectedPrompt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-2 border-slate-200 dark:border-slate-800 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 p-6 rounded-t-3xl flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Lightbulb className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    {userResponse ? 'Your Response' : 'Write Your Response'}
                  </h2>
                </div>
                <p className="text-white/90 text-lg italic">
                  "{selectedPrompt.prompt_text}"
                </p>
              </div>
              <button
                onClick={() => {
                  setShowResponseModal(false);
                  setSelectedPrompt(null);
                  setResponseContent('');
                  setUserResponse(null);
                }}
                className="p-2 hover:bg-white/20 rounded-xl transition-all"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            <div className="p-6">
              <textarea
                value={responseContent}
                onChange={(e) => setResponseContent(e.target.value)}
                placeholder="Write your response to this prompt..."
                className="w-full min-h-[300px] p-4 rounded-2xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-serif text-base leading-relaxed"
              />

              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {responseContent.trim().split(/\s+/).filter(Boolean).length} words
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowResponseModal(false);
                      setSelectedPrompt(null);
                      setResponseContent('');
                      setUserResponse(null);
                    }}
                    className="px-6 py-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitResponse}
                    disabled={!responseContent.trim() || submittingResponse}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submittingResponse ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        {userResponse ? 'Update Response' : 'Save Response'}
                      </>
                    )}
                  </button>
                </div>
              </div>

              {userResponse && (
                <div className="mt-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-700 rounded-2xl flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-green-800 dark:text-green-200">
                      You've already responded to this prompt
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                      Last updated: {new Date(userResponse.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
