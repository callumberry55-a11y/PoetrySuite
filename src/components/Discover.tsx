import { useState, useEffect } from 'react';
import { Shield, Sparkles, Brain, Zap, Target, X, Loader2, Music, Users, Lightbulb, Languages } from 'lucide-react';
import { runSecurityChecks } from '../utils/security';
import { GoogleGenerativeAI } from '@google/generative-ai';

type ToolType = 'assistant' | 'analysis' | 'generate' | 'validator' | 'rhyme-meter' | 'cowrite' | 'recommendations' | 'translate' | null;

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export default function Discover() {
  const [securityStatus, setSecurityStatus] = useState<'active' | 'inactive' | 'checking'>('checking');
  const [activeTool, setActiveTool] = useState<ToolType>(null);
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedForm, setSelectedForm] = useState('sonnet');
  const [theme, setTheme] = useState('');
  const [emotion, setEmotion] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('Spanish');
  const [cowriteContext, setCowriteContext] = useState('');
  const [userPreferences, setUserPreferences] = useState('');

  useEffect(() => {
    const performCheck = async () => {
      setSecurityStatus('checking');
      const result = await runSecurityChecks('some-user-input');
      setSecurityStatus(result ? 'active' : 'inactive');
    };

    const timer = setTimeout(performCheck, 0);
    const interval = setInterval(performCheck, 5000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const handleAIAssistant = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setResult('');

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const prompt = `As a poetry expert, analyze the following poem and provide constructive feedback and suggestions for improvement:\n\n${inputText}\n\nProvide specific suggestions on imagery, word choice, rhythm, and overall impact.`;
      const response = await model.generateContent(prompt);
      setResult(response.response.text());
    } catch {
      setResult('Error generating suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStyleAnalysis = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setResult('');

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const prompt = `Analyze the writing style of this poem and provide detailed insights:\n\n${inputText}\n\nInclude: tone, voice, literary devices used, stylistic patterns, and unique characteristics.`;
      const response = await model.generateContent(prompt);
      setResult(response.response.text());
    } catch {
      setResult('Error analyzing style. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickGenerate = async () => {
    if (!theme.trim() && !emotion.trim()) return;
    setLoading(true);
    setResult('');

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const prompt = `Generate 3-5 creative poem ideas based on:\nTheme: ${theme || 'any'}\nEmotion: ${emotion || 'any'}\n\nProvide brief descriptions for each idea that a poet could develop.`;
      const response = await model.generateContent(prompt);
      setResult(response.response.text());
    } catch {
      setResult('Error generating ideas. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormValidator = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setResult('');

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const prompt = `Validate if this poem follows the rules of a ${selectedForm}:\n\n${inputText}\n\nProvide detailed feedback on structure, rhyme scheme, meter, and any deviations from the traditional form.`;
      const response = await model.generateContent(prompt);
      setResult(response.response.text());
    } catch {
      setResult('Error validating form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRhymeMeter = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setResult('');

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const prompt = `Perform an advanced analysis of the rhyme scheme and meter of this poem:\n\n${inputText}\n\nProvide:\n1. Detailed rhyme scheme (ABAB, etc.)\n2. Meter analysis (iambic pentameter, etc.)\n3. Syllable count per line\n4. Internal rhymes and sound patterns\n5. Suggestions for improving rhythm and flow`;
      const response = await model.generateContent(prompt);
      setResult(response.response.text());
    } catch {
      setResult('Error analyzing rhyme and meter. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCowrite = async () => {
    if (!cowriteContext.trim()) return;
    setLoading(true);
    setResult('');

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const prompt = `You are a collaborative poetry writing partner. Based on this context or starting lines:\n\n${cowriteContext}\n\nContinue the poem or suggest next lines that maintain the style, theme, and flow. Provide 2-3 different continuation options.`;
      const response = await model.generateContent(prompt);
      setResult(response.response.text());
    } catch {
      setResult('Error generating co-writing suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecommendations = async () => {
    if (!userPreferences.trim()) return;
    setLoading(true);
    setResult('');

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const prompt = `Based on these poetry preferences:\n\n${userPreferences}\n\nProvide personalized recommendations including:\n1. Poets and authors to explore\n2. Poetry styles and forms to try\n3. Themes that might resonate\n4. Writing exercises to develop your style\n5. Classic and contemporary poems to read`;
      const response = await model.generateContent(prompt);
      setResult(response.response.text());
    } catch {
      setResult('Error generating recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setResult('');

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const prompt = `Translate this poem to ${targetLanguage}, preserving its poetic essence:\n\n${inputText}\n\nProvide:\n1. The translated poem\n2. Notes on how you preserved rhythm, imagery, and meaning\n3. Any cultural adaptations made\n4. Alternative word choices for key phrases`;
      const response = await model.generateContent(prompt);
      setResult(response.response.text());
    } catch {
      setResult('Error translating poem. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setActiveTool(null);
    setInputText('');
    setResult('');
    setTheme('');
    setEmotion('');
    setCowriteContext('');
    setUserPreferences('');
  };

  const renderSecurityStatus = () => {
    switch (securityStatus) {
      case 'active':
        return (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <Shield size={18} />
            <span className="hidden sm:inline">AI Security Guard: Active</span>
            <span className="sm:hidden">Security Active</span>
          </div>
        );
      case 'inactive':
        return (
          <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
            <Shield size={18} />
            <span className="hidden sm:inline">AI Security Guard: Inactive</span>
            <span className="sm:hidden">Security Inactive</span>
          </div>
        );
      case 'checking':
        return (
          <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400">
            <Shield size={18} className="animate-pulse" />
            <span className="hidden sm:inline">AI Security Guard: Checking...</span>
            <span className="sm:hidden">Checking...</span>
          </div>
        );
      default:
        return null;
    }
  };

  const aiTools = [
    {
      icon: Sparkles,
      title: 'AI Poetry Assistant',
      description: 'Get intelligent suggestions and improvements for your poetry',
      color: 'from-purple-500 to-violet-500',
      status: 'Available',
      type: 'assistant' as ToolType
    },
    {
      icon: Brain,
      title: 'Style Analysis',
      description: 'Analyze your writing style and get personalized insights',
      color: 'from-purple-500 to-pink-500',
      status: 'Available',
      type: 'analysis' as ToolType
    },
    {
      icon: Zap,
      title: 'Quick Generate',
      description: 'Generate poem ideas based on themes and emotions',
      color: 'from-cyan-400 to-sky-500',
      status: 'Available',
      type: 'generate' as ToolType
    },
    {
      icon: Target,
      title: 'Form Validator',
      description: 'Check if your poem matches specific poetic forms',
      color: 'from-green-500 to-emerald-500',
      status: 'Available',
      type: 'validator' as ToolType
    },
    {
      icon: Music,
      title: 'Rhyme & Meter Analysis',
      description: 'Advanced analysis of rhyme schemes and metrical patterns',
      color: 'from-rose-500 to-red-500',
      status: 'Available',
      type: 'rhyme-meter' as ToolType
    },
    {
      icon: Users,
      title: 'AI Co-Writing',
      description: 'Collaborate with AI to continue and develop your poems',
      color: 'from-violet-500 to-purple-500',
      status: 'Available',
      type: 'cowrite' as ToolType
    },
    {
      icon: Lightbulb,
      title: 'Poetry Recommendations',
      description: 'Get personalized suggestions based on your preferences',
      color: 'from-amber-500 to-yellow-500',
      status: 'Available',
      type: 'recommendations' as ToolType
    },
    {
      icon: Languages,
      title: 'Translation & Adaptation',
      description: 'Translate poems while preserving poetic essence',
      color: 'from-teal-500 to-cyan-500',
      status: 'Available',
      type: 'translate' as ToolType
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pb-24">
      <div className="relative bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 h-32 sm:h-40">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 mb-2 animate-pulse" />
          <h1 className="text-2xl sm:text-4xl font-bold mb-1">AI Poetry Hub</h1>
          <p className="text-sm sm:text-base opacity-90">Elevate your craft with intelligent tools</p>
          <div className="mt-3">
            {renderSecurityStatus()}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-8 space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg flex-shrink-0">
              <Shield className="text-white" size={32} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">AI Security Guard</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-3">
                Our AI-powered security system monitors all content in real-time to ensure a safe and respectful community.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-800/50 border border-slate-300 dark:border-slate-700">
                {renderSecurityStatus()}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">AI-Powered Tools</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">Choose a tool to enhance your poetry writing experience</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {aiTools.map((tool, index) => (
              <div
                key={index}
                className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] shadow-lg"
              >
                <div className={`h-2 bg-gradient-to-r ${tool.color}`}></div>
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`p-3 rounded-2xl bg-gradient-to-br ${tool.color} shadow-lg flex-shrink-0`}>
                      <tool.icon className="text-white" size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{tool.title}</h3>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                    <span className="px-4 py-1.5 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-300 font-semibold text-sm border border-green-200 dark:border-green-800">
                      {tool.status}
                    </span>
                    <button
                      onClick={() => setActiveTool(tool.type)}
                      className={`px-5 py-2.5 bg-gradient-to-r ${tool.color} text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}
                    >
                      Try Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {activeTool && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={closeModal}>
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {activeTool === 'assistant' && 'AI Poetry Assistant'}
                {activeTool === 'analysis' && 'Style Analysis'}
                {activeTool === 'generate' && 'Quick Generate'}
                {activeTool === 'validator' && 'Form Validator'}
                {activeTool === 'rhyme-meter' && 'Rhyme & Meter Analysis'}
                {activeTool === 'cowrite' && 'AI Co-Writing'}
                {activeTool === 'recommendations' && 'Poetry Recommendations'}
                {activeTool === 'translate' && 'Translation & Adaptation'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors">
                <X size={24} className="text-slate-600 dark:text-slate-400" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] bg-slate-50 dark:bg-slate-900">
              {activeTool === 'assistant' && (
                <div className="space-y-4">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Paste your poem here..."
                    className="w-full h-48 p-4 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                  />
                  <button
                    onClick={handleAIAssistant}
                    disabled={loading || !inputText.trim()}
                    className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                    {loading ? 'Analyzing...' : 'Get Suggestions'}
                  </button>
                  {result && (
                    <div className="mt-4 p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg">
                      <h3 className="font-bold text-slate-900 dark:text-white mb-3 text-lg">Suggestions:</h3>
                      <div className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{result}</div>
                    </div>
                  )}
                </div>
              )}

              {activeTool === 'analysis' && (
                <div className="space-y-4">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Paste your poem here for style analysis..."
                    className="w-full h-48 p-4 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all font-medium"
                  />
                  <button
                    onClick={handleStyleAnalysis}
                    disabled={loading || !inputText.trim()}
                    className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 size={20} className="animate-spin" /> : <Brain size={20} />}
                    {loading ? 'Analyzing...' : 'Analyze Style'}
                  </button>
                  {result && (
                    <div className="mt-4 p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg">
                      <h3 className="font-bold text-slate-900 dark:text-white mb-3 text-lg">Style Analysis:</h3>
                      <div className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{result}</div>
                    </div>
                  )}
                </div>
              )}

              {activeTool === 'generate' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Theme</label>
                    <input
                      type="text"
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                      placeholder="e.g., nature, love, time..."
                      className="w-full p-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Emotion</label>
                    <input
                      type="text"
                      value={emotion}
                      onChange={(e) => setEmotion(e.target.value)}
                      placeholder="e.g., joy, melancholy, hope..."
                      className="w-full p-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all font-medium"
                    />
                  </div>
                  <button
                    onClick={handleQuickGenerate}
                    disabled={loading || (!theme.trim() && !emotion.trim())}
                    className="w-full py-3.5 bg-gradient-to-r from-cyan-400 to-sky-500 hover:from-cyan-500 hover:to-sky-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 size={20} className="animate-spin" /> : <Zap size={20} />}
                    {loading ? 'Generating...' : 'Generate Ideas'}
                  </button>
                  {result && (
                    <div className="mt-4 p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg">
                      <h3 className="font-bold text-slate-900 dark:text-white mb-3 text-lg">Poem Ideas:</h3>
                      <div className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{result}</div>
                    </div>
                  )}
                </div>
              )}

              {activeTool === 'validator' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Poetic Form</label>
                    <select
                      value={selectedForm}
                      onChange={(e) => setSelectedForm(e.target.value)}
                      className="w-full p-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-medium"
                    >
                      <option value="sonnet">Sonnet</option>
                      <option value="haiku">Haiku</option>
                      <option value="villanelle">Villanelle</option>
                      <option value="limerick">Limerick</option>
                      <option value="ballad">Ballad</option>
                      <option value="tanka">Tanka</option>
                      <option value="sestina">Sestina</option>
                    </select>
                  </div>
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Paste your poem here to validate..."
                    className="w-full h-48 p-4 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-medium"
                  />
                  <button
                    onClick={handleFormValidator}
                    disabled={loading || !inputText.trim()}
                    className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 size={20} className="animate-spin" /> : <Target size={20} />}
                    {loading ? 'Validating...' : 'Validate Form'}
                  </button>
                  {result && (
                    <div className="mt-4 p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg">
                      <h3 className="font-bold text-slate-900 dark:text-white mb-3 text-lg">Validation Results:</h3>
                      <div className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{result}</div>
                    </div>
                  )}
                </div>
              )}

              {activeTool === 'rhyme-meter' && (
                <div className="space-y-4">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Paste your poem here for rhyme and meter analysis..."
                    className="w-full h-48 p-4 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all font-medium"
                  />
                  <button
                    onClick={handleRhymeMeter}
                    disabled={loading || !inputText.trim()}
                    className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 size={20} className="animate-spin" /> : <Music size={20} />}
                    {loading ? 'Analyzing...' : 'Analyze Rhyme & Meter'}
                  </button>
                  {result && (
                    <div className="mt-4 p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg">
                      <h3 className="font-bold text-slate-900 dark:text-white mb-3 text-lg">Analysis Results:</h3>
                      <div className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{result}</div>
                    </div>
                  )}
                </div>
              )}

              {activeTool === 'cowrite' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Your Starting Lines or Context</label>
                    <textarea
                      value={cowriteContext}
                      onChange={(e) => setCowriteContext(e.target.value)}
                      placeholder="Enter the beginning of your poem or describe what you want to write about..."
                      className="w-full h-48 p-4 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all font-medium"
                    />
                  </div>
                  <button
                    onClick={handleCowrite}
                    disabled={loading || !cowriteContext.trim()}
                    className="w-full py-3.5 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 size={20} className="animate-spin" /> : <Users size={20} />}
                    {loading ? 'Generating...' : 'Get Continuations'}
                  </button>
                  {result && (
                    <div className="mt-4 p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg">
                      <h3 className="font-bold text-slate-900 dark:text-white mb-3 text-lg">AI Suggestions:</h3>
                      <div className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{result}</div>
                    </div>
                  )}
                </div>
              )}

              {activeTool === 'recommendations' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Your Poetry Preferences</label>
                    <textarea
                      value={userPreferences}
                      onChange={(e) => setUserPreferences(e.target.value)}
                      placeholder="Describe your favorite poets, styles, themes, or what you enjoy reading and writing..."
                      className="w-full h-48 p-4 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-medium"
                    />
                  </div>
                  <button
                    onClick={handleRecommendations}
                    disabled={loading || !userPreferences.trim()}
                    className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 size={20} className="animate-spin" /> : <Lightbulb size={20} />}
                    {loading ? 'Generating...' : 'Get Recommendations'}
                  </button>
                  {result && (
                    <div className="mt-4 p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg">
                      <h3 className="font-bold text-slate-900 dark:text-white mb-3 text-lg">Personalized Recommendations:</h3>
                      <div className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{result}</div>
                    </div>
                  )}
                </div>
              )}

              {activeTool === 'translate' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Target Language</label>
                    <select
                      value={targetLanguage}
                      onChange={(e) => setTargetLanguage(e.target.value)}
                      className="w-full p-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all font-medium"
                    >
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                      <option value="Italian">Italian</option>
                      <option value="Portuguese">Portuguese</option>
                      <option value="Japanese">Japanese</option>
                      <option value="Chinese">Chinese</option>
                      <option value="Arabic">Arabic</option>
                      <option value="Russian">Russian</option>
                      <option value="Hindi">Hindi</option>
                    </select>
                  </div>
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Paste your poem here to translate..."
                    className="w-full h-48 p-4 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all font-medium"
                  />
                  <button
                    onClick={handleTranslate}
                    disabled={loading || !inputText.trim()}
                    className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 size={20} className="animate-spin" /> : <Languages size={20} />}
                    {loading ? 'Translating...' : 'Translate Poem'}
                  </button>
                  {result && (
                    <div className="mt-4 p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg">
                      <h3 className="font-bold text-slate-900 dark:text-white mb-3 text-lg">Translation:</h3>
                      <div className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{result}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
