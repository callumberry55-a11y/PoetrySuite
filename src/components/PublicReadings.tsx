import { useState, useEffect } from 'react';
import { Mic, Calendar, MapPin, Users, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Reading {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  host: string;
  attendees: number;
  max_attendees?: number;
}

export default function PublicReadings() {
  const { user } = useAuth();
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchReadings();
    }
  }, [user]);

  const fetchReadings = async () => {
    try {
      setReadings([
        {
          id: '1',
          title: 'Open Mic Night',
          description: 'Share your work in a supportive environment',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Virtual Event',
          host: 'Poetry Suite Community',
          attendees: 15,
          max_attendees: 30,
        },
      ]);
    } catch (error) {
      console.error('Error fetching readings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">Loading readings...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Public Readings</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Attend or host virtual poetry readings and open mics
        </p>
      </div>

      <button className="mb-6 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
        <Plus className="w-4 h-4" />
        Host a Reading
      </button>

      <div className="space-y-6">
        {readings.map((reading) => (
          <div
            key={reading.id}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:border-primary transition-all hover:shadow-lg"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-2xl font-semibold mb-2">{reading.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {reading.description}
                </p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    {new Date(reading.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4" />
                    {reading.location}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Users className="w-4 h-4" />
                    {reading.attendees}
                    {reading.max_attendees && ` / ${reading.max_attendees}`} attending
                  </div>
                </div>

                <div className="mt-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Hosted by <span className="font-semibold">{reading.host}</span>
                  </span>
                </div>
              </div>

              <Mic className="w-12 h-12 text-primary flex-shrink-0" />
            </div>

            <div className="flex gap-2">
              <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                Register
              </button>
              <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {readings.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No upcoming readings. Host one to get started!
        </div>
      )}

      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Mic className="w-5 h-5" />
          Reading Tips
        </h3>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• Practice reading your poem aloud beforehand</li>
          <li>• Speak clearly and at a comfortable pace</li>
          <li>• Consider the emotional arc of your reading</li>
          <li>• Be supportive of other readers</li>
        </ul>
      </div>
    </div>
  );
}
