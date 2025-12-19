import { useState } from 'react';
import { Languages, ArrowRight, Copy, Check } from 'lucide-react';

const LANGUAGES = [
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' }
];

export default function PoetryTranslation() {
  const [poemText, setPoemText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [translation, setTranslation] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleTranslate = async () => {
    if (!poemText.trim()) return;

    setIsTranslating(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const languageName = LANGUAGES.find(l => l.code === targetLanguage)?.name || 'Spanish';
    setTranslation(`[AI-translated version of your poem in ${languageName}]\n\nThis is a simulated translation. In production, this would use an AI translation service that preserves poetic structure, meter, and emotional resonance while translating to ${languageName}.`);
    setIsTranslating(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(translation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Languages className="text-blue-600 dark:text-blue-400" size={32} />
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Poetry Translation</h2>
        </div>
        <p className="text-slate-600 dark:text-slate-400">
          Translate your poems into different languages while preserving poetic structure and emotional meaning.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Original Poem
          </h3>
          <textarea
            value={poemText}
            onChange={(e) => setPoemText(e.target.value)}
            placeholder="Enter your poem here..."
            rows={12}
            className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 resize-none"
          />

          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Translate to
            </label>
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-white"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleTranslate}
            disabled={!poemText.trim() || isTranslating}
            className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 disabled:dark:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            {isTranslating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Translating...
              </>
            ) : (
              <>
                Translate
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </div>

        <div className="glass rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Translation
            </h3>
            {translation && (
              <button
                onClick={handleCopy}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                title="Copy translation"
              >
                {copied ? (
                  <Check className="text-green-600 dark:text-green-400" size={20} />
                ) : (
                  <Copy className="text-slate-600 dark:text-slate-400" size={20} />
                )}
              </button>
            )}
          </div>

          {translation ? (
            <div className="prose dark:prose-invert max-w-none">
              <div className="px-4 py-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                <p className="text-slate-900 dark:text-white whitespace-pre-wrap">{translation}</p>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-500 text-center">
              <div>
                <Languages size={48} className="mx-auto mb-3 opacity-50" />
                <p>Your translated poem will appear here</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 glass rounded-xl p-6 shadow-sm bg-blue-50 dark:bg-blue-900/20">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
          Translation Tips
        </h3>
        <ul className="space-y-2 text-slate-600 dark:text-slate-400">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400">•</span>
            <span>The translator attempts to preserve rhyme schemes and meter where possible</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400">•</span>
            <span>Idioms and cultural references are adapted for the target language</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400">•</span>
            <span>Emotional tone and poetic devices are maintained in translation</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400">•</span>
            <span>Some poetic liberties may be taken to ensure natural flow in the target language</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
