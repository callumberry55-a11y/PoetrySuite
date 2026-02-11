import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Sparkles, X, Mic, TrendingUp, Clock } from 'lucide-react';
import { generateAIResponse } from '@/utils/ai';

interface AISearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  placeholder: string;
  poems?: Array<{ title: string; content: string; created_at: string }>;
  mode?: 'library' | 'discover';
}

interface SearchSuggestion {
  type: 'query' | 'filter' | 'theme';
  text: string;
  icon: string;
}

export default function AISearchBar({
  value,
  onChange,
  onSearch,
  placeholder,
  poems = [],
  mode = 'library',
}: AISearchBarProps) {
  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [aiMode, setAiMode] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [apiKeyAvailable, setApiKeyAvailable] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('recentSearches');
    if (stored) {
      setRecentSearches(JSON.parse(stored));
    }

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    setApiKeyAvailable(!!apiKey);
  }, []);

  const generateSuggestions = useCallback(async () => {
    if (mode === 'library' && poems.length > 0) {
      const themes = extractThemes();
      const recentPoems = poems.slice(0, 5).map(p => p.title);

      const suggestions: SearchSuggestion[] = [];

      if (aiMode && value.length > 3) {
        try {
          const aiSuggestions = await generateAISuggestions(value);
          suggestions.push(...aiSuggestions);
        } catch (error) {
          console.error('AI suggestions failed:', error);
        }
      }

      themes.forEach(theme => {
        if (theme.toLowerCase().includes(value.toLowerCase())) {
          suggestions.push({
            type: 'theme',
            text: theme,
            icon: '🎨',
          });
        }
      });

      recentPoems.forEach(title => {
        if (title.toLowerCase().includes(value.toLowerCase())) {
          suggestions.push({
            type: 'query',
            text: title,
            icon: '📝',
          });
        }
      });

      setSuggestions(suggestions.slice(0, 5));
    } else if (mode === 'discover') {
      const discoverSuggestions: SearchSuggestion[] = [
        { type: 'theme' as const, text: 'love poems', icon: '💕' },
        { type: 'theme' as const, text: 'nature poems', icon: '🌿' },
        { type: 'theme' as const, text: 'haiku', icon: '🎋' },
        { type: 'theme' as const, text: 'sonnets', icon: '📜' },
        { type: 'theme' as const, text: 'free verse', icon: '✨' },
      ].filter(s => s.text.toLowerCase().includes(value.toLowerCase()));

      setSuggestions(discoverSuggestions);
    }
  }, [value, mode, poems, aiMode]);

  useEffect(() => {
    if (focused && value.length > 0) {
      generateSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [value, focused, generateSuggestions]);

  const generateAISuggestions = async (query: string): Promise<SearchSuggestion[]> => {
    const prompt = `Given the search query "${query}" for poetry, suggest 3 related search terms that would help find relevant poems. Return only the terms, one per line, no numbering or extra text.`;

    try {
      const response = await generateAIResponse(prompt);
      const terms = response.split('\n').filter(t => t.trim().length > 0);
      return terms.slice(0, 3).map(term => ({
        type: 'query',
        text: term.trim(),
        icon: '✨',
      }));
    } catch {
      return [];
    }
  };

  const extractThemes = (): string[] => {
    const commonThemes = ['love', 'nature', 'life', 'death', 'time', 'hope', 'loss', 'joy', 'sadness', 'memory'];
    const foundThemes = new Set<string>();

    poems.forEach(poem => {
      const text = (poem.title + ' ' + poem.content).toLowerCase();
      commonThemes.forEach(theme => {
        if (text.includes(theme)) {
          foundThemes.add(theme.charAt(0).toUpperCase() + theme.slice(1));
        }
      });
    });

    return Array.from(foundThemes);
  };

  const startVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice search is not supported in your browser');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;

    recognitionRef.current.onstart = () => {
      setIsListening(true);
    };

    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onChange(transcript);
      setIsListening(false);
      setTimeout(() => onSearch(), 100);
    };

    recognitionRef.current.onerror = () => {
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current.start();
  };

  const handleSearch = () => {
    if (value.trim()) {
      const updated = [value, ...recentSearches.filter(s => s !== value)].slice(0, 10);
      setRecentSearches(updated);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
    }
    onSearch();
    setFocused(false);
  };

  const applySuggestion = (suggestion: SearchSuggestion) => {
    onChange(suggestion.text);
    setTimeout(() => {
      onSearch();
      setFocused(false);
    }, 100);
  };

  return (
    <div className="relative w-full">
      <div
        className={`relative flex items-center gap-1 sm:gap-2 transition-all duration-300 ${
          focused
            ? 'ring-2 ring-blue-500 shadow-lg sm:scale-[1.02]'
            : 'ring-1 ring-slate-300 dark:ring-slate-600'
        } rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-800`}
      >
        <div className="absolute left-3 sm:left-4 flex items-center gap-1.5 sm:gap-2 pointer-events-none">
          <Search className="text-slate-400 flex-shrink-0" size={18} />
          {aiMode && (
            <Sparkles className="text-blue-500 animate-pulse flex-shrink-0" size={14} />
          )}
        </div>

        <input
          ref={inputRef}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder={placeholder}
          className="w-full pl-10 sm:pl-12 pr-[140px] sm:pr-40 py-3 sm:py-3.5 text-sm sm:text-base bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
        />

        <div className="absolute right-1 sm:right-2 flex items-center gap-0.5 sm:gap-1">
          {value && (
            <button
              onClick={() => onChange('')}
              className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
              aria-label="Clear search"
            >
              <X size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>
          )}

          <button
            onClick={() => apiKeyAvailable && setAiMode(!aiMode)}
            disabled={!apiKeyAvailable}
            className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl transition-all min-w-[36px] min-h-[36px] flex items-center justify-center ${
              aiMode
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : apiKeyAvailable
                ? 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400'
                : 'opacity-30 cursor-not-allowed text-slate-300'
            }`}
            aria-label={`${aiMode ? 'Disable' : 'Enable'} AI search`}
            title={apiKeyAvailable ? "AI-powered search" : "AI search unavailable - API key not configured"}
          >
            <Sparkles size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>

          <button
            onClick={startVoiceSearch}
            disabled={isListening}
            className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl transition-all min-w-[36px] min-h-[36px] flex items-center justify-center ${
              isListening
                ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 animate-pulse'
                : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400'
            }`}
            aria-label="Voice search"
            title="Voice search"
          >
            <Mic size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>

          <button
            onClick={handleSearch}
            className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl sm:rounded-2xl font-semibold shadow-md hover:shadow-lg transition-all text-xs sm:text-sm min-h-[36px] flex items-center justify-center"
          >
            <span className="hidden xs:inline">Search</span>
            <Search size={16} className="xs:hidden" />
          </button>
        </div>
      </div>

      {focused && (suggestions.length > 0 || recentSearches.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200 max-h-[60vh] overflow-y-auto">
          {suggestions.length > 0 && (
            <div className="p-2 sm:p-3">
              <div className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
                <TrendingUp size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                Suggestions
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => applySuggestion(suggestion)}
                  className="w-full flex items-center gap-2 sm:gap-3 px-3 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-900/20 text-left transition-colors group min-h-[44px] active:scale-95"
                >
                  <span className="text-lg sm:text-xl flex-shrink-0">{suggestion.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base font-medium text-slate-900 dark:text-white truncate">
                      {suggestion.text}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 capitalize">
                      {suggestion.type}
                    </p>
                  </div>
                  <Search className="text-slate-400 group-hover:text-blue-500 transition-colors flex-shrink-0" size={16} />
                </button>
              ))}
            </div>
          )}

          {recentSearches.length > 0 && value.length === 0 && (
            <div className="p-2 sm:p-3 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
                <Clock size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                Recent Searches
              </div>
              {recentSearches.slice(0, 5).map((search, index) => (
                <button
                  key={index}
                  onClick={() => {
                    onChange(search);
                    setTimeout(() => {
                      onSearch();
                      setFocused(false);
                    }, 100);
                  }}
                  className="w-full flex items-center gap-2 sm:gap-3 px-3 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 text-left transition-colors group min-h-[44px] active:scale-95"
                >
                  <Clock className="text-slate-400 flex-shrink-0" size={16} />
                  <span className="flex-1 text-sm sm:text-base text-slate-700 dark:text-slate-300 truncate">
                    {search}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const updated = recentSearches.filter(s => s !== search);
                      setRecentSearches(updated);
                      localStorage.setItem('recentSearches', JSON.stringify(updated));
                    }}
                    className="text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1 rounded min-w-[32px] min-h-[32px] flex items-center justify-center flex-shrink-0"
                    aria-label="Remove from recent searches"
                  >
                    <X size={14} />
                  </button>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
