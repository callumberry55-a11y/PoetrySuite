import { useState, useRef, useEffect } from 'react';
import { Send, Loader, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

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

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { text: input, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-suggestion', {
        body: { prompt: currentInput },
      });

      if (error) {
        throw error;
      }

      const botMessage: Message = { text: data.suggestion, isUser: false };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting AI suggestion:', error);
      const errorMessage = 'Sorry, I had trouble generating a suggestion. Please try again.';
      const botMessage: Message = { text: errorMessage, isUser: false };
      setMessages(prev => [...prev, botMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-m3-background">
      <header className="p-4 border-b border-m3-outline/20 flex items-center gap-3 bg-m3-surface flex-shrink-0">
        <Sparkles className="text-m3-primary" size={24} />
        <h1 className="text-xl font-bold text-m3-on-surface">AI Assistant</h1>
      </header>

      <div className="flex-1 p-4 overflow-y-auto flex-grow">
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.length === 0 && (
            <div className="text-center text-m3-on-surface-variant mt-8">
              <Sparkles className="mx-auto h-12 w-12 text-m3-on-surface-variant/80" />
              <h2 className="mt-4 text-2xl font-semibold">How can I help you today?</h2>
              <p className="mt-2">I'm ready to assist. What can I help you with?</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-3 rounded-lg max-w-xl ${msg.isUser ? 'bg-m3-primary text-m3-on-primary' : 'bg-m3-secondary-container text-m3-on-secondary-container shadow-sm'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="p-3 rounded-lg bg-m3-secondary-container shadow-sm">
                <Loader className="animate-spin text-m3-on-secondary-container" size={20} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-4 bg-m3-surface border-t border-m3-outline/20 flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything..."
              className="flex-1 px-4 py-3 bg-m3-surface-variant/40 border-transparent focus:ring-2 focus:ring-m3-primary focus:border-transparent rounded-lg text-m3-on-surface placeholder:text-m3-on-surface-variant"
            />
            <button
              onClick={handleSend}
              className="bg-m3-primary hover:opacity-90 text-m3-on-primary rounded-lg p-3 disabled:bg-m3-on-surface/20 disabled:text-m3-on-surface/50 disabled:cursor-not-allowed transition-colors"
              disabled={isLoading || !input.trim()}
              aria-label="Send message"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
