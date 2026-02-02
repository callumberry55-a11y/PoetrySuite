import { useState, useEffect } from 'react';
import { Shield, Sparkles, Brain, Zap, Target, X, Loader2 } from 'lucide-react';
import { runSecurityChecks } from '../utils/security';
import { GoogleGenerativeAI } from '@google/generative-ai';

type ToolType = 'assistant' | 'analysis' | 'generate' | 'validator' | null;

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

  useEffect(() => {
    const performCheck = async () => {
      setSecurityStatus('checking');
      const result = await runSecurityChecks('some-user-input');
      setSecurityStatus(result ? 'active' : 'inactive');
    };

    performCheck();
    const interval = setInterval(performCheck, 5000);

    return () => clearInterval(interval);
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
      setResult('Error validating form. Please try again.');
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
      color: 'from-blue-500 to-cyan-500',
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
      color: 'from-yellow-500 to-orange-500',
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
    }
  ];

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-background to-secondary-container/20">
      <div className="p-4 sm:p-6 border-b border-outline">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-on-background">AI Hub</h1>
          {renderSecurityStatus()}
        </div>
        <p className="text-on-surface-variant text-sm sm:text-base">
          Enhance your poetry with AI-powered tools and insights
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 sm:mb-8">
            <div className="bg-gradient-to-r from-primary/10 to-tertiary/10 rounded-2xl p-4 sm:p-6 border border-outline">
              <div className="flex items-start gap-3 sm:gap-4">
                <Shield className="text-primary flex-shrink-0" size={32} />
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-on-surface mb-2">AI Security Guard</h2>
                  <p className="text-sm sm:text-base text-on-surface-variant mb-3">
                    Our AI-powered security system monitors all content in real-time to ensure a safe and respectful community.
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-surface border border-outline">
                    {renderSecurityStatus()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-on-surface mb-4 sm:mb-6">AI-Powered Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pb-20">
            {aiTools.map((tool, index) => (
              <div
                key={index}
                className="bg-surface rounded-xl shadow-sm border border-outline overflow-hidden hover:shadow-lg transition-all group"
              >
                <div className={`h-2 bg-gradient-to-r ${tool.color}`}></div>
                <div className="p-4 sm:p-6">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className={`p-2 sm:p-3 rounded-lg bg-gradient-to-br ${tool.color} bg-opacity-10`}>
                      <tool.icon className="text-on-surface" size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl font-bold text-on-surface mb-2">{tool.title}</h3>
                      <p className="text-sm sm:text-base text-on-surface-variant mb-4">
                        {tool.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm px-3 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 font-medium">
                          {tool.status}
                        </span>
                        <button
                          onClick={() => setActiveTool(tool.type)}
                          className="px-3 sm:px-4 py-2 bg-primary text-on-primary rounded-lg font-medium transition-all group-hover:shadow-md text-sm sm:text-base hover:bg-primary/90"
                        >
                          Try Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-surface rounded-xl shadow-sm border border-outline p-4 sm:p-6 mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-on-surface mb-3">Coming Soon</h3>
            <ul className="space-y-2 text-sm sm:text-base text-on-surface-variant">
              <li className="flex items-center gap-2">
                <Sparkles size={16} className="text-primary" />
                <span>Advanced rhyme and meter analysis</span>
              </li>
              <li className="flex items-center gap-2">
                <Sparkles size={16} className="text-primary" />
                <span>Collaborative AI co-writing sessions</span>
              </li>
              <li className="flex items-center gap-2">
                <Sparkles size={16} className="text-primary" />
                <span>Personalized poetry recommendations</span>
              </li>
              <li className="flex items-center gap-2">
                <Sparkles size={16} className="text-primary" />
                <span>Multi-language translation and adaptation</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {activeTool && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-outline">
              <h2 className="text-2xl font-bold text-on-surface">
                {activeTool === 'assistant' && 'AI Poetry Assistant'}
                {activeTool === 'analysis' && 'Style Analysis'}
                {activeTool === 'generate' && 'Quick Generate'}
                {activeTool === 'validator' && 'Form Validator'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-on-surface/10 rounded-full transition-colors">
                <X size={24} className="text-on-surface-variant" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {activeTool === 'assistant' && (
                <div className="space-y-4">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Paste your poem here..."
                    className="w-full h-48 p-4 rounded-lg border border-outline bg-background text-on-surface resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    onClick={handleAIAssistant}
                    disabled={loading || !inputText.trim()}
                    className="w-full py-3 bg-primary text-on-primary rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                    {loading ? 'Analyzing...' : 'Get Suggestions'}
                  </button>
                  {result && (
                    <div className="mt-4 p-4 bg-secondary-container/30 rounded-lg border border-outline">
                      <h3 className="font-bold text-on-surface mb-2">Suggestions:</h3>
                      <div className="text-on-surface-variant whitespace-pre-wrap">{result}</div>
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
                    className="w-full h-48 p-4 rounded-lg border border-outline bg-background text-on-surface resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    onClick={handleStyleAnalysis}
                    disabled={loading || !inputText.trim()}
                    className="w-full py-3 bg-primary text-on-primary rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 size={20} className="animate-spin" /> : <Brain size={20} />}
                    {loading ? 'Analyzing...' : 'Analyze Style'}
                  </button>
                  {result && (
                    <div className="mt-4 p-4 bg-secondary-container/30 rounded-lg border border-outline">
                      <h3 className="font-bold text-on-surface mb-2">Style Analysis:</h3>
                      <div className="text-on-surface-variant whitespace-pre-wrap">{result}</div>
                    </div>
                  )}
                </div>
              )}

              {activeTool === 'generate' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-on-surface mb-2">Theme</label>
                    <input
                      type="text"
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                      placeholder="e.g., nature, love, time..."
                      className="w-full p-3 rounded-lg border border-outline bg-background text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-on-surface mb-2">Emotion</label>
                    <input
                      type="text"
                      value={emotion}
                      onChange={(e) => setEmotion(e.target.value)}
                      placeholder="e.g., joy, melancholy, hope..."
                      className="w-full p-3 rounded-lg border border-outline bg-background text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <button
                    onClick={handleQuickGenerate}
                    disabled={loading || (!theme.trim() && !emotion.trim())}
                    className="w-full py-3 bg-primary text-on-primary rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 size={20} className="animate-spin" /> : <Zap size={20} />}
                    {loading ? 'Generating...' : 'Generate Ideas'}
                  </button>
                  {result && (
                    <div className="mt-4 p-4 bg-secondary-container/30 rounded-lg border border-outline">
                      <h3 className="font-bold text-on-surface mb-2">Poem Ideas:</h3>
                      <div className="text-on-surface-variant whitespace-pre-wrap">{result}</div>
                    </div>
                  )}
                </div>
              )}

              {activeTool === 'validator' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-on-surface mb-2">Poetic Form</label>
                    <select
                      value={selectedForm}
                      onChange={(e) => setSelectedForm(e.target.value)}
                      className="w-full p-3 rounded-lg border border-outline bg-background text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
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
                    className="w-full h-48 p-4 rounded-lg border border-outline bg-background text-on-surface resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    onClick={handleFormValidator}
                    disabled={loading || !inputText.trim()}
                    className="w-full py-3 bg-primary text-on-primary rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 size={20} className="animate-spin" /> : <Target size={20} />}
                    {loading ? 'Validating...' : 'Validate Form'}
                  </button>
                  {result && (
                    <div className="mt-4 p-4 bg-secondary-container/30 rounded-lg border border-outline">
                      <h3 className="font-bold text-on-surface mb-2">Validation Results:</h3>
                      <div className="text-on-surface-variant whitespace-pre-wrap">{result}</div>
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
