import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Activity {
  date: string;
  poems: number;
  words: number;
}

export default function WritingCalendar() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activity, setActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchActivity();
    }
  }, [user, currentDate]);

  const fetchActivity = async () => {
    try {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const { data, error } = await supabase
        .from('poems')
        .select('created_at, word_count')
        .eq('user_id', user?.id)
        .gte('created_at', startOfMonth.toISOString())
        .lte('created_at', endOfMonth.toISOString());

      if (error) throw error;

      const activityMap = new Map<string, Activity>();

      data?.forEach((poem) => {
        const date = new Date(poem.created_at).toISOString().split('T')[0];
        const existing = activityMap.get(date) || { date, poems: 0, words: 0 };
        activityMap.set(date, {
          date,
          poems: existing.poems + 1,
          words: existing.words + (poem.word_count || 0),
        });
      });

      setActivity(Array.from(activityMap.values()));
    } catch (error) {
      console.error('Error fetching activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const getActivityForDate = (day: number): Activity | null => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      .toISOString()
      .split('T')[0];
    return activity.find((a) => a.date === date) || null;
  };

  const getActivityColor = (activity: Activity | null): string => {
    if (!activity || activity.poems === 0) return 'bg-gray-100 dark:bg-gray-800';
    if (activity.poems === 1) return 'bg-green-200 dark:bg-green-900';
    if (activity.poems === 2) return 'bg-green-400 dark:bg-green-700';
    return 'bg-green-600 dark:bg-green-500';
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth();
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const totalPoems = activity.reduce((sum, a) => sum + a.poems, 0);
  const totalWords = activity.reduce((sum, a) => sum + a.words, 0);
  const activeDays = activity.filter((a) => a.poems > 0).length;

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Writing Calendar</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your writing activity and build consistency
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-3xl font-bold text-blue-500 mb-1">{totalPoems}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Poems This Month</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-3xl font-bold text-green-500 mb-1">{totalWords.toLocaleString()}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Words Written</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-3xl font-bold text-purple-500 mb-1">{activeDays}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Active Days</div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">{monthName}</h2>
          <div className="flex gap-2">
            <button
              onClick={previousMonth}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center font-semibold text-sm text-gray-600 dark:text-gray-400 py-2">
              {day}
            </div>
          ))}

          {Array.from({ length: startingDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayActivity = getActivityForDate(day);
            const isToday =
              day === new Date().getDate() &&
              currentDate.getMonth() === new Date().getMonth() &&
              currentDate.getFullYear() === new Date().getFullYear();

            return (
              <div
                key={day}
                className={`aspect-square rounded-lg border-2 flex flex-col items-center justify-center transition-all hover:scale-105 cursor-pointer ${
                  isToday ? 'border-blue-500' : 'border-transparent'
                } ${getActivityColor(dayActivity)}`}
                title={
                  dayActivity
                    ? `${dayActivity.poems} ${dayActivity.poems === 1 ? 'poem' : 'poems'}, ${dayActivity.words} words`
                    : 'No activity'
                }
              >
                <div className="text-sm font-semibold">{day}</div>
                {dayActivity && dayActivity.poems > 0 && (
                  <div className="text-xs mt-1">{dayActivity.poems}</div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-100 dark:bg-gray-800" />
            <span className="text-gray-600 dark:text-gray-400">No activity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-200 dark:bg-green-900" />
            <span className="text-gray-600 dark:text-gray-400">1 poem</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-400 dark:bg-green-700" />
            <span className="text-gray-600 dark:text-gray-400">2 poems</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-600 dark:bg-green-500" />
            <span className="text-gray-600 dark:text-gray-400">3+ poems</span>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" />
          Build Your Writing Habit
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Consistency is key! Try to write something every day, even if it's just a few lines. Watch your calendar fill up with activity as you develop your writing practice.
        </p>
      </div>
    </div>
  );
}
