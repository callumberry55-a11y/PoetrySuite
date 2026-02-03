import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Moon, Sun, User, Mail, Download, Smartphone, FileText, ChevronDown, ChevronUp, Clock, Trash2, AlertTriangle, Bell, BellOff, MessageSquare, Send } from 'lucide-react';
import { functions } from '../lib/firebase';
import { httpsCallable } from 'firebase/functions';
import { subscribeToNotifications, unsubscribeFromNotifications, isSubscribed } from '../utils/notifications';
import packageJson from '../../package.json';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed', platform: string }>;
  prompt(): Promise<void>;
}

export default function Settings() {
  const { user, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showUpdateHistory, setShowUpdateHistory] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    isSubscribed().then(setNotificationsEnabled);

    loadNotificationPreference();

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const loadNotificationPreference = async () => {
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
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setDeferredPrompt(null);
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Settings</h2>

      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
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

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
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

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
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

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            Push Notifications
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  {notificationsEnabled ? (
                    <Bell className="text-purple-600 dark:text-purple-400" size={20} />
                  ) : (
                    <BellOff className="text-slate-600 dark:text-slate-400" size={20} />
                  )}
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Enable Notifications</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Get notified about comments, reactions, and updates
                  </p>
                </div>
              </div>
              <button
                onClick={handleToggleNotifications}
                disabled={isTogglingNotifications}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors disabled:opacity-50 ${
                  notificationsEnabled ? 'bg-purple-500' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    notificationsEnabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            {notificationError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200">{notificationError}</p>
              </div>
            )}
            {notificationsEnabled && (
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                <p className="text-sm text-purple-800 dark:text-purple-200">
                  You'll receive notifications for comments, reactions, and submission updates.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
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

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
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
                 <p>Our Privacy Policy has been updated to reflect our use of Firebase services.</p>
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
                <p>Our Terms & Conditions have been updated.</p>
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
                  <p>Updates are tracked in our Git repository.</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <MessageSquare size={24} />
            Send Feedback
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Help us improve Poetry Suite by sharing your thoughts, reporting bugs, or suggesting new features.
          </p>

          {feedbackSuccess && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-200">
                Thank you for your feedback! We'll review it shortly.
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                Category
              </label>
              <select
                value={feedbackCategory}
                onChange={(e) => setFeedbackCategory(e.target.value as 'bug' | 'feature' | 'improvement' | 'other')}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmittingFeedback}
              >
                <option value="bug">Bug Report</option>
                <option value="feature">Feature Request</option>
                <option value="improvement">Improvement Suggestion</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                Title
              </label>
              <input
                type="text"
                value={feedbackTitle}
                onChange={(e) => setFeedbackTitle(e.target.value)}
                placeholder="Brief summary of your feedback"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmittingFeedback}
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                Message
              </label>
              <textarea
                value={feedbackMessage}
                onChange={(e) => setFeedbackMessage(e.target.value)}
                placeholder="Provide details about your feedback..."
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                disabled={isSubmittingFeedback}
                maxLength={1000}
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {feedbackMessage.length}/1000 characters
              </p>
            </div>

            <button
              onClick={handleSubmitFeedback}
              disabled={!feedbackTitle.trim() || !feedbackMessage.trim() || isSubmittingFeedback}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              <Send size={18} />
              {isSubmittingFeedback ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border-2 border-red-200 dark:border-red-900/50">
          <h3 className="text-xl font-semibold text-red-900 dark:text-red-100 mb-4 flex items-center gap-2">
            <AlertTriangle size={24} className="text-red-600 dark:text-red-400" />
            Danger Zone
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Once you delete your account, all your poems, collections, and data will be permanently removed. This action cannot be undone.
          </p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
            >
              <Trash2 size={18} />
              Delete Account
            </button>
          ) : (
            <div className="space-y-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div>
                <p className="font-semibold text-red-900 dark:text-red-100 mb-2">
                  Are you absolutely sure?
                </p>
                <p className="text-sm text-red-800 dark:text-red-200 mb-4">
                  This will permanently delete your account and all associated data including all poems, collections, submissions, and settings. This action cannot be undone.
                </p>
                <label className="block text-sm font-medium text-red-900 dark:text-red-100 mb-2">
                  Type <span className="font-bold">DELETE</span> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full px-3 py-2 border border-red-300 dark:border-red-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="DELETE"
                  disabled={isDeleting}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                >
                  <Trash2 size={18} />
                  {isDeleting ? 'Deleting...' : 'Permanently Delete Account'}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmText('');
                  }}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 dark:text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
