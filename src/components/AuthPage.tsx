import { useState } from 'react';


import { useAuth } from '../contexts/AuthContext';
import { BookHeart, Code } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle } = useAuth();

  const [devFormEmail, setDevFormEmail] = useState('');
  const [devFormPassword, setDevFormPassword] = useState('');
  const [devFormPhone, setDevFormPhone] = useState('');
  const showDevLogin = import.meta.env.DEV;

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
    } catch {
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
    } catch {
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  const handleDevLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: authError } = await signIn(devFormEmail, devFormPassword);

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          const { error: signUpError } = await signUp(devFormEmail, devFormPassword);
          if (signUpError) {
            setError(signUpError.message);
          }
        } else {
          setError(authError.message);
        }
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-m3-background px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-m3-primary text-m3-on-primary mb-4" aria-hidden="true">
            <BookHeart size={32} />
          </div>
          <h1 className="text-3xl font-bold text-m3-on-background mb-2">
            Poetry Suite
          </h1>
          <p className="text-m3-on-surface-variant">
            Your personal sanctuary for writing, curating, and sharing poetry
          </p>
        </div>

        <div className="bg-m3-surface rounded-2xl shadow-xl p-8">
          {showDevLogin && (
            <div className="mb-6 p-4 bg-m3-tertiary-container border-2 border-m3-tertiary-container/80 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Code className="text-m3-on-tertiary-container" size={20} />
                <span className="font-semibold text-m3-on-tertiary-container">Developer Login</span>
              </div>
              <form onSubmit={handleDevLogin} className="space-y-3">
                <div>
                  <label htmlFor="dev-email" className="block text-xs font-medium text-m3-on-tertiary-container mb-1">
                    Email
                  </label>
                  <input
                    id="dev-email"
                    type="email"
                    value={devFormEmail}
                    onChange={(e) => setDevFormEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-m3-outline bg-m3-surface text-m3-on-surface focus:ring-2 focus:ring-m3-primary focus:border-transparent text-sm"
                    placeholder="dev@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="dev-password" className="block text-xs font-medium text-m3-on-tertiary-container mb-1">
                    Password
                  </label>
                  <input
                    id="dev-password"
                    type="password"
                    value={devFormPassword}
                    onChange={(e) => setDevFormPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full px-3 py-2 rounded-lg border border-m3-outline bg-m3-surface text-m3-on-surface focus:ring-2 focus:ring-m3-primary focus:border-transparent text-sm"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label htmlFor="dev-phone" className="block text-xs font-medium text-m3-on-tertiary-container mb-1">
                    Phone Number (UK)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value="+44"
                      disabled
                      className="w-16 px-3 py-2 rounded-lg border border-m3-outline bg-m3-surface-variant/40 text-m3-on-surface text-sm text-center"
                      aria-label="Country code"
                    />
                    <input
                      id="dev-phone"
                      type="tel"
                      value={devFormPhone}
                      onChange={(e) => setDevFormPhone(e.target.value.replace(/\D/g, ''))}
                      required
                      pattern="[0-9]{10}"
                      className="flex-1 px-3 py-2 rounded-lg border border-m3-outline bg-m3-surface text-m3-on-surface focus:ring-2 focus:ring-m3-primary focus:border-transparent text-sm"
                      placeholder="7700900000"
                      maxLength={10}
                    />
                  </div>
                  <p className="text-xs text-m3-on-tertiary-container/80 mt-1">Enter 10 digits after +44</p>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-m3-tertiary hover:opacity-90 disabled:bg-m3-tertiary/50 text-m3-on-tertiary font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Code size={18} />
                  {loading ? 'Logging in...' : 'Dev Login'}
                </button>
              </form>
            </div>
          )}

          <div className="flex gap-2 mb-6" role="group" aria-label="Authentication mode">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                isLogin
                  ? 'bg-m3-primary text-m3-on-primary'
                  : 'bg-m3-secondary-container text-m3-on-secondary-container'
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
                  ? 'bg-m3-primary text-m3-on-primary'
                  : 'bg-m3-secondary-container text-m3-on-secondary-container'
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
            className="w-full mb-6 bg-m3-surface border-2 border-m3-outline hover:bg-m3-on-surface/5 disabled:opacity-50 disabled:cursor-not-allowed text-m3-on-surface font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-3"
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
              <div className="w-full border-t border-m3-outline"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-m3-surface text-m3-on-surface-variant">
                Or continue with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" aria-label={isLogin ? 'Login form' : 'Sign up form'}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-m3-on-surface mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-lg border border-m3-outline bg-m3-surface text-m3-on-surface focus:ring-2 focus:ring-m3-primary focus:border-transparent"
                placeholder="you@example.com"
                aria-required="true"
                aria-describedby={error ? 'auth-error' : undefined}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-m3-on-surface mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2 rounded-lg border border-m3-outline bg-m3-surface text-m3-on-surface focus:ring-2 focus:ring-m3-primary focus:border-transparent"
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
                className="bg-m3-error-container text-m3-on-error-container px-4 py-3 rounded-lg text-sm"
                role="alert"
                aria-live="assertive"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-m3-primary hover:opacity-90 disabled:bg-m3-primary/50 text-m3-on-primary font-medium py-3 px-4 rounded-lg transition-colors"
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
