import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BookHeart } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: authError } = isLogin
        ? await signIn(email, password)
        : await signUp(email, password);

      if (authError) {
        setError(authError.message);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      const { error: authError } = await signInWithGoogle();

      if (authError) {
        setError(authError.message);
        setLoading(false);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[rgb(var(--bg-primary))] to-[rgb(var(--bg-secondary))] px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500 text-white mb-4" aria-hidden="true">
            <BookHeart size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Poetry Suite
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Your personal sanctuary for writing, curating, and sharing poetry
          </p>
        </div>

        <div className="glass-strong rounded-2xl shadow-xl p-8">
          <div className="flex gap-2 mb-6" role="group" aria-label="Authentication mode">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                isLogin
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
              }`}
              aria-pressed={isLogin}
              aria-label="Switch to login mode"
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                !isLogin
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
              }`}
              aria-pressed={!isLogin}
              aria-label="Switch to sign up mode"
            >
              Sign Up
            </button>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            type="button"
            className="w-full mb-6 bg-white dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 dark:text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-3"
            aria-label="Continue with Google"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true" role="img">
              <title>Google logo</title>
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {loading ? 'Please wait...' : 'Continue with Google'}
          </button>

          <div className="relative mb-6" role="separator" aria-label="Or continue with email">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-300 dark:border-slate-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                Or continue with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" aria-label={isLogin ? 'Login form' : 'Sign up form'}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="you@example.com"
                aria-required="true"
                aria-describedby={error ? 'auth-error' : undefined}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                aria-required="true"
                aria-describedby={error ? 'auth-error' : 'password-requirements'}
              />
              <p id="password-requirements" className="sr-only">
                Password must be at least 6 characters long
              </p>
            </div>

            {error && (
              <div
                id="auth-error"
                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm"
                role="alert"
                aria-live="assertive"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              aria-label={loading ? 'Processing...' : isLogin ? 'Login to your account' : 'Create your account'}
            >
              {loading ? 'Please wait...' : isLogin ? 'Login' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
