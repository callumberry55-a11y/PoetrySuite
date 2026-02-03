import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { DollarSign, TrendingUp, Users, Activity, Calendar, ArrowUpRight, Coins, Database, Zap, Clock } from 'lucide-react';

interface PointsStats {
  totalAllocated: number;
  totalDistributed: number;
  totalReserve: number;
  activeDevs: number;
  monthlyDistribution: number;
  weeklyDistribution: number;
}

interface EconomyFund {
  fund_type: string;
  allocated_amount: number;
  remaining_amount: number;
  currency: string;
}

interface TaxSettings {
  tax_rate: number;
  purchase_tax_rate: number;
  collection_frequency: string;
  is_active: boolean;
  next_adjustment_year?: number;
}

interface TaxRateAdjustment {
  adjustment_year: number;
  previous_tax_rate: number;
  new_tax_rate: number;
  previous_purchase_tax_rate: number;
  new_purchase_tax_rate: number;
  adjustment_amount: number;
  applied_at: string;
}

export default function PointsBank() {
  const [stats, setStats] = useState<PointsStats>({
    totalAllocated: 5400000000,
    totalDistributed: 0,
    totalReserve: 5400000000,
    activeDevs: 0,
    monthlyDistribution: 0,
    weeklyDistribution: 0,
  });
  const [funds, setFunds] = useState<EconomyFund[]>([]);
  const [taxSettings, setTaxSettings] = useState<TaxSettings | null>(null);
  const [taxAdjustments, setTaxAdjustments] = useState<TaxRateAdjustment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data: developers } = await supabase
        .from('paas_developers')
        .select('id');

      const { data: transactions } = await supabase
        .from('paas_economy_transactions')
        .select('amount, transaction_type, created_at');

      const { data: economyFunds } = await supabase
        .from('economy_funds')
        .select('*')
        .order('fund_type');

      const { data: taxConfig } = await supabase
        .from('tax_settings')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const { data: adjustments } = await supabase
        .from('tax_rate_adjustments')
        .select('*')
        .order('adjustment_year', { ascending: false })
        .limit(5);

      const totalDistributed = transactions?.reduce((sum, tx) => {
        if (tx.transaction_type === 'mint') return sum + tx.amount;
        return sum;
      }, 0) || 0;

      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const weeklyDistribution = transactions?.reduce((sum, tx) => {
        if (tx.transaction_type === 'mint' && new Date(tx.created_at) >= oneWeekAgo) {
          return sum + tx.amount;
        }
        return sum;
      }, 0) || 0;

      const monthlyDistribution = transactions?.reduce((sum, tx) => {
        if (tx.transaction_type === 'mint' && new Date(tx.created_at) >= oneMonthAgo) {
          return sum + tx.amount;
        }
        return sum;
      }, 0) || 0;

      setStats({
        totalAllocated: 5400000000,
        totalDistributed,
        totalReserve: 5400000000 - totalDistributed,
        activeDevs: developers?.length || 0,
        monthlyDistribution,
        weeklyDistribution,
      });

      if (economyFunds) {
        setFunds(economyFunds);
      }

      if (taxConfig) {
        setTaxSettings(taxConfig);
      }

      if (adjustments) {
        setTaxAdjustments(adjustments);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(2)}B`;
    }
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(2)}K`;
    }
    return num.toFixed(0);
  };

  const distributionPercentage = (stats.totalDistributed / stats.totalAllocated) * 100;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <div className="text-on-background">Loading Points Bank...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center">
                <Database className="text-white" size={28} />
              </div>
              Points Bank
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Global Developer Economy Reserve
            </p>
          </div>
          <div className="flex gap-2">
            {(['day', 'week', 'month', 'year'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                  selectedPeriod === period
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Coins className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-sm font-medium">
                <TrendingUp size={16} />
                Annual
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Allocated</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {formatNumber(stats.totalAllocated)}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500">5.4 Billion Points / Year</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <ArrowUpRight className="text-emerald-600 dark:text-emerald-400" size={24} />
              </div>
              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                <Activity size={16} />
                Active
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Distributed</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {formatNumber(stats.totalDistributed)}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500">
                {distributionPercentage.toFixed(4)}% of total
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Database className="text-purple-600 dark:text-purple-400" size={24} />
              </div>
              <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400 text-sm font-medium">
                <Zap size={16} />
                Reserve
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-slate-600 dark:text-slate-400">Available Reserve</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {formatNumber(stats.totalReserve)}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500">
                {(100 - distributionPercentage).toFixed(4)}% remaining
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Users className="text-amber-600 dark:text-amber-400" size={24} />
              </div>
              <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 text-sm font-medium">
                <TrendingUp size={16} />
                Live
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-slate-600 dark:text-slate-400">Active Developers</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {stats.activeDevs}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500">Registered API users</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl p-8 shadow-lg text-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <DollarSign className="text-white" size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Tax System</h2>
                  <p className="text-amber-100">Balanced economy through taxation</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-amber-100 text-sm mb-1">Monthly Tax</p>
                  <p className="text-3xl font-bold">{taxSettings?.tax_rate || 5}%</p>
                  <p className="text-amber-200 text-xs mt-1">On earnings monthly</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-amber-100 text-sm mb-1">Purchase Tax</p>
                  <p className="text-3xl font-bold">{taxSettings?.purchase_tax_rate || 1.5}%</p>
                  <p className="text-amber-200 text-xs mt-1">On store purchases</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-amber-100 text-sm mb-1">Tax Distribution</p>
                  <p className="text-2xl font-bold">50/50</p>
                  <p className="text-amber-200 text-xs mt-1">Deleted / Reserve</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-8 shadow-lg text-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Zap className="text-white" size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Weekly User Bonus</h2>
                  <p className="text-emerald-100">Free points for all community members</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-emerald-100 text-sm mb-1">Points Per User</p>
                  <p className="text-3xl font-bold">10</p>
                  <p className="text-emerald-200 text-xs mt-1">Every week</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-emerald-100 text-sm mb-1">Tax Rate</p>
                  <p className="text-3xl font-bold">0%</p>
                  <p className="text-emerald-200 text-xs mt-1">Until next month</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-emerald-100 text-sm mb-1">Zero Balance</p>
                  <p className="text-2xl font-bold">Tax Free</p>
                  <p className="text-emerald-200 text-xs mt-1">Always protected</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-600 to-pink-600 rounded-2xl p-8 shadow-lg text-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <TrendingUp className="text-white" size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Automatic Tax Inflation</h2>
                  <p className="text-rose-100">Annual adjustment to maintain economic balance</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-rose-100 text-sm mb-1">Annual Increase</p>
                  <p className="text-3xl font-bold">+0.5%</p>
                  <p className="text-rose-200 text-xs mt-1">Every year</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-rose-100 text-sm mb-1">Next Adjustment</p>
                  <p className="text-3xl font-bold">{taxSettings?.next_adjustment_year || new Date().getFullYear() + 1}</p>
                  <p className="text-rose-200 text-xs mt-1">Scheduled year</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-rose-100 text-sm mb-1">Projected (5yr)</p>
                  <p className="text-2xl font-bold">{((taxSettings?.tax_rate || 5) + 2.5).toFixed(1)}%</p>
                  <p className="text-rose-200 text-xs mt-1">Monthly tax rate</p>
                </div>
              </div>

              {taxAdjustments.length > 0 && (
                <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <h3 className="text-lg font-semibold mb-3">Recent Adjustments</h3>
                  <div className="space-y-2">
                    {taxAdjustments.slice(0, 3).map((adj) => (
                      <div key={adj.adjustment_year} className="flex items-center justify-between text-sm">
                        <span className="text-rose-100">{adj.adjustment_year}</span>
                        <span className="text-rose-200">
                          {adj.previous_tax_rate}% → {adj.new_tax_rate}%
                          <span className="ml-2 text-xs">({adj.adjustment_amount > 0 ? '+' : ''}{adj.adjustment_amount}%)</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Coins className="text-emerald-600 dark:text-emerald-400" size={24} />
            Economy Funding Breakdown
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {funds.map((fund) => {
              const fundColors = {
                grant: {
                  bg: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
                  text: 'text-blue-900 dark:text-blue-100',
                  accent: 'text-blue-600 dark:text-blue-400',
                  label: 'text-blue-700 dark:text-blue-300',
                },
                rewards: {
                  bg: 'from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20',
                  text: 'text-emerald-900 dark:text-emerald-100',
                  accent: 'text-emerald-600 dark:text-emerald-400',
                  label: 'text-emerald-700 dark:text-emerald-300',
                },
                reserve: {
                  bg: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20',
                  text: 'text-purple-900 dark:text-purple-100',
                  accent: 'text-purple-600 dark:text-purple-400',
                  label: 'text-purple-700 dark:text-purple-300',
                },
              };

              const colors = fundColors[fund.fund_type as keyof typeof fundColors];
              const usedPercentage = ((fund.allocated_amount - fund.remaining_amount) / fund.allocated_amount) * 100;

              return (
                <div key={fund.fund_type} className={`p-6 bg-gradient-to-br ${colors.bg} rounded-xl`}>
                  <div className="mb-4">
                    <p className={`text-sm font-medium ${colors.label} capitalize mb-1`}>
                      {fund.fund_type} Fund
                    </p>
                    <p className={`text-2xl font-bold ${colors.text}`}>
                      £{formatNumber(fund.allocated_amount)}
                    </p>
                    <p className={`text-xs ${colors.accent} mt-1`}>
                      Allocated for {new Date().getFullYear()}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className={colors.label}>Remaining</span>
                      <span className={`font-bold ${colors.text}`}>
                        £{formatNumber(fund.remaining_amount)}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-white/50 dark:bg-slate-900/30 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${colors.accent} bg-current transition-all duration-500`}
                        style={{ width: `${100 - usedPercentage}%` }}
                      />
                    </div>
                    <p className={`text-xs ${colors.accent}`}>
                      {(100 - usedPercentage).toFixed(2)}% available
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="text-blue-600 dark:text-blue-400" size={24} />
                Distribution Timeline
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Calendar className="text-blue-600 dark:text-blue-400" size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Weekly</p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">Last 7 days</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    {formatNumber(stats.weeklyDistribution)}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">points</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <Calendar className="text-emerald-600 dark:text-emerald-400" size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Monthly</p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">Last 30 days</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    {formatNumber(stats.monthlyDistribution)}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">points</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Calendar className="text-purple-600 dark:text-purple-400" size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Annual Budget</p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">365 days</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    {formatNumber(stats.totalAllocated)}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">points</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="text-emerald-600 dark:text-emerald-400" size={24} />
                Distribution Progress
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Annual Distribution
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {distributionPercentage.toFixed(4)}%
                  </span>
                </div>
                <div className="w-full h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500"
                    style={{ width: `${Math.min(distributionPercentage, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-slate-500 dark:text-slate-500">
                  <span>{formatNumber(stats.totalDistributed)} distributed</span>
                  <span>{formatNumber(stats.totalReserve)} remaining</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowUpRight className="text-blue-600 dark:text-blue-400" size={16} />
                    <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                      Daily Rate
                    </span>
                  </div>
                  <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                    {formatNumber(stats.totalAllocated / 365)}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">points / day</p>
                </div>

                <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="text-emerald-600 dark:text-emerald-400" size={16} />
                    <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                      Per Dev Avg
                    </span>
                  </div>
                  <p className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
                    {formatNumber(stats.activeDevs > 0 ? stats.totalDistributed / stats.activeDevs : 0)}
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">points / dev</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-emerald-600 rounded-2xl p-8 shadow-lg text-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <DollarSign className="text-white" size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Developer Economy Fund</h2>
                  <p className="text-blue-100">Sustainable API monetization for the community</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-blue-100 text-sm mb-1">Points Budget</p>
                  <p className="text-3xl font-bold">5.4B</p>
                  <p className="text-blue-200 text-xs mt-1">Points per year</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-blue-100 text-sm mb-1">Grant Fund</p>
                  <p className="text-3xl font-bold">£3B</p>
                  <p className="text-blue-200 text-xs mt-1">Annual grants</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-blue-100 text-sm mb-1">Rewards</p>
                  <p className="text-3xl font-bold">£1.4B</p>
                  <p className="text-blue-200 text-xs mt-1">Developer rewards</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-blue-100 text-sm mb-1">Reserve</p>
                  <p className="text-3xl font-bold">£750M</p>
                  <p className="text-blue-200 text-xs mt-1">System reserve</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Activity className="text-blue-600 dark:text-blue-400" size={24} />
            How the Points Bank Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Annual Allocation</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    5.4 billion points are allocated to the developer economy each year, ensuring sustainable growth and fair compensation.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Usage-Based Distribution</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Points are distributed based on actual API usage, ensuring developers are rewarded fairly for their active integrations.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Automatic Renewal</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    The allocation resets annually, providing fresh opportunities and maintaining a healthy ecosystem for all developers.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Real-Time Tracking</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Monitor distribution, reserve levels, and active developers in real-time through this transparent dashboard.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400 font-bold">
                  5
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Global Currency</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Points can be redeemed for real-world currency or used within the platform economy for upgrades and features.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 font-bold">
                  6
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Dual Tax System</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    5% monthly tax on developer earnings and 1.5% tax on store purchases. Each tax is split 50/50: half deleted to control inflation, half added to reserve fund. Users with 0 points are never taxed.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
                  7
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Weekly User Bonus</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Every user receives 10 points per week automatically just for being part of the community. These points are tax-free until the beginning of the next month.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                  8
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Secure & Auditable</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    All transactions are recorded in a secure, auditable database ensuring transparency and accountability.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400 font-bold">
                  9
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Automatic Tax Inflation</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Tax rates automatically increase by 0.5% each year to maintain economic balance and control long-term inflation. This ensures the system remains sustainable as the community grows.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
