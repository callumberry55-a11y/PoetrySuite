import { useState, useEffect, useRef } from 'react';
import { Timer, Play, Pause, RotateCcw, Coffee } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function WritingTimer() {
  const { user } = useAuth();
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [sessionType, setSessionType] = useState<'work' | 'break'>('work');
  const [completedSessions, setCompletedSessions] = useState(0);
  const [sessionDuration, setSessionDuration] = useState(25);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const presets = [
    { label: '5 min', value: 5 },
    { label: '15 min', value: 15 },
    { label: '25 min (Pomodoro)', value: 25 },
    { label: '45 min', value: 45 },
    { label: '60 min', value: 60 }
  ];

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            handleTimerComplete();
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, minutes, seconds]);

  const logWritingSession = async (minutesSpent: number) => {
    if (!user) return;

    try {
      await supabase.rpc('log_daily_writing', {
        p_user_id: user.id,
        p_word_count: 0,
        p_poems_written: 0,
        p_minutes_spent: minutesSpent
      });
    } catch (error) {
      console.error('Error logging writing session:', error);
    }
  };

  const handleTimerComplete = async () => {
    setIsActive(false);
    if (sessionType === 'work') {
      await logWritingSession(sessionDuration);

      setCompletedSessions(completedSessions + 1);
      setSessionType('break');
      setMinutes(5);
      setSeconds(0);

      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Writing session complete!', {
          body: 'Time for a 5-minute break'
        });
      }
    } else {
      setSessionType('work');
      setMinutes(25);
      setSeconds(0);
      setSessionDuration(25);

      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Break complete!', {
          body: 'Ready for another writing session?'
        });
      }
    }
  };

  const toggleTimer = () => {
    if (!isActive) {
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
      if (sessionType === 'work') {
        setSessionDuration(minutes + (seconds > 0 ? 1 : 0));
      }
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setMinutes(25);
    setSeconds(0);
    setSessionType('work');
  };

  const setPreset = (mins: number) => {
    setIsActive(false);
    setMinutes(mins);
    setSeconds(0);
    setSessionType('work');
  };

  const formatTime = (m: number, s: number) => {
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const totalSeconds = sessionType === 'work' ? sessionDuration * 60 : 5 * 60;
  const currentSeconds = minutes * 60 + seconds;
  const progressPercentage = ((totalSeconds - currentSeconds) / totalSeconds) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pb-24">
      <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 h-32 sm:h-40">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <Timer className="w-10 h-10 sm:w-12 sm:h-12 mb-2 animate-pulse" />
          <h1 className="text-2xl sm:text-4xl font-bold mb-1">Writing Timer</h1>
          <p className="text-sm sm:text-base opacity-90">Focus your creative energy</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-8 space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-8">
          <div className="text-center mb-8">
            <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl mb-8 shadow-lg font-semibold ${
              sessionType === 'work'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
            }`}>
              {sessionType === 'work' ? (
                <>
                  <Timer className="w-5 h-5" />
                  <span>Writing Session</span>
                </>
              ) : (
                <>
                  <Coffee className="w-5 h-5" />
                  <span>Break Time</span>
                </>
              )}
            </div>

            <div className="relative inline-block mb-10">
              <svg className="w-72 h-72" viewBox="0 0 200 200">
                <circle
                  cx="100"
                  cy="100"
                  r="85"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-slate-200 dark:text-slate-800"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="85"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 85}`}
                  strokeDashoffset={`${2 * Math.PI * 85 * (1 - progressPercentage / 100)}`}
                  className="transition-all duration-1000"
                  transform="rotate(-90 100 100)"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={sessionType === 'work' ? '#10b981' : '#3b82f6'} />
                    <stop offset="100%" stopColor={sessionType === 'work' ? '#14b8a6' : '#06b6d4'} />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`text-7xl font-bold font-mono transition-all ${
                  isActive ? 'scale-110' : 'scale-100'
                } ${
                  sessionType === 'work'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600'
                    : 'bg-gradient-to-r from-blue-600 to-cyan-600'
                } bg-clip-text text-transparent`}>
                  {formatTime(minutes, seconds)}
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4 mb-8">
              <button
                onClick={toggleTimer}
                className={`px-10 py-4 text-white rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-3 ${
                  sessionType === 'work'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600'
                    : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600'
                }`}
              >
                {isActive ? (
                  <>
                    <Pause className="w-6 h-6" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-6 h-6" />
                    Start
                  </>
                )}
              </button>
              <button
                onClick={resetTimer}
                className="px-10 py-4 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl hover:bg-slate-300 dark:hover:bg-slate-700 font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3"
              >
                <RotateCcw className="w-6 h-6" />
                Reset
              </button>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {presets.map(preset => (
                <button
                  key={preset.value}
                  onClick={() => setPreset(preset.value)}
                  disabled={isActive}
                  className="px-4 py-2 text-sm bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:from-emerald-100 hover:to-teal-100 dark:hover:from-emerald-900/30 dark:hover:to-teal-900/30 hover:text-emerald-700 dark:hover:text-emerald-300 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed border border-slate-300 dark:border-slate-600"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-8 mt-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center gap-4 px-8 py-4 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-2xl border-2 border-amber-200 dark:border-amber-800">
                <div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                    {completedSessions}
                  </div>
                  <div className="text-sm text-amber-700 dark:text-amber-300 font-semibold">
                    Sessions Today
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-3xl border-2 border-blue-200 dark:border-blue-800 p-6 shadow-lg">
          <h3 className="font-bold text-lg text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
            <Coffee className="w-5 h-5" />
            Pomodoro Technique
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
            Work in focused 25-minute sessions followed by 5-minute breaks. After 4 sessions, take a longer 15-30 minute break. This technique helps maintain focus and prevents burnout.
          </p>
        </div>
      </div>
    </div>
  );
}
