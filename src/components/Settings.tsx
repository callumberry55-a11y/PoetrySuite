import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  Moon, Sun, User, Mail, Download, Smartphone, Trash2, AlertTriangle, Bell, BellOff, MessageSquare,
  Send, Coins, Activity, TrendingUp, DollarSign, Settings as SettingsIcon,
  Palette, Globe, Award, HelpCircle, Sparkles, ChevronUp, ChevronDown, Fingerprint, Shield, Wand2
} from 'lucide-react';
import { functions } from '../lib/firebase';
import { httpsCallable } from 'firebase/functions';
import { subscribeToNotifications, unsubscribeFromNotifications, isSubscribed } from '../utils/notifications';
import packageJson from '../../package.json';
import ThemeManager from './ThemeManager';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed', platform: string }>;
  prompt(): Promise<void>;
}

type TabType = 'general' | 'appearance' | 'themes' | 'points' | 'feedback';

export default function Settings() {
  const { user, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [checkingForUpdates, setCheckingForUpdates] = useState(false);
  const [updateCheckResult, setUpdateCheckResult] = useState<string | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isTogglingNotifications, setIsTogglingNotifications] = useState(false);
  const [notificationError, setNotificationError] = useState<string | null>(null);
  const [feedbackCategory, setFeedbackCategory] = useState<'bug' | 'feature' | 'improvement' | 'other'>('improvement');
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [showCurrencyTable, setShowCurrencyTable] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<string>('Biometric');
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [isTogglingBiometric, setIsTogglingBiometric] = useState(false);
  const [biometricError, setBiometricError] = useState<string | null>(null);

  const loadNotificationPreference = useCallback(async () => {
    if (!user) return;

    try {
      const { supabase } = await import('../lib/supabase');
      const { data } = await supabase
        .from('user_preferences')
        .select('notifications_enabled')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data && typeof data.notifications_enabled === 'boolean') {
        setNotificationsEnabled(data.notifications_enabled);
      }
    } catch (error) {
      console.warn('Error loading notification preference:', error);
    }
  }, [user]);

  const loadBiometricSettings = useCallback(async () => {
    if (!user) return;

    try {
      const { isBiometricAvailable, getBiometricPreference, getBiometricTypeName } = await import('../utils/biometric');

      const available = await isBiometricAvailable();
      setBiometricAvailable(available.isAvailable);

      if (available.isAvailable && available.biometryType) {
        setBiometricType(getBiometricTypeName(available.biometryType));
      }

      const enabled = await getBiometricPreference(user.id);
      setBiometricEnabled(enabled);
    } catch (error) {
      console.warn('Error loading biometric settings:', error);
    }
  }, [user]);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    setTimeout(() => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
      }

      isSubscribed().then(setNotificationsEnabled);
      loadNotificationPreference();
      loadBiometricSettings();
    }, 0);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, [loadNotificationPreference, loadBiometricSettings]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handleCheckForUpdates = async () => {
    setCheckingForUpdates(true);
    setUpdateCheckResult(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'CHECK_FOR_UPDATES' });

        const messageHandler = (event: MessageEvent) => {
          if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
            setUpdateCheckResult('update-available');
          } else if (event.data && event.data.type === 'NO_UPDATE') {
            setUpdateCheckResult('up-to-date');
          }
          navigator.serviceWorker.removeEventListener('message', messageHandler);
        };

        navigator.serviceWorker.addEventListener('message', messageHandler);

        setTimeout(() => {
          setUpdateCheckResult('up-to-date');
          navigator.serviceWorker.removeEventListener('message', messageHandler);
        }, 3000);
      } else {
        setUpdateCheckResult('up-to-date');
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
      setUpdateCheckResult('error');
    } finally {
      setCheckingForUpdates(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE' || !user) {
      return;
    }

    setIsDeleting(true);

    try {
      const deleteAccount = httpsCallable(functions, 'deleteAccount');
      await deleteAccount();

      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account. Please try again.');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setDeleteConfirmText('');
    }
  };

  const handleToggleNotifications = async () => {
    setIsTogglingNotifications(true);
    setNotificationError(null);

    try {
      if (notificationsEnabled) {
        await unsubscribeFromNotifications();
        setNotificationsEnabled(false);
        await saveNotificationPreference(false);
      } else {
        await subscribeToNotifications();
        setNotificationsEnabled(true);
        await saveNotificationPreference(true);
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
      setNotificationError(
        error instanceof Error ? error.message : 'Failed to update notification settings'
      );
    } finally {
      setIsTogglingNotifications(false);
    }
  };

  const saveNotificationPreference = async (enabled: boolean) => {
    if (!user) return;

    try {
      const { supabase } = await import('../lib/supabase');
      await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          notifications_enabled: enabled,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });
    } catch (error) {
      console.warn('Error saving notification preference:', error);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackTitle.trim() || !feedbackMessage.trim() || !user) {
      return;
    }

    setIsSubmittingFeedback(true);
    setFeedbackSuccess(false);

    try {
      const { supabase } = await import('../lib/supabase');

      const { error } = await supabase
        .from('feedback')
        .insert({
          user_id: user.id,
          category: feedbackCategory,
          title: feedbackTitle.trim(),
          message: feedbackMessage.trim(),
        });

      if (error) throw error;

      setFeedbackSuccess(true);
      setFeedbackTitle('');
      setFeedbackMessage('');
      setFeedbackCategory('improvement');

      setTimeout(() => setFeedbackSuccess(false), 5000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleToggleBiometric = async () => {
    if (!user) return;

    setIsTogglingBiometric(true);
    setBiometricError(null);

    try {
      const { authenticateWithBiometric, saveBiometricPreference, storeBiometricCredential, clearBiometricCredential } = await import('../utils/biometric');

      if (!biometricEnabled) {
        const authenticated = await authenticateWithBiometric('Authenticate to enable biometric unlock');

        if (authenticated) {
          await saveBiometricPreference(user.id, true);
          storeBiometricCredential(user.id);
          setBiometricEnabled(true);
        } else {
          setBiometricError('Authentication failed. Please try again.');
        }
      } else {
        await saveBiometricPreference(user.id, false);
        clearBiometricCredential();
        setBiometricEnabled(false);
      }
    } catch (error) {
      console.error('Error toggling biometric:', error);
      setBiometricError(
        error instanceof Error ? error.message : 'Failed to update biometric settings'
      );
    } finally {
      setIsTogglingBiometric(false);
    }
  };

  const tabs = [
    { id: 'general' as TabType, label: 'General', icon: SettingsIcon },
    { id: 'appearance' as TabType, label: 'Appearance', icon: Palette },
    { id: 'themes' as TabType, label: 'Advanced Themes', icon: Wand2 },
    { id: 'points' as TabType, label: 'Points System', icon: Coins },
    { id: 'feedback' as TabType, label: 'Feedback', icon: MessageSquare },
  ];

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
              <SettingsIcon className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
              <p className="text-slate-600 dark:text-slate-400">Customize your Poetry Suite experience</p>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Sparkles className="text-white" size={24} />
                    <h2 className="text-xl font-bold text-white">About Poetry Suite</h2>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                      Poetry Suite is your personal sanctuary for writing, curating, and sharing poetry.
                      Track your progress, organize your work, and let your creativity flow.
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg font-semibold">
                        Version {packageJson.version}
                      </span>
                      <span className="px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg font-semibold flex items-center gap-1.5">
                        <Award size={16} />
                        Beta
                      </span>
                    </div>
                  </div>

                  <div>
                    <button
                      onClick={handleCheckForUpdates}
                      disabled={checkingForUpdates}
                      className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 press-effect"
                    >
                      {checkingForUpdates ? (
                        <>
                          <Download className="animate-bounce" size={20} />
                          <span>Checking for updates...</span>
                        </>
                      ) : (
                        <>
                          <Download size={20} />
                          <span>Check for Updates</span>
                        </>
                      )}
                    </button>

                    {updateCheckResult && (
                      <div className={`mt-4 p-4 rounded-xl border ${
                        updateCheckResult === 'up-to-date'
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                          : updateCheckResult === 'update-available'
                          ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                          : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                      }`}>
                        <p className={`text-sm font-medium ${
                          updateCheckResult === 'up-to-date'
                            ? 'text-emerald-800 dark:text-emerald-200'
                            : updateCheckResult === 'update-available'
                            ? 'text-amber-800 dark:text-amber-200'
                            : 'text-red-800 dark:text-red-200'
                        }`}>
                          {updateCheckResult === 'up-to-date' && 'You\'re running the latest version!'}
                          {updateCheckResult === 'update-available' && 'A new update is available. Please refresh the page to update.'}
                          {updateCheckResult === 'error' && 'Unable to check for updates. Please try again later.'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <User className="text-white" size={24} />
                    <h2 className="text-xl font-bold text-white">Account Information</h2>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                      <User className="text-white" size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">User ID</p>
                      <p className="font-mono text-sm text-slate-900 dark:text-white truncate">{user?.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                      <Mail className="text-white" size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Email</p>
                      <p className="font-medium text-slate-900 dark:text-white truncate">{user?.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              {biometricAvailable && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <div className="bg-gradient-to-r from-violet-500 to-purple-500 px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Shield className="text-white" size={24} />
                      <h2 className="text-xl font-bold text-white">Security</h2>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg ${
                          biometricEnabled
                            ? 'bg-gradient-to-br from-violet-500 to-purple-500'
                            : 'bg-gradient-to-br from-slate-400 to-slate-500'
                        }`}>
                          <Fingerprint className="text-white" size={24} />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white text-lg">{biometricType} Unlock</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Use {biometricType.toLowerCase()} to quickly and securely unlock the app
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleToggleBiometric}
                        disabled={isTogglingBiometric}
                        className={`relative inline-flex h-10 w-18 items-center rounded-full transition-all shadow-lg disabled:opacity-50 ${
                          biometricEnabled
                            ? 'bg-gradient-to-r from-violet-500 to-purple-500'
                            : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-8 w-8 transform rounded-full bg-white shadow-md transition-transform ${
                            biometricEnabled ? 'translate-x-9' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    {biometricError && (
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                        <p className="text-sm text-red-800 dark:text-red-200">{biometricError}</p>
                      </div>
                    )}
                    {biometricEnabled && (
                      <div className="p-4 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-xl">
                        <p className="text-sm text-violet-800 dark:text-violet-200">
                          {biometricType} unlock is enabled. You can use your {biometricType.toLowerCase()} to authenticate when returning to the app.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Bell className="text-white" size={24} />
                    <h2 className="text-xl font-bold text-white">Notifications</h2>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg ${
                        notificationsEnabled
                          ? 'bg-gradient-to-br from-blue-500 to-cyan-500'
                          : 'bg-gradient-to-br from-slate-400 to-slate-500'
                      }`}>
                        {notificationsEnabled ? (
                          <Bell className="text-white" size={24} />
                        ) : (
                          <BellOff className="text-white" size={24} />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white text-lg">Push Notifications</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Get notified about comments, reactions, and updates
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleToggleNotifications}
                      disabled={isTogglingNotifications}
                      className={`relative inline-flex h-10 w-18 items-center rounded-full transition-all shadow-lg disabled:opacity-50 ${
                        notificationsEnabled
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                          : 'bg-slate-300 dark:bg-slate-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-8 w-8 transform rounded-full bg-white shadow-md transition-transform ${
                          notificationsEnabled ? 'translate-x-9' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  {notificationError && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                      <p className="text-sm text-red-800 dark:text-red-200">{notificationError}</p>
                    </div>
                  )}
                  {notificationsEnabled && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        You'll receive notifications for comments, reactions, and submission updates.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Smartphone className="text-white" size={24} />
                    <h2 className="text-xl font-bold text-white">Install App</h2>
                  </div>
                </div>
                <div className="p-6">
                  {isInstalled ? (
                    <div className="flex items-start gap-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                        <Smartphone className="text-white" size={24} />
                      </div>
                      <div>
                        <p className="font-semibold text-emerald-900 dark:text-emerald-100 text-lg">
                          App Installed
                        </p>
                        <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
                          Poetry Suite is installed and ready to use offline.
                        </p>
                      </div>
                    </div>
                  ) : deferredPrompt ? (
                    <div>
                      <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                        Install Poetry Suite for quick access from your home screen and offline support.
                      </p>
                      <button
                        onClick={handleInstall}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-all"
                      >
                        <Download size={20} />
                        Install Poetry Suite
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl">
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        To install this app, open it in a supported browser like Chrome, Edge, or Safari on mobile.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-500 to-rose-500 rounded-2xl shadow-xl border-2 border-red-300 dark:border-red-900 overflow-hidden">
                <div className="px-6 py-4 border-b border-red-400 dark:border-red-900">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="text-white" size={24} />
                    <h2 className="text-xl font-bold text-white">Danger Zone</h2>
                  </div>
                </div>
                <div className="p-6 bg-white dark:bg-slate-800">
                  <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                    Once you delete your account, all your poems, collections, and data will be permanently removed. This action cannot be undone.
                  </p>

                  {!showDeleteConfirm ? (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white rounded-xl font-semibold shadow-lg shadow-red-500/30 transition-all"
                    >
                      <Trash2 size={20} />
                      Delete Account
                    </button>
                  ) : (
                    <div className="space-y-4 p-6 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl">
                      <div>
                        <p className="font-bold text-red-900 dark:text-red-100 text-lg mb-2">
                          Are you absolutely sure?
                        </p>
                        <p className="text-sm text-red-800 dark:text-red-200 mb-4 leading-relaxed">
                          This will permanently delete your account and all associated data including all poems, collections, submissions, and settings. This action cannot be undone.
                        </p>
                        <label className="block text-sm font-semibold text-red-900 dark:text-red-100 mb-2">
                          Type <span className="font-bold text-lg">DELETE</span> to confirm:
                        </label>
                        <input
                          type="text"
                          value={deleteConfirmText}
                          onChange={(e) => setDeleteConfirmText(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-red-300 dark:border-red-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="DELETE"
                          disabled={isDeleting}
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={handleDeleteAccount}
                          disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 disabled:from-red-300 disabled:to-rose-300 disabled:cursor-not-allowed text-white rounded-xl font-semibold shadow-lg transition-all"
                        >
                          <Trash2 size={20} />
                          {isDeleting ? 'Deleting...' : 'Permanently Delete Account'}
                        </button>
                        <button
                          onClick={() => {
                            setShowDeleteConfirm(false);
                            setDeleteConfirmText('');
                          }}
                          disabled={isDeleting}
                          className="px-6 py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 dark:text-white rounded-xl font-semibold transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Palette className="text-white" size={24} />
                    <h2 className="text-xl font-bold text-white">Theme Settings</h2>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
                        isDark
                          ? 'bg-gradient-to-br from-indigo-500 to-violet-500'
                          : 'bg-gradient-to-br from-amber-400 to-orange-400'
                      }`}>
                        {isDark ? (
                          <Moon className="text-white" size={28} />
                        ) : (
                          <Sun className="text-white" size={28} />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-xl">
                          {isDark ? 'Dark Mode' : 'Light Mode'}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {isDark ? 'Easy on the eyes for night reading' : 'Bright and clear for daytime use'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={toggleTheme}
                      className={`relative inline-flex h-12 w-20 items-center rounded-full transition-all shadow-lg ${
                        isDark
                          ? 'bg-gradient-to-r from-indigo-500 to-violet-500'
                          : 'bg-gradient-to-r from-amber-400 to-orange-400'
                      }`}
                    >
                      <span
                        className={`inline-block h-10 w-10 transform rounded-full bg-white shadow-md transition-transform ${
                          isDark ? 'translate-x-9' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4 shadow-lg">
                    <Sun size={24} className="text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Light Theme</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Clean and bright interface perfect for daytime use
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center mb-4 shadow-lg">
                    <Moon size={24} className="text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Dark Theme</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Reduced eye strain and better focus for night writing
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'themes' && (
            <ThemeManager />
          )}

          {activeTab === 'points' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Coins className="text-white" size={24} />
                    <h2 className="text-xl font-bold text-white">Points System Overview</h2>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                    Poetry Suite uses a points-based economy for various features and activities. Earn points through participation and use them for premium features.
                  </p>

                  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                          <th className="text-left py-4 px-6 font-bold text-slate-900 dark:text-white">Activity</th>
                          <th className="text-center py-4 px-6 font-bold text-slate-900 dark:text-white">Points</th>
                          <th className="text-left py-4 px-6 font-bold text-slate-900 dark:text-white">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { activity: 'Write a Poem', points: '+10', desc: 'Earn points for publishing a poem', color: 'emerald' },
                          { activity: 'Complete Quiz', points: '+5', desc: 'Complete any poetry quiz', color: 'blue' },
                          { activity: 'Contest Submission', points: '+25', desc: 'Submit a poem to a contest', color: 'cyan' },
                          { activity: 'Win Contest', points: '+100', desc: 'Win first place in a contest', color: 'amber' },
                          { activity: 'Earn a Badge', points: '+50', desc: 'Complete badge requirements', color: 'violet' },
                          { activity: 'Store Purchases', points: 'Varies', desc: 'Buy themes, prompts, and features', color: 'rose', isExpense: true },
                          { activity: 'Premium Features', points: 'Varies', desc: 'Access exclusive tools and resources', color: 'red', isExpense: true },
                        ].map((item, idx) => (
                          <tr key={idx} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                {item.isExpense ? (
                                  <Activity size={20} className={`text-${item.color}-600 dark:text-${item.color}-400`} />
                                ) : (
                                  <TrendingUp size={20} className={`text-${item.color}-600 dark:text-${item.color}-400`} />
                                )}
                                <span className="font-medium text-slate-900 dark:text-white">{item.activity}</span>
                              </div>
                            </td>
                            <td className={`text-center py-4 px-6 font-bold ${
                              item.isExpense
                                ? `text-${item.color}-600 dark:text-${item.color}-400`
                                : `text-${item.color}-600 dark:text-${item.color}-400`
                            }`}>
                              {item.points}
                            </td>
                            <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400">{item.desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl">
                      <div className="flex items-center gap-3 mb-3">
                        <DollarSign className="text-amber-600 dark:text-amber-400" size={24} />
                        <h4 className="font-bold text-amber-900 dark:text-amber-100">Point Value</h4>
                      </div>
                      <p className="text-3xl font-bold text-amber-900 dark:text-amber-100 mb-2">1 pt = £0.75</p>
                      <p className="text-sm text-amber-700 dark:text-amber-300">Standard conversion rate</p>
                    </div>

                    <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl">
                      <div className="flex items-center gap-3 mb-3">
                        <TrendingUp className="text-emerald-600 dark:text-emerald-400" size={24} />
                        <h4 className="font-bold text-emerald-900 dark:text-emerald-100">Earning</h4>
                      </div>
                      <p className="text-sm text-emerald-800 dark:text-emerald-200 leading-relaxed">
                        Participate in contests, write poems, and complete challenges
                      </p>
                    </div>

                    <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl">
                      <div className="flex items-center gap-3 mb-3">
                        <Coins className="text-blue-600 dark:text-blue-400" size={24} />
                        <h4 className="font-bold text-blue-900 dark:text-blue-100">Using Points</h4>
                      </div>
                      <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                        Spend on store items, themes, and premium features
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 p-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                    <div className="flex gap-3">
                      <HelpCircle className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" size={20} />
                      <div>
                        <p className="font-semibold text-amber-900 dark:text-amber-100 mb-1">Developer Note</p>
                        <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                          For developers using our API, points are deducted based on API usage. Visit the Developer Dashboard to manage your API keys and monitor point consumption.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      onClick={() => setShowCurrencyTable(!showCurrencyTable)}
                      className="w-full flex items-center justify-between p-6 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 hover:from-emerald-100 hover:to-teal-100 dark:hover:from-emerald-900/30 dark:hover:to-teal-900/30 rounded-2xl transition-all border border-emerald-200 dark:border-emerald-800 group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                          <Globe className="text-white" size={24} />
                        </div>
                        <span className="font-bold text-lg text-emerald-900 dark:text-emerald-100">
                          Global Currency Conversion Table
                        </span>
                      </div>
                      {showCurrencyTable ? (
                        <ChevronUp className="text-emerald-600 dark:text-emerald-400" size={24} />
                      ) : (
                        <ChevronDown className="text-emerald-600 dark:text-emerald-400" size={24} />
                      )}
                    </button>

                    {showCurrencyTable && (
                      <div className="mt-4 p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                          Point values in different currencies around the world. Exchange rates are approximate and updated periodically.
                        </p>

                        <div className="space-y-8">
                          {[
                            {
                              region: 'Europe',
                              color: 'blue',
                              currencies: [
                                ['British Pound', 'GBP', '£0.75'],
                                ['Euro', 'EUR', '€0.85'],
                                ['Swiss Franc', 'CHF', 'CHF 0.85'],
                                ['Swedish Krona', 'SEK', 'kr 10.00'],
                                ['Norwegian Krone', 'NOK', 'kr 10.00'],
                                ['Danish Krone', 'DKK', 'kr 6.35'],
                                ['Polish Zloty', 'PLN', 'zł 3.75'],
                                ['Czech Koruna', 'CZK', 'Kč 21.50'],
                                ['Hungarian Forint', 'HUF', 'Ft 340'],
                                ['Romanian Leu', 'RON', 'lei 4.25'],
                                ['Turkish Lira', 'TRY', '₺ 28.00'],
                                ['Russian Ruble', 'RUB', '₽ 90.00'],
                              ]
                            },
                            {
                              region: 'Americas',
                              color: 'emerald',
                              currencies: [
                                ['US Dollar', 'USD', '$0.95'],
                                ['Canadian Dollar', 'CAD', 'C$ 1.30'],
                                ['Mexican Peso', 'MXN', '$ 17.00'],
                                ['Brazilian Real', 'BRL', 'R$ 4.75'],
                                ['Argentine Peso', 'ARS', '$ 950'],
                                ['Chilean Peso', 'CLP', '$ 930'],
                                ['Colombian Peso', 'COP', '$ 4,100'],
                                ['Peruvian Sol', 'PEN', 'S/ 3.60'],
                              ]
                            },
                            {
                              region: 'Asia',
                              color: 'orange',
                              currencies: [
                                ['Japanese Yen', 'JPY', '¥ 140'],
                                ['Chinese Yuan', 'CNY', '¥ 6.75'],
                                ['Indian Rupee', 'INR', '₹ 80'],
                                ['South Korean Won', 'KRW', '₩ 1,280'],
                                ['Singapore Dollar', 'SGD', 'S$ 1.28'],
                                ['Hong Kong Dollar', 'HKD', 'HK$ 7.40'],
                                ['Taiwan Dollar', 'TWD', 'NT$ 30'],
                                ['Thai Baht', 'THB', '฿ 33'],
                                ['Malaysian Ringgit', 'MYR', 'RM 4.30'],
                                ['Indonesian Rupiah', 'IDR', 'Rp 15,000'],
                                ['Philippine Peso', 'PHP', '₱ 54'],
                                ['Vietnamese Dong', 'VND', '₫ 24,000'],
                                ['Israeli Shekel', 'ILS', '₪ 3.50'],
                              ]
                            },
                            {
                              region: 'Oceania & Africa',
                              color: 'amber',
                              currencies: [
                                ['Australian Dollar', 'AUD', 'A$ 1.45'],
                                ['New Zealand Dollar', 'NZD', 'NZ$ 1.60'],
                                ['South African Rand', 'ZAR', 'R 18'],
                              ]
                            }
                          ].map((section, idx) => (
                            <div key={idx}>
                              <h4 className={`text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3`}>
                                <span className={`w-3 h-3 bg-${section.color}-500 rounded-full`}></span>
                                {section.region}
                              </h4>
                              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                                <table className="w-full">
                                  <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                                      <th className="text-left py-3 px-4 text-sm font-bold text-slate-900 dark:text-white">Currency</th>
                                      <th className="text-left py-3 px-4 text-sm font-bold text-slate-900 dark:text-white">Code</th>
                                      <th className="text-right py-3 px-4 text-sm font-bold text-slate-900 dark:text-white">1 Point Value</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {section.currencies.map((currency, cIdx) => (
                                      <tr key={cIdx} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="py-3 px-4 text-sm text-slate-900 dark:text-white">{currency[0]}</td>
                                        <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400 font-mono">{currency[1]}</td>
                                        <td className="text-right py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white">{currency[2]}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                          <div className="flex gap-3">
                            <HelpCircle className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" size={18} />
                            <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                              <strong>Note:</strong> Exchange rates are approximate and may fluctuate. The base rate is 1 point = £0.75 GBP. Actual transaction amounts are calculated at the time of purchase using current exchange rates.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'feedback' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="text-white" size={24} />
                    <h2 className="text-xl font-bold text-white">Send Us Your Feedback</h2>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                    Help us improve Poetry Suite by sharing your thoughts, reporting bugs, or suggesting new features. Your feedback matters!
                  </p>

                  {feedbackSuccess && (
                    <div className="mb-6 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                          <Send className="text-white" size={20} />
                        </div>
                        <p className="text-emerald-800 dark:text-emerald-200 font-semibold">
                          Thank you for your feedback! We'll review it shortly.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-900 dark:text-white mb-3">
                        Category
                      </label>
                      <select
                        value={feedbackCategory}
                        onChange={(e) => setFeedbackCategory(e.target.value as 'bug' | 'feature' | 'improvement' | 'other')}
                        className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        disabled={isSubmittingFeedback}
                      >
                        <option value="bug">Bug Report</option>
                        <option value="feature">Feature Request</option>
                        <option value="improvement">Improvement Suggestion</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-900 dark:text-white mb-3">
                        Title
                      </label>
                      <input
                        type="text"
                        value={feedbackTitle}
                        onChange={(e) => setFeedbackTitle(e.target.value)}
                        placeholder="Brief summary of your feedback"
                        className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        disabled={isSubmittingFeedback}
                        maxLength={100}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-900 dark:text-white mb-3">
                        Message
                      </label>
                      <textarea
                        value={feedbackMessage}
                        onChange={(e) => setFeedbackMessage(e.target.value)}
                        placeholder="Provide details about your feedback..."
                        rows={6}
                        className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                        disabled={isSubmittingFeedback}
                        maxLength={1000}
                      />
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                        {feedbackMessage.length}/1000 characters
                      </p>
                    </div>

                    <button
                      onClick={handleSubmitFeedback}
                      disabled={!feedbackTitle.trim() || !feedbackMessage.trim() || isSubmittingFeedback}
                      className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30 transition-all"
                    >
                      <Send size={20} />
                      {isSubmittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
