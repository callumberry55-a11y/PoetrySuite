import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { MessageCircle, Send, Users, X, Search, ChevronLeft } from 'lucide-react';

interface UserProfile {
  user_id: string;
  email: string;
  display_name: string | null;
}

interface Message {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_profiles?: UserProfile;
}

interface PrivateMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
  sender?: UserProfile;
}

interface Conversation {
  id: string;
  participant_1_id: string;
  participant_2_id: string;
  last_message_at: string;
  other_user?: UserProfile;
  unread_count?: number;
}

export default function Chat() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'public' | 'private'>('public');
  const [publicMessages, setPublicMessages] = useState<Message[]>([]);
  const [privateMessages, setPrivateMessages] = useState<PrivateMessage[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showUserList, setShowUserList] = useState(false);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const publicChannelRef = useRef<any>(null);
  const privateChannelRef = useRef<any>(null);

  useEffect(() => {
    loadPublicMessages();
    loadConversations();
    loadUsers();
    subscribeToPublicMessages();

    return () => {
      if (publicChannelRef.current) {
        supabase.removeChannel(publicChannelRef.current);
      }
      if (privateChannelRef.current) {
        supabase.removeChannel(privateChannelRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadPrivateMessages(selectedConversation.id);
      subscribeToPrivateMessages(selectedConversation.id);
      markMessagesAsRead(selectedConversation.id);
    }

    return () => {
      if (privateChannelRef.current) {
        supabase.removeChannel(privateChannelRef.current);
      }
    };
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [publicMessages, privateMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadPublicMessages = async () => {
    try {
      const { data: messages, error } = await supabase
        .from('public_chat_messages')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;

      if (!messages || messages.length === 0) {
        setPublicMessages([]);
        return;
      }

      const userIds = [...new Set(messages.map(m => m.user_id))];

      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('user_id, email, display_name')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      const messagesWithProfiles = messages.map(msg => ({
        ...msg,
        user_profiles: profileMap.get(msg.user_id)
      }));

      setPublicMessages(messagesWithProfiles);
    } catch (error) {
      console.error('Error loading public messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`participant_1_id.eq.${user?.id},participant_2_id.eq.${user?.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      const conversationsWithUsers = await Promise.all(
        (data || []).map(async (conv) => {
          const otherUserId = conv.participant_1_id === user?.id
            ? conv.participant_2_id
            : conv.participant_1_id;

          const { data: userData } = await supabase
            .from('user_profiles')
            .select('user_id, email, display_name')
            .eq('user_id', otherUserId)
            .maybeSingle();

          const unreadCount = await getUnreadCount(conv.id);

          return {
            ...conv,
            other_user: userData || {
              user_id: otherUserId,
              email: 'Unknown User',
              display_name: null
            },
            unread_count: unreadCount
          };
        })
      );

      setConversations(conversationsWithUsers);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const getUnreadCount = async (conversationId: string) => {
    try {
      const { count, error } = await supabase
        .from('private_messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', conversationId)
        .eq('recipient_id', user?.id)
        .is('read_at', null);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  };

  const loadPrivateMessages = async (conversationId: string) => {
    try {
      const { data: messages, error } = await supabase
        .from('private_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;

      if (!messages || messages.length === 0) {
        setPrivateMessages([]);
        return;
      }

      const senderIds = [...new Set(messages.map(m => m.sender_id))];

      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('user_id, email, display_name')
        .in('user_id', senderIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      const messagesWithProfiles = messages.map(msg => ({
        ...msg,
        sender: profileMap.get(msg.sender_id)
      }));

      setPrivateMessages(messagesWithProfiles);
    } catch (error) {
      console.error('Error loading private messages:', error);
    }
  };

  const markMessagesAsRead = async (conversationId: string) => {
    try {
      await supabase
        .from('private_messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('recipient_id', user?.id)
        .is('read_at', null);

      loadConversations();
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('user_id, email, display_name')
        .neq('user_id', user?.id || '');

      if (error) throw error;

      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const subscribeToPublicMessages = () => {
    publicChannelRef.current = supabase
      .channel('public-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'public_chat_messages'
        },
        async (payload) => {
          const { data: userData } = await supabase
            .from('user_profiles')
            .select('user_id, email, display_name')
            .eq('user_id', payload.new.user_id)
            .maybeSingle();

          setPublicMessages((prev) => [...prev, {
            ...payload.new as Message,
            user_profiles: userData || undefined
          }]);
        }
      )
      .subscribe();
  };

  const subscribeToPrivateMessages = (conversationId: string) => {
    privateChannelRef.current = supabase
      .channel(`private-messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'private_messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        async (payload) => {
          const { data: userData } = await supabase
            .from('user_profiles')
            .select('user_id, email, display_name')
            .eq('user_id', payload.new.sender_id)
            .maybeSingle();

          setPrivateMessages((prev) => [...prev, {
            ...payload.new as PrivateMessage,
            sender: userData || undefined
          }]);

          if (payload.new.recipient_id === user?.id) {
            markMessagesAsRead(conversationId);
          }
        }
      )
      .subscribe();
  };

  const sendPublicMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const { error } = await supabase
        .from('public_chat_messages')
        .insert({
          user_id: user?.id,
          content: newMessage.trim()
        });

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const sendPrivateMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const recipientId = selectedConversation.participant_1_id === user?.id
        ? selectedConversation.participant_2_id
        : selectedConversation.participant_1_id;

      const { error } = await supabase
        .from('private_messages')
        .insert({
          conversation_id: selectedConversation.id,
          sender_id: user?.id,
          recipient_id: recipientId,
          content: newMessage.trim()
        });

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending private message:', error);
    }
  };

  const startConversation = async (otherUser: UserProfile) => {
    try {
      const participant1 = user!.id < otherUser.user_id ? user!.id : otherUser.user_id;
      const participant2 = user!.id < otherUser.user_id ? otherUser.user_id : user!.id;

      const { data: existing } = await supabase
        .from('conversations')
        .select('*')
        .eq('participant_1_id', participant1)
        .eq('participant_2_id', participant2)
        .maybeSingle();

      if (existing) {
        const conv: Conversation = {
          ...existing,
          other_user: otherUser
        };
        setSelectedConversation(conv);
        setShowUserList(false);
        return;
      }

      const { data, error } = await supabase
        .from('conversations')
        .insert({
          participant_1_id: participant1,
          participant_2_id: participant2
        })
        .select()
        .single();

      if (error) throw error;

      const conv: Conversation = {
        ...data,
        other_user: otherUser
      };

      setSelectedConversation(conv);
      setConversations(prev => [conv, ...prev]);
      setShowUserList(false);
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  const filteredUsers = users.filter(u =>
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getDisplayName = (profile?: UserProfile) => {
    if (!profile) return 'Unknown User';
    return profile.display_name || profile.email;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Community Chat</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Connect with fellow poets in real-time
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
        <div className="flex h-full">
          {activeTab === 'private' && !selectedConversation && (
            <div className="w-80 border-r border-slate-200 dark:border-slate-700 flex flex-col">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Conversations</h3>
                <button
                  onClick={() => setShowUserList(true)}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle size={18} />
                  New Message
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="p-8 text-center">
                    <MessageCircle className="mx-auto text-slate-400 dark:text-slate-600 mb-3" size={48} />
                    <p className="text-slate-600 dark:text-slate-400 mb-4">No conversations yet</p>
                    <button
                      onClick={() => setShowUserList(true)}
                      className="text-blue-500 hover:text-blue-600 font-medium"
                    >
                      Start a conversation
                    </button>
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv)}
                      className="w-full p-4 border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-slate-900 dark:text-white truncate">
                          {getDisplayName(conv.other_user)}
                        </p>
                        {(conv.unread_count || 0) > 0 && (
                          <span className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {formatTime(conv.last_message_at)}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              {activeTab === 'private' && selectedConversation ? (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <ChevronLeft size={20} className="text-slate-600 dark:text-slate-400" />
                  </button>
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {getDisplayName(selectedConversation.other_user)}
                  </h3>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setActiveTab('public');
                      setSelectedConversation(null);
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeTab === 'public'
                        ? 'bg-blue-500 text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Users size={18} />
                      Public Room
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('private')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeTab === 'private'
                        ? 'bg-blue-500 text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <MessageCircle size={18} />
                      Private Messages
                      {conversations.reduce((acc, c) => acc + (c.unread_count || 0), 0) > 0 && (
                        <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                          {conversations.reduce((acc, c) => acc + (c.unread_count || 0), 0)}
                        </span>
                      )}
                    </div>
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeTab === 'public' ? (
                publicMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.user_id === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-md px-4 py-2 rounded-lg ${
                        message.user_id === user?.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'
                      }`}
                    >
                      {message.user_id !== user?.id && (
                        <p className="text-xs font-medium mb-1 opacity-70">
                          {getDisplayName(message.user_profiles)}
                        </p>
                      )}
                      <p className="break-words">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.user_id === user?.id ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'
                      }`}>
                        {formatTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              ) : selectedConversation ? (
                privateMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-md px-4 py-2 rounded-lg ${
                        message.sender_id === user?.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'
                      }`}
                    >
                      <p className="break-words">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender_id === user?.id ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'
                      }`}>
                        {formatTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              ) : null}
              <div ref={messagesEndRef} />
            </div>

            {(activeTab === 'public' || selectedConversation) && (
              <form
                onSubmit={activeTab === 'public' ? sendPublicMessage : sendPrivateMessage}
                className="p-4 border-t border-slate-200 dark:border-slate-700"
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    <Send size={18} />
                    Send
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {showUserList && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full max-h-[600px] flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">New Message</h3>
              <button
                onClick={() => setShowUserList(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-600 dark:text-slate-400" />
              </button>
            </div>
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredUsers.length === 0 ? (
                <div className="p-8 text-center text-slate-600 dark:text-slate-400">
                  No users found
                </div>
              ) : (
                filteredUsers.map((u) => (
                  <button
                    key={u.user_id}
                    onClick={() => startConversation(u)}
                    className="w-full p-4 border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                  >
                    <p className="font-medium text-slate-900 dark:text-white">{getDisplayName(u)}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{u.email}</p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
