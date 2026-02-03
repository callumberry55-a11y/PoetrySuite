import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Users, Key, Coins, Activity, AlertTriangle, CheckCircle, XCircle, TrendingUp, DollarSign } from 'lucide-react';

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

export default function PaaSAdmin() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'developers' | 'security' | 'transactions'>('overview');
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

  useEffect(() => {
    loadData();
  }, []);

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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="text-blue-600 dark:text-blue-400" size={32} />
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Stanzalink PaaS Admin</h2>
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
            <span className="text-2xl font-bold text-slate-900 dark:text-white">£{stats.totalRevenue.toFixed(0)}</span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">Total Revenue</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">From API usage</p>
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
        <div className="border-b border-slate-200 dark:border-slate-700">
          <div className="flex gap-4 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Activity className="inline mr-2" size={18} />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('developers')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'developers'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users className="inline mr-2" size={18} />
              Developers
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'security'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <AlertTriangle className="inline mr-2" size={18} />
              Security
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'transactions'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Coins className="inline mr-2" size={18} />
              Transactions
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
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Developer Management</h3>
              <div className="space-y-4">
                {developers.map(dev => (
                  <div key={dev.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{dev.email}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{dev.organization_name || 'No organization'}</p>
                        <div className="flex gap-2 mt-2">
                          <span className={`px-2 py-1 text-xs rounded ${
                            dev.subscription_status === 'active'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-400'
                          }`}>
                            {dev.subscription_status}
                          </span>
                          {dev.is_verified && (
                            <span className="px-2 py-1 text-xs rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                              Verified
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!dev.is_verified && (
                          <button
                            onClick={() => verifyDeveloper(dev.id)}
                            className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg transition-colors"
                          >
                            Verify
                          </button>
                        )}
                        <button
                          onClick={() => suspendDeveloper(dev.id)}
                          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors"
                        >
                          Suspend
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
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
        </div>
      </div>
    </div>
  );
}
