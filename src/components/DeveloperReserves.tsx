import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Wallet,
  TrendingUp,
  Settings,
  Brain,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Activity,
  Server,
  Code,
  CreditCard,
  RefreshCw,
  ArrowRight,
  PieChart,
  History
} from 'lucide-react';

interface ReserveCategory {
  id: string;
  name: string;
  display_name: string;
  description: string;
  icon: string;
  default_allocation_percentage: number;
}

interface Reserve {
  id: string;
  developer_id: string;
  category_id: string;
  balance_points: number;
  total_allocated: number;
  total_spent: number;
  allocation_percentage: number;
  budget_limit_points: number | null;
  auto_refill_enabled: boolean;
  auto_refill_threshold: number;
  auto_refill_amount: number;
  is_active: boolean;
  paas_reserve_categories: ReserveCategory;
}

interface AIRecommendation {
  id: string;
  recommended_allocations: Record<string, number>;
  reasoning: string;
  confidence_score: number;
  applied: boolean;
  created_at: string;
}

interface Transaction {
  id: string;
  amount_points: number;
  transaction_type: string;
  description: string;
  balance_before: number;
  balance_after: number;
  created_at: string;
}

interface Allocation {
  id: string;
  amount_points: number;
  source: string;
  allocation_reason: string;
  created_at: string;
}

const iconMap: Record<string, any> = {
  'activity': Activity,
  'credit-card': CreditCard,
  'server': Server,
  'code': Code,
  'alert-circle': AlertCircle,
  'wallet': Wallet,
  'coins': DollarSign
};

export default function DeveloperReserves() {
  const [reserves, setReserves] = useState<Reserve[]>([]);
  const [categories, setCategories] = useState<ReserveCategory[]>([]);
  const [aiRecommendation, setAIRecommendation] = useState<AIRecommendation | null>(null);
  const [selectedReserve, setSelectedReserve] = useState<Reserve | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'history'>('overview');
  const [showAIRecommendation, setShowAIRecommendation] = useState(false);
  const [editingReserve, setEditingReserve] = useState<Reserve | null>(null);
  const [editForm, setEditForm] = useState({
    allocationPercentage: 0,
    budgetLimit: 0,
    autoRefillEnabled: false,
    autoRefillThreshold: 0,
    autoRefillAmount: 0
  });

  useEffect(() => {
    loadReserves();
    setupRealtimeSubscription();
  }, []);

  const loadReserves = async () => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: developer } = await supabase
        .from('paas_developers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!developer) return;

      const { data: reservesData } = await supabase
        .from('paas_developer_reserves')
        .select(`
          *,
          paas_reserve_categories (*)
        `)
        .eq('developer_id', developer.id)
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      setReserves(reservesData || []);

      const { data: categoriesData } = await supabase
        .from('paas_reserve_categories')
        .select('*')
        .eq('is_active', true);

      setCategories(categoriesData || []);

      const { data: aiRec } = await supabase
        .from('paas_reserve_ai_recommendations')
        .select('*')
        .eq('developer_id', developer.id)
        .eq('applied', false)
        .order('created_at', { ascending: false })
        .limit(1);

      if (aiRec && aiRec.length > 0) {
        setAIRecommendation(aiRec[0]);
        setShowAIRecommendation(true);
      }

    } catch (error) {
      console.error('Error loading reserves:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async (reserveId: string) => {
    try {
      const { data: transData } = await supabase
        .from('paas_reserve_transactions')
        .select('*')
        .eq('reserve_id', reserveId)
        .order('created_at', { ascending: false })
        .limit(50);

      setTransactions(transData || []);

      const { data: allocData } = await supabase
        .from('paas_reserve_allocations')
        .select('*')
        .eq('reserve_id', reserveId)
        .order('created_at', { ascending: false })
        .limit(50);

      setAllocations(allocData || []);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('developer_reserves_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'paas_developer_reserves' },
        () => loadReserves()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'paas_reserve_ai_recommendations' },
        () => loadReserves()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const applyAIRecommendation = async () => {
    if (!aiRecommendation) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: developer } = await supabase
        .from('paas_developers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!developer) return;

      const allocations = aiRecommendation.recommended_allocations;

      for (const reserve of reserves) {
        const categoryName = reserve.paas_reserve_categories.name;
        const newPercentage = allocations[categoryName];

        if (newPercentage !== undefined) {
          await supabase
            .from('paas_developer_reserves')
            .update({ allocation_percentage: newPercentage })
            .eq('id', reserve.id);
        }
      }

      await supabase
        .from('paas_reserve_ai_recommendations')
        .update({ applied: true, applied_at: new Date().toISOString() })
        .eq('id', aiRecommendation.id);

      setShowAIRecommendation(false);
      await loadReserves();
      alert('AI recommendation applied successfully!');
    } catch (error) {
      console.error('Error applying AI recommendation:', error);
      alert('Failed to apply recommendation');
    }
  };

  const updateReserveSettings = async () => {
    if (!editingReserve) return;

    try {
      const { error } = await supabase
        .from('paas_developer_reserves')
        .update({
          allocation_percentage: editForm.allocationPercentage,
          budget_limit_points: editForm.budgetLimit || null,
          auto_refill_enabled: editForm.autoRefillEnabled,
          auto_refill_threshold: editForm.autoRefillThreshold,
          auto_refill_amount: editForm.autoRefillAmount,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingReserve.id);

      if (error) throw error;

      setEditingReserve(null);
      await loadReserves();
      alert('Settings updated successfully!');
    } catch (error) {
      console.error('Error updating settings:', error);
      alert('Failed to update settings');
    }
  };

  const getIcon = (iconName: string) => {
    const Icon = iconMap[iconName] || Wallet;
    return Icon;
  };

  const totalBalance = reserves.reduce((sum, r) => sum + parseFloat(r.balance_points.toString()), 0);
  const totalAllocated = reserves.reduce((sum, r) => sum + parseFloat(r.total_allocated.toString()), 0);
  const totalSpent = reserves.reduce((sum, r) => sum + parseFloat(r.total_spent.toString()), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Developer Reserve Pools</h1>
        <p className="text-gray-600">Manage and allocate your funding across different categories</p>
      </div>

      {showAIRecommendation && aiRecommendation && (
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <Brain className="w-8 h-8 text-blue-500 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">AI Banker Recommendation</h3>
              <p className="text-gray-700 mb-4">{aiRecommendation.reasoning}</p>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                {Object.entries(aiRecommendation.recommended_allocations).map(([category, percentage]) => (
                  <div key={category} className="bg-white rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">{category.replace('_', ' ').toUpperCase()}</p>
                    <p className="text-2xl font-bold text-blue-600">{percentage}%</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={applyAIRecommendation}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Apply Recommendation
                </button>
                <button
                  onClick={() => setShowAIRecommendation(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 text-sm font-medium">Total Reserve Balance</h3>
            <Wallet className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold">{totalBalance.toFixed(2)} pts</p>
          <p className="text-sm text-gray-500 mt-1">≈ £{(totalBalance * 0.75).toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 text-sm font-medium">Total Allocated</h3>
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold">{totalAllocated.toFixed(2)} pts</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 text-sm font-medium">Total Spent</h3>
            <DollarSign className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-3xl font-bold">{totalSpent.toFixed(2)} pts</p>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'overview'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <PieChart className="w-5 h-5 inline mr-2" />
          Overview
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'settings'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Settings className="w-5 h-5 inline mr-2" />
          Settings
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'history'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <History className="w-5 h-5 inline mr-2" />
          History
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reserves.map((reserve) => {
            const Icon = getIcon(reserve.paas_reserve_categories.icon);
            const utilizationPercent = reserve.budget_limit_points
              ? (parseFloat(reserve.total_spent.toString()) / parseFloat(reserve.budget_limit_points.toString())) * 100
              : 0;

            return (
              <div key={reserve.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <Icon className="w-6 h-6 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{reserve.paas_reserve_categories.display_name}</h3>
                        <p className="text-sm text-gray-600">{reserve.allocation_percentage}% allocation</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">{reserve.paas_reserve_categories.description}</p>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600">Balance</span>
                        <span className="text-lg font-bold">{parseFloat(reserve.balance_points.toString()).toFixed(2)} pts</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600">Total Allocated</span>
                        <span className="text-sm font-semibold">{parseFloat(reserve.total_allocated.toString()).toFixed(2)} pts</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600">Total Spent</span>
                        <span className="text-sm font-semibold">{parseFloat(reserve.total_spent.toString()).toFixed(2)} pts</span>
                      </div>
                    </div>

                    {reserve.budget_limit_points && (
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-600">Budget Utilization</span>
                          <span className="text-sm font-semibold">{utilizationPercent.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${utilizationPercent > 80 ? 'bg-red-500' : utilizationPercent > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                            style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {reserve.auto_refill_enabled && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                        <p className="text-xs text-green-700">
                          <CheckCircle className="w-3 h-3 inline mr-1" />
                          Auto-refill enabled
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setSelectedReserve(reserve);
                      loadHistory(reserve.id);
                      setActiveTab('history');
                    }}
                    className="mt-4 w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    View Details
                    <ArrowRight className="w-4 h-4 inline ml-2" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold">Reserve Settings</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {reserves.map((reserve) => {
              const Icon = getIcon(reserve.paas_reserve_categories.icon);
              const isEditing = editingReserve?.id === reserve.id;

              return (
                <div key={reserve.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Icon className="w-6 h-6 text-blue-500" />
                      <div>
                        <h3 className="font-bold">{reserve.paas_reserve_categories.display_name}</h3>
                        <p className="text-sm text-gray-600">{reserve.paas_reserve_categories.description}</p>
                      </div>
                    </div>
                    {!isEditing && (
                      <button
                        onClick={() => {
                          setEditingReserve(reserve);
                          setEditForm({
                            allocationPercentage: reserve.allocation_percentage,
                            budgetLimit: reserve.budget_limit_points || 0,
                            autoRefillEnabled: reserve.auto_refill_enabled,
                            autoRefillThreshold: reserve.auto_refill_threshold,
                            autoRefillAmount: reserve.auto_refill_amount
                          });
                        }}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Edit
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-4 bg-gray-50 rounded-lg p-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Allocation Percentage
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={editForm.allocationPercentage}
                          onChange={(e) => setEditForm({ ...editForm, allocationPercentage: parseFloat(e.target.value) })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Budget Limit (points)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={editForm.budgetLimit}
                          onChange={(e) => setEditForm({ ...editForm, budgetLimit: parseFloat(e.target.value) })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={editForm.autoRefillEnabled}
                            onChange={(e) => setEditForm({ ...editForm, autoRefillEnabled: e.target.checked })}
                            className="w-4 h-4"
                          />
                          <span className="text-sm font-medium text-gray-700">Enable Auto-Refill</span>
                        </label>
                      </div>

                      {editForm.autoRefillEnabled && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Refill Threshold (points)
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={editForm.autoRefillThreshold}
                              onChange={(e) => setEditForm({ ...editForm, autoRefillThreshold: parseFloat(e.target.value) })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Refill Amount (points)
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={editForm.autoRefillAmount}
                              onChange={(e) => setEditForm({ ...editForm, autoRefillAmount: parseFloat(e.target.value) })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                        </>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={updateReserveSettings}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={() => setEditingReserve(null)}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-gray-600">Allocation</p>
                        <p className="text-lg font-bold">{reserve.allocation_percentage}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Budget Limit</p>
                        <p className="text-lg font-bold">{reserve.budget_limit_points ? `${reserve.budget_limit_points} pts` : 'None'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Auto-Refill</p>
                        <p className="text-lg font-bold">{reserve.auto_refill_enabled ? 'Enabled' : 'Disabled'}</p>
                      </div>
                      {reserve.auto_refill_enabled && (
                        <div>
                          <p className="text-xs text-gray-600">Refill At</p>
                          <p className="text-lg font-bold">{reserve.auto_refill_threshold} pts</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'history' && selectedReserve && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold">Transaction History</h2>
              <p className="text-sm text-gray-600">{selectedReserve.paas_reserve_categories.display_name}</p>
            </div>
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {transactions.map((txn) => (
                <div key={txn.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{txn.transaction_type.replace('_', ' ').toUpperCase()}</p>
                      <p className="text-sm text-gray-600">{txn.description || 'No description'}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(txn.created_at).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${parseFloat(txn.amount_points.toString()) < 0 ? 'text-red-500' : 'text-green-500'}`}>
                        {parseFloat(txn.amount_points.toString()) > 0 ? '+' : ''}{parseFloat(txn.amount_points.toString()).toFixed(2)} pts
                      </p>
                      <p className="text-xs text-gray-500">Balance: {parseFloat(txn.balance_after.toString()).toFixed(2)} pts</p>
                    </div>
                  </div>
                </div>
              ))}
              {transactions.length === 0 && (
                <div className="p-12 text-center text-gray-500">
                  <History className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No transactions yet</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold">Allocation History</h2>
            </div>
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {allocations.map((alloc) => (
                <div key={alloc.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{alloc.source.replace('_', ' ').toUpperCase()}</p>
                      <p className="text-sm text-gray-600">{alloc.allocation_reason}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(alloc.created_at).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-500">
                        +{parseFloat(alloc.amount_points.toString()).toFixed(2)} pts
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {allocations.length === 0 && (
                <div className="p-12 text-center text-gray-500">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No allocations yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
