import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Loader, Sparkles } from 'lucide-react';
import { getAISuggestion, SuggestionType } from '../utils/ai';

interface Message {
  text: string;
  isUser: boolean;
}

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
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
    } catch (error) {
      let errorMessage = 'Sorry, I had trouble generating a suggestion. Please try again.';
      if (error instanceof Error && error.message.includes('Not authenticated')) {
        errorMessage = 'Your session has expired. Please log in again to use the AI assistant.';
      }
      const botMessage: Message = { text: errorMessage, isUser: false };
      setMessages(prev => [...prev, botMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg z-50"
      >
        <Bot size={24} />
      </button>

      {isOpen && (
        <div className="fixed bottom-20 right-6 w-96 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 flex flex-col">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
            <Sparkles className="text-blue-500" size={24} />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI Poetry Assistant</h3>
          </div>

          <div className="flex-1 p-4 overflow-y-auto h-96">
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-lg max-w-xs ${msg.isUser ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="p-3 rounded-lg bg-slate-200 dark:bg-slate-700">
                    <Loader className="animate-spin text-slate-500" size={20} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask for a suggestion..."
                className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400"
              />
              <button
                onClick={() => handleSend()}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-2 disabled:bg-slate-400"
                disabled={isLoading || !input.trim()}
              >
                <Send size={20} />
              </button>
            </div>
            <div className="flex gap-2 text-sm text-slate-600 dark:text-slate-400">
              <button onClick={() => handleSend('rhyme')} className="hover:text-blue-500">Rhyme</button>
              <button onClick={() => handleSend('metaphor')} className="hover:text-blue-500">Metaphor</button>
              <button onClick={() => handleSend('haiku')} className="hover:text-blue-500">Haiku</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
