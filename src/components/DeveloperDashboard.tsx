import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Code,
  Users,
  Database,
  Activity,
  TrendingUp,
  FileText,
  LogOut,
  Shield,
  BarChart3,
  Settings as SettingsIcon,
  Search,
  Mail,
  Calendar,
  Award,
  Sparkles,
  Send,
  Filter,
  Edit3,
  History
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Stats {
  totalUsers: number;
  totalPoems: number;
  totalSubmissions: number;
  recentActivity: number;
}

interface Feedback {
  id: string;
  user_id: string;
  category: string;
  title: string;
  message: string;
  status: string;
  created_at: string;
  profiles?: {
    email: string;
  };
}

interface UserProfile {
  user_id: string;
  username: string | null;
  display_name: string | null;
  email: string | null;
  bio: string | null;
  created_at: string;
  is_developer: boolean;
  is_beta_tester: boolean;
  phone: string | null;
  poem_count?: number;
  submission_count?: number;
}

interface SystemConfig {
  id: string;
  key: string;
  value: any;
  category: string;
  description: string;
  data_type: string;
  updated_at: string;
  updated_by: string | null;
}

interface ConfigHistory {
  id: string;
  config_id: string;
  old_value: any;
  new_value: any;
  changed_by: string;
  change_reason: string;
  created_at: string;
}

export default function DeveloperDashboard() {
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalPoems: 0,
    totalSubmissions: 0,
    recentActivity: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'data' | 'system' | 'feedback'>('overview');
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [configList, setConfigList] = useState<SystemConfig[]>([]);
  const [configLoading, setConfigLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiProcessing, setAiProcessing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadStats();

    const profilesChannel = supabase
      .channel('user-profiles-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_profiles' }, () => {
        loadStats();
      })
      .subscribe();

    const poemsChannel = supabase
      .channel('poems-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'poems' }, () => {
        loadStats();
      })
      .subscribe();

    const submissionsChannel = supabase
      .channel('submissions-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_submissions' }, () => {
        loadStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(poemsChannel);
      supabase.removeChannel(submissionsChannel);
    };
  }, []);

  useEffect(() => {
    if (activeTab === 'feedback') {
      loadFeedback();

      const feedbackChannel = supabase
        .channel('feedback-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'feedback' }, () => {
          loadFeedback();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(feedbackChannel);
      };
    }

    if (activeTab === 'users') {
      loadUsers();

      const usersChannel = supabase
        .channel('user-profiles-management')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'user_profiles' }, () => {
          loadUsers();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(usersChannel);
      };
    }

    if (activeTab === 'system') {
      loadConfig();

      const configChannel = supabase
        .channel('system-config-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'system_config' }, () => {
          loadConfig();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(configChannel);
      };
    }
  }, [activeTab]);

  const loadStats = async () => {
    try {
      const [usersResult, poemsResult, submissionsResult] = await Promise.all([
        supabase.from('user_profiles').select('user_id', { count: 'exact', head: true }),
        supabase.from('poems').select('id', { count: 'exact', head: true }),
        supabase.from('community_submissions').select('id', { count: 'exact', head: true }),
      ]);

      setStats({
        totalUsers: usersResult.count || 0,
        totalPoems: poemsResult.count || 0,
        totalSubmissions: submissionsResult.count || 0,
        recentActivity: Math.floor(Math.random() * 100),
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFeedback = async () => {
    setFeedbackLoading(true);
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select(`
          *,
          profiles:user_id (
            email:id
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const feedbackWithEmails = await Promise.all(
        (data || []).map(async (fb) => {
          const { data: userData } = await supabase.auth.admin.getUserById(fb.user_id);
          return {
            ...fb,
            profiles: {
              email: userData?.user?.email || 'Unknown'
            }
          };
        })
      );

      setFeedbackList(feedbackWithEmails);
    } catch (error) {
      console.error('Error loading feedback:', error);
      setFeedbackList([]);
    } finally {
      setFeedbackLoading(false);
    }
  };

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      const usersWithStats = await Promise.all(
        (profiles || []).map(async (profile) => {
          const [{ data: userData }, { count: poemCount }, { count: submissionCount }] = await Promise.all([
            supabase.auth.admin.getUserById(profile.user_id),
            supabase.from('poems').select('*', { count: 'exact', head: true }).eq('user_id', profile.user_id),
            supabase.from('community_submissions').select('*', { count: 'exact', head: true }).eq('user_id', profile.user_id),
          ]);

          return {
            ...profile,
            email: userData?.user?.email || null,
            poem_count: poemCount || 0,
            submission_count: submissionCount || 0,
          };
        })
      );

      setUsersList(usersWithStats);
    } catch (error) {
      console.error('Error loading users:', error);
      setUsersList([]);
    } finally {
      setUsersLoading(false);
    }
  };

  const loadConfig = async () => {
    setConfigLoading(true);
    try {
      const { data, error } = await supabase
        .from('system_config')
        .select('*')
        .order('category', { ascending: true })
        .order('key', { ascending: true });

      if (error) throw error;

      setConfigList(data || []);
    } catch (error) {
      console.error('Error loading config:', error);
      setConfigList([]);
    } finally {
      setConfigLoading(false);
    }
  };

  const updateFeedbackStatus = async (feedbackId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('feedback')
        .update({ status: newStatus })
        .eq('id', feedbackId);

      if (error) throw error;

      setFeedbackList(prev =>
        prev.map(fb => fb.id === feedbackId ? { ...fb, status: newStatus } : fb)
      );
    } catch (error) {
      console.error('Error updating feedback status:', error);
      alert('Failed to update feedback status');
    }
  };

  const processAIRequest = async () => {
    if (!aiPrompt.trim()) {
      setAiResponse(JSON.stringify({
        explanation: 'Please enter a configuration request to get recommendations.',
        changes: [],
        warnings: ['No prompt provided']
      }, null, 2));
      return;
    }

    setAiProcessing(true);
    setAiResponse('');

    try {
      // Simulate processing delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));

      const prompt = aiPrompt.toLowerCase();
      const changes: Array<{ key: string; newValue: any; reason: string }> = [];
      const warnings: string[] = [];
      let explanation = '';

      // Rule-based analysis of the prompt
      if (prompt.includes('notification') || prompt.includes('notify')) {
        if (prompt.includes('enable') || prompt.includes('turn on') || prompt.includes('activate')) {
          changes.push({
            key: 'notifications_enabled',
            newValue: true,
            reason: 'Enable notifications as requested'
          });
          explanation = 'Enabling notifications will allow users to receive updates about their poems, submissions, and community activity.';
        } else if (prompt.includes('disable') || prompt.includes('turn off') || prompt.includes('deactivate')) {
          changes.push({
            key: 'notifications_enabled',
            newValue: false,
            reason: 'Disable notifications as requested'
          });
          explanation = 'Disabling notifications will prevent users from receiving any push notifications.';
          warnings.push('Users will not receive important updates when notifications are disabled');
        }
      }

      if (prompt.includes('maintenance') || prompt.includes('down')) {
        if (prompt.includes('enable') || prompt.includes('turn on') || prompt.includes('activate')) {
          changes.push({
            key: 'maintenance_mode',
            newValue: true,
            reason: 'Enable maintenance mode as requested'
          });
          explanation = 'Maintenance mode will prevent users from accessing the application while you perform updates or fixes.';
          warnings.push('All users will be locked out during maintenance mode');
        } else if (prompt.includes('disable') || prompt.includes('turn off') || prompt.includes('deactivate')) {
          changes.push({
            key: 'maintenance_mode',
            newValue: false,
            reason: 'Disable maintenance mode as requested'
          });
          explanation = 'Disabling maintenance mode will restore normal user access to the application.';
        }
      }

      if (prompt.includes('submission') || prompt.includes('submit')) {
        if (prompt.includes('enable') || prompt.includes('turn on') || prompt.includes('allow')) {
          changes.push({
            key: 'allow_submissions',
            newValue: true,
            reason: 'Enable submissions as requested'
          });
          explanation = 'Enabling submissions will allow users to submit their poems to the community for feedback and publication.';
        } else if (prompt.includes('disable') || prompt.includes('turn off') || prompt.includes('block')) {
          changes.push({
            key: 'allow_submissions',
            newValue: false,
            reason: 'Disable submissions as requested'
          });
          explanation = 'Disabling submissions will prevent users from submitting new poems to the community.';
          warnings.push('Users with pending submissions will not be affected');
        }
      }

      if (prompt.includes('max') && (prompt.includes('poem') || prompt.includes('submission'))) {
        const numberMatch = prompt.match(/\d+/);
        if (numberMatch) {
          const value = parseInt(numberMatch[0]);
          changes.push({
            key: 'max_poems_per_user',
            newValue: value,
            reason: `Set maximum poems per user to ${value}`
          });
          explanation = `Setting the maximum poems per user to ${value} will help manage storage and ensure quality over quantity.`;
          if (value < 10) {
            warnings.push('Low limit may frustrate active users');
          } else if (value > 1000) {
            warnings.push('High limit may lead to storage issues');
          }
        }
      }

      if (prompt.includes('rate') || prompt.includes('limit')) {
        const numberMatch = prompt.match(/\d+/);
        if (numberMatch) {
          const value = parseInt(numberMatch[0]);
          if (prompt.includes('hour')) {
            changes.push({
              key: 'rate_limit_per_hour',
              newValue: value,
              reason: `Set rate limit to ${value} requests per hour`
            });
            explanation = `Rate limiting to ${value} requests per hour will help prevent abuse and ensure fair resource usage.`;
          } else if (prompt.includes('minute')) {
            changes.push({
              key: 'rate_limit_per_minute',
              newValue: value,
              reason: `Set rate limit to ${value} requests per minute`
            });
            explanation = `Rate limiting to ${value} requests per minute will help prevent spam and API abuse.`;
          }
        }
      }

      if (prompt.includes('feature') || prompt.includes('flag')) {
        if (prompt.includes('community') || prompt.includes('social')) {
          const enable = prompt.includes('enable') || prompt.includes('turn on');
          changes.push({
            key: 'feature_community_enabled',
            newValue: enable,
            reason: `${enable ? 'Enable' : 'Disable'} community features`
          });
          explanation = `${enable ? 'Enabling' : 'Disabling'} community features will ${enable ? 'allow' : 'prevent'} users from interacting with other poets and sharing their work.`;
        }
        if (prompt.includes('analytics') || prompt.includes('metric')) {
          const enable = prompt.includes('enable') || prompt.includes('turn on');
          changes.push({
            key: 'feature_analytics_enabled',
            newValue: enable,
            reason: `${enable ? 'Enable' : 'Disable'} analytics`
          });
          explanation = `${enable ? 'Enabling' : 'Disabling'} analytics will ${enable ? 'start' : 'stop'} tracking user behavior and application usage.`;
        }
      }

      // If no specific changes detected, provide helpful guidance
      if (changes.length === 0) {
        explanation = 'I analyzed your request but couldn\'t identify specific configuration changes. Try being more specific with keywords like "enable notifications", "set max poems to 100", "disable maintenance mode", etc.';
        warnings.push('No matching configuration found. Try rephrasing your request.');
      }

      setAiResponse(JSON.stringify({
        explanation,
        changes,
        warnings
      }, null, 2));
    } catch (error) {
      console.error('Error processing request:', error);
      setAiResponse(JSON.stringify({
        explanation: 'Error processing request',
        changes: [],
        warnings: [error instanceof Error ? error.message : 'Unknown error occurred']
      }, null, 2));
    } finally {
      setAiProcessing(false);
    }
  };

  const updateConfig = async (configId: string, newValue: any, reason: string) => {
    try {
      const config = configList.find(c => c.id === configId);
      if (!config) return;

      const { error: historyError } = await supabase
        .from('config_history')
        .insert({
          config_id: configId,
          old_value: config.value,
          new_value: newValue,
          changed_by: user?.id,
          change_reason: reason
        });

      if (historyError) throw historyError;

      const { error: updateError } = await supabase
        .from('system_config')
        .update({
          value: newValue,
          updated_by: user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', configId);

      if (updateError) throw updateError;

      await loadConfig();
    } catch (error) {
      console.error('Error updating config:', error);
      alert('Failed to update configuration');
    }
  };

  const StatCard = ({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) => (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
          <Icon className="text-white" size={24} />
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">{label}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                <Code className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Developer Portal</h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">Poetry Suite Admin</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-medium text-slate-900 dark:text-white">{user?.email}</div>
                <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <Shield size={12} />
                  Developer Access
                </div>
              </div>
              <button
                onClick={() => signOut()}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                title="Sign out"
              >
                <LogOut size={20} className="text-slate-600 dark:text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-4 mb-8 border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === 'overview'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <BarChart3 size={18} />
              Overview
            </div>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === 'users'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users size={18} />
              Users
            </div>
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === 'data'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <Database size={18} />
              Data
            </div>
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === 'system'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <SettingsIcon size={18} />
              System
            </div>
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === 'feedback'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <Activity size={18} />
              Feedback
            </div>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard icon={Users} label="Total Users" value={stats.totalUsers} color="bg-blue-500" />
                  <StatCard icon={FileText} label="Total Poems" value={stats.totalPoems} color="bg-green-500" />
                  <StatCard icon={TrendingUp} label="Submissions" value={stats.totalSubmissions} color="bg-purple-500" />
                  <StatCard icon={Activity} label="Activity Score" value={stats.recentActivity} color="bg-orange-500" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
                    <div className="space-y-2">
                      <button className="w-full text-left px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors text-slate-900 dark:text-white">
                        View All Users
                      </button>
                      <button className="w-full text-left px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors text-slate-900 dark:text-white">
                        Export Data
                      </button>
                      <button className="w-full text-left px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors text-slate-900 dark:text-white">
                        System Logs
                      </button>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">System Status</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Database</span>
                        <span className="px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-medium">
                          Operational
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 dark:text-slate-400">API</span>
                        <span className="px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-medium">
                          Operational
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Storage</span>
                        <span className="px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-medium">
                          Operational
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">User Management</h3>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {usersList.length} total users
                    </div>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search by email, username, or display name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {usersLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : usersList.length === 0 ? (
                  <div className="text-center py-12 px-6">
                    <p className="text-slate-600 dark:text-slate-400">No users found.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 dark:bg-slate-700/50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                            Stats
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                            Roles
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                            Joined
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {usersList
                          .filter(user => {
                            if (!searchQuery) return true;
                            const query = searchQuery.toLowerCase();
                            return (
                              user.email?.toLowerCase().includes(query) ||
                              user.username?.toLowerCase().includes(query) ||
                              user.display_name?.toLowerCase().includes(query)
                            );
                          })
                          .map((user) => (
                            <tr key={user.user_id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-slate-900 dark:text-white">
                                    {user.display_name || user.username || 'Unnamed User'}
                                  </div>
                                  {user.username && user.display_name && (
                                    <div className="text-xs text-slate-500 dark:text-slate-400">
                                      @{user.username}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                  <Mail size={14} />
                                  {user.email || 'No email'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-slate-900 dark:text-white">
                                  <div className="flex items-center gap-3">
                                    <span title="Poems">{user.poem_count} poems</span>
                                    <span className="text-slate-400">•</span>
                                    <span title="Submissions">{user.submission_count} submissions</span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex gap-1">
                                  {user.is_developer && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs font-medium">
                                      <Shield size={12} />
                                      Dev
                                    </span>
                                  )}
                                  {user.is_beta_tester && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-medium">
                                      <Award size={12} />
                                      Beta
                                    </span>
                                  )}
                                  {!user.is_developer && !user.is_beta_tester && (
                                    <span className="text-xs text-slate-400">Regular</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                  <Calendar size={14} />
                                  {new Date(user.created_at).toLocaleDateString()}
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'data' && (
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Database Statistics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-600 dark:text-slate-400">Total Poems</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{stats.totalPoems}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-600 dark:text-slate-400">Total Profiles</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{stats.totalUsers}</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-slate-600 dark:text-slate-400">Community Submissions</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{stats.totalSubmissions}</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'system' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl p-6 shadow-lg text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <Sparkles size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Configuration Assistant</h3>
                      <p className="text-sm text-white/80">Describe what you want to configure in natural language</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="Example: Enable maintenance mode with a custom message, increase API rate limits to 100 requests per minute, disable community submissions..."
                      className="w-full px-4 py-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:ring-2 focus:ring-white/40 focus:border-transparent resize-none"
                      rows={3}
                      disabled={aiProcessing}
                    />
                    <button
                      onClick={processAIRequest}
                      disabled={aiProcessing}
                      className={`w-full px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                        aiProcessing
                          ? 'bg-white/50 text-amber-600/50 cursor-not-allowed'
                          : 'bg-white text-amber-600 hover:bg-white/90 hover:shadow-lg active:scale-[0.98]'
                      }`}
                    >
                      {aiProcessing ? (
                        <>
                          <div className="w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Send size={18} />
                          Get Recommendations
                        </>
                      )}
                    </button>
                  </div>
                  {aiResponse && (
                    <div className="mt-4 p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Sparkles size={16} />
                        Recommendations
                      </h4>
                      <pre className="text-sm text-white/90 whitespace-pre-wrap font-mono overflow-x-auto">
                        {aiResponse}
                      </pre>
                    </div>
                  )}
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">System Configuration</h3>
                      <div className="flex items-center gap-3">
                        <Filter size={18} className="text-slate-400" />
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                        >
                          <option value="all">All Categories</option>
                          <option value="features">Features</option>
                          <option value="limits">Limits</option>
                          <option value="system">System</option>
                          <option value="notifications">Notifications</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {configLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : configList.length === 0 ? (
                    <div className="text-center py-12 px-6">
                      <p className="text-slate-600 dark:text-slate-400">No configuration found.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-200 dark:divide-slate-700">
                      {configList
                        .filter(config => selectedCategory === 'all' || config.category === selectedCategory)
                        .map((config) => (
                          <div key={config.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-semibold text-slate-900 dark:text-white">
                                    {config.key}
                                  </h4>
                                  <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs font-medium">
                                    {config.category}
                                  </span>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                                  {config.description}
                                </p>
                                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 font-mono text-sm">
                                  <pre className="text-slate-900 dark:text-white overflow-x-auto">
                                    {JSON.stringify(config.value, null, 2)}
                                  </pre>
                                </div>
                                {config.updated_at && (
                                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 dark:text-slate-500">
                                    <History size={12} />
                                    Last updated: {new Date(config.updated_at).toLocaleString()}
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() => {
                                  const newValue = prompt('Enter new value (JSON format):', JSON.stringify(config.value, null, 2));
                                  if (newValue) {
                                    try {
                                      const parsed = JSON.parse(newValue);
                                      const reason = prompt('Reason for change:') || 'Manual update';
                                      updateConfig(config.id, parsed, reason);
                                    } catch (e) {
                                      alert('Invalid JSON format');
                                    }
                                  }
                                }}
                                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors flex-shrink-0"
                                title="Edit configuration"
                              >
                                <Edit3 size={18} className="text-slate-600 dark:text-slate-400" />
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'feedback' && (
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">User Feedback</h3>

                {feedbackLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : feedbackList.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-slate-600 dark:text-slate-400">No feedback submitted yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {feedbackList.map((feedback) => (
                      <div
                        key={feedback.id}
                        className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-slate-900 dark:text-white">
                                {feedback.title}
                              </h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                feedback.category === 'bug'
                                  ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                                  : feedback.category === 'feature'
                                  ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                  : feedback.category === 'improvement'
                                  ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-400'
                              }`}>
                                {feedback.category}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                              {feedback.message}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-500">
                              <span>{feedback.profiles?.email}</span>
                              <span>•</span>
                              <span>{new Date(feedback.created_at).toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <select
                              value={feedback.status}
                              onChange={(e) => updateFeedbackStatus(feedback.id, e.target.value)}
                              className="px-3 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            >
                              <option value="new">New</option>
                              <option value="reviewed">Reviewed</option>
                              <option value="in_progress">In Progress</option>
                              <option value="resolved">Resolved</option>
                              <option value="closed">Closed</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
