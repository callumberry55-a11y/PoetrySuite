import { useState, useEffect } from 'react';
import { Sparkles, Wand2, BookOpen, RefreshCw, MessageSquare, Mic, Zap, Award, AlertCircle, CheckCircle } from 'lucide-react';
import {
  callGeminiAPI,
  analyzePoemSentiment,
  scorePoemQuality,
  detectPoemForm
} from '@/utils/ai';

interface AIAssistantProps {
  content: string;
  onInsertText: (text: string) => void;
  onReplaceText: (text: string) => void;
}

interface AIResponse {
  text: string;
  type: 'success' | 'error' | 'info';
}

export default function AIAssistant({ content, onInsertText, onReplaceText }: AIAssistantProps) {
  const [activeTab, setActiveTab] = useState<'analyze' | 'improve' | 'generate' | 'rhyme' | 'insights'>('analyze');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [rhymeWord, setRhymeWord] = useState('');
  const [apiKeyStatus, setApiKeyStatus] = useState<'checking' | 'available' | 'missing'>('checking');

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    setApiKeyStatus(apiKey ? 'available' : 'missing');
  }, []);

  const analyzePoem = async () => {
    if (!content.trim()) {
      setResponse({ text: 'Please write some poetry first!', type: 'info' });
      return;
    }

    setLoading(true);
    setResponse(null);

    try {
      const systemPrompt = 'You are an expert poetry analyst and critic. Provide detailed, insightful analysis of poems.';
      const userPrompt = `Analyze this poem in detail:

${content}

Please provide:
1. Poetic form and structure (if identifiable)
2. Meter and rhythm analysis
3. Rhyme scheme (if present)
4. Literary devices used
5. Themes and meanings
6. Emotional tone and mood
7. Strengths and suggestions for improvement

Be specific and constructive.`;

      const result = await callGeminiAPI(systemPrompt, userPrompt);
      setResponse({ text: result, type: 'success' });
    } catch (error) {
      setResponse({
        text: error instanceof Error ? error.message : 'Failed to analyze poem',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const getDetailedInsights = async () => {
    if (!content.trim()) {
      setResponse({ text: 'Please write some poetry first!', type: 'info' });
      return;
    }

    setLoading(true);
    setResponse(null);

    try {
      const [sentiment, quality, form] = await Promise.all([
        analyzePoemSentiment(content),
        scorePoemQuality(content),
        detectPoemForm(content)
      ]);

      const insightText = `📊 DETAILED INSIGHTS

🎭 SENTIMENT ANALYSIS
Overall Sentiment: ${sentiment.sentiment.toUpperCase()}
Emotional Score: ${(sentiment.score * 100).toFixed(0)}%
Key Emotions: ${sentiment.emotions.join(', ')}

📝 FORM DETECTION
Identified Form: ${form.form}
Confidence: ${(form.confidence * 100).toFixed(0)}%
Characteristics: ${form.characteristics.join(', ')}

⭐ QUALITY SCORES (out of 10)
Overall: ${quality.overall}
Imagery: ${quality.imagery}
Rhythm & Flow: ${quality.rhythm}
Originality: ${quality.originality}
Emotional Impact: ${quality.emotion}

💡 FEEDBACK
${quality.feedback}`;

      setResponse({ text: insightText, type: 'success' });
    } catch (error) {
      setResponse({
        text: error instanceof Error ? error.message : 'Failed to get insights',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const improvePoem = async () => {
    if (!content.trim()) {
      setResponse({ text: 'Please write some poetry first!', type: 'info' });
      return;
    }

    setLoading(true);
    setResponse(null);

    try {
      const systemPrompt = 'You are an expert poetry editor. Suggest improvements while preserving the poet\'s voice and intent.';
      const userPrompt = `Suggest improvements for this poem:

${content}

Provide:
1. Specific line-by-line suggestions
2. Better word choices where appropriate
3. Improvements to rhythm and flow
4. Ways to strengthen imagery
5. An improved version of the poem

Keep the original meaning and style but enhance the craft.`;

      const result = await callGeminiAPI(systemPrompt, userPrompt);
      setResponse({ text: result, type: 'success' });
    } catch (error) {
      setResponse({
        text: error instanceof Error ? error.message : 'Failed to improve poem',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const generatePoem = async () => {
    if (!prompt.trim()) {
      setResponse({ text: 'Please enter a prompt or theme!', type: 'info' });
      return;
    }

    setLoading(true);
    setResponse(null);

    try {
      const systemPrompt = 'You are a talented poet. Create original, meaningful poetry based on the given prompts.';
      let userPrompt = `Write a poem about: ${prompt}`;

      if (selectedStyle) {
        userPrompt += `\n\nStyle: Write in the style of ${selectedStyle}, capturing their distinctive voice, themes, and techniques.`;
      }

      userPrompt += '\n\nCreate a complete, polished poem (8-20 lines recommended). Only output the poem itself, no explanations.';

      const result = await callGeminiAPI(systemPrompt, userPrompt);
      setResponse({ text: result, type: 'success' });
    } catch (error) {
      setResponse({
        text: error instanceof Error ? error.message : 'Failed to generate poem',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const findRhymes = async () => {
    if (!rhymeWord.trim()) {
      setResponse({ text: 'Please enter a word to find rhymes for!', type: 'info' });
      return;
    }

    setLoading(true);
    setResponse(null);

    try {
      const systemPrompt = 'You are a rhyming dictionary and poetry assistant. Provide creative rhyming suggestions.';
      const userPrompt = `Find rhymes and near-rhymes for the word: "${rhymeWord}"

Provide:
1. Perfect rhymes (20-30 words)
2. Near rhymes / slant rhymes (15-20 words)
3. Multisyllabic rhymes if applicable (10-15 phrases)
4. Creative usage examples in short poetic lines (5 examples)

Format the response clearly with categories.`;

      const result = await callGeminiAPI(systemPrompt, userPrompt);
      setResponse({ text: result, type: 'success' });
    } catch (error) {
      setResponse({
        text: error instanceof Error ? error.message : 'Failed to find rhymes',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const continuePoem = async () => {
    if (!content.trim()) {
      setResponse({ text: 'Please write some poetry first!', type: 'info' });
      return;
    }

    setLoading(true);
    setResponse(null);

    try {
      const systemPrompt = 'You are a collaborative poetry assistant. Continue poems while maintaining style, rhythm, and theme.';
      const userPrompt = `Continue this poem naturally (add 2-4 more lines):

${content}

Match the existing style, meter, rhyme scheme (if present), and themes. Only provide the additional lines.`;

      const result = await callGeminiAPI(systemPrompt, userPrompt);
      setResponse({ text: result, type: 'success' });
    } catch (error) {
      setResponse({
        text: error instanceof Error ? error.message : 'Failed to continue poem',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'analyze', label: 'Analyze', icon: BookOpen },
    { id: 'insights', label: 'Insights', icon: Award },
    { id: 'improve', label: 'Improve', icon: Wand2 },
    { id: 'generate', label: 'Generate', icon: Sparkles },
    { id: 'rhyme', label: 'Rhyme', icon: Mic },
  ] as const;

  return (
    <div className="flex flex-col h-full bg-surface">
      <div className="border-b border-outline/30 px-4 py-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
            <Zap size={24} className="text-primary" />
            AI Poetry Assistant
          </h2>
          {apiKeyStatus === 'available' && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle size={16} />
              <span>AI Ready</span>
            </div>
          )}
          {apiKeyStatus === 'missing' && (
            <div className="flex items-center gap-2 text-sm text-error">
              <AlertCircle size={16} />
              <span>API Key Missing</span>
            </div>
          )}
        </div>
      </div>

      {apiKeyStatus === 'missing' && (
        <div className="mx-4 mt-4 p-4 bg-error-container/20 border border-error rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-error flex-shrink-0 mt-1" size={20} />
            <div className="flex-1 text-sm text-on-error-container">
              <p className="font-semibold mb-2">Gemini API Key Not Found</p>
              <p className="mb-2">
                To use AI features, you need to add your Gemini API key to the environment variables.
              </p>
              <ol className="list-decimal ml-4 space-y-1">
                <li>Get your free API key from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">Google AI Studio</a></li>
                <li>Add it to your .env file as: VITE_GEMINI_API_KEY=your-key-here</li>
                <li>Refresh the page to load the new API key</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      <div className="border-b border-outline/30 flex overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => {
              setActiveTab(id);
              setResponse(null);
            }}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors whitespace-nowrap ${
              activeTab === id
                ? 'text-primary border-b-2 border-primary bg-primary-container/20'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50'
            }`}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'analyze' && (
          <div className="space-y-4">
            <p className="text-on-surface-variant text-sm">
              Get detailed analysis of your poem including form, meter, rhyme scheme, literary devices, and suggestions.
            </p>
            <button
              onClick={analyzePoem}
              disabled={loading || apiKeyStatus !== 'available'}
              className="w-full bg-primary text-on-primary px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <BookOpen size={20} />
              {loading ? 'Analyzing...' : 'Analyze Poem'}
            </button>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-4">
            <p className="text-on-surface-variant text-sm">
              Get comprehensive AI-powered insights including sentiment analysis, form detection, and quality scores.
            </p>
            <button
              onClick={getDetailedInsights}
              disabled={loading || apiKeyStatus !== 'available'}
              className="w-full bg-primary text-on-primary px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Award size={20} />
              {loading ? 'Analyzing...' : 'Get Detailed Insights'}
            </button>
          </div>
        )}

        {activeTab === 'improve' && (
          <div className="space-y-4">
            <p className="text-on-surface-variant text-sm">
              Get AI-powered suggestions to enhance your poem's imagery, rhythm, word choice, and overall impact.
            </p>
            <div className="flex gap-2">
              <button
                onClick={improvePoem}
                disabled={loading || apiKeyStatus !== 'available'}
                className="flex-1 bg-primary text-on-primary px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Wand2 size={20} />
                {loading ? 'Improving...' : 'Suggest Improvements'}
              </button>
              <button
                onClick={continuePoem}
                disabled={loading || apiKeyStatus !== 'available'}
                className="flex-1 bg-secondary text-on-secondary px-6 py-3 rounded-lg font-medium hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <RefreshCw size={20} />
                {loading ? 'Continuing...' : 'Continue Poem'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'generate' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="prompt" className="block text-sm font-medium text-on-surface mb-2">
                Prompt or Theme
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter a theme, emotion, or topic (e.g., 'the ocean at dawn' or 'loneliness in the city')"
                className="w-full px-4 py-3 bg-surface-variant text-on-surface rounded-lg border border-outline/30 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                rows={3}
              />
            </div>

            <div>
              <label htmlFor="style" className="block text-sm font-medium text-on-surface mb-2">
                Style (Optional)
              </label>
              <select
                id="style"
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="w-full px-4 py-3 bg-surface-variant text-on-surface rounded-lg border border-outline/30 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Original Style</option>
                <option value="Emily Dickinson">Emily Dickinson</option>
                <option value="William Shakespeare">William Shakespeare</option>
                <option value="Maya Angelou">Maya Angelou</option>
                <option value="Robert Frost">Robert Frost</option>
                <option value="Edgar Allan Poe">Edgar Allan Poe</option>
                <option value="Langston Hughes">Langston Hughes</option>
                <option value="Sylvia Plath">Sylvia Plath</option>
                <option value="Pablo Neruda">Pablo Neruda</option>
                <option value="Rumi">Rumi</option>
                <option value="Mary Oliver">Mary Oliver</option>
              </select>
            </div>

            <button
              onClick={generatePoem}
              disabled={loading || apiKeyStatus !== 'available'}
              className="w-full bg-primary text-on-primary px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Sparkles size={20} />
              {loading ? 'Generating...' : 'Generate Poem'}
            </button>
          </div>
        )}

        {activeTab === 'rhyme' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="rhyme-word" className="block text-sm font-medium text-on-surface mb-2">
                Find Rhymes
              </label>
              <input
                id="rhyme-word"
                type="text"
                value={rhymeWord}
                onChange={(e) => setRhymeWord(e.target.value)}
                placeholder="Enter a word (e.g., 'love', 'night', 'dream')"
                className="w-full px-4 py-3 bg-surface-variant text-on-surface rounded-lg border border-outline/30 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <button
              onClick={findRhymes}
              disabled={loading || apiKeyStatus !== 'available'}
              className="w-full bg-primary text-on-primary px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Mic size={20} />
              {loading ? 'Finding...' : 'Find Rhymes'}
            </button>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="relative w-20 h-20">
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full animate-[walk_0.8s_ease-in-out_infinite]"
              >
                <ellipse cx="50" cy="55" rx="20" ry="18" fill="currentColor" className="text-primary opacity-90" />
                <circle cx="65" cy="45" r="12" fill="currentColor" className="text-primary" />
                <path d="M 75 45 L 82 43 L 82 47 Z" fill="currentColor" className="text-primary/70" />
                <circle cx="70" cy="43" r="2" fill="currentColor" className="text-background" />
                <ellipse cx="45" cy="55" rx="12" ry="15" fill="currentColor" className="text-primary/60" transform="rotate(-20 45 55)" />
                <ellipse cx="32" cy="58" rx="8" ry="12" fill="currentColor" className="text-primary/80" transform="rotate(25 32 58)" />
                <g className="animate-[step-left_0.8s_ease-in-out_infinite]">
                  <line x1="45" y1="70" x2="45" y2="80" stroke="currentColor" strokeWidth="2" className="text-primary/90" />
                  <path d="M 45 80 L 42 82 M 45 80 L 48 82" stroke="currentColor" strokeWidth="2" className="text-primary/90" />
                </g>
                <g className="animate-[step-right_0.8s_ease-in-out_infinite]">
                  <line x1="55" y1="70" x2="55" y2="80" stroke="currentColor" strokeWidth="2" className="text-primary/90" />
                  <path d="M 55 80 L 52 82 M 55 80 L 58 82" stroke="currentColor" strokeWidth="2" className="text-primary/90" />
                </g>
              </svg>
            </div>
          </div>
        )}

        {response && (
          <div className={`p-4 rounded-lg ${
            response.type === 'error' ? 'bg-error-container text-on-error-container' :
            response.type === 'info' ? 'bg-secondary-container text-on-secondary-container' :
            'bg-tertiary-container text-on-tertiary-container'
          }`}>
            <div className="flex items-start gap-3">
              <MessageSquare size={20} className="flex-shrink-0 mt-1" />
              <div className="flex-1 space-y-3">
                <div className="whitespace-pre-wrap text-sm leading-relaxed">{response.text}</div>
                {response.type === 'success' && activeTab === 'generate' && (
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => onInsertText('\n\n' + response.text)}
                      className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      Insert Below
                    </button>
                    <button
                      onClick={() => onReplaceText(response.text)}
                      className="px-4 py-2 bg-secondary text-on-secondary rounded-lg text-sm font-medium hover:bg-secondary/90 transition-colors"
                    >
                      Replace Current
                    </button>
                  </div>
                )}
                {response.type === 'success' && activeTab === 'improve' && (
                  <button
                    onClick={() => onInsertText('\n\n---\nAI Suggestions:\n' + response.text)}
                    className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    Add as Notes
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
