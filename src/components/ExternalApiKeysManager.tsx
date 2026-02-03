import { useState, useEffect } from 'react';
import { Key, Copy, Plus, Trash2, Activity, Clock, CheckCircle, XCircle, Eye, TrendingUp } from 'lucide-react';

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  permissions: {
    read_poems?: boolean;
    read_public_profiles?: boolean;
    read_contests?: boolean;
    read_badges?: boolean;
    read_workshops?: boolean;
  };
  is_active: boolean;
  rate_limit_per_hour: number;
  last_used_at: string | null;
  created_at: string;
  expires_at: string | null;
  full_key?: string;
}

interface UsageRecord {
  id: string;
  endpoint: string;
  method: string;
  status_code: number;
  ip_address: string;
  created_at: string;
}

interface UsageStats {
  total_requests: number;
  requests_today: number;
  requests_this_hour: number;
  avg_response_time: number;
}

export default function ExternalApiKeysManager() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [usageRecords, setUsageRecords] = useState<UsageRecord[]>([]);
  const [stats, setStats] = useState<UsageStats>({
    total_requests: 0,
    requests_today: 0,
    requests_this_hour: 0,
    avg_response_time: 0
  });
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyRateLimit, setNewKeyRateLimit] = useState(1000);
  const [newKeyPermissions, setNewKeyPermissions] = useState({
    read_poems: true,
    read_public_profiles: true,
    read_contests: false,
    read_badges: false,
    read_workshops: false
  });
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [showUsageModal, setShowUsageModal] = useState(false);

  useEffect(() => {
    loadApiKeys();
    loadUsageStats();
  }, []);

  const loadApiKeys = async () => {
    try {
      const { supabase } = await import('../lib/supabase');
      const { data } = await supabase
        .from('external_api_keys')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        setApiKeys(data);
      }
    } catch (error) {
      console.error('Error loading API keys:', error);
    }
  };

  const loadUsageStats = async () => {
    try {
      const { supabase } = await import('../lib/supabase');

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());

      const { data: allUsage, count: totalCount } = await supabase
        .from('external_api_usage')
        .select('*', { count: 'exact' });

      const { count: todayCount } = await supabase
        .from('external_api_usage')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      const { count: hourCount } = await supabase
        .from('external_api_usage')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thisHour.toISOString());

      const avgTime = allUsage?.length
        ? allUsage.reduce((sum, r) => sum + (r.response_time_ms || 0), 0) / allUsage.length
        : 0;

      setStats({
        total_requests: totalCount || 0,
        requests_today: todayCount || 0,
        requests_this_hour: hourCount || 0,
        avg_response_time: Math.round(avgTime)
      });
    } catch (error) {
      console.error('Error loading usage stats:', error);
    }
  };

  const loadUsageForKey = async (keyId: string) => {
    try {
      const { supabase } = await import('../lib/supabase');
      const { data } = await supabase
        .from('external_api_usage')
        .select('*')
        .eq('api_key_id', keyId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (data) {
        setUsageRecords(data);
        setShowUsageModal(true);
      }
    } catch (error) {
      console.error('Error loading usage:', error);
    }
  };

  const generateApiKey = async () => {
    if (!newKeyName.trim()) return;

    try {
      const { supabase } = await import('../lib/supabase');
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      const fullKey = 'sk_' + Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      const keyPrefix = fullKey.substring(0, 12);

      const { error } = await supabase
        .from('external_api_keys')
        .insert({
          name: newKeyName,
          key_hash: fullKey,
          key_prefix: keyPrefix,
          permissions: newKeyPermissions,
          rate_limit_per_hour: newKeyRateLimit,
          created_by: user.id,
          is_active: true
        });

      if (error) throw error;

      setNewlyCreatedKey(fullKey);
      setNewKeyName('');
      setNewKeyRateLimit(1000);
      setNewKeyPermissions({
        read_poems: true,
        read_public_profiles: true,
        read_contests: false,
        read_badges: false,
        read_workshops: false
      });
      loadApiKeys();
    } catch (error) {
      console.error('Error generating API key:', error);
    }
  };

  const toggleKeyStatus = async (keyId: string, currentStatus: boolean) => {
    try {
      const { supabase } = await import('../lib/supabase');
      await supabase
        .from('external_api_keys')
        .update({ is_active: !currentStatus })
        .eq('id', keyId);

      loadApiKeys();
    } catch (error) {
      console.error('Error toggling key status:', error);
    }
  };

  const deleteApiKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return;
    }

    try {
      const { supabase } = await import('../lib/supabase');
      await supabase
        .from('external_api_keys')
        .delete()
        .eq('id', keyId);

      loadApiKeys();
    } catch (error) {
      console.error('Error deleting API key:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <Key className="text-blue-600 dark:text-blue-400" size={24} />
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{apiKeys.filter(k => k.is_active).length}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">Active Keys</p>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">{apiKeys.length} total</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <Activity className="text-green-600 dark:text-green-400" size={24} />
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.total_requests.toLocaleString()}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">Total Requests</p>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">{stats.requests_today} today</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="text-purple-600 dark:text-purple-400" size={24} />
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.requests_this_hour}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">Requests This Hour</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <Clock className="text-orange-600 dark:text-orange-400" size={24} />
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.avg_response_time}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">Avg Response (ms)</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">API Keys</h2>
          <button
            onClick={() => setShowNewKeyModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus size={18} />
            New API Key
          </button>
        </div>

        {apiKeys.length === 0 ? (
          <div className="text-center py-12">
            <Key className="mx-auto mb-4 text-slate-300 dark:text-slate-600" size={48} />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No API Keys Yet</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">Create your first API key to allow external access.</p>
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
              <div key={key.id} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-slate-900 dark:text-white">{key.name}</h3>
                      <span className={`px-2 py-0.5 text-xs rounded ${
                        key.is_active
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      }`}>
                        {key.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <code className="text-sm font-mono text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-1 rounded">
                        {key.key_prefix}...
                      </code>
                      <button
                        onClick={() => copyToClipboard(key.key_prefix)}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors"
                        title="Copy prefix"
                      >
                        <Copy size={14} className="text-slate-600 dark:text-slate-400" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {Object.entries(key.permissions).map(([perm, enabled]) => enabled && (
                        <span key={perm} className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded">
                          {perm.replace('read_', '').replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-500">
                      Rate limit: {key.rate_limit_per_hour}/hour • Created {new Date(key.created_at).toLocaleDateString()}
                      {key.last_used_at && ` • Last used ${new Date(key.last_used_at).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => loadUsageForKey(key.id)}
                      className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors"
                      title="View usage"
                    >
                      <Eye size={18} className="text-slate-600 dark:text-slate-400" />
                    </button>
                    <button
                      onClick={() => toggleKeyStatus(key.id, key.is_active)}
                      className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors"
                      title={key.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {key.is_active ? (
                        <XCircle size={18} className="text-red-600 dark:text-red-400" />
                      ) : (
                        <CheckCircle size={18} className="text-green-600 dark:text-green-400" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteApiKey(key.id)}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} className="text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showNewKeyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Create New API Key</h3>
            {!newlyCreatedKey ? (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Key Name
                    </label>
                    <input
                      type="text"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      placeholder="e.g., Mobile App API"
                      className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Rate Limit (requests per hour)
                    </label>
                    <input
                      type="number"
                      value={newKeyRateLimit}
                      onChange={(e) => setNewKeyRateLimit(parseInt(e.target.value) || 1000)}
                      className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                      Permissions
                    </label>
                    <div className="space-y-2">
                      {Object.entries(newKeyPermissions).map(([perm, enabled]) => (
                        <label key={perm} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={enabled}
                            onChange={(e) => setNewKeyPermissions({ ...newKeyPermissions, [perm]: e.target.checked })}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-sm text-slate-700 dark:text-slate-300">
                            {perm.replace('read_', 'Read ').replace(/_/g, ' ')}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
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

      {showUsageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">API Usage</h3>
              <button
                onClick={() => setShowUsageModal(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
              >
                <XCircle size={20} className="text-slate-600 dark:text-slate-400" />
              </button>
            </div>

            {usageRecords.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="mx-auto mb-4 text-slate-300 dark:text-slate-600" size={48} />
                <p className="text-slate-600 dark:text-slate-400">No usage records yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">Time</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">Method</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">Endpoint</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">IP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {usageRecords.map(record => (
                      <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                        <td className="px-4 py-3 text-sm text-slate-900 dark:text-white whitespace-nowrap">
                          {new Date(record.created_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded font-mono">
                            {record.method}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 font-mono">
                          {record.endpoint}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 text-xs rounded ${
                            record.status_code >= 200 && record.status_code < 300
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : record.status_code >= 400
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-400'
                          }`}>
                            {record.status_code}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 font-mono">
                          {record.ip_address || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
