import { useState } from 'react';
import { Shield, Mail, Lock, User, Building } from 'lucide-react';
import PaaSAdmin from './PaaSAdmin';
import DeveloperDashboard from './DeveloperDashboard';
import { useAuth } from '../contexts/AuthContext';

type Mode = 'select' | 'admin' | 'developer-login' | 'developer-signup';
type UserType = 'none' | 'admin' | 'developer';

export default function PaaSAuth() {
  const { user } = useAuth();
  const [mode, setMode] = useState<Mode>('select');
  const [userType, setUserType] = useState<UserType>('none');
  const [adminCode, setAdminCode] = useState('');
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = () => {
    if (adminCode === '1798') {
      setUserType('admin');
      setError('');
    } else {
      setError('Invalid admin code');
    }
  };

  const handleDeveloperSignup = async () => {
    if (!email || !password || !organizationName) {
      setError('All fields are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { supabase } = await import('../lib/supabase');

      const { data: authData, error: signupError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signupError) throw signupError;

      if (authData.user) {
        const { error: devError } = await supabase.from('paas_developers').insert({
          id: authData.user.id,
          email: authData.user.email,
          organization_name: organizationName,
          subscription_status: 'inactive',
          is_verified: false
        });

        if (devError) throw devError;

        setUserType('developer');
      }
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDeveloperLogin = async () => {
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { supabase } = await import('../lib/supabase');

      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) throw loginError;

      setUserType('developer');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { supabase } = await import('../lib/supabase');
      await supabase.auth.signOut();
      setUserType('none');
      setMode('select');
      setEmail('');
      setPassword('');
      setOrganizationName('');
      setAdminCode('');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (userType === 'admin') {
    return <PaaSAdmin onLogout={() => { setUserType('none'); setMode('select'); }} />;
  }

  if (userType === 'developer' && user) {
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
                <User size={20} />
                Developer Login
              </button>
              <button
                onClick={() => setMode('developer-signup')}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-xl font-semibold transition-colors"
              >
                <Building size={20} />
                Developer Signup
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
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Developer Login</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <Mail className="inline mr-2" size={16} />
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <Lock className="inline mr-2" size={16} />
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleDeveloperLogin()}
                    placeholder="••••••••"
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
                    onClick={() => { setMode('select'); setError(''); setEmail(''); setPassword(''); }}
                    className="flex-1 px-4 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleDeveloperLogin}
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
                  >
                    {loading ? 'Loading...' : 'Login'}
                  </button>
                </div>
                <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                  Don't have an account?{' '}
                  <button
                    onClick={() => { setMode('developer-signup'); setError(''); }}
                    className="text-purple-600 dark:text-purple-400 hover:underline font-medium"
                  >
                    Sign up
                  </button>
                </p>
              </div>
            </>
          )}

          {mode === 'developer-signup' && (
            <>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Developer Signup</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <Mail className="inline mr-2" size={16} />
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <Building className="inline mr-2" size={16} />
                    Organization Name
                  </label>
                  <input
                    type="text"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    placeholder="Your Company"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <Lock className="inline mr-2" size={16} />
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleDeveloperSignup()}
                    placeholder="••••••••"
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
                    onClick={() => { setMode('select'); setError(''); setEmail(''); setPassword(''); setOrganizationName(''); }}
                    className="flex-1 px-4 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleDeveloperSignup}
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating...' : 'Sign Up'}
                  </button>
                </div>
                <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                  Already have an account?{' '}
                  <button
                    onClick={() => { setMode('developer-login'); setError(''); }}
                    className="text-purple-600 dark:text-purple-400 hover:underline font-medium"
                  >
                    Log in
                  </button>
                </p>
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
