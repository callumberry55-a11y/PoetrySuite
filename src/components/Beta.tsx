import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, AlertTriangle, Send, Star, Bug, Lightbulb, MessageCircle, Mic, Palette, BarChart3, Users, Lock, ArrowRight, Brain } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface BetaFeature {
  id: string;
  name: string;
  description: string;
  is_enabled: boolean;
}

interface Feedback {
  id: string;
  feature_name: string;
  feedback_type: string;
  title: string;
  description: string;
  rating: number | null;
  created_at: string;
}

export default function Beta() {
  const { user } = useAuth();
  const [isBetaTester, setIsBetaTester] = useState(false);
  const [features, setFeatures] = useState<BetaFeature[]>([]);
  const [myFeedback, setMyFeedback] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({
    feature_name: '',
    feedback_type: 'suggestion',
    title: '',
    description: '',
    rating: 5
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    checkBetaStatus();
    loadBetaFeatures();
    loadMyFeedback();
  }, []);

  const checkBetaStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('is_beta_tester')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setIsBetaTester(data?.is_beta_tester || false);
    } catch (error) {
      console.error('Error checking beta status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadBetaFeatures = async () => {
    try {
      const { data, error } = await supabase
        .from('beta_features')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFeatures(data || []);
    } catch (error) {
      console.error('Error loading beta features:', error);
    }
  };

  const loadMyFeedback = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('beta_feedback')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyFeedback(data || []);
    } catch (error) {
      console.error('Error loading feedback:', error);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const { error } = await supabase
        .from('beta_feedback')
        .insert({
          user_id: user?.id,
          ...feedbackForm
        });

      if (error) throw error;

      setSubmitSuccess(true);
      setFeedbackForm({
        feature_name: '',
        feedback_type: 'suggestion',
        title: '',
        description: '',
        rating: 5
      });
      setShowFeedbackForm(false);
      loadMyFeedback();

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('beta_feedback_count')
        .eq('user_id', user?.id)
        .maybeSingle();

      await supabase
        .from('user_profiles')
        .update({
          beta_feedback_count: (profile?.beta_feedback_count || 0) + 1
        })
        .eq('user_id', user?.id);

      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSubmitError('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFeatureIcon = (name: string) => {
    if (name.includes('ai') || name.includes('analysis')) return Brain;
    if (name.includes('collaborative') || name.includes('writing')) return Users;
    if (name.includes('voice') || name.includes('recording')) return Mic;
    if (name.includes('theme') || name.includes('custom')) return Palette;
    if (name.includes('metric') || name.includes('analytics')) return BarChart3;
    return Sparkles;
  };

  const getFeatureLink = (name: string): string | null => {
    if (name.includes('advanced_ai_analysis')) return '#ai-analysis';
    if (name.includes('collaborative_writing')) return '#collaborative';
    if (name.includes('voice_recording')) return '#voice-recording';
    if (name.includes('advanced_metrics')) return '#metrics';
    if (name.includes('custom_themes')) return '#themes';
    return null;
  };

  const getFeedbackIcon = (type: string) => {
    switch (type) {
      case 'bug': return Bug;
      case 'suggestion': return Lightbulb;
      case 'praise': return Star;
      default: return MessageCircle;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!isBetaTester) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="glass rounded-xl p-8 shadow-sm text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
            <Lock className="text-slate-600 dark:text-slate-400" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Beta Access Required
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            This page is only available to beta testers. Join our beta program in Settings to access experimental features and help shape Poetry Suite.
          </p>
          <button
            onClick={() => window.location.hash = ''}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
          >
            Go to Settings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="text-blue-600 dark:text-blue-400" size={32} />
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Beta Features</h2>
        </div>
        <p className="text-slate-600 dark:text-slate-400">
          Welcome to the beta program! Explore experimental features and share your feedback to help us improve.
        </p>
      </div>

      {submitSuccess && (
        <div className="mb-6 flex items-start gap-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <Star className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-sm text-green-800 dark:text-green-200">
            Thank you for your feedback! We appreciate your contribution to making Poetry Suite better.
          </p>
        </div>
      )}

      <div className="space-y-6">
        <div className="glass rounded-xl p-6 shadow-sm border-2 border-blue-200 dark:border-blue-900/50">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            Available Beta Features
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {features.map((feature) => {
              const Icon = getFeatureIcon(feature.name);
              const link = getFeatureLink(feature.name);
              const isEnabled = feature.is_enabled && link;

              return (
                <div
                  key={feature.id}
                  className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                      <Icon className="text-blue-600 dark:text-blue-400" size={20} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                        {feature.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                        {feature.description}
                      </p>
                      <div className="mt-2">
                        {isEnabled ? (
                          <a
                            href={link}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            Try It Now
                            <ArrowRight size={14} />
                          </a>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded text-xs font-medium">
                            Coming Soon
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
              Share Your Feedback
            </h3>
            <button
              onClick={() => setShowFeedbackForm(!showFeedbackForm)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              {showFeedbackForm ? 'Cancel' : 'New Feedback'}
            </button>
          </div>

          {showFeedbackForm && (
            <form onSubmit={handleSubmitFeedback} className="space-y-4 mb-6 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Feature
                </label>
                <select
                  value={feedbackForm.feature_name}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, feature_name: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-white"
                  required
                >
                  <option value="">Select a feature</option>
                  {features.map((feature) => (
                    <option key={feature.id} value={feature.name}>
                      {feature.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                  <option value="general">General App Feedback</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Type
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {['bug', 'suggestion', 'praise', 'other'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFeedbackForm({ ...feedbackForm, feedback_type: type })}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        feedbackForm.feedback_type === type
                          ? 'bg-blue-500 text-white'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={feedbackForm.title}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, title: e.target.value })}
                  placeholder="Brief summary of your feedback"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={feedbackForm.description}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, description: e.target.value })}
                  placeholder="Provide detailed feedback..."
                  rows={4}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Overall Rating: {feedbackForm.rating}/5
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={feedbackForm.rating}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, rating: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <span>Poor</span>
                  <span>Excellent</span>
                </div>
              </div>

              {submitError && (
                <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <AlertTriangle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={16} />
                  <p className="text-sm text-red-800 dark:text-red-200">{submitError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 disabled:dark:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                <Send size={18} />
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>
          )}

          {myFeedback.length > 0 ? (
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900 dark:text-white">Your Feedback</h4>
              {myFeedback.map((feedback) => {
                const Icon = getFeedbackIcon(feedback.feedback_type);
                return (
                  <div
                    key={feedback.id}
                    className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        feedback.feedback_type === 'bug'
                          ? 'bg-red-100 dark:bg-red-900/30'
                          : feedback.feedback_type === 'praise'
                          ? 'bg-green-100 dark:bg-green-900/30'
                          : 'bg-blue-100 dark:bg-blue-900/30'
                      }`}>
                        <Icon className={
                          feedback.feedback_type === 'bug'
                            ? 'text-red-600 dark:text-red-400'
                            : feedback.feedback_type === 'praise'
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-blue-600 dark:text-blue-400'
                        } size={16} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h5 className="font-semibold text-slate-900 dark:text-white">{feedback.title}</h5>
                          <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {new Date(feedback.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                          {feedback.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-1 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded">
                            {feedback.feature_name.replace(/_/g, ' ')}
                          </span>
                          {feedback.rating && (
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              Rating: {feedback.rating}/5
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-600 dark:text-slate-400">
              <p>No feedback submitted yet. Be the first to share your thoughts!</p>
            </div>
          )}
        </div>

        <div className="glass rounded-xl p-6 shadow-sm bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Thank You for Being a Beta Tester!
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            Your feedback is invaluable in shaping the future of Poetry Suite. As features are developed and tested, they will appear on this page for you to try out. Keep checking back for new experimental features!
          </p>
        </div>
      </div>
    </div>
  );
}
