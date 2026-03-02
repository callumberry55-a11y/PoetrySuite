import { useState, useEffect } from 'react';
import {
  Eye,
  Camera,
  AlertTriangle,
  Settings,
  Gauge,
  Clock,
  CheckCircle2,
  AlertCircle,
  Zap,
  Target,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { eyeTrackingManager } from '@/utils/eyeTracking';
import { useToast } from '@/contexts/ToastContext';

export default function EyeTrackingSettings() {
  const toast = useToast();
  const [config, setConfig] = useState(eyeTrackingManager.getConfig());
  const [showWarning, setShowWarning] = useState(!config.enabled);
  const [isInitializing, setIsInitializing] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<'unknown' | 'granted' | 'denied'>('unknown');
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationStep, setCalibrationStep] = useState(0);

  useEffect(() => {
    let permissionStatus: PermissionStatus | null = null;

    const checkCameraPermission = async () => {
      try {
        const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
        permissionStatus = result;
        setCameraPermission(result.state === 'granted' ? 'granted' : result.state === 'denied' ? 'denied' : 'unknown');

        const handleChange = () => {
          setCameraPermission(result.state === 'granted' ? 'granted' : result.state === 'denied' ? 'denied' : 'unknown');
        };

        result.addEventListener('change', handleChange);

        return () => {
          result.removeEventListener('change', handleChange);
        };
      } catch (error) {
        setCameraPermission('unknown');
      }
    };

    checkCameraPermission();

    return () => {
      if (permissionStatus) {
        permissionStatus.removeEventListener('change', () => {});
      }
    };
  }, []);

  const handleEnableToggle = async () => {
    if (!config.enabled) {
      setShowWarning(true);
    } else {
      eyeTrackingManager.updateConfig({ enabled: false });
      setConfig(eyeTrackingManager.getConfig());
      toast?.showToast('Eye tracking disabled', 'success');
    }
  };

  const handleAcceptWarning = async () => {
    setIsInitializing(true);
    setShowWarning(false);

    try {
      await eyeTrackingManager.start();
      eyeTrackingManager.updateConfig({ enabled: true });
      setConfig(eyeTrackingManager.getConfig());
      toast?.showToast('Eye tracking enabled', 'success');
    } catch (error) {
      console.error('Failed to enable eye tracking:', error);
      toast?.showToast('Failed to enable eye tracking. Please check camera permissions.', 'error');
    } finally {
      setIsInitializing(false);
    }
  };

  const handleConfigChange = (key: keyof typeof config, value: number | boolean) => {
    const newConfig = { ...config, [key]: value };
    eyeTrackingManager.updateConfig({ [key]: value });
    setConfig(newConfig);
  };

  const startCalibration = async () => {
    setIsCalibrating(true);
    setCalibrationStep(1);
    await eyeTrackingManager.startCalibration();
  };

  const calibratePoint = async (x: number, y: number) => {
    await eyeTrackingManager.addCalibrationPoint(x, y);

    setCalibrationStep((prevStep) => {
      if (prevStep < 5) {
        return prevStep + 1;
      } else {
        eyeTrackingManager.finishCalibration();
        setIsCalibrating(false);
        setConfig(eyeTrackingManager.getConfig());
        toast?.showToast('Calibration completed', 'success');
        return 0;
      }
    });
  };

  const calibrationPoints = [
    { x: Math.max(50, window.innerWidth * 0.1), y: Math.max(50, window.innerHeight * 0.1) },
    { x: Math.min(window.innerWidth - 50, window.innerWidth * 0.9), y: Math.max(50, window.innerHeight * 0.1) },
    { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5 },
    { x: Math.max(50, window.innerWidth * 0.1), y: Math.min(window.innerHeight - 50, window.innerHeight * 0.9) },
    { x: Math.min(window.innerWidth - 50, window.innerWidth * 0.9), y: Math.min(window.innerHeight - 50, window.innerHeight * 0.9) }
  ];

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
                <p><strong>Experimental Technology:</strong> Eye tracking uses AI for improved accuracy but is still in BETA. Not suitable for any critical tasks.</p>
              </div>

              <div className="flex gap-3">
                <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                <p><strong>Camera Access:</strong> Requires continuous camera access. Video is processed locally and never transmitted.</p>
              </div>

              <div className="flex gap-3">
                <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                <p><strong>Performance Impact:</strong> Uses very significant CPU and battery. Will cause device heating and slowdowns.</p>
              </div>

              <div className="flex gap-3">
                <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                <p><strong>Accuracy Limitations:</strong> Heavily affected by lighting, glasses, eye conditions, head position, and individual eye characteristics. May not work at all for many users.</p>
              </div>

              <div className="flex gap-3">
                <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                <p><strong>Eye Strain:</strong> Prolonged use may cause significant eye fatigue, headaches, and discomfort. Take frequent breaks.</p>
              </div>

              <div className="flex gap-3">
                <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                <p><strong>False Actions:</strong> May detect incorrect gaze positions causing unintended clicks, navigation, or scrolling.</p>
              </div>

              <div className="flex gap-3">
                <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                <p><strong>Privacy:</strong> While processing is local, continuous camera usage in public spaces may raise privacy concerns.</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
            <p className="text-sm text-amber-900 dark:text-amber-100">
              <strong>Recommendation:</strong> This feature is for experimental testing only. For production accessibility needs, use established assistive technologies or the hand gesture feature.
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

  if (isCalibrating) {
    const currentPoint = calibrationPoints[calibrationStep - 1];

    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
        <div className="text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Eye Tracking Calibration</h2>
          <p className="text-xl mb-8">Look at the target and keep your gaze steady</p>
          <p className="text-lg mb-4">Point {calibrationStep} of 5</p>

          <div
            className="fixed w-12 h-12 bg-purple-500 rounded-full border-4 border-white animate-pulse cursor-pointer"
            style={{
              left: `${currentPoint.x}px`,
              top: `${currentPoint.y}px`,
              transform: 'translate(-50%, -50%)'
            }}
            onClick={() => calibratePoint(currentPoint.x, currentPoint.y)}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full" />
            </div>
          </div>

          <button
            onClick={() => {
              setIsCalibrating(false);
              setCalibrationStep(0);
            }}
            className="mt-8 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold"
          >
            Cancel Calibration
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Eye size={24} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Eye Tracking
              <Sparkles size={16} className="text-blue-500" />
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">AI-powered gaze control</p>
          </div>
        </div>

        <button
          onClick={handleEnableToggle}
          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
            config.enabled
              ? 'bg-blue-600'
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
          <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <div className="flex gap-3">
              <Sparkles size={20} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900 dark:text-blue-100">
                <p className="font-semibold mb-1">AI-Enhanced Eye Tracking Active</p>
                <p>Using Google Gemini AI for improved accuracy. Keep face centered and well-lit. Take breaks to avoid eye strain.</p>
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

            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-4">
                <Target size={20} className="text-slate-600 dark:text-slate-400" />
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 dark:text-white">Calibration</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {config.calibrated ? 'Calibrated' : 'Not calibrated'}
                  </p>
                </div>
                {config.calibrated && (
                  <CheckCircle2 size={20} className="text-green-500" />
                )}
              </div>

              <button
                onClick={startCalibration}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2"
              >
                <RefreshCw size={18} />
                {config.calibrated ? 'Recalibrate' : 'Start Calibration'}
              </button>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Calibration improves accuracy by learning your eye patterns
              </p>
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
                    Dwell Time
                  </label>
                  <span className="text-sm text-slate-600 dark:text-slate-400">{config.dwellTime}ms</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="3000"
                  step="100"
                  value={config.dwellTime}
                  onChange={(e) => handleConfigChange('dwellTime', parseInt(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  How long to look at an element to click it
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Smoothing
                  </label>
                  <span className="text-sm text-slate-600 dark:text-slate-400">{config.smoothingFactor.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.1"
                  value={config.smoothingFactor}
                  onChange={(e) => handleConfigChange('smoothingFactor', parseFloat(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Higher values = smoother but less responsive
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Zap size={16} />
                    Show Gaze Indicator
                  </label>
                  <button
                    onClick={() => handleConfigChange('showGazeIndicator', !config.showGazeIndicator)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      config.showGazeIndicator
                        ? 'bg-blue-600'
                        : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        config.showGazeIndicator ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Enable Dwell Click
                  </label>
                  <button
                    onClick={() => handleConfigChange('enableDwellClick', !config.enableDwellClick)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      config.enableDwellClick
                        ? 'bg-blue-600'
                        : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        config.enableDwellClick ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Enable Smooth Scroll
                  </label>
                  <button
                    onClick={() => handleConfigChange('enableSmoothScroll', !config.enableSmoothScroll)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      config.enableSmoothScroll
                        ? 'bg-blue-600'
                        : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        config.enableSmoothScroll ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">Tips for Best Results</h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                <li className="flex gap-2">
                  <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" />
                  <span>Use bright, even lighting directly on your face</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" />
                  <span>Position camera 40-60cm from your face at eye level</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" />
                  <span>Keep head relatively still and centered</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" />
                  <span>Complete calibration for better accuracy</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" />
                  <span>Take 5-minute breaks every 15 minutes</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" />
                  <span>Adjust glasses position if applicable</span>
                </li>
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
