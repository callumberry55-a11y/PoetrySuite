import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  DollarSign,
  TrendingUp,
  Calendar,
  CreditCard,
  Activity,
  Brain,
  Download,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

interface BillingPeriod {
  id: string;
  developer_id: string;
  period_start: string;
  period_end: string;
  total_requests: number;
  total_data_transferred_mb: number;
  total_execution_time_ms: number;
  base_cost_points: number;
  ai_calculated_cost_points: number;
  final_cost_points: number;
  ai_reasoning: string;
  status: string;
  billed_at: string;
  created_at: string;
}

interface UsageStats {
  totalRequests: number;
  totalDataMB: number;
  totalCost: number;
  avgExecutionTime: number;
}

interface AIDecision {
  id: string;
  billing_period_id: string;
  usage_summary: any;
  ai_analysis: string;
  base_calculation: number;
  ai_adjustment_factor: number;
  final_cost: number;
  reasoning: string;
  created_at: string;
}

export default function PaaSBilling() {
  const [billingPeriods, setBillingPeriods] = useState<BillingPeriod[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<BillingPeriod | null>(null);
  const [aiDecision, setAIDecision] = useState<AIDecision | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'periods' | 'usage'>('overview');

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      setLoading(true);

      const { data: periods } = await supabase
        .from('paas_billing_periods')
        .select('*')
        .order('period_start', { ascending: false })
        .limit(50);

      setBillingPeriods(periods || []);

      const { data: usage } = await supabase
        .from('paas_api_usage')
        .select('execution_time_ms, request_size, response_size');

      if (usage && usage.length > 0) {
        const stats: UsageStats = {
          totalRequests: usage.length,
          totalDataMB: usage.reduce((sum, u) => sum + (u.request_size + u.response_size) / 1048576, 0),
          totalCost: periods?.reduce((sum, p) => sum + parseFloat(p.final_cost_points || '0'), 0) || 0,
          avgExecutionTime: usage.reduce((sum, u) => sum + u.execution_time_ms, 0) / usage.length
        };
        setUsageStats(stats);
      }
    } catch (error) {
      console.error('Error loading billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAIDecision = async (periodId: string) => {
    try {
      const { data } = await supabase
        .from('paas_ai_banker_decisions')
        .select('*')
        .eq('billing_period_id', periodId)
        .maybeSingle();

      setAIDecision(data);
    } catch (error) {
      console.error('Error loading AI decision:', error);
    }
  };

  const calculateBilling = async (periodId: string) => {
    try {
      setProcessing(true);

      const adminKey = prompt('Enter admin API key to calculate billing:');
      if (!adminKey) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/paas-billing-processor?action=calculate_billing`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': adminKey,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({ action: 'calculate_billing', billingPeriodId: periodId })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to calculate billing');
      }

      const result = await response.json();
      alert('Billing calculated successfully!\n\n' +
        `Base Cost: ${result.data.pricing.baseCost.toFixed(2)} points\n` +
        `AI Adjustment: ${result.data.pricing.adjustmentFactor}x\n` +
        `Final Cost: ${result.data.pricing.finalCost.toFixed(2)} points\n\n` +
        `AI Reasoning: ${result.data.aiDecision.reasoning}`
      );

      await loadBillingData();
    } catch (error) {
      console.error('Error calculating billing:', error);
      alert('Failed to calculate billing: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setProcessing(false);
    }
  };

  const processPayment = async (periodId: string) => {
    try {
      setProcessing(true);

      const adminKey = prompt('Enter admin API key to process payment:');
      if (!adminKey) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/paas-billing-processor?action=process_payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': adminKey,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({ action: 'process_payment', billingPeriodId: periodId })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to process payment');
      }

      const result = await response.json();
      alert('Payment processed successfully!\n\n' +
        `Amount Paid: ${result.data.amountPaid.toFixed(2)} points\n` +
        `New Balance: ${result.data.newBalance.toFixed(2)} points`
      );

      await loadBillingData();
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Failed to process payment: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setProcessing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'calculated':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

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
        <h1 className="text-3xl font-bold mb-2">API Billing & Usage</h1>
        <p className="text-gray-600">AI-powered billing system for PaaS API usage</p>
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
          <Activity className="w-5 h-5 inline mr-2" />
          Overview
        </button>
        <button
          onClick={() => setActiveTab('periods')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'periods'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Calendar className="w-5 h-5 inline mr-2" />
          Billing Periods
        </button>
        <button
          onClick={() => setActiveTab('usage')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'usage'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <TrendingUp className="w-5 h-5 inline mr-2" />
          Usage Stats
        </button>
      </div>

      {activeTab === 'overview' && usageStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm font-medium">Total Requests</h3>
              <Activity className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold">{usageStats.totalRequests.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm font-medium">Data Transferred</h3>
              <Download className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold">{usageStats.totalDataMB.toFixed(2)} MB</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm font-medium">Total Cost</h3>
              <DollarSign className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold">{usageStats.totalCost.toFixed(2)} pts</p>
            <p className="text-sm text-gray-500 mt-1">≈ £{(usageStats.totalCost * 0.75).toFixed(2)}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm font-medium">Avg Response Time</h3>
              <Clock className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-3xl font-bold">{usageStats.avgExecutionTime.toFixed(0)}ms</p>
          </div>
        </div>
      )}

      {activeTab === 'periods' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold">Billing Periods</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {billingPeriods.map((period) => (
              <div key={period.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(period.status)}
                      <span className="font-mono text-sm text-gray-500">
                        {new Date(period.period_start).toLocaleDateString()} - {new Date(period.period_end).toLocaleDateString()}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        period.status === 'paid' ? 'bg-green-100 text-green-700' :
                        period.status === 'calculated' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {period.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-gray-600">Requests</p>
                        <p className="text-lg font-semibold">{period.total_requests.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Data Transfer</p>
                        <p className="text-lg font-semibold">{parseFloat(period.total_data_transferred_mb || '0').toFixed(2)} MB</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Base Cost</p>
                        <p className="text-lg font-semibold">{parseFloat(period.base_cost_points || '0').toFixed(2)} pts</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Final Cost</p>
                        <p className="text-lg font-bold text-purple-600">{parseFloat(period.final_cost_points || '0').toFixed(2)} pts</p>
                      </div>
                    </div>

                    {period.ai_reasoning && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start gap-2">
                          <Brain className="w-5 h-5 text-blue-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-blue-900 mb-1">AI Banker Analysis</p>
                            <p className="text-sm text-blue-700">{period.ai_reasoning}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    {period.status === 'pending' && (
                      <button
                        onClick={() => calculateBilling(period.id)}
                        disabled={processing}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Brain className="w-4 h-4 inline mr-2" />
                        Calculate
                      </button>
                    )}
                    {period.status === 'calculated' && (
                      <button
                        onClick={() => processPayment(period.id)}
                        disabled={processing}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <CreditCard className="w-4 h-4 inline mr-2" />
                        Process Payment
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedPeriod(period);
                        loadAIDecision(period.id);
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Details
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {billingPeriods.length === 0 && (
              <div className="p-12 text-center text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No billing periods found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedPeriod && aiDecision && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold">AI Banker Decision Details</h3>
              <button
                onClick={() => {
                  setSelectedPeriod(null);
                  setAIDecision(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h4 className="font-semibold mb-2">Usage Summary</h4>
                <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto">
                  {JSON.stringify(aiDecision.usage_summary, null, 2)}
                </pre>
              </div>

              <div>
                <h4 className="font-semibold mb-2">AI Analysis</h4>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm">{aiDecision.ai_analysis}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Base Cost</p>
                  <p className="text-lg font-semibold">{aiDecision.base_calculation.toFixed(2)} pts</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">AI Adjustment</p>
                  <p className="text-lg font-semibold">{aiDecision.ai_adjustment_factor}x</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Final Cost</p>
                  <p className="text-lg font-bold text-purple-600">{aiDecision.final_cost.toFixed(2)} pts</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Reasoning</h4>
                <p className="text-sm text-gray-700">{aiDecision.reasoning}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
