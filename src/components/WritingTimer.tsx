import { useState, useEffect, useRef } from 'react';
import { Timer, Play, Pause, RotateCcw, Coffee } from 'lucide-react';

export default function WritingTimer() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [sessionType, setSessionType] = useState<'work' | 'break'>('work');
  const [completedSessions, setCompletedSessions] = useState(0);
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

  const handleTimerComplete = () => {
    setIsActive(false);
    if (sessionType === 'work') {
      setCompletedSessions(completedSessions + 1);
      setSessionType('break');
      setMinutes(5);
      setSeconds(0);
      new Notification('Writing session complete!', {
        body: 'Time for a 5-minute break'
      });
    } else {
      setSessionType('work');
      setMinutes(25);
      setSeconds(0);
      new Notification('Break complete!', {
        body: 'Ready for another writing session?'
      });
    }
  };

  const toggleTimer = () => {
    if (!isActive && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
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

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <Timer className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Writing Timer
        </h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center mb-8">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 ${
            sessionType === 'work'
              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
              : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
          }`}>
            {sessionType === 'work' ? (
              <>
                <Timer className="w-4 h-4" />
                <span className="font-medium">Writing Session</span>
              </>
            ) : (
              <>
                <Coffee className="w-4 h-4" />
                <span className="font-medium">Break Time</span>
              </>
            )}
          </div>

          <div className="text-8xl font-bold text-gray-900 dark:text-white mb-8 font-mono">
            {formatTime(minutes, seconds)}
          </div>

          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={toggleTimer}
              className="px-8 py-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 text-lg font-medium"
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
              className="px-8 py-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-2 text-lg font-medium"
            >
              <RotateCcw className="w-6 h-6" />
              Reset
            </button>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {presets.map(preset => (
              <button
                key={preset.value}
                onClick={() => setPreset(preset.value)}
                className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {completedSessions}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Sessions Completed Today
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-4">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
          Pomodoro Technique
        </h3>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Work in focused 25-minute sessions followed by 5-minute breaks. After 4 sessions, take a longer 15-30 minute break. This technique helps maintain focus and prevents burnout.
        </p>
      </div>
    </div>
  );
}
