import { useState } from 'react';
import { Clock, BarChart3, Target } from 'lucide-react';

export default function ReadingTimeEstimator() {
  const [poemText, setPoemText] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);

  const analyzePoem = (text: string) => {
    if (!text.trim()) {
      setAnalysis(null);
      return;
    }

    const words = text.trim().split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length;
    const syllables = estimateSyllables(text);
    const lines = text.split('\n').filter(l => l.trim()).length;

    const averageWPM = 130;
    const readingTimeMinutes = words / averageWPM;
    const readingTimeSeconds = Math.round(readingTimeMinutes * 60);

    const averageWordsPerSentence = sentences > 0 ? (words / sentences).toFixed(1) : 0;
    const fleschScore = calculateFleschScore(words, sentences, syllables);
    const readingLevel = getReadingLevel(fleschScore);

    setAnalysis({
      words,
      sentences,
      lines,
      syllables,
      readingTimeMinutes: Math.floor(readingTimeSeconds / 60),
      readingTimeSeconds: readingTimeSeconds % 60,
      averageWordsPerSentence,
      fleschScore,
      readingLevel
    });
  };

  const estimateSyllables = (text: string): number => {
    const words = text.toLowerCase().split(/\s+/);
    let total = 0;

    for (const word of words) {
      const cleaned = word.replace(/[^a-z]/g, '');
      if (!cleaned) continue;

      let count = 0;
      let previous = false;

      for (let i = 0; i < cleaned.length; i++) {
        const isVowel = 'aeiouy'.includes(cleaned[i]);
        if (isVowel && !previous) {
          count++;
        }
        previous = isVowel;
      }

      if (cleaned.endsWith('e')) count--;
      if (count === 0) count = 1;

      total += count;
    }

    return total;
  };

  const calculateFleschScore = (words: number, sentences: number, syllables: number): number => {
    if (sentences === 0 || words === 0) return 0;
    return Math.round(206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words));
  };

  const getReadingLevel = (score: number): string => {
    if (score >= 90) return 'Very Easy (5th grade)';
    if (score >= 80) return 'Easy (6th grade)';
    if (score >= 70) return 'Fairly Easy (7th grade)';
    if (score >= 60) return 'Standard (8th-9th grade)';
    if (score >= 50) return 'Fairly Difficult (10th-12th grade)';
    if (score >= 30) return 'Difficult (College)';
    return 'Very Difficult (College graduate)';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Clock className="text-blue-600 dark:text-blue-400" size={32} />
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Reading Time Estimator</h2>
        </div>
        <p className="text-slate-600 dark:text-slate-400">
          Analyze your poem's reading time, readability metrics, and complexity.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Your Poem
          </h3>
          <textarea
            value={poemText}
            onChange={(e) => {
              setPoemText(e.target.value);
              analyzePoem(e.target.value);
            }}
            placeholder="Paste your poem here to analyze..."
            rows={16}
            className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 resize-none"
          />
        </div>

        <div className="space-y-6">
          {analysis ? (
            <>
              <div className="glass rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="text-blue-600 dark:text-blue-400" size={24} />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Reading Time
                  </h3>
                </div>
                <div className="text-center py-4">
                  <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                    {analysis.readingTimeMinutes > 0 && `${analysis.readingTimeMinutes}m `}
                    {analysis.readingTimeSeconds}s
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                    Average reading pace (130 WPM)
                  </p>
                </div>
              </div>

              <div className="glass rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <BarChart3 className="text-blue-600 dark:text-blue-400" size={24} />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Text Statistics
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{analysis.words}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Words</div>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{analysis.lines}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Lines</div>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{analysis.sentences}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Sentences</div>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{analysis.syllables}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Syllables</div>
                  </div>
                </div>
              </div>

              <div className="glass rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="text-blue-600 dark:text-blue-400" size={24} />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Readability
                  </h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600 dark:text-slate-400">Flesch Reading Ease</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{analysis.fleschScore}</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${Math.max(0, Math.min(100, analysis.fleschScore))}%` }}
                      />
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                      Reading Level
                    </div>
                    <div className="text-blue-600 dark:text-blue-400 font-semibold">
                      {analysis.readingLevel}
                    </div>
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    <p className="mb-1">
                      <span className="font-medium">Avg. words per sentence:</span> {analysis.averageWordsPerSentence}
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="glass rounded-xl p-12 shadow-sm text-center h-full flex items-center justify-center">
              <div>
                <Clock size={64} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                <p className="text-slate-600 dark:text-slate-400">
                  Enter your poem to see analysis
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 glass rounded-xl p-6 shadow-sm bg-blue-50 dark:bg-blue-900/20">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
          Understanding Readability
        </h3>
        <ul className="space-y-2 text-slate-600 dark:text-slate-400">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400">•</span>
            <span>Higher Flesch scores (90-100) indicate easier readability</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400">•</span>
            <span>Lower scores (0-30) indicate more complex, academic writing</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400">•</span>
            <span>Consider your audience when choosing complexity level</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400">•</span>
            <span>Poetry often has lower scores due to literary devices and metaphor</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
