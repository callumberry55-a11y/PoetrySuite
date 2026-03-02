import { useState, useEffect } from 'react';
import {
  Hand,
  Camera,
  AlertTriangle,
  Settings,
  Gauge,
  Clock,
  CheckCircle2,
  AlertCircle,
  Zap,
  Navigation,
  Sparkles
} from 'lucide-react';
import { handGestureManager, GestureType, GestureAction } from '@/utils/handGestures';
import { useToast } from '@/contexts/ToastContext';

const gestureIcons: Record<GestureType, string> = {
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
  none: '❓'
};

export default function HandGestureSettings() {
  const toast = useToast();
  const [config, setConfig] = useState(handGestureManager.getConfig());
  const [showWarning, setShowWarning] = useState(!config.enabled);
  const [isInitializing, setIsInitializing] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<'unknown' | 'granted' | 'denied'>('unknown');
  const [defaultActions] = useState<GestureAction[]>(handGestureManager.getDefaultActions());

  useEffect(() => {
    checkCameraPermission();
  }, []);

  const checkCameraPermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
      setCameraPermission(result.state === 'granted' ? 'granted' : result.state === 'denied' ? 'denied' : 'unknown');

      result.addEventListener('change', () => {
        setCameraPermission(result.state === 'granted' ? 'granted' : result.state === 'denied' ? 'denied' : 'unknown');
      });
    } catch (error) {
      setCameraPermission('unknown');
    }
  };

  const handleEnableToggle = async () => {
    if (!config.enabled) {
      setShowWarning(true);
    } else {
      handGestureManager.updateConfig({ enabled: false });
      setConfig(handGestureManager.getConfig());
      toast?.showToast('Hand gestures disabled', 'success');
    }
  };

  const handleAcceptWarning = async () => {
    setIsInitializing(true);
    setShowWarning(false);

    try {
      await handGestureManager.start();
      handGestureManager.updateConfig({ enabled: true });
      setConfig(handGestureManager.getConfig());
      toast?.showToast('Hand gestures enabled', 'success');
    } catch (error) {
      console.error('Failed to enable hand gestures:', error);
      toast?.showToast('Failed to enable hand gestures. Please check camera permissions.', 'error');
    } finally {
      setIsInitializing(false);
    }
  };

  const handleConfigChange = (key: keyof typeof config, value: number | boolean) => {
    const newConfig = { ...config, [key]: value };
    handGestureManager.updateConfig({ [key]: value });
    setConfig(newConfig);
  };

  const toggleGesture = (gesture: GestureType) => {
    const enabledGestures = config.enabledGestures.includes(gesture)
      ? config.enabledGestures.filter(g => g !== gesture)
      : [...config.enabledGestures, gesture];

    handGestureManager.updateConfig({ enabledGestures });
    setConfig({ ...config, enabledGestures });
  };

  if (showWarning) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
              <AlertTriangle size={32} className="text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">EXPERIMENTAL FEATURE WARNING</h2>
              <p className="text-sm text-red-600 dark:text-red-400 font-semibold">Read carefully before proceeding</p>
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-900/10 border-2 border-red-200 dark:border-red-800 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-bold text-red-900 dark:text-red-100 mb-4 flex items-center gap-2">
              <AlertCircle size={20} />
              Critical Safety Information
            </h3>

            <div className="space-y-3 text-sm text-red-800 dark:text-red-200">
              <div className="flex gap-3">
                <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                <p><strong>Experimental Technology:</strong> Hand gesture recognition uses AI for improved detection but is still in BETA. Not suitable for critical tasks.</p>
              </div>

              <div className="flex gap-3">
                <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                <p><strong>Camera Access:</strong> Requires continuous camera access. Video is processed locally and never transmitted.</p>
              </div>

              <div className="flex gap-3">
                <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                <p><strong>Performance Impact:</strong> Uses significant CPU and battery. May cause device heating or slowdowns.</p>
              </div>

              <div className="flex gap-3">
                <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                <p><strong>Accuracy Limitations:</strong> Affected by lighting, background, hand position, and skin tone. May not work for all users.</p>
              </div>

              <div className="flex gap-3">
                <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                <p><strong>False Positives:</strong> May detect unintended gestures causing unexpected actions like navigation or clicks.</p>
              </div>

              <div className="flex gap-3">
                <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                <p><strong>Physical Fatigue:</strong> Holding hands up for extended periods may cause arm or shoulder strain.</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
            <p className="text-sm text-amber-900 dark:text-amber-100">
              <strong>Recommendation:</strong> This feature is for testing and experimental accessibility research only. For production needs, use established assistive technologies.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowWarning(false)}
              className="flex-1 px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAcceptWarning}
              disabled={isInitializing}
              className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {isInitializing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  Initializing...
                </>
              ) : (
                <>
                  <AlertTriangle size={18} />
                  I Understand the Risks
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Hand size={24} className="text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Hand Gestures
              <Sparkles size={16} className="text-purple-500" />
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">AI-powered gesture controls</p>
          </div>
        </div>

        <button
          onClick={handleEnableToggle}
          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
            config.enabled
              ? 'bg-purple-600'
              : 'bg-slate-300 dark:bg-slate-600'
          }`}
        >
          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
              config.enabled ? 'translate-x-7' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {config.enabled && (
        <>
          <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
            <div className="flex gap-3">
              <Sparkles size={20} className="text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-purple-900 dark:text-purple-100">
                <p className="font-semibold mb-1">AI-Enhanced Gesture Recognition Active</p>
                <p>Using Google Gemini AI for improved gesture detection. Keep hands visible and well-lit for best results.</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-4">
                <Camera size={20} className="text-slate-600 dark:text-slate-400" />
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 dark:text-white">Camera Status</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {cameraPermission === 'granted' ? 'Access granted' :
                     cameraPermission === 'denied' ? 'Access denied' :
                     'Permission required'}
                  </p>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  cameraPermission === 'granted' ? 'bg-green-500' :
                  cameraPermission === 'denied' ? 'bg-red-500' :
                  'bg-amber-500'
                }`} />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-4">
              <div className="flex items-center gap-3">
                <Settings size={20} className="text-slate-600 dark:text-slate-400" />
                <h4 className="font-semibold text-slate-900 dark:text-white">Settings</h4>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Gauge size={16} />
                    Sensitivity
                  </label>
                  <span className="text-sm text-slate-600 dark:text-slate-400">{config.sensitivity.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={config.sensitivity}
                  onChange={(e) => handleConfigChange('sensitivity', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Clock size={16} />
                    Gesture Delay
                  </label>
                  <span className="text-sm text-slate-600 dark:text-slate-400">{config.gestureDelay}ms</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="2000"
                  step="100"
                  value={config.gestureDelay}
                  onChange={(e) => handleConfigChange('gestureDelay', parseInt(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Minimum time between gesture detections
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Zap size={16} />
                  Show Visual Feedback
                </label>
                <button
                  onClick={() => handleConfigChange('showVisualFeedback', !config.showVisualFeedback)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    config.showVisualFeedback
                      ? 'bg-purple-600'
                      : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      config.showVisualFeedback ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Navigation size={20} />
                Enabled Gestures
              </h4>

              <div className="grid grid-cols-2 gap-3">
                {defaultActions.map((action) => (
                  <button
                    key={action.gesture}
                    onClick={() => toggleGesture(action.gesture)}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      config.enabledGestures.includes(action.gesture)
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{gestureIcons[action.gesture]}</span>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-slate-900 dark:text-white capitalize">
                          {action.gesture.replace('_', ' ')}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {action.description}
                        </p>
                      </div>
                      {config.enabledGestures.includes(action.gesture) && (
                        <CheckCircle2 size={18} className="text-purple-600 dark:text-purple-400 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">Tips for Best Results</h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                <li className="flex gap-2">
                  <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" />
                  <span>Use in well-lit environment with even lighting</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" />
                  <span>Keep hands 30-50cm from camera</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" />
                  <span>Use plain background for better detection</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" />
                  <span>Make clear, deliberate gestures</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" />
                  <span>Take breaks to avoid arm fatigue</span>
                </li>
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
