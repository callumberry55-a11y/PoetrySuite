import { useState, useEffect } from 'react';
import { MessageCircle, Users, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Circle {
  id: string;
  name: string;
  description: string;
  member_count: number;
  focus: string;
}

export default function CritiqueCircles() {
  const { user } = useAuth();
  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCircles();
    }
  }, [user]);

  const fetchCircles = async () => {
    try {
      setCircles([
        {
          id: '1',
          name: 'Modern Poetry Circle',
          description: 'Focus on contemporary poetry forms and techniques',
          member_count: 12,
          focus: 'Modern Poetry',
        },
        {
          id: '2',
          name: 'Sonnet Society',
          description: 'Dedicated to traditional forms and meter',
          member_count: 8,
          focus: 'Traditional Forms',
        },
      ]);
    } catch (error) {
      console.error('Error fetching circles:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">Loading circles...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Critique Circles</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Join groups for structured peer feedback and improvement
        </p>
      </div>

      <button className="mb-6 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
        <Plus className="w-4 h-4" />
        Create Circle
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {circles.map((circle) => (
          <div
            key={circle.id}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:border-primary transition-all hover:shadow-lg"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">{circle.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {circle.description}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <Users className="w-4 h-4" />
                    {circle.member_count} members
                  </span>
                  <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-semibold">
                    {circle.focus}
                  </span>
                </div>
              </div>
              <MessageCircle className="w-8 h-8 text-primary" />
            </div>

            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                Join Circle
              </button>
              <button className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {circles.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No critique circles yet. Create the first one!
        </div>
      )}

      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold mb-2">Circle Guidelines</h3>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• Be respectful and constructive in your feedback</li>
          <li>• Share work regularly to get the most value</li>
          <li>• Offer specific, actionable suggestions</li>
          <li>• Remember: critique is about improvement, not criticism</li>
        </ul>
      </div>
    </div>
  );
}
