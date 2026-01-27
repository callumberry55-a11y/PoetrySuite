import { useState, useRef, useEffect } from 'react';
import { Send, Loader, Sparkles } from 'lucide-react';

const AIAssistant = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === '') return;

    const newMessages = [...messages, { type: 'user', text: input }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setMessages(prev => [...prev, { type: 'ai', text: `This is a simulated AI response to "${input}".` }]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-m3-surface-container text-m3-on-surface-container">
      <header className="p-4 border-b border-m3-outline/20 flex items-center gap-3">
          <Sparkles size={24} className="text-m3-primary"/>
          <h2 className="text-xl font-bold">AI Assistant</h2>
      </header>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex gap-3 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-md p-3 rounded-xl ${
              msg.type === 'user' 
                ? 'bg-m3-primary text-m3-on-primary' 
                : 'bg-m3-surface-variant text-m3-on-surface-variant'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
         {isLoading && (
          <div className="flex justify-start gap-3">
            <div className="max-w-md p-3 rounded-xl bg-m3-surface-variant text-m3-on-surface-variant">
              <Loader className="animate-spin" size={20}/>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-m3-outline/20">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask the AI assistant..."
            className="w-full p-3 pr-12 rounded-lg bg-m3-surface-variant border-transparent focus:ring-2 focus:ring-m3-primary focus:outline-none"
            disabled={isLoading}
          />
          <button 
            onClick={handleSend} 
            disabled={isLoading}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-m3-primary text-m3-on-primary disabled:opacity-50 transition-opacity"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
