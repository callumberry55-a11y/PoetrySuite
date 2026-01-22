import { useState, useRef, useEffect } from 'react';
import { Send, Loader, Sparkles } from 'lucide-react';
import { getAISuggestion, SuggestionType } from '../utils/ai';

interface Message {
  text: string;
  isUser: boolean;
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (suggestionType: SuggestionType = 'line') => {
    if (!input.trim() && messages.length === 0) return;

    const userMessage: Message = { text: input, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const aiResponse = await getAISuggestion({ type: suggestionType, prompt: input });
      const botMessage: Message = { text: aiResponse, isUser: false };
      setMessages(prev => [...prev, botMessage]);
    } catch {
      const errorMessage = 'Sorry, I had trouble generating a suggestion. Please try again.';
      const botMessage: Message = { text: errorMessage, isUser: false };
      setMessages(prev => [...prev, botMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
      <header className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3 bg-white dark:bg-slate-800">
        <Sparkles className="text-blue-500" size={24} />
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">AI Chat</h1>
      </header>

      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-3 rounded-lg max-w-xl ${msg.isUser ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="p-3 rounded-lg bg-white dark:bg-slate-800 shadow-sm">
                <Loader className="animate-spin text-slate-500" size={20} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask for a rhyme, a metaphor, or anything else..."
              className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 border-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-lg text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
            />
            <button
              onClick={() => handleSend()}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-3 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
              disabled={isLoading || !input.trim()}
              aria-label="Send message"
            >
              <Send size={20} />
            </button>
          </div>
          <div className="flex gap-4 text-sm text-slate-600 dark:text-slate-400 mt-3">
            <span className="font-medium">Suggestions:</span>
            <button onClick={() => handleSend('rhyme')} className="hover:text-blue-500 transition-colors">Find a rhyme</button>
            <button onClick={() => handleSend('metaphor')} className="hover:text-blue-500 transition-colors">Create a metaphor</button>
            <button onClick={() => handleSend('haiku')} className="hover:text-blue-500 transition-colors">Write a haiku</button>
          </div>
        </div>
      </div>
    </div>
  );
}
