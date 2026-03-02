import { useState, useEffect, useRef } from 'react';
import { Send, Users, Hash, Bot } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

interface Message {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_profiles: {
    display_name: string;
  };
}

interface ChatRoom {
  id: string;
  name: string;
  description: string;
  is_ai?: boolean;
}

export default function ChatView() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<string>('');
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    loadRooms();
  }, []);

  useEffect(() => {
    if (currentRoom) {
      loadMessages();
      subscribeToMessages();
    }
  }, [currentRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadRooms = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        showToast('Please log in to access chat', 'error');
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-service/rooms`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error('Failed to load rooms');

      const result = await response.json();
      setRooms(result.rooms || []);
      if (result.rooms && result.rooms.length > 0) {
        setCurrentRoom(result.rooms[0].id);
      }
    } catch (error) {
      showToast('Failed to load chat rooms', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-service/messages?room_id=${currentRoom}&limit=100`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error('Failed to load messages');

      const result = await response.json();
      setMessages(result.messages || []);
    } catch (error) {
      showToast('Failed to load messages', 'error');
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`chat-${currentRoom}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${currentRoom}`,
        },
        async (payload) => {
          const { data } = await supabase
            .from('chat_messages')
            .select(`
              *,
              user_profiles!inner(display_name)
            `)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            setMessages((prev) => [...prev, data]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !user) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        showToast('Please log in to send messages', 'error');
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-service/send`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            room_id: currentRoom,
            content: newMessage.trim(),
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to send message');

      setNewMessage('');
    } catch (error) {
      showToast('Failed to send message', 'error');
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-white dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-white dark:bg-slate-900 pb-20">
      {/* Sidebar - Room List */}
      <div className="w-64 border-r border-slate-200 dark:border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5" />
            Chat Rooms
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => setCurrentRoom(room.id)}
              className={`w-full text-left px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                currentRoom === room.id
                  ? 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500'
                  : ''
              }`}
            >
              <div className="flex items-center gap-2">
                {room.is_ai ? (
                  <Bot className="w-4 h-4 text-green-500" />
                ) : (
                  <Hash className="w-4 h-4 text-slate-500" />
                )}
                <span className="font-medium text-slate-900 dark:text-white">
                  {room.name}
                </span>
                {room.is_ai && (
                  <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
                    AI
                  </span>
                )}
              </div>
              {room.description && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 ml-6">
                  {room.description}
                </p>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            {rooms.find((r) => r.id === currentRoom)?.is_ai && (
              <Bot className="w-6 h-6 text-green-500" />
            )}
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
              {rooms.find((r) => r.id === currentRoom)?.name || 'Chat'}
            </h1>
          </div>
          {rooms.find((r) => r.id === currentRoom)?.description && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {rooms.find((r) => r.id === currentRoom)?.description}
            </p>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {messages.length === 0 ? (
            <div className="text-center text-slate-500 dark:text-slate-400 mt-8">
              No messages yet. Start the conversation!
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => {
                const isAiMessage = message.content.startsWith('**Dave:**');
                const displayContent = isAiMessage
                  ? message.content.replace('**Dave:**', '').trim()
                  : message.content;

                return (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.user_id === user?.id && !isAiMessage ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ${
                      isAiMessage ? 'bg-blue-500' : 'bg-green-500'
                    }`}>
                      {isAiMessage ? (
                        <Bot className="w-6 h-6" />
                      ) : (
                        message.user_profiles.display_name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div
                      className={`flex-1 max-w-lg ${
                        message.user_id === user?.id && !isAiMessage ? 'text-right' : ''
                      }`}
                    >
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-medium text-slate-900 dark:text-white">
                          {isAiMessage ? 'Dave' : message.user_profiles.display_name}
                        </span>
                        {isAiMessage && (
                          <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full">
                            AI
                          </span>
                        )}
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {formatTime(message.created_at)}
                        </span>
                      </div>
                      <div
                        className={`inline-block px-4 py-2 rounded-lg ${
                          isAiMessage
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-slate-900 dark:text-white border border-blue-200 dark:border-blue-800'
                            : message.user_id === user?.id
                            ? 'bg-green-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                        }`}
                      >
                        {displayContent}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <form onSubmit={sendMessage} className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold"
            >
              <Send className="w-5 h-5" />
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
