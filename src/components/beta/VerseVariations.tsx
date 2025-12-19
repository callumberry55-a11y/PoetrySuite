import { useState } from 'react';
import { Sparkles, RefreshCw, Copy, Check } from 'lucide-react';

const TONES = ['Romantic', 'Dark', 'Humorous', 'Formal', 'Casual', 'Melancholic', 'Hopeful', 'Nostalgic'];
const STYLES = ['Minimalist', 'Ornate', 'Modern', 'Classical', 'Abstract', 'Concrete', 'Lyrical', 'Narrative'];

export default function VerseVariations() {
  const [originalVerse, setOriginalVerse] = useState('');
  const [selectedTone, setSelectedTone] = useState('Romantic');
  const [selectedStyle, setSelectedStyle] = useState('Modern');
  const [variations, setVariations] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generateVariations = async () => {
    if (!originalVerse.trim()) return;

    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    const sampleVariations = [
      `[${selectedTone} variation with ${selectedStyle} style]\n\nThis is a simulated AI-generated variation of your verse. In production, this would use advanced AI to rewrite your verse with the selected tone and style while maintaining the core meaning and poetic structure.`,
      `[Alternative ${selectedTone} interpretation]\n\nAnother creative take on your original verse, adapting it to be more ${selectedStyle.toLowerCase()} while preserving the emotional essence and key imagery.`,
      `[${selectedStyle} reimagining]\n\nA third variation that explores different word choices and phrasing to express similar ideas with a ${selectedTone.toLowerCase()} tone.`
    ];

    setVariations(sampleVariations);
    setIsGenerating(false);
  };

  const handleCopy = (index: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="text-blue-600 dark:text-blue-400" size={32} />
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Verse Variations</h2>
        </div>
        <p className="text-slate-600 dark:text-slate-400">
          Generate AI-powered alternative versions of your verses with different tones and styles.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="glass rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Original Verse
          </h3>
          <textarea
            value={originalVerse}
            onChange={(e) => setOriginalVerse(e.target.value)}
            placeholder="Enter your verse or stanza here..."
            rows={8}
            className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 resize-none"
          />
        </div>

        <div className="glass rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Variation Settings
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Tone
              </label>
              <div className="grid grid-cols-2 gap-2">
                {TONES.map((tone) => (
                  <button
                    key={tone}
                    onClick={() => setSelectedTone(tone)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedTone === tone
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {tone}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Style
              </label>
              <div className="grid grid-cols-2 gap-2">
                {STYLES.map((style) => (
                  <button
                    key={style}
                    onClick={() => setSelectedStyle(style)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedStyle === style
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={generateVariations}
              disabled={!originalVerse.trim() || isGenerating}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 disabled:dark:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw size={20} />
                  Generate Variations
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {variations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
            Generated Variations
          </h3>
          {variations.map((variation, index) => (
            <div key={index} className="glass rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-slate-900 dark:text-white">
                  Variation {index + 1}
                </h4>
                <button
                  onClick={() => handleCopy(index, variation)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  title="Copy variation"
                >
                  {copiedIndex === index ? (
                    <Check className="text-green-600 dark:text-green-400" size={20} />
                  ) : (
                    <Copy className="text-slate-600 dark:text-slate-400" size={20} />
                  )}
                </button>
              </div>
              <div className="px-4 py-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                <p className="text-slate-900 dark:text-white whitespace-pre-wrap">{variation}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 glass rounded-xl p-6 shadow-sm bg-blue-50 dark:bg-blue-900/20">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
          Tips for Using Variations
        </h3>
        <ul className="space-y-2 text-slate-600 dark:text-slate-400">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400">•</span>
            <span>Use variations to explore different ways of expressing the same idea</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400">•</span>
            <span>Mix elements from multiple variations to create your perfect verse</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400">•</span>
            <span>Experiment with contrasting tones to find the right emotional impact</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400">•</span>
            <span>Use variations as inspiration rather than direct replacements</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
