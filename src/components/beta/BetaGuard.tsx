import { ReactNode, useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Lock } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface BetaGuardProps {
  children: ReactNode;
}

export default function BetaGuard({ children }: BetaGuardProps) {
  const { user } = useAuth();
  const [isBetaTester, setIsBetaTester] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkBetaStatus();
  }, [user]);

  const checkBetaStatus = async () => {
    if (!user) {
      setIsBetaTester(false);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('is_beta_tester')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setIsBetaTester(data?.is_beta_tester || false);
    } catch (error) {
      console.error('Error checking beta status:', error);
      setIsBetaTester(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!isBetaTester) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="glass rounded-xl p-8 shadow-sm text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
            <Lock className="text-slate-600 dark:text-slate-400" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Beta Access Required
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            This feature is only available to beta testers. Join our beta program in Settings to access experimental features.
          </p>
          <a
            href="#beta"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
          >
            Go to Beta Program
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
