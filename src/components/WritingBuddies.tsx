import { useState, useEffect } from 'react';
import { UserCheck, Plus, MessageCircle, Target } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Buddy {
  id: string;
  name: string;
  bio: string;
  goals: string[];
  avatar?: string;
}

export default function WritingBuddies() {
  const { user } = useAuth();
  const [buddies, setBuddies] = useState<Buddy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBuddies();
    }
  }, [user]);

  const fetchBuddies = async () => {
    try {
      setBuddies([
        {
          id: '1',
          name: 'Sample Buddy',
          bio: 'Poetry enthusiast focused on nature themes',
          goals: ['Write daily', 'Complete a chapbook'],
        },
      ]);
    } catch (error) {
      console.error('Error fetching buddies:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">Loading buddies...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Writing Buddies</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Connect with fellow poets for mutual support and accountability
        </p>
      </div>

      <button className="mb-6 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
        <Plus className="w-4 h-4" />
        Find Writing Buddy
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {buddies.map((buddy) => (
          <div
            key={buddy.id}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:border-primary transition-all hover:shadow-lg"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold">
                {buddy.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{buddy.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{buddy.bio}</p>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                <Target className="w-4 h-4" />
                Goals
              </h4>
              <div className="space-y-1">
                {buddy.goals.map((goal, index) => (
                  <div key={index} className="text-sm text-gray-600 dark:text-gray-400">
                    • {goal}
                  </div>
                ))}
              </div>
            </div>

            <button className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Connect
            </button>
          </div>
        ))}
      </div>

      {buddies.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No writing buddies yet. Find someone to share your journey!
        </div>
      )}

      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <UserCheck className="w-5 h-5" />
          Benefits of Writing Buddies
        </h3>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• Stay accountable to your writing goals</li>
          <li>• Share feedback and encouragement</li>
          <li>• Overcome writer's block together</li>
          <li>• Build lasting creative friendships</li>
        </ul>
      </div>
    </div>
  );
}
