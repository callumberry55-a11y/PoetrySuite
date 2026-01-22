import { useState, useRef, useEffect } from 'react';
import { Send, Loader, Sparkles, Volume2 } from 'lucide-react';

interface Message {
  text: string;
  isUser: boolean;
}

// Mock AI function
const getAISuggestion = async (options: { type: string, prompt: string }): Promise<string> => {
    console.log("AI suggestion requested with options:", options)
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    return `This is a mock AI response to your prompt: "${options.prompt}"`;
};

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
      const aiResponse = await getAISuggestion({ type: 'general', prompt: currentInput });
      const botMessage: Message = { text: aiResponse, isUser: false };
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

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
      <header className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3 bg-white dark:bg-slate-800 flex-shrink-0">
        <Sparkles className="text-blue-500" size={24} />
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">AI Chat</h1>
      </header>

      <div className="flex-1 p-4 overflow-y-auto flex-grow">
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.length === 0 && (
            <div className="text-center text-slate-500 dark:text-slate-400 mt-8">
              <Sparkles className="mx-auto h-12 w-12 text-slate-400" />
              <h2 className="mt-4 text-2xl font-semibold">Spark Your Creativity</h2>
              <p className="mt-2">Your AI creative partner is ready. What's on your mind?</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-3 rounded-lg max-w-xl ${msg.isUser ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'}`}>
                {msg.text}
                {!msg.isUser && (
                  <button onClick={() => speak(msg.text)} className="ml-2">
                    <Volume2 size={16} />
                  </button>
                )}
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

      <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Chat with your AI creative partner..."
              className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 border-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-lg text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
            />
            <button
              onClick={handleSend}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-3 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
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
