import { useEffect, useState } from 'react';
import { handGestureManager, GestureEvent, GestureType } from '@/utils/handGestures';

const gestureEmojis: Record<GestureType, string> = {
  fist: '✊',
  open_palm: '✋',
  thumbs_up: '👍',
  thumbs_down: '👎',
  peace: '✌️',
  pointing: '☝️',
  swipe_left: '👈',
  swipe_right: '👉',
  swipe_up: '👆',
  swipe_down: '👇',
  pinch: '🤏',
  none: ''
};

const gestureNames: Record<GestureType, string> = {
  fist: 'Fist',
  open_palm: 'Open Palm',
  thumbs_up: 'Thumbs Up',
  thumbs_down: 'Thumbs Down',
  peace: 'Peace Sign',
  pointing: 'Pointing',
  swipe_left: 'Swipe Left',
  swipe_right: 'Swipe Right',
  swipe_up: 'Swipe Up',
  swipe_down: 'Swipe Down',
  pinch: 'Pinch',
  none: ''
};

export default function GestureFeedback() {
  const [currentGesture, setCurrentGesture] = useState<GestureEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    const config = handGestureManager.getConfig();
    setEnabled(config.enabled);
    setShowFeedback(config.showVisualFeedback);
  }, []);

  useEffect(() => {
    if (!enabled || !showFeedback) {
      setIsVisible(false);
      setCurrentGesture(null);
      return;
    }

    const unsubscribe = handGestureManager.onGesture((event) => {
      setCurrentGesture(event);
      setIsVisible(true);

      // Hide after animation
      setTimeout(() => {
        setIsVisible(false);
      }, 1500);
    });

    return unsubscribe;
  }, [enabled, showFeedback]);

  if (!enabled || !showFeedback || !currentGesture || !isVisible) {
    return null;
  }

  const emoji = gestureEmojis[currentGesture.gesture];
  const name = gestureNames[currentGesture.gesture];
  const action = handGestureManager.getGestureMapping(currentGesture.gesture);

  return (
    <>
      {/* Top-right corner indicator */}
      <div
        className="fixed top-4 right-4 z-[9999] pointer-events-none"
        style={{
          animation: 'gestureSlideIn 0.3s ease-out, gestureFadeOut 0.3s ease-out 1.2s forwards'
        }}
      >
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border-2 border-purple-500 dark:border-purple-400 p-4 min-w-[200px]">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{emoji}</div>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-900 dark:text-white">{name}</p>
              {action && (
                <p className="text-xs text-slate-600 dark:text-slate-400 capitalize">
                  {action.replace('_', ' ')}
                </p>
              )}
              <div className="flex items-center gap-2 mt-1">
                <div className={`text-xs px-2 py-0.5 rounded-full ${
                  currentGesture.hand === 'left'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                }`}>
                  {currentGesture.hand}
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-1 h-1 rounded-full ${
                        i < Math.floor(currentGesture.confidence * 5)
                          ? 'bg-purple-500'
                          : 'bg-slate-300 dark:bg-slate-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Center screen flash for important actions */}
      {['click', 'back', 'forward'].includes(action || '') && (
        <div
          className="fixed inset-0 z-[9998] pointer-events-none flex items-center justify-center"
          style={{
            animation: 'gesturePulse 0.6s ease-out'
          }}
        >
          <div className="text-9xl opacity-0" style={{
            animation: 'gestureZoomFade 0.6s ease-out'
          }}>
            {emoji}
          </div>
        </div>
      )}

      <style>{`
        @keyframes gestureSlideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes gestureFadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }

        @keyframes gesturePulse {
          0% {
            background-color: rgba(147, 51, 234, 0);
          }
          50% {
            background-color: rgba(147, 51, 234, 0.1);
          }
          100% {
            background-color: rgba(147, 51, 234, 0);
          }
        }

        @keyframes gestureZoomFade {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}
