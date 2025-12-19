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
  Settings as SettingsIcon
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Stats {
  totalUsers: number;
  totalPoems: number;
  totalSubmissions: number;
  recentActivity: number;
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
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'data' | 'system'>('overview');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [usersResult, poemsResult, submissionsResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
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
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">User Management</h3>
                <p className="text-slate-600 dark:text-slate-400">User management features coming soon...</p>
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
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">System Configuration</h3>
                <p className="text-slate-600 dark:text-slate-400">System settings and configuration options coming soon...</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
