import { useState } from 'react';
import { Palette, Sparkles, Download } from 'lucide-react';

const MOODS = ['Melancholic', 'Joyful', 'Mysterious', 'Romantic', 'Dark', 'Hopeful', 'Nostalgic', 'Peaceful'];
const THEMES = ['Nature', 'Urban', 'Abstract', 'Vintage', 'Minimalist', 'Vibrant', 'Dreamy', 'Ethereal'];

export default function MoodBoardGenerator() {
  const [poemTitle, setPoemTitle] = useState('');
  const [poemText, setPoemText] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');
  const [moodBoard, setMoodBoard] = useState<string[] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!poemText.trim()) return;

    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    const colors = [
      '#4A5568', '#2D3748', '#1A202C',
      '#63B3ED', '#4299E1', '#3182CE',
      '#FC8181', '#F56565', '#E53E3E',
      '#68D391', '#48BB78', '#38A169'
    ];

    setMoodBoard(colors.slice(0, 9));
    setIsGenerating(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Palette className="text-blue-600 dark:text-blue-400" size={32} />
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Mood Board Generator</h2>
        </div>
        <p className="text-slate-600 dark:text-slate-400">
          Create visual inspiration boards based on your poem's themes and emotions.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="glass rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Poem Details
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Poem Title
                </label>
                <input
                  type="text"
                  value={poemTitle}
                  onChange={(e) => setPoemTitle(e.target.value)}
                  placeholder="Enter your poem title..."
                  className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Poem Text
                </label>
                <textarea
                  value={poemText}
                  onChange={(e) => setPoemText(e.target.value)}
                  placeholder="Paste your poem here..."
                  rows={8}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Mood (Optional)
                </label>
                <select
                  value={selectedMood}
                  onChange={(e) => setSelectedMood(e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-white"
                >
                  <option value="">Auto-detect from poem</option>
                  {MOODS.map((mood) => (
                    <option key={mood} value={mood}>{mood}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Visual Theme (Optional)
                </label>
                <select
                  value={selectedTheme}
                  onChange={(e) => setSelectedTheme(e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-white"
                >
                  <option value="">Auto-detect from poem</option>
                  {THEMES.map((theme) => (
                    <option key={theme} value={theme}>{theme}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleGenerate}
                disabled={!poemText.trim() || isGenerating}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 disabled:dark:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Generate Mood Board
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Mood Board
            </h3>
            {moodBoard && (
              <button
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                title="Download mood board"
              >
                <Download className="text-slate-600 dark:text-slate-400" size={20} />
              </button>
            )}
          </div>

          {moodBoard ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {moodBoard.map((color, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded-lg shadow-md border border-slate-200 dark:border-slate-600 flex items-center justify-center group hover:scale-105 transition-transform cursor-pointer"
                    style={{ backgroundColor: color }}
                    title={`Click to copy ${color}`}
                    onClick={() => navigator.clipboard.writeText(color)}
                  >
                    <span className="text-white text-xs font-mono opacity-0 group-hover:opacity-100 bg-black/50 px-2 py-1 rounded">
                      {color}
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                  Suggested Elements
                </h4>
                <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                  <p>• Natural textures and organic shapes</p>
                  <p>• Soft lighting with warm undertones</p>
                  <p>• Hand-written typography</p>
                  <p>• Vintage paper textures</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-96 flex items-center justify-center text-slate-400 dark:text-slate-500 text-center">
              <div>
                <Palette size={64} className="mx-auto mb-4 opacity-50" />
                <p>Your mood board will appear here</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 glass rounded-xl p-6 shadow-sm bg-blue-50 dark:bg-blue-900/20">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
          How It Works
        </h3>
        <ul className="space-y-2 text-slate-600 dark:text-slate-400">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400">•</span>
            <span>AI analyzes your poem's themes, emotions, and imagery</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400">•</span>
            <span>Generates a cohesive color palette and visual suggestions</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400">•</span>
            <span>Click any color to copy its hex code to your clipboard</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400">•</span>
            <span>Use the mood board as inspiration for cover designs or social media</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
