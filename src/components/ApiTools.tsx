import { useState } from 'react';
import { Search, Sparkles, BookOpen, Lightbulb, Wand2, FileText } from 'lucide-react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export default function ApiTools() {
  const [activeTab, setActiveTab] = useState<'rhyme' | 'synonym' | 'prompts' | 'quote' | 'word' | 'analyze'>('rhyme');
  const [inputWord, setInputWord] = useState('');
  const [rhymeType, setRhymeType] = useState('perfect');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [analyzeText, setAnalyzeText] = useState('');

  const findRhymes = async () => {
    if (!inputWord.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/rhyme-finder?word=${encodeURIComponent(inputWord)}&type=${rhymeType}&max=30`
      );
      const data = await res.json();
      setResults(data);
    } catch (error) {
      console.error('Error finding rhymes:', error);
    }
    setLoading(false);
  };

  const findSynonyms = async () => {
    if (!inputWord.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/synonym-finder?word=${encodeURIComponent(inputWord)}&max=50`
      );
      const data = await res.json();
      setResults(data);
    } catch (error) {
      console.error('Error finding synonyms:', error);
    }
    setLoading(false);
  };

  const generatePrompts = async (category: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/poetry-prompts-generator?category=${category}&count=5`
      );
      const data = await res.json();
      setResults(data);
    } catch (error) {
      console.error('Error generating prompts:', error);
    }
    setLoading(false);
  };

  const getQuote = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/quote-of-the-day`);
      const data = await res.json();
      setResults(data);
    } catch (error) {
      console.error('Error fetching quote:', error);
    }
    setLoading(false);
  };

  const getWordOfDay = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/word-of-the-day`);
      const data = await res.json();
      setResults(data);
    } catch (error) {
      console.error('Error fetching word:', error);
    }
    setLoading(false);
  };

  const analyzePoem = async () => {
    if (!analyzeText.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/literary-devices-detector`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: analyzeText })
        }
      );
      const data = await res.json();
      setResults(data);
    } catch (error) {
      console.error('Error analyzing text:', error);
    }
    setLoading(false);
  };

  const tabs = [
    { id: 'rhyme', label: 'Rhyme Finder', icon: Search },
    { id: 'synonym', label: 'Synonyms', icon: BookOpen },
    { id: 'prompts', label: 'Prompts', icon: Lightbulb },
    { id: 'quote', label: 'Quote', icon: Sparkles },
    { id: 'word', label: 'Word of Day', icon: Wand2 },
    { id: 'analyze', label: 'Analyze', icon: FileText },
  ];

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex-shrink-0 bg-primary text-on-primary p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Wand2 size={28} className="sm:w-8 sm:h-8" />
            <h1 className="text-2xl sm:text-3xl font-bold">Writing Tools</h1>
          </div>
          <p className="text-sm sm:text-base text-on-primary/80">
            Powerful APIs to enhance your poetry writing
          </p>
        </div>
      </div>

      <div className="flex-shrink-0 bg-surface border-b border-outline/20 overflow-x-auto">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1 sm:gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setResults(null);
                  }}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-3 font-medium transition-colors whitespace-nowrap text-sm sm:text-base ${
                    activeTab === tab.id
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <Icon size={18} className="sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
          {activeTab === 'rhyme' && (
            <div className="space-y-4">
              <div className="bg-surface rounded-2xl p-4 sm:p-6 border border-outline/20">
                <h2 className="text-xl font-bold text-on-surface mb-4">Find Rhymes</h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={inputWord}
                    onChange={(e) => setInputWord(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && findRhymes()}
                    placeholder="Enter a word..."
                    className="w-full px-4 py-3 rounded-xl bg-background border border-outline/30 text-on-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <select
                    value={rhymeType}
                    onChange={(e) => setRhymeType(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-outline/30 text-on-background focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="perfect">Perfect Rhymes</option>
                    <option value="near">Near Rhymes</option>
                    <option value="sounds_like">Sounds Like</option>
                    <option value="adjectives">Adjectives</option>
                    <option value="nouns">Nouns</option>
                    <option value="synonyms">Synonyms</option>
                    <option value="triggers">Triggers</option>
                  </select>
                  <button
                    onClick={findRhymes}
                    disabled={loading || !inputWord.trim()}
                    className="w-full px-6 py-3 bg-primary text-on-primary rounded-xl font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all"
                  >
                    {loading ? 'Searching...' : 'Find Rhymes'}
                  </button>
                </div>
              </div>

              {results?.results && (
                <div className="bg-surface rounded-2xl p-4 sm:p-6 border border-outline/20">
                  <h3 className="text-lg font-bold text-on-surface mb-4">
                    Results for "{results.word}" ({results.results.length})
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {results.results.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="px-3 py-2 bg-primary-container text-on-primary-container rounded-lg text-center font-medium"
                      >
                        {item.word}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'synonym' && (
            <div className="space-y-4">
              <div className="bg-surface rounded-2xl p-4 sm:p-6 border border-outline/20">
                <h2 className="text-xl font-bold text-on-surface mb-4">Find Synonyms</h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={inputWord}
                    onChange={(e) => setInputWord(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && findSynonyms()}
                    placeholder="Enter a word..."
                    className="w-full px-4 py-3 rounded-xl bg-background border border-outline/30 text-on-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    onClick={findSynonyms}
                    disabled={loading || !inputWord.trim()}
                    className="w-full px-6 py-3 bg-primary text-on-primary rounded-xl font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all"
                  >
                    {loading ? 'Searching...' : 'Find Synonyms'}
                  </button>
                </div>
              </div>

              {results?.synonyms && (
                <div className="bg-surface rounded-2xl p-4 sm:p-6 border border-outline/20">
                  <h3 className="text-lg font-bold text-on-surface mb-4">
                    Synonyms for "{results.originalWord}" ({results.synonyms.length})
                  </h3>
                  <div className="space-y-2">
                    {results.synonyms.slice(0, 30).map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="px-4 py-3 bg-secondary-container text-on-secondary-container rounded-xl"
                      >
                        <div className="font-bold">{item.word}</div>
                        {item.definitions.length > 0 && (
                          <div className="text-sm opacity-80 mt-1">{item.definitions[0]}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'prompts' && (
            <div className="space-y-4">
              <div className="bg-surface rounded-2xl p-4 sm:p-6 border border-outline/20">
                <h2 className="text-xl font-bold text-on-surface mb-4">Generate Prompts</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                  {['random', 'emotions', 'nature', 'abstract', 'narrative', 'experimental'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => generatePrompts(cat)}
                      disabled={loading}
                      className="px-4 py-3 bg-primary text-on-primary rounded-xl font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all capitalize"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {results?.prompts && (
                <div className="bg-surface rounded-2xl p-4 sm:p-6 border border-outline/20">
                  <h3 className="text-lg font-bold text-on-surface mb-4">
                    Writing Prompts ({results.category})
                  </h3>
                  <div className="space-y-3">
                    {results.prompts.map((prompt: string, idx: number) => (
                      <div
                        key={idx}
                        className="px-4 py-3 bg-tertiary-container text-on-tertiary-container rounded-xl"
                      >
                        <div className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-primary text-on-primary rounded-full flex items-center justify-center text-sm font-bold">
                            {idx + 1}
                          </span>
                          <p className="flex-1">{prompt}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'quote' && (
            <div className="space-y-4">
              <div className="bg-surface rounded-2xl p-4 sm:p-6 border border-outline/20">
                <h2 className="text-xl font-bold text-on-surface mb-4">Quote of the Day</h2>
                <button
                  onClick={getQuote}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-primary text-on-primary rounded-xl font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all"
                >
                  {loading ? 'Loading...' : 'Get Inspirational Quote'}
                </button>
              </div>

              {results?.quote && (
                <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-6 sm:p-8 border border-primary/20">
                  <blockquote className="space-y-4">
                    <p className="text-lg sm:text-xl text-on-surface italic leading-relaxed">
                      "{results.quote.content}"
                    </p>
                    <cite className="block text-right text-on-surface-variant font-semibold not-italic">
                      — {results.quote.author}
                    </cite>
                    <div className="flex flex-wrap gap-2 justify-end">
                      {results.quote.tags?.map((tag: string) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-primary/20 text-primary rounded-full text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </blockquote>
                </div>
              )}
            </div>
          )}

          {activeTab === 'word' && (
            <div className="space-y-4">
              <div className="bg-surface rounded-2xl p-4 sm:p-6 border border-outline/20">
                <h2 className="text-xl font-bold text-on-surface mb-4">Word of the Day</h2>
                <button
                  onClick={getWordOfDay}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-primary text-on-primary rounded-xl font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all"
                >
                  {loading ? 'Loading...' : 'Get Word of the Day'}
                </button>
              </div>

              {results?.word && (
                <div className="bg-surface rounded-2xl p-4 sm:p-6 border border-outline/20">
                  <h3 className="text-3xl font-bold text-primary mb-2">{results.word}</h3>
                  {results.note && (
                    <p className="text-sm text-on-surface-variant italic mb-4">{results.note}</p>
                  )}

                  {results.definitions?.length > 0 && (
                    <div className="space-y-3 mb-4">
                      <h4 className="font-bold text-on-surface">Definitions:</h4>
                      {results.definitions.map((def: any, idx: number) => (
                        <div key={idx} className="pl-4 border-l-2 border-primary">
                          <span className="text-xs font-semibold text-primary uppercase">
                            {def.partOfSpeech}
                          </span>
                          <p className="text-on-surface">{def.text}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {results.examples?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-bold text-on-surface">Examples:</h4>
                      {results.examples.map((ex: any, idx: number) => (
                        <p key={idx} className="text-on-surface-variant italic pl-4 border-l-2 border-secondary">
                          "{ex.text}"
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'analyze' && (
            <div className="space-y-4">
              <div className="bg-surface rounded-2xl p-4 sm:p-6 border border-outline/20">
                <h2 className="text-xl font-bold text-on-surface mb-4">Analyze Your Poetry</h2>
                <div className="space-y-4">
                  <textarea
                    value={analyzeText}
                    onChange={(e) => setAnalyzeText(e.target.value)}
                    placeholder="Paste your poem here..."
                    rows={8}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-outline/30 text-on-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                  <button
                    onClick={analyzePoem}
                    disabled={loading || !analyzeText.trim()}
                    className="w-full px-6 py-3 bg-primary text-on-primary rounded-xl font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all"
                  >
                    {loading ? 'Analyzing...' : 'Analyze Text'}
                  </button>
                </div>
              </div>

              {results?.literaryDevices && (
                <div className="space-y-4">
                  <div className="bg-surface rounded-2xl p-4 sm:p-6 border border-outline/20">
                    <h3 className="text-lg font-bold text-on-surface mb-4">Structure</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      <div className="text-center p-3 bg-primary-container rounded-xl">
                        <div className="text-2xl font-bold text-on-primary-container">{results.structure?.lines}</div>
                        <div className="text-xs text-on-primary-container/70">Lines</div>
                      </div>
                      <div className="text-center p-3 bg-secondary-container rounded-xl">
                        <div className="text-2xl font-bold text-on-secondary-container">{results.structure?.words}</div>
                        <div className="text-xs text-on-secondary-container/70">Words</div>
                      </div>
                      <div className="text-center p-3 bg-tertiary-container rounded-xl">
                        <div className="text-2xl font-bold text-on-tertiary-container">{results.structure?.estimatedSyllables}</div>
                        <div className="text-xs text-on-tertiary-container/70">Syllables</div>
                      </div>
                      <div className="text-center p-3 bg-primary-container rounded-xl">
                        <div className="text-2xl font-bold text-on-primary-container">{results.structure?.averageLineLength}</div>
                        <div className="text-xs text-on-primary-container/70">Avg Line</div>
                      </div>
                      <div className="text-center p-3 bg-secondary-container rounded-xl">
                        <div className="text-2xl font-bold text-on-secondary-container">{results.summary?.devicesFound}</div>
                        <div className="text-xs text-on-secondary-container/70">Devices</div>
                      </div>
                    </div>
                  </div>

                  {results.literaryDevices.length > 0 && (
                    <div className="bg-surface rounded-2xl p-4 sm:p-6 border border-outline/20">
                      <h3 className="text-lg font-bold text-on-surface mb-4">Literary Devices Found</h3>
                      <div className="space-y-4">
                        {results.literaryDevices.map((device: any, idx: number) => (
                          <div key={idx} className="border border-outline/20 rounded-xl p-4">
                            <h4 className="font-bold text-primary mb-1">{device.device}</h4>
                            <p className="text-sm text-on-surface-variant mb-3">{device.description}</p>
                            <div className="space-y-1">
                              {device.examples.map((ex: string, i: number) => (
                                <div key={i} className="px-3 py-2 bg-background rounded-lg text-sm text-on-background font-mono">
                                  {ex}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
