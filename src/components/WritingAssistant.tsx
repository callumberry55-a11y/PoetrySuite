import { useState } from 'react';
import { Sparkles, Book, Lightbulb, Type, Heart, Gauge } from 'lucide-react';
import * as AI from '../lib/ai-assistant';

interface WritingAssistantProps {
  selectedText: string;
  poemContent: string;
  onInsert: (text: string) => void;
}

export default function WritingAssistant({ selectedText, poemContent, onInsert }: WritingAssistantProps) {
  const [activeTab, setActiveTab] = useState<'rhyme' | 'thesaurus' | 'continue' | 'critique' | 'meter' | 'imagery'>('rhyme');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleRhymeSuggestions = async () => {
    if (!selectedText) return;
    setLoading(true);
    try {
      const rhymes = await AI.getRhymeSuggestions(selectedText);
      setResults({ type: 'list', items: rhymes });
    } catch (error) {
      console.error('Error getting rhymes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleThesaurus = async () => {
    if (!selectedText) return;
    setLoading(true);
    try {
      const thesaurus = await AI.getThesaurusResults(selectedText);
      setResults({ type: 'thesaurus', data: thesaurus });
    } catch (error) {
      console.error('Error getting thesaurus:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    if (!poemContent) return;
    setLoading(true);
    try {
      const continuation = await AI.continuePoem(poemContent, 3);
      setResults({ type: 'text', text: continuation });
    } catch (error) {
      console.error('Error continuing poem:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCritique = async () => {
    if (!poemContent) return;
    setLoading(true);
    try {
      const critique = await AI.critiquePoem(poemContent);
      setResults({ type: 'critique', data: critique });
    } catch (error) {
      console.error('Error getting critique:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMeterAnalysis = async () => {
    if (!poemContent) return;
    setLoading(true);
    try {
      const meter = await AI.analyzeMeter(poemContent);
      setResults({ type: 'meter', data: meter });
    } catch (error) {
      console.error('Error analyzing meter:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImagery = async () => {
    setLoading(true);
    try {
      const images = await AI.suggestImagery('nature', 'peaceful');
      setResults({ type: 'list', items: images });
    } catch (error) {
      console.error('Error getting imagery:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'rhyme' as const, label: 'Rhymes', icon: Sparkles, action: handleRhymeSuggestions },
    { id: 'thesaurus' as const, label: 'Thesaurus', icon: Book, action: handleThesaurus },
    { id: 'continue' as const, label: 'Continue', icon: Type, action: handleContinue },
    { id: 'critique' as const, label: 'Critique', icon: Lightbulb, action: handleCritique },
    { id: 'meter' as const, label: 'Meter', icon: Gauge, action: handleMeterAnalysis },
    { id: 'imagery' as const, label: 'Imagery', icon: Heart, action: handleImagery },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="border-b border-slate-200 dark:border-slate-700 p-4">
        <h3 className="font-semibold text-slate-900 dark:text-white">AI Writing Assistant</h3>
      </div>

      <div className="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setResults(null);
            }}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-4">
        {!results && (
          <div className="text-center py-8">
            <button
              onClick={tabs.find(t => t.id === activeTab)?.action}
              disabled={loading || (activeTab !== 'imagery' && activeTab !== 'continue' && activeTab !== 'critique' && activeTab !== 'meter' && !selectedText)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-lg font-medium transition-colors"
            >
              {loading ? 'Analyzing...' : `Get ${tabs.find(t => t.id === activeTab)?.label}`}
            </button>
            {activeTab !== 'imagery' && activeTab !== 'continue' && activeTab !== 'critique' && activeTab !== 'meter' && !selectedText && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Select a word first</p>
            )}
          </div>
        )}

        {results && results.type === 'list' && (
          <div className="flex flex-wrap gap-2">
            {results.items.map((item: string, index: number) => (
              <button
                key={index}
                onClick={() => onInsert(item)}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-blue-100 dark:hover:bg-blue-900 text-slate-700 dark:text-slate-300 rounded-lg text-sm transition-colors"
              >
                {item}
              </button>
            ))}
          </div>
        )}

        {results && results.type === 'thesaurus' && (
          <div className="space-y-4">
            {results.data.synonyms.length > 0 && (
              <div>
                <h4 className="font-medium text-slate-900 dark:text-white mb-2">Synonyms</h4>
                <div className="flex flex-wrap gap-2">
                  {results.data.synonyms.map((word: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => onInsert(word)}
                      className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300 rounded-lg text-sm transition-colors"
                    >
                      {word}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {results.data.antonyms.length > 0 && (
              <div>
                <h4 className="font-medium text-slate-900 dark:text-white mb-2">Antonyms</h4>
                <div className="flex flex-wrap gap-2">
                  {results.data.antonyms.map((word: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => onInsert(word)}
                      className="px-3 py-1.5 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg text-sm transition-colors"
                    >
                      {word}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {results.data.related.length > 0 && (
              <div>
                <h4 className="font-medium text-slate-900 dark:text-white mb-2">Related</h4>
                <div className="flex flex-wrap gap-2">
                  {results.data.related.map((word: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => onInsert(word)}
                      className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg text-sm transition-colors"
                    >
                      {word}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {results && results.type === 'text' && (
          <div className="space-y-4">
            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{results.text}</p>
            <button
              onClick={() => onInsert('\n' + results.text)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Insert
            </button>
          </div>
        )}

        {results && results.type === 'critique' && (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-slate-900 dark:text-white mb-2">Overall</h4>
              <p className="text-slate-700 dark:text-slate-300">{results.data.overall}</p>
            </div>
            <div>
              <h4 className="font-medium text-green-700 dark:text-green-400 mb-2">Strengths</h4>
              <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
                {results.data.strengths.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-amber-700 dark:text-amber-400 mb-2">Areas for Improvement</h4>
              <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
                {results.data.improvements.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-2">Technical Notes</h4>
              <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
                {results.data.technicalNotes.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {results && results.type === 'meter' && (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-slate-900 dark:text-white mb-2">Pattern</h4>
              <p className="text-slate-700 dark:text-slate-300">{results.data.pattern}</p>
            </div>
            <div>
              <h4 className="font-medium text-slate-900 dark:text-white mb-2">Consistency</h4>
              <p className="text-slate-700 dark:text-slate-300">{results.data.consistency}</p>
            </div>
            {results.data.suggestions.length > 0 && (
              <div>
                <h4 className="font-medium text-slate-900 dark:text-white mb-2">Suggestions</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
                  {results.data.suggestions.map((item: string, index: number) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
