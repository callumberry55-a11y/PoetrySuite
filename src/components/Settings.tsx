import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Moon, Sun, User, Mail, Download, Smartphone, FileText, ChevronDown, ChevronUp, Clock, Trash2, AlertTriangle, Bell, BellOff, RefreshCw, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import packageJson from '../../package.json';

export default function Settings() {
  const { user, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showUpdateHistory, setShowUpdateHistory] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [notificationError, setNotificationError] = useState<string | null>(null);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'checking' | 'available' | 'up-to-date' | 'error'>('idle');
  const [updateMessage, setUpdateMessage] = useState<string>('');

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
      checkSubscriptionStatus();
    }
  }, []);

  const checkSubscriptionStatus = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribeToPushNotifications = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setNotificationError('Push notifications are not supported by your browser');
      return;
    }

    setIsSubscribing(true);
    setNotificationError(null);

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission !== 'granted') {
        setNotificationError('Notification permission denied');
        setIsSubscribing(false);
        return;
      }

      const registration = await navigator.serviceWorker.ready;

      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        setNotificationError('Push notification configuration is missing');
        setIsSubscribing(false);
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });

      const subscriptionJSON = subscription.toJSON();

      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: user?.id,
          endpoint: subscriptionJSON.endpoint!,
          p256dh_key: subscriptionJSON.keys!.p256dh,
          auth_key: subscriptionJSON.keys!.auth
        }, {
          onConflict: 'endpoint'
        });

      if (error) throw error;

      setIsSubscribed(true);
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      setNotificationError('Failed to subscribe to notifications. Please try again.');
    } finally {
      setIsSubscribing(false);
    }
  };

  const unsubscribeFromPushNotifications = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return;
    }

    setIsSubscribing(true);
    setNotificationError(null);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        const subscriptionJSON = subscription.toJSON();

        const { error } = await supabase
          .from('push_subscriptions')
          .delete()
          .eq('endpoint', subscriptionJSON.endpoint!);

        if (error) throw error;

        await subscription.unsubscribe();
        setIsSubscribed(false);
      }
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      setNotificationError('Failed to unsubscribe. Please try again.');
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE MY ACCOUNT') {
      setDeleteError('Please type "DELETE MY ACCOUNT" exactly to confirm');
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const { error } = await supabase.rpc('delete_user_account');

      if (error) throw error;

      await signOut();
    } catch (error) {
      console.error('Error deleting account:', error);
      setDeleteError('Failed to delete account. Please try again or contact support.');
      setIsDeleting(false);
    }
  };

  const checkForUpdates = async () => {
    if (!('serviceWorker' in navigator)) {
      setUpdateStatus('error');
      setUpdateMessage('Service Worker is not supported in your browser');
      return;
    }

    setIsCheckingUpdate(true);
    setUpdateStatus('checking');
    setUpdateMessage('Checking for updates...');

    try {
      const registration = await navigator.serviceWorker.getRegistration();

      if (!registration) {
        setUpdateStatus('error');
        setUpdateMessage('No service worker registered');
        setIsCheckingUpdate(false);
        return;
      }

      await registration.update();

      const waiting = registration.waiting;
      const installing = registration.installing;

      if (waiting || installing) {
        setUpdateStatus('available');
        setUpdateMessage('Update available! Click "Install Update" to apply.');
        setIsCheckingUpdate(false);
      } else {
        setUpdateStatus('up-to-date');
        setUpdateMessage('You are running the latest version');
        setIsCheckingUpdate(false);
        setTimeout(() => {
          setUpdateStatus('idle');
          setUpdateMessage('');
        }, 5000);
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
      setUpdateStatus('error');
      setUpdateMessage('Failed to check for updates. Please try again.');
      setIsCheckingUpdate(false);
    }
  };

  const installUpdate = async () => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration();

      if (!registration) {
        return;
      }

      const waiting = registration.waiting;

      if (waiting) {
        waiting.postMessage({ type: 'SKIP_WAITING' });

        waiting.addEventListener('statechange', (e: Event) => {
          const target = e.target as ServiceWorker;
          if (target.state === 'activated') {
            window.location.reload();
          }
        });
      }
    } catch (error) {
      console.error('Error installing update:', error);
      setUpdateStatus('error');
      setUpdateMessage('Failed to install update. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Settings</h2>

      <div className="space-y-6">
        <div className="glass rounded-xl p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            Account Information
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <User className="text-blue-600 dark:text-blue-400" size={20} />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">User ID</p>
                <p className="font-medium text-slate-900 dark:text-white">{user?.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Mail className="text-green-600 dark:text-green-400" size={20} />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Email</p>
                <p className="font-medium text-slate-900 dark:text-white">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            Appearance
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                {isDark ? (
                  <Moon className="text-slate-600 dark:text-slate-400" size={20} />
                ) : (
                  <Sun className="text-slate-600 dark:text-slate-400" size={20} />
                )}
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Dark Mode</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {isDark ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                isDark ? 'bg-blue-500' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  isDark ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="glass rounded-xl p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            Push Notifications
          </h3>
          <div className="space-y-4">
            {!('Notification' in window) ? (
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Push notifications are not supported by your browser.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isSubscribed
                        ? 'bg-green-100 dark:bg-green-900/30'
                        : 'bg-slate-100 dark:bg-slate-700'
                    }`}>
                      {isSubscribed ? (
                        <Bell className="text-green-600 dark:text-green-400" size={20} />
                      ) : (
                        <BellOff className="text-slate-600 dark:text-slate-400" size={20} />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {isSubscribed ? 'Notifications Enabled' : 'Notifications Disabled'}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {isSubscribed
                          ? 'Get notified about comments, likes, and updates'
                          : 'Enable to receive important updates'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={isSubscribed ? unsubscribeFromPushNotifications : subscribeToPushNotifications}
                    disabled={isSubscribing || notificationPermission === 'denied'}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                      isSubscribed ? 'bg-green-500' : 'bg-slate-300'
                    } ${(isSubscribing || notificationPermission === 'denied') ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                        isSubscribed ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {notificationPermission === 'denied' && (
                  <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <AlertTriangle className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" size={16} />
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      Notifications are blocked. Please enable them in your browser settings to use this feature.
                    </p>
                  </div>
                )}

                {notificationError && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <AlertTriangle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={16} />
                    <p className="text-sm text-red-800 dark:text-red-200">{notificationError}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="glass rounded-xl p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            Install App
          </h3>
          {isInstalled ? (
            <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <Smartphone className="text-green-600 dark:text-green-400 mt-0.5" size={20} />
              <div>
                <p className="font-medium text-green-900 dark:text-green-100">
                  App Installed
                </p>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  Poetry Suite is installed and ready to use offline.
                </p>
              </div>
            </div>
          ) : deferredPrompt ? (
            <div>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Install Poetry Suite for quick access from your home screen and offline support.
              </p>
              <button
                onClick={handleInstall}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
              >
                <Download size={18} />
                Install Poetry Suite
              </button>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                To install this app, open it in a supported browser like Chrome, Edge, or Safari on mobile.
              </p>
            </div>
          )}
        </div>

        <div className="glass rounded-xl p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            App Updates
          </h3>
          <div className="space-y-4">
            <p className="text-slate-600 dark:text-slate-400">
              Check for the latest version of Poetry Suite and install updates to get new features and improvements.
            </p>

            {updateStatus !== 'idle' && (
              <div className={`flex items-start gap-3 p-4 rounded-lg border ${
                updateStatus === 'checking'
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                  : updateStatus === 'available'
                  ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                  : updateStatus === 'up-to-date'
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              }`}>
                {updateStatus === 'checking' ? (
                  <RefreshCw className="text-blue-600 dark:text-blue-400 mt-0.5 animate-spin" size={20} />
                ) : updateStatus === 'up-to-date' ? (
                  <CheckCircle className="text-green-600 dark:text-green-400 mt-0.5" size={20} />
                ) : updateStatus === 'available' ? (
                  <Download className="text-amber-600 dark:text-amber-400 mt-0.5" size={20} />
                ) : (
                  <AlertTriangle className="text-red-600 dark:text-red-400 mt-0.5" size={20} />
                )}
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    updateStatus === 'checking'
                      ? 'text-blue-900 dark:text-blue-100'
                      : updateStatus === 'available'
                      ? 'text-amber-900 dark:text-amber-100'
                      : updateStatus === 'up-to-date'
                      ? 'text-green-900 dark:text-green-100'
                      : 'text-red-900 dark:text-red-100'
                  }`}>
                    {updateMessage}
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={checkForUpdates}
                disabled={isCheckingUpdate}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 disabled:dark:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                <RefreshCw size={18} className={isCheckingUpdate ? 'animate-spin' : ''} />
                {isCheckingUpdate ? 'Checking...' : 'Check for Updates'}
              </button>

              {updateStatus === 'available' && (
                <button
                  onClick={installUpdate}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
                >
                  <Download size={18} />
                  Install Update
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            Policies
          </h3>
          <div className="space-y-4">
            <button
              onClick={() => setShowPrivacyPolicy(!showPrivacyPolicy)}
              className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <FileText className="text-blue-600 dark:text-blue-400" size={20} />
                </div>
                <span className="font-medium text-slate-900 dark:text-white">
                  Privacy Policy
                </span>
              </div>
              {showPrivacyPolicy ? (
                <ChevronUp className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" size={20} />
              ) : (
                <ChevronDown className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" size={20} />
              )}
            </button>

            {showPrivacyPolicy && (
              <div className="prose prose-slate dark:prose-invert max-w-none p-6 bg-slate-50 dark:bg-slate-700/50 rounded-lg space-y-6 text-sm">
                <div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    Welcome to Poetry Suite. We are committed to protecting your privacy. This Privacy Policy explains what information we collect, how we use it, and your rights in relation to it. By using our application, you agree to the collection and use of information in accordance with this policy.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">1. Who We Are</h4>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    Poetry Suite ("we", "us", "our") is the data controller responsible for your information when you use our service.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">2. Information We Collect and How We Use It</h4>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                    Our philosophy is to collect the minimum amount of data necessary to provide and improve our service.
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-slate-700 dark:text-slate-300">
                    <li>
                      <strong>User Account Information:</strong> To provide a persistent experience, we use Supabase Authentication. You can create an account using email and password. When you create an account, we store your unique user ID and email address. This is necessary for core app functionality.
                    </li>
                    <li>
                      <strong>Creative Content (Poems):</strong> All poems you create are stored securely in our Supabase database and are associated with your user account. Only you can access your private poems.
                    </li>
                    <li>
                      <strong>Usage Analytics:</strong> We track basic usage metrics (word count, poem count, writing streaks) to provide you with insights into your creative journey. This data is associated with your account and is not shared publicly.
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">3. Data Storage and Security</h4>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    Your data is stored securely on Supabase servers with industry-standard encryption. We implement row-level security to ensure your poems and data remain private and accessible only to you.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">4. Your Data Rights (UK GDPR)</h4>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-2">
                    You have several rights over your personal data:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-slate-700 dark:text-slate-300">
                    <li><strong>Right of Access:</strong> You can access all your creative content directly within the app.</li>
                    <li><strong>Right to Rectification:</strong> You can edit your poems and account information at any time within the app.</li>
                    <li><strong>Right to Erasure:</strong> You can delete your poems individually or delete your entire account through the Settings.</li>
                    <li><strong>Right to Object:</strong> You have the right to object to the processing of your data based on legitimate interests.</li>
                  </ul>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-2">
                    To exercise any of these rights, please use the features provided in the app or contact us.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">5. Data Retention</h4>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    We retain your data only for as long as necessary to provide the service or until you request its deletion via the available in-app features.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">6. Children's Privacy</h4>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    Our service is not intended for individuals under the age of 13. We do not knowingly collect personally identifiable information from children under 13.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">7. Third-Party Services</h4>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    We use Supabase for authentication and data storage. We do not use any third-party services for analytics, advertising, or tracking beyond what is necessary to provide core functionality.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">8. Changes to This Privacy Policy</h4>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    We may update our Privacy Policy from time to time. We will notify you of any material changes via an in-app notification.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">9. Contact Us</h4>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    If you have any questions or concerns about this Privacy Policy or your data rights, please contact us at{' '}
                    <a href="mailto:callumberry158@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                      callumberry158@gmail.com
                    </a>
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-600">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Last updated: December 17, 2025
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowTerms(!showTerms)}
              className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <FileText className="text-green-600 dark:text-green-400" size={20} />
                </div>
                <span className="font-medium text-slate-900 dark:text-white">
                  Terms & Conditions
                </span>
              </div>
              {showTerms ? (
                <ChevronUp className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" size={20} />
              ) : (
                <ChevronDown className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" size={20} />
              )}
            </button>

            {showTerms && (
              <div className="prose prose-slate dark:prose-invert max-w-none p-6 bg-slate-50 dark:bg-slate-700/50 rounded-lg space-y-6 text-sm">
                <div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    Please read these Terms and Agreement ("Terms") carefully before using the Poetry Suite application ("Service"). Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who access or use the Service.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">1. Acceptance of Terms</h4>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    By accessing or using the Poetry Suite application, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">2. Description of Service</h4>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    Poetry Suite is a digital platform designed for poets and writers to create, manage, and reflect on their poetry. All creative work is stored securely in our database and associated with your user account.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">3. User-Generated Content</h4>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    All poems and collections you create ("User Content") are stored securely in our Supabase database and remain your intellectual property. You are solely responsible for your User Content. We recommend keeping backups of important work.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">4. Intellectual Property</h4>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    The Service and its original content (excluding User Content), features, and functionality are and will remain the exclusive property of the Poetry Suite creators.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">5. Termination</h4>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. All provisions of the Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity and limitations of liability.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">6. Disclaimer of Warranties</h4>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    The Service is provided on an "AS IS" and "AS AVAILABLE" basis. Your use of the Service is at your sole risk. The service is provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement or course of performance.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">7. Limitation of Liability</h4>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    In no event shall Poetry Suite, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; and (iv) unauthorized access, use or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence) or any other legal theory, whether or not we have been informed of the possibility of such damage.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">8. Governing Law</h4>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    These Terms shall be governed and construed in accordance with the laws of the United Kingdom, without regard to its conflict of law provisions.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">9. Changes to Terms</h4>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice via an in-app notification prior to any new terms taking effect.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">10. Contact Us</h4>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    If you have any questions about these Terms, please contact us at{' '}
                    <a href="mailto:callumberry158@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                      callumberry158@gmail.com
                    </a>
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-600">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Last updated: December 17, 2025
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowUpdateHistory(!showUpdateHistory)}
              className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Clock className="text-amber-600 dark:text-amber-400" size={20} />
                </div>
                <span className="font-medium text-slate-900 dark:text-white">
                  Update History
                </span>
              </div>
              {showUpdateHistory ? (
                <ChevronUp className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" size={20} />
              ) : (
                <ChevronDown className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" size={20} />
              )}
            </button>

            {showUpdateHistory && (
              <div className="prose prose-slate dark:prose-invert max-w-none p-6 bg-slate-50 dark:bg-slate-700/50 rounded-lg space-y-6 text-sm">
                <div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    This page provides a history of all changes made to our Privacy Policy and Terms of Agreement. We believe in transparency and want to ensure you are always aware of how our policies evolve.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Feature & Improvement Updates</h4>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    New features and major application improvements are released on a quarterly cycle. This allows us to bundle exciting new tools and enhancements for a more substantial and polished update experience. Minor bug fixes and security patches are released as needed.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Beta Versions</h4>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    While the application is in a "Beta" phase, some features may be experimental. This means they might be unstable, could change, or may be removed in a future update as we refine the user experience based on feedback and testing. We appreciate your understanding and contribution during this development period.
                  </p>
                </div>

                <div className="border-l-4 border-blue-500 dark:border-blue-400 pl-4">
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">December 17, 2025</h4>
                  <ul className="list-disc pl-5 space-y-2 text-slate-700 dark:text-slate-300">
                    <li>
                      <strong>Privacy Policy:</strong> Confirmed data handling practices for user authentication and poem storage in Supabase database. Clarified data retention and deletion processes.
                    </li>
                    <li>
                      <strong>Terms of Agreement:</strong> Streamlined terms to reflect current app functionality and removed references to features not yet implemented.
                    </li>
                    <li>
                      <strong>General:</strong> Initial public release of Poetry Suite Beta version with core features including poem creation, library management, analytics, and PWA support.
                    </li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-600">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    For questions about these updates, contact us at{' '}
                    <a href="mailto:callumberry158@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                      callumberry158@gmail.com
                    </a>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="glass rounded-xl p-6 shadow-sm border-2 border-red-200 dark:border-red-900/50">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="text-red-600 dark:text-red-400" size={20} />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-red-900 dark:text-red-100 mb-2">
                Delete Account
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>
          </div>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
            >
              <Trash2 size={18} />
              Delete My Account
            </button>
          ) : (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-red-900 dark:text-red-100">
                  Are you absolutely sure?
                </p>
                <p className="text-sm text-red-700 dark:text-red-300">
                  This will permanently delete:
                </p>
                <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300 space-y-1 ml-2">
                  <li>All your poems and drafts</li>
                  <li>All your collections</li>
                  <li>All your comments and reactions</li>
                  <li>Your community submissions</li>
                  <li>Your analytics data</li>
                  <li>Your account information</li>
                </ul>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-red-900 dark:text-red-100">
                  Type "DELETE MY ACCOUNT" to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => {
                    setDeleteConfirmText(e.target.value);
                    setDeleteError(null);
                  }}
                  placeholder="DELETE MY ACCOUNT"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-red-300 dark:border-red-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                  disabled={isDeleting}
                />
              </div>

              {deleteError && (
                <div className="flex items-start gap-2 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
                  <AlertTriangle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={16} />
                  <p className="text-sm text-red-800 dark:text-red-200">{deleteError}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || deleteConfirmText !== 'DELETE MY ACCOUNT'}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 disabled:dark:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                >
                  <Trash2 size={18} />
                  {isDeleting ? 'Deleting...' : 'Permanently Delete Account'}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmText('');
                    setDeleteError(null);
                  }}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 disabled:cursor-not-allowed text-slate-900 dark:text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="glass rounded-xl p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            About Poetry Suite
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Poetry Suite is your personal sanctuary for writing, curating, and sharing poetry.
            Track your progress, organize your work, and let your creativity flow.
          </p>
          <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            <span className="font-medium">Version {packageJson.version}</span>
            <span className="text-slate-400 dark:text-slate-600">·</span>
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-md font-medium">Beta</span>
          </div>
        </div>
      </div>
    </div>
  );
}
