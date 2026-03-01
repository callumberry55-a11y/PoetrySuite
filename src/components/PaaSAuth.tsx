import { useState } from 'react';
import { Shield, Key } from 'lucide-react';
import PaaSAdmin from './PaaSAdmin';
import DeveloperDashboard from './DeveloperDashboard';

type Mode = 'select' | 'admin' | 'developer-login';
type UserType = 'none' | 'admin' | 'developer';

export default function PaaSAuth() {
  const [mode, setMode] = useState<Mode>('select');
  const [userType, setUserType] = useState<UserType>('none');
  const [adminCode, setAdminCode] = useState('');
  const [error, setError] = useState('');

  const [developerCode, setDeveloperCode] = useState('');


  const handleAdminLogin = () => {
    if (adminCode === '1798') {
      setUserType('admin');
      setError('');
    } else {
      setError('Invalid admin code');
    }
  };


  const handleDeveloperLogin = async () => {
    if (developerCode === '1798') {
      setUserType('developer');
      setError('');
    } else {
      setError('Invalid developer access code');
    }
  };

  const handleLogout = async () => {
    try {
      const { supabase } = await import('../lib/supabase');
      await supabase.auth.signOut();
      setUserType('none');
      setMode('select');
      setAdminCode('');
      setDeveloperCode('');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (userType === 'admin') {
    return <PaaSAdmin onLogout={() => { setUserType('none'); setMode('select'); }} />;
  }

  if (userType === 'developer') {
    return (
      <div>
        <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">PaaS Platform</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
        <DeveloperDashboard />
      </div>
    );
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
          {mode === 'select' && (
            <div className="space-y-3">
              <button
                onClick={() => setMode('admin')}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold transition-all transform hover:scale-105"
              >
                <Shield size={20} />
                Admin Access
              </button>
              <button
                onClick={() => setMode('developer-login')}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl font-semibold transition-all transform hover:scale-105"
              >
                <Key size={20} />
                Developer Access
              </button>
            </div>
          )}

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
                <div className="flex gap-3">
                  <button
                    onClick={() => { setMode('select'); setError(''); setAdminCode(''); }}
                    className="flex-1 px-4 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleAdminLogin}
                    className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Access
                  </button>
                </div>
              </div>
            </>
          )}

          {mode === 'developer-login' && (
            <>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Developer Access</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <Key className="inline mr-2" size={16} />
                    Developer Access Code
                  </label>
                  <input
                    type="password"
                    value={developerCode}
                    onChange={(e) => setDeveloperCode(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleDeveloperLogin()}
                    placeholder="Enter developer code"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                  />
                </div>
                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
                    {error}
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={() => { setMode('select'); setError(''); setDeveloperCode(''); }}
                    className="flex-1 px-4 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleDeveloperLogin}
                    className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Access
                  </button>
                </div>
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
