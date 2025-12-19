import { useState } from 'react';
import { BookOpen, Search } from 'lucide-react';

const SAMPLE_RHYMES = {
  perfect: ['delight', 'flight', 'height', 'kite', 'light', 'might', 'night', 'right', 'sight', 'tight'],
  near: ['bite', 'bright', 'cite', 'fight', 'plight', 'quite', 'site', 'slight', 'white', 'write'],
  assonance: ['design', 'divide', 'derived', 'decline', 'define', 'refined', 'behind', 'remind'],
  consonance: ['best', 'mist', 'feast', 'last', 'frost', 'toast', 'wrist', 'crest']
};

export default function RhymeDictionary() {
  const [searchWord, setSearchWord] = useState('');
  const [rhymeType, setRhymeType] = useState<'perfect' | 'near' | 'assonance' | 'consonance'>('perfect');
  const [results, setResults] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchWord.trim()) return;

    setIsSearching(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    setResults(SAMPLE_RHYMES[rhymeType]);
    setIsSearching(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="text-blue-600 dark:text-blue-400" size={32} />
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Rhyme Dictionary</h2>
        </div>
        <p className="text-slate-600 dark:text-slate-400">
          Find perfect rhymes, near rhymes, assonance, and consonance for your poetry.
        </p>
      </div>

      <div className="glass rounded-xl p-6 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={searchWord}
              onChange={(e) => setSearchWord(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter a word..."
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={rhymeType}
              onChange={(e) => setRhymeType(e.target.value as any)}
              className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-white"
            >
              <option value="perfect">Perfect Rhymes</option>
              <option value="near">Near Rhymes</option>
              <option value="assonance">Assonance</option>
              <option value="consonance">Consonance</option>
            </select>

            <button
              onClick={handleSearch}
              disabled={!searchWord.trim() || isSearching}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 disabled:dark:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {isSearching ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Search size={20} />
              )}
              Search
            </button>
          </div>
        </div>
      </div>

      {results.length > 0 && (
        <div className="glass rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            {rhymeType === 'perfect' && 'Perfect Rhymes'}
            {rhymeType === 'near' && 'Near Rhymes'}
            {rhymeType === 'assonance' && 'Assonance Matches'}
            {rhymeType === 'consonance' && 'Consonance Matches'}
            {' '}for "{searchWord}"
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {results.map((word, index) => (
              <button
                key={index}
                onClick={() => navigator.clipboard.writeText(word)}
                className="px-4 py-3 bg-slate-50 dark:bg-slate-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/30 border border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-700 rounded-lg text-slate-900 dark:text-white transition-colors text-left"
                title="Click to copy"
              >
                {word}
              </button>
            ))}
          </div>
        </div>
      )}

      {!results.length && !isSearching && (
        <div className="glass rounded-xl p-12 shadow-sm text-center">
          <BookOpen size={64} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
          <p className="text-slate-600 dark:text-slate-400">
            Enter a word and select a rhyme type to find matches
          </p>
        </div>
      )}

      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
            Rhyme Types
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">Perfect Rhymes</p>
              <p className="text-slate-600 dark:text-slate-400">Words with identical ending sounds (e.g., "cat" and "hat")</p>
            </div>
            <div>
              <p className="font-medium text-slate-900 dark:text-white">Near Rhymes</p>
              <p className="text-slate-600 dark:text-slate-400">Words with similar but not identical sounds (e.g., "soul" and "all")</p>
            </div>
            <div>
              <p className="font-medium text-slate-900 dark:text-white">Assonance</p>
              <p className="text-slate-600 dark:text-slate-400">Words with matching vowel sounds (e.g., "lake" and "fate")</p>
            </div>
            <div>
              <p className="font-medium text-slate-900 dark:text-white">Consonance</p>
              <p className="text-slate-600 dark:text-slate-400">Words with matching consonant sounds (e.g., "blank" and "think")</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-6 shadow-sm bg-blue-50 dark:bg-blue-900/20">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
            Pro Tips
          </h3>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400">•</span>
              <span>Click any rhyme to copy it to your clipboard</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400">•</span>
              <span>Near rhymes can add sophistication to your poetry</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400">•</span>
              <span>Assonance and consonance create subtle connections</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400">•</span>
              <span>Mix different rhyme types for more interesting poems</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
