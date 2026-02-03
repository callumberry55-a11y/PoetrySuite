import { useState, useEffect } from 'react';
import { Key, Copy, Plus, Trash2, Activity, Coins, TrendingUp, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ApiKey {
  id: string;
  key_prefix: string;
  name: string;
  is_active: boolean;
  last_used_at: string;
  created_at: string;
  full_key?: string;
}

interface PointAccount {
  balance_points: number;
  balance_gbp: number;
  total_earned: number;
  total_spent: number;
}

interface Transaction {
  id: string;
  transaction_type: string;
  amount_points: number;
  endpoint: string;
  created_at: string;
  metadata: any;
}

interface DeveloperProfile {
  id: string;
  email: string;
  organization_name: string;
  subscription_status: string;
  is_verified: boolean;
}

export default function DeveloperDashboard() {
  const [profile, setProfile] = useState<DeveloperProfile | null>(null);
  const [pointAccount, setPointAccount] = useState<PointAccount | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'keys' | 'usage' | 'billing'>('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  useEffect(() => {
    loadDeveloperData();
  }, []);

  useEffect(() => {
    if (!profile) return;

    const devChannel = supabase
      .channel('developer-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'paas_developers',
          filter: `id=eq.${profile.id}`
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setProfile(payload.new as DeveloperProfile);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'paas_point_accounts',
          filter: `developer_id=eq.${profile.id}`
        },
        (payload) => {
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const newAccount = payload.new as PointAccount;
            setPointAccount(prev => {
              if (prev && newAccount.balance_points !== prev.balance_points) {
                const diff = parseFloat(newAccount.balance_points.toString()) - parseFloat(prev.balance_points.toString());
                if (diff !== 0) {
                  console.log(`Points ${diff > 0 ? 'added' : 'deducted'}: ${Math.abs(diff)}`);
                }
              }
              return newAccount;
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'paas_api_keys',
          filter: `developer_id=eq.${profile.id}`
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const { data: keysData } = await supabase
              .from('paas_api_keys')
              .select('*')
              .eq('developer_id', profile.id)
              .order('created_at', { ascending: false });
            if (keysData) setApiKeys(keysData);
          } else if (payload.eventType === 'UPDATE') {
            setApiKeys(prev =>
              prev.map(key => key.id === payload.new.id ? payload.new as ApiKey : key)
            );
          } else if (payload.eventType === 'DELETE') {
            setApiKeys(prev => prev.filter(key => key.id !== payload.old.id));
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'paas_transactions',
          filter: `developer_id=eq.${profile.id}`
        },
        async (payload) => {
          const { data: txData } = await supabase
            .from('paas_transactions')
            .select('*')
            .eq('developer_id', profile.id)
            .order('created_at', { ascending: false })
            .limit(20);
          if (txData) {
            setTransactions(txData);
            const newTx = payload.new as Transaction;
            console.log(`New transaction: ${newTx.transaction_type} - ${newTx.amount_points} points`);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setRealtimeConnected(true);
          console.log('Real-time connected');
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setRealtimeConnected(false);
          console.log('Real-time disconnected');
        }
      });

    return () => {
      supabase.removeChannel(devChannel);
      setRealtimeConnected(false);
    };
  }, [profile]);

  const loadDeveloperData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('Not authenticated');
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const { data: devData, error: devError } = await supabase
        .from('paas_developers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (devError || !devData) {
        setError('Developer profile not found');
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const [
        { data: accountData },
        { data: keysData },
        { data: txData }
      ] = await Promise.all([
        supabase
          .from('paas_point_accounts')
          .select('*')
          .eq('developer_id', devData.id)
          .maybeSingle(),
        supabase
          .from('paas_api_keys')
          .select('*')
          .eq('developer_id', devData.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('paas_transactions')
          .select('*')
          .eq('developer_id', devData.id)
          .order('created_at', { ascending: false })
          .limit(20)
      ]);

      setProfile(devData);
      setPointAccount(accountData || null);
      setApiKeys(keysData || []);
      setTransactions(txData || []);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Error loading developer data:', error);
      setError('Failed to load dashboard data');
      setLoading(false);
      setRefreshing(false);
    }
  };

  const generateApiKey = async () => {
    if (!newKeyName.trim() || !profile) return;

    try {
      const fullKey = 'pk_' + Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      const keyPrefix = fullKey.substring(0, 12);

      const { error } = await supabase
        .from('paas_api_keys')
        .insert({
          developer_id: profile.id,
          key_hash: fullKey,
          key_prefix: keyPrefix,
          name: newKeyName,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      setNewlyCreatedKey(fullKey);
      setNewKeyName('');

      const { data: keysData } = await supabase
        .from('paas_api_keys')
        .select('*')
        .eq('developer_id', profile.id)
        .order('created_at', { ascending: false });

      setApiKeys(keysData || []);
    } catch (error) {
      console.error('Error generating API key:', error);
    }
  };

  const revokeApiKey = async (keyId: string) => {
    if (!profile) return;

    try {
      await supabase
        .from('paas_api_keys')
        .update({ is_active: false })
        .eq('id', keyId);

      const { data: keysData } = await supabase
        .from('paas_api_keys')
        .select('*')
        .eq('developer_id', profile.id)
        .order('created_at', { ascending: false });

      setApiKeys(keysData || []);
    } catch (error) {
      console.error('Error revoking API key:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Activity className="animate-spin mx-auto mb-4 text-blue-600" size={48} />
          <p className="text-slate-600 dark:text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="mx-auto mb-4 text-red-600" size={48} />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Unable to Load Dashboard</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">{error || 'Developer profile not found'}</p>
          <button
            onClick={() => loadDeveloperData()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Developer Dashboard</h1>
            <p className="text-slate-600 dark:text-slate-400">{profile.email}</p>
            <div className="flex gap-2 mt-2">
              <span className={`px-3 py-1 text-sm rounded-full ${
                profile.subscription_status === 'active'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-400'
              }`}>
                {profile.subscription_status}
              </span>
              {profile.is_verified && (
                <span className="px-3 py-1 text-sm rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 flex items-center gap-1">
                  <CheckCircle size={14} />
                  Verified
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {realtimeConnected && (
              <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-700 dark:text-green-400 font-medium">Live</span>
              </div>
            )}
            <button
              onClick={() => loadDeveloperData(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh data"
            >
              <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('keys')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === 'keys'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            API Keys
          </button>
          <button
            onClick={() => setActiveTab('usage')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === 'usage'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            Usage
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === 'billing'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            Billing
          </button>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            {!profile.is_verified && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">Account Verification Pending</h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    Your account is pending verification. Some features may be limited until verification is complete.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <Coins className="text-blue-600 dark:text-blue-400" size={24} />
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {pointAccount ? parseFloat(pointAccount.balance_points.toString()).toLocaleString() : '0'}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Available Points</p>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                  ≈ £{pointAccount ? parseFloat(pointAccount.balance_gbp.toString()).toFixed(2) : '0.00'}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <Key className="text-green-600 dark:text-green-400" size={24} />
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{apiKeys.filter(k => k.is_active).length}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Active API Keys</p>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                  {apiKeys.length} total
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="text-purple-600 dark:text-purple-400" size={24} />
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {pointAccount ? parseFloat(pointAccount.total_earned.toString()).toLocaleString() : '0'}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Earned</p>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <Activity className="text-red-600 dark:text-red-400" size={24} />
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {pointAccount ? parseFloat(pointAccount.total_spent.toString()).toLocaleString() : '0'}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Spent</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Getting Started</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">Create an API Key</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Generate your first API key to start making requests to our platform.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">Read the Documentation</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Check out our API documentation to learn how to integrate with our services.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">Monitor Your Usage</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Track your API calls and point consumption in the Usage tab.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'keys' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">API Keys</h2>
              <button
                onClick={() => setShowNewKeyModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Plus size={18} />
                New Key
              </button>
            </div>

            {apiKeys.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-12 border border-slate-200 dark:border-slate-700 text-center">
                <Key className="mx-auto mb-4 text-slate-300 dark:text-slate-600" size={48} />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No API Keys Yet</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">Create your first API key to get started.</p>
                <button
                  onClick={() => setShowNewKeyModal(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Create API Key
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {apiKeys.map(key => (
                  <div key={key.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-200 dark:border-slate-700">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-slate-900 dark:text-white">{key.name}</h3>
                          <span className={`px-2 py-0.5 text-xs rounded ${
                            key.is_active
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          }`}>
                            {key.is_active ? 'Active' : 'Revoked'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <code className="text-sm font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                            {key.key_prefix}...
                          </code>
                          <button
                            onClick={() => copyToClipboard(key.key_prefix)}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                            title="Copy prefix"
                          >
                            <Copy size={16} className="text-slate-600 dark:text-slate-400" />
                          </button>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-500">
                          Created {new Date(key.created_at).toLocaleDateString()}
                          {key.last_used_at && ` • Last used ${new Date(key.last_used_at).toLocaleDateString()}`}
                        </p>
                      </div>
                      {key.is_active && (
                        <button
                          onClick={() => revokeApiKey(key.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                          Revoke
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'usage' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Recent Transactions</h2>
            {transactions.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-12 border border-slate-200 dark:border-slate-700 text-center">
                <Activity className="mx-auto mb-4 text-slate-300 dark:text-slate-600" size={48} />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Transactions Yet</h3>
                <p className="text-slate-600 dark:text-slate-400">Your API usage will appear here.</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">Endpoint</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">Points</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                      {transactions.map(tx => (
                        <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                            {new Date(tx.created_at).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded ${
                              tx.transaction_type === 'api_call'
                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                : tx.transaction_type === 'grant'
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-400'
                            }`}>
                              {tx.transaction_type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                            {tx.endpoint || '-'}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                            tx.amount_points > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                          }`}>
                            {tx.amount_points > 0 ? '+' : ''}{parseFloat(tx.amount_points.toString()).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Billing & Points</h2>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Point Balance</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Current Balance</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {pointAccount ? parseFloat(pointAccount.balance_points.toString()).toLocaleString() : '0'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">points</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">GBP Value</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    £{pointAccount ? parseFloat(pointAccount.balance_gbp.toString()).toFixed(2) : '0.00'}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Lifetime Earned</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {pointAccount ? parseFloat(pointAccount.total_earned.toString()).toLocaleString() : '0'}
                  </p>
                </div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">How Points Work</h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• 1 point = £0.75</li>
                  <li>• Points are deducted for each API call based on usage</li>
                  <li>• Add more points to continue using the platform</li>
                  <li>• Contact support for bulk point purchases</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {showNewKeyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Create New API Key</h3>
            {!newlyCreatedKey ? (
              <>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="Key name (e.g., Production API)"
                  className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white mb-4"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowNewKeyModal(false);
                      setNewKeyName('');
                    }}
                    className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={generateApiKey}
                    disabled={!newKeyName.trim()}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                  >
                    Generate
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
                    <p className="font-semibold text-green-900 dark:text-green-100">API Key Created!</p>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                    Copy this key now. You won't be able to see it again.
                  </p>
                  <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-3 rounded border border-green-300 dark:border-green-700">
                    <code className="flex-1 text-sm font-mono text-slate-900 dark:text-white break-all">
                      {newlyCreatedKey}
                    </code>
                    <button
                      onClick={() => copyToClipboard(newlyCreatedKey)}
                      className="flex-shrink-0 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                      title="Copy"
                    >
                      <Copy size={18} className="text-slate-600 dark:text-slate-400" />
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowNewKeyModal(false);
                    setNewlyCreatedKey(null);
                  }}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Done
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
