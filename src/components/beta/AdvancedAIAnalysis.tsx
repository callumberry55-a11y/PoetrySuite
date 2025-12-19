import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Sparkles, Brain, TrendingUp, Heart, FileText, AlertCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import BetaGuard from './BetaGuard';

interface Poem {
  id: string;
  title: string;
  content: string;
}

interface AnalysisResult {
  structure: string;
  themes: string[];
  emotion: string;
  suggestions: string[];
  readingLevel: string;
  literaryDevices: string[];
}

export default function AdvancedAIAnalysis() {
  const { user } = useAuth();
  const [poems, setPoems] = useState<Poem[]>([]);
  const [selectedPoem, setSelectedPoem] = useState<string>('');
  const [customText, setCustomText] = useState('');
  const [useCustomText, setUseCustomText] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPoems();
  }, [user]);

  const loadPoems = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('poems')
        .select('id, title, content')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setPoems(data || []);
    } catch (error) {
      console.error('Error loading poems:', error);
    }
  };

  const analyzePoem = async () => {
    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);

    try {
      const textToAnalyze = useCustomText ? customText : poems.find(p => p.id === selectedPoem)?.content;

      if (!textToAnalyze || textToAnalyze.trim().length === 0) {
        setError('Please select a poem or enter text to analyze');
        setIsAnalyzing(false);
        return;
      }

      const mockAnalysis: AnalysisResult = {
        structure: analyzeStructure(textToAnalyze),
        themes: extractThemes(textToAnalyze),
        emotion: analyzeEmotion(textToAnalyze),
        suggestions: generateSuggestions(textToAnalyze),
        readingLevel: determineReadingLevel(textToAnalyze),
        literaryDevices: identifyLiteraryDevices(textToAnalyze)
      };

      await new Promise(resolve => setTimeout(resolve, 1500));
      setAnalysis(mockAnalysis);
    } catch (error) {
      console.error('Error analyzing poem:', error);
      setError('Failed to analyze poem. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeStructure = (text: string): string => {
    const lines = text.split('\n').filter(l => l.trim());
    const words = text.split(/\s+/).filter(w => w.trim());
    const stanzas = text.split('\n\n').filter(s => s.trim());

    return `${lines.length} lines, ${stanzas.length} stanza${stanzas.length !== 1 ? 's' : ''}, ${words.length} words. ${
      lines.length > 14 ? 'Free verse or extended form.' :
      lines.length === 14 ? 'Sonnet structure detected.' :
      'Short form poem.'
    }`;
  };

  const extractThemes = (text: string): string[] => {
    const lowerText = text.toLowerCase();
    const themes: string[] = [];

    if (lowerText.match(/love|heart|kiss|embrace|passion/)) themes.push('Love & Romance');
    if (lowerText.match(/death|dying|grave|eternal|fade|loss/)) themes.push('Mortality & Loss');
    if (lowerText.match(/nature|tree|sky|ocean|mountain|flower/)) themes.push('Nature');
    if (lowerText.match(/time|moment|memory|past|future|yesterday/)) themes.push('Time & Memory');
    if (lowerText.match(/war|battle|fight|struggle|conflict/)) themes.push('Conflict');
    if (lowerText.match(/joy|happiness|smile|laughter|delight/)) themes.push('Joy & Celebration');
    if (lowerText.match(/dark|night|shadow|fear|alone|empty/)) themes.push('Darkness & Solitude');
    if (lowerText.match(/hope|light|dawn|dream|wish/)) themes.push('Hope & Aspiration');

    return themes.length > 0 ? themes : ['Universal themes'];
  };

  const analyzeEmotion = (text: string): string => {
    const lowerText = text.toLowerCase();

    if (lowerText.match(/sad|grief|sorrow|tears|cry|pain/)) return 'Melancholic';
    if (lowerText.match(/joy|happy|delight|smile|laughter/)) return 'Joyful';
    if (lowerText.match(/anger|rage|fury|hate|bitter/)) return 'Angry';
    if (lowerText.match(/love|adore|cherish|treasure/)) return 'Loving';
    if (lowerText.match(/fear|afraid|terror|dread/)) return 'Fearful';
    if (lowerText.match(/peace|calm|serene|quiet|still/)) return 'Peaceful';
    if (lowerText.match(/hope|dream|wish|aspire/)) return 'Hopeful';

    return 'Contemplative';
  };

  const generateSuggestions = (text: string): string[] => {
    const suggestions: string[] = [];
    const lines = text.split('\n');

    if (text.length < 100) {
      suggestions.push('Consider expanding the poem to develop your ideas more fully');
    }

    if (lines.every(line => line.length > 50)) {
      suggestions.push('Vary your line lengths for better rhythm and visual impact');
    }

    if (!text.match(/[.!?]/)) {
      suggestions.push('Consider adding punctuation to guide the reader\'s pace');
    }

    if (text.split(/\s+/).length > 200) {
      suggestions.push('Consider breaking into multiple stanzas for easier reading');
    }

    const words = text.toLowerCase().split(/\s+/);
    const wordCounts = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const repeated = Object.entries(wordCounts).filter(([word, count]) =>
      count > 3 && word.length > 3 && !['that', 'this', 'with', 'from', 'have'].includes(word)
    );

    if (repeated.length > 0) {
      suggestions.push(`Consider varying word choice - "${repeated[0][0]}" appears frequently`);
    }

    if (suggestions.length === 0) {
      suggestions.push('Strong poetic foundation - continue refining imagery and word choice');
    }

    return suggestions;
  };

  const determineReadingLevel = (text: string): string => {
    const words = text.split(/\s+/);
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length;
    const avgSentenceLength = words.length / (sentences || 1);

    if (avgWordLength < 4 && avgSentenceLength < 10) return 'Accessible (Simple language)';
    if (avgWordLength < 5 && avgSentenceLength < 15) return 'Intermediate (Balanced complexity)';
    return 'Advanced (Complex language and structure)';
  };

  const identifyLiteraryDevices = (text: string): string[] => {
    const devices: string[] = [];
    const lines = text.split('\n').filter(l => l.trim());

    if (text.match(/like|as.*as/i)) devices.push('Simile');
    if (text.match(/\b(\w+).*\b\1\b/i)) devices.push('Repetition');

    const words = text.toLowerCase().split(/\W+/);
    const firstLetters = words.map(w => w[0]);
    if (firstLetters.slice(0, 3).every(l => l === firstLetters[0])) {
      devices.push('Alliteration');
    }

    const lineEndings = lines.map(line => {
      const words = line.trim().split(/\s+/);
      return words[words.length - 1]?.toLowerCase().replace(/[^a-z]/g, '').slice(-2);
    });

    if (lineEndings.length >= 4) {
      const rhymePattern = lineEndings.filter((ending, i) =>
        lineEndings.slice(i + 1).includes(ending)
      );
      if (rhymePattern.length > 0) devices.push('Rhyme');
    }

    if (text.match(/[^\w\s]{2,}/)) devices.push('Imagery');

    if (devices.length === 0) devices.push('Free verse style');

    return devices;
  };

  return (
    <BetaGuard>
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => window.location.hash = ''}
          className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline mb-4"
        >
          <ArrowLeft size={16} />
          Back to Beta Features
        </button>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-sky-500 flex items-center justify-center">
            <Brain className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Advanced AI Analysis</h2>
            <p className="text-slate-600 dark:text-slate-400">Deep insights into your poetry</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Select Poem</h3>

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setUseCustomText(false)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                !useCustomText
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              My Poems
            </button>
            <button
              onClick={() => setUseCustomText(true)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                useCustomText
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              Custom Text
            </button>
          </div>

          {!useCustomText ? (
            <div className="space-y-4">
              <select
                value={selectedPoem}
                onChange={(e) => setSelectedPoem(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-white"
              >
                <option value="">Choose a poem...</option>
                {poems.map((poem) => (
                  <option key={poem.id} value={poem.id}>
                    {poem.title}
                  </option>
                ))}
              </select>

              {selectedPoem && (
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 max-h-64 overflow-y-auto">
                  <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                    {poems.find(p => p.id === selectedPoem)?.content}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Paste or type your poem here..."
              rows={12}
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 resize-none"
            />
          )}

          {error && (
            <div className="mt-4 flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={16} />
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <button
            onClick={analyzePoem}
            disabled={isAnalyzing || (!useCustomText && !selectedPoem) || (useCustomText && !customText.trim())}
            className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 disabled:dark:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            <Sparkles size={18} />
            {isAnalyzing ? 'Analyzing...' : 'Analyze Poem'}
          </button>
        </div>

        <div className="glass rounded-xl p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Analysis Results</h3>

          {!analysis && !isAnalyzing && (
            <div className="flex items-center justify-center h-64 text-slate-500 dark:text-slate-400">
              <div className="text-center">
                <Brain size={48} className="mx-auto mb-3 opacity-30" />
                <p>Select a poem and click Analyze to see insights</p>
              </div>
            </div>
          )}

          {isAnalyzing && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-slate-600 dark:text-slate-400">Analyzing your poem...</p>
              </div>
            </div>
          )}

          {analysis && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="text-blue-600 dark:text-blue-400" size={18} />
                  <h4 className="font-semibold text-slate-900 dark:text-white">Structure</h4>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300">{analysis.structure}</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="text-blue-600 dark:text-blue-400" size={18} />
                  <h4 className="font-semibold text-slate-900 dark:text-white">Emotional Tone</h4>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300">{analysis.emotion}</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="text-blue-600 dark:text-blue-400" size={18} />
                  <h4 className="font-semibold text-slate-900 dark:text-white">Themes</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysis.themes.map((theme, i) => (
                    <span key={i} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-sm">
                      {theme}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="text-blue-600 dark:text-blue-400" size={18} />
                  <h4 className="font-semibold text-slate-900 dark:text-white">Literary Devices</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysis.literaryDevices.map((device, i) => (
                    <span key={i} className="px-2 py-1 bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 rounded text-sm">
                      {device}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="text-blue-600 dark:text-blue-400" size={18} />
                  <h4 className="font-semibold text-slate-900 dark:text-white">Reading Level</h4>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300">{analysis.readingLevel}</p>
              </div>

              <div className="p-4 bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="text-blue-600 dark:text-blue-400" size={18} />
                  <h4 className="font-semibold text-slate-900 dark:text-white">Suggestions</h4>
                </div>
                <ul className="space-y-2">
                  {analysis.suggestions.map((suggestion, i) => (
                    <li key={i} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </BetaGuard>
  );
}
