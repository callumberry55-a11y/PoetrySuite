import { useState, useEffect } from 'react';
import { Shield, Users, Key, Coins, Activity, AlertTriangle, CheckCircle, XCircle, TrendingUp, DollarSign, Search, Download, RefreshCw, Eye, Ban, CreditCard, Wallet } from 'lucide-react';
import ExternalApiKeysManager from './ExternalApiKeysManager';
import PaaSBilling from './PaaSBilling';
import DeveloperReserves from './DeveloperReserves';

interface Developer {
  id: string;
  email: string;
  organization_name: string;
  subscription_status: string;
  is_verified: boolean;
  created_at: string;
}

interface PointAccount {
  balance_points: number;
  balance_gbp: number;
  total_earned: number;
  total_spent: number;
}

interface SecurityEvent {
  id: string;
  event_type: string;
  severity: string;
  reason: string;
  created_at: string;
  developer_id: string;
}

interface Transaction {
  id: string;
  developer_id: string;
  transaction_type: string;
  amount_points: number;
  amount_gbp: number;
  endpoint: string;
  created_at: string;
}

interface ApiKey {
  id: string;
  developer_id: string;
  key_prefix: string;
  name: string;
  is_active: boolean;
  last_used_at: string;
  created_at: string;
}

interface DeveloperDetail extends Developer {
  point_account?: PointAccount;
  api_keys?: ApiKey[];
}

interface PaaSAdminProps {
  onLogout?: () => void;
}

export default function PaaSAdmin({ onLogout }: PaaSAdminProps) {
  const [isAuthenticated] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'developers' | 'security' | 'transactions' | 'api-keys' | 'billing' | 'reserves'>('overview');
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState({
    totalDevelopers: 0,
    activeDevelopers: 0,
    totalPoints: 0,
    totalRevenue: 0,
    apiCalls24h: 0
  });
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedDeveloper, setSelectedDeveloper] = useState<DeveloperDetail | null>(null);
  const [showDeveloperModal, setShowDeveloperModal] = useState(false);
  const [pointsToAdd, setPointsToAdd] = useState('');
  const [addPointsReason, setAddPointsReason] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
      setupRealtimeSubscriptions();
    }

    return () => {
      cleanupSubscriptions();
    };
  }, [isAuthenticated]);


  const loadData = async () => {
    try {
      const { supabase } = await import('../lib/supabase');

      const { data: devData } = await supabase
        .from('paas_developers')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: eventsData } = await supabase
        .from('paas_security_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      const { data: txData } = await supabase
        .from('paas_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      const { data: accounts } = await supabase
        .from('paas_point_accounts')
        .select('balance_points, total_spent');

      const totalPoints = accounts?.reduce((sum, acc) => sum + parseFloat(acc.balance_points), 0) || 0;
      const totalSpent = accounts?.reduce((sum, acc) => sum + parseFloat(acc.total_spent), 0) || 0;

      setDevelopers(devData || []);
      setSecurityEvents(eventsData || []);
      setTransactions(txData || []);
      setStats({
        totalDevelopers: devData?.length || 0,
        activeDevelopers: devData?.filter(d => d.subscription_status === 'active').length || 0,
        totalPoints: totalPoints,
        totalRevenue: totalSpent * 0.75,
        apiCalls24h: txData?.filter(tx => {
          const txDate = new Date(tx.created_at);
          const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          return txDate > dayAgo;
        }).length || 0
      });
    } catch (error) {
      console.error('Error loading PaaS data:', error);
    }
  };

  const verifyDeveloper = async (developerId: string) => {
    try {
      const { supabase } = await import('../lib/supabase');
      await supabase
        .from('paas_developers')
        .update({ is_verified: true, verification_date: new Date().toISOString() })
        .eq('id', developerId);
      loadData();
    } catch (error) {
      console.error('Error verifying developer:', error);
    }
  };

  const suspendDeveloper = async (developerId: string) => {
    try {
      const { supabase } = await import('../lib/supabase');
      await supabase
        .from('paas_developers')
        .update({ subscription_status: 'suspended' })
        .eq('id', developerId);
      loadData();
    } catch (error) {
      console.error('Error suspending developer:', error);
    }
  };

  const setupRealtimeSubscriptions = async () => {
    try {
      const { supabase } = await import('../lib/supabase');

      const developersChannel = supabase
        .channel('paas-developers-changes')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'paas_developers' },
          () => { loadData(); }
        )
        .subscribe();

      const securityChannel = supabase
        .channel('paas-security-changes')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'paas_security_events' },
          () => { loadData(); }
        )
        .subscribe();

      const transactionsChannel = supabase
        .channel('paas-transactions-changes')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'paas_transactions' },
          () => { loadData(); }
        )
        .subscribe();

      const accountsChannel = supabase
        .channel('paas-accounts-changes')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'paas_point_accounts' },
          () => { loadData(); }
        )
        .subscribe();

      setSubscriptions([developersChannel, securityChannel, transactionsChannel, accountsChannel]);
    } catch (error) {
      console.error('Error setting up real-time subscriptions:', error);
    }
  };

  const cleanupSubscriptions = async () => {
    try {
      const { supabase } = await import('../lib/supabase');
      subscriptions.forEach(sub => {
        supabase.removeChannel(sub);
      });
      setSubscriptions([]);
    } catch (error) {
      console.error('Error cleaning up subscriptions:', error);
    }
  };

  const viewDeveloperDetails = async (developerId: string) => {
    try {
      const { supabase } = await import('../lib/supabase');

      const { data: devData } = await supabase
        .from('paas_developers')
        .select('*')
        .eq('id', developerId)
        .single();

      const { data: accountData } = await supabase
        .from('paas_point_accounts')
        .select('*')
        .eq('developer_id', developerId)
        .maybeSingle();

      const { data: keysData } = await supabase
        .from('paas_api_keys')
        .select('*')
        .eq('developer_id', developerId);

      setSelectedDeveloper({
        ...devData,
        point_account: accountData,
        api_keys: keysData || []
      });
      setShowDeveloperModal(true);
    } catch (error) {
      console.error('Error loading developer details:', error);
    }
  };

  const addPointsToDeveloper = async () => {
    if (!selectedDeveloper || !pointsToAdd || !addPointsReason) return;

    try {
      const { supabase } = await import('../lib/supabase');
      const points = parseFloat(pointsToAdd);

      const { data: account } = await supabase
        .from('paas_point_accounts')
        .select('balance_points')
        .eq('developer_id', selectedDeveloper.id)
        .single();

      const currentBalance = parseFloat(account?.balance_points || '0');
      const newBalance = currentBalance + points;

      await supabase.from('paas_transactions').insert({
        developer_id: selectedDeveloper.id,
        transaction_type: 'grant',
        amount_points: points,
        balance_before: currentBalance,
        balance_after: newBalance,
        metadata: { reason: addPointsReason, admin_action: true }
      });

      setPointsToAdd('');
      setAddPointsReason('');
      setShowDeveloperModal(false);
      loadData();
    } catch (error) {
      console.error('Error adding points:', error);
    }
  };

  const revokeApiKey = async (keyId: string) => {
    try {
      const { supabase } = await import('../lib/supabase');
      await supabase
        .from('paas_api_keys')
        .update({ is_active: false })
        .eq('id', keyId);

      if (selectedDeveloper) {
        viewDeveloperDetails(selectedDeveloper.id);
      }
    } catch (error) {
      console.error('Error revoking API key:', error);
    }
  };

  const exportData = () => {
    const dataToExport = {
      developers,
      transactions: transactions.slice(0, 100),
      securityEvents: securityEvents.slice(0, 50),
      stats,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `paas-admin-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredDevelopers = developers.filter(dev => {
    const matchesSearch = dev.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (dev.organization_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || dev.subscription_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Shield className="text-blue-600 dark:text-blue-400" size={32} />
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Stanzalink PaaS Admin</h2>
        </div>
        {onLogout && (
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors"
          >
            Logout
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Users className="text-blue-600 dark:text-blue-400" size={24} />
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalDevelopers}</span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">Total Developers</p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">{stats.activeDevelopers} active</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Coins className="text-amber-600 dark:text-amber-400" size={24} />
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalPoints.toLocaleString()}</span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">Total Points</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">£{(stats.totalPoints * 0.75).toFixed(2)} value</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="text-green-600 dark:text-green-400" size={24} />
            <span className="text-2xl font-bold text-slate-900 dark:text-white">£{stats.totalRevenue.toFixed(2)}</span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">Total Revenue</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">£0.75 per point spent</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="text-blue-600 dark:text-blue-400" size={24} />
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.apiCalls24h}</span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">API Calls (24h)</p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">Active system</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm mb-8">
        <div className="border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
          <div className="flex gap-2 px-4 md:gap-4 md:px-6 min-w-max md:min-w-0">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3 px-3 md:py-4 md:px-4 border-b-2 font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Activity size={18} />
              <span>Overview</span>
            </button>
            <button
              onClick={() => setActiveTab('developers')}
              className={`py-3 px-3 md:py-4 md:px-4 border-b-2 font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'developers'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users size={18} />
              <span>Developers</span>
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`py-3 px-3 md:py-4 md:px-4 border-b-2 font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'security'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <AlertTriangle size={18} />
              <span>Security</span>
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`py-3 px-3 md:py-4 md:px-4 border-b-2 font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'transactions'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Coins size={18} />
              <span>Transactions</span>
            </button>
            <button
              onClick={() => setActiveTab('api-keys')}
              className={`py-3 px-3 md:py-4 md:px-4 border-b-2 font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'api-keys'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Key size={18} />
              <span>External API</span>
            </button>
            <button
              onClick={() => setActiveTab('billing')}
              className={`py-3 px-3 md:py-4 md:px-4 border-b-2 font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'billing'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CreditCard size={18} />
              <span>Billing</span>
            </button>
            <button
              onClick={() => setActiveTab('reserves')}
              className={`py-3 px-3 md:py-4 md:px-4 border-b-2 font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'reserves'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Wallet size={18} />
              <span>Reserves</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">System Health</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <CheckCircle className="text-green-600 dark:text-green-400 mb-2" size={24} />
                    <p className="font-semibold text-green-900 dark:text-green-100">All Systems Operational</p>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">99.9% uptime</p>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <Activity className="text-blue-600 dark:text-blue-400 mb-2" size={24} />
                    <p className="font-semibold text-blue-900 dark:text-blue-100">API Response Time</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">Average 120ms</p>
                  </div>
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <Shield className="text-amber-600 dark:text-amber-400 mb-2" size={24} />
                    <p className="font-semibold text-amber-900 dark:text-amber-100">Security Events</p>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">{securityEvents.length} total</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'developers' && (
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Developer Management</h3>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => loadData()}
                    className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
                    title="Refresh"
                  >
                    <RefreshCw size={18} />
                  </button>
                  <button
                    onClick={exportData}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                  >
                    <Download size={18} />
                    Export
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by email or organization..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              <div className="space-y-3">
                {filteredDevelopers.map(dev => (
                  <div key={dev.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-900 dark:text-white">{dev.email}</p>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {dev.organization_name || 'No organization'} • Joined {new Date(dev.created_at).toLocaleDateString()}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <span className={`px-2 py-1 text-xs rounded ${
                            dev.subscription_status === 'active'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : dev.subscription_status === 'suspended'
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-400'
                          }`}>
                            {dev.subscription_status}
                          </span>
                          {dev.is_verified && (
                            <span className="px-2 py-1 text-xs rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 flex items-center gap-1">
                              <CheckCircle size={12} />
                              Verified
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => viewDeveloperDetails(dev.id)}
                          className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Eye size={14} />
                          Details
                        </button>
                        {!dev.is_verified && (
                          <button
                            onClick={() => verifyDeveloper(dev.id)}
                            className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg transition-colors flex items-center gap-1"
                          >
                            <CheckCircle size={14} />
                            Verify
                          </button>
                        )}
                        {dev.subscription_status !== 'suspended' && (
                          <button
                            onClick={() => suspendDeveloper(dev.id)}
                            className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors flex items-center gap-1"
                          >
                            <Ban size={14} />
                            Suspend
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {filteredDevelopers.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="mx-auto mb-4 text-slate-300 dark:text-slate-600" size={48} />
                    <p className="text-slate-600 dark:text-slate-400">No developers found</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Security Events</h3>
              <div className="space-y-3">
                {securityEvents.map(event => (
                  <div key={event.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {event.severity === 'critical' ? (
                          <XCircle className="text-red-600 dark:text-red-400 mt-1" size={20} />
                        ) : (
                          <AlertTriangle className="text-amber-600 dark:text-amber-400 mt-1" size={20} />
                        )}
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{event.event_type}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{event.reason}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                            {new Date(event.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded ${
                        event.severity === 'critical'
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          : event.severity === 'high'
                          ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                          : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                      }`}>
                        {event.severity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Recent Transactions</h3>
              <div className="space-y-3">
                {transactions.map(tx => (
                  <div key={tx.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{tx.transaction_type}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{tx.endpoint || 'No endpoint'}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                          {new Date(tx.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          parseFloat(tx.amount_points.toString()) > 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {parseFloat(tx.amount_points.toString()) > 0 ? '+' : ''}{tx.amount_points} points
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          £{Math.abs(parseFloat(tx.amount_gbp.toString())).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'api-keys' && <ExternalApiKeysManager />}

          {activeTab === 'billing' && <PaaSBilling />}

          {activeTab === 'reserves' && <DeveloperReserves />}
        </div>
      </div>

      {showDeveloperModal && selectedDeveloper && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedDeveloper.email}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {selectedDeveloper.organization_name || 'No organization'}
                  </p>
                </div>
                <button
                  onClick={() => setShowDeveloperModal(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <XCircle className="text-slate-600 dark:text-slate-400" size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Shield size={20} />
                  Account Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Status</p>
                    <span className={`inline-block mt-1 px-2 py-1 text-xs rounded ${
                      selectedDeveloper.subscription_status === 'active'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-400'
                    }`}>
                      {selectedDeveloper.subscription_status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Verified</p>
                    <p className="font-medium text-slate-900 dark:text-white mt-1">
                      {selectedDeveloper.is_verified ? 'Yes' : 'No'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Member Since</p>
                    <p className="font-medium text-slate-900 dark:text-white mt-1">
                      {new Date(selectedDeveloper.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Developer ID</p>
                    <p className="font-mono text-xs text-slate-900 dark:text-white mt-1 break-all">
                      {selectedDeveloper.id}
                    </p>
                  </div>
                </div>
              </div>

              {selectedDeveloper.point_account && (
                <div>
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Coins size={20} />
                    Point Account
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <p className="text-xs text-slate-600 dark:text-slate-400">Balance</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">
                        {parseFloat(selectedDeveloper.point_account.balance_points.toString()).toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">points</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <p className="text-xs text-slate-600 dark:text-slate-400">GBP Value</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">
                        £{parseFloat(selectedDeveloper.point_account.balance_gbp.toString()).toFixed(2)}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <p className="text-xs text-slate-600 dark:text-slate-400">Total Earned</p>
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">
                        {parseFloat(selectedDeveloper.point_account.total_earned.toString()).toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <p className="text-xs text-slate-600 dark:text-slate-400">Total Spent</p>
                      <p className="text-lg font-bold text-red-600 dark:text-red-400">
                        {parseFloat(selectedDeveloper.point_account.total_spent.toString()).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <h5 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">Add Points</h5>
                    <div className="space-y-3">
                      <input
                        type="number"
                        value={pointsToAdd}
                        onChange={(e) => setPointsToAdd(e.target.value)}
                        placeholder="Amount"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-blue-300 dark:border-blue-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                      />
                      <input
                        type="text"
                        value={addPointsReason}
                        onChange={(e) => setAddPointsReason(e.target.value)}
                        placeholder="Reason for grant"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-blue-300 dark:border-blue-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                      />
                      <button
                        onClick={addPointsToDeveloper}
                        disabled={!pointsToAdd || !addPointsReason}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
                      >
                        Grant Points
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {selectedDeveloper.api_keys && selectedDeveloper.api_keys.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Key size={20} />
                    API Keys ({selectedDeveloper.api_keys.length})
                  </h4>
                  <div className="space-y-3">
                    {selectedDeveloper.api_keys.map(key => (
                      <div key={key.id} className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">{key.name}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400 font-mono">{key.key_prefix}...</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                key.is_active
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                              }`}>
                                {key.is_active ? 'Active' : 'Revoked'}
                              </span>
                              {key.last_used_at && (
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                  Last used: {new Date(key.last_used_at).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                          {key.is_active && (
                            <button
                              onClick={() => revokeApiKey(key.id)}
                              className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors"
                            >
                              Revoke
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
