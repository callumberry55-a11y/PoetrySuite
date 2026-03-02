import { useState } from 'react';
import {
  Calculator,
  Repeat,
  Music,
  Sparkles,
  BookOpen,
  Clock,
  List,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Zap
} from 'lucide-react';
import {
  countSyllablesInLine,
  detectRhymeScheme,
  findRhymingWords,
  detectAlliteration,
  detectAssonance,
  analyzeMeter,
  detectRepetition,
  getReadingTime,
  detectPoeticDevices
} from '../utils/poetry-analysis';

interface PoetryToolsProps {
  content: string;
}

type ToolType = 'syllables' | 'rhyme' | 'devices' | 'meter' | 'analysis' | 'reading';

export default function PoetryTools({ content }: PoetryToolsProps) {
  const [activeTool, setActiveTool] = useState<ToolType>('analysis');
  const [rhymeWord, setRhymeWord] = useState('');
  const [rhymeSuggestions, setRhymeSuggestions] = useState<string[]>([]);

  const lines = content.split('\n').filter(l => l.trim());

  const handleFindRhymes = () => {
    if (rhymeWord.trim()) {
      const rhymes = findRhymingWords(rhymeWord.trim());
      setRhymeSuggestions(rhymes);
    }
  };

  const tools = [
    { id: 'analysis' as ToolType, label: 'Quick Analysis', icon: Zap },
    { id: 'syllables' as ToolType, label: 'Syllable Counter', icon: Calculator },
    { id: 'rhyme' as ToolType, label: 'Rhyme Finder', icon: Music },
    { id: 'devices' as ToolType, label: 'Literary Devices', icon: Sparkles },
    { id: 'meter' as ToolType, label: 'Meter Analysis', icon: TrendingUp },
    { id: 'reading' as ToolType, label: 'Reading Time', icon: Clock },
  ];

  const renderQuickAnalysis = () => {
    if (!content.trim()) {
      return (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <AlertCircle className="mx-auto mb-4 text-slate-400" size={48} />
            <p className="text-slate-600 dark:text-slate-400">Write some poetry to analyze it</p>
          </div>
        </div>
      );
    }

    const rhymeScheme = detectRhymeScheme(lines);
    const { devices } = detectPoeticDevices(content);
    const { minutes, seconds, wordCount } = getReadingTime(content);
    const { repeatedWords } = detectRepetition(lines);
    const totalSyllables = lines.reduce((sum, line) => sum + countSyllablesInLine(line), 0);

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <List className="text-blue-600 dark:text-blue-400" size={20} />
              <span className="text-sm font-semibold text-blue-900 dark:text-blue-300">Lines</span>
            </div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{lines.length}</div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="text-purple-600 dark:text-purple-400" size={20} />
              <span className="text-sm font-semibold text-purple-900 dark:text-purple-300">Words</span>
            </div>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{wordCount}</div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="text-amber-600 dark:text-amber-400" size={20} />
              <span className="text-sm font-semibold text-amber-900 dark:text-amber-300">Syllables</span>
            </div>
            <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">{totalSyllables}</div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="text-emerald-600 dark:text-emerald-400" size={20} />
              <span className="text-sm font-semibold text-emerald-900 dark:text-emerald-300">Read Time</span>
            </div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`}
            </div>
          </div>

          <div className="bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-900/20 dark:to-red-900/20 border border-rose-200 dark:border-rose-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Music className="text-rose-600 dark:text-rose-400" size={20} />
              <span className="text-sm font-semibold text-rose-900 dark:text-rose-300">Rhyme</span>
            </div>
            <div className="text-xl font-bold text-rose-600 dark:text-rose-400">
              {rhymeScheme || 'None'}
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="text-indigo-600 dark:text-indigo-400" size={20} />
              <span className="text-sm font-semibold text-indigo-900 dark:text-indigo-300">Devices</span>
            </div>
            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{devices.length}</div>
          </div>
        </div>

        {devices.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Sparkles size={20} className="text-indigo-500" />
              Literary Devices Detected
            </h3>
            <div className="space-y-3">
              {devices.map((device, index) => (
                <div key={index} className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="text-emerald-500 flex-shrink-0 mt-0.5" size={18} />
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900 dark:text-white mb-1">{device.name}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">{device.description}</div>
                      {device.examples.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {device.examples.map((example, i) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md"
                            >
                              {example}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {repeatedWords.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Repeat size={20} className="text-blue-500" />
              Repeated Words
            </h3>
            <div className="flex flex-wrap gap-2">
              {repeatedWords.map((word, index) => (
                <span
                  key={index}
                  className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 rounded-lg font-medium"
                >
                  {word.word} <span className="text-blue-500">×{word.count}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSyllableCounter = () => {
    if (!content.trim()) {
      return (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <Calculator className="mx-auto mb-4 text-slate-400" size={48} />
            <p className="text-slate-600 dark:text-slate-400">Write some poetry to count syllables</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {lines.map((line, index) => {
          const syllables = countSyllablesInLine(line);
          return (
            <div
              key={index}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Line {index + 1}</span>
                  <p className="text-slate-900 dark:text-white mt-1">{line}</p>
                </div>
                <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{syllables}</div>
                    <div className="text-xs text-white/80">syl.</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">Total Syllables</span>
            <span className="text-4xl font-bold">
              {lines.reduce((sum, line) => sum + countSyllablesInLine(line), 0)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderRhymeFinder = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <label className="block text-sm font-bold text-slate-900 dark:text-white mb-3">
            Enter a word to find rhymes
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={rhymeWord}
              onChange={(e) => setRhymeWord(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleFindRhymes()}
              placeholder="e.g., love, dream, night..."
              className="flex-1 px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <button
              onClick={handleFindRhymes}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl font-bold transition-all"
            >
              Find Rhymes
            </button>
          </div>
        </div>

        {rhymeSuggestions.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Music size={20} className="text-blue-500" />
              Rhyming Words for "{rhymeWord}"
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {rhymeSuggestions.map((word, index) => (
                <button
                  key={index}
                  onClick={() => setRhymeWord(word)}
                  className="px-4 py-3 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 hover:from-blue-100 hover:to-cyan-100 dark:hover:from-blue-900/40 dark:hover:to-cyan-900/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 rounded-lg font-medium transition-all"
                >
                  {word}
                </button>
              ))}
            </div>
          </div>
        )}

        {lines.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Music size={20} className="text-rose-500" />
              Your Poem's Rhyme Scheme
            </h3>
            <div className="bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-900/20 dark:to-red-900/20 border border-rose-200 dark:border-rose-800 rounded-xl p-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-rose-600 dark:text-rose-400 mb-2">
                  {detectRhymeScheme(lines) || 'No pattern'}
                </div>
                <p className="text-sm text-rose-700 dark:text-rose-300">
                  {detectRhymeScheme(lines) ? 'Rhyme scheme detected' : 'Free verse or no rhyme'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderLiteraryDevices = () => {
    if (!content.trim()) {
      return (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <Sparkles className="mx-auto mb-4 text-slate-400" size={48} />
            <p className="text-slate-600 dark:text-slate-400">Write some poetry to detect literary devices</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {lines.map((line, index) => {
          const alliteration = detectAlliteration(line);
          const assonance = detectAssonance(line);

          return (
            <div
              key={index}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5"
            >
              <div className="mb-3">
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Line {index + 1}</span>
                <p className="text-slate-900 dark:text-white mt-1 text-lg">{line}</p>
              </div>

              <div className="space-y-2">
                {alliteration.hasAlliteration && (
                  <div className="flex items-start gap-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                    <Sparkles className="text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" size={16} />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-purple-900 dark:text-purple-300">
                        Alliteration ({alliteration.strength})
                      </div>
                      <div className="text-xs text-purple-700 dark:text-purple-400 mt-0.5">
                        {alliteration.patterns.join(', ')}
                      </div>
                    </div>
                  </div>
                )}

                {assonance.hasAssonance && (
                  <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                    <Music className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" size={16} />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-amber-900 dark:text-amber-300">Assonance</div>
                      <div className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                        {assonance.vowelPatterns.join(', ')}
                      </div>
                    </div>
                  </div>
                )}

                {!alliteration.hasAlliteration && !assonance.hasAssonance && (
                  <div className="text-sm text-slate-500 dark:text-slate-400 italic">
                    No obvious literary devices detected
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderMeterAnalysis = () => {
    if (!content.trim()) {
      return (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <TrendingUp className="mx-auto mb-4 text-slate-400" size={48} />
            <p className="text-slate-600 dark:text-slate-400">Write some poetry to analyze meter</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {lines.map((line, index) => {
          const meter = analyzeMeter(line);
          return (
            <div
              key={index}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5"
            >
              <div className="mb-3">
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Line {index + 1}</span>
                <p className="text-slate-900 dark:text-white mt-1 text-lg">{line}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <div className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">Syllables</div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{meter.syllableCount}</div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                  <div className="text-xs font-semibold text-purple-700 dark:text-purple-400 mb-1">Pattern</div>
                  <div className="text-sm font-mono text-purple-600 dark:text-purple-400">{meter.pattern || 'N/A'}</div>
                </div>

                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
                  <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">Meter Type</div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400">{meter.possibleMeter}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderReadingTime = () => {
    if (!content.trim()) {
      return (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <Clock className="mx-auto mb-4 text-slate-400" size={48} />
            <p className="text-slate-600 dark:text-slate-400">Write some poetry to calculate reading time</p>
          </div>
        </div>
      );
    }

    const { minutes, seconds, wordCount } = getReadingTime(content);

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 rounded-2xl p-8 text-white shadow-xl">
          <div className="text-center">
            <Clock size={48} className="mx-auto mb-4 opacity-90" />
            <h3 className="text-3xl font-bold mb-2">Reading Time</h3>
            <div className="text-7xl font-bold mb-4">
              {minutes > 0 ? (
                <span>
                  {minutes}<span className="text-4xl">m</span> {seconds}<span className="text-4xl">s</span>
                </span>
              ) : (
                <span>
                  {seconds}<span className="text-4xl">s</span>
                </span>
              )}
            </div>
            <p className="text-white/90 text-lg">Based on average reading speed (200 words/minute)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-3">
              <BookOpen className="text-purple-500" size={24} />
              <h4 className="font-bold text-slate-900 dark:text-white">Total Words</h4>
            </div>
            <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">{wordCount}</div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-3">
              <List className="text-blue-500" size={24} />
              <h4 className="font-bold text-slate-900 dark:text-white">Total Lines</h4>
            </div>
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">{lines.length}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900">
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Poetry Analysis Tools</h2>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                <Icon size={18} />
                <span>{tool.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {activeTool === 'analysis' && renderQuickAnalysis()}
        {activeTool === 'syllables' && renderSyllableCounter()}
        {activeTool === 'rhyme' && renderRhymeFinder()}
        {activeTool === 'devices' && renderLiteraryDevices()}
        {activeTool === 'meter' && renderMeterAnalysis()}
        {activeTool === 'reading' && renderReadingTime()}
      </div>
    </div>
  );
}
