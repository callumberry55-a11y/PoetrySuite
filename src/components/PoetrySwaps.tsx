import { useState, useEffect } from 'react';
import { RefreshCw, Send, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Swap {
  id: string;
  partner_name: string;
  status: 'pending' | 'active' | 'completed';
  your_poem?: string;
  partner_poem?: string;
  created_at: string;
}

export default function PoetrySwaps() {
  const { user } = useAuth();
  const [swaps, setSwaps] = useState<Swap[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSwaps();
    }
  }, [user]);

  const fetchSwaps = async () => {
    try {
      setSwaps([
        {
          id: '1',
          partner_name: 'Sample User',
          status: 'pending',
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error('Error fetching swaps:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-500';
      case 'active':
        return 'text-blue-500';
      case 'completed':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return Clock;
      case 'active':
        return RefreshCw;
      case 'completed':
        return CheckCircle;
      default:
        return Clock;
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">Loading swaps...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Poetry Swaps</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Exchange poems with other poets for feedback and inspiration
        </p>
      </div>

      <button className="mb-6 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
        <RefreshCw className="w-4 h-4" />
        Find Swap Partner
      </button>

      <div className="space-y-4">
        {swaps.map((swap) => {
          const StatusIcon = getStatusIcon(swap.status);
          return (
            <div
              key={swap.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold mb-1">
                    Swap with {swap.partner_name}
                  </h3>
                  <div className={`flex items-center gap-2 text-sm ${getStatusColor(swap.status)}`}>
                    <StatusIcon className="w-4 h-4" />
                    <span className="capitalize">{swap.status}</span>
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(swap.created_at).toLocaleDateString()}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 text-sm">Your Poem</h4>
                  {swap.your_poem ? (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {swap.your_poem}
                    </p>
                  ) : (
                    <button className="text-sm text-primary hover:underline flex items-center gap-1">
                      <Send className="w-4 h-4" />
                      Submit your poem
                    </button>
                  )}
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 text-sm">Partner's Poem</h4>
                  {swap.partner_poem ? (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {swap.partner_poem}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Waiting for partner...
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {swaps.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No active swaps. Find a partner to get started!
        </div>
      )}

      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold mb-2">How Poetry Swaps Work</h3>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• Get matched with another poet</li>
          <li>• Exchange poems with each other</li>
          <li>• Provide thoughtful feedback</li>
          <li>• Build connections in the poetry community</li>
        </ul>
      </div>
    </div>
  );
}
