import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { TrendingUp, Calendar, DollarSign, Info } from 'lucide-react';

interface BudgetData {
  total_points_budget: number;
  allocated_points: number;
  remaining_points: number;
  fiscal_year: number;
  monthly_allocation: number;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function GrantFundingGraph() {
  const [budgetData, setBudgetData] = useState<BudgetData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBudgetData();
  }, []);

  const fetchBudgetData = async () => {
    try {
      const { data, error } = await supabase
        .from('economy_budget')
        .select('*')
        .eq('fiscal_year', 2026)
        .single();

      if (error) throw error;

      if (data) {
        setBudgetData({
          ...data,
          monthly_allocation: data.total_points_budget / 12
        });
      }
    } catch (error) {
      console.error('Error fetching budget data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPoints = (points: number): string => {
    if (points >= 1_000_000_000) {
      return `${(points / 1_000_000_000).toFixed(2)}B`;
    } else if (points >= 1_000_000) {
      return `${(points / 1_000_000).toFixed(2)}M`;
    } else if (points >= 1_000) {
      return `${(points / 1_000).toFixed(2)}K`;
    }
    return points.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!budgetData) {
    return (
      <div className="text-center p-8 text-gray-500">
        No budget data available
      </div>
    );
  }

  const currentMonth = new Date().getMonth();
  const maxBarHeight = 200;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-6 h-6" />
            <span className="text-sm font-medium opacity-90">Total Budget</span>
          </div>
          <div className="text-3xl font-bold">
            {formatPoints(budgetData.total_points_budget)}
          </div>
          <div className="text-sm opacity-90 mt-1">
            {budgetData.total_points_budget.toLocaleString()} points
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-6 h-6" />
            <span className="text-sm font-medium opacity-90">Monthly Allocation</span>
          </div>
          <div className="text-3xl font-bold">
            {formatPoints(budgetData.monthly_allocation)}
          </div>
          <div className="text-sm opacity-90 mt-1">
            {budgetData.monthly_allocation.toLocaleString(undefined, { maximumFractionDigits: 0 })} points/month
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-6 h-6" />
            <span className="text-sm font-medium opacity-90">Remaining</span>
          </div>
          <div className="text-3xl font-bold">
            {formatPoints(budgetData.remaining_points)}
          </div>
          <div className="text-sm opacity-90 mt-1">
            {((budgetData.remaining_points / budgetData.total_points_budget) * 100).toFixed(1)}% available
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <strong>Grant Distribution Plan:</strong> The 4.0 billion point budget is divided equally across 12 months.
          Each month receives approximately 333.33 million points for distribution to users and developers.
        </div>
      </div>

      {/* Monthly Distribution Graph */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Monthly Grant Distribution (2026)
        </h3>

        <div className="flex items-end justify-between gap-2 h-64 px-2">
          {MONTHS.map((month, index) => {
            const isCurrentMonth = index === currentMonth;
            const isPastMonth = index < currentMonth;

            return (
              <div key={month} className="flex-1 flex flex-col items-center gap-2">
                {/* Bar */}
                <div className="relative w-full flex items-end justify-center" style={{ height: `${maxBarHeight}px` }}>
                  <div
                    className={`w-full rounded-t-lg transition-all duration-500 ${
                      isPastMonth
                        ? 'bg-gradient-to-t from-gray-300 to-gray-400'
                        : isCurrentMonth
                        ? 'bg-gradient-to-t from-green-500 to-green-400 shadow-lg'
                        : 'bg-gradient-to-t from-blue-500 to-blue-400'
                    }`}
                    style={{
                      height: `${maxBarHeight}px`,
                    }}
                  >
                    {/* Hover tooltip */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                        {formatPoints(budgetData.monthly_allocation)}
                      </div>
                    </div>
                  </div>

                  {/* Current month indicator */}
                  {isCurrentMonth && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                      <div className="bg-green-600 text-white text-xs px-2 py-1 rounded-full shadow-lg">
                        Current
                      </div>
                    </div>
                  )}
                </div>

                {/* Month label */}
                <div className="text-xs text-gray-600 text-center font-medium -rotate-45 origin-center w-16 mt-4">
                  {month.slice(0, 3)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Y-axis label */}
        <div className="mt-8 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Budget per month</span>
            <span className="font-medium text-blue-600">
              {formatPoints(budgetData.monthly_allocation)} points
            </span>
          </div>
        </div>
      </div>

      {/* Distribution Details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Distribution Breakdown
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm text-gray-600">Fiscal Year</div>
            <div className="text-xl font-bold text-gray-900">{budgetData.fiscal_year}</div>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-gray-600">Total Months</div>
            <div className="text-xl font-bold text-gray-900">12</div>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-gray-600">Points Allocated So Far</div>
            <div className="text-xl font-bold text-gray-900">
              {formatPoints(budgetData.allocated_points)}
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-gray-600">Months Remaining</div>
            <div className="text-xl font-bold text-gray-900">{12 - currentMonth - 1}</div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 justify-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-t from-gray-300 to-gray-400"></div>
          <span className="text-gray-600">Past Months</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-t from-green-500 to-green-400"></div>
          <span className="text-gray-600">Current Month</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-t from-blue-500 to-blue-400"></div>
          <span className="text-gray-600">Future Months</span>
        </div>
      </div>
    </div>
  );
}
