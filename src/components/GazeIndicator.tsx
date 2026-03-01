import { useEffect, useState } from 'react';
import { eyeTrackingManager, GazePoint } from '@/utils/eyeTracking';

export default function GazeIndicator() {
  const [gazePoint, setGazePoint] = useState<GazePoint | null>(null);
  const [dwellProgress, setDwellProgress] = useState(0);
  const config = eyeTrackingManager.getConfig();

  useEffect(() => {
    if (!config.enabled || !config.showGazeIndicator) {
      return;
    }

    const unsubscribeGaze = eyeTrackingManager.onGaze((point) => {
      setGazePoint(point);
    });

    const unsubscribeDwell = eyeTrackingManager.onDwell(() => {
      setDwellProgress(0);
    });

    const interval = setInterval(() => {
      const currentGaze = eyeTrackingManager.getCurrentGaze();
      if (currentGaze && config.enableDwellClick) {
        const element = document.elementFromPoint(currentGaze.x, currentGaze.y) as HTMLElement;
        if (element && isClickableElement(element)) {
          setDwellProgress((prev) => Math.min(prev + (100 / (config.dwellTime / 100)), 100));
        } else {
          setDwellProgress(0);
        }
      } else {
        setDwellProgress(0);
      }
    }, 100);

    return () => {
      unsubscribeGaze();
      unsubscribeDwell();
      clearInterval(interval);
    };
  }, [config.enabled, config.showGazeIndicator, config.enableDwellClick, config.dwellTime]);

  const isClickableElement = (element: HTMLElement): boolean => {
    const tagName = element.tagName.toLowerCase();
    return (
      tagName === 'button' ||
      tagName === 'a' ||
      tagName === 'input' ||
      tagName === 'textarea' ||
      element.onclick !== null ||
      element.getAttribute('role') === 'button' ||
      element.classList.contains('clickable')
    );
  };

  if (!config.enabled || !config.showGazeIndicator || !gazePoint) {
    return null;
  }

  const opacity = Math.min(gazePoint.confidence, 0.9);
  const size = 24 + (gazePoint.confidence * 16);

  return (
    <>
      <div
        className="fixed pointer-events-none z-[9999] transition-all duration-75"
        style={{
          left: `${gazePoint.x}px`,
          top: `${gazePoint.y}px`,
          transform: 'translate(-50%, -50%)',
          opacity
        }}
      >
        <div
          className="relative rounded-full border-2 border-blue-500 bg-blue-500/20"
          style={{
            width: `${size}px`,
            height: `${size}px`
          }}
        >
          <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping" />

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
          </div>

          {dwellProgress > 0 && config.enableDwellClick && (
            <svg
              className="absolute inset-0 -rotate-90"
              style={{ width: `${size}px`, height: `${size}px` }}
            >
              <circle
                cx={size / 2}
                cy={size / 2}
                r={(size / 2) - 2}
                stroke="#8b5cf6"
                strokeWidth="3"
                fill="none"
                strokeDasharray={`${2 * Math.PI * ((size / 2) - 2)}`}
                strokeDashoffset={`${2 * Math.PI * ((size / 2) - 2) * (1 - dwellProgress / 100)}`}
                className="transition-all duration-100"
              />
            </svg>
          )}
        </div>
      </div>

      <div className="fixed top-4 left-4 z-[9998] pointer-events-none bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-slate-900 dark:text-white font-medium">Eye Tracking Active</span>
        </div>
        <div className="flex gap-3 mt-1 text-xs text-slate-600 dark:text-slate-400">
          <span>X: {Math.round(gazePoint.x)}</span>
          <span>Y: {Math.round(gazePoint.y)}</span>
          <span>Confidence: {Math.round(gazePoint.confidence * 100)}%</span>
        </div>
      </div>

      <style>{`
        @keyframes pulse-ring {
          0% {
            transform: scale(0.95);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.7;
          }
          100% {
            transform: scale(0.95);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}
