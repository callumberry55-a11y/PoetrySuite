import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface DistributionProgressData {
  id: string;
  distribution_date: string;
  status: 'running' | 'completed' | 'failed';
  total_users: number;
  processed_users: number;
  progress_percentage: number;
  current_batch: number;
  total_batches: number;
  points_per_user: number;
  total_points_distributed: number;
  error_message?: string;
  started_at: string;
  completed_at?: string;
}

interface EconomyFund {
  fund_type: string;
  remaining_amount: number;
}

export function DistributionProgress() {
  const [progress, setProgress] = useState<DistributionProgressData | null>(null);
  const [economyFunds, setEconomyFunds] = useState<EconomyFund[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch latest distribution progress and economy funds
    const fetchData = async () => {
      try {
        const [progressResult, fundsResult] = await Promise.all([
          supabase
            .from('distribution_progress')
            .select('*')
            .order('started_at', { ascending: false })
            .limit(1)
            .maybeSingle(),
          supabase
            .from('economy_funds')
            .select('fund_type, remaining_amount')
            .order('fund_type')
        ]);

        if (progressResult.error) throw progressResult.error;
        if (fundsResult.error) throw fundsResult.error;

        setProgress(progressResult.data);
        setEconomyFunds(fundsResult.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Subscribe to real-time updates for both tables
    const channel = supabase
      .channel('distribution_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'distribution_progress',
        },
        (payload) => {
          setProgress(payload.new as DistributionProgressData);
          setLoading(false);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'economy_funds',
        },
        async () => {
          const { data } = await supabase
            .from('economy_funds')
            .select('fund_type, remaining_amount')
            .order('fund_type');
          if (data) setEconomyFunds(data);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600 dark:text-gray-300">Loading distribution status...</span>
        </div>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <p className="text-gray-600 dark:text-gray-300">No distribution progress available</p>
      </div>
    );
  }

  const isRunning = progress.status === 'running';
  const isCompleted = progress.status === 'completed';
  const isFailed = progress.status === 'failed';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Daily Distribution Progress
        </h3>
        <div className="flex items-center gap-2">
          {isRunning && (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span className="text-sm font-medium text-blue-600">Running</span>
            </>
          )}
          {isCompleted && (
            <>
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-600">Completed</span>
            </>
          )}
          {isFailed && (
            <>
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium text-red-600">Failed</span>
            </>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
            <span>
              {progress.processed_users.toLocaleString()} / {progress.total_users.toLocaleString()} users
            </span>
            <span className="font-semibold">{progress.progress_percentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                isCompleted
                  ? 'bg-green-600'
                  : isFailed
                  ? 'bg-red-600'
                  : 'bg-blue-600 animate-pulse'
              }`}
              style={{ width: `${progress.progress_percentage}%` }}
            />
          </div>
        </div>

        {/* Distribution Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500 dark:text-gray-400">Points per User</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {progress.points_per_user}
            </p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Total Distributed</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {progress.total_points_distributed.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Batch Progress</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {progress.current_batch} / {progress.total_batches}
            </p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Distribution Date</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {new Date(progress.distribution_date).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Economy Funds Status */}
        {economyFunds.length > 0 && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Economy Fund Balance (Real-Time)
            </p>
            <div className="grid grid-cols-3 gap-3">
              {economyFunds.map((fund) => (
                <div key={fund.fund_type} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize mb-1">
                    {fund.fund_type}
                  </p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    £{(Number(fund.remaining_amount) / 1000000000).toFixed(2)}B
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                Total Annual Budget: £{(economyFunds.reduce((sum, f) => sum + Number(f.remaining_amount), 0) / 1000000000).toFixed(2)}B remaining
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {isFailed && progress.error_message && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-sm text-red-800 dark:text-red-200 font-medium">Error:</p>
            <p className="text-sm text-red-700 dark:text-red-300">{progress.error_message}</p>
          </div>
        )}

        {/* Completion Time */}
        {progress.completed_at && (
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            {isCompleted ? 'Completed' : 'Failed'} at{' '}
            {new Date(progress.completed_at).toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
}
