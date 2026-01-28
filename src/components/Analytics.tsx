import { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from "firebase/firestore"; 
import { TrendingUp, BookOpen, Feather, Calendar, Flame } from 'lucide-react';

interface WritingStats {
  date: string;
  poems_written: number;
  words_written: number;
  minutes_writing: number;
}

interface Poem {
    created_at: string;
    word_count?: number;
}

function Analytics() {
  const { user } = useAuth();
  const [stats, setStats] = useState<WritingStats[]>([]);
  const [totalPoems, setTotalPoems] = useState(0);
  const [totalWords, setTotalWords] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);

  const calculateStreaks = useCallback((poems: Poem[]) => {
    if (poems.length === 0) {
      setCurrentStreak(0);
      setLongestStreak(0);
      return;
    }

    const uniqueDates = Array.from(
      new Set(poems.map(p => new Date(p.created_at).toDateString()))
    ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let current = 0;
    const checkDate = new Date(today);

    for (const dateStr of uniqueDates) {
      const poemDate = new Date(dateStr);
      poemDate.setHours(0, 0, 0, 0);

      if (poemDate.getTime() === checkDate.getTime()) {
        current++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    let longest = 0;
    let tempStreak = 1;

    for (let i = 0; i < uniqueDates.length - 1; i++) {
      const currentDate = new Date(uniqueDates[i]);
      const nextDate = new Date(uniqueDates[i + 1]);
      currentDate.setHours(0, 0, 0, 0);
      nextDate.setHours(0, 0, 0, 0);

      const dayDiff = Math.floor(
        (currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (dayDiff === 1) {
        tempStreak++;
      } else {
        longest = Math.max(longest, tempStreak);
        tempStreak = 1;
      }
    }

    longest = Math.max(longest, tempStreak, current);

    setCurrentStreak(current);
    setLongestStreak(longest);
  }, []);

  useEffect(() => {
    const loadStats = async () => {
      if (!user?.id) return;

      const poemsRef = collection(db, "poems");
      const q = query(poemsRef, where("user_id", "==", user.id), orderBy("created_at", "desc"));
      const querySnapshot = await getDocs(q);
      const poems = querySnapshot.docs.map(doc => doc.data());

      const poemData: Poem[] = poems as Poem[] || [];

      setTotalPoems(poemData.length);
      setTotalWords(poemData.reduce((sum, poem) => sum + (poem.word_count || 0), 0));

      calculateStreaks(poemData);

      const dailyStats: { [key: string]: WritingStats } = {};

      poemData.forEach(poem => {
        const dateStr = new Date(poem.created_at).toISOString().split('T')[0];

        if (!dailyStats[dateStr]) {
          dailyStats[dateStr] = {
            date: dateStr,
            poems_written: 0,
            words_written: 0,
            minutes_writing: 0,
          };
        }

        dailyStats[dateStr].poems_written++;
        dailyStats[dateStr].words_written += poem.word_count || 0;
        dailyStats[dateStr].minutes_writing += Math.ceil((poem.word_count || 0) / 50);
      });

      const statsArray = Object.values(dailyStats)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 30);

      setStats(statsArray);
    };

    if (user) {
      loadStats();
    }
  }, [user, calculateStreaks]);

  const last7Days = useMemo(() => stats.slice(0, 7).reverse(), [stats]);

  const totalWordsLast7Days = useMemo(() => {
    return last7Days.reduce((sum, stat) => sum + stat.words_written, 0);
  }, [last7Days]);

  const totalPoemsLast7Days = useMemo(() => {
    return last7Days.reduce((sum, stat) => sum + stat.poems_written, 0);
  }, [last7Days]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex-1">
      <h2 className="text-3xl font-bold text-on-surface mb-8">Your Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-surface rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center">
              <BookOpen className="text-on-primary-container" size={24} />
            </div>
          </div>
          <p className="text-3xl font-bold text-on-surface mb-1">{totalPoems}</p>
          <p className="text-sm text-on-surface-variant">Total Poems</p>
        </div>

        <div className="bg-surface rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-tertiary-container flex items-center justify-center">
              <Feather className="text-on-tertiary-container" size={24} />
            </div>
          </div>
          <p className="text-3xl font-bold text-on-surface mb-1">
            {totalWords.toLocaleString()}
          </p>
          <p className="text-sm text-on-surface-variant">Total Words</p>
        </div>

        <div className="bg-surface rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-error-container flex items-center justify-center">
              <Flame className="text-on-error-container" size={24} />
            </div>
          </div>
          <p className="text-3xl font-bold text-on-surface mb-1">{currentStreak}</p>
          <p className="text-sm text-on-surface-variant">Day Streak</p>
        </div>

        <div className="bg-surface rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center">
              <TrendingUp className="text-on-secondary-container" size={24} />
            </div>
          </div>
          <p className="text-3xl font-bold text-on-surface mb-1">{longestStreak}</p>
          <p className="text-sm text-on-surface-variant">Longest Streak</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-surface rounded-xl p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-on-surface mb-6">
            Last 7 Days Activity
          </h3>
          <div className="space-y-4">
            {last7Days.length === 0 ? (
              <p className="text-on-surface-variant text-center py-8">
                No activity in the last 7 days
              </p>
            ) : (
              last7Days.map((stat) => {
                const date = new Date(stat.date);
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                return (
                  <div
                    key={stat.date}
                    className="flex items-center justify-between py-3 border-b border-outline last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
                        <Calendar className="text-on-primary-container" size={18} />
                      </div>
                      <div>
                        <p className="font-medium text-on-surface">
                          {dayName}, {dateStr}
                        </p>
                        <p className="text-sm text-on-surface-variant">
                          {stat.poems_written} poems, {stat.words_written} words
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-on-surface-variant">
                      {stat.minutes_writing} min
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-surface rounded-xl p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-on-surface mb-6">
            Weekly Summary
          </h3>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-on-surface-variant">
                  Poems Written
                </span>
                <span className="text-2xl font-bold text-on-surface">
                  {totalPoemsLast7Days}
                </span>
              </div>
              <div className="w-full bg-surface-variant rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${Math.min((totalPoemsLast7Days / 7) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-on-surface-variant">
                  Words Written
                </span>
                <span className="text-2xl font-bold text-on-surface">
                  {totalWordsLast7Days.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-surface-variant rounded-full h-2">
                <div
                  className="bg-tertiary h-2 rounded-full transition-all"
                  style={{ width: `${Math.min((totalWordsLast7Days / 1000) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-outline">
              <p className="text-sm text-on-surface-variant mb-2">
                Average per day (last 7 days)
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold text-on-surface">
                    {(totalPoemsLast7Days / 7).toFixed(1)}
                  </p>
                  <p className="text-xs text-on-surface-variant">poems/day</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-on-surface">
                    {Math.round(totalWordsLast7Days / 7)}
                  </p>
                  <p className="text-xs text-on-surface-variant">words/day</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(Analytics);
