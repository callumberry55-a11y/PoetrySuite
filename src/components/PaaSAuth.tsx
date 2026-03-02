import { useState } from 'react';
import { Shield } from 'lucide-react';
import PaaSAdmin from './PaaSAdmin';

type Mode = 'select' | 'admin';
type UserType = 'none' | 'admin';

export default function PaaSAuth() {
  const [mode, setMode] = useState<Mode>('select');
  const [userType, setUserType] = useState<UserType>('none');
  const [adminCode, setAdminCode] = useState('');
  const [error, setError] = useState('');

  const handleAdminLogin = () => {
    if (adminCode === '1798') {
      setUserType('admin');
      setError('');
    } else {
      setError('Invalid admin code');
    }
  };

  const handleLogout = () => {
    setUserType('none');
    setMode('select');
    setAdminCode('');
  };

  if (userType === 'admin') {
    return <PaaSAdmin onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <Shield className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">PaaS Platform</h1>
          <p className="text-slate-600 dark:text-slate-400">Access your developer dashboard or admin panel</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700">
          {mode === 'admin' && (
            <>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Admin Access</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Admin Code
                  </label>
                  <input
                    type="password"
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                    placeholder="Enter admin code"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                </div>
                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
                    {error}
                  </div>
                )}
                <button
                  onClick={handleAdminLogin}
                  className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Access Admin Panel
                </button>
              </div>
            </>
          )}

        </div>

        <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-6">
          Secure access to the PaaS platform
        </p>
      </div>
    </div>
  );
}
