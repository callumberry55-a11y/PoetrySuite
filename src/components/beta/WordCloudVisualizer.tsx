import { useState } from 'react';
import { Cloud, Download, RefreshCw } from 'lucide-react';

const COLOR_SCHEMES = [
  { name: 'Ocean', colors: ['#0077be', '#00a8e8', '#00c9ff', '#7dd3fc', '#bfdbfe'] },
  { name: 'Forest', colors: ['#065f46', '#047857', '#10b981', '#6ee7b7', '#a7f3d0'] },
  { name: 'Sunset', colors: ['#dc2626', '#f59e0b', '#fbbf24', '#fcd34d', '#fde68a'] },
  { name: 'Purple', colors: ['#6b21a8', '#7c3aed', '#a78bfa', '#c4b5fd', '#ddd6fe'] },
  { name: 'Monochrome', colors: ['#1f2937', '#4b5563', '#6b7280', '#9ca3af', '#d1d5db'] }
];

export default function WordCloudVisualizer() {
  const [poemText, setPoemText] = useState('');
  const [colorScheme, setColorScheme] = useState('Ocean');
  const [wordCloud, setWordCloud] = useState<Array<{ word: string; size: number; color: string }>>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateWordCloud = async () => {
    if (!poemText.trim()) return;

    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const words = poemText
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);

    const wordCounts: { [key: string]: number } = {};
    words.forEach(word => {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    });

    const sortedWords = Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30);

    const maxCount = Math.max(...sortedWords.map(([, count]) => count));
    const scheme = COLOR_SCHEMES.find(s => s.name === colorScheme)?.colors || COLOR_SCHEMES[0].colors;

    const cloud = sortedWords.map(([word, count]) => ({
      word,
      size: 12 + (count / maxCount) * 48,
      color: scheme[Math.floor(Math.random() * scheme.length)]
    }));

    setWordCloud(cloud);
    setIsGenerating(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Cloud className="text-blue-600 dark:text-blue-400" size={32} />
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Word Cloud Visualizer</h2>
        </div>
        <p className="text-slate-600 dark:text-slate-400">
          Generate beautiful word clouds to visualize the key themes in your poems.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="glass rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Poem Text
          </h3>
          <textarea
            value={poemText}
            onChange={(e) => setPoemText(e.target.value)}
            placeholder="Paste your poem here..."
            rows={12}
            className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 resize-none"
          />

          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Color Scheme
            </label>
            <div className="grid grid-cols-2 gap-2">
              {COLOR_SCHEMES.map((scheme) => (
                <button
                  key={scheme.name}
                  onClick={() => setColorScheme(scheme.name)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    colorScheme === scheme.name
                      ? 'bg-blue-500 text-white ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-800'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {scheme.colors.slice(0, 3).map((color, i) => (
                        <div
                          key={i}
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <span className="text-sm">{scheme.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={generateWordCloud}
            disabled={!poemText.trim() || isGenerating}
            className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 disabled:dark:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Generating...
              </>
            ) : (
              <>
                <RefreshCw size={20} />
                Generate Word Cloud
              </>
            )}
          </button>
        </div>

        <div className="glass rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Word Cloud
            </h3>
            {wordCloud.length > 0 && (
              <button
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                title="Download word cloud"
              >
                <Download className="text-slate-600 dark:text-slate-400" size={20} />
              </button>
            )}
          </div>

          {wordCloud.length > 0 ? (
            <div className="relative h-96 flex flex-wrap items-center justify-center gap-2 p-6 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600">
              {wordCloud.map((item, index) => (
                <span
                  key={index}
                  style={{
                    fontSize: `${item.size}px`,
                    color: item.color,
                    fontWeight: item.size > 30 ? 'bold' : 'normal'
                  }}
                  className="cursor-pointer hover:opacity-80 transition-opacity select-none"
                  title={`Click to copy "${item.word}"`}
                  onClick={() => navigator.clipboard.writeText(item.word)}
                >
                  {item.word}
                </span>
              ))}
            </div>
          ) : (
            <div className="h-96 flex items-center justify-center text-slate-400 dark:text-slate-500 text-center">
              <div>
                <Cloud size={64} className="mx-auto mb-4 opacity-50" />
                <p>Your word cloud will appear here</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="glass rounded-xl p-6 shadow-sm bg-blue-50 dark:bg-blue-900/20">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
          Word Cloud Features
        </h3>
        <ul className="space-y-2 text-slate-600 dark:text-slate-400">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400">•</span>
            <span>Words that appear more frequently are displayed larger</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400">•</span>
            <span>Common words shorter than 4 letters are automatically filtered out</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400">•</span>
            <span>Choose from multiple color schemes to match your poem's mood</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400">•</span>
            <span>Click any word to copy it to your clipboard</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400">•</span>
            <span>Use word clouds for social media, presentations, or cover art inspiration</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
